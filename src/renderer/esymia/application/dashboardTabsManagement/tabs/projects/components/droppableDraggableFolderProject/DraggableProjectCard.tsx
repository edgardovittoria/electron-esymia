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
import {
  allProjectFoldersSelector,
  moveProject,
  SelectedFolderSelector,
} from '../../../../../../store/projectSlice';
import {
  moveProjectInFauna,
} from '../../../../../../faunadb/projectsFolderAPIs';
import { RenameProject } from './RenameProject';
import { SearchUserAndShare } from './searchUserAndShare/searchUserAndShare';
import {
  addProjectTab,
} from '../../../../../../store/tabsAndMenuItemsSlice';
import { Folder, MeshData, Port, Probe, Project, sharingInfoUser, TempLumped } from '../../../../../../model/esymiaModels';
import { setModelInfoFromS3 } from '../../../shared/utilFunctions';
import noResultsIconForProject from '../../../../../../../../../assets/noResultsIconForProject.png';
import {
  useStorageData
} from '../../../../../simulationTabsManagement/tabs/simulator/rightPanelSimulator/hook/useStorageData';
import { GrClone } from 'react-icons/gr';
import { ImSpinner } from 'react-icons/im';
import { useFaunaQuery } from '../../../../../../faunadb/hook/useFaunaQuery';
import { CanvasState, UsersState, usersStateSelector } from '../../../../../../../cad_library';

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
  const { cloneProject } = useStorageData()
  const [cloning, setcloning] = useState(false)

  const [{ isDragging }, drag, dragPreview] = useDrag(
    () => ({
      // "type" is required. It is used by the "accept" specification of drop targets.
      type: 'PROJECT',
      item: project,
      collect: (monitor) => ({
        item: monitor.getItem(),
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

  //console.log(project)

  return (
    <>
      {cloning && <ImSpinner className='animate-spin w-8 h-8 absolute top-1/2 right-1/2 z-100'/>}
      <div
        className="flex py-2 flex-col border-2 border-green-200 rounded-lg hover:cursor-pointer hover:border-secondaryColor shadow-xl"
        key={project.name}
        data-testid={project.name}
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
              className='hover:text-white  text-primaryColor'
              data-testid="moveMenu"
              label={
                <>
                  <BsFillFolderSymlinkFill className="mr-4 w-[20px] h-[20px]" />
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
                        data-testid={f.faunaDocumentId}
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
                              faunaDocumentId: project?.faunaDocumentId,
                              description: project?.description as string,
                              frequencies: project?.frequencies,
                              meshData: project?.meshData as MeshData,
                              model: project?.model as CanvasState,
                              modelS3: project?.modelS3,
                              name: project?.name as string,
                              owner: project?.owner as UsersState,
                              ports: project?.ports as (Port | Probe | TempLumped)[],
                              screenshot: undefined,
                              storage: project?.storage as "local" | "online",
                              simulation: undefined,
                              sharedWith: project?.sharedWith as sharingInfoUser[],
                              parentFolder: f.faunaDocumentId,
                            } as Project,
                            project.parentFolder,
                            dispatch
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
              className='hover:text-white  text-primaryColor'
            >
              <BiRename className="mr-4 w-[20px] h-[20px]" />
              Rename
            </Item>
            <Separator />
            <Item
              onClick={(p) => {
                p.event.stopPropagation();
                setcloning(true)
                cloneProject(project, selectedFolder as Folder, setcloning)
                hideAll();
              }}
              disabled={user.userRole !== 'Premium'}
              className='hover:text-white  text-primaryColor'
            >
              <GrClone className="mr-4 w-[20px] h-[20px]" />
              Clone
            </Item>
            <Item
              onClick={(p) => {
                p.event.stopPropagation();
                setShowSearchUser(true);
                hideAll();
              }}
              disabled={user.userRole !== 'Premium'}
              className='hover:text-white  text-primaryColor'
            >
              <BiShareAlt className="mr-4 w-[20px] h-[20px]" />
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
              className='hover:text-white  text-primaryColor'
            >
              <BiTrash className="mr-4 w-[20px] h-[20px]" />
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
