import React, { useEffect, useState } from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { Disclosure } from '@headlessui/react';
import useWebSocket from 'react-use-websocket';
import { TiArrowMinimise } from 'react-icons/ti';
import { MdKeyboardArrowUp } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { ComponentEntity, useFaunaQuery } from 'cad-library';
import { Project, Simulation } from '../../../../../../model/esymiaModels';
import {
  convergenceTresholdSelector,
  solverIterationsSelector,
} from '../../../../../../store/solverSlice';
import {
  deleteSimulation,
  findProjectByFaunaID,
  projectsSelector,
  selectedProjectSelector,
  setMeshApproved,
  sharedProjectsSelector,
  updateSimulation,
} from '../../../../../../store/projectSlice';
import { updateProjectInFauna } from '../../../../../../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../../../../../../faunadb/apiAuxiliaryFunctions';
import { getMaterialListFrom } from '../../Simulator';
import {
  isAlertInfoModalSelector,
  isConfirmedInfoModalSelector,
  setIsAlertInfoModal,
  setMessageInfoModal,
  setShowInfoModal,
} from '../../../../../../store/tabsAndMenuItemsSlice';

export interface SimulationStatusProps {
  feedbackSimulationVisible: boolean;
  setFeedbackSimulationVisible: (v: boolean) => void;
  activeSimulations: { simulation: Simulation; freqNumber: number }[];
}

const SimulationStatus: React.FC<SimulationStatusProps> = ({
  feedbackSimulationVisible,
  setFeedbackSimulationVisible,
  activeSimulations,
}) => {
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
        {activeSimulations.map((sim) => (
          <SimulationStatusItem
            key={sim.simulation.name}
            name={sim.simulation.name}
            frequenciesNumber={sim.freqNumber}
            associatedProjectID={sim.simulation.associatedProject}
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
  associatedProjectID: string;
}> = ({ name, frequenciesNumber, associatedProjectID }) => {
  const WS_URL = 'ws://localhost:8080';
  const [computingP, setComputingP] = useState(false);
  const [computingLpx, setComputingLpx] = useState(false);
  const [iterations, setIterations] = useState(0);
  const selectedProject = useSelector(selectedProjectSelector) as Project;
  const solverIterations = useSelector(solverIterationsSelector);
  const convergenceThreshold = useSelector(convergenceTresholdSelector);
  const allProjects = useSelector(projectsSelector);
  const allSharedProjects = useSelector(sharedProjectsSelector);
  const isAlertConfirmed = useSelector(isConfirmedInfoModalSelector);
  const isAlert = useSelector(isAlertInfoModalSelector);

  const dispatch = useDispatch();
  const { execQuery } = useFaunaQuery();

  useEffect(() => {
    if (isAlertConfirmed) {
      if (!isAlert) {
        sendMessage('Stop computation');
      } else {
        dispatch(deleteSimulation(associatedProjectID));
        dispatch(setMeshApproved(false));
      }
    }
  }, [isAlertConfirmed]);

  const solverInputFrom = (
    project: Project,
    solverIterations: [number, number],
    convergenceThreshold: number,
  ) => {
    const frequencyArray: number[] = project.frequencies as number[];
    return {
      mesherFileId: project.meshData.mesh,
      solverInput: {
        ports: project.ports.filter((p) => p.category === 'port'),
        lumped_elements: project.ports.filter((p) => p.category === 'lumped'),
        materials: getMaterialListFrom(
          project?.model?.components as ComponentEntity[],
        ),
        frequencies: frequencyArray,
        /* signals: signalsValuesArray,
        powerPort: project && project.signal?.powerPort, */
        unit: selectedProject.modelUnit,
        ports_scattering_value: project.scatteringValue,
      },
      solverAlgoParams: {
        innerIteration: solverIterations[1],
        outerIteration: solverIterations[0],
        convergenceThreshold,
      },
    };
  };

  const { sendMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
      // https://teemaserver.cloud/solving
      console.log('start request');
      axios
        .post(
          'http://127.0.0.1:8000/solving',
          solverInputFrom(
            selectedProject,
            solverIterations,
            convergenceThreshold,
          ),
        )
        .then((res) => {
          if (res.data === false) {
            dispatch(deleteSimulation(associatedProjectID));
            dispatch(setMeshApproved(false));
          } else {
            // dispatch(setSolverOutput(res.data));
            const simulationUpdated: Simulation = {
              ...(selectedProject.simulation as Simulation),
              results: res.data,
              ended: Date.now().toString(),
              status: 'Completed',
            };
            dispatch(updateSimulation(simulationUpdated));
            execQuery(
              updateProjectInFauna,
              convertInFaunaProjectThis({
                ...findProjectByFaunaID(
                  [...allProjects, ...allSharedProjects],
                  simulationUpdated.associatedProject,
                ),
                simulation: simulationUpdated,
              } as Project),
            ).then(() => {});
          }
        })
        .catch((err) => {
          console.log(err);
          dispatch(
            setMessageInfoModal('Error while solving, please try again'),
          );
          dispatch(setIsAlertInfoModal(true));
          dispatch(setShowInfoModal(true));
        });
    },
    shouldReconnect: () => true,
    onMessage: (event) => {
      if (event.data === 'P Computing Completed') {
        setComputingP(true);
      } else if (event.data === 'Lp Computing Completed') {
        setComputingLpx(true);
      } else {
        setIterations(event.data);
      }
    },
    onClose: () => {
      console.log('WebSocket connection closed.');
    },
  });

  return (
    <div className="w-full px-4 pt-2">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-2">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex w-full justify-between rounded-lg border border-secondaryColor px-4 py-2 text-left text-sm font-medium text-secondaryColor hover:bg-green-100 focus:outline-none focus-visible:ring focus-visible:ring-green-500/75">
                <span>{name}</span>
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
                      {computingP ? (
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
                      {computingLpx ? (
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
                      value={iterations}
                      max={frequenciesNumber + 1}
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
