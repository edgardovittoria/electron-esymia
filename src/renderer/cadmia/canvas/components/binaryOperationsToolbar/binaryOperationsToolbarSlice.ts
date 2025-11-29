import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setModality } from "../cadmiaModality/cadmiaModalitySlice";
import { BinaryOperationType } from "../../../../cad_library";


export type SelectedFace = {
    objectUUID: string,
    faceIndex: number,
    normal: number[], // Serialized Vector3
    point: number[],   // Serialized Vector3
    vertices: number[][] // Array of 3 points, each [x, y, z]
}

export type BinaryOperationsToolbarState = {
    binaryOp: string | undefined,
    entities: number[],
    visible: boolean,
    attachMode: boolean,
    selectedFaces: SelectedFace[]
}

export const BinaryOperationsToolbarSlice = createSlice({
    name: 'binaryOperationsToolbar',
    initialState: {
        binaryOp: undefined,
        entities: [],
        visible: true,
        attachMode: false,
        selectedFaces: []
    } as BinaryOperationsToolbarState,
    reducers: {
        setBinaryOp(state: BinaryOperationsToolbarState, action: PayloadAction<BinaryOperationType>) {
            state.binaryOp = action.payload
        },
        toggleEntitySelectionForBinaryOp(state: BinaryOperationsToolbarState, action: PayloadAction<number>) {
            if (state.entities.filter(entity => entity === action.payload).length > 0) {
                let entities = state.entities.filter(entity => entity !== action.payload)
                state.entities = entities
            }
            else {
                state.entities.push(action.payload)
            }
        },
        openBinaryOperationsToolbar(state: BinaryOperationsToolbarState) {
            state.visible = true
        },
        closeBinaryOperationsToolbar(state: BinaryOperationsToolbarState) {
            state.visible = false
        },
        toggleAttachMode(state: BinaryOperationsToolbarState) {
            state.attachMode = !state.attachMode
            state.selectedFaces = [] // Reset selection when toggling
        },
        addSelectedFace(state: BinaryOperationsToolbarState, action: PayloadAction<SelectedFace>) {
            if (state.selectedFaces.length < 2) {
                state.selectedFaces.push(action.payload);
            }
        },
        resetSelectedFaces(state: BinaryOperationsToolbarState) {
            state.selectedFaces = [];
        }
    },
    extraReducers(builder) {
        builder.addCase(setModality, (state, action) => {
            if (action.payload !== 'BinaryOperation') {
                state.binaryOp = undefined
                state.entities = []
                state.attachMode = false
                state.selectedFaces = []
            }
        })
    },
})

export const {
    //qui vanno inserite tutte le azioni che vogliamo esporatare
    setBinaryOp, toggleEntitySelectionForBinaryOp, closeBinaryOperationsToolbar, openBinaryOperationsToolbar, toggleAttachMode, addSelectedFace, resetSelectedFaces
} = BinaryOperationsToolbarSlice.actions

export const binaryOpSelector = (state: { binaryOperationsToolbar: BinaryOperationsToolbarState }) => state.binaryOperationsToolbar.binaryOp
export const binaryOpToolbarVisibilitySelector = (state: { binaryOperationsToolbar: BinaryOperationsToolbarState }) => state.binaryOperationsToolbar.visible
export const binaryOpEntitiesKeysSelector = (state: { binaryOperationsToolbar: BinaryOperationsToolbarState }) => state.binaryOperationsToolbar.entities
export const attachModeSelector = (state: { binaryOperationsToolbar: BinaryOperationsToolbarState }) => state.binaryOperationsToolbar.attachMode
export const selectedFacesSelector = (state: { binaryOperationsToolbar: BinaryOperationsToolbarState }) => state.binaryOperationsToolbar.selectedFaces
