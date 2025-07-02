import React, { useState, Dispatch, SetStateAction, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TbServerBolt } from 'react-icons/tb';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { FaLock, FaLockOpen } from 'react-icons/fa6';
import { DebounceInput } from 'react-debounce-input';
import * as THREE from 'three';

import {
  activeSimulationsSelector,
  addInterestFrequencyIndex,
  findSelectedPort,
  removeInterestFrequencyIndex,
  resetInterestFrequencyIndex,
  selectedProjectSelector,
  setFrequencies,
  setMeshApproved,
  setTimes,
  updateSimulation,
} from '../../../../../store/projectSlice';
import {
  selectMenuItem,
  setShowSaveProjectResultsModal,
  showSaveProjectResultsModalSelector,
  ThemeSelector,
} from '../../../../../store/tabsAndMenuItemsSlice';
import {
  convergenceTresholdSelector,
  setConvergenceTreshold,
  setSolverIterations,
  setSolverType,
  solverIterationsSelector,
  solverTypeSelector,
} from '../../../../../store/solverSlice';
import FrequenciesDef from '../../physics/frequenciesDef/FrequenciesDef';
import {
  FrequenciesImportFromCSV,
  LumpedImportFromCSV,
  PortImportFromCSV,
} from '../../physics/ImportPhysicsFromCSV';
import { CreatePorts } from '../../physics/portManagement/selectPorts/CreatePorts';
import { PhysicsLeftPanelTab } from '../../physics/PhysicsLeftPanelTab';
import { PortPosition } from '../../physics/portManagement/components/PortPosition';
import { PortType } from '../../physics/portManagement/components/PortType';
import { RLCParamsComponent } from '../../physics/portManagement/components/RLCParamsComponent';
import ScatteringParameter from '../../physics/portManagement/components/ScatteringParameter';
import { ModalSelectPortType } from '../../physics/portManagement/ModalSelectPortType';
import { PortManagement } from '../../physics/portManagement/PortManagement';
import { PlaneWaveSettings } from './planeWave/PlaneWaveSettings';
import { ShowInputGraphModal, InputGraphData } from './ShowInputGraphModal';
import { PortSignal } from './planeWave/SolverSignal';
import { SaveProjectResultsModal } from './SaveProjectResultsModal';

import {
  Simulation,
  Project,
  SolverOutput,
  TempLumped,
  Port,
} from '../../../../../model/esymiaModels';
import { SolverStatusSelector } from '../../../../../store/pluginsSlice';

// Tipizzazione dei callback per aggiornamenti
type SetGraphData = Dispatch<SetStateAction<InputGraphData | undefined>>;

interface SolverSettingsProps {
  selectedProject: Project;
  sidebarItemSelected: string | undefined;
  setsidebarItemSelected: Function;
  setSelectedTabLeftPanel: Function;
  setSelectedTabRightPanel: Function;
  simulationType: 'Matrix' | 'Electric Fields';
  setsimulationType: Dispatch<SetStateAction<'Matrix' | 'Electric Fields'>>;
  setSavedPhysicsParameters: Function;
  savedPhysicsParameters: boolean;
  cameraPosition: THREE.Vector3;
}

