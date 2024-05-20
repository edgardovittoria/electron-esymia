import React from 'react';
import {Switch} from "@headlessui/react";
import { useDispatch, useSelector } from 'react-redux';
import { disableBordersForComponent, enableBordersForComponent, meshesWithBordersVisibleSelector } from '../objectsDetailsSlice';
import { selectedComponentSelector } from 'cad-library';

interface BordersMeshOptionProps {
}

export const BordersMeshOption: React.FC<BordersMeshOptionProps> = () => {
    const dispatch = useDispatch()
    const componentKey = useSelector(selectedComponentSelector).keyComponent
    const bordersVisible = useSelector(meshesWithBordersVisibleSelector)
    const isBordersVisible = bordersVisible.filter(mb => mb === componentKey).length > 0
    return (
        <>
            <div className="flex justify-between items-center px-2">
                <span className="text-black text-xs">Border</span>
                <div>
                    <Switch
                        checked={isBordersVisible}
                        onChange={(checked: boolean) => (checked) ? dispatch(enableBordersForComponent(componentKey)) : dispatch(disableBordersForComponent(componentKey))}
                        className={`${isBordersVisible ? 'bg-teal-900' : 'bg-teal-700'} relative inline-flex mt-1 h-[14px] w-[30px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
                    >
                            <span
                                aria-hidden="true"
                                className={`${isBordersVisible ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-[10px] w-[10px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                            />
                    </Switch>
                </div>

            </div>
        </>
    )

}
