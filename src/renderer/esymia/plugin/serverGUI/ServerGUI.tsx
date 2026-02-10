import React, { useState, useEffect } from 'react';
import { ImSpinner } from 'react-icons/im';
import { useDispatch, useSelector } from 'react-redux';
import { MesherStatusSelector, setMesherStatus, setSolverStatus, SolverStatusSelector } from '../../store/pluginsSlice';
import { FaPlay, FaStop } from 'react-icons/fa';
import { CgDetailsMore } from 'react-icons/cg';
import { publishMessage } from '../../../middleware/stompMiddleware';
import { ThemeSelector } from '../../store/tabsAndMenuItemsSlice';

export interface ServerGUIProps {
  index: number
}

const ServerGUI: React.FC<ServerGUIProps> = ({ index }) => {

  const [spinnerMesher, setSpinnerMesher] = useState<boolean>(false);
  const [spinnerSolver, setSpinnerSolver] = useState<boolean>(false);
  const [mesherLogs, setMesherLogs] = useState<string[]>([]);
  const [solverLogs, setSolverLogs] = useState<string[]>([]);
  const [mesherLogsVisibility, setMesherLogsVisibility] = useState<boolean>(false);
  const [solverLogsVisibility, setSolverLogsVisibility] = useState<boolean>(false);
  const mesherStatus = useSelector(MesherStatusSelector)
  const solverStatus = useSelector(SolverStatusSelector)
  const theme = useSelector(ThemeSelector)
  const isDark = theme !== 'light';

  const dispatch = useDispatch()

  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      const removeMesherListener = window.electron.ipcRenderer.on('runMesher', (arg: any) => {
        const response = arg as { type: string; data: string; exitCode?: number };
        if (response.type === 'exit') {
          setSpinnerMesher(false);
          if (response.exitCode !== 0 && response.exitCode !== undefined) {
            setMesherLogs((prev) => [...prev, `Process exited with code ${response.exitCode}: ${response.data}`]);
          }
        } else {
          setSpinnerMesher(false); // Stop spinner on first log
          setMesherLogs((prev) => [
            ...prev,
            response.data.replace(
              /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
              '',
            ),
          ]);
        }
      });

      const removeSolverListener = window.electron.ipcRenderer.on('runSolver', (arg: any) => {
        const response = arg as { type: string; data: string; exitCode?: number };
        if (response.type === 'exit') {
          setSpinnerSolver(false);
          if (response.exitCode !== 0 && response.exitCode !== undefined) {
            setSolverLogs((prev) => [...prev, `Process exited with code ${response.exitCode}: ${response.data}`]);
          }
        } else {
          setSpinnerSolver(false); // Stop spinner on first log
          setSolverLogs((prev) => [
            ...prev,
            response.data.replace(
              /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
              '',
            ),
          ]);
        }
      });

      return () => {
        if (removeMesherListener) removeMesherListener();
        if (removeSolverListener) removeSolverListener();
      };
    }
  }, []);


  useEffect(() => {
    mesherLogs.forEach(l => {
      if (l.includes("MESHER READY")) {
        dispatch(setMesherStatus('ready'))
      }
    })
  }, [mesherLogs]);

  useEffect(() => {
    solverLogs.forEach(l => {
      if (l.includes("SOLVER READY")) {
        dispatch(setSolverStatus('ready'))
      }
    })
  }, [solverLogs]);

  const StatusIndicator = ({ status }: { status: string }) => (
    <div className="flex items-center gap-2">
      <div className={`h-3 w-3 rounded-full shadow-lg shadow-current ${status === 'idle' ? 'bg-gray-400' :
        status === 'starting' ? 'bg-orange-400 animate-pulse' :
          'bg-green-500'
        }`}></div>
      <span className={`text-xs font-bold tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {status.toUpperCase()}
      </span>
      {status === 'starting' && <ImSpinner className={`animate-spin w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />}
    </div>
  );

  const ControlButton = ({ icon: Icon, onClick, disabled, tooltip, colorClass }: any) => (
    <button
      className={`p-2 rounded-lg transition-all duration-200 tooltip ${disabled
        ? 'opacity-50 cursor-not-allowed'
        : isDark
          ? 'hover:bg-white/10 text-gray-300 hover:text-white'
          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
        } ${colorClass}`}
      onClick={onClick}
      disabled={disabled}
      data-tip={tooltip}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className={`flex flex-col rounded-xl overflow-hidden border ${isDark
      ? 'bg-white/5 border-white/10'
      : 'bg-white border-gray-200'
      }`} key={index}>
      <div className={`px-4 py-2 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
        <h5 className={`font-bold text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Server GUI</h5>
      </div>

      {/* Mesher Section */}
      <div className={`flex flex-col border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="flex flex-row items-center justify-between p-4">
          <div className="flex flex-row items-center gap-4">
            <h5 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Mesher</h5>
            <StatusIndicator status={mesherStatus} />
          </div>
          <div className="flex flex-row items-center gap-1">
            <ControlButton
              icon={FaPlay}
              tooltip="Start"
              disabled={mesherStatus !== 'idle'}
              colorClass="text-green-500 hover:text-green-400"
              onClick={() => {
                setMesherLogs([])
                setSpinnerMesher(true)
                dispatch(setMesherStatus('starting'))
                window.electron.ipcRenderer.sendMessage('runMesher', [])
              }}
            />
            <ControlButton
              icon={FaStop}
              tooltip="Stop"
              colorClass="text-red-500 hover:text-red-400"
              onClick={() => {
                dispatch(publishMessage({
                  queue: 'management',
                  body: { message: 'stop' }
                }))
                setMesherLogs(["MESHER HALTED"])
                dispatch(setMesherStatus('idle'))
                window.electron.ipcRenderer.sendMessage('haltMesher', [])
              }}
            />
            <ControlButton
              icon={CgDetailsMore}
              tooltip="Show/Hide Logs"
              onClick={() => setMesherLogsVisibility(!mesherLogsVisibility)}
            />
          </div>
        </div>

        {mesherLogsVisibility && (
          <div className={`h-[150px] overflow-y-auto p-3 text-xs font-mono border-t ${isDark
            ? 'bg-black/30 text-gray-300 border-white/10'
            : 'bg-gray-50 text-gray-700 border-gray-200'
            } ${spinnerMesher ? 'flex items-center justify-center' : ''}`}>
            {spinnerMesher && <ImSpinner className={`animate-spin w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />}
            {!spinnerMesher && mesherLogs.map((ml, index) => <div key={index} className="whitespace-pre-wrap">{ml}</div>)}
          </div>
        )}
      </div>

      {/* Solver Section */}
      <div className="flex flex-col">
        <div className="flex flex-row items-center justify-between p-4">
          <div className="flex flex-row items-center gap-4">
            <h5 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Solver</h5>
            <StatusIndicator status={solverStatus} />
          </div>
          <div className="flex flex-row items-center gap-1">
            <ControlButton
              icon={FaPlay}
              tooltip="Start"
              disabled={solverStatus !== 'idle'}
              colorClass="text-green-500 hover:text-green-400"
              onClick={() => {
                setSolverLogs([])
                setSpinnerSolver(true)
                dispatch(setSolverStatus('starting'))
                window.electron.ipcRenderer.sendMessage('runSolver', [])
              }}
            />
            <ControlButton
              icon={FaStop}
              tooltip="Stop"
              colorClass="text-red-500 hover:text-red-400"
              onClick={() => {
                dispatch(publishMessage({
                  queue: 'management_solver',
                  body: { message: 'stop' }
                }))
                setSolverLogs(["SOLVER HALTED"])
                dispatch(setSolverStatus('idle'))
                window.electron.ipcRenderer.sendMessage('haltSolver', [])
              }}
            />
            <ControlButton
              icon={CgDetailsMore}
              tooltip="Show/Hide Logs"
              onClick={() => setSolverLogsVisibility(!solverLogsVisibility)}
            />
          </div>
        </div>

        {solverLogsVisibility && (
          <div className={`h-[150px] overflow-y-auto p-3 text-xs font-mono border-t ${isDark
            ? 'bg-black/30 text-gray-300 border-white/10'
            : 'bg-gray-50 text-gray-700 border-gray-200'
            } ${spinnerSolver ? 'flex items-center justify-center' : ''}`}>
            {spinnerSolver && <ImSpinner className={`animate-spin w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />}
            {!spinnerSolver && solverLogs.map((ml, index) => <div key={index} className="whitespace-pre-wrap">{ml}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

export default ServerGUI;

