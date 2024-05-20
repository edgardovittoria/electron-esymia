import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BinaryOperationType } from "cad-library";
import { setModality } from "../cadmiaModality/cadmiaModalitySlice";


export type BinaryOperationsToolbarState = {
    binaryOp: string | undefined,
    entities: number[],
    visible: boolean
}

export const BinaryOperationsToolbarSlice = createSlice({
    name: 'binaryOperationsToolbar',
    initialState: {
        binaryOp: undefined,
        entities: [],
        visible: true
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
        openBinaryOperationsToolbar(state: BinaryOperationsToolbarState){
            state.visible = true
        },
        closeBinaryOperationsToolbar(state: BinaryOperationsToolbarState){
            state.visible = false
        }
    },
    extraReducers(builder) {
        builder.addCase(setModality, (state, action) => {
            if(action.payload !== 'BinaryOperation'){
                state.binaryOp = undefined
                state.entities = []
            }
        })
    },
})

export const {
    //qui vanno inserite tutte le azioni che vogliamo esporatare
    setBinaryOp, toggleEntitySelectionForBinaryOp, closeBinaryOperationsToolbar, openBinaryOperationsToolbar
} = BinaryOperationsToolbarSlice.actions

export const binaryOpSelector = (state: {binaryOperationsToolbar: BinaryOperationsToolbarState}) => state.binaryOperationsToolbar.binaryOp
export const binaryOpToolbarVisibilitySelector = (state: {binaryOperationsToolbar: BinaryOperationsToolbarState}) => state.binaryOperationsToolbar.visible
export const binaryOpEntitiesKeysSelector = (state: {binaryOperationsToolbar: BinaryOperationsToolbarState}) => state.binaryOperationsToolbar.entities
