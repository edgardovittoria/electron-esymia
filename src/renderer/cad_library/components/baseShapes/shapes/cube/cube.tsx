import { Dispatch } from "@reduxjs/toolkit";
import { FC, } from "react";
import "@react-three/fiber"
import { incrementNumberOfGeneratedKey } from "../../../store/canvas/canvasSlice";
import { ComponentEntity, CubeGeometryAttributes, TRANSF_PARAMS_DEFAULTS } from "../../../model/componentEntity/componentEntity";

interface CubeProps {
    color: string,
    width: number,
    height: number,
    depth: number,
    widthSegments?: number,
    heigthSegments?: number,
    depthSegments?: number,
    opacity: number,
    transparency: boolean
}

export function getNewKeys(numberOfGeneratedKey: number, dispatch: Dispatch, numberOfKeyToGenerate = 1) {
    let lastKey = numberOfGeneratedKey
    let newKeys: number[] = []
    for (let i = 1; i <= numberOfKeyToGenerate; i++) {
        newKeys.push(lastKey + i)
    }
    dispatch(incrementNumberOfGeneratedKey(numberOfKeyToGenerate))
    return newKeys;
}


export function getDefaultCube(numberOfGeneratedKey: number, dispatch: Dispatch) {
    const component: ComponentEntity = {
        type: 'CUBE',
        name: 'CUBE',
        keyComponent: getNewKeys(numberOfGeneratedKey, dispatch)[0],
        orbitEnabled: true,
        transformationParams: TRANSF_PARAMS_DEFAULTS,
        previousTransformationParams: TRANSF_PARAMS_DEFAULTS,
        geometryAttributes: {
            width: 1,
            depth: 1,
            height: 1,
            depthSegments: 1,
            heigthSegments: 1,
            widthSegments: 1
        } as CubeGeometryAttributes,
        transparency: true,
        opacity: 1

    }
    return component
}

export function getRisCube(key: number, dispatch: Dispatch, coords: number[]) {
  const component: ComponentEntity = {
      type: 'CUBE',
      name: `CUBE_${key.toString()}`,
      keyComponent: key,
      orbitEnabled: true,
      transformationParams: {...TRANSF_PARAMS_DEFAULTS, position: [(coords[0]+coords[1])/2, (coords[2]+coords[3])/2, (coords[4]+coords[5])/2]},
      previousTransformationParams: TRANSF_PARAMS_DEFAULTS,
      geometryAttributes: {
          width: coords[1]-coords[0],
          depth: coords[5]-coords[4],
          height: coords[3]-coords[2],
          depthSegments: 1,
          heigthSegments: 1,
          widthSegments: 1
      } as CubeGeometryAttributes,
      transparency: true,
      opacity: 1
  }
  return component
}

export const Cube: FC<CubeProps> = (
    { width, height, depth, color, depthSegments, widthSegments, heigthSegments, opacity, transparency}
) => {
    return (
        <>
            <boxGeometry args={[width, height, depth, widthSegments, heigthSegments, depthSegments]} />
            <meshPhongMaterial color={color} opacity={opacity} transparent={transparency}/>
        </>
    )
}
