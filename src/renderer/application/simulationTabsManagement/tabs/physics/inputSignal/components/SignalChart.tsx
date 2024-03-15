import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Signal } from '../../../../../../model/esymiaModels';

ChartJS.register(
  CategoryScale,
  PointElement,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface SignalChartProps {
  signal: Signal;
  type: 'module' | 'phase';
}

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  lineTension: number;
}

export const SignalChart: React.FC<SignalChartProps> = ({ signal, type }) => {
  const datasets: Dataset[] = [];
  const frequencyValues: number[] = [];
  const signalMagnitude: number[] = [];
  const signalPhase: number[] = [];
  signal.signalValues.forEach((value) => {
    frequencyValues.push(value.freq);
    const magnitudeValue = Math.sqrt(
      value.signal.Re ** 2 + value.signal.Im ** 2,
    );
    signalMagnitude.push(magnitudeValue);
    const phaseValue = Math.atan(value.signal.Im / value.signal.Re);
    signalPhase.push(phaseValue);
  });
  if (type === 'module') {
    datasets.push({
      label: 'Module',
      data: signalMagnitude,
      borderColor: 'blue',
      backgroundColor: 'blue',
      lineTension: 0.5,
    });
  } else {
    datasets.push({
      label: 'Phase',
      data: signalPhase,
      borderColor: 'red',
      backgroundColor: 'red',
      lineTension: 0.5,
    });
  }

  const labels = frequencyValues;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: signal.name,
      },
    },
    layout: {
      padding: {
        right: 20,
      },
    },
  };

  const data = {
    labels,
    datasets,
  };

  return (
    <div className="box w-100">
      <Line options={options} data={data} />
    </div>
  );
};
