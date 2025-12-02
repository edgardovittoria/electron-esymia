
import { useDispatch, useSelector } from 'react-redux';
import { setFocusNotToScene } from '../view/viewItemSlice';
import { addComponent, ComponentEntity, getDefaultCone, getDefaultCube, getDefaultCylinder, getDefaultSphere, getDefaultTorus, numberOfGeneratedKeySelector } from '../../../../../../cad_library';
import { addNode, OperationType } from '../../../../../store/historySlice';
import uniqid from 'uniqid';

export const useAddToTheSceneANewShape = () => {
  const dispatch = useDispatch();
  const numberOfGeneratedKey = useSelector(numberOfGeneratedKeySelector);
  const defaultNamedNew = (entity: ComponentEntity) => {
    if (entity.name !== 'CUBE') {
      entity.name = `${entity.name}_${entity.keyComponent.toString()}`;
    }
    else {
      entity.name = `BRICK_${entity.keyComponent.toString()}`;
    }
    return entity;
  };
  const addToTheSceneANew = (shape: string) => {
    let newComponent = {} as ComponentEntity
    let operationType: OperationType | undefined;

    switch (shape) {
      case 'Brick':
        newComponent = defaultNamedNew(getDefaultCube(numberOfGeneratedKey, dispatch))
        operationType = 'CREATE_CUBE';
        break;
      case 'Cylinder':
        newComponent = defaultNamedNew(getDefaultCylinder(numberOfGeneratedKey, dispatch))
        operationType = 'CREATE_CYLINDER';
        break;
      case 'Cone':
        newComponent = defaultNamedNew(getDefaultCone(numberOfGeneratedKey, dispatch))
        operationType = 'CREATE_CONE';
        break;
      case 'Sphere':
        newComponent = defaultNamedNew(getDefaultSphere(numberOfGeneratedKey, dispatch))
        operationType = 'CREATE_SPHERE';
        break;
      case 'Torus':
        newComponent = defaultNamedNew(getDefaultTorus(numberOfGeneratedKey, dispatch))
        operationType = 'CREATE_TORUS';
        break;
      default:
        break;
    }

    if (operationType) {
      const historyId = uniqid();
      newComponent.historyId = historyId;

      dispatch(addNode({
        id: historyId,
        name: `Create ${shape}`,
        type: operationType,
        params: newComponent.geometryAttributes,
        timestamp: Date.now(),
        outputKey: newComponent.keyComponent,
        inputKeys: [],
        suppressed: false
      }));
    }

    dispatch(addComponent(newComponent))
    dispatch(setFocusNotToScene());
    return newComponent
  };
  return { addToTheSceneANew };
};

export const baseShapes: string[] = [
  'Brick',
  'Sphere',
  'Cylinder',
  'Torus',
  'Cone',
];