export const SolverSettings: React.FC<SolverSettingsProps> = ({
  selectedProject,
  setsidebarItemSelected,
  sidebarItemSelected,
  setSelectedTabLeftPanel,
  setSelectedTabRightPanel,
  setsimulationType,
  simulationType,
  setSavedPhysicsParameters,
  savedPhysicsParameters,
  cameraPosition,
}) => {
  const theme = useSelector(ThemeSelector);
  const dispatch = useDispatch();
  const [electricField, setelectricField] = useState<boolean>(
    !!selectedProject.planeWaveParameters,
  );
  const [ports, setports] = useState<boolean>(selectedProject.ports.length > 0);
  const [graphData, setgraphData] = useState<InputGraphData | undefined>(
    undefined,
  );
  const [activeTab, setActiveTab] = useState<string>('simulationType');
  // Definizione delle schede in un array flat
  const tabs = useMemo(() => {
    const _tabs: { id: string; label: string; content: JSX.Element }[] = [];
    // Scheda Simulation Type: contiene la scelta del tipo e le relative opzioni
    _tabs.push({
      id: 'simulationType',
      label: 'Simulation Type',
      content: (
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center">
            <input
              type="checkbox"
              disabled={selectedProject.simulation?.status === 'Completed'}
              name="matrix"
              id="matrix"
              checked={simulationType === 'Matrix'}
              onClick={() => setsimulationType('Matrix')}
              className="accent-primaryColor"
            />
            <span>Matrix (S, Z, Y)</span>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <input
              type="checkbox"
              name="electric_fields"
              id="electric_fields"
              disabled={selectedProject.simulation?.status === 'Completed'}
              checked={simulationType === 'Electric Fields'}
              onClick={() => setsimulationType('Electric Fields')}
              className="accent-primaryColor"
            />
            <span>Electric Fields</span>
          </div>
          {simulationType === 'Electric Fields' && (
            <div className="flex flex-col pl-5 gap-2">
              <div className="flex flex-row gap-2 items-center">
                <input
                  type="checkbox"
                  name="electricField"
                  id="electricField"
                  disabled={selectedProject.simulation?.status === 'Completed'}
                  checked={electricField}
                  onClick={() => setelectricField(!electricField)}
                  className="accent-primaryColor"
                />
                <span>Electric Field</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <input
                  type="checkbox"
                  name="ports"
                  id="ports"
                  disabled={selectedProject.simulation?.status === 'Completed'}
                  checked={ports}
                  onClick={() => setports(!ports)}
                  className="accent-primaryColor"
                />
                <span>Ports</span>
              </div>
              {!(electricField || ports) && (
                <span className="text-red-600 text-sm">
                  Alert: è necessario selezionare almeno un’opzione!
                </span>
              )}
            </div>
          )}
        </div>
      ),
    });
    // Scheda Frequencies: carica il componente in base al tipo di simulazione
    _tabs.push({
      id: 'frequencies',
      label: 'Frequencies',
      content:
        simulationType === 'Matrix' ? (
          <CollapseFrequenciesMatrix
            savedPhysicsParameters={savedPhysicsParameters}
            setSavedPhysicsParameters={setSavedPhysicsParameters}
          />
        ) : (
          <CollapseFrequenciesElectricField
            savedPhysicsParameters={savedPhysicsParameters}
            setSavedPhysicsParameters={setSavedPhysicsParameters}
          />
        ),
    });
    // Scheda Ports (presente se applicabile)
    if (
      simulationType === 'Matrix' ||
      (simulationType === 'Electric Fields' && ports)
    ) {
      _tabs.push({
        id: 'ports',
        label: 'Ports',
        content:
          simulationType === 'Matrix' ? (
            <CollapsePortsMatrix
              cameraPosition={cameraPosition}
              savedPhysicsParameters={savedPhysicsParameters}
              setSavedPhysicsParameters={setSavedPhysicsParameters}
            />
          ) : (
            <CollapsePortsElecticField
              cameraPosition={cameraPosition}
              savedPhysicsParameters={savedPhysicsParameters}
              setSavedPhysicsParameters={setSavedPhysicsParameters}
              setGraphData={setgraphData}
            />
          ),
      });
    }
    // Scheda Plane Wave: solo per Electric Fields, se l'opzione è attiva
    if (simulationType === 'Electric Fields' && electricField) {
      _tabs.push({
        id: 'planewave',
        label: 'Plane Wave',
        content: <CollapsePlaneWave setGraphData={setgraphData} />,
      });
    }
    // Scheda Solver Setup
    _tabs.push({
      id: 'solverSetup',
      label: 'Solver Setup',
      content: (
        <div className="flex flex-col gap-2">
          <SolverParameters />
        </div>
      ),
    });
    return _tabs;
  }, [
    simulationType,
    electricField,
    ports,
    selectedProject,
    savedPhysicsParameters,
    setSavedPhysicsParameters,
    setsimulationType,
    cameraPosition,
  ]);

  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const solverStatus = useSelector(SolverStatusSelector);
  const activeSimulations = useSelector(activeSimulationsSelector);
  const solverType = useSelector(solverTypeSelector);
  const showSaveProjectResultsModal = useSelector(
    showSaveProjectResultsModalSelector,
  );
    const solverIterations = useSelector(solverIterationsSelector);
  const convergenceThreshold = useSelector(convergenceTresholdSelector);

  const toggleSlider = (): void => {
    setIsUnlocked((prev) => {
      const newState = !prev;
      if (newState) {
        dispatch(setShowSaveProjectResultsModal(true));
      }
      return newState;
    });
  };
  return (
    <>
      {/* Bottone per mostrare/nascondere il pannello Solver */}
      <div className="absolute left-[2%] top-[180px] rounded max-h-[500px] flex flex-col items-center gap-0">
        <div
          className={`p-2 tooltip rounded tooltip-right ${
            sidebarItemSelected === 'Solver'
              ? theme === 'light'
                ? 'text-white bg-primaryColor'
                : 'text-textColor bg-secondaryColorDark'
              : theme === 'light'
              ? 'text-primaryColor bg-white'
              : 'text-textColorDark bg-bgColorDark2'
          }`}
          data-tip="Solver"
          data-testid="solverSettings"
          onClick={() => {
            if (sidebarItemSelected === 'Solver') {
              setsidebarItemSelected(undefined);
            } else {
              setsidebarItemSelected('Solver');
            }
            setSelectedTabLeftPanel(undefined);
            setSelectedTabRightPanel(undefined);
          }}
        >
          <TbServerBolt style={{ width: '25px', height: '25px' }} />
        </div>
      </div>
      {/* Pannello principale */}
      {sidebarItemSelected === 'Solver' && (
        <div
          className={`flex-col absolute xl:left-[5%] left-[6%] top-[180px] xl:w-[40%] w-[28%] rounded-tl rounded-tr pb-5 ${
            theme === 'light'
              ? 'bg-white text-textColor'
              : 'bg-bgColorDark2 text-textColorDark'
          } p-[10px] shadow-2xl lg:max-h-[300px] xl:max-h-[750px]`}
        >
          {/* Barra di navigazione delle tab fissa tramite 'sticky' */}
          <nav className="border-b border-gray-200 sticky top-0 bg-inherit z-10">
            <ul className="flex space-x-4 px-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    disabled={
                      !selectedProject.modelS3 ||
                      selectedProject.meshData.meshGenerated !== 'Generated'
                    }
                    className={`px-4 py-2 disabled:opacity-25 text-sm font-medium rounded-t-md transition-all duration-200 ${
                      activeTab === tab.id
                        ? theme === 'light'
                          ? 'bg-primaryColor text-white'
                          : 'bg-secondaryColorDark text-textColor'
                        : theme === 'light'
                        ? 'bg-white text-gray-700 hover:bg-gray-200'
                        : 'bg-bgColorDark2 text-gray-200 hover:bg-bgColorDark'
                    }`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {/* Solo il contenuto della tab è scrollabile */}
          <div className="p-4 h-[550px] overflow-y-auto">
            {!selectedProject.modelS3 ||
            selectedProject.meshData.meshGenerated !== 'Generated' ? (
              <span>
                Load Model and generate mesh to set simulation parameters
              </span>
            ) : (
              <>
                {tabs.find((tab) => tab.id === activeTab)?.content}
              </>
            )}
          </div>
          <div className="p-4 h-[100px]">
            <SimulationSuggestions simulationType={simulationType} />
            {selectedProject?.simulation?.status === 'Completed' ? (
                  <div className="flex items-center mt-3 gap-2">
                    <button
                      className={`button buttonPrimary flex-1 text-sm xl:text-base ${
                        theme === 'light'
                          ? ''
                          : 'bg-secondaryColorDark text-textColor'
                      }`}
                      data-testid="resultsButton"
                      onClick={() => dispatch(selectMenuItem('Results'))}
                    >
                      Results
                    </button>
                    <div
                      className={`flex-shrink-0 ${
                        theme === 'light'
                          ? 'border rounded px-2'
                          : 'border border-gray-700 rounded px-2'
                      }`}
                    >
                      <EditInputsSlider
                        isUnlocked={isUnlocked}
                        toggleSlider={toggleSlider}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    data-testid="startSimulationButton"
                    className={`w-full mt-3 button text-sm xl:text-base disabled:bg-gray-400 disabled:cursor-not-allowed ${
                      selectedProject?.meshData.meshGenerated !== 'Generated'
                        ? 'bg-gray-300 text-gray-600 opacity-70'
                        : theme === 'light'
                        ? 'buttonPrimary'
                        : 'buttonPrimary bg-secondaryColorDark text-textColor'
                    }`}
                    disabled={
                      selectedProject?.meshData.meshGenerated !== 'Generated' ||
                      solverStatus !== 'ready' ||
                      selectedProject.frequencies?.length === 0 ||
                      (simulationType === 'Matrix' && !selectedProject.portsS3)
                    }
                    onClick={() => {
                      const simulation: Simulation = {
                        name: `${selectedProject?.name} - sim`,
                        started: Date.now().toString(),
                        ended: '',
                        results: {} as SolverOutput,
                        status:
                          activeSimulations.length === 0 ? 'Running' : 'Queued',
                        associatedProject: selectedProject?.id as string,
                        solverAlgoParams: {
                          solverType,
                          innerIteration: solverIterations[0],
                          outerIteration: solverIterations[1],
                          convergenceThreshold,
                        },
                        simulationType: simulationType,
                      };
                      dispatch(
                        updateSimulation({
                          associatedProject: simulation.associatedProject,
                          value: simulation,
                        }),
                      );
                      dispatch(
                        setMeshApproved({
                          approved: true,
                          projectToUpdate: selectedProject?.id as string,
                        }),
                      );
                    }}
                  >
                    Start Simulation
                  </button>
                )}
                {showSaveProjectResultsModal && (
                  <SaveProjectResultsModal
                    toggleEditInputsSlider={toggleSlider}
                  />
                )}
          </div>
          {/* Modal per il grafico, se presente */}
          {graphData && (
            <ShowInputGraphModal
              labelX={graphData.labelX}
              labelY={graphData.labelY}
              signalName={graphData.signalName}
              dataX={graphData.dataX}
              dataY={graphData.dataY}
              setGraphData={setgraphData}
            />
          )}
        </div>
      )}
    </>
  );
};

