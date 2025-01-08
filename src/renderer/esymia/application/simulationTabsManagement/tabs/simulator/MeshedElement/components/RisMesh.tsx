import { Edges } from '@react-three/drei';
import { FC, useEffect } from 'react';
import { DoubleSide } from 'three';
import { Material } from '../../../../../../../cad_library';
import { useSelector } from 'react-redux';
import { selectedProjectSelector } from '../../../../../../store/projectSlice';
import { getMaterialListFrom } from '../../Simulator';
import { ExternalGridsRisObject, Project } from '../../../../../../model/esymiaModels';

interface RisMeshProps {
  positions: number[];
  materialList: Material[];
  materialName: string;
  scaleFactor: number
}

const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);

const indices = new Uint16Array([0, 1, 3, 2, 3, 1]);

const RisMeshElement: FC<RisMeshProps> = ({ positions, materialName, materialList, scaleFactor }) => {

  let vertices = new Float32Array([
    positions[0] * scaleFactor, positions[1] * scaleFactor, positions[2] * scaleFactor,
    positions[3] * scaleFactor, positions[4] * scaleFactor, positions[5] * scaleFactor,
    positions[9] * scaleFactor, positions[10] * scaleFactor, positions[11] * scaleFactor,
    positions[6] * scaleFactor, positions[7] * scaleFactor, positions[8] * scaleFactor,
  ]);
  let color = materialList.filter((m) => m.name === materialName)[0].color;

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
      <meshStandardMaterial color={color} side={DoubleSide} />
      <Edges color="black" />
    </mesh>
  );
};

export const RisMesh: FC<{externalGrids: ExternalGridsRisObject, resetFocus: Function}> = ({externalGrids, resetFocus}) => {
  const selectedProject = useSelector(selectedProjectSelector) as Project;
  const materialList = getMaterialListFrom(selectedProject?.model.components);

  const scaleFactorForVisualization = (vertices: number[][]) => {
    let maxDimension = 0
    vertices.forEach(v => {
      let width = Math.sqrt((Math.pow(v[3]-v[0],2))+(Math.pow(v[4]-v[1],2))+(Math.pow(v[5]-v[2],2)))
      let heigth = Math.sqrt((Math.pow(v[6]-v[0],2))+(Math.pow(v[7]-v[1],2))+(Math.pow(v[8]-v[2],2)))
      maxDimension = Math.max(maxDimension, width, heigth)
    })
    return 0.7/maxDimension
  }

  const scaleFactor = scaleFactorForVisualization(externalGrids.vertices)

  useEffect(() => {
    resetFocus()
  }, [])

  return (
    <>
    {externalGrids.vertices.map((squareVertices, index) =>
      <RisMeshElement key={index} materialList={materialList} materialName={externalGrids.materials[index]} positions={squareVertices} scaleFactor={scaleFactor}/>
    )}
    </>
  )
}
