import {
  Folder,
  Project,
} from '../../../../../../../model/esymiaModels';
import { deleteFileS3 } from '../../../../../../../aws/mesherAPIs';
import {
  addProject,
  removeProject,
  selectedProjectSelector,
} from '../../../../../../../store/projectSlice';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { s3 } from '../../../../../../../aws/s3Config';
import {
  addProjectTab,
  closeProjectTab,
  setAWSExternalGridsData,
} from '../../../../../../../store/tabsAndMenuItemsSlice';
import { CanvasState } from '../../../../../../../../cad_library';
import { UsersState } from '../../../../../../../../cad_library/components/store/users/usersSlice';
import { GetObjectRequest } from 'aws-sdk/clients/s3';
import { useDynamoDBQuery } from '../../../../../../../../dynamoDB/hook/useDynamoDBQuery';
import {
  deleteSimulationProjectFromDynamoDB,
  createOrUpdateProjectInDynamoDB,
  addIDInProjectListInDynamoDB,
} from '../../../../../../../../dynamoDB/projectsFolderApi';
import axios from 'axios';
import pako from 'pako';

export const useStorageData = () => {
  const dispatch = useDispatch();
  const selectedProject = useSelector(selectedProjectSelector) as Project;
  const { execQuery2 } = useDynamoDBQuery();

  const loadGridsFromS3 = (mesherBackend: boolean) => {
    if (mesherBackend) {
      axios
        .post('http://localhost:8002/getGrids', {
          grids_id:
            selectedProject.meshData.type === 'Standard'
              ? (selectedProject.meshData.externalGrids as string)
              : (selectedProject.meshData.surface as string),
          id: selectedProject.id,
        })
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
      // dispatch(publishMessage({
      //   queue: 'management',
      //   body: { message: "get grids", grids_id: selectedProject.meshData.type === 'Standard' ? selectedProject.meshData.externalGrids as string : selectedProject.meshData.surface as string, id: selectedProject.id }}))
    } else {
      const params: GetObjectRequest = {
        Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
        Key: selectedProject.meshData.surface as string,
        ResponseCacheControl: 'no-cache',
      };
      s3.getObject(params, (err, data) => {
        if (err) {
          console.log(err);
          return;
        }
        try {
          // Check if the file is gzipped by looking at the key extension
          const isGzipped = (selectedProject.meshData.surface as string).endsWith('.gz');
          let jsonString: string;

          if (isGzipped && data.Body) {
            // Decompress gzipped data
            const uint8Array = new Uint8Array(data.Body as ArrayBuffer);
            const decompressed = pako.inflate(uint8Array, { to: 'string' });
            jsonString = decompressed;
          } else {
            // Plain JSON
            jsonString = data.Body?.toString() as string;
          }

          const res = JSON.parse(jsonString);
          dispatch(setAWSExternalGridsData(res));
        } catch (parseError) {
          console.error('Error parsing mesh data:', parseError);
        }
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
    project?.meshData.surface &&
      deleteFileS3(project?.meshData.surface as string).catch((err) =>
        console.log(err),
      );
  };

  const deleteResultsOnline = (project: Project) => {
    project?.simulation?.resultS3 &&
      deleteFileS3(project?.simulation?.resultS3).catch((err) =>
        console.log(err),
      );
  };

  const deletePortsOnline = (project: Project) => {
    project?.portsS3 &&
      deleteFileS3(project?.portsS3).catch((err) => console.log(err));
  };

  const deleteModelOnline = (project: Project) => {
    project?.shared && project?.modelS3 &&
      deleteFileS3(project?.modelS3).catch((err) => console.log(err));
  };

  const deleteProjectOnline = (project: Project, selectedFolder: Folder) => {
    deleteMeshDataOnline(project);
    deleteResultsOnline(project);
    deletePortsOnline(project);
    deleteModelOnline(project)
    dispatch(removeProject(project.id as string));
    dispatch(closeProjectTab(project.id as string));
    execQuery2(
      deleteSimulationProjectFromDynamoDB,
      project.id,
      project.parentFolder,
      selectedFolder,
      dispatch,
    );
  };

  const loadMeshData = (mesherBackend: boolean) => {
    if (selectedProject.storage === 'local') {
      loadGridsFromS3(mesherBackend);
    } else {
      loadGridsFromS3(mesherBackend);
    }
  };

  const deleteProject = (project: Project, selectedFodler: Folder) => {
    if (project.storage === 'local') {
      deleteProjectOnline(project, selectedFodler);
    } else {
      deleteProjectOnline(project, selectedFodler);
    }
  };

  const deleteProjectStoredMeshData = (project: Project) => {
    deleteMeshDataOnline(project);
  };

  const cloneMeshAndGridsS3 = (
    res: any,
    project: Project,
    clonedProject: Project,
    selectedFolder: Folder,
    setCloning: Function,
  ) => {
    s3.copyObject({
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
      CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.mesh}`,
      Key: `${project.meshData.type === 'Standard'
        ? `${clonedProject.id}_mesh.json.gz`
        : `${clonedProject.id}_mesh.json.gz`
        }`,
    })
      .promise()
      .then((mesh) => {
        s3.copyObject({
          Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
          CopySource:
            project.meshData.type === 'Standard'
              ? `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.externalGrids}`
              : `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.surface}`,
          Key:
            project.meshData.type === 'Standard'
              ? `${clonedProject.id}_grids.json.gz`
              : `${clonedProject.id}_surface.json.gz`,
        })
          .promise()
          .then((grids) => {
            if (project.simulation?.resultS3) {
              s3.copyObject({
                Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
                CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.simulation.resultS3}`,
                Key: `${clonedProject.id}_results.json`,
              })
                .promise()
                .then((results) => {
                  clonedProject = {
                    ...clonedProject,
                    meshData: {
                      ...clonedProject.meshData,
                      mesh: `${clonedProject.meshData.type === 'Standard'
                        ? `${clonedProject.id}_mesh.json.gz`
                        : `${clonedProject.id}_mesh.json.gz`
                        }`,
                      externalGrids:
                        clonedProject.meshData.type === 'Standard'
                          ? `${clonedProject.id}_grids.json.gz`
                          : undefined,
                      surface:
                        clonedProject.meshData.type === 'Standard'
                          ? undefined
                          : `${clonedProject.id}_surface.json.gz`,
                    },
                    ports: [],
                    portsS3: project.portsS3
                      ? `${clonedProject.id}_ports.json`
                      : undefined,
                    simulation: {
                      ...clonedProject.simulation,
                      associatedProject: clonedProject.id,
                      name: `${clonedProject.name} - sim`,
                      resultS3: `${clonedProject.id}_results.json`,
                    },
                  } as Project;
                  execQuery2(
                    createOrUpdateProjectInDynamoDB,
                    clonedProject,
                    dispatch,
                  ).then(() => {
                    selectedFolder?.id !== 'root' &&
                      execQuery2(
                        addIDInProjectListInDynamoDB,
                        clonedProject.id,
                        selectedFolder,
                        dispatch,
                      );
                    dispatch(addProject(clonedProject));
                    dispatch(addProjectTab(clonedProject));
                    setCloning(false);
                    toast.success('Project Cloned!');
                  });
                });
            } else {
              clonedProject = {
                ...clonedProject,
                meshData: {
                  ...clonedProject.meshData,
                  mesh: `${clonedProject.meshData.type === 'Standard'
                    ? `${clonedProject.id}_mesh.json.gz`
                    : `${clonedProject.id}_mesh.json.gz`
                    }`,
                  externalGrids:
                    clonedProject.meshData.type === 'Standard'
                      ? `${clonedProject.id}_grids.json.gz`
                      : undefined,
                  surface:
                    clonedProject.meshData.type === 'Standard'
                      ? undefined
                      : `${clonedProject.id}_surface.json.gz`,
                },
                ports: [],
                portsS3: project.portsS3
                  ? `${clonedProject.id}_ports.json`
                  : undefined,
              } as Project;
              execQuery2(
                createOrUpdateProjectInDynamoDB,
                clonedProject,
                dispatch,
              ).then(() => {
                selectedFolder?.id !== 'root' &&
                  execQuery2(
                    addIDInProjectListInDynamoDB,
                    clonedProject.id,
                    selectedFolder,
                    dispatch,
                  );
                dispatch(addProject(clonedProject));
                dispatch(addProjectTab(clonedProject));
                setCloning(false);
                toast.success('Project Cloned!');
              });
            }
          });
      });
  };

  const cloneMeshAndGridsS3ToSaveResults = (
    res: any,
    project: Project,
    clonedProject: Project,
    selectedFolder: Folder,
    setCloning: Function,
    removePreviousResults: Function,
  ) => {
    s3.copyObject({
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
      CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.mesh}`,
      Key: `${project.meshData.type === 'Standard'
        ? `${clonedProject.id}_mesh.json.gz`
        : `${clonedProject.id}_mesh.json.gz`
        }`,
    })
      .promise()
      .then((mesh) => {
        s3.copyObject({
          Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
          CopySource:
            project.meshData.type === 'Standard'
              ? `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.externalGrids}`
              : `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.surface}`,
          Key:
            project.meshData.type === 'Standard'
              ? `${clonedProject.id}_grids.json.gz`
              : `${clonedProject.id}_surface.json.gz`,
        })
          .promise()
          .then((grids) => {
            if (project.simulation?.resultS3) {
              s3.copyObject({
                Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
                CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.simulation.resultS3}`,
                Key: `${clonedProject.id}_results.json`,
              })
                .promise()
                .then((results) => {
                  clonedProject = {
                    ...clonedProject,
                    meshData: {
                      ...project.meshData,
                      mesh: `${project.meshData.type === 'Standard'
                        ? `${clonedProject.id}_mesh.json.gz`
                        : `${clonedProject.id}_mesh.json.gz`
                        }`,
                      externalGrids:
                        project.meshData.type === 'Standard'
                          ? `${clonedProject.id}_grids.json.gz`
                          : undefined,
                      surface:
                        project.meshData.type === 'Standard'
                          ? undefined
                          : `${clonedProject.id}_surface.json.gz`,
                    },
                    ports: [],
                    portsS3: project.portsS3
                      ? `${clonedProject.id}_ports.json`
                      : undefined,
                    simulation: {
                      ...clonedProject.simulation,
                      associatedProject: clonedProject.id,
                      name: `${clonedProject.name} - sim`,
                      resultS3: `${clonedProject.id}_results.json`,
                    },
                  } as Project;
                  execQuery2(
                    createOrUpdateProjectInDynamoDB,
                    clonedProject,
                    dispatch,
                  ).then(() => {
                    selectedFolder?.id !== 'root' &&
                      execQuery2(
                        addIDInProjectListInDynamoDB,
                        clonedProject.id,
                        selectedFolder,
                        dispatch,
                      );
                    dispatch(addProject(clonedProject));
                    setCloning(false);
                    removePreviousResults(project, dispatch);
                  });
                });
            } else {
              clonedProject = {
                ...clonedProject,
                meshData: {
                  ...project.meshData,
                  mesh: `${project.meshData.type === 'Standard'
                    ? `${clonedProject.id}_mesh.json.gz`
                    : `${clonedProject.id}_mesh.json.gz`
                    }`,
                  externalGrids:
                    project.meshData.type === 'Standard'
                      ? `${clonedProject.id}_grids.json.gz`
                      : undefined,
                  surface:
                    project.meshData.type === 'Standard'
                      ? undefined
                      : `${clonedProject.id}_surface.json.gz`,
                },
                ports: [],
                portsS3: project.portsS3
                  ? `${clonedProject.id}_ports.json`
                  : undefined,
              } as Project;
              execQuery2(
                createOrUpdateProjectInDynamoDB,
                clonedProject,
                dispatch,
              ).then(() => {
                selectedFolder?.id !== 'root' &&
                  execQuery2(
                    addIDInProjectListInDynamoDB,
                    clonedProject.id,
                    selectedFolder,
                    dispatch,
                  );
                dispatch(addProject(clonedProject));
                setCloning(false);
                removePreviousResults(project, dispatch);
              });
            }
          });
      });
  };

  const cloneProject = (
    project: Project,
    selectedFolder: Folder,
    setCloning: (v: boolean) => void,
    newProjectName?: string,
  ) => {
    let clonedProject = {
      ...project,
      id: crypto.randomUUID(),
      model: {} as CanvasState,
      ports: [],
      name: newProjectName ? newProjectName : `${project?.name}_copy`,
    } as Project;
    execQuery2(createOrUpdateProjectInDynamoDB, clonedProject, dispatch).then(
      (res: any) => {
        if (project.portsS3) {
          s3.copyObject({
            Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
            CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.portsS3}`,
            Key: `${clonedProject.id}_ports.json`,
          })
            .promise()
            .then(() => {
              if (project.meshData.meshGenerated === 'Generated') {
                cloneMeshAndGridsS3(
                  res,
                  project,
                  clonedProject,
                  selectedFolder,
                  setCloning,
                );
              } else {
                clonedProject = {
                  ...clonedProject,
                  ports: [],
                  portsS3:
                    project.ports.length > 0
                      ? `${clonedProject.id}_ports.json`
                      : undefined,
                } as Project;
                execQuery2(
                  createOrUpdateProjectInDynamoDB,
                  clonedProject,
                  dispatch,
                ).then(() => {
                  selectedFolder?.id !== 'root' &&
                    execQuery2(
                      addIDInProjectListInDynamoDB,
                      clonedProject.id,
                      selectedFolder,
                      dispatch,
                    );
                  dispatch(addProject(clonedProject));
                  dispatch(addProjectTab(clonedProject));
                  setCloning(false);
                  toast.success('Project Cloned!');
                });
              }
            });
        } else {
          if (project.meshData.meshGenerated === 'Generated') {
            cloneMeshAndGridsS3(
              res,
              project,
              clonedProject,
              selectedFolder,
              setCloning,
            );
          } else {
            selectedFolder?.id !== 'root' &&
              execQuery2(
                createOrUpdateProjectInDynamoDB,
                clonedProject,
                dispatch,
              ).then(() => {
                execQuery2(
                  addIDInProjectListInDynamoDB,
                  clonedProject.id,
                  selectedFolder,
                  dispatch,
                );
              });
            dispatch(addProject(clonedProject));
            dispatch(addProjectTab(clonedProject));
            setCloning(false);
            toast.success('Project Cloned!');
          }
        }
      },
    );
  };

  const cloneProjectToSaveResults = (
    project: Project,
    selectedFolder: Folder,
    setCloning: (v: boolean) => void,
    removePreviousResults: Function,
    newProjectName: string,
  ) => {
    let clonedProject = {
      ...project,
      id: crypto.randomUUID(),
      model: {} as CanvasState,
      ports: [],
      name: newProjectName,
    } as Project;
    execQuery2(createOrUpdateProjectInDynamoDB, clonedProject, dispatch).then(
      (res: any) => {
        if (project.portsS3) {
          s3.copyObject({
            Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
            CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.portsS3}`,
            Key: `${clonedProject.id}_ports.json`,
          })
            .promise()
            .then(() => {
              if (project.meshData.meshGenerated === 'Generated') {
                cloneMeshAndGridsS3ToSaveResults(
                  res,
                  project,
                  clonedProject,
                  selectedFolder,
                  setCloning,
                  removePreviousResults,
                );
              } else {
                clonedProject = {
                  ...clonedProject,
                  ports: [],
                  portsS3: project.portsS3
                    ? `${clonedProject.id}_ports.json`
                    : undefined,
                } as Project;
                execQuery2(
                  createOrUpdateProjectInDynamoDB,
                  clonedProject,
                  dispatch,
                ).then(() => {
                  selectedFolder?.id !== 'root' &&
                    execQuery2(
                      addIDInProjectListInDynamoDB,
                      clonedProject.id,
                      selectedFolder,
                      dispatch,
                    );
                  dispatch(addProject(clonedProject));
                  setCloning(false);
                  removePreviousResults(project, dispatch);
                });
              }
            });
        } else {
          if (project.meshData.meshGenerated === 'Generated') {
            cloneMeshAndGridsS3ToSaveResults(
              res,
              project,
              clonedProject,
              selectedFolder,
              setCloning,
              removePreviousResults,
            );
          } else {
            selectedFolder?.id !== 'root' &&
              execQuery2(
                createOrUpdateProjectInDynamoDB,
                clonedProject,
                dispatch,
              ).then(() => {
                execQuery2(
                  addIDInProjectListInDynamoDB,
                  clonedProject.id,
                  selectedFolder,
                  dispatch,
                );
              });
            dispatch(addProject(clonedProject));
            setCloning(false);
            removePreviousResults(project, dispatch);
          }
        }
      },
    );
  };

  const shareMeshAndGridsS3 = (
    res: any,
    project: Project,
    clonedProject: Project,
    setShowSearchUser: Function,
  ) => {
    s3.copyObject({
      Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
      CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.mesh}`,
      Key: `${project.meshData.type === 'Standard'
        ? `${clonedProject.id}_mesh.json.gz`
        : `${clonedProject.id}_mesh.json.gz`
        }`,
    })
      .promise()
      .then((mesh) => {
        s3.copyObject({
          Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
          CopySource:
            project.meshData.type === 'Standard'
              ? `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.externalGrids}`
              : `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.meshData.surface}`,
          Key: `${project.meshData.type === 'Standard'
            ? `${clonedProject.id}_grids.json.gz`
            : `${clonedProject.id}_surface.json.gz`
            }`,
        })
          .promise()
          .then((grids) => {
            if (project.simulation?.resultS3) {
              s3.copyObject({
                Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
                CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.simulation.resultS3}`,
                Key: `${clonedProject.id}_results.json`,
              })
                .promise()
                .then((results) => {
                  clonedProject = {
                    ...clonedProject,
                    modelS3: `${clonedProject.id}_model.json`,
                    meshData: {
                      ...project.meshData,
                      mesh:
                        project.meshData.type === 'Standard'
                          ? `${clonedProject.id}_mesh.json.gz`
                          : `${clonedProject.id}_mesh.json.gz`,
                      externalGrids:
                        project.meshData.type === 'Standard'
                          ? `${clonedProject.id}_grids.json.gz`
                          : undefined,
                      surface:
                        project.meshData.type === 'Standard'
                          ? undefined
                          : `${clonedProject.id}_surface.json.gz`,
                    },
                    ports: [],
                    portsS3: project.portsS3
                      ? `${clonedProject.id}_ports.json`
                      : undefined,
                    simulation: {
                      ...clonedProject.simulation,
                      associatedProject: clonedProject.id,
                      name: `${clonedProject.name} - sim`,
                      resultS3: `${clonedProject.id}_results.json`,
                    },
                  } as Project;
                  execQuery2(
                    createOrUpdateProjectInDynamoDB,
                    clonedProject,
                    dispatch,
                  ).then(() => {
                    setShowSearchUser(false);
                    toast.success('Sharing Successful!!');
                  });
                });
            } else {
              clonedProject = {
                ...clonedProject,
                modelS3: `${clonedProject.id}_model.json`,
                meshData: {
                  ...project.meshData,
                  mesh:
                    project.meshData.type === 'Standard'
                      ? `${clonedProject.id}_mesh.json.gz`
                      : `${clonedProject.id}_mesh.json.gz`,
                  externalGrids:
                    project.meshData.type === 'Standard'
                      ? `${clonedProject.id}_grids.json.gz`
                      : undefined,
                  surface:
                    project.meshData.type === 'Standard'
                      ? undefined
                      : `${clonedProject.id}_surface.json.gz`,
                },
                ports: [],
                portsS3: project.portsS3
                  ? `${clonedProject.id}_ports.json`
                  : undefined,
              } as Project;
              execQuery2(
                createOrUpdateProjectInDynamoDB,
                clonedProject,
                dispatch,
              ).then(() => {
                setShowSearchUser(false);
                toast.success('Sharing Successful!!');
              });
            }
          });
      });
  };

  const shareProject = (
    project: Project,
    userToShare: UsersState,
    setShowSearchUser: Function,
  ) => {
    let clonedProject = {
      ...project,
      id: crypto.randomUUID(),
      model: {} as CanvasState,
      owner: userToShare,
      ownerEmail: userToShare.email,
      parentFolder: 'root',
      ports: [],
      shared: true,
      meshData: {
        meshApproved: false,
        meshGenerated: 'Not Generated',
        quantum: [0, 0, 0],
        pathToExternalGridsNotFound: false,
        validTopology: true,
        type: 'Standard',
      },
      name: `${project?.name}`,
    } as Project;
    execQuery2(createOrUpdateProjectInDynamoDB, clonedProject, dispatch).then(
      (res: any) => {
        if (project.modelS3) {
          s3.copyObject({
            Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
            CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.modelS3}`,
            Key: `${clonedProject.id}_model.json`,
          })
            .promise()
            .then(() => {
              if (project.portsS3) {
                s3.copyObject({
                  Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
                  CopySource: `/${process.env.REACT_APP_AWS_BUCKET_NAME}/${project.portsS3}`,
                  Key: `${clonedProject.id}_ports.json`,
                })
                  .promise()
                  .then(() => {
                    if (project.meshData.meshGenerated === 'Generated') {
                      shareMeshAndGridsS3(
                        res,
                        project,
                        clonedProject,
                        setShowSearchUser,
                      );
                    } else {
                      clonedProject = {
                        ...clonedProject,
                        modelS3: `${clonedProject.id}_model.json`,
                        ports: [],
                        portsS3: project.portsS3
                          ? `${clonedProject.id}_ports.json`
                          : undefined,
                      } as Project;
                      execQuery2(
                        createOrUpdateProjectInDynamoDB,
                        clonedProject,
                        dispatch,
                      ).then(() => {
                        setShowSearchUser(false);
                        toast.success('Sharing Successful!!');
                      });
                    }
                  });
              } else {
                if (project.meshData.meshGenerated === 'Generated') {
                  shareMeshAndGridsS3(
                    res,
                    project,
                    clonedProject,
                    setShowSearchUser,
                  );
                } else {
                  execQuery2(
                    createOrUpdateProjectInDynamoDB,
                    { ...clonedProject, modelS3: `${clonedProject.id}_model.json` },
                    dispatch,
                  ).then(() => {
                    setShowSearchUser(false);
                    toast.success('Sharing Successful!!');
                  });
                }
              }
            });
        }
      },
    );
  };

  return {
    loadMeshData,
    deleteProject,
    deleteProjectStoredMeshData,
    cloneProject,
    shareProject,
    cloneProjectToSaveResults,
  };
};
