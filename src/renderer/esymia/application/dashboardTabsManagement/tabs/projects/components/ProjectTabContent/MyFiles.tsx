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
        className={`box ${
          theme === 'light'
            ? 'bg-white text-textColor'
            : 'bg-bgColorDark2 text-textColorDark'
        } w-full h-full`}
      >
        {/* <div className="flex p-2 gap-4 items-center">
          <div className="sm:w-3/5 w-1/5">
            <h5 className="text-base">Files</h5>
          </div>
          <div
            className="md:w-1/5 text-end text-sm text-primaryColor hover:text-secondaryColor hover:cursor-pointer hover:underline"
            onClick={() => dispatch(setShowCreateNewProjectModal(true))}
          >
            + New Project
          </div>
          <div
            className="md:w-1/5 text-sm text-center text-primaryColor hover:text-secondaryColor hover:cursor-pointer hover:underline"
            onClick={() => setShowCreateNewFolderModal(true)}
          >
            + New Folder
          </div>
        </div> */}

        <div className="flex flex-row justify-between">
          <div className="px-[12px] text-[18px] w-5/6">
            {path.map((p, index) => {
              return (
                <div className="inline-block p-2" key={index}>
                  {index !== path.length - 1 ? (
                    <div>
                      <span
                        className={`hover:underline hover:cursor-pointer text-sm ${
                          theme === 'light'
                            ? 'text-textColor'
                            : 'text-textColorDark'
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
                      <span> &gt; </span>
                    </div>
                  ) : (
                    <span
                      className={`font-bold text-sm ${
                        theme === 'light'
                          ? 'text-textColor'
                          : 'text-textColorDark'
                      }`}
                    >
                      {p.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex p-2 gap-4 items-center w-1/6">
            <div
              className={`text-end text-sm ${
                theme === 'light' ? 'text-textColor' : 'text-textColorDark'
              } hover:cursor-pointer hover:underline`}
              onClick={() => dispatch(setShowCreateNewProjectModal(true))}
            >
              + New Project
            </div>
            <div
              className={`text-end text-sm ${
                theme === 'light' ? 'text-textColor' : 'text-textColorDark'
              } hover:cursor-pointer hover:underline`}
              onClick={() => setShowCreateNewFolderModal(true)}
            >
              + New Folder
            </div>
          </div>
        </div>

        <div className="w-full text-left p-[20px] h-[80%]">
          {projects &&
          folders &&
          (projects.length > 0 || folders.length > 0) ? (
            <>
              <h5
                className={`w-[100%] text-sm font-semibold uppercase p-2 ${
                  theme === 'light' ? 'text-textColor' : 'text-textColorDark'
                }`}
              >
                Folders
              </h5>

              <div className="grid xl:grid-cols-9 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3 overflow-scroll max-h-[120px] overflow-y-auto">
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

              <div className="flex flex-row gap-2 items-center w-[100%] mt-4 mb-2">
                <h5
                  className={`text-sm font-semibold uppercase p-2 ${
                    theme === 'light' ? 'text-textColor' : 'text-textColorDark'
                  }`}
                >
                  Projects
                </h5>
                <button disabled={activeMeshing.length > 0 || activeSimulation.length > 0} className="tooltip tooltip-top hover:cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60" data-tip="Reload Projects"
                  onClick={() => {
                    setLoadingSpinner(true)
                    loadFolders(setLoadingSpinner)
                  }}
                >
                  <IoReload size={20}/>
                </button>
                
              </div>

              <div
                data-testid="projectsBox"
                className="grid xl:grid-cols-9 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3 overflow-scroll max-h-[250px] pb-3"
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
            </>
          ) : (
            <div className="text-center p-[20px]">
              <img
                src={theme === 'light' ? noProjectsIcon2 : noProjectsIcon2Dark}
                className="my-[50px] mx-auto"
                alt="No Projects Icon"
              />
              <p>No projects for now.</p>
              <button
                className={`button buttonPrimary ${
                  theme === 'light'
                    ? ''
                    : 'bg-secondaryColorDark text-textColor'
                } lg:text-base text-sm mt-5`}
                data-toggle="modal"
                data-target="#createNewProjectModal"
                data-testid="createProjectButton"
                onClick={() => {
                  dispatch(setShowCreateNewProjectModal(true));
                }}
              >
                CREATE YOUR FIRST PROJECT
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
