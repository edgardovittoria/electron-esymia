import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  findSelectedPort,
  SelectedFolderSelector,
  selectedProjectSelector,
  selectPort,
  selectProject,
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
    const mainColors = [
      '#10B981', // Green
      '#3B82F6', // Blue
      '#8B5CF6', // Purple
      '#EF4444', // Red
      '#14B8A6', // Teal
    ];
    let colours = [];
    for (let i = 0; i < quan; i++) {
      colours.push(mainColors[i % mainColors.length]);
    }
    return colours;
  }

  return (
    <div className="flex">
      <div className="w-[6%]">
        {spinnerSolverResults && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 bg-black/40 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/10">
            {solverStatus === 'ready' ? (
              <>
                <span className="text-xl font-bold text-white">Loading Results</span>
                <ImSpinner className="animate-spin w-10 h-10 text-blue-500" />
              </>
            ) : (
              <span className="text-xl font-bold text-white">Start Solver to load results.</span>
            )}
          </div>
        )}
        <div className="absolute left-[2%] top-0 flex flex-col items-center">
          <div className="flex flex-col gap-0 items-center">
            <div
              className={`p-3 tooltip tooltip-right rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 cursor-pointer ${selectedTabLeftPanel === resultsLeftPanelTitle.first
                ? (theme === 'light' ? 'bg-blue-500 text-white shadow-blue-500/30' : 'bg-blue-600 text-white shadow-blue-600/30')
                : (theme === 'light' ? 'bg-white/80 text-blue-600 hover:bg-white hover:text-blue-500' : 'bg-black/40 text-blue-400 hover:bg-black/60 hover:text-blue-300 border border-white/10')
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
              <AiOutlineBarChart size={24} />
            </div>

            <div className={`flex flex-col gap-2 mt-2`}>
              <button
                disabled={
                  !selectedProject?.simulation ||
                  selectedProject.simulation.status === 'Running' ||
                  selectedProject.simulation.simulationType === "Electric Fields"
                }
                className={`p-3 rounded-xl transition-all duration-300 ${theme === 'light'
                  ? 'bg-white/80 text-gray-700 hover:bg-white hover:text-green-600 shadow-sm'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-green-400'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
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
                <BsFiletypeCsv size={24} />
              </button>
              <button
                disabled={
                  !selectedProject?.simulation ||
                  selectedProject.simulation.status === 'Running' ||
                  selectedProject.simulation.simulationType === "Electric Fields"
                }
                className={`p-3 rounded-xl transition-all duration-300 ${theme === 'light'
                  ? 'bg-white/80 text-gray-700 hover:bg-white hover:text-purple-600 shadow-sm'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-purple-400'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
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
                      `file ${selectedProject?.name}.s${selectedProject.ports.filter((p) => p.category === 'port')
                        .length
                      }p saved on Downloads folder!`,
                      { duration: 10000 } as ToastOptions,
                    );
                  }
                }}
              >
                <TbFileExport size={24} />
              </button>
              <button
                disabled={
                  selectedProject &&
                  selectedProject.simulation &&
                  selectedProject.simulation.status === 'Running' ||
                  (process.env.APP_VERSION === 'demo' && selectedFolder?.projectList.length === 3)
                }
                className={`p-3 tooltip tooltip-right rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 relative disabled:opacity-40 disabled:cursor-not-allowed ${theme === 'light'
                  ? 'bg-white/80 text-gray-700 hover:bg-white hover:text-green-600 hover:shadow-green-500/20'
                  : 'bg-black/40 text-gray-300 border border-white/10 hover:bg-black/60 hover:text-green-400 hover:border-green-500/30'
                  }`}
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
                <GrClone size={24} className={`${cloning ? 'opacity-20' : 'opacity-100'}`} />
                {cloning && (
                  <ImSpinner className={`absolute inset-0 m-auto animate-spin w-5 h-5 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                )}
              </button>
            </div>
          </div>
        </div>

        {selectedTabLeftPanel && (
          <div
            className={`absolute z-50 left-[6%] xl:left-[5%] top-0 w-[300px] rounded-2xl p-4 shadow-2xl backdrop-blur-md border transition-all duration-300 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar ${theme === 'light'
              ? 'bg-white/90 border-white/40 text-gray-800'
              : 'bg-black/60 border-white/10 text-gray-200'
              }`}
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
        )}


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
