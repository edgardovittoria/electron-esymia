import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../model/esymiaModels';

const getMenuItemsArrayBasedOnTabType = (tabType: string) => {
  switch (tabType) {
    case 'DASHBOARD':
      return ['Overview', 'Projects', 'Simulations'];
    default:
      return ['Modeler', 'Physics', 'Simulator', 'Results'];
  }
};

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
    showCreateNewProjectModal: false
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
  setShowCreateNewProjectModal
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
