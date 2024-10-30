import React, { useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import {
  mainFolderSelector,
  SelectedFolderSelector,
  selectFolder,
} from '../../../../../../store/projectSlice';
import { DroppableAndDraggableFolder } from '../droppableDraggableFolderProject/DroppableAndDraggableFolder';
import { DraggableProjectCard } from '../droppableDraggableFolderProject/DraggableProjectCard';
import { SearchUserAndShare } from '../droppableDraggableFolderProject/searchUserAndShare/searchUserAndShare';
import { CreateNewFolderModal } from '../CreateNewFolderModal';
import noProjectsIcon2 from '../../../../../../../../../assets/noProjectsIcon2.png';
import { Folder } from '../../../../../../model/esymiaModels';
import { setShowCreateNewProjectModal } from '../../../../../../store/tabsAndMenuItemsSlice';

export interface MyFilesProps {
  showCreateNewFolderModal: boolean;
  setShowCreateNewFolderModal: Function;
  showSearchUser: boolean;
  setShowSearchUser: (v: boolean) => void;
}

const MyFiles: React.FC<MyFilesProps> = ({
  showCreateNewFolderModal,
  setShowCreateNewFolderModal,
  showSearchUser,
  setShowSearchUser
}) => {
  const mainFolder = useSelector(mainFolderSelector)
  const selectedFolder = useSelector(SelectedFolderSelector);
  const dispatch = useDispatch();

  const projects = selectedFolder?.projectList;
  const folders = selectedFolder?.subFolders;

  const [path, setPath] = useState([mainFolder]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="box w-full">
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
                      className="hover:underline hover:cursor-pointer text-sm"
                      onClick={() => {
                        const newPath = path.filter((p, i) => i <= index);
                        setPath(newPath);
                        dispatch(selectFolder(p.faunaDocumentId as string));
                      }}
                    >
                      {p.name}
                    </span>
                    <span> &gt; </span>
                  </div>
                ) : (
                  <span className="font-bold text-sm">{p.name}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex p-2 gap-4 items-center w-1/6">
          <div
            className="text-end text-sm text-primaryColor hover:text-secondaryColor hover:cursor-pointer hover:underline"
            onClick={() => dispatch(setShowCreateNewProjectModal(true))}
          >
            + New Project
          </div>
          <div
            className="text-sm text-center text-primaryColor hover:text-secondaryColor hover:cursor-pointer hover:underline"
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
              {folders.length > 0 && (
                <h5 className="w-[100%] text-sm font-semibold uppercase p-2">
                  Folders
                </h5>
              )}
              <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-7 overflow-scroll max-h-[100px]">
                {folders.map((folder) => {
                  return (
                    <DroppableAndDraggableFolder
                      key={folder.faunaDocumentId}
                      folder={folder}
                      path={path}
                      setPath={setPath}
                    />
                  );
                })}
              </div>
              {projects.length > 0 && (
                <h5 className="w-[100%] mt-4 mb-2 text-sm font-semibold uppercase p-2">
                  Projects
                </h5>
              )}
              <div data-testid="projectsBox" className="grid xl:grid-cols-8 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-7 overflow-scroll max-h-[200px] py-3">
                {projects
                  .map((project) => {
                    return (
                      <DraggableProjectCard
                        project={project}
                        key={project.faunaDocumentId}
                      />
                    );
                  })}
              </div>
            </>
          ) : (
            <div className="text-center p-[20px]">
              <img
                src={noProjectsIcon2}
                className="my-[50px] mx-auto"
                alt="No Projects Icon"
              />
              <p>No projects for now.</p>
              <button
                className="button buttonPrimary lg:text-base text-sm mt-5"
                data-toggle="modal"
                data-target="#createNewProjectModal"
                data-testid="createProjectButton"
                onClick={() => {
                  dispatch(setShowCreateNewProjectModal(true))
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
