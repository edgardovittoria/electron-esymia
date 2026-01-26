
import { useDispatch, useSelector } from 'react-redux';
import { setFocusNotToScene } from '../view/viewItemSlice';
import { addComponent, ComponentEntity, getDefaultCone, getDefaultCube, getDefaultCylinder, getDefaultSphere, getDefaultTorus, numberOfGeneratedKeySelector, canvasComponentsSelector } from '../../../../../../cad_library';
import { addNode, OperationType } from '../../../../../store/historySlice';
import uniqid from 'uniqid';

export const useAddToTheSceneANewShape = () => {
  const dispatch = useDispatch();
  const numberOfGeneratedKey = useSelector(numberOfGeneratedKeySelector);
  const components = useSelector(canvasComponentsSelector);

  const getNextNameIndex = (baseName: string): number => {
    let maxIndex = 0;
    const regex = new RegExp(`^${baseName} (\\d+)$`);
    components.forEach(c => {
      const match = c.name.match(regex);
      if (match) {
        const index = parseInt(match[1], 10);
        if (index > maxIndex) maxIndex = index;
      }
    });
    return maxIndex + 1;
  };

  const defaultNamedNew = (entity: ComponentEntity) => {
    let baseName = entity.name === 'CUBE' ? 'Cube' : entity.name;
    // Map internal types to specific display names if needed
    if (entity.name === 'SPHERE') baseName = 'Sphere';
    if (entity.name === 'CYLINDER') baseName = 'Cylinder';
    if (entity.name === 'CONE') baseName = 'Cone';
    if (entity.name === 'TORUS') baseName = 'Torus';

    // If the entity name is already formatted (e.g. "Brick"), respect that mapping
    // But hooks calls get... which returns generic names or "Brick"?
    // getDefaultCube usually returns name="CUBE"
    // The switch statement below passes "Brick" etc.
    // Let's rely on the switch case string generally, or map standard types.

    // Actually, look at lines 25-45: 
    // case 'Brick' -> getDefaultCube

    // Let's refine the base name mapping:
    switch (entity.name) {
      case 'CUBE': baseName = 'Cube'; break;
      case 'SPHERE': baseName = 'Sphere'; break;
      case 'CYLINDER': baseName = 'Cylinder'; break;
      case 'CONE': baseName = 'Cone'; break;
      case 'TORUS': baseName = 'Torus'; break;
      default: baseName = entity.name; // Fallback
    }

    const nextIndex = getNextNameIndex(baseName);
    entity.name = `${baseName} ${nextIndex}`;
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
      // ... rest of logic
      newComponent.historyId = historyId;

      dispatch(addNode({
        id: historyId,
        name: `Create ${newComponent.name}`, // Use the generated name in history too
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
