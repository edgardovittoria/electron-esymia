import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SolverOutput } from '../model/esymiaModels';
import { takeAllProjectsIn } from './auxiliaryFunctions/managementProjectsAndFoldersFunction';
import { ProjectState } from './projectSlice';

export type SolverState = {
  activeSimulations: number,
  feedbackVisible: boolean,
  solverIterations: [number, number],
  convergenceTreshold: number
};

export const SolverSlice = createSlice({
  name: 'solver',
  initialState: {
    activeSimulations: 0,
    feedbackVisible: false,
    solverIterations: [1, 100],
    convergenceTreshold: 0.0001
  } as SolverState,
  reducers: {
    addActiveSimulation(state: SolverState){
      state.activeSimulations += 1
    },
    removeActiveSimulation(state: SolverState){
      state.activeSimulations -= 1
    },
    toggleFeedbackVisible(state: SolverState){
      state.feedbackVisible = !state.feedbackVisible
    },
    setSolverIterations(state: SolverState, action: PayloadAction<[number, number]>){
      state.solverIterations = action.payload
    },
    setConvergenceTreshold(state: SolverState, action: PayloadAction<number>){
      state.convergenceTreshold = action.payload
    }
  },
});

export const {
  // qui vanno inserite tutte le azioni che vogliamo esporatare
  setSolverIterations, setConvergenceTreshold
} = SolverSlice.actions;

export const numberOfActiveSimulationsSelector = (state: { solver: SolverState }) => state.solver.activeSimulations
export const feedbackSimulationVisibleSelector = (state: { solver: SolverState }) => state.solver.feedbackVisible
export const solverIterationsSelector = (state: { solver: SolverState }) => state.solver.solverIterations
export const convergenceTresholdSelector = (state: { solver: SolverState }) => state.solver.convergenceTreshold


