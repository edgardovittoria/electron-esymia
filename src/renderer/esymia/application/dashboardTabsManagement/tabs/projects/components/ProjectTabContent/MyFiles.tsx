import React, { useEffect, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import {
  activeMeshingSelector,
  activeSimulationsSelector,
  mainFolderSelector,
  SelectedFolderSelector,
  selectFolder,
} from '../../../../../../store/projectSlice';
import { DroppableAndDraggableFolder } from '../droppableDraggableFolderProject/DroppableAndDraggableFolder';
import { DraggableProjectCard } from '../droppableDraggableFolderProject/DraggableProjectCard';
import { SearchUserAndShare } from '../droppableDraggableFolderProject/searchUserAndShare/searchUserAndShare';
import { CreateNewFolderModal } from '../CreateNewFolderModal';
import noProjectsIcon2 from '../../../../../../../../../assets/noProjectsIcon2.png';
import noProjectsIcon2Dark from '../../../../../../../../../assets/noProjectsIcon2Dark.png';
import { Folder } from '../../../../../../model/esymiaModels';
import {
  setShowCreateNewProjectModal,
  ThemeSelector,
} from '../../../../../../store/tabsAndMenuItemsSlice';
import { IoReload } from 'react-icons/io5';
import { useStorage } from '../../../../../../hook/useStorage';
import { FaFolderPlus, FaPlus, FaChevronRight } from 'react-icons/fa';

export interface MyFilesProps {
  showCreateNewFolderModal: boolean;
  setShowCreateNewFolderModal: Function;
  showSearchUser: boolean;
  setShowSearchUser: (v: boolean) => void;
  setLoadingSpinner: (v: boolean) => void;
}

const MyFiles: React.FC<MyFilesProps> = ({
  showCreateNewFolderModal,
  setShowCreateNewFolderModal,
  showSearchUser,
  setShowSearchUser,
  setLoadingSpinner,
}) => {
  const mainFolder = useSelector(mainFolderSelector);
  const selectedFolder = useSelector(SelectedFolderSelector);
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';
  const activeMeshing = useSelector(activeMeshingSelector);
  const activeSimulation = useSelector(activeSimulationsSelector);
  const dispatch = useDispatch();

  const { loadFolders } = useStorage();

  const projects = selectedFolder?.projectList;
  const folders = selectedFolder?.subFolders;

  const [path, setPath] = useState([mainFolder]);

  useEffect(() => {
    return () => {
      dispatch(selectFolder('root'));
    };
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`glass-panel ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} rounded-2xl p-8 w-full h-full flex flex-col`}
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
        <div className="flex flex-row justify-between items-center mb-8 pb-6 border-b" style={{
          borderColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'
        }}>
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2">
            {path.map((p, index) => {
              const isLast = index === path.length - 1;
              return (
                <div className="flex items-center gap-2 group" key={index}>
                  <button
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300
                      ${isLast
                        ? isDark
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg'
                          : 'bg-gradient-to-r from-blue-50 to-purple-50 text-gray-900 shadow-md'
                        : isDark
                          ? 'text-gray-400 hover:text-white hover:bg-white/10'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }
                      ${!isLast && 'hover:scale-105'}
                    `}
                    onClick={() => {
                      if (!isLast) {
                        const newPath = path.filter((p, i) => i <= index);
                        setPath(newPath);
                        if (newPath.length > 1) {
                          dispatch(selectFolder(p.id as string));
                        } else {
                          dispatch(selectFolder('root'));
                        }
                      }
                    }}
                    disabled={isLast}
                  >
                    {p.name}
                  </button>
                  {!isLast && (
                    <FaChevronRight
                      size={10}
                      className={`transition-all duration-300 ${isDark ? 'text-gray-600' : 'text-gray-400'
                        } group-hover:translate-x-0.5`}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              className={`
                group flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium
                transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                ${isDark
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-400 border border-green-500/30'
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 border border-green-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              `}
              onClick={() => dispatch(setShowCreateNewProjectModal(true))}
              style={{
                boxShadow: isDark
                  ? '0 4px 15px rgba(34, 197, 94, 0.2)'
                  : '0 4px 15px rgba(34, 197, 94, 0.15)',
              }}
            >
              <FaPlus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-sm">New Project</span>
            </button>
            <button
              className={`
                group flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium
                transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                ${isDark
                  ? 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200'
                }
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              `}
              onClick={() => setShowCreateNewFolderModal(true)}
              disabled={process.env.APP_VERSION === 'demo'}
            >
              <FaFolderPlus size={16} className="group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm">New Folder</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {projects && folders && (projects.length > 0 || folders.length > 0) ? (
            <div
              className="h-full overflow-y-auto pr-2"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: isDark
                  ? 'rgba(75, 85, 99, 0.5) transparent'
                  : 'rgba(156, 163, 175, 0.5) transparent',
              }}
            >
              {/* Folders Section */}
              {process.env.APP_VERSION !== 'demo' && folders.length > 0 && (
                <div className="mb-8 animate-fadeIn">
                  <div className="flex items-center gap-3 mb-4">
                    <h5
                      className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}
                    >
                      Folders
                    </h5>
                    <div
                      className="flex-1 h-px"
                      style={{
                        background: isDark
                          ? 'linear-gradient(to right, rgba(75, 85, 99, 0.3), transparent)'
                          : 'linear-gradient(to right, rgba(229, 231, 235, 0.5), transparent)',
                      }}
                    />
                  </div>

                  <div className="grid xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 px-6">
                    {folders.map((folder, index) => (
                      <div
                        key={folder.id}
                        style={{
                          animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                        }}
                      >
                        <DroppableAndDraggableFolder
                          folder={folder}
                          path={path}
                          setPath={setPath}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects Section */}
              <div className="mb-2 animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <h5
                      className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}
                    >
                      Projects
                    </h5>
                    <div
                      className="flex-1 h-px"
                      style={{
                        background: isDark
                          ? 'linear-gradient(to right, rgba(75, 85, 99, 0.3), transparent)'
                          : 'linear-gradient(to right, rgba(229, 231, 235, 0.5), transparent)',
                      }}
                    />
                  </div>
                  <button
                    disabled={activeMeshing.length > 0 || activeSimulation.length > 0}
                    className={`
                      group p-2.5 rounded-lg transition-all duration-300
                      ${isDark
                        ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                      hover:scale-110 active:scale-95
                    `}
                    title="Reload Projects"
                    onClick={() => {
                      setLoadingSpinner(true);
                      loadFolders(setLoadingSpinner);
                    }}
                  >
                    <IoReload size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>

                <div
                  data-testid="projectsBox"
                  className="grid xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6 pb-4 px-6"
                >
                  {projects.map((project, index) => (
                    <div
                      key={project.id}
                      style={{
                        animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                      }}
                    >
                      <DraggableProjectCard project={project} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Empty State
            <div
              className="flex flex-col items-center justify-center h-full"
              style={{ animation: 'fadeIn 0.6s ease-out' }}
            >
              <div
                className="mb-8 transform hover:scale-105 transition-transform duration-500"
                style={{ animation: 'float 3s ease-in-out infinite' }}
              >
                <img
                  src={isDark ? noProjectsIcon2Dark : noProjectsIcon2}
                  className="w-1/2 object-contain opacity-80 mx-auto"
                  alt="No Projects Icon"
                />
              </div>
              <button
                className={`
                  group px-8 py-4 rounded-xl font-semibold text-white
                  transition-all duration-300 transform hover:scale-105 active:scale-95
                  shadow-2xl hover:shadow-3xl
                  ${isDark
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500'
                  }
                `}
                style={{
                  boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3)',
                }}
                data-toggle="modal"
                data-target="#createNewProjectModal"
                data-testid="createProjectButton"
                onClick={() => {
                  dispatch(setShowCreateNewProjectModal(true));
                }}
              >
                <span className="flex items-center gap-2">
                  <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
                  Create Your First Project
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSearchUser && <SearchUserAndShare setShowSearchUser={setShowSearchUser} />}
      {showCreateNewFolderModal && (
        <CreateNewFolderModal setShowNewFolderModal={setShowCreateNewFolderModal} />
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
            transform: translateY(20px);
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

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </DndProvider>
  );
};

export default MyFiles;
