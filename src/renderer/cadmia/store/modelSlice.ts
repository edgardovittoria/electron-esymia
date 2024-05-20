import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FaunaCadModel } from 'cad-library';

export interface ModelState {
  models: FaunaCadModel[];
  sharedModels: FaunaCadModel[];
  selectedModel: FaunaCadModel | undefined;
}

export const ModelSlice = createSlice({
  name: 'modelSlice',
  initialState: {
    models: [],
    sharedModels: [],
    selectedModel: undefined,
  } as ModelState,
  reducers: {
    addModel(state: ModelState, action: PayloadAction<FaunaCadModel>) {
      state.models.push(action.payload);
    },
    removeModel(state: ModelState, action: PayloadAction<string>) {
      state.models = state.models.filter((m) => m.id !== action.payload);
    },
    updateModel(state: ModelState, action: PayloadAction<FaunaCadModel>) {
      state.models = state.models.map((m) =>
        m.id === action.payload.id ? action.payload : m,
      );
    },
    selectModel(state: ModelState, action: PayloadAction<FaunaCadModel>) {
      state.selectedModel = action.payload;
    },
    setSharedModel(state: ModelState, action: PayloadAction<FaunaCadModel[]>) {
      state.sharedModels = action.payload
    },
  },
});

export const {
  addModel,
  removeModel,
  updateModel,
  selectModel,
  setSharedModel,
} = ModelSlice.actions;

/* Selettori */
export const ModelsSelector = (state: { modelSlice: ModelState }) =>
  state.modelSlice.models;
export const SelectedModelSelector = (state: { modelSlice: ModelState }) =>
  state.modelSlice.selectedModel;
export const SharedModelsSelector = (state: { modelSlice: ModelState }) =>
  state.modelSlice.sharedModels;
