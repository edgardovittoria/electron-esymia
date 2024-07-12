import { ComponentEntity, ImportActionParamsObject, Material, UsersState } from 'cad-library';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  recursiveFindFolders, removeFolderFromStore, removeProjectFromStore,
  takeAllProjectsIn,
  takeAllProjectsInArrayOf
} from './auxiliaryFunctions/managementProjectsAndFoldersFunction';
import { addProjectTab, closeProjectTab, selectMenuItem, selectTab } from './tabsAndMenuItemsSlice';
import { deleteFileS3 } from '../aws/mesherAPIs';
import {
  Folder,
  Port,
  Probe,
  Project,
  RLCParams,
  sharingInfoUser,
  Simulation,
  TempLumped
} from '../model/esymiaModels';
import { getMaterialListFrom } from '../application/simulationTabsManagement/tabs/simulator/Simulator';


export type ProjectState = {
  projects: Folder,
  sharedElements: Folder,
  selectedProject: string | undefined,
  selectedFolder: string | undefined,
  homePath: string
}

export const ProjectSlice = createSlice({
  name: 'projects',
  initialState: {
    homePath: '',
    projects: {
      name: 'My Files',
      owner: {} as UsersState,
      sharedWith: [],
      subFolders: [],
      projectList: [],
      parent: 'root'
    },
    sharedElements: {
      name: 'My Shared Elements',
      owner: {} as UsersState,
      sharedWith: [],
      subFolders: [],
      projectList: [],
      parent: 'root'
    },
    selectedProject: undefined,
    selectedFolder: undefined
  } as ProjectState,
  reducers: {
    setHomePat(state: ProjectState, action: PayloadAction<string>){
      state.homePath = action.payload
    },
    addProject(state: ProjectState, action: PayloadAction<Project>) {
      let selectedFolder = folderByID(state, state.selectedFolder);
      selectedFolder?.projectList.push(action.payload);
    },
    setProjectsFolderToUser(state: ProjectState, action: PayloadAction<Folder>) {
      state.projects = action.payload;
    },
    setFolderOfElementsSharedWithUser(state: ProjectState, action: PayloadAction<Folder>) {
      state.sharedElements = action.payload;
    },
    removeProject(state: ProjectState, action: PayloadAction<string>) {
      removeProjectFromStore(state, action.payload);
    },
    moveFolder(state: ProjectState, action: PayloadAction<{
      objectToMove: Folder,
      targetFolder: string
    }>) {
      removeFolderFromStore(state, action.payload.objectToMove);
      let targetF = folderByID(state, action.payload.targetFolder);
      targetF?.subFolders.push({ ...action.payload.objectToMove, parent: targetF.faunaDocumentId } as Folder);
    },
    moveProject(state: ProjectState, action: PayloadAction<{
      objectToMove: Project,
      targetFolder: string
    }>) {
      removeProjectFromStore(state, action.payload.objectToMove.faunaDocumentId as string);
      let targetF = folderByID(state, action.payload.targetFolder);
      targetF?.projectList.push({
        ...action.payload.objectToMove,
        parentFolder: targetF.faunaDocumentId
      } as Project);
    },
    shareProject(state: ProjectState, action: PayloadAction<{ projectToShare: Project, user: sharingInfoUser }>) {
      let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), action.payload.projectToShare.faunaDocumentId);
      (project && project.sharedWith) && project.sharedWith.push(action.payload.user);
    },
    shareFolder(state: ProjectState, action: PayloadAction<{ folderToShare: string, user: sharingInfoUser }>) {
      let folder = folderByID(state, action.payload.folderToShare);
      if (folder) {
        recursiveFindFolders(folder, []).forEach(f => f.sharedWith.push(action.payload.user));
        takeAllProjectsIn(folder).forEach(f => f.sharedWith.push(action.payload.user));
      }
    },
    renameProject(state: ProjectState, action: PayloadAction<{ projectToRename: string, name: string }>) {
      let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), action.payload.projectToRename);
      let selectedFolder = folderByID(state, project?.parentFolder);
      if (project && selectedFolder) {
        project.name = action.payload.name;
        selectedFolder.projectList = selectedFolder.projectList.filter(p => p.faunaDocumentId !== project?.faunaDocumentId);
        selectedFolder.projectList.push(project);
      }
    },
    renameFolder(state: ProjectState, action: PayloadAction<{ folderToRename: Folder, name: string }>) {
      let selectedFolder = folderByID(state, action.payload.folderToRename.faunaDocumentId);
      if (selectedFolder) selectedFolder.name = action.payload.name;
    },
    selectProject(state: ProjectState, action: PayloadAction<string | undefined>) {
      if (action.payload !== undefined) {
        state.selectedProject = action.payload;
      }
    },
    addFolder(state: ProjectState, action: PayloadAction<Folder>) {
      let selectedFolder = folderByID(state, state.selectedFolder);
      selectedFolder?.subFolders.push(action.payload);
    },
    removeFolder(state: ProjectState, action: PayloadAction<Folder>) {
      removeFolderFromStore(state, action.payload);
    },
    selectFolder(state: ProjectState, action: PayloadAction<string>) {
      state.selectedFolder = action.payload;
    },
    importModel(state: ProjectState, action: PayloadAction<ImportActionParamsObject>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject);
      if (selectedProject) {
        selectedProject.model = action.payload.canvas;
      }
    },
    setModel(state: ProjectState, action: PayloadAction<ComponentEntity[]>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject);
      if (selectedProject) {
        selectedProject.model.components = action.payload;
      }
    },
    setModelS3(state: ProjectState, action: PayloadAction<string>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject);
      if (selectedProject) {
        selectedProject.modelS3 = action.payload;
      }
    },
    setModelUnit(state: ProjectState, action: PayloadAction<string>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject);
      if (selectedProject) {
        selectedProject.modelUnit = action.payload;
      }
    },
    updateSimulation(state: ProjectState, action: PayloadAction<Simulation>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), action.payload.associatedProject);
      if (selectedProject) selectedProject.simulation = action.payload;
    },
    deleteSimulation(state: ProjectState, action: PayloadAction<string>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), action.payload);
      if (selectedProject && selectedProject.simulation) selectedProject.simulation = undefined;
    },
    addPorts(state: ProjectState, action: PayloadAction<Port | Probe>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject);
      selectedProject?.ports.push(action.payload);
    },
    selectPort(state: ProjectState, action: PayloadAction<string>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject);
      selectedProject?.ports.forEach(port => {
        port.isSelected = port.name === action.payload;
      });
    },
    deletePort(state: ProjectState, action: PayloadAction<string>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject);
      let updatedPortsArray = selectedProject?.ports.filter(port => port.name !== action.payload);
      if (selectedProject && updatedPortsArray) {
        selectedProject.ports = updatedPortsArray;
      }
    },
    setPortType(state: ProjectState, action: PayloadAction<{ name: string, type: number }>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject);
      selectedProject?.ports.forEach(port => {
        if (port.category === 'lumped') {
          if (port.name === action.payload.name) {
            (port as TempLumped).type = action.payload.type;
          }
        }
      });
    },
    setPortName(state: ProjectState, action: PayloadAction<string>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject);
      selectedProject?.ports.forEach(port => {
        if (port.isSelected) {
          port.name = action.payload;
          port.isSelected = true;
        }
      });
    },
    updatePortPosition(state: ProjectState, action: PayloadAction<{
      type: 'first' | 'last' | 'probe',
      position: [number, number, number]
    }>) {
      let selectedPort = findSelectedPort(findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject));
      if (selectedPort) {
        if (selectedPort.category === 'port' || selectedPort.category === 'lumped') {
          (action.payload.type === 'first') ? selectedPort.inputElement.transformationParams.position = action.payload.position : selectedPort.outputElement.transformationParams.position = action.payload.position;
        } else if (action.payload.type === 'probe') {
          (selectedPort as Probe).groupPosition = action.payload.position;
        }
      }
    },
    setRLCParams(state: ProjectState, action: PayloadAction<RLCParams>) {
      let selectedPort = findSelectedPort(findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject));
      if (selectedPort) {
        if (selectedPort.category === 'lumped') {
          (selectedPort as TempLumped).rlcParams = action.payload;
        }
        if (selectedPort.category === 'lumped') {
          (selectedPort as TempLumped).value = action.payload.resistance as number;
        }
      }
    },
    /* setAssociatedSignal(state: ProjectState, action: PayloadAction<Signal>) {
      let project = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject);
      if (project) project.signal = action.payload;
    }, */
    setScreenshot(state: ProjectState, action: PayloadAction<string>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsIn(state.projects), state.selectedProject);
      if (selectedProject) {
        selectedProject.screenshot = action.payload;
      }
    },
    setMesh(state: ProjectState, action: PayloadAction<{ mesh:string, projectToUpdate: string }>) {
      let project = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), action.payload.projectToUpdate);
      if (project) project.meshData.mesh = action.payload.mesh;
    },
    setExternalGrids(state: ProjectState, action: PayloadAction<{ extGrids:string, projectToUpdate: string }>) {
      let project = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), action.payload.projectToUpdate);
      if (project) project.meshData.externalGrids = action.payload.extGrids;
    },
    setPathToExternalGridsNotFound(state: ProjectState, action: PayloadAction<{ status:boolean, projectToUpdate: string }>){
      let project = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), action.payload.projectToUpdate);
      if (project) project.meshData.pathToExternalGridsNotFound = action.payload.status;
    },
    setMeshGenerated(state: ProjectState, action: PayloadAction<{ status: 'Not Generated' | 'Generated' | 'Generating', projectToUpdate: string }>) {
      let project = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), action.payload.projectToUpdate);
      if (project) project.meshData.meshGenerated = action.payload.status;
    },
    setPreviousMeshStatus(state: ProjectState, action: PayloadAction<{ status: 'Not Generated' | 'Generated' | undefined, projectToUpdate: string }>) {
      let project = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), action.payload.projectToUpdate);
      if (project) project.meshData.previousMeshStatus = action.payload.status;
    },
    setMeshApproved(state: ProjectState, action: PayloadAction<{ approved:boolean, projectToUpdate: string }>) {
      let project = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), action.payload.projectToUpdate);
      if (project) project.meshData.meshApproved = action.payload.approved;
    },
    setQuantum(state: ProjectState, action: PayloadAction<{ quantum: [number, number, number], projectToUpdate: string }>) {
      let project = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), action.payload.projectToUpdate);
      if (project) project.meshData.quantum = action.payload.quantum;
    },
    setBoundingBoxDimension(state: ProjectState, action: PayloadAction<number>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject);
      if (selectedProject) {
        selectedProject.boundingBoxDimension = action.payload;
      }
    },
    setSuggestedQuantum(state: ProjectState, action: PayloadAction<[number, number, number]>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject);
      if (selectedProject) {
        selectedProject.suggestedQuantum = action.payload;
      }
    },
    setScatteringValue(state: ProjectState, action: PayloadAction<number>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject);
      if (selectedProject) {
        selectedProject.scatteringValue = action.payload;
      }
    },
    unsetScatteringValue(state: ProjectState) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject);
      if (selectedProject) {
        selectedProject.scatteringValue = undefined;
      }
    },
    setFrequencies(state: ProjectState, action: PayloadAction<number[]>) {
      let selectedProject = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects, state.sharedElements]), state.selectedProject);
      if (selectedProject) {
        selectedProject.frequencies = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(selectTab, (state, action) => {
        selectTabEffects(state, action.payload);
      })
      .addCase(closeProjectTab, (state) => {
        selectTabEffects(state, 'DASHBOARD');
      })
      .addCase(addProjectTab, (state, action) => {
        selectTabEffects(state, action.payload.faunaDocumentId as string);
      })
      .addCase(selectMenuItem, (state, action) => {
        if (action.payload === 'Projects') {
          state.selectedFolder = state.projects.faunaDocumentId;
        }
      });
  }
});


