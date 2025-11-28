
import React, { FC, useEffect, useState, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectedProjectSelector, setPortSignal } from '../../../../../../store/projectSlice';
import { InputGraphData } from '../ShowInputGraphModal';
import { BsGraphUp } from 'react-icons/bs';
import { gamma } from 'mathjs';
import { ThemeSelector } from '../../../../../../store/tabsAndMenuItemsSlice';
import { PortOrPlaneWaveSignal, SignalParams } from '../../../../../../model/esymiaModels';

// RegEx to validate a float or exponential number strictly.
const floatRegex = /^(?:[+-]?(?:(?:\d+(?:\.\d*)?)|\.\d+)(?:[eE][+-]?\d+)?)$/;

// Funzione di utilità per verificare se tutti i parametri sono validi (non vuoti e corretti).
const allParamsAreValid = (params: SignalParams): boolean => {
  return Object.values(params).every(val =>
    typeof val === "string" && val.trim() !== "" && floatRegex.test(val.trim())
  );
};

// A memoized input component for port signals.
const ValidatedInputPort: FC<InputProps> = memo(({ label, value, onChange }) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const theme = useSelector(ThemeSelector);
  const [error, setError] = useState<string>("");

  const validate = (val: string): string => {
    if (val.trim() === "") return "Field cannot be empty";
    if (!floatRegex.test(val.trim())) {
      return "Insert a valid float or exponential value";
    }
    return "";
  };

  const handleChange = (val: string) => {
    const errMsg = validate(val);
    setError(errMsg);
    onChange(val);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>{label}:</span>
      <input
        disabled={selectedProject?.simulation?.status === 'Completed'}
        type="text"
        value={value ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
            ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
            : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
          } ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      {error && <span className="text-red-500 text-[10px]">{error}</span>}
    </div>
  );
});

// A memoized input component for wave signals.
const ValidatedInputWave: FC<InputProps> = memo(({ label, value, onChange }) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const theme = useSelector(ThemeSelector);
  const [error, setError] = useState<string>("");

  const validate = (val: string): string => {
    if (val.trim() === "") return "";
    if (!floatRegex.test(val.trim())) {
      return "Insert a valid float or exponential value";
    }
    return "";
  };

  const handleChange = (val: string) => {
    const errMsg = validate(val);
    setError(errMsg);
    onChange(val);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>{label}:</span>
      <input
        disabled={selectedProject?.simulation?.status === 'Completed'}
        type="text"
        value={value ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
            ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
            : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
          } ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      {error && <span className="text-red-500 text-[10px]">{error}</span>}
    </div>
  );
});

