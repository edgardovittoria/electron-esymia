import React, { useState, Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import * as THREE from 'three';
import { ThemeSelector } from '../../../../../../../store/tabsAndMenuItemsSlice';
import { selectedProjectSelector, findSelectedPort } from '../../../../../../../store/projectSlice';
import { PortImportFromCSV, LumpedImportFromCSV } from '../../../../physics/ImportPhysicsFromCSV';
import { CreatePorts } from '../../../../physics/portManagement/selectPorts/CreatePorts';
import { PhysicsLeftPanelTab } from '../../../../physics/PhysicsLeftPanelTab';
import { PortManagement } from '../../../../physics/portManagement/PortManagement';
import { PortType } from '../../../../physics/portManagement/components/PortType';
import { RLCParamsComponent } from '../../../../physics/portManagement/components/RLCParamsComponent';
import { PortPosition } from '../../../../physics/portManagement/components/PortPosition';
import { ModalSelectPortType } from '../../../../physics/portManagement/ModalSelectPortType';
import ScatteringParameter from '../../../../physics/portManagement/components/ScatteringParameter';
import { ExportPhisicsToCSV } from '../../../../physics/ImportExportPhysicsSetup';
import { Project, TempLumped, Port } from '../../../../../../../model/esymiaModels';
import { InputGraphData } from '../../ShowInputGraphModal';
import { PortSignal } from '../../planeWave/SolverSignal';

type SetGraphData = Dispatch<SetStateAction<InputGraphData | undefined>>;

interface PortsTabProps {
    simulationType: 'Matrix' | 'Matrix_ACA' | 'Electric Fields';
    cameraPosition: THREE.Vector3;
    savedPhysicsParameters: boolean;
    setSavedPhysicsParameters: Function;
    setGraphData?: SetGraphData;
    setResetFocus: Function;
}

export const PortsTab: React.FC<PortsTabProps> = ({
    simulationType,
    cameraPosition,
    savedPhysicsParameters,
    setSavedPhysicsParameters,
    setGraphData,
    setResetFocus,
}) => {
    const theme = useSelector(ThemeSelector);
    const selectedProject = useSelector(selectedProjectSelector);
    const selectedPort = findSelectedPort(selectedProject);
    const [showModalSelectPortType, setShowModalSelectPortType] = useState<boolean>(false);

    return (
        <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
            <div className="flex flex-row items-center gap-4 mb-4">
                <PortImportFromCSV />
                <LumpedImportFromCSV />
                <ExportPhisicsToCSV />
            </div>
            <div className="flex flex-row items-center gap-4 mb-4">
                <CreatePorts
                    selectedProject={selectedProject as Project}
                    cameraPosition={cameraPosition}
                    setResetFocus={setResetFocus}
                />
            </div>
            <PhysicsLeftPanelTab />
            {selectedPort?.category === 'lumped' ? (
                <PortManagement selectedPort={selectedPort}>
                    <PortType
                        disabled={selectedProject?.simulation?.status === 'Completed'}
                        setShow={setShowModalSelectPortType}
                        selectedPort={selectedPort as TempLumped}
                    />
                    <RLCParamsComponent
                        selectedPort={selectedPort as TempLumped}
                        disabled={selectedProject?.simulation?.status === 'Completed'}
                        setSavedPortParameters={setSavedPhysicsParameters}
                    />
                    <PortPosition
                        selectedPort={selectedPort as TempLumped}
                        disabled={selectedProject?.simulation?.status === 'Completed'}
                        setSavedPortParameters={setSavedPhysicsParameters}
                    />
                    {selectedProject?.simulation?.status !== 'Completed' && (
                        <ModalSelectPortType
                            show={showModalSelectPortType}
                            setShow={setShowModalSelectPortType}
                            selectedPort={selectedPort as TempLumped}
                            setSavedPortParameters={setSavedPhysicsParameters}
                        />
                    )}
                </PortManagement>
            ) : (
                <PortManagement selectedPort={selectedPort}>
                    <ScatteringParameter
                        setSavedPortParameters={setSavedPhysicsParameters}
                    />
                    {simulationType === 'Electric Fields' && setGraphData && (
                        <PortSignal
                            setSavedPhysicsParameters={setSavedPhysicsParameters}
                            signal={
                                selectedPort?.signal && selectedPort?.signal.type
                                    ? selectedPort?.signal
                                    : ({ type: 'no_signal', params: {} } as any)
                            }
                            setGraphData={setGraphData}
                        />
                    )}
                    <PortPosition
                        selectedPort={selectedPort as Port | TempLumped}
                        disabled={selectedProject?.simulation?.status === 'Completed'}
                        setSavedPortParameters={setSavedPhysicsParameters}
                    />
                </PortManagement>
            )}
            {selectedPort && (
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
            )}
        </div>
    );
};