//
// COMPONENTI COLLASSATI ORIGINALI (rimangono invariati)
//

interface CollapseFrequenciesMatrixProps {
  savedPhysicsParameters: boolean;
  setSavedPhysicsParameters: Function;
}

const CollapseFrequenciesMatrix: React.FC<CollapseFrequenciesMatrixProps> = ({
  savedPhysicsParameters,
  setSavedPhysicsParameters,
}) => {
  const theme = useSelector(ThemeSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  return (
    <div
      className={`p-4 border rounded ${
        theme === 'light'
          ? 'bg-[#f6f6f6] border-secondaryColor'
          : 'bg-bgColorDark'
      }`}
    >
      <FrequenciesImportFromCSV />
      <FrequenciesDef
        disabled={selectedProject?.simulation?.status === 'Completed'}
        setSavedPhysicsParameters={setSavedPhysicsParameters}
      />
      <div className="flex px-5 mt-2 flex-row gap-2 items-center">
        <button
          data-testid="savePhysics"
          type="button"
          className={`button buttonPrimary w-full text-sm hover:opacity-80 disabled:opacity-60 ${
            theme === 'light'
              ? ''
              : 'bg-bgColorDark2 text-textColorDark border-textColorDark'
          }`}
          onClick={() => setSavedPhysicsParameters(true)}
          disabled={savedPhysicsParameters}
        >
          SAVE ON DB
        </button>
        <div
          className="tooltip tooltip-left"
          data-tip="Salvare i parametri sul server non è obbligatorio per lanciare la simulazione ora."
        >
          <IoMdInformationCircleOutline size={15} />
        </div>
      </div>
    </div>
  );
};

interface CollapsePortsMatrixProps {
  setSavedPhysicsParameters: Function;
  savedPhysicsParameters: boolean;
  cameraPosition: THREE.Vector3;
}

const CollapsePortsMatrix: React.FC<CollapsePortsMatrixProps> = ({
  setSavedPhysicsParameters,
  savedPhysicsParameters,
  cameraPosition,
}) => {
  const theme = useSelector(ThemeSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedPort = findSelectedPort(selectedProject);
  const [showModalSelectPortType, setShowModalSelectPortType] =
    useState<boolean>(false);
  return (
    <div
      className={`p-4 border rounded ${
        theme === 'light'
          ? 'bg-[#f6f6f6] border-secondaryColor'
          : 'bg-bgColorDark'
      }`}
    >
      <div className="flex flex-row items-center gap-4">
        <PortImportFromCSV />
        <LumpedImportFromCSV />
      </div>
      <div className="flex flex-row items-center gap-4 mt-3">
        <CreatePorts
          selectedProject={selectedProject as Project}
          cameraPosition={cameraPosition}
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
          <PortPosition
            selectedPort={selectedPort as Port | TempLumped}
            disabled={selectedProject?.simulation?.status === 'Completed'}
            setSavedPortParameters={setSavedPhysicsParameters}
          />
        </PortManagement>
      )}
      {selectedPort && (
        <div className="flex px-5 mt-3 flex-row gap-2 items-center">
          <button
            data-testid="savePhysics"
            type="button"
            className={`button buttonPrimary w-full text-sm hover:opacity-80 disabled:opacity-60 ${
              theme === 'light' ? '' : 'bg-secondaryColorDark'
            }`}
            onClick={() => setSavedPhysicsParameters(true)}
            disabled={savedPhysicsParameters}
          >
            SAVE ON DB
          </button>
          <div
            className="tooltip tooltip-left"
            data-tip="Salvare i parametri sul server non è obbligatorio per lanciare la simulazione ora."
          >
            <IoMdInformationCircleOutline size={15} />
          </div>
        </div>
      )}
    </div>
  );
};

