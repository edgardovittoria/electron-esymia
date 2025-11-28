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
import { useDispatch, useSelector } from 'react-redux';
import { selectedProjectSelector } from '../../../../store/projectSlice';
import { VscSettings } from 'react-icons/vsc';
import { Dataset, pairs } from './sharedElements';
import {
  solverResultsViewSelector,
  ThemeSelector,
} from '../../../../store/tabsAndMenuItemsSlice';
import zoomPlugin, { pan } from 'chartjs-plugin-zoom';
import { spinnerSolverResultsSelector } from '../../../../store/tabsAndMenuItemsSlice';
import { setPortsFromS3 } from '../physics/Physics';


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
  const spinnerSolverResults = useSelector(spinnerSolverResultsSelector)
  const theme = useSelector(ThemeSelector);
  const dispatch = useDispatch()
  const [ports, setports] = useState(selectedProject?.ports.filter(
    (p) => p.category === 'port',
  ) as Port[])
  const [showGraphsSettings, setShowGraphsSettings] = useState<boolean[]>(
    defaultShowGraphsSettings(11),
  );

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

  useEffect(() => {
    if (selectedProject && selectedProject?.ports.length > 0) {
      setports(selectedProject?.ports.filter(
        (p) => p.category === 'port',
      ) as Port[])
    } else {
      setPortsFromS3(selectedProject as Project, dispatch)
    }
  }, [selectedProject?.ports])

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
    ports
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
            className={`w-full rounded-2xl p-4 shadow-lg backdrop-blur-md border transition-all duration-300 ${theme === 'light'
              ? 'bg-white/50 border-gray-200/50'
              : 'bg-black/40 border-white/10'
              }`}
            key={index}
          >
            <div className="flex flex-row justify-between items-center mb-2">
              {ChartVisualizationMode === 'full' && (
                <button
                  className={`p-2 rounded-lg transition-all duration-200 ${theme === 'light'
                    ? 'hover:bg-green-100 text-green-600'
                    : 'hover:bg-green-900/30 text-green-400'
                    }`}
                  onClick={() => {
                    let shows = [...showGraphsSettings];
                    shows[index] = !shows[index];
                    setShowGraphsSettings(shows);
                  }}
                >
                  <VscSettings size={18} />
                </button>
              )}
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
              <div className={`${spinnerSolverResults ? 'opacity-40' : 'opacity-100'}`}>
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
              </div>
            ) : (
              <></>
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

  const buttonClass = (isActive: boolean) => `
    px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border
    ${theme === 'light'
      ? (isActive ? 'bg-green-500 text-white border-green-500 shadow-md shadow-green-500/20' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50')
      : (isActive ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-600/20' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10')
    }
  `;

  return (
    <div className="flex flex-col gap-3 mb-4 p-3 rounded-xl bg-black/5 dark:bg-white/5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold opacity-70 uppercase tracking-wider">Y-Axis</span>
        <div className="flex gap-2">
          <button
            className={buttonClass(scaleMode[index].yaxis === 'logarithmic')}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = { ...newScaleMode[index], yaxis: 'logarithmic' };
              setScaleMode(newScaleMode);
            }}
          >
            Log
          </button>
          <button
            className={buttonClass(scaleMode[index].yaxis === 'linear')}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = { ...newScaleMode[index], yaxis: 'linear' };
              setScaleMode(newScaleMode);
            }}
          >
            Linear
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs font-bold opacity-70 uppercase tracking-wider">X-Axis</span>
        <div className="flex gap-2">
          <button
            className={buttonClass(scaleMode[index].xaxis === 'logarithmic')}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = { ...newScaleMode[index], xaxis: 'logarithmic' };
              setScaleMode(newScaleMode);
            }}
          >
            Log
          </button>
          <button
            className={buttonClass(scaleMode[index].xaxis === 'linear')}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = { ...newScaleMode[index], xaxis: 'linear' };
              setScaleMode(newScaleMode);
            }}
          >
            Linear
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs font-bold opacity-70 uppercase tracking-wider">Y-Notation</span>
        <div className="flex gap-2">
          <button
            className={buttonClass(scaleMode[index].ynotation === 'exponential')}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = { ...newScaleMode[index], ynotation: 'exponential' };
              setScaleMode(newScaleMode);
            }}
          >
            Exp
          </button>
          <button
            className={buttonClass(scaleMode[index].ynotation === 'decimal')}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = { ...newScaleMode[index], ynotation: 'decimal' };
              setScaleMode(newScaleMode);
            }}
          >
            Dec
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs font-bold opacity-70 uppercase tracking-wider">X-Notation</span>
        <div className="flex gap-2">
          <button
            className={buttonClass(scaleMode[index].xnotation === 'exponential')}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = { ...newScaleMode[index], xnotation: 'exponential' };
              setScaleMode(newScaleMode);
            }}
          >
            Exp
          </button>
          <button
            className={buttonClass(scaleMode[index].xnotation === 'decimal')}
            onClick={() => {
              let newScaleMode = [...scaleMode];
              newScaleMode[index] = { ...newScaleMode[index], xnotation: 'decimal' };
              setScaleMode(newScaleMode);
            }}
          >
            Dec
          </button>
        </div>
      </div>
    </div>
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
    if (matrix.length > 0) {
      for (let i = 0; i < matrix.length; i++) {
        matrices.push([]);
        matrix[i].matrix[0].forEach((m, index) => {
          (matrices[i] as Array<{ portIndex: number; value: number }>).push({
            portIndex: matrix[i].portIndex,
            value: getGraphFormulaResult(index, m, innerLabels),
          });
        });
      }
    }
    let datasets: Dataset[] = [];
    if (ports.length > 0) {
      matrices.forEach((mat) => {
        datasets.push({
          label: `${labels[mat[0].portIndex][0]} - ${labels[mat[0].portIndex][1]
            }`,
          data: mat.map((m1) => m1.value),
          borderColor: colorArray[mat[0].portIndex],
          backgroundColor: 'white',
        });
      });
    }

    let options = {
      responsive: true,
      elements: {
        line: {
          borderWidth: 3,
          tension: 0.4,
          capBezierPoints: true,
        },
        point: {
          radius: 0,
          hitRadius: 30,
          hoverRadius: 6,
          hoverBorderWidth: 2,
        },
      },
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
