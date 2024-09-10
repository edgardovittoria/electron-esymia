import {
  CellSize,
  CellsNumber,
  ExternalGridsObject,
  Folder,
  OriginPoint,
  Project,
} from '../../../../../../model/esymiaModels';
import { deleteFileS3 } from '../../../../../../aws/mesherAPIs';
import {
  addProject,
  homePathSelector,
  removeProject,
  selectedProjectSelector,
  setMeshGenerated,
  setPathToExternalGridsNotFound,
} from '../../../../../../store/projectSlice';
import {
  createSimulationProjectInFauna,
  deleteSimulationProjectFromFauna,
  addIDInFolderProjectsList,
  updateProjectInFauna
} from '../../../../../../faunadb/projectsFolderAPIs';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteFile,
  readLocalFile,
} from '../../../../../../../fileSystemAPIs/fileSystemAPIs';
import { s3 } from '../../../../../../aws/s3Config';
import { addProjectTab, closeProjectTab } from '../../../../../../store/tabsAndMenuItemsSlice';
import { Brick } from '../components/createGridsExternals';
import { publishMessage } from '../../../../../../../middleware/stompMiddleware';
import { convertInFaunaProjectThis } from '../../../../../../faunadb/apiAuxiliaryFunctions';
import { useFaunaQuery } from '../../../../../../faunadb/hook/useFaunaClient';

