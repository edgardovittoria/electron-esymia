import React from 'react';
import { Switch } from "@headlessui/react";
import { useDispatch, useSelector } from 'react-redux';
import { meshesWithBordersVisibleSelector, toggleBordersAction } from '../objectsDetailsSlice';
import { selectedComponentSelector } from '../../../../../cad_library';
import { ThemeSelector } from '../../../../../esymia/store/tabsAndMenuItemsSlice';

interface BordersMeshOptionProps {
}

export const BordersMeshOption: React.FC<BordersMeshOptionProps> = () => {
    const dispatch = useDispatch()
    const componentKey = useSelector(selectedComponentSelector).keyComponent
    const bordersVisible = useSelector(meshesWithBordersVisibleSelector)
    const isBordersVisible = bordersVisible.filter(mb => mb === componentKey).length > 0
    const theme = useSelector(ThemeSelector);

    return (
        <div className="flex flex-row items-center gap-2 px-2 py-1">
            <Switch
                checked={isBordersVisible}
                onChange={(checked: boolean) => dispatch(toggleBordersAction(componentKey, checked))}
                className={`${isBordersVisible ? 'bg-blue-500' : `${theme === 'light' ? 'bg-gray-200' : 'bg-white/10'}`} relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
            >
                <span className="sr-only">Use setting</span>
                <span
                    aria-hidden="true"
                    className={`${isBordersVisible ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                />
            </Switch>
            <label className={`text-xs font-medium cursor-pointer select-none ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`} onClick={() => dispatch(toggleBordersAction(componentKey, !isBordersVisible))}>
                Show Borders
            </label>
        </div>
    )
}
