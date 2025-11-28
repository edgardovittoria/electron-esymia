import './App.css';
import { useEffect, useState } from 'react';
import Esymia from './esymia/Esymia';
import Cadmia from './cadmia/Cadmia';
import Home from './home/Home';
import { useAuth0 } from '@auth0/auth0-react';
import SimulationStatus from './esymia/application/simulationTabsManagement/tabs/mesher/components/rightPanelSimulator/components/SimulationStatus';
import MeshingStatus from './esymia/application/simulationTabsManagement/tabs/mesher/components/rightPanelSimulator/components/MeshingStatus';
import { useDispatch, useSelector } from 'react-redux';
import {
  activeMeshingSelector,
  activeSimulationsSelector,
} from './esymia/store/projectSlice';
import { HiOutlineLogout } from 'react-icons/hi';
import { FaUser, FaHome, FaCube, FaProjectDiagram } from 'react-icons/fa';
import {
  connectStomp,
  disconnectStomp,
  publishMessage,
} from './middleware/stompMiddleware';
import { ImSpinner } from 'react-icons/im';
import {
  brokerConnectedSelector,
  setTheme,
  showInfoModalSelector,
  ThemeSelector,
} from './esymia/store/tabsAndMenuItemsSlice';
import {
  MesherStatusSelector,
  SolverStatusSelector,
} from './esymia/store/pluginsSlice';
import InfoModal from './esymia/application/sharedModals/InfoModal';

