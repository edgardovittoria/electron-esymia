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

export const MiscToolbar: React.FC<MiscToolbarProps> = ({adaptGridsToScene}) => {
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
        <div className="gap-0 text-center shadow grid grid-cols-5">
          <div className={`relative flex flex-col items-center justify-center ${toolbarIconsHeight} ${toolbarIconsWidth} p-1 group bg-white`}>
            <DocumentDuplicateIcon
              className="w-8 h-8"
              onClick={() => {
                const newKey = getNewKeys(numberOfGeneratedKey, dispatch)[0];
                const clonedEntity = {
                  ...selectedComponent,
                  name: selectedComponent.name+newKey.toString(),
                  keyComponent: newKey,
                } as ComponentEntity;
                dispatch(addComponent(clonedEntity));
              }}
            />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 p-2 leading-none text-white whitespace-no-wrap bg-black shadow-lg rounded-md">
                CLONE
              </span>
            </div>
          </div>
          <div
            className={`relative flex flex-col items-center justify-center ${toolbarIconsHeight} ${toolbarIconsWidth} p-1 group ${miscToolbarOpsBasedOnModality.iconStyles.singleSelectionBackground}`}
            onClick={() =>
              dispatch(setModality('NormalSelection' as CadmiaModality))
            }
          >
            <img
              src={single_select}
              alt="Single selection"
              className="w-8 h-8"
            />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 p-2 leading-none text-white whitespace-no-wrap bg-black shadow-lg rounded-md">
                SINGLE SELECTION
              </span>
            </div>
          </div>
          <div
            className={`relative flex flex-col items-center justify-center ${toolbarIconsHeight} ${toolbarIconsWidth} p-1 group ${miscToolbarOpsBasedOnModality.iconStyles.multipleSelectionBackground}`}
            onClick={() =>
              dispatch(setModality('MultipleSelection' as CadmiaModality))
            }
          >
            <img
              src={multiple_select}
              alt="Multiple selection"
              className="w-8 h-8"
            />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 p-2 leading-none text-white whitespace-no-wrap bg-black shadow-lg rounded-md">
                MULTIPLE SELECTION
              </span>
            </div>
          </div>
          <div
            className={`relative flex flex-col items-center justify-center ${toolbarIconsHeight} ${toolbarIconsWidth} p-1 group bg-white`}
            onClick={() =>
              dispatch(resetFocusToScene())
            }
          >
            <TbZoomReset className="w-8 h-8 text-black"/>
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 p-2 leading-none text-white whitespace-no-wrap bg-black shadow-lg rounded-md">
                RESET SCENE FOCUS
              </span>
            </div>
          </div>
          <div
            className={`relative flex flex-col items-center justify-center ${toolbarIconsHeight} ${toolbarIconsWidth} p-1 group bg-white`}
            onClick={() =>
              adaptGridsToScene()
            }
          >
            <IoGridSharp className="w-8 h-8 text-black"/>
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 p-2 leading-none text-white whitespace-no-wrap bg-black shadow-lg rounded-md">
                ADAPT GRIDS TO SCENE
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
