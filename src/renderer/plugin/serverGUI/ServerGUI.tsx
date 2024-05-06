import React, { useState, useEffect } from 'react';
import { ImSpinner } from 'react-icons/im';
import { useDispatch, useSelector } from 'react-redux';
import { MesherStatusSelector, setMesherStatus, setSolverStatus, SolverStatusSelector } from '../../store/pluginsSlice';

export interface ServerGUIProps{

}

const ServerGUI: React.FC<ServerGUIProps> = ({}) => {

  const [spinnerMesher, setSpinnerMesher] = useState<boolean>(false);
  const [spinnerSolver, setSpinnerSolver] = useState<boolean>(false);
  const [mesherLogs, setMesherLogs] = useState<string[]>([]);
  const [solverLogs, setSolverLogs] = useState<string[]>([]);
  const mesherStatus = useSelector(MesherStatusSelector)
  const solverStatus = useSelector(SolverStatusSelector)

  const dispatch = useDispatch()

  window.electron.ipcRenderer.on('runMesher', (arg) => {
    setSpinnerMesher(false)
    setMesherLogs([...mesherLogs, (arg as string).replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')])
  });

  window.electron.ipcRenderer.on('runSolver', (arg) => {
    setSpinnerSolver(false)
    setSolverLogs([...solverLogs, (arg as string).replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')])
  });

  useEffect(() => {
    mesherLogs.forEach(l => {
      if(l.includes("MESHER READY")){
        dispatch(setMesherStatus('ready'))
      }
    })
  }, [mesherLogs]);

  useEffect(() => {
    solverLogs.forEach(l => {
      if(l.includes("SOLVER READY")){
        dispatch(setSolverStatus('ready'))
      }
    })
  }, [solverLogs]);

  return (
    <>
      <div className='flex relative flex-col py-5 px-5 border-2 border-secondaryColor'>
        <h5 className="absolute top-[-16px] bg-white left-10 font-bold px-2 text-secondaryColor">serverGUI</h5>
        <div className='flex flex-row gap-4 mb-3 w-full justify-end'>
          <div className='flex flex-row gap-1 items-center'>
            <div className="h-3 w-3 p-[6px] border-2 border-gray-700 rounded-full bg-gray-400" />
            <span className="text-sm font-semibold">IDLE</span>
          </div>
          <div className='flex flex-row gap-1 items-center'>
            <div className="h-3 w-3 p-[6px] border-2 border-gray-700 rounded-full bg-orange-400" />
            <span className="text-sm font-semibold">STARTING</span>
          </div>
          <div className='flex flex-row gap-1 items-center'>
            <div className="h-3 w-3 p-[6px] border-2 border-gray-700 rounded-full bg-green-500" />
            <span className="text-sm font-semibold">READY</span>
          </div>
        </div>
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
                    disabled={mesherStatus !== 'idle'}
                    onClick={() => {
                      setMesherLogs([])
                      setSpinnerMesher(true)
                      dispatch(setMesherStatus('starting'))
                      window.electron.ipcRenderer.sendMessage('runMesher', [])
                    }}
            >
              INIT
            </button>
            <button className='button border border-black hover:bg-red-500 hover:text-white text-sm disabled:opacity-40'
                    disabled={mesherStatus === 'idle'}
                    onClick={() => {
                      window.electron.ipcRenderer.sendMessage('haltMesher', [])
                      dispatch(setMesherStatus('idle'))
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
                    disabled={solverStatus !== 'idle'}
                    onClick={() => {
                      setSolverLogs([])
                      setSpinnerSolver(true)
                      dispatch(setSolverStatus('starting'))
                      window.electron.ipcRenderer.sendMessage('runSolver', [])
                    }}
            >
              INIT
            </button>
            <button className='button border border-black hover:bg-red-500 hover:text-white text-sm disabled:opacity-40'
                    disabled={solverStatus === 'idle'}
                    onClick={() => {
                      window.electron.ipcRenderer.sendMessage('haltSolver', [])
                      dispatch(setSolverStatus('idle'))
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

