import faunadb from 'faunadb';
import { Folder, Project } from '../model/esymiaModels';
import {
  FaunaFolder,
  FaunaFolderDetails,
  FaunaProject,
  FaunaProjectDetails,
  FaunaUserSessionInfo,
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

/* export const execQueryCustom = async (queryFunction: (faunaClient: faunadb.Client, faunaQuery: typeof faunadb.query, ...params: any) => Promise<any>, token: string, ...queryParams: any) => {
  try {
    const faunaClient = new faunadb.Client({ secret: token })
    const faunaQuery = faunadb.query
    return queryFunction(faunaClient, faunaQuery, ...queryParams)
  } catch (e) {
    console.log(e)
    return null
  }
} */
export const getFoldersByOwner = async (
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  owner: string,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery.Select(
        'data',
        faunaQuery.Map(
          faunaQuery.Paginate(
            faunaQuery.Match(faunaQuery.Index('folders_by_owner'), owner),
          ),
          faunaQuery.Lambda('folder', {
            id: faunaQuery.Select(
              ['ref', 'id'],
              faunaQuery.Get(faunaQuery.Var('folder')),
            ),
            folder: faunaQuery.Select(
              ['data'],
              faunaQuery.Get(faunaQuery.Var('folder')),
            ),
          }),
        ),
      ),
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
  return response as FaunaFolder[];
};

export const getFoldersByOwnerUsername = async (
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  owner: string,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery.Select(
        'data',
        faunaQuery.Map(
          faunaQuery.Paginate(
            faunaQuery.Match(
              faunaQuery.Index('folders_by_owner_username'),
              owner,
            ),
          ),
          faunaQuery.Lambda('folder', {
            id: faunaQuery.Select(
              ['ref', 'id'],
              faunaQuery.Get(faunaQuery.Var('folder')),
            ),
            folder: faunaQuery.Select(
              ['data'],
              faunaQuery.Get(faunaQuery.Var('folder')),
            ),
          }),
        ),
      ),
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
  return response as FaunaFolder[];
};

export const getSimulationProjectsByOwner = async (
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  owner: string,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery.Select(
        'data',
        faunaQuery.Map(
          faunaQuery.Paginate(
            faunaQuery.Match(
              faunaQuery.Index('simulationProjects_by_owner'),
              owner,
            ),
          ),
          faunaQuery.Lambda('project', {
            id: faunaQuery.Select(
              ['ref', 'id'],
              faunaQuery.Get(faunaQuery.Var('project')),
            ),
            project: faunaQuery.Select(
              ['data'],
              faunaQuery.Get(faunaQuery.Var('project')),
            ),
          }),
        ),
      ),
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
  return response as FaunaProject[];
};

export const createFolderInFauna = async (
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  folderToSave: Folder,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery.Create(faunaQuery.Collection('Folders'), {
        data: {
          ...folderToSave,
          projectList: [],
          subFolders: [],
        } as FaunaFolderDetails,
      }),
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

export const deleteFolderFromFauna = async (
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  folderToDelete: string,
  oldParent: string,
  dispatch: Dispatch
) => {
  faunaClient
    .query(faunaQuery.Call('get_all_subfolders_of_folder', folderToDelete))
    .then((subFolders) => {
      faunaClient
        .query(
          faunaQuery.Call(
            'get_all_projects_recursively_of_folder',
            folderToDelete,
          ),
        )
        .then((projects) => {
          faunaClient.query(
            faunaQuery.Delete(
              faunaQuery.Ref(faunaQuery.Collection('Folders'), folderToDelete),
            ),
          );
          (subFolders as string[]).forEach((sb) =>
            faunaClient.query(
              faunaQuery.Delete(
                faunaQuery.Ref(faunaQuery.Collection('Folders'), sb),
              ),
            ),
          );
          (projects as string[]).forEach((p) =>
            faunaClient.query(
              faunaQuery.Delete(
                faunaQuery.Ref(faunaQuery.Collection('SimulationProjects'), p),
              ),
            ),
          );
          oldParent !== 'root' &&
            faunaClient.query(
              faunaQuery.Call(
                'remove_subfolder_from_folder',
                folderToDelete,
                oldParent,
              ),
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
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  folderFaunaID: string,
  selectedFolder: Folder,
  dispatch: Dispatch,
) => {
  const folder = convertInFaunaFolderDetailsThis(selectedFolder);
  const response = await faunaClient
    .query(
      faunaQuery.Update(
        faunaQuery.Ref(
          faunaQuery.Collection('Folders'),
          selectedFolder.faunaDocumentId,
        ),
        {
          data: {
            ...folder,
            subFolders: [...folder.subFolders, folderFaunaID],
          },
        },
      ),
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
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  folderFaunaID: string,
  selectedFolder: Folder,
  dispatch: Dispatch,
) => {
  const folder = convertInFaunaFolderDetailsThis(selectedFolder);
  const response = await faunaClient
    .query(
      faunaQuery.Update(
        faunaQuery.Ref(
          faunaQuery.Collection('Folders'),
          selectedFolder.faunaDocumentId,
        ),
        {
          data: {
            ...folder,
            subFolders: [
              ...folder.subFolders.filter((id) => id !== folderFaunaID),
            ],
          },
        },
      ),
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
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  projectToDelete: string,
  parentFolder: string,
  dispatch: Dispatch,
) => {
  faunaClient
    .query(
      faunaQuery.Delete(
        faunaQuery.Ref(
          faunaQuery.Collection('SimulationProjects'),
          projectToDelete,
        ),
      ),
    )
    .then(() => {
      parentFolder !== 'root' &&
        faunaClient.query(
          faunaQuery.Call(
            'remove_project_from_folder',
            projectToDelete,
            parentFolder,
          ),
        );
    });
};

export const removeIDInFolderProjectsList = async (
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  projectFaunaID: string,
  selectedFolder: Folder,
  dispatch: Dispatch,
) => {
  const folder = convertInFaunaFolderDetailsThis(selectedFolder);
  const response = await faunaClient
    .query(
      faunaQuery.Update(
        faunaQuery.Ref(
          faunaQuery.Collection('Folders'),
          selectedFolder.faunaDocumentId,
        ),
        {
          data: {
            ...folder,
            projectList: [
              ...folder.projectList.filter((id) => id !== projectFaunaID),
            ],
          },
        },
      ),
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
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  projectToSave: Project,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery.Create(faunaQuery.Collection('SimulationProjects'), {
        data: { ...projectToSave } as FaunaProjectDetails,
      }),
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

export const addIDInFolderProjectsList = async (
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  projectFaunaID: string,
  selectedFolder: Folder,
  dispatch: Dispatch,
) => {
  const folder = convertInFaunaFolderDetailsThis(selectedFolder);
  const response = await faunaClient
    .query(
      faunaQuery.Update(
        faunaQuery.Ref(
          faunaQuery.Collection('Folders'),
          selectedFolder.faunaDocumentId,
        ),
        {
          data: {
            ...folder,
            projectList: [...folder.projectList, projectFaunaID],
          },
        },
      ),
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
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  projectToUpdate: FaunaProject,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery.Update(
        faunaQuery.Ref(
          faunaQuery.Collection('SimulationProjects'),
          projectToUpdate.id,
        ),
        {
          data: projectToUpdate.project,
        },
      ),
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
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  folderToUpdate: Folder,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery.Update(
        faunaQuery.Ref(
          faunaQuery.Collection('Folders'),
          folderToUpdate.faunaDocumentId,
        ),
        {
          data: convertInFaunaFolderDetailsThis(folderToUpdate),
        },
      ),
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
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  folderToMove: Folder,
  oldParent: string,
  dispatch: Dispatch
) => {
  faunaClient
    .query(
      faunaQuery.Update(
        faunaQuery.Ref(
          faunaQuery.Collection('Folders'),
          folderToMove.faunaDocumentId,
        ),
        {
          data: convertInFaunaFolderDetailsThis(folderToMove),
        },
      ),
    )
    .then(() => {
      oldParent !== 'root' &&
        faunaClient.query(
          faunaQuery.Call(
            'remove_subfolder_from_folder',
            folderToMove.faunaDocumentId as string,
            oldParent,
          ),
        );
      folderToMove.parent !== 'root' &&
        faunaClient.query(
          faunaQuery.Call(
            'add_subfolder_to_folder',
            folderToMove.faunaDocumentId as string,
            folderToMove.parent,
          ),
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
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  projectToUpdate: Project,
  oldParent: string,
  dispatch: Dispatch
) => {
  faunaClient
    .query(
      faunaQuery.Update(
        faunaQuery.Ref(
          faunaQuery.Collection('SimulationProjects'),
          projectToUpdate.faunaDocumentId,
        ),
        {
          data: {
            ...projectToUpdate,
          } as FaunaProjectDetails,
        },
      ),
    )
    .then(() => {
      oldParent !== 'root' &&
        faunaClient.query(
          faunaQuery.Call(
            'remove_project_from_folder',
            projectToUpdate.faunaDocumentId as string,
            oldParent,
          ),
        );
      projectToUpdate.parentFolder !== 'root' &&
        faunaClient.query(
          faunaQuery.Call(
            'add_project_to_folder',
            projectToUpdate.faunaDocumentId as string,
            projectToUpdate.parentFolder,
          ),
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
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  user: string,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery.Select(
        'data',
        faunaQuery.Map(
          faunaQuery.Paginate(
            faunaQuery.Match(
              faunaQuery.Index('get_shared_projects_by_user_email'),
              user,
            ),
          ),
          faunaQuery.Lambda('project', {
            id: faunaQuery.Select(
              ['ref', 'id'],
              faunaQuery.Get(faunaQuery.Var('project')),
            ),
            project: faunaQuery.Select(
              ['data'],
              faunaQuery.Get(faunaQuery.Var('project')),
            ),
          }),
        ),
      ),
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
  return response as FaunaProject[];
};

export const getSharedFolders = async (
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  user: string,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery.Select(
        'data',
        faunaQuery.Map(
          faunaQuery.Paginate(
            faunaQuery.Match(
              faunaQuery.Index('get_shared_folders_by_user_email'),
              user,
            ),
          ),
          faunaQuery.Lambda('folder', {
            id: faunaQuery.Select(
              ['ref', 'id'],
              faunaQuery.Get(faunaQuery.Var('folder')),
            ),
            folder: faunaQuery.Select(
              ['data'],
              faunaQuery.Get(faunaQuery.Var('folder')),
            ),
          }),
        ),
      ),
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
  return response as FaunaFolder[];
};

export const recursiveUpdateSharingInfoFolderInFauna = async (
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
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
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  user: string,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery.Select(
        'data',
        faunaQuery.Map(
          faunaQuery.Paginate(
            faunaQuery.Match(
              faunaQuery.Index('get_user_session_info_by_email'),
              user,
            ),
          ),
          faunaQuery.Lambda('userSessionInfo', {
            id: faunaQuery.Select(
              ['ref', 'id'],
              faunaQuery.Get(faunaQuery.Var('userSessionInfo')),
            ),
            userSessionInfo: faunaQuery.Select(
              ['data'],
              faunaQuery.Get(faunaQuery.Var('userSessionInfo')),
            ),
          }),
        ),
      ),
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
  return response as FaunaProject[];
};

export const updateUserSessionInfo = async (
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  userSessionInfo: FaunaUserSessionInfo,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery.Update(
        faunaQuery.Ref(
          faunaQuery.Collection('UserSessionManagement'),
          userSessionInfo.id,
        ),
        {
          data: userSessionInfo.userSessionInfo,
        },
      ),
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
  faunaClient: faunadb.Client,
  faunaQuery: typeof faunadb.query,
  userSessionInfo: UserSessionInfo,
  dispatch: Dispatch,
) => {
  const response = await faunaClient
    .query(
      faunaQuery.Create(faunaQuery.Collection('UserSessionManagement'), {
        data: userSessionInfo,
      }),
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
