import React, { useState } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
	SelectedFolderSelector,
	selectFolder,
	sharedElementsFolderSelector,
} from "../../../../../../store/projectSlice";
import { DraggableProjectCard } from "../droppableDraggableFolderProject/DraggableProjectCard";
import { SearchUserAndShare } from "../droppableDraggableFolderProject/searchUserAndShare/searchUserAndShare";
import { DndProvider } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { usersStateSelector } from "cad-library";
import { DroppableAndDraggableFolder } from "../droppableDraggableFolderProject/DroppableAndDraggableFolder";

export interface MySharedElementsProps {
	setShowModal: Function;
	showSearchUser: boolean;
	setShowSearchUser: (v: boolean) => void;
}

const MySharedElements: React.FC<MySharedElementsProps> = ({
	setShowModal,
	showSearchUser,
	setShowSearchUser,
}) => {
	const mainSharedFolder = useSelector(sharedElementsFolderSelector);
	const selectedFolder = useSelector(SelectedFolderSelector);
	const user = useSelector(usersStateSelector);

	const dispatch = useDispatch();

	const [pathSharedElements, setPathSharedElements] = useState([
		mainSharedFolder,
	]);

	let projects = selectedFolder?.projectList;
	let folders = selectedFolder?.subFolders;

	return (
		<>
			<DndProvider backend={HTML5Backend}>
				<div className="box w-full h-full">
					<div className="flex pt-2">
						<div className="w-3/5">
							<h5 className="text-sm">Shared Elements</h5>
						</div>
						{/*<div
                            className={`w-1/5 text-end text-primaryColor hover:text-secondaryColor hover:cursor-pointer hover:underline`}
                            onClick={() => setShowModal(true)}>
                            + New Project
                        </div>
                        <div
                            className={`w-1/5 text-center text-primaryColor hover:text-secondaryColor hover:cursor-pointer hover:underline`}
                            onClick={() => setShowCreateNewFolderModal(true)}>
                            + New Folder
                        </div>*/}
					</div>

					<div className="p-[12px] text-[18px]">
						<hr />
						{pathSharedElements.map((p, index) => {
							return (
								<div className="inline-block ml-2" key={index}>
									{index !== pathSharedElements.length - 1 ? (
										<div>
											<span
												className="hover:underline hover:cursor-pointer text-sm"
												onClick={() => {
													let newPath = pathSharedElements.filter(
														(p, i) => i <= index
													);
													setPathSharedElements(newPath);
													dispatch(selectFolder(p.faunaDocumentId as string));
												}}>
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
						<hr />
					</div>

					<div className="w-full text-left overflow-scroll overflow-x-hidden p-[20px] h-[80%]">
						{projects &&
						folders &&
						(projects.length > 0 || folders.length > 0) ? (
							<>
								<div className="flex flex-wrap ">
									{folders.length > 0 && (
										<h5 className="w-[100%]">Shared Folders</h5>
									)}
									{folders.map((folder) => {
										return (
											<DroppableAndDraggableFolder
												key={folder.faunaDocumentId}
												folder={folder}
												path={pathSharedElements}
												setPath={setPathSharedElements}
											/>
										);
									})}
								</div>
								<div className={`flex flex-wrap mt-4`}>
									{projects.length > 0 && (
										<h5 className="w-[100%]">Shared Projects</h5>
									)}
									{projects
										.filter((p) => p.owner.userName !== user.userName)
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
							<>
								<div className="text-center p-[20px]">
									No Shared Projects
								</div>
							</>
						)}
					</div>
				</div>
				{showSearchUser && (
					<SearchUserAndShare setShowSearchUser={setShowSearchUser} />
				)}
				{/* {showRename && <RenameModal setShowRename={setShowRename} />} */}
				{/*{showCreateNewFolderModal && (
                    <CreateNewFolderModal
                        setShowNewFolderModal={setShowCreateNewFolderModal}
                    />
                )}*/}
			</DndProvider>
		</>
	);
};

export default MySharedElements;
