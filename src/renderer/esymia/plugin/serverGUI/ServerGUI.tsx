import React, { useState, useEffect } from 'react';
import { ImSpinner } from 'react-icons/im';
import { useDispatch, useSelector } from 'react-redux';
import { MesherStatusSelector, setMesherStatus, setSolverStatus, SolverStatusSelector } from '../../store/pluginsSlice';
import { FaPlay, FaStop } from 'react-icons/fa';
import { BiSolidDetail } from 'react-icons/bi';
import { CgDetailsMore } from 'react-icons/cg';
import { client } from '../../../App';

export interface ServerGUIProps{

}

const ServerGUI: React.FC<ServerGUIProps> = ({}) => {

  const [spinnerMesher, setSpinnerMesher] = useState<boolean>(false);
  const [spinnerSolver, setSpinnerSolver] = useState<boolean>(false);
  const [mesherLogs, setMesherLogs] = useState<string[]>([]);
  const [solverLogs, setSolverLogs] = useState<string[]>([]);
  const [mesherLogsVisibility, setMesherLogsVisibility] = useState<boolean>(false);
  const [solverLogsVisibility, setSolverLogsVisibility] = useState<boolean>(false);
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
        <div className="flex flex-col border border-secondaryColor py-3 px-5">
          <div className="flex flex-row gap-2 items-center justify-between">
            <div className="w-2/3 flex flex-row items-center gap-2">
              <h5>Mesher</h5>
              <div className={`h-3 w-3 p-[6px] border-2 border-gray-700 rounded-full ${mesherStatus === 'idle' ? 'bg-gray-400': mesherStatus === 'starting' ? 'bg-orange-400' : 'bg-green-500'}`}></div>
              {mesherStatus === 'idle' && <span>IDLE</span>}
              {mesherStatus === 'starting' && <span>STARTING</span>}
              {mesherStatus === 'ready' && <span>READY</span>}
              {mesherStatus === 'starting' && <ImSpinner className='animate-spin w-4 h-4 z-50' />}
            </div>
            <div className="flex flex-row items-center gap-2">
              <button className='tooltip' data-tip="Start" disabled={mesherStatus !== 'idle'}>
                <FaPlay size={15}
                        className={`${mesherStatus !== 'idle' && 'text-gray-400'}`}
                        onClick={() => {
                          setMesherLogs([])
                          setSpinnerMesher(true)
                          dispatch(setMesherStatus('starting'))
                          window.electron.ipcRenderer.sendMessage('runMesher', [])
                        }}
                />
              </button>
              <button className='tooltip' data-tip="Stop">
                <FaStop size={15}
                        className={`${mesherStatus === 'idle' && 'text-gray-400'}`}
                        onClick={() => {
                          window.electron.ipcRenderer.sendMessage('haltMesher', [])
                          dispatch(setMesherStatus('idle'))
                          setMesherLogs(["MESHER HALTED"])
                        }}
                />
              </button>
              <button className='tooltip' data-tip="Show/Hide Logs">
                <CgDetailsMore size={17}
                        onClick={() => {
                          setMesherLogsVisibility(!mesherLogsVisibility)
                        }}
                />
              </button>
            </div>
              {/* <button className='button border border-black hover:bg-gray-400 hover:text-white text-sm'
                    onClick={() => setMesherLogs([])}
            >
              CLEAR
            </button> */}
          </div>
          {mesherLogsVisibility &&
            <div className={`h-[150px] max-h-[150px] overflow-y-scroll border border-secondaryColor p-3 flex flex-col ${spinnerMesher ? 'items-center justify-center bg-gray-100 bg-opacity-30': 'bg-white'}`}>
              {spinnerMesher && <ImSpinner className='animate-spin w-12 h-12 z-50' />}
              {mesherLogs.map((ml, index) => <div key={index} className="text-sm">{ml}</div>)}
            </div>
          }
        </div>
        <div className="flex flex-col border border-secondaryColor py-3 px-5">
          <div className="flex flex-row gap-2 items-center justify-between">
            <div className="w-2/3 flex flex-row items-center gap-2">
              <h5>Solver</h5>
              <div className={`h-3 w-3 p-[6px] border-2 border-gray-700 rounded-full ${solverStatus === 'idle' ? 'bg-gray-400': solverStatus === 'starting' ? 'bg-orange-400' : 'bg-green-500'}`}></div>
              {solverStatus === 'idle' && <span>IDLE</span>}
              {solverStatus === 'starting' && <span>STARTING</span>}
              {solverStatus === 'ready' && <span>READY</span>}
              {solverStatus === 'starting' && <ImSpinner className='animate-spin w-4 h-4 z-50' />}
            </div>
            <div className="flex flex-row items-center gap-2">
              <button className='tooltip' data-tip="Start" disabled={solverStatus !== 'idle'}>
                <FaPlay size={15}
                        className={`${solverStatus !== 'idle' && 'text-gray-400'}`}
                        onClick={() => {
                          setSolverLogs([])
                          setSpinnerSolver(true)
                          dispatch(setSolverStatus('starting'))
                          window.electron.ipcRenderer.sendMessage('runSolver', [])
                        }}
                />
              </button>
              <button className='tooltip' data-tip="Stop">
                <FaStop size={15}
                        className={`${solverStatus === 'idle' && 'text-gray-400'}`}
                        onClick={() => {
                          //window.electron.ipcRenderer.sendMessage('haltSolver', [])
                          client.publish({
                            destination: 'management_solver',
                            body: JSON.stringify({
                              message: 'stop',
                            }),
                          });
                          dispatch(setSolverStatus('idle'))
                          setSolverLogs(["SOLVER HALTED"])
                        }}
                />
              </button>
              <button className='tooltip' data-tip="Show/Hide Logs">
                <CgDetailsMore size={17}
                               onClick={() => {
                                 setSolverLogsVisibility(!solverLogsVisibility)
                               }}
                />
              </button>
            </div>
            {/* <button className='button border border-black hover:bg-gray-400 hover:text-white text-sm'
                    onClick={() => setMesherLogs([])}
            >
              CLEAR
            </button> */}
          </div>
          {solverLogsVisibility &&
            <div className={`h-[150px] max-h-[150px] overflow-y-scroll border border-secondaryColor p-3 flex flex-col ${spinnerMesher ? 'items-center justify-center bg-gray-100 bg-opacity-30': 'bg-white'}`}>
              {spinnerSolver && <ImSpinner className='animate-spin w-12 h-12 z-50' />}
              {solverLogs.map((ml, index) => <div key={index} className="text-sm">{ml}</div>)}
            </div>
          }
        </div>
      </div>
    </>
  );
}

export default ServerGUI;

