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
import PolarAreaContinuousBorder from './PolarAreaCurvedBorders';

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
  const angolo1 = [0, 330, 300, 270, 240, 210, 180, 150, 120, 90, 60, 30];
  const angolo2 = [90, 60, 30, 0, 330, 300, 270, 240, 210, 180, 150, 120];
  const angolo3 = [180, 150, 120, 90, 60, 30, 0, 330, 300, 270, 240, 210];

  const [E_xy, setE_xy] = useState<number[]>([]);
  const [E_zx, setE_zx] = useState<number[]>([]);
  const [E_yz, setE_yz] = useState<number[]>([]);

  const calculateE = (start: number, end: number): number[] => {
    const Ex_slice = (
      solverResults[0] as SolverResultsElectricFields
    ).results.Ex.slice(start, end);
    const Ey_slice = (
      solverResults[0] as SolverResultsElectricFields
    ).results.Ey.slice(start, end);
    const Ez_slice = (
      solverResults[0] as SolverResultsElectricFields
    ).results.Ez.slice(start, end);
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
        color: 'black',
        text: '', // Sarà impostato dinamicamente
        font: {
          size: 16,
          weight: '400',
        },
        align: 'center',
      },
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="flex flex-row items-center justify-between bg-white h-[45vh] w-full">
      <div className="w-1/3 h-full p-3 border-r border-gray-200">
        <PolarAreaContinuousBorder
          labels={angolo1.map((a) => a.toString())}
          data={E_xy}
          title={`xy-plane - ${(
            solverResults[0] as SolverResultsElectricFields
          ).results.f[indice_freq].toExponential(1)} Hz - [V/m]`}
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
                text: `xy-plane - ${(
                  solverResults[0] as SolverResultsElectricFields
                ).results.f[indice_freq].toExponential(1)} Hz - [V/m]`,
              },
            },
          }}
        />
      </div>
      <div className="w-1/3 h-full p-3 border-r border-gray-200">
        <PolarAreaContinuousBorder
          labels={angolo2.map((a) => a.toString())}
          data={E_zx}
          title={`zx-plane - ${(
            solverResults[0] as SolverResultsElectricFields
          ).results.f[indice_freq].toExponential(1)} Hz - [V/m]`}
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
                text: `zx-plane - ${(
                  solverResults[0] as SolverResultsElectricFields
                ).results.f[indice_freq].toExponential(1)} Hz - [V/m]`,
              },
            },
          }}
        />
      </div>
      <div className="w-1/3 h-full p-3">
        <PolarAreaContinuousBorder
          labels={angolo3.map((a) => a.toString())}
          data={E_yz}
          title={`yz-plane - ${(
            solverResults[0] as SolverResultsElectricFields
          ).results.f[indice_freq].toExponential(1)} Hz - [V/m]`}
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
                text: `yz-plane - ${(
                  solverResults[0] as SolverResultsElectricFields
                ).results.f[indice_freq].toExponential(1)} Hz - [V/m]`,
              },
            },
          }}
        />
      </div>
    </div>
  );
};
