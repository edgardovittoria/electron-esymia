import { FaunaFolder, FaunaProject } from '../model/FaunaModels';
import { constructFolderStructure } from '../faunadb/apiAuxiliaryFunctions';
import { selectFolder, setProjectsFolderToUser } from '../store/projectSlice';
import { useDispatch, useSelector } from 'react-redux';
import { usersStateSelector } from '../../cad_library';
import { useDynamoDBQuery } from '../application/dynamoDB/hook/useDynamoDBQuery';
import { getFolderByUserEmail, getSimulationProjectsByUserEmail } from '../application/dynamoDB/projectsFolderApi';
import { convertFromDynamoDBFormat } from '../application/dynamoDB/utility/formatDynamoDBData';

export const useStorage = () => {
  const user = useSelector(usersStateSelector);
  const dispatch = useDispatch();
  const { execQuery2 } = useDynamoDBQuery()
  const loadProjectsOnline = (setLoginSpinner: (v: boolean) => void) => {
    execQuery2(getFolderByUserEmail, user.email, dispatch).then(
      (resFolders) => {
        let folders = resFolders.Items.map((f: any) => ({id: f.id.S, folder: convertFromDynamoDBFormat(f)} as FaunaFolder))
        execQuery2(getSimulationProjectsByUserEmail, user.email, dispatch).then(
          (resProjects) => {
            let projects = resProjects.Items.map((p: any) => ({id: p.id.S, project: convertFromDynamoDBFormat(p)} as FaunaProject))
            const rootFaunaFolder = {
              id: 'root',
              folder: {
                name: 'My Files',
                owner: user,
                sharedWith: [],
                subFolders: folders
                  .filter((f: any) => f.folder.parent === 'root')
                  .map((sb: { id: any; }) => sb.id),
                projectList: projects
                  .filter((p: { project: { parentFolder: string; }; }) => p.project.parentFolder === 'root')
                  .map((pr: { id: any; }) => pr.id),
                parent: 'nobody'
              }
            } as FaunaFolder;
            const folder = constructFolderStructure(
              'root',
              [rootFaunaFolder, ...folders],
              projects
            );
            dispatch(setProjectsFolderToUser(folder));
            dispatch(selectFolder(folder.id as string));
            setLoginSpinner(false);
          }
        );
      }
    );
  };
  const loadFolders = (setLoginSpinner: (v: boolean) => void) => {
    loadProjectsOnline(setLoginSpinner);
  };
  return { loadFolders };
};