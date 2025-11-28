import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from "@headlessui/react";
import { useDispatch, useSelector } from "react-redux";
import { renameProject } from '../../../../../../store/projectSlice';
import { Project } from '../../../../../../model/esymiaModels';
import { ThemeSelector, updateProjectTab } from '../../../../../../store/tabsAndMenuItemsSlice';
import { useDynamoDBQuery } from '../../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../../../../../dynamoDB/projectsFolderApi';


interface RenameProjectProps {
    projectToRename: Project,
    handleClose: () => void
}

export const RenameProject: React.FC<RenameProjectProps> = (
    {
        projectToRename, handleClose
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
                            <div className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-2xl transition-all backdrop-blur-md ${isDark
                                ? 'bg-black/80 border border-white/10'
                                : 'bg-white/90 border border-white/40'
                                }`}>
                                <h5 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Rename Project
                                </h5>

                                <div className="flex flex-col gap-2 mb-8">
                                    <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Name
                                    </span>
                                    <input
                                        type="text"
                                        className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-200 ${isDark
                                            ? 'bg-black/40 border border-white/10 text-white focus:border-green-500/50 focus:bg-black/60 placeholder-gray-500'
                                            : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 placeholder-gray-400'
                                            }`}
                                        placeholder="Enter project name"
                                        defaultValue={(projectToRename) && projectToRename.name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isDark
                                            ? 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                                            }`}
                                        onClick={handleClose}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${isDark
                                            ? 'bg-green-600 text-white hover:bg-green-500 hover:shadow-green-500/20'
                                            : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-green-500/30'
                                            }`}
                                        onClick={() => {
                                            dispatch(renameProject({
                                                projectToRename: projectToRename.id as string,
                                                name: name,
                                            }))
                                            dispatch(updateProjectTab({
                                                ...projectToRename,
                                                name: name
                                            }))
                                            execQuery2(createOrUpdateProjectInDynamoDB, {
                                                ...projectToRename,
                                                name: name,
                                                simulation: {
                                                    ...projectToRename.simulation,
                                                    name: `${name} - sim`
                                                }
                                            } as Project, dispatch)
                                            handleClose()
                                        }}
                                    >
                                        Rename Project
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
