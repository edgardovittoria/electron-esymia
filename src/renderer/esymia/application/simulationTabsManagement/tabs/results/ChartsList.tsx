import React, { FC, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Scatter } from 'react-chartjs-2';
import { Port, Project, Simulation } from '../../../../model/esymiaModels';
import { useSelector } from 'react-redux';
import { selectedProjectSelector } from '../../../../store/projectSlice';
import { VscSettings } from 'react-icons/vsc';
import { Dataset, pairs } from './sharedElements';
import {
  solverResultsViewSelector,
  ThemeSelector,
} from '../../../../store/tabsAndMenuItemsSlice';
import zoomPlugin, { pan } from 'chartjs-plugin-zoom';


ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

interface ChartsListProps {
  graphToVisualize: 'All Graph' | 'Z' | 'S' | 'Y';
  selectedLabel: { label: string; id: number }[];
  setGraphsData: Function;
  currentFreIndexq?: number;
  ChartVisualizationMode: string;
  colorArray: string[];
}

interface ScaleMode {
  xaxis: 'logarithmic' | 'linear';
  xnotation: 'exponential' | 'decimal';
  yaxis: 'logarithmic' | 'linear';
  ynotation: 'exponential' | 'decimal';
}

const defaultScaleModes = (length: number): ScaleMode[] => {
  let modes: ScaleMode[] = [];
  for (let index = 0; index < length; index++) {
    modes[index] = {
      xaxis: 'logarithmic',
      yaxis: 'linear',
      xnotation: 'exponential',
      ynotation: 'decimal',
    };
  }
  return modes;
};

const defaultShowGraphsSettings = (length: number) => {
  let shows = [];
  for (let index = 0; index < length; index++) {
    shows[index] = false;
  }
  return shows;
};

