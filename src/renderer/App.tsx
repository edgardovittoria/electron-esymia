import './App.css';
import { useEffect, useState } from 'react';
import Esymia from './esymia/Esymia';
import Cadmia from './cadmia/Cadmia';
import Home from './home/Home';
import { useAuth0 } from '@auth0/auth0-react';
import SimulationStatus from './esymia/application/simulationTabsManagement/tabs/simulator/rightPanelSimulator/components/SimulationStatus';
import MeshingStatus from './esymia/application/simulationTabsManagement/tabs/simulator/rightPanelSimulator/components/MeshingStatus';
import { useDispatch, useSelector } from 'react-redux';
import {
  activeMeshingSelector,
  activeSimulationsSelector,
} from './esymia/store/projectSlice';
import { HiOutlineLogout } from 'react-icons/hi';
import { FaUser } from 'react-icons/fa';
import {
  connectStomp,
  disconnectStomp,
  publishMessage,
} from './middleware/stompMiddleware';
import { ImSpinner } from 'react-icons/im';
import { brokerConnectedSelector, setTheme, ThemeSelector } from './esymia/store/tabsAndMenuItemsSlice';
import { MesherStatusSelector, SolverStatusSelector } from './esymia/store/pluginsSlice';


// export const client = new Client({
//   brokerURL: 'ws://localhost:15674/ws'
// });



