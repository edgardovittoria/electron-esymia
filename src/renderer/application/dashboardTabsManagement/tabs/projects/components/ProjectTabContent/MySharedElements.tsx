import React, { useEffect, useState } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { useFaunaQuery, usersStateSelector } from 'cad-library';
import {
	mainFolderSelector,
	SelectedFolderSelector,
	selectFolder, setFolderOfElementsSharedWithUser, sharedElementsFolderSelector
} from '../../../../../../store/projectSlice';
import { DroppableAndDraggableFolder } from '../droppableDraggableFolderProject/DroppableAndDraggableFolder';
import { DraggableProjectCard } from '../droppableDraggableFolderProject/DraggableProjectCard';
import { SearchUserAndShare } from '../droppableDraggableFolderProject/searchUserAndShare/searchUserAndShare';
import { CreateNewFolderModal } from '../CreateNewFolderModal';
import noProjectsIcon2 from '../../../../../../../../assets/noProjectsIcon2.png';
import { Folder } from '../../../../../../model/esymiaModels';
import { getSharedFolders, getSharedSimulationProjects } from '../../../../../../faunadb/projectsFolderAPIs';
import { FaunaFolder, FaunaProject } from '../../../../../../model/FaunaModels';
import {
	constructFolderStructure,
	faunaFolderHaveParentInList,
	faunaProjectHaveParentInFolderList
} from '../../../../../../faunadb/apiAuxiliaryFunctions';

export interface MyFilesProps {
	setShowModal: Function;
	showCreateNewFolderModal: boolean;
	setShowCreateNewFolderModal: Function;
}

const MyFiles: React.FC<MyFilesProps> = ({
																					 setShowModal,
																					 showCreateNewFolderModal,
																					 setShowCreateNewFolderModal,
																				 }) => {
	const mainFolder = useSelector(sharedElementsFolderSelector)
	const selectedFolder = useSelector(SelectedFolderSelector);
	const myFilesFolder = useSelector(mainFolderSelector);
	const user = useSelector(usersStateSelector);
	const dispatch = useDispatch();

	const projects = selectedFolder?.projectList;
	const folders = selectedFolder?.subFolders;

	const [path, setPath] = useState([mainFolder]);
	const { execQuery } = useFaunaQuery()

	useEffect(() => {
		execQuery(getSharedFolders, user.email).then((folders: FaunaFolder[]) => {
			execQuery(getSharedSimulationProjects, user.email).then(
				(projects: FaunaProject[]) => {
					const sharedElementsRootFolder = {
						id: 'shared_root',
						folder: {
							name: 'My Shared Elements',
							owner: user,
							sharedWith: [],
							subFolders: folders
								.filter(
									(faunaFolder) =>
										!faunaFolderHaveParentInList(faunaFolder, folders),
								)
								.map((folder) => folder.id),
							projectList: projects
								.filter(
									(p) => !faunaProjectHaveParentInFolderList(p, folders),
								)
								.map((p) => p.id),
							parent: 'nobody',
						},
					} as FaunaFolder;
					const folder = constructFolderStructure(
						'shared_root',
						[sharedElementsRootFolder, ...folders],
						projects,
					);
					dispatch(setFolderOfElementsSharedWithUser(folder));
				},
			);
		});
	}, []);

	useEffect(() => {
		return () => {
			dispatch(selectFolder(myFilesFolder.faunaDocumentId as string))
		}
	}, []);

	return (
		<DndProvider backend={HTML5Backend}>
			<div className="box w-full">
				<div className="flex p-2 gap-4 items-center">
					<div className="sm:w-3/5 w-1/5">
						<h5 className="text-base">My Shared Files</h5>
					</div>
					<button
						className="md:w-1/5 text-end text-sm text-primaryColor hover:text-secondaryColor disabled:hover:no-underline hover:cursor-pointer hover:underline disabled:opacity-60"
						onClick={() => setShowModal(true)}
						disabled={selectedFolder?.faunaDocumentId === "shared_root"}
					>
						+ New Project
					</button>
					<button
						className="md:w-1/5 text-sm text-center text-primaryColor hover:text-secondaryColor disabled:hover:no-underline hover:cursor-pointer hover:underline disabled:opacity-60"
						onClick={() => setShowCreateNewFolderModal(true)}
						disabled={selectedFolder?.faunaDocumentId === "shared_root"}
					>
						+ New Folder
					</button>
				</div>

				<div className="p-[12px] text-[18px]">
					<hr />
					{path.map((p, index) => {
						return (
							<div className="inline-block p-2" key={index}>
								{index !== path.length - 1 ? (
									<div>
                    <span
											className="hover:underline hover:cursor-pointer text-sm"
											onClick={() => {
												const newPath = path.filter((p, i) => i <= index);
												setPath(newPath);
												dispatch(selectFolder(p.faunaDocumentId as string));
											}}
										>
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

				<div className="w-full text-left p-[20px] h-[80%]">
					{projects &&
					folders &&
					(projects.length > 0 || folders.length > 0) ? (
						<>
							{folders.length > 0 && (
								<h5 className="w-[100%] text-sm font-semibold uppercase p-2">
									Folders
								</h5>
							)}
							<div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-7 overflow-scroll max-h-[200px]">
								{folders.map((folder) => {
									return (
										<DroppableAndDraggableFolder
											key={folder.faunaDocumentId}
											folder={folder}
											path={path}
											setPath={setPath}
										/>
									);
								})}
							</div>
							{projects.length > 0 && (
								<h5 className="w-[100%] mt-4 mb-2 text-sm font-semibold uppercase p-2">
									Projects
								</h5>
							)}
							<div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-7 overflow-scroll max-h-[380px]">
								{projects
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
						<div className="text-center p-[20px]">
							<img
								src={noProjectsIcon2}
								className="my-[50px] mx-auto"
								alt="No Projects Icon"
							/>
							<p>No projects for now.</p>
							<button
								className="button buttonPrimary lg:text-base text-sm mt-5"
								data-toggle="modal"
								data-target="#createNewProjectModal"
								onClick={() => {
									setShowModal(true);
								}}
							>
								CREATE YOUR FIRST PROJECT
							</button>
						</div>
					)}
				</div>
			</div>
			{showCreateNewFolderModal && (
				<CreateNewFolderModal
					setShowNewFolderModal={setShowCreateNewFolderModal}
				/>
			)}
		</DndProvider>
	);
};

export default MyFiles;
