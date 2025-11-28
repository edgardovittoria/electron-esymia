import React, { useEffect, useState } from 'react';
import { ImSpinner } from 'react-icons/im';
import {
  compressSelector,
  gridsCreationLengthSelector,
  gridsCreationValueSelector,
  isAlertInfoModalSelector,
  isConfirmedInfoModalSelector,
  mesherProgressLengthSelector,
  mesherProgressSelector,
  mesherResultsSelector,
  meshingProgressSelector,
  setCompress,
  setGridsCreationLength,
  setGridsCreationValue,
  setIsAlertInfoModal,
  setMesherResults,
  setMeshingProgress,
  setMeshProgress,
  setMeshProgressLength,
  setMessageInfoModal,
  setShowInfoModal,
  ThemeSelector,
} from '../../../../../../../store/tabsAndMenuItemsSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  setExternalGrids,
  setMesh,
  setMeshASize,
  setMeshGenerated,
  setMeshValidTopology,
  setSurface,
} from '../../../../../../../store/projectSlice';
import { Project } from '../../../../../../../model/esymiaModels';
import { generateSTLListFromComponents } from './rightPanelFunctions';
import { TiArrowMinimise } from 'react-icons/ti';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { publishMessage } from '../../../../../../../../middleware/stompMiddleware';
import { Disclosure } from '@headlessui/react';
import { MdKeyboardArrowUp } from 'react-icons/md';
import { PiClockCountdownBold } from 'react-icons/pi';
import { TbTrashXFilled } from 'react-icons/tb';
import { ComponentEntity, Material } from '../../../../../../../../cad_library';
import { s3 } from '../../../../../../../aws/s3Config';
import { uploadFileS3 } from '../../../../../../../aws/mesherAPIs';
import { useDynamoDBQuery } from '../../../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../../../../../../dynamoDB/projectsFolderApi';
import axios from 'axios';

export interface MeshingStatusProps {
  feedbackMeshingVisible: boolean;
  setFeedbackMeshingVisible: (v: boolean) => void;
  activeMeshing: {
    selectedProject: Project;
    allMaterials: Material[];
    quantum: [number, number, number];
    meshStatus: 'Not Generated' | 'Generated';
  }[];
}

