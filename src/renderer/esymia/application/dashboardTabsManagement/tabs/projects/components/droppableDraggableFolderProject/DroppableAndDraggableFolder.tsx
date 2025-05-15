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
    show({ event: e, props: { key: 'value' } });
  }

  return (
    <>
      <div
        className={`flex items-center py-[2px] px-[5px] border ${theme === 'light' ? 'text-textColor bg-white border-gray-300 hover:border-gray-600' : 'text-textColorDark bg-bgColorDark hover:border-secondaryColorDark'}  rounded-lg hover:cursor-pointer w-full`}
        ref={(ref) => {
          drag(drop(ref));
        }}
        onContextMenu={handleContextMenu}
        key={folder.name}
        data-testid={folder.name}
        role="Dustbin"
        style={{
          backgroundColor: isOver ? '#e6e6e6' : 'white',
          opacity: isDragging ? 0.5 : 1,
        }}
        onDoubleClick={() => {
          setPath([...path, folder]);
          dispatch(selectFolder(folder.id as string));
        }}
      >
        <IoMdFolder className={`mr-2 w-[30px] h-[30px] ${theme === 'light' ? 'text-gray-500' : 'text-textColorDark'}`} />
        <div className="tooltip tooltip-right" data-tip={folder.name}>
          <span className={`font-bold text-sm ${theme === 'light' ? 'text-gray-500' : 'text-textColorDark'}`}>
            {folder.name.length > 25
              ? `${folder.name.substring(0, 25)}...`
              : folder.name}
          </span>
        </div>
        {folder.ownerEmail === user.email && (
          <Menu id={folder.name} theme={theme}>
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
                // dispatch(setFolderToRename(folder.faunaDocumentId))
                setShowRename(true);
                hideAll();
              }}
              className='hover:text-white  text-primaryColor'
            >
              <BiRename className="mr-4 w-[20px] h-[20px]" />
              Rename
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
            <Separator />
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
              className='hover:text-white  text-primaryColor'
              data-testid="deleteButtonFolder"
            >
              <BiTrash className="mr-4 w-[20px] h-[20px]" />
              Delete
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
