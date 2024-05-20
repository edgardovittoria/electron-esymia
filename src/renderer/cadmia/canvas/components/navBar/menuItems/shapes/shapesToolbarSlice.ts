import { createSlice } from '@reduxjs/toolkit'

export type ShapesToolbarState = {
    visible: boolean
}

export const ShapesToolbarSlice = createSlice({
  name: 'shapesToolbar',
  initialState:{
    visible: true
  } as ShapesToolbarState,
  reducers: {
    openShapesToolbar(state: ShapesToolbarState){
        state.visible = true
    },
    closeShapesToolbar(state: ShapesToolbarState){
        state.visible = false
    },
    toggleShapesToolbar(state: ShapesToolbarState){
        state.visible = !state.visible
    }
  }
});

export const {closeShapesToolbar, openShapesToolbar, toggleShapesToolbar} = ShapesToolbarSlice.actions

export const shapesToolbarVisibilitySelector = (state: {shapesToolbar: ShapesToolbarState}) => state.shapesToolbar.visible