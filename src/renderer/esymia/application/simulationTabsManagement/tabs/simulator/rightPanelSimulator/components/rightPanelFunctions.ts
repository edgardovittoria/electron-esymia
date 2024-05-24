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


export const saveMeshAndExternalGridsToS3 = async (
  mesherOutput: any,
  externalGrid: any,
  dispatch: AppDispatch,
  selectedProject: Project,
  execQuery: Function
) => {
  const blobFile = new Blob([JSON.stringify(mesherOutput)]);
  const meshFile = new File([blobFile], `mesh.json`, {
    type: 'application/json'
  });
  uploadFileS3(meshFile, selectedProject)
    .then((res) => {
      if (res) {
        const blobFile = new Blob([JSON.stringify(externalGrid)]);
        const meshFile = new File([blobFile], `mesh.json`, {
          type: 'application/json'
        });
        uploadFileS3(meshFile, selectedProject)
          .then((resExternalGrids) => {
            if (resExternalGrids) {
              dispatch(setMeshGenerated({
                status: 'Generated',
                projectToUpdate: selectedProject.faunaDocumentId as string
              }));
              dispatch(setMesh({ mesh: res.key, projectToUpdate: selectedProject.faunaDocumentId as string }));
              dispatch(setExternalGrids({
                extGrids: resExternalGrids.key,
                projectToUpdate: selectedProject.faunaDocumentId as string
              }));
              execQuery(
                updateProjectInFauna,
                convertInFaunaProjectThis({
                  ...selectedProject,
                  meshData: {
                    ...selectedProject.meshData,
                    mesh: res.key,
                    externalGrids: resExternalGrids.key,
                    meshGenerated: 'Generated'
                  }
                })
              ).then(() => {
              });
              return '';
            }
          }).catch((err) => {
          console.log(err);
          toast.error('Error while saving mesh, please try again');
          dispatch(setMeshGenerated({ status: 'Not Generated', projectToUpdate: selectedProject.faunaDocumentId as string }));
        });

      }
      return '';
    })
    .catch((err) => console.log(err));
  return 'saved';
};

export const launchMeshing = (selectedProject: Project, allMaterials: Material[], quantumDimsInput: [number, number, number], dispatch: AppDispatch, saveMeshAndExternalGridsToS3: Function, setAlert: Function, previousMeshStatus: 'Not Generated' | 'Generated', execQuery: Function, setLoadingData: Function) => {
  const components = selectedProject?.model
    ?.components as ComponentEntity[];
  const objToSendToMesher = {
    STLList:
      components &&
      allMaterials &&
      generateSTLListFromComponents(allMaterials, components),
    quantum: quantumDimsInput
  };
  // local meshing: http://127.0.0.1:8003/meshing
  // lambda aws meshing: https://wqil5wnkowc7eyvzkwczrmhlge0rmobd.lambda-url.eu-west-2.on.aws/
  axios
    .post('http://127.0.0.1:8003/meshing', objToSendToMesher)
    .then((res) => {
      console.log(res.data);
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
      } else if(res.data.mesh_is_valid.stopped == true){
        dispatch(setMeshGenerated({
          status: previousMeshStatus,
          projectToUpdate: selectedProject.faunaDocumentId as string
        }));
      } else if (res.data.mesh_is_valid.valid == false) {
        dispatch(setMessageInfoModal('Error! Mesh not valid. Please adjust quantum along ' + res.data.mesh_is_valid.axis + ' axis.'));
        dispatch(setIsAlertInfoModal(true));
        dispatch(setShowInfoModal(true));
        setAlert(true);
        dispatch(setMeshGenerated({
          status: previousMeshStatus,
          projectToUpdate: selectedProject.faunaDocumentId as string
        }));
      } else {
        const grids: any[] = [];
        for (const value of Object.values(res.data.mesher_matrices)) {
          grids.push(value);
        }
        const grids_external = create_Grids_externals(grids);
        const data = { ...res.data.mesher_matrices };
        Object.keys(res.data.mesher_matrices).forEach((k, index) => {
          data[k] = grids_external.data[index];
        });
        const extGrids = {
          externalGrids: data,
          cell_size: {
            cell_size_x: res.data.cell_size.cell_size_x / 1000,
            cell_size_y: res.data.cell_size.cell_size_y / 1000,
            cell_size_z: res.data.cell_size.cell_size_z / 1000
          },
          origin: res.data.origin,
          n_cells: res.data.n_cells
        };
        if (selectedProject.meshData.mesh) {
          deleteFileS3(selectedProject.meshData.mesh).then(() => {
          });
        }
        if (selectedProject.meshData.externalGrids) {
          deleteFileS3(selectedProject.meshData.externalGrids).then(
            () => {
            }
          );
        }
        setLoadingData(true)
        saveMeshAndExternalGridsToS3(res.data, extGrids, dispatch, selectedProject, execQuery)
          .then(() => {
            return '';
          })
          .catch((err: any) => console.log(err));
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

export const computeSuggestedQuantum = (selectedProject: Project, allMaterials: Material[], dispatch: AppDispatch, execQuery: Function, setSuggestedQuantumError: Function) => {
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
      dispatch(setSuggestedQuantum(([parseFloat(res.data[0].toFixed(5)), parseFloat(res.data[1].toFixed(5)), parseFloat(res.data[2].toFixed(5))])));
      execQuery(
        updateProjectInFauna,
        convertInFaunaProjectThis({
          ...selectedProject,
          suggestedQuantum: [parseFloat(res.data[0].toFixed(5)), parseFloat(res.data[1].toFixed(5)), parseFloat(res.data[2].toFixed(5))]
        } as Project)
      ).then();
    }).catch((err) => setSuggestedQuantumError(true));
};

