import React, { useEffect, useState } from 'react';
import { Material } from 'cad-library';
import { MyInstancedMesh } from './components/MyInstancedMesh';
import { ExternalGridsObject, Project } from '../../../../../model/esymiaModels';
import { useSelector } from 'react-redux';
import { meshGeneratedSelector, selectedProjectSelector } from '../../../../../store/projectSlice';
import { Brick } from '../rightPanelSimulator/components/createGridsExternals';

interface MeshedElementProps {
  externalGrids: ExternalGridsObject;
  selectedMaterials: string[];
  resetFocus: Function
}

export const MeshedElement: React.FC<MeshedElementProps> = ({
  externalGrids,
  selectedMaterials, resetFocus
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  let meshGenerated = useSelector(meshGeneratedSelector);
  let allMaterialsList = selectedProject?.model?.components.map(c => c.material as Material) as Material[];
  let materialsList: Material[] = [];
  selectedMaterials.forEach(sm => {
    materialsList.push(...allMaterialsList.filter(m => m.name === sm));
  });

  const [mesherMatrices, setMesherMatrices] = useState<(Brick[])[]>([]);
  const [modelMaterials, setModelMaterials] = useState<Material[]>([]);

  useEffect(() => {
    if ((meshGenerated === 'Generated' || meshGenerated === "Queued") && externalGrids) {
      let matrices: (Brick[])[] = [];
      //let defaultSelectedEntries: [string, any][] = Object.entries(externalGrids.mesher_matrices)
      let selectedEntries: [string, Brick[]][] = Object.entries(externalGrids.externalGrids);
      let finalMaterialList: Material[] = [];
      if (externalGrids) {
        /*if(selectedMaterials.length === 0){
            selectedEntries = []
        }else{
            selectedMaterials.forEach(sm => {
                selectedEntries.push(...defaultSelectedEntries.filter(se => se[0] === sm))
                console.log(selectedEntries)
            })
        }*/
        selectedEntries.forEach(e => {
          matrices.push(e[1]);
          finalMaterialList.push(...materialsList.filter(m => m.name === e[0]));
        });

        setModelMaterials(finalMaterialList);
        setMesherMatrices(matrices);
      }
    }
  }, [externalGrids, meshGenerated]);

  useEffect(() => {
    resetFocus()
  }, [])



  return (
    // <Bounds fit margin={externalGrids.cell_size.cell_size_x * 9000}>
    <group>
      {mesherMatrices.map((matrix, index) => {
        return (
          <MyInstancedMesh
            key={index}
            material={modelMaterials[index]}
            bricks={matrix}
            origin={externalGrids.origin}
            cellSize={externalGrids.cell_size}
          />
        );
      })}
    </group>
    // </Bounds>
  );
};
