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
  ThemeSelector,
} from '../../../../../../store/tabsAndMenuItemsSlice';
import { Folder, MeshData, Port, Probe, Project, sharingInfoUser, TempLumped } from '../../../../../../model/esymiaModels';
import { setModelInfoFromS3 } from '../../../shared/utilFunctions';
import noResultsIconForProject from '../../../../../../../../../assets/noResultsIconForProject.png';
import noResultsIconForProjectDark from '../../../../../../../../../assets/noResultsIconForProjectDark.png';
import {
  useStorageData
} from '../../../../../simulationTabsManagement/tabs/mesher/components/rightPanelSimulator/hook/useStorageData';
import { GrClone } from 'react-icons/gr';
import { ImSpinner } from 'react-icons/im';
import { useFaunaQuery } from '../../../../../../faunadb/hook/useFaunaQuery';
import { CanvasState, UsersState, usersStateSelector } from '../../../../../../../cad_library';
import { useDynamoDBQuery } from '../../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { moveProjectInDynamoDB } from '../../../../../../../dynamoDB/projectsFolderApi';

interface DraggableProjectCardProps {
  project: Project;
}

export const DraggableProjectCard: React.FC<DraggableProjectCardProps> = ({
  project,
}) => {
  const dispatch = useDispatch();
  const { execQuery2 } = useDynamoDBQuery();
  const { deleteProject } = useStorageData()
  const selectedFolder = useSelector(SelectedFolderSelector) as Folder;
  const allProjectFolders = useSelector(allProjectFoldersSelector);
  const user = useSelector(usersStateSelector);
  const theme = useSelector(ThemeSelector)
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
        className={`flex flex-col border relative ${theme === 'light' ? 'text-textColor border-green-200 hover:border-secondaryColor' : 'text-textColorDark bg-bgColorDark border-textColorDark hover:border-secondaryColorDark'}  rounded-lg hover:cursor-pointer`}
        key={project.name}
        data-testid={project.name}
        data-tip={project.name}
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
        {project.shared && <div className={`badge ${theme === 'light' ? 'badge-neutral' : 'bg-secondaryColorDark'}  absolute bottom-[-10px] right-1/2  translate-x-1/2`}>shared</div>}
        <div className="tooltip tooltip-bottom" data-tip={project.name}>
          <h5 className="text-center text-sm" role="Handle" ref={dragPreview}>
            {project.name.length > 15
              ? `${project.name.substring(0, 15)}...`
              : project.name}
          </h5>
        </div>
        <div>
          {theme === 'light' ?
          <img
          className="w-[50%] md:w-[60%] mx-auto"
          alt="project_screenshot"
          src={noResultsIconForProject}
        /> :
        <img
            className="w-[60%] md:w-[80%] mx-auto"
            alt="project_screenshot"
            src={noResultsIconForProjectDark}
          />
        }

        </div>

        {/* <div>
                    <hr className="mb-3"/>
                    {(project.description.length > 20) ? project.description.substring(0, 20) + '...' : project.description}
                </div> */}
        {project.ownerEmail === user.email && (
          <Menu id={project.name} theme={theme}>
            <Submenu
              className='hover:text-white  text-primaryColor'
              data-testid="moveMenu"
              disabled={user.userRole !== 'Premium' || process.env.APP_VERSION === 'demo'}
              label={
                <>
                  <BsFillFolderSymlinkFill className="mr-4 w-[20px] h-[20px]" />
                  Move
                </>
              }
            >
              {allProjectFolders
                .filter(
                  (n) => n.id !== selectedFolder.id,
                )
                .map((f) => {
                  return (
                    <div key={f.id}>
                      <Item
                        data-testid={f.id}
                        onClick={(p) => {
                          p.event.stopPropagation();
                          dispatch(
                            moveProject({
                              objectToMove: project,
                              targetFolder: f.id as string,
                            }),
                          );
                          execQuery2(
                            moveProjectInDynamoDB,
                            {
                              ...project,
                              parentFolder: f.id,
                            } as Project,
                            selectedFolder,
                            f,
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
              disabled={user.userRole !== 'Premium' || (process.env.APP_VERSION === 'demo' && selectedFolder.projectList.length === 3)}
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
              disabled={user.userRole !== 'Premium' || process.env.APP_VERSION === 'demo'}
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
                deleteProject(project, selectedFolder)
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
