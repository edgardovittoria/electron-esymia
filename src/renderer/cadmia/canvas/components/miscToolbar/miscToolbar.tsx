import React, { useEffect, useState } from 'react';
// Force rebuild
import { useDispatch, useSelector } from 'react-redux';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import single_select from './style/single_select.svg';
import multiple_select from './style/multiple_select.png';
import { setModality } from '../cadmiaModality/cadmiaModalitySlice';
import { CadmiaModality } from '../cadmiaModality/cadmiaModalityType';
import {
  miscToolbarVisibilitySelector,
  multipleSelectionEntitiesKeysSelector,
  resetMultipleSelectionEntities,
} from './miscToolbarSlice';
import { useCadmiaModalityManager } from '../cadmiaModality/useCadmiaModalityManager';
import { cadmiaModalitySelector } from '../cadmiaModality/cadmiaModalitySlice';
import { toolbarIconsHeight, toolbarIconsWidth, toolbarsHintStyle } from '../../../config/styles';
import { resetFocusToScene } from '../navBar/menuItems/view/viewItemSlice';
import { TbZoomReset, TbRuler, TbGridDots, TbCircleDotted, TbLayersDifference, TbLayersUnion, TbLayersSubtract } from 'react-icons/tb';
import { addComponent, binaryOperation, ComponentEntity, componentseSelector, getNewKeys, numberOfGeneratedKeySelector, selectedComponentSelector, TransformationParams, updateTransformationParams, replaceComponentWithMultipleEntities, ungroupEntity, updateOpacityRecursively } from '../../../../cad_library';
import { IoGridSharp } from 'react-icons/io5';
import { ThemeSelector } from '../../../../esymia/store/tabsAndMenuItemsSlice';
import { LinearArrayModal } from './modals/LinearArrayModal';
import { CircularArrayModal } from './modals/CircularArrayModal';
import { MirrorModal } from './modals/MirrorModal';
import { BiReflectHorizontal } from 'react-icons/bi';
import { TbArrowsMinimize, TbArrowsMaximize } from 'react-icons/tb';
import { getCenterOfEntities } from '../../../../cad_library/components/auxiliaryFunctionsUsingThree/patterningUtilities';
import { addNode } from '../../../store/historySlice';
import uniqid from 'uniqid';

interface MiscToolbarProps {
  adaptGridsToScene: Function
}

