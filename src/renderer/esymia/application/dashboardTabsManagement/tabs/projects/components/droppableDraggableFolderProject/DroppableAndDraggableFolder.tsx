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
        className={`flex items-center p-3 rounded-xl transition-all duration-300 border ${isDark
          ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-green-500/50 text-gray-200'
          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-green-400 text-gray-700'
          } hover:cursor-pointer hover:shadow-md group`}
        ref={(ref) => {
          drag(drop(ref));
        }}
        onContextMenu={handleContextMenu}
        key={folder.name}
        data-testid={folder.name}
        role="Dustbin"
        style={{
          backgroundColor: isOver ? (isDark ? 'rgba(34, 197, 94, 0.2)' : '#e6f7ed') : undefined,
          opacity: isDragging ? 0.5 : 1,
        }}
        onDoubleClick={() => {
          setPath([...path, folder]);
          dispatch(selectFolder(folder.id as string));
        }}
      >
        <div className={`p-2 rounded-lg mr-3 ${isDark ? 'bg-white/10 text-green-400' : 'bg-green-100 text-green-600'}`}>
          <IoMdFolder className="w-5 h-5" />
        </div>

        <div className="tooltip tooltip-right flex-1 min-w-0" data-tip={folder.name}>
          <span className="font-medium text-sm truncate block">
            {folder.name}
          </span>
        </div>

        {folder.ownerEmail === user.email && (
          <Menu
            id={folder.name}
            theme={theme}
            className={`!z-[9999] rounded-2xl border shadow-2xl backdrop-blur-xl p-2 min-w-[220px] ${isDark
              ? "bg-black/80 border-white/10"
              : "bg-white/90 border-white/40"
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
                        data-testid={f.id}
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
                // dispatch(setFolderToRename(folder.faunaDocumentId))
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
            {/* <Separator /> */}
            {/* <Item
              onClick={(p) => {
                p.event.stopPropagation();
                setShowSearchUser(true);
                hideAll();
              }}
              className='hover:text-white  text-primaryColor'
            >
              <BiShareAlt className="mr-4 w-[20px] h-[20px]" />
              Share
            </Item> */}
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
      </div >
      {showRename && (
        <RenameFolder
          folderToRename={folder}
          handleClose={() => setShowRename(false)}
        />
      )
      }
      {
        showSearchUser && (
          <SearchUserAndShare
            setShowSearchUser={setShowSearchUser}
            folderToShare={folder}
          />
        )
      }
    </>
  );
};
