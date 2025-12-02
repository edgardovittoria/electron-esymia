import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DynamoDBCadModel } from '../../cad_library/components/dynamodb/api/modelsAPIs';

export interface ModelState {
  models: DynamoDBCadModel[];
  sharedModels: DynamoDBCadModel[];
  selectedModel: DynamoDBCadModel | undefined;
  loadingSpinner: boolean
}

export const ModelSlice = createSlice({
  name: 'modelSlice',
  initialState: {
    models: [],
    sharedModels: [],
    selectedModel: undefined,
    loadingSpinner: false
  } as ModelState,
  reducers: {
    addModel(state: ModelState, action: PayloadAction<DynamoDBCadModel>) {
      state.models.push(action.payload);
    },
    resetModel(state: ModelState) {
      state.models = []
    },
    removeModel(state: ModelState, action: PayloadAction<string>) {
      state.models = state.models.filter((m) => m.id !== action.payload);
    },
    updateModel(state: ModelState, action: PayloadAction<DynamoDBCadModel>) {
      state.models = state.models.map((m) =>
        m.id === action.payload.id ? action.payload : m,
      );
    },
    selectModel(state: ModelState, action: PayloadAction<DynamoDBCadModel | undefined>) {
      state.selectedModel = action.payload;
    },
    setSharedModel(state: ModelState, action: PayloadAction<DynamoDBCadModel[]>) {
      state.sharedModels = action.payload
    },
    setLoadingSpinner(state: ModelState, action: PayloadAction<boolean>) {
      state.loadingSpinner = action.payload
    }
  },
});

export const {
  addModel,
  resetModel,
  removeModel,
  updateModel,
  selectModel,
  setSharedModel,
  setLoadingSpinner,
} = ModelSlice.actions;

/* Selettori */
export const ModelsSelector = (state: { modelSlice: ModelState }) =>
  state.modelSlice.models;
export const SelectedModelSelector = (state: { modelSlice: ModelState }) =>
  state.modelSlice.selectedModel;
export const SharedModelsSelector = (state: { modelSlice: ModelState }) =>
  state.modelSlice.sharedModels;
export const LoadingSpinnerSelector = (state: { modelSlice: ModelState }) =>
  state.modelSlice.loadingSpinner;
