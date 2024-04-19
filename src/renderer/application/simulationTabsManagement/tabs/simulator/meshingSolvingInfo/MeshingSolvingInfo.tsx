import {
  ComponentEntity,
  exportToSTL,
  Material,
  useFaunaQuery
} from 'cad-library';
import React, { useEffect, useState } from 'react';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { ImSpinner } from 'react-icons/im';

import {
  meshGeneratedSelector,
  setExternalGrids,
  setMesh,
  setMeshApproved,
  setMeshGenerated,
  setQuantum, setSuggestedQuantum,
  unsetMesh, updateSimulation
} from '../../../../../store/projectSlice';
import { deleteFileS3, uploadFileS3 } from '../../../../../aws/mesherAPIs';
import { selectMenuItem } from '../../../../../store/tabsAndMenuItemsSlice';
import {
  ExternalGridsObject,
  Project, Simulation, SolverOutput
} from '../../../../../model/esymiaModels';
import { updateProjectInFauna } from '../../../../../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../../../../../faunadb/apiAuxiliaryFunctions';
import { create_Grids_externals } from './components/createGridsExternals';
import {
  convergenceTresholdSelector, setConvergenceTreshold,
  setSolverIterations,
  solverIterationsSelector
} from '../../../../../store/solverSlice';

interface MeshingSolvingInfoProps {
  selectedProject: Project;
  allMaterials?: Material[];
  externalGrids?: ExternalGridsObject;
}

