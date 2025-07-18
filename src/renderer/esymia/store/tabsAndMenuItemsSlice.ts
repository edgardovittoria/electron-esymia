import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ExternalGridsObject,
  Project,
  SolverOutput,
  SolverOutputElectricFields,
} from '../model/esymiaModels';
import { selectProject } from './projectSlice';

const getMenuItemsArrayBasedOnTabType = (tabType: string) => {
  switch (tabType) {
    case 'DASHBOARD':
      return ['Overview'];
    default:
      return ['Modeler', 'Mesher', 'Solver', 'Results'];
  }
};

interface ScalingViewParams {
  x: number;
  y: number;
  z: number;
}

export interface resultsViewItem {
  portIndex: number;
  results: {
    matrixS: number[][][];
    matrixY: number[][][];
    matrixZ: number[][][];
  };
  freqIndex?: number;
}

type TabsAndMenuItemsState = {
  tabSelected: string;
  projectsTabs: Project[];
  menuItems: string[];
  menuItemSelected: string;
  infoModal: {
    showInfoModal: boolean;
    message: string;
    isAlert: boolean;
    isConfirmed: boolean;
  };
  showCreateNewProjectModal: boolean;
  showSaveProjectResultsModal: boolean;
  scalingViewParamsOfMesh: ScalingViewParams;
  meshVisualization: 'normal' | 'light';
  meshingProgress?: { meshingStep: number; id: string };
  mesherProgressLength?: { length: number; id: string };
  mesherProgress?: { index: number; id: string };
  gridCreationLength?: { gridsCreationLength: number; id: string };
  gridCreationValue?: { gridsCreationValue: number; id: string };
  compress?: { compress: boolean; id: string };
  computingP: { done: boolean; id: string }[];
  computingLp: { done: boolean; id: string }[];
  iterations: { freqNumber: number; id: string }[];
  estimatedTime?: { estimatedTime: number; portIndex: number; id: string };
  electricFieldsResultsStep?: { step: number; name: string; id: string };
  meshAdvice: { id: string; quantum: [number, number, number] }[];
  meshResults?: {
    id: string;
    gridsPath: string;
    meshPath: string;
    surfacePath: string;
    isStopped: boolean;
    validTopology: boolean;
    isValid: { valid: boolean; axis?: string };
    error?: any;
    ASize?: number[];
  };
  solverResults: (SolverResultsMatrix | SolverResultsElectricFields)[];
  spinnerSolverResults: boolean;
  resultsView: resultsViewItem[];
  SolverResultsS3?: string;
  externalGrids?: any;
  brokerConnected: boolean;
  theme: 'light' | 'dark';
};

interface SolverResultsMatrix {
  id: string;
  matrices: SolverOutput;
  isStopped: boolean;
  partial: boolean;
  freqIndex?: number;
  error?: any;
}

