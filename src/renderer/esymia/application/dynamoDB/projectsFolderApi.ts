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
  takeAllProjectsInArrayOf,
} from '../../store/auxiliaryFunctions/managementProjectsAndFoldersFunction';
import {
  convertInDynamoFolderDetailsThis,
  convertInDynamoProjectThis,
} from './utility/apiAuxiliaryFunctions';

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
    Item: convertToDynamoDBFormat(
      convertInDynamoProjectThis(projectToSave).project,
    ),
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
  selectedFolder: Folder,
  dispatch: Dispatch,
) => {
  let params: DeleteItemInput = {
    TableName: 'SimulationProjects',
    Key: { id: { S: projectToDelete } },
  };
  if (parentFolder !== 'root') {
    let folder: Folder = {
      ...selectedFolder,
      projectList: selectedFolder.projectList.filter(
        (p) => p.id !== projectToDelete,
      ),
    };
    createOrUpdateFolderInDynamoDB(folder, dispatch);
  }
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
};

export const createOrUpdateFolderInDynamoDB = async (
  folderToSave: Folder,
  dispatch: Dispatch,
) => {
  console.log("pippo")
  let params: PutItemInput = {
    TableName: 'Folders',
    Item: convertToDynamoDBFormat(
      convertInDynamoFolderDetailsThis(folderToSave),
    ),
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

export const moveProjectInDynamoDB = async (
  projectToUpdate: Project,
  selectedFolder: Folder,
  targetFolder: Folder,
  dispatch: Dispatch,
) => {
  return await createOrUpdateProjectInDynamoDB(projectToUpdate, dispatch)
    .then(() => {
      if (selectedFolder.id !== 'root') {
        let folder: Folder = {
          ...selectedFolder,
          projectList: selectedFolder.projectList.filter(
            (p) => p.id !== projectToUpdate.id,
          ),
        };
        createOrUpdateFolderInDynamoDB(folder, dispatch);
      }
      if (projectToUpdate.parentFolder !== 'root') {
        let newFolder: Folder = {
          ...targetFolder,
          projectList: [...targetFolder.projectList, projectToUpdate],
        };
        createOrUpdateFolderInDynamoDB(newFolder, dispatch);
      }
    })
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

export const moveFolderInDynamoDB = async (
  folderToMove: Folder,
  selectedFolder: Folder,
  targetFolder: Folder,
  dispatch: Dispatch,
) => {
  return await createOrUpdateFolderInDynamoDB(folderToMove, dispatch)
    .then(() => {
      if (selectedFolder.id !== 'root') {
        let folder: Folder = {
          ...selectedFolder,
          subFolders: selectedFolder.subFolders.filter(
            (sb) => sb.id !== folderToMove.id,
          ),
        };
        createOrUpdateFolderInDynamoDB(folder, dispatch);
      }
      if (folderToMove.parent !== 'root') {
        let newFolder: Folder = {
          ...targetFolder,
          subFolders: [...targetFolder.subFolders, folderToMove],
        };
        createOrUpdateFolderInDynamoDB(newFolder, dispatch);
      }
    })
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

export const deleteFolderFromDynamoDB = async (
  folderToDelete: Folder,
  selectedFolder: Folder,
  dispatch: Dispatch,
) => {
  recursiveFindFolders(folderToDelete, []).forEach((f) => {
    f.projectList.forEach((p) => {
      let params: DeleteItemInput = {
        TableName: 'SimulationProjects',
        Key: { id: { S: p.id } },
      };
      dynamoDB.deleteItem(params).promise().then(() => {
        console.log("deleted project : ", p.id)
      });
    });
  });
  recursiveFindFolders(folderToDelete, []).forEach((f) => {
    let params: DeleteItemInput = {
      TableName: 'Folders',
      Key: { id: { S: f.id } },
    };
    dynamoDB.deleteItem(params).promise().then(() => {
      console.log("deleted folder : ", f.id)
    });
  })
  if (selectedFolder.id !== 'root') {
    let folder: Folder = {
      ...selectedFolder,
      subFolders: selectedFolder.subFolders.filter(
        (sb) => sb.id !== folderToDelete.id,
      ),
    };
    console.log(folder)
    return await createOrUpdateFolderInDynamoDB(folder, dispatch).catch(
      (err) => {
        dispatch(
          setMessageInfoModal(
            'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
          ),
        );
        dispatch(setIsAlertInfoModal(false));
        dispatch(setShowInfoModal(true));
      },
    );
  }
};
