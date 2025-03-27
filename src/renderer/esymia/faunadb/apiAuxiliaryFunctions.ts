import { CanvasState } from '../../cad_library';
import { Folder, Project, sharingInfoUser, SolverOutput } from '../model/esymiaModels';
import {
  FaunaFolder,
  FaunaFolderDetails,
  FaunaProject,
  FaunaProjectDetails,
} from '../model/FaunaModels';

export const constructFolderStructure = (
  folderID: string,
  all_folders: FaunaFolder[],
  all_projects: FaunaProject[],
) => {
  const rootFaunaFolder = all_folders.filter(
    (faunaFolder) => faunaFolder.id === folderID,
  )[0];
  const remainingFolders = all_folders.filter(
    (faunaFolder) => faunaFolder.id !== folderID,
  );
  const rootFaunaProjects = all_projects.filter((fp) =>
    rootFaunaFolder.folder.projectList.includes(fp.id),
  );
  const remainingFaunaProjects = all_projects.filter(
    (fp) => !faunaProjectInList(fp, rootFaunaProjects),
  );
  const rootProjects = rootFaunaProjects.map((p) => convertInProjectThis(p));
  const root = {
    ...rootFaunaFolder.folder,
    id: rootFaunaFolder.id,
    subFolders:
      rootFaunaFolder.folder.subFolders.length > 0
        ? rootFaunaFolder.folder.subFolders.map((sf) =>
            constructFolderStructure(
              sf,
              remainingFolders,
              remainingFaunaProjects,
            ),
          )
        : [],
    projectList: rootProjects,
  } as Folder;
  return root;
};

export const faunaProjectInList = (
  project: FaunaProject,
  projectsList: FaunaProject[],
) => {
  return projectsList.filter((p) => p.id === project.id).length > 0;
};

export const faunaFolderInList = (
  folder: FaunaFolder,
  folderList: FaunaFolder[],
) => {
  return folderList.filter((f) => f.id === folder.id).length > 0;
};

export const faunaFolderHaveParentInList = (
  folder: FaunaFolder,
  folderList: FaunaFolder[],
) => {
  return folderList.filter((f) => folder.folder.parent === f.id).length > 0;
};

export const faunaProjectHaveParentInFolderList = (
  project: FaunaProject,
  folderList: FaunaFolder[],
) => {
  return (
    folderList.filter((f) => f.id === project.project.parentFolder).length > 0
  );
};

export const convertInProjectThis = (faunaProject: FaunaProject) => {
  const project: Project = {
    ...faunaProject.project,
    ports: [],
    id: faunaProject.id,
    storage: faunaProject.project.storage,
    simulation:
      faunaProject.project.simulation === undefined ||
      faunaProject.project.simulation === null
        ? undefined
        : faunaProject.project.simulation,
    model: {} as CanvasState,
    sharedWith: faunaProject.project.sharedWith as sharingInfoUser[],
  };
  return project;
};

export const convertInFaunaProjectThis = (project: Project) => {
  const faunaProject: FaunaProject = {
    id: project.id as string,
    project: {
      name: project.name,
      description: project.description,
      storage: project.storage,
      model: "",
      modelS3: project.modelS3,
      bricks: project.bricks,
      portsS3: project.portsS3,
      frequencies: project.frequencies,
      simulation: project.simulation === undefined ? null : {
        ...project.simulation,
        results: {} as SolverOutput
      },
      meshData: project.meshData,
      screenshot: project.screenshot,
      owner: project.owner,
      sharedWith: project.sharedWith,
      shared: project.shared,
      parentFolder: project.parentFolder,
      scatteringValue: project.scatteringValue,
      suggestedQuantum: project.suggestedQuantum,
      modelUnit: project.modelUnit,
      planeWaveParameters: project.planeWaveParameters,
      radialFieldParameters: project.radialFieldParameters
    } as FaunaProjectDetails,
  };
  return faunaProject;
};

export const convertInFaunaFolderDetailsThis = (
  folder: Folder,
): FaunaFolderDetails => {
  const faunaFolder = {
    ...folder,
    subFolders: folder.subFolders.map((sf) => sf.id as string),
    projectList: folder.projectList.map((p) => p.id as string),
  } as FaunaFolderDetails;
  return faunaFolder;
};
