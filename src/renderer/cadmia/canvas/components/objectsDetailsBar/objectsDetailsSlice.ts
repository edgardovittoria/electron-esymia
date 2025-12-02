import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState, AppDispatch } from '../../../../store';
import { ComponentEntity } from '../../../../cad_library';

export type ObjectsDetailsState = {
  objectsDetailsVisible: boolean,
  meshesWithBordersVisible: number[]
  invisibleMeshes: number[]
}

export const ObjectsDetailsSlice = createSlice({
  name: 'objectsDetails',
  initialState: {
    objectsDetailsVisible: true,
    meshesWithBordersVisible: [],
    invisibleMeshes: []
  } as ObjectsDetailsState,
  reducers: {
    openObjectsDetails(state: ObjectsDetailsState) {
      state.objectsDetailsVisible = true
    },
    closeObjectsDetails(state: ObjectsDetailsState) {
      state.objectsDetailsVisible = false
    },
    toggleObjectsDetails(state: ObjectsDetailsState) {
      state.objectsDetailsVisible = !state.objectsDetailsVisible
    },
    enableBordersForComponent(state: ObjectsDetailsState, action: PayloadAction<number | number[]>) {
      const keys = Array.isArray(action.payload) ? action.payload : [action.payload];
      keys.forEach(key => {
        if (!state.meshesWithBordersVisible.includes(key)) {
          state.meshesWithBordersVisible.push(key);
        }
      });
    },
    disableBordersForComponent(state: ObjectsDetailsState, action: PayloadAction<number | number[]>) {
      const keys = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.meshesWithBordersVisible = state.meshesWithBordersVisible.filter(mb => !keys.includes(mb));
    },
    setMeshInvisible(state: ObjectsDetailsState, action: PayloadAction<number | number[]>) {
      const keys = Array.isArray(action.payload) ? action.payload : [action.payload];
      keys.forEach(key => {
        if (!state.invisibleMeshes.includes(key)) {
          state.invisibleMeshes.push(key);
        }
      });
    },
    setMeshVisible(state: ObjectsDetailsState, action: PayloadAction<number | number[]>) {
      const keys = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.invisibleMeshes = state.invisibleMeshes.filter(key => !keys.includes(key));
    }
  }
});

export const { closeObjectsDetails, disableBordersForComponent, enableBordersForComponent, openObjectsDetails, toggleObjectsDetails, setMeshInvisible, setMeshVisible } = ObjectsDetailsSlice.actions

export const objectsDetailsVisibilitySelector = (state: { objectsDetails: ObjectsDetailsState }) => state.objectsDetails.objectsDetailsVisible
export const meshesWithBordersVisibleSelector = (state: { objectsDetails: ObjectsDetailsState }) => state.objectsDetails.meshesWithBordersVisible
export const invisibleMeshesSelector = (state: { objectsDetails: ObjectsDetailsState }) => state.objectsDetails.invisibleMeshes

const getAllKeys = (component: ComponentEntity): number[] => {
  let keys = [component.keyComponent];
  if (component.children) {
    component.children.forEach(child => {
      keys = [...keys, ...getAllKeys(child)];
    });
  }
  return keys;
}

export const toggleBordersAction = (key: number, visible: boolean) => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const components = state.canvas.components;
  const component = components.find(c => c.keyComponent === key);

  if (component) {
    const keys = getAllKeys(component);
    if (visible) {
      dispatch(enableBordersForComponent(keys));
    } else {
      dispatch(disableBordersForComponent(keys));
    }
  }
};

export const toggleVisibilityAction = (key: number, visible: boolean) => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const components = state.canvas.components;
  const component = components.find(c => c.keyComponent === key);

  if (component) {
    const keys = getAllKeys(component);
    if (visible) {
      dispatch(setMeshVisible(keys));
    } else {
      dispatch(setMeshInvisible(keys));
    }
  }
};
