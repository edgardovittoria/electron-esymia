import React, { useEffect, useState } from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { Disclosure } from '@headlessui/react';
import { TiArrowMinimise } from 'react-icons/ti';
import { MdKeyboardArrowUp } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { Project, Simulation } from '../../../../../../model/esymiaModels';
import {
  convergenceTresholdSelector,
  solverIterationsSelector,
  solverTypeSelector,
} from '../../../../../../store/solverSlice';
import {
  deleteSimulation,
  setMeshApproved,
  updateSimulation,
} from '../../../../../../store/projectSlice';
import { getMaterialListFrom } from '../../Simulator';
import {
  computingLpSelector,
  computingPSelector,
  isAlertInfoModalSelector,
  isConfirmedInfoModalSelector,
  iterationsSelector,
  setIsAlertInfoModal,
  setMessageInfoModal,
  setShowInfoModal,
  solverResultsSelector,
  unsetComputingLp,
  unsetComputingP,
  unsetIterations,
  unsetSolverResults,
} from '../../../../../../store/tabsAndMenuItemsSlice';
import { convertInFaunaProjectThis } from '../../../../../../faunadb/apiAuxiliaryFunctions';
import { updateProjectInFauna } from '../../../../../../faunadb/projectsFolderAPIs';
import { publishMessage } from '../../../../../../../middleware/stompMiddleware';
import { PiClockCountdownBold } from 'react-icons/pi';
import { ImSpinner } from 'react-icons/im';
import { TbTrashXFilled } from 'react-icons/tb';
import { useFaunaQuery } from '../../../../../../faunadb/hook/useFaunaClient';
import { ComponentEntity } from '../../../../../../../cad_library';

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
  const [runningSimulation, setRunningSimulation] = useState<
    { simulation: Simulation; freqNumber: number; project: Project } | undefined
  >(undefined);
  const [queuedSimulations, setqueuedSimulations] = useState<
    { simulation: Simulation; freqNumber: number; project: Project }[]
  >([]);

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('solvingComputation', [true]);
    return () => {
      window.electron.ipcRenderer.sendMessage('solvingComputation', [false]);
    };
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
      className={`absolute right-10 w-1/4 bottom-16 flex flex-col justify-center items-center bg-white p-3 rounded ${
        !feedbackSimulationVisible && 'hidden'
      }`}
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
    (item) => item.id === associatedProject.faunaDocumentId,
  )[0];
  const computingLpx = useSelector(computingLpSelector).filter(
    (item) => item.id === associatedProject.faunaDocumentId,
  )[0];
  const iterations = useSelector(iterationsSelector).filter(
    (item) => item.id === associatedProject.faunaDocumentId,
  )[0];
  const solverType = useSelector(solverTypeSelector)
  const solverIterations = useSelector(solverIterationsSelector);
  const convergenceThreshold = useSelector(convergenceTresholdSelector);
  const isAlertConfirmed = useSelector(isConfirmedInfoModalSelector);
  const isAlert = useSelector(isAlertInfoModalSelector);
  const solverResults = useSelector(solverResultsSelector).filter(
    (item) => item.id === associatedProject.faunaDocumentId,
  )[0];
  const dispatch = useDispatch();
  const { execQuery } = useFaunaQuery();

  useEffect(() => {
    if (isAlertConfirmed) {
      if (!isAlert) {
        dispatch(
          publishMessage({
            queue: 'management_solver',
            body: {
              message: 'stop_computation',
              id: associatedProject.faunaDocumentId as string,
            },
          }),
        );
      } else {
        dispatch(deleteSimulation(associatedProject.faunaDocumentId as string));
        dispatch(
          setMeshApproved({
            approved: false,
            projectToUpdate: associatedProject.faunaDocumentId as string,
          }),
        );
      }
    }
  }, [isAlertConfirmed]);

  const solverInputFrom = (
    project: Project,
    solverType: 1|2,
    solverIterations: [number, number],
    convergenceThreshold: number,
  ) => {
    const frequencyArray: number[] = project.frequencies as number[];
    return {
      mesherFileId: project.meshData.mesh,
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
      id: project.faunaDocumentId as string,
    };
  };

  useEffect(() => {
    let objectToSendToSolver = solverInputFrom(
      associatedProject,
      solverType,
      solverIterations,
      convergenceThreshold,
    );
    dispatch(
      publishMessage({
        queue: 'management_solver',
        body: { message: 'solving', body: objectToSendToSolver },
      }),
    );
    // client.publish({destination: "management_solver", body: JSON.stringify({ message: "solving", body: objectToSendToSolver })})
    return () => {
      dispatch(unsetComputingLp(associatedProject.faunaDocumentId as string));
      dispatch(unsetComputingP(associatedProject.faunaDocumentId as string));
      dispatch(unsetIterations(associatedProject.faunaDocumentId as string));
      dispatch(unsetSolverResults(associatedProject.faunaDocumentId as string));
    };
  }, []);

  useEffect(() => {
    if (solverResults) {
      if (solverResults.error) {
        dispatch(
          setMessageInfoModal(
            'Memory error, the computation can not be run, try a larger quantum if possible!',
          ),
        );
        dispatch(setIsAlertInfoModal(true));
        dispatch(setShowInfoModal(true));
        dispatch(deleteSimulation(associatedProject.faunaDocumentId as string));
        dispatch(
          setMeshApproved({
            approved: false,
            projectToUpdate: associatedProject.faunaDocumentId as string,
          }),
        );
      } else {
        if (solverResults.isStopped) {
          dispatch(
            deleteSimulation(associatedProject.faunaDocumentId as string),
          );
          dispatch(
            setMeshApproved({
              approved: false,
              projectToUpdate: associatedProject.faunaDocumentId as string,
            }),
          );
        } else {
          // dispatch(setSolverOutput(res.data));
          const simulationUpdated: Simulation = {
            ...simulation,
            results: {
              ...solverResults.matrices,
              freqIndex: solverResults.freqIndex,
            },
            ended: Date.now().toString(),
            status: solverResults.partial ? 'Running' : 'Completed',
          };
          dispatch(
            updateSimulation({
              associatedProject: simulation.associatedProject,
              value: simulationUpdated,
            }),
          );
          if (!solverResults.partial) {
            execQuery(
              updateProjectInFauna,
              convertInFaunaProjectThis({
                ...associatedProject,
                simulation: simulationUpdated,
              } as Project),
              dispatch,
            ).then(() => {});
            setRunningSimulation(undefined);
          }
        }
      }
    }
  }, [solverResults]);

  return (
    <div className="w-full px-4 pt-2">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-2">
        <Disclosure defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between rounded-lg border border-secondaryColor px-4 py-2 text-left text-sm font-medium text-secondaryColor hover:bg-green-100 focus:outline-none focus-visible:ring focus-visible:ring-green-500/75">
                <span>{name}</span>
                <div className="badge bg-green-500 text-white flex flex-row gap-2 items-center py-3">
                  <ImSpinner className="w-4 h-4 animate-spin" />
                  <span>solving</span>
                </div>
                <MdKeyboardArrowUp
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-secondaryColor`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pb-2 pt-4 text-sm text-gray-500">
                <div className="p-5 w-full border border-secondaryColor rounded">
                  <div className="flex flex-col gap-2">
                    <span>Computing P</span>
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
                        <progress className="progress w-full" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <span>Computing Lp</span>
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
                        <progress className="progress w-full" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <span>Doing Iterations</span>
                    <progress
                      className="progress w-full"
                      value={iterations ? iterations.freqNumber : 0}
                      max={frequenciesNumber}
                    />
                  </div>
                </div>
                <div
                  className="button w-full buttonPrimary text-center mt-4 mb-4"
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