export const PortSignal: FC<{
  signal: PortOrPlaneWaveSignal;
  setSavedPhysicsParameters: Function;
  setGraphData: Function;
}> = ({ signal, setGraphData, setSavedPhysicsParameters }) => {
  const [newSignal, setSignal] = useState(signal);
  const selectedProject = useSelector(selectedProjectSelector);
  const theme = useSelector(ThemeSelector);
  const dispatch = useDispatch();

  const handleInputChange = (param: string, value: string) => {
    // We update only the params, preserving the current input without losing focus.
    setSignal((prev: PortOrPlaneWaveSignal) => ({
      ...prev,
      params: {
        ...prev.params,
        [param]: value,
      },
    }));
  };

  const areInputsValid = allParamsAreValid(newSignal.params);


  useEffect(() => {
    setSignal(signal);
  }, [signal]);

  return (
    <div className={`mt-4 p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
      <h6 className={`text-sm font-bold mb-3 ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>Port Signal</h6>
      <div className="flex items-center gap-4 mb-4">
        <select
          value={newSignal.type}
          disabled={selectedProject?.simulation?.status === 'Completed'}
          onChange={(e) => {
            resetParams(e.target.value, setSignal);
          }}
          className={`flex-1 p-2.5 rounded-xl text-sm font-medium outline-none transition-all cursor-pointer ${theme === 'light'
              ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
              : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <option value="no_signal">No Signal</option>
          <option value="exponential">Exponential</option>
          <option value="gaussian_modulated">Gaussian Modulated</option>
          <option value="sinusoidal">Sinusoidal</option>
          <option value="trapezoidal_pulse">Trapezoidal Pulse</option>
        </select>
        <button
          className={`p-2.5 rounded-xl transition-all ${!areInputsValid
              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
              : theme === 'light'
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
            }`}
          title="Show signal graph"
          onClick={() => {
            if (!areInputsValid) return;
            setGraphData({
              labelX: 'Times',
              labelY: 'E',
              dataX: selectedProject?.times?.map((t) =>
                parseFloat(t.toExponential(2)),
              ),
              dataY: generateSignal(
                newSignal.type,
                selectedProject?.times as number[],
                newSignal.params,
              ),
              signalName: 'E signal',
            } as InputGraphData);
          }}
        >
          <BsGraphUp size={20} />
        </button>
      </div>

      <div className="mb-6">
        {renderInputPortFields(newSignal, handleInputChange)}
      </div>

      <div className="flex justify-between gap-3">
        <button
          type="button"
          disabled={selectedProject?.simulation?.status === 'Completed'}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${theme === 'light'
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-white/5 text-gray-300 hover:bg-white/10'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={() => resetParams(newSignal.type, setSignal)}
        >
          Default Values
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${theme === 'light'
              ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={() => {
            dispatch(setPortSignal(newSignal));
            setSavedPhysicsParameters(false);
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export const PlaneWaveSignal: FC<{
  signal: PortOrPlaneWaveSignal;
  setGraphData: Function;
  setSignal: Function;
}> = ({ signal, setGraphData, setSignal }) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const theme = useSelector(ThemeSelector);

  const handleInputChange = (param: string, value: string) => {
    setSignal({
      ...signal,
      params: {
        ...signal.params,
        [param]: value,
      },
    });
  };

  const areInputsValid = allParamsAreValid(signal.params);

  return (
    <div className={`mt-4 p-4 rounded-xl border ${theme === 'light' ? 'bg-white/50 border-gray-200' : 'bg-white/5 border-white/10'}`}>
      <div className="flex items-center gap-4 mb-4">
        <select
          value={signal.type}
          disabled={selectedProject?.simulation?.status === 'Completed'}
          onChange={(e) => {
            setSignal({ type: e.target.value, params: signal.params });
            resetParams(e.target.value, setSignal);
          }}
          className={`flex-1 p-2.5 rounded-xl text-sm font-medium outline-none transition-all cursor-pointer ${theme === 'light'
              ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
              : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <option value="exponential">Exponential</option>
          <option value="gaussian_modulated">Gaussian Modulated</option>
          <option value="sinusoidal">Sinusoidal</option>
        </select>
        <button
          className={`p-2.5 rounded-xl transition-all ${!areInputsValid
              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
              : theme === 'light'
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
            }`}
          title="Show signal graph"
          onClick={() => {
            if (!areInputsValid) return;
            setGraphData({
              labelX: 'Times',
              labelY: 'E',
              dataX: selectedProject?.times?.map((t) =>
                parseFloat(t.toExponential(2)),
              ),
              dataY: generateSignal(
                signal.type,
                selectedProject?.times as number[],
                signal.params,
              ),
              signalName: 'E signal',
            } as InputGraphData);
          }}
        >
          <BsGraphUp size={20} />
        </button>
      </div>
      {renderInputWaveFields(signal, handleInputChange)}
    </div>
  );
};

const renderInputPortFields = (
  signal: PortOrPlaneWaveSignal,
  handleInputChange: (param: string, value: string) => void,
) => {
  switch (signal.type) {
    case 'exponential':
      return (
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInputPort
            label="tw"
            value={signal.params.tw}
            onChange={(val) => handleInputChange('tw', val)}
          />
          <ValidatedInputPort
            label="power"
            value={signal.params.power}
            onChange={(val) => handleInputChange('power', val)}
          />
          <ValidatedInputPort
            label="time_delay_vs"
            value={signal.params.time_delay_vs}
            onChange={(val) => handleInputChange('time_delay_vs', val)}
          />
        </div>
      );
    case 'gaussian_modulated':
      return (
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInputPort
            label="f0"
            value={signal.params.f0}
            onChange={(val) => handleInputChange('f0', val)}
          />
          <ValidatedInputPort
            label="dev_stand"
            value={signal.params.dev_stand}
            onChange={(val) => handleInputChange('dev_stand', val)}
          />
          <ValidatedInputPort
            label="time_delay_vs"
            value={signal.params.time_delay_vs}
            onChange={(val) => handleInputChange('time_delay_vs', val)}
          />
        </div>
      );
    case 'sinusoidal':
      return (
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInputPort
            label="f0"
            value={signal.params.f0}
            onChange={(val) => handleInputChange('f0', val)}
          />
          <ValidatedInputPort
            label="time_delay_vs"
            value={signal.params.time_delay_vs}
            onChange={(val) => handleInputChange('time_delay_vs', val)}
          />
        </div>
      );
    case 'trapezoidal_pulse':
      return (
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInputPort
            label="initial_delay_time"
            value={signal.params.initial_delay_time}
            onChange={(val) => handleInputChange('initial_delay_time', val)}
          />
          <ValidatedInputPort
            label="A"
            value={signal.params.A}
            onChange={(val) => handleInputChange('A', val)}
          />
          <ValidatedInputPort
            label="high_level_time"
            value={signal.params.high_level_time}
            onChange={(val) => handleInputChange('high_level_time', val)}
          />
          <ValidatedInputPort
            label="raise_time"
            value={signal.params.raise_time}
            onChange={(val) => handleInputChange('raise_time', val)}
          />
          <ValidatedInputPort
            label="falling_time"
            value={signal.params.falling_time}
            onChange={(val) => handleInputChange('falling_time', val)}
          />
        </div>
      );
    default:
      return null;
  }
};

const renderInputWaveFields = (
  signal: PortOrPlaneWaveSignal,
  handleInputChange: (param: string, value: string) => void,
) => {
  switch (signal.type) {
    case 'exponential':
      return (
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInputWave
            label="tw"
            value={signal.params.tw}
            onChange={(val) => handleInputChange('tw', val)}
          />
          <ValidatedInputWave
            label="power"
            value={signal.params.power}
            onChange={(val) => handleInputChange('power', val)}
          />
          <ValidatedInputWave
            label="time_delay_vs"
            value={signal.params.time_delay_vs}
            onChange={(val) => handleInputChange('time_delay_vs', val)}
          />
        </div>
      );
    case 'gaussian_modulated':
      return (
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInputWave
            label="f0"
            value={signal.params.f0}
            onChange={(val) => handleInputChange('f0', val)}
          />
          <ValidatedInputWave
            label="dev_stand"
            value={signal.params.dev_stand}
            onChange={(val) => handleInputChange('dev_stand', val)}
          />
          <ValidatedInputWave
            label="time_delay_vs"
            value={signal.params.time_delay_vs}
            onChange={(val) => handleInputChange('time_delay_vs', val)}
          />
        </div>
      );
    case 'sinusoidal':
      return (
        <div className="grid grid-cols-2 gap-4">
          <ValidatedInputWave
            label="f0"
            value={signal.params.f0}
            onChange={(val) => handleInputChange('f0', val)}
          />
          <ValidatedInputWave
            label="time_delay_vs"
            value={signal.params.time_delay_vs}
            onChange={(val) => handleInputChange('time_delay_vs', val)}
          />
        </div>
      );
    default:
      return null;
  }
};

interface InputProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}

const resetParams = (sigType: string, setSignal: Function) => {
  let newParams: SignalParams = {};
  switch (sigType) {
    case 'exponential':
      newParams = {
        tw: String((50 * 0.1) / 3e8),
        power: '4',
        time_delay_vs: '3e-9',
      };
      break;
    case 'gaussian_modulated':
      newParams = {
        f0: '1e9',
        dev_stand: String((10 / (4 * Math.PI)) * 1e-9),
        time_delay_vs: '3e-9',
      };
      break;
    case 'sinusoidal':
      newParams = {
        f0: '1e8',
        time_delay_vs: '3e-9',
      };
      break;
    case 'trapezoidal_pulse':
      newParams = {
        initial_delay_time: '2e-9',
        A: '1e-9',
        high_level_time: '10e-9',
        raise_time: '10e-9',
        falling_time: '10e-9',
      };
      break;
    default:
      newParams = {};
  }
  setSignal({ type: sigType, params: newParams });
};

const generateSignal = (
  signalType: string,
  times: number[],
  signalParams: SignalParams,
) => {
  let vs: number[] = [];

  switch (signalType) {
    case 'exponential':
      vs = genera_segnale_esponenziale(
        times,
        parseFloat(signalParams.tw as string),
        parseFloat(signalParams.power as string),
        parseFloat(signalParams.time_delay_vs as string),
      );
      break;
    case 'sinusoidal':
      vs = genera_segnale_sinusoidale(
        times,
        parseFloat(signalParams.f0 as string),
        parseFloat(signalParams.time_delay_vs as string),
      );
      break;
    case 'gaussian_modulated':
      vs = genera_segnale_Gaussiano_modulato(
        times,
        parseFloat(signalParams.f0 as string),
        parseFloat(signalParams.dev_stand as string),
        parseFloat(signalParams.time_delay_vs as string),
      );
      break;
    case 'trapezoidal_pulse':
      vs = genera_segnale_trapezoidal_pulse(
        times,
        parseFloat(signalParams.initial_delay_time as string),
        parseFloat(signalParams.A as string),
        parseFloat(signalParams.high_level_time as string),
        parseFloat(signalParams.raise_time as string),
        parseFloat(signalParams.falling_time as string),
      );
      break;
    default:
      vs = new Array(times.length).fill(0);
  }
  return vs;
};

export function genera_segnale_esponenziale(
  time: number[],
  tw: number = (50 * 0.1) / 3e8,
  power: number = 4,
  time_delay_vs: number = 3e-9,
): number[] {
  const ratio =
    Math.pow(power, -power - 1) * gamma(power + 1) * Math.exp(power);
  const tr = tw / ratio;
  const vs: number[] = time.map((t) =>
    t >= time_delay_vs
      ? Math.pow((t - time_delay_vs) / tr, power) *
      Math.exp(-power * ((t - time_delay_vs) / tr - 1))
      : 0,
  );
  return vs;
}

export function genera_segnale_Gaussiano_modulato(
  time: number[],
  f0: number = 1e9,
  dev_stand: number = (10 / (4 * Math.PI)) * 1e-9,
  time_delay_vs: number = 3e-9,
): number[] {
  const vs: number[] = [];
  for (let i = 0; i < time.length; i++) {
    const t = time[i];
    const timeShifted = t - time_delay_vs;
    vs.push(
      t >= time_delay_vs
        ? Math.cos(2 * Math.PI * f0 * timeShifted) *
        Math.exp(-Math.pow(timeShifted, 2) / (2 * Math.pow(dev_stand, 2)))
        : 0,
    );
  }
  return vs;
}

export function genera_segnale_sinusoidale(
  time: number[],
  f0: number = 1e8,
  time_delay_vs: number = 3e-9,
): number[] {
  const vs: number[] = [];
  for (let i = 0; i < time.length; i++) {
    vs.push(
      time[i] >= time_delay_vs
        ? Math.cos(2 * Math.PI * f0 * (time[i] - time_delay_vs))
        : 0,
    );
  }
  return vs;
}

export function genera_segnale_trapezoidal_pulse(
  time_vect: number[],
  initial_delay_time: number = 2e-9,
  A: number = 1e-9,
  high_level_time: number = 10e-9,
  raise_time: number = 10e-9,
  falling_time: number = 10e-9,
): number[] {
  const findIndex = (arr: number[], value: number): number | undefined => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] >= value) {
        return i;
      }
    }
    return undefined;
  };

  const interp1 = (x: number[], y: number[], xi: number[]): number[] => {
    if (x.length !== y.length || x.length < 2) {
      return new Array(xi.length).fill(NaN);
    }
    const yi: number[] = [];
    for (const x_i of xi) {
      let lowerIndex = -1;
      let upperIndex = -1;
      for (let i = 0; i < x.length; i++) {
        if (x[i] <= x_i) {
          lowerIndex = i;
        }
        if (x[i] >= x_i && upperIndex === -1) {
          upperIndex = i;
          break;
        }
      }
      if (lowerIndex === -1) {
        yi.push(y[0]);
      } else if (upperIndex === -1) {
        yi.push(y[y.length - 1]);
      } else if (lowerIndex === upperIndex) {
        yi.push(y[lowerIndex]);
      } else {
        const x0 = x[lowerIndex],
          y0 = y[lowerIndex],
          x1 = x[upperIndex],
          y1 = y[upperIndex];
        yi.push(x1 === x0 ? y0 : y0 + ((y1 - y0) * (x_i - x0)) / (x1 - x0));
      }
    }
    return yi;
  };

  const index_start_rise_time = findIndex(time_vect, initial_delay_time);
  const index_end_rise_time = findIndex(
    time_vect,
    initial_delay_time + raise_time,
  );
  const index_start_falling_time = findIndex(
    time_vect,
    initial_delay_time + raise_time + high_level_time,
  );
  const index_end_falling_time = findIndex(
    time_vect,
    initial_delay_time + raise_time + high_level_time + falling_time,
  );

  const num_samples = time_vect.length;
  const signal_time_sampled: number[] = new Array(num_samples).fill(0);

  if (
    index_end_rise_time !== undefined &&
    index_start_falling_time !== undefined
  ) {
    for (let i = index_end_rise_time; i < index_start_falling_time; i++) {
      signal_time_sampled[i] = A;
    }
  }

  if (
    index_start_rise_time !== undefined &&
    index_end_rise_time !== undefined &&
    index_start_rise_time > 0 &&
    index_end_rise_time < num_samples - 1
  ) {
    const t_rise = time_vect.slice(index_start_rise_time, index_end_rise_time);
    const x_rise = [
      time_vect[index_start_rise_time - 1],
      time_vect[
      index_end_rise_time < num_samples - 1
        ? index_end_rise_time + 1
        : index_end_rise_time
      ],
    ];
    const y_rise = [0, A];
    const interpolated_rise = interp1(x_rise, y_rise, t_rise);
    for (let i = 0; i < t_rise.length; i++) {
      signal_time_sampled[index_start_rise_time + i] = interpolated_rise[i];
    }
  } else if (
    index_start_rise_time !== undefined &&
    index_end_rise_time !== undefined
  ) {
    for (let i = index_start_rise_time; i < index_end_rise_time; i++) {
      const fraction =
        (time_vect[i] - time_vect[index_start_rise_time]) /
        (time_vect[index_end_rise_time] - time_vect[index_start_rise_time]);
      signal_time_sampled[i] = Math.max(0, Math.min(A, fraction * A));
    }
  }

  if (
    index_start_falling_time !== undefined &&
    index_end_falling_time !== undefined &&
    index_start_falling_time > 0 &&
    index_end_falling_time < num_samples - 1
  ) {
    const t_fall = time_vect.slice(
      index_start_falling_time,
      index_end_falling_time,
    );
    const x_fall = [
      time_vect[index_start_falling_time - 1],
      time_vect[
      index_end_falling_time < num_samples - 1
        ? index_end_falling_time + 1
        : index_end_falling_time
      ],
    ];
    const y_fall = [A, 0];
    const interpolated_fall = interp1(x_fall, y_fall, t_fall);
    for (let i = 0; i < t_fall.length; i++) {
      signal_time_sampled[index_start_falling_time + i] = interpolated_fall[i];
    }
  } else if (
    index_start_falling_time !== undefined &&
    index_end_falling_time !== undefined
  ) {
    for (let i = index_start_falling_time; i < index_end_falling_time; i++) {
      const fraction =
        (time_vect[i] - time_vect[index_start_falling_time]) /
        (time_vect[index_end_falling_time] -
          time_vect[index_start_falling_time]);
      signal_time_sampled[i] = Math.max(0, Math.min(A, A * (1 - fraction)));
    }
  }

  return signal_time_sampled;
}

