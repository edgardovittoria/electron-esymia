import { createSlice } from '@reduxjs/toolkit'


export type ViewItemSlice = {
    focusToScene: boolean
}

export const ViewItemSlice = createSlice({
  name: 'viewItemState',
  initialState:{
    focusToScene: true
  } as ViewItemSlice,
  reducers: {
    resetFocusToScene(state: ViewItemSlice){
        state.focusToScene = true
    }, 
    setFocusNotToScene(state: ViewItemSlice){
        state.focusToScene = false
    }
  }
});

export const {resetFocusToScene, setFocusNotToScene} = ViewItemSlice.actions

export const focusToSceneSelector = (state: { viewItemState: ViewItemSlice}) => state.viewItemState.focusToScene