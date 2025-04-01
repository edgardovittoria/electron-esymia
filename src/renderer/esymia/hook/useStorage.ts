import { DynamoFolder, DynamoProject } from '../model/DynamoModels';
import { constructFolderStructure } from '../faunadb/apiAuxiliaryFunctions';
import { selectFolder, setProjectsFolderToUser } from '../store/projectSlice';
import { useDispatch, useSelector } from 'react-redux';
import { usersStateSelector } from '../../cad_library';
import { useDynamoDBQuery } from '../../dynamoDB/hook/useDynamoDBQuery';
import { getFolderByUserEmailDynamoDB, getSimulationProjectsByUserEmailDynamoDB } from '../../dynamoDB/projectsFolderApi';
import { convertFromDynamoDBFormat } from '../../dynamoDB/utility/formatDynamoDBData';

export const useStorage = () => {
  const user = useSelector(usersStateSelector);
  const dispatch = useDispatch();
  const { execQuery2 } = useDynamoDBQuery()
  const loadProjectsOnline = (setLoginSpinner: (v: boolean) => void) => {
    execQuery2(getFolderByUserEmailDynamoDB, user.email, dispatch).then(
      (resFolders) => {
        let folders = resFolders.Items.map((f: any) => ({id: f.id.S, folder: convertFromDynamoDBFormat(f)} as DynamoFolder))
        execQuery2(getSimulationProjectsByUserEmailDynamoDB, user.email, dispatch).then(
          (resProjects) => {
            let projects = resProjects.Items.map((p: any) => ({id: p.id.S, project: convertFromDynamoDBFormat(p)} as DynamoProject))
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
            } as DynamoFolder;
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