import React from 'react';
import { FaCheck, FaPauseCircle } from 'react-icons/fa';
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
import noresultfound from '../../../../../assets/noresultfound.png';

interface SimulationsProps {
  maxH: string
}

export const Simulations: React.FC<SimulationsProps> = ({maxH}) => {
  const dispatch = useDispatch();
  const mainFolder = useSelector(mainFolderSelector);
  const projects = useSelector(projectsSelector);
  const projectsTabs = useSelector(projectsTabsSelector);

  const simulations: Simulation[] = [];

  function getAllSimulation(folder: Folder) {
    folder.projectList.forEach((p) => {
      p.simulation && simulations.push(p.simulation);
    });
    folder.subFolders.forEach((f) => {
      getAllSimulation(f);
    });
  }

  getAllSimulation(mainFolder);

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
      case 'Paused':
        return <FaPauseCircle color="#ec0c0c" />;
      case 'Queued':
        return <MdWatchLater color="#ffcc00" />;
      default:
        return <></>;
    }
  }

  return (
    <div className="text-center p-[20px] box w-full flex flex-col h-fit">
      <h5 className="text-left text-base p-2">Simulations</h5>
      {simulations.length > 0 ? (
        <div className={`overflow-auto h-full ${maxH} w-full mt-5`}>
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
                    <th scope="row" className="pl-8">
                      {statusIcon}
                    </th>
                    <td className="fw-bold py-4">{simulation.name}</td>
                    <td className="py-4">{`${started.toLocaleString()}`}</td>
                    <td className="py-4">{`${ended.toLocaleString()}`}</td>
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
