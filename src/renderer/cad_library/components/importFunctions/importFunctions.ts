import { Dispatch } from "@reduxjs/toolkit";
import { getNewKeys, getRisCube } from "../baseShapes/shapes/cube/cube";
import { BufferGeometryAttributes, ComponentEntity, TRANSF_PARAMS_DEFAULTS } from "../model/componentEntity/componentEntity";
import { addComponent, importStateCanvas, CanvasState } from "../store/canvas/canvasSlice";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { setFocusNotToScene } from "../../../cadmia/canvas/components/navBar/menuItems/view/viewItemSlice";

//TODO: change importFromCadSTL to make it working in any case, not only for the CAD.
export const importFromCadSTL = (STLFile: File, numberOfGeneratedKey: number, dispatch: Dispatch) => {
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
                uvVertices: undefined
            } as BufferGeometryAttributes,
            transparency: true,
            opacity: 1
        }
        dispatch(addComponent(entity))
    })
}

export const importFromCadProject = (file: File, dispatch: Dispatch, action: (params: ImportActionParamsObject) => any, actionParamsObject: ImportActionParamsObject) => {
    file.text().then((value) => {
        actionParamsObject.canvas = JSON.parse(value)
        dispatch(action(actionParamsObject))
    })
}

export const importRisGeometry = (file: File, dispatch: Dispatch, numberOfGeneratedKey: number) => {
  file.text().then((value) => {
      let data:number[][] = JSON.parse(value).ris_geometry
      const key = getNewKeys(numberOfGeneratedKey, dispatch, data.length)
      data.forEach((item, index) => {
        let cube = getRisCube(key[index], dispatch, item)
        dispatch(addComponent(cube))
      })
      dispatch(setFocusNotToScene());
  })
}

export type ImportActionParamsObject = {
    canvas: CanvasState,
    id: string | undefined,
    unit: string,
    modelS3?: string
}
