import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteSimulation,
  findSelectedPort,
  SelectedFolderSelector,
  selectedProjectSelector,
  selectPort,
  selectProject,
  setMeshApproved,
} from '../../../../store/projectSlice';
import { ChartVisualizationMode } from './ChartVisualizationMode';
import { ChartsList } from './ChartsList';
import { ResultsLeftPanelTab } from './ResultsLeftPanelTab';
import { MyPanel } from '../../sharedElements/MyPanel';
import { useFaunaQuery } from 'cad-library';
import { updateProjectInFauna } from '../../../../faunadb/projectsFolderAPIs';
import { convertInFaunaProjectThis } from '../../../../faunadb/apiAuxiliaryFunctions';
import { Folder, Port, Project } from '../../../../model/esymiaModels';
import {
  alertMessageStyle,
  emptyResultsMessage,
  runningSimulationMessageOnResults,
} from '../../../config/textMessages';
import { resultsLeftPanelTitle } from '../../../config/panelTitles';
import { Dataset, pairs } from './sharedElements';
import { AiOutlineBarChart } from 'react-icons/ai';
import { useStorageData } from '../simulator/rightPanelSimulator/hook/useStorageData';
import { GrClone } from 'react-icons/gr';
import { ImSpinner } from 'react-icons/im';
import { BsFiletypeCsv } from 'react-icons/bs';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { TbFileExport } from 'react-icons/tb';
import toast, { ToastOptions } from 'react-hot-toast';

interface ResultsProps {
  selectedTabLeftPanel: string | undefined;
  setSelectedTabLeftPanel: Function;
}

export const Results: React.FC<ResultsProps> = ({
  selectedTabLeftPanel,
  setSelectedTabLeftPanel,
}) => {
  const { cloneProject } = useStorageData();
  const [cloning, setcloning] = useState<boolean>(false);
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedFolder = useSelector(SelectedFolderSelector);
  let selectedPort = findSelectedPort(selectedProject);
  const dispatch = useDispatch();
  const ports = selectedProject?.ports.filter(
    (p) => p.category === 'port',
  ) as Port[];
  const labels = pairs(ports.map((p) => p.name));
  const [selectedLabel, setSelectedLabel] = useState<
    { label: string; id: number }[]
  >([{ label: `${labels[0][0]} - ${labels[0][1]}`, id: 0 }]);
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

  // useEffect(() => {
  //   setSelectedLabel([{ label: 'All Ports', id: 0 }]);
  // }, [selectedProject]);

  useEffect(() => {
    setSelectedTabLeftPanel(undefined)
  },[])

  return (
    <div className="flex">
      <div className="w-[6%]">
        <div className="absolute left-[2%] top-[180px] rounded max-h-[500px] flex flex-col items-center gap-0 bg-white">
          <div
            className={`p-2 tooltip rounded-t tooltip-right ${
              selectedTabLeftPanel === resultsLeftPanelTitle.first
                ? 'text-white bg-primaryColor'
                : 'text-primaryColor bg-white'
            }`}
            data-tip="Results"
            onClick={() => {
              if (selectedTabLeftPanel === resultsLeftPanelTitle.first) {
                setSelectedTabLeftPanel(undefined);
              } else {
                setSelectedTabLeftPanel(resultsLeftPanelTitle.first);
              }
            }}
          >
            <AiOutlineBarChart style={{ width: '25px', height: '25px' }} />
          </div>
          <button
            disabled={!selectedProject?.simulation || selectedProject.simulation.status === "Running"}
            className={`p-2 tooltip rounded-t tooltip-right relative z-10 disabled:opacity-40`}
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
            disabled={!selectedProject?.simulation || selectedProject.simulation.status === "Running"}
            className={`p-2 tooltip rounded-t tooltip-right relative z-10 disabled:opacity-40`}
            data-tip="Export Touchstone"
            onClick={() => {
              if (selectedProject) {
                window.electron.ipcRenderer.sendMessage('exportTouchstone', [
                  selectedProject.frequencies,
                  JSON.parse(
                    selectedProject?.simulation?.results.matrix_S as string,
                  ),
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
            <div className="bg-white p-3 absolute xl:left-[5%] left-[6%] top-[180px] rounded md:w-1/4 xl:w-[18%]">
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
        <div className="absolute left-[2%] top-[320px] rounded max-h-[500px] flex flex-col items-center gap-0 bg-white">
          <button
            disabled={selectedProject && selectedProject.simulation && selectedProject.simulation.status === "Running"}
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
      </div>
      <div className="w-[90%]">
        {selectedProject &&
        selectedProject.simulation &&
        selectedProject.simulation.results.matrix_S ? (
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
                currentFreIndexq={selectedProject.simulation.results.freqIndex}
                ChartVisualizationMode={chartVisualizationMode}
              />
            </div>
          </>
        ) : (
          <div className="absolute top-1/2 right-1/2 translate-x-1/2 flex justify-center w-[90%]">
            <span className={alertMessageStyle}>
              {selectedProject &&
              selectedProject.simulation &&
              selectedProject.simulation.status == 'Queued'
                ? runningSimulationMessageOnResults
                : emptyResultsMessage}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