export default function App() {
  const dispatch = useDispatch();
  const brokerActive = useSelector(brokerConnectedSelector);
  const [dockerInstallationBox, setDockerInstallationBox] =
    useState<boolean>(false);
  const mesherStatus = useSelector(MesherStatusSelector);
  const solverStatus = useSelector(SolverStatusSelector);
  const [logout, setLogout] = useState(false);
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('runBroker', []);
    dispatch(connectStomp());
    return () => {
      dispatch(disconnectStomp());
    };
  }, []);

  window.electron.ipcRenderer.on('runBroker', (arg) => {
    const response = arg as {
      type: string;
      message?: string;
      success?: boolean;
      exitCode?: number;
    };
    if (response.type === 'status') {
      if (!response.success) {
        if (response.exitCode === 10) {
          setDockerInstallationBox(true);
        } else {
          console.error(
            'Errore generico script Docker. Codice:',
            response.exitCode,
          );
        }
      } else {
        console.log(response.message);
      }
    }
  });

  if (process.env.APP_MODE !== 'test') {
    window.electron.ipcRenderer.on('checkLogout', (arg) => {
      if ((arg as string) == 'allowed') {
        if (mesherStatus != 'idle') {
          dispatch(
            publishMessage({
              queue: 'management',
              body: { message: 'stop' },
            }),
          );
        }
        if (solverStatus != 'idle') {
          dispatch(
            publishMessage({
              queue: 'management_solver',
              body: { message: 'stop' },
            }),
          );
        }
        setLogout(true);
      }
    });
  }

  useEffect(() => {
    if (logout && process.env.APP_MODE !== 'test') {
      window.electron.ipcRenderer.sendMessage('logout', [
        process.env.REACT_APP_AUTH0_DOMAIN,
      ]);
      setLogout(false);
    }
  }, [logout]);

  const [tabsSelected, setTabsSelected] = useState<string>('home');
  const { user } = useAuth0();
  const [userDropdownVisibility, setUserDropdownVisibility] = useState(false);
  const activeSimulations = useSelector(activeSimulationsSelector);
  const [feedbackSimulationVisible, setFeedbackSimulationVisible] =
    useState<boolean>(false);

  useEffect(() => {
    if (activeSimulations.length > 0) {
      setFeedbackSimulationVisible(true);
    }
  }, [activeSimulations.length]);

  const activeMeshing = useSelector(activeMeshingSelector);
  const [feedbackMeshingVisible, setFeedbackMeshingVisible] =
    useState<boolean>(false);
  useEffect(() => {
    if (activeMeshing.length > 0) {
      setFeedbackMeshingVisible(true);
    }
  }, [activeMeshing.length]);

  const showInfoModal = useSelector(showInfoModalSelector);

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-900'}`}>
      {showInfoModal && <InfoModal />}

      {/* Docker Installation Modal */}
      {dockerInstallationBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`glass-panel ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} p-8 rounded-2xl max-w-md w-full flex flex-col items-center gap-6`}>
            <h2 className="text-2xl font-bold">Docker Required</h2>
            <p className="text-center opacity-80">Please install and start Docker, then restart the application.</p>
            <a
              href="https://www.docker.com/get-started/"
              target="_blank"
              className="text-blue-500 hover:text-blue-400 underline font-medium"
              rel="noreferrer"
            >
              Get Started with Docker
            </a>
            <button
              type="button"
              className={`btn-primary w-full ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
              onClick={() => {
                window.electron.ipcRenderer.sendMessage('closeApp', []);
              }}
            >
              Close App
            </button>
          </div>
        </div>
      )}

      {!dockerInstallationBox && (
        <>
          {!brokerActive ? (
            <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 z-50">
              <ImSpinner
                className={`animate-spin w-12 h-12 ${isDark ? 'text-white' : 'text-black'
                  }`}
              />
              <span className="text-lg font-light tracking-wider animate-pulse">Starting Services...</span>
            </div>
          ) : (
            <div className="relative h-screen flex flex-col">

              {/* Top Navigation Bar */}
              <div className={`w-full px-6 py-2 flex items-center justify-between z-40 ${tabsSelected === 'home' ? 'absolute top-0 bg-transparent' : `backdrop-blur-md border-b ${isDark ? 'bg-black/20 border-white/10' : 'bg-white/40 border-black/5'}`}`}>

                {/* Tabs */}
                <div className={`flex items-center gap-2 p-1 rounded-full ${isDark ? 'bg-white/10 border border-white/5' : 'bg-black/5 border border-black/5'} backdrop-blur-md`}>
                  <button
                    onClick={() => setTabsSelected('home')}
                    className={`flex items-center gap-2 px-6 py-1 rounded-full transition-all duration-300 ${tabsSelected === 'home'
                      ? (isDark ? 'bg-white text-black shadow-lg' : 'bg-black text-white shadow-lg')
                      : 'hover:bg-white/10 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <FaHome size={14} />
                    <span className="text-sm font-medium">Home</span>
                  </button>

                  <button
                    onClick={() => user && setTabsSelected('cadmia')}
                    disabled={!user}
                    className={`flex items-center gap-2 px-6 py-1 rounded-full transition-all duration-300 ${tabsSelected === 'cadmia'
                      ? (isDark ? 'bg-white text-black shadow-lg' : 'bg-black text-white shadow-lg')
                      : (!user ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 opacity-70 hover:opacity-100')
                      }`}
                  >
                    <FaCube size={14} />
                    <span className="text-sm font-medium">Cadmia</span>
                  </button>

                  <button
                    onClick={() => user && setTabsSelected('esymia')}
                    disabled={!user}
                    className={`flex items-center gap-2 px-6 py-1 rounded-full transition-all duration-300 ${tabsSelected === 'esymia'
                      ? (isDark ? 'bg-white text-black shadow-lg' : 'bg-black text-white shadow-lg')
                      : (!user ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 opacity-70 hover:opacity-100')
                      }`}
                  >
                    <FaProjectDiagram size={14} />
                    <span className="text-sm font-medium">Esymia</span>
                  </button>
                </div>

                {/* User Profile */}
                {user && (
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownVisibility(!userDropdownVisibility)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300 ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                    >
                      <span className="text-sm font-medium hidden md:block">{user.nickname}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                        <FaUser size={14} />
                      </div>
                    </button>

                    {/* Dropdown */}
                    {userDropdownVisibility && (
                      <div className={`absolute right-0 mt-2 w-56 rounded-xl overflow-hidden shadow-2xl border backdrop-blur-xl animate-fade-in-up ${isDark ? 'bg-gray-900/90 border-white/10' : 'bg-white/90 border-black/5'
                        }`}>
                        <div className="p-4 border-b border-white/10">
                          <p className="text-sm font-bold truncate">{user.name}</p>
                          <p className="text-xs opacity-60 truncate">{user.email}</p>
                        </div>

                        <div className="p-2">
                          <label className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
                            <span className="text-sm">Dark Mode</span>
                            <input
                              type="checkbox"
                              checked={isDark}
                              onChange={() => dispatch(setTheme(isDark ? 'light' : 'dark'))}
                              className="toggle toggle-sm toggle-primary"
                            />
                          </label>

                          <button
                            onClick={() => {
                              if (process.env.APP_MODE !== 'test') {
                                window.electron.ipcRenderer.sendMessage('checkLogout');
                              }
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg text-red-500 transition-colors ${isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}
                          >
                            <HiOutlineLogout size={18} />
                            <span className="text-sm font-medium">Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-hidden relative">
                {tabsSelected === 'home' && (
                  <Home setSelectedTab={setTabsSelected} />
                )}
                <Cadmia selectedTab={tabsSelected} />
                <Esymia selectedTab={tabsSelected} />
              </div>

              {/* Floating Status Buttons */}
              <div className="absolute bottom-8 right-8 flex flex-col gap-4">
                {activeSimulations && activeSimulations.length > 0 && !feedbackSimulationVisible && (
                  <button
                    className="w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center font-bold text-xs hover:scale-110 transition-transform"
                    onClick={() => setFeedbackSimulationVisible(true)}
                  >
                    SIM
                  </button>
                )}

                {activeMeshing && activeMeshing.length > 0 && !feedbackMeshingVisible && (
                  <button
                    className="w-12 h-12 rounded-full bg-purple-500 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center font-bold text-xs hover:scale-110 transition-transform"
                    onClick={() => setFeedbackMeshingVisible(true)}
                  >
                    MES
                  </button>
                )}
              </div>

              {/* Status Panels */}
              {activeSimulations && activeSimulations.length > 0 && (
                <SimulationStatus
                  feedbackSimulationVisible={feedbackSimulationVisible}
                  setFeedbackSimulationVisible={setFeedbackSimulationVisible}
                  activeSimulations={activeSimulations}
                />
              )}

              {activeMeshing && activeMeshing.length > 0 && (
                <MeshingStatus
                  feedbackMeshingVisible={feedbackMeshingVisible}
                  setFeedbackMeshingVisible={setFeedbackMeshingVisible}
                  activeMeshing={activeMeshing}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
