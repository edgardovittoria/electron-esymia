import React, { FC, Fragment, useEffect, useState } from 'react';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';

import {
  activeMeshingSelector,
  activeSimulationsSelector,
  meshGeneratedSelector,
  pathToExternalGridsNotFoundSelector,
  setMeshApproved,
  setMeshGenerated,
  setMeshType,
  setPreviousMeshStatus,
  setQuantum,
  setSuggestedQuantum,
  suggestedQuantumSelector,
  updateSimulation,
} from '../../../../../store/projectSlice';
import {
  meshAdviceSelector,
  selectMenuItem,
  ThemeSelector,
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
  setSolverType,
  solverIterationsSelector,
  solverTypeSelector,
} from '../../../../../store/solverSlice';
import { DebounceInput } from 'react-debounce-input';
import { LiaCubeSolid, LiaCubesSolid } from 'react-icons/lia';
import { Dialog, Transition } from '@headlessui/react';
import { MesherStatusSelector } from '../../../../../store/pluginsSlice';
import { generateSTLListFromComponents } from './components/rightPanelFunctions';
import { convertInFaunaProjectThis } from '../../../../../faunadb/apiAuxiliaryFunctions';
import { updateProjectInFauna } from '../../../../../faunadb/projectsFolderAPIs';
import { publishMessage } from '../../../../../../middleware/stompMiddleware';
import { TbServerBolt } from 'react-icons/tb';
import { GiCubeforce, GiMeshBall } from 'react-icons/gi';
import { useFaunaQuery } from '../../../../../faunadb/hook/useFaunaQuery';
import { ComponentEntity, Material } from '../../../../../../cad_library';

interface RightPanelSimulatorProps {
  selectedProject: Project;
  allMaterials?: Material[];
  externalGrids?: ExternalGridsObject;
  spinnerLoadData: boolean;
  sidebarItemSelected: string | undefined;
  setsidebarItemSelected: Function;
  setSelectedTabLeftPanel: Function;
}