export const MiscToolbar: React.FC<MiscToolbarProps> = ({ adaptGridsToScene }) => {
  const dispatch = useDispatch();
  const { miscToolbarOpsBasedOnModality } = useCadmiaModalityManager();
  const modality = useSelector(cadmiaModalitySelector);
  const selectedComponent = useSelector(selectedComponentSelector);
  const components = useSelector(componentseSelector);
  const miscToolbarVisible = useSelector(miscToolbarVisibilitySelector);
  const numberOfGeneratedKey = useSelector(numberOfGeneratedKeySelector);
  const multipleSelectionEntityKeys = useSelector(
    multipleSelectionEntitiesKeysSelector,
  );
  const [
    temporaryEntitiesForMultipleSelection,
    setTemporaryEntitiesForMultipleSelection,
  ] = useState(multipleSelectionEntityKeys);

  const [showLinearArrayModal, setShowLinearArrayModal] = useState(false);
  const [showCircularArrayModal, setShowCircularArrayModal] = useState(false);
  const [showMirrorModal, setShowMirrorModal] = useState(false);

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

  const theme = useSelector(ThemeSelector);
  const disabledStyle = modality === 'Grouping' ? 'opacity-50 pointer-events-none' : '';

  return (
    <>
      {miscToolbarVisible && (
        <div className={`flex items-center gap-1 p-1 rounded-xl shadow-lg backdrop-blur-md border transition-all duration-300 ${theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-black/80 border-white/10'}`}>
          <div
            className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group 
              ${modality === 'NormalSelection'
                ? 'bg-blue-500 text-white shadow-md'
                : `${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`} ${disabledStyle}`}
            onClick={() =>
              dispatch(setModality('NormalSelection' as CadmiaModality))
            }
          >
            <img
              src={single_select}
              alt="Single selection"
              className={`w-6 h-6 ${modality === 'NormalSelection' || theme !== 'light' ? 'brightness-0 invert' : ''}`}
            />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                SINGLE SELECTION
              </span>
            </div>
          </div>
          <div
            className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group
              ${modality === 'MultipleSelection'
                ? 'bg-blue-500 text-white shadow-md'
                : `${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`} ${disabledStyle}`}
            onClick={() =>
              dispatch(setModality('MultipleSelection' as CadmiaModality))
            }
          >
            <img
              src={multiple_select}
              alt="Multiple selection"
              className={`w-6 h-6 ${modality === 'MultipleSelection' || theme !== 'light' ? 'brightness-0 invert' : ''}`}
            />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                MULTIPLE SELECTION
              </span>
            </div>
          </div>
          <div className={`w-px h-6 mx-1 ${theme === 'light' ? 'bg-gray-300' : 'bg-white/20'}`} />

          <div
            className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'} ${disabledStyle}`}
            onClick={() =>
              dispatch(resetFocusToScene())
            }
          >
            <TbZoomReset className={`w-6 h-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`} />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                RESET FOCUS
              </span>
            </div>
          </div>
          <div
            className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'} ${disabledStyle}`}
            onClick={() =>
              adaptGridsToScene()
            }
          >
            <IoGridSharp className={`w-6 h-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`} />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                ADAPT GRIDS
              </span>
            </div>
          </div>


          <div className={`w-px h-6 mx-1 ${theme === 'light' ? 'bg-gray-300' : 'bg-white/20'}`} />

          <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'} ${disabledStyle}`}>
            <DocumentDuplicateIcon
              className={`w-6 h-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
              onClick={() => {
                const newKey = getNewKeys(numberOfGeneratedKey, dispatch)[0];
                const clonedEntity = {
                  ...selectedComponent,
                  name: selectedComponent.name + newKey.toString(),
                  keyComponent: newKey,
                } as ComponentEntity;
                dispatch(addComponent(clonedEntity));
                dispatch(addNode({
                  id: uniqid(),
                  name: `Clone ${selectedComponent.name}`,
                  type: 'CLONE',
                  params: {},
                  timestamp: Date.now(),
                  outputKey: newKey,
                  inputKeys: [selectedComponent.keyComponent],
                  suppressed: false
                }));
              }}
            />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                CLONE
              </span>
            </div>
          </div>
          <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'} ${disabledStyle}`}
            onClick={() => setShowLinearArrayModal(true)}
          >
            <TbGridDots className={`w-6 h-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`} />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                LINEAR ARRAY
              </span>
            </div>
          </div>

          {/* <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'} ${disabledStyle}`}
            onClick={() => setShowCircularArrayModal(true)}
          >
            <TbCircleDotted className={`w-6 h-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`} />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                CIRCULAR ARRAY
              </span>
            </div>
          </div> */}

          {/* <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'} ${disabledStyle}`}
            onClick={() => setShowMirrorModal(true)}
          >
            <BiReflectHorizontal className={`w-6 h-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`} />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                MIRROR
              </span>
            </div>
          </div>*/}

          <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'} ${disabledStyle}`}
            onClick={() => {
              let entitiesToCenter: ComponentEntity[] = [];
              if (multipleSelectionEntityKeys.length > 0) {
                entitiesToCenter = components.filter(c => multipleSelectionEntityKeys.includes(c.keyComponent));
              } else if (selectedComponent) {
                entitiesToCenter = [selectedComponent as ComponentEntity];
              }

              if (entitiesToCenter.length > 0) {
                const center = getCenterOfEntities(entitiesToCenter);
                // We want to move the group so that 'center' becomes (0,0,0).
                // So we subtract 'center' from each entity's position.
                entitiesToCenter.forEach(entity => {
                  const currentPos = entity.transformationParams.position;
                  const newPos = [
                    currentPos[0] - center.x,
                    currentPos[1] - center.y,
                    currentPos[2] - center.z
                  ] as [number, number, number];

                  dispatch(updateTransformationParams({
                    ...entity.transformationParams,
                    position: newPos
                  }));
                });

                dispatch(addNode({
                  id: uniqid(),
                  name: 'Center Selection',
                  type: 'CENTER_SELECTION',
                  params: { center: { x: center.x, y: center.y, z: center.z } },
                  timestamp: Date.now(),
                  outputKey: 0, // No single output key for this operation
                  inputKeys: entitiesToCenter.map(e => e.keyComponent),
                  suppressed: false
                }));
              }
            }}
          >
            <TbArrowsMinimize className={`w-6 h-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`} />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                CENTER SELECTION
              </span>
            </div>
          </div>

          <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group 
            ${modality === 'Grouping' ? 'bg-blue-500 text-white shadow-md' : (theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10')}`}
            onClick={() => {
              if (modality === 'Grouping') {
                // Confirm grouping
                let entitiesToGroup: ComponentEntity[] = [];
                if (multipleSelectionEntityKeys.length > 0) {
                  entitiesToGroup = components.filter(c => multipleSelectionEntityKeys.includes(c.keyComponent));
                }

                if (entitiesToGroup.length > 0) {
                  const center = getCenterOfEntities(entitiesToGroup);
                  const newKey = getNewKeys(numberOfGeneratedKey, dispatch)[0];

                  const groupEntity: ComponentEntity = {
                    type: 'GROUP',
                    name: `GROUP_${newKey}`,
                    keyComponent: newKey,
                    orbitEnabled: true,
                    transformationParams: {
                      position: [center.x, center.y, center.z],
                      rotation: [0, 0, 0],
                      scale: [1, 1, 1]
                    },
                    previousTransformationParams: {
                      position: [center.x, center.y, center.z],
                      rotation: [0, 0, 0],
                      scale: [1, 1, 1]
                    },
                    geometryAttributes: {},
                    transparency: false,
                    opacity: 1,
                    children: entitiesToGroup.map(entity => {
                      const currentPos = entity.transformationParams.position;
                      const updatedEntity = updateOpacityRecursively(entity, 1);
                      return {
                        ...updatedEntity,
                        transformationParams: {
                          ...updatedEntity.transformationParams,
                          position: [
                            currentPos[0] - center.x,
                            currentPos[1] - center.y,
                            currentPos[2] - center.z
                          ]
                        }
                      }
                    })
                  } as any;

                  dispatch(binaryOperation({
                    elementsToRemove: entitiesToGroup.map(e => e.keyComponent),
                    newEntity: groupEntity
                  }));

                  dispatch(addNode({
                    id: uniqid(),
                    name: `Group ${newKey}`,
                    type: 'GROUP',
                    params: {},
                    timestamp: Date.now(),
                    outputKey: newKey,
                    inputKeys: entitiesToGroup.map(e => e.keyComponent),
                    suppressed: false
                  }));
                }

                dispatch(resetMultipleSelectionEntities());
                dispatch(setModality('NormalSelection' as CadmiaModality));
              } else {
                // Enter grouping mode
                dispatch(resetMultipleSelectionEntities());
                dispatch(setModality('Grouping' as CadmiaModality));
              }
            }}
          >
            <TbLayersUnion className={`w-6 h-6 ${modality === 'Grouping' ? 'text-white' : (theme === 'light' ? 'text-gray-700' : 'text-gray-300')}`} />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                {modality === 'Grouping' ? 'CONFIRM GROUP' : 'GROUP'}
              </span>
            </div>
          </div>

          {selectedComponent && selectedComponent.type === 'GROUP' && (
            <div className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'} ${disabledStyle}`}
              onClick={() => {
                const newEntities = ungroupEntity(selectedComponent);
                dispatch(replaceComponentWithMultipleEntities({
                  keyToRemove: selectedComponent.keyComponent,
                  newEntities: newEntities
                }));

                dispatch(addNode({
                  id: uniqid(),
                  name: `Ungroup ${selectedComponent.name}`,
                  type: 'UNGROUP',
                  params: {},
                  timestamp: Date.now(),
                  outputKey: 0, // Multiple outputs, handled by re-execution logic or we can store them in params
                  inputKeys: [selectedComponent.keyComponent],
                  suppressed: false
                }));
              }}
            >
              <TbLayersSubtract className={`w-6 h-6 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`} />
              <div className={toolbarsHintStyle}>
                <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                  UNGROUP
                </span>
              </div>
            </div>
          )}

          <div
            className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 cursor-pointer group 
              ${modality === 'Measurement'
                ? 'bg-blue-500 text-white shadow-md'
                : `${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`} ${disabledStyle}`}
            onClick={() =>
              dispatch(setModality(modality === 'Measurement' ? 'NormalSelection' : 'Measurement'))
            }
          >
            <TbRuler className={`w-6 h-6 ${modality === 'Measurement' ? 'text-white' : (theme === 'light' ? 'text-gray-700' : 'text-gray-300')}`} />
            <div className={toolbarsHintStyle}>
              <span className="relative z-10 px-2 py-1 text-xs font-medium text-white bg-black/80 backdrop-blur-sm shadow-lg rounded-md whitespace-nowrap">
                RULER
              </span>
            </div>
          </div>
        </div>
      )}
      <LinearArrayModal isOpen={showLinearArrayModal} onClose={() => setShowLinearArrayModal(false)} />
      <CircularArrayModal isOpen={showCircularArrayModal} onClose={() => setShowCircularArrayModal(false)} />
      <MirrorModal isOpen={showMirrorModal} onClose={() => setShowMirrorModal(false)} />
    </>
  );
};
