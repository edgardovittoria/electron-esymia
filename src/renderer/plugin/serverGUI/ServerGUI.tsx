import React, { useState, useEffect } from 'react';

export interface ServerGUIProps{

}

const ServerGUI: React.FC<ServerGUIProps> = ({}) => {
  /* window.electron.ipcRenderer.sendMessage('runMesher', []);
                        window.electron.ipcRenderer.sendMessage('runSolver', []); */


  const [mesherLogs, setMesherLogs] = useState<string[]>([]);
  window.electron.ipcRenderer.on('runMesher', (arg) => {
    // eslint-disable-next-line no-console
    setMesherLogs([...mesherLogs, (arg as string).replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')])
    //console.log(arg);
  });
  const [solverLogs, setSolverLogs] = useState<string[]>([]);
  window.electron.ipcRenderer.on('runSolver', (arg) => {
    // eslint-disable-next-line no-console
    setSolverLogs([...solverLogs, (arg as string).replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')])
    //console.log(arg);
  });
  return (
    <>
      <div className='flex relative flex-col py-10 px-5 border-2 border-secondaryColor'>
        <h5 className="absolute top-[-16px] bg-white left-10 font-bold px-2">serverGUI</h5>
        <div className="flex flex-col border border-secondaryColor bg-gray-200 p-3 rounded-xl">
          <h5>Mesher</h5>
          <div className='h-[200px] max-h-[200px] overflow-y-scroll border border-secondaryColor rounded-xl p-3 bg-white flex flex-col'>
            {mesherLogs.map((ml, index) => <div key={index} className="text-sm">{ml}</div>)}
          </div>
          <div className='flex flex-row gap-4 mt-3'>
            <button className='button border border-black hover:bg-secondaryColor hover:text-white'
                    onClick={() => window.electron.ipcRenderer.sendMessage('runMesher', [])}
            >
              INIT
            </button>
            <button className='button border border-black hover:bg-red-500 hover:text-white'>HALT</button>
            <button className='button border border-black hover:bg-gray-400 hover:text-white'
                    onClick={() => setMesherLogs([])}
            >
              CLEAR
            </button>
          </div>
        </div>
        <div className="flex flex-col mt-10 border border-secondaryColor bg-gray-200 rounded-xl p-3">
          <h5>Solver</h5>
          <div className='h-[200px] max-h-[200px] overflow-y-scroll border border-secondaryColor rounded-xl p-3 bg-white'>
            {solverLogs.map((sl, index) => <div key={index} className="text-sm">{sl}</div>)}
          </div>
          <div className='flex flex-row gap-4 mt-3'>
            <button className='button border border-black hover:bg-secondaryColor hover:text-white'
                    onClick={() => window.electron.ipcRenderer.sendMessage('runSolver', [])}
            >
              INIT
            </button>
            <button className='button border border-black hover:bg-red-500 hover:text-white'>HALT</button>
            <button className='button border border-black hover:bg-gray-400 hover:text-white'
                    onClick={() => setSolverLogs([])}
            >
              CLEAR
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ServerGUI;