export const {
  //qui vanno inserite tutte le azioni che vogliamo esporatare
  setHomePat,
  addProject,
  removeProject,
  importModel,
  selectProject,
  updateSimulation,
  addPorts,
  selectPort,
  deletePort,
  setPortType,
  updatePortPosition,
  setRLCParams,
  setScreenshot,
  addFolder,
  selectFolder,
  setProjectsFolderToUser,
  removeFolder,
  shareProject,
  renameProject,
  moveFolder,
  moveProject,
  deleteSimulation,
  renameFolder,
  shareFolder,
  setMesh,
  setMeshGenerated,
  setPreviousMeshStatus,
  setMeshApproved,
  setQuantum,
  setFolderOfElementsSharedWithUser,
  setExternalGrids,
  setModel,
  setModelS3,
  setModelUnit,
  setPortName,
  setBoundingBoxDimension,
  setSuggestedQuantum,
  setScatteringValue,
  unsetScatteringValue,
  setFrequencies,
  setPathToExternalGridsNotFound
} = ProjectSlice.actions;

const selectTabEffects = (state: ProjectState, tab: string) => {
  if (tab === 'DASHBOARD') {
    state.selectedProject = undefined;
  } else {
    state.selectedProject = tab;
  }
};

export const homePathSelector = (state: { projects: ProjectState }) => state.projects.homePath;
export const projectsSelector = (state: { projects: ProjectState }) => takeAllProjectsIn(state.projects.projects);
export const sharedProjectsSelector = (state: {
  projects: ProjectState
}) => takeAllProjectsIn(state.projects.sharedElements);
export const mainFolderSelector = (state: { projects: ProjectState }) => state.projects.projects;
export const sharedElementsFolderSelector = (state: { projects: ProjectState }) => state.projects.sharedElements;
export const SelectedFolderSelector = (state: {
  projects: ProjectState
}) => folderByID(state.projects, state.projects.selectedFolder);
export const selectedProjectSelector = (state: { projects: ProjectState }) => {
  let project = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects.projects, state.projects.sharedElements]), state.projects.selectedProject);
  return project;
};

