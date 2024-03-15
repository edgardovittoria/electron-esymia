import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SolverOutput } from '../model/esymiaModels';

export type SolverState = {
  output: SolverOutput | undefined;
  simulationStatus: 'notStarted' | 'started' | 'completed';
  downloadPercentage: number;
  test: {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
  };
};

export const SolverSlice = createSlice({
  name: 'solver',
  initialState: {
    output: undefined,
    simulationStatus: 'notStarted',
    downloadPercentage: 0,
    test: {
      userId: 0,
      id: 0,
      title: '',
      completed: false,
    },
  } as SolverState,
  reducers: {
    setSolverOutput(state: SolverState, action: PayloadAction<SolverOutput>) {
      state.output = action.payload;
    },
    setSimulationStatus(
      state: SolverState,
      action: PayloadAction<'notStarted' | 'started' | 'completed'>,
    ) {
      state.simulationStatus = action.payload;
    },
    setSolverDownloadPercentage(
      state: SolverState,
      action: PayloadAction<number>,
    ) {
      state.downloadPercentage = action.payload;
    },
    setTest(
      state: SolverState,
      action: PayloadAction<{
        userId: number;
        id: number;
        title: string;
        completed: boolean;
      }>,
    ) {
      state.test = action.payload;
    },
  },
  //     extraReducers: {
  //         //qui inseriamo i metodi : PENDING, FULLFILLED, REJECT utili per la gestione delle richieste asincrone
  // }
});

export const {
  // qui vanno inserite tutte le azioni che vogliamo esporatare
  setSolverOutput,
  setSimulationStatus,
  setSolverDownloadPercentage,
  setTest,
} = SolverSlice.actions;

export const SolverOutputSelector = (state: { solver: SolverState }) =>
  state.solver.output;
export const SimulationStatusSelector = (state: { solver: SolverState }) =>
  state.solver.simulationStatus;
export const SolverDownloadPercentageSelector = (state: {
  solver: SolverState;
}) => state.solver.downloadPercentage;

export const TestSelector = (state: {
  solver: SolverState;
}) => state.solver.test;

