import React, { useState } from 'react';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';

import {
  activeSimulationsSelector,
  findSelectedPort,
  meshGeneratedSelector,
  setMeshApproved,
  updateSimulation,
} from '../../../../../store/projectSlice';
import {
  selectMenuItem,
  ThemeSelector,
} from '../../../../../store/tabsAndMenuItemsSlice';
import {
  Port,
  Project,
  Simulation,
  SolverOutput,
  TempLumped,
} from '../../../../../model/esymiaModels';
import {
  convergenceTresholdSelector,
  setConvergenceTreshold,
  setSolverIterations,
  setSolverType,
  solverIterationsSelector,
  solverTypeSelector,
} from '../../../../../store/solverSlice';
import { DebounceInput } from 'react-debounce-input';
import { SolverStatusSelector } from '../../../../../store/pluginsSlice';
import { TbServerBolt } from 'react-icons/tb';
import FrequenciesDef from '../../physics/frequenciesDef/FrequenciesDef';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import {
  FrequenciesImportFromCSV,
  LumpedImportFromCSV,
  PortImportFromCSV,
} from '../../physics/ImportPhysicsFromCSV';
import { ExportPhisicsToCSV } from '../../physics/ImportExportPhysicsSetup';
import { CreatePorts } from '../../physics/portManagement/selectPorts/CreatePorts';
import * as THREE from 'three';
import { PhysicsLeftPanelTab } from '../../physics/PhysicsLeftPanelTab';
import { PortPosition } from '../../physics/portManagement/components/PortPosition';
import { PortType } from '../../physics/portManagement/components/PortType';
import { RLCParamsComponent } from '../../physics/portManagement/components/RLCParamsComponent';
import ScatteringParameter from '../../physics/portManagement/components/ScatteringParameter';
import { ModalSelectPortType } from '../../physics/portManagement/ModalSelectPortType';
import { PortManagement } from '../../physics/portManagement/PortManagement';
import { PlaneWaveSettingsModal } from '../../physics/planeWave/PlaneWaveSettingsModal';
import { RadialFieldSettingsModal } from '../../physics/planeWave/RadialFieldSettingsModal';

interface SolverSettingsProps {
  selectedProject: Project;
  sidebarItemSelected: string | undefined;
  setsidebarItemSelected: Function;
  setSelectedTabLeftPanel: Function;
  setSelectedTabRightPanel: Function;
  simulationType: 'Matrix' | 'Electric Fields' | 'Both';
  setsimulationType: Function;
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
  const dispatch = useDispatch();
  const meshGenerated = useSelector(meshGeneratedSelector);
  const solverType = useSelector(solverTypeSelector);
  const solverIterations = useSelector(solverIterationsSelector);
  const convergenceThreshold = useSelector(convergenceTresholdSelector);
  const activeSimulations = useSelector(activeSimulationsSelector);
  const theme = useSelector(ThemeSelector);
  const solverStatus = useSelector(SolverStatusSelector);
  const selectedPort = findSelectedPort(selectedProject);
  const [showModalSelectPortType, setShowModalSelectPortType] = useState(false);

