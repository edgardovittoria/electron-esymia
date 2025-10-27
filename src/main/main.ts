/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, dialog, ipcMain, shell, Menu } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import axios from 'axios';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import nodeChildProcess, { fork } from 'child_process';
import {
  closeSync,
  mkdir,
  openSync,
  readdirSync,
  readFileSync,
  rmdir,
  unlinkSync,
  writeFileSync,
  writeSync,
} from 'fs';
import getmac from 'getmac';
import { Worker } from 'worker_threads';
import { getHeapStatistics } from 'v8';
import os from 'os';

function getOs() {
  switch (os.platform()) {
    case 'win32':
      return 'windows';
    case 'darwin': // macOS
    case 'linux':
      return 'unix-like';
    default:
      return 'unknown';
  }
}

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

let meshingComputations = false;
let solvingComputations = false;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  import('fix-path').then((fixPath) => fixPath.default());
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1920,
    height: 1080,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      nodeIntegration: true,
    },
  });
  const menu = Menu.buildFromTemplate([
    { role: 'copy' },
    { role: 'cut' },
    { role: 'paste' },
    { role: 'selectAll' },
  ]);
  mainWindow.webContents.on('context-menu', (_event, params) => {
    // only show the context menu if the element is editable
    if (params.isEditable) {
      menu.popup();
    }
  });
  mainWindow.loadURL(resolveHtmlPath('index.html'));
  //mainWindow.webContents.openDevTools();
  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('close', (e) => {
    e.preventDefault();
    if (meshingComputations || solvingComputations) {
      dialog.showErrorBox(
        'PAY ATTENTION',
        'You have pending operations server side, complete or stop them before quit the application.',
      );
    } else {
      mainWindow?.destroy();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return {
      action: url === 'https://www.docker.com/get-started/' ? 'deny' : 'allow',
    };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  if(getOs() === 'windows'){
    nodeChildProcess.spawn('cmd.exe', [
      '/c',
      getDockerPath('BROKER_STOP.bat')
    ]);
  } else {
    nodeChildProcess.spawn('bash', [
      getDockerPath('BROKER_STOP.sh')
    ]);
  }
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();

    //window.electron.ipcRenderer.sendMessage('runServer', []);
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

ipcMain.handle('api:call', async (e, args) => {
  const response = await axios.get(args);
  return response.data;
});

ipcMain.on('closeApp', (e, args) => {
  app.quit();
});

ipcMain.on('checkLogout', (e, args) => {
  if (meshingComputations || solvingComputations) {
    dialog.showErrorBox(
      'PAY ATTENTION',
      'You have pending operations server side, complete or stop them before logout.',
    );
  } else {
    e.reply('checkLogout', 'allowed');
  }
});

ipcMain.on('logout', (e, args) => {
  BrowserWindow.getAllWindows().forEach((win) => {
    win
      .loadURL(`https://${args[0]}/v2/logout`)
      .then(() => {
        win.loadURL(resolveHtmlPath('index.html'));
      })
      .catch((err) => console.log(err));
  });
});

let serverProcesses: {
  mesher?: nodeChildProcess.ChildProcessWithoutNullStreams;
  solver?: nodeChildProcess.ChildProcessWithoutNullStreams;
} = {};

const SERVER_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'src/server')
  : path.join(__dirname, '../../src/server');

const getServerPath = (...paths: string[]): string => {
  return path.join(SERVER_PATH, ...paths);
};

const DOCKER_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'src/docker')
  : path.join(__dirname, '../../src/docker');

const getDockerPath = (...paths: string[]): string => {
  return path.join(DOCKER_PATH, ...paths);
};

ipcMain.on('runMesher', (e, args) => {
  let scriptMesher;
  if (getOs() === 'windows') {
    scriptMesher = nodeChildProcess.spawn('cmd.exe', [
      '/c',
      getServerPath('scripts/mesherINIT.bat')
    ]);
  } else {
    scriptMesher = nodeChildProcess.spawn('bash', [
      getServerPath('scripts/mesherINIT.sh')
    ]);
  }
  serverProcesses.mesher = scriptMesher;
  scriptMesher.stdout.on('data', (data: string) => {
    e.reply('runMesher', '' + data);
  });

  scriptMesher.stderr.on('data', (err: string) => {
    e.reply('runMesher', '' + err);
  });

  scriptMesher.on('exit', (code: string) => {
    e.reply('runMesher', 'Exit Code: ' + code);
  });
});

ipcMain.on('runSolver', (e, args) => {
  let scriptSolver;
  if (getOs() === 'windows') {
    scriptSolver = nodeChildProcess.spawn('cmd.exe', [
      '/c',
      getServerPath('scripts/solverINIT.bat')
    ]);
  } else {
    scriptSolver = nodeChildProcess.spawn('bash', [
      getServerPath('scripts/solverINIT.sh')
    ]);
  }
  serverProcesses.solver = scriptSolver;
  scriptSolver.stdout.on('data', (data: string) => {
    e.reply('runSolver', '' + data);
  });

  scriptSolver.stderr.on('data', (err: string) => {
    e.reply('runSolver', '' + err);
  });

  scriptSolver.on('exit', (code: string) => {
    e.reply('runSolver', 'Exit Code: ' + code);
  });
});

ipcMain.on('haltMesher', (e, args) => {
  if (getOs() === 'windows') {
    if (serverProcesses.mesher) {
      serverProcesses.mesher.kill();
      nodeChildProcess.spawn('cmd.exe', [
        '/c',
        getServerPath('scripts/mesherHALT.bat')
      ]);
    }
  } else {
    if (serverProcesses.mesher) {
      serverProcesses.mesher.kill();
      nodeChildProcess.spawn('bash', [
        getServerPath('scripts/mesherHALT.sh')
      ]);
    }
  }
});

ipcMain.on('haltSolver', (e, args) => {
  if (getOs() === 'windows') {
    if (serverProcesses.solver) {
      serverProcesses.solver.kill();
      nodeChildProcess.spawn('cmd.exe', [
        '/c',
        getServerPath('scripts/solverHALT.bat')
      ]);
    }
  } else {
    if (serverProcesses.solver) {
      serverProcesses.solver.kill();
      nodeChildProcess.spawn('bash', [
        getServerPath('scripts/solverHALT.sh')
      ]);
    }
  }
});

ipcMain.on('meshingComputation', (e, args) => {
  meshingComputations = args[0];
});

ipcMain.on('solvingComputation', (e, args) => {
  solvingComputations = args[0];
});

ipcMain.handle('getInstallationDir', (e, args) => {
  return app.getPath('home');
});

ipcMain.handle('getMac', (e, args) => {
  return getmac();
});

ipcMain.handle('directoryContents', (e, args) => {
  let path = app.getPath('home') + args[0];
  return readdirSync(path, { withFileTypes: false });
});

ipcMain.handle('saveFile', (e, args) => {
  let path = app.getPath('home');
  writeFileSync(path + '/' + args[0], args[1]);
});

ipcMain.handle('readFile', (e, args) => {
  return readFileSync(args[0], { encoding: 'utf8', flag: 'r' });
});

ipcMain.handle('deleteFile', (e, args) => {
  //let path = app.getPath('home')+"/esymiaProjects"
  unlinkSync(args[0]);
});

ipcMain.handle('createFolder', (e, args) => {
  let path = app.getPath('home');
  mkdir(path + '/' + args[0], null, () => {});
});

ipcMain.handle('deleteFolder', (e, args) => {
  let path = app.getPath('home');
  rmdir(path + '/' + args[0], () => {});
});

ipcMain.on('runBroker', (e, args) => {
  let scriptBroker;
  if(getOs() === 'windows'){
    scriptBroker = nodeChildProcess.spawn('cmd.exe', [
      '/c',
      getDockerPath('BROKER.bat')
    ]);
  } else {
    scriptBroker = nodeChildProcess.spawn('bash', [
      getDockerPath('BROKER.sh')
    ]);
  }
  // Continuare a inviare l'output per feedback in tempo reale (opzionale)
  scriptBroker.stdout.on('data', (data: string) => {
    e.reply('runBroker', { type: 'log', message: '' + data }); // Invio come LOG
  });

  scriptBroker.stderr.on('data', (err: string) => {
    e.reply('runBroker', { type: 'error', message: '' + err }); // Invio come ERRORE
  });

  // *** Intercettare il codice di uscita ***
  scriptBroker.on('exit', (code: number) => {
    // 'code' è un numero, non una stringa
    if (code === 10) {
      e.reply('runBroker', {
        type: 'status',
        success: false,
        message: 'Docker is not started.',
        exitCode: code,
      });
    } else {
      e.reply('runBroker', {
        type: 'status',
        success: true,
        message: 'Broker started successfully.',
      });
    }
  });
});

ipcMain.on('exportTouchstone', (e, args) => {
  let fileName = path.join(
    app.getPath('home'),
    'Downloads',
    args[4] + `.s${args[3]}p`,
  );
  writeTouchstone(args[0], args[1], args[2], fileName);
});

ipcMain.on('computeMeshRis', (e, args) => {
  const worker = new Worker(getServerPath('mesherTypescript/mainfile.js'), {
    workerData: args,
  });

  ipcMain.on('stopMeshing', (e, args) => {
    worker.terminate();
  });

  worker.on('message', (result) => {
    e.reply('computeMeshRis', result);
  });

  worker.on('error', (error) => {
    console.error('Worker error:', error);
  });

  worker.on('exit', (code) => {
    if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
  });
});

function writeTouchstone(
  freq: number[],
  S: any,
  R_chiusura: number,
  fileNameComplete: string,
) {
  const np = S.length;
  const tab = '   ';
  const fid = openSync(fileNameComplete, 'w');

  const rowToWrite = `# hz S ma R ${numToStringAccurate(R_chiusura)} \n`;
  writeSync(fid, rowToWrite);

  for (let cf = 0; cf < freq.length; cf++) {
    let rowToWrite = `\n${numToStringFreq(freq[cf])}${tab}`;
    writeSync(fid, rowToWrite);
    for (let i = 0; i < np; i++) {
      const realPartS = S[i][0][cf][0];
      const imPartS = S[i][0][cf][1];
      let { modulo, phaseInDeg } = buildModPhaseScatteringParameter(
        realPartS,
        imPartS,
      );
      if (modulo > 1) {
        modulo = 1;
      }
      if (isNaN(modulo) || !isFinite(modulo)) {
        modulo = 0;
        phaseInDeg = 0.0;
      }
      rowToWrite = `${numToStringAccurate(modulo)}${tab}${numToStringAccurate(
        phaseInDeg,
      )}${tab}`;
      writeSync(fid, rowToWrite);
      if (np > 4 && (i + 1) % Math.sqrt(np) === 0) {
        writeSync(fid, '\n');
        writeSync(fid, tab);
      }
    }
  }
  closeSync(fid);
}

function numToStringFreq(val: number) {
  return val.toFixed(12);
}

function numToStringAccurate(val: number) {
  return val.toFixed(12);
}

function buildModPhaseScatteringParameter(realPart: number, imPart: number) {
  let phase = Math.atan(imPart / realPart);

  if (realPart < 0) {
    phase += Math.PI;
  }

  const modulo = Math.sqrt(realPart * realPart + imPart * imPart);
  const phaseInDeg = (180 * phase) / Math.PI;

  return { modulo, phaseInDeg };
}
