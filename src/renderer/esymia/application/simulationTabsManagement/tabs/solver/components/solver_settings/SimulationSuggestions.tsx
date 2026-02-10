import React from 'react';
import { useSelector } from 'react-redux';
import { MdErrorOutline } from 'react-icons/md';
import { IoMdWarning } from 'react-icons/io';
import { selectedProjectSelector } from '../../../../../../store/projectSlice';
import { SolverStatusSelector } from '../../../../../../store/pluginsSlice';
import { ThemeSelector } from '../../../../../../store/tabsAndMenuItemsSlice';

interface SimulationSuggestionsProps {
    simulationType: 'Matrix' | 'Matrix_ACA' | 'Electric Fields';
}

export const SimulationSuggestions: React.FC<SimulationSuggestionsProps> = ({
    simulationType,
}) => {
    const selectedProject = useSelector(selectedProjectSelector);
    const solverStatus = useSelector(SolverStatusSelector);
    const theme = useSelector(ThemeSelector);

    return (
        <div className="flex flex-col gap-2 mt-2">
            {solverStatus !== 'ready' && (
                <div className={`flex items-center gap-3 p-3 mb-2 rounded-xl border ${theme === 'light'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    <MdErrorOutline size={20} className="flex-shrink-0" />
                    <span className="text-sm font-medium">Solver is offline. Start the solver to proceed.</span>
                </div>
            )}
            {selectedProject?.frequencies?.length === 0 && (
                <div className={`flex items-center gap-3  mb-2 p-3 rounded-xl border ${theme === 'light'
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                    <IoMdWarning size={20} className="flex-shrink-0" />
                    <span className="text-sm font-medium">Set frequencies to start simulation.</span>
                </div>
            )}
            {simulationType === 'Matrix' && !selectedProject?.portsS3 && (
                <div className={`flex items-center gap-3 mb-2 p-3 rounded-xl border ${theme === 'light'
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                    <IoMdWarning size={20} className="flex-shrink-0" />
                    <span className="text-sm font-medium">Set ports to start simulation.</span>
                </div>
            )}
            {simulationType === 'Electric Fields' &&
                !selectedProject?.planeWaveParameters && (
                    <div className={`flex items-center gap-3  mb-2 p-3 rounded-xl border ${theme === 'light'
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                        <IoMdWarning size={20} className="flex-shrink-0" />
                        <span className="text-sm font-medium">Set plane wave parameters to start simulation.</span>
                    </div>
                )}
        </div>
    );
};
