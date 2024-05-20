import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CadmiaModality } from './cadmiaModalityType';



export type CadmiaModalityState = {
    modality: CadmiaModality
}

export const CadmiaModalitySlice = createSlice({
  name: 'cadmiaModality',
  initialState:{
    modality: 'NormalSelection',
  } as CadmiaModalityState,
  reducers: {
    setModality(state: CadmiaModalityState, action: PayloadAction<CadmiaModality>){
        state.modality = action.payload
    }
  }
});

export const {setModality} = CadmiaModalitySlice.actions

export const cadmiaModalitySelector = (state: { cadmiaModality: CadmiaModalityState}) => state.cadmiaModality.modality