import React, { useEffect, useState } from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { TiArrowMinimise } from 'react-icons/ti';
import { MdKeyboardArrowUp } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import {
  Project,
  Simulation,
  SolverOutput,
} from '../../../../../../../model/esymiaModels';
import {
  convergenceTresholdSelector,
  solverIterationsSelector,
  solverTypeSelector,
} from '../../../../../../../store/solverSlice';
import {
  deleteSimulation,
  selectedProjectSelector,
  setMeshApproved,
  updateSimulation,
} from '../../../../../../../store/projectSlice';
import { getMaterialListFrom } from '../../../../solver/Solver';
import {
  computingLpSelector,
  computingPSelector,
  estimatedTimeSelector,
  isAlertInfoModalSelector,
  isConfirmedInfoModalSelector,
  iterationsSelector,
  setElectricFieldsResultsStep,
  setEstimatedTime,
  setIsAlertInfoModal,
  setMessageInfoModal,
  setShowInfoModal,
  setSolverResultsS3,
  solverResultsS3Selector,
  solverResultsSelector,
  ThemeSelector,
  unsetComputingLp,
  unsetComputingP,
  unsetIterations,
  unsetSolverResults,
} from '../../../../../../../store/tabsAndMenuItemsSlice';
import { publishMessage } from '../../../../../../../../middleware/stompMiddleware';
import { PiClockCountdownBold } from 'react-icons/pi';
import { ImSpinner } from 'react-icons/im';
import { TbTrashXFilled } from 'react-icons/tb';
import { ComponentEntity } from '../../../../../../../../cad_library';
import { useDynamoDBQuery } from '../../../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../../../../../../dynamoDB/projectsFolderApi';
import { electricFieldsResultsStepSelector } from '../../../../../../../store/tabsAndMenuItemsSlice';
import axios from 'axios';

export interface SimulationStatusProps {
  feedbackSimulationVisible: boolean;
  setFeedbackSimulationVisible: (v: boolean) => void;
  activeSimulations: {
    simulation: Simulation;
    freqNumber: number;
    project: Project;
  }[];
}

