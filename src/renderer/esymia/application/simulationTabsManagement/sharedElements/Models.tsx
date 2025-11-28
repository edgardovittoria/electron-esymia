import React, { ReactNode } from 'react';

import { useSelector } from "react-redux";
import { selectedProjectSelector } from "../../../store/projectSlice";
import noModelsIcon from '../../../../../../assets/noModelsIcon.png';
import noModelsIconDark from '../../../../../../assets/noModelsIconDark.png';
import { ThemeSelector } from '../../../store/tabsAndMenuItemsSlice';

interface ModelsProps {
    children: ReactNode
}

export const Models: React.FC<ModelsProps> = ({ children }) => {

    const selectedProject = useSelector(selectedProjectSelector)
    const theme = useSelector(ThemeSelector)

    return (
        <>
            {(selectedProject && selectedProject.model?.components !== undefined)
                ? <div className="h-full flex flex-col">
                    {children}
                </div>
                : <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <img src={theme === 'light' ? noModelsIcon : noModelsIconDark} className="w-full mb-6" alt='No Models' />
                    <p className={`text-sm max-w-[200px] ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                        Use the icon from the Tool Bar to import a 3D CAD File.
                    </p>
                </div>
            }
        </>
    )

}
