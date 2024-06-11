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

        // const grids: any[] = [];
        // for (const value of Object.values(res.data.mesher_matrices)) {
        //   grids.push(value);
        // }
        // const grids_external = create_Grids_externals(grids);
        // const data = { ...res.data.mesher_matrices };
        // Object.keys(res.data.mesher_matrices).forEach((k, index) => {
        //   data[k] = grids_external.data[index];
        // });
        // const extGrids = {
        //   externalGrids: data,
        //   cell_size: {
        //     cell_size_x: res.data.cell_size.cell_size_x / 1000,
        //     cell_size_y: res.data.cell_size.cell_size_y / 1000,
        //     cell_size_z: res.data.cell_size.cell_size_z / 1000
        //   },
        //   origin: res.data.origin,
        //   n_cells: res.data.n_cells
        // };
        // setLoadingData(true)
        // saveMeshData(res.data, extGrids)
        /* saveMeshAndExternalGridsToS3(res.data, extGrids, dispatch, selectedProject, execQuery)
          .then(() => {
            return '';
          })
          .catch((err: any) => console.log(err)); */
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
            Math.min(3e8/selectedProject.frequencies[selectedProject.frequencies?.length - 1]/40, parseFloat(res.data[0].toFixed(5))),
            Math.min(3e8/selectedProject.frequencies[selectedProject.frequencies?.length - 1]/40, parseFloat(res.data[1].toFixed(5))),
            Math.min(3e8/selectedProject.frequencies[selectedProject.frequencies?.length - 1]/40, parseFloat(res.data[2].toFixed(5))),
          ]
        )));
        setQuantumDimsInput([
          Math.min(3e8/selectedProject.frequencies[selectedProject.frequencies?.length - 1]/40, parseFloat(res.data[0].toFixed(5))),
          Math.min(3e8/selectedProject.frequencies[selectedProject.frequencies?.length - 1]/40, parseFloat(res.data[1].toFixed(5))),
          Math.min(3e8/selectedProject.frequencies[selectedProject.frequencies?.length - 1]/40, parseFloat(res.data[2].toFixed(5))),
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

