import React, { useEffect, useState } from 'react';
import { FaCheck, FaPauseCircle, FaSortAlphaDown } from 'react-icons/fa';
import { TiDelete } from 'react-icons/ti';
import { MdWatchLater } from 'react-icons/md';
import { AiOutlineBarChart } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import {
  findProjectByFaunaID,
  mainFolderSelector,
  projectsSelector,
  selectProject,
} from '../../../store/projectSlice';
import {
  addProjectTab,
  projectsTabsSelector,
  selectMenuItem,
  selectTab,
} from '../../../store/tabsAndMenuItemsSlice';
import { Folder, Simulation } from '../../../model/esymiaModels';
import noresultfound from '../../../../../../assets/noresultfound.png';
import { ImSpinner } from 'react-icons/im';
import { setPortsFromS3 } from '../../simulationTabsManagement/tabs/physics/Physics';
import { IoCheckmark, IoFilterSharp } from 'react-icons/io5';
import { CheckBadgeIcon } from '@heroicons/react/20/solid';

interface SimulationsProps {
  maxH: string;
}

export function msToTime(duration: number) {
  let milliseconds = Math.floor((duration % 1000) / 100);
  let seconds: number | string = Math.floor((duration / 1000) % 60);
  let minutes: number | string = Math.floor((duration / (1000 * 60)) % 60);
  let hours: number | string = Math.floor(duration / (1000 * 60 * 60));

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  if (milliseconds > 0.5) {
    seconds = (seconds as number) + 1;
  }

  return hours + ' h ' + minutes + ' min ' + seconds + ' sec';
}

