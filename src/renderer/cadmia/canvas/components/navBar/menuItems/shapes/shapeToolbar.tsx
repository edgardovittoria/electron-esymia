import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  baseShapes,
  useAddToTheSceneANewShape,
} from './useAddToTheSceneANewShape';
import { shapesToolbarVisibilitySelector } from './shapesToolbarSlice';
import { iconForA } from './shapes';
import { toolbarIconsHeight, toolbarIconsWidth, toolbarsHintStyle } from '../../../../../config/styles';
import { setModality } from '../../../cadmiaModality/cadmiaModalitySlice';
import { useCadmiaModalityManager } from '../../../cadmiaModality/useCadmiaModalityManager';

export const ShapesToolbar: React.FC = () => {
  const shapesToolbarVisible = useSelector(shapesToolbarVisibilitySelector);
  const { addToTheSceneANew } = useAddToTheSceneANewShape();
  const { setOpacityNormalMode } = useCadmiaModalityManager()
  const dispatch = useDispatch()
  return (
    <>
      {shapesToolbarVisible && (
        <div className={`flex items-center gap-1 p-1 rounded-xl shadow-lg backdrop-blur-md bg-white/90 border border-gray-200 dark:bg-black/80 dark:border-white/10 transition-all duration-300`}>
          {baseShapes.map((shape) => (
            <div
              className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group hover:bg-blue-500 hover:text-white hover:shadow-md`}
              onClick={() => {
                dispatch(setModality('NormalSelection'))
                let newComp = addToTheSceneANew(shape);
                setOpacityNormalMode(newComp.keyComponent)
              }}
              key={shape}
            >
              <div className="transform transition-transform duration-200 group-hover:scale-110">
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