interface CollapseFrequenciesElectricFieldProps {
  savedPhysicsParameters: boolean;
  setSavedPhysicsParameters: Function;
}

const CollapseFrequenciesElectricField: React.FC<
  CollapseFrequenciesElectricFieldProps
> = ({ savedPhysicsParameters, setSavedPhysicsParameters }) => {
  const theme = useSelector(ThemeSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  return (
    <div
      className={`p-4 border rounded ${
        theme === 'light'
          ? 'bg-[#f6f6f6] border-secondaryColor'
          : 'bg-bgColorDark'
      }`}
    >
      <TimeRangeDef
        disabled={selectedProject?.simulation?.status === 'Completed'}
        setSavedPhysicsParameters={setSavedPhysicsParameters}
      />
      <div className="flex px-5 mt-2 flex-row gap-2 items-center">
        <button
          data-testid="savePhysics"
          type="button"
          className={`button buttonPrimary w-full text-sm hover:opacity-80 disabled:opacity-60 ${
            theme === 'light'
              ? ''
              : 'bg-bgColorDark2 text-textColorDark border-textColorDark'
          }`}
          onClick={() => setSavedPhysicsParameters(true)}
          disabled={savedPhysicsParameters}
        >
          SAVE ON DB
        </button>
        <div
          className="tooltip tooltip-left"
          data-tip="Salvare i parametri sul server non è obbligatorio per lanciare la simulazione ora."
        >
          <IoMdInformationCircleOutline size={15} />
        </div>
      </div>
    </div>
  );
};

interface CollapsePortsElecticFieldProps {
  setSavedPhysicsParameters: Function;
  savedPhysicsParameters: boolean;
  cameraPosition: THREE.Vector3;
  setGraphData: SetGraphData;
}

const CollapsePortsElecticField: React.FC<CollapsePortsElecticFieldProps> = ({
  setSavedPhysicsParameters,
  savedPhysicsParameters,
  cameraPosition,
  setGraphData,
}) => {
  const theme = useSelector(ThemeSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedPort = findSelectedPort(selectedProject);
  const [showModalSelectPortType, setShowModalSelectPortType] =
    useState<boolean>(false);
  return (
    <div
      className={`p-4 border rounded ${
        theme === 'light'
          ? 'bg-[#f6f6f6] border-secondaryColor'
          : 'bg-bgColorDark'
      }`}
    >
      <div className="flex flex-row items-center gap-4">
        <PortImportFromCSV />
        <LumpedImportFromCSV />
        <CreatePorts
          selectedProject={selectedProject as Project}
          cameraPosition={cameraPosition}
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
          <PortSignal
            setSavedPhysicsParameters={setSavedPhysicsParameters}
            signal={
              selectedPort?.signal && selectedPort?.signal.type
                ? selectedPort?.signal
                : ({ type: 'no_signal', params: {} } as any)
            }
            setGraphData={setGraphData}
          />
          <PortPosition
            selectedPort={selectedPort as Port | TempLumped}
            disabled={selectedProject?.simulation?.status === 'Completed'}
            setSavedPortParameters={setSavedPhysicsParameters}
          />
        </PortManagement>
      )}
      {selectedPort && (
        <div className="flex px-5 mt-3 flex-row gap-2 items-center">
          <button
            data-testid="savePhysics"
            type="button"
            className={`button buttonPrimary w-full text-sm hover:opacity-80 disabled:opacity-60 ${
              theme === 'light' ? '' : 'bg-secondaryColorDark'
            }`}
            onClick={() => setSavedPhysicsParameters(true)}
            disabled={savedPhysicsParameters}
          >
            SAVE ON DB
          </button>
          <div
            className="tooltip tooltip-left"
            data-tip="Salvare i parametri sul server non è obbligatorio per lanciare la simulazione ora."
          >
            <IoMdInformationCircleOutline size={15} />
          </div>
        </div>
      )}
    </div>
  );
};

