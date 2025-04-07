import { Transition, Dialog } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { ThemeSelector } from '../../../../../store/tabsAndMenuItemsSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectedProjectSelector,
  setPlaneWaveParametres,
  unsetPlaneWaveParametres,
} from '../../../../../store/projectSlice';
import { PlaneWaveParameters } from '../../../../../model/esymiaModels';
import { computeFieldsComponents } from './utility/computeFieldsComponents';
import { useDynamoDBQuery } from '../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../../../../dynamoDB/projectsFolderApi';

interface PlaneWaveSettingsModalProps {
  
}

export const PlaneWaveSettingsModal: React.FC<PlaneWaveSettingsModalProps> = ({
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

  return (
    <>
      <div
        className={`w-full max-w-md transform overflow-hidden rounded border p-3 ${
          theme === 'light'
            ? 'bg-white text-textColor border-textColor'
            : 'bg-bgColorDark2 text-textColorDark border-textColorDark'
        }`}
      >

        <div className="flex flex-col">
          <div className="p-1">
            <h6>Insert Tetha (0 - π):</h6>
            <input
              type="number"
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
        <div className="flex flex-col">
          <div className="p-1">
            <h6>Insert Phi (0 - π):</h6>
            <input
              type="number"
              className={`formControl ${
                theme === 'light'
                  ? 'bg-gray-100 text-textColor'
                  : 'bg-bgColorDark text-textColorDark'
              }  rounded p-2 w-full mt-1 ${
                errorPhi ? 'border border-red-500' : ''
              }`}
              placeholder="Phi (0 - π)"
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
                phi must be between 0 and π
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="p-1">
            <h6>Insert E_tetha:</h6>
            <input
              type="number"
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
        <div className="flex flex-col">
          <div className="p-1">
            <h6>Insert E_phi:</h6>
            <input
              type="number"
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

        <div className="mt-4 flex justify-between">
          <button
            type="button"
            className="button bg-red-500 text-white"
            onClick={() => {
              dispatch(unsetPlaneWaveParametres());
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
            }}
          >
            UNSET
          </button>
          <button
            type="button"
            className={`button disabled:cursor-not-allowed disabled:opacity-30 buttonPrimary ${
              theme === 'light' ? '' : 'bg-secondaryColorDark text-textColor'
            }`}
            disabled={errorPhi || errorTheta}
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
              if (selectedProject) {
                execQuery2(
                  createOrUpdateProjectInDynamoDB,
                  {
                    ...selectedProject,
                    planeWaveParameters: planeWaveParameters,
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
