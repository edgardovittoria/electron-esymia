import React, { Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { ThemeSelector } from '../../../../../../../store/tabsAndMenuItemsSlice';
import { Project } from '../../../../../../../model/esymiaModels';

interface SimulationTypeTabProps {
    selectedProject: Project;
    simulationType: 'Matrix' | 'Matrix_ACA' | 'Electric Fields';
    setsimulationType: Dispatch<SetStateAction<'Matrix' | 'Matrix_ACA' | 'Electric Fields'>>;
    electricField: boolean;
    setelectricField: Dispatch<SetStateAction<boolean>>;
    ports: boolean;
    setports: Dispatch<SetStateAction<boolean>>;
}

export const SimulationTypeTab: React.FC<SimulationTypeTabProps> = ({
    selectedProject,
    simulationType,
    setsimulationType,
    electricField,
    setelectricField,
    ports,
    setports,
}) => {
    const theme = useSelector(ThemeSelector);

    return (
        <div className="flex flex-col gap-4">
            {/* Matrix Option */}
            <div
                onClick={() => {
                    if (selectedProject.simulation?.status !== 'Completed') {
                        setsimulationType('Matrix');
                    }
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-center gap-3 ${simulationType === 'Matrix'
                    ? (theme === 'light' ? 'bg-blue-50 border-blue-500 shadow-md shadow-blue-500/10' : 'bg-blue-900/20 border-blue-500 shadow-md shadow-blue-500/10')
                    : (theme === 'light' ? 'bg-white border-gray-200 hover:border-blue-300' : 'bg-white/5 border-white/10 hover:border-white/30')
                    } ${selectedProject.simulation?.status === 'Completed' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${simulationType === 'Matrix'
                    ? 'border-blue-500'
                    : (theme === 'light' ? 'border-gray-400' : 'border-gray-500')
                    }`}>
                    {simulationType === 'Matrix' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                </div>
                <span className={`font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Matrix (S, Z, Y)</span>
            </div>

            {/* Matrix ACA Option */}
            <div
                onClick={() => {
                    if (selectedProject.simulation?.status !== 'Completed') {
                        setsimulationType('Matrix_ACA');
                    }
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex items-center gap-3 ${simulationType === 'Matrix_ACA'
                    ? (theme === 'light' ? 'bg-blue-50 border-blue-500 shadow-md shadow-blue-500/10' : 'bg-blue-900/20 border-blue-500 shadow-md shadow-blue-500/10')
                    : (theme === 'light' ? 'bg-white border-gray-200 hover:border-blue-300' : 'bg-white/5 border-white/10 hover:border-white/30')
                    } ${selectedProject.simulation?.status === 'Completed' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${simulationType === 'Matrix_ACA'
                    ? 'border-blue-500'
                    : (theme === 'light' ? 'border-gray-400' : 'border-gray-500')
                    }`}>
                    {simulationType === 'Matrix_ACA' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                </div>
                <span className={`font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Matrix (S, Z, Y) ACA</span>
            </div>

            {/* Electric Fields Option */}
            <div
                onClick={() => {
                    if (selectedProject.simulation?.status !== 'Completed') {
                        setsimulationType('Electric Fields');
                    }
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col gap-3 ${simulationType === 'Electric Fields'
                    ? (theme === 'light' ? 'bg-blue-50 border-blue-500 shadow-md shadow-blue-500/10' : 'bg-blue-900/20 border-blue-500 shadow-md shadow-blue-500/10')
                    : (theme === 'light' ? 'bg-white border-gray-200 hover:border-blue-300' : 'bg-white/5 border-white/10 hover:border-white/30')
                    } ${selectedProject.simulation?.status === 'Completed' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${simulationType === 'Electric Fields'
                        ? 'border-blue-500'
                        : (theme === 'light' ? 'border-gray-400' : 'border-gray-500')
                        }`}>
                        {simulationType === 'Electric Fields' && <div className="w-3 h-3 rounded-full bg-blue-500" />}
                    </div>
                    <span className={`font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Electric Fields</span>
                </div>

                {/* Sub-options */}
                {simulationType === 'Electric Fields' && (
                    <div className={`ml-8 flex flex-col gap-2 p-3 rounded-lg ${theme === 'light' ? 'bg-white/50' : 'bg-black/20'}`}>
                        {/* Electric Field Checkbox */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${electricField
                                ? 'bg-blue-500 border-blue-500'
                                : (theme === 'light' ? 'border-gray-400 bg-white group-hover:border-blue-400' : 'border-gray-500 bg-transparent group-hover:border-blue-400')
                                }`}>
                                {electricField && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                disabled={selectedProject.simulation?.status === 'Completed'}
                                checked={electricField}
                                onChange={() => setelectricField(!electricField)}
                            />
                            <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Electric Field</span>
                        </label>

                        {/* Ports Checkbox */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${ports
                                ? 'bg-blue-500 border-blue-500'
                                : (theme === 'light' ? 'border-gray-400 bg-white group-hover:border-blue-400' : 'border-gray-500 bg-transparent group-hover:border-blue-400')
                                }`}>
                                {ports && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                disabled={selectedProject.simulation?.status === 'Completed'}
                                checked={ports}
                                onChange={() => setports(!ports)}
                            />
                            <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Ports</span>
                        </label>

                        {!(electricField || ports) && (
                            <div className="flex items-center gap-2 text-red-500 text-xs mt-1 bg-red-500/10 p-2 rounded">
                                <IoMdInformationCircleOutline size={14} />
                                <span>Select at least one option</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
