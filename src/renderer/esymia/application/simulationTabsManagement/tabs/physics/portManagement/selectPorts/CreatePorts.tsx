import React, { Fragment } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Menu, Transition } from "@headlessui/react";
import { FiChevronDown } from "react-icons/fi";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { generateTerminationName, getDefaultLumped, getDefaultPort } from "./portLumpedProbeGenerator";
import {
    addPorts,
    selectPort
} from '../../../../../../store/projectSlice';
import { Project } from '../../../../../../model/esymiaModels';
import { Vector3 } from 'three';
import { ThemeSelector } from '../../../../../../store/tabsAndMenuItemsSlice';

interface SelectPortsProps {
    selectedProject: Project,
    cameraPosition: Vector3
}

export const CreatePorts: React.FC<SelectPortsProps> = ({ selectedProject, cameraPosition }) => {

    const dispatch = useDispatch()
    const theme = useSelector(ThemeSelector)

    return (
        <div className={`relative inline-block text-left ${selectedProject.simulation?.status === 'Completed' ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Menu as="div" className="relative inline-block text-left">
                <Menu.Button
                    data-testid="addPort"
                    disabled={selectedProject.simulation?.status === 'Completed'}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${theme === 'light'
                            ? 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white hover:border-blue-500 hover:text-blue-600 hover:shadow-md'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-blue-400 hover:text-blue-400'
                        }`}
                >
                    <AiOutlineThunderbolt size={20} />
                    <span className="text-sm font-medium">Add Port/Lumped</span>
                    <FiChevronDown size={16} />
                </Menu.Button>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className={`absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden ${theme === 'light' ? 'bg-white' : 'bg-gray-800 border border-gray-700'
                        }`}>
                        <div className="p-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        data-testid="port"
                                        className={`${active
                                                ? (theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-white/10 text-blue-400')
                                                : (theme === 'light' ? 'text-gray-900' : 'text-gray-200')
                                            } group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors`}
                                        onClick={() => {
                                            let port = getDefaultPort(generateTerminationName(selectedProject.ports, 'port'), cameraPosition)
                                            dispatch(addPorts(port))
                                            dispatch(selectPort(port.name))
                                        }}
                                    >
                                        Port
                                    </button>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        data-testid="lumped"
                                        className={`${active
                                                ? (theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-white/10 text-blue-400')
                                                : (theme === 'light' ? 'text-gray-900' : 'text-gray-200')
                                            } group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors`}
                                        onClick={() => {
                                            let lumped = getDefaultLumped(generateTerminationName(selectedProject.ports, 'lumped'), cameraPosition)
                                            dispatch(addPorts(lumped))
                                            dispatch(selectPort(lumped.name))
                                        }}
                                    >
                                        Lumped
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    )
}
