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
      {/* Loading Spinner */}
      {cloning && (
        <div className="fixed inset-0 flex items-center justify-center z-[10000] bg-black/50 backdrop-blur-sm">
          <div className="relative">
            <ImSpinner className={`animate-spin w-12 h-12 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            <div
              className="absolute inset-0 animate-ping"
              style={{
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4), transparent)',
              }}
            />
          </div>
        </div>
      )}

      {/* Project Card */}
      <div
        className={`
          group relative rounded-2xl transition-all duration-300 cursor-pointer
          hover:shadow-2xl hover:-translate-y-2 active:scale-95
          ${isDark ? 'shadow-black/40' : 'shadow-gray-300/50'}
        `}
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
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
        onContextMenu={handleContextMenu}
      >
        {/* Gradient Border Effect */}
        <div
          className={`
            absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
            ${isDark
              ? 'bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30'
              : 'bg-gradient-to-br from-blue-400/40 via-purple-400/40 to-pink-400/40'
            }
          `}
          style={{ padding: '2px', zIndex: -1 }}
        />

        {/* Card Content */}
        <div
          className={`
            relative flex flex-col h-full w-full rounded-2xl overflow-hidden backdrop-blur-md
            border transition-all duration-300
            ${isDark
              ? 'bg-gradient-to-br from-gray-900 to-black border-white/10 group-hover:border-white/20'
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 group-hover:border-gray-300'
            }
          `}
          style={{
            boxShadow: isDark
              ? '0 10px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              : '0 10px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          }}
        >
          {/* Shared Badge */}
          {project.shared && (
            <div
              className={`
                absolute top-3 right-3 z-10 px-3 py-1 text-[10px] uppercase tracking-wider font-bold
                rounded-full border backdrop-blur-md transition-all duration-300
                group-hover:scale-110
                ${isDark
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/50'
                  : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300'
                }
              `}
              style={{
                boxShadow: isDark
                  ? '0 4px 12px rgba(34, 197, 94, 0.3)'
                  : '0 4px 12px rgba(34, 197, 94, 0.2)',
              }}
            >
              Shared
            </div>
          )}

          {/* Project Image Section */}
          <div
            className={`
              relative flex-1 flex items-center justify-center p-8 transition-all duration-300
              ${isDark ? 'bg-white/5' : 'bg-gray-50'}
              group-hover:bg-gradient-to-br
              ${isDark
                ? 'group-hover:from-blue-500/10 group-hover:to-purple-500/10'
                : 'group-hover:from-blue-50 group-hover:to-purple-50'
              }
            `}
          >
            {/* Decorative Glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: isDark
                  ? 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15), transparent 70%)'
                  : 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1), transparent 70%)',
              }}
            />

            <div className="relative aspect-video w-full flex items-center justify-center">
              <img
                className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                alt="project_screenshot"
                src={projectIcon}
              />
            </div>
          </div>

          {/* Project Info Section */}
          <div
            className={`
              relative p-5 border-t transition-all duration-300
              ${isDark
                ? 'border-white/10 bg-gradient-to-b from-white/5 to-transparent'
                : 'border-gray-200 bg-gradient-to-b from-white to-gray-50'
              }
            `}
          >
            {/* Accent Line */}
            <div
              className={`
                absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-20 transition-all duration-300
                ${isDark
                  ? 'bg-gradient-to-r from-transparent via-blue-400 to-transparent'
                  : 'bg-gradient-to-r from-transparent via-blue-500 to-transparent'
                }
              `}
            />

            {/* Project Name with Icon */}
            <div className="flex items-center justify-center gap-2 mb-1" role="Handle" ref={dragPreview}>
              {/* Project Icon */}
              <div
                className={`
                  flex items-center justify-center w-7 h-7 rounded-lg
                  transition-all duration-300 group-hover:scale-110 group-hover:rotate-6
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
                <svg
                  className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              {/* Project Name */}
              <h5
                className={`
                  text-center font-bold truncate text-sm transition-all duration-300
                  group-hover:text-transparent group-hover:bg-clip-text 
                  group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500
                  ${isDark ? 'text-gray-200' : 'text-gray-900'}
                `}
              >
                {project.name}
              </h5>
            </div>

            {/* Project Label */}
            <p className={`text-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Project
            </p>
          </div>

          {/* Hover Overlay Effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: isDark
                ? 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1), transparent 50%)'
                : 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.05), transparent 50%)',
            }}
          />
        </div>
      </div>

      {/* Context Menu */}
      {project.ownerEmail === user.email && (
        <Menu
          id={project.name}
          theme={theme}
          className={`!z-[9999] rounded-2xl border shadow-2xl backdrop-blur-xl p-2 min-w-[220px] ${isDark
            ? "bg-black/90 border-white/10"
            : "bg-white/95 border-white/40"
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

      {/* Modals */}
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
