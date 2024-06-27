import {combineReducers, configureStore} from '@reduxjs/toolkit';
import { CanvasSlice, UsersSlice } from 'cad-library';
import { ProjectSlice } from './esymia/store/projectSlice';
import { SolverSlice } from './esymia/store/solverSlice';
import { TabsAndMenuItemsSlice } from './esymia/store/tabsAndMenuItemsSlice';
import { PluginsSlice } from './esymia/store/pluginsSlice';
import undoable, { excludeAction } from 'redux-undo';
import {
  TransformationsToolbarSlice
} from './cadmia/canvas/components/transformationsToolbar/toolbarTransformationSlice';
import {
  BinaryOperationsToolbarSlice
} from './cadmia/canvas/components/binaryOperationsToolbar/binaryOperationsToolbarSlice';
import { CadmiaModalitySlice } from './cadmia/canvas/components/cadmiaModality/cadmiaModalitySlice';
import { StatusBarSlice } from './cadmia/canvas/components/statusBar/statusBarSlice';
import { MiscToolbarSlice } from './cadmia/canvas/components/miscToolbar/miscToolbarSlice';
import { ShapesToolbarSlice } from './cadmia/canvas/components/navBar/menuItems/shapes/shapesToolbarSlice';
import { ViewItemSlice } from './cadmia/canvas/components/navBar/menuItems/view/viewItemSlice';
import { ModelSlice } from './cadmia/store/modelSlice';
import { ObjectsDetailsSlice } from './cadmia/canvas/components/objectsDetailsBar/objectsDetailsSlice';
import { stompMiddleware } from './middleware/stompMiddleware';



const rootReducer = combineReducers({
  projects: ProjectSlice.reducer,
  solver: SolverSlice.reducer,
  user: UsersSlice.reducer,
  tabsAndMenuItems: TabsAndMenuItemsSlice.reducer,
  plugins: PluginsSlice.reducer,
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
  statusBarSlice: StatusBarSlice.reducer,
  miscToolbar: MiscToolbarSlice.reducer,
  shapesToolbar: ShapesToolbarSlice.reducer,
  viewItemState: ViewItemSlice.reducer,
  modelSlice: ModelSlice.reducer,
});


export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(stompMiddleware),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
