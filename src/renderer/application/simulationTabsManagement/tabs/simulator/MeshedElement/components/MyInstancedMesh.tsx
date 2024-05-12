import React, { useLayoutEffect, useRef } from "react";
import { Color, FrontSide, InstancedMesh, Object3D, Vector3 } from "three";
import { Material } from "cad-library";
import { CellSize, OriginPoint } from "../../../../../../model/esymiaModels";
import { useSelector } from "react-redux";
import { Brick } from '../../rightPanelSimulator/components/createGridsExternals';
import { scalingViewParamsOfMeshSelector } from "../../../../../../store/tabsAndMenuItemsSlice";
import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";


interface InstancedMeshProps {
  material: Material;
  origin: OriginPoint,
  cellSize: CellSize
  bricks: Brick[]
}

const MeshEdgesMaterial = shaderMaterial(
  {
    color: new Color('white'),
    size: new Vector3(1, 1, 1),
    thickness: 0.01,
    smoothness: 0.2
  },
  /*glsl*/ `varying vec3 vPosition;
  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * viewMatrix * instanceMatrix * vec4(position, 1.0);
  }`,
  /*glsl*/ `varying vec3 vPosition;
  uniform vec3 size;
  uniform vec3 color;
  uniform float thickness;
  uniform float smoothness;
  void main() {
    vec3 d = abs(vPosition) - (size * 0.5);
    float a = smoothstep(thickness, thickness + smoothness, min(min(length(d.xy), length(d.yz)), length(d.xz)));
    gl_FragColor = vec4(color, 1.0-a);
  }`
)

extend({ MeshEdgesMaterial })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshEdgesMaterial: any;
    }
  }
}

export const MyInstancedMesh: React.FC<InstancedMeshProps> = ({
  material,
  bricks,
  origin,
  cellSize
}) => {

  const meshRef = useRef<InstancedMesh>({} as InstancedMesh);
  const edgeRef = useRef<InstancedMesh>({} as InstancedMesh)
  const scalingViewParams = useSelector(scalingViewParamsOfMeshSelector)
  let tempObject = new Object3D();

  useLayoutEffect(() => {
    if (meshRef.current) {
      bricks.forEach((brick, id) => {
        tempObject.position.set(
          brick.x !== 0
            ? ((brick.x) * cellSize.cell_size_x) * 1000 * scalingViewParams.x
            : origin.origin_x / 1000,
          brick.y !== 0
            ? ((brick.y) * cellSize.cell_size_y) *
            1000 * scalingViewParams.y
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
    }
  }, [bricks, scalingViewParams]);

  const boxDims: [number, number, number] = [
    cellSize.cell_size_x * 1000 * scalingViewParams.x,
    cellSize.cell_size_y * 1000 * scalingViewParams.y,
    cellSize.cell_size_z * 1000 * scalingViewParams.z,
  ]

  const meanBoxDims = (boxDims[0]+boxDims[1]+boxDims[2])/3

  return (
    <>
      <instancedMesh ref={meshRef} frustumCulled={false} args={[null as any, null as any, bricks.length]}>
        <boxGeometry args={boxDims} />
        <meshPhongMaterial color={material && material.color} side={FrontSide}/>
      </instancedMesh>
      <instancedMesh ref={edgeRef} frustumCulled={false} args={[null as any, null as any, bricks.length]}>
        <boxGeometry args={boxDims} />
        <meshEdgesMaterial transparent polygonOffset polygonOffsetFactor={-0.2} size={boxDims}
          color="black" thickness={meanBoxDims * 0.03}
          smoothness={meanBoxDims * 0.01} side={FrontSide} />
      </instancedMesh>
    </>
  );
};
