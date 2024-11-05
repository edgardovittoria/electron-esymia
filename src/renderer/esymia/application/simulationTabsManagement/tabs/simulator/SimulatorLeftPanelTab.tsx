import React, {} from 'react';
import {useSelector} from "react-redux";
import {selectedProjectSelector} from "../../../../store/projectSlice";
import {FaCircle} from "react-icons/fa";
import {Disclosure, Switch, Transition} from '@headlessui/react'
import {MdOutlineKeyboardArrowDown} from "react-icons/md";
import noMaterialsIcon from '../../../../../../../assets/noMaterialsIcon.png'
import noMaterialsIconDark from '../../../../../../../assets/noMaterialsIconDark.png'
import { Material } from '../../../../../cad_library';
import { ThemeSelector } from '../../../../store/tabsAndMenuItemsSlice';


interface SimulatorLeftPanelTabProps {
    selectedMaterials: string[],
    setSelectedMaterials: Function,
    allMaterials: Material[]
}

export const SimulatorLeftPanelTab: React.FC<SimulatorLeftPanelTabProps> = (
    {
        selectedMaterials, setSelectedMaterials, allMaterials
    }
) => {

    const selectedProject = useSelector(selectedProjectSelector)
    const theme = useSelector(ThemeSelector)

    return (
        <>
            {(selectedProject && selectedProject.model?.components !== undefined) ?
                <div className="max-h-[400px] overflow-auto">
                  <span className='font-bold'>Materials</span>
                  <hr className='border-[1px] border-gray-300 w-full mb-2 mt-1'/>
                    {allMaterials.map((material, index) => {
                        return (
                            <Disclosure>
                                {({open}) => (
                                    <>
                                        <Disclosure.Button
                                            className={`flex w-full justify-between rounded-lg border mb-2 px-4 py-2 text-left text-sm font-medium ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'} focus:outline-none focus-visible:ring`}
                                            style={{borderColor: material.color}}
                                        >
                                            <div className="flex gap-2 items-center">
                                                <div className="flex items-center">
                                                    <FaCircle
                                                        color={(material) ? material.color : "gray"}/>
                                                </div>
                                                <div className="text-left">
                                                    <h6 className="mb-0 text-[15px] font-normal">{(material) ? material.name : "No material"}</h6>
                                                </div>
                                            </div>
                                            <MdOutlineKeyboardArrowDown
                                                className={`${
                                                    open ? 'rotate-180 transform' : ''
                                                } h-5 w-5 text-gray-500`}
                                            />
                                        </Disclosure.Button>
                                        <Transition
                                            enter="transition duration-300 ease-in"
                                            enterFrom="transform opacity-0 opacity-0"
                                            enterTo="transform opacity-100 opacity-100"
                                            leave="transition duration-200 ease-out"
                                            leaveFrom="transform opacity-100 opacity-100"
                                            leaveTo="transform opacity-0 opacity-0"
                                        >
                                            <Disclosure.Panel
                                                className="px-4 pb-2 pt-2 text-sm text-gray-500 border rounded mb-2"
                                                style={{borderColor: material.color}}
                                            >
                                                <div className="flexl gap-1">
                                                    <span className={`font-bold ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`}>Conductivity: </span>
                                                    <span className={`${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`}>{material.conductivity}</span>
                                                </div>
                                                <div className="flexl gap-1">
                                                    <span className={`font-bold ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`}>Relative Permittivity: </span>
                                                    <span className={`${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`}>{material.permittivity}</span>
                                                </div>
                                                <div className="flexl gap-1">
                                                    <span className={`font-bold ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`}>Relative Permeability: </span>
                                                    <span className={`${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`}>{material.permeability}</span>
                                                </div>
                                                <div className="flexl gap-1">
                                                    <span className={`font-bold ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`}>Tangent Delta Conductivity: </span>
                                                    <span className={`${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`}>{material.tangent_delta_conductivity}</span>
                                                </div>
                                                <div className="flexl gap-1">
                                                    <span className={`font-bold ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`}>Tangent Delta Permittivity: </span>
                                                    <span className={`${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`}>{material.tangent_delta_permittivity}</span>
                                                </div>
                                                <div className="flexl gap-1">
                                                    <span className={`font-bold ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`}>Tangent Delta Permeability: </span>
                                                    <span className={`${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`}>{material.tangent_delta_permeability}</span>
                                                </div>
                                            </Disclosure.Panel>
                                        </Transition>
                                    </>
                                )}
                            </Disclosure>
                            /*<div className="visible collapse collapse-arrow bg-base-200 z-10">
                                <input type="checkbox" />
                                <div className="collapse-title text-xl font-medium">
                                    <div className="flex gap-2 items-center">
                                        <div className="flex items-center">
                                            <FaCircle
                                                color={(material !== undefined) ? material.color : "gray"}/>
                                        </div>
                                        <div className="text-left">
                                            <h6 className="mb-0 text-[15px] font-normal">{(material !== undefined) ? material.name : "No material"}</h6>
                                        </div>
                                    </div>
                                </div>
                                <div className="collapse-content">
                                    <code>
                                        {material.name}
                                    </code>
                                </div>
                            </div>*/
                            /*
                                <div className="flex gap-2 items-center">
                                    <div className="flex items-center">
                                        <FaCircle
                                            color={(material !== undefined) ? material.color : "gray"}/>
                                    </div>
                                    <div className="text-left">
                                        <h6 className="mb-0 text-[15px] font-normal">{(material !== undefined) ? material.name : "No material"}</h6>
                                    </div>
                                    <div className="text-left">
                                        <Switch
                                            checked={selectedMaterials.filter(m => m === material?.name).length > 0}
                                            onChange={() => {
                                                if (selectedMaterials.filter(sm => sm === material?.name)[0]) {
                                                    setSelectedMaterials(selectedMaterials.filter(sm => sm !== material?.name))
                                                } else {
                                                    setSelectedMaterials([...selectedMaterials, material?.name])
                                                }
                                            }}
                                            className={`${
                                                selectedMaterials.filter(m => m === material?.name).length > 0 ? 'bg-green-400' : 'bg-gray-300'
                                            } relative inline-flex h-4 w-9 items-center rounded-full`}
                                        >
                                        <span
                                            className={`${
                                                selectedMaterials.filter(m => m === material?.name).length > 0 ? 'translate-x-5' : 'translate-x-1'
                                            } inline-block h-3 w-3 transform rounded-full bg-white transition`}
                                        />
                                        </Switch>
                                    </div>
                                </div>
                            </div>*/
                        )
                    })}

                </div> :
                <div className="text-center">
                    <img src={theme === 'light' ? noMaterialsIcon : noMaterialsIconDark} className="mx-auto mt-[50px]" alt='No Materials'/>
                    <h5>No Materials</h5>
                    <p className="mt-[50px]">Apply the materials on the model directly in the CAD</p>
                </div>
            }
        </>
    )

}