export default function App() {
  const dispatch = useDispatch();
  const brokerActive = useSelector(brokerConnectedSelector);
  const [dockerInstallationBox, setDockerInstallationBox] =
    useState<boolean>(false);
  const mesherStatus = useSelector(MesherStatusSelector)
  const solverStatus = useSelector(SolverStatusSelector)
  const [logout, setLogout] = useState(false)
  const theme = useSelector(ThemeSelector)

  // const [brokerActive, setBrokerActive] = useState<boolean>(false);
  // const [progressBarValue, setProgressBarValue] = useState<number>(0)

  // Uso del temporizzatore per la versione demo di 30 giorni. Commentare se si vuole disabilitare la modalità demo.
  //let {allowedUser, remainingDemoDays} = useDemoMode()

  // Permette ad ogni utente di avere un'unica sessione attiva per volta. Commentare per disabilitare questo vincolo.
  //let {closeUserSessionOnFauna} = useAllowSingleSessionUser()

  useEffect(() => {
    // window.electron.ipcRenderer.invoke('getInstallationDir').then((res) => {
    //   dispatch(setHomePat(res));
    // });
    //window.electron.ipcRenderer.sendMessage('runBroker', []);

    dispatch(connectStomp());
    return () => {
      dispatch(disconnectStomp());
    };
  }, []);

  // window.electron.ipcRenderer.on('runBroker', (arg) => {
  //   (arg as string).split("\n").filter(s => {
  //     if (s === 'docker not installed') {
  //       setDockerInstallationBox(true);
  //     }
  //     console.log(s.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''))
  //   })
  // });

  if (process.env.APP_MODE !== "test") {
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
        setLogout(true)
      }
    });
  }


  useEffect(() => {
    if (logout && process.env.APP_MODE !== "test") {
      window.electron.ipcRenderer.sendMessage('logout', [
        process.env.REACT_APP_AUTH0_DOMAIN,
      ]);
      setLogout(false)
    }
  }, [logout])


  // useEffect(() => {
  //   if(progressBarValue !== 70){
  //     setTimeout(() => {
  //       setProgressBarValue(prev => prev+1)
  //     }, 100);
  //   }else if(progressBarValue === 70){
  //     setBrokerActive(true)
  //   }
  // }, [progressBarValue])

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



  return (
    <div className={theme==='dark' ? 'bg-bgColorDark' :'bg-bgColor'}>
      {/* {dockerInstallationBox && allowedUser && ( */}
      {dockerInstallationBox && (
        <div className="absolute top-1/2 right-1/2 translate-x-1/2 z-100">
          <div className="flex flex-col items-center gap-2 p-3 bg-white rounded border border-black">
            <span className='text-2xl'>Docker Needed</span>
            <hr className="w-full border-[.5px] border-black" />
            <span>Please Install Docker and restart the application</span>
            <a href="https://www.docker.com/get-started/" target='_blank' className='font-bold text-blue-600 underline'>
              Get Started with Docker
            </a>
            {/* <progress className="progress w-full mr-4" value={progressBarValue} max={70} /> */}
          </div>
        </div>
      )}
      {/* {!dockerInstallationBox && allowedUser && ( */}
      {!dockerInstallationBox && (
        <>
          {!brokerActive ? (
            <div className="absolute top-1/2 right-1/2 translate-x-1/2 z-100">
              <div className="flex flex-col items-center gap-2 p-3 bg-white rounded">
                <span>Starting Services...</span>
                <ImSpinner className="animate-spin w-8 h-8" />
                {/* <progress className="progress w-full mr-4" value={progressBarValue} max={70} /> */}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-row items-center justify-center">
                <div
                  role="tablist"
                  className={`tabs tabs-bordered w-full justify-center h-[3vh]`}
                >
                  <input
                    type="radio"
                    name="dashboard"
                    role="tab"
                    className={`tab ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'} ${theme === 'dark' && tabsSelected === 'home' ? 'border-textColorDark' : 'border-gray-400 border-opacity-35'}`}
                    aria-label="Home"
                    checked={tabsSelected === 'home'}
                    onClick={() => setTabsSelected('home')}
                  />
                  <input
                    type="radio"
                    name="cadmia"
                    role="tab"
                    className={`tab ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'} ${theme === 'dark' && tabsSelected === 'cadmia' ? 'border-textColorDark' : 'border-gray-400 border-opacity-35'}`}
                    aria-label="CADmIA"
                    checked={tabsSelected === 'cadmia'}
                    disabled={!user}
                    onClick={() => setTabsSelected('cadmia')}
                  />
                  <input
                    type="radio"
                    name="esymia"
                    role="tab"
                    className={`tab ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'} ${theme === 'dark' && tabsSelected === 'esymia' ? 'border-textColorDark' : 'border-gray-400 border-opacity-35'}`}
                    aria-label="ESymIA"
                    checked={tabsSelected === 'esymia'}
                    disabled={!user}
                    onClick={() => setTabsSelected('esymia')}
                  />
                </div>
                {user && (
                  <div>
                    {/* <span className='absolute top-0 left-0 text-center p-1 border-b-2 border-r-2 border-secondaryColor rounded-br-xl bg-white font-bold text-sm'>DEMO: {remainingDemoDays} days remaining</span> */}
                    <FaUser
                      id="profileIcon"
                      className={`w-[20px] h-[20px] mr-4 ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'} hover:opacity-40 hover:cursor-pointer`}
                      onClick={() => {
                        setUserDropdownVisibility(!userDropdownVisibility);
                      }}
                    />
                    <ul
                      style={{
                        display: !userDropdownVisibility ? 'none' : 'block',
                      }}
                      className={`px-4 py-2 ${theme === 'light' ? 'bg-white text-textColor' : 'bg-bgColorDark2 text-textColorDark'} rounded list-none absolute right-[10px] mt-[20px] w-max shadow z-[10000]`}
                    >
                      <li className="font-bold text-lg">
                        {user.nickname}
                      </li>
                      <hr className="mb-3" />
                      <label className="flex cursor-pointer gap-2 mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <circle cx="12" cy="12" r="5" />
                          <path
                            d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                        </svg>
                        <input type="checkbox" value={theme} className="toggle toggle-sm theme-controller" onChange={() => {
                          if(theme === 'light'){
                            dispatch(setTheme('dark'))
                          }else{
                            dispatch(setTheme('light'))
                          }
                        }}/>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                      </label>
                      <div
                        className="flex items-center p-[5px] hover:bg-black hover:text-white hover:cursor-pointer"
                        onClick={() => {
                          if (process.env.APP_MODE !== 'test') {
                            window.electron.ipcRenderer.sendMessage('checkLogout');
                            //closeUserSessionOnFauna()
                          }
                        }}
                      >
                        <HiOutlineLogout className="w-[20px] h-[20px] mr-[10px]" />
                        <li>Logout</li>
                      </div>
                    </ul>
                  </div>
                )}
              </div>
              {tabsSelected === 'home' && (
                <Home setSelectedTab={setTabsSelected} />
              )}
              <Cadmia selectedTab={tabsSelected} />
              <Esymia selectedTab={tabsSelected} />
              {activeSimulations &&
                activeSimulations.length > 0 &&
                !feedbackSimulationVisible && (
                  <button
                    className="absolute bottom-24 right-0 rounded-tl-full rounded-bl-full p-3 bg-white shadow-2xl font-bold border border-secondaryColor text-secondaryColor text-sm"
                    onClick={() => setFeedbackSimulationVisible(true)}
                  >
                    SIM
                  </button>
                )}
              {activeSimulations && activeSimulations.length > 0 && (
                <SimulationStatus
                  feedbackSimulationVisible={feedbackSimulationVisible}
                  setFeedbackSimulationVisible={setFeedbackSimulationVisible}
                  activeSimulations={activeSimulations}
                />
              )}
              {activeMeshing &&
                activeMeshing.length > 0 &&
                !feedbackMeshingVisible && (
                  <button
                    className="absolute bottom-24 right-0 rounded-tl-full rounded-bl-full p-3 bg-white shadow-2xl font-bold border border-secondaryColor text-secondaryColor text-sm"
                    onClick={() => setFeedbackMeshingVisible(true)}
                  >
                    MES
                  </button>
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
