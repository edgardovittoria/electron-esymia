import React, { Fragment, useState } from 'react';
import { createFolderInFauna, addIDInSubFoldersList } from "../../../../../faunadb/projectsFolderAPIs";
import { useDispatch, useSelector } from "react-redux";
import { addFolder, SelectedFolderSelector } from "../../../../../store/projectSlice";
import { Dialog, Transition } from "@headlessui/react";
import { Folder } from '../../../../../model/esymiaModels';
import toast from 'react-hot-toast';
import { useFaunaQuery } from '../../../../../faunadb/hook/useFaunaQuery';
import { usersStateSelector } from '../../../../../../cad_library';
import { ThemeSelector } from '../../../../../store/tabsAndMenuItemsSlice';

interface CreateNewFolderModalProps {
    setShowNewFolderModal: Function,
}

export const CreateNewFolderModal: React.FC<CreateNewFolderModalProps> = (
    {
        setShowNewFolderModal
    }
) => {

    const dispatch = useDispatch()

    const user = useSelector(usersStateSelector)
    const selectedFolder = useSelector(SelectedFolderSelector) as Folder
    const theme = useSelector(ThemeSelector)

    const { execQuery } = useFaunaQuery()

    const [folderName, setFolderName] = useState("");

    const handleClose = () => setShowNewFolderModal(false)


    const handleCreate = () => {
        if (folderName.length > 0) {
            let newFolder: Folder = {
                name: folderName,
                owner: user,
                sharedWith: [],
                projectList: [],
                subFolders: [],
                parent: selectedFolder.faunaDocumentId as string,
            }
            execQuery(createFolderInFauna, newFolder, dispatch).then((ret: any) => {
                newFolder = { ...newFolder, faunaDocumentId: ret.id }
                dispatch(addFolder(newFolder));
                (selectedFolder.faunaDocumentId !== 'root') && execQuery(addIDInSubFoldersList, newFolder.faunaDocumentId, selectedFolder, dispatch)
            })
            setShowNewFolderModal(false)
        } else {
            toast.error("Folder's name is required!")
        }
    }

    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto" data-testid="createNewFolderModal">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl ${theme === 'light' ? 'bg-white text-textColor' : 'bg-bgColorDark2 text-textColorDark '} p-6 text-left align-middle shadow-xl transition-all`}>
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6"
                                >
                                    CREATE NEW FOLDER
                                </Dialog.Title>
                                <hr className="mt-2 mb-3" />
                                {user.email ?
                                    <div className="flex flex-col">
                                        <div className="p-2">
                                            <h6>Insert Folder's Name</h6>
                                            <input
                                                type="text"
                                                data-testid="folderName"
                                                className={`formControl ${theme === 'light' ? 'bg-gray-100 text-textColor' : 'bg-bgColorDark text-textColorDark'} rounded p-2 w-full mt-3`}
                                                placeholder="Folder's Name"
                                                value={folderName}
                                                onChange={(e) => setFolderName(e.target.value)} />
                                        </div>
                                    </div>
                                    :
                                    <div className="flex flex-col">
                                        <div className="p-2">
                                            <h6>Please login first in order to create a new folder.</h6>
                                        </div>
                                    </div>
                                }
                                <div className="mt-4 flex justify-between">
                                    <button
                                        type="button"
                                        className="button bg-red-500 text-white"
                                        onClick={handleClose}
                                    >
                                        CANCEL
                                    </button>
                                    {user.email &&
                                        <button
                                            type="button"
                                            className={`button buttonPrimary ${theme === 'light' ? '' : 'bg-secondaryColorDark text-textColor'}`}
                                            onClick={handleCreate}
                                        >
                                            CREATE
                                        </button>
                                    }
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )

}
