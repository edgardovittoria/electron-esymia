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




export const launchMeshing = (selectedProject: Project, allMaterials: Material[], quantumDimsInput: [number, number, number], dispatch: AppDispatch, saveMeshData: Function, setAlert: Function, previousMeshStatus: 'Not Generated' | 'Generated', execQuery: Function, setLoadingData: Function) => {
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
  axios
    .post('http://127.0.0.1:8003/meshing', objToSendToMesher)
    .then((res) => {
      if (res.data.x) {
        dispatch(setMessageInfoModal(`the size of the quantum on x is too large compared to the size of the model on x. Please reduce the size of the quantum on x! x must be less than ${res.data.max_x}`));
        dispatch(setIsAlertInfoModal(true));
        dispatch(setShowInfoModal(true));
        setAlert(true);
        dispatch(setMeshGenerated({
          status: previousMeshStatus,
          projectToUpdate: selectedProject.faunaDocumentId as string
        }));
      } else if (res.data.y) {
        dispatch(setMessageInfoModal(`the size of the quantum on y is too large compared to the size of the model on y. Please reduce the size of the quantum on y! y must be less than ${res.data.max_y}`));
        dispatch(setIsAlertInfoModal(true));
        dispatch(setShowInfoModal(true));
        setAlert(true);
        dispatch(setMeshGenerated({
          status: previousMeshStatus,
          projectToUpdate: selectedProject.faunaDocumentId as string
        }));
      } else if (res.data.z) {
        dispatch(setMessageInfoModal(`the size of the quantum on z is too large compared to the size of the model on z. Please reduce the size of the quantum on z! z must be less than ${res.data.max_z}`));
        dispatch(setIsAlertInfoModal(true));
        dispatch(setShowInfoModal(true));
        setAlert(true);
        dispatch(setMeshGenerated({
          status: previousMeshStatus,
          projectToUpdate: selectedProject.faunaDocumentId as string
        }));
      } else if(res.data.isStopped === true){
        dispatch(setMeshGenerated({
          status: previousMeshStatus,
          projectToUpdate: selectedProject.faunaDocumentId as string
        }));
      } else if (res.data.isValid.valid === false) {
        dispatch(setMessageInfoModal('Error! Mesh not valid. Please adjust quantum along ' + res.data.isValid.axis + ' axis.'));
        dispatch(setIsAlertInfoModal(true));
        dispatch(setShowInfoModal(true));
        setAlert(true);
        dispatch(setMeshGenerated({
          status: previousMeshStatus,
          projectToUpdate: selectedProject.faunaDocumentId as string
        }));
      } else {
        dispatch(setMeshGenerated({
          status: 'Generated',
          projectToUpdate: selectedProject.faunaDocumentId as string
        }));
        dispatch(setMesh({ mesh: res.data.mesh, projectToUpdate: selectedProject.faunaDocumentId as string }));
        dispatch(setExternalGrids({
          extGrids: res.data.grids,
          projectToUpdate: selectedProject.faunaDocumentId as string
        }));
        execQuery(
          updateProjectInFauna,
          convertInFaunaProjectThis({
            ...selectedProject,
            meshData: {
              ...selectedProject.meshData,
              mesh: res.data.mesh,
              externalGrids: res.data.grids,
              meshGenerated: 'Generated'
            }
          })
        ).then(() => {
        });
        return '';
      }
    })
    .catch((err) => {
      if (err) {
        dispatch(setMessageInfoModal('Error while generating mesh, please start mesher on plugins section and try again'));
        dispatch(setIsAlertInfoModal(true));
        dispatch(setShowInfoModal(true));
        setAlert(true);
        dispatch(setMeshGenerated({
          status: previousMeshStatus,
          projectToUpdate: selectedProject.faunaDocumentId as string
        }));
        console.log(err);
      }
    });
};

export const computeSuggestedQuantum = (selectedProject: Project, allMaterials: Material[], dispatch: AppDispatch, execQuery: Function, setSuggestedQuantumError: Function, setQuantumDimsInput: Function) => {
  const getEscalFrom = (unit?: string) => {
    let escal = 1.0
    if (unit !== undefined){
      if (unit === "m") escal = 1.0
      if (unit === "dm") escal = 1e1
      if (unit === "cm") escal = 1e2
      if (unit === "mm") escal = 1e3
      if (unit === "microm") escal = 1e6
      if (unit === "nanom") escal = 1e9
    }
    return escal
  }
  const components = selectedProject?.model
    ?.components as ComponentEntity[];
  const objToSendToMesher = {
    STLList:
      components &&
      allMaterials &&
      generateSTLListFromComponents(allMaterials, components)
  };
  axios
    .post('http://127.0.0.1:8003/meshingAdvice', objToSendToMesher)
    .then(res => {
      if(selectedProject.frequencies?.length && selectedProject.frequencies?.length > 0){
        dispatch(setSuggestedQuantum((
          [
            Math.min((3e8/selectedProject.frequencies[selectedProject.frequencies?.length - 1]/40)*getEscalFrom(selectedProject.modelUnit), parseFloat(res.data[0].toFixed(5))),
            Math.min((3e8/selectedProject.frequencies[selectedProject.frequencies?.length - 1]/40)*getEscalFrom(selectedProject.modelUnit), parseFloat(res.data[1].toFixed(5))),
            Math.min((3e8/selectedProject.frequencies[selectedProject.frequencies?.length - 1]/40)*getEscalFrom(selectedProject.modelUnit), parseFloat(res.data[2].toFixed(5))),
          ]
        )));
        setQuantumDimsInput([
          Math.min((3e8/selectedProject.frequencies[selectedProject.frequencies?.length - 1]/40)*getEscalFrom(selectedProject.modelUnit), parseFloat(res.data[0].toFixed(5))),
          Math.min((3e8/selectedProject.frequencies[selectedProject.frequencies?.length - 1]/40)*getEscalFrom(selectedProject.modelUnit), parseFloat(res.data[1].toFixed(5))),
          Math.min((3e8/selectedProject.frequencies[selectedProject.frequencies?.length - 1]/40)*getEscalFrom(selectedProject.modelUnit), parseFloat(res.data[2].toFixed(5))),
        ])
      }/* else{
        dispatch(setSuggestedQuantum(([parseFloat(res.data[0].toFixed(5)), parseFloat(res.data[1].toFixed(5)), parseFloat(res.data[2].toFixed(5))])));
        setQuantumDimsInput([parseFloat(res.data[0].toFixed(5)), parseFloat(res.data[1].toFixed(5)), parseFloat(res.data[2].toFixed(5))])
      } */
      execQuery(
        updateProjectInFauna,
        convertInFaunaProjectThis({
          ...selectedProject,
          suggestedQuantum: [parseFloat(res.data[0].toFixed(5)), parseFloat(res.data[1].toFixed(5)), parseFloat(res.data[2].toFixed(5))]
        } as Project)
      ).then();
    }).catch((err) => setSuggestedQuantumError(true));
};

