import { ComponentEntity, Material, useFaunaQuery } from 'cad-library';
import React, { FC, Fragment, useEffect, useState } from 'react';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';

import {
  meshGeneratedSelector,
  pathToExternalGridsNotFoundSelector,
  setMeshApproved,
  setMeshGenerated,
  setPreviousMeshStatus,
  setQuantum,
  setSuggestedQuantum,
  suggestedQuantumSelector,
  updateSimulation,
} from '../../../../../store/projectSlice';
import {
  meshAdviceSelector,
  selectMenuItem,
} from '../../../../../store/tabsAndMenuItemsSlice';
import {
  ExternalGridsObject,
  Project,
  Simulation,
  SolverOutput,
} from '../../../../../model/esymiaModels';
import {
  convergenceTresholdSelector,
  setConvergenceTreshold,
  setSolverIterations,
  solverIterationsSelector,
} from '../../../../../store/solverSlice';
import { DebounceInput } from 'react-debounce-input';
import { LiaCubeSolid, LiaCubesSolid } from 'react-icons/lia';
import { Dialog, Transition } from '@headlessui/react';
import { MesherStatusSelector } from '../../../../../store/pluginsSlice';
import { generateSTLListFromComponents } from './components/rightPanelFunctions';
import { convertInFaunaProjectThis } from '../../../../../faunadb/apiAuxiliaryFunctions';
import { updateProjectInFauna } from '../../../../../faunadb/projectsFolderAPIs';
import { publishMessage } from '../../../../../../middleware/stompMiddleware';

interface RightPanelSimulatorProps {
  selectedProject: Project;
  allMaterials?: Material[];
  externalGrids?: ExternalGridsObject;
}

