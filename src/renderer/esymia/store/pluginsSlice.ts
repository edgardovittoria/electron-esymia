import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PluginsState {
  activePlugins: string[],
  mesherStatus: 'idle' | 'starting' | 'ready',
  solverStatus: 'idle' | 'starting' | 'ready',
}

export const PluginsSlice = createSlice({
    name: 'plugins',
    initialState: {
      activePlugins: [],
      mesherStatus: process.env.APP_MODE === "test" ? 'ready' : 'idle',
      solverStatus: process.env.APP_MODE === "test" ? 'ready' : 'idle'
    } as PluginsState,
    reducers: {
      addActivePlugin(state: PluginsState, action: PayloadAction<string>){
        if(state.activePlugins.filter(p => p === action.payload).length === 0){
          state.activePlugins.push(action.payload)
        }
      },
      removeActivePlugin(state: PluginsState, action: PayloadAction<string>){
        state.activePlugins = state.activePlugins.filter(p => p !== action.payload)
      },
      setMesherStatus(state: PluginsState, action: PayloadAction<'idle' | 'starting' | 'ready'>){
        state.mesherStatus = action.payload
      },
      setSolverStatus(state: PluginsState, action: PayloadAction<'idle' | 'starting' | 'ready'>){
        state.solverStatus = action.payload
      }
    }
})

export const {
  addActivePlugin, removeActivePlugin, setMesherStatus, setSolverStatus
} = PluginsSlice.actions
export const ActivePluginsSelector = (state: {plugins: PluginsState}) => state.plugins.activePlugins
export const MesherStatusSelector = (state: {plugins: PluginsState}) => state.plugins.mesherStatus
export const SolverStatusSelector = (state: {plugins: PluginsState}) => state.plugins.solverStatus
