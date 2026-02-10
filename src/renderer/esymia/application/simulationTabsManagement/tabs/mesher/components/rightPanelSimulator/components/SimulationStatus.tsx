import React, { useEffect, useState } from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { TiArrowMinimise } from 'react-icons/ti';
import { MdKeyboardArrowUp } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import {
  Project,
  Simulation,
  SolverOutput,
} from '../../../../../../../model/esymiaModels';
import {
  convergenceTresholdSelector,
  solverIterationsSelector,
  solverTypeSelector,
} from '../../../../../../../store/solverSlice';
import {
  deleteSimulation,
  selectedProjectSelector,
  setMeshApproved,
  updateSimulation,
} from '../../../../../../../store/projectSlice';
import { getMaterialListFrom } from '../../../../solver/Solver';
import {
  computingLpSelector,
  computingPSelector,
  estimatedTimeSelector,
  isAlertInfoModalSelector,
  isConfirmedInfoModalSelector,
  iterationsSelector,
  setElectricFieldsResultsStep,
  setEstimatedTime,
  setIsAlertInfoModal,
  setMessageInfoModal,
  setShowInfoModal,
  setSolverResultsS3,
  solverResultsS3Selector,
  solverResultsSelector,
  ThemeSelector,
  unsetComputingLp,
  unsetComputingP,
  unsetIterations,
  unsetSolverResults,
} from '../../../../../../../store/tabsAndMenuItemsSlice';
import { publishMessage } from '../../../../../../../../middleware/stompMiddleware';
import { PiClockCountdownBold } from 'react-icons/pi';
import { ImSpinner } from 'react-icons/im';
import { TbTrashXFilled } from 'react-icons/tb';
import { ComponentEntity } from '../../../../../../../../cad_library';
import { useDynamoDBQuery } from '../../../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../../../../../../dynamoDB/projectsFolderApi';
import { electricFieldsResultsStepSelector } from '../../../../../../../store/tabsAndMenuItemsSlice';
import axios from 'axios';

export interface SimulationStatusProps {
  feedbackSimulationVisible: boolean;
  setFeedbackSimulationVisible: (v: boolean) => void;
  activeSimulations: {
    simulation: Simulation;
    freqNumber: number;
    project: Project;
  }[];
}