export const ChartsList: React.FC<ChartsListProps> = ({
  graphToVisualize,
  selectedLabel,
  setGraphsData,
  currentFreIndexq,
  ChartVisualizationMode,
  colorArray,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const resultsView = useSelector(solverResultsViewSelector);
  const theme = useSelector(ThemeSelector);
  const [showGraphsSettings, setShowGraphsSettings] = useState<boolean[]>(
    defaultShowGraphsSettings(11),
  );
  const ports = selectedProject?.ports.filter(
    (p) => p.category === 'port',
  ) as Port[];

  const [matrixZ, setmatrixZ] = useState<
    { portIndex: number; matrix: number[][][] }[]
  >([]);
  const [matrixS, setmatrixS] = useState<
    { portIndex: number; matrix: number[][][] }[]
  >([]);
  const [matrixY, setmatrixY] = useState<
    { portIndex: number; matrix: number[][][] }[]
  >([]);

  useEffect(() => {
    console.log(resultsView)
    if (resultsView.length > 0) {
      setmatrixZ(
        resultsView.map((r) => ({
          portIndex: r.portIndex,
          matrix: r.results.matrixZ,
        })),
      );
      setmatrixS(
        resultsView.map((r) => ({
          portIndex: r.portIndex,
          matrix: r.results.matrixS,
        })),
      );
      setmatrixY(
        resultsView.map((r) => ({
          portIndex: r.portIndex,
          matrix: r.results.matrixY,
        })),
      );
    }
  }, [resultsView]);
  const [scaleMode, setScaleMode] = useState<ScaleMode[]>(
    defaultScaleModes(11),
  );
  const chartsOrderedIDs = [
    'R',
    'L',
    'Z_Module',
    'Z_Phase',
    'G',
    'C',
    'Y_Module',
    'Y_Phase',
    'S_Module',
    'S_Phase',
    'S_dB',
  ];
  const [chartsDataToVisualize, setChartsDataToVisualize] = useState(
    chartsOrderedIDs.map((id) =>
      chartsDataOptionsFactory(
        selectedProject?.simulation as Simulation,
        selectedProject,
        id,
        matrixZ,
        matrixY,
        matrixS,
        ports,
        selectedLabel,
        theme,
        colorArray,
      ),
    ),
  );
  const graphsTitle = [
    'R',
    'L',
    'Z_Module',
    'Z_Phase',
    'G',
    'C',
    'Y_Module',
    'Y_Phase',
    'S_Module',
    'S_Phase',
    'S_dB',
  ];
  useEffect(() => {
    let graphs: string[] = [];
    if (graphToVisualize === 'All Graph') {
      graphs = [
        'R',
        'L',
        'Z_Module',
        'Z_Phase',
        'G',
        'C',
        'Y_Module',
        'Y_Phase',
        'S_Module',
        'S_Phase',
        'S_dB',
      ];
    }
    if (graphToVisualize === 'Z') {
      graphs = ['R', 'L', 'Z_Module', 'Z_Phase'];
    }
    if (graphToVisualize === 'Y') {
      graphs = ['G', 'C', 'Y_Module', 'Y_Phase'];
    }
    if (graphToVisualize === 'S') {
      graphs = ['S_Module', 'S_Phase', 'S_dB'];
    }
    let charts = graphs.map((id) =>
      chartsDataOptionsFactory(
        selectedProject?.simulation as Simulation,
        selectedProject,
        id,
        matrixZ,
        matrixY,
        matrixS,
        ports,
        selectedLabel,
        theme,
        colorArray,
      ),
    );
    setChartsDataToVisualize(charts);
    setScaleMode(defaultScaleModes(graphs.length));
    setGraphsData(charts);
  }, [
    graphToVisualize,
    selectedProject,
    selectedLabel,
    matrixZ,
    matrixY,
    matrixS,
  ]);

  const optionsWithScaleMode = (
    options: any,
    scaleMode: ScaleMode,
    type: 'scatter' | 'line',
    graphTitle: string,
  ) => {
    let yAxisTitle = '';
    if (graphTitle === 'R') yAxisTitle = 'Ω';
    if (graphTitle === 'L') yAxisTitle = 'nH';
    if (graphTitle === 'Z_Module') yAxisTitle = 'Ω';
    if (graphTitle === 'Z_Phase') yAxisTitle = 'rad';
    if (graphTitle === 'G') yAxisTitle = 'S';
    if (graphTitle === 'C') yAxisTitle = 'F';
    if (graphTitle === 'Y_Module') yAxisTitle = 'S';
    if (graphTitle === 'Y_Phase') yAxisTitle = 'rad';
    if (graphTitle === 'S_Module') yAxisTitle = '';
    if (graphTitle === 'S_Phase') yAxisTitle = 'rad';
    if (graphTitle === 'S_dB') yAxisTitle = 'dB';
    return {
      ...options,
      plugins: {
        // changin the lagend colour
        legend: {
          position: 'top' as const,
          labels: {
            color: theme === 'light' ? 'black' : 'white',
          },
        },
        title: {
          display: true,
          text: graphTitle,
          color: theme === 'light' ? 'black' : 'white',
        },
        // zoom: {
        //   pan: {
        //     enabled: true
        //   },
        //   zoom: {
        //     wheel: {
        //       enabled: true,
        //     },
        //     pinch: {
        //       enabled: true
        //     },
        //     mode: 'xy',
        //   }
        // }
      },
      type: type,
      scales: {
        x: {
          ...options.scale.x,
          type: scaleMode.xaxis === 'logarithmic' ? 'logarithmic' : 'linear',
          ticks: {
            color: theme === 'light' ? 'black' : 'white',
            callback: (val: number) =>
              scaleMode.xnotation === 'exponential'
                ? val.toExponential()
                : val % 1 !== 0
                ? val.toFixed(2)
                : val,
          },
          title: {
            display: true,
            text: 'Hz',
            font: {
              size: 15,
              weight: 'bold',
              lineHeight: 1.2,
            },
            padding: { top: 2, left: 0, right: 0, bottom: 0 },
          },
        },
        y: {
          ...options.scale.y,
          type: scaleMode.yaxis === 'logarithmic' ? 'logarithmic' : 'linear',
          ticks: {
            color: theme === 'light' ? 'black' : 'white',
            callback: (val: number) =>
              scaleMode.ynotation === 'exponential'
                ? val.toExponential()
                : val % 1 !== 0
                ? val.toFixed(2)
                : val,
          },
          title: {
            display: true,
            text: yAxisTitle,
            font: {
              size: 15,
              weight: 'bold',
              lineHeight: 1.2,
            },
            padding: { top: 0, left: 0, right: 0, bottom: 0 },
          },
        },
      },
    };
  };

  return (
    <>
      {chartsDataToVisualize.map((chartData, index) => {
        return (
          <div
            className={`box w-full ${
              theme === 'light'
                ? 'bg-white text-textColor'
                : 'bg-bgColorDark2 text-textColorDark'
            }`}
            key={index}
          >
            <div className="flex flex-row justify-between items-center">
              {ChartVisualizationMode === 'full' && (
                <div
                  className={`box p-[5px] flex flex-col items-center border ${
                    theme === 'light'
                      ? 'text-[#0fb25b] border-[#0fb25b] hover:bg-[#0fb25b] hover:text-white'
                      : 'bg-bgColorDark2 text-textColorDark border-[#0fb25b] hover:bg-[#0fb25b] hover:text-white'
                  } hover:cursor-pointer`}
                  onClick={() => {
                    let shows = [...showGraphsSettings];
                    shows[index] = !shows[index];
                    setShowGraphsSettings(shows);
                  }}
                >
                  <VscSettings size={15} />
                </div>
              )}
              {/* <ExportToCsvZippedButton buttonLabel="to CSV" graphDataToExport={[chartData]} zipFilename="graphs_data"/> */}
            </div>
            {showGraphsSettings[index] && ChartVisualizationMode === 'full' && (
              <ScaleChartOptions
                index={index}
                scaleMode={scaleMode}
                setScaleMode={setScaleMode}
              />
            )}
            {selectedProject?.simulation &&
            selectedProject.simulation.status === 'Completed' ? (
              <>
                {ChartVisualizationMode === 'full' ? (
                  <Line
                    options={optionsWithScaleMode(
                      chartData.options,
                      scaleMode[index],
                      'line',
                      graphsTitle[index],
                    )}
                    data={chartData.data}
                  />
                ) : (
                  <Line
                    options={optionsWithScaleMode(
                      chartData.options,
                      {
                        xaxis: 'logarithmic',
                        yaxis: 'linear',
                        xnotation: 'exponential',
                        ynotation: 'decimal',
                      },
                      'line',
                      graphsTitle[index],
                    )}
                    data={chartData.data}
                  />
                )}
              </>
            ) : (
              <Scatter
                options={optionsWithScaleMode(
                  chartData.options,
                  scaleMode[index],
                  'scatter',
                  graphsTitle[index],
                )}
                data={{
                  labels: chartData.data.labels.filter(
                    (d, index) => currentFreIndexq && index < currentFreIndexq,
                  ),
                  // datasets: chartData.data.datasets[0].data.filter(
                  //   (d, index) => currentFreIndexq && index < currentFreIndexq,
                  // ),
                  datasets: chartData.data.datasets.map((d) => {
                    d.data = d.data.filter(
                      (d1, index) =>
                        currentFreIndexq && index < currentFreIndexq,
                    );
                    console.log("curr freq idx: ", currentFreIndexq)
                    console.log("idx: ", index)
                    return d;
                  }),
                }}
                //data={chartData.data}
              />
            )}
          </div>
        );
      })}
    </>
  );
};

const ScaleChartOptions: FC<{
  index: number;
  scaleMode: ScaleMode[];
  setScaleMode: Function;
}> = ({ scaleMode, index, setScaleMode }) => {
  const theme = useSelector(ThemeSelector);
  return (
    <>
      <div className="flex justify-between mt-3">
        <div className="flex flex-row">
          <div
            className={`box p-[5px] mb-3 flex flex-col items-center border-2 hover:cursor-pointer ${
              theme === 'light'
                ? 'hover:bg-[#0fb25b] hover:text-white'
                : 'bg-bgColorDark2 text-textColorDark hover:bg-[#0fb25b] hover:text-white'
            } ${
              scaleMode[index].yaxis === 'logarithmic' ? 'border-[#0fb25b]' : ''
            }`}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = {
                ...newScaleMode[index],
                yaxis: 'logarithmic',
              };
              setScaleMode(newScaleMode);
            }}
          >
            <span className="text-[12px]">logarithmic-y</span>
          </div>
          <div
            className={`box p-[5px] ml-2 mb-3 flex flex-col items-center border-2 hover:cursor-pointer ${
              theme === 'light'
                ? 'hover:bg-[#0fb25b] hover:text-white'
                : 'bg-bgColorDark2 text-textColorDark hover:bg-[#0fb25b] hover:text-white'
            } ${scaleMode[index].yaxis === 'linear' ? 'border-[#0fb25b]' : ''}`}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = { ...newScaleMode[index], yaxis: 'linear' };
              setScaleMode(newScaleMode);
            }}
          >
            <span className="text-[12px]">linear-y</span>
          </div>
        </div>
        <div className="flex flex-row">
          <div
            className={`box p-[5px] mb-3 flex flex-col items-center border-2 hover:cursor-pointer ${
              theme === 'light'
                ? 'hover:bg-[#0fb25b] hover:text-white'
                : 'bg-bgColorDark2 text-textColorDark hover:bg-[#0fb25b] hover:text-white'
            } ${
              scaleMode[index].xaxis === 'logarithmic' ? 'border-[#0fb25b]' : ''
            }`}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = {
                ...newScaleMode[index],
                xaxis: 'logarithmic',
              };
              setScaleMode(newScaleMode);
            }}
          >
            <span className="text-[12px]">logarithmic-x</span>
          </div>
          <div
            className={`box p-[5px] ml-2 mb-3 flex flex-col items-center border-2 hover:cursor-pointer ${
              theme === 'light'
                ? 'hover:bg-[#0fb25b] hover:text-white'
                : 'bg-bgColorDark2 text-textColorDark hover:bg-[#0fb25b] hover:text-white'
            } ${scaleMode[index].xaxis === 'linear' ? 'border-[#0fb25b]' : ''}`}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = { ...newScaleMode[index], xaxis: 'linear' };
              setScaleMode(newScaleMode);
            }}
          >
            <span className="text-[12px]">linear-x</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <div className="flex flex-row">
          <div
            className={`box p-[5px] mb-3 flex flex-col items-center border-2 hover:cursor-pointer ${
              theme === 'light'
                ? 'hover:bg-[#0fb25b] hover:text-white'
                : 'bg-bgColorDark2 text-textColorDark hover:bg-[#0fb25b] hover:text-white'
            } ${
              scaleMode[index].ynotation === 'exponential'
                ? 'border-[#0fb25b]'
                : ''
            }`}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = {
                ...newScaleMode[index],
                ynotation: 'exponential',
              };
              setScaleMode(newScaleMode);
            }}
          >
            <span className="text-[12px]">exp-notation-y</span>
          </div>
          <div
            className={`box p-[5px] ml-2 mb-3 flex flex-col items-center border-2 hover:cursor-pointer ${
              theme === 'light'
                ? 'hover:bg-[#0fb25b] hover:text-white'
                : 'bg-bgColorDark2 text-textColorDark hover:bg-[#0fb25b] hover:text-white'
            } ${
              scaleMode[index].ynotation === 'decimal' ? 'border-[#0fb25b]' : ''
            }`}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = {
                ...newScaleMode[index],
                ynotation: 'decimal',
              };
              setScaleMode(newScaleMode);
            }}
          >
            <span className="text-[12px]">lin-notation-y</span>
          </div>
        </div>
        <div className="flex flex-row">
          <div
            className={`box p-[5px] mb-3 flex flex-col items-center border-2 hover:cursor-pointer ${
              theme === 'light'
                ? 'hover:bg-[#0fb25b] hover:text-white'
                : 'bg-bgColorDark2 text-textColorDark hover:bg-[#0fb25b] hover:text-white'
            } ${
              scaleMode[index].xnotation === 'exponential'
                ? 'border-[#0fb25b]'
                : ''
            }`}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = {
                ...newScaleMode[index],
                xnotation: 'exponential',
              };
              setScaleMode(newScaleMode);
            }}
          >
            <span className="text-[12px]">exp-notation-x</span>
          </div>
          <div
            className={`box p-[5px] ml-2 mb-3 flex flex-col items-center border-2 hover:cursor-pointer ${
              theme === 'light'
                ? 'hover:bg-[#0fb25b] hover:text-white'
                : 'bg-bgColorDark2 text-textColorDark hover:bg-[#0fb25b] hover:text-white'
            } ${
              scaleMode[index].xnotation === 'decimal' ? 'border-[#0fb25b]' : ''
            }`}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = {
                ...newScaleMode[index],
                xnotation: 'decimal',
              };
              setScaleMode(newScaleMode);
            }}
          >
            <span className="text-[12px]">lin-notation-x</span>
          </div>
        </div>
      </div>
    </>
  );
};

