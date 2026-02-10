import React, { useState, Dispatch, SetStateAction, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TbServerBolt } from 'react-icons/tb';
import * as THREE from 'three';

import {
  activeSimulationsSelector,
  setMeshApproved,
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
  solverIterationsSelector,
  solverTypeSelector,
} from '../../../../../store/solverSlice';
import { SaveProjectResultsModal } from './SaveProjectResultsModal';
import { ShowInputGraphModal, InputGraphData } from './ShowInputGraphModal';

import {
  Simulation,
  Project,
  SolverOutput,
} from '../../../../../model/esymiaModels';
import { SolverStatusSelector } from '../../../../../store/pluginsSlice';

// Import split components
import { SimulationTypeTab } from './solver_settings/tabs/SimulationTypeTab';
import { FrequenciesTab } from './solver_settings/tabs/FrequenciesTab';
import { PortsTab } from './solver_settings/tabs/PortsTab';
import { PlaneWaveTab } from './solver_settings/tabs/PlaneWaveTab';
import { SolverSetupTab } from './solver_settings/tabs/SolverSetupTab';
import { EditInputsSlider } from './solver_settings/EditInputsSlider';
import { SimulationSuggestions } from './solver_settings/SimulationSuggestions';

interface SolverSettingsProps {
  selectedProject: Project;
  sidebarItemSelected: string | undefined;
  setsidebarItemSelected: Function;
  setSelectedTabLeftPanel: Function;
  setSelectedTabRightPanel: Function;
  simulationType: 'Matrix' | 'Matrix_ACA' | 'Electric Fields';
  setsimulationType: Dispatch<SetStateAction<'Matrix' | 'Matrix_ACA' | 'Electric Fields'>>;
  setSavedPhysicsParameters: Function;
  savedPhysicsParameters: boolean;
  cameraPosition: THREE.Vector3;
  setResetFocus: Function;
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
  setResetFocus,
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

  // Definizione delle schede
  const tabs = useMemo(() => {
    const _tabs: { id: string; label: string; content: JSX.Element }[] = [];

    _tabs.push({
      id: 'simulationType',
      label: 'Simulation Type',
      content: (
        <SimulationTypeTab
          selectedProject={selectedProject}
          simulationType={simulationType}
          setsimulationType={setsimulationType}
          electricField={electricField}
          setelectricField={setelectricField}
          ports={ports}
          setports={setports}
        />
      ),
    });

    _tabs.push({
      id: 'frequencies',
      label: 'Frequencies',
      content: (
        <FrequenciesTab
          simulationType={simulationType}
          savedPhysicsParameters={savedPhysicsParameters}
          setSavedPhysicsParameters={setSavedPhysicsParameters}
        />
      ),
    });

    if (
      simulationType === 'Matrix' ||
      simulationType === 'Matrix_ACA' ||
      (simulationType === 'Electric Fields' && ports)
    ) {
      _tabs.push({
        id: 'ports',
        label: 'Ports',
        content: (
          <PortsTab
            simulationType={simulationType}
            cameraPosition={cameraPosition}
            savedPhysicsParameters={savedPhysicsParameters}
            setSavedPhysicsParameters={setSavedPhysicsParameters}
            setGraphData={setgraphData}
            setResetFocus={setResetFocus}
          />
        ),
      });
    }

    if (simulationType === 'Electric Fields' && electricField) {
      _tabs.push({
        id: 'planewave',
        label: 'Plane Wave',
        content: <PlaneWaveTab setGraphData={setgraphData} />,
      });
    }

    _tabs.push({
      id: 'solverSetup',
      label: 'Solver Setup',
      content: <SolverSetupTab simulationType={simulationType} />,
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
    setResetFocus,
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

      {sidebarItemSelected === 'Solver' && (
        <div
          className={`flex-col z-50 absolute left-[6%] xl:left-[5%] top-0 w-[400px] xl:w-[750px] rounded-2xl pb-5 shadow-2xl backdrop-blur-md border transition-all duration-300 max-h-[calc(100vh-300px)] overflow-hidden ${theme === 'light'
            ? 'bg-white/90 border-white/40'
            : 'bg-black/60 border-white/10 text-gray-200'
            }`}
        >
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
                  ((simulationType === 'Matrix' || simulationType === 'Matrix_ACA') && !selectedProject.portsS3)
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