  return (
    <>
      <div className="absolute left-[2%] top-[180px] rounded max-h-[500px] flex flex-col items-center gap-0 overflow-scroll">
        <div
          className={`p-2 tooltip rounded tooltip-right ${
            sidebarItemSelected === 'Solver'
              ? `${
                  theme === 'light'
                    ? 'text-white bg-primaryColor'
                    : 'text-textColor bg-secondaryColorDark'
                }`
              : `${
                  theme === 'light'
                    ? 'text-primaryColor bg-white'
                    : 'text-textColorDark bg-bgColorDark2'
                }`
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
      {sidebarItemSelected && sidebarItemSelected === 'Solver' && (
        <>
          <div
            className={`${
              (selectedProject.simulation?.status === 'Queued' ||
                selectedProject.simulation?.status === 'Running') &&
              'opacity-40'
            } flex-col absolute xl:left-[5%] left-[6%] top-[180px] xl:w-[22%] w-[28%] rounded-tl rounded-tr ${
              theme === 'light'
                ? 'bg-white text-textColor'
                : 'bg-bgColorDark2 text-textColorDark'
            } p-[10px] shadow-2xl overflow-y-scroll lg:max-h-[300px] xl:max-h-[700px]`}
          >
            <div className="flex">
              <AiOutlineThunderbolt style={{ width: '25px', height: '25px' }} />
              <h5 className="ml-2 text-[12px] xl:text-base">Solver Settings</h5>
            </div>
            <hr className="mt-1" />
            <div
              className={`collapse collapse-arrow mt-3 xl:text-left text-center border-[1px] rounded ${
                theme === 'light'
                  ? 'bg-[#f6f6f6] border-secondaryColor'
                  : 'bg-bgColorDark'
              }`}
            >
              <input type="checkbox" defaultChecked />
              <div className="collapse-title font-semibold">
                Simulation Type
              </div>
              <div className="collapse-content text-sm">
                <div className="flex justify-between">
                  <div className="w-full">
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="checkbox"
                        name="matrix"
                        id="matrix"
                        checked={simulationType === 'Matrix'}
                        onClick={() => setsimulationType('Matrix')}
                      />
                      <span>Matrix (S, Z, Y)</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="checkbox"
                        name="matrix"
                        id="matrix"
                        checked={simulationType === 'Electric Fields'}
                        onClick={() => setsimulationType('Electric Fields')}
                      />
                      <span>Electric Fields</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="checkbox"
                        name="matrix"
                        id="matrix"
                        checked={simulationType === 'Both'}
                        onClick={() => setsimulationType('Both')}
                      />
                      <span>Matrix (S, Z, Y) & Electic Fields</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`collapse collapse-arrow mt-3 xl:text-left text-center border-[1px] rounded ${
                theme === 'light'
                  ? 'bg-[#f6f6f6] border-secondaryColor'
                  : 'bg-bgColorDark'
              }`}
            >
              <input type="checkbox" />
              <div className="collapse-title font-semibold">Frequencies</div>
              <div className="collapse-content text-sm">
                <FrequenciesImportFromCSV />
                <FrequenciesDef
                  disabled={selectedProject?.simulation?.status === 'Completed'}
                  setSavedPhysicsParameters={setSavedPhysicsParameters}
                />
                <div
                  className={`flex px-[20px] mt-2 flex-row gap-2 items-center`}
                >
                  <button
                    data-testid="savePhysics"
                    type="button"
                    className={`button buttonPrimary ${
                      theme === 'light'
                        ? ''
                        : 'bg-bgColorDark2 text-textColorDark border-textColorDark'
                    } text-sm w-full hover:opacity-80 disabled:opacity-60`}
                    onClick={() => setSavedPhysicsParameters(true)}
                    disabled={savedPhysicsParameters}
                  >
                    SAVE ON DB
                  </button>
                  <div
                    className="tooltip tooltip-left"
                    data-tip="Saving parameters on server now is not necessary in order to launch a simulation. Use this button if you are not intended to launch a simulation now."
                  >
                    <IoMdInformationCircleOutline size={15} />
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`collapse collapse-arrow mt-3 xl:text-left text-center border-[1px] rounded ${
                theme === 'light'
                  ? 'bg-[#f6f6f6] border-secondaryColor'
                  : 'bg-bgColorDark'
              }`}
            >
              <input type="checkbox" />
              <div className="collapse-title font-semibold">Ports</div>
              <div className="collapse-content text-sm">
                <div className="flex flex-row items-center gap-4">
                  <PortImportFromCSV />
                  <LumpedImportFromCSV />
                </div>
                <div className="flex flex-row items-center gap-4 mt-3">
                  <CreatePorts
                    selectedProject={selectedProject}
                    cameraPosition={cameraPosition}
                  />
                </div>
                <PhysicsLeftPanelTab />
                <>
                  {selectedPort?.category === 'lumped' ? (
                    <PortManagement selectedPort={selectedPort}>
                      <PortType
                        disabled={
                          selectedProject?.simulation?.status === 'Completed'
                        }
                        setShow={setShowModalSelectPortType}
                        selectedPort={selectedPort as TempLumped}
                      />
                      <RLCParamsComponent
                        selectedPort={selectedPort as TempLumped}
                        disabled={
                          selectedProject?.simulation?.status === 'Completed'
                        }
                        setSavedPortParameters={setSavedPhysicsParameters}
                      />
                      <PortPosition
                        selectedPort={selectedPort as Port | TempLumped}
                        disabled={
                          selectedProject?.simulation?.status === 'Completed'
                        }
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
                        disabled={
                          selectedProject?.simulation?.status === 'Completed'
                        }
                        setSavedPortParameters={setSavedPhysicsParameters}
                      />
                    </PortManagement>
                  )}
                </>
                {selectedPort && (
                  <div
                    className={`flex px-[20px] mt-3 flex-row gap-2 items-center`}
                  >
                    <button
                      data-testid="savePhysics"
                      type="button"
                      className={`button buttonPrimary ${
                        theme === 'light' ? '' : 'bg-secondaryColorDark'
                      } text-sm w-full hover:opacity-80 disabled:opacity-60`}
                      onClick={() => setSavedPhysicsParameters(true)}
                      disabled={savedPhysicsParameters}
                    >
                      SAVE ON DB
                    </button>
                    <div
                      className="tooltip tooltip-left"
                      data-tip="Saving parameters on server now is not necessary in order to launch a simulation. Use this button if you are not intended to launch a simulation now."
                    >
                      <IoMdInformationCircleOutline size={15} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {simulationType !== 'Matrix' && (
              <>
                <div
                  className={`collapse collapse-arrow mt-3 xl:text-left text-center border-[1px] rounded ${
                    theme === 'light'
                      ? 'bg-[#f6f6f6] border-secondaryColor'
                      : 'bg-bgColorDark'
                  }`}
                >
                  <input type="checkbox" />
                  <div className="collapse-title font-semibold">Plane Wave</div>
                  <div className="collapse-content text-sm">
                    <PlaneWaveSettingsModal />
                  </div>
                </div>
                <div
                  className={`collapse collapse-arrow mt-3 xl:text-left text-center border-[1px] rounded ${
                    theme === 'light'
                      ? 'bg-[#f6f6f6] border-secondaryColor'
                      : 'bg-bgColorDark'
                  }`}
                >
                  <input type="checkbox" />
                  <div className="collapse-title font-semibold">
                    Radiation Diagram
                  </div>
                  <div className="collapse-content text-sm">
                    <RadialFieldSettingsModal/>
                  </div>
                </div>
              </>
            )}
            <div
              className={`collapse collapse-arrow mt-3 xl:text-left text-center border-[1px] rounded ${
                theme === 'light'
                  ? 'bg-[#f6f6f6] border-secondaryColor'
                  : 'bg-bgColorDark'
              }`}
            >
              <input type="checkbox" />
              <div className="collapse-title font-semibold">
                Solver Parameters
              </div>
              <div className="collapse-content text-sm">
                <div
                  className={`p-[10px] xl:text-left text-center border-[1px] rounded ${
                    theme === 'light'
                      ? 'bg-[#f6f6f6] border-secondaryColor'
                      : 'bg-bgColorDark'
                  }`}
                >
                  <h6 className="text-[12px] xl:text-base">Solver Type</h6>
                  <div className="">
                    <div className="flex justify-between mt-2">
                      <div className="w-full">
                        <select
                          className={`select select-bordered select-sm w-full max-w-xs ${
                            theme === 'light'
                              ? 'bg-[#f6f6f6]'
                              : 'bg-bgColorDark border-textColorDark'
                          }`}
                          onChange={(e) => {
                            dispatch(
                              setSolverType(parseInt(e.target.value) as 1 | 2),
                            );
                          }}
                        >
                          <option value={2} selected>
                            Rcc delayed coefficents computation
                          </option>
                          <option value={1}>
                            Quasi static coefficents computation
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`mt-3 p-[10px] xl:text-left text-center border-[1px] rounded ${
                    theme === 'light'
                      ? 'bg-[#f6f6f6] border-secondaryColor'
                      : 'bg-bgColorDark'
                  }`}
                >
                  <h6 className="text-[12px] xl:text-base">
                    Solver Iterations
                  </h6>
                  <div className="mt-2">
                    <div className="flex justify-between mt-2">
                      <div className="w-[45%]">
                        <span className="text-[12px] xl:text-base">Outer</span>
                        <input
                          disabled={
                            selectedProject.simulation?.status ===
                              'Completed' || meshGenerated !== 'Generated'
                          }
                          min={1}
                          className={`w-full p-[4px] border-[1px] ${
                            theme === 'light'
                              ? 'bg-[#f6f6f6]'
                              : 'bg-bgColorDark'
                          } text-[15px] font-bold rounded formControl`}
                          type="number"
                          step={1}
                          value={
                            selectedProject.simulation
                              ? isNaN(
                                  selectedProject.simulation.solverAlgoParams
                                    .innerIteration,
                                )
                                ? 0
                                : selectedProject.simulation.solverAlgoParams
                                    .innerIteration
                              : isNaN(solverIterations[0])
                              ? 0
                              : solverIterations[0]
                          }
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
                        <span className="text-[12px] xl:text-base">Inner</span>
                        <input
                          disabled={
                            selectedProject.simulation?.status ===
                              'Completed' || meshGenerated !== 'Generated'
                          }
                          min={1}
                          className={`w-full p-[4px] border-[1px] ${
                            theme === 'light'
                              ? 'bg-[#f6f6f6]'
                              : 'bg-bgColorDark'
                          } text-[15px] font-bold rounded formControl`}
                          type="number"
                          step={1}
                          value={
                            selectedProject.simulation
                              ? isNaN(
                                  selectedProject.simulation.solverAlgoParams
                                    .outerIteration,
                                )
                                ? 0
                                : selectedProject.simulation.solverAlgoParams
                                    .outerIteration
                              : isNaN(solverIterations[1])
                              ? 0
                              : solverIterations[1]
                          }
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
                </div>
                <div
                  className={`mt-3 p-[10px] xl:text-left text-center border-[1px] rounded ${
                    theme === 'light'
                      ? 'bg-[#f6f6f6] border-secondaryColor'
                      : 'bg-bgColorDark'
                  }`}
                >
                  <h6 className="text-[12px] xl:text-base">
                    Convergence Threshold
                  </h6>
                  <div className="mt-2">
                    <div className="flex justify-between mt-2">
                      <div className="w-full">
                        <DebounceInput
                          debounceTimeout={500}
                          disabled={
                            selectedProject.simulation?.status ===
                              'Completed' || meshGenerated !== 'Generated'
                          }
                          min={0.0001}
                          max={0.1}
                          className={`w-full p-[4px] border-[1px] ${
                            theme === 'light'
                              ? 'bg-[#f6f6f6]'
                              : 'bg-bgColorDark'
                          } text-[15px] font-bold rounded formControl`}
                          type="number"
                          step={0.0001}
                          value={
                            selectedProject.simulation
                              ? isNaN(
                                  selectedProject.simulation.solverAlgoParams
                                    .convergenceThreshold,
                                )
                                ? 0
                                : selectedProject.simulation.solverAlgoParams
                                    .convergenceThreshold
                              : isNaN(convergenceThreshold)
                              ? 0
                              : convergenceThreshold
                          }
                          onChange={(event) => {
                            dispatch(
                              setConvergenceTreshold(
                                parseFloat(event.target.value),
                              ),
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {selectedProject.simulation?.status === 'Completed' ? (
              <button
                className={`button buttonPrimary ${
                  theme === 'light'
                    ? ''
                    : 'bg-secondaryColorDark text-textColor'
                } w-[100%] mt-3 text-[12px] xl:text-base`}
                data-testid="resultsButton"
                onClick={() => {
                  dispatch(selectMenuItem('Results'));
                }}
              >
                Results
              </button>
            ) : (
              <button
                data-testid="startSimulationButton"
                className={`w-full mt-3 button text-[12px] xl:text-base disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:opacity-100
              ${
                meshGenerated !== 'Generated'
                  ? 'bg-gray-300 text-gray-600 opacity-70'
                  : `buttonPrimary ${
                      theme === 'light'
                        ? ''
                        : 'bg-secondaryColorDark text-textColor'
                    }`
              }`}
                disabled={
                  meshGenerated !== 'Generated' ||
                  solverStatus !== 'ready' ||
                  selectedProject.frequencies?.length === 0 ||
                  (simulationType === 'Matrix' && !selectedProject.portsS3) ||
                  (simulationType === 'Electric Fields' &&
                    !selectedProject.planeWaveParameters) ||
                  (simulationType === 'Both' &&
                    !selectedProject.planeWaveParameters &&
                    !selectedProject.portsS3)
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
                      solverType: solverType,
                      innerIteration: solverIterations[0],
                      outerIteration: solverIterations[1],
                      convergenceThreshold,
                    },
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
                      projectToUpdate: selectedProject.id as string,
                    }),
                  );
                }}
              >
                Start Simulation
              </button>
            )}
            {solverStatus !== 'ready' && (
              <div className="text-[12px] xl:text-base font-semibold mt-2">
                Solver Down: start solver or wait until started!
              </div>
            )}
            {selectedProject.frequencies?.length === 0 && (
              <div className="text-[12px] xl:text-base font-semibold mt-2">
                To start the simulation set frequencies
              </div>
            )}
            {simulationType === 'Matrix' && !selectedProject.portsS3 && (
              <div className="text-[12px] xl:text-base font-semibold mt-2">
                To start the simulation set ports
              </div>
            )}
            {simulationType === 'Electric Fields' &&
              !selectedProject.planeWaveParameters && (
                <div className="text-[12px] xl:text-base font-semibold mt-2">
                  To start the simulation set plane wave parameters
                </div>
              )}
            {simulationType === 'Both' &&
              (!selectedProject.planeWaveParameters ||
                !selectedProject.portsS3) && (
                <div className="text-[12px] xl:text-base font-semibold mt-2">
                  To start the simulation set plane wave parameters ad ports
                </div>
              )}
          </div>
        </>
      )}
    </>
  );
};
