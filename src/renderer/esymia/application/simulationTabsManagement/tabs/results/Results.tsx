import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  findSelectedPort,
  SelectedFolderSelector,
  selectedProjectSelector,
  selectPort,
  updateSimulation,
} from '../../../../store/projectSlice';
import { ChartVisualizationMode } from './ChartVisualizationMode';
import { ChartsList } from './ChartsList';
import { ResultsLeftPanelTab } from './ResultsLeftPanelTab';
import {
  Folder,
  Port,
  Project,
  Simulation,
  SolverOutput,
} from '../../../../model/esymiaModels';
import { resultsLeftPanelTitle } from '../../../config/panelTitles';
import { Dataset, pairs } from './sharedElements';
import { AiOutlineBarChart } from 'react-icons/ai';
import { useStorageData } from '../mesher/components/rightPanelSimulator/hook/useStorageData';
import { GrClone } from 'react-icons/gr';
import { ImSpinner } from 'react-icons/im';
import { BsFiletypeCsv } from 'react-icons/bs';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { TbFileExport } from 'react-icons/tb';
import toast, { ToastOptions } from 'react-hot-toast';
import { Dispatch } from '@reduxjs/toolkit';
import { s3 } from '../../../../aws/s3Config';
import {
  setMessageInfoModal,
  setIsAlertInfoModal,
  setShowInfoModal,
  ThemeSelector,
  resetItemToResultsView,
  solverResultsViewSelector,
  solverResultsSelector,
  SolverResultsElectricFields,
  setSpinnerSolverResults,
  spinnerSolverResultsSelector,
  unsetSolverResults,
} from '../../../../store/tabsAndMenuItemsSlice';
import { ChartListElectricFields } from './chartListElectricFields/ChartListElectricFields';
import { SolverStatusSelector } from '../../../../store/pluginsSlice';
import axios from 'axios';

interface ResultsProps {
  selectedTabLeftPanel: string | undefined;
  setSelectedTabLeftPanel: Function;
}

export const setResultsFromS3 = (project: Project, dispatch: Dispatch) => {
  const params = {
    Bucket: process.env.REACT_APP_AWS_BUCKET_NAME as string,
    Key: project.simulation?.resultS3 as string,
  };
  s3.getObject(params, (err, data) => {
    if (err) {
      console.log(err);
    }
    if (!data) {
      dispatch(
        setMessageInfoModal(
          'Results not found. launch a simulation or wait if there is one running',
        ),
      );
      dispatch(setIsAlertInfoModal(true));
      dispatch(setShowInfoModal(true));
    } else {
      const results = JSON.parse(data.Body?.toString() as string).matrices
        ? (JSON.parse(data.Body?.toString() as string).matrices as SolverOutput)
        : (JSON.parse(data.Body?.toString() as string) as SolverOutput);
      dispatch(
        updateSimulation({
          associatedProject: project.simulation?.associatedProject as string,
          value: {
            ...project.simulation,
            results: results,
          } as Simulation,
        }),
      );
    }
  });
};

