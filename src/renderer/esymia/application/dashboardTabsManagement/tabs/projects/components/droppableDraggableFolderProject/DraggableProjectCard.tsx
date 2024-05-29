import React, { useState } from 'react';
import 'react-contexify/dist/ReactContexify.css';
import { useDrag } from 'react-dnd';
import {
  Item,
  Menu,
  Separator,
  Submenu,
  useContextMenu,
} from 'react-contexify';
import { BiRename, BiShareAlt, BiTrash } from 'react-icons/bi';
import { BsFillFolderSymlinkFill } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { useFaunaQuery, usersStateSelector } from 'cad-library';
import {
  allProjectFoldersSelector,
  moveProject,
  removeProject,
  SelectedFolderSelector,
} from '../../../../../../store/projectSlice';
import {
  deleteSimulationProjectFromFauna,
  moveProjectInFauna,
} from '../../../../../../faunadb/projectsFolderAPIs';
import { RenameProject } from './RenameProject';
import { SearchUserAndShare } from './searchUserAndShare/searchUserAndShare';
import {
  addProjectTab,
  closeProjectTab,
} from '../../../../../../store/tabsAndMenuItemsSlice';
import { Folder, Project } from '../../../../../../model/esymiaModels';
import { setModelInfoFromS3 } from '../../../shared/utilFunctions';
import noResultsIconForProject from '../../../../../../../../../assets/noResultsIconForProject.png';
import { deleteFileS3 } from '../../../../../../aws/mesherAPIs';
import {
  useStorageData
} from '../../../../../simulationTabsManagement/tabs/simulator/rightPanelSimulator/hook/useStorageData';

interface DraggableProjectCardProps {
  project: Project;
}

export const DraggableProjectCard: React.FC<DraggableProjectCardProps> = ({
  project,
}) => {
  const dispatch = useDispatch();
  const { execQuery } = useFaunaQuery();
  const { deleteProject } = useStorageData()
  const selectedFolder = useSelector(SelectedFolderSelector) as Folder;
  const allProjectFolders = useSelector(allProjectFoldersSelector);
  const user = useSelector(usersStateSelector);
  const [showRename, setShowRename] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);

  const [{ isDragging }, drag, dragPreview] = useDrag(
    () => ({
      // "type" is required. It is used by the "accept" specification of drop targets.
      type: 'PROJECT',
      item: project,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [selectedFolder.name, selectedFolder.projectList.length],
  );

  const { show, hideAll } = useContextMenu({
    id: project.name,
  });

  function handleContextMenu(e: any) {
    e.preventDefault();
    show({ event: e, props: { key: 'value' } });
  }

  console.log(project)

  return (
    <>
      <div
        className="flex py-2 flex-col border-2 border-green-200 rounded-lg hover:cursor-pointer hover:border-secondaryColor shadow-xl"
        key={project.name}
        ref={drag}
        onClick={() => {
          if (!project.model.components && project.modelS3) {
            setModelInfoFromS3(project, dispatch);
          }
          dispatch(addProjectTab(project));
        }}
        style={{ opacity: isDragging ? 0.5 : 1 }}
        onContextMenu={handleContextMenu}
      >
        <h5 className="text-center text-base" role="Handle" ref={dragPreview}>
          {project.name.length > 15
            ? `${project.name.substring(0, 15)}...`
            : project.name}
        </h5>
        <div>
          <img
            className="w-[60%] md:w-[80%] mx-auto"
            alt="project_screenshot"
            src={
              project.screenshot ? project.screenshot : noResultsIconForProject
            }
          />
        </div>

        {/* <div>
                    <hr className="mb-3"/>
                    {(project.description.length > 20) ? project.description.substring(0, 20) + '...' : project.description}
                </div> */}
        {project.owner.email === user.email && (
          <Menu id={project.name}>
            <Submenu
              label={
                <>
                  <BsFillFolderSymlinkFill className="mr-4 text-primaryColor w-[20px] h-[20px]" />
                  Move
                </>
              }
            >
              {allProjectFolders
                .filter(
                  (n) => n.faunaDocumentId !== selectedFolder.faunaDocumentId,
                )
                .map((f) => {
                  return (
                    <div key={f.faunaDocumentId}>
                      <Item
                        onClick={(p) => {
                          p.event.stopPropagation();
                          dispatch(
                            moveProject({
                              objectToMove: project,
                              targetFolder: f.faunaDocumentId as string,
                            }),
                          );
                          execQuery(
                            moveProjectInFauna,
                            {
                              ...project,
                              parentFolder: f.faunaDocumentId,
                            } as Project,
                            project.parentFolder,
                          );
                          hideAll();
                        }}
                      >
                        {f.name}
                      </Item>
                    </div>
                  );
                })}
            </Submenu>
            <Item
              onClick={(p) => {
                p.event.stopPropagation();
                setShowRename(true);
                hideAll();
              }}
            >
              <BiRename className="mr-4 text-primaryColor w-[20px] h-[20px]" />
              Rename
            </Item>
            <Separator />
            <Item
              onClick={(p) => {
                p.event.stopPropagation();
                setShowSearchUser(true);
                hideAll();
              }}
              disabled={user.userRole !== 'Premium'}
            >
              <BiShareAlt className="mr-4 text-primaryColor w-[20px] h-[20px]" />
              Share
            </Item>
            <Separator />
            <Item
              data-testid="deleteButton"
              onClick={(p) => {
                p.event.stopPropagation();
                deleteProject(project)
                hideAll();
              }}
            >
              <BiTrash className="mr-4 text-primaryColor w-[20px] h-[20px]" />
              Delete
            </Item>
          </Menu>
        )}
      </div>
      {showRename && (
        <RenameProject
          projectToRename={project}
          handleClose={() => setShowRename(false)}
        />
      )}
      {showSearchUser && (
        <SearchUserAndShare
          setShowSearchUser={setShowSearchUser}
          projectToShare={project}
        />
      )}
    </>
  );
};
