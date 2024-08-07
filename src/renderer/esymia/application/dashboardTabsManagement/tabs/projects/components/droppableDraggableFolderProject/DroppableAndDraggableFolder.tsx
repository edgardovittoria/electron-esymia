import React, { useEffect, useState } from 'react';
import { IoMdFolder } from 'react-icons/io';
import { useDrag, useDragDropManager, useDrop } from 'react-dnd';
import {
  Menu,
  Item,
  Separator,
  useContextMenu,
  Submenu,
} from 'react-contexify';
import { BiRename, BiShareAlt, BiTrash } from 'react-icons/bi';
import { BsFillFolderSymlinkFill } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { useFaunaQuery, usersStateSelector } from 'cad-library';
import {
  allProjectFoldersSelector,
  moveFolder,
  moveProject,
  removeFolder,
  SelectedFolderSelector,
  selectFolder,
} from '../../../../../../store/projectSlice';
import {
  deleteFolderFromFauna,
  moveFolderInFauna,
  moveProjectInFauna,
} from '../../../../../../faunadb/projectsFolderAPIs';
import { RenameFolder } from './RenameFolder';
import { SearchUserAndShare } from './searchUserAndShare/searchUserAndShare';
import { Folder, Project } from '../../../../../../model/esymiaModels';
import { takeAllProjectsInArrayOf } from '../../../../../../store/auxiliaryFunctions/managementProjectsAndFoldersFunction';
import { deleteFileS3 } from '../../../../../../aws/mesherAPIs';
import { useStorageData } from '../../../../../simulationTabsManagement/tabs/simulator/rightPanelSimulator/hook/useStorageData';

interface DroppableAndDraggableFolderProps {
  folder: Folder;
  path: Folder[];
  setPath: Function;
}

export const DroppableAndDraggableFolder: React.FC<
  DroppableAndDraggableFolderProps
> = ({ folder, path, setPath }) => {
  const dispatch = useDispatch();
  const { execQuery } = useFaunaQuery();
  const selectedFolder = useSelector(SelectedFolderSelector) as Folder;
  const allProjectFolders = useSelector(allProjectFoldersSelector);
  const user = useSelector(usersStateSelector);
  const {deleteProjectStoredMeshData} = useStorageData()
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
    [selectedFolder.name, selectedFolder.projectList],
  );

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'FOLDER',
      item: folder,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [selectedFolder.name, selectedFolder.projectList.length],
  );

  const dragAndDropManager = useDragDropManager();

  useEffect(() => {
    if (dragDone) {
      //console.log(dragItem)
      const objectToMove: Project | Folder = dragItem
      if (objectToMove && objectToMove.faunaDocumentId !== dropTargetFolder.faunaDocumentId) {
        if ('model' in objectToMove) {
          dispatch(
            moveProject({
              objectToMove,
              targetFolder: dropTargetFolder.faunaDocumentId as string,
            }),
          );
          execQuery(
            moveProjectInFauna,
            {
              ...objectToMove,
              parentFolder: dropTargetFolder.faunaDocumentId,
            } as Project,
            objectToMove.parentFolder,
            dispatch
          );
        } else {
          dispatch(
            moveFolder({
              objectToMove: objectToMove as Folder,
              targetFolder: dropTargetFolder.faunaDocumentId as string,
            }),
          );
          execQuery(
            moveFolderInFauna,
            {
              ...objectToMove,
              parent: dropTargetFolder.faunaDocumentId,
            } as Folder,
            (objectToMove as Folder).parent,
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
        className="flex items-center py-[5px] px-[10px] border-2 border-gray-300 mt-[10px] rounded-lg hover:cursor-pointer hover:border-gray-600 w-full"
        ref={(ref) => {
          drag(drop(ref));
        }}
        onContextMenu={handleContextMenu}
        key={folder.name}
        role="Dustbin"
        style={{
          backgroundColor: isOver ? '#e6e6e6' : 'white',
          opacity: isDragging ? 0.5 : 1,
        }}
        onDoubleClick={() => {
          setPath([...path, folder]);
          dispatch(selectFolder(folder.faunaDocumentId as string));
        }}
      >
        <IoMdFolder className="mr-2 w-[35px] h-[35px] text-gray-500" />
        <span className="font-bold text-base text-gray-500">{folder.name}</span>
        {folder.owner.email === user.email && (
          <Menu id={folder.name}>
            <Submenu
              className='hover:text-white  text-primaryColor'
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
                    n.faunaDocumentId !== folder.parent &&
                    n.faunaDocumentId !== folder.faunaDocumentId,
                )
                .map((f) => {
                  return (
                    <div key={f.faunaDocumentId}>
                      <Item
                        onClick={(p) => {
                          p.event.stopPropagation();
                          dispatch(
                            moveFolder({
                              objectToMove: folder,
                              targetFolder: f.faunaDocumentId as string,
                            }),
                          );
                          execQuery(
                            moveFolderInFauna,
                            { ...folder, parent: f.faunaDocumentId } as Folder,
                            folder.parent,
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
            <Separator />
            <Item
              onClick={(p) => {
                p.event.stopPropagation();
                setShowSearchUser(true);
                hideAll();
              }}
              className='hover:text-white  text-primaryColor'
            >
              <BiShareAlt className="mr-4 w-[20px] h-[20px]" />
              Share
            </Item>
            <Separator />
            <Item
              onClick={(p) => {
                p.event.stopPropagation();
                execQuery(
                  deleteFolderFromFauna,
                  folder.faunaDocumentId,
                  folder.parent,
                  dispatch
                );
                takeAllProjectsInArrayOf([folder]).forEach(p => {deleteProjectStoredMeshData(p)})
                dispatch(removeFolder(folder));
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
