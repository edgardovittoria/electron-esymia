import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TransformationType } from "./transformationsTypes";

type TransformationItem = {
    type: TransformationType,
    active: boolean
}

export type TransformationsToolbarState = {
    transformations: TransformationItem[],
    visible: boolean
}

export const TransformationsToolbarSlice = createSlice({
    name: 'transformationsToolbar',
    initialState: {
        transformations: [
            {
                type: 'translate',
                active: true,
            },
            {
                type: 'rotate',
                active: false,
            },
            {
                type: 'scale',
                active: false,
            }],
      visible: false
    } as TransformationsToolbarState,
    reducers: {
        setTransformationActive(transformationState: TransformationsToolbarState, action: PayloadAction<TransformationType>) {
            transformationState.transformations = transformationState.transformations.map(t => (t.type === action.payload) ? { ...t, active: true } : { ...t, active: false })
        },
        setNextTransformationActive(state: TransformationsToolbarState) {
            let indexTransformationToActivate = (state.transformations.indexOf(state.transformations.filter(transformation => transformation.type === getActiveTransformationWithin(state).type)[0]) + 1) % state.transformations.length;
            state.transformations = state.transformations.map((t, index) => (index === indexTransformationToActivate) ? { ...t, active: true } : { ...t, active: false })
        },
        openTransformationsToolbar(state: TransformationsToolbarState){
            state.visible = true
        },
        closeTransformationsToolbar(state: TransformationsToolbarState){
            state.visible = false
        },
        toggleTransformationsToolbar(state: TransformationsToolbarState){
            state.visible = !state.visible
        }
    }
})

export const {
    //qui vanno inserite tutte le azioni che vogliamo esporatare
    setTransformationActive, setNextTransformationActive, closeTransformationsToolbar, openTransformationsToolbar, toggleTransformationsToolbar
} = TransformationsToolbarSlice.actions

export const transformationsSelector = (state: { transformationsToolbar: TransformationsToolbarState }) => state.transformationsToolbar.transformations
export const transformationsToolbarVisibilitySelector = (state: { transformationsToolbar: TransformationsToolbarState }) => state.transformationsToolbar.visible
export const activeTransformationSelector = (state: { transformationsToolbar: TransformationsToolbarState }) => getActiveTransformationWithin(state.transformationsToolbar)
const getActiveTransformationWithin = (state: TransformationsToolbarState) => state.transformations.filter(t => t.active)[0]
