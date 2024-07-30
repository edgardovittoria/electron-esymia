import { getFoldersByOwner, getSimulationProjectsByOwner } from '../faunadb/projectsFolderAPIs';
import { FaunaFolder, FaunaProject } from '../model/FaunaModels';
import { constructFolderStructure } from '../faunadb/apiAuxiliaryFunctions';
import { homePathSelector, selectFolder, setProjectsFolderToUser } from '../store/projectSlice';
import { useFaunaQuery, UsersState, usersStateSelector } from 'cad-library';
import { useDispatch, useSelector } from 'react-redux';
import { getDirContents, readLocalFile } from '../../fileSystemAPIs/fileSystemAPIs';
import { Folder, Project } from '../model/esymiaModels';

export const useStorage = () => {
  const { execQuery } = useFaunaQuery();
  const user = useSelector(usersStateSelector);
  const dispatch = useDispatch();
  const homePath = useSelector(homePathSelector)
  const loadProjectsOnline = (setLoginSpinner: (v: boolean) => void) => {
    execQuery(getFoldersByOwner, user.email, dispatch).then(
      (folders: FaunaFolder[]) => {
        execQuery(getSimulationProjectsByOwner, user.email, dispatch).then(
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
                parent: 'nobody'
              }
            } as FaunaFolder;
            const folder = constructFolderStructure(
              'root',
              [rootFaunaFolder, ...folders],
              projects
            );
            dispatch(setProjectsFolderToUser(folder));
            dispatch(selectFolder(folder.faunaDocumentId as string));
            setLoginSpinner(false);
          }
        );
      }
    );
  };
  // const loadProjectsLocal = (setLoginSpinner: (v: boolean) => void) => {
  //   const folder = constructFolderStructureLocal(
  //     'projectsDir',
  //     [],
  //     user,
  //     homePath
  //   );
  //   console.log(folder);
  //   dispatch(setProjectsFolderToUser({ ...folder, faunaDocumentId: 'root', parent: 'nobody', name: 'My Files' }));
  //   dispatch(selectFolder(folder.faunaDocumentId as string));
  //   setLoginSpinner(false);

  // };
  const loadFolders = (setLoginSpinner: (v: boolean) => void) => {
    if (process.env.STORAGE_MODE === 'local') {
      //loadProjectsLocal(setLoginSpinner);
    } else {
      loadProjectsOnline(setLoginSpinner);
    }
  };
  return { loadFolders };
};

// const constructFolderStructureLocal = (name: string, parents: string[], user: UsersState, homePath: string) => {
//   let projects: Project[] =  getDirContents([homePath, ...parents, name]).filter((p: string) => p.endsWith('.json')).map((s: string) => JSON.parse(readLocalFile([homePath, ...parents, name, s]) as string) as Project);
//   let folders: Folder[] = getDirContents([...parents, name]).filter((f: string) => !f.endsWith('.json')).map((s: string) => {
//     return  constructFolderStructureLocal(s, [...parents, name], user, homePath);
//   });

//   return {
//     name: name,
//     faunaDocumentId: name,
//     owner: user,
//     parent: parents[parents.length - 1],
//     projectList: projects,
//     subFolders: folders,
//     sharedWith: []
//   } as Folder;
// };
