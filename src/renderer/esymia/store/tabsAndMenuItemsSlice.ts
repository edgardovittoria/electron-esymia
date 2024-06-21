import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, SolverOutput } from '../model/esymiaModels';
import { selectProject } from './projectSlice';

const getMenuItemsArrayBasedOnTabType = (tabType: string) => {
  switch (tabType) {
    case 'DASHBOARD':
      return ['Overview', 'Projects', 'Simulations'];
    default:
      return ['Modeler', 'Physics', 'Simulator', 'Results'];
  }
};

interface ScalingViewParams {
  x:number,
  y:number,
  z:number
}

type TabsAndMenuItemsState = {
  tabSelected: string;
  projectsTabs: Project[];
  menuItems: string[];
  menuItemSelected: string;
  infoModal: {
    showInfoModal: boolean,
    message: string,
    isAlert: boolean,
    isConfirmed: boolean
  },
  showCreateNewProjectModal: boolean
  scalingViewParamsOfMesh: ScalingViewParams
  meshVisualization: 'normal' | 'light',
  mesherProgressLength: {length: number, id: string}[],
  mesherProgress: {index: number, id: string}[],
  computingP: {done: boolean, id: string}[],
  computingLp: {done: boolean, id: string}[],
  iterations: {freqNumber: number, id: string}[],
  meshAdvice: {id: string, quantum: [number, number, number]}[],
  meshResults: {id: string, gridsPath: string, meshPath: string, isStopped: boolean, isValid: {valid: boolean, axis?: string}}[],
  solverResults: {id: string, matrices: SolverOutput, isStopped: boolean}[]
}

