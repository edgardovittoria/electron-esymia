// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { readdir } from 'fs';
import { removeAllListeners } from 'process';

export type Channels =
  | 'ipc-example'
  | 'api:call'
  | 'api:response'
  | 'fauna:getFoldersByOwner'
  | 'fauna:getSimulationProjectsByOwner'
  | 'logout'
  | 'runMesher'
  | 'runSolver'
  | 'haltMesher'
  | 'haltSolver'
  | 'getInstallationDir'
  | 'directoryContents'
  | 'saveFile'
  | 'deleteFile'
  | 'createFolder'
  | 'deleteFolder'
  | 'readFile'
  | 'runBroker'
  | 'exportTouchstone'
  | 'getMac'
  | 'meshingComputation'
  | 'solvingComputation'
  | 'checkLogout'
  | 'computeMeshRis'
  | 'stopMeshing'
  ;

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke(channel: Channels, ...args: unknown[]): Promise<any> {
      return ipcRenderer.invoke(channel, ...args);
    },
    removeAllListeners(channel: Channels) {
      ipcRenderer.removeAllListeners(channel);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
