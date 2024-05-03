import React, { useState, useEffect } from 'react';

export interface ServerGUIProps{

}

const ServerGUI: React.FC<ServerGUIProps> = ({}) => {
  /* window.electron.ipcRenderer.sendMessage('runMesher', []);
                        window.electron.ipcRenderer.sendMessage('runSolver', []); */


  const [mesherLogs, setMesherLogs] = useState<string[]>([]);
  window.electron.ipcRenderer.on('runMesher', (arg) => {
    // eslint-disable-next-line no-console
    setMesherLogs([...mesherLogs, arg as string])
    //console.log(arg);
  });
  return (
    <>
      <div className='flex flex-col p-10'>
        <div className="flex flex-col border border-secondaryColor p-3">
          <h5>Mesher</h5>
          <div className='max-h-[200px] overflow-y-scroll border border-secondaryColor p-10 bg-white flex flex-col'>
            {mesherLogs.map((ml, index) => <div key={index}>{ml}</div>)}
          </div>
          <div className='flex flex-row gap-4 mt-3'>
            <button className='button border border-black hover:bg-secondaryColor hover:text-white'
                    onClick={() => window.electron.ipcRenderer.sendMessage('runMesher', [])}
            >
              INIT
            </button>
            <button className='button border border-black hover:bg-red-500 hover:text-white'>HALT</button>
            <button className='button border border-black hover:bg-gray-400 hover:text-white'>CLEAR</button>
          </div>
        </div>
        <div className="flex flex-col mt-10 border border-secondaryColor p-3">
          <h5>Solver</h5>
          <div className='h-[200px] border border-secondaryColor p-10 bg-white'></div>
          <div className='flex flex-row gap-4 mt-3'>
            <button className='button border border-black hover:bg-secondaryColor hover:text-white'>INIT</button>
            <button className='button border border-black hover:bg-red-500 hover:text-white'>HALT</button>
            <button className='button border border-black hover:bg-gray-400 hover:text-white'>CLEAR</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ServerGUI;

