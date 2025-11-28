import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import single_select from './style/single_select.svg';
import multiple_select from './style/multiple_select.png';
import { setModality } from '../cadmiaModality/cadmiaModalitySlice';
import { CadmiaModality } from '../cadmiaModality/cadmiaModalityType';
import {
  miscToolbarVisibilitySelector,
  multipleSelectionEntitiesKeysSelector,
} from './miscToolbarSlice';
import { useCadmiaModalityManager } from '../cadmiaModality/useCadmiaModalityManager';
import { toolbarIconsHeight, toolbarIconsWidth, toolbarsHintStyle } from '../../../config/styles';
import { resetFocusToScene } from '../navBar/menuItems/view/viewItemSlice';
import { TbZoomReset } from 'react-icons/tb';
import { addComponent, ComponentEntity, getNewKeys, numberOfGeneratedKeySelector, selectedComponentSelector } from '../../../../cad_library';
import { IoGridSharp } from 'react-icons/io5';

interface MiscToolbarProps {
  adaptGridsToScene: Function
}

export const MiscToolbar: React.FC<MiscToolbarProps> = ({ adaptGridsToScene }) => {
  const dispatch = useDispatch();
  const { miscToolbarOpsBasedOnModality } = useCadmiaModalityManager();
  const selectedComponent = useSelector(selectedComponentSelector);
  const miscToolbarVisible = useSelector(miscToolbarVisibilitySelector);
  const numberOfGeneratedKey = useSelector(numberOfGeneratedKeySelector);
  const multipleSelectionEntityKeys = useSelector(
    multipleSelectionEntitiesKeysSelector,
  );
  const [
    temporaryEntitiesForMultipleSelection,
    setTemporaryEntitiesForMultipleSelection,
  ] = useState(multipleSelectionEntityKeys);

  // useEffect(() => {
  //   if (
  //     temporaryEntitiesForMultipleSelection.length >
  //     multipleSelectionEntityKeys.length
  //   ) {
  //     const elements = temporaryEntitiesForMultipleSelection.filter(
  //       (el) => !multipleSelectionEntityKeys.includes(el),
  //     );
  //     dispatch(setComponentsOpacity({ keys: elements, opacity: 0.3 }));
  //   } else {
  //     const elements = multipleSelectionEntityKeys.filter(
  //       (el) => !temporaryEntitiesForMultipleSelection.includes(el),
  //     );
  //     dispatch(setComponentsOpacity({ keys: elements, opacity: 1 }));
  //   }
  //   setTemporaryEntitiesForMultipleSelection(multipleSelectionEntityKeys);
  // }, [multipleSelectionEntityKeys]);

  return (
    <>
      {miscToolbarVisible && (
        <div className="flex items-center gap-1 p-1 rounded-xl shadow-lg backdrop-blur-md bg-white/90 border border-gray-200 dark:bg-black/80 dark:border-white/10 transition-all duration-300">
          <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group hover:bg-gray-100 dark:hover:bg-white/10`}>
            <DocumentDuplicateIcon
              className="w-6 h-6 text-gray-700 dark:text-gray-300"
              onClick={() => {
                const newKey = getNewKeys(numberOfGeneratedKey, dispatch)[0];
                const clonedEntity = {
                  ...selectedComponent,
                  name: selectedComponent.name + newKey.toString(),
                  keyComponent: newKey,
                } as ComponentEntity;
                dispatch(addComponent(clonedEntity));
              }}
            />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                CLONE
              </span>
            </div>
          </div>
          <div
            className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group 
              ${miscToolbarOpsBasedOnModality.iconStyles.singleSelectionBackground.includes('bg-gray-300')
                ? 'bg-blue-500 text-white shadow-md'
                : 'hover:bg-gray-100 dark:hover:bg-white/10'}`}
            onClick={() =>
              dispatch(setModality('NormalSelection' as CadmiaModality))
            }
          >
            <img
              src={single_select}
              alt="Single selection"
              className={`w-6 h-6 ${miscToolbarOpsBasedOnModality.iconStyles.singleSelectionBackground.includes('bg-gray-300') ? 'brightness-0 invert' : ''}`}
            />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                SINGLE SELECTION
              </span>
            </div>
          </div>
          <div
            className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group
              ${miscToolbarOpsBasedOnModality.iconStyles.multipleSelectionBackground.includes('bg-gray-300')
                ? 'bg-blue-500 text-white shadow-md'
                : 'hover:bg-gray-100 dark:hover:bg-white/10'}`}
            onClick={() =>
              dispatch(setModality('MultipleSelection' as CadmiaModality))
            }
          >
            <img
              src={multiple_select}
              alt="Multiple selection"
              className={`w-6 h-6 ${miscToolbarOpsBasedOnModality.iconStyles.multipleSelectionBackground.includes('bg-gray-300') ? 'brightness-0 invert' : ''}`}
            />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                MULTIPLE SELECTION
              </span>
            </div>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-white/20 mx-1" />

          <div
            className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group hover:bg-gray-100 dark:hover:bg-white/10`}
            onClick={() =>
              dispatch(resetFocusToScene())
            }
          >
            <TbZoomReset className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                RESET FOCUS
              </span>
            </div>
          </div>
          <div
            className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group hover:bg-gray-100 dark:hover:bg-white/10`}
            onClick={() =>
              adaptGridsToScene()
            }
          >
            <IoGridSharp className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                ADAPT GRIDS
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