export interface SolverResultsElectricFields {
  id: string;
  results: SolverOutputElectricFields;
  isStopped: boolean;
  error?: any;
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
      isAlerted: false,
    },
    showCreateNewProjectModal: false,
    showSaveProjectResultsModal: false,
    scalingViewParamsOfMesh: { x: 1, y: 1, z: 1 },
    meshVisualization: 'normal',
    computingP: [],
    computingLp: [],
    iterations: [],
    meshAdvice: [],
    solverResults: [],
    spinnerSolverResults: false,
    resultsView: [],
    brokerConnected: false,
    theme: 'light',
  } as TabsAndMenuItemsState,
  reducers: {
    selectTab(state: TabsAndMenuItemsState, action: PayloadAction<string>) {
      setTab(state, action.payload);
    },
    addProjectTab(
      state: TabsAndMenuItemsState,
      action: PayloadAction<Project>,
    ) {
      if (
        !(
          state.projectsTabs.filter(
            (projectTab) => projectTab.id === action.payload.id,
          ).length > 0
        )
      ) {
        state.projectsTabs.push(action.payload);
      }
      setTab(state, action.payload.id as string);
    },
    updateProjectTab(
      state: TabsAndMenuItemsState,
      action: PayloadAction<Project>,
    ) {
      state.projectsTabs = state.projectsTabs.map((pt) => {
        if (pt.id === action.payload.id) {
          pt = action.payload;
        }
        return pt;
      });
    },
    closeProjectTab(
      state: TabsAndMenuItemsState,
      action: PayloadAction<string>,
    ) {
      state.projectsTabs = state.projectsTabs.filter(
        (projectTab) => projectTab.id !== action.payload,
      );
      if (state.menuItemSelected !== 'Projects') setTab(state, 'DASHBOARD');
    },
    selectMenuItem(
      state: TabsAndMenuItemsState,
      action: PayloadAction<string>,
    ) {
      state.menuItemSelected = action.payload;
    },
    setShowInfoModal(
      state: TabsAndMenuItemsState,
      action: PayloadAction<boolean>,
    ) {
      state.infoModal.showInfoModal = action.payload;
    },
    setMessageInfoModal(
      state: TabsAndMenuItemsState,
      action: PayloadAction<string>,
    ) {
      state.infoModal.message = action.payload;
    },
    setIsAlertInfoModal(
      state: TabsAndMenuItemsState,
      action: PayloadAction<boolean>,
    ) {
      state.infoModal.isAlert = action.payload;
    },
    setIsConfirmedInfoModal(
      state: TabsAndMenuItemsState,
      action: PayloadAction<boolean>,
    ) {
      state.infoModal.isConfirmed = action.payload;
    },
    setShowCreateNewProjectModal(
      state: TabsAndMenuItemsState,
      action: PayloadAction<boolean>,
    ) {
      state.showCreateNewProjectModal = action.payload;
    },
    setShowSaveProjectResultsModal(
      state: TabsAndMenuItemsState,
      action: PayloadAction<boolean>,
    ) {
      state.showSaveProjectResultsModal = action.payload;
    },
    setScalingViewParamsOfMesh(
      state: TabsAndMenuItemsState,
      action: PayloadAction<ScalingViewParams>,
    ) {
      state.scalingViewParamsOfMesh = action.payload;
    },
    resetScalingViewParamsOfMesh(state: TabsAndMenuItemsState) {
      state.scalingViewParamsOfMesh = { x: 1, y: 1, z: 1 };
    },
    setMeshVisualization(
      state: TabsAndMenuItemsState,
      action: PayloadAction<'normal' | 'light'>,
    ) {
      state.meshVisualization = action.payload;
    },
    setMeshingProgress(
      state: TabsAndMenuItemsState,
      action: PayloadAction<{ meshingStep: number; id: string } | undefined>,
    ) {
      state.meshingProgress = action.payload;
    },
    setMeshProgressLength(
      state: TabsAndMenuItemsState,
      action: PayloadAction<{ length: number; id: string } | undefined>,
    ) {
      state.mesherProgressLength = action.payload;
    },
    setMeshProgress(
      state: TabsAndMenuItemsState,
      action: PayloadAction<{ index: number; id: string } | undefined>,
    ) {
      state.mesherProgress = action.payload;
    },
    setGridsCreationLength(
      state: TabsAndMenuItemsState,
      action: PayloadAction<
        { gridsCreationLength: number; id: string } | undefined
      >,
    ) {
      state.gridCreationLength = action.payload;
    },
    setGridsCreationValue(
      state: TabsAndMenuItemsState,
      action: PayloadAction<
        { gridsCreationValue: number; id: string } | undefined
      >,
    ) {
      state.gridCreationValue = action.payload;
    },
    setCompress(
      state: TabsAndMenuItemsState,
      action: PayloadAction<{ compress: boolean; id: string } | undefined>,
    ) {
      state.compress = action.payload;
    },
    setcomputingP(
      state: TabsAndMenuItemsState,
      action: PayloadAction<{ done: boolean; id: string }>,
    ) {
      state.computingP = state.computingP.filter(
        (item) => item.id !== action.payload.id,
      );
      state.computingP.push(action.payload);
    },
    setcomputingLp(
      state: TabsAndMenuItemsState,
      action: PayloadAction<{ done: boolean; id: string }>,
    ) {
      state.computingLp = state.computingLp.filter(
        (item) => item.id !== action.payload.id,
      );
      state.computingLp.push(action.payload);
    },
    setIterations(
      state: TabsAndMenuItemsState,
      action: PayloadAction<{ freqNumber: number; id: string }>,
    ) {
      state.iterations = state.iterations.filter(
        (item) => item.id !== action.payload.id,
      );
      state.iterations.push(action.payload);
    },
    unsetComputingP(
      state: TabsAndMenuItemsState,
      action: PayloadAction<string>,
    ) {
      state.computingP = state.computingP.filter(
        (item) => item.id !== action.payload,
      );
    },
    unsetComputingLp(
      state: TabsAndMenuItemsState,
      action: PayloadAction<string>,
    ) {
      state.computingLp = state.computingLp.filter(
        (item) => item.id !== action.payload,
      );
    },
    unsetIterations(
      state: TabsAndMenuItemsState,
      action: PayloadAction<string>,
    ) {
      state.iterations = state.iterations.filter(
        (item) => item.id !== action.payload,
      );
    },
    setEstimatedTime(
      state: TabsAndMenuItemsState,
      action: PayloadAction<
        { estimatedTime: number; portIndex: number; id: string } | undefined
      >,
    ) {
      state.estimatedTime = action.payload;
    },
    setElectricFieldsResultsStep(
      state: TabsAndMenuItemsState,
      action: PayloadAction<
        { step: number; name: string; id: string } | undefined
      >,
    ) {
      state.electricFieldsResultsStep = action.payload;
    },
    setMeshAdvice(
      state: TabsAndMenuItemsState,
      action: PayloadAction<{ quantum: [number, number, number]; id: string }>,
    ) {
      state.meshAdvice = state.meshAdvice.filter(
        (item) => item.id !== action.payload.id,
      );
      state.meshAdvice.push(action.payload);
    },
    setMesherResults(
      state: TabsAndMenuItemsState,
      action: PayloadAction<
        | {
            gridsPath: string;
            meshPath: string;
            surfacePath: string;
            id: string;
            isStopped: boolean;
            validTopology: boolean;
            isValid: { valid: boolean; axis?: string };
            error?: any;
            ASize?: number[];
          }
        | undefined
      >,
    ) {
      state.meshResults = action.payload;
    },
    setAWSExternalGridsData(
      state: TabsAndMenuItemsState,
      action: PayloadAction<any>,
    ) {
      state.externalGrids = action.payload;
    },
    setSolverResults(
      state: TabsAndMenuItemsState,
      action: PayloadAction<SolverResultsMatrix | SolverResultsElectricFields>,
    ) {
      state.solverResults = state.solverResults.filter(
        (item) => item.id !== action.payload.id,
      );
      state.solverResults.push(action.payload);
    },
    setSpinnerSolverResults(
      state: TabsAndMenuItemsState,
      action: PayloadAction<boolean>,
    ) {
      state.spinnerSolverResults = action.payload;
    },
    setSolverResultsS3(
      state: TabsAndMenuItemsState,
      action: PayloadAction<string | undefined>,
    ) {
      state.SolverResultsS3 = action.payload;
    },
    unsetAWSExternalGridsData(state: TabsAndMenuItemsState) {
      state.externalGrids = undefined;
    },
    unsetMeshAdvice(
      state: TabsAndMenuItemsState,
      action: PayloadAction<string>,
    ) {
      state.meshAdvice = state.meshAdvice.filter(
        (item) => item.id !== action.payload,
      );
    },
    unsetSolverResults(
      state: TabsAndMenuItemsState,
    ) {
      state.solverResults = [];
    },
    setBrokerConnected(state: TabsAndMenuItemsState) {
      state.brokerConnected = true;
    },
    unsetBrokerConnected(state: TabsAndMenuItemsState) {
      state.brokerConnected = false;
    },
    setTheme(
      state: TabsAndMenuItemsState,
      action: PayloadAction<'light' | 'dark'>,
    ) {
      state.theme = action.payload;
    },
    addItemToResultsView(
      state: TabsAndMenuItemsState,
      action: PayloadAction<resultsViewItem>,
    ) {
      if (
        state.resultsView.filter(
          (r) => r.portIndex === action.payload.portIndex,
        ).length === 0
      ) {
        state.resultsView.push(action.payload);
      }
    },
    removeItemToResultsView(
      state: TabsAndMenuItemsState,
      action: PayloadAction<number>,
    ) {
      state.resultsView = state.resultsView.filter(
        (r) => r.portIndex !== action.payload,
      );
    },
    resetItemToResultsView(state: TabsAndMenuItemsState) {
      state.resultsView = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(selectProject, (state, action) => {
      state.scalingViewParamsOfMesh = { x: 1, y: 1, z: 1 };
    });
  },
});

