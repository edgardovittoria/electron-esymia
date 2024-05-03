import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PluginsState {
  activePlugins: string[]
}

export const PluginsSlice = createSlice({
    name: 'plugins',
    initialState: {
      activePlugins: []
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
    }
})

export const {
  addActivePlugin, removeActivePlugin
} = PluginsSlice.actions
export const ActivePluginsSelector = (state: {plugins: PluginsState}) => state.plugins.activePlugins
