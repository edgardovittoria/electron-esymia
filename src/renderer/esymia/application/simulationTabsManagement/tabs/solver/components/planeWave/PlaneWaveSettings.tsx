import { Transition, Dialog } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { ThemeSelector } from '../../../../../../store/tabsAndMenuItemsSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectedProjectSelector,
  setPlaneWaveParametres,
  setRadialFieldParametres,
  unsetPlaneWaveParametres,
  unsetRadialFieldParametres,
} from '../../../../../../store/projectSlice';
import {
  PlaneWaveParameters,
  RadialFieldParameters,
} from '../../../../../../model/esymiaModels';
import { computeFieldsComponents } from './utility/computeFieldsComponents';
import { useDynamoDBQuery } from '../../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../../../../../dynamoDB/projectsFolderApi';
import { BsGraphUp } from 'react-icons/bs';
import { gamma } from 'mathjs';
import { InputGraphData } from '../ShowInputGraphModal';

interface PlaneWaveSettingsModal {
  setGraphData: Function
}

export const PlaneWaveSettings: React.FC<PlaneWaveSettingsModal> = ({setGraphData}) => {
  const theme = useSelector(ThemeSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  const { execQuery2 } = useDynamoDBQuery();
  const dispatch = useDispatch();
  const [tetha, settetha] = useState(
    selectedProject?.planeWaveParameters
      ? selectedProject.planeWaveParameters.input.theta
      : 0,
  );
  const [phi, setphi] = useState(
    selectedProject?.planeWaveParameters
      ? selectedProject.planeWaveParameters.input.phi
      : 0,
  );
  const [eTetha, seteTetha] = useState(
    selectedProject?.planeWaveParameters
      ? selectedProject.planeWaveParameters.input.ETheta
      : 0,
  );
  const [ePhi, setePhi] = useState(
    selectedProject?.planeWaveParameters
      ? selectedProject.planeWaveParameters.input.EPhi
      : 0,
  );
  const [errorPhi, seterrorPhi] = useState(false);
  const [errorTheta, seterrorTheta] = useState(false);
  const [radius, setRadius] = useState(
    selectedProject ? selectedProject.radialFieldParameters?.radius : 0,
  );
  const [centerX, setcenterX] = useState(
    selectedProject ? selectedProject.radialFieldParameters?.center.x : 0,
  );
  const [centerY, setcenterY] = useState(
    selectedProject ? selectedProject.radialFieldParameters?.center.y : 0,
  );
  const [centerZ, setcenterZ] = useState(
    selectedProject ? selectedProject.radialFieldParameters?.center.z : 0,
  );

  const [signal, setsignal] = useState<string>(selectedProject?.planeWaveParameters ? selectedProject.planeWaveParameters.input.ESignal : 'exponential');

  return (
    <>
      <div
        className={`w-full max-w-full transform overflow-hidden rounded border p-3 ${
          theme === 'light'
            ? 'bg-white text-textColor border-textColor'
            : 'bg-bgColorDark2 text-textColorDark border-textColorDark'
        }`}
      >
        <div className="flex flex-row gap-2 items-center w-full">
          <div className="flex flex-col w-1/2">
            <div className="p-1">
              <h6>Tetha (0 - π):</h6>
              <input
                type="number"
                disabled={selectedProject?.simulation?.status === "Completed"}
                className={`formControl ${
                  theme === 'light'
                    ? 'bg-gray-100 text-textColor'
                    : 'bg-bgColorDark text-textColorDark'
                }  rounded p-2 w-full mt-1 ${
                  errorTheta ? 'border border-red-500' : ''
                }`}
                placeholder="Tetha (0 - π)"
                min={0}
                max={Math.PI}
                step={0.01}
                value={tetha}
                onChange={(e) => {
                  if (
                    parseFloat(e.target.value) < 0 ||
                    parseFloat(e.target.value) > Math.PI
                  ) {
                    settetha(parseFloat(e.target.value));
                    seterrorTheta(true);
                  } else {
                    settetha(parseFloat(e.target.value));
                    seterrorTheta(false);
                  }
                }}
              />
              {errorTheta && (
                <span className="text-red-500 mt-2">
                  theta must be between 0 and π
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col w-1/2">
            <div className="p-1">
              <h6>Phi (0 - 2π):</h6>
              <input
                type="number"
                disabled={selectedProject?.simulation?.status === "Completed"}
                className={`formControl ${
                  theme === 'light'
                    ? 'bg-gray-100 text-textColor'
                    : 'bg-bgColorDark text-textColorDark'
                }  rounded p-2 w-full mt-1 ${
                  errorPhi ? 'border border-red-500' : ''
                }`}
                placeholder="Phi (0 - 2π)"
                min={0}
                max={Math.PI}
                step={0.01}
                value={phi}
                onChange={(e) => {
                  if (
                    parseFloat(e.target.value) < 0 ||
                    parseFloat(e.target.value) > Math.PI
                  ) {
                    setphi(parseFloat(e.target.value));
                    seterrorPhi(true);
                  } else {
                    seterrorPhi(false);
                    setphi(parseFloat(e.target.value));
                  }
                }}
              />
              {errorPhi && (
                <span className="text-red-500 mt-2">
                  phi must be between 0 and 2π
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-2 items-center w-full">
          <div className="flex flex-col w-1/2">
            <div className="p-1">
              <h6>E_tetha:</h6>
              <input
                type="number"
                disabled={selectedProject?.simulation?.status === "Completed"}
                className={`formControl ${
                  theme === 'light'
                    ? 'bg-gray-100 text-textColor'
                    : 'bg-bgColorDark text-textColorDark'
                }  rounded p-2 w-full mt-1`}
                placeholder="E_tetha"
                value={eTetha}
                onChange={(e) => seteTetha(parseFloat(e.target.value))}
              />
            </div>
          </div>
          <div className="flex flex-col w-1/2">
            <div className="p-1">
              <h6>E_phi:</h6>
              <input
                type="number"
                disabled={selectedProject?.simulation?.status === "Completed"}
                className={`formControl ${
                  theme === 'light'
                    ? 'bg-gray-100 text-textColor'
                    : 'bg-bgColorDark text-textColorDark'
                }  rounded p-2 w-full mt-1`}
                placeholder="E_phi"
                value={ePhi}
                onChange={(e) => setePhi(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between mt-3 p-1">
          <select
            defaultValue={signal}
            disabled={selectedProject?.simulation?.status === "Completed"}
            onChange={(e) => {
              setsignal(e.currentTarget.value);
            }}
            className="select border-black w-1/2"
          >
            <option value="exponential">Exponential</option>
            <option value="gaussian_modulated">Gaussian Modulated</option>
            <option value="sinusoidal">Sinusoidal</option>
          </select>
          <div
            className="tooltip tooltip-left hover:cursor-pointer"
            data-tip="Show signal graph"
            onClick={() => {
              let vs:number[] = [];
              switch (signal) {
                case 'exponential':
                  vs = genera_segnale_esponenziale(
                    selectedProject?.times as number[],
                  );
                  break;
                case 'sinusoidal':
                  vs = genera_segnale_sinusoidale(
                    selectedProject?.times as number[],
                  );
                  break;
                case 'gaussian_modulated':
                  vs = genera_segnale_Gaussiano_modulato(
                    selectedProject?.times as number[],
                  );
                  break;
              }
              setGraphData({
                labelX: "Times",
                labelY: "E",
                dataX: selectedProject?.times?.map(t => parseFloat(t.toExponential(2))),
                dataY: vs,
                signalName: "E signal"
              } as InputGraphData)
            }}
          >
            <BsGraphUp size={25} />
          </div>
        </div>
        <div className="flex flex-col mt-3">
          <div className="p-1">
            <h6>{`Insert radius (${selectedProject?.modelUnit})`}</h6>
            <input
              type="number"
              disabled={selectedProject?.simulation?.status === "Completed"}
              className={`formControl ${
                theme === 'light'
                  ? 'bg-gray-100 text-textColor'
                  : 'bg-bgColorDark text-textColorDark'
              }  rounded p-2 w-full mt-3`}
              placeholder="radius"
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
            />
          </div>
          <div className="p-1">
            <h6>{`Center of gravity (${selectedProject?.modelUnit})`}</h6>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col gap-2 items-center">
                <span>X</span>
                <input
                  type="number"
                  disabled={selectedProject?.simulation?.status === "Completed"}
                  className={`formControl ${
                    theme === 'light'
                      ? 'bg-gray-100 text-textColor'
                      : 'bg-bgColorDark text-textColorDark'
                  }  rounded p-2 w-full`}
                  placeholder="x"
                  value={centerX}
                  onChange={(e) => setcenterX(parseFloat(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-2 items-center">
                <span>Y</span>
                <input
                  type="number"
                  disabled={selectedProject?.simulation?.status === "Completed"}
                  className={`formControl ${
                    theme === 'light'
                      ? 'bg-gray-100 text-textColor'
                      : 'bg-bgColorDark text-textColorDark'
                  }  rounded p-2 w-full`}
                  placeholder="y"
                  value={centerY}
                  onChange={(e) => setcenterY(parseFloat(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-2 items-center">
                <span>Z</span>
                <input
                  type="number"
                  disabled={selectedProject?.simulation?.status === "Completed"}
                  className={`formControl ${
                    theme === 'light'
                      ? 'bg-gray-100 text-textColor'
                      : 'bg-bgColorDark text-textColorDark'
                  }  rounded p-2 w-full`}
                  placeholder="z"
                  value={centerZ}
                  onChange={(e) => setcenterZ(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <button
            type="button"
            disabled={selectedProject?.simulation?.status === "Completed"}
            className="button bg-red-500 text-white disabled:cursor-not-allowed disabled:opacity-30"
            onClick={() => {
              dispatch(unsetPlaneWaveParametres());
              seteTetha(0);
              setphi(0);
              setePhi(0);
              settetha(0);
              setRadius(0);
              setcenterX(0);
              setcenterY(0);
              setcenterZ(0);
              if (selectedProject) {
                execQuery2(
                  createOrUpdateProjectInDynamoDB,
                  {
                    ...selectedProject,
                    planeWaveParameters: undefined,
                  },
                  dispatch,
                ).then(() => {
                  //setModalOpen(false);
                });
              }
              dispatch(unsetRadialFieldParametres());
              if (selectedProject) {
                execQuery2(
                  createOrUpdateProjectInDynamoDB,
                  {
                    ...selectedProject,
                    radialFieldParameters: undefined,
                  },
                  dispatch,
                ).then(() => {
                  //setModalOpen(false);
                });
              }
            }}
          >
            UNSET
          </button>
          <button
            type="button"
            className={`button disabled:cursor-not-allowed disabled:opacity-30 buttonPrimary ${
              theme === 'light' ? '' : 'bg-secondaryColorDark text-textColor'
            }`}
            disabled={errorPhi || errorTheta || selectedProject?.simulation?.status === "Completed"}
            onClick={() => {
              const { E, K, H, E_theta_v, E_phi_v } = computeFieldsComponents(
                tetha,
                phi,
                eTetha,
                ePhi,
              );
              let planeWaveParameters: PlaneWaveParameters = {
                input: {
                  theta: tetha,
                  phi: phi,
                  ETheta: eTetha,
                  EPhi: ePhi,
                  ESignal: signal,
                },
                output: {
                  E: E,
                  K: K,
                  H: H,
                  E_theta_v: E_theta_v,
                  E_phi_v: E_phi_v,
                },
              };
              dispatch(setPlaneWaveParametres(planeWaveParameters));
              let radialFieldParameters: RadialFieldParameters = {
                radius: radius ? radius : 0,
                center: {
                  x: centerX ? centerX : 0,
                  y: centerY ? centerY : 0,
                  z: centerZ ? centerZ : 0,
                },
                plane: 'xy',
              };
              dispatch(setRadialFieldParametres(radialFieldParameters));
              if (selectedProject) {
                execQuery2(
                  createOrUpdateProjectInDynamoDB,
                  {
                    ...selectedProject,
                    radialFieldParameters: radialFieldParameters,
                    planeWaveParameters: planeWaveParameters
                  },
                  dispatch,
                ).then(() => {
                  //setModalOpen(false);
                });
              }
            }}
          >
            SET
          </button>
        </div>
      </div>
    </>
  );
};

// time_delay_vs=3e-9
// tw = 50*0.1/3e8
// power=4
export function genera_segnale_esponenziale(
  time: number[],
  tw: number = (50 * 0.1) / 3e8,
  power: number = 4,
  time_delay_vs: number = 3e-9,
): number[] {
  const ratio =
    Math.pow(power, -power - 1) * gamma(power + 1) * Math.exp(power);
  const tr = tw / ratio;
  const vs: number[] = time.map((t) => {
    if (t >= time_delay_vs) {
      const normalizedTime = (t - time_delay_vs) / tr;
      return (
        Math.pow(normalizedTime, power) *
        Math.exp(-power * (normalizedTime - 1))
      );
    } else {
      return 0;
    }
  });
  return vs;
}

// time_delay_vs=3e-9
// f0=1e9
// dev_stand=10/(4*pi)*1e-9
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
    if (t >= time_delay_vs) {
      vs.push(
        Math.cos(2 * Math.PI * f0 * timeShifted) *
          Math.exp(-(timeShifted ** 2) / (2 * dev_stand ** 2)),
      );
    } else {
      vs.push(0);
    }
  }
  return vs;
}

// time_delay_vs=3e-9
// f0=1e8
export function genera_segnale_sinusoidale(
  time: number[],
  f0: number = 1e8,
  time_delay_vs: number = 3e-9,
): number[] {
  const vs: number[] = [];
  for (let i = 0; i < time.length; i++) {
    if (time[i] >= time_delay_vs) {
      vs.push(Math.cos(2 * Math.PI * f0 * (time[i] - time_delay_vs)));
    } else {
      vs.push(0);
    }
  }
  return vs;
}

export function genera_segnale_trapezoidal_pulse(
  time_vect: number[],
  initial_delay_time: number = 2e-9,
  A: number = 1e-9,
  high_level_time: number = 10e-9,
  raise_time: number = 10e-9,
  falling_time: number = 10e-9
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
      return new Array(xi.length).fill(NaN); // Handle invalid input
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
        yi.push(y[0]); // Extrapolate with first point
      } else if (upperIndex === -1) {
        yi.push(y[y.length - 1]); // Extrapolate with last point
      } else if (lowerIndex === upperIndex) {
        yi.push(y[lowerIndex]);
      } else {
        const x0 = x[lowerIndex];
        const y0 = y[lowerIndex];
        const x1 = x[upperIndex];
        const y1 = y[upperIndex];

        if (x1 === x0) {
          yi.push(y0); // Avoid division by zero
        } else {
          yi.push(y0 + (y1 - y0) * (x_i - x0) / (x1 - x0));
        }
      }
    }
    return yi;
  };

  const index_start_rise_time = findIndex(time_vect, initial_delay_time);
  const index_end_rise_time = findIndex(time_vect, initial_delay_time + raise_time);
  const index_start_falling_time = findIndex(time_vect, initial_delay_time + raise_time + high_level_time);
  const index_end_falling_time = findIndex(time_vect, initial_delay_time + raise_time + high_level_time + falling_time);

  const num_samples = time_vect.length;
  const signal_time_sampled: number[] = new Array(num_samples).fill(0);

  if (index_end_rise_time !== undefined && index_start_falling_time !== undefined) {
    for (let i = index_end_rise_time; i < index_start_falling_time; i++) {
      signal_time_sampled[i] = A;
    }
  }

  if (index_start_rise_time !== undefined && index_end_rise_time !== undefined && index_start_rise_time > 0 && index_end_rise_time < num_samples -1) {
    const t_rise = time_vect.slice(index_start_rise_time, index_end_rise_time);
    const x_rise = [time_vect[index_start_rise_time - 1], time_vect[index_end_rise_time < num_samples - 1 ? index_end_rise_time + 1 : index_end_rise_time]];
    const y_rise = [0, A];
    const interpolated_rise = interp1(x_rise, y_rise, t_rise);
    for (let i = 0; i < t_rise.length; i++) {
      signal_time_sampled[index_start_rise_time + i] = interpolated_rise[i];
    }
  } else if (index_start_rise_time !== undefined && index_end_rise_time !== undefined) {
    // Handle edge cases where indices might be at the boundaries
    for (let i = index_start_rise_time; i < index_end_rise_time; i++) {
      const fraction = (time_vect[i] - time_vect[index_start_rise_time]) / (time_vect[index_end_rise_time] - time_vect[index_start_rise_time]);
      signal_time_sampled[i] = Math.max(0, Math.min(A, fraction * A)); // Linear rise
    }
  }


  if (index_start_falling_time !== undefined && index_end_falling_time !== undefined && index_start_falling_time > 0 && index_end_falling_time < num_samples - 1) {
    const t_fall = time_vect.slice(index_start_falling_time, index_end_falling_time);
    const x_fall = [time_vect[index_start_falling_time - 1], time_vect[index_end_falling_time < num_samples - 1 ? index_end_falling_time + 1 : index_end_falling_time]];
    const y_fall = [A, 0];
    const interpolated_fall = interp1(x_fall, y_fall, t_fall);
    for (let i = 0; i < t_fall.length; i++) {
      signal_time_sampled[index_start_falling_time + i] = interpolated_fall[i];
    }
  } else if (index_start_falling_time !== undefined && index_end_falling_time !== undefined) {
    // Handle edge cases for falling time
    for (let i = index_start_falling_time; i < index_end_falling_time; i++) {
      const fraction = (time_vect[i] - time_vect[index_start_falling_time]) / (time_vect[index_end_falling_time] - time_vect[index_start_falling_time]);
      signal_time_sampled[i] = Math.max(0, Math.min(A, A * (1 - fraction))); // Linear fall
    }
  }

  return signal_time_sampled;
}
