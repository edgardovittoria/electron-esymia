import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeSelector } from '../../../../../../store/tabsAndMenuItemsSlice';
import { selectedProjectSelector } from '../../../../../../store/projectSlice';
import {
    convergenceTresholdSelector,
    setConvergenceTreshold,
    setSolverIterations,
    setSolverType,
    solverIterationsSelector,
} from '../../../../../../store/solverSlice';

export const SolverParameters: React.FC = () => {
    const theme = useSelector(ThemeSelector);
    const selectedProject = useSelector(selectedProjectSelector);
    const solverIterations = useSelector(solverIterationsSelector);
    const convergenceThreshold = useSelector(convergenceTresholdSelector);
    const dispatch = useDispatch();

    return (
        <div className={`p-4 mt-3 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
            <div className="p-2">
                <h6 className="text-sm font-medium mb-2 opacity-80">Solver Type</h6>
                <select
                    disabled={selectedProject?.simulation?.status === 'Completed'}
                    className={`w-full p-2 rounded-lg text-sm font-medium outline-none transition-all ${theme === 'light'
                        ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
                        }`}
                    onChange={(e) => {
                        dispatch(setSolverType(parseInt(e.target.value) as 1 | 2));
                    }}
                    defaultValue={2}
                >
                    <option value={2}>Rcc delayed coefficents computation</option>
                    <option value={1}>Quasi static coefficents computation</option>
                </select>
            </div>
            <div className="mt-3 p-2">
                <h6 className="text-sm font-medium mb-2 opacity-80">Solver Iterations</h6>
                <div className="flex justify-between gap-4 mt-2">
                    <div className="w-[45%]">
                        <span className="text-xs font-bold opacity-70 mb-1 block">Outer</span>
                        <input
                            disabled={
                                selectedProject?.simulation?.status === 'Completed' ||
                                selectedProject?.meshData.meshGenerated !== 'Generated'
                            }
                            min={1}
                            type="number"
                            step={1}
                            value={
                                selectedProject?.simulation
                                    ? isNaN(
                                        selectedProject.simulation.solverAlgoParams
                                            .outerIteration,
                                    )
                                        ? 0
                                        : selectedProject.simulation.solverAlgoParams
                                            .outerIteration
                                    : solverIterations[1]
                            }
                            className={`w-full p-1.5 text-center rounded-lg text-sm font-bold outline-none border transition-all ${theme === 'light'
                                ? 'bg-white border-gray-200 focus:border-blue-500'
                                : 'bg-black/40 border-white/10 focus:border-blue-500 text-white'
                                }`}
                            onChange={(e) => {
                                dispatch(
                                    setSolverIterations([
                                        solverIterations[0],
                                        parseInt(e.target.value),
                                    ]),
                                );
                            }}
                        />
                    </div>
                    <div className="w-[45%]">
                        <span className="text-xs font-bold opacity-70 mb-1 block">Inner</span>
                        <input
                            disabled={
                                selectedProject?.simulation?.status === 'Completed' ||
                                selectedProject?.meshData.meshGenerated !== 'Generated'
                            }
                            min={1}
                            type="number"
                            step={1}
                            value={
                                selectedProject?.simulation
                                    ? isNaN(
                                        selectedProject.simulation.solverAlgoParams
                                            .innerIteration,
                                    )
                                        ? 0
                                        : selectedProject.simulation.solverAlgoParams
                                            .innerIteration
                                    : solverIterations[0]
                            }
                            className={`w-full p-1.5 text-center rounded-lg text-sm font-bold outline-none border transition-all ${theme === 'light'
                                ? 'bg-white border-gray-200 focus:border-blue-500'
                                : 'bg-black/40 border-white/10 focus:border-blue-500 text-white'
                                }`}
                            onChange={(e) => {
                                dispatch(
                                    setSolverIterations([
                                        parseInt(e.target.value),
                                        solverIterations[1],
                                    ]),
                                );
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="mt-3 p-2">
                <h6 className="text-sm font-medium mb-2 opacity-80">Convergence Threshold</h6>
                <input
                    disabled={
                        selectedProject?.simulation?.status === 'Completed' ||
                        selectedProject?.meshData.meshGenerated !== 'Generated'
                    }
                    min={0}
                    type="number"
                    step={0.000000001}
                    value={
                        selectedProject?.simulation
                            ? isNaN(
                                selectedProject.simulation.solverAlgoParams
                                    .convergenceThreshold,
                            )
                                ? 0
                                : selectedProject.simulation.solverAlgoParams
                                    .convergenceThreshold
                            : convergenceThreshold
                    }
                    className={`w-full p-1.5 text-center rounded-lg text-sm font-bold outline-none border transition-all ${theme === 'light'
                        ? 'bg-white border-gray-200 focus:border-blue-500'
                        : 'bg-black/40 border-white/10 focus:border-blue-500 text-white'
                        }`}
                    onChange={(e) => {
                        dispatch(
                            setConvergenceTreshold(parseFloat(e.target.value)),
                        );
                    }}
                />
            </div>
        </div>
    );
};
