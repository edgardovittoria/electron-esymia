import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setModality } from "../cadmiaModality/cadmiaModalitySlice";

export type MeasurementState = {
    points: number[][], // Array of [x, y, z]
    distance: number | null
}

export const MeasurementSlice = createSlice({
    name: 'measurement',
    initialState: {
        points: [],
        distance: null
    } as MeasurementState,
    reducers: {
        addPoint(state: MeasurementState, action: PayloadAction<number[]>) {
            if (state.points.length >= 2) {
                // Reset if we already have 2 points and user clicks again
                state.points = [action.payload];
                state.distance = null;
            } else {
                state.points.push(action.payload);
                if (state.points.length === 2) {
                    const p1 = state.points[0];
                    const p2 = state.points[1];
                    const dx = p2[0] - p1[0];
                    const dy = p2[1] - p1[1];
                    const dz = p2[2] - p1[2];
                    state.distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                }
            }
        },
        resetMeasurement(state: MeasurementState) {
            state.points = [];
            state.distance = null;
        }
    },
    extraReducers(builder) {
        builder.addCase(setModality, (state, action) => {
            if (action.payload !== 'Measurement') {
                state.points = [];
                state.distance = null;
            }
        })
    },
})

export const { addPoint, resetMeasurement } = MeasurementSlice.actions;

export const measurementPointsSelector = (state: { measurement: MeasurementState }) => state.measurement.points;
export const measurementDistanceSelector = (state: { measurement: MeasurementState }) => state.measurement.distance;
