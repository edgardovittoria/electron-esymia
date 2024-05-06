import React, { useState, useEffect } from 'react';
import { ImSpinner } from 'react-icons/im';

export interface ServerGUIProps{

}

const ServerGUI: React.FC<ServerGUIProps> = ({}) => {

  const [spinnerMesher, setSpinnerMesher] = useState<boolean>(false);
  const [spinnerSolver, setSpinnerSolver] = useState<boolean>(false);
  const [mesherLogs, setMesherLogs] = useState<string[]>([]);
  const [disableMesherInit, setDisableMesherInit] = useState<boolean>(false);
  const [disableSolverInit, setDisableSolverInit] = useState<boolean>(false);
  const [mesherStatus, setMesherStatus] = useState<'idle' | 'starting' | 'started'>('idle');
  const [solverStatus, setSolverStatus] = useState<'idle' | 'starting' | 'started'>('idle');
  window.electron.ipcRenderer.on('runMesher', (arg) => {
    setSpinnerMesher(false)
    setMesherLogs([...mesherLogs, (arg as string).replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')])
  });
  const [solverLogs, setSolverLogs] = useState<string[]>([]);
  window.electron.ipcRenderer.on('runSolver', (arg) => {
    setSpinnerSolver(false)
    setSolverLogs([...solverLogs, (arg as string).replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')])
  });

  useEffect(() => {
    mesherLogs.forEach(l => {
      if(l.includes("MESHER READY")){
        setMesherStatus('started')
      }
    })
  }, [mesherLogs]);

  useEffect(() => {
    solverLogs.forEach(l => {
      if(l.includes("SOLVER READY")){
        setSolverStatus('started')
      }
    })
  }, [solverLogs]);

  return (
    <>
      <div className='flex relative flex-col py-5 px-5 border-2 border-secondaryColor'>
        <h5 className="absolute top-[-16px] bg-white left-10 font-bold px-2 text-secondaryColor">serverGUI</h5>
        <div className="flex flex-col border border-secondaryColor bg-gray-100 py-3 px-5">
          <div className="flex flex-row gap-2 items-center">
            <h5>Mesher</h5>
            <div className={`h-3 w-3 p-[6px] border-2 border-gray-700 rounded-full ${mesherStatus === 'idle' ? 'bg-gray-400': mesherStatus === 'starting' ? 'bg-orange-400' : 'bg-green-500'}`}></div>
            {mesherStatus === 'starting' && <ImSpinner className='animate-spin w-4 h-4 z-50' />}
          </div>
          <div className={`h-[150px] max-h-[150px] overflow-y-scroll border border-secondaryColor p-3 flex flex-col ${spinnerMesher ? 'items-center justify-center bg-gray-100 bg-opacity-30': 'bg-white'}`}>
            {spinnerMesher && <ImSpinner className='animate-spin w-12 h-12 z-50' />}
            {mesherLogs.map((ml, index) => <div key={index} className="text-sm">{ml}</div>)}
          </div>
          <div className='flex flex-row gap-4 mt-3'>
            <button className='button border border-black hover:bg-secondaryColor hover:text-white text-sm disabled:opacity-40'
                    disabled={disableMesherInit}
                    onClick={() => {
                      setDisableMesherInit(true)
                      setMesherLogs([])
                      setSpinnerMesher(true)
                      setMesherStatus('starting')
                      window.electron.ipcRenderer.sendMessage('runMesher', [])
                    }}
            >
              INIT
            </button>
            <button className='button border border-black hover:bg-red-500 hover:text-white text-sm'
                    onClick={() => {
                      window.electron.ipcRenderer.sendMessage('haltMesher', [])
                      setDisableMesherInit(false)
                      setMesherStatus('idle')
                      setMesherLogs(["MESHER HALTED"])
                    }}
            >
              HALT
            </button>
            <button className='button border border-black hover:bg-gray-400 hover:text-white text-sm'
                    onClick={() => setMesherLogs([])}
            >
              CLEAR
            </button>
          </div>
        </div>
        <div className="flex flex-col mt-10 border border-secondaryColor bg-gray-100 py-3 px-5">
          <div className="flex flex-row gap-2 items-center">
            <h5>Solver</h5>
            <div className={`h-3 w-3 p-[6px] border-2 border-gray-700 rounded-full ${solverStatus === 'idle' ? 'bg-gray-400': solverStatus === 'starting' ? 'bg-orange-400' : 'bg-green-500'}`}></div>
            {solverStatus === 'starting' && <ImSpinner className='animate-spin w-4 h-4 z-50' />}
          </div>
          <div className={`h-[150px] max-h-[150px] overflow-y-scroll border border-secondaryColor p-3 flex flex-col ${spinnerSolver ? 'items-center justify-center bg-gray-100 bg-opacity-30': 'bg-white'}`}>
            {spinnerSolver && <ImSpinner className='animate-spin w-12 h-12' />}
            {solverLogs.map((sl, index) => <div key={index} className="text-sm">{sl}</div>)}
          </div>
          <div className='flex flex-row gap-4 mt-3'>
            <button className='button border border-black hover:bg-secondaryColor hover:text-white text-sm disabled:opacity-40'
                    disabled={disableSolverInit}
                    onClick={() => {
                      setDisableSolverInit(true)
                      setSolverLogs([])
                      setSpinnerSolver(true)
                      setSolverStatus('starting')
                      window.electron.ipcRenderer.sendMessage('runSolver', [])
                    }}
            >
              INIT
            </button>
            <button className='button border border-black hover:bg-red-500 hover:text-white text-sm'
                    onClick={() => {
                      window.electron.ipcRenderer.sendMessage('haltSolver', [])
                      setDisableSolverInit(false)
                      setSolverStatus('idle')
                      setSolverLogs(["SOLVER HALTED"])
                    }}
            >
              HALT
            </button>
            <button className='button border border-black hover:bg-gray-400 hover:text-white text-sm'
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

