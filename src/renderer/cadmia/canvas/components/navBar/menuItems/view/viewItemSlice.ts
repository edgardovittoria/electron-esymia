import { createSlice } from '@reduxjs/toolkit'


export type ViewItemSlice = {
  focusToScene: number
}

export const ViewItemSlice = createSlice({
  name: 'viewItemState',
  initialState: {
    focusToScene: 0
  } as ViewItemSlice,
  reducers: {
    resetFocusToScene(state: ViewItemSlice) {
      state.focusToScene += 1
    },
    setFocusNotToScene(state: ViewItemSlice) {
      // No-op: focus is now triggered by incrementing the counter
    }
  }
});

export const { resetFocusToScene, setFocusNotToScene } = ViewItemSlice.actions

export const focusToSceneSelector = (state: { viewItemState: ViewItemSlice }) => state.viewItemState.focusToScene