const MeshingStatus: React.FC<MeshingStatusProps> = ({
  feedbackMeshingVisible,
  setFeedbackMeshingVisible,
  activeMeshing,
}) => {
  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

  const [runningMesh, setrunningMesh] = useState<
    | {
      selectedProject: Project;
      allMaterials: Material[];
      quantum: [number, number, number];
      meshStatus: 'Not Generated' | 'Generated';
    }
    | undefined
  >(undefined);

  const [queuedMesh, setqueuedMesh] = useState<
    {
      selectedProject: Project;
      allMaterials: Material[];
      quantum: [number, number, number];
      meshStatus: 'Not Generated' | 'Generated';
    }[]
  >([]);

  useEffect(() => {
    if (process.env.APP_MODE !== 'test') {
      window.electron.ipcRenderer.sendMessage('meshingComputation', [true]);
      return () => {
        window.electron.ipcRenderer.sendMessage('meshingComputation', [false]);
      };
    }
  }, []);

  useEffect(() => {
    activeMeshing.forEach((am) => {
      if (am.selectedProject.meshData.meshGenerated === 'Generating') {
        setrunningMesh(am);
      } else if (am.selectedProject.meshData.meshGenerated === 'Queued') {
        if (
          queuedMesh.filter(
            (qm) => qm.selectedProject.id === am.selectedProject.id,
          ).length === 0
        ) {
          setqueuedMesh((prev) => [...prev, am]);
        }
      }
    });
    if (!runningMesh && queuedMesh.length > 0) {
      let item = queuedMesh.pop();
      dispatch(
        setMeshGenerated({
          status: 'Generating',
          projectToUpdate: item ? (item.selectedProject.id as string) : '',
        }),
      );
      if (item) {
        setqueuedMesh(
          queuedMesh.filter(
            (qm) => qm.selectedProject.id !== item.selectedProject.id,
          ),
        );
        setrunningMesh({
          ...item,
          selectedProject: {
            ...item?.selectedProject,
            meshData: {
              ...item?.selectedProject.meshData,
              meshGenerated: 'Generating',
            },
          },
        });
      }
    }
  }, [activeMeshing.length]);

  return (
    <div
      className={`absolute right-10 w-1/4 bottom-10 flex flex-col justify-center items-center glass-panel ${isDark ? 'glass-panel-dark' : 'glass-panel-light'
        } p-4 rounded-2xl shadow-2xl transition-all duration-300 backdrop-blur-md border ${isDark ? 'border-white/10' : 'border-white/40'
        } ${!feedbackMeshingVisible && 'hidden'}`}
    >
      <div className="flex flex-row justify-between w-full items-center mb-3">
        <h5 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>Meshing Status</h5>
        <button
          onClick={() => setFeedbackMeshingVisible(false)}
          className={`p-1.5 rounded-full transition-colors duration-200 ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-black/5 text-gray-500 hover:text-black'
            }`}
        >
          <TiArrowMinimise size={20} />
        </button>
      </div>
      <div className={`w-full h-px mb-4 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

      <div className="max-h-[600px] overflow-y-auto w-full pr-1 custom-scrollbar flex flex-col gap-3">
        {runningMesh && (
          <MeshingStatusItem
            selectedProject={runningMesh.selectedProject}
            allMaterials={runningMesh.allMaterials}
            quantumDimsInput={runningMesh.quantum}
            setrunningMesh={setrunningMesh}
          />
        )}
        {queuedMesh.map((qm) => (
          <QueuedMeshingStatusItem
            project={qm}
            setqueuedMeshing={setqueuedMesh}
          />
        ))}
        {!runningMesh && queuedMesh.length === 0 && (
          <div className={`text-center py-8 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            No active meshing tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default MeshingStatus;

export interface MeshingStatusItemProps {
  selectedProject: Project;
  allMaterials: Material[];
  quantumDimsInput: [number, number, number];
  setrunningMesh: Function;
}

const MeshingStatusItem: React.FC<MeshingStatusItemProps> = ({
  selectedProject,
  allMaterials,
  quantumDimsInput,
  setrunningMesh,
}) => {
  const dispatch = useDispatch();
  const isAlertConfirmed = useSelector(isConfirmedInfoModalSelector);
  const isAlert = useSelector(isAlertInfoModalSelector);
  const checkProgressLength = useSelector(mesherProgressLengthSelector);
  const checkProgressValue = useSelector(mesherProgressSelector);
  const meshingStep = useSelector(meshingProgressSelector);
  const gridsCreationLength = useSelector(gridsCreationLengthSelector);
  const gridsCreationValue = useSelector(gridsCreationValueSelector);
  const compress = useSelector(compressSelector);
  const [stopSpinner, setStopSpinner] = useState<boolean>(false);
  const mesherResults = useSelector(mesherResultsSelector);
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

  const getEscalFrom = (unit?: string) => {
    let escal = 1.0;
    if (unit !== undefined) {
      if (unit === 'm') escal = 1.0;
      if (unit === 'dm') escal = 1e-1;
      if (unit === 'cm') escal = 1e-2;
      if (unit === 'mm') escal = 1e-3;
      if (unit === 'microm') escal = 1e-6;
      if (unit === 'nanom') escal = 1e-9;
    }
    return escal;
  };

  useEffect(() => {
    if (selectedProject.meshData.type === 'Standard') {
      const components = selectedProject?.model
        ?.components as ComponentEntity[];
      const objToSendToMesher = {
        STLList:
          components &&
          allMaterials &&
          generateSTLListFromComponents(allMaterials, components),
        quantum: quantumDimsInput,
        id: selectedProject.id as string,
        meshingType: selectedProject.meshData.type,
      };
      axios
        .post('http://localhost:8002/meshing', objToSendToMesher)
        .then(() => { })
        .catch((e) => {
          dispatch(
            setMessageInfoModal('Something went wrong! Check Mesher status.'),
          );
          dispatch(setIsAlertInfoModal(false));
          dispatch(setShowInfoModal(true));
        });
    } else {
      if (process.env.MESHER_RIS_MODE === 'backend') {
        axios
          .post('http://localhost:8002/meshing', {
            fileNameRisGeometry: selectedProject.bricks as string,
            id: selectedProject.id as string,
            density: selectedProject.meshData.lambdaFactor,
            freqMax: selectedProject.maxFrequency,
            meshingType: selectedProject.meshData.type,
            escal: getEscalFrom(selectedProject.modelUnit),
          })
          .then(() => { })
          .catch((e) => {
            dispatch(
              setMessageInfoModal('Something went wrong! Check Mesher status.'),
            );
            dispatch(setIsAlertInfoModal(false));
            dispatch(setShowInfoModal(true));
          });
      } else {
        const params = {
          Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
          Key: selectedProject.bricks as string,
        };
        s3.getObject(params, (err, data) => {
          if (err) {
            console.log(err);
          }
          const res = JSON.parse(data.Body?.toString() as string);
          window.electron.ipcRenderer.sendMessage('computeMeshRis', [
            selectedProject.meshData.lambdaFactor as number,
            selectedProject.maxFrequency ? selectedProject.maxFrequency : 10e9,
            res.bricks,
            selectedProject.id as string,
            getEscalFrom(selectedProject.modelUnit),
          ]);
        });
        window.electron.ipcRenderer.on('computeMeshRis', (arg: any) => {
          if (arg === 'meshingStep1') {
            dispatch(
              setMeshingProgress({
                meshingStep: 1,
                id: selectedProject.id as string,
              }),
            );
          } else if (arg === 'meshingStep2') {
            dispatch(
              setMeshingProgress({
                meshingStep: 2,
                id: selectedProject.id as string,
              }),
            );
          } else {
            const { mesh, superfici } = arg;
            const meshToUploadToS3 = JSON.stringify(mesh);
            const blobFileMesh = new Blob([meshToUploadToS3]);
            const meshFile = new File(
              [blobFileMesh],
              `${selectedProject.id}_mesh.json`,
            );
            const surfacesToUploadToS3 = JSON.stringify(superfici);
            const blobFileSurfaces = new Blob([surfacesToUploadToS3]);
            const surfacesFile = new File(
              [blobFileSurfaces],
              `${selectedProject.id}_surface.json`,
            );
            uploadFileS3(meshFile).then((resMesh) => {
              console.log('mesh uploaded :', resMesh);
              if (resMesh) {
                uploadFileS3(surfacesFile).then((resSurface) => {
                  console.log('surfaces uploaded :', resSurface);
                  dispatch(
                    setMesherResults({
                      id: selectedProject.id as string,
                      gridsPath: '',
                      meshPath: resMesh.key,
                      surfacePath: resSurface ? resSurface.key : '',
                      isStopped: false,
                      isValid: { valid: true },
                      validTopology: true,
                      error: undefined,
                      ASize: mesh.ASize,
                    }),
                  );
                  dispatch(
                    setMeshASize({
                      ASize: mesh.ASize,
                      projectToUpdate: selectedProject.id as string,
                    }),
                  );
                });
              }
            });
          }
        });
      }
    }
    return () => {
      window.electron.ipcRenderer.removeAllListeners('computeMeshRis');
    };
  }, []);

  const { execQuery2 } = useDynamoDBQuery();

  useEffect(() => {
    if (mesherResults && mesherResults.id === selectedProject.id) {
      if (mesherResults.isStopped) {
        dispatch(
          setMeshGenerated({
            status: selectedProject.meshData.previousMeshStatus as
              | 'Not Generated'
              | 'Generated',
            projectToUpdate: selectedProject.id as string,
          }),
        );
        dispatch(
          setMeshValidTopology({
            status: mesherResults.validTopology,
            projectToUpdate: selectedProject.id as string,
          }),
        );
      } else if (mesherResults.isValid.valid === false) {
        dispatch(
          setMessageInfoModal(
            'Error! Mesh not valid. Please adjust quantum along ' +
            mesherResults.isValid.axis +
            ' axis.',
          ),
        );
        dispatch(setIsAlertInfoModal(true));
        dispatch(setShowInfoModal(true));
        dispatch(
          setMeshGenerated({
            status: selectedProject.meshData.previousMeshStatus as
              | 'Not Generated'
              | 'Generated',
            projectToUpdate: selectedProject.id as string,
          }),
        );
        dispatch(
          setMeshValidTopology({
            status: mesherResults.validTopology,
            projectToUpdate: selectedProject.id as string,
          }),
        );
      } else if (
        mesherResults.error &&
        mesherResults.error === 'out of memory'
      ) {
        dispatch(
          setMessageInfoModal(
            'Memory error, the requested mesh cannot be generated, try a larger quantum if possible!',
          ),
        );
        dispatch(setIsAlertInfoModal(true));
        dispatch(setShowInfoModal(true));
        dispatch(
          setMeshGenerated({
            status: selectedProject.meshData.previousMeshStatus as
              | 'Not Generated'
              | 'Generated',
            projectToUpdate: selectedProject.id as string,
          }),
        );
        dispatch(
          setMeshValidTopology({
            status: mesherResults.validTopology,
            projectToUpdate: selectedProject.id as string,
          }),
        );
      } else {
        if (selectedProject.meshData.type === 'Standard') {
          dispatch(
            setMeshValidTopology({
              status: mesherResults.validTopology,
              projectToUpdate: selectedProject.id as string,
            }),
          );
          dispatch(
            setExternalGrids({
              extGrids: mesherResults.gridsPath,
              projectToUpdate: selectedProject.id as string,
            }),
          );
        } else {
          dispatch(
            setSurface({
              surface: mesherResults.surfacePath,
              projectToUpdate: selectedProject.id as string,
            }),
          );
        }
        dispatch(
          setMeshGenerated({
            status: 'Generated',
            projectToUpdate: selectedProject.id as string,
          }),
        );
        dispatch(
          setMesh({
            mesh: mesherResults.meshPath,
            projectToUpdate: selectedProject.id as string,
          }),
        );
        execQuery2(
          createOrUpdateProjectInDynamoDB,
          {
            ...selectedProject,
            meshData: {
              ...selectedProject.meshData,
              mesh: mesherResults.meshPath,
              externalGrids: mesherResults.gridsPath,
              surface: mesherResults.surfacePath,
              meshGenerated: 'Generated',
              validTopology: mesherResults.validTopology,
              ASize: mesherResults.ASize,
            },
          },
          dispatch,
        ).then(() => { });
      }
      dispatch(setMeshingProgress(undefined));
      dispatch(setMeshProgressLength(undefined));
      dispatch(setMeshProgress(undefined));
      dispatch(setGridsCreationValue(undefined));
      dispatch(setGridsCreationLength(undefined));
      dispatch(setCompress(undefined));
      dispatch(setMesherResults(undefined));
      setrunningMesh(undefined);
    }
  }, [mesherResults]);

  useEffect(() => {
    if (isAlertConfirmed) {
      if (!isAlert) {
        if (
          process.env.MESHER_RIS_MODE === 'backend' ||
          selectedProject.meshData.type === 'Standard'
        ) {
          axios
            .post(
              'http://localhost:8002/stop_computation?meshing_id=' +
              selectedProject.id,
            )
            .then(() => { })
            .catch((e) => {
              dispatch(
                setMessageInfoModal(
                  'Something went wrong! Check Mesher status.',
                ),
              );
              dispatch(setIsAlertInfoModal(false));
              dispatch(setShowInfoModal(true));
            });
        } else {
          window.electron.ipcRenderer.sendMessage('stopMeshing', []);
        }
        dispatch(
          setMeshGenerated({
            status: selectedProject.meshData.previousMeshStatus as
              | 'Not Generated'
              | 'Generated',
            projectToUpdate: selectedProject.id as string,
          }),
        );
        dispatch(setMeshingProgress(undefined));
        dispatch(setMeshProgressLength(undefined));
        dispatch(setMeshProgress(undefined));
        dispatch(setGridsCreationValue(undefined));
        dispatch(setGridsCreationLength(undefined));
        dispatch(setCompress(undefined));
        dispatch(setMesherResults(undefined));
        setrunningMesh(undefined);
      } else {
        dispatch(
          setMeshGenerated({
            status: 'Not Generated',
            projectToUpdate: selectedProject.id as string,
          }),
        );
      }
    }
  }, [isAlertConfirmed]);

  return (
    <Disclosure defaultOpen>
      {({ open }) => (
        <div className={`rounded-xl overflow-hidden border transition-all duration-300 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white/50'
          }`}>
          <Disclosure.Button
            className={`flex w-full justify-between items-center px-4 py-3 text-left text-sm font-medium focus:outline-none transition-colors duration-200 ${isDark ? 'hover:bg-white/10 text-gray-200' : 'hover:bg-white/60 text-gray-700'
              }`}
          >
            <span className="font-semibold">{selectedProject.name}</span>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${isDark
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-green-100 text-green-700 border-green-200'
                }`}>
                <ImSpinner className="animate-spin" />
                <span>Generating</span>
              </div>
              <MdKeyboardArrowUp
                className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 transition-transform duration-200 ${isDark ? 'text-gray-400' : 'text-gray-500'
                  } `}
              />
            </div>
          </Disclosure.Button>
          <Disclosure.Panel className={`px-4 pb-4 pt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {selectedProject.meshData.meshGenerated === 'Generating' ? (
              <div
                className={`flex flex-col gap-4 items-center justify-center w-full`}
              >
                {stopSpinner && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10 rounded-xl">
                    <ImSpinner className={`animate-spin w-8 h-8 ${isDark ? 'text-white' : 'text-black'}`} />
                  </div>
                )}
                <div
                  className={`flex flex-col gap-2 w-full ${stopSpinner ? 'opacity-40' : 'opacity-100'
                    }`}
                >
                  <span className="text-xs font-medium uppercase tracking-wider opacity-70">Meshing</span>
                  <div className="flex flex-row justify-between items-center w-full">
                    {meshingStep ? (
                      <>
                        {(selectedProject.meshData.type === 'Standard' &&
                          meshingStep.meshingStep === 4) ||
                          (selectedProject.meshData.type === 'Ris' &&
                            meshingStep.meshingStep === 2) ? (
                          <div className="flex flex-row w-full justify-between items-center">
                            <progress
                              className={`progress w-full mr-4 ${isDark ? 'progress-success' : 'progress-success'}`}
                              value={1}
                              max={1}
                            />
                            <AiOutlineCheckCircle
                              size="20px"
                              className="text-green-500"
                            />
                          </div>
                        ) : (
                          <progress
                            className={`progress w-full ${isDark ? 'progress-info' : 'progress-info'}`}
                            value={meshingStep.meshingStep}
                            max={
                              selectedProject.meshData.type === 'Standard'
                                ? 4
                                : 2
                            }
                          />
                        )}
                      </>
                    ) : (
                      <progress className={`progress w-full ${isDark ? 'progress-primary' : 'progress-primary'}`} />
                    )}
                  </div>
                </div>
                {selectedProject.meshData.type === 'Standard' && (
                  <>
                    <div
                      className={`flex flex-col gap-2 w-full ${stopSpinner ? 'opacity-40' : 'opacity-100'
                        }`}
                    >
                      <span className="text-xs font-medium uppercase tracking-wider opacity-70">Check mesh validity</span>
                      <div className="flex flex-row justify-between items-center w-full">
                        {checkProgressValue &&
                          checkProgressLength &&
                          checkProgressLength.length > 0 ? (
                          <div className="flex flex-row w-full justify-between items-center">
                            <progress
                              className={`progress w-full mr-4 ${isDark ? 'progress-info' : 'progress-info'}`}
                              value={checkProgressValue.index}
                              max={checkProgressLength.length}
                            />
                            {gridsCreationValue !== undefined && (
                              <AiOutlineCheckCircle
                                size="20px"
                                className="text-green-500"
                              />
                            )}
                          </div>
                        ) : (
                          <progress className={`progress w-full ${isDark ? 'progress-primary' : 'progress-primary'}`} />
                        )}
                      </div>
                    </div>
                    <div
                      className={`flex flex-col gap-2 w-full ${stopSpinner ? 'opacity-40' : 'opacity-100'
                        }`}
                    >
                      <span className="text-xs font-medium uppercase tracking-wider opacity-70">Grids creation</span>
                      <div className="flex flex-row justify-between items-center w-full">
                        {gridsCreationLength && gridsCreationValue ? (
                          <>
                            {compress !== undefined ? (
                              <div className="flex flex-row w-full justify-between items-center">
                                <progress
                                  className={`progress w-full mr-4 ${isDark ? 'progress-success' : 'progress-success'}`}
                                  value={1}
                                  max={1}
                                />
                                <AiOutlineCheckCircle
                                  size="20px"
                                  className="text-green-500"
                                />
                              </div>
                            ) : (
                              <progress
                                className={`progress w-full ${isDark ? 'progress-info' : 'progress-info'}`}
                                max={gridsCreationLength.gridsCreationLength}
                                value={gridsCreationValue.gridsCreationValue}
                              />
                            )}
                          </>
                        ) : (
                          <progress className={`progress w-full ${isDark ? 'progress-primary' : 'progress-primary'}`} />
                        )}
                      </div>
                    </div>
                  </>
                )}
                <div
                  className={`flex flex-col gap-2 w-full ${stopSpinner ? 'opacity-40' : 'opacity-100'
                    }`}
                >
                  <span className="text-xs font-medium uppercase tracking-wider opacity-70">Loading Data</span>
                  <div className="flex flex-row justify-between items-center w-full">
                    {compress !== undefined ? (
                      <>
                        {!compress ? (
                          <div className="flex flex-row w-full justify-between items-center">
                            <progress
                              className={`progress w-full mr-4 ${isDark ? 'progress-success' : 'progress-success'}`}
                              value={1}
                              max={1}
                            />
                            <AiOutlineCheckCircle
                              size="20px"
                              className="text-green-500"
                            />
                          </div>
                        ) : (
                          <progress className={`progress w-full ${isDark ? 'progress-primary' : 'progress-primary'}`} />
                        )}
                      </>
                    ) : (
                      <progress className={`progress w-full ${isDark ? 'progress-primary' : 'progress-primary'}`} />
                    )}
                  </div>
                </div>
                <button
                  className={`w-full py-2 rounded-lg text-sm font-semibold shadow-md transition-all duration-200 transform active:scale-95 mt-2 ${isDark
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                      : 'bg-red-100 text-red-600 border border-red-200 hover:bg-red-200'
                    }`}
                  onClick={() => {
                    dispatch(
                      setMessageInfoModal('Are you sure to stop the meshing?'),
                    );
                    dispatch(setIsAlertInfoModal(false));
                    dispatch(setShowInfoModal(true));
                    setStopSpinner(true);
                  }}
                >
                  Stop Meshing
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <span className="opacity-60">Waiting for process...</span>
              </div>
            )}
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
};

export interface QueuedMeshingStatusItemProps {
  project: {
    selectedProject: Project;
    allMaterials: Material[];
    quantum: [number, number, number];
    meshStatus: 'Not Generated' | 'Generated';
  };
  setqueuedMeshing: React.Dispatch<
    React.SetStateAction<
      {
        selectedProject: Project;
        allMaterials: Material[];
        quantum: [number, number, number];
        meshStatus: 'Not Generated' | 'Generated';
      }[]
    >
  >;
}

const QueuedMeshingStatusItem: React.FC<QueuedMeshingStatusItemProps> = ({
  project,
  setqueuedMeshing,
}) => {
  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

  return (
    <div className={`flex w-full justify-between items-center rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${isDark
        ? 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
        : 'border-gray-200 bg-white/50 text-gray-700 hover:bg-white/80'
      }`}>
      <span className="font-semibold">{project.selectedProject.name}</span>
      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${isDark
          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          : 'bg-amber-100 text-amber-700 border-amber-200'
        }`}>
        <PiClockCountdownBold className="w-3.5 h-3.5" />
        <span>Queued</span>
      </div>
      <button
        className={`p-1.5 rounded-full transition-colors duration-200 ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-500'
          }`}
        title="Remove queued meshing"
        onClick={() => {
          setqueuedMeshing((prev) =>
            prev.filter(
              (item) => item.selectedProject.id !== project.selectedProject.id,
            ),
          );
          dispatch(
            setMeshGenerated({
              status: project.meshStatus,
              projectToUpdate: project.selectedProject.id as string,
            }),
          );
        }}
      >
        <TbTrashXFilled className="w-5 h-5" />
      </button>
    </div>
  );
};
