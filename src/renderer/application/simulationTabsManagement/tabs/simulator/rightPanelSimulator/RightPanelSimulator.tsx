import {
  ComponentEntity,
  exportToSTL,
  Material,
  useFaunaQuery
} from 'cad-library';
import React, { FC, useEffect, useRef, useState } from 'react';
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
  setSuggestedQuantum,
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
import { useEffectNotOnMount } from '../../../../../hook/useEffectNotOnMount';
import { DebounceInput } from 'react-debounce-input';
import {
  computeSuggestedQuantum,
  generateSTLListFromComponents,
  launchMeshing, saveMeshAndExternalGridsToS3
} from './components/rightPanelFunctions';

interface RightPanelSimulatorProps {
  selectedProject: Project;
  allMaterials?: Material[];
  externalGrids?: ExternalGridsObject;
}

export const RightPanelSimulator: React.FC<RightPanelSimulatorProps> = ({
                                                                        selectedProject,
                                                                        allMaterials,
                                                                        externalGrids
                                                                      }) => {
  const dispatch = useDispatch();
  const { execQuery } = useFaunaQuery();
  const [quantumDimsInput, setQuantumDimsInput] = useState<[number, number, number]>([0,0,0])
  const { meshApproved } = selectedProject.meshData;
  const meshGenerated = useSelector(meshGeneratedSelector);
  const solverIterations = useSelector(solverIterationsSelector)
  const convergenceThreshold = useSelector(convergenceTresholdSelector)
  const quantumDimensionsLabels = ["X", "Y", "Z"]
  const [suggestedQuantumError, setSuggestedQuantumError] = useState(false)

  useEffect(() => {
    if(!selectedProject?.suggestedQuantum && selectedProject.model.components){
      computeSuggestedQuantum(selectedProject, allMaterials as Material[], dispatch, execQuery, setSuggestedQuantumError)
    }
  }, []);

  useEffectNotOnMount(() => {
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
  }, [selectedProject.meshData.mesh,
    selectedProject.meshData.externalGrids])

  function checkQuantumDimensionsValidity() {
    let validity = true;
    quantumDimsInput.forEach((v) => {
      if (v === 0) {
        validity = false;
      }
    });
    return validity;
  }

  useEffect(() => {
    if(externalGrids){
      setQuantumDimsInput([
        parseFloat((externalGrids.cell_size.cell_size_x * 1000).toFixed(5)),
        parseFloat((externalGrids.cell_size.cell_size_y * 1000).toFixed(5)),
        parseFloat((externalGrids.cell_size.cell_size_z * 1000).toFixed(5)),
      ])
    }
  },[externalGrids])

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
            <div className='flex xl:flex-row flex-col gap-2 xl:gap-0 justify-between mt-2'>
              {quantumDimsInput.map(
                (quantumComponent, indexQuantumComponent) => (
                  <QuantumDimsInput
                    disabled={selectedProject.simulation?.status === 'Completed' || selectedProject.model?.components === undefined}
                    key={indexQuantumComponent}
                    label={quantumDimensionsLabels[indexQuantumComponent]}
                    value={parseFloat(quantumComponent.toFixed(5))}
                    onChange={(event) => setQuantumDimsInput(quantumDimsInput.map((q, ind) => ind === indexQuantumComponent ? parseFloat(event.target.value) : q) as [number, number, number])}
                  />
                )
              )}
            </div>
            {selectedProject.suggestedQuantum &&
              <div className='text-[12px] xl:text-base font-semibold mt-2'>
                Suggested: [{selectedProject.suggestedQuantum[0].toFixed(5)}, {selectedProject.suggestedQuantum[1].toFixed(5)}, {selectedProject.suggestedQuantum[2].toFixed(5)}]
              </div>
            }
            {suggestedQuantumError &&
              <div className='text-[12px] xl:text-base font-semibold mt-2'>
                Unable to suggest quantum: check mesher connection!
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
                  onClick={() => {
                    dispatch(setMeshGenerated('Generating'))
                    launchMeshing(selectedProject, allMaterials as Material[], quantumDimsInput, dispatch, saveMeshAndExternalGridsToS3)
                  }}
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
                    launchMeshing(selectedProject, allMaterials as Material[], quantumDimsInput, dispatch, saveMeshAndExternalGridsToS3)
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
            <div className='flex justify-between mt-2'>
              <div className='w-[45%]'>
              <span className='text-[12px] xl:text-base'>Outer</span>
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
              <span className='text-[12px] xl:text-base'>Inner</span>
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
                    dispatch(setSolverIterations([
                      solverIterations[0],
                      parseInt(event.target.value)
                    ]));
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
                <DebounceInput
                  debounceTimeout={500}
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


interface QuantumDimsInputProps {
  label: string,
  disabled: boolean,
  debounceTimeoutMilliSecs?: number,
  inputStep?: number,
  value: number,
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) & React.ChangeEventHandler<HTMLInputElement>,
}

const QuantumDimsInput: FC<QuantumDimsInputProps> = ({disabled, debounceTimeoutMilliSecs, inputStep, value, onChange, label}) => {
  return (
    <div className='xl:w-[30%] w-full'>
                    <span className='text-[12px] xl:text-base'>{label}</span>
                    <DebounceInput
                      disabled={disabled}
                      min={0.0}
                      className='w-full p-[4px] border-[1px] border-[#a3a3a3] text-[12px] font-bold rounded formControl'
                      type='number'
                      debounceTimeout={debounceTimeoutMilliSecs ? debounceTimeoutMilliSecs : 500}
                      step={inputStep? inputStep : 0.0001}
                      value={isNaN(value) ? 0 : value}
                      onChange={onChange}
                    />
                  </div>
  )
}
