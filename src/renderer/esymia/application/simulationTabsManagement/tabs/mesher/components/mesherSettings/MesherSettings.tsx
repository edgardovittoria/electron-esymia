import { FC, useEffect, useState } from 'react';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { LiaCubeSolid, LiaCubesSolid } from 'react-icons/lia';
import { useDispatch, useSelector } from 'react-redux';
import {
  meshGeneratedSelector,
  setMeshType,
  setLambdaFactor,
  setPreviousMeshStatus,
  setMeshGenerated,
  setQuantum,
  lambdaFactorSelector,
  activeMeshingSelector,
  setMaxFrequency,
  suggestedQuantumSelector,
  setSuggestedQuantum,
} from '../../../../../../store/projectSlice';
import {
  meshAdviceSelector,
  selectMenuItem,
  ThemeSelector,
} from '../../../../../../store/tabsAndMenuItemsSlice';
import { ComponentEntity, Material } from '../../../../../../../cad_library';
import { MesherStatusSelector } from '../../../../../../store/pluginsSlice';
import { generateSTLListFromComponents } from '../rightPanelSimulator/components/rightPanelFunctions';
import {
  ExternalGridsObject,
  Project,
} from '../../../../../../model/esymiaModels';
import { ModalRefineCoarse } from './components/ModalRefineCoarse';
import { GiMeshBall } from 'react-icons/gi';
import axios from 'axios';
import { ImSpinner } from 'react-icons/im';

interface MesherSettingsProps {
  selectedProject: Project;
  allMaterials?: Material[];
  externalGrids?: ExternalGridsObject;
  spinnerLoadData: boolean;
}

