import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  baseShapes,
  useAddToTheSceneANewShape,
} from './useAddToTheSceneANewShape';
import { shapesToolbarVisibilitySelector } from './shapesToolbarSlice';
import { iconForA } from './shapes';
import { toolbarIconsHeight, toolbarIconsWidth, toolbarsHintStyle } from '../../../../../config/styles';
import { setModality, cadmiaModalitySelector } from '../../../cadmiaModality/cadmiaModalitySlice';
import { useCadmiaModalityManager } from '../../../cadmiaModality/useCadmiaModalityManager';
import { ThemeSelector } from '../../../../../../esymia/store/tabsAndMenuItemsSlice';

export const ShapesToolbar: React.FC = () => {
  const shapesToolbarVisible = useSelector(shapesToolbarVisibilitySelector);
  const { addToTheSceneANew } = useAddToTheSceneANewShape();
  const { setOpacityNormalMode } = useCadmiaModalityManager()
  const dispatch = useDispatch()
  const theme = useSelector(ThemeSelector);
  const modality = useSelector(cadmiaModalitySelector);

  return (
    <>
      {shapesToolbarVisible && (
        <div className={`flex items-center gap-1 p-1 rounded-xl shadow-lg backdrop-blur-md border transition-all duration-300 ${theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-black/80 border-white/10'} ${modality === 'Grouping' ? 'opacity-50 pointer-events-none' : ''}`}>
          {baseShapes.map((shape) => (
            <div
              className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group hover:bg-gray-100 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
              onClick={() => {
                dispatch(setModality('NormalSelection'))
                let newComp = addToTheSceneANew(shape);
                setOpacityNormalMode(newComp.keyComponent)
              }}
              key={shape}
            >
              <div className="transform transition-transform duration-200">
                {iconForA(shape)}
              </div>
              <div className={toolbarsHintStyle}>
                <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap uppercase">
                  Add {shape}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
