import { useState } from 'react';
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
  PortOrPlaneWaveSignal,
  RadialFieldParameters,
} from '../../../../../../model/esymiaModels';
import { computeFieldsComponents } from './utility/computeFieldsComponents';
import { useDynamoDBQuery } from '../../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../../../../../dynamoDB/projectsFolderApi';
import { PlaneWaveSignal } from './SolverSignal';

interface PlaneWaveSettingsModal {
  setGraphData: Function;
}

export const PlaneWaveSettings: React.FC<PlaneWaveSettingsModal> = ({
  setGraphData,
}) => {
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

  const [signal, setsignal] = useState<PortOrPlaneWaveSignal>(
    selectedProject?.planeWaveParameters
      ? selectedProject.planeWaveParameters.input.ESignal
      : {
        type: 'exponential',
        params: {
          tw: String((50 * 0.1) / 3e8),
          power: '4',
          time_delay_vs: '3e-9',
        },
      },
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4 w-full">
          <div className="flex flex-col w-1/2 gap-1">
            <h6 className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>θ [0 - π]:</h6>
            <input
              type="number"
              disabled={selectedProject?.simulation?.status === 'Completed'}
              className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
                  ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
                  : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
                } ${errorTheta ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
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
              <span className="text-red-500 text-xs mt-1">
                θ must be between 0 and π
              </span>
            )}
          </div>
          <div className="flex flex-col w-1/2 gap-1">
            <h6 className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>φ [0 - 2π]:</h6>
            <input
              type="number"
              disabled={selectedProject?.simulation?.status === 'Completed'}
              className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
                  ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
                  : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
                } ${errorPhi ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
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
              <span className="text-red-500 text-xs mt-1">
                φ must be between 0 and 2π
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-row gap-4 w-full">
          <div className="flex flex-col w-1/2 gap-1">
            <h6 className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Eθ:</h6>
            <input
              type="number"
              disabled={selectedProject?.simulation?.status === 'Completed'}
              className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
                  ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
                  : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="E_tetha"
              value={eTetha}
              onChange={(e) => seteTetha(parseFloat(e.target.value))}
            />
          </div>
          <div className="flex flex-col w-1/2 gap-1">
            <h6 className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>Eφ:</h6>
            <input
              type="number"
              disabled={selectedProject?.simulation?.status === 'Completed'}
              className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
                  ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
                  : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="E_phi"
              value={ePhi}
              onChange={(e) => setePhi(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <hr className={`border-t ${theme === 'light' ? 'border-gray-200' : 'border-white/10'} my-2`} />

        <PlaneWaveSignal
          setGraphData={setGraphData}
          signal={signal}
          setSignal={setsignal}
        />

        <hr className={`border-t ${theme === 'light' ? 'border-gray-200' : 'border-white/10'} my-2`} />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h6 className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>{`Insert radius [${selectedProject?.modelUnit}]`}</h6>
            <input
              type="number"
              disabled={selectedProject?.simulation?.status === 'Completed'}
              className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
                  ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
                  : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              placeholder="radius"
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <h6 className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>{`Center of gravity [${selectedProject?.modelUnit}]`}</h6>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col gap-1 items-center flex-1">
                <span className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>X</span>
                <input
                  type="number"
                  disabled={selectedProject?.simulation?.status === 'Completed'}
                  className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
                      ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
                      : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="x"
                  value={centerX}
                  onChange={(e) => setcenterX(parseFloat(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-1 items-center flex-1">
                <span className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Y</span>
                <input
                  type="number"
                  disabled={selectedProject?.simulation?.status === 'Completed'}
                  className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
                      ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
                      : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="y"
                  value={centerY}
                  onChange={(e) => setcenterY(parseFloat(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-1 items-center flex-1">
                <span className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Z</span>
                <input
                  type="number"
                  disabled={selectedProject?.simulation?.status === 'Completed'}
                  className={`w-full p-2.5 rounded-xl text-sm font-medium outline-none transition-all ${theme === 'light'
                      ? 'bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-gray-800'
                      : 'bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="z"
                  value={centerZ}
                  onChange={(e) => setcenterZ(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-between gap-3">
        <button
          type="button"
          disabled={selectedProject?.simulation?.status === 'Completed'}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${theme === 'light'
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
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
          Unset
        </button>
        <button
          type="button"
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${theme === 'light'
              ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={
            errorPhi ||
            errorTheta ||
            selectedProject?.simulation?.status === 'Completed'
          }
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
                  planeWaveParameters: planeWaveParameters,
                },
                dispatch,
              ).then(() => {
                //setModalOpen(false);
              });
            }
          }}
        >
          Set Parameters
        </button>
      </div>
    </>
  );
};