export const RightPanelSimulator: React.FC<RightPanelSimulatorProps> = ({
  selectedProject,
  allMaterials,
  externalGrids,
  spinnerLoadData,
  setsidebarItemSelected,
  sidebarItemSelected,
  setSelectedTabLeftPanel,
}) => {
  const dispatch = useDispatch();
  const { execQuery } = useFaunaQuery();
  const [quantumDimsInput, setQuantumDimsInput] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const meshGenerated = useSelector(meshGeneratedSelector);
  const solverType = useSelector(solverTypeSelector);
  const solverIterations = useSelector(solverIterationsSelector);
  const convergenceThreshold = useSelector(convergenceTresholdSelector);
  const activeMeshing = useSelector(activeMeshingSelector);
  const activeSimulations = useSelector(activeSimulationsSelector);
  const theme = useSelector(ThemeSelector);
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
  const pathToExternalGridsNotFound = useSelector(
    pathToExternalGridsNotFoundSelector,
  );

  useEffect(() => {
    suggestedQuantum && setQuantumDimsInput(suggestedQuantum);
  }, [suggestedQuantum]);

  useEffect(() => {
    if (
      selectedProject.model.components &&
      mesherStatus === 'ready' &&
      selectedProject.frequencies &&
      selectedProject.frequencies.length > 0
    ) {
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
        dispatch(
          publishMessage({
            queue: 'management',
            body: {
              message: 'compute suggested quantum',
              body: objToSendToMesher,
            },
          }),
        );
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
    } else if (
      selectedProject.frequencies &&
      selectedProject.frequencies.length === 0
    ) {
      //console.log('qui');
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
      // execQuery(
      //   updateProjectInFauna,
      //   convertInFaunaProjectThis({
      //     ...selectedProject,
      //     suggestedQuantum: [
      //       parseFloat(meshAdvice.quantum[0].toFixed(5)),
      //       parseFloat(meshAdvice.quantum[1].toFixed(5)),
      //       parseFloat(meshAdvice.quantum[2].toFixed(5)),
      //     ],
      //   } as Project),
      //   dispatch,
      // ).then();
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

  return (
    <>
      <div className="absolute left-[2%] top-[270px] rounded max-h-[500px] flex flex-col items-center gap-0">
        <div
          className={`p-2 tooltip rounded-t tooltip-right ${
            sidebarItemSelected === 'Mesher'
              ? `${
                  theme === 'light'
                    ? 'text-white bg-primaryColor'
                    : 'text-textColor bg-secondaryColorDark'
                }`
              : `${
                  theme === 'light'
                    ? 'text-primaryColor bg-white'
                    : 'text-textColorDark bg-bgColorDark2'
                }`
          }`}
          data-tip="Mesher"
          data-testid="quantumSettings"
          onClick={() => {
            if (sidebarItemSelected === 'Mesher') {
              setsidebarItemSelected(undefined);
            } else {
              setsidebarItemSelected('Mesher');
            }
            setSelectedTabLeftPanel(undefined);
          }}
        >
          <GiMeshBall style={{ width: '25px', height: '25px' }} />
        </div>
        <div
          className={`p-2 tooltip rounded-b tooltip-right ${
            sidebarItemSelected === 'Solver'
              ? `${
                  theme === 'light'
                    ? 'text-white bg-primaryColor'
                    : 'text-textColor bg-secondaryColorDark'
                }`
              : `${
                  theme === 'light'
                    ? 'text-primaryColor bg-white'
                    : 'text-textColorDark bg-bgColorDark2'
                }`
          }`}
          data-tip="Solver"
          data-testid="solverSettings"
          onClick={() => {
            if (sidebarItemSelected === 'Solver') {
              setsidebarItemSelected(undefined);
            } else {
              setsidebarItemSelected('Solver');
            }
            setSelectedTabLeftPanel(undefined);
          }}
        >
          <TbServerBolt style={{ width: '25px', height: '25px' }} />
        </div>
      </div>
      {sidebarItemSelected && sidebarItemSelected === 'Mesher' && (
        <div
          className={`${
            (meshGenerated === 'Generating' ||
              meshGenerated === 'Queued' ||
              spinnerLoadData) &&
            'opacity-40'
          } flex-col absolute xl:left-[5%] left-[6%] top-[180px] xl:w-[22%] w-[28%] rounded-tl rounded-tr ${
            theme === 'light'
              ? 'bg-white text-textColor'
              : 'bg-bgColorDark2 text-textColorDark'
          } p-[10px] shadow-2xl overflow-y-scroll lg:max-h-[300px] xl:max-h-fit`}
        >
          <div className="flex flex-col">
            <div className="flex flex-row">
              <AiOutlineThunderbolt style={{ width: '25px', height: '25px' }} />
              <h5 className="ml-2 text-[12px] xl:text-base">Meshing Info</h5>
            </div>
            <div
              className={`mt-3 p-[15px] xl:text-left text-center border-[1px] rounded ${
                theme === 'light'
                  ? 'bg-[#f6f6f6] border-secondaryColor'
                  : 'bg-bgColorDark'
              }`}
            >
              <h6 className="text-[12px] xl:text-base text-center">Mesher Type</h6>
              <div className="mt-2">
                <div className="flex justify-between mt-2">
                  <div className="w-full text-center">
                    <select
                      className={`select select-bordered select-sm w-full max-w-xs ${
                        theme === 'light'
                          ? 'bg-[#f6f6f6]'
                          : 'bg-bgColorDark border-textColorDark'
                      }`}
                      onChange={(e) => {
                        dispatch(
                          setMeshType({type: e.target.value as 'Standard' | 'Ris', projectToUpdate: selectedProject.faunaDocumentId as string})
                        );
                      }}
                    >
                      <option value={"Standard"} selected>
                        Standard Mesher
                      </option>
                      <option value={"Ris"}>
                        Ris Mesher
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr className="mt-1" />
          {suggestedQuantumError.active && (
                  <div className="text-[12px] xl:text-base font-semibold mt-2">
                    {suggestedQuantumError.type === 'Mesher Not Active'
                      ? 'Mesher Down: start mesher or wait until started!'
                      : 'Unable to suggest quantum: Frequencies not set, go back to Physics tab to set them'}
                  </div>
                )}
          <div
            className={`mt-3 p-[10px] xl:text-left text-center border-[1px] rounded ${
              theme === 'light'
                ? 'bg-[#f6f6f6] border-secondaryColor'
                : 'bg-bgColorDark border-textColorDark'
            }`}
          >
            {selectedProject.meshData.type !== 'Ris' ? (
              <h6 className="xl:text-base text-center text-[12px]">
                Set quantum&apos;s dimensions
              </h6>
            ):
            (
              <h6 className="xl:text-base text-center text-[12px]">
                Settings
              </h6>
            )
          }
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
            {selectedProject.meshData.type !== 'Ris' && (
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
                {meshGenerated === 'Generated' &&
                  !spinnerLoadData &&
                  !selectedProject.simulation &&
                  !suggestedQuantumError.active &&
                  !pathToExternalGridsNotFound && (
                    <div className="flex flex-row gap-4 justify-center items-center w-full mt-3">
                      <div
                        className="flex flex-row items-center gap-2 p-2 hover:cursor-pointer hover:opacity-50 rounded border border-gray-200"
                        onClick={() => {
                          setRefineMode('coarsen');
                          setShowModalRefine(true);
                        }}
                      >
                        <LiaCubeSolid size={25} />
                        <span data-testid="coarsenButton">Coarsen</span>
                      </div>
                      <div
                        className="flex flex-row items-center gap-2 p-2 hover:cursor-pointer hover:opacity-50 rounded border border-gray-200"
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
            )}
          </div>
          <div className="w-[100%] pt-4">
            <div className="flex-column">
              {meshGenerated === 'Not Generated' && (
                <div>
                  <button
                    data-testid="generateMeshButton"
                    className={
                      process.env.APP_MODE !== 'test'
                        ? checkQuantumDimensionsValidity()
                          ? `button buttonPrimary ${
                              theme === 'light'
                                ? ''
                                : 'bg-secondaryColorDark text-textColor'
                            } w-[100%]`
                          : 'button bg-gray-300 text-gray-600 opacity-70 w-[100%]'
                        : `button buttonPrimary ${
                            theme === 'light'
                              ? ''
                              : 'bg-secondaryColorDark text-textColor'
                          } w-[100%]`
                    }
                    disabled={
                      process.env.APP_MODE !== 'test'
                        ? !checkQuantumDimensionsValidity()
                        : false
                    }
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
                          status:
                            activeMeshing.length > 0 ? 'Queued' : 'Generating',
                          projectToUpdate:
                            selectedProject.faunaDocumentId as string,
                        }),
                      );
                      if(selectedProject.meshData.type !== "Ris"){
                        dispatch(
                          setQuantum({
                            quantum: quantumDimsInput,
                            projectToUpdate:
                              selectedProject.faunaDocumentId as string,
                          }),
                        );
                      }
                    }}
                  >
                    Generate Mesh
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {sidebarItemSelected && sidebarItemSelected === 'Solver' && (
        <>
          <div
            className={`${
              (selectedProject.simulation?.status === 'Queued' ||
                selectedProject.simulation?.status === 'Running') &&
              'opacity-40'
            } flex-col absolute xl:left-[5%] left-[6%] top-[180px] xl:w-[22%] w-[28%] rounded-tl rounded-tr ${
              theme === 'light'
                ? 'bg-white text-textColor'
                : 'bg-bgColorDark2 text-textColorDark'
            } p-[10px] shadow-2xl overflow-y-scroll lg:max-h-[300px] xl:max-h-fit`}
          >
            <div className="flex">
              <AiOutlineThunderbolt style={{ width: '25px', height: '25px' }} />
              <h5 className="ml-2 text-[12px] xl:text-base">Solving Info</h5>
            </div>
            <hr className="mt-1" />
            <div
              className={`mt-3 p-[10px] xl:text-left text-center border-[1px] rounded ${
                theme === 'light'
                  ? 'bg-[#f6f6f6] border-secondaryColor'
                  : 'bg-bgColorDark'
              }`}
            >
              <h6 className="text-[12px] xl:text-base">Solver Type</h6>
              <div className="mt-2">
                <div className="flex justify-between mt-2">
                  <div className="w-full">
                    <select
                      className={`select select-bordered select-sm w-full max-w-xs ${
                        theme === 'light'
                          ? 'bg-[#f6f6f6]'
                          : 'bg-bgColorDark border-textColorDark'
                      }`}
                      onChange={(e) => {
                        dispatch(
                          setSolverType(parseInt(e.target.value) as 1 | 2),
                        );
                      }}
                    >
                      <option value={2} selected>
                        Rcc delayed coefficents computation
                      </option>
                      <option value={1}>
                        Quasi static coefficents computation
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`mt-3 p-[10px] xl:text-left text-center border-[1px] rounded ${
                theme === 'light'
                  ? 'bg-[#f6f6f6] border-secondaryColor'
                  : 'bg-bgColorDark'
              }`}
            >
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
                      className={`w-full p-[4px] border-[1px] ${
                        theme === 'light' ? 'bg-[#f6f6f6]' : 'bg-bgColorDark'
                      } text-[15px] font-bold rounded formControl`}
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
                      className={`w-full p-[4px] border-[1px] ${
                        theme === 'light' ? 'bg-[#f6f6f6]' : 'bg-bgColorDark'
                      } text-[15px] font-bold rounded formControl`}
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
            <div
              className={`mt-3 p-[10px] xl:text-left text-center border-[1px] rounded ${
                theme === 'light'
                  ? 'bg-[#f6f6f6] border-secondaryColor'
                  : 'bg-bgColorDark'
              }`}
            >
              <h6 className="text-[12px] xl:text-base">
                Convergence Threshold
              </h6>
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
                      className={`w-full p-[4px] border-[1px] ${
                        theme === 'light' ? 'bg-[#f6f6f6]' : 'bg-bgColorDark'
                      } text-[15px] font-bold rounded formControl`}
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
                          setConvergenceTreshold(
                            parseFloat(event.target.value),
                          ),
                        );
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {selectedProject.simulation?.status === 'Completed' ? (
              <button
                className={`button buttonPrimary ${
                  theme === 'light'
                    ? ''
                    : 'bg-secondaryColorDark text-textColor'
                } w-[100%] mt-3 text-[12px] xl:text-base`}
                data-testid="resultsButton"
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
                  : `buttonPrimary ${
                      theme === 'light'
                        ? ''
                        : 'bg-secondaryColorDark text-textColor'
                    }`
              }`}
                disabled={
                  meshGenerated !== 'Generated' || pathToExternalGridsNotFound
                }
                onClick={() => {
                  const simulation: Simulation = {
                    name: `${selectedProject?.name} - sim`,
                    started: Date.now().toString(),
                    ended: '',
                    results: {} as SolverOutput,
                    status:
                      activeSimulations.length === 0 ? 'Running' : 'Queued',
                    associatedProject:
                      selectedProject?.faunaDocumentId as string,
                    solverAlgoParams: {
                      solverType: solverType,
                      innerIteration: solverIterations[0],
                      outerIteration: solverIterations[1],
                      convergenceThreshold,
                    },
                  };
                  dispatch(
                    updateSimulation({
                      associatedProject: simulation.associatedProject,
                      value: simulation,
                    }),
                  );
                  dispatch(
                    setMeshApproved({
                      approved: true,
                      projectToUpdate:
                        selectedProject.faunaDocumentId as string,
                    }),
                  );
                }}
              >
                Start Simulation
              </button>
            )}
          </div>
        </>
      )}
      <ModalRefineCoarse
        showModal={showModalRefine}
        mode={refineMode}
        setShowModal={setShowModalRefine}
        selectedProject={selectedProject}
        quantumDimsInput={quantumDimsInput}
        setQuantumDimsInput={setQuantumDimsInput}
        activeMeshing={activeMeshing}
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
  const theme = useSelector(ThemeSelector);
  return (
    <div className="xl:w-[30%] w-full flex flex-col items-center relative">
      <span
        className={`text-[12px] xl:text-sm absolute top-[-10px] left-1/2 translate-x-[-1/2] ${
          theme === 'light' ? 'bg-[#f6f6f6]' : 'bg-transparent'
        } font-bold`}
      >
        {label}
      </span>
      <DebounceInput
        data-testid={dataTestId}
        disabled={disabled}
        min={0.0}
        className={`w-full p-[4px] border-[1px] ${
          theme === 'light' ? 'bg-[#f6f6f6]' : 'bg-bgColorDark'
        } text-[12px] font-bold rounded formControl`}
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
  activeMeshing: {
    selectedProject: Project;
    allMaterials: Material[];
    quantum: [number, number, number];
    meshStatus: 'Not Generated' | 'Generated';
  }[];
}

const ModalRefineCoarse: FC<ModalRefineCoarseProps> = ({
  showModal,
  mode,
  setShowModal,
  selectedProject,
  quantumDimsInput,
  setQuantumDimsInput,
  activeMeshing,
}) => {
  const [xPercentage, setXPercentage] = useState<'No' | '10%' | '50%'>('No');
  const [yPercentage, setYPercentage] = useState<'No' | '10%' | '50%'>('No');
  const [zPercentage, setZPercentage] = useState<'No' | '10%' | '50%'>('No');

  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector);

  const [x, setx] = useState(quantumDimsInput[0]);
  const [y, sety] = useState(quantumDimsInput[1]);
  const [z, setz] = useState(quantumDimsInput[2]);

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
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
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
                  {/* <div className="flex flex-row justify-between">
                    <input type="number" name="x" id="x" defaultValue={x} onChange={(e) => setx(parseFloat(e.target.value))}/>
                    <input type="number" name="y" id="y" defaultValue={y} onChange={(e) => sety(parseFloat(e.target.value))}/>
                    <input type="number" name="x" id="z" defaultValue={z} onChange={(e) => setz(parseFloat(e.target.value))}/>
                  </div>
                  <button onClick={() => {
                    setQuantumDimsInput([x,y,z]);
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
                        status:
                          activeMeshing.length > 0
                            ? 'Queued'
                            : 'Generating',
                        projectToUpdate:
                          selectedProject.faunaDocumentId as string,
                      }),
                    );
                    dispatch(
                      setQuantum({
                        quantum: [x,y,z],
                        projectToUpdate:
                          selectedProject.faunaDocumentId as string,
                      }),
                    );
                    setShowModal(false);
                  }}>Generate Mesh</button> */}
                  <div className="flex flex-row gap-4">
                    <span className="font-semibold">X: </span>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-10"
                        className="radio radio-sm checked:bg-green-800"
                        checked={xPercentage === 'No'}
                        onChange={() => setXPercentage('No')}
                      />
                      <span>No {mode}</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-10"
                        className="radio radio-sm checked:bg-green-800"
                        checked={xPercentage === '10%'}
                        onChange={() => setXPercentage('10%')}
                      />
                      <span>10%</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-10"
                        className="radio radio-sm checked:bg-green-800"
                        checked={xPercentage === '50%'}
                        onChange={() => setXPercentage('50%')}
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
                        onChange={() => setYPercentage('No')}
                      />
                      <span>No {mode}</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-11"
                        className="radio radio-sm checked:bg-green-800"
                        checked={yPercentage === '10%'}
                        onChange={() => setYPercentage('10%')}
                      />
                      <span>10%</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-11"
                        className="radio radio-sm checked:bg-green-800"
                        checked={yPercentage === '50%'}
                        onChange={() => setYPercentage('50%')}
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
                        onChange={() => setZPercentage('No')}
                      />
                      <span>No {mode}</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-12"
                        className="radio radio-sm checked:bg-green-800"
                        checked={zPercentage === '10%'}
                        onChange={() => setZPercentage('10%')}
                      />
                      <span>10%</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-12"
                        className="radio radio-sm checked:bg-green-800"
                        checked={zPercentage === '50%'}
                        onChange={() => setZPercentage('50%')}
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
                      className={`button buttonPrimary ${
                        theme === 'light'
                          ? ''
                          : 'bg-secondaryColorDark text-textColor'
                      } text-white`}
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
                            status:
                              activeMeshing.length > 0
                                ? 'Queued'
                                : 'Generating',
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
