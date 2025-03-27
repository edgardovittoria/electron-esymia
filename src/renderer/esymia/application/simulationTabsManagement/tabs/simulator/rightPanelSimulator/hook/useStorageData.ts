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
  removeProject,
  selectedProjectSelector,
  setPathToExternalGridsNotFound,
} from '../../../../../../store/projectSlice';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteFile,
  readLocalFile,
} from '../../../../../../../fileSystemAPIs/fileSystemAPIs';
import { s3 } from '../../../../../../aws/s3Config';
import { addProjectTab, closeProjectTab, setAWSExternalGridsData } from '../../../../../../store/tabsAndMenuItemsSlice';
import { Brick } from '../components/createGridsExternals';
import { publishMessage } from '../../../../../../../middleware/stompMiddleware';
import { CanvasState } from '../../../../../../../cad_library';
import { UsersState } from '../../../../../../../cad_library/components/store/users/usersSlice';
import { GetObjectRequest } from 'aws-sdk/clients/s3';
import { useDynamoDBQuery } from '../../../../../dynamoDB/hook/useDynamoDBQuery';
import { addIDInProjectListInDynamoDB, createOrUpdateProjectInDynamoDB, deleteSimulationProjectFromDynamoDB } from '../../../../../dynamoDB/projectsFolderApi';