interface CollapsePlaneWaveProps {
  setGraphData: SetGraphData;
}

const CollapsePlaneWave: React.FC<CollapsePlaneWaveProps> = ({
  setGraphData,
}) => {
  const theme = useSelector(ThemeSelector);
  return (
    <div
      className={`p-4 border rounded ${
        theme === 'light'
          ? 'bg-[#f6f6f6] border-secondaryColor'
          : 'bg-bgColorDark'
      }`}
    >
      <PlaneWaveSettings setGraphData={setGraphData} />
    </div>
  );
};

interface SolverParametersProps {}

const SolverParameters: React.FC<SolverParametersProps> = () => {
  const theme = useSelector(ThemeSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  const solverIterations = useSelector(solverIterationsSelector);
  const convergenceThreshold = useSelector(convergenceTresholdSelector);
  const dispatch = useDispatch();

  return (
    <>
      <div
        className={`p-4 mt-3 border rounded ${
          theme === 'light'
            ? 'bg-[#f6f6f6] border-secondaryColor'
            : 'bg-bgColorDark'
        }`}
      >
        <div className="p-2">
          <h6 className="text-sm xl:text-base">Solver Type</h6>
          <select
            disabled={selectedProject?.simulation?.status === 'Completed'}
            className={`select select-bordered select-sm w-full max-w-xs ${
              theme === 'light'
                ? 'bg-[#f6f6f6]'
                : 'bg-bgColorDark border-textColorDark'
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
          <h6 className="text-sm xl:text-base">Solver Iterations</h6>
          <div className="flex justify-between mt-2">
            <div className="w-[45%]">
              <span className="text-sm xl:text-base">Outer</span>
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
                className={`w-full p-1 border rounded formControl ${
                  theme === 'light' ? 'bg-[#f6f6f6]' : 'bg-bgColorDark'
                }`}
                onChange={(event) => {
                  dispatch(
                    setSolverIterations([
                      parseInt(event.target.value),
                      solverIterations[1],
                    ]),
                  );
                }}
              />
            </div>
            <div className="w-[45%]">
              <span className="text-sm xl:text-base">Inner</span>
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
                className={`w-full p-1 border rounded formControl ${
                  theme === 'light' ? 'bg-[#f6f6f6]' : 'bg-bgColorDark'
                }`}
                onChange={(event) => {
                  dispatch(
                    setSolverIterations([
                      solverIterations[0],
                      parseInt(event.target.value),
                    ]),
                  );
                }}
              />
            </div>
          </div>
        </div>
        <div className="mt-3 p-2">
          <h6 className="text-sm xl:text-base">Convergence Threshold</h6>
          <DebounceInput
            debounceTimeout={500}
            disabled={
              selectedProject?.simulation?.status === 'Completed' ||
              selectedProject?.meshData.meshGenerated !== 'Generated'
            }
            min={0.0001}
            max={0.1}
            type="number"
            step={0.0001}
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
            className={`w-full p-1 border rounded formControl ${
              theme === 'light' ? 'bg-[#f6f6f6]' : 'bg-bgColorDark'
            }`}
            onChange={(event) => {
              dispatch(setConvergenceTreshold(parseFloat(event.target.value)));
            }}
          />
        </div>
      </div>
    </>
  );
};

interface EditInputsSliderProps {
  isUnlocked: boolean;
  toggleSlider: () => void;
}

const EditInputsSlider: React.FC<EditInputsSliderProps> = ({
  isUnlocked,
  toggleSlider,
}) => {
  return (
    <div className="inline-flex items-center h-10">
      <span className="text-sm xl:text-base mr-2">Edit Inputs</span>
      <div
        className="relative cursor-pointer"
        onClick={toggleSlider}
        role="switch"
        aria-checked={isUnlocked}
        aria-label="Toggle edit inputs"
      >
        <div className="w-14 h-6 bg-gray-300 rounded-full"></div>
        <span
          className={`absolute top-0 left-0 w-6 h-6 bg-white rounded-full transition-transform duration-200 transform ${
            isUnlocked ? 'translate-x-8' : 'translate-x-0'
          }`}
        ></span>
      </div>
      <span className="ml-2">
        {isUnlocked ? (
          <FaLockOpen
            size={20}
            className="text-red-600"
            aria-label="Unlocked"
          />
        ) : (
          <FaLock size={20} className="text-green-600" aria-label="Locked" />
        )}
      </span>
    </div>
  );
};

interface SimulationSuggestionsProps {
  simulationType: 'Matrix' | 'Electric Fields';
}

const SimulationSuggestions: React.FC<SimulationSuggestionsProps> = ({
  simulationType,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const solverStatus = useSelector(SolverStatusSelector);
  return (
    <>
      {solverStatus !== 'ready' && (
        <div className="text-sm xl:text-base font-semibold mt-2">
          Solver Down: start solver or wait until started!
        </div>
      )}
      {selectedProject?.frequencies?.length === 0 && (
        <div className="text-sm xl:text-base font-semibold mt-2">
          To start the simulation, set frequencies.
        </div>
      )}
      {simulationType === 'Matrix' && !selectedProject?.portsS3 && (
        <div className="text-sm xl:text-base font-semibold mt-2">
          To start the simulation, set ports.
        </div>
      )}
      {simulationType === 'Electric Fields' &&
        !selectedProject?.planeWaveParameters && (
          <div className="text-sm xl:text-base font-semibold mt-2">
            To start the simulation, set plane wave parameters.
          </div>
        )}
    </>
  );
};

export interface TimeRangeDefProps {
  setSavedPhysicsParameters: Function;
  disabled: boolean;
}

const TimeRangeDef: React.FC<TimeRangeDefProps> = ({
  setSavedPhysicsParameters,
  disabled,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const [tMax, setTMax] = useState<number>(
    selectedProject?.times
      ? selectedProject?.times[selectedProject?.times.length - 1]
      : 0,
  );
  const [tStep, setTStep] = useState<number>(
    selectedProject?.times ? selectedProject?.times[1] : 0,
  );
  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector);
  function createTimeVector(delta_t: number, T: number): number[] {
    const time: number[] = [];
    for (let t = 0; t <= T; t += delta_t) {
      time.push(t);
    }
    return time;
  }
  function crea_freqs(t: number[]): number[] {
    const fintem = t[t.length - 1] - t[0]; // lungh. finestra temporale
    const ncampt = t.length; // n. di camp. nel tempo (2^15)
    const frefond = 1 / fintem;
    const f: number[] = [];
    for (let i = 0; i <= Math.floor(ncampt / 2); i++) {
      f.push(i * frefond);
    }
    return f;
  }

  return (
    <div
      className={`p-[10px] mt-2 border-[1px] ${
        theme === 'light'
          ? 'border-secondaryColor bg-[#f6f6f6]'
          : 'border-white bg-bgColorDark'
      } text-left overflow-y-scroll max-h-[800px]`}
    >
      <h6 className="w-[100%] mb-3">Time Range Definition</h6>
      <div className="flex flex-row justify-between gap-2 mt-5">
        <div className="flex flex-col items-center gap-2">
          <span>{'final time (s)'}</span>
          <input
            min={0}
            disabled={disabled}
            className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-black text-[15px] font-bold rounded formControl"
            type="number"
            onKeyDown={(evt) => ['+'].includes(evt.key) && evt.preventDefault()}
            onChange={(e) => {
              if (e.target.value.startsWith('-')) {
                setTMax(parseFloat('' + Number(e.target.value.substring(1))));
              } else {
                setTMax(parseFloat('' + Number(e.target.value)));
              }
            }}
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span>time step (s)</span>
          <input
            min={0}
            disabled={disabled}
            className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-black text-[15px] font-bold rounded formControl"
            type="number"
            step={1}
            onKeyDown={(evt) => ['+'].includes(evt.key) && evt.preventDefault()}
            onChange={(e) => {
              if (e.target.value.startsWith('-')) {
                setTStep(parseFloat('' + Number(e.target.value.substring(1))));
              } else {
                setTStep(parseFloat('' + Number(e.target.value)));
              }
            }}
          />
        </div>
      </div>
      <button
        className={`button buttonPrimary ${
          theme === 'light'
            ? ''
            : 'bg-bgColorDark2 text-textColorDark border-textColorDark'
        } w-full mt-2 hover:opacity-80 disabled:opacity-60`}
        disabled={tMax === 0 || tMax < tStep || disabled}
        onClick={() => {
          dispatch(resetInterestFrequencyIndex());
          let times = createTimeVector(tStep, tMax);
          dispatch(setTimes(times));
          dispatch(setFrequencies(crea_freqs(times)));
          setSavedPhysicsParameters(false);
        }}
      >
        Generate Times vector
      </button>
      {selectedProject &&
        selectedProject.times &&
        selectedProject.times.length > 0 && (
          <div className="mt-3">
            <h6 className="w-[100%] mb-2">Generated Times</h6>
            <div className="flex flex-row">
              <h6 className="w-[20%] mb-2">n.{selectedProject.times.length}</h6>
              <h6 className="w-[40%] mb-2"> step:{tStep.toExponential(2)} s</h6>
              <h6 className="w-[40%] mb-2">
                {' '}
                final: {tMax.toExponential(2)} s
              </h6>
            </div>
            <div className="p-3 bg-white border border-secondaryColor flex flex-col overflow-y-scroll max-h-[100px]">
              {selectedProject.times.map((t, index) => {
                return (
                  <span className="text-black" key={index}>
                    {t % 1 !== 0 ? t.toExponential(2) : t}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      {selectedProject &&
        selectedProject.frequencies &&
        selectedProject.frequencies.length > 0 && (
          <div className="mt-3">
            <h6 className="w-[100%] mb-2">Generated Frequencies</h6>
            <div className="flex flex-row">
              <h6 className="w-[20%] mb-2">
                n.{selectedProject.frequencies.length - 1}
              </h6>
              <h6 className="w-[40%] mb-2">
                {' '}
                min:{' '}
                {parseFloat(
                  selectedProject.frequencies[1].toFixed(4),
                ).toExponential()}
                {' Hz'}
              </h6>
              <h6 className="w-[40%] mb-2">
                {' '}
                max:{' '}
                {parseFloat(
                  selectedProject.frequencies[
                    selectedProject.frequencies.length - 1
                  ].toFixed(4),
                ).toExponential()}
                {' Hz'}
              </h6>
            </div>
            <div className="flex flex-row gap-12 items-center">
              <span className="text-black font-bold">Frequencies</span>
              <span className="text-black font-bold">Check interest</span>
            </div>
            <div className="p-3 bg-white border border-secondaryColor flex flex-col overflow-y-scroll max-h-[200px]">
              {selectedProject.frequencies
                .filter((f) => f !== 0)
                .map((f, index) => {
                  return (
                    <div
                      key={index}
                      className="flex flex-row gap-20 items-center"
                    >
                      <span className="text-black">
                        {f % 1 !== 0 ? f.toExponential(2) : f}
                      </span>
                      <input
                        type="checkbox"
                        disabled={disabled}
                        defaultChecked={
                          selectedProject.interestFrequenciesIndexes &&
                          selectedProject.interestFrequenciesIndexes?.filter(
                            (i) => i - 1 === index,
                          ).length > 0
                        }
                        name={f.toString()}
                        id={f.toString()}
                        onChange={(e) => {
                          setSavedPhysicsParameters(false);
                          if (e.currentTarget.checked) {
                            dispatch(addInterestFrequencyIndex(index + 1));
                          } else {
                            dispatch(removeInterestFrequencyIndex(index + 1));
                          }
                        }}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        )}
    </div>
  );
};
