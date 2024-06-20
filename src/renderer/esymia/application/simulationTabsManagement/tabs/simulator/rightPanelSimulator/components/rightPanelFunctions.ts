import { ComponentEntity, exportToSTL, Material } from 'cad-library';
import { deleteFileS3, uploadFileS3 } from '../../../../../../aws/mesherAPIs';
import {
  setExternalGrids,
  setMesh,
  setMeshGenerated,
  setSuggestedQuantum
} from '../../../../../../store/projectSlice';
import axios from 'axios';
import { create_Grids_externals } from './createGridsExternals';
import { Project } from '../../../../../../model/esymiaModels';
import { updateProjectInFauna } from '../../../../../../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../../../../../../faunadb/apiAuxiliaryFunctions';
import { AppDispatch } from '../../../../../../store/store';
import {
  setIsAlertInfoModal,
  setMessageInfoModal,
  setShowInfoModal
} from '../../../../../../store/tabsAndMenuItemsSlice';
import toast from 'react-hot-toast';
import { Client } from '@stomp/stompjs';
import { client } from '../../../../../../Esymia';

export function generateSTLListFromComponents(
  materialList: Material[],
  components: ComponentEntity[]
) {
  const filteredComponents: ComponentEntity[][] = [];
  materialList.forEach((m) => {
    components &&
    filteredComponents.push(
      components.filter((c) => c.material?.name === m.name)
    );
  });

  const STLList: { material: { name: string, conductivity: number }; STL: string }[] = [];

  filteredComponents.forEach((fc) => {
    const STLToPush = exportToSTL(fc);
    STLList.push({
      material: {
        name: fc[0].material?.name as string,
        conductivity: fc[0].material?.conductivity as number
      },
      STL: STLToPush
    });
  });
  return STLList;
}




export const launchMeshing = (selectedProject: Project, allMaterials: Material[], quantumDimsInput: [number, number, number]) => {
  const components = selectedProject?.model
    ?.components as ComponentEntity[];
  const objToSendToMesher = {
    STLList:
      components &&
      allMaterials &&
      generateSTLListFromComponents(allMaterials, components),
    quantum: quantumDimsInput,
    fileName: selectedProject.faunaDocumentId as string
  };
  // local meshing: http://127.0.0.1:8003/meshing
  // lambda aws meshing: https://wqil5wnkowc7eyvzkwczrmhlge0rmobd.lambda-url.eu-west-2.on.aws/
  client.publish({destination: "management", body: JSON.stringify({ message: "compute mesh", body: objToSendToMesher })})
};

export const computeSuggestedQuantum = (selectedProject: Project, allMaterials: Material[], dispatch: AppDispatch, execQuery: Function, setSuggestedQuantumError: Function, setQuantumDimsInput: Function) => {

  const components = selectedProject?.model
    ?.components as ComponentEntity[];
  const objToSendToMesher = {
    STLList:
      components &&
      allMaterials &&
      generateSTLListFromComponents(allMaterials, components),
    id: selectedProject.faunaDocumentId as string
  };
  client.publish({destination: "management", body: JSON.stringify({ message: "compute suggested quantum", body: objToSendToMesher })})
};

