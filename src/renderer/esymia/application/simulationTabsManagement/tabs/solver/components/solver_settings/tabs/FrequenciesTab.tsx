import React from 'react';
import { useSelector } from 'react-redux';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { ThemeSelector } from '../../../../../../../store/tabsAndMenuItemsSlice';
import { selectedProjectSelector } from '../../../../../../../store/projectSlice';
import FrequenciesDef from '../../../../physics/frequenciesDef/FrequenciesDef';
import { FrequenciesImportFromCSV } from '../../../../physics/ImportPhysicsFromCSV';
import { TimeRangeDef } from '../TimeRangeDef';

interface FrequenciesTabProps {
    simulationType: 'Matrix' | 'Matrix_ACA' | 'Electric Fields';
    savedPhysicsParameters: boolean;
    setSavedPhysicsParameters: Function;
}

export const FrequenciesTab: React.FC<FrequenciesTabProps> = ({
    simulationType,
    savedPhysicsParameters,
    setSavedPhysicsParameters,
}) => {
    const theme = useSelector(ThemeSelector);
    const selectedProject = useSelector(selectedProjectSelector);

    if (simulationType === 'Matrix' || simulationType === 'Matrix_ACA') {
        return (
            <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
                <FrequenciesImportFromCSV />
                <FrequenciesDef
                    disabled={selectedProject?.simulation?.status === 'Completed'}
                    setSavedPhysicsParameters={setSavedPhysicsParameters}
                />
                <div className="flex mt-4 flex-row gap-2 items-center">
                    <button
                        data-testid="savePhysics"
                        type="button"
                        className={`w-full py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${theme === 'light'
                            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-500/20'
                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20'
                            } disabled:opacity-60 disabled:cursor-not-allowed`}
                        onClick={() => setSavedPhysicsParameters(true)}
                        disabled={savedPhysicsParameters}
                    >
                        SAVE ON DB
                    </button>
                    <div
                        className="tooltip tooltip-left"
                        data-tip="Salvare i parametri sul server non è obbligatorio per lanciare la simulazione ora."
                    >
                        <IoMdInformationCircleOutline size={20} className="opacity-60 hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
            <TimeRangeDef
                disabled={selectedProject?.simulation?.status === 'Completed'}
                setSavedPhysicsParameters={setSavedPhysicsParameters}
            />
            <div className="flex mt-4 flex-row gap-2 items-center">
                <button
                    data-testid="savePhysics"
                    type="button"
                    className={`w-full py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${theme === 'light'
                        ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                    onClick={() => setSavedPhysicsParameters(true)}
                    disabled={savedPhysicsParameters}
                >
                    SAVE ON DB
                </button>
                <div
                    className="tooltip tooltip-left"
                    data-tip="Salvare i parametri sul server non è obbligatorio per lanciare la simulazione ora."
                >
                    <IoMdInformationCircleOutline size={20} className="opacity-60 hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </div>
    );
};