export const useStorageData = () => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(selectedProjectSelector) as Project;
  const { execQuery2 } = useDynamoDBQuery();

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
      selectedProject.id as string,
    ).then((res) => {
      setExternalGrids(externalGridsDecode(JSON.parse(res)));
      dispatch(
        setPathToExternalGridsNotFound({
          status: false,
          projectToUpdate: selectedProject.id as string,
        }),
      );
      setSpinner(false);
    });
  };

  const loadGridsFromS3 = (mesherBackend: boolean) => {
    if(mesherBackend){
      dispatch(publishMessage({
        queue: 'management',
        body: { message: "get grids", grids_id: selectedProject.meshData.type === 'Standard' ? selectedProject.meshData.externalGrids as string : selectedProject.meshData.surface as string, id: selectedProject.id }}))
    }else{
      const params:GetObjectRequest = {
        Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
        Key: selectedProject.meshData.surface as string,
        ResponseCacheControl: 'no-cache',
      };
      s3.getObject(params, (err, data) => {
        if (err) {
          console.log(err);
        }
        const res = JSON.parse(data.Body?.toString() as string);
        dispatch(setAWSExternalGridsData(res))
      });
    }
    
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

  const deleteResultsOnline = (project: Project) => {
    project?.simulation?.resultS3 &&
      deleteFileS3(project?.simulation?.resultS3).catch((err) =>
        console.log(err),
      );
  };

  const deletePortsOnline = (project: Project) => {
    project?.portsS3 &&
      deleteFileS3(project?.portsS3).catch((err) =>
        console.log(err),
      );
  }

  const deleteProjectOnline = (project: Project) => {
    deleteMeshDataOnline(project);
    deleteResultsOnline(project)
    deletePortsOnline(project)
    dispatch(removeProject(project.id as string));
    dispatch(closeProjectTab(project.id as string));
    execQuery2(
      deleteSimulationProjectFromDynamoDB,
      project.id,
      project.parentFolder,
      dispatch
    );
  };

  const deleteProjectLocal = (project: Project) => {
    deleteMeshDataLocal(project);
    dispatch(removeProject(project.id as string));
    dispatch(closeProjectTab(project.id as string));
    execQuery2(
      deleteSimulationProjectFromDynamoDB,
      project.id,
      project.parentFolder,
      dispatch
    );
  };

  const loadMeshData = (mesherBackend: boolean) => {
    if (selectedProject.storage === 'local') {
      loadGridsFromS3(mesherBackend);
    } else {
      loadGridsFromS3(mesherBackend);
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
    deleteMeshDataOnline(project);
  };

  const cloneMeshAndGridsS3 = (res:any, project: Project, clonedProject: Project, selectedFolder: Folder, setCloning: Function) => {
    s3.copyObject({
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
      CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.mesh}`,
      Key: `${process.env.MESHER_RIS_MODE === "backend" ? `${clonedProject.id}_mesh.json.gz` : `${clonedProject.id}_mesh.json.json`}`
    }).promise().then(mesh => {
      s3.copyObject({
        Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
        CopySource: project.meshData.type === 'Standard' ? `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.externalGrids}`: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.surface}`,
        Key: project.meshData.type === 'Standard' ? `${clonedProject.id}_grids.json.gz` : `${clonedProject.id}_surface.json.json`
      }).promise().then(grids => {
        if(project.simulation?.resultS3){
          s3.copyObject({
            Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
            CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.simulation.resultS3}`,
            Key: `${clonedProject.id}_results.json`
          }).promise().then(results => {
            clonedProject = {
              ...clonedProject,
              meshData: {
                ...clonedProject.meshData,
                mesh: `${process.env.MESHER_RIS_MODE === "backend" ? `${clonedProject.id}_mesh.json.gz` : `${clonedProject.id}_mesh.json.json`}`,
                externalGrids: clonedProject.meshData.type === 'Standard' ? `${clonedProject.id}_grids.json.gz` : "",
                surface: clonedProject.meshData.type === 'Standard' ? "" : `${clonedProject.id}_surface.json.json`
              },
              ports: [],
              portsS3: `${clonedProject.id}_ports.json`,
              simulation: {
                ...clonedProject.simulation,
                associatedProject: clonedProject.id,
                name: `${clonedProject.name} - sim`,
                resultS3: `${clonedProject.id}_results.json`
              },
            } as Project;
            execQuery2(createOrUpdateProjectInDynamoDB, clonedProject, dispatch).then(() => {
              selectedFolder?.id !== 'root' &&
                execQuery2(
                  addIDInProjectListInDynamoDB,
                  clonedProject.id,
                  selectedFolder,
                  dispatch
                );
              dispatch(addProject(clonedProject));
              dispatch(addProjectTab(clonedProject));
              setCloning(false)
              toast.success('Project Cloned!');
            })
          })
        } else {
          clonedProject = {
            ...clonedProject,
            meshData: {
              ...clonedProject.meshData,
              mesh: `${process.env.MESHER_RIS_MODE === "backend" ? `${clonedProject.id}_mesh.json.gz` : `${clonedProject.id}_mesh.json.json`}`,
              externalGrids: clonedProject.meshData.type === 'Standard' ? `${clonedProject.id}_grids.json.gz` : "",
              surface: clonedProject.meshData.type === 'Standard' ? "" : `${clonedProject.id}_surface.json.json`
            },
            ports: [],
            portsS3: `${clonedProject.id}_ports.json`,
          } as Project;
          execQuery2(createOrUpdateProjectInDynamoDB, clonedProject, dispatch).then(() => {
            selectedFolder?.id !== 'root' &&
              execQuery2(
                addIDInProjectListInDynamoDB,
                clonedProject.id,
                selectedFolder,
                dispatch
              );
            dispatch(addProject(clonedProject));
            dispatch(addProjectTab(clonedProject));
            setCloning(false)
            toast.success('Project Cloned!');
          })
        }
      })
    })
  }


  const cloneProject = (project: Project, selectedFolder: Folder, setCloning: (v:boolean) => void) => {
    let clonedProject = {
      id: crypto.randomUUID(),
      description: project.description,
      model: {} as CanvasState,
      owner: project.owner,
      parentFolder: project.parentFolder,
      ports: [],
      screenshot: project.screenshot,
      sharedWith: project.sharedWith,
      storage: project.storage,
      boundingBoxDimension: project.boundingBoxDimension,
      frequencies: project.frequencies,
      modelS3: project.modelS3,
      bricks: project.bricks,
      modelUnit: project.modelUnit,
      scatteringValue: project.scatteringValue,
      suggestedQuantum: project.suggestedQuantum,
      simulation: project.simulation,
      meshData: project.meshData,
      name: `${project?.name}_copy`,
    } as Project;
    execQuery2(createOrUpdateProjectInDynamoDB, clonedProject, dispatch).then(
      (res: any) => {
        if(project.portsS3){
          s3.copyObject({
            Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
            CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.portsS3}`,
            Key: `${clonedProject.id}_ports.json`
          }).promise().then(() => {
            if(project.meshData.meshGenerated === "Generated"){
              cloneMeshAndGridsS3(res, project, clonedProject, selectedFolder, setCloning)
            }else{
              clonedProject = {
                ...clonedProject,
                ports: [],
                portsS3: `${clonedProject.id}_ports.json`,
              } as Project;
              execQuery2(createOrUpdateProjectInDynamoDB, clonedProject, dispatch).then(() => {
                selectedFolder?.id !== 'root' &&
                  execQuery2(
                    addIDInProjectListInDynamoDB,
                    clonedProject.id,
                    selectedFolder,
                    dispatch
                  );
              dispatch(addProject(clonedProject));
              dispatch(addProjectTab(clonedProject));
              setCloning(false)
              toast.success('Project Cloned!');
              })
            }
          })
        }else{
          if(project.meshData.meshGenerated === "Generated"){
            cloneMeshAndGridsS3(res, project, clonedProject, selectedFolder, setCloning)
          }else{
            selectedFolder?.id !== 'root' &&
            execQuery2(createOrUpdateProjectInDynamoDB, clonedProject, dispatch).then(() => {
              execQuery2(
                addIDInProjectListInDynamoDB,
                clonedProject.id,
                selectedFolder,
                dispatch
              );
            })
            dispatch(addProject(clonedProject));
            dispatch(addProjectTab(clonedProject));
            setCloning(false)
            toast.success('Project Cloned!');
        }
        }
      },
    );
  };

  const shareMeshAndGridsS3 = (res:any, project: Project, clonedProject: Project, setShowSearchUser: Function) => {
    s3.copyObject({
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
      CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.mesh}`,
      Key: `${process.env.MESHER_RIS_MODE === "backend" ? `${clonedProject.id}_mesh.json.gz` : `${clonedProject.id}_mesh.json.json`}`
    }).promise().then(mesh => {
      s3.copyObject({
        Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
        CopySource: project.meshData.type === 'Standard' ? `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.externalGrids}`: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.surface}`,
        Key: `${project.meshData.type === "Standard" ? `${clonedProject.id}_grids.json.gz` : `${clonedProject.id}_surface.json.json`}`
      }).promise().then(grids => {
        if(project.simulation?.resultS3){
          s3.copyObject({
            Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
            CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.simulation.resultS3}`,
            Key: `${clonedProject.id}_results.json`
          }).promise().then(results => {
            clonedProject = {
              ...clonedProject,
              meshData: {
                ...project.meshData,
                mesh: `${clonedProject.id}_mesh.json.gz`,
                externalGrids: `${clonedProject.id}_grids.json.gz`
              },
              ports: [],
              portsS3: `${clonedProject.id}_ports.json`,
              simulation: {
                ...clonedProject.simulation,
                associatedProject: clonedProject.id,
                name: `${clonedProject.name} - sim`,
                resultS3: `${clonedProject.id}_results.json`
              },
            } as Project;
            execQuery2(createOrUpdateProjectInDynamoDB, clonedProject, dispatch).then(() => {
              setShowSearchUser(false)
              toast.success('Sharing Successful!!');
            })
          })
        } else {
          clonedProject = {
            ...clonedProject,
            meshData: {
              ...project.meshData,
              mesh: `${clonedProject.id}_mesh.json.gz`,
              externalGrids: `${clonedProject.id}_grids.json.gz`
            },
            ports: [],
            portsS3: `${clonedProject.id}_ports.json`,
          } as Project;
          execQuery2(createOrUpdateProjectInDynamoDB, clonedProject, dispatch).then(() => {
            setShowSearchUser(false)
            toast.success('Sharing Successful!!');
          })
        }
      })
    })
  }

  const shareProject = (project: Project, userToShare: UsersState, setShowSearchUser: Function) => {
    let clonedProject = {
      id: crypto.randomUUID(),
      description: project.description,
      model: {} as CanvasState,
      owner: userToShare,
      parentFolder: 'root',
      ports: [],
      screenshot: project.screenshot,
      sharedWith: project.sharedWith,
      storage: project.storage,
      boundingBoxDimension: project.boundingBoxDimension,
      frequencies: project.frequencies,
      modelS3: project.modelS3,
      modelUnit: project.modelUnit,
      scatteringValue: project.scatteringValue,
      suggestedQuantum: project.suggestedQuantum,
      shared: true,
      simulation: project.simulation,
      meshData: {
        meshApproved: false,
        meshGenerated: 'Not Generated',
        quantum: [0, 0, 0],
        pathToExternalGridsNotFound: false,
        validTopology: true,
        type: 'Standard'
      },
      name: `${project?.name}`,
    } as Project;
    execQuery2(createOrUpdateProjectInDynamoDB, clonedProject, dispatch).then(
      (res: any) => {
        if(project.portsS3){
          s3.copyObject({
            Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
            CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.portsS3}`,
            Key: `${clonedProject.id}_ports.json`
          }).promise().then(() => {
            if(project.meshData.meshGenerated === "Generated"){
              shareMeshAndGridsS3(res, project, clonedProject, setShowSearchUser)
            }else{
              clonedProject = {
                ...clonedProject,
                ports: [],
                portsS3: `${clonedProject.id}_ports.json`,
              } as Project;
              execQuery2(createOrUpdateProjectInDynamoDB, clonedProject, dispatch).then(() => {
                setShowSearchUser(false)
                toast.success('Sharing Successful!!');
              })
            }
          })
        }else{
          if(project.meshData.meshGenerated === "Generated"){
            shareMeshAndGridsS3(res, project, clonedProject, setShowSearchUser)
          }else{
            execQuery2(createOrUpdateProjectInDynamoDB, clonedProject, dispatch).then(() => {
              setShowSearchUser(false)
              toast.success('Sharing Successful!!');
            })
        }
        }
      },
    );
  };

  return {
    loadMeshData,
    deleteProject,
    deleteProjectStoredMeshData,
    cloneProject,
    shareProject
  };
};