export const RightPanelSimulator: React.FC<RightPanelSimulatorProps> = ({
  selectedProject,
  allMaterials,
  externalGrids,
}) => {
  const dispatch = useDispatch();
  const { execQuery } = useFaunaQuery();
  const [quantumDimsInput, setQuantumDimsInput] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const meshGenerated = useSelector(meshGeneratedSelector);
  const solverIterations = useSelector(solverIterationsSelector);
  const convergenceThreshold = useSelector(convergenceTresholdSelector);
  const quantumDimensionsLabels = ['X', 'Y', 'Z'];
  const [suggestedQuantumError, setSuggestedQuantumError] = useState<{
    active: boolean;
    type?: 'Mesher Not Active' | 'Frequencies not set';
  }>({ active: false });
  const [showModalRefine, setShowModalRefine] = useState<boolean>(false);
  const [refineMode, setRefineMode] = useState<'refine' | 'coarsen'>('refine');
  const mesherStatus = useSelector(MesherStatusSelector);
  const suggestedQuantum = useSelector(suggestedQuantumSelector);
  const meshAdvice = useSelector(meshAdviceSelector).filter(
    (item) => item.id === (selectedProject.faunaDocumentId as string),
  )[0];
  const pathToExternalGridsNotFound = useSelector(pathToExternalGridsNotFoundSelector)

  useEffect(() => {
    suggestedQuantum && setQuantumDimsInput(suggestedQuantum);
  }, [suggestedQuantum]);

  useEffect(() => {
    if (selectedProject.model.components && mesherStatus === 'ready' && selectedProject.frequencies && selectedProject.frequencies.length > 0) {
      setSuggestedQuantumError({ active: false });
      if (
        !selectedProject.suggestedQuantum &&
        selectedProject.meshData.previousMeshStatus !== 'Generated' &&
        selectedProject.frequencies &&
        selectedProject.frequencies.length > 0
      ) {
        const components = selectedProject?.model
          ?.components as ComponentEntity[];
        const objToSendToMesher = {
          STLList:
            components &&
            allMaterials &&
            generateSTLListFromComponents(allMaterials, components),
          id: selectedProject.faunaDocumentId as string,
        };
        dispatch(publishMessage({
          queue: 'management',
          body: {
            message: 'compute suggested quantum',
            body: objToSendToMesher
          },
        }))
        // client.publish({
        //   destination: 'management',
        //   body: JSON.stringify({
        //     message: 'compute suggested quantum',
        //     body: objToSendToMesher,
        //   }),
        // });
      }
    } else if (mesherStatus === 'idle' || mesherStatus === 'starting') {
      if (selectedProject.meshData.previousMeshStatus === 'Generated') {
        setQuantumDimsInput(selectedProject.meshData.quantum);
      } else {
        setQuantumDimsInput([0, 0, 0]);
      }
      setSuggestedQuantumError({ active: true, type: 'Mesher Not Active' });
    } else if (selectedProject.frequencies && selectedProject.frequencies.length === 0) {
      console.log('qui')
      setSuggestedQuantumError({ active: true, type: 'Frequencies not set' });
    }
  }, [mesherStatus]);

  const getEscalFrom = (unit?: string) => {
    let escal = 1.0;
    if (unit !== undefined) {
      if (unit === 'm') escal = 1.0;
      if (unit === 'dm') escal = 1e1;
      if (unit === 'cm') escal = 1e2;
      if (unit === 'mm') escal = 1e3;
      if (unit === 'microm') escal = 1e6;
      if (unit === 'nanom') escal = 1e9;
    }
    return escal;
  };

  useEffect(() => {
    if (
      selectedProject.frequencies?.length &&
      selectedProject.frequencies?.length > 0 &&
      meshAdvice
    ) {
      dispatch(
        setSuggestedQuantum([
          Math.min(
            (3e8 /
              selectedProject.frequencies[
                selectedProject.frequencies?.length - 1
              ] /
              40) *
              getEscalFrom(selectedProject.modelUnit),
            parseFloat(meshAdvice.quantum[0].toFixed(5)),
          ),
          Math.min(
            (3e8 /
              selectedProject.frequencies[
                selectedProject.frequencies?.length - 1
              ] /
              40) *
              getEscalFrom(selectedProject.modelUnit),
            parseFloat(meshAdvice.quantum[1].toFixed(5)),
          ),
          Math.min(
            (3e8 /
              selectedProject.frequencies[
                selectedProject.frequencies?.length - 1
              ] /
              40) *
              getEscalFrom(selectedProject.modelUnit),
            parseFloat(meshAdvice.quantum[2].toFixed(5)),
          ),
        ]),
      );
      execQuery(
        updateProjectInFauna,
        convertInFaunaProjectThis({
          ...selectedProject,
          suggestedQuantum: [
            parseFloat(meshAdvice.quantum[0].toFixed(5)),
            parseFloat(meshAdvice.quantum[1].toFixed(5)),
            parseFloat(meshAdvice.quantum[2].toFixed(5)),
          ],
        } as Project),
      ).then();
    }
  }, [meshAdvice]);

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
    if (externalGrids) {
      setQuantumDimsInput([
        parseFloat((externalGrids.cell_size.cell_size_x * 1000).toFixed(5)),
        parseFloat((externalGrids.cell_size.cell_size_y * 1000).toFixed(5)),
        parseFloat((externalGrids.cell_size.cell_size_z * 1000).toFixed(5)),
      ]);
    }
  }, [externalGrids]);

  /* const infoModal = useSelector(infoModalSelector);

  useEffect(() => {
    if (alert && infoModal.isConfirmed) {
      setAlert(false);
    }
  }, [infoModal.isConfirmed]); */

  return (
    <>
      {/* {meshGenerated === 'Generating' && (
        <MeshingStatusItem selectedProject={selectedProject} quantumDimsInput={quantumDimsInput} allMaterials={allMaterials as Material[]}
                       meshStatus={meshGenerated} setAlert={setAlert} />
      )} */}
      <div
        className={`${
          (meshGenerated === 'Generating' ||
            selectedProject.simulation?.status === 'Queued') &&
          'opacity-40'
        } flex-col absolute right-[2%] top-[180px] xl:w-[22%] w-[28%] rounded-tl rounded-tr bg-white p-[10px] shadow-2xl overflow-y-scroll lg:max-h-[300px] xl:max-h-fit`}
      >
        <div className="flex">
          <AiOutlineThunderbolt style={{ width: '25px', height: '25px' }} />
          <h5 className="ml-2 text-[12px] xl:text-base">
            Meshing and Solving Info
          </h5>
        </div>
        <hr className="mt-1" />
        <div className="mt-3 p-[10px] xl:text-left text-center border-[1px] border-secondaryColor rounded bg-[#f6f6f6]">
          <h6 className="xl:text-base text-center text-[12px]">
            Set quantum&apos;s dimensions
          </h6>
          <hr className="mt-2 border-[1px] border-gray-200" />
          {selectedProject.frequencies &&
            selectedProject.frequencies.length > 0 && (
              <div className="flex flex-col my-3 items-center">
                <span className="text-sm">
                  Max Frequency:{' '}
                  <span className="font-bold">
                    {selectedProject.frequencies[
                      selectedProject.frequencies.length - 1
                    ].toExponential()}
                  </span>
                </span>
                <span className="text-sm">
                  Lambda Factor: <span className="font-bold">40</span>
                </span>
              </div>
            )}
          <div className="mt-2">
            <div className="flex xl:flex-row flex-col gap-2 xl:gap-0 justify-between mt-2">
              {quantumDimsInput.map(
                (quantumComponent, indexQuantumComponent) => (
                  <QuantumDimsInput
                    dataTestId={'quantumInput' + indexQuantumComponent}
                    disabled={true}
                    //disabled={selectedProject.simulation?.status === 'Completed' || selectedProject.model?.components === undefined}
                    key={indexQuantumComponent}
                    label={quantumDimensionsLabels[indexQuantumComponent]}
                    value={parseFloat(quantumComponent.toFixed(5))}
                    onChange={(event) =>
                      setQuantumDimsInput(
                        quantumDimsInput.map((q, ind) =>
                          ind === indexQuantumComponent
                            ? parseFloat(event.target.value)
                            : q,
                        ) as [number, number, number],
                      )
                    }
                  />
                ),
              )}
            </div>
            {/* {selectedProject.suggestedQuantum && selectedProject && selectedProject.frequencies &&
              <div className='text-[12px] xl:text-base font-semibold mt-2'>
                Suggested:
                [
                  {selectedProject.suggestedQuantum[0].toFixed(5)},
                  {selectedProject.suggestedQuantum[1].toFixed(5)},
                  {selectedProject.suggestedQuantum[2].toFixed(5)}
                ]
              </div>
            } */}
            {suggestedQuantumError.active && (
              <div className="text-[12px] xl:text-base font-semibold mt-2">
                {suggestedQuantumError.type === 'Mesher Not Active'
                  ? 'Mesher Down: start mesher or wait until started!'
                  : 'Unable to suggest quantum: Frequencies not set, go back to Physics tab to set them'}
              </div>
            )}
            {meshGenerated === 'Generated' && !suggestedQuantumError.active && !pathToExternalGridsNotFound && (
              <div className="flex flex-row gap-4 justify-center items-center w-full mt-3">
                <div
                  className="flex flex-row items-center gap-2 p-2 hover:cursor-pointer hover:bg-gray-200 rounded border border-gray-200"
                  onClick={() => {
                    setRefineMode('coarsen');
                    setShowModalRefine(true);
                  }}
                >
                  <LiaCubeSolid size={25} />
                  <span>Coarsen</span>
                </div>
                <div
                  className="flex flex-row items-center gap-2 p-2 hover:cursor-pointer hover:bg-gray-200 rounded border border-gray-200"
                  onClick={() => {
                    setRefineMode('refine');
                    setShowModalRefine(true);
                  }}
                >
                  <LiaCubesSolid size={25} />
                  <span>Refine</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-[100%] pt-4">
          <div className="flex-column">
            {meshGenerated === 'Not Generated' && (
              <div>
                <button
                  data-testid="generateMeshButton"
                  className={
                    checkQuantumDimensionsValidity()
                      ? 'button buttonPrimary w-[100%]'
                      : 'button bg-gray-300 text-gray-600 opacity-70 w-[100%]'
                  }
                  disabled={!checkQuantumDimensionsValidity() || pathToExternalGridsNotFound}
                  onClick={() => {
                    dispatch(
                      setPreviousMeshStatus({
                        status: selectedProject.meshData.meshGenerated as
                          | 'Not Generated'
                          | 'Generated',
                        projectToUpdate:
                          selectedProject.faunaDocumentId as string,
                      }),
                    );
                    dispatch(
                      setMeshGenerated({
                        status: 'Generating',
                        projectToUpdate:
                          selectedProject.faunaDocumentId as string,
                      }),
                    );
                    dispatch(
                      setQuantum({
                        quantum: quantumDimsInput,
                        projectToUpdate:
                          selectedProject.faunaDocumentId as string,
                      }),
                    );
                  }}
                >
                  Generate Mesh
                </button>
              </div>
            )}
            {/* {((meshGenerated === 'Generated' && !meshApproved) ||
              selectedProject.simulation?.status === 'Failed') && (
              <div className='flex justify-between'>
                <button
                  className='button buttonPrimary w-full text-[12px] xl:text-base'
                  disabled={!checkQuantumDimensionsValidity()}
                  onClick={() => {
                    dispatch(setPreviousMeshStatus({
                      status: selectedProject.meshData.meshGenerated as 'Not Generated' | 'Generated',
                      projectToUpdate: selectedProject.faunaDocumentId as string
                    }));
                    dispatch(setMeshGenerated({
                      status: 'Generating',
                      projectToUpdate: selectedProject.faunaDocumentId as string
                    }));
                    dispatch(setQuantum({
                      quantum: quantumDimsInput,
                      projectToUpdate: selectedProject.faunaDocumentId as string
                    }));
                  }}
                >
                  Regenerate
                </button>
              </div>
            )} */}
          </div>
        </div>
        <div className="mt-3 p-[10px] xl:text-left text-center border-[1px] border-secondaryColor rounded bg-[#f6f6f6]">
          <h6 className="text-[12px] xl:text-base">Solver Iterations</h6>
          <div className="mt-2">
            <div className="flex justify-between mt-2">
              <div className="w-[45%]">
                <span className="text-[12px] xl:text-base">Outer</span>
                <input
                  disabled={
                    selectedProject.simulation?.status === 'Completed' ||
                    meshGenerated !== 'Generated'
                  }
                  min={1}
                  className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl"
                  type="number"
                  step={1}
                  value={
                    selectedProject.simulation
                      ? isNaN(
                          selectedProject.simulation.solverAlgoParams
                            .innerIteration,
                        )
                        ? 0
                        : selectedProject.simulation.solverAlgoParams
                            .innerIteration
                      : isNaN(solverIterations[0])
                      ? 0
                      : solverIterations[0]
                  }
                  onChange={(event) => {
                    dispatch(
                      setSolverIterations([
                        parseInt(event.target.value),
                        solverIterations[1],
                      ]),
                    );
                  }}
                />
              </div>
              <div className="w-[45%]">
                <span className="text-[12px] xl:text-base">Inner</span>
                <input
                  disabled={
                    selectedProject.simulation?.status === 'Completed' ||
                    meshGenerated !== 'Generated'
                  }
                  min={1}
                  className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl"
                  type="number"
                  step={1}
                  value={
                    selectedProject.simulation
                      ? isNaN(
                          selectedProject.simulation.solverAlgoParams
                            .outerIteration,
                        )
                        ? 0
                        : selectedProject.simulation.solverAlgoParams
                            .outerIteration
                      : isNaN(solverIterations[1])
                      ? 0
                      : solverIterations[1]
                  }
                  onChange={(event) => {
                    dispatch(
                      setSolverIterations([
                        solverIterations[0],
                        parseInt(event.target.value),
                      ]),
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 p-[10px] xl:text-left text-center border-[1px] border-secondaryColor rounded bg-[#f6f6f6]">
          <h6 className="text-[12px] xl:text-base">Convergence Threshold</h6>
          <div className="mt-2">
            <div className="flex justify-between mt-2">
              <div className="w-full">
                <DebounceInput
                  debounceTimeout={500}
                  disabled={
                    selectedProject.simulation?.status === 'Completed' ||
                    meshGenerated !== 'Generated'
                  }
                  min={0.0001}
                  max={0.1}
                  className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-[15px] font-bold rounded formControl"
                  type="number"
                  step={0.0001}
                  value={
                    selectedProject.simulation
                      ? isNaN(
                          selectedProject.simulation.solverAlgoParams
                            .convergenceThreshold,
                        )
                        ? 0
                        : selectedProject.simulation.solverAlgoParams
                            .convergenceThreshold
                      : isNaN(convergenceThreshold)
                      ? 0
                      : convergenceThreshold
                  }
                  onChange={(event) => {
                    dispatch(
                      setConvergenceTreshold(parseFloat(event.target.value)),
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {selectedProject.simulation?.status === 'Completed' ? (
          <button
            className="button buttonPrimary w-[100%] mt-3 text-[12px] xl:text-base"
            onClick={() => {
              dispatch(selectMenuItem('Results'));
            }}
          >
            Results
          </button>
        ) : (
          <button
            data-testid="startSimulationButton"
            className={`w-full mt-3 button text-[12px] xl:text-base disabled:bg-gray-400
              ${
                meshGenerated !== 'Generated'
                  ? 'bg-gray-300 text-gray-600 opacity-70'
                  : 'buttonPrimary'
              }`}
            disabled={meshGenerated !== 'Generated' || pathToExternalGridsNotFound}
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
                  convergenceThreshold,
                },
              };
              dispatch(updateSimulation(simulation));
              dispatch(
                setMeshApproved({
                  approved: true,
                  projectToUpdate: selectedProject.faunaDocumentId as string,
                }),
              );
            }}
          >
            Start Simulation
          </button>
        )}
      </div>
      <ModalRefineCoarse
        showModal={showModalRefine}
        mode={refineMode}
        setShowModal={setShowModalRefine}
        selectedProject={selectedProject}
        quantumDimsInput={quantumDimsInput}
        setQuantumDimsInput={setQuantumDimsInput}
      />
    </>
  );
};

interface QuantumDimsInputProps {
  dataTestId: string;
  label: string;
  disabled: boolean;
  debounceTimeoutMilliSecs?: number;
  inputStep?: number;
  value: number;
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) &
    React.ChangeEventHandler<HTMLInputElement>;
}

const QuantumDimsInput: FC<QuantumDimsInputProps> = ({
  dataTestId,
  disabled,
  debounceTimeoutMilliSecs,
  inputStep,
  value,
  onChange,
  label,
}) => {
  return (
    <div className="xl:w-[30%] w-full flex flex-col items-center relative">
      <span className="text-[12px] xl:text-sm absolute top-[-10px] left-1/2 translate-x-[-1/2] bg-[#f6f6f6] font-bold">
        {label}
      </span>
      <DebounceInput
        data-testid={dataTestId}
        disabled={disabled}
        min={0.0}
        className="w-full p-[4px] border-[1px] border-[#a3a3a3] text-[12px] font-bold rounded formControl"
        type="number"
        debounceTimeout={
          debounceTimeoutMilliSecs ? debounceTimeoutMilliSecs : 500
        }
        step={inputStep ? inputStep : 0.0001}
        value={isNaN(value) ? 0 : value}
        onChange={onChange}
      />
    </div>
  );
};

interface ModalRefineCoarseProps {
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  mode: 'refine' | 'coarsen';
  selectedProject: Project;
  quantumDimsInput: [number, number, number];
  setQuantumDimsInput: Function;
}

const ModalRefineCoarse: FC<ModalRefineCoarseProps> = ({
  showModal,
  mode,
  setShowModal,
  selectedProject,
  quantumDimsInput,
  setQuantumDimsInput,
}) => {
  const [xPercentage, setXPercentage] = useState<'No' | '10%' | '50%'>('No');
  const [yPercentage, setYPercentage] = useState<'No' | '10%' | '50%'>('No');
  const [zPercentage, setZPercentage] = useState<'No' | '10%' | '50%'>('No');

  const dispatch = useDispatch();

  return (
    <Transition appear show={showModal} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto" data-testid="alert">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {mode.toUpperCase()}
                </Dialog.Title>
                <hr className="mt-2 mb-3" />
                <div className="p-2 flex flex-col gap-4">
                  <span>
                    Choose how to {mode === 'refine' ? 'reduce' : 'increase'}{' '}
                    the quantum on the desired axes
                  </span>
                  <div className="flex flex-row gap-4">
                    <span className="font-semibold">X: </span>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-10"
                        className="radio radio-sm checked:bg-green-800"
                        checked={xPercentage === 'No'}
                        onClick={() => setXPercentage('No')}
                      />
                      <span>No {mode}</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-10"
                        className="radio radio-sm checked:bg-green-800"
                        checked={xPercentage === '10%'}
                        onClick={() => setXPercentage('10%')}
                      />
                      <span>10%</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-10"
                        className="radio radio-sm checked:bg-green-800"
                        checked={xPercentage === '50%'}
                        onClick={() => setXPercentage('50%')}
                      />
                      <span>50%</span>
                    </div>
                  </div>
                  <div className="flex flex-row gap-4">
                    <span className="font-semibold">Y: </span>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-11"
                        className="radio radio-sm checked:bg-green-800"
                        checked={yPercentage === 'No'}
                        onClick={() => setYPercentage('No')}
                      />
                      <span>No {mode}</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-11"
                        className="radio radio-sm checked:bg-green-800"
                        checked={yPercentage === '10%'}
                        onClick={() => setYPercentage('10%')}
                      />
                      <span>10%</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-11"
                        className="radio radio-sm checked:bg-green-800"
                        checked={yPercentage === '50%'}
                        onClick={() => setYPercentage('50%')}
                      />
                      <span>50%</span>
                    </div>
                  </div>
                  <div className="flex flex-row gap-4">
                    <span className="font-semibold">Z: </span>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-12"
                        className="radio radio-sm checked:bg-green-800"
                        checked={zPercentage === 'No'}
                        onClick={() => setZPercentage('No')}
                      />
                      <span>No {mode}</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-12"
                        className="radio radio-sm checked:bg-green-800"
                        checked={zPercentage === '10%'}
                        onClick={() => setZPercentage('10%')}
                      />
                      <span>10%</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-12"
                        className="radio radio-sm checked:bg-green-800"
                        checked={zPercentage === '50%'}
                        onClick={() => setZPercentage('50%')}
                      />
                      <span>50%</span>
                    </div>
                  </div>
                  <div className="flex flex-row w-full items-center justify-between mt-4">
                    <button
                      type="button"
                      className="button bg-red-500 text-white"
                      onClick={() => setShowModal(false)}
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      className="button buttonPrimary text-white"
                      onClick={() => {
                        let newQuantum: [number, number, number] = [
                          ...quantumDimsInput,
                        ];
                        if (xPercentage !== 'No') {
                          if (xPercentage === '10%') {
                            if (mode === 'refine') {
                              newQuantum[0] =
                                quantumDimsInput[0] -
                                quantumDimsInput[0] * (10 / 100);
                            } else {
                              newQuantum[0] =
                                quantumDimsInput[0] +
                                quantumDimsInput[0] * (10 / 100);
                            }
                          }
                          if (xPercentage === '50%') {
                            if (mode === 'refine') {
                              newQuantum[0] = quantumDimsInput[0] / 2;
                            } else {
                              newQuantum[0] = quantumDimsInput[0] * 2;
                            }
                          }
                        }
                        if (yPercentage !== 'No') {
                          if (yPercentage === '10%') {
                            if (mode === 'refine') {
                              newQuantum[1] =
                                quantumDimsInput[1] -
                                quantumDimsInput[1] * (10 / 100);
                            } else {
                              newQuantum[1] =
                                quantumDimsInput[1] +
                                quantumDimsInput[1] * (10 / 100);
                            }
                          }
                          if (yPercentage === '50%') {
                            if (mode === 'refine') {
                              newQuantum[1] = quantumDimsInput[1] / 2;
                            } else {
                              newQuantum[1] = quantumDimsInput[1] * 2;
                            }
                          }
                        }
                        if (zPercentage !== 'No') {
                          if (zPercentage === '10%') {
                            if (mode === 'refine') {
                              newQuantum[2] =
                                quantumDimsInput[2] -
                                quantumDimsInput[2] * (10 / 100);
                            } else {
                              newQuantum[2] =
                                quantumDimsInput[2] +
                                quantumDimsInput[2] * (10 / 100);
                            }
                          }
                          if (zPercentage === '50%') {
                            if (mode === 'refine') {
                              newQuantum[2] = quantumDimsInput[2] / 2;
                            } else {
                              newQuantum[2] = quantumDimsInput[2] * 2;
                            }
                          }
                        }
                        setQuantumDimsInput(newQuantum);
                        dispatch(
                          setPreviousMeshStatus({
                            status: selectedProject.meshData.meshGenerated as
                              | 'Not Generated'
                              | 'Generated',
                            projectToUpdate:
                              selectedProject.faunaDocumentId as string,
                          }),
                        );
                        dispatch(
                          setMeshGenerated({
                            status: 'Generating',
                            projectToUpdate:
                              selectedProject.faunaDocumentId as string,
                          }),
                        );
                        dispatch(
                          setQuantum({
                            quantum: newQuantum,
                            projectToUpdate:
                              selectedProject.faunaDocumentId as string,
                          }),
                        );
                        setXPercentage('No');
                        setYPercentage('No');
                        setZPercentage('No');
                        setShowModal(false);
                      }}
                    >
                      {mode.toUpperCase()}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
