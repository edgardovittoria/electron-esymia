import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type OperationType =
    | 'CREATE_CUBE' | 'CREATE_SPHERE' | 'CREATE_CYLINDER' | 'CREATE_CONE' | 'CREATE_TORUS'
    | 'TRANSFORM'
    | 'UNION' | 'SUBTRACTION' | 'INTERSECTION'
    | 'GROUP' | 'UNGROUP' | 'CENTER_SELECTION'
    | 'DELETE'
    | 'LINEAR_PATTERN' | 'ATTACH'
    | 'IMPORT_STL' | 'IMPORT_PROJECT' | 'IMPORT_RIS'
    | 'ASSIGN_MATERIAL';

export interface HistoryNode {
    id: string; // UUID
    name: string; // User-friendly name (e.g., "Extrude 1")
    type: OperationType;
    params: any; // Specific parameters for the operation (e.g., { width: 10 })
    timestamp: number;
    outputKey: number; // The keyComponent of the entity resulting from this operation
    inputKeys: number[]; // Keys of entities consumed/modified by this operation
    suppressed: boolean;
}

export interface HistoryState {
    nodes: HistoryNode[]; // Ordered list of operations
    activeNodeId: string | null; // For "Rollback" functionality
    historyVisible: boolean;
}

const initialState: HistoryState = {
    nodes: [],
    activeNodeId: null,
    historyVisible: false
};

export const HistorySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        addNode(state, action: PayloadAction<HistoryNode>) {
            // If we are in a "rolled back" state, we must truncate the future nodes
            // to maintain a consistent linear history.
            if (state.activeNodeId === null) {
                // If activeNodeId is null, it means we rolled back to the beginning.
                // So we clear all nodes before adding the new one.
                state.nodes = [];
            } else {
                const activeIndex = state.nodes.findIndex(n => n.id === state.activeNodeId);
                if (activeIndex !== -1 && activeIndex < state.nodes.length - 1) {
                    // We are in the middle of the history. Truncate everything after activeIndex.
                    state.nodes = state.nodes.slice(0, activeIndex + 1);
                }
            }

            state.nodes.push(action.payload);
            state.activeNodeId = action.payload.id;
        },
        updateNodeParams(state, action: PayloadAction<{ id: string, params: any }>) {
            const node = state.nodes.find(n => n.id === action.payload.id);
            if (node) {
                node.params = { ...node.params, ...action.payload.params };
            }
        },
        toggleNodeSuppression(state, action: PayloadAction<string>) {
            const node = state.nodes.find(n => n.id === action.payload);
            if (node) {
                node.suppressed = !node.suppressed;
            }
        },
        setActiveNode(state, action: PayloadAction<string | null>) {
            state.activeNodeId = action.payload;
        },
        removeNode(state, action: PayloadAction<string>) {
            state.nodes = state.nodes.filter(n => n.id !== action.payload);
            if (state.activeNodeId === action.payload) {
                // If we removed the active node, set active to the last one available
                const lastNode = state.nodes[state.nodes.length - 1];
                state.activeNodeId = lastNode ? lastNode.id : null;
            }
        },
        undo(state) {
            if (state.activeNodeId) {
                const currentIndex = state.nodes.findIndex(n => n.id === state.activeNodeId);
                if (currentIndex > 0) {
                    state.activeNodeId = state.nodes[currentIndex - 1].id;
                } else {
                    state.activeNodeId = null; // Revert to initial state
                }
            }
        },
        redo(state) {
            if (state.nodes.length === 0) return;

            if (state.activeNodeId === null) {
                state.activeNodeId = state.nodes[0].id;
            } else {
                const currentIndex = state.nodes.findIndex(n => n.id === state.activeNodeId);
                if (currentIndex < state.nodes.length - 1) {
                    state.activeNodeId = state.nodes[currentIndex + 1].id;
                }
            }
        },
        resetHistory(state) {
            state.nodes = [];
            state.activeNodeId = null;
        },
        openHistory(state) {
            state.historyVisible = true;
        },
        closeHistory(state) {
            state.historyVisible = false;
        },
        toggleHistory(state) {
            state.historyVisible = !state.historyVisible;
        }
    }
});

export const {
    addNode,
    updateNodeParams,
    toggleNodeSuppression,
    setActiveNode,
    removeNode,
    resetHistory,
    openHistory,
    closeHistory,
    toggleHistory,
    undo,
    redo
} = HistorySlice.actions;

export const historyNodesSelector = (state: { history: HistoryState }) => state.history.nodes;
export const activeNodeIdSelector = (state: { history: HistoryState }) => state.history.activeNodeId;
export const historyVisibilitySelector = (state: { history: HistoryState }) => state.history.historyVisible;

import { AppDispatch, RootState } from '../../store';
import { recalculateCanvas } from '../services/historyEngine';
import { setCanvasState } from '../../cad_library';

export const rebuildHistory = () => (dispatch: AppDispatch, getState: () => RootState) => {
    const history = getState().history;
    const newCanvasState = recalculateCanvas(history);
    dispatch(setCanvasState(newCanvasState));
};
