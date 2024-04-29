import './App.css';
import React, { useEffect, useMemo, useState } from 'react';
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


export default function App() {
  const dispatch = useDispatch();
  // SELECTORS
  const user = useSelector(usersStateSelector);
  const tabSelected = useSelector(tabSelectedSelector);
  const [loginSpinner, setLoginSpinner] = useState(false);

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
    () => <TabsContainer user={user} />,
    [user],
  );

  const activeSimulations = useSelector(activeSimulationsSelector)
  const [feedbackSimulationVisible, setFeedbackSimulationVisible] = useState<boolean>(false);
  useEffect(() => {
    if(activeSimulations.length > 0){
      setFeedbackSimulationVisible(true)
    }
  }, [activeSimulations.length]);

  const showInfoModal = useSelector(showInfoModalSelector)
  const showCreateNewProjectModal = useSelector(showCreateNewProjectModalSelector)

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
          <button className="absolute bottom-16 right-10 rounded-full p-4 bg-white shadow-2xl font-bold border border-secondaryColor text-secondaryColor"
            onClick={() => setFeedbackSimulationVisible(true)}
          >
            SIM
          </button>
        }
        {activeSimulations && activeSimulations.length > 0 && <SimulationStatus feedbackSimulationVisible={feedbackSimulationVisible} setFeedbackSimulationVisible={setFeedbackSimulationVisible} activeSimulations={activeSimulations}/>}
      </div>
    </div>
  );
}