export const meshGeneratedSelector = (state: {
  projects: ProjectState
}) => (findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects.projects, state.projects.sharedElements]), state.projects.selectedProject) as Project).meshData.meshGenerated;
export const pathToExternalGridsNotFoundSelector = (state: {
  projects: ProjectState
}) => (findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects.projects, state.projects.sharedElements]), state.projects.selectedProject) as Project).meshData.pathToExternalGridsNotFound;
export const allProjectFoldersSelector = (state: { projects: ProjectState }) => {
  let allFolders: Folder[] = [];
  return recursiveFindFolders(state.projects.projects, allFolders);
};
export const findProjectByFaunaID = (projects: Project[], faunaDocumentId: string | undefined) => {
  return (faunaDocumentId !== undefined) ? projects.filter(project => project.faunaDocumentId === faunaDocumentId)[0] : undefined;
};
export const findSelectedPort = (project: Project | undefined) => (project) ? project.ports.filter(port => port.isSelected)[0] : undefined;
export const boundingBoxDimensionSelector = (state: { projects: ProjectState }) => {
  let project = findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects.projects, state.projects.sharedElements]), state.projects.selectedProject);
  return project?.boundingBoxDimension;
};
export const folderByID = (state: ProjectState, folderID: string | undefined) => {
  if (folderID) {
    let folders = recursiveFindFolders(state.projects, [] as Folder[]).filter(f => f.faunaDocumentId === folderID);
    if (folders.length > 0) return folders[0];
    folders = recursiveFindFolders(state.sharedElements, [] as Folder[]).filter(f => f.faunaDocumentId === folderID);
    if (folders.length > 0) return folders[0];
  }
  return undefined;
};