export const useStorageData = () => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(selectedProjectSelector) as Project;
  const homePath = useSelector(homePathSelector);
  const { execQuery } = useFaunaQuery();

  // const saveMeshAndExternalGridsToS3 = (
  //   mesherOutput: any,
  //   externalGrid: any,
  // ) => {
  //   if (selectedProject.meshData.mesh) {
  //     deleteFileS3(selectedProject.meshData.mesh).then(() => {});
  //   }
  //   if (selectedProject.meshData.externalGrids) {
  //     deleteFileS3(selectedProject.meshData.externalGrids).then(() => {});
  //   }
  //   const blobFile = new Blob([JSON.stringify(mesherOutput)]);
  //   const meshFile = new File([blobFile], `mesh.json`, {
  //     type: 'application/json',
  //   });
  //   uploadFileS3(meshFile, selectedProject)
  //     .then((res) => {
  //       if (res) {
  //         const blobFile = new Blob([JSON.stringify(externalGrid)]);
  //         const meshFile = new File([blobFile], `mesh.json`, {
  //           type: 'application/json',
  //         });
  //         uploadFileS3(meshFile, selectedProject)
  //           .then((resExternalGrids) => {
  //             if (resExternalGrids) {
  //               dispatch(
  //                 setMeshGenerated({
  //                   status: 'Generated',
  //                   projectToUpdate: selectedProject.faunaDocumentId as string,
  //                 }),
  //               );
  //               dispatch(
  //                 setMesh({
  //                   mesh: res.key,
  //                   projectToUpdate: selectedProject.faunaDocumentId as string,
  //                 }),
  //               );
  //               dispatch(
  //                 setExternalGrids({
  //                   extGrids: resExternalGrids.key,
  //                   projectToUpdate: selectedProject.faunaDocumentId as string,
  //                 }),
  //               );
  //               execQuery(
  //                 updateProjectInFauna,
  //                 convertInFaunaProjectThis({
  //                   ...selectedProject,
  //                   meshData: {
  //                     ...selectedProject.meshData,
  //                     mesh: res.key,
  //                     externalGrids: resExternalGrids.key,
  //                     meshGenerated: 'Generated',
  //                   },
  //                 }),
  //               ).then(() => {});
  //               return '';
  //             }
  //           })
  //           .catch((err) => {
  //             console.log(err);
  //             toast.error('Error while saving mesh, please try again');
  //             dispatch(
  //               setMeshGenerated({
  //                 status: 'Not Generated',
  //                 projectToUpdate: selectedProject.faunaDocumentId as string,
  //               }),
  //             );
  //           });
  //       }
  //       return '';
  //     })
  //     .catch((err) => console.log(err));
  //   return 'saved';
  // };

  // const saveMeshAndExternalGridsLocal = (
  //   mesherOutput: any,
  //   externalGrid: any,
  // ) => {
  //   //join('esymiaProjects', 'mesherOutputs', selectedProject.faunaDocumentId as string, '.json')
  //   uploadFile(
  //     'esymiaProjects/mesherOutputs/' +
  //       selectedProject.faunaDocumentId +
  //       '.json',
  //     mesherOutput,
  //   ).then(() => {
  //     uploadFile(
  //       'esymiaProjects/externalGrids/' +
  //         selectedProject.faunaDocumentId +
  //         '.json',
  //       externalGrid,
  //     )
  //       .then(() => {
  //         dispatch(
  //           setMeshGenerated({
  //             status: 'Generated',
  //             projectToUpdate: selectedProject.faunaDocumentId as string,
  //           }),
  //         );
  //         dispatch(
  //           setMesh({
  //             mesh:
  //               homePath +
  //               '/esymiaProjects/mesherOutputs/' +
  //               selectedProject.faunaDocumentId +
  //               '.json',
  //             projectToUpdate: selectedProject.faunaDocumentId as string,
  //           }),
  //         );
  //         dispatch(
  //           setExternalGrids({
  //             extGrids:
  //               homePath +
  //               '/esymiaProjects/externalGrids/' +
  //               selectedProject.faunaDocumentId +
  //               '.json',
  //             projectToUpdate: selectedProject.faunaDocumentId as string,
  //           }),
  //         );
  //         execQuery(
  //           updateProjectInFauna,
  //           convertInFaunaProjectThis({
  //             ...selectedProject,
  //             meshData: {
  //               ...selectedProject.meshData,
  //               mesh:
  //                 homePath +
  //                 '/esymiaProjects/mesherOutputs/' +
  //                 selectedProject.faunaDocumentId +
  //                 '.json',
  //               externalGrids:
  //                 homePath +
  //                 '/esymiaProjects/externalGrids/' +
  //                 selectedProject.faunaDocumentId +
  //                 '.json',
  //               meshGenerated: 'Generated',
  //             },
  //           }),
  //         ).then(() => {});
  //         return '';
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         toast.error('Error while saving mesh, please try again');
  //         dispatch(
  //           setMeshGenerated({
  //             status: 'Not Generated',
  //             projectToUpdate: selectedProject.faunaDocumentId as string,
  //           }),
  //         );
  //       });
  //   });
  // };

  // const loadDataFromS3 = (
  //   setExternalGrids: Function,
  // ) => {
  //   s3.getObject(
  //     {
  //       Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
  //       Key: selectedProject.meshData.externalGrids as string,
  //     },
  //     (err, data) => {
  //       if (err) {
  //         console.log(err);
  //       }
  //       setExternalGrids(
  //         JSON.parse(data.Body?.toString() as string) as ExternalGridsObject,
  //       );
  //       dispatch(
  //         setMeshGenerated({
  //           status: 'Generated',
  //           projectToUpdate: selectedProject.faunaDocumentId as string,
  //         }),
  //       );
  //     },
  //   );
  // };

  const externalGridsDecode = (extGridsJson: any) => {
    let gridsPairs: [string, Brick[]][] = [];
    Object.entries(extGridsJson.externalGrids).forEach((material) =>
      gridsPairs.push([
        material[0],
        (material[1] as string).split('A').map((brString) => {
          let coords = brString.split('-').map((c) => parseInt(c));
          return { x: coords[0], y: coords[1], z: coords[2] } as Brick;
        }),
      ]),
    );
    let externalGrids = Object.fromEntries(gridsPairs);
    let cellSizeCoords = (extGridsJson.cell_size as string)
      .split('-')
      .map((c) => parseFloat(c) / 1000);
    let cell_size = {
      cell_size_x: cellSizeCoords[0],
      cell_size_y: cellSizeCoords[1],
      cell_size_z: cellSizeCoords[2],
    } as CellSize;
    let nCellsCoords = (extGridsJson.n_cells as string)
      .split('-')
      .map((c) => parseFloat(c));
    let n_cells = {
      n_cells_x: nCellsCoords[0],
      n_cells_y: nCellsCoords[1],
      n_cells_z: nCellsCoords[2],
    } as CellsNumber;
    let originCoords = (extGridsJson.origin as string)
      .split('-')
      .map((c) => parseFloat(c));
    let origin = {
      origin_x: originCoords[0],
      origin_y: originCoords[1],
      origin_z: originCoords[2],
    } as OriginPoint;
    return {
      cell_size: cell_size,
      externalGrids: externalGrids,
      n_cells: n_cells,
      origin: origin,
    } as ExternalGridsObject;
  };

  const loadDataFromLocal = (
    setSpinner: (v: boolean) => void,
    setExternalGrids: Function,
  ) => {
    readLocalFile(
      selectedProject.meshData.externalGrids as string,
      selectedProject.faunaDocumentId as string,
    ).then((res) => {
      //console.log(res)

      // if(res === 'path not found'){
      //   dispatch(setPathToExternalGridsNotFound({ status: true, projectToUpdate: selectedProject.faunaDocumentId as string }));
      // }else{

      // }
      setExternalGrids(externalGridsDecode(JSON.parse(res)));
      dispatch(
        setPathToExternalGridsNotFound({
          status: false,
          projectToUpdate: selectedProject.faunaDocumentId as string,
        }),
      );
      setSpinner(false);
    });
  };

  const loadGridsFromS3 = () => {
    dispatch(publishMessage({
      queue: 'management',
      body: { message: "get grids", grids_id: selectedProject.meshData.externalGrids as string }}))
  };


  const deleteMeshDataOnline = (project: Project) => {
    project?.meshData.mesh &&
      deleteFileS3(project?.meshData.mesh as string).catch((err) =>
        console.log(err),
      );
    project?.meshData.externalGrids &&
      deleteFileS3(project?.meshData.externalGrids as string).catch((err) =>
        console.log(err),
      );
  };

  const deleteMeshDataLocal = (project: Project) => {
    project?.meshData.mesh && deleteFile(project.meshData.mesh);
    project?.meshData.externalGrids &&
      deleteFile(project.meshData.externalGrids);
  };

  const deleteProjectOnline = (project: Project) => {
    deleteMeshDataOnline(project);
    dispatch(removeProject(project.faunaDocumentId as string));
    dispatch(closeProjectTab(project.faunaDocumentId as string));
    execQuery(
      deleteSimulationProjectFromFauna,
      project.faunaDocumentId,
      project.parentFolder,
      dispatch
    );
  };

  const deleteProjectLocal = (project: Project) => {
    deleteMeshDataLocal(project);
    dispatch(removeProject(project.faunaDocumentId as string));
    dispatch(closeProjectTab(project.faunaDocumentId as string));
    execQuery(
      deleteSimulationProjectFromFauna,
      project.faunaDocumentId,
      project.parentFolder,
      dispatch
    );
  };

  // const saveMeshData = (mesherOutput: any, externalGrid: any) => {
  //   if (selectedProject.storage === 'local') {
  //     saveMeshAndExternalGridsLocal(mesherOutput, externalGrid);
  //   } else {
  //     saveMeshAndExternalGridsToS3(mesherOutput, externalGrid);
  //   }
  // };

  const loadMeshData = () => {
    if (selectedProject.storage === 'local') {
      loadGridsFromS3();
    } else {
      loadGridsFromS3();
    }
  };

  const deleteProject = (project: Project) => {
    if (project.storage === 'local') {
      deleteProjectOnline(project);
    } else {
      deleteProjectOnline(project);
    }
  };

  const deleteProjectStoredMeshData = (project: Project) => {
    if (project.storage === 'local') {
      deleteMeshDataLocal(project);
    } else {
      deleteMeshDataOnline(project);
    }
  };

  const cloneProject = (project: Project, selectedFolder: Folder, setCloning: (v:boolean) => void) => {
    let clonedProject = {
      ...project,
      meshData: {
        meshApproved: false,
        meshGenerated: 'Not Generated',
        quantum: [0, 0, 0],
        pathToExternalGridsNotFound: false,
      },
      name: `${project?.name}_copy`,
    } as Project;
    execQuery(createSimulationProjectInFauna, clonedProject, dispatch).then(
      (res: any) => {
        if(project.meshData.meshGenerated === "Generated"){
          s3.copyObject({
            Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
            CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.mesh}`,
            Key: `${res.ref.value.id}_mesh.json.gz`
          }).promise().then(mesh => {
            console.log(mesh)
            s3.copyObject({
              Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
              CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.externalGrids}`,
              Key: `${res.ref.value.id}_grids.json.gz`
            }).promise().then(grids => {
              clonedProject = {
                ...clonedProject,
                meshData: {
                  ...project.meshData,
                  mesh: `${res.ref.value.id}_mesh.json.gz`,
                  externalGrids: `${res.ref.value.id}_grids.json.gz`
                },
                faunaDocumentId: res.ref.value.id,
                simulation: project.simulation ? {
                  ...project.simulation,
                  name: `${project?.name}_copy - sim`,
                  associatedProject: res.ref.value.id,
                } : undefined
              } as Project;
              execQuery(updateProjectInFauna, convertInFaunaProjectThis(clonedProject), dispatch).then(() => {
                selectedFolder?.faunaDocumentId !== 'root' &&
                execQuery(
                  addIDInFolderProjectsList,
                  clonedProject.faunaDocumentId,
                  selectedFolder,
                  dispatch
                );
              dispatch(addProject(clonedProject));
              dispatch(addProjectTab(clonedProject));
              setCloning(false)
              toast.success('Project Cloned!');
              })
            })
          })
        }else{
          clonedProject = {
            ...clonedProject,
            faunaDocumentId: res.ref.value.id,
          } as Project;
          selectedFolder?.faunaDocumentId !== 'root' &&
            execQuery(
              addIDInFolderProjectsList,
              clonedProject.faunaDocumentId,
              selectedFolder,
              dispatch
            );
          dispatch(addProject(clonedProject));
          dispatch(addProjectTab(clonedProject));
          setCloning(false)
          toast.success('Project Cloned!');
        }
      },
    );
  };

  return {
    //saveMeshData,
    loadMeshData,
    deleteProject,
    deleteProjectStoredMeshData,
    cloneProject
  };
};
