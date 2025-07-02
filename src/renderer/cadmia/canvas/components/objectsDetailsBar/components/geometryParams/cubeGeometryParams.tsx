import { FC, Fragment, useEffect, useState } from 'react';
import { GeometryParamsGeneralProps } from './geometryParams';
import { useDispatch } from 'react-redux';
import {
  CubeGeometryAttributes,
  TransformationParamDetails,
  updateTransformationParams,
} from '../../../../../../cad_library';
import { Transition, Dialog } from '@headlessui/react';

export const CubeGeometryParams: FC<GeometryParamsGeneralProps> = ({
  entity,
  updateParams,
}) => {
  const dispatch = useDispatch();
  const [showCoordsModal, setShowCoordsModal] = useState<boolean>(false);
  const [updatePositionCoordsFlag, setUpdatePositionCoordsFlag] =
    useState<boolean>(true);
  const computeCoordsOnPositionChange = (
    position: TransformationParamDetails,
    width: number,
    height: number,
    depth: number,
  ) => {
    return [
      (position[0] - width / 2).toString(),
      (position[0] + width / 2).toString(),
      (position[1] - height / 2).toString(),
      (position[1] + height / 2).toString(),
      (position[2] - depth / 2).toString(),
      (position[2] + depth / 2).toString(),
    ];
  };
  const [coords, setCoords] = useState<string[]>(
    computeCoordsOnPositionChange(
      entity.transformationParams.position,
      (entity.geometryAttributes as CubeGeometryAttributes).width,
      (entity.geometryAttributes as CubeGeometryAttributes).height,
      (entity.geometryAttributes as CubeGeometryAttributes).depth,
    ),
  );

  useEffect(() => {
    if (updatePositionCoordsFlag) {
      updateParams({
        ...entity.geometryAttributes,
        width: Math.abs(parseFloat(coords[0]) - parseFloat(coords[1])),
        height: Math.abs(parseFloat(coords[2]) - parseFloat(coords[3])),
        depth: Math.abs(parseFloat(coords[4]) - parseFloat(coords[5])),
      } as CubeGeometryAttributes);
      dispatch(
        updateTransformationParams({
          ...entity.transformationParams,
          position: [
            (parseFloat(coords[0]) + parseFloat(coords[1])) / 2,
            (parseFloat(coords[2]) + parseFloat(coords[3])) / 2,
            (parseFloat(coords[4]) + parseFloat(coords[5])) / 2,
          ],
        }),
      );
      setUpdatePositionCoordsFlag(false);
    } else {
      setUpdatePositionCoordsFlag(true);
    }
  }, [coords]);

  useEffect(() => {
    if (updatePositionCoordsFlag) {
      setCoords(
        computeCoordsOnPositionChange(
          entity.transformationParams.position,
          (entity.geometryAttributes as CubeGeometryAttributes).width,
          (entity.geometryAttributes as CubeGeometryAttributes).height,
          (entity.geometryAttributes as CubeGeometryAttributes).depth,
        ),
      );
      setUpdatePositionCoordsFlag(false)
    }else{
      setUpdatePositionCoordsFlag(true)
    }
  }, [entity.transformationParams.position]);

  return (
    <>
      <div className="flex row">
        <div key="xmin" className="flex">
          <span className="text-black w-[40%] text-left text-[10px]">Xmin</span>
          <div className="flex mb-[5px]">
            <input
              key="xmin"
              disabled
              type="number"
              step="0.1"
              className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
              autoComplete="off"
              value={coords[0]}
            />
          </div>
        </div>
        <div key="xmax" className="flex">
          <span className="text-black w-[40%] text-left text-[10px]">Xmax</span>
          <div className="flex mb-[5px]">
            <input
              key="xmax"
              disabled
              type="number"
              step="0.1"
              className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
              autoComplete="off"
              value={coords[1]}
            />
          </div>
        </div>
      </div>
      <div className="flex row">
        <div key="ymin" className="flex">
          <span className="text-black w-[40%] text-left text-[10px]">Ymin</span>
          <div className="flex mb-[5px]">
            <input
              key="ymin"
              disabled
              type="number"
              step="0.1"
              className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
              autoComplete="off"
              value={coords[2]}
            />
          </div>
        </div>
        <div key="ymax" className="flex">
          <span className="text-black w-[40%] text-left text-[10px]">Ymax</span>
          <div className="flex mb-[5px]">
            <input
              key="ymax"
              disabled
              type="number"
              step="0.1"
              className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
              autoComplete="off"
              value={coords[3]}
            />
          </div>
        </div>
      </div>
      <div className="flex row">
        <div key="zmin" className="flex">
          <span className="text-black w-[40%] text-left text-[10px]">Zmin</span>
          <div className="flex mb-[5px]">
            <input
              key="zmin"
              disabled
              type="number"
              step="0.1"
              className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
              autoComplete="off"
              value={coords[4]}
            />
          </div>
        </div>
        <div key="zmax" className="flex">
          <span className="text-black w-[40%] text-left text-[10px]">Zmax</span>
          <div className="flex mb-[5px]">
            <input
              key="zmax"
              type="number"
              disabled
              step="0.1"
              className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
              autoComplete="off"
              value={coords[5]}
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        className="rounded bg-gray-500 shadow p-2 mt-[20px] w-full"
        onClick={() => setShowCoordsModal(true)}
      >
        Change Coords
      </button>
      {/* <div key="width" className="flex">
                <span className="text-black w-[40%] text-left text-[10px]">width</span>
                <div className="flex mb-[5px]">
                    <input key="width"
                           type="number"
                           step="0.1"
                           className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
                           autoComplete="off"
                           value={(entity.geometryAttributes as CubeGeometryAttributes).width}
                           onChange={(e) => updateParams({
                               ...entity.geometryAttributes,
                               width: parseFloat(e.target.value) || 0
                           } as CubeGeometryAttributes)}
                    />
                </div>
            </div>
            <div key="heigth" className="flex">
                <span className="text-black w-[40%] text-left text-[10px]">heigth</span>
                <div className="flex mb-[5px]">
                    <input key="height"
                           type="number"
                           step="0.1"
                           className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
                           autoComplete="off"
                           value={(entity.geometryAttributes as CubeGeometryAttributes).height}
                           onChange={(e) => updateParams({
                               ...entity.geometryAttributes,
                               height: parseFloat(e.target.value) || 0
                           } as CubeGeometryAttributes)}
                    />
                </div>
            </div>
            <div key="depth" className="flex">
                <span className="text-black w-[40%] text-left text-[10px]">depth</span>
                    <div className="flex mb-[5px]">
                        <input key="depth"
                               type="number"
                               step="0.1"
                               className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
                               autoComplete="off"
                               value={(entity.geometryAttributes as CubeGeometryAttributes).depth}
                               onChange={(e) => updateParams({
                                   ...entity.geometryAttributes,
                                   depth: parseFloat(e.target.value) || 0
                               } as CubeGeometryAttributes)}
                        />
                    </div>
            </div> */}
      <div key="width_segments" className="flex">
        <span className="text-black w-[40%] text-left text-[10px]">
          width segments
        </span>
        <div className="flex mb-[5px]">
          <input
            key="width_segments"
            type="number"
            step="1"
            className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
            autoComplete="off"
            value={
              (entity.geometryAttributes as CubeGeometryAttributes)
                .widthSegments
            }
            onChange={(e) =>
              updateParams({
                ...entity.geometryAttributes,
                widthSegments: parseFloat(e.target.value) || 0,
              } as CubeGeometryAttributes)
            }
          />
        </div>
      </div>
      <div key="heigth_segments" className="flex">
        <span className="text-black w-[40%] text-left text-[10px]">
          heigth segments
        </span>
        <div className="flex mb-[5px]">
          <input
            key="height_segments"
            type="number"
            step="1"
            className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
            autoComplete="off"
            value={
              (entity.geometryAttributes as CubeGeometryAttributes)
                .heigthSegments
            }
            onChange={(e) =>
              updateParams({
                ...entity.geometryAttributes,
                heigthSegments: parseFloat(e.target.value) || 0,
              } as CubeGeometryAttributes)
            }
          />
        </div>
      </div>
      <div key="depth_segments" className="flex">
        <span className="text-black w-[40%] text-left text-[10px]">
          depth segments
        </span>
        <div className="flex mb-[5px]">
          <input
            key="depth_segments"
            type="number"
            step="1"
            className="border border-black rounded shadow px-1 w-[50%] text-black text-left text-[10px]"
            autoComplete="off"
            value={
              (entity.geometryAttributes as CubeGeometryAttributes)
                .depthSegments
            }
            onChange={(e) =>
              updateParams({
                ...entity.geometryAttributes,
                depthSegments: parseFloat(e.target.value) || 0,
              } as CubeGeometryAttributes)
            }
          />
        </div>
      </div>
      {showCoordsModal && (
        <SetCoordsModal
          showModalCoords={setShowCoordsModal}
          coords={coords}
          setCoords={setCoords}
        />
      )}
    </>
  );
};

