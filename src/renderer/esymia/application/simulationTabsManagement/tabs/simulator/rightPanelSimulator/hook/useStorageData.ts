import { AppDispatch } from '../../../../../../store/store';
import { CellSize, CellsNumber, ExternalGridsObject, OriginPoint, Project } from '../../../../../../model/esymiaModels';
import { deleteFileS3, uploadFileS3 } from '../../../../../../aws/mesherAPIs';
import {
  homePathSelector, removeProject,
  selectedProjectSelector,
  setExternalGrids,
  setMesh,
  setMeshGenerated
} from '../../../../../../store/projectSlice';
import { deleteSimulationProjectFromFauna, updateProjectInFauna } from '../../../../../../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../../../../../../faunadb/apiAuxiliaryFunctions';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useFaunaQuery } from 'cad-library';
import { deleteFile, readLocalFile, uploadFile } from '../../../../../../../fileSystemAPIs/fileSystemAPIs';
import { s3 } from '../../../../../../aws/s3Config';
import { closeProjectTab } from '../../../../../../store/tabsAndMenuItemsSlice';
import { join } from 'path';
import { Brick } from '../components/createGridsExternals';

export const useStorageData = () => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(selectedProjectSelector) as Project;
  const homePath = useSelector(homePathSelector);
  const { execQuery } = useFaunaQuery();
  const saveMeshAndExternalGridsToS3 = (
    mesherOutput: any,
    externalGrid: any
  ) => {
    if (selectedProject.meshData.mesh) {
      deleteFileS3(selectedProject.meshData.mesh).then(() => {});
    }
    if (selectedProject.meshData.externalGrids) {
      deleteFileS3(selectedProject.meshData.externalGrids).then(() => {});
    }
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
            dispatch(setMeshGenerated({
              status: 'Not Generated',
              projectToUpdate: selectedProject.faunaDocumentId as string
            }));
          });
        }
        return '';
      })
      .catch((err) => console.log(err));
    return 'saved';
  };

  const saveMeshAndExternalGridsLocal =  (
    mesherOutput: any,
    externalGrid: any
  ) => {
    //join('esymiaProjects', 'mesherOutputs', selectedProject.faunaDocumentId as string, '.json')
    uploadFile('esymiaProjects/mesherOutputs/' + selectedProject.faunaDocumentId + '.json', mesherOutput).then(() => {
      uploadFile('esymiaProjects/externalGrids/' + selectedProject.faunaDocumentId + '.json', externalGrid)
        .then(() => {
          dispatch(setMeshGenerated({
            status: 'Generated',
            projectToUpdate: selectedProject.faunaDocumentId as string
          }));
          dispatch(setMesh({ mesh: homePath+'/esymiaProjects/mesherOutputs/' + selectedProject.faunaDocumentId + '.json', projectToUpdate: selectedProject.faunaDocumentId as string }));
          dispatch(setExternalGrids({
            extGrids: homePath+'/esymiaProjects/externalGrids/' + selectedProject.faunaDocumentId + '.json',
            projectToUpdate: selectedProject.faunaDocumentId as string
          }));
          execQuery(
            updateProjectInFauna,
            convertInFaunaProjectThis({
              ...selectedProject,
              meshData: {
                ...selectedProject.meshData,
                mesh: homePath+'/esymiaProjects/mesherOutputs/' + selectedProject.faunaDocumentId + '.json',
                externalGrids: homePath+'/esymiaProjects/externalGrids/' + selectedProject.faunaDocumentId + '.json',
                meshGenerated: 'Generated'
              }
            })
          ).then(() => {
          });
          return '';

        }).catch((err) => {
        console.log(err);
        toast.error('Error while saving mesh, please try again');
        dispatch(setMeshGenerated({
          status: 'Not Generated',
          projectToUpdate: selectedProject.faunaDocumentId as string
        }));
      });
    });
  };

  const loadDataFromS3 = (setSpinner: (v:boolean) => void, setExternalGrids: Function) => {
    s3.getObject(
      {
        Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
        Key: selectedProject.meshData.externalGrids as string,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        }
        setExternalGrids(JSON.parse(data.Body?.toString() as string) as ExternalGridsObject,);
        dispatch(setMeshGenerated({ status: 'Generated', projectToUpdate: selectedProject.faunaDocumentId as string }));
        setSpinner(false)
      },
    );
  }

  const externalGridsDecode = (extGridsJson: any) => {
    let gridsPairs: [string, Brick[]][] = []
    Object.entries(extGridsJson.externalGrids).forEach((material) => gridsPairs.push([material[0], (material[1] as string).split("$").map(brString => {
      let coords = brString.split("-").map(c => parseInt(c))
      return {x: coords[0], y: coords[1], z:coords[2]} as Brick
    })]))
    let externalGrids = Object.fromEntries(gridsPairs)
    let cellSizeCoords = (extGridsJson.cell_size as string).split("-").map(c => parseFloat(c)/1000)
    let cell_size = {cell_size_x: cellSizeCoords[0], cell_size_y: cellSizeCoords[1], cell_size_z: cellSizeCoords[2]} as CellSize
    let nCellsCoords = (extGridsJson.n_cells as string).split("-").map(c => parseFloat(c))
    let n_cells = {n_cells_x: nCellsCoords[0], n_cells_y: nCellsCoords[1], n_cells_z: nCellsCoords[2]} as CellsNumber
    let originCoords = (extGridsJson.origin as string).split("-").map(c => parseFloat(c))
    let origin = {origin_x: originCoords[0], origin_y: originCoords[1], origin_z: originCoords[2]} as OriginPoint
    return {cell_size: cell_size, externalGrids: externalGrids, n_cells: n_cells, origin: origin} as ExternalGridsObject
  }

  const loadDataFromLocal = (setSpinner: (v:boolean) => void, setExternalGrids: Function) => {
    readLocalFile(selectedProject.meshData.externalGrids as string).then((res) => {
      setExternalGrids(externalGridsDecode(JSON.parse(res)));
      // dispatch(setMeshGenerated({ status: 'Generated', projectToUpdate: selectedProject.faunaDocumentId as string }));
      setSpinner(false)
    })

  }

  const deleteMeshDataOnline = (project: Project) => {
    (project?.meshData.mesh) && deleteFileS3(project?.meshData.mesh as string).catch((err) => console.log(err));
    (project?.meshData.externalGrids) && deleteFileS3(project?.meshData.externalGrids as string).catch((err) => console.log(err));
  }

  const deleteMeshDataLocal = (project: Project) => {
    (project?.meshData.mesh) && deleteFile(project.meshData.mesh);
    (project?.meshData.externalGrids) && deleteFile(project.meshData.externalGrids)
  }

  const deleteProjectOnline = (project: Project) => {
    deleteMeshDataOnline(project)
    dispatch(removeProject(project.faunaDocumentId as string));
    dispatch(closeProjectTab(project.faunaDocumentId as string));
    execQuery(
      deleteSimulationProjectFromFauna,
      project.faunaDocumentId,
      project.parentFolder,
    );
  }

  const deleteProjectLocal = (project: Project) => {
    deleteMeshDataLocal(project)
    dispatch(removeProject(project.faunaDocumentId as string));
    dispatch(closeProjectTab(project.faunaDocumentId as string));
    execQuery(
      deleteSimulationProjectFromFauna,
      project.faunaDocumentId,
      project.parentFolder,
    );
  }

  const saveMeshData = (mesherOutput: any, externalGrid: any) => {
    if(selectedProject.storage === 'local'){
      saveMeshAndExternalGridsLocal(mesherOutput, externalGrid)
    }else{
      saveMeshAndExternalGridsToS3(mesherOutput, externalGrid)
    }
  }

  const loadMeshData = (setSpinner: (v: boolean) => void, setExternalGrids: Function) => {
    if(selectedProject.storage === 'local'){
      loadDataFromLocal(setSpinner, setExternalGrids)
    }else{
      loadDataFromS3(setSpinner, setExternalGrids)
    }
  }

  const deleteProject = (project: Project) => {
    if(project.storage === 'local'){
      deleteProjectLocal(project)
    }else{
      deleteProjectOnline(project)
    }
  }

  const deleteProjectStoredMeshData = (project: Project) => {
    if(project.storage === 'local'){
      deleteMeshDataLocal(project)
    }else{
      deleteMeshDataOnline(project)
    }
  }

  return {saveMeshData, loadMeshData, deleteProject, deleteProjectStoredMeshData}
};


