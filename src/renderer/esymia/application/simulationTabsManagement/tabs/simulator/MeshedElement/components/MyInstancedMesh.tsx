import React, { useLayoutEffect, useRef } from 'react';
import { BackSide, FrontSide, InstancedMesh, Object3D } from 'three';
import { FactoryShapes, Material } from 'cad-library';
import { CellSize, OriginPoint, Project } from '../../../../../../model/esymiaModels';
import { useSelector } from 'react-redux';
import { Brick } from '../../rightPanelSimulator/components/createGridsExternals';
import { scalingViewParamsOfMeshSelector } from '../../../../../../store/tabsAndMenuItemsSlice';
import { EdgesMaterial } from './EdgesMaterial';
import { Edges, Wireframe } from '@react-three/drei';
import uniqid from 'uniqid';
import { selectedProjectSelector } from '../../../../../../store/projectSlice';
import * as THREE from 'three'
import { calculateModelBoundingBox } from '../../../../sharedElements/utilityFunctions';


interface InstancedMeshProps {
  material: Material;
  origin: OriginPoint,
  cellSize: CellSize
  bricks: Brick[]
}

export const MyInstancedMesh: React.FC<InstancedMeshProps> = ({ material, bricks, origin, cellSize }) => {
  const meshRef = useRef<InstancedMesh>({} as InstancedMesh);
  const edgeRef = useRef<InstancedMesh>({} as InstancedMesh);
  const scalingViewParams = useSelector(scalingViewParamsOfMeshSelector);
  let tempObject = new Object3D();
  const selectedProject = useSelector(selectedProjectSelector);

  let boxDims: [number, number, number] = [
    cellSize.cell_size_x * 1000 * scalingViewParams.x,
    cellSize.cell_size_y * 1000 * scalingViewParams.y,
    cellSize.cell_size_z * 1000 * scalingViewParams.z
  ];

  useLayoutEffect(() => {
    boxDims = [
      cellSize.cell_size_x * 1000 * scalingViewParams.x,
      cellSize.cell_size_y * 1000 * scalingViewParams.y,
      cellSize.cell_size_z * 1000 * scalingViewParams.z
    ];
    if (edgeRef.current) {
      bricks.forEach((brick, id) => {
        tempObject.position.set(
          brick.x !== 0
            ? ((brick.x) * cellSize.cell_size_x) * 1000 * scalingViewParams.x
            : origin.origin_x,
          brick.y !== 0
            ? ((brick.y) * cellSize.cell_size_y) * 1000 * scalingViewParams.y
            : origin.origin_y,
          brick.z !== 0
            ? ((brick.z) * cellSize.cell_size_z) * 1000 * scalingViewParams.z
            : origin.origin_z
        );
        tempObject.updateMatrix();
        (bricks.length < 1000000) && meshRef.current.setMatrixAt(id, tempObject.matrix);
        edgeRef.current.setMatrixAt(id, tempObject.matrix);
      });

      if(bricks.length < 1000000){
        meshRef.current.instanceMatrix.needsUpdate = true;
      }
      edgeRef.current.instanceMatrix.needsUpdate = true;
      // edgeRef.current.geometry = meshRef.current.geometry
      // edgeRef.current.instanceMatrix = meshRef.current.instanceMatrix;
    }
  }, [bricks, scalingViewParams]);


  const meanBoxDims = (boxDims[0] + boxDims[1] + boxDims[2]) / 3;

  return (
    <>
      {bricks.length < 1000000 ?
        <instancedMesh ref={meshRef} frustumCulled={false} args={[null as any, null as any, bricks.length]}>
        <boxGeometry args={boxDims}/>
        <meshPhongMaterial color={material && material.color} side={FrontSide}/>
      </instancedMesh> :
        <>
          {selectedProject && selectedProject.model.components.map((component) => {
            return (
              <mesh
                userData={{
                  keyComponent: component.keyComponent,
                  isSelected: false
                }}
                key={uniqid()}
                position={new THREE.Vector3(
                  component.transformationParams.position[0]-(cellSize.cell_size_x*1000/2),
                  component.transformationParams.position[1]-(cellSize.cell_size_y*1000/2),
                  component.transformationParams.position[2]-(cellSize.cell_size_z*1000/2),
                )}
                rotation={component.transformationParams.rotation}
                scale={new THREE.Vector3(
                  component.transformationParams.scale[0] * scalingViewParams.x,
                  component.transformationParams.scale[1] * scalingViewParams.y,
                  component.transformationParams.scale[2] * scalingViewParams.z,
                )}
              >
                <FactoryShapes entity={component} />
              </mesh>
            );
          })}
        </>
      }
      <instancedMesh ref={edgeRef} frustumCulled={false} args={[null as any, null as any, bricks.length]}>
        <boxGeometry args={boxDims} />
        <EdgesMaterial boxDims={boxDims} smoothness={meanBoxDims * 0.01} thickness={meanBoxDims * 0.03}
                       polygonOffsetFactor={-0.2} color='black' />
      </instancedMesh>
    </>
  )
    ;
};
