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
import pako from 'pako';

/* ─── Inline keyframes (injected once) ─── */
const injectKeyframes = (() => {
  let injected = false;
  return () => {
    if (injected) return;
    injected = true;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 8px rgba(6,182,212,0.3); }
        50% { box-shadow: 0 0 16px rgba(6,182,212,0.6); }
      }
      @keyframes pulse-dot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.8); }
      }
    `;
    document.head.appendChild(style);
  };
})();

/* ─── Format seconds to mm:ss ─── */
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/* ─── Custom animated progress bar ─── */
const ProgressBar: React.FC<{
  value: number;
  max: number;
  variant: 'success' | 'primary' | 'info';
  isDark: boolean;
  animate?: boolean;
  indeterminate?: boolean;
}> = ({ value, max, variant, isDark, animate = false, indeterminate = false }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isComplete = pct >= 100;

  const gradients: Record<string, string> = {
    success: 'linear-gradient(90deg, #22c55e, #4ade80, #22c55e)',
    primary: 'linear-gradient(90deg, #6366f1, #818cf8, #6366f1)',
    info: 'linear-gradient(90deg, #06b6d4, #22d3ee, #06b6d4)',
  };

  if (indeterminate) {
    return (
      <div
        className={`relative w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: '0%',
            background: gradients[variant],
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s linear infinite',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${pct}%`,
          background: gradients[variant],
          backgroundSize: animate && !isComplete ? '200% 100%' : undefined,
          animation: animate && !isComplete ? 'shimmer 2s linear infinite' : undefined,
          boxShadow: isComplete
            ? `0 0 10px ${variant === 'success' ? 'rgba(34,197,94,0.5)' : variant === 'info' ? 'rgba(6,182,212,0.5)' : 'rgba(99,102,241,0.5)'}`
            : undefined,
        }}
      />
    </div>
  );
};