export const Simulations: React.FC<SimulationsProps> = ({ maxH }) => {
  const dispatch = useDispatch();
  const mainFolder = useSelector(mainFolderSelector);
  const projects = useSelector(projectsSelector);
  const projectsTabs = useSelector(projectsTabsSelector);

  function getAllSimulation(folder: Folder) {
    let sim: Simulation[] = [];
    folder.projectList.forEach((p) => {
      p.simulation && sim.push(p.simulation);
    });
    folder.subFolders.forEach((f) => {
      sim = [...sim, ...getAllSimulation(f)];
    });
    return sim;
  }

  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [order, setOrder] = useState('Started Date');

  useEffect(() => {
    //console.log(mainFolder)
    setSimulations(getAllSimulation(mainFolder));
  }, [mainFolder]);

  /* function showResultsIcon(id: string) {
    document.getElementById(id)?.setAttribute('style', 'visibility: visible');
  }

  function hideResultsIcon(id: string) {
    document.getElementById(id)?.setAttribute('style', 'visibility: hidden');
  } */

  function factoryStatusIcon(status: string) {
    switch (status) {
      case 'Completed':
        return <FaCheck color="#1aa33c" />;
      case 'Failed':
        return <TiDelete color="#ec0c0c" />;
      case 'Running':
        return <ImSpinner className="w-6 h-6 animate-spin text-green-400" />;
      case 'Queued':
        return <MdWatchLater color="#ffcc00" />;
      default:
        return <></>;
    }
  }

  return (
    <div className="text-center p-[20px] box w-full flex flex-col h-fit">
      <div className="flex flex-row justify-between w-full items-center">
        <h5 className="text-left text-base p-2">Simulations</h5>
        <div className="tooltip" data-tip="Order By">
          <div className="dropdown">
            <div tabIndex={0} role="button">
              <FaSortAlphaDown
                size={22}
                className="hover:opacity-50 hover:cursor-pointer"
              />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content hover:bg-white menu bg-base-100 rounded-box z-[1] mt-2 w-52 p-2 shadow"
            >
              <li
                className="flex flex-row items-center gap-4"
                onClick={() => {
                  setOrder('Name');
                  setSimulations((prev) => {
                    const simToSort = [...prev];
                    simToSort.sort((sim1, sim2) => {
                      if (sim1.name < sim2.name) {
                        return -1;
                      } else if (sim1.name > sim2.name) {
                        return 1;
                      }
                      return 0;
                    });
                    return simToSort;
                  });
                }}
              >
                <div className="flex flex-row items-center gap-4">
                  <a>Name</a>
                  {order === 'Name' && (
                    <IoCheckmark size={15} className="text-green-600" />
                  )}
                </div>
              </li>
              <li
                onClick={() => {
                  setOrder('Started Date');
                  setSimulations((prev) => {
                    const simToSort = [...prev];
                    simToSort.sort((sim1, sim2) => {
                      if (parseInt(sim1.started) < parseInt(sim2.started)) {
                        return -1;
                      } else if (
                        parseInt(sim1.started) > parseInt(sim2.started)
                      ) {
                        return 1;
                      }
                      return 0;
                    });
                    return simToSort;
                  });
                }}
              >

                <div className="flex flex-row items-center gap-4">
                  <a>Started Date</a>
                  {order === 'Started Date' && (
                    <IoCheckmark size={15} className="text-green-600" />
                  )}
                </div>
              </li>
              <li
                onClick={() => {
                  setOrder('Simulation Time');
                  setSimulations((prev) => {
                    const simToSort = [...prev];
                    simToSort.sort((sim1, sim2) => {
                      if (parseInt(sim1.ended)-parseInt(sim1.started) < parseInt(sim2.ended)-parseInt(sim2.started)) {
                        return -1;
                      } else if (
                        parseInt(sim1.ended)-parseInt(sim1.started) > parseInt(sim2.ended)-parseInt(sim2.started)
                      ) {
                        return 1;
                      }
                      return 0;
                    });
                    return simToSort;
                  });
                }}
              >

                <div className="flex flex-row items-center gap-4">
                  <a>Simulation Time</a>
                  {order === 'Simulation Time' && (
                    <IoCheckmark size={15} className="text-green-600" />
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {simulations.length > 0 ? (
        <div className={`overflow-scroll h-full ${maxH} w-full mt-5`}>
          <table className="table mt-4 w-full">
            <thead className="sticky top-0 bg-[#f4f4f4]">
              <tr>
                <th className="py-4" scope="col" />
                <th className="py-4" scope="col">
                  Project - Name
                </th>
                <th className="py-4" scope="col">
                  Started
                </th>
                <th className="py-4" scope="col">
                  Ended
                </th>
                <th className="py-4" scope="col">
                  Simulation Time
                </th>
                <th className="py-4" scope="col">
                  Status
                </th>
                <th className="py-4" scope="col" />
              </tr>
            </thead>
            <tbody>
              {simulations.map((simulation, index) => {
                const statusIcon: JSX.Element = factoryStatusIcon(
                  simulation.status,
                );
                const started = new Date(parseInt(simulation.started));
                const ended = new Date(parseInt(simulation.ended));
                return (
                  <tr
                    key={`${simulation.name}_${index}`}
                    className="hover:bg-[#f1f1f1]"
                  >
                    <td scope="row" className="pl-8">
                      {statusIcon}
                    </td>
                    <td className="fw-bold py-4">{simulation.name}</td>
                    <td className="py-4">{`${started.toLocaleString()}`}</td>
                    <td className="py-4">{`${ended.toLocaleString()}`}</td>
                    <td className="py-4">
                      {msToTime(ended.getTime() - started.getTime())}
                    </td>
                    <td className="py-4">{simulation.status}</td>
                    <td
                      id={index.toString()}
                      className="py-4 hover:cursor-pointer"
                    >
                      <AiOutlineBarChart
                        color="#00ae52"
                        style={{ width: '30px', height: '30px' }}
                        onClick={() => {
                          const proj = findProjectByFaunaID(
                            projects,
                            simulation.associatedProject,
                          );
                          if (proj?.portsS3 && proj.ports.length === 0) {
                            setPortsFromS3(proj, dispatch);
                          }
                          if (proj) {
                            if (
                              projectsTabs.filter(
                                (p) =>
                                  p.faunaDocumentId === proj?.faunaDocumentId,
                              ).length > 0
                            ) {
                              dispatch(
                                selectTab(proj.faunaDocumentId as string),
                              );
                            } else {
                              dispatch(addProjectTab(proj));
                            }
                            dispatch(
                              selectProject(simulation.associatedProject),
                            );
                            dispatch(selectMenuItem('Results'));
                          }
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <img
            src={noresultfound}
            className="my-[46px] mx-auto"
            alt="No Results Icon"
          />
          <p>No results found</p>
        </div>
      )}
    </div>
  );
};