export const {
  selectTab,
  addProjectTab,
  updateProjectTab,
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
  setMeshingProgress,
  setMeshProgressLength,
  setMeshProgress,
  setGridsCreationLength,
  setGridsCreationValue,
  setCompress,
  setcomputingP,
  setcomputingLp,
  setIterations,
  setEstimatedTime,
  unsetComputingP,
  unsetComputingLp,
  unsetIterations,
  setMeshAdvice,
  setMesherResults,
  setSolverResults,
  setSolverResultsS3,
  unsetMeshAdvice,
  unsetSolverResults,
  setBrokerConnected,
  unsetBrokerConnected,
  setAWSExternalGridsData,
  unsetAWSExternalGridsData,
  setTheme,
  addItemToResultsView,
  removeItemToResultsView,
  resetItemToResultsView,
  setSpinnerSolverResults,
  setElectricFieldsResultsStep,
  setShowSaveProjectResultsModal
} = TabsAndMenuItemsSlice.actions;

const setTab = (state: TabsAndMenuItemsState, tab: string) => {
  state.tabSelected = tab;
  state.menuItems = getMenuItemsArrayBasedOnTabType(tab);
  if (tab === 'DASHBOARD' || state.menuItemSelected !== 'Results') {
    state.menuItemSelected = state.menuItems[0];
  }
};
export const tabSelectedSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.tabSelected;
export const menuItemsSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.menuItems;
export const selectedMenuItemSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.menuItemSelected;
export const projectsTabsSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.projectsTabs;
export const infoModalSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.infoModal;
export const showInfoModalSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.infoModal.showInfoModal;
export const isConfirmedInfoModalSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.infoModal.isConfirmed;

