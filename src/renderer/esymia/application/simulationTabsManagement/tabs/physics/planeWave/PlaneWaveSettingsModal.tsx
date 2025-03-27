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
import { useDynamoDBQuery } from '../../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB } from '../../../../dynamoDB/projectsFolderApi';

interface PlaneWaveSettingsModalProps {
  setModalOpen: (v: boolean) => void;
}

export const PlaneWaveSettingsModal: React.FC<PlaneWaveSettingsModalProps> = ({
  setModalOpen,
}) => {
  const theme = useSelector(ThemeSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  const { execQuery2 } = useDynamoDBQuery()
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
  const [errorPhi, seterrorPhi] = useState(false)
  const [errorTheta, seterrorTheta] = useState(false)

  return (
    <>
      <Transition appear show={true} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div
            className="fixed inset-0 overflow-y-auto"
            data-testid="createNewProjectModal"
          >
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={`w-full max-w-md transform overflow-hidden rounded-2xl ${
                    theme === 'light'
                      ? 'bg-white text-textColor'
                      : 'bg-bgColorDark2 text-textColorDark '
                  } p-6 text-left align-middle shadow-xl transition-all`}
                >
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 "
                  >
                    PLANE WAVE SETTINGS
                  </Dialog.Title>
                  <hr className="mt-2 mb-3" />
                  <div className="flex flex-col">
                    <div className="p-2">
                      <h6>Insert Tetha (0 - π):</h6>
                      <input
                        type="number"
                        className={`formControl ${
                          theme === 'light'
                            ? 'bg-gray-100 text-textColor'
                            : 'bg-bgColorDark text-textColorDark'
                        }  rounded p-2 w-full mt-3 ${errorTheta ? 'border border-red-500' : ''}`}
                        placeholder="Tetha (0 - π)"
                        min={0}
                        max={Math.PI}
                        step={.01}
                        value={tetha}
                        onChange={(e) => {
                          if(parseFloat(e.target.value) < 0 || parseFloat(e.target.value) > Math.PI){
                            settetha(parseFloat(e.target.value))
                            seterrorTheta(true)
                          }else{
                            settetha(parseFloat(e.target.value))
                            seterrorTheta(false)
                          }
                        }}
                      />
                      {errorTheta && <span className="text-red-500 mt-2">theta must be between 0 and π</span>}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="p-2">
                      <h6>Insert Phi (0 - π):</h6>
                      <input
                        type="number"
                        className={`formControl ${
                          theme === 'light'
                            ? 'bg-gray-100 text-textColor'
                            : 'bg-bgColorDark text-textColorDark'
                        }  rounded p-2 w-full mt-3 ${errorPhi ? 'border border-red-500' : ''}`}
                        placeholder="Phi (0 - π)"
                        min={0}
                        max={Math.PI}
                        step={.01}
                        value={phi}
                        onChange={(e) => {
                          if(parseFloat(e.target.value) < 0 || parseFloat(e.target.value) > Math.PI){
                            setphi(parseFloat(e.target.value))
                            seterrorPhi(true)
                          }else{
                            seterrorPhi(false)
                            setphi(parseFloat(e.target.value))
                          }
                        }}
                      />
                      {errorPhi && <span className="text-red-500 mt-2">phi must be between 0 and π</span>}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="p-2">
                      <h6>Insert E_tetha:</h6>
                      <input
                        type="number"
                        className={`formControl ${
                          theme === 'light'
                            ? 'bg-gray-100 text-textColor'
                            : 'bg-bgColorDark text-textColorDark'
                        }  rounded p-2 w-full mt-3`}
                        placeholder="E_tetha"
                        value={eTetha}
                        onChange={(e) => seteTetha(parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="p-2">
                      <h6>Insert E_phi:</h6>
                      <input
                        type="number"
                        className={`formControl ${
                          theme === 'light'
                            ? 'bg-gray-100 text-textColor'
                            : 'bg-bgColorDark text-textColorDark'
                        }  rounded p-2 w-full mt-3`}
                        placeholder="E_phi"
                        value={ePhi}
                        onChange={(e) => setePhi(parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      className="button bg-gray-400 text-white"
                      onClick={() => {
                        setModalOpen(false);
                      }}
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      className="button bg-red-500 text-white"
                      onClick={() => {
                        dispatch(unsetPlaneWaveParametres());
                        if(selectedProject){
                          execQuery2(
                            createOrUpdateProjectInDynamoDB,
                            {
                              ...selectedProject,
                              planeWaveParameters: undefined
                            },
                            dispatch,
                          ).then(() => {
                            setModalOpen(false);
                          });
                        }
                      }}
                    >
                      UNSET
                    </button>
                    <button
                      type="button"
                      className={`button disabled:cursor-not-allowed disabled:opacity-30 buttonPrimary ${
                        theme === 'light'
                          ? ''
                          : 'bg-secondaryColorDark text-textColor'
                      }`}
                      disabled={errorPhi || errorTheta}
                      onClick={() => {
                        const { E, K, H, E_theta_v, E_phi_v } =
                          computeFieldsComponents(tetha, phi, eTetha, ePhi);
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
                        if(selectedProject){
                          execQuery2(
                            createOrUpdateProjectInDynamoDB,
                            {
                              ...selectedProject,
                              planeWaveParameters: planeWaveParameters
                            },
                            dispatch,
                          ).then(() => {
                            setModalOpen(false);
                          });
                        }
                      }}
                    >
                      SET
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
