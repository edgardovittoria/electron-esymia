import {
  DeleteItemInput,
  PutItemInput,
  ScanInput,
} from 'aws-sdk/clients/dynamodb';
import { dynamoDB } from '../../aws/s3Config';
import { Folder, Project } from '../../model/esymiaModels';
import { convertToDynamoDBFormat } from './utility/formatDynamoDBData';
import { Dispatch } from '@reduxjs/toolkit';
import {
  setMessageInfoModal,
  setIsAlertInfoModal,
  setShowInfoModal,
} from '../../store/tabsAndMenuItemsSlice';
import {
  recursiveFindFolders,
  takeAllProjectsIn,
} from '../../store/auxiliaryFunctions/managementProjectsAndFoldersFunction';

export const getItemDynamoDB = async (params: any) => {
  return await dynamoDB.getItem(params).promise();
};

export const putItemDynamoDB = async (params: any) => {
  return await dynamoDB.putItem(params).promise();
};

export const getFolderByUserEmail = async (
  email: string,
  dispatch: Dispatch,
) => {
  let params: ScanInput = {
    TableName: 'Folders',
    FilterExpression: '#owner.email = :email',
    ExpressionAttributeValues: {
      ':email': { S: email },
    },
    ExpressionAttributeNames: {
      '#owner': 'owner',
    },
  };
  return await dynamoDB
    .scan(params)
    .promise()
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
};

export const getSimulationProjectsByUserEmail = async (
  email: string,
  dispatch: Dispatch,
) => {
  let params: ScanInput = {
    TableName: 'SimulationProjects',
    FilterExpression: '#owner.email = :email',
    ExpressionAttributeValues: {
      ':email': { S: email },
    },
    ExpressionAttributeNames: {
      '#owner': 'owner',
    },
  };
  return await dynamoDB
    .scan(params)
    .promise()
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
};

export const createOrUpdateProjectInDynamoDB = async (
  projectToSave: Project,
  dispatch: Dispatch,
) => {
  let params: PutItemInput = {
    TableName: 'SimulationProjects',
    Item: convertToDynamoDBFormat(projectToSave),
  };
  return await dynamoDB
    .putItem(params)
    .promise()
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
};

export const deleteSimulationProjectFromDynamoDB = async (
  projectToDelete: string,
  parentFolder: string,
  dispatch: Dispatch,
) => {
  let params: DeleteItemInput = {
    TableName: 'SimulationProjects',
    Key: {"id": {S: projectToDelete}},
  };
  return await dynamoDB
    .deleteItem(params)
    .promise()
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
    //TODO:inserire cancellazione ricorsiva
  //   faunaClient
  //     .query(
  //       faunaQuery`SimulationProjects.byId(${projectToDelete})!.delete()`
  //     )
  //     .then(() => {
  //       parentFolder !== 'root' &&
  //         faunaClient.query(
  //           faunaQuery`remove_project_from_folder(${projectToDelete}, ${parentFolder})`
  //         );
  //     });
};

export const createOrUpdateFolderInDynamoDB = async (
  folderToSave: Folder,
  dispatch: Dispatch,
) => {
  let params: PutItemInput = {
    TableName: 'Folders',
    Item: convertToDynamoDBFormat(folderToSave),
  };
  return await dynamoDB
    .putItem(params)
    .promise()
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
};

export const addIDInSubFoldersListInDynamoDB = async (
  id: string,
  selectedFolder: Folder,
  dispatch: Dispatch,
) => {
  let params: PutItemInput = {
    TableName: 'Folders',
    Item: convertToDynamoDBFormat({
      ...selectedFolder,
      subFolders: [...selectedFolder.subFolders, id],
    } as Folder),
  };
  return await dynamoDB
    .putItem(params)
    .promise()
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
};

export const addIDInProjectListInDynamoDB = async (
  id: string,
  selectedFolder: Folder,
  dispatch: Dispatch,
) => {
  let params: PutItemInput = {
    TableName: 'Folders',
    Item: convertToDynamoDBFormat({
      ...selectedFolder,
      projectList: [...selectedFolder.projectList, id],
    } as Folder),
  };
  return await dynamoDB
    .putItem(params)
    .promise()
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
};

export const recursiveUpdateSharingInfoFolderInDynamoDB = async (
  folderToUpdate: Folder,
  dispatch: Dispatch,
) => {
  const allFolders = recursiveFindFolders(folderToUpdate, []);
  allFolders.forEach((f) => createOrUpdateFolderInDynamoDB(f, dispatch));
  const allProjects = takeAllProjectsIn(folderToUpdate);
  allProjects.forEach((p) => createOrUpdateProjectInDynamoDB(p, dispatch));
};
