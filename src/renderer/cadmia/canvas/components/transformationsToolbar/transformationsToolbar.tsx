import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { setTransformationActive, transformationsSelector, transformationsToolbarVisibilitySelector } from "./toolbarTransformationSlice";
import TranslationIcon from './style/translationIcon.png'
import RotationIcon from './style/rotationIcon.png'
import ScaleIcon from './style/scaleIcon.png'
import { TransformationType } from './transformationsTypes';
import { toolbarIconsHeight, toolbarIconsWidth, toolbarsHintStyle } from '../../../config/styles';
import { ThemeSelector } from '../../../../esymia/store/tabsAndMenuItemsSlice';
import { cadmiaModalitySelector } from '../cadmiaModality/cadmiaModalitySlice';


interface TransformationsToolBarProps {
}

export const TransformationsToolBar: React.FC<TransformationsToolBarProps> = () => {
    const getIconFor = (transformationType: TransformationType) => {
        switch (transformationType) {
            case 'translate':
                return TranslationIcon
            case 'rotate':
                return RotationIcon
            case 'scale':
                return ScaleIcon
            default:
                break;
        }
    }
    const transformations = useSelector(transformationsSelector)
    const dispatch = useDispatch();
    const transformationsToolbarVisible = useSelector(transformationsToolbarVisibilitySelector)
    const theme = useSelector(ThemeSelector);
    const modality = useSelector(cadmiaModalitySelector);

    return (
        <>
            {transformationsToolbarVisible &&
                <div className={`flex items-center gap-1 p-1 rounded-xl shadow-lg backdrop-blur-md border transition-all duration-300 ${theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-black/80 border-white/10'} ${modality === 'Grouping' ? 'opacity-50 pointer-events-none' : ''}`}>
                    {transformations.map((transformation, index) => {
                        return (
                            <div key={index} className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group
                             ${transformation.active
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : `${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}`}
                                onClick={() => dispatch(setTransformationActive(transformation.type))}
                            >
                                <img src={getIconFor(transformation.type)} alt={transformation.type}
                                    className={`w-6 h-6 transition-all duration-200 ${transformation.active || theme !== 'light' ? 'brightness-0 invert' : ''}`}
                                />
                                <div className={toolbarsHintStyle}>
                                    <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                                        {transformation.type}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            }
        </>
    )
}
