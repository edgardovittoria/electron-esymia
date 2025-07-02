import React, { useEffect, useState } from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { Disclosure } from '@headlessui/react';
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
  const [runningSimulation, setRunningSimulation] = useState<
    { simulation: Simulation; freqNumber: number; project: Project } | undefined
  >(undefined);
  const [queuedSimulations, setqueuedSimulations] = useState<
    { simulation: Simulation; freqNumber: number; project: Project }[]
  >([]);

  useEffect(() => {
    if (process.env.APP_MODE !== 'test') {
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
      className={`absolute right-10 w-1/3 bottom-16 flex flex-col justify-center items-center ${
        theme === 'light'
          ? 'bg-white text-textColor'
          : 'bg-bgColorDark2 text-textColorDark'
      } p-3 rounded ${!feedbackSimulationVisible && 'hidden'}`}
    >
      <div className="flex flex-row justify-between">
        <h5>Simulation Status</h5>
        <TiArrowMinimise
          className="absolute top-2 right-2 hover:cursor-pointer hover:bg-gray-200"
          size={20}
          onClick={() => setFeedbackSimulationVisible(false)}
        />
      </div>
      <hr className="text-secondaryColor w-full mb-5 mt-3" />
      <div className="max-h-[600px] overflow-y-scroll w-full">
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

  // useEffect(() => {
  //   if (solverResults) {
  //     if (solverResults.error) {
  //       dispatch(
  //         setMessageInfoModal(
  //           'Memory error, the computation can not be run, try a larger quantum if possible!',
  //         ),
  //       );
  //       dispatch(setIsAlertInfoModal(true));
  //       dispatch(setShowInfoModal(true));
  //       dispatch(deleteSimulation(associatedProject.faunaDocumentId as string));
  //       dispatch(
  //         setMeshApproved({
  //           approved: false,
  //           projectToUpdate: associatedProject.faunaDocumentId as string,
  //         }),
  //       );
  //       dispatch(unsetComputingLp(simulation.associatedProject as string));
  //       dispatch(unsetComputingP(simulation.associatedProject as string));
  //       dispatch(unsetIterations(simulation.associatedProject as string));
  //       dispatch(unsetSolverResults(simulation.associatedProject as string));
  //     } else {
  //       if (solverResults.isStopped) {
  //         dispatch(
  //           deleteSimulation(associatedProject.faunaDocumentId as string),
  //         );
  //         dispatch(
  //           setMeshApproved({
  //             approved: false,
  //             projectToUpdate: associatedProject.faunaDocumentId as string,
  //           }),
  //         );
  //         dispatch(unsetComputingLp(simulation.associatedProject as string));
  //         dispatch(unsetComputingP(simulation.associatedProject as string));
  //         dispatch(unsetIterations(simulation.associatedProject as string));
  //         dispatch(unsetSolverResults(simulation.associatedProject as string));
  //       } else {
  //         if(solverResults.partial){
  //           const simulationUpdated: Simulation = {
  //             ...simulation,
  //             results: {
  //               ...solverResults.matrices,
  //               freqIndex: solverResults.freqIndex,
  //             },
  //             ended: Date.now().toString(),
  //             status: solverResults.partial ? 'Running' : 'Completed',
  //           };
  //           dispatch(
  //             updateSimulation({
  //               associatedProject: simulation.associatedProject,
  //               value: simulationUpdated,
  //             }),
  //           );
  //         }
  //       }
  //     }
  //   }
  // }, [solverResults]);

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
              // results: {
              //   ...solverResults.matrices,
              //   freqIndex: solverResults.freqIndex,
              // },
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
    <div className="w-full px-4 pt-2">
      <div className="mx-auto w-full max-w-xl rounded-2xl p-2">
        <Disclosure defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button
                className={`flex w-full justify-between rounded-lg border px-4 py-2 text-left text-sm font-medium ${
                  theme === 'light'
                    ? 'border-secondaryColor text-secondaryColor hover:bg-green-100'
                    : 'border-textColorDark text-textColorDark hover:bg-bgColorDark'
                } focus:outline-none focus-visible:ring focus-visible:ring-green-500/75`}
              >
                <span>{name}</span>
                <div className="badge bg-green-500 text-white flex flex-row gap-2 items-center py-3">
                  <ImSpinner className="w-4 h-4 animate-spin" />
                  <span>solving</span>
                </div>
                <MdKeyboardArrowUp
                  className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 ${
                    theme === 'light'
                      ? 'text-secondaryColor'
                      : 'text-textColorDark'
                  }`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pb-2 pt-4 text-sm">
                <div
                  className={`p-5 w-full border ${
                    theme === 'light'
                      ? 'border-secondaryColor'
                      : 'border-textColorDark'
                  }  rounded`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row items-center gap-2">
                      <span>Computing P</span>
                      {!computingP && (
                        <ImSpinner className="w-3 h-3 animate-spin" />
                      )}
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                      {computingP && computingP.done ? (
                        <div className="flex flex-row w-full justify-between items-center">
                          <progress
                            className="progress w-full mr-4"
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
                          className="progress w-full"
                          value={0}
                          max={1}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex flex-row items-center gap-2">
                      <span>Computing Lp</span>
                      {computingP && computingP.done && !computingLpx && (
                        <ImSpinner className="w-3 h-3 animate-spin" />
                      )}
                    </div>
                    <div className="flex flex-row justify-between items-center w-full">
                      {computingLpx && computingLpx.done ? (
                        <div className="flex flex-row justify-between items-center w-full">
                          <progress
                            className="progress w-full mr-4"
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
                          className="progress w-full"
                          value={0}
                          max={1}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex flex-row items-center gap-2">
                      <span className="flex flex-row items-center gap-2">
                        Doing Iterations:{' '}
                        {simulation?.simulationType === 'Matrix' ? (
                          <div className="flex flex-row gap-2 items-center">
                            <span className="font-semibold">
                              freq {iterations ? iterations.freqNumber : 0}/
                              {frequenciesNumber}
                            </span>
                            {computingLpx &&
                              computingLpx.done &&
                              ((iterations &&
                                iterations.freqNumber < frequenciesNumber) ||
                                !iterations) && (
                                <ImSpinner className="w-3 h-3 animate-spin" />
                              )}
                          </div>
                        ) : (
                          <div className="flex flex-row gap-2 items-center">
                            <span className="font-semibold">
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
                                <ImSpinner className="w-3 h-3 animate-spin" />
                              )}
                          </div>
                        )}
                      </span>
                    </div>
                    <progress
                      className="progress w-full"
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
                          <span>
                            Computing Results:{' '}
                            {electricFieldsResultsStep
                              ? electricFieldsResultsStep.name
                              : 'hc'}
                          </span>
                          {iterations &&
                            associatedProject?.interestFrequenciesIndexes &&
                            iterations.freqNumber <=
                              associatedProject?.interestFrequenciesIndexes
                                ?.length && (
                              <ImSpinner className="w-3 h-3 animate-spin" />
                            )}
                        </div>

                        <div className="flex flex-row justify-between items-center w-full">
                          {electricFieldsResultsStep ? (
                            <div className="flex flex-row justify-between items-center w-full">
                              <progress
                                className="progress w-full mr-4"
                                value={electricFieldsResultsStep.step}
                                max={7}
                              />
                            </div>
                          ) : (
                            <progress
                              className="progress w-full"
                              value={0}
                              max={1}
                            />
                          )}
                        </div>
                      </div>
                    )}
                    {simulation?.simulationType === 'Matrix' && (
                      <div className="max-h-[200px] overflow-y-scroll flex flex-col gap-2">
                        {associatedProject.ports
                          .filter((p) => p.category === 'port')
                          .map((port, index) => {
                            return (
                              <div className="flex flex-row items-center gap-4">
                                <span className="text-xs font-semibold">
                                  {port.name}
                                </span>
                                {estimatedTime &&
                                  estimatedTime.estimatedTime &&
                                  index === estimatedTime.portIndex - 1 && (
                                    <ImSpinner className="animate-spin w-3 h-3" />
                                  )}
                                {estimatedTime &&
                                  estimatedTime.estimatedTime &&
                                  index === estimatedTime.portIndex - 1 && (
                                    <span className="text-xs font-semibold">
                                      {elapsedTime} s
                                    </span>
                                  )}
                                {estimatedTime &&
                                  estimatedTime.estimatedTime &&
                                  index === estimatedTime.portIndex - 1 && (
                                    <span className="text-xs">
                                      worst case estimated time{' '}
                                      <span className="text-xs font-semibold">
                                        {(
                                          estimatedTime?.estimatedTime *
                                          solverIterations[1]
                                        ).toFixed(2)}
                                      </span>{' '}
                                      sec
                                    </span>
                                  )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={`button w-full buttonPrimary ${
                    theme === 'light'
                      ? ''
                      : 'bg-secondaryColorDark text-textColor'
                  } text-center mt-4 mb-4`}
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
                </div>
              </Disclosure.Panel>
            </>
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

  return (
    <div className="flex my-2 w-full justify-between items-center rounded-lg border border-secondaryColor px-4 py-2 text-left text-sm font-medium text-secondaryColor hover:bg-green-100 focus:outline-none focus-visible:ring focus-visible:ring-green-500/75">
      <span>{name}</span>
      <div className="badge bg-amber-500 text-white flex flex-row gap-2 items-center py-3">
        <PiClockCountdownBold className="w-4 h-4" />
        <span>queued</span>
      </div>
      <div
        className="tooltip tooltip-left hover:cursor-pointer"
        data-tip="Remuove queued simulation"
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
        <TbTrashXFilled className="w-6 h-6 text-red-500 hover:text-red-800" />
      </div>
    </div>
  );
};
