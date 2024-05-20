import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ObjectsDetailsState = {
    objectsDetailsVisible: boolean,
    meshesWithBordersVisible: number[]
    invisibleMeshes: number[]
}

export const ObjectsDetailsSlice = createSlice({
  name: 'objectsDetails',
  initialState:{
    objectsDetailsVisible: true,
    meshesWithBordersVisible: [],
    invisibleMeshes: []
  } as ObjectsDetailsState,
  reducers: {
    openObjectsDetails(state: ObjectsDetailsState){
        state.objectsDetailsVisible = true
    },
    closeObjectsDetails(state: ObjectsDetailsState){
        state.objectsDetailsVisible = false
    },
    toggleObjectsDetails(state: ObjectsDetailsState){
        state.objectsDetailsVisible = !state.objectsDetailsVisible
    },
    enableBordersForComponent(state: ObjectsDetailsState, action: PayloadAction<number>){
        state.meshesWithBordersVisible.push(action.payload)
    },
    disableBordersForComponent(state: ObjectsDetailsState, action: PayloadAction<number>){
        state.meshesWithBordersVisible = state.meshesWithBordersVisible.filter(mb => mb !== action.payload)
    },
    setMeshInvisible(state: ObjectsDetailsState, action: PayloadAction<number>){
      state.invisibleMeshes.push(action.payload)
    },
    setMeshVisible(state: ObjectsDetailsState, action: PayloadAction<number>){
      state.invisibleMeshes = state.invisibleMeshes.filter(key => key !== action.payload)
    }
  }
});

export const {closeObjectsDetails, disableBordersForComponent, enableBordersForComponent, openObjectsDetails, toggleObjectsDetails, setMeshInvisible, setMeshVisible} = ObjectsDetailsSlice.actions

export const objectsDetailsVisibilitySelector = (state: {objectsDetails: ObjectsDetailsState}) => state.objectsDetails.objectsDetailsVisible
export const meshesWithBordersVisibleSelector = (state: {objectsDetails: ObjectsDetailsState}) => state.objectsDetails.meshesWithBordersVisible
export const invisibleMeshesSelector = (state: {objectsDetails: ObjectsDetailsState}) => state.objectsDetails.invisibleMeshes
