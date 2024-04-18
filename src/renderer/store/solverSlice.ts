import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SolverOutput } from '../model/esymiaModels';
import { takeAllProjectsIn } from './auxiliaryFunctions/managementProjectsAndFoldersFunction';
import { ProjectState } from './projectSlice';

export type SolverState = {
  activeSimulations: number,
  feedbackVisible: boolean
};

export const SolverSlice = createSlice({
  name: 'solver',
  initialState: {
    activeSimulations: 0,
    feedbackVisible: false
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
  },
});

export const {
  // qui vanno inserite tutte le azioni che vogliamo esporatare
  addActiveSimulation, removeActiveSimulation, toggleFeedbackVisible
} = SolverSlice.actions;

export const numberOfActiveSimulationsSelector = (state: { solver: SolverState }) => state.solver.activeSimulations
export const feedbackSimulationVisibleSelector = (state: { solver: SolverState }) => state.solver.feedbackVisible


