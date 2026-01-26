import React, { useEffect, useState } from 'react';
import { IoMdFolder } from 'react-icons/io';
import { useDrag, useDrop } from 'react-dnd';
import {
  Menu,
  Item,
  Separator,
  useContextMenu,
  Submenu,
} from 'react-contexify';
import { BiRename, BiTrash } from 'react-icons/bi';
import { BsFillFolderSymlinkFill } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import {
  allProjectFoldersSelector,
  moveFolder,
  moveProject,
  removeFolder,
  SelectedFolderSelector,
  selectFolder,
} from '../../../../../../store/projectSlice';
import { RenameFolder } from './RenameFolder';
import { SearchUserAndShare } from './searchUserAndShare/searchUserAndShare';
import { Folder, Project } from '../../../../../../model/esymiaModels';
import { usersStateSelector } from '../../../../../../../cad_library';
import { ThemeSelector } from '../../../../../../store/tabsAndMenuItemsSlice';
import { useDynamoDBQuery } from '../../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { moveProjectInDynamoDB, moveFolderInDynamoDB, deleteFolderFromDynamoDB } from '../../../../../../../dynamoDB/projectsFolderApi';

interface DroppableAndDraggableFolderProps {
  folder: Folder;
  path: Folder[];
  setPath: Function;
}

export const DroppableAndDraggableFolder: React.FC<
  DroppableAndDraggableFolderProps