/* ─── Step indicator dot ─── */
const StepDot: React.FC<{
  status: 'done' | 'active' | 'pending';
  isDark: boolean;
}> = ({ status, isDark }) => {
  if (status === 'done') {
    return <AiOutlineCheckCircle className="text-green-500 flex-shrink-0" size={18} />;
  }
  if (status === 'active') {
    return (
      <div
        className="w-2.5 h-2.5 rounded-full bg-cyan-500 flex-shrink-0"
        style={{ animation: 'pulse-dot 1.5s ease-in-out infinite' }}
      />
    );
  }
  return (
    <div
      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isDark ? 'bg-white/15' : 'bg-gray-300'}`}
    />
  );
};

/* ─── Pipeline step row ─── */
const PipelineStep: React.FC<{
  label: string;
  status: 'done' | 'active' | 'pending';
  isDark: boolean;
  children?: React.ReactNode;
}> = ({ label, status, isDark, children }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center gap-2.5">
      <StepDot status={status} isDark={isDark} />
      <span
        className={`text-xs font-semibold uppercase tracking-wider ${status === 'done'
          ? 'text-green-500'
          : status === 'active'
            ? isDark ? 'text-white' : 'text-gray-900'
            : isDark ? 'text-white/30' : 'text-gray-400'
          }`}
      >
        {label}
      </span>
      {status === 'active' && (
        <ImSpinner className={`w-3 h-3 animate-spin ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
      )}
    </div>
    {children}
  </div>
);

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

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */
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
    injectKeyframes();
  }, []);

  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
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

  const totalActive = (runningMesh ? 1 : 0) + queuedMesh.length;

  return (
    <div
      className={`absolute right-10 bottom-10 flex flex-col items-stretch transition-all duration-300 ${!feedbackMeshingVisible && 'hidden'}`}
      style={{
        width: 'min(620px, 40vw)',
        borderRadius: '16px',
        background: isDark
          ? 'linear-gradient(145deg, rgba(30,30,40,0.92), rgba(18,18,28,0.96))'
          : 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(245,247,250,0.98))',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
        boxShadow: isDark
          ? '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset'
          : '0 24px 48px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.7) inset',
      }}
    >
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0"
            style={{ animation: totalActive > 0 ? 'pulse-dot 2s ease-in-out infinite' : undefined }}
          />
          <h5 className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Meshing Status
          </h5>
          {totalActive > 0 && (
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full ${isDark
                ? 'bg-cyan-500/25 text-cyan-300'
                : 'bg-cyan-100 text-cyan-700'
                }`}
            >
              {totalActive}
            </span>
          )}
        </div>
        <button
          onClick={() => setFeedbackMeshingVisible(false)}
          className={`p-1.5 rounded-lg transition-all duration-200 ${isDark
            ? 'hover:bg-white/10 text-gray-500 hover:text-white'
            : 'hover:bg-black/5 text-gray-400 hover:text-gray-700'
            }`}
        >
          <TiArrowMinimise size={18} />
        </button>
      </div>

      {/* ─── Divider ─── */}
      <div
        className="mx-5"
        style={{
          height: '1px',
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)',
        }}
      />

      {/* ─── Body ─── */}
      <div className="flex flex-col gap-2.5 p-4 max-h-[550px] overflow-y-auto custom-scrollbar">
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
            key={qm.selectedProject.id}
            project={qm}
            setqueuedMeshing={setqueuedMesh}
          />
        ))}
        {!runningMesh && queuedMesh.length === 0 && (
          <div
            className={`flex flex-col items-center justify-center py-10 gap-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
          >
            <div className="text-3xl opacity-50">⏸</div>
            <span className="text-sm font-medium">No active meshing tasks</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeshingStatus;

/* ══════════════════════════════════════════════════════════════════
   RUNNING MESHING ITEM
   ══════════════════════════════════════════════════════════════════ */
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

  const [elapsedTime, setElapsedTime] = useState(0);
  useEffect(() => {
    setElapsedTime(0);
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
    let removeListener: (() => void) | undefined;
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
            return;
          }
          try {
            const isGzipped = (selectedProject.bricks as string).endsWith('.gz');
            let jsonString: string;

            if (isGzipped && data.Body) {
              const uint8Array = new Uint8Array(data.Body as ArrayBuffer);
              const decompressed = pako.inflate(uint8Array, { to: 'string' });
              jsonString = decompressed;
            } else {
              jsonString = data.Body?.toString() as string;
            }

            const res = JSON.parse(jsonString);
            window.electron.ipcRenderer.sendMessage('computeMeshRis', [
              selectedProject.meshData.lambdaFactor as number,
              selectedProject.maxFrequency ? selectedProject.maxFrequency : 10e9,
              res.bricks,
              selectedProject.id as string,
              getEscalFrom(selectedProject.modelUnit),
            ]);
          } catch (parseError) {
            console.error('Error parsing bricks data:', parseError);
          }
        });
        removeListener = window.electron.ipcRenderer.on(
          'computeMeshRis',
          (arg: any) => {
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
          },
        );
      }
    }
    return () => {
      if (removeListener) removeListener();
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

  /* ─── Determine step states ─── */
  const isStandard = selectedProject.meshData.type === 'Standard';

  const meshingMax = isStandard ? 4 : 2;
  const meshingValue = meshingStep?.meshingStep ?? 0;
  const meshingDone = meshingValue >= meshingMax;

  const checkDone = gridsCreationValue !== undefined;
  const checkActive = meshingDone && !checkDone;

  const gridsDone = compress !== undefined;
  const gridsActive = checkDone && !gridsDone;

  const loadingDone = compress !== undefined && !compress;
  const loadingActive = gridsDone && !loadingDone;

  const meshStatus: 'done' | 'active' | 'pending' = meshingDone ? 'done' : meshingStep ? 'active' : 'active';

  const checkStatus: 'done' | 'active' | 'pending' = checkDone
    ? 'done'
    : checkActive
      ? 'active'
      : 'pending';

  const gridsStatus: 'done' | 'active' | 'pending' = gridsDone
    ? 'done'
    : gridsActive
      ? 'active'
      : 'pending';

  const loadingStatus: 'done' | 'active' | 'pending' = loadingDone
    ? 'done'
    : loadingActive
      ? 'active'
      : 'pending';

  // For RIS type, simplified pipeline
  const risMeshStatus: 'done' | 'active' | 'pending' = meshingDone ? 'done' : 'active';
  const risLoadingStatus: 'done' | 'active' | 'pending' = loadingDone
    ? 'done'
    : meshingDone
      ? 'active'
      : 'pending';

  console.log(meshingValue)

  return (
    <Disclosure defaultOpen>
      {({ open }) => (
        <div
          className="rounded-xl overflow-hidden transition-all duration-300"
          style={{
            border: isDark
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(0,0,0,0.06)',
            background: isDark
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(255,255,255,0.6)',
          }}
        >
          <Disclosure.Button
            className={`flex w-full justify-between items-center px-4 py-3 text-left text-sm font-medium focus:outline-none transition-colors duration-200 ${isDark
              ? 'hover:bg-white/5 text-gray-200'
              : 'hover:bg-white/80 text-gray-700'
              }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-semibold truncate">{selectedProject.name}</span>
            </div>
            <div className="flex items-center gap-2.5 flex-shrink-0">
              {/* Elapsed time badge */}
              <span
                className={`flex items-center gap-1.5 text-[11px] font-mono tabular-nums ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              >
                <PiClockCountdownBold className="w-3.5 h-3.5" />
                {formatTime(elapsedTime)}
              </span>

              {/* Status badge */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                style={{
                  background: isDark ? 'rgba(6,182,212,0.15)' : 'rgba(6,182,212,0.1)',
                  color: isDark ? '#22d3ee' : '#0891b2',
                  border: isDark
                    ? '1px solid rgba(6,182,212,0.2)'
                    : '1px solid rgba(6,182,212,0.2)',
                  animation: 'pulse-glow 3s ease-in-out infinite',
                }}
              >
                <ImSpinner className="animate-spin w-3 h-3" />
                Generating
              </div>

              <MdKeyboardArrowUp
                className={`${open ? '' : 'rotate-180'} h-4 w-4 transition-transform duration-300 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              />
            </div>
          </Disclosure.Button>

          <Disclosure.Panel className={`px-4 pb-4 pt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {selectedProject.meshData.meshGenerated === 'Generating' ? (
              <div className="relative">
                {stopSpinner && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10 rounded-xl">
                    <ImSpinner className={`animate-spin w-8 h-8 ${isDark ? 'text-white' : 'text-black'}`} />
                  </div>
                )}

                {/* ─── Pipeline steps ─── */}
                <div
                  className={`flex flex-col gap-4 p-4 rounded-xl ${stopSpinner ? 'opacity-40' : 'opacity-100'}`}
                  style={{
                    background: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.02)',
                    border: isDark
                      ? '1px solid rgba(255,255,255,0.04)'
                      : '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Step 1: Meshing */}
                  <PipelineStep label="Meshing" status={isStandard ? meshStatus : risMeshStatus} isDark={isDark}>
                    {meshingStep ? (
                      <ProgressBar
                        value={meshingValue ? meshingValue : 0}
                        max={meshingMax}
                        variant={meshingDone ? 'success' : 'info'}
                        isDark={isDark}
                        animate={!meshingDone}
                      />
                    ) : (
                      <ProgressBar value={0} max={1} variant="primary" isDark={isDark} indeterminate />
                    )}
                  </PipelineStep>

                  {/* Standard-only steps */}
                  {isStandard && (
                    <>
                      {/* Step 2: Check mesh validity */}
                      <PipelineStep label="Check mesh validity" status={checkStatus} isDark={isDark}>
                        {checkProgressValue && checkProgressLength && checkProgressLength.length > 0 ? (
                          <ProgressBar
                            value={checkProgressValue.index}
                            max={checkProgressLength.length}
                            variant={checkDone ? 'success' : 'info'}
                            isDark={isDark}
                            animate={!checkDone}
                          />
                        ) : (
                          <ProgressBar value={0} max={1} variant="primary" isDark={isDark} indeterminate={checkActive} />
                        )}
                      </PipelineStep>

                      {/* Step 3: Grids creation */}
                      <PipelineStep label="Grids creation" status={gridsStatus} isDark={isDark}>
                        {gridsCreationLength && gridsCreationValue ? (
                          <ProgressBar
                            value={gridsDone ? 1 : gridsCreationValue.gridsCreationValue}
                            max={gridsDone ? 1 : gridsCreationLength.gridsCreationLength}
                            variant={gridsDone ? 'success' : 'info'}
                            isDark={isDark}
                            animate={!gridsDone}
                          />
                        ) : (
                          <ProgressBar value={0} max={1} variant="primary" isDark={isDark} indeterminate={gridsActive} />
                        )}
                      </PipelineStep>
                    </>
                  )}

                  {/* Loading Data step */}
                  <PipelineStep label="Loading Data" status={isStandard ? loadingStatus : risLoadingStatus} isDark={isDark}>
                    {compress !== undefined ? (
                      <ProgressBar
                        value={!compress ? 1 : 0}
                        max={1}
                        variant={!compress ? 'success' : 'primary'}
                        isDark={isDark}
                        animate={!!compress}
                      />
                    ) : (
                      <ProgressBar
                        value={0}
                        max={1}
                        variant="primary"
                        isDark={isDark}
                        indeterminate={isStandard ? loadingActive : meshingDone}
                      />
                    )}
                  </PipelineStep>
                </div>

                {/* ─── Stop button ─── */}
                <button
                  className="w-full mt-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 transform active:scale-[0.97]"
                  style={{
                    background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
                    color: isDark ? '#f87171' : '#dc2626',
                    border: isDark
                      ? '1px solid rgba(239,68,68,0.2)'
                      : '1px solid rgba(239,68,68,0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark
                      ? 'rgba(239,68,68,0.25)'
                      : 'rgba(239,68,68,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDark
                      ? 'rgba(239,68,68,0.12)'
                      : 'rgba(239,68,68,0.08)';
                  }}
                  onClick={() => {
                    dispatch(setMessageInfoModal('Are you sure to stop the meshing?'));
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

/* ══════════════════════════════════════════════════════════════════
   QUEUED MESHING ITEM
   ══════════════════════════════════════════════════════════════════ */
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
    <div
      className="flex w-full justify-between items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200"
      style={{
        border: isDark
          ? '1px solid rgba(255,255,255,0.06)'
          : '1px solid rgba(0,0,0,0.06)',
        background: isDark
          ? 'rgba(255,255,255,0.03)'
          : 'rgba(255,255,255,0.6)',
      }}
    >
      <span className={`font-semibold truncate mr-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {project.selectedProject.name}
      </span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
          style={{
            background: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)',
            color: isDark ? '#fbbf24' : '#d97706',
            border: isDark
              ? '1px solid rgba(245,158,11,0.2)'
              : '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <PiClockCountdownBold className="w-3.5 h-3.5" />
          Queued
        </div>
        <button
          className={`p-1.5 rounded-lg transition-all duration-200 ${isDark
            ? 'hover:bg-red-500/15 text-gray-500 hover:text-red-400'
            : 'hover:bg-red-50 text-gray-400 hover:text-red-500'
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
          <TbTrashXFilled className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
};
