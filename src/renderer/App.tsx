import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usersStateSelector, useFaunaQuery } from 'cad-library';
import { ImSpinner } from 'react-icons/im';
import { TabsContainer } from './application/TabsContainer';
import {
  setFolderOfElementsSharedWithUser,
  setProjectsFolderToUser,
  selectFolder, activeSimulationsSelector
} from './store/projectSlice';
import { MenuBar } from './application/MenuBar';
import { DashboardTabsContentFactory } from './application/dashboardTabsManagement/DashboardTabsContentFactory';
import { SimulationTabsContentFactory } from './application/simulationTabsManagement/SimulationTabsContentFactory';
import {
  getFoldersByOwner,
  getSharedFolders,
  getSharedSimulationProjects,
  getSimulationProjectsByOwner,
} from './faunadb/projectsFolderAPIs';
import { tabSelectedSelector } from './store/tabsAndMenuItemsSlice';
import {
  constructFolderStructure,
  faunaFolderHaveParentInList,
  faunaProjectHaveParentInFolderList,
} from './faunadb/apiAuxiliaryFunctions';
import { FaunaFolder, FaunaProject } from './model/FaunaModels';
import { numberOfActiveSimulationsSelector } from './store/solverSlice';
import SimulationStatus
  from './application/simulationTabsManagement/tabs/simulator/rightPanelSimulator/components/SimulationStatus';


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

  return (
    <div className="lg:h-[100vh] h-screen">
      {loginSpinner && (
        <ImSpinner className="animate-spin w-12 h-12 absolute left-1/2 top-1/2" />
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