export const Results: React.FC<ResultsProps> = ({
  selectedTabLeftPanel,
  setSelectedTabLeftPanel,
}) => {
  const { cloneProject } = useStorageData();
  const [cloning, setcloning] = useState<boolean>(false);
  const [emergencyCommand, setEmergencyCommand] = useState(false);
  const selectedProject = useSelector(selectedProjectSelector);
  const solverStatus = useSelector(SolverStatusSelector);
  const theme = useSelector(ThemeSelector);
  const solverResults = useSelector(solverResultsSelector);
  useEffect(() => {
    if (
      selectedProject &&
      selectedProject.simulation &&
      selectedProject.simulation.resultS3 &&
      selectedProject.simulation.status === 'Completed'
    ) {
      if (
        !(selectedProject.simulation.results as SolverOutput).matrix_S &&
        selectedProject.simulation.simulationType === 'Matrix' && solverStatus === "ready"
      ) {
        dispatch(setSpinnerSolverResults(true));
        axios
          .post(
            'http://127.0.0.1:8001/get_results_matrix?file_id=' +
              selectedProject?.simulation?.resultS3,
            {
              fileId: selectedProject?.simulation?.resultS3,
              port_index: 0,
            },
          )
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
      } else if (
        selectedProject.simulation.simulationType === 'Electric Fields' &&
        solverResults.filter((s) => s.id === selectedProject.id).length === 0 && solverStatus === "ready"
      ) {
        dispatch(setSpinnerSolverResults(true));
        axios
          .post(
            'http://127.0.0.1:8001/get_results_electric_fields?file_id=' +
              selectedProject.simulation.resultS3,
            {
              fileId: selectedProject.simulation.resultS3,
              freq_index: 1,
              id: selectedProject.id,
            },
          )
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
      }
    }
  }, [solverResults, solverStatus]);
  const selectedFolder = useSelector(SelectedFolderSelector);
  const resultsView = useSelector(solverResultsViewSelector);
  const spinnerSolverResults = useSelector(spinnerSolverResultsSelector);
  const [matrixS, setmatrixS] = useState<number[][][][]>([])

  useEffect(() => {
    setmatrixS(resultsView.map(r => r.results.matrixS))
  }, [resultsView])


  const [freq, setfreq] = useState<number[]>([]);

  useEffect(() => {
    if (
      solverResults.length > 0 &&
      selectedProject?.simulation?.simulationType === 'Electric Fields'
    ) {
      setfreq((solverResults[0] as SolverResultsElectricFields).results.f);
    }
  }, [solverResults, selectedProject]);
  let selectedPort = findSelectedPort(selectedProject);
  const dispatch = useDispatch();
  const ports = selectedProject?.ports.filter(
    (p) => p.category === 'port',
  ) as Port[];
  const [colorArray, setcolorArray] = useState<string[]>(
    randomColours(ports.length * ports.length),
  );
  const labels = pairs(ports.map((p) => p.name));
  const [selectedLabel, setSelectedLabel] = useState<
    { label: string; id: number }[]
  >([
    {
      label:
        selectedProject && selectedProject?.ports.length > 0
          ? `${labels[0][0]} - ${labels[0][1]}`
          : '',
      id: 0,
    },
  ]);
  const [chartsScaleMode, setChartsScaleMode] = useState<
    'logarithmic' | 'linear'
  >('logarithmic');
  const [chartVisualizationMode, setChartVisualizationMode] = useState<
    'grid' | 'full'
  >('grid');
  const [graphToVisualize, setGraphToVisualize] = useState<
    'All Graph' | 'Z' | 'S' | 'Y'
  >('All Graph');
  const [graphDataToExport, setGraphDataToExport] = useState<
    {
      data: { datasets: Dataset[]; labels: number[] };
      options: {};
      representedFunction: string;
    }[]
  >([]);

  useEffect(() => {
    setSelectedTabLeftPanel(undefined);
    dispatch(unsetSolverResults());
    dispatch(resetItemToResultsView())
    dispatch(setSpinnerSolverResults(true))
    return () => {
      dispatch(resetItemToResultsView());
      dispatch(unsetSolverResults());
    };
  }, []);

  function randomColours(quan: number) {
    let colours = [];
    for (let i = 0; i < quan; i++) {
      colours.push(
        `rgb(${Math.round(Math.random() * 255)}, ${Math.round(
          Math.random() * 255,
        )}, ${Math.round(Math.random() * 255)})`,
      );
    }
    return colours;
  }

  return (
    <div className="flex">
      <div className="w-[6%]">
        {spinnerSolverResults && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
            {solverStatus === 'ready' ? (
              <>
                <span className="text-xl">Loading Results</span>
                <ImSpinner className="animate-spin w-10 h-10" />
              </>
            ) : (
              <span className="text-xl">Start Solver to load results.</span>
            )}
          </div>
        )}
        <div className="absolute left-[2%] top-[180px] rounded max-h-[500px] flex flex-col items-center gap-0">
          <div
            className={`p-2 tooltip rounded-t tooltip-right ${
              selectedTabLeftPanel === resultsLeftPanelTitle.first
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
            data-tip="Results"
            onClick={() => {
              if (selectedTabLeftPanel === resultsLeftPanelTitle.first) {
                setSelectedTabLeftPanel(undefined);
              } else {
                setSelectedTabLeftPanel(resultsLeftPanelTitle.first);
                setEmergencyCommand(false);
              }
            }}
          >
            <AiOutlineBarChart style={{ width: '25px', height: '25px' }} />
          </div>
          <button
            disabled={
              !selectedProject?.simulation ||
              selectedProject.simulation.status === 'Running' ||
              selectedProject.simulation.simulationType === "Electric Fields"
            }
            className={`p-2 tooltip tooltip-right relative z-10 disabled:opacity-40 ${
              theme === 'light'
                ? 'bg-white text-textColor'
                : 'bg-bgColorDark2 text-textColorDark'
            }`}
            data-tip="Export CSV"
            onClick={() => {
              const zip = new JSZip();
              graphDataToExport.map((chartData) => {
                const folder = zip.folder(chartData.representedFunction);
                chartData.data.datasets.forEach((ds) => {
                  let results = [
                    ['Frequency', chartData.representedFunction],
                    ...chartData.data.labels.map((f, index) => [
                      f,
                      ds.data[index],
                    ]),
                  ]
                    .map((e) => e.join(','))
                    .join('\n');
                  const blob = new Blob([results]);
                  folder?.file(
                    ds.label + '_' + chartData.representedFunction + '.csv',
                    blob,
                  );
                });
              });
              zip.generateAsync({ type: 'blob' }).then(function (content) {
                saveAs(content, 'graphs_data');
              });
            }}
          >
            <BsFiletypeCsv style={{ width: '25px', height: '25px' }} />
          </button>
          <button
            disabled={
              !selectedProject?.simulation ||
              selectedProject.simulation.status === 'Running' ||
              selectedProject.simulation.simulationType === "Electric Fields"
            }
            className={`p-2 tooltip rounded-b tooltip-right relative z-10 disabled:opacity-40 ${
              theme === 'light'
                ? 'bg-white text-textColor'
                : 'bg-bgColorDark2 text-textColorDark'
            }`}
            data-tip="Export Touchstone"
            onClick={() => {
              if (selectedProject) {
                window.electron.ipcRenderer.sendMessage('exportTouchstone', [
                  selectedProject.frequencies,
                  matrixS,
                  selectedProject.scatteringValue,
                  selectedProject.ports.filter((p) => p.category === 'port')
                    .length,
                  selectedProject.name,
                ]);
                toast.success(
                  `file ${selectedProject?.name}.s${
                    selectedProject.ports.filter((p) => p.category === 'port')
                      .length
                  }p saved on Downloads folder!`,
                  { duration: 10000 } as ToastOptions,
                );
              }
            }}
          >
            <TbFileExport style={{ width: '25px', height: '25px' }} />
          </button>
        </div>
        {selectedTabLeftPanel && (
          <>
            <div
              className={`${
                theme === 'light'
                  ? 'bg-white text-textColor'
                  : 'bg-bgColorDark2 text-textColorDark'
              } p-3 absolute xl:left-[5%] left-[6%] top-[180px] rounded md:w-1/4 xl:w-[18%]`}
            >
              {selectedTabLeftPanel === resultsLeftPanelTitle.first && (
                <ResultsLeftPanelTab
                  selectedPort={selectedPort ? selectedPort.name : 'undefined'}
                  setSelectedPort={(portName: string) =>
                    dispatch(selectPort(portName))
                  }
                />
              )}
            </div>
          </>
        )}
        {/* {emergencyCommand && (
          <>
            <div
              className={`${
                theme === 'light'
                  ? 'bg-white text-textColor'
                  : 'bg-bgColorDark2 text-textColorDark'
              } p-3 absolute xl:left-[5%] left-[6%] top-[180px] rounded md:w-1/4 xl:w-[18%]`}
            >
              <div className="flex flex-col items-center gap-4">
                <span>
                  Use this command only if you are facing some issues with
                  simulation!
                </span>
                <button
                  className={`button w-full buttonPrimary ${
                    theme === 'light'
                      ? ''
                      : 'bg-secondaryColorDark text-textColor'
                  } text-center mt-4 mb-4`}
                  onClick={() =>
                    setResultsFromS3(selectedProject as Project, dispatch)
                  }
                >
                  Force Retrive results
                </button>
              </div>
            </div>
          </>
        )} */}
        <div
          className={`absolute left-[2%] top-[320px] rounded max-h-[500px] flex flex-col items-center gap-0 ${
            theme === 'light'
              ? 'bg-white text-textColor'
              : 'bg-bgColorDark2 text-textColorDark'
          }`}
        >
          <button
            disabled={
              selectedProject &&
              selectedProject.simulation &&
              selectedProject.simulation.status === 'Running'
            }
            className={`p-2 tooltip rounded-t tooltip-right relative z-10 disabled:opacity-40`}
            data-tip="Clone Project"
            onClick={() => {
              setcloning(true);
              cloneProject(
                selectedProject as Project,
                selectedFolder as Folder,
                setcloning,
              );
            }}
          >
            <GrClone
              style={{ width: '25px', height: '25px' }}
              className={`${cloning ? 'opacity-20' : 'opacity-100'}`}
            />
            {cloning && (
              <ImSpinner className="absolute z-50 top-3 bottom-1/2 animate-spin w-5 h-5" />
            )}
          </button>
        </div>
        {/* <div
          className={`absolute left-[2%] top-[370px] rounded max-h-[500px] flex flex-col items-center gap-0 ${
            emergencyCommand
              ? theme === 'light'
                ? 'bg-primaryColor'
                : 'bg-secondaryColorDark'
              : theme === 'light'
              ? 'bg-white'
              : 'bg-bgColorDark2'
          }`}
        >
          <button
            disabled={
              selectedProject &&
              selectedProject.simulation &&
              selectedProject.simulation.status === 'Running'
            }
            className={`p-2 tooltip rounded-t tooltip-right relative z-10 disabled:opacity-40`}
            data-tip="Emergency Command"
            onClick={() => {
              setEmergencyCommand(!emergencyCommand);
              setSelectedTabLeftPanel(undefined);
            }}
          >
            <RiAlarmWarningFill
              style={{ width: '25px', height: '25px' }}
              color={emergencyCommand ? 'white' : 'red'}
              className={`${cloning ? 'opacity-20' : 'opacity-100'}`}
            />
          </button>
        </div> */}
      </div>
      <div className="w-[90%]">
        {selectedProject &&
        selectedProject.simulation &&
        (resultsView.length > 0 || solverResults.length > 0) ? (
          <>
            {selectedProject.simulation.simulationType === 'Matrix' ? (
              <>
                <ChartVisualizationMode
                  chartVisualizationMode={chartVisualizationMode}
                  setChartVisualizationMode={setChartVisualizationMode}
                  chartsScaleMode={chartsScaleMode}
                  setChartsScaleMode={setChartsScaleMode}
                  setGraphToVisualize={setGraphToVisualize}
                  selectedLabel={selectedLabel}
                  setSelectedLabel={setSelectedLabel}
                  graphDataToExport={graphDataToExport}
                />
                <div
                  className={
                    chartVisualizationMode === 'full'
                      ? 'overflow-scroll grid grid-cols-1 gap-4 max-h-[77vh] pb-10'
                      : 'grid grid-cols-2 gap-4 overflow-scroll max-h-[77vh] pb-10'
                  }
                >
                  <ChartsList
                    graphToVisualize={graphToVisualize}
                    selectedLabel={selectedLabel}
                    setGraphsData={setGraphDataToExport}
                    currentFreIndexq={0}
                    ChartVisualizationMode={chartVisualizationMode}
                    colorArray={colorArray}
                  />
                </div>
              </>
            ) : (
              <>
                <ChartListElectricFields N_circ={360} freq={freq} />
              </>
            )}
          </>
        ) : (
          <div className="absolute top-1/2 right-1/2 translate-x-1/2 flex justify-center w-[90%]">
            {/* <span
              className={`${alertMessageStyle} ${
                theme === 'light' ? '' : 'text-textColorDark'
              }`}
            >
              {selectedProject &&
              selectedProject.simulation &&
              selectedProject.simulation.status == 'Queued'
                ? runningSimulationMessageOnResults
                : emptyResultsMessage}
            </span> */}
          </div>
        )}
      </div>
    </div>
  );
};
