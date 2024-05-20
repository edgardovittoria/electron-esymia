import { combineReducers, configureStore } from '@reduxjs/toolkit';
import undoable, { excludeAction } from 'redux-undo';
import { persistReducer } from 'redux-persist';
import persistStore from 'redux-persist/es/persistStore';
import localforage from 'localforage';
import { CanvasSlice, UsersSlice } from 'cad-library';
import { TransformationsToolbarSlice } from '../canvas/components/transformationsToolbar/toolbarTransformationSlice';
import { BinaryOperationsToolbarSlice } from '../canvas/components/binaryOperationsToolbar/binaryOperationsToolbarSlice';
import { CadmiaModalitySlice } from '../canvas/components/cadmiaModality/cadmiaModalitySlice';
import { ObjectsDetailsSlice } from '../canvas/components/objectsDetailsBar/objectsDetailsSlice';
import { StatusBarSlice } from '../canvas/components/statusBar/statusBarSlice';
import { MiscToolbarSlice } from '../canvas/components/miscToolbar/miscToolbarSlice';
import { ShapesToolbarSlice } from '../canvas/components/navBar/menuItems/shapes/shapesToolbarSlice';
import { ViewItemSlice } from '../canvas/components/navBar/menuItems/view/viewItemSlice';
import { ModelSlice } from './modelSlice';

const persistConfig = {
  key: 'root',
  storage: localforage,
  blacklist: ['modelSlice'],
};

const rootReducer = combineReducers({
  canvas: undoable(CanvasSlice.reducer, {
    limit: 20,
    filter: excludeAction(
      CanvasSlice.actions.incrementNumberOfGeneratedKey.type,
    ),
  }),
  transformationsToolbar: TransformationsToolbarSlice.reducer,
  binaryOperationsToolbar: BinaryOperationsToolbarSlice.reducer,
  cadmiaModality: CadmiaModalitySlice.reducer,
  objectsDetails: ObjectsDetailsSlice.reducer,
  user: UsersSlice.reducer,
  statusBarSlice: StatusBarSlice.reducer,
  miscToolbar: MiscToolbarSlice.reducer,
  shapesToolbar: ShapesToolbarSlice.reducer,
  viewItemState: ViewItemSlice.reducer,
  modelSlice: ModelSlice.reducer,
});

//const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  //reducer: persistedReducer,
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);
