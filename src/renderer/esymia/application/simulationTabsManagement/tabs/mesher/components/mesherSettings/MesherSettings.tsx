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
import { generateSTLListFromComponents } from '../utils/generateSTLListFromComponents';
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
          .post('http://localhost:8002/quantumAdvice', objToSendToMesher)
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
      <div className="absolute left-[2%] top-0 flex flex-col items-center gap-0">
        <div
          className={`p-3 rounded-xl transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-md ${mesherSettingsSelected
            ? (theme === 'light' ? 'bg-blue-500 text-white shadow-blue-500/30' : 'bg-blue-600 text-white shadow-blue-600/30')
            : (theme === 'light' ? 'bg-white/80 text-gray-600 hover:bg-white hover:text-blue-500' : 'bg-black/40 text-gray-400 hover:bg-black/60 hover:text-blue-400 border border-white/10')
            }`}
          data-tip="Mesher Settings"
          onClick={() => {
            setmesherSettingsSelected(!mesherSettingsSelected);
          }}
        >
          <GiMeshBall size={24} />
        </div>
      </div>
      {mesherSettingsSelected && (
        <div
          className={`${(meshGenerated === 'Generating' ||
            meshGenerated === 'Queued' ||
            spinnerLoadData) &&
            'opacity-40 pointer-events-none'
            } flex flex-col absolute left-[6%] xl:left-[5%] top-0 w-[300px] rounded-2xl p-4 shadow-2xl backdrop-blur-md border transition-all duration-300 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar ${theme === 'light'
              ? 'bg-white/90 border-white/40'
              : 'bg-black/60 border-white/10 text-gray-200'
            }`}
        >
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200/50 dark:border-white/10">
            <AiOutlineThunderbolt size={20} className={theme === 'light' ? 'text-blue-500' : 'text-blue-400'} />
            <h5 className="font-semibold text-lg">Mesher Settings</h5>
          </div>

          <div className="space-y-4">
            {/* Mesher Type Section */}
            <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
              <h6 className="text-sm font-medium mb-2 opacity-80">Mesher Type</h6>
              <select
                className={`w-full p-2 rounded-lg text-sm font-medium outline-none transition-all ${theme === 'light'
                  ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
                  }`}
                disabled={
                  !selectedProject?.bricks ||
                  selectedProject.meshData.meshGenerated === 'Generated' ||
                  selectedProject.meshData.meshGenerated === 'Generating'
                }
                onChange={(e) => {
                  dispatch(
                    setMeshType({
                      type: e.target.value as 'Standard' | 'Ris',
                      projectToUpdate: selectedProject?.id as string,
                    }),
                  );
                }}
                value={selectedProject.meshData.type}
              >
                <option value={'Standard'}>Standard Mesher</option>
                <option value={'Ris'}>Ris Mesher</option>
              </select>
            </div>

            {/* Max Frequency Section */}
            <div className={`p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-sm font-medium opacity-80">Max Frequency</span>
                <input
                  type="number"
                  data-testid="maxFrequencyInput"
                  min={10}
                  disabled={
                    (selectedProject?.simulation?.resultS3 ? true : false) ||
                    !selectedProject.modelS3
                  }
                  defaultValue={maxFreq ? maxFreq.toExponential(2) : 0}
                  className={`w-24 p-1.5 text-right rounded-lg text-sm font-bold outline-none border transition-all ${theme === 'light'
                    ? 'bg-white border-gray-200 focus:border-blue-500'
                    : 'bg-black/40 border-white/10 focus:border-blue-500 text-white'
                    }`}
                  onChange={(e) => {
                    setmaxFreq(parseFloat(e.currentTarget.value));
                  }}
                />
              </div>
              <button
                data-testid="setMaxFrequencyButton"
                className={`w-full py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${maxFreq && !selectedProject?.simulation?.resultS3
                  ? (theme === 'light'
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30')
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-white/5 dark:text-gray-500'
                  }`}
                disabled={!maxFreq || !selectedProject.modelS3}
                onClick={() => {
                  dispatch(setMaxFrequency(maxFreq));
                }}
              >
                Set Max Frequency
              </button>
            </div>

            {/* Quantum Settings Section */}
            <div className={`p-4 rounded-xl border relative ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
              {computingSuggestedQuantum && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-xl">
                  <ImSpinner className="w-6 h-6 animate-spin text-blue-500 mb-2" />
                  <span className="text-xs font-medium">Computing...</span>
                </div>
              )}

              <h6 className="text-sm font-medium mb-3 opacity-80">
                {!selectedProject?.bricks ? "Set Quantum Dimensions" : "Settings"}
              </h6>

              {selectedProject?.maxFrequency && (
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-sm font-medium opacity-80">Lambda Factor</span>
                  <input
                    type="number"
                    min={10}
                    disabled={selectedProject?.meshData.type === 'Standard'}
                    defaultValue={lambdaFactor}
                    className={`w-20 p-1.5 text-right rounded-lg text-sm font-bold outline-none border transition-all ${theme === 'light'
                      ? 'bg-white border-gray-200 focus:border-blue-500'
                      : 'bg-black/40 border-white/10 focus:border-blue-500 text-white'
                      }`}
                    onChange={(e) => {
                      dispatch(
                        setLambdaFactor({
                          lambdaFactor: parseFloat(e.target.value),
                          projectToUpdate: selectedProject?.id as string,
                        }),
                      );
                    }}
                  />
                </div>
              )}

              {selectedProject.meshData.type === 'Standard' && selectedProject.maxFrequency && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {quantumDimsInput.map((quantumComponent, index) => (
                      <QuantumDimsInput
                        key={index}
                        dataTestId={'quantumInput' + index}
                        disabled={true}
                        label={quantumDimensionsLabels[index]}
                        value={parseFloat(quantumComponent.toExponential(2))}
                        onChange={(event) =>
                          setQuantumDimsInput(
                            quantumDimsInput.map((q, ind) =>
                              ind === index ? parseFloat(event.target.value) : q
                            ) as [number, number, number]
                          )
                        }
                      />
                    ))}
                  </div>

                  {meshGenerated === 'Generated' &&
                    !spinnerLoadData &&
                    !selectedProject?.simulation &&
                    selectedProject.maxFrequency &&
                    !suggestedQuantumError.active && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <button
                          className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium transition-all ${theme === 'light'
                            ? 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200'
                            }`}
                          onClick={() => {
                            setRefineMode('coarsen');
                            setShowModalRefine(true);
                          }}
                        >
                          <LiaCubeSolid size={18} />
                          <span>Coarsen</span>
                        </button>
                        <button
                          className={`flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium transition-all ${theme === 'light'
                            ? 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200'
                            }`}
                          onClick={() => {
                            setRefineMode('refine');
                            setShowModalRefine(true);
                          }}
                        >
                          <LiaCubesSolid size={18} />
                          <span>Refine</span>
                        </button>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {suggestedQuantumError.active && selectedProject.maxFrequency && (
              <>
                {(selectedProject?.meshData.type !== 'Ris' &&
                  process.env.MESHER_RIS_MODE === 'backend') ||
                  (selectedProject?.meshData.type === 'Ris' &&
                    process.env.MESHER_RIS_MODE === 'backend') ||
                  (selectedProject?.meshData.type === 'Standard' && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center">
                      {suggestedQuantumError.type === 'Mesher Not Active'
                        ? 'Mesher Down: start mesher or wait until started!'
                        : 'Unable to suggest quantum: max frequency not set'
                      }
                    </div>
                  ))}
              </>
            )}

            {/* Results Button */}
            {selectedProject.simulation?.resultS3 && (
              <button
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${theme === 'light'
                  ? 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-500/30'
                  : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30'
                  }`}
                data-testid="resultsButton"
                onClick={() => {
                  dispatch(selectMenuItem('Results'));
                }}
              >
                View Results
              </button>
            )}

            {/* Generate Mesh Button */}
            {!selectedProject?.simulation?.results &&
              ((selectedProject?.meshData.type === 'Standard' &&
                selectedProject?.meshData.meshGenerated === 'Not Generated') ||
                selectedProject?.meshData.type === 'Ris') && (
                <button
                  data-testid="generateMeshButton"
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 ${process.env.APP_MODE !== 'test' && selectedProject.maxFrequency
                    ? (theme === 'light'
                      ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30'
                      : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-600/30')
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-white/5 dark:text-gray-500'
                    }`}
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
              )}
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
    <div className="flex flex-col items-center gap-1">
      <span className={`text-xs font-bold opacity-70 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
        {label}
      </span>
      <input
        data-testid={dataTestId}
        disabled={disabled}
        min={0.0}
        className={`w-full p-1.5 text-center rounded-lg text-xs font-bold outline-none border transition-all ${theme === 'light'
          ? 'bg-white border-gray-200 focus:border-blue-500'
          : 'bg-black/40 border-white/10 focus:border-blue-500 text-white'
          }`}
        type="number"
        step={inputStep ? inputStep : 0.0001}
        value={isNaN(value) ? 0 : value}
        onChange={onChange}
      />
    </div>
  );
};
