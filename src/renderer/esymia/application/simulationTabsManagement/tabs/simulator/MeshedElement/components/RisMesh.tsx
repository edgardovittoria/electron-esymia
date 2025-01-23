import { Edges } from '@react-three/drei';
import { FC, useEffect, useRef } from 'react';
import { DoubleSide } from 'three';
import { useSelector } from 'react-redux';
import { selectedProjectSelector } from '../../../../../../store/projectSlice';
import { getMaterialListFrom } from '../../Simulator';
import {
  ExternalGridsRisObject,
  Project,
} from '../../../../../../model/esymiaModels';
import * as THREE from 'three';
import { EdgesMaterial } from './EdgesMaterial';

interface RisMeshProps {
  positions: number[];
  materialColor: string;
  scaleFactor: number;
}

const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);

const indices = new Uint16Array([0, 1, 3, 2, 3, 1]);

const RisMeshElement: FC<RisMeshProps> = ({
  positions,
  materialColor,
  scaleFactor,
}) => {
  let vertices = new Float32Array([
    positions[0] * scaleFactor,
    positions[1] * scaleFactor,
    positions[2] * scaleFactor,
    positions[3] * scaleFactor,
    positions[4] * scaleFactor,
    positions[5] * scaleFactor,
    positions[9] * scaleFactor,
    positions[10] * scaleFactor,
    positions[11] * scaleFactor,
    positions[6] * scaleFactor,
    positions[7] * scaleFactor,
    positions[8] * scaleFactor,
  ]);

  return (
    <mesh>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={vertices}
          count={vertices.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-normal"
          array={normals}
          count={normals.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="index"
          array={indices}
          count={indices.length}
          itemSize={1}
        />
      </bufferGeometry>
      <meshStandardMaterial color={materialColor} side={DoubleSide} />
      <Edges color="black" />
    </mesh>
  );
};


const scaleFactorForVisualization = (vertices: number[][]) => {
  let maxDimension = 0;
  vertices.forEach((v) => {
    let width = Math.sqrt(
      Math.pow(v[3] - v[0], 2) +
        Math.pow(v[4] - v[1], 2) +
        Math.pow(v[5] - v[2], 2),
    );
    let heigth = Math.sqrt(
      Math.pow(v[6] - v[0], 2) +
        Math.pow(v[7] - v[1], 2) +
        Math.pow(v[8] - v[2], 2),
    );
    maxDimension = Math.max(maxDimension, width, heigth);
  });
  return 0.7 / maxDimension;
};

export const RisMesh: FC<{
  externalGrids: ExternalGridsRisObject;
  resetFocus: Function;
}> = ({ externalGrids, resetFocus }) => {
  const selectedProject = useSelector(selectedProjectSelector) as Project;
  const materialList = getMaterialListFrom(selectedProject?.model.components);

  const scaleFactor = scaleFactorForVisualization(externalGrids.vertices);


  useEffect(() => {
    resetFocus();
  }, []);

  return (
    <>
    {externalGrids.vertices.map((squareVertices, index) =>
      <RisMeshElement key={index} materialColor={materialList.filter((m) => m.name === externalGrids.materials[index])[0].color} positions={squareVertices} scaleFactor={scaleFactor}/>
    )}
    </>
  );
};

type Square = [
  { x: number; y: number; z: number },
  { x: number; y: number; z: number },
  { x: number; y: number; z: number },
  { x: number; y: number; z: number },
];

export const InstancedSquaresFromVertices: FC<{ externalGrids: ExternalGridsRisObject, resetFocus: Function }> = ({
  externalGrids, resetFocus
}) => {
  const selectedProject = useSelector(selectedProjectSelector) as Project;
  const materialList = getMaterialListFrom(selectedProject?.model.components);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const edgesRef = useRef<THREE.InstancedMesh>(null);
  const scaleFactor = scaleFactorForVisualization(externalGrids.vertices);
  const squares = externalGrids.vertices.map(
    (faceVertices) =>
      [
        {
          x: faceVertices[0] * scaleFactor,
          y: faceVertices[1] * scaleFactor,
          z: faceVertices[2] * scaleFactor,
        },
        {
          x: faceVertices[3] * scaleFactor,
          y: faceVertices[4] * scaleFactor,
          z: faceVertices[5] * scaleFactor,
        },
        {
          x: faceVertices[6] * scaleFactor,
          y: faceVertices[7] * scaleFactor,
          z: faceVertices[8] * scaleFactor,
        },
        {
          x: faceVertices[9] * scaleFactor,
          y: faceVertices[10] * scaleFactor,
          z: faceVertices[11] * scaleFactor,
        },
      ] as Square,
  );

  useEffect(() => {
    resetFocus();
  }, []);

  useEffect(() => {
    if (!meshRef.current || !edgesRef.current) return;

    const tempMatrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const instanceColors = new Float32Array(squares.length * 3);

    squares.forEach((vertices, i) => {

      // Impostazione del colore
      const color = new THREE.Color(materialList.filter((m) => m.name === externalGrids.materials[i])[0].color); // Default: bianco
      instanceColors.set([color.r, color.g, color.b], i * 3);
      meshRef.current && meshRef.current.geometry.setAttribute(
        'color',
        new THREE.InstancedBufferAttribute(instanceColors, 3)
      );

      // Calcolo il centroide del rettangolo
      const centroide = new THREE.Vector3();
      vertices.forEach((v) => centroide.add(new THREE.Vector3(v.x, v.y, v.z)));
      centroide.divideScalar(vertices.length);
      position.copy(centroide);

      const v0 = new THREE.Vector3(vertices[0].x, vertices[0].y, vertices[0].z);
      const v1 = new THREE.Vector3(vertices[1].x, vertices[1].y, vertices[1].z);
      const v2 = new THREE.Vector3(vertices[2].x, vertices[2].y, vertices[2].z);

      const edge1 = new THREE.Vector3().subVectors(v1, v0).normalize(); // Asse X locale
      const normal = new THREE.Vector3()
        .crossVectors(
          new THREE.Vector3().subVectors(v1, v0),
          new THREE.Vector3().subVectors(v2, v0)
        )
        .normalize(); // Normale del piano
      const edge2 = new THREE.Vector3().crossVectors(normal, edge1).normalize(); // Asse Y locale

      // 3. Crea una matrice di rotazione basata sugli assi locali
      const rotationMatrix = new THREE.Matrix4().makeBasis(edge1, edge2, normal);
      const quaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);

      // 4. Calcola la scala basata sulla distanza tra i vertici
      const width = v0.distanceTo(v1); // Larghezza
      const height = v0.distanceTo(v2); // Altezza
      scale.set(width, height, 1);

      // Composizione della matrice di trasformazione
      tempMatrix.compose(position, quaternion, scale);
      meshRef.current && meshRef.current.setMatrixAt(i, tempMatrix);
      edgesRef.current && edgesRef.current.setMatrixAt(i, tempMatrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    edgesRef.current.instanceMatrix.needsUpdate = true;
  }, [squares]);

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, squares.length]}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial side={THREE.DoubleSide} vertexColors/>
      </instancedMesh>
      <instancedMesh
        ref={edgesRef}
        frustumCulled={false}
        args={[undefined, undefined, squares.length]}
      >
        <planeGeometry args={[1, 1]} />
        <EdgesMaterial
          boxDims={[1, 1, 0]}
          smoothness={0.01}
          thickness={0.03}
          polygonOffsetFactor={-0.2}
          color="black"
        />
      </instancedMesh>
    </>
  );
};
