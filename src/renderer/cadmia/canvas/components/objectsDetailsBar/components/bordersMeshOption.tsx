import React from 'react';
import { Switch } from "@headlessui/react";
import { useDispatch, useSelector } from 'react-redux';
import { disableBordersForComponent, enableBordersForComponent, meshesWithBordersVisibleSelector } from '../objectsDetailsSlice';
import { selectedComponentSelector } from '../../../../../cad_library';

interface BordersMeshOptionProps {
}

export const BordersMeshOption: React.FC<BordersMeshOptionProps> = () => {
    const dispatch = useDispatch()
    const componentKey = useSelector(selectedComponentSelector).keyComponent
    const bordersVisible = useSelector(meshesWithBordersVisibleSelector)
    const isBordersVisible = bordersVisible.filter(mb => mb === componentKey).length > 0
    return (
        <div className="flex flex-row items-center gap-2 px-2 py-1">
            <Switch
                checked={isBordersVisible}
                onChange={(checked: boolean) => (checked) ? dispatch(enableBordersForComponent(componentKey)) : dispatch(disableBordersForComponent(componentKey))}
                className={`${isBordersVisible ? 'bg-blue-500' : 'bg-gray-200 dark:bg-white/10'} relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
            >
                <span className="sr-only">Use setting</span>
                <span
                    aria-hidden="true"
                    className={`${isBordersVisible ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                />
            </Switch>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none" onClick={() => (isBordersVisible) ? dispatch(disableBordersForComponent(componentKey)) : dispatch(enableBordersForComponent(componentKey))}>
                Show Borders
            </label>
        </div>
    )
}
