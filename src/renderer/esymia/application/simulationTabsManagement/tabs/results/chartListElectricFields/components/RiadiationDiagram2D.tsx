import { useEffect, useState } from 'react';
import {
  Chart,
  ChartOptions,
  RadialLinearScale,
  PolarAreaController,
  ArcElement,
} from 'chart.js';
import { PolarArea } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import {
  SolverResultsElectricFields,
  solverResultsSelector,
} from '../../../../../../store/tabsAndMenuItemsSlice';

Chart.register(RadialLinearScale, PolarAreaController, ArcElement);

interface RadiationDiagram2DProps {
  N_circ: number;
  indice_freq: number;
  selectedFreq: number;
}
export const RadiationDiagram2D: React.FC<RadiationDiagram2DProps> = ({
  N_circ,
  indice_freq,
  selectedFreq,
}) => {
  const solverResults = useSelector(solverResultsSelector);

  const startIndexXY = 0;
  const endIndexXY = N_circ;
  const startIndexZX = N_circ;
  const endIndexZX = 2 * N_circ;
  const startIndexYZ = 2 * N_circ;
  const endIndexYZ = 3 * N_circ;
  const angolo = [0, 330, 300, 270, 240, 210, 180, 150, 120, 90, 60, 30];

  const [E_xy, setE_xy] = useState<number[]>([]);
  const [E_zx, setE_zx] = useState<number[]>([]);
  const [E_yz, setE_yz] = useState<number[]>([]);

  const calculateE = (start: number, end: number): number[] => {
    const Ex_slice = (
      solverResults[0] as SolverResultsElectricFields
    ).results.Ex[indice_freq].slice(start, end);
    const Ey_slice = (
      solverResults[0] as SolverResultsElectricFields
    ).results.Ey[indice_freq].slice(start, end);
    const Ez_slice = (
      solverResults[0] as SolverResultsElectricFields
    ).results.Ez[indice_freq].slice(start, end);
    return Ex_slice.map((_, i) =>
      Math.sqrt(
        Math.sqrt(Ex_slice[i][0] ** 2 + Ex_slice[i][1] ** 2) ** 2 +
          Math.sqrt(Ey_slice[i][0] ** 2 + Ey_slice[i][1] ** 2) ** 2 +
          Math.sqrt(Ez_slice[i][0] ** 2 + Ez_slice[i][1] ** 2) ** 2,
      ),
    );
  };

  useEffect(() => {
    if (
      (solverResults[0] as SolverResultsElectricFields).results.Ex.length > 0 &&
      (solverResults[0] as SolverResultsElectricFields).results.Ey.length > 0 &&
      (solverResults[0] as SolverResultsElectricFields).results.Ez.length > 0
    ) {
      setE_xy(calculateE(startIndexXY, endIndexXY));
      setE_zx(calculateE(startIndexZX, endIndexZX));
      setE_yz(calculateE(startIndexYZ, endIndexYZ));
    }
  }, [(solverResults[0] as SolverResultsElectricFields).results, indice_freq]);

  const polarChartOptions: ChartOptions<'polarArea'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: undefined, // Sarà impostato dinamicamente
        ticks: {
          showLabelBackdrop: false,
          color: 'black',
          z: 10,
          callback: function (value) {
            return (value as number).toExponential(1);
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.2)',
        },
        angleLines: {
          display: true, // Imposta a true per mostrare le linee degli angoli (i raggi)
          color: 'rgba(0, 0, 0, 0.1)', // Colore delle linee degli angoli
          lineWidth: 1,
        },
        pointLabels: {
          display: true,
          callback: function (angle) {
            return `${angle}°`;
          },
          font: {
            size: 10,
          },
          color: 'black',
        },
      },
    },
    plugins: {
      title: {
        display: true,
        color: "black",
        text: '', // Sarà impostato dinamicamente
        font: {
          size: 16,
          weight: "400",
        },
        align: 'center',
      },
      legend: {
        display: false,
      },
    },
  };

  const polarChartData = (dataValues: number[], title: string) => ({
    labels: angolo.map((a) => a),
    datasets: [
      {
        label: 'Magnitude [V/m]',
        data: dataValues,
        backgroundColor: 'rgba(54, 162, 235, 0.3)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
    options: {
      scales: {
        r: {
          max: 1.1 * Math.max(...dataValues),
        },
      },
      plugins: {
        title: {
          text: title,
        },
      },
    },
  });

  return (
    <div className="flex flex-row items-center justify-between">
      <div className="w-[560px] h-[400px] bg-white rounded-xl p-3">
        <PolarArea
          data={{
            ...polarChartData(
              E_xy,
              `xy-plane - ${
                selectedFreq ? selectedFreq.toExponential(1) : 0
              } Hz - [V/m]`,
            ),
          }}
          options={{
            ...polarChartOptions,
            scales: {
              ...polarChartOptions.scales,
              r: {
                ...polarChartOptions.scales?.r,
                max: 1.1 * Math.max(...E_xy),
                //startAngle: 90,
              },
            },
            plugins: {
              ...polarChartOptions.plugins,
              title: {
                ...polarChartOptions.plugins?.title,
                text: `xy-plane - ${
                  selectedFreq ? selectedFreq.toExponential(1) : 0
                } Hz - [V/m]`,
              },
            },
          }}
        />
      </div>
      <div className="w-[560px] h-[400px] bg-white rounded-xl p-3">
        <PolarArea
          data={{
            ...polarChartData(
              E_zx,
              `zx-plane - ${
                selectedFreq ? selectedFreq.toExponential(1) : 0
              } Hz - [V/m]`,
            ),
          }}
          options={{
            ...polarChartOptions,
            scales: {
              ...polarChartOptions.scales,
              r: {
                ...polarChartOptions.scales?.r,
                max: 1.1 * Math.max(...E_zx),
                //startAngle: 90,
              },
            },
            plugins: {
              ...polarChartOptions.plugins,
              title: {
                ...polarChartOptions.plugins?.title,
                text: `zx-plane - ${
                  selectedFreq ? selectedFreq.toExponential(1) : 0
                } Hz - [V/m]`,
              },
            },
          }}
        />
      </div>
      <div className="w-[560px] h-[400px] bg-white rounded-xl p-3">
        <PolarArea
          data={{
            ...polarChartData(
              E_yz,
              `yz-plane - ${
                selectedFreq ? selectedFreq.toExponential(1) : 0
              } Hz - [V/m]`,
            ),
          }}
          options={{
            ...polarChartOptions,
            scales: {
              ...polarChartOptions.scales,
              r: {
                ...polarChartOptions.scales?.r,
                max: 1.1 * Math.max(...E_yz),
                //startAngle: 90,
              },
            },
            plugins: {
              ...polarChartOptions.plugins,
              title: {
                ...polarChartOptions.plugins?.title,
                text: `yz-plane - ${
                  selectedFreq ? selectedFreq.toExponential(1) : 0
                } Hz - [V/m]`,
              },
            },
          }}
        />
      </div>
    </div>
  );
};
