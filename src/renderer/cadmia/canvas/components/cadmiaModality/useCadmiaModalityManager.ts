import { useDispatch, useSelector } from 'react-redux';
import { cadmiaModalitySelector, setModality } from './cadmiaModalitySlice';
import {
  Material,
  componentseSelector,
  removeComponent,
  removeComponentMaterial,
  selectComponent,
  selectedComponentSelector,
  setComponentMaterial,
  setComponentsOpacity,
} from 'cad-library';
import {
  binaryOpEntitiesKeysSelector,
  toggleEntitySelectionForBinaryOp,
} from '../binaryOperationsToolbar/binaryOperationsToolbarSlice';
import {
  multipleSelectionEntitiesKeysSelector,
  toggleEntitySelectionForMultipleSelection,
} from '../miscToolbar/miscToolbarSlice';
import { useEffect } from 'react';
import {
  invisibleMeshesSelector,
  setMeshInvisible,
  setMeshVisible,
} from '../objectsDetailsBar/objectsDetailsSlice';

export const useCadmiaModalityManager = () => {
  const modality = useSelector(cadmiaModalitySelector);
  const dispatch = useDispatch();
  const selectedComponent = useSelector(selectedComponentSelector);
  const multipleSelectionEntityKeys = useSelector(
    multipleSelectionEntitiesKeysSelector,
  );
  const binaryOpsEntityKeys = useSelector(binaryOpEntitiesKeysSelector);
  const components = useSelector(componentseSelector);
  const invisibleMeshes = useSelector(invisibleMeshesSelector);

  const setOpacityNormalMode = (newSelectedComponent: number) => {
    dispatch(
      setComponentsOpacity({
        keys: components
          .filter((c) => c.keyComponent !== newSelectedComponent)
          .map((c) => c.keyComponent),
        opacity: 0.3,
      }),
    );
    dispatch(
      setComponentsOpacity({ keys: [newSelectedComponent], opacity: 1 }),
    );
  };

  const clickActions = (keyComponent: number) => {
    if (modality === 'NormalSelection') {
      (!selectedComponent || selectedComponent.keyComponent !== keyComponent) &&
        dispatch(selectComponent(keyComponent));
      setOpacityNormalMode(keyComponent);
    } else if (modality === 'BinaryOperation') {
      if (!invisibleMeshes.includes(keyComponent)) {
        let componentWillBeSelected =
          !binaryOpsEntityKeys.includes(keyComponent);
        dispatch(toggleEntitySelectionForBinaryOp(keyComponent));
        dispatch(
          setComponentsOpacity({
            keys: [keyComponent],
            opacity: componentWillBeSelected ? 1 : 0.3,
          }),
        );
      }
    } else if (modality === 'MultipleSelection') {
      if (!invisibleMeshes.includes(keyComponent)) {
        let componentWillBeSelected =
          !multipleSelectionEntityKeys.includes(keyComponent);
        dispatch(toggleEntitySelectionForMultipleSelection(keyComponent));
        dispatch(
          setComponentsOpacity({
            keys: [keyComponent],
            opacity: componentWillBeSelected ? 1 : 0.3,
          }),
        );
      }
    }
  };

  const canvasObjectOpsBasedOnModality = {
    onClickAction: clickActions,
  };

  const meshHidingActionBasedOnModality = (keyComponent: number) => {
    if (modality === 'NormalSelection') {
      dispatch(setMeshInvisible(keyComponent));
    } else if (modality === 'BinaryOperation') {
      binaryOpsEntityKeys.includes(keyComponent) &&
        dispatch(toggleEntitySelectionForBinaryOp(keyComponent));
      dispatch(setMeshInvisible(keyComponent));
    } else if (modality === 'MultipleSelection') {
      multipleSelectionEntityKeys.includes(keyComponent) &&
        dispatch(toggleEntitySelectionForMultipleSelection(keyComponent));
      dispatch(setMeshInvisible(keyComponent));
    }
  };

  const meshUnhidingActionBasedOnModality = (keyComponent: number) => {
    if (modality === 'NormalSelection') {
      dispatch(setMeshVisible(keyComponent));
    } else if (modality === 'BinaryOperation') {
      dispatch(setComponentsOpacity({ keys: [keyComponent], opacity: 0.3 }));
      dispatch(setMeshVisible(keyComponent));
    } else if (modality === 'MultipleSelection') {
      dispatch(setComponentsOpacity({ keys: [keyComponent], opacity: 0.3 }));
      dispatch(setMeshVisible(keyComponent));
    }
  };

  const miscToolbarOpsBasedOnModality = {
    iconStyles: {
      singleSelectionBackground:
        modality === 'NormalSelection' ? 'bg-gray-400' : 'bg-white',
      multipleSelectionBackground:
        modality === 'MultipleSelection' ? 'bg-gray-400' : 'bg-white',
    },
  };

  const objectsDetailsOptsBasedOnModality = {
    elementsVisibility: {
      transformations: modality !== 'MultipleSelection' ? true : false,
      geometryParams: modality !== 'MultipleSelection' ? true : false,
      borders: modality !== 'MultipleSelection' ? true : false,
    },
    outliner: {
      onClickItemAction: clickActions,
      isItemSelected: (keyComponent: number) => {
        if (modality === 'NormalSelection') {
          return selectedComponent
            ? selectedComponent.keyComponent === keyComponent
            : false;
        } else if (modality === 'BinaryOperation') {
          return binaryOpsEntityKeys.includes(keyComponent);
        } else if (modality === 'MultipleSelection') {
          return multipleSelectionEntityKeys.includes(keyComponent);
        }
      },
    },
    deleteButton: {
      messages: (keyComponentToDelete: number) => {
        return modality !== 'MultipleSelection'
          ? {
              popup: `Sei sicuro di voler eliminare il componente ${components.filter((c) => c.keyComponent === keyComponentToDelete)[0].name} ?`,
              buttonLabel: `Delete ${components.filter((c) => c.keyComponent === keyComponentToDelete)[0].name}`,
            }
          : {
              popup: `Sei sicuro di voler eliminare i componenti selezionati?`,
              buttonLabel: 'Delete components',
            };
      },
      onClickAction: (keyComponentToDelete: number) => {
        if (modality !== 'MultipleSelection') {
          selectedComponent && dispatch(removeComponent(keyComponentToDelete));
        } else {
          multipleSelectionEntityKeys.forEach((key) =>
            dispatch(removeComponent(key)),
          );
        }
        dispatch(setModality('NormalSelection'));
      },
      visibility: (keyComponent: number) =>
        modality === 'MultipleSelection' &&
        !multipleSelectionEntityKeys.includes(keyComponent)
          ? false
          : true,
    },
    material: {
      setMaterial: (material: Material) =>
        modality !== 'MultipleSelection'
          ? dispatch(
              setComponentMaterial({
                key: selectedComponent.keyComponent,
                material: material,
              }),
            )
          : multipleSelectionEntityKeys.forEach((key) =>
              dispatch(setComponentMaterial({ key: key, material: material })),
            ),
      unsetMaterial: () =>
        modality !== 'MultipleSelection'
          ? dispatch(
              removeComponentMaterial({
                keyComponent: selectedComponent.keyComponent,
              }),
            )
          : multipleSelectionEntityKeys.forEach((key) =>
              dispatch(removeComponentMaterial({ keyComponent: key })),
            ),
    },
  };

  const useBaseSetupBasedOnModality = () => {
    const modality = useSelector(cadmiaModalitySelector);
    const selectedComponent = useSelector(selectedComponentSelector);
    const components = useSelector(componentseSelector);
    useEffect(() => {
      let componentKeys = components.reduce((keys: number[], component) => {
        keys.push(component.keyComponent);
        return keys;
      }, []);
      if (modality === 'BinaryOperation' || modality === 'MultipleSelection') {
        dispatch(setComponentsOpacity({ keys: componentKeys, opacity: 0.3 }));
      } else if (modality === 'NormalSelection') {
        dispatch(setComponentsOpacity({ keys: componentKeys, opacity: 0.3,}));
        (selectedComponent) && dispatch(setComponentsOpacity({ keys: [selectedComponent.keyComponent], opacity: 1,}));
      }
    }, [modality]);
  };

  return {
    canvasObjectOpsBasedOnModality,
    miscToolbarOpsBasedOnModality,
    objectsDetailsOptsBasedOnModality,
    useBaseOpactityBasedOnModality: useBaseSetupBasedOnModality,
    setOpacityNormalMode,
    meshHidingActionBasedOnModality,
    meshUnhidingActionBasedOnModality,
  };
};