const SimulationStatus: React.FC<SimulationStatusProps> = ({
  feedbackSimulationVisible,
  setFeedbackSimulationVisible,
  activeSimulations,
}) => {
  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

  const [runningSimulation, setRunningSimulation] = useState<
    { simulation: Simulation; freqNumber: number; project: Project } | undefined
  >(undefined);
  const [queuedSimulations, setqueuedSimulations] = useState<
    { simulation: Simulation; freqNumber: number; project: Project }[]
  >([]);

  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.sendMessage('solvingComputation', [true]);
      return () => {
        window.electron.ipcRenderer.sendMessage('solvingComputation', [false]);
      };
    }
  }, []);

  useEffect(() => {
    activeSimulations.forEach((sim) => {
      if (sim.simulation.status === 'Running') {
        setRunningSimulation(sim);
      } else if (sim.simulation.status === 'Queued') {
        if (
          queuedSimulations.filter(
            (qsim) =>
              qsim.simulation.associatedProject ===
              sim.simulation.associatedProject,
          ).length === 0
        ) {
          setqueuedSimulations((prev) => [...prev, sim]);
        }
      }
    });
    if (!runningSimulation && queuedSimulations.length > 0) {
      let item = queuedSimulations.pop();
      if (item) {
        const simulationUpdated: Simulation = {
          ...item?.simulation,
          status: 'Running',
        };
        dispatch(
          updateSimulation({
            associatedProject: simulationUpdated.associatedProject,
            value: simulationUpdated,
          }),
        );
        setqueuedSimulations(
          queuedSimulations.filter(
            (qsim) =>
              qsim.simulation.associatedProject !==
              item.simulation.associatedProject,
          ),
        );
        setRunningSimulation({
          ...item,
          simulation: {
            ...item.simulation,
            status: 'Running',
          },
        });
      }
    }
  }, [activeSimulations.length]);

  return (
    <div
      className={`absolute right-10 w-1/3 bottom-16 flex flex-col justify-center items-center glass-panel ${isDark ? 'glass-panel-dark' : 'glass-panel-light'
        } p-4 rounded-2xl shadow-2xl transition-all duration-300 backdrop-blur-md border ${isDark ? 'border-white/10' : 'border-white/40'
        } ${!feedbackSimulationVisible && 'hidden'}`}
    >
      <div className="flex flex-row justify-between w-full items-center mb-3">
        <h5 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>Simulation Status</h5>
        <button
          onClick={() => setFeedbackSimulationVisible(false)}
          className={`p-1.5 rounded-full transition-colors duration-200 ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-500 hover:text-black'
            }`}
        >
          <TiArrowMinimise size={20} />
        </button>
      </div>
      <div className={`w-full h-px mb-4 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

      <div className="max-h-[600px] overflow-y-auto w-full pr-1 custom-scrollbar flex flex-col gap-3">
        {runningSimulation && (
          <SimulationStatusItem
            key={runningSimulation.simulation.name}
            name={runningSimulation.simulation.name}
            frequenciesNumber={runningSimulation.freqNumber}
            associatedProject={runningSimulation.project}
            simulation={runningSimulation.simulation}
            setRunningSimulation={setRunningSimulation}
          />
        )}
        {queuedSimulations.map((qs) => (
          <QueuedSimulationStatusItem
            name={qs.simulation.name}
            associatedProject={qs.simulation.associatedProject}
            setqueuedSimulations={setqueuedSimulations}
          />
        ))}
        {!runningSimulation && queuedSimulations.length === 0 && (
          <div className={`text-center py-8 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            No active simulations
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationStatus;

const SimulationStatusItem: React.FC<{
  name: string;
  frequenciesNumber: number;
  associatedProject: Project;
  simulation: Simulation;
  setRunningSimulation: Function;
}> = ({
  name,
  frequenciesNumber,
  associatedProject,
  simulation,
  setRunningSimulation,
}) => {
    const computingP = useSelector(computingPSelector).filter(
      (item) => item.id === associatedProject.id,
    )[0];
    const computingLpx = useSelector(computingLpSelector).filter(
      (item) => item.id === associatedProject.id,
    )[0];
    const iterations = useSelector(iterationsSelector).filter(
      (item) => item.id === associatedProject.id,
    )[0];
    const estimatedTime = useSelector(estimatedTimeSelector);
    const electricFieldsResultsStep = useSelector(
      electricFieldsResultsStepSelector,
    );
    const solverType = useSelector(solverTypeSelector);
    const solverIterations = useSelector(solverIterationsSelector);
    const convergenceThreshold = useSelector(convergenceTresholdSelector);
    const selectedProject = useSelector(selectedProjectSelector);
    const isAlertConfirmed = useSelector(isConfirmedInfoModalSelector);
    const isAlert = useSelector(isAlertInfoModalSelector);
    const solverResults = useSelector(solverResultsSelector).filter(
      (item) => item.id === associatedProject.id,
    )[0];
    const solverResultsS3 = useSelector(solverResultsS3Selector);
    const theme = useSelector(ThemeSelector);
    const isDark = theme !== 'light';
    const dispatch = useDispatch();
    const { execQuery2 } = useDynamoDBQuery();

    useEffect(() => {
      if (isAlertConfirmed) {
        if (!isAlert) {
          dispatch(deleteSimulation(associatedProject.id as string));
          dispatch(
            setMeshApproved({
              approved: false,
              projectToUpdate: associatedProject.id as string,
            }),
          );
          dispatch(unsetComputingLp(associatedProject.id as string));
          dispatch(unsetComputingP(associatedProject.id as string));
          dispatch(unsetIterations(associatedProject.id as string));
          dispatch(unsetSolverResults());
          dispatch(
            publishMessage({
              queue: 'management_solver',
              body: {
                message: 'stop_computation',
                id: associatedProject.id as string,
              },
            }),
          );
          setRunningSimulation(undefined);
          axios
            .post(
              'http://127.0.0.1:8001/stop_computation?sim_id=' +
              associatedProject.id,
            )
            .catch((e) => {
              dispatch(
                setMessageInfoModal('Something went wrong! Check Solver status.'),
              );
              dispatch(setIsAlertInfoModal(false));
              dispatch(setShowInfoModal(true));
            });
        }
      }
    }, [isAlertConfirmed]);

    const solverInputFrom = (
      project: Project,
      solverType: 1 | 2,
      solverIterations: [number, number],
      convergenceThreshold: number,
    ) => {
      const frequencyArray: number[] = project.frequencies as number[];
      return {
        mesherFileId: project.meshData.mesh,
        surfaceFileId: project.meshData.surface,
        storage: project.storage,
        solverInput: {
          ports: project.ports.filter((p) => p.category === 'port'),
          lumped_elements: project.ports.filter((p) => p.category === 'lumped'),
          materials: getMaterialListFrom(
            project?.model?.components as ComponentEntity[],
          ),
          frequencies: frequencyArray,
          /* signals: signalsValuesArray,
          powerPort: project && project.signal?.powerPort, */
          unit: project.modelUnit,
          ports_scattering_value: project.scatteringValue,
        },
        solverAlgoParams: {
          innerIteration: solverIterations[1],
          outerIteration: solverIterations[0],
          convergenceThreshold,
        },
        solverType: solverType,
        id: project.id as string,
        mesherType: process.env.MESHER_RIS_MODE as string,
      };
    };

    useEffect(() => {
      dispatch(setEstimatedTime(undefined));
      dispatch(setElectricFieldsResultsStep(undefined));
      let objectToSendToSolver = solverInputFrom(
        associatedProject,
        solverType,
        solverIterations,
        convergenceThreshold,
      );
      if (associatedProject.meshData.type === 'Standard') {
        axios
          .post('http://127.0.0.1:8001/solve', {
            ...objectToSendToSolver,
            simulationType: associatedProject.simulation?.simulationType,
            mesher: 'standard',
          })
          .catch((e) => {
            dispatch(
              setMessageInfoModal('Something went wrong! Check Solver status.'),
            );
            dispatch(setIsAlertInfoModal(false));
            dispatch(setShowInfoModal(true));
          });
      } else {
        if (associatedProject.simulation?.simulationType === 'Matrix') {
          axios
            .post('http://127.0.0.1:8001/solve', {
              ...objectToSendToSolver,
              simulationType: associatedProject.simulation?.simulationType,
              mesher: 'ris',
            })
            .catch((e) => {
              dispatch(
                setMessageInfoModal('Something went wrong! Check Solver status.'),
              );
              dispatch(setIsAlertInfoModal(false));
              dispatch(setShowInfoModal(true));
            });
        } else {
          axios
            .post('http://127.0.0.1:8001/solve', {
              ...objectToSendToSolver,
              simulationType: associatedProject.simulation?.simulationType,
              mesher: 'ris',
              theta: associatedProject.planeWaveParameters?.input.theta,
              phi: associatedProject.planeWaveParameters?.input.phi,
              e_theta: associatedProject.planeWaveParameters?.input.ETheta,
              e_phi: associatedProject.planeWaveParameters?.input.EPhi,
              baricentro: [
                associatedProject.radialFieldParameters?.center.x,
                associatedProject.radialFieldParameters?.center.y,
                associatedProject.radialFieldParameters?.center.z,
              ],
              r_circ: associatedProject.radialFieldParameters?.radius,
              times: associatedProject.times,
              signal_type_E: associatedProject.planeWaveParameters?.input.ESignal,
              ind_freq_interest: associatedProject.interestFrequenciesIndexes,
              unit: associatedProject.modelUnit,
            })
            .catch((e) => {
              dispatch(
                setMessageInfoModal('Something went wrong! Check Solver status.'),
              );
              dispatch(setIsAlertInfoModal(false));
              dispatch(setShowInfoModal(true));
            });
        }
      }
    }, []);

    useEffect(() => {
      if (solverResultsS3) {
        const simulationUpdatedCompleted: Simulation = {
          ...simulation,
          results: {} as SolverOutput,
          resultS3: solverResultsS3,
          ended: Date.now().toString(),
          status: 'Completed',
        };
        execQuery2(
          createOrUpdateProjectInDynamoDB,
          {
            ...associatedProject,
            simulation: simulationUpdatedCompleted,
          } as Project,
          dispatch,
        ).then(() => {
          setRunningSimulation(undefined);
          dispatch(
            updateSimulation({
              associatedProject: simulation.associatedProject,
              value: {
                ...simulationUpdatedCompleted,
              },
            }),
          );
          dispatch(unsetComputingLp(simulation.associatedProject as string));
          dispatch(unsetComputingP(simulation.associatedProject as string));
          dispatch(unsetIterations(simulation.associatedProject as string));
          dispatch(unsetSolverResults());
          dispatch(setSolverResultsS3(undefined));
        });
      }
    }, [solverResultsS3]);

    const [elapsedTime, setelapsedTime] = useState(0);
    useEffect(() => {
      setelapsedTime(0);
      const interval = setInterval(() => {
        setelapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }, [estimatedTime?.portIndex]);

    return (
      <div className="w-full px-1">
        <div className="mx-auto w-full rounded-2xl">
          <Disclosure defaultOpen>
            {({ open }) => (
              <div className={`rounded-xl overflow-hidden border transition-all duration-300 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white/50'
                }`}>
                <DisclosureButton
                  className={`flex w-full justify-between items-center px-4 py-3 text-left text-sm font-medium focus:outline-none transition-colors duration-200 ${isDark ? 'hover:bg-white/10 text-gray-200' : 'hover:bg-white/60 text-gray-700'
                    }`}
                >
                  <span className="font-semibold">{name}</span>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${isDark
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-green-100 text-green-700 border-green-200'
                      }`}>
                      <ImSpinner className="animate-spin" />
                      <span>Solving</span>
                    </div>
                    <MdKeyboardArrowUp
                      className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 transition-transform duration-200 ${isDark ? 'text-gray-400' : 'text-gray-500'
                        } `}
                    />
                  </div>
                </DisclosureButton>
                <DisclosurePanel className={`px-4 pb-4 pt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div
                    className={`p-4 w-full border rounded-xl flex flex-col gap-4 ${isDark
                      ? 'border-white/10 bg-black/20'
                      : 'border-gray-200 bg-white/50'
                      }`}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wider opacity-70">Computing P</span>
                        {!computingP && (
                          <ImSpinner className={`w-3 h-3 animate-spin ${isDark ? 'text-white' : 'text-black'}`} />
                        )}
                      </div>

                      <div className="flex flex-row justify-between items-center w-full">
                        {computingP && computingP.done ? (
                          <div className="flex flex-row w-full justify-between items-center">
                            <progress
                              className={`progress w-full mr-4 ${isDark ? 'progress-success' : 'progress-success'}`}
                              value={1}
                              max={1}
                            />
                            <AiOutlineCheckCircle
                              size="20px"
                              className="text-green-500"
                            />
                          </div>
                        ) : (
                          <progress
                            className={`progress w-full ${isDark ? 'progress-primary' : 'progress-primary'}`}
                            value={0}
                            max={1}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row items-center gap-2">
                        <span className="text-xs font-medium uppercase tracking-wider opacity-70">Computing Lp</span>
                        {computingP && computingP.done && !computingLpx && (
                          <ImSpinner className={`w-3 h-3 animate-spin ${isDark ? 'text-white' : 'text-black'}`} />
                        )}
                      </div>
                      <div className="flex flex-row justify-between items-center w-full">
                        {computingLpx && computingLpx.done ? (
                          <div className="flex flex-row justify-between items-center w-full">
                            <progress
                              className={`progress w-full mr-4 ${isDark ? 'progress-success' : 'progress-success'}`}
                              value={1}
                              max={1}
                            />
                            <AiOutlineCheckCircle
                              size="20px"
                              className="text-green-500"
                            />
                          </div>
                        ) : (
                          <progress
                            className={`progress w-full ${isDark ? 'progress-primary' : 'progress-primary'}`}
                            value={0}
                            max={1}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row items-center gap-2">
                        <span className="flex flex-row items-center gap-2 text-xs font-medium uppercase tracking-wider opacity-70">
                          Doing Iterations:{' '}
                          {simulation?.simulationType === 'Matrix' ? (
                            <div className="flex flex-row gap-2 items-center normal-case">
                              <span className="font-semibold text-sm">
                                freq {iterations ? iterations.freqNumber : 0}/
                                {frequenciesNumber}
                              </span>
                              {computingLpx &&
                                computingLpx.done &&
                                ((iterations &&
                                  iterations.freqNumber < frequenciesNumber) ||
                                  !iterations) && (
                                  <ImSpinner className={`w-3 h-3 animate-spin ${isDark ? 'text-white' : 'text-black'}`} />
                                )}
                            </div>
                          ) : (
                            <div className="flex flex-row gap-2 items-center normal-case">
                              <span className="font-semibold text-sm">
                                freq {iterations ? iterations.freqNumber : 0}/
                                {
                                  associatedProject?.interestFrequenciesIndexes
                                    ?.length
                                }
                              </span>
                              {computingLpx &&
                                computingLpx.done &&
                                ((associatedProject?.interestFrequenciesIndexes &&
                                  iterations &&
                                  iterations.freqNumber <
                                  associatedProject?.interestFrequenciesIndexes
                                    ?.length) ||
                                  !iterations) && (
                                  <ImSpinner className={`w-3 h-3 animate-spin ${isDark ? 'text-white' : 'text-black'}`} />
                                )}
                            </div>
                          )}
                        </span>
                      </div>
                      <progress
                        className={`progress w-full ${isDark ? 'progress-info' : 'progress-info'}`}
                        value={iterations ? iterations.freqNumber : 0}
                        max={
                          simulation?.simulationType === 'Matrix'
                            ? frequenciesNumber
                            : associatedProject?.interestFrequenciesIndexes
                              ?.length
                        }
                      />
                      {simulation?.simulationType === 'Electric Fields' && (
                        <div className="flex flex-col gap-2 mt-2">
                          <div className="flex flex-row items-center gap-2">
                            <span className="text-xs font-medium uppercase tracking-wider opacity-70">
                              Computing Results:{' '}
                              <span className="normal-case font-semibold">
                                {electricFieldsResultsStep
                                  ? electricFieldsResultsStep.name
                                  : 'hc'}
                              </span>
                            </span>
                            {iterations &&
                              associatedProject?.interestFrequenciesIndexes &&
                              iterations.freqNumber <=
                              associatedProject?.interestFrequenciesIndexes
                                ?.length && (
                                <ImSpinner className={`w-3 h-3 animate-spin ${isDark ? 'text-white' : 'text-black'}`} />
                              )}
                          </div>

                          <div className="flex flex-row justify-between items-center w-full">
                            {electricFieldsResultsStep ? (
                              <div className="flex flex-row justify-between items-center w-full">
                                <progress
                                  className={`progress w-full mr-4 ${isDark ? 'progress-info' : 'progress-info'}`}
                                  value={electricFieldsResultsStep.step}
                                  max={7}
                                />
                              </div>
                            ) : (
                              <progress
                                className={`progress w-full ${isDark ? 'progress-primary' : 'progress-primary'}`}
                                value={0}
                                max={1}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className={`w-full py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-200 transform active:scale-95 mt-4 ${isDark
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                      : 'bg-red-100 text-red-600 border border-red-200 hover:bg-red-200'
                      }`}
                    onClick={() => {
                      dispatch(
                        setMessageInfoModal(
                          'Are you sure to stop the simulation?',
                        ),
                      );
                      dispatch(setIsAlertInfoModal(false));
                      dispatch(setShowInfoModal(true));
                    }}
                  >
                    Stop Simulation
                  </button>
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>
        </div>
      </div>
    );
  };

export interface QueuedSimulationStatusItemProps {
  name: string;
  associatedProject: string;
  setqueuedSimulations: React.Dispatch<
    React.SetStateAction<
      {
        simulation: Simulation;
        freqNumber: number;
        project: Project;
      }[]
    >
  >;
}

const QueuedSimulationStatusItem: React.FC<QueuedSimulationStatusItemProps> = ({
  name,
  associatedProject,
  setqueuedSimulations,
}) => {
  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

  return (
    <div className={`flex w-full justify-between items-center rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${isDark
      ? 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
      : 'border-gray-200 bg-white/50 text-gray-700 hover:bg-white/80'
      }`}>
      <span className="font-semibold">{name}</span>
      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${isDark
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        : 'bg-amber-100 text-amber-700 border-amber-200'
        }`}>
        <PiClockCountdownBold className="w-3.5 h-3.5" />
        <span>Queued</span>
      </div>
      <button
        className={`p-1.5 rounded-full transition-colors duration-200 ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-500'
          }`}
        title="Remove queued simulation"
        onClick={() => {
          setqueuedSimulations((prev) =>
            prev.filter(
              (item) => item.simulation.associatedProject !== associatedProject,
            ),
          );
          dispatch(
            updateSimulation({
              associatedProject: associatedProject,
              value: undefined,
            }),
          );
        }}
      >
        <TbTrashXFilled className="w-5 h-5" />
      </button>
    </div>
  );
};