export const SetCoordsModal: FC<{
  showModalCoords: Function;
  coords: string[];
  setCoords: Function;
}> = ({ showModalCoords, coords, setCoords }) => {
  const [newCoords, setNewCoords] = useState<string[]>(coords);

  const updateNewCoords = (index: number, value: string) => {
    if (/^-?\d*\.?\d{0,20}$/.test(value)) {
      const newValues = [...newCoords];
      newValues[index] = value;
      setNewCoords(newValues);
    }
  };

  return (
    <Transition appear show as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => showModalCoords(false)}
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
                  Set new coordinates
                </Dialog.Title>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="ml-2">Xmin:</label>
                      <input
                        type="number"
                        defaultValue={parseFloat(newCoords[0]).toFixed(8)}
                        required
                        onChange={(e) => updateNewCoords(0, e.target.value)}
                        className="border border-black rounded shadow p-1 w-[80%] text-black text-left"
                      />
                    </div>
                    <div>
                      <label className="ml-2">Xmax:</label>
                      <input
                        type="number"
                        defaultValue={parseFloat(newCoords[1]).toFixed(8)}
                        required
                        onChange={(e) => updateNewCoords(1, e.target.value)}
                        className="border border-black rounded shadow p-1 w-[80%] text-black text-left"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="ml-2">Ymin:</label>
                      <input
                        type="number"
                        defaultValue={parseFloat(newCoords[2]).toFixed(8)}
                        required
                        onChange={(e) => updateNewCoords(2, e.target.value)}
                        className="border border-black rounded shadow p-1 w-[80%] text-black text-left"
                      />
                    </div>
                    <div>
                      <label className="ml-2">Ymax:</label>
                      <input
                        type="number"
                        defaultValue={parseFloat(newCoords[3]).toFixed(8)}
                        required
                        onChange={(e) => updateNewCoords(3, e.target.value)}
                        className="border border-black rounded shadow p-1 w-[80%] text-black text-left"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="ml-2">Zmin:</label>
                      <input
                        type="number"
                        defaultValue={parseFloat(newCoords[4]).toFixed(8)}
                        required
                        onChange={(e) => updateNewCoords(4, e.target.value)}
                        className="border border-black rounded shadow p-1 w-[80%] text-black text-left"
                      />
                    </div>
                    <div>
                      <label className="ml-2">Zmax:</label>
                      <input
                        type="number"
                        defaultValue={parseFloat(newCoords[5]).toFixed(8)}
                        required
                        onChange={(e) => updateNewCoords(5, e.target.value)}
                        className="border border-black rounded shadow p-1 w-[80%] text-black text-left"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => showModalCoords(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => {
                      setCoords(newCoords.map(c => !isNaN(parseFloat(c)) ? c : "0"))
                      showModalCoords(false);
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