export const isAlertInfoModalSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.infoModal.isAlert;

export const showCreateNewProjectModalSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.showCreateNewProjectModal;

export const showSaveProjectResultsModalSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.showSaveProjectResultsModal;

export const scalingViewParamsOfMeshSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.scalingViewParamsOfMesh;

export const meshVisualizationSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.meshVisualization;

export const meshingProgressSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.meshingProgress;

export const mesherProgressLengthSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.mesherProgressLength;
export const mesherProgressSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.mesherProgress;

export const gridsCreationLengthSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.gridCreationLength;

export const gridsCreationValueSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.gridCreationValue;

export const compressSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.compress;

export const computingPSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.computingP;

export const computingLpSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.computingLp;

export const iterationsSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.iterations;

export const estimatedTimeSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.estimatedTime;

export const electricFieldsResultsStepSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.electricFieldsResultsStep;

export const meshAdviceSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.meshAdvice;

export const mesherResultsSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.meshResults;

export const solverResultsSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.solverResults;

export const spinnerSolverResultsSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.spinnerSolverResults;

export const solverResultsViewSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.resultsView;

export const solverResultsS3Selector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.SolverResultsS3;

export const brokerConnectedSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.brokerConnected;

export const AWSExternalGridsDataSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.externalGrids;

export const ThemeSelector = (state: {
  tabsAndMenuItems: TabsAndMenuItemsState;
}) => state.tabsAndMenuItems.theme;
