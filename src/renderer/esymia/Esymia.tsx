import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFaunaQuery, usersStateSelector } from 'cad-library';
import {
  showCreateNewProjectModalSelector,
  showInfoModalSelector,
  tabSelectedSelector,
} from './store/tabsAndMenuItemsSlice';
import {
  activeMeshingSelector,
  activeSimulationsSelector, findProjectByFaunaID, mainFolderSelector,
  selectFolder,
  setProjectsFolderToUser, setSuggestedQuantum, sharedElementsFolderSelector
} from './store/projectSlice';
import {
  ActivePluginsSelector,
  addActivePlugin,
  MesherStatusSelector,
  setMesherStatus,
  setSolverStatus,
  SolverStatusSelector,
} from './store/pluginsSlice';
import {
  getFoldersByOwner,
  getSimulationProjectsByOwner, updateProjectInFauna
} from './faunadb/projectsFolderAPIs';
import { FaunaFolder, FaunaProject } from './model/FaunaModels';
import { constructFolderStructure, convertInFaunaProjectThis, convertInProjectThis } from './faunadb/apiAuxiliaryFunctions';
import { TabsContainer } from './application/TabsContainer';
import { ImSpinner } from 'react-icons/im';
import InfoModal from './application/sharedModals/InfoModal';
import { CreateNewProjectModal } from './application/sharedModals/CreateNewProjectModal';
import { MenuBar } from './application/MenuBar';
import { DashboardTabsContentFactory } from './application/dashboardTabsManagement/DashboardTabsContentFactory';
import { SimulationTabsContentFactory } from './application/simulationTabsManagement/SimulationTabsContentFactory';
import SimulationStatus from './application/simulationTabsManagement/tabs/simulator/rightPanelSimulator/components/SimulationStatus';
import { BsPlugin } from 'react-icons/bs';
import Plugins from './plugin/Plugins';
import MeshingStatus
  from './application/simulationTabsManagement/tabs/simulator/rightPanelSimulator/components/MeshingStatus';
import { createFolder, getDirContents, uploadFile } from '../fileSystemAPIs/fileSystemAPIs';
import { Client } from '@stomp/stompjs';
import { Folder, Project } from './model/esymiaModels';
import {
  takeAllProjectsIn,
  takeAllProjectsInArrayOf
} from './store/auxiliaryFunctions/managementProjectsAndFoldersFunction';
import { callback_mesh_advices, callback_mesher_feedback, callback_mesher_results } from './application/rabbitMQFunctions';
export interface EsymiaProps {
  selectedTab: string;
}

export const client = new Client({
  brokerURL: 'ws://localhost:15674/ws',
  onConnect: () => {
    //client.subscribe('management', callback_mgmt);
    //client.subscribe('mesher_feedback', callback_mesher_feedback);
  },
});

const Esymia: React.FC<EsymiaProps> = ({ selectedTab }) => {

  const findProject = async (projectID: string) => {
    let projects: FaunaProject[]  = await execQuery(getSimulationProjectsByOwner, user.email)
    return convertInProjectThis(projects.filter(p => p.id === projectID)[0])
  }

  const [loadedFolders, setLoadedFolders] = useState<boolean>(false);


  const dispatch = useDispatch();
  // SELECTORS
  const user = useSelector(usersStateSelector);
  const tabSelected = useSelector(tabSelectedSelector);
  const [loginSpinner, setLoginSpinner] = useState(false);
  // da scommentare nel caso esymia dovesse essere estrapolata
  /* const [alert, setAlert] = useState<boolean>(false);
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
  }, [activeMeshing.length]); */

  useEffect(() => {
    if(loadedFolders){
      if(client.connected){
        client.subscribe('mesh_advices', (msg) => callback_mesh_advices(msg, findProject, execQuery, dispatch))
        client.subscribe('mesher_results', (msg) => callback_mesher_results(msg, findProject, execQuery, dispatch))
        client.subscribe('mesher_feedback', (msg) => callback_mesher_feedback(msg, dispatch))
      }else{
        client.activate()
      }
    }
  }, [client.connected, loadedFolders]);


  const activePlugins = useSelector(ActivePluginsSelector);
  const [pluginsVisible, setPluginsVisible] = useState<boolean>(true);
  useEffect(() => {
    if (activePlugins.length > 0) {
      setPluginsVisible(true);
    }
  }, [activePlugins.length]);

  const showInfoModal = useSelector(showInfoModalSelector);
  const showCreateNewProjectModal = useSelector(
    showCreateNewProjectModalSelector,
  );
  const mesherStatus = useSelector(MesherStatusSelector);
  const solverStatus = useSelector(SolverStatusSelector);

  useEffect(() => {
    if (user.userName) {
      dispatch(addActivePlugin('serverGUI'));
      if (mesherStatus === 'idle') {
        dispatch(setMesherStatus('starting'));
        window.electron.ipcRenderer.sendMessage('runMesher', []);
      }
      if (solverStatus === 'idle') {
        dispatch(setSolverStatus('starting'));
        window.electron.ipcRenderer.sendMessage('runSolver', []);
      }
    }
  }, [user.userName]);

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
                    .filter((p) => p.project.sharedWith?.length === 0)
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
              setLoadedFolders(true)
            },
          );
        },
      );
    }
  }, [user.userName]);

  // MEMOIZED COMPONENTS
  const memoizedTabsContainer = useMemo(
    () => (
      <TabsContainer user={user} setPluginModalVisible={setPluginsVisible} />
    ),
    [user],
  );

  return (
    <>
      {selectedTab === 'esymia' &&
        <div className="lg:h-[97vh] h-screen">
          {loginSpinner && (
            <ImSpinner className="animate-spin w-12 h-12 absolute left-1/2 top-1/2" />
          )}
          {showInfoModal && <InfoModal />}
          {showCreateNewProjectModal && <CreateNewProjectModal />}
          <div className={`${loginSpinner && 'opacity-40'} h-[97vh]`}>
            {memoizedTabsContainer}
            <MenuBar />

            {tabSelected === 'DASHBOARD' ? (
              <DashboardTabsContentFactory />
            ) : (
              <SimulationTabsContentFactory />
            )}
            {/* {activeSimulations &&
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
                setAlert={setAlert}
              />
            )} */}
            {activePlugins && activePlugins.length > 0 && !pluginsVisible && (
              <button
                className="absolute bottom-40 right-0 rounded-tl-full rounded-bl-full p-3 bg-white shadow-2xl font-bold border border-secondaryColor text-secondaryColor"
                onClick={() => setPluginsVisible(true)}
              >
                <BsPlugin size={22} />
              </button>
            )}
            {activePlugins && activePlugins.length > 0 && (
              <Plugins
                pluginsVisible={pluginsVisible}
                setPluginsVisible={setPluginsVisible}
                activePlugins={activePlugins}
              />
            )}
          </div>
        </div>
      }
    </>
  );
};

export default Esymia;
