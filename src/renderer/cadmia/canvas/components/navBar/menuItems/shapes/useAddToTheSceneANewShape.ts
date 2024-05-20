import {
  ComponentEntity,
  addComponent,
  getDefaultCone,
  getDefaultCube,
  getDefaultCylinder,
  getDefaultSphere,
  getDefaultTorus,
  numberOfGeneratedKeySelector,
} from 'cad-library';
import { useDispatch, useSelector } from 'react-redux';
import { setFocusNotToScene } from '../view/viewItemSlice';

export const useAddToTheSceneANewShape = () => {
  const dispatch = useDispatch();
  const numberOfGeneratedKey = useSelector(numberOfGeneratedKeySelector);
  const defaultNamedNew = (entity: ComponentEntity) => {
    if(entity.name !== 'CUBE'){
      entity.name = `${entity.name}_${entity.keyComponent.toString()}`;
    }
    else{
      entity.name = `BRICK_${entity.keyComponent.toString()}`;
    }
    return entity;
  };
  const addToTheSceneANew = (shape: string) => {
    let newComponent = {} as ComponentEntity
    switch (shape) {
      case 'Brick':
        newComponent = defaultNamedNew(getDefaultCube(numberOfGeneratedKey, dispatch))
        break;
      case 'Cylinder':
        newComponent = defaultNamedNew(getDefaultCylinder(numberOfGeneratedKey, dispatch))
        break;
      case 'Cone':
        newComponent = defaultNamedNew(getDefaultCone(numberOfGeneratedKey, dispatch))
        break;
      case 'Sphere':
        newComponent = defaultNamedNew(getDefaultSphere(numberOfGeneratedKey, dispatch))
        break;
      case 'Torus':
        newComponent = defaultNamedNew(getDefaultTorus(numberOfGeneratedKey, dispatch))
        break;
      default:
        break;
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
