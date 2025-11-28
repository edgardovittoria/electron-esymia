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
  ThemeSelector,
} from '../../../store/tabsAndMenuItemsSlice';
import { Folder, Simulation } from '../../../model/esymiaModels';
import noresultfound from '../../../../../../assets/noresultfound.png';
import noresultfoundDark from '../../../../../../assets/noresultfoundDark.png';
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
  if (milliseconds > 0.5) {
    seconds = (seconds as number) + 1;
  }
  seconds = seconds < 10 ? '0' + seconds : seconds;
  return hours + ' h ' + minutes + ' min ' + seconds + ' sec';
}

export const Simulations: React.FC<SimulationsProps> = ({ maxH }) => {
  const dispatch = useDispatch();
  const mainFolder = useSelector(mainFolderSelector);
  const projects = useSelector(projectsSelector);
  const projectsTabs = useSelector(projectsTabsSelector);
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

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
    setSimulations(getAllSimulation(mainFolder));
  }, [mainFolder]);

  function factoryStatusIcon(status: string) {
    switch (status) {
      case 'Completed':
        return <FaCheck className="text-green-500" />;
      case 'Failed':
        return <TiDelete className="text-red-500" size={20} />;
      case 'Running':
        return <ImSpinner className="w-5 h-5 animate-spin text-green-400" />;
      case 'Queued':
        return <MdWatchLater className="text-yellow-400" />;
      default:
        return <></>;
    }
  }

  return (
    <div className={`glass-panel ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} rounded-2xl p-6 flex flex-col h-full w-full`}>
      <div className="flex flex-row justify-between w-full items-center mb-6">
        <h5 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Simulations</h5>

        <div className="relative group">
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
            <span className="text-sm">Sort by: {order}</span>
            <FaSortAlphaDown />
          </button>

          <div className={`absolute right-0 mt-2 w-48 py-2 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
            {['Name', 'Started Date', 'Simulation Time'].map((item) => (
              <div
                key={item}
                className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between ${isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}
                onClick={() => {
                  setOrder(item);
                  setSimulations((prev) => {
                    const simToSort = [...prev];
                    simToSort.sort((sim1, sim2) => {
                      if (item === 'Name') return sim1.name.localeCompare(sim2.name);
                      if (item === 'Started Date') return parseInt(sim1.started) - parseInt(sim2.started);
                      if (item === 'Simulation Time') {
                        const time1 = parseInt(sim1.ended) - parseInt(sim1.started);
                        const time2 = parseInt(sim2.ended) - parseInt(sim2.started);
                        return time1 - time2;
                      }
                      return 0;
                    });
                    return simToSort;
                  });
                }}
              >
                {item}
                {order === item && <IoCheckmark className="text-green-500" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {simulations.length > 0 ? (
        <div className={`overflow-auto flex-1 w-full ${maxH}`}>
          <table className="w-full text-left border-collapse">
            <thead className={`sticky top-0 z-10 ${isDark ? 'bg-gray-800/90 text-gray-400' : 'bg-gray-50/90 text-gray-500'} backdrop-blur-sm`}>
              <tr>
                <th className="py-3 px-4 font-medium text-sm rounded-l-lg">Status</th>
                <th className="py-3 px-4 font-medium text-sm">Project - Name</th>
                <th className="py-3 px-4 font-medium text-sm">Started</th>
                <th className="py-3 px-4 font-medium text-sm">Ended</th>
                <th className="py-3 px-4 font-medium text-sm">Duration</th>
                <th className="py-3 px-4 font-medium text-sm">Status Text</th>
                <th className="py-3 px-4 font-medium text-sm rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/10">
              {simulations.map((simulation, index) => {
                const statusIcon = factoryStatusIcon(simulation.status);
                const started = new Date(parseInt(simulation.started));
                const ended = new Date(parseInt(simulation.ended));
                return (
                  <tr
                    key={`${simulation.name}_${index}`}
                    className={`group transition-colors duration-200 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                  >
                    <td className="py-3 px-4 pl-6">{statusIcon}</td>
                    <td className={`py-3 px-4 font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{simulation.name}</td>
                    <td className={`py-3 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{started.toLocaleString()}</td>
                    <td className={`py-3 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{ended.toLocaleString()}</td>
                    <td className={`py-3 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{msToTime(ended.getTime() - started.getTime())}</td>
                    <td className={`py-3 px-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{simulation.status}</td>
                    <td className="py-3 px-4">
                      <button
                        className={`p-2 rounded-lg transition-all duration-200 ${isDark ? 'hover:bg-white/10 text-green-400' : 'hover:bg-green-50 text-green-600'}`}
                        onClick={() => {
                          const proj = findProjectByFaunaID(projects, simulation.associatedProject);
                          if (proj?.portsS3 && proj.ports.length === 0) {
                            setPortsFromS3(proj, dispatch);
                          }
                          if (proj) {
                            if (projectsTabs.some((p) => p.id === proj.id)) {
                              dispatch(selectTab(proj.id as string));
                            } else {
                              dispatch(addProjectTab(proj));
                            }
                            dispatch(selectProject(simulation.associatedProject));
                            dispatch(selectMenuItem('Results'));
                          }
                        }}
                        title="View Results"
                      >
                        <AiOutlineBarChart size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1">
          <img
            src={theme === 'light' ? noresultfound : noresultfound}
            className="w-1/4 mb-4"
            alt="No Results"
          />
        </div>
      )}
    </div>
  );
};
