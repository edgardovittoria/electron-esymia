import React, { Fragment, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { addFolder, SelectedFolderSelector } from "../../../../../store/projectSlice";
import { Dialog, Transition } from "@headlessui/react";
import { Folder } from '../../../../../model/esymiaModels';
import toast from 'react-hot-toast';
import { usersStateSelector } from '../../../../../../cad_library';
import { ThemeSelector } from '../../../../../store/tabsAndMenuItemsSlice';
import { useDynamoDBQuery } from '../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateFolderInDynamoDB, addIDInSubFoldersListInDynamoDB } from '../../../../../../dynamoDB/projectsFolderApi';

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
    const isDark = theme !== 'light';

    const { execQuery2 } = useDynamoDBQuery()

    const [folderName, setFolderName] = useState("");

    const handleClose = () => setShowNewFolderModal(false)


    const handleCreate = () => {
        if (folderName.length > 0) {
            let newFolder: Folder = {
                name: folderName,
                owner: user,
                ownerEmail: user.email as string,
                sharedWith: [],
                projectList: [],
                subFolders: [],
                parent: selectedFolder.id as string,
                id: crypto.randomUUID(),
            }
            execQuery2(createOrUpdateFolderInDynamoDB, newFolder, dispatch).then((res: any) => {
                dispatch(addFolder(newFolder));
                (selectedFolder.id !== 'root') && execQuery2(addIDInSubFoldersListInDynamoDB, newFolder.id, selectedFolder, dispatch)
            })
            setShowNewFolderModal(false)
        } else {
            toast.error("Folder's name is required!")
        }
    }

    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
                            <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${isDark
                                    ? 'glass-panel-dark border border-white/10'
                                    : 'glass-panel-light border border-white/40'
                                }`}>
                                <Dialog.Title
                                    as="h3"
                                    className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
                                >
                                    Create New Folder
                                </Dialog.Title>

                                {user.email ?
                                    <div className="flex flex-col gap-2 mb-8">
                                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Folder Name:
                                        </span>
                                        <input
                                            type="text"
                                            data-testid="folderName"
                                            className={`w-full rounded-lg px-4 py-2 outline-none transition-all duration-200 ${isDark
                                                    ? 'bg-white/5 border border-white/10 text-white focus:border-green-500/50 focus:bg-white/10'
                                                    : 'bg-white border border-gray-200 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                                                }`}
                                            placeholder="Enter folder name"
                                            value={folderName}
                                            onChange={(e) => setFolderName(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    :
                                    <div className="flex flex-col mb-8">
                                        <div className={`p-4 rounded-lg ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
                                            <h6 className="text-sm font-medium">Please login first in order to create a new folder.</h6>
                                        </div>
                                    </div>
                                }
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDark
                                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                                            }`}
                                        onClick={handleClose}
                                    >
                                        Cancel
                                    </button>
                                    {user.email &&
                                        <button
                                            type="button"
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDark
                                                    ? 'bg-green-500 text-white hover:bg-green-400'
                                                    : 'bg-green-600 text-white hover:bg-green-500'
                                                }`}
                                            onClick={handleCreate}
                                        >
                                            Create
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
