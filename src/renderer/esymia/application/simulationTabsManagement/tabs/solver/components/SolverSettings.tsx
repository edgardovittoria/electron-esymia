import React, { useState, Dispatch, SetStateAction, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TbServerBolt } from 'react-icons/tb';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { FaLock, FaLockOpen } from 'react-icons/fa6';
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
    theme,
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
      <div className="absolute left-[2%] top-0 flex flex-col items-center gap-0">
        <div
          className={`p-3 rounded-xl transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-md ${sidebarItemSelected === 'Solver'
            ? (theme === 'light' ? 'bg-blue-500 text-white shadow-blue-500/30' : 'bg-blue-600 text-white shadow-blue-600/30')
            : (theme === 'light' ? 'bg-white/80 text-gray-600 hover:bg-white hover:text-blue-500' : 'bg-black/40 text-gray-400 hover:bg-black/60 hover:text-blue-400 border border-white/10')
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
          <TbServerBolt size={24} />
        </div>
      </div>
      {/* Pannello principale */}
      {sidebarItemSelected === 'Solver' && (
        <div
          className={`flex-col absolute left-[6%] xl:left-[5%] top-0 w-[400px] xl:w-[700px] rounded-2xl pb-5 shadow-2xl backdrop-blur-md border transition-all duration-300 max-h-[calc(100vh-300px)] overflow-hidden ${theme === 'light'
            ? 'bg-white/90 border-white/40'
            : 'bg-black/60 border-white/10 text-gray-200'
            }`}
        >
          {/* Barra di navigazione delle tab fissa tramite 'sticky' */}
          <nav className={`border-b sticky top-0 z-10 ${theme === 'light' ? 'border-gray-200/50 bg-white/50' : 'border-white/10 bg-black/20'}`}>
            <ul className="flex space-x-1 p-2 overflow-x-auto custom-scrollbar">
              {tabs.map((tab) => (
                <li key={tab.id} className="flex-shrink-0">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    disabled={
                      !selectedProject.modelS3 ||
                      selectedProject.meshData.meshGenerated !== 'Generated'
                    }
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === tab.id
                      ? (theme === 'light'
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'bg-blue-600 text-white shadow-md shadow-blue-600/20')
                      : (theme === 'light'
                        ? 'text-gray-600 hover:bg-gray-100'
                        : 'text-gray-400 hover:bg-white/5')
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          {/* Solo il contenuto della tab è scrollabile */}
          <div className="p-4 h-[45vh] overflow-y-auto custom-scrollbar">
            {!selectedProject.modelS3 ||
              selectedProject.meshData.meshGenerated !== 'Generated' ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                <TbServerBolt size={48} className="mb-4" />
                <span className="text-sm font-medium">
                  Load Model and generate mesh to set simulation parameters
                </span>
              </div>
            ) : (
              <>
                {tabs.find((tab) => tab.id === activeTab)?.content}
              </>
            )}
          </div>
          <div className={`p-4 border-t ${theme === 'light' ? 'border-gray-200/50' : 'border-white/10'}`}>
            <SimulationSuggestions simulationType={simulationType} />
            {selectedProject?.simulation?.status === 'Completed' ? (
              <div className="flex items-center mt-3 gap-2">
                <button
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${theme === 'light'
                    ? 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/30'
                    : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30'
                    }`}
                  data-testid="resultsButton"
                  onClick={() => dispatch(selectMenuItem('Results'))}
                >
                  View Results
                </button>
                <div
                  className={`flex-shrink-0 p-1 rounded-lg border ${theme === 'light'
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-white/10 bg-white/5'
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
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 ${selectedProject?.meshData.meshGenerated !== 'Generated'
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-white/5 dark:text-gray-500'
                  : (theme === 'light'
                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-600/30 disabled:bg-white/5 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed')
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
    <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
      <div className="flex flex-row items-center gap-4 mb-4">
        <PortImportFromCSV />
        <LumpedImportFromCSV />
      </div>
      <div className="flex flex-row items-center gap-4 mb-4">
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
    <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
      <div className="flex flex-row items-center gap-4 mb-4">
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

interface CollapsePlaneWaveProps {
  setGraphData: SetGraphData;
}

const CollapsePlaneWave: React.FC<CollapsePlaneWaveProps> = ({
  setGraphData,
}) => {
  const theme = useSelector(ThemeSelector);
  return (
    <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
      <PlaneWaveSettings setGraphData={setGraphData} />
    </div>
  );
};

interface SolverParametersProps { }

const SolverParameters: React.FC<SolverParametersProps> = () => {
  const theme = useSelector(ThemeSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  const solverIterations = useSelector(solverIterationsSelector);
  const convergenceThreshold = useSelector(convergenceTresholdSelector);
  const dispatch = useDispatch();

  return (
    <>
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
          className={`absolute top-0 left-0 w-6 h-6 bg-white rounded-full transition-transform duration-200 transform ${isUnlocked ? 'translate-x-8' : 'translate-x-0'
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

import { MdErrorOutline } from 'react-icons/md';
import { IoMdWarning } from 'react-icons/io';

const SimulationSuggestions: React.FC<SimulationSuggestionsProps> = ({
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
    <div className="flex flex-col gap-4">
      <h6 className={`text-sm font-bold ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Time Range Definition</h6>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Final Time (s)</span>
          <input
            min={0}
            disabled={disabled}
            className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
              ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
              : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
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
        <div className="flex flex-col gap-2">
          <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Time Step (s)</span>
          <input
            min={0}
            disabled={disabled}
            className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
              ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
              : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
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
        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${theme === 'light'
          ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
          : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        disabled={tMax === 0 || tMax < tStep || disabled}
        onClick={() => {
          dispatch(resetInterestFrequencyIndex());
          let times = createTimeVector(tStep, tMax);
          dispatch(setTimes(times));
          dispatch(setFrequencies(crea_freqs(times)));
          setSavedPhysicsParameters(false);
        }}
      >
        Generate Times Vector
      </button>

      {selectedProject?.times && selectedProject.times.length > 0 && (
        <div className={`mt-2 p-4 rounded-xl border ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
          <h6 className={`text-sm font-bold mb-3 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Generated Times</h6>
          <div className="grid grid-cols-3 gap-2 mb-3 text-xs opacity-70">
            <div>Count: {selectedProject?.times?.length}</div>
            <div>Step: {tStep.toExponential(2)} s</div>
            <div>Final: {tMax.toExponential(2)} s</div>
          </div>
          <div className={`p-2 rounded-lg max-h-[150px] overflow-y-auto custom-scrollbar ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-black/20 border border-white/10'
            }`}>
            <div className="flex flex-wrap gap-2">
              {selectedProject?.times?.map((t, index) => (
                <span key={index} className={`text-xs px-2 py-1 rounded ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/10 text-gray-300'
                  }`}>
                  {t % 1 !== 0 ? t.toExponential(2) : t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedProject?.frequencies && selectedProject.frequencies.length > 0 && (
        <div className={`mt-2 p-4 rounded-xl border ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
          <h6 className={`text-sm font-bold mb-3 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Generated Frequencies</h6>
          <div className="grid grid-cols-3 gap-2 mb-3 text-xs opacity-70">
            <div>Count: {selectedProject?.frequencies?.length ? selectedProject.frequencies.length - 1 : 0}</div>
            <div>Min: {selectedProject?.frequencies?.[1] ? parseFloat(selectedProject.frequencies[1].toFixed(4)).toExponential() : 0} Hz</div>
            <div>Max: {selectedProject?.frequencies?.[selectedProject.frequencies.length - 1] ? parseFloat(selectedProject.frequencies[selectedProject.frequencies.length - 1].toFixed(4)).toExponential() : 0} Hz</div>
          </div>

          <div className="flex justify-between items-center mb-2 px-2">
            <span className="text-xs font-bold opacity-70">Frequency</span>
            <span className="text-xs font-bold opacity-70">Interest</span>
          </div>

          <div className={`p-2 rounded-lg max-h-[200px] overflow-y-auto custom-scrollbar ${theme === 'light' ? 'bg-white border border-gray-200' : 'bg-black/20 border border-white/10'
            }`}>
            {selectedProject?.frequencies
              ?.filter((f) => f !== 0)
              .map((f, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-lg ${theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'
                    }`}
                >
                  <span className={`text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
                    {f % 1 !== 0 ? f.toExponential(2) : f}
                  </span>
                  <input
                    type="checkbox"
                    className="accent-blue-500 w-4 h-4"
                    disabled={disabled}
                    defaultChecked={
                      selectedProject?.interestFrequenciesIndexes &&
                      selectedProject?.interestFrequenciesIndexes?.filter(
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
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
