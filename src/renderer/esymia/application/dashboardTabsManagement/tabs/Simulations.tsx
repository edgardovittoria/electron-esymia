import React, { useEffect, useState } from 'react';
import { FaCheck, FaSortAlphaDown } from 'react-icons/fa';
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

  function getStatusBadge(status: string) {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300";

    switch (status) {
      case 'Completed':
        return (
          <span
            className={`${baseClasses} ${isDark
              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30'
              : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-300'
              }`}
            style={{
              boxShadow: isDark
                ? '0 2px 8px rgba(34, 197, 94, 0.2)'
                : '0 2px 8px rgba(34, 197, 94, 0.15)',
            }}
          >
            Completed
          </span>
        );
      case 'Failed':
        return (
          <span
            className={`${baseClasses} ${isDark
              ? 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border border-red-500/30'
              : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-300'
              }`}
            style={{
              boxShadow: isDark
                ? '0 2px 8px rgba(239, 68, 68, 0.2)'
                : '0 2px 8px rgba(239, 68, 68, 0.15)',
            }}
          >
            Failed
          </span>
        );
      case 'Running':
        return (
          <span
            className={`${baseClasses} ${isDark
              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-300'
              } animate-pulse`}
            style={{
              boxShadow: isDark
                ? '0 2px 8px rgba(59, 130, 246, 0.2)'
                : '0 2px 8px rgba(59, 130, 246, 0.15)',
            }}
          >
            Running
          </span>
        );
      case 'Queued':
        return (
          <span
            className={`${baseClasses} ${isDark
              ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border border-yellow-300'
              }`}
            style={{
              boxShadow: isDark
                ? '0 2px 8px rgba(234, 179, 8, 0.2)'
                : '0 2px 8px rgba(234, 179, 8, 0.15)',
            }}
          >
            Queued
          </span>
        );
      default:
        return <span className={baseClasses}>Unknown</span>;
    }
  }

  return (
    <div
      className={`glass-panel ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} rounded-2xl p-8 flex flex-col h-full w-full`}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 250, 251, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: isDark ? '1px solid rgba(75, 85, 99, 0.3)' : '1px solid rgba(229, 231, 235, 0.5)',
        boxShadow: isDark
          ? '0 20px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          : '0 20px 60px -15px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Header Section */}
      <div className="flex flex-row justify-between w-full items-center mb-8 pb-6 border-b" style={{
        borderColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'
      }}>
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${isDark
              ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
              : 'bg-gradient-to-br from-purple-100 to-pink-100'
              }`}
            style={{
              boxShadow: isDark
                ? '0 4px 12px rgba(168, 85, 247, 0.2)'
                : '0 4px 12px rgba(168, 85, 247, 0.15)',
            }}
          >
            <AiOutlineBarChart className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <h5 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Simulations
          </h5>
        </div>

        {/* Sort Dropdown */}
        <div className="relative group">
          <button
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium
              transition-all duration-300 transform hover:scale-105
              ${isDark
                ? 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200'
              }
            `}
          >
            <IoFilterSharp className="w-4 h-4" />
            <span className="text-sm">Sort by: {order}</span>
            <FaSortAlphaDown className="w-3 h-3" />
          </button>

          {/* Dropdown Menu */}
          <div
            className={`
              absolute right-0 mt-2 w-56 py-2 rounded-xl shadow-2xl backdrop-blur-xl
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-300 z-50 border
              ${isDark
                ? 'bg-black/90 border-white/10'
                : 'bg-white/95 border-gray-200'
              }
            `}
            style={{
              boxShadow: isDark
                ? '0 10px 40px rgba(0, 0, 0, 0.5)'
                : '0 10px 40px rgba(0, 0, 0, 0.15)',
            }}
          >
            {['Name', 'Started Date', 'Simulation Time'].map((item) => (
              <div
                key={item}
                className={`
                  px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between
                  transition-all duration-200
                  ${isDark
                    ? 'hover:bg-white/10 text-gray-300 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                  }
                  ${order === item && (isDark ? 'bg-white/5' : 'bg-gray-50')}
                `}
                onClick={() => {
                  setOrder(item);
                  setSimulations((prev) => {
                    const simToSort = [...prev];
                    simToSort.sort((sim1, sim2) => {
                      if (item === 'Name') return (sim1.name ?? '').localeCompare(sim2.name ?? '');
                      if (item === 'Started Date') return parseInt(sim1.started ?? '0') - parseInt(sim2.started ?? '0');
                      if (item === 'Simulation Time') {
                        const time1 = parseInt(sim1.ended ?? '0') - parseInt(sim1.started ?? '0');
                        const time2 = parseInt(sim2.ended ?? '0') - parseInt(sim2.started ?? '0');
                        return time1 - time2;
                      }
                      return 0;
                    });
                    return simToSort;
                  });
                }}
              >
                <span className="font-medium">{item}</span>
                {order === item && (
                  <IoCheckmark className="text-green-500 w-5 h-5 animate-in" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      {simulations.length > 0 ? (
        <div className={`overflow-auto flex-1 w-full ${maxH} rounded-xl`}>
          <table className="w-full text-left border-collapse">
            <thead
              className={`
                sticky top-0 z-10 backdrop-blur-md
                ${isDark ? 'bg-gray-800/95 text-gray-400' : 'bg-gray-50/95 text-gray-600'}
              `}
              style={{
                boxShadow: isDark
                  ? '0 2px 10px rgba(0, 0, 0, 0.3)'
                  : '0 2px 10px rgba(0, 0, 0, 0.05)',
              }}
            >
              <tr>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Project - Name</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Started</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Ended</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Duration</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {simulations.map((simulation, index) => {
                const statusIcon = factoryStatusIcon(simulation.status);
                const started = new Date(parseInt(simulation.started ?? '0'));
                const ended = new Date(parseInt(simulation.ended ?? '0'));
                const isEven = index % 2 === 0;

                return (
                  <tr
                    key={`${simulation.name ?? 'unnamed'}_${index}`}
                    className={`
                      group transition-all duration-300 border-b
                      ${isDark
                        ? `${isEven ? 'bg-white/[0.02]' : 'bg-transparent'} hover:bg-white/5 border-white/5`
                        : `${isEven ? 'bg-gray-50/50' : 'bg-white'} hover:bg-gray-100/80 border-gray-100`
                      }
                    `}
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5">
                        {statusIcon}
                      </div>
                    </td>

                    {/* Project Name - Enhanced */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 group/name">
                        {/* Project Icon */}
                        <div
                          className={`
                            flex items-center justify-center w-10 h-10 rounded-lg
                            transition-all duration-300 group-hover/name:scale-110
                            ${isDark
                              ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30'
                              : 'bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-200'
                            }
                          `}
                          style={{
                            boxShadow: isDark
                              ? '0 2px 8px rgba(59, 130, 246, 0.2)'
                              : '0 2px 8px rgba(59, 130, 246, 0.15)',
                          }}
                        >
                          <AiOutlineBarChart
                            className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                          />
                        </div>

                        {/* Project Name Text */}
                        <div className="flex flex-col">
                          <span
                            className={`
                              font-bold text-sm transition-all duration-300
                              group-hover/name:text-transparent group-hover/name:bg-clip-text 
                              group-hover/name:bg-gradient-to-r group-hover/name:from-blue-500 group-hover/name:to-purple-500
                              ${isDark ? 'text-gray-200' : 'text-gray-900'}
                            `}
                          >
                            {simulation.name ?? 'Unnamed Simulation'}
                          </span>
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Simulation
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className={`py-4 px-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {started.toLocaleString()}
                    </td>
                    <td className={`py-4 px-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {ended.toLocaleString()}
                    </td>
                    <td className={`py-4 px-6 text-sm font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {msToTime(ended.getTime() - started.getTime())}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(simulation.status)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <button
                          className={`
                            group/btn p-2.5 rounded-lg transition-all duration-300
                            transform hover:scale-110 active:scale-95
                            ${isDark
                              ? 'hover:bg-gradient-to-r hover:from-green-500/20 hover:to-emerald-500/20 text-green-400 hover:text-green-300'
                              : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 text-green-600 hover:text-green-700'
                            }
                          `}
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
                          style={{
                            boxShadow: isDark
                              ? '0 0 0 rgba(34, 197, 94, 0)'
                              : '0 0 0 rgba(34, 197, 94, 0)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = isDark
                              ? '0 4px 15px rgba(34, 197, 94, 0.3)'
                              : '0 4px 15px rgba(34, 197, 94, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 0 0 rgba(34, 197, 94, 0)';
                          }}
                        >
                          <AiOutlineBarChart size={20} className="group-hover/btn:rotate-12 transition-transform duration-300" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        // Empty State
        <div
          className="flex flex-col items-center justify-center flex-1"
          style={{ animation: 'fadeIn 0.6s ease-out' }}
        >
          <div
            className="mb-8 transform hover:scale-105 transition-transform duration-500"
            style={{ animation: 'float 3s ease-in-out infinite' }}
          >
            <img
              src={isDark ? noresultfoundDark : noresultfound}
              className="w-64 h-64 object-contain opacity-80"
              alt="No Results"
            />
          </div>
          <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No simulations found
          </p>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};