export const MesherSettings: FC<MesherSettingsProps> = ({
  selectedProject,
  allMaterials,
  externalGrids,
  spinnerLoadData,
}) => {
  const dispatch = useDispatch();
  const [quantumDimsInput, setQuantumDimsInput] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const meshGenerated = useSelector(meshGeneratedSelector);
  const [maxFreq, setmaxFreq] = useState(selectedProject.maxFrequency);
  const activeMeshing = useSelector(activeMeshingSelector);
  const theme = useSelector(ThemeSelector);
  const quantumDimensionsLabels = ['X', 'Y', 'Z'];
  const [mesherSettingsSelected, setmesherSettingsSelected] = useState(true);
  const [computingSuggestedQuantum, setcomputingSuggestedQuantum] =
    useState(false);
  const [suggestedQuantumError, setSuggestedQuantumError] = useState<{
    active: boolean;
    type?: 'Mesher Not Active' | 'Frequencies not set';
  }>({ active: false });
  const [showModalRefine, setShowModalRefine] = useState<boolean>(false);
  const [refineMode, setRefineMode] = useState<'refine' | 'coarsen'>('refine');
  const lambdaFactor = useSelector(lambdaFactorSelector);
  const mesherStatus = useSelector(MesherStatusSelector);
  const suggestedQuantum = useSelector(suggestedQuantumSelector);
  const meshAdvice = useSelector(meshAdviceSelector).filter(
    (item) => item.id === (selectedProject.id as string),
  )[0];

  useEffect(() => {
    suggestedQuantum && setQuantumDimsInput(suggestedQuantum);
    setcomputingSuggestedQuantum(false);
  }, [suggestedQuantum]);

  useEffect(() => {
    if (mesherStatus !== 'ready') {
      setSuggestedQuantumError({ active: true, type: 'Mesher Not Active' });
    }
    if (!selectedProject.maxFrequency) {
      setSuggestedQuantumError({ active: true, type: 'Frequencies not set' });
    }
  }, [mesherStatus, selectedProject.maxFrequency]);

  useEffect(() => {
    if (
      selectedProject.meshData.type === 'Standard' &&
      mesherStatus === 'ready' &&
      selectedProject.maxFrequency
    ) {
      setSuggestedQuantumError({ active: false });
      if (
        selectedProject.meshData.previousMeshStatus !== 'Generated' &&
        selectedProject.maxFrequency
      ) {
        const components = selectedProject?.model
          ?.components as ComponentEntity[];
        const objToSendToMesher = {
          STLList:
            components &&
            allMaterials &&
            generateSTLListFromComponents(allMaterials, components),
          id: selectedProject.id as string,
        };
        setcomputingSuggestedQuantum(true);
        axios
          .post('http://127.0.0.1:8002/quantumAdvice', objToSendToMesher)
          .then(() => {
          })
          .catch((e) => console.log(e));
        // dispatch(
        //   publishMessage({
        //     queue: 'management',
        //     body: {
        //       message: 'compute suggested quantum',
        //       body: objToSendToMesher,
        //     },
        //   }),
        // );
      }
    } else if (mesherStatus === 'idle' || mesherStatus === 'starting') {
      if (selectedProject.meshData.previousMeshStatus === 'Generated') {
        setQuantumDimsInput(selectedProject.meshData.quantum);
      } else {
        setQuantumDimsInput([0, 0, 0]);
      }
      setSuggestedQuantumError({ active: true, type: 'Mesher Not Active' });
    } else if (!selectedProject.maxFrequency) {
      setSuggestedQuantumError({ active: true, type: 'Frequencies not set' });
    }
  }, [mesherStatus, selectedProject.maxFrequency]);

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
    if (selectedProject.maxFrequency && meshAdvice) {
      dispatch(
        setSuggestedQuantum([
          Math.min(
            (3e8 / selectedProject.maxFrequency / 40) *
              getEscalFrom(selectedProject.modelUnit),
            parseFloat(meshAdvice.quantum[0].toExponential(2)),
          ),
          Math.min(
            (3e8 / selectedProject.maxFrequency / 40) *
              getEscalFrom(selectedProject.modelUnit),
            parseFloat(meshAdvice.quantum[1].toExponential(2)),
          ),
          Math.min(
            (3e8 / selectedProject.maxFrequency / 40) *
              getEscalFrom(selectedProject.modelUnit),
            parseFloat(meshAdvice.quantum[2].toExponential(2)),
          ),
        ]),
      );
    }
  }, [meshAdvice]);

  useEffect(() => {
    if (externalGrids) {
      setQuantumDimsInput([
        parseFloat(
          (externalGrids.cell_size.cell_size_x * 1000).toExponential(2),
        ),
        parseFloat(
          (externalGrids.cell_size.cell_size_y * 1000).toExponential(2),
        ),
        parseFloat(
          (externalGrids.cell_size.cell_size_z * 1000).toExponential(2),
        ),
      ]);
    }
  }, [externalGrids]);

  return (
    <>
      <div className="absolute left-[2%] top-[180px] rounded max-h-[500px] flex flex-col items-center gap-0">
        <div
          className={`p-2 tooltip rounded tooltip-right ${
            mesherSettingsSelected
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
          data-tip="Mesher Settings"
          onClick={() => {
            setmesherSettingsSelected(!mesherSettingsSelected);
          }}
        >
          <GiMeshBall style={{ width: '25px', height: '25px' }} />
        </div>
      </div>
      {mesherSettingsSelected && (
        <div
          className={`${
            (meshGenerated === 'Generating' ||
              meshGenerated === 'Queued' ||
              spinnerLoadData) &&
            'opacity-40'
          } flex-col absolute xl:left-[5%] left-[6%] top-[180px] xl:w-[18%] w-[28%] rounded-tl rounded-tr ${
            theme === 'light'
              ? 'bg-white text-textColor'
              : 'bg-bgColorDark2 text-textColorDark'
          } p-[10px] shadow-2xl overflow-y-scroll lg:max-h-[300px] xl:max-h-fit`}
        >
          <div className="flex flex-col">
            <div className="flex flex-row">
              <AiOutlineThunderbolt style={{ width: '25px', height: '25px' }} />
              <h5 className="ml-2 text-[12px] xl:text-base">Mesher Settings</h5>
            </div>
            <div
              className={`mt-3 p-[15px] xl:text-left text-center border-[1px] rounded ${
                theme === 'light'
                  ? 'bg-[#f6f6f6] border-secondaryColor'
                  : 'bg-bgColorDark'
              }`}
            >
              <h6 className="text-[12px] xl:text-base text-center">
                Mesher Type
              </h6>
              <div className="mt-2">
                <div className="flex justify-between mt-2">
                  <div className="w-full text-center">
                    <select
                      className={`select select-bordered select-sm w-full max-w-xs ${
                        theme === 'light'
                          ? 'bg-[#f6f6f6] disabled:text-black disabled:border-black disabled:cursor-not-allowed'
                          : 'bg-bgColorDark border-textColorDark disabled:text-white disabled:cursor-not-allowed'
                      }`}
                      disabled={
                        !selectedProject?.bricks ||
                        selectedProject.meshData.meshGenerated ===
                          'Generated' ||
                        selectedProject.meshData.meshGenerated === 'Generating'
                      }
                      onChange={(e) => {
                        dispatch(
                          setMeshType({
                            type: e.target.value as 'Standard' | 'Ris',
                            projectToUpdate: selectedProject?.id as string,
                          }),
                        );
                        //dispatch(setMeshGenerated({status: "Not Generated", projectToUpdate: selectedProject.id as string}))
                      }}
                    >
                      <option
                        value={'Standard'}
                        selected={selectedProject.meshData.type === 'Standard'}
                      >
                        Standard Mesher
                      </option>
                      <option
                        value={'Ris'}
                        selected={selectedProject.meshData.type === 'Ris'}
                      >
                        Ris Mesher
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className={`mt-3 p-[10px] xl:text-left text-center border-[1px] rounded ${
              theme === 'light'
                ? 'bg-[#f6f6f6] border-secondaryColor'
                : 'bg-bgColorDark border-textColorDark'
            }`}
          >
            <span className="text-sm flex flex-row items-center justify-center gap-6">
              <span className="">Max Frequency:</span>
              <input
                type="number"
                min={10}
                disabled={
                  (selectedProject?.simulation?.resultS3 ? true : false) ||
                  !selectedProject.modelS3
                }
                defaultValue={maxFreq ? maxFreq.toExponential(2) : 0}
                className={`w-1/3 p-[4px] border-[1px] disabled:cursor-not-allowed ${
                  theme === 'light' ? 'bg-[#f6f6f6]' : 'bg-bgColorDark'
                } text-[15px] font-bold rounded formControl`}
                onChange={(e) => {
                  setmaxFreq(parseFloat(e.currentTarget.value));
                }}
              />
            </span>
            <button
              data-testid="generateMeshButton"
              className={
                maxFreq && !selectedProject?.simulation?.resultS3
                  ? `button buttonPrimary mt-3 ${
                      theme === 'light'
                        ? ''
                        : 'bg-secondaryColorDark text-textColor'
                    } w-[100%]`
                  : 'button bg-gray-300 text-gray-600 opacity-70 w-[100%] cursor-not-allowed mt-3'
              }
              disabled={!maxFreq || !selectedProject.modelS3}
              onClick={() => {
                dispatch(setMaxFrequency(maxFreq));
              }}
            >
              Set Max Frequency
            </button>
          </div>
          <div
            className={`mt-3 p-[10px] xl:text-left text-center relative border-[1px] rounded ${
              theme === 'light'
                ? 'bg-[#f6f6f6] border-secondaryColor'
                : 'bg-bgColorDark border-textColorDark'
            }`}
          >
            {computingSuggestedQuantum && (
                  <div className="w-full absolute top-1/2 flex flex-col items-center rounded-xl -translate-y-1/2 right-1/2 translate-x-1/2 z-50 bg-white p-5">
                    <ImSpinner className={`w-8 h-8 animate-spin ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`} />
                    <span>Computing suggested quantum</span>
                  </div>
                )}
            {!selectedProject?.bricks ? (
              <h6 className="xl:text-base text-center text-[12px]">
                Set quantum&apos;s dimensions
              </h6>
            ) : (
              <h6 className="xl:text-base text-center text-[12px]">Settings</h6>
            )}
            <hr className="mt-2 border-[1px] border-gray-200" />
            {selectedProject?.maxFrequency ? (
              <div className="flex flex-col my-3 items-center">
                <span className="text-sm flex flex-row items-center justify-center gap-6">
                  <span className="">Lambda Factor:</span>
                  <input
                    type="number"
                    min={10}
                    disabled={selectedProject?.meshData.type === 'Standard'}
                    defaultValue={lambdaFactor}
                    className={`w-1/5 p-[4px] border-[1px] disabled:border-none ${
                      theme === 'light' ? 'bg-[#f6f6f6]' : 'bg-bgColorDark'
                    } text-[15px] font-bold rounded formControl`}
                    onChange={(e) => {
                      dispatch(
                        setLambdaFactor({
                          lambdaFactor: parseFloat(e.target.value),
                          projectToUpdate: selectedProject?.id as string,
                        }),
                      );
                    }}
                  />
                </span>
              </div>
            ) : (
              <></>
            )}
            {selectedProject.meshData.type === 'Standard' &&
            selectedProject.maxFrequency ? (
              <div className="mt-2">
                <div className="flex xl:flex-row flex-col gap-2 xl:gap-0 justify-between mt-2">
                  {quantumDimsInput.map(
                    (quantumComponent, indexQuantumComponent) => (
                      <QuantumDimsInput
                        dataTestId={'quantumInput' + indexQuantumComponent}
                        disabled={true}
                        //disabled={selectedProject?.simulation?.status === 'Completed' || selectedProject?.model?.components === undefined}
                        key={indexQuantumComponent}
                        label={quantumDimensionsLabels[indexQuantumComponent]}
                        value={parseFloat(quantumComponent.toExponential(2))}
                        onChange={(event: { target: { value: string } }) =>
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
                {/* {selectedProject?.suggestedQuantum && selectedProject && selectedProject?.frequencies &&
                        <div className='text-[12px] xl:text-base font-semibold mt-2'>
                          Suggested:
                          [
                            {selectedProject?.suggestedQuantum[0].toFixed(5)},
                            {selectedProject?.suggestedQuantum[1].toFixed(5)},
                            {selectedProject?.suggestedQuantum[2].toFixed(5)}
                          ]
                        </div>
                      } */}
                {meshGenerated === 'Generated' &&
                !spinnerLoadData &&
                !selectedProject?.simulation &&
                selectedProject.maxFrequency &&
                !suggestedQuantumError.active ? (
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
                ) : (
                  <></>
                )}
              </div>
            ) : (
              <></>
            )}
          </div>
          {suggestedQuantumError.active && selectedProject.maxFrequency ? (
            <div className="text-[12px] xl:text-base font-semibold mt-2">
              {(selectedProject?.meshData.type !== 'Ris' &&
                process.env.MESHER_RIS_MODE === 'backend') ||
                (selectedProject?.meshData.type === 'Ris' &&
                  process.env.MESHER_RIS_MODE === 'backend') ||
                (selectedProject?.meshData.type === 'Standard' && (
                  <>
                    {suggestedQuantumError.type === 'Mesher Not Active'
                      ? 'Mesher Down: start mesher or wait until started!'
                      : 'Unable to suggest quantum: max frequency not set'}
                  </>
                ))}
            </div>
          ) : (
            <></>
          )}
          {selectedProject.simulation?.resultS3 && (
            <button
              className={`button buttonPrimary ${
                theme === 'light' ? '' : 'bg-secondaryColorDark text-textColor'
              } w-[100%] mt-3 text-[12px] xl:text-base`}
              data-testid="resultsButton"
              onClick={() => {
                dispatch(selectMenuItem('Results'));
              }}
            >
              Results
            </button>
          )}
          <div className="w-[100%] pt-4">
            <div className="flex-column">
              {!selectedProject?.simulation?.results &&
                ((selectedProject?.meshData.type === 'Standard' &&
                  selectedProject?.meshData.meshGenerated ===
                    'Not Generated') ||
                  selectedProject?.meshData.type === 'Ris') && (
                  <div>
                    <button
                      data-testid="generateMeshButton"
                      className={
                        process.env.APP_MODE !== 'test' &&
                        selectedProject.maxFrequency
                          ? `button buttonPrimary disabled:cursor-not-allowed disabled:bg-gray-300  disabled:text-gray-600 disabled:opacity-70 ${
                              theme === 'light'
                                ? ''
                                : 'bg-secondaryColorDark text-textColor'
                            } w-[100%]`
                          : 'button bg-gray-300 text-gray-600 opacity-70 w-[100%] cursor-not-allowed'
                      }
                      disabled={
                        process.env.APP_MODE !== 'test' &&
                        ((selectedProject.maxFrequency ? false : true) ||
                          (selectedProject.meshData.type === 'Standard' &&
                            (!suggestedQuantum || mesherStatus !== 'ready')))
                      }
                      onClick={() => {
                        dispatch(
                          setPreviousMeshStatus({
                            status: selectedProject?.meshData.meshGenerated as
                              | 'Not Generated'
                              | 'Generated',
                            projectToUpdate: selectedProject?.id as string,
                          }),
                        );
                        dispatch(
                          setMeshGenerated({
                            status:
                              activeMeshing.length > 0
                                ? 'Queued'
                                : 'Generating',
                            projectToUpdate: selectedProject?.id as string,
                          }),
                        );
                        if (selectedProject?.meshData.type !== 'Ris') {
                          dispatch(
                            setQuantum({
                              quantum: quantumDimsInput,
                              projectToUpdate: selectedProject?.id as string,
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
          <ModalRefineCoarse
            showModal={showModalRefine}
            mode={refineMode}
            setShowModal={setShowModalRefine}
            selectedProject={selectedProject}
            quantumDimsInput={quantumDimsInput}
            setQuantumDimsInput={setQuantumDimsInput}
            activeMeshing={activeMeshing}
          />
        </div>
      )}
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
      <input
        data-testid={dataTestId}
        disabled={disabled}
        min={0.0}
        className={`w-full p-[4px] border-[1px] ${
          theme === 'light' ? 'bg-[#f6f6f6]' : 'bg-bgColorDark'
        } text-[12px] font-bold rounded formControl`}
        type="number"
        step={inputStep ? inputStep : 0.0001}
        value={isNaN(value) ? 0 : value}
        onChange={onChange}
      />
    </div>
  );
};
