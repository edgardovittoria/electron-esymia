import React, { useState } from 'react';
import 'react-contexify/dist/ReactContexify.css';
import { useDrag } from 'react-dnd';
import {
  Item,
  Menu,
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
import { RenameProject } from './RenameProject';
import { SearchUserAndShare } from './searchUserAndShare/searchUserAndShare';
import {
  addProjectTab,
  ThemeSelector,
} from '../../../../../../store/tabsAndMenuItemsSlice';
import { Folder, Project } from '../../../../../../model/esymiaModels';
import { setModelInfoFromS3 } from '../../../shared/utilFunctions';
import projectIcon from '../../../../../../../../../assets/projectIcon.png';
import {
  useStorageData
} from '../../../../../simulationTabsManagement/tabs/mesher/components/rightPanelSimulator/hook/useStorageData';
import { GrClone } from 'react-icons/gr';
import { ImSpinner } from 'react-icons/im';
import { usersStateSelector } from '../../../../../../../cad_library';
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
  const isDark = theme !== 'light';
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
    const rect = e.currentTarget.getBoundingClientRect();
    show({
      event: e,
      position: {
        x: rect.right - 100,
        y: rect.top
      }
    });
  }

  //console.log(project)

  return (
    <>
      {cloning && <ImSpinner className={`animate-spin w-8 h-8 absolute top-1/2 right-1/2 z-100 ${isDark ? 'text-white' : 'text-gray-900'}`} />}
      <div
        className={`relative group rounded-2xl transition-all duration-300 hover:cursor-pointer hover:shadow-xl hover:-translate-y-1 p-[2px] border border-gray-200 ${isDark
          ? 'shadow-green-900/20'
          : 'shadow-green-500/20'
          }`}
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
        <div className={`flex flex-col h-full w-full rounded-2xl overflow-hidden backdrop-blur-md ${isDark ? 'bg-black' : 'bg-white'}`}>
          {project.shared && (
            <div className={`absolute top-3 right-3 z-10 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full border shadow-sm ${isDark
              ? 'bg-black/60 text-green-400 border-green-500/50 backdrop-blur-md'
              : 'bg-white/80 text-green-600 border-green-200 backdrop-blur-md'
              }`}>
              Shared
            </div>
          )}

          <div className={`relative flex-1 flex items-center justify-center p-6 transition-colors duration-300 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="aspect-video w-full flex items-center justify-center">
              <img
                className="w-full h-full object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                alt="project_screenshot"
                src={projectIcon}
              />
            </div>
          </div>

          <div className={`p-3 border-t ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-white'}`}>
            <h5
              className={`text-center font-semibold truncate text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
              role="Handle"
              ref={dragPreview}
            >
              {project.name}
            </h5>
          </div>
        </div>
      </div>
      {project.ownerEmail === user.email && (
        <Menu
          id={project.name}
          theme={theme}
          className={`!z-[9999] rounded-2xl border shadow-2xl backdrop-blur-xl p-2 min-w-[220px] ${isDark
            ? "bg-black/80 border-white/10"
            : "bg-white/90 border-white/40"
            }`}
          style={{ zIndex: 9999 }}
        >
          <Submenu
            className={`rounded-xl z-50 transition-all duration-200 ${isDark ? 'hover:bg-white/10 text-gray-200' : 'hover:bg-black/5 text-gray-700'}`}
            data-testid="moveMenu"
            disabled={user.userRole !== 'Premium' || process.env.APP_VERSION === 'demo'}
            label={
              <div className="flex items-center py-2 px-1">
                <BsFillFolderSymlinkFill className="mr-3 w-4 h-4 opacity-70" />
                <span className="font-medium text-sm">Move to...</span>
              </div>
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
                      data-testid={`subItem-${f.name}`}
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
                      className={`rounded-xl ${isDark ? 'hover:bg-white/10 text-gray-200' : 'hover:bg-black/5 text-gray-700'}`}
                    >
                      <span className="py-2 px-1 font-medium text-sm block">{f.name}</span>
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
            className={`rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-white/10 text-gray-200' : 'hover:bg-black/5 text-gray-700'}`}
          >
            <div className="flex items-center py-2 px-1">
              <BiRename className="mr-3 w-4 h-4 opacity-70" />
              <span className="font-medium text-sm">Rename</span>
            </div>
          </Item>
          <div className={`h-px my-1 mx-2 ${isDark ? 'bg-white/10' : 'bg-gray-200/60'}`} />
          <Item
            onClick={(p) => {
              p.event.stopPropagation();
              setcloning(true)
              cloneProject(project, selectedFolder as Folder, setcloning)
              hideAll();
            }}
            disabled={user.userRole !== 'Premium' || (process.env.APP_VERSION === 'demo' && selectedFolder.projectList.length === 3)}
            className={`rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-white/10 text-gray-200' : 'hover:bg-black/5 text-gray-700'}`}
          >
            <div className="flex items-center py-2 px-1">
              <GrClone className="mr-3 w-4 h-4 opacity-70" />
              <span className="font-medium text-sm">Clone Project</span>
            </div>
          </Item>
          <Item
            onClick={(p) => {
              p.event.stopPropagation();
              setShowSearchUser(true);
              hideAll();
            }}
            disabled={user.userRole !== 'Premium' || process.env.APP_VERSION === 'demo'}
            className={`rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-white/10 text-gray-200' : 'hover:bg-black/5 text-gray-700'}`}
          >
            <div className="flex items-center py-2 px-1">
              <BiShareAlt className="mr-3 w-4 h-4 opacity-70" />
              <span className="font-medium text-sm">Share Project</span>
            </div>
          </Item>
          <div className={`h-px my-1 mx-2 ${isDark ? 'bg-white/10' : 'bg-gray-200/60'}`} />
          <Item
            data-testid="deleteButton"
            onClick={(p) => {
              p.event.stopPropagation();
              deleteProject(project, selectedFolder)
              hideAll();
            }}
            className={`rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
          >
            <div className="flex items-center py-2 px-1">
              <BiTrash className="mr-3 w-4 h-4 opacity-70" />
              <span className="font-medium text-sm">Delete</span>
            </div>
          </Item>
        </Menu>
      )}
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
