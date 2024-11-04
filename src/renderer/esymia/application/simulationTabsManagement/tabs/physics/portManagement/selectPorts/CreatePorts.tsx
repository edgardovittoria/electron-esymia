import React, {Fragment} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Menu, Transition} from "@headlessui/react";
import {FiChevronDown} from "react-icons/fi";
import {AiOutlineThunderbolt} from "react-icons/ai";
import {generateTerminationName, getDefaultLumped, getDefaultPort, getDefaultProbe} from "./portLumpedProbeGenerator";
import {
    addPorts,
    boundingBoxDimensionSelector,
    selectPort} from '../../../../../../store/projectSlice';
import { Project } from '../../../../../../model/esymiaModels';
import { Vector3 } from 'three';
import { ThemeSelector } from '../../../../../../store/tabsAndMenuItemsSlice';

interface SelectPortsProps {
    selectedProject: Project,
    cameraPosition: Vector3
}

export const CreatePorts: React.FC<SelectPortsProps> = ({selectedProject, cameraPosition}) => {

    const dispatch = useDispatch()
    const theme = useSelector(ThemeSelector)

    return (
        <>
            < div className={`${(selectedProject.simulation?.status === 'Completed') && 'opacity-40'}`}>
                <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button
                        data-testid="addPort"
                        disabled = {selectedProject.simulation?.status === 'Completed'}
                        className={`inline-flex w-full justify-center rounded-md ${theme === 'light' ? 'bg-white text-textColor' : 'bg-bgColorDark2 text-textColorDark'} px-2 py-2 text-sm font-medium text-black hover:bg-opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}>
                        <AiOutlineThunderbolt
                            className="ml-0 mr-2 h-5 w-5 text-green-300"
                            aria-hidden="true"
                        />
                        Add Port
                        <FiChevronDown
                            className="ml-2 -mr-1 h-5 w-5 text-green-300 hover:text-green-800"
                            aria-hidden="true"
                        />
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
                        <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <Menu.Item>
                                {({active}) => (
                                    <span
                                        data-testid="port"
                                        className={`${
                                            active ? 'bg-green-200' : 'text-gray-900'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-base no-underline`}
                                        onClick={() => {
                                            let port = getDefaultPort(generateTerminationName(selectedProject.ports, 'port'), cameraPosition)
                                            dispatch(addPorts(port))
                                            dispatch(selectPort(port.name))
                                        }}
                                    >
                                        Port
                                    </span>
                                )}
                            </Menu.Item>
                            <Menu.Item>
                                {({active}) => (
                                    <span
                                      data-testid="lumped"
                                        className={`${
                                            active ? 'bg-green-200' : 'text-gray-900'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-base no-underline`}
                                        onClick={() => {
                                            let lumped = getDefaultLumped(generateTerminationName(selectedProject.ports, 'lumped'), cameraPosition)
                                            dispatch(addPorts(lumped))
                                            dispatch(selectPort(lumped.name))
                                        }}
                                    >
                                        Lumped
                                    </span>
                                )}
                            </Menu.Item>
                            {/* <Menu.Item>
                                {({active}) => (
                                    <span
                                        className={`${
                                            active ? 'bg-green-200' : 'text-gray-900'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-base no-underline`}
                                        onClick={() => {
                                            let probe = getDefaultProbe(generateTerminationName(selectedProject.ports, 'probe'), size as number)
                                            dispatch(addPorts(probe))
                                        }}
                                    >
                                        Probe
                                    </span>
                                )}
                            </Menu.Item> */}
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </>
    )

}
