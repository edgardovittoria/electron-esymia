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
import { FaFolderPlus, FaPlus } from 'react-icons/fa';

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
  const activeMeshing = useSelector(activeMeshingSelector)
  const activeSimulation = useSelector(activeSimulationsSelector)
  const dispatch = useDispatch();

  const { loadFolders } = useStorage()

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
        className={`glass-panel ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} rounded-2xl p-6 w-full h-full flex flex-col`}
      >
        <div className="flex flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-lg">
            {path.map((p, index) => {
              return (
                <div className="flex items-center" key={index}>
                  {index !== path.length - 1 ? (
                    <div className="flex items-center">
                      <span
                        className={`hover:underline hover:cursor-pointer text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                          }`}
                        onClick={() => {
                          const newPath = path.filter((p, i) => i <= index);
                          setPath(newPath);
                          if (newPath.length > 1) {
                            dispatch(selectFolder(p.id as string));
                          } else {
                            dispatch(selectFolder('root'));
                          }
                        }}
                      >
                        {p.name}
                      </span>
                      <span className={`mx-2 text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>/</span>
                    </div>
                  ) : (
                    <span
                      className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'
                        }`}
                    >
                      {p.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${isDark
                ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                : 'bg-green-50 hover:bg-green-100 text-green-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={() => dispatch(setShowCreateNewProjectModal(true))}
              disabled={projects && projects?.length === 3}
            >
              <FaPlus size={14} />
              <span className="text-sm font-medium">New Project</span>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${isDark
                ? 'bg-white/5 hover:bg-white/10 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={() => setShowCreateNewFolderModal(true)}
              disabled={process.env.APP_VERSION === 'demo'}
            >
              <FaFolderPlus size={16} />
              <span className="text-sm font-medium">New Folder</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {projects &&
            folders &&
            (projects.length > 0 || folders.length > 0) ? (
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
              {process.env.APP_VERSION !== 'demo' &&
                <div className="mb-6">
                  <h5
                    className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}
                  >
                    Folders
                  </h5>

                  <div className="grid xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
                    {folders.map((folder) => {
                      return (
                        <DroppableAndDraggableFolder
                          key={folder.id}
                          folder={folder}
                          path={path}
                          setPath={setPath}
                        />
                      );
                    })}
                  </div>
                </div>
              }

              <div className="mb-2">
                <div className="flex items-center justify-between mb-3">
                  <h5
                    className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}
                  >
                    Projects
                  </h5>
                  <button
                    disabled={activeMeshing.length > 0 || activeSimulation.length > 0}
                    className={`p-2 rounded-lg transition-all duration-200 ${isDark
                      ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Reload Projects"
                    onClick={() => {
                      setLoadingSpinner(true)
                      loadFolders(setLoadingSpinner)
                    }}
                  >
                    <IoReload size={18} />
                  </button>
                </div>

                <div
                  data-testid="projectsBox"
                  className="grid xl:grid-cols-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6 pb-4"
                >
                  {projects.map((project) => {
                    return (
                      <DraggableProjectCard
                        project={project}
                        key={project.id}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-60">
              <img
                src={theme === 'light' ? noProjectsIcon2 : noProjectsIcon2}
                className="w-1/5 mb-6 opacity-80"
                alt="No Projects Icon"
              />
              <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No projects found in this folder</p>
              <button
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${isDark
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500'
                  }`}
                data-toggle="modal"
                data-target="#createNewProjectModal"
                data-testid="createProjectButton"
                onClick={() => {
                  dispatch(setShowCreateNewProjectModal(true));
                }}
              >
                Create Your First Project
              </button>
            </div>
          )}
        </div>
      </div>
      {showSearchUser && (
        <SearchUserAndShare setShowSearchUser={setShowSearchUser} />
      )}
      {/* {showRename && <RenameModal setShowRename={setShowRename} />} */}
      {showCreateNewFolderModal && (
        <CreateNewFolderModal
          setShowNewFolderModal={setShowCreateNewFolderModal}
        />
      )}
    </DndProvider>
  );
};

export default MyFiles;