/* ─── Inline keyframes injected once ─── */
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
        0%, 100% { box-shadow: 0 0 8px rgba(34,197,94,0.3); }
        50% { box-shadow: 0 0 16px rgba(34,197,94,0.6); }
      }
      @keyframes pulse-dot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.8); }
      }
      @keyframes slide-in-progress {
        from { transform: scaleX(0); }
        to { transform: scaleX(1); }
      }
    `;
    document.head.appendChild(style);
  };
})();

/* ─── Helper: format seconds to mm:ss ─── */
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
}> = ({ value, max, variant, isDark, animate = false }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isComplete = pct >= 100;

  const gradients: Record<string, string> = {
    success: 'linear-gradient(90deg, #22c55e, #4ade80, #22c55e)',
    primary: 'linear-gradient(90deg, #6366f1, #818cf8, #6366f1)',
    info: 'linear-gradient(90deg, #06b6d4, #22d3ee, #06b6d4)',
  };

  return (
    <div
      className={`relative w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'
        }`}
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
        className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0"
        style={{ animation: 'pulse-dot 1.5s ease-in-out infinite' }}
      />
    );
  }
  return (
    <div
      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isDark ? 'bg-white/15' : 'bg-gray-300'
        }`}
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
            ? isDark
              ? 'text-white'
              : 'text-gray-900'
            : isDark
              ? 'text-white/30'
              : 'text-gray-400'
          }`}
      >
        {label}
      </span>
      {status === 'active' && (
        <ImSpinner
          className={`w-3 h-3 animate-spin ${isDark ? 'text-indigo-400' : 'text-indigo-600'
            }`}
        />
      )}
    </div>
    {children}
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */
const SimulationStatus: React.FC<SimulationStatusProps> = ({
  feedbackSimulationVisible,
  setFeedbackSimulationVisible,
  activeSimulations,
}) => {
  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

  const [runningSimulation, setRunningSimulation] = useState<
    { simulation: Simulation; freqNumber: number; project: Project } | undefined
  >(undefined);
  const [queuedSimulations, setqueuedSimulations] = useState<
    { simulation: Simulation; freqNumber: number; project: Project }[]
  >([]);

  useEffect(() => {
    injectKeyframes();
  }, []);

  useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.sendMessage('solvingComputation', [true]);
      return () => {
        window.electron.ipcRenderer.sendMessage('solvingComputation', [false]);
      };
    }
  }, []);

  useEffect(() => {
    activeSimulations.forEach((sim) => {
      if (sim.simulation.status === 'Running') {
        setRunningSimulation(sim);
      } else if (sim.simulation.status === 'Queued') {
        if (
          queuedSimulations.filter(
            (qsim) =>
              qsim.simulation.associatedProject ===
              sim.simulation.associatedProject,
          ).length === 0
        ) {
          setqueuedSimulations((prev) => [...prev, sim]);
        }
      }
    });
    if (!runningSimulation && queuedSimulations.length > 0) {
      let item = queuedSimulations.pop();
      if (item) {
        const simulationUpdated: Simulation = {
          ...item?.simulation,
          status: 'Running',
        };
        dispatch(
          updateSimulation({
            associatedProject: simulationUpdated.associatedProject,
            value: simulationUpdated,
          }),
        );
        setqueuedSimulations(
          queuedSimulations.filter(
            (qsim) =>
              qsim.simulation.associatedProject !==
              item.simulation.associatedProject,
          ),
        );
        setRunningSimulation({
          ...item,
          simulation: {
            ...item.simulation,
            status: 'Running',
          },
        });
      }
    }
  }, [activeSimulations.length]);

  const totalActive =
    (runningSimulation ? 1 : 0) + queuedSimulations.length;

  return (
    <div
      className={`absolute right-10 bottom-16 flex flex-col items-stretch transition-all duration-300 ${!feedbackSimulationVisible && 'hidden'
        }`}
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
            className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
            style={{ animation: totalActive > 0 ? 'pulse-dot 2s ease-in-out infinite' : undefined }}
          />
          <h5
            className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-gray-900'
              }`}
          >
            Simulation Status
          </h5>
          {totalActive > 0 && (
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full ${isDark
                ? 'bg-indigo-500/25 text-indigo-300'
                : 'bg-indigo-100 text-indigo-700'
                }`}
            >
              {totalActive}
            </span>
          )}
        </div>
        <button
          onClick={() => setFeedbackSimulationVisible(false)}
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
        {runningSimulation && (
          <SimulationStatusItem
            key={runningSimulation.simulation.name ?? 'unnamed'}
            name={runningSimulation.simulation.name ?? 'Unnamed Simulation'}
            frequenciesNumber={runningSimulation.freqNumber}
            associatedProject={runningSimulation.project}
            simulation={runningSimulation.simulation}
            setRunningSimulation={setRunningSimulation}
          />
        )}
        {queuedSimulations.map((qs) => (
          <QueuedSimulationStatusItem
            key={qs.simulation.associatedProject}
            name={qs.simulation.name ?? 'Unnamed Simulation'}
            associatedProject={qs.simulation.associatedProject}
            setqueuedSimulations={setqueuedSimulations}
          />
        ))}
        {!runningSimulation && queuedSimulations.length === 0 && (
          <div
            className={`flex flex-col items-center justify-center py-10 gap-2 ${isDark ? 'text-gray-600' : 'text-gray-400'
              }`}
          >
            <div className="text-3xl opacity-50">⏸</div>
            <span className="text-sm font-medium">No active simulations</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationStatus;

/* ══════════════════════════════════════════════════════════════════
   RUNNING SIMULATION ITEM
   ══════════════════════════════════════════════════════════════════ */
const SimulationStatusItem: React.FC<{
  name: string;
  frequenciesNumber: number;
  associatedProject: Project;
  simulation: Simulation;
  setRunningSimulation: Function;
}> = ({
  name,
  frequenciesNumber,
  associatedProject,
  simulation,
  setRunningSimulation,
}) => {
    const computingP = useSelector(computingPSelector).filter(
      (item) => item.id === associatedProject.id,
    )[0];
    const computingLpx = useSelector(computingLpSelector).filter(
      (item) => item.id === associatedProject.id,
    )[0];
    const iterations = useSelector(iterationsSelector).filter(
      (item) => item.id === associatedProject.id,
    )[0];
    const estimatedTime = useSelector(estimatedTimeSelector);
    const electricFieldsResultsStep = useSelector(
      electricFieldsResultsStepSelector,
    );
    const solverType = useSelector(solverTypeSelector);
    const solverIterations = useSelector(solverIterationsSelector);
    const convergenceThreshold = useSelector(convergenceTresholdSelector);
    const selectedProject = useSelector(selectedProjectSelector);
    const isAlertConfirmed = useSelector(isConfirmedInfoModalSelector);
    const isAlert = useSelector(isAlertInfoModalSelector);
    const solverResults = useSelector(solverResultsSelector).filter(
      (item) => item.id === associatedProject.id,
    )[0];
    const solverResultsS3 = useSelector(solverResultsS3Selector);
    const theme = useSelector(ThemeSelector);
    const isDark = theme !== 'light';
    const dispatch = useDispatch();
    const { execQuery2 } = useDynamoDBQuery();

    useEffect(() => {
      if (isAlertConfirmed) {
        if (!isAlert) {
          dispatch(deleteSimulation(associatedProject.id as string));
          dispatch(
            setMeshApproved({
              approved: false,
              projectToUpdate: associatedProject.id as string,
            }),
          );
          dispatch(unsetComputingLp(associatedProject.id as string));
          dispatch(unsetComputingP(associatedProject.id as string));
          dispatch(unsetIterations(associatedProject.id as string));
          dispatch(unsetSolverResults());
          dispatch(
            publishMessage({
              queue: 'management_solver',
              body: {
                message: 'stop_computation',
                id: associatedProject.id as string,
              },
            }),
          );
          setRunningSimulation(undefined);
          axios
            .post(
              'http://127.0.0.1:8001/stop_computation?sim_id=' +
              associatedProject.id,
            )
            .catch((e) => {
              dispatch(
                setMessageInfoModal('Something went wrong! Check Solver status.'),
              );
              dispatch(setIsAlertInfoModal(false));
              dispatch(setShowInfoModal(true));
            });
        }
      }
    }, [isAlertConfirmed]);

    const solverInputFrom = (
      project: Project,
      solverType: 1 | 2,
      solverIterations: [number, number],
      convergenceThreshold: number,
    ) => {
      const frequencyArray: number[] = project.frequencies as number[];
      return {
        mesherFileId: project.meshData.mesh,
        surfaceFileId: project.meshData.surface,
        storage: project.storage,
        solverInput: {
          ports: project.ports.filter((p) => p.category === 'port'),
          lumped_elements: project.ports.filter((p) => p.category === 'lumped'),
          materials: getMaterialListFrom(
            project?.model?.components as ComponentEntity[],
          ),
          frequencies: frequencyArray,
          unit: project.modelUnit,
          ports_scattering_value: project.scatteringValue,
        },
        solverAlgoParams: {
          innerIteration: solverIterations[1],
          outerIteration: solverIterations[0],
          convergenceThreshold,
        },
        solverType: solverType,
        id: project.id as string,
        mesherType: process.env.MESHER_RIS_MODE as string,
      };
    };

    useEffect(() => {
      dispatch(setEstimatedTime(undefined));
      dispatch(setElectricFieldsResultsStep(undefined));
      let objectToSendToSolver = solverInputFrom(
        associatedProject,
        solverType,
        solverIterations,
        convergenceThreshold,
      );
      if (associatedProject.meshData.type === 'Standard') {
        axios
          .post('http://127.0.0.1:8001/solve', {
            ...objectToSendToSolver,
            simulationType: associatedProject.simulation?.simulationType,
            mesher: 'standard',
          })
          .catch((e) => {
            dispatch(
              setMessageInfoModal('Something went wrong! Check Solver status.'),
            );
            dispatch(setIsAlertInfoModal(false));
            dispatch(setShowInfoModal(true));
          });
      } else {
        if (associatedProject.simulation?.simulationType === 'Matrix') {
          axios
            .post('http://127.0.0.1:8001/solve', {
              ...objectToSendToSolver,
              simulationType: associatedProject.simulation?.simulationType,
              mesher: 'ris',
            })
            .catch((e) => {
              dispatch(
                setMessageInfoModal('Something went wrong! Check Solver status.'),
              );
              dispatch(setIsAlertInfoModal(false));
              dispatch(setShowInfoModal(true));
            });
        } else if (associatedProject.simulation?.simulationType === 'Matrix_ACA') {
          axios
            .post('http://127.0.0.1:8001/solve', {
              ...objectToSendToSolver,
              simulationType: associatedProject.simulation?.simulationType,
              mesher: 'ris',
              acaSelectedPorts: associatedProject.acaSelectedPorts ?? [],
            })
            .catch((e) => {
              dispatch(
                setMessageInfoModal('Something went wrong! Check Solver status.'),
              );
              dispatch(setIsAlertInfoModal(false));
              dispatch(setShowInfoModal(true));
            });
        } else {
          axios
            .post('http://127.0.0.1:8001/solve', {
              ...objectToSendToSolver,
              simulationType: associatedProject.simulation?.simulationType,
              mesher: 'ris',
              theta: associatedProject.planeWaveParameters?.input.theta,
              phi: associatedProject.planeWaveParameters?.input.phi,
              e_theta: associatedProject.planeWaveParameters?.input.ETheta,
              e_phi: associatedProject.planeWaveParameters?.input.EPhi,
              baricentro: [
                associatedProject.radialFieldParameters?.center.x,
                associatedProject.radialFieldParameters?.center.y,
                associatedProject.radialFieldParameters?.center.z,
              ],
              r_circ: associatedProject.radialFieldParameters?.radius,
              times: associatedProject.times,
              signal_type_E: associatedProject.planeWaveParameters?.input.ESignal,
              ind_freq_interest: associatedProject.interestFrequenciesIndexes,
              unit: associatedProject.modelUnit,
            })
            .catch((e) => {
              dispatch(
                setMessageInfoModal('Something went wrong! Check Solver status.'),
              );
              dispatch(setIsAlertInfoModal(false));
              dispatch(setShowInfoModal(true));
            });
        }
      }
    }, []);

    useEffect(() => {
      if (solverResultsS3) {
        const simulationUpdatedCompleted: Simulation = {
          ...simulation,
          results: {} as SolverOutput,
          resultS3: solverResultsS3,
          ended: Date.now().toString(),
          status: 'Completed',
        };
        execQuery2(
          createOrUpdateProjectInDynamoDB,
          {
            ...associatedProject,
            simulation: simulationUpdatedCompleted,
          } as Project,
          dispatch,
        ).then(() => {
          setRunningSimulation(undefined);
          dispatch(
            updateSimulation({
              associatedProject: simulation.associatedProject,
              value: {
                ...simulationUpdatedCompleted,
              },
            }),
          );
          dispatch(unsetComputingLp(simulation.associatedProject as string));
          dispatch(unsetComputingP(simulation.associatedProject as string));
          dispatch(unsetIterations(simulation.associatedProject as string));
          dispatch(unsetSolverResults());
          dispatch(setSolverResultsS3(undefined));
        });
      }
    }, [solverResultsS3]);

    const [elapsedTime, setelapsedTime] = useState(0);
    useEffect(() => {
      setelapsedTime(0);
      const interval = setInterval(() => {
        setelapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }, [estimatedTime?.portIndex]);

    /* ─── Determine step states ─── */
    const pDone = computingP?.done ?? false;
    const lpDone = computingLpx?.done ?? false;

    const isMatrixOrACA =
      simulation?.simulationType === 'Matrix' ||
      simulation?.simulationType === 'Matrix_ACA';
    const isElectricFields = simulation?.simulationType === 'Electric Fields';

    const totalFreqs = isMatrixOrACA
      ? frequenciesNumber
      : (associatedProject?.interestFrequenciesIndexes?.length ?? 0);
    const currentFreq = iterations?.freqNumber ?? 0;
    const iterDone = currentFreq >= totalFreqs && totalFreqs > 0;

    const pStatus: 'done' | 'active' | 'pending' = pDone ? 'done' : 'active';
    const lpStatus: 'done' | 'active' | 'pending' = lpDone
      ? 'done'
      : pDone
        ? 'active'
        : 'pending';
    const iterStatus: 'done' | 'active' | 'pending' = iterDone
      ? 'done'
      : lpDone
        ? 'active'
        : 'pending';

    return (
      <div className="w-full">
        <div className="mx-auto w-full rounded-2xl">
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
                <DisclosureButton
                  className={`flex w-full justify-between items-center px-4 py-3 text-left text-sm font-medium focus:outline-none transition-colors duration-200 ${isDark
                    ? 'hover:bg-white/5 text-gray-200'
                    : 'hover:bg-white/80 text-gray-700'
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-semibold truncate">{name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    {/* Elapsed time badge */}
                    <span
                      className={`flex items-center gap-1.5 text-[11px] font-mono tabular-nums ${isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}
                    >
                      <PiClockCountdownBold className="w-3.5 h-3.5" />
                      {formatTime(elapsedTime)}
                    </span>

                    {/* Status badge */}
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                      style={{
                        background: isDark
                          ? 'rgba(34,197,94,0.15)'
                          : 'rgba(34,197,94,0.1)',
                        color: isDark ? '#4ade80' : '#16a34a',
                        border: isDark
                          ? '1px solid rgba(34,197,94,0.2)'
                          : '1px solid rgba(34,197,94,0.2)',
                        animation: 'pulse-glow 3s ease-in-out infinite',
                      }}
                    >
                      <ImSpinner className="animate-spin w-3 h-3" />
                      Solving
                    </div>

                    <MdKeyboardArrowUp
                      className={`${open ? '' : 'rotate-180'} h-4 w-4 transition-transform duration-300 ${isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}
                    />
                  </div>
                </DisclosureButton>

                <DisclosurePanel
                  className={`px-4 pb-4 pt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                >
                  {/* ─── Pipeline steps ─── */}
                  <div
                    className="flex flex-col gap-4 p-4 rounded-xl"
                    style={{
                      background: isDark
                        ? 'rgba(0,0,0,0.25)'
                        : 'rgba(0,0,0,0.02)',
                      border: isDark
                        ? '1px solid rgba(255,255,255,0.04)'
                        : '1px solid rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Step 1: Computing P */}
                    <PipelineStep label="Computing P" status={pStatus} isDark={isDark}>
                      <ProgressBar
                        value={pDone ? 1 : 0}
                        max={1}
                        variant={pDone ? 'success' : 'primary'}
                        isDark={isDark}
                        animate={!pDone}
                      />
                    </PipelineStep>

                    {/* Step 2: Computing Lp */}
                    <PipelineStep label="Computing Lp" status={lpStatus} isDark={isDark}>
                      <ProgressBar
                        value={lpDone ? 1 : 0}
                        max={1}
                        variant={lpDone ? 'success' : 'primary'}
                        isDark={isDark}
                        animate={pDone && !lpDone}
                      />
                    </PipelineStep>

                    {/* Step 3: Iterations */}
                    <PipelineStep label="Iterations" status={iterStatus} isDark={isDark}>
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          value={currentFreq}
                          max={totalFreqs}
                          variant={iterDone ? 'success' : 'info'}
                          isDark={isDark}
                          animate={lpDone && !iterDone}
                        />
                        <span
                          className={`text-xs font-mono tabular-nums flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'
                            }`}
                        >
                          {currentFreq}/{totalFreqs}
                        </span>
                      </div>
                    </PipelineStep>

                    {/* Step 4: Electric Fields results (conditional) */}
                    {isElectricFields && (
                      <PipelineStep
                        label={`Results: ${electricFieldsResultsStep?.name ?? 'hc'}`}
                        status={
                          iterations &&
                            associatedProject?.interestFrequenciesIndexes &&
                            iterations.freqNumber <=
                            associatedProject?.interestFrequenciesIndexes?.length
                            ? 'active'
                            : 'pending'
                        }
                        isDark={isDark}
                      >
                        <ProgressBar
                          value={electricFieldsResultsStep?.step ?? 0}
                          max={7}
                          variant="info"
                          isDark={isDark}
                          animate={!!electricFieldsResultsStep}
                        />
                      </PipelineStep>
                    )}
                  </div>

                  {/* ─── Stop button ─── */}
                  <button
                    className="w-full mt-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 transform active:scale-[0.97]"
                    style={{
                      background: isDark
                        ? 'rgba(239,68,68,0.12)'
                        : 'rgba(239,68,68,0.08)',
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
                      dispatch(
                        setMessageInfoModal(
                          'Are you sure to stop the simulation?',
                        ),
                      );
                      dispatch(setIsAlertInfoModal(false));
                      dispatch(setShowInfoModal(true));
                    }}
                  >
                    Stop Simulation
                  </button>
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>
        </div>
      </div>
    );
  };

/* ══════════════════════════════════════════════════════════════════
   QUEUED SIMULATION ITEM
   ══════════════════════════════════════════════════════════════════ */
export interface QueuedSimulationStatusItemProps {
  name: string;
  associatedProject: string;
  setqueuedSimulations: React.Dispatch<
    React.SetStateAction<
      {
        simulation: Simulation;
        freqNumber: number;
        project: Project;
      }[]
    >
  >;
}

const QueuedSimulationStatusItem: React.FC<QueuedSimulationStatusItemProps> = ({
  name,
  associatedProject,
  setqueuedSimulations,
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
      <span
        className={`font-semibold truncate mr-3 ${isDark ? 'text-gray-300' : 'text-gray-700'
          }`}
      >
        {name}
      </span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
          style={{
            background: isDark
              ? 'rgba(245,158,11,0.15)'
              : 'rgba(245,158,11,0.1)',
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
          title="Remove queued simulation"
          onClick={() => {
            setqueuedSimulations((prev) =>
              prev.filter(
                (item) => item.simulation.associatedProject !== associatedProject,
              ),
            );
            dispatch(
              updateSimulation({
                associatedProject: associatedProject,
                value: undefined,
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
