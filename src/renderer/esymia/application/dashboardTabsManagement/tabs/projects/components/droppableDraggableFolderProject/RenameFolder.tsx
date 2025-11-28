import React, { Fragment, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Dialog, Transition } from "@headlessui/react";
import { renameFolder } from '../../../../../../store/projectSlice';
import { Folder } from '../../../../../../model/esymiaModels';
import { useDynamoDBQuery } from '../../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateFolderInDynamoDB } from '../../../../../../../dynamoDB/projectsFolderApi';
import { ThemeSelector } from '../../../../../../store/tabsAndMenuItemsSlice';

interface RenameFolderProps {
    folderToRename: Folder,
    handleClose: () => void
}

export const RenameFolder: React.FC<RenameFolderProps> = (
    {
        folderToRename, handleClose
    }
) => {

    const dispatch = useDispatch()
    const theme = useSelector(ThemeSelector);
    const isDark = theme !== 'light';

    const [name, setName] = useState("");

    const { execQuery2 } = useDynamoDBQuery()

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

                <div className="fixed inset-0 overflow-y-auto">
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
                            <div className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${isDark
                                    ? 'glass-panel-dark border border-white/10'
                                    : 'glass-panel-light border border-white/40'
                                }`}>
                                <h5 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Rename Folder
                                </h5>

                                <div className="flex flex-col gap-2 mb-8">
                                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Name:
                                    </span>
                                    <input
                                        type="text"
                                        className={`w-full rounded-lg px-4 py-2 outline-none transition-all duration-200 ${isDark
                                                ? 'bg-white/5 border border-white/10 text-white focus:border-green-500/50 focus:bg-white/10'
                                                : 'bg-white border border-gray-200 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                                            }`}
                                        defaultValue={folderToRename.name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoFocus
                                    />
                                </div>

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
                                    <button
                                        type="button"
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isDark
                                                ? 'bg-green-500 text-white hover:bg-green-400'
                                                : 'bg-green-600 text-white hover:bg-green-500'
                                            }`}
                                        onClick={() => {
                                            dispatch(renameFolder({
                                                folderToRename: folderToRename,
                                                name: name
                                            }))
                                            execQuery2(createOrUpdateFolderInDynamoDB, {
                                                ...folderToRename,
                                                name: name
                                            } as Folder, dispatch)
                                            handleClose()
                                        }}
                                    >
                                        Rename
                                    </button>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )

}