const chartsDataOptionsFactory = (
  simulation: Simulation,
  project: Project | undefined,
  label: string,
  matrixZ: { portIndex: number; matrix: number[][][] }[],
  matrixY: { portIndex: number; matrix: number[][][] }[],
  matrixS: { portIndex: number; matrix: number[][][] }[],
  ports: Port[],
  selectedLabel: { label: string; id: number }[],
  theme: 'light' | 'dark',
  colorArray: string[],
) => {
  let result: {
    data: { datasets: Dataset[]; labels: number[] };
    options: {};
    representedFunction: string;
  } = {
    data: { datasets: [], labels: [] },
    options: {},
    representedFunction: '',
  };

  const computeGraphResults = (
    unit: string,
    ports: Port[],
    matrix: { portIndex: number; matrix: number[][][] }[],
    getGraphFormulaResult: (
      index: number,
      v: number[],
      innerLabels: number[],
    ) => number,
  ) => {
    const labels = pairs(ports.map((p) => p.name));
    let innerLabels = project && project.frequencies ? project.frequencies : [];
    let matrices: { portIndex: number; value: number }[][] = [];
    for (let i = 0; i < matrix.length; i++) {
      matrices.push([]);
      matrix[i].matrix[0].forEach((m, index) => {
        (matrices[i] as Array<{ portIndex: number; value: number }>).push({
          portIndex: matrix[i].portIndex,
          value: getGraphFormulaResult(index, m, innerLabels),
        });
      });
    }
    let datasets: Dataset[] = [];
    matrices.forEach((mat) => {
      datasets.push({
        label: `${labels[mat[0].portIndex][0]} - ${
          labels[mat[0].portIndex][1]
        }`,
        data: mat.map((m1) => m1.value),
        borderColor: colorArray[mat[0].portIndex],
        backgroundColor: 'white',
      });
    });


    let options = {
      responsive: true,
      layout: {
        padding: {
          right: 20,
        },
      },
      plugins: {
        decimation: {
          enabled: true,
          algorithm: 'min-max',
          threshold: 100
        },
      },
      scale: {
        x: {
          display: true,
        },
        y: {
          display: true,
        },
      },
    };
    result.data = {
      labels: innerLabels,
      datasets: datasets,
    };
    result.options = options;
    result.representedFunction = unit;
    return result;
  };
  switch (label) {
    case 'R':
      result = computeGraphResults(
        'R(mOhm)',
        ports,
        matrixZ,
        (index, v, innerLabels) => v[0],
      );
      break;
    case 'L':
      result = computeGraphResults(
        'L(nH)',
        ports,
        matrixZ,
        (index, v, innerLabels) =>
          (v[1] / (2 * Math.PI * innerLabels[index])) * 1e9,
      );
      break;
    case 'Z_Module':
      result = computeGraphResults(
        'Z Module',
        ports,
        matrixZ,
        (index, v, innerLabels) => Math.sqrt(v[0] * v[0] + v[1] * v[1]),
      );
      break;
    case 'Z_Phase':
      result = computeGraphResults(
        'Z Phase',
        ports,
        matrixZ,
        (index, v, innerLabels) => Math.atan2(v[1], v[0]),
      );
      break;
    case 'G':
      result = computeGraphResults(
        'G(S)',
        ports,
        matrixY,
        (index, v, innerLabels) => v[0],
      );
      break;
    case 'C':
      result = computeGraphResults(
        'C(F)',
        ports,
        matrixY,
        (index, v, innerLabels) => v[1] / (2 * Math.PI * innerLabels[index]),
      );
      break;
    case 'Y_Module':
      result = computeGraphResults(
        'Y Module',
        ports,
        matrixY,
        (index, v, innerLabels) => Math.sqrt(v[0] * v[0] + v[1] * v[1]),
      );
      break;
    case 'Y_Phase':
      result = computeGraphResults(
        'Y Phase',
        ports,
        matrixY,
        (index, v, innerLabels) => Math.atan2(v[1], v[0]),
      );
      break;
    case 'S_Module':
      result = computeGraphResults(
        'S Module',
        ports,
        matrixS,
        (index, v, innerLabels) => Math.sqrt(v[0] * v[0] + v[1] * v[1]),
      );
      break;
    case 'S_Phase':
      result = computeGraphResults(
        'S Phase',
        ports,
        matrixS,
        (index, v, innerLabels) => Math.atan2(v[1], v[0]),
      );
      break;
    case 'S_dB':
      result = computeGraphResults(
        'S dB',
        ports,
        matrixS,
        (index, v, innerLabels) =>
          20 * Math.log10(Math.sqrt(v[0] * v[0] + v[1] * v[1])),
      );
      break;
    default:
      break;
  }
  return result;
};
