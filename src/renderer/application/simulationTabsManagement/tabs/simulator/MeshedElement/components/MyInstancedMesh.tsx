import React, { useLayoutEffect, useRef } from "react";
import { FrontSide, InstancedMesh, Object3D } from "three";
import { Material } from "cad-library";
import { CellSize, OriginPoint } from "../../../../../../model/esymiaModels";
import { useSelector } from "react-redux";
import { Brick } from '../../rightPanelSimulator/components/createGridsExternals';
import { scalingViewParamsOfMeshSelector } from "../../../../../../store/tabsAndMenuItemsSlice";
import { EdgesMaterial } from "./EdgesMaterial";
import { Wireframe } from "@react-three/drei";


interface InstancedMeshProps {
  material: Material;
  origin: OriginPoint,
  cellSize: CellSize
  bricks: Brick[]
}

export const MyInstancedMesh: React.FC<InstancedMeshProps> = ({material, bricks, origin, cellSize}) => {
  const meshRef = useRef<InstancedMesh>({} as InstancedMesh);
  const edgeRef = useRef<InstancedMesh>({} as InstancedMesh)
  const scalingViewParams = useSelector(scalingViewParamsOfMeshSelector)
  let tempObject = new Object3D();

  let boxDims: [number, number, number] = [
    cellSize.cell_size_x * 1000 * scalingViewParams.x,
    cellSize.cell_size_y * 1000 * scalingViewParams.y,
    cellSize.cell_size_z * 1000 * scalingViewParams.z,
  ]

  useLayoutEffect(() => {
    boxDims = [
      cellSize.cell_size_x * 1000 * scalingViewParams.x,
      cellSize.cell_size_y * 1000 * scalingViewParams.y,
      cellSize.cell_size_z * 1000 * scalingViewParams.z,
    ]
    if (meshRef.current) {
      bricks.forEach((brick, id) => {
        tempObject.position.set(
          brick.x !== 0
            ? ((brick.x) * cellSize.cell_size_x) * 1000 * scalingViewParams.x
            : origin.origin_x / 1000,
          brick.y !== 0
            ? ((brick.y) * cellSize.cell_size_y) * 1000 * scalingViewParams.y
            : origin.origin_y / 1000,
          brick.z !== 0
            ? ((brick.z) * cellSize.cell_size_z) * 1000 * scalingViewParams.z
            : origin.origin_z / 1000
        );
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(id, tempObject.matrix);
        edgeRef.current.setMatrixAt(id, tempObject.matrix);
      })

      meshRef.current.instanceMatrix.needsUpdate = true;
      edgeRef.current.instanceMatrix.needsUpdate = true;
      // edgeRef.current.geometry = meshRef.current.geometry
      // edgeRef.current.instanceMatrix = meshRef.current.instanceMatrix;
    }
  }, [bricks, scalingViewParams]);


  const meanBoxDims = (boxDims[0] + boxDims[1] + boxDims[2]) / 3

  return (
    <>
      <instancedMesh ref={meshRef} frustumCulled={false} args={[null as any, null as any, bricks.length]}>
        <boxGeometry args={boxDims}/>
        <meshPhongMaterial color={material && material.color} side={FrontSide}/>
        {/* <Wireframe simplify stroke={'#000000'} thickness={0.1}/> */}
      </instancedMesh>
      <instancedMesh ref={edgeRef} frustumCulled={false} args={[null as any, null as any, bricks.length]}>
        <boxGeometry args={boxDims} />
        <EdgesMaterial boxDims={boxDims} smoothness={meanBoxDims * 0.01} thickness={meanBoxDims * 0.03} polygonOffsetFactor={-0.2} color="black"/>
      </instancedMesh>
    </>
  );
};
