import './App.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usersStateSelector, useFaunaQuery } from 'cad-library';
import { ImSpinner } from 'react-icons/im';
import { TabsContainer } from './application/TabsContainer';
import {
  setProjectsFolderToUser,
  selectFolder, activeSimulationsSelector
} from './store/projectSlice';
import { MenuBar } from './application/MenuBar';
import { DashboardTabsContentFactory } from './application/dashboardTabsManagement/DashboardTabsContentFactory';
import { SimulationTabsContentFactory } from './application/simulationTabsManagement/SimulationTabsContentFactory';
import {
  getFoldersByOwner,
  getSimulationProjectsByOwner,
} from './faunadb/projectsFolderAPIs';
import {
  showCreateNewProjectModalSelector,
  showInfoModalSelector,
  tabSelectedSelector
} from './store/tabsAndMenuItemsSlice';
import {
  constructFolderStructure,
} from './faunadb/apiAuxiliaryFunctions';
import { FaunaFolder, FaunaProject } from './model/FaunaModels';
import SimulationStatus
  from './application/simulationTabsManagement/tabs/simulator/rightPanelSimulator/components/SimulationStatus';
import InfoModal from './application/sharedModals/InfoModal';
import { CreateNewProjectModal } from './application/sharedModals/CreateNewProjectModal';
import {
  ActivePluginsSelector,
  addActivePlugin,
  MesherStatusSelector,
  setMesherStatus,
  setSolverStatus, SolverStatusSelector
} from './store/pluginsSlice';
import Plugins from './plugin/Plugins';
import { VscServerProcess } from 'react-icons/vsc';
import { BsPlugin } from 'react-icons/bs';


export default function App() {
  const dispatch = useDispatch();
  // SELECTORS
  const user = useSelector(usersStateSelector);
  const tabSelected = useSelector(tabSelectedSelector);
  const [loginSpinner, setLoginSpinner] = useState(false);

  const activeSimulations = useSelector(activeSimulationsSelector)
  const [feedbackSimulationVisible, setFeedbackSimulationVisible] = useState<boolean>(false);
  useEffect(() => {
    if(activeSimulations.length > 0){
      setFeedbackSimulationVisible(true)
    }
  }, [activeSimulations.length]);

  const activePlugins = useSelector(ActivePluginsSelector)
  const [pluginsVisible, setPluginsVisible] = useState<boolean>(true);
  useEffect(() => {
    if(activePlugins.length > 0){
      setPluginsVisible(true)
    }
  }, [activePlugins.length]);

  const showInfoModal = useSelector(showInfoModalSelector)
  const showCreateNewProjectModal = useSelector(showCreateNewProjectModalSelector)
  const mesherStatus = useSelector(MesherStatusSelector)
  const solverStatus = useSelector(SolverStatusSelector)

   /* useEffect(() => {
    if(user.userName){
      dispatch(addActivePlugin('serverGUI'))
      if(mesherStatus === 'idle'){
        dispatch(setMesherStatus('starting'))
        window.electron.ipcRenderer.sendMessage('runMesher', [])
      }
      if(solverStatus === 'idle'){
        dispatch(setSolverStatus('starting'))
        window.electron.ipcRenderer.sendMessage('runSolver', [])
      }
    }
  }, [user.userName]); */

  const { execQuery } = useFaunaQuery();

  // USE EFFECT
  useEffect(() => {
    if (user.userName) {
      setLoginSpinner(true);
      execQuery(getFoldersByOwner, user.email).then(
        (folders: FaunaFolder[]) => {
          execQuery(getSimulationProjectsByOwner, user.email).then(
            (projects: FaunaProject[]) => {
              const rootFaunaFolder = {
                id: 'root',
                folder: {
                  name: 'My Files',
                  owner: user,
                  sharedWith: [],
                  subFolders: folders
                    .filter((f) => f.folder.parent === 'root')
                    .map((sb) => sb.id),
                  projectList: projects
                    .filter((p) => p.project.parentFolder === 'root')
                    .map((pr) => pr.id),
                  parent: 'nobody',
                },
              } as FaunaFolder;
              const folder = constructFolderStructure(
                'root',
                [rootFaunaFolder, ...folders],
                projects,
              );
              dispatch(setProjectsFolderToUser(folder));
              dispatch(selectFolder(folder.faunaDocumentId as string));
              setLoginSpinner(false);
            },
          );
        },
      );
    }
  }, [user.userName]);

  // MEMOIZED COMPONENTS
  const memoizedTabsContainer = useMemo(
    () => <TabsContainer user={user} setPluginModalVisible={setPluginsVisible}/>,
    [user],
  );

  return (
    <div className="lg:h-[100vh] h-screen">
      {loginSpinner && (
        <ImSpinner className="animate-spin w-12 h-12 absolute left-1/2 top-1/2" />
      )}
      {showInfoModal && <InfoModal/>}
      {showCreateNewProjectModal && (
        <CreateNewProjectModal />
      )}
      <div className={`${loginSpinner && 'opacity-40'} h-[100vh]`}>
        {memoizedTabsContainer}
        <MenuBar />

        {tabSelected === 'DASHBOARD' ? (
          <DashboardTabsContentFactory />
        ) : (
          <SimulationTabsContentFactory />
        )}
        {activeSimulations && activeSimulations.length > 0 && !feedbackSimulationVisible &&
          <button className="absolute bottom-24 right-0 rounded-tl-full rounded-bl-full p-3 bg-white shadow-2xl font-bold border border-secondaryColor text-secondaryColor text-sm"
            onClick={() => setFeedbackSimulationVisible(true)}
          >
            SIM
          </button>
        }
        {activeSimulations && activeSimulations.length > 0 && <SimulationStatus feedbackSimulationVisible={feedbackSimulationVisible} setFeedbackSimulationVisible={setFeedbackSimulationVisible} activeSimulations={activeSimulations}/>}
        {activePlugins && activePlugins.length > 0 && !pluginsVisible &&
          <button className="absolute bottom-40 right-0 rounded-tl-full rounded-bl-full p-3 bg-white shadow-2xl font-bold border border-secondaryColor text-secondaryColor"
                  onClick={() => setPluginsVisible(true)}
          >
            <BsPlugin size={22}/>
          </button>
        }
        {activePlugins && activePlugins.length > 0 && <Plugins pluginsVisible={pluginsVisible} setPluginsVisible={setPluginsVisible} activePlugins={activePlugins}/>}
      </div>
    </div>
  );
}