export const MeshingSolvingInfo: React.FC<MeshingSolvingInfoProps> = ({
                                                                        selectedProject,
                                                                        allMaterials,
                                                                        externalGrids
                                                                      }) => {
  const dispatch = useDispatch();
  const { execQuery } = useFaunaQuery();
  const quantumDimensions = selectedProject.meshData.quantum;
  const { meshApproved } = selectedProject.meshData;
  const meshGenerated = useSelector(meshGeneratedSelector);
  const solverIterations = useSelector(solverIterationsSelector)
  const convergenceThreshold = useSelector(convergenceTresholdSelector)

  useEffect(() => {
    if(!selectedProject?.suggestedQuantum){
      const components = selectedProject?.model
        ?.components as ComponentEntity[];
      const objToSendToMesher = {
        STLList:
          components &&
          allMaterials &&
          generateSTLListFromComponents(allMaterials, components),
      };
      axios
        .post('http://127.0.0.1:8003/meshingAdvice', objToSendToMesher)
        .then(res => dispatch(setSuggestedQuantum(res.data)))
    }
  }, []);

  useEffect(() => {
    if (
      typeof selectedProject.meshData.mesh === 'string' &&
      typeof selectedProject.meshData.externalGrids === 'string'
    ) {
      execQuery(
        updateProjectInFauna,
        convertInFaunaProjectThis(selectedProject)
      ).then(() => {
      });
    }
  }, [
    selectedProject.meshData.mesh,
    selectedProject.meshData.externalGrids
  ]);



  function generateSTLListFromComponents(
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

    const STLList: { material: string; STL: string }[] = [];

    filteredComponents.forEach((fc) => {
      const STLToPush = exportToSTL(fc);
      STLList.push({
        material: fc[0].material?.name as string,
        STL: STLToPush
      });
    });
    return STLList;
  }

  function checkQuantumDimensionsValidity() {
    let validity = true;
    quantumDimensions.forEach((v) => {
      if (v === 0) {
        validity = false;
      }
    });
    return validity;
  }


  const saveExternalGridsToS3 = async (externalGrids: any) => {
    const blobFile = new Blob([JSON.stringify(externalGrids)]);
    const meshFile = new File([blobFile], `mesh.json`, {
      type: 'application/json'
    });
    uploadFileS3(meshFile).then((res) => {
      if (res) {
        dispatch(setExternalGrids(res.key));
      }
    });
    return 'saved';
  };
  const saveMeshAndExternalGridsToS3 = async (
    mesherOutput: any,
    externalGrid: any
  ) => {
    const blobFile = new Blob([JSON.stringify(mesherOutput)]);
    const meshFile = new File([blobFile], `mesh.json`, {
      type: 'application/json'
    });

    uploadFileS3(meshFile)
      .then((res) => {
        if (res) {
          saveExternalGridsToS3(externalGrid)
            .then(() => {
              dispatch(setMeshGenerated('Generated'));
              dispatch(setMesh(res.key));
              return '';
            })
            .catch((err) => {
              console.log(err);
              window.alert('Error while meshing, please try again');
              dispatch(setMeshGenerated('Not Generated'));
            });
        }
        return '';
      })
      .catch((err) => console.log(err));
    return 'saved';
  };

  // Show updated quantum values whenever the mesh gets updated.
  useEffect(() => {
    if (externalGrids) {
      dispatch(
        setQuantum([
          externalGrids.cell_size.cell_size_x * 1000,
          externalGrids.cell_size.cell_size_y * 1000,
          externalGrids.cell_size.cell_size_z * 1000
        ])
      );
    }
  }, [externalGrids]);

  // Mesh generation and storage on S3.
  useEffect(() => {
    if (meshGenerated === 'Generating') {
      const components = selectedProject?.model
        ?.components as ComponentEntity[];
      const objToSendToMesher = {
        STLList:
          components &&
          allMaterials &&
          generateSTLListFromComponents(allMaterials, components),
        quantum: quantumDimensions
      };
      // local meshing: http://127.0.0.1:8003/meshing
      // lambda aws meshing: https://wqil5wnkowc7eyvzkwczrmhlge0rmobd.lambda-url.eu-west-2.on.aws/
      axios
        .post('http://127.0.0.1:8003/meshing', objToSendToMesher)
        .then((res) => {
          if (res.data.x) {
            dispatch(setMeshGenerated('Not Generated'));
            alert(
              `the size of the quantum on x is too large compared to the size of the model on x. Please reduce the size of the quantum on x! x must be less than ${res.data.max_x}`
            );
          } else if (res.data.y) {
            dispatch(setMeshGenerated('Not Generated'));
            alert(
              `the size of the quantum on y is too large compared to the size of the model on y. Please reduce the size of the quantum on y! y must be less than ${res.data.max_y}`
            );
          } else if (res.data.z) {
            dispatch(setMeshGenerated('Not Generated'));
            alert(
              `the size of the quantum on z is too large compared to the size of the model on z. Please reduce the size of the quantum on z! z must be less than ${res.data.max_z}`
            );
          } else if (res.data.mesh_is_valid.valid == false) {
            window.alert('Error! Mesh not valid. Please adjust quantum along ' + res.data.mesh_is_valid.axis + ' axis.');
            dispatch(setMeshGenerated('Not Generated'));
            dispatch(unsetMesh());
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
              cell_size: res.data.cell_size,
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
            saveMeshAndExternalGridsToS3(res.data, extGrids)
              .then(() => {
                return '';
              })
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => {
          if (err) {
            window.alert('Error while generating mesh, please try again');
            dispatch(setMeshGenerated('Not Generated'));
            dispatch(unsetMesh());
            console.log(err);
          }
        });
    }
  }, [meshGenerated]);

  return (
    <>
      {meshGenerated === 'Generating' && (
        <ImSpinner className='animate-spin w-12 h-12 absolute left-1/2 top-1/2' />
      )}
      <div
        className={`${
          (meshGenerated === 'Generating' ||
            selectedProject.simulation?.status === 'Queued') &&
          'opacity-40'
        } flex-col absolute right-[2%] top-[160px] xl:w-[22%] w-[28%] rounded-tl rounded-tr bg-white p-[10px] shadow-2xl overflow-y-scroll lg:max-h-[300px] xl:max-h-fit`}
      >
        <div className='flex'>
          <AiOutlineThunderbolt style={{ width: '25px', height: '25px' }} />
          <h5 className='ml-2 text-[12px] xl:text-base'>
            Meshing and Solving Info
          </h5>
        </div>
        <hr className='mt-1' />
        <div className='mt-3 p-[10px] xl:text-left text-center border-[1px] border-secondaryColor rounded bg-[#f6f6f6]'>
          <h6 className='xl:text-base text-[12px]'>
            Set quantum&apos;s dimensions
          </h6>
          <div className='mt-2'>

            <span className='text-[12px] xl:text-base'>X,Y,Z</span>
            <div className='flex xl:flex-row flex-col gap-2 xl:gap-0 justify-between mt-2'>
              {quantumDimensions.map(
                (quantumComponent, indexQuantumComponent) => (
                  <div className='xl:w-[30%] w-full'>
                    <input
                      disabled={
                        selectedProject.simulation?.status === 'Completed' ||
                        selectedProject.model?.components === undefined
                      }
                      min={0.0}
                      className='w-full p-[4px] border-[1px] border-[#a3a3a3] text-[12px] font-bold rounded formControl'
                      type='number'
                      step={0.0001}
                      value={parseFloat(quantumComponent.toFixed(4))}
                      onChange={(event) => {
                        if (indexQuantumComponent === 0) {
                          dispatch(
                            setQuantum([
                              parseFloat(event.target.value),
                              quantumDimensions[1],
                              quantumDimensions[2]
                            ])
                          );
                        } else if (indexQuantumComponent === 1) {
                          dispatch(
                            setQuantum([
                              quantumDimensions[0],
                              parseFloat(event.target.value),
                              quantumDimensions[2]
                            ])
                          );
                        } else if (indexQuantumComponent === 2) {
                          dispatch(
                            setQuantum([
                              quantumDimensions[0],
                              quantumDimensions[1],
                              parseFloat(event.target.value)
                            ])
                          );
                        }
                      }}
                    />
                  </div>
                )
              )}
            </div>
            {selectedProject.suggestedQuantum &&
              <div className='text-[12px] xl:text-base font-semibold mt-2'>
                Suggested: [{selectedProject.suggestedQuantum[0].toFixed(4)}, {selectedProject.suggestedQuantum[1].toFixed(4)}, {selectedProject.suggestedQuantum[2].toFixed(4)}]
              </div>
            }
          </div>
        </div>
        <div className='w-[100%] pt-4'>
          <div className='flex-column'>
            {meshGenerated === 'Not Generated' && (
              <div>
                <button
                  className={
                    checkQuantumDimensionsValidity()
                      ? 'button buttonPrimary w-[100%]'
                      : 'button bg-gray-300 text-gray-600 opacity-70 w-[100%]'
                  }
                  disabled={!checkQuantumDimensionsValidity()}
                  onClick={() => dispatch(setMeshGenerated('Generating'))}
                >
                  Generate Mesh
                </button>
              </div>
            )}
            {((meshGenerated === 'Generated' && !meshApproved) ||
              selectedProject.simulation?.status === 'Failed') && (
              <div className='flex justify-between'>
                <button
                  className='button buttonPrimary w-full text-[12px] xl:text-base'
                  disabled={!checkQuantumDimensionsValidity()}
                  onClick={() => {
                    dispatch(setMeshGenerated('Generating'));
                    deleteFileS3(selectedProject.meshData.mesh as string).then(
                      () => {
                        dispatch(unsetMesh());
                      }
                    );
                  }}
                >
                  Regenerate
                </button>
              </div>
            )}
          </div>
        </div>
        <div className='mt-3 p-[10px] xl:text-left text-center border-[1px] border-secondaryColor rounded bg-[#f6f6f6]'>
          <h6 className='text-[12px] xl:text-base'>Solver Iterations</h6>
          <div className='mt-2'>
            <span className='text-[12px] xl:text-base'>Inner, Outer</span>
            <div className='flex justify-between mt-2'>
              <div className='w-[45%]'>
                <input
                  disabled={
                    selectedProject.simulation?.status === 'Completed' ||
                    meshGenerated !== 'Generated'
                  }
                  min={1}
                  className='w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl'
                  type='number'
                  step={1}
                  value={
                    selectedProject.simulation
                      ? selectedProject.simulation.solverAlgoParams
                        .innerIteration
                      : solverIterations[0]
                  }
                  onChange={(event) => {
                    dispatch(setSolverIterations([
                      parseInt(event.target.value),
                      solverIterations[1]
                    ]));
                  }}
                />
              </div>
              <div className='w-[45%]'>
                <input
                  disabled={
                    selectedProject.simulation?.status === 'Completed' ||
                    meshGenerated !== 'Generated'
                  }
                  min={1}
                  className='w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl'
                  type='number'
                  step={1}
                  value={
                    selectedProject.simulation
                      ? selectedProject.simulation.solverAlgoParams
                        .outerIteration
                      : solverIterations[1]
                  }
                  onChange={(event) => {
                    setSolverIterations([
                      solverIterations[0],
                      parseInt(event.target.value)
                    ]);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className='mt-3 p-[10px] xl:text-left text-center border-[1px] border-secondaryColor rounded bg-[#f6f6f6]'>
          <h6 className='text-[12px] xl:text-base'>Convergence Threshold</h6>
          <div className='mt-2'>
            <div className='flex justify-between mt-2'>
              <div className='w-full'>
                <input
                  disabled={
                    selectedProject.simulation?.status === 'Completed' ||
                    meshGenerated !== 'Generated'
                  }
                  min={0.0000000001}
                  max={0.1}
                  className='w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl'
                  type='number'
                  step={0.0000000001}
                  value={
                    selectedProject.simulation
                      ? selectedProject.simulation.solverAlgoParams
                        .convergenceThreshold
                      : convergenceThreshold
                  }
                  onChange={(event) => {
                    dispatch(setConvergenceTreshold(parseFloat(event.target.value)));
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {selectedProject.simulation?.status === 'Completed' ? (
          <button
            className='button buttonPrimary w-[100%] mt-3 text-[12px] xl:text-base'
            onClick={() => {
              dispatch(selectMenuItem('Results'));
            }}
          >
            Results
          </button>
        ) : (
          <button
            className={`w-full mt-3 button text-[12px] xl:text-base
              ${
              meshGenerated !== 'Generated'
                ? 'bg-gray-300 text-gray-600 opacity-70'
                : 'buttonPrimary'
            }`}
            disabled={meshGenerated !== 'Generated'}
            onClick={() => {
              const simulation: Simulation = {
                name: `${selectedProject?.name} - sim`,
                started: Date.now().toString(),
                ended: '',
                results: {} as SolverOutput,
                status: 'Queued',
                associatedProject: selectedProject?.faunaDocumentId as string,
                solverAlgoParams: {
                  innerIteration: solverIterations[0],
                  outerIteration: solverIterations[1],
                  convergenceThreshold
                }
              };
              dispatch(updateSimulation(simulation));
              dispatch(setMeshApproved(true));
            }}
          >
            Start Simulation
          </button>
        )}
      </div>
    </>
  );
};

