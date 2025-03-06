import { Dispatch } from '@reduxjs/toolkit';
import { getNewKeys, getRisCube } from '../baseShapes/shapes/cube/cube';
import {
  BufferGeometryAttributes,
  ComponentEntity,
  TRANSF_PARAMS_DEFAULTS,
} from '../model/componentEntity/componentEntity';
import {
  addComponent,
  importStateCanvas,
  CanvasState,
} from '../store/canvas/canvasSlice';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { setFocusNotToScene } from '../../../cadmia/canvas/components/navBar/menuItems/view/viewItemSlice';
import { isRisModelValid, RisBox } from './checkRisImport';

//TODO: change importFromCadSTL to make it working in any case, not only for the CAD.
export const importFromCadSTL = (
  STLFile: File,
  numberOfGeneratedKey: number,
  dispatch: Dispatch,
) => {
  let loader = new STLLoader();

  STLFile.arrayBuffer().then((value) => {
    let res = loader.parse(value);
    let entity: ComponentEntity = {
      type: 'BUFFER',
      name: 'BUFFER',
      keyComponent: getNewKeys(numberOfGeneratedKey, dispatch)[0],
      orbitEnabled: true,
      transformationParams: TRANSF_PARAMS_DEFAULTS,
      previousTransformationParams: TRANSF_PARAMS_DEFAULTS,
      geometryAttributes: {
        positionVertices: res.attributes.position.array,
        normalVertices: res.attributes.normal.array,
        uvVertices: undefined,
      } as BufferGeometryAttributes,
      transparency: true,
      opacity: 1,
    };
    dispatch(addComponent(entity));
  });
};

export const importFromCadProject = (
  file: File,
  dispatch: Dispatch,
  action: (params: ImportActionParamsObject) => any,
  actionParamsObject: ImportActionParamsObject,
) => {
  file.text().then((value) => {
    actionParamsObject.canvas = JSON.parse(value);
    dispatch(action(actionParamsObject));
  });
};

export const importRisGeometry = (
  file: File,
  dispatch: Dispatch,
  numberOfGeneratedKey: number,
) => {
  file.text().then((value) => {
    let { geometry, isModelValid, message } = isRisModelValid(value)
    if (isModelValid) {
      let data: number[][] = geometry.map((box: RisBox) => [box.xMin, box.xMax, box.yMin, box.yMax, box.zMin, box.zMax]);
      const key = getNewKeys(numberOfGeneratedKey, dispatch, data.length);
      data.forEach((item, index) => {
        let cube = getRisCube(key[index], dispatch, item);
        dispatch(addComponent(cube));
      });
      dispatch(setFocusNotToScene());
    }
    else{
      window.alert(message);
    }
  });
};

export type ImportActionParamsObject = {
  canvas: CanvasState;
  id: string | undefined;
  unit: string;
  modelS3?: string;
  bricks?: string;
};
