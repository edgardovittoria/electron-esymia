import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface StatusBarState {
    unit: string
}

export const StatusBarSlice = createSlice({
    name: 'statusBarSlice',
    initialState: {
        unit: "mm"
    } as StatusBarState,
    reducers: {
        setUnit(state: StatusBarState, action: PayloadAction<string>){
            state.unit = action.payload
        }
    }
})

export const {
    setUnit
} = StatusBarSlice.actions


export const unitSelector = (state: {statusBarSlice: StatusBarState}) => state.statusBarSlice.unit
