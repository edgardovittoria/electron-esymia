import { Folder, Project } from '../model/esymiaModels';
import {
  FaunaFolder,
  FaunaFolderDetails,
  FaunaProjectDetails,
  UserSessionInfo,
} from '../model/FaunaModels';
import {
  recursiveFindFolders,
  takeAllProjectsIn,
} from '../store/auxiliaryFunctions/managementProjectsAndFoldersFunction';
import {
  convertInFaunaFolderDetailsThis,
  convertInFaunaProjectThis,
} from './apiAuxiliaryFunctions';
import {
  setIsAlertInfoModal,
  setMessageInfoModal,
  setShowInfoModal,
} from '../store/tabsAndMenuItemsSlice';
import { Dispatch } from '@reduxjs/toolkit';
import { Client, fql, QuerySuccess } from 'fauna';
import { FaunaProject, FaunaUserSessionInfo } from '../model/FaunaModels';


export const getFoldersByOwner = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  owner: string,
  dispatch: Dispatch,
) => {
  const query = faunaQuery`Folders.folders_by_owner(${owner}).pageSize(1000)`;
  const response = await faunaClient.query(query).catch((err) => {
    dispatch(
      setMessageInfoModal(
        'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
      ),
    );
    dispatch(setIsAlertInfoModal(false));
    dispatch(setShowInfoModal(true));
  });
  let res:FaunaFolder[] = ((response as QuerySuccess<any>).data.data as any[]).map((item:any) => {return {id: item.id, folder: {...item} as FaunaFolderDetails}})
  return res
};

export const getSimulationProjectsByOwner = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  owner: string,
  dispatch: Dispatch,
) => {
  const query = faunaQuery`SimulationProjects.simulationProjects_by_owner(${owner}).pageSize(1000)`
  const response = await faunaClient.query(query)
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
    let res:FaunaProject[] = ((response as QuerySuccess<any>).data.data as any[]).map((item:any) => {return {id: item.id, project: {...item} as FaunaProjectDetails}})
  return res;
};

export const createFolderInFauna = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  folderToSave: Folder,
  dispatch: Dispatch,
) => {
  const query = faunaQuery`Folders.create(${{
    ...folderToSave,
    projectList: [],
    subFolders: [],
  } as FaunaFolderDetails})`
  const response = await faunaClient.query(query)
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
  return (response as QuerySuccess<any>).data;
};

export const deleteFolderFromFauna = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  folderToDelete: string,
  oldParent: string,
  dispatch: Dispatch,
) => {
  faunaClient
    .query(faunaQuery`get_all_subfolders_of_folder(${folderToDelete})`)
    .then((subFolders) => {
      faunaClient
        .query(
          faunaQuery`get_all_projects_recursively_of_folder(${folderToDelete})`
        )
        .then((projects) => {
          faunaClient.query(
            faunaQuery`Folders.byId(${folderToDelete})!.delete()`
          );
          ((subFolders as QuerySuccess<any>).data.data as string[]).forEach((sb) =>
            faunaClient.query(
              faunaQuery`Folders.byId(${sb})!.delete()`
            ),
          );
          ((projects as QuerySuccess<any>).data.data as string[]).forEach((p) =>
            faunaClient.query(
              faunaQuery`SimulationProjects.byId(${p})!.delete()`
            ),
          );
          oldParent !== 'root' &&
            faunaClient.query(
              faunaQuery`remove_subfolders_from_folder(${folderToDelete}, ${oldParent})`
            );
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
    });
};

export const addIDInSubFoldersList = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  folderFaunaID: string,
  selectedFolder: Folder,
  dispatch: Dispatch,
) => {
  const folder = convertInFaunaFolderDetailsThis(selectedFolder);
  const response = await faunaClient
    .query(
      faunaQuery`Folders.byId(${selectedFolder.faunaDocumentId as string})!.update(${{subFolders: [...folder.subFolders, folderFaunaID]}})`
    )
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
  return response;
};

export const removeIDInSubFoldersList = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  folderFaunaID: string,
  selectedFolder: Folder,
  dispatch: Dispatch,
) => {
  const folder = convertInFaunaFolderDetailsThis(selectedFolder);
  const response = await faunaClient
    .query(
      faunaQuery`Folders.byId(${selectedFolder.faunaDocumentId as string})!.update(${{subFolders: [
        ...folder.subFolders.filter((id) => id !== folderFaunaID),
      ]}})`
    )
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
  return response;
};

export const deleteSimulationProjectFromFauna = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  projectToDelete: string,
  parentFolder: string,
  dispatch: Dispatch,
) => {
  faunaClient
    .query(
      faunaQuery`SimulationProjects.byId(${projectToDelete})!.delete()`
    )
    .then(() => {
      parentFolder !== 'root' &&
        faunaClient.query(
          faunaQuery`remove_project_from_folder(${projectToDelete}, ${parentFolder})`
        );
    });
};

export const removeIDInFolderProjectsList = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  projectFaunaID: string,
  selectedFolder: Folder,
  dispatch: Dispatch,
) => {
  const folder = convertInFaunaFolderDetailsThis(selectedFolder);
  const response = await faunaClient
    .query(
      faunaQuery`Folders.byId(${selectedFolder.faunaDocumentId as string})!.update(${{projectList: [
        ...folder.projectList.filter((id) => id !== projectFaunaID)
      ]}})`
    )
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
  return response;
};