export const activeSimulationsSelector = (state: { projects: ProjectState }) => {
  let activeSimulations: { simulation: Simulation, freqNumber: number, project: Project }[] = [];
  takeAllProjectsIn(state.projects.projects).forEach(p => {
    if (p.simulation && p.simulation.status === 'Queued') {
      activeSimulations.push({ simulation: p.simulation, freqNumber: p.frequencies?.length as number, project: p});
    }
  });
  takeAllProjectsIn(state.projects.sharedElements).forEach(p => {
    if (p.simulation && p.simulation.status === 'Queued') {
      activeSimulations.push({ simulation: p.simulation, freqNumber: p.frequencies?.length as number, project: p });
    }
  });
  return activeSimulations;
};

export const activeMeshingSelector = (state: { projects: ProjectState }) => {
  let activeMeshing: { selectedProject: Project, allMaterials: Material[], quantum: [number, number, number], meshStatus: "Not Generated" | "Generated"}[] = [];
  takeAllProjectsIn(state.projects.projects).forEach(p => {
    let allMaterials: Material[] = [];
    if (p?.model?.components) {
      allMaterials = getMaterialListFrom(
        p?.model.components as ComponentEntity[],
      );
    }
    if (p.meshData && p.meshData.meshGenerated === 'Generating') {
      activeMeshing.push({
        selectedProject: p,
        allMaterials: allMaterials,
        quantum: p.meshData.quantum,
        meshStatus: p.meshData.previousMeshStatus as 'Not Generated' | 'Generated'
      })
    }
  });
  takeAllProjectsIn(state.projects.sharedElements).forEach(p => {
    let allMaterials: Material[] = [];
    if (p?.model?.components) {
      allMaterials = getMaterialListFrom(
        p?.model.components as ComponentEntity[],
      );
    }
    if (p.meshData && p.meshData.meshGenerated === 'Generating') {
      activeMeshing.push({
        selectedProject: p,
        allMaterials: allMaterials,
        quantum: p.meshData.quantum,
        meshStatus: p.meshData.previousMeshStatus as 'Not Generated' | 'Generated'
      })
    }
  });
  return activeMeshing;
}


export const suggestedQuantumSelector = (state: {
  projects: ProjectState
}) => (findProjectByFaunaID(takeAllProjectsInArrayOf([state.projects.projects, state.projects.sharedElements]), state.projects.selectedProject) as Project).suggestedQuantum;
export const findSuggestedQuantum = (folders: Folder[], projectID: string) => {
  let project = findProjectByFaunaID(takeAllProjectsInArrayOf(folders), projectID) as Project
  return project.suggestedQuantum
}
