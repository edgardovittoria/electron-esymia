import { Transition, Dialog } from '@headlessui/react';
import React, { Fragment, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeSelector } from '../../../../../store/tabsAndMenuItemsSlice';
import { selectedProjectSelector, setRadialFieldParametres, unsetRadialFieldParametres } from '../../../../../store/projectSlice';
import { RadialFieldParameters } from '../../../../../model/esymiaModels';

interface RadialFieldSettingsModalProps {
  setModalOpen: (v: boolean) => void;
}

export const RadialFieldSettingsModal: React.FC<
  RadialFieldSettingsModalProps
> = ({ setModalOpen }) => {
  const theme = useSelector(ThemeSelector);
  const selectedProject = useSelector(selectedProjectSelector)
  const dispatch = useDispatch()
  const [radius, setRadius] = useState(selectedProject ? selectedProject.radialFieldParameters?.radius : 0);
  const [centerX, setcenterX] = useState(selectedProject ? selectedProject.radialFieldParameters?.center.x : 0)
  const [centerY, setcenterY] = useState(selectedProject ? selectedProject.radialFieldParameters?.center.y : 0)
  const [centerZ, setcenterZ] = useState(selectedProject ? selectedProject.radialFieldParameters?.center.z : 0)
  const [plane, setplane] = useState(selectedProject ? selectedProject.radialFieldParameters?.plane : "xy")
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
                    RADIAL FIELD SETTINGS
                  </Dialog.Title>
                  <hr className="mt-2 mb-3" />
                  <div className="flex flex-col">
                    <div className="p-2">
                      <h6>Insert radius</h6>
                      <input
                        type="number"
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
                    <div className="p-2">
                      <h6>Insert center</h6>
                      <div className="flex flex-row gap-4">
                        <div className="flex flex-col gap-2 items-center">
                          <span>X</span>
                          <input
                            type="number"
                            className={`formControl ${
                              theme === 'light'
                                ? 'bg-gray-100 text-textColor'
                                : 'bg-bgColorDark text-textColorDark'
                            }  rounded p-2 w-full`}
                            placeholder="x"
                            value={centerX}
                            onChange={(e) =>
                              setcenterX(parseFloat(e.target.value))
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-2 items-center">
                          <span>Y</span>
                          <input
                            type="number"
                            className={`formControl ${
                              theme === 'light'
                                ? 'bg-gray-100 text-textColor'
                                : 'bg-bgColorDark text-textColorDark'
                            }  rounded p-2 w-full`}
                            placeholder="y"
                            value={centerY}
                            onChange={(e) =>
                              setcenterY(parseFloat(e.target.value))
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-2 items-center">
                          <span>Z</span>
                          <input
                            type="number"
                            className={`formControl ${
                              theme === 'light'
                                ? 'bg-gray-100 text-textColor'
                                : 'bg-bgColorDark text-textColorDark'
                            }  rounded p-2 w-full`}
                            placeholder="z"
                            value={centerZ}
                            onChange={(e) =>
                              setcenterZ(parseFloat(e.target.value))
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <h6>Select plane</h6>
                      <select defaultValue={plane} className="select border-black mt-2"
                        onChange={(e) => setplane(e.currentTarget.value)}
                      >
                        <option>xy</option>
                        <option>xz</option>
                        <option>yz</option>
                      </select>
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
                        dispatch(unsetRadialFieldParametres())
                        setModalOpen(false);
                      }}
                    >
                      UNSET
                    </button>
                    <button
                      type="button"
                      className={`button buttonPrimary ${
                        theme === 'light'
                          ? ''
                          : 'bg-secondaryColorDark text-textColor'
                      }`}
                      onClick={() => {
                        let radialFieldParameters:RadialFieldParameters = {
                            radius: radius? radius : 0,
                            center: {x: centerX ? centerX : 0, y: centerY ? centerY : 0, z:centerZ ? centerZ : 0},
                            plane: plane ? plane : "xy"
                        }
                        dispatch(setRadialFieldParametres(radialFieldParameters))
                        setModalOpen(false);
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