export const createSimulationProjectInFauna = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  projectToSave: Project,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery`SimulationProjects.create(${{...projectToSave as FaunaProjectDetails}})`
    )
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
  return (response as QuerySuccess<any>).data;
};

export const addIDInFolderProjectsList = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  projectFaunaID: string,
  selectedFolder: Folder,
  dispatch: Dispatch,
) => {
  const folder = convertInFaunaFolderDetailsThis(selectedFolder);
  const response = await faunaClient
    .query(
      faunaQuery`Folders.byId(${selectedFolder.faunaDocumentId as string})!.update(${{projectList: [...folder.projectList, projectFaunaID]}})`
    )
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
  return response;
};

export const updateProjectInFauna = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  projectToUpdate: FaunaProject,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery`SimulationProjects.byId(${projectToUpdate.id})!.update(${projectToUpdate.project})`
    )
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
  return response;
};

export const updateFolderInFauna = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  folderToUpdate: Folder,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery`Folders.byId(${folderToUpdate.faunaDocumentId as string})!.update(${convertInFaunaFolderDetailsThis(folderToUpdate)})`
    )
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
  return response;
};

export const moveFolderInFauna = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  folderToMove: Folder,
  oldParent: string,
  dispatch: Dispatch,
) => {
  faunaClient
    .query(
      faunaQuery`Folders.byId(${folderToMove.faunaDocumentId as string})!.update(${convertInFaunaFolderDetailsThis(folderToMove)})`
    )
    .then(() => {
      oldParent !== 'root' &&
        faunaClient.query(
          faunaQuery`remove_subfolders_from_folder(${folderToMove.faunaDocumentId as string}, ${oldParent})`
        );
      folderToMove.parent !== 'root' &&
        faunaClient.query(
          faunaQuery`add_subfolder_to_folder(${folderToMove.faunaDocumentId as string}, ${folderToMove.parent})`
        );
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

export const moveProjectInFauna = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  projectToUpdate: Project,
  oldParent: string,
  dispatch: Dispatch,
) => {
  faunaClient
    .query(
      faunaQuery`SimulationProjects.byId(${projectToUpdate.faunaDocumentId as string})!.update(${{
        ...projectToUpdate,
      } as FaunaProjectDetails})`
    )
    .then(() => {
      oldParent !== 'root' &&
        faunaClient.query(
          faunaQuery`remove_project_from_folder(${projectToUpdate.faunaDocumentId as string}, ${oldParent})`
        );
      projectToUpdate.parentFolder !== 'root' &&
        faunaClient.query(
          faunaQuery`add_project_to_folder(${projectToUpdate.faunaDocumentId as string}, ${projectToUpdate.parentFolder})`
        );
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

export const getSharedSimulationProjects = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  user: string,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery`get_shared_simulation_projects_by_email(${user})`
    )
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
    let res:FaunaProject[] = ((response as QuerySuccess<any>).data.data as any[]).map((item:any) => {return {id: item.id, project: {...item} as FaunaProjectDetails}})
  return res
};

export const getSharedFolders = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  user: string,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery`Folders.get_shared_folders_by_user_email(${user})`
    )
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
    let res:FaunaFolder[] = ((response as QuerySuccess<any>).data.data as any[]).map((item:any) => {return {id: item.id, folder: {...item} as FaunaFolderDetails}})
  return res;
};

export const recursiveUpdateSharingInfoFolderInFauna = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  folderToUpdate: Folder,
  dispatch: Dispatch,
) => {
  const allFolders = recursiveFindFolders(folderToUpdate, []);
  allFolders.forEach((f) =>
    updateFolderInFauna(faunaClient, faunaQuery, f, dispatch),
  );
  const allProjects = takeAllProjectsIn(folderToUpdate);
  allProjects.forEach((p) =>
    updateProjectInFauna(
      faunaClient,
      faunaQuery,
      convertInFaunaProjectThis(p),
      dispatch,
    ),
  );
};

export const getUserSessionInfo = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  user: string,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery`UserSessionManagement.get_user_session_info_by_email(${user})`
    )
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
    let res:FaunaUserSessionInfo[] = ((response as QuerySuccess<any>).data.data as any[]).map((item: any) => {return {id: item.id, userSessionInfo: {...item} as UserSessionInfo}})
  return res;
};

export const updateUserSessionInfo = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  userSessionInfo: FaunaUserSessionInfo,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery`UserSessionManagement.byId(${userSessionInfo.id})!.update(${userSessionInfo.userSessionInfo})`
    )
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
  return response;
};

export const createUserSessionInfo = async (
  faunaClient: Client,
  faunaQuery: typeof fql,
  userSessionInfo: UserSessionInfo,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery`UserSessionManagement.create(${userSessionInfo})`
    )
    .catch((err) => {
      dispatch(
        setMessageInfoModal(
          'Connection Error!!! Make sure your internet connection is active and try log out and log in. Any unsaved data will be lost.',
        ),
      );
      dispatch(setIsAlertInfoModal(false));
      dispatch(setShowInfoModal(true));
    });
  return response;
};