export const TabsAndMenuItemsSlice = createSlice({
  name: 'tabsAndMenuItems',
  initialState: {
    tabSelected: 'DASHBOARD',
    menuItems: getMenuItemsArrayBasedOnTabType('DASHBOARD'),
    menuItemSelected: 'Overview',
    projectsTabs: [],
    infoModal: {
      showInfoModal: false,
      message: '',
      isAlert: false,
      isConfirmed: false,
      isAlerted: false
    },
    showCreateNewProjectModal: false,
    scalingViewParamsOfMesh: {x:1, y:1, z:1},
    meshVisualization: 'light',
    mesherProgressLength: [],
    mesherProgress: [],
    computingP: [],
    computingLp: [],
    iterations: [],
    meshAdvice: [], 
    meshResults: [],
    solverResults: []
  } as TabsAndMenuItemsState,
  reducers: {
    selectTab(state: TabsAndMenuItemsState, action: PayloadAction<string>) {
      setTab(state, action.payload);
    },
    addProjectTab(state: TabsAndMenuItemsState, action: PayloadAction<Project>) {
      if (!(state.projectsTabs.filter((projectTab) => projectTab.faunaDocumentId === action.payload.faunaDocumentId).length > 0)) {
        state.projectsTabs.push(action.payload);
      }
      setTab(state, action.payload.faunaDocumentId as string);
    },
    closeProjectTab(state: TabsAndMenuItemsState, action: PayloadAction<string>) {
      state.projectsTabs = state.projectsTabs.filter((projectTab) => projectTab.faunaDocumentId !== action.payload);
      if (state.menuItemSelected !== 'Projects') setTab(state, 'DASHBOARD');
    },
    selectMenuItem(state: TabsAndMenuItemsState, action: PayloadAction<string>) {
      state.menuItemSelected = action.payload;
    },
    setShowInfoModal(state: TabsAndMenuItemsState, action: PayloadAction<boolean>) {
      state.infoModal.showInfoModal = action.payload;
    },
    setMessageInfoModal(state: TabsAndMenuItemsState, action: PayloadAction<string>) {
      state.infoModal.message = action.payload;
    },
    setIsAlertInfoModal(state: TabsAndMenuItemsState, action: PayloadAction<boolean>) {
      state.infoModal.isAlert = action.payload;
    },
    setIsConfirmedInfoModal(state: TabsAndMenuItemsState, action: PayloadAction<boolean>) {
      state.infoModal.isConfirmed = action.payload;
    },
    setShowCreateNewProjectModal(state: TabsAndMenuItemsState, action: PayloadAction<boolean>) {
      state.showCreateNewProjectModal = action.payload;
    },
    setScalingViewParamsOfMesh(state: TabsAndMenuItemsState, action: PayloadAction<ScalingViewParams>) {
      state.scalingViewParamsOfMesh = action.payload;
    },
    resetScalingViewParamsOfMesh(state: TabsAndMenuItemsState) {
      state.scalingViewParamsOfMesh = {x:1, y:1, z:1};
    },
    setMeshVisualization(state: TabsAndMenuItemsState, action: PayloadAction<'normal'|'light'>) {
      state.meshVisualization = action.payload;
    },
    setMeshProgressLength(state: TabsAndMenuItemsState, action: PayloadAction<{length: number, id: string}>){
      state.mesherProgressLength = state.mesherProgressLength.filter(item => item.id !== action.payload.id)
      state.mesherProgressLength.push(action.payload)
    },
    setMeshProgress(state: TabsAndMenuItemsState, action: PayloadAction<{index: number, id: string}>){
      state.mesherProgress = state.mesherProgress.filter(item => item.id !== action.payload.id)
      state.mesherProgress.push(action.payload)
    },
    unsetMeshProgressLength(state: TabsAndMenuItemsState, action: PayloadAction<string>){
      state.mesherProgressLength = state.mesherProgressLength.filter(item => item.id !== action.payload)
    },
    unsetMeshProgress(state: TabsAndMenuItemsState, action: PayloadAction<string>){
      state.mesherProgress = state.mesherProgress.filter(item => item.id !== action.payload)
    },
    setcomputingP(state: TabsAndMenuItemsState, action: PayloadAction<{done: boolean, id: string}>){
      state.computingP = state.computingP.filter(item => item.id !== action.payload.id)
      state.computingP.push(action.payload)
    },
    setcomputingLp(state: TabsAndMenuItemsState, action: PayloadAction<{done: boolean, id: string}>){
      state.computingLp = state.computingLp.filter(item => item.id !== action.payload.id)
      state.computingLp.push(action.payload)
    },
    setIterations(state: TabsAndMenuItemsState, action: PayloadAction<{freqNumber: number, id: string}>){
      state.iterations = state.iterations.filter(item => item.id !== action.payload.id)
      state.iterations.push(action.payload)
    },
    unsetComputingP(state: TabsAndMenuItemsState, action: PayloadAction<string>){
      state.computingP = state.computingP.filter(item => item.id !== action.payload)
    },
    unsetComputingLp(state: TabsAndMenuItemsState, action: PayloadAction<string>){
      state.computingLp = state.computingLp.filter(item => item.id !== action.payload)
    },
    unsetIterations(state: TabsAndMenuItemsState, action: PayloadAction<string>){
      state.iterations = state.iterations.filter(item => item.id !== action.payload)
    },
    setMeshAdvice(state: TabsAndMenuItemsState, action: PayloadAction<{quantum: [number, number, number], id: string}>){
      state.meshAdvice = state.meshAdvice.filter(item => item.id !== action.payload.id)
      state.meshAdvice.push(action.payload)
    },
    setMesherResults(state: TabsAndMenuItemsState, action: PayloadAction<{gridsPath: string, meshPath: string, id: string, isStopped: boolean, isValid: {valid: boolean, axis?: string}}>){
      state.meshResults = state.meshResults.filter(item => item.id !== action.payload.id)
      state.meshResults.push(action.payload)
    },
    setSolverResults(state: TabsAndMenuItemsState, action: PayloadAction<{matrices: SolverOutput, id: string, isStopped: boolean}>){
      state.solverResults = state.solverResults.filter(item => item.id !== action.payload.id)
      state.solverResults.push(action.payload)
    },
    unsetMeshAdvice(state: TabsAndMenuItemsState, action: PayloadAction<string>){
      state.meshAdvice = state.meshAdvice.filter(item => item.id !== action.payload)
    },
    unsetMesherResults(state: TabsAndMenuItemsState, action: PayloadAction<string>){
      state.meshResults = state.meshResults.filter(item => item.id !== action.payload)
    },
    unsetSolverResults(state: TabsAndMenuItemsState, action: PayloadAction<string>){
      state.solverResults = state.solverResults.filter(item => item.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(selectProject, (state, action) => {
        state.scalingViewParamsOfMesh = {x:1, y:1, z:1}
      });
  }
});

export const {
  selectTab,
  addProjectTab,
  closeProjectTab,
  selectMenuItem,
  setShowInfoModal,
  setMessageInfoModal,
  setIsAlertInfoModal,
  setIsConfirmedInfoModal,
  setShowCreateNewProjectModal,
  setScalingViewParamsOfMesh,
  resetScalingViewParamsOfMesh,
  setMeshVisualization,
  setMeshProgressLength,
  setMeshProgress,
  unsetMeshProgressLength,
  unsetMeshProgress,
  setcomputingP,
  setcomputingLp,
  setIterations,
  unsetComputingP,
  unsetComputingLp,
  unsetIterations,
  setMeshAdvice,
  setMesherResults,
  setSolverResults,
  unsetMeshAdvice,
  unsetMesherResults,
  unsetSolverResults
} = TabsAndMenuItemsSlice.actions;


const setTab = (state: TabsAndMenuItemsState, tab: string) => {
  state.tabSelected = tab;
  state.menuItems = getMenuItemsArrayBasedOnTabType(tab);
  if (tab === 'DASHBOARD' || state.menuItemSelected !== 'Results') {
    state.menuItemSelected = state.menuItems[0];
  }
};
export const tabSelectedSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.tabSelected;
export const menuItemsSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.menuItems;
export const selectedMenuItemSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.menuItemSelected;
export const projectsTabsSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.projectsTabs;
export const infoModalSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.infoModal;
export const showInfoModalSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.infoModal.showInfoModal;
export const isConfirmedInfoModalSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.infoModal.isConfirmed;

export const isAlertInfoModalSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.infoModal.isAlert;

export const showCreateNewProjectModalSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.showCreateNewProjectModal;

export const scalingViewParamsOfMeshSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.scalingViewParamsOfMesh;

export const meshVisualizationSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.meshVisualization
export const mesherProgressLengthSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.mesherProgressLength;
export const mesherProgressSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.mesherProgress;

export const computingPSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.computingP;

export const computingLpSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.computingLp;

export const iterationsSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.iterations;

export const meshAdviceSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.meshAdvice;

export const mesherResultsSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.meshResults;

export const solverResultsSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState
}) => state.tabsAndMenuItems.solverResults;
