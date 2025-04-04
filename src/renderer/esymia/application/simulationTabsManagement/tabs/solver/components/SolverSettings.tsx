import React, { useState } from 'react';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';

import {
  activeSimulationsSelector,
  meshGeneratedSelector,
  setMeshApproved,
  updateSimulation,
} from '../../../../../store/projectSlice';
import {
  selectMenuItem,
  ThemeSelector,
} from '../../../../../store/tabsAndMenuItemsSlice';
import {
  Project,
  Simulation,
  SolverOutput,
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

interface SolverSettingsProps {
  selectedProject: Project;
  sidebarItemSelected: string | undefined;
  setsidebarItemSelected: Function;
  setSelectedTabLeftPanel: Function;
  setSelectedTabRightPanel: Function;
  simulationType: 'Matrix' | 'Electric Fields' | 'Both';
  setsimulationType: Function
}

export const SolverSettings: React.FC<SolverSettingsProps> = ({
  selectedProject,
  setsidebarItemSelected,
  sidebarItemSelected,
  setSelectedTabLeftPanel,
  setSelectedTabRightPanel,
  setsimulationType,
  simulationType
}) => {
  const dispatch = useDispatch();
  const meshGenerated = useSelector(meshGeneratedSelector);
  const solverType = useSelector(solverTypeSelector);
  const solverIterations = useSelector(solverIterationsSelector);
  const convergenceThreshold = useSelector(convergenceTresholdSelector);
  const activeSimulations = useSelector(activeSimulationsSelector);
  const theme = useSelector(ThemeSelector);
  const solverStatus = useSelector(SolverStatusSelector);

  return (
    <>
      <div className="absolute left-[2%] top-[180px] rounded max-h-[500px] flex flex-col items-center gap-0">
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
            } p-[10px] shadow-2xl overflow-y-scroll lg:max-h-[300px] xl:max-h-fit`}
          >
            <div className="flex">
              <AiOutlineThunderbolt style={{ width: '25px', height: '25px' }} />
              <h5 className="ml-2 text-[12px] xl:text-base">Solver Settings</h5>
            </div>
            <hr className="mt-1" />
            <div
              className={`mt-3 p-[10px] xl:text-left text-center border-[1px] rounded ${
                theme === 'light'
                  ? 'bg-[#f6f6f6] border-secondaryColor'
                  : 'bg-bgColorDark'
              }`}
            >
              <h6 className="text-[12px] xl:text-base">Simulation Type</h6>
              <div className="mt-2">
                <div className="flex justify-between mt-2">
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
              className={`mt-3 p-[10px] xl:text-left text-center border-[1px] rounded ${
                theme === 'light'
                  ? 'bg-[#f6f6f6] border-secondaryColor'
                  : 'bg-bgColorDark'
              }`}
            >
              <h6 className="text-[12px] xl:text-base">Solver Type</h6>
              <div className="mt-2">
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
              <h6 className="text-[12px] xl:text-base">Solver Iterations</h6>
              <div className="mt-2">
                <div className="flex justify-between mt-2">
                  <div className="w-[45%]">
                    <span className="text-[12px] xl:text-base">Outer</span>
                    <input
                      disabled={
                        selectedProject.simulation?.status === 'Completed' ||
                        meshGenerated !== 'Generated'
                      }
                      min={1}
                      className={`w-full p-[4px] border-[1px] ${
                        theme === 'light' ? 'bg-[#f6f6f6]' : 'bg-bgColorDark'
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
                        selectedProject.simulation?.status === 'Completed' ||
                        meshGenerated !== 'Generated'
                      }
                      min={1}
                      className={`w-full p-[4px] border-[1px] ${
                        theme === 'light' ? 'bg-[#f6f6f6]' : 'bg-bgColorDark'
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
                        selectedProject.simulation?.status === 'Completed' ||
                        meshGenerated !== 'Generated'
                      }
                      min={0.0001}
                      max={0.1}
                      className={`w-full p-[4px] border-[1px] ${
                        theme === 'light' ? 'bg-[#f6f6f6]' : 'bg-bgColorDark'
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
                  meshGenerated !== 'Generated' || solverStatus !== 'ready' || selectedProject.frequencies?.length === 0 ||
                  (simulationType === "Matrix" && !selectedProject.portsS3) ||
                  (simulationType === "Electric Fields" && (!selectedProject.planeWaveParameters)) ||
                  (simulationType === "Both" && (!selectedProject.planeWaveParameters && !selectedProject.portsS3))
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
            {(simulationType === "Matrix" && !selectedProject.portsS3) && (
              <div className="text-[12px] xl:text-base font-semibold mt-2">
                To start the simulation set ports
              </div>
            )}
            {(simulationType === "Electric Fields" && (!selectedProject.planeWaveParameters)) && (
              <div className="text-[12px] xl:text-base font-semibold mt-2">
                To start the simulation set plane wave parameters
              </div>
            )}
            {(simulationType === "Both" && (!selectedProject.planeWaveParameters || !selectedProject.portsS3)) && (
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