> = ({ folder, path, setPath }) => {
  const dispatch = useDispatch();
  const { execQuery2 } = useDynamoDBQuery()
  const selectedFolder = useSelector(SelectedFolderSelector) as Folder;
  const allProjectFolders = useSelector(allProjectFoldersSelector);
  const user = useSelector(usersStateSelector);
  const theme = useSelector(ThemeSelector)
  const isDark = theme !== 'light';
  const [showRename, setShowRename] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);

  const [dragDone, setDragDone] = useState(false);
  const [dropTargetFolder, setDropTargetFolder] = useState({} as Folder);
  const [dragItem, setdragItem] = useState<Folder | Project>({} as Folder | Project)

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: ['PROJECT', 'FOLDER'],
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
      }),
      drop(item) {
        setdragItem(item as Project | Folder)
        setDropTargetFolder(folder);
        setDragDone(true);
      },
    }),
    [selectedFolder.name, selectedFolder.projectList.length],
  );

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'FOLDER',
      item: folder,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [selectedFolder.name, selectedFolder.subFolders.length],
  );

  useEffect(() => {
    if (dragDone) {
      const objectToMove: Project | Folder = dragItem
      if (objectToMove && objectToMove.id !== dropTargetFolder.id) {
        if ('model' in objectToMove) {
          dispatch(
            moveProject({
              objectToMove,
              targetFolder: dropTargetFolder.id as string,
            }),
          );
          execQuery2(
            moveProjectInDynamoDB,
            {
              ...objectToMove,
              parentFolder: dropTargetFolder.id,
            } as Project,
            selectedFolder,
            dropTargetFolder,
            dispatch
          );
        } else {
          dispatch(
            moveFolder({
              objectToMove: objectToMove as Folder,
              targetFolder: dropTargetFolder.id as string,
            }),
          );
          execQuery2(
            moveFolderInDynamoDB,
            {
              ...objectToMove,
              parent: dropTargetFolder.id,
            } as Folder,
            selectedFolder,
            dropTargetFolder,
            dispatch
          );
        }
      }
    }
    setDragDone(false);
  }, [dragDone]);

  const { show, hideAll } = useContextMenu({
    id: folder.name,
  });

  function handleContextMenu(e: any) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    show({
      event: e,
      position: {
        x: rect.right - 100,
        y: rect.top - 100
      }
    });
  }

  return (
    <>
      <div
        className={`
          group relative flex items-center p-4 rounded-xl 
          transition-all duration-300 cursor-pointer
          ${isDark
            ? 'bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-yellow-500/50 text-gray-200'
            : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-yellow-400 text-gray-700'
          }
          hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
        `}
        ref={(ref) => {
          drag(drop(ref));
        }}
        onContextMenu={handleContextMenu}
        key={folder.name}
        data-testid={folder.name}
        role="Dustbin"
        style={{
          backgroundColor: isOver
            ? (isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.08)')
            : undefined,
          opacity: isDragging ? 0.5 : 1,
          boxShadow: isDark
            ? isOver
              ? '0 10px 30px rgba(34, 197, 94, 0.3), 0 0 20px rgba(34, 197, 94, 0.2)'
              : '0 4px 15px rgba(0, 0, 0, 0.3)'
            : isOver
              ? '0 10px 30px rgba(34, 197, 94, 0.2), 0 0 15px rgba(34, 197, 94, 0.15)'
              : '0 4px 15px rgba(0, 0, 0, 0.08)',
        }}
        onDoubleClick={() => {
          setPath([...path, folder]);
          dispatch(selectFolder(folder.id as string));
        }}
      >
        {/* Folder Icon with Gradient Background */}
        <div
          className={`
            relative p-3 rounded-lg mr-3 transition-all duration-300
            group-hover:scale-110 group-hover:rotate-3
            ${isDark
              ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 text-yellow-400'
              : 'bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-600'
            }
          `}
          style={{
            boxShadow: isDark
              ? '0 4px 12px rgba(251, 191, 36, 0.2)'
              : '0 4px 12px rgba(251, 191, 36, 0.15)',
          }}
        >
          <IoMdFolder className="w-6 h-6 transition-transform duration-300" />

          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: isDark
                ? 'radial-gradient(circle at center, rgba(251, 191, 36, 0.3), transparent)'
                : 'radial-gradient(circle at center, rgba(251, 191, 36, 0.2), transparent)',
              filter: 'blur(8px)',
            }}
          />
        </div>

        {/* Folder Name */}
        <div className="tooltip tooltip-right flex-1 min-w-0" data-tip={folder.name}>
          <span className="font-semibold text-sm truncate block group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-500 group-hover:to-amber-500 transition-all duration-300">
            {folder.name}
          </span>
        </div>

        {/* Hover Indicator */}
        <div
          className={`
            absolute top-0 right-0 w-2 h-2 rounded-full m-2
            opacity-0 group-hover:opacity-100 transition-all duration-300
            ${isDark ? 'bg-yellow-400' : 'bg-yellow-500'}
          `}
          style={{
            boxShadow: isDark
              ? '0 0 10px rgba(251, 191, 36, 0.6)'
              : '0 0 10px rgba(251, 191, 36, 0.5)',
          }}
        />

        {/* Context Menu */}
        {folder.ownerEmail === user.email && (
          <Menu
            id={folder.name}
            theme={theme}
            className={`!z-[9999] rounded-2xl border shadow-2xl backdrop-blur-xl p-2 min-w-[220px] ${isDark
              ? "bg-black/90 border-white/10"
              : "bg-white/95 border-white/40"
              }`}
            style={{ zIndex: 9999 }}
          >
            <Submenu
              className={`rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-white/10 text-gray-200' : 'hover:bg-black/5 text-gray-700'}`}
              data-testid="moveMenu"
              label={
                <div className="flex items-center py-2 px-1">
                  <BsFillFolderSymlinkFill className="mr-3 w-4 h-4 opacity-70" />
                  <span className="font-medium text-sm">Move to...</span>
                </div>
              }
            >
              {allProjectFolders
                .filter(
                  (n) =>
                    n.id !== folder.parent &&
                    n.id !== folder.id,
                )
                .map((f) => {
                  return (
                    <div key={f.id}>
                      <Item
                        data-testid={`subItem-${f.name}`}
                        onClick={(p) => {
                          p.event.stopPropagation();
                          dispatch(
                            moveFolder({
                              objectToMove: folder,
                              targetFolder: f.id as string,
                            }),
                          );
                          execQuery2(
                            moveFolderInDynamoDB,
                            { ...folder, parent: f.id } as Folder,
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
                execQuery2(
                  deleteFolderFromDynamoDB,
                  folder,
                  selectedFolder,
                  dispatch
                ).then(() => {
                  dispatch(removeFolder(folder));
                  hideAll();
                })
              }}
              className={`rounded-xl transition-all duration-200 ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
              data-testid="deleteButtonFolder"
            >
              <div className="flex items-center py-2 px-1">
                <BiTrash className="mr-3 w-4 h-4 opacity-70" />
                <span className="font-medium text-sm">Delete</span>
              </div>
            </Item>
          </Menu>
        )}
      </div>

      {/* Modals */}
      {showRename && (
        <RenameFolder
          folderToRename={folder}
          handleClose={() => setShowRename(false)}
        />
      )}
      {showSearchUser && (
        <SearchUserAndShare
          setShowSearchUser={setShowSearchUser}
          folderToShare={folder}
        />
      )}
    </>
  );
};
