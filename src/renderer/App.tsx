import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usersStateSelector, useFaunaQuery } from 'cad-library';
import { ImSpinner } from 'react-icons/im';
import { useAuth0 } from '@auth0/auth0-react';
import { TabsContainer } from './application/TabsContainer';
import {
  setFolderOfElementsSharedWithUser,
  setProjectsFolderToUser,
  selectFolder,
} from './store/projectSlice';
import { MenuBar } from './application/MenuBar';
import { DashboardTabsContentFactory } from './application/dashboardTabsManagement/DashboardTabsContentFactory';
import { SimulationTabsContentFactory } from './application/simulationTabsManagement/SimulationTabsContentFactory';
import {
  getFoldersByOwner,
  getSharedFolders,
  getSharedSimulationProjects, getSimulationProjectsByOwner
} from './faunadb/projectsFolderAPIs';
import { tabSelectedSelector } from './store/tabsAndMenuItemsSlice';
import {
  constructFolderStructure,
  faunaFolderHaveParentInList,
  faunaProjectHaveParentInFolderList,
} from './faunadb/apiAuxiliaryFunctions';
import { FaunaFolder, FaunaProject } from './model/FaunaModels';
import { setTest, TestSelector } from './store/solverSlice';

export default function App() {
  const dispatch = useDispatch();
  // const { getAccessTokenSilently } = useAuth0();
  // const [token, setToken] = useState<string>('');
  // SELECTORS
  const user = useSelector(usersStateSelector);
  const tabSelected = useSelector(tabSelectedSelector);
  const [loginSpinner, setLoginSpinner] = useState(false);

  const { execQuery } = useFaunaQuery();

  /* useEffect(() => {
    if (user.userName) {
      getAccessTokenSilently()
        .then((res) => setToken(res))
        .catch((err) => console.log(err));
    }
  }, [user.userName]); */

  // USE EFFECT
  useEffect(() => {
    // ipcRenderer.on('api:response', (event, data) => console.log(data));
    if (user.userName) {
      setLoginSpinner(true);
      /* window.electron.ipcRenderer
        .invoke('fauna:getFoldersByOwner', [token, user.email])
        .then((folders: FaunaFolder[]) => {
          window.electron.ipcRenderer
            .invoke('fauna:getSimulationProjectsByOwner', [token, user.email])
            .then((projects: FaunaProject[]) => {
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
            });
        }); */
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
      execQuery(getSharedFolders, user.email).then((folders: FaunaFolder[]) => {
        execQuery(getSharedSimulationProjects, user.email).then(
          (projects: FaunaProject[]) => {
            const sharedElementsRootFolder = {
              id: 'shared_root',
              folder: {
                name: 'My Shared Elements',
                owner: user,
                sharedWith: [],
                subFolders: folders
                  .filter(
                    (faunaFolder) =>
                      !faunaFolderHaveParentInList(faunaFolder, folders),
                  )
                  .map((folder) => folder.id),
                projectList: projects
                  .filter(
                    (p) => !faunaProjectHaveParentInFolderList(p, folders),
                  )
                  .map((p) => p.id),
                parent: 'nobody',
              },
            } as FaunaFolder;
            const folder = constructFolderStructure(
              'shared_root',
              [sharedElementsRootFolder, ...folders],
              projects,
            );
            dispatch(setFolderOfElementsSharedWithUser(folder));
          },
        );
      });
    }
  }, [user.userName]);

  // MEMOIZED COMPONENTS
  const memoizedTabsContainer = useMemo(
    () => <TabsContainer user={user} />,
    [user],
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="bg-[#ececec]">
              {loginSpinner && (
                <ImSpinner className="animate-spin w-12 h-12 absolute left-1/2 top-1/2" />
              )}
              <div className={`${loginSpinner && 'opacity-40'}`}>
                {memoizedTabsContainer}
                <MenuBar />
                {tabSelected === 'DASHBOARD' ? (
                  <DashboardTabsContentFactory />
                ) : (
                  <SimulationTabsContentFactory />
                )}
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
