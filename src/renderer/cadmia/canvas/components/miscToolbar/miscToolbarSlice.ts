import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { setModality } from '../cadmiaModality/cadmiaModalitySlice';

export type MiscToolbarState = {
  visible: boolean
  multipleSelectionEntities: number[]
}

export const MiscToolbarSlice = createSlice({
  name: 'miscToolbar',
  initialState: {
    visible: true,
    multipleSelectionEntities: []
  } as MiscToolbarState,
  reducers: {
    openMiscToolbar(state: MiscToolbarState) {
      state.visible = true
    },
    closeMiscToolbar(state: MiscToolbarState) {
      state.visible = false
    },
    toggleMiscToolbar(state: MiscToolbarState) {
      state.visible = !state.visible
    },
    toggleEntitySelectionForMultipleSelection(state: MiscToolbarState, action: PayloadAction<number>) {
      if (state.multipleSelectionEntities.filter(entity => entity === action.payload).length > 0) {
        let entities = state.multipleSelectionEntities.filter(entity => entity !== action.payload)
        state.multipleSelectionEntities = entities
      }
      else {
        state.multipleSelectionEntities.push(action.payload)
      }
    },
    resetMultipleSelectionEntities(state: MiscToolbarState){
      state.multipleSelectionEntities = []
    }
  },
  extraReducers(builder) {
      builder.addCase(setModality, (state, action) => {
        if(action.payload !== 'MultipleSelection'){
          state.multipleSelectionEntities = []
        }
      })
  },
});

export const { closeMiscToolbar, openMiscToolbar, toggleMiscToolbar, toggleEntitySelectionForMultipleSelection, resetMultipleSelectionEntities } = MiscToolbarSlice.actions

export const miscToolbarVisibilitySelector = (state: { miscToolbar: MiscToolbarState }) => state.miscToolbar.visible
export const multipleSelectionEntitiesKeysSelector = (state: { miscToolbar: MiscToolbarState }) => state.miscToolbar.multipleSelectionEntities
