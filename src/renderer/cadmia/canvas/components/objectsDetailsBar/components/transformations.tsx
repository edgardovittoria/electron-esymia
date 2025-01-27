import { FC, Fragment, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  TransformationParamDetails,
  TransformationParams,
  updateTransformationParams,
} from '../../../../../cad_library';
import { Transition, Dialog } from '@headlessui/react';

export const Transformations: FC<{
  transformationParams: TransformationParams;
}> = ({ transformationParams }) => {
  const dispatch = useDispatch();
  const [showTransformationModal, setShowTransformationModal] =
    useState<boolean>(false);

  return (
    <>
      <div className="flex mt-2">
        <div className="flex justify-center mx-[10px] ml-[70px] w-full">
          <div className="text-black w-1/3 text-center font-bold mb-1 text-[10px]">
            X
          </div>
          <div className="text-black w-1/3 text-center font-bold mb-1 text-[10px]">
            Y
          </div>
          <div className="text-black w-1/3 text-center font-bold mb-1 text-[10px]">
            Z
          </div>
        </div>
      </div>
      <div key="position" className="flex justify-between">
        <span className="text-black w-[15%] text-[10px]">position</span>
        <div className="flex mb-[5px] justify-between pr-[15px] w-[83%]">
          {transformationParams.position.map((paramValue, index) => (
            <input
              key={index}
              disabled
              type="number"
              step="0.1"
              className="border border-black rounded shadow w-[30%] text-black text-[10px] px-1"
              autoComplete="off"
              value={paramValue}
              onChange={(e) => {
                let newPosition: TransformationParamDetails = [
                  ...transformationParams.position,
                ];
                newPosition[index] = parseFloat(e.target.value);
                dispatch(
                  updateTransformationParams({
                    ...transformationParams,
                    position: newPosition,
                  }),
                );
              }}
            />
          ))}
        </div>
      </div>
      <div key="rotation" className="flex justify-between">
        <span className="text-black w-[15%] text-[10px]">rotation</span>
        <div className="flex mb-[5px] justify-between pr-[15px] w-[83%]">
          {transformationParams.rotation.map((paramValue, index) => (
            <div
              key={index}
              className="flex flex-col justify-center items-center w-[30%]"
            >
              <input
                disabled
                type="number"
                step="1"
                min={-180}
                max={180}
                className="border border-black rounded shadow w-full text-black text-[10px] px-1"
                autoComplete="off"
                value={(paramValue * 180) / Math.PI}
                onChange={(e) => {
                  let newRotation: TransformationParamDetails = [
                    ...transformationParams.rotation,
                  ];
                  newRotation[index] =
                    (parseFloat(e.target.value) * Math.PI) / 180;
                  dispatch(
                    updateTransformationParams({
                      ...transformationParams,
                      rotation: newRotation,
                    }),
                  );
                }}
              />
              {/* <span className="text-black w-full text-[10px]">
                [-180°/180°]
              </span> */}
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="rounded bg-gray-500 shadow p-2 mt-[20px] w-full"
        onClick={() => setShowTransformationModal(true)}
      >
        Change Transformation Params
      </button>
      {showTransformationModal && (
        <SetTransformationParamsModal
          showTransformationModal={setShowTransformationModal}
          transformationParams={transformationParams}
        />
      )}
      {/* <div key='scale' className="flex justify-between">
              <span className="text-black w-[15%] text-[10px]">scale</span>
              <div className="flex mb-[5px] justify-between pr-[15px] w-[83%]">
                  {transformationParams.scale.map((paramValue, index) =>
                      <input key={index}
                              type="number"
                              step="0.1"
                              className="border border-black rounded shadow w-[30%] text-black text-[10px] px-1"
                              autoComplete="off"
                              value={paramValue}
                              onChange={(e) => {
                                let newScale: TransformationParamDetails = [...transformationParams.scale]
                                newScale[index] = parseFloat(e.target.value)
                                dispatch(updateTransformationParams({...transformationParams, scale: newScale}))
                              }}
                      />
                  )}
              </div>
            </div> */}
    </>
  );
};

export const SetTransformationParamsModal: FC<{
  showTransformationModal: Function;
  transformationParams: TransformationParams;
}> = ({ showTransformationModal, transformationParams }) => {
  const [newPosition, setNewPosition] = useState<string[]>(
    transformationParams.position.map((p) => p.toFixed(6)),
  );
  const [newRotation, setNewRotation] = useState<string[]>(
    transformationParams.rotation.map((r) => r.toFixed(6)),
  );
  const dispatch = useDispatch();

  const updateNewPositionCoord = (index: number, value: string) => {
    if (/^-?\d*\.?\d{0,6}$/.test(value)) {
      const newValues = [...newPosition];
      newValues[index] = value;
      setNewPosition(newValues);
    }
  };

  const updateNewRotation = (index: number, value: string) => {
    if (/^-?\d*\.?\d{0,6}$/.test(value)) {
      const newValues = [...newRotation];
      newValues[index] = value;
      setNewRotation(newValues);
    }
  };

  return (
    <Transition appear show as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => showTransformationModal(false)}
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

        <div className="fixed inset-0 overflow-y-auto">
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Set new transformation params
                </Dialog.Title>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="ml-2">position x:</label>
                      <input
                        type="number"
                        value={newPosition[0]}
                        required
                        onChange={(e) =>
                          updateNewPositionCoord(0, e.target.value)
                        }
                        className="border border-black rounded shadow p-1 w-[80%] text-black text-left"
                      />
                    </div>
                    <div>
                      <label className="ml-2">position y:</label>
                      <input
                        type="number"
                        value={newPosition[1]}
                        required
                        onChange={(e) =>
                          updateNewPositionCoord(1, e.target.value)
                        }
                        className="border border-black rounded shadow p-1 w-[80%] text-black text-left"
                      />
                    </div>
                    <div>
                      <label className="ml-2">position z:</label>
                      <input
                        type="number"
                        value={newPosition[2]}
                        required
                        onChange={(e) =>
                          updateNewPositionCoord(2, e.target.value)
                        }
                        className="border border-black rounded shadow p-1 w-[80%] text-black text-left"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="ml-2">rotation x:</label>
                      <input
                        type="number"
                        value={newRotation[0]}
                        required
                        onChange={(e) => updateNewRotation(0, e.target.value)}
                        className="border border-black rounded shadow p-1 w-[80%] text-black text-left"
                      />
                      <span className="text-black w-full text-[10px]">
                        [-180°/180°]
                      </span>
                    </div>
                    <div>
                      <label className="ml-2">rotation y:</label>
                      <input
                        type="number"
                        value={newRotation[1]}
                        required
                        onChange={(e) => updateNewRotation(1, e.target.value)}
                        className="border border-black rounded shadow p-1 w-[80%] text-black text-left"
                      />
                      <span className="text-black w-full text-[10px]">
                        [-180°/180°]
                      </span>
                    </div>
                    <div>
                      <label className="ml-2">rotation z:</label>
                      <input
                        type="number"
                        value={newRotation[2]}
                        required
                        onChange={(e) => updateNewRotation(2, e.target.value)}
                        className="border border-black rounded shadow p-1 w-[80%] text-black text-left"
                      />
                      <span className="text-black w-full text-[10px]">
                        [-180°/180°]
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => showTransformationModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => {
                      let newPos: TransformationParamDetails = newPosition.map(
                        (p) => (isNaN(parseFloat(p)) ? '0' : parseFloat(p)),
                      ) as TransformationParamDetails;
                      let newRot: TransformationParamDetails = newRotation.map(
                        (r) => {
                          if (isNaN(parseFloat(r))) return 0;
                          if (parseFloat(r) > 180) return 180*Math.PI/180;
                          if (parseFloat(r) < -180) return -180*Math.PI/180;
                          return parseFloat(r)*Math.PI/180;
                        },
                      ) as TransformationParamDetails;
                      dispatch(
                        updateTransformationParams({
                          ...transformationParams,
                          position: newPos,
                          rotation: newRot,
                        }),
                      );
                      showTransformationModal(false);
                    }}
                  >
                    Save
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
