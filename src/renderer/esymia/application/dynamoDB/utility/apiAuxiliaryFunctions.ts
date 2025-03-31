import { Folder, Project, SolverOutput } from "../../../model/esymiaModels";
import { DynamoProject, DynamoProjectDetails, DynamoFolderDetails } from "../../../model/DynamoModels";

export const convertInDynamoProjectThis = (project: Project) => {
  const faunaProject: DynamoProject = {
    id: project.id as string,
    project: {
      id: project.id,
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
    } as DynamoProjectDetails,
  };
  return faunaProject;
};

export const convertInDynamoFolderDetailsThis = (
  folder: Folder,
): DynamoFolderDetails => {
  const faunaFolder = {
    ...folder,
    subFolders: folder.subFolders.map((sf) => sf.id as string),
    projectList: folder.projectList.map((p) => p.id as string),
  } as DynamoFolderDetails;
  return faunaFolder;
};