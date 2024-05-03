import {combineReducers, configureStore} from '@reduxjs/toolkit';
import { UsersSlice } from 'cad-library';
import {ProjectSlice} from "./projectSlice";
import {SolverSlice} from "./solverSlice";
import { TabsAndMenuItemsSlice } from './tabsAndMenuItemsSlice';
import { PluginsSlice } from './pluginsSlice';


const rootReducer = combineReducers({
  projects: ProjectSlice.reducer,
  solver: SolverSlice.reducer,
  user: UsersSlice.reducer,
  tabsAndMenuItems: TabsAndMenuItemsSlice.reducer,
  plugins: PluginsSlice.reducer
});

export const store = configureStore({
  reducer: rootReducer
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


