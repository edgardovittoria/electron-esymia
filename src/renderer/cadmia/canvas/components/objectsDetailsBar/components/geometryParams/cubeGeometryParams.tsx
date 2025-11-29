import { FC, Fragment, useEffect, useState } from 'react';
import { GeometryParamsGeneralProps } from './geometryParams';
import { useDispatch, useSelector } from 'react-redux';
import {
  CubeGeometryAttributes,
  TransformationParamDetails,
  updateTransformationParams,
} from '../../../../../../cad_library';
import { Transition, Dialog } from '@headlessui/react';
import { ThemeSelector } from '../../../../../../esymia/store/tabsAndMenuItemsSlice';

export const CubeGeometryParams: FC<GeometryParamsGeneralProps> = ({
  entity,
  updateParams,
}) => {
  const dispatch = useDispatch();
  const [showCoordsModal, setShowCoordsModal] = useState<boolean>(false);
  const [updatePositionCoordsFlag, setUpdatePositionCoordsFlag] =
    useState<boolean>(true);
  const theme = useSelector(ThemeSelector);

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
    } else {
      setUpdatePositionCoordsFlag(true)
    }
  }, [entity.transformationParams.position]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {['X', 'Y', 'Z'].map((axis, i) => (
          <Fragment key={axis}>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium w-8 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{axis}min</span>
              <input
                disabled
                type="number"
                step="0.1"
                className={`w-full border rounded px-1 py-0.5 text-xs text-center ${theme === 'light' ? 'bg-white border-gray-200 text-gray-700' : 'bg-black/20 border-white/10 text-gray-200'}`}
                value={parseFloat(coords[i * 2]).toFixed(2)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium w-8 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{axis}max</span>
              <input
                disabled
                type="number"
                step="0.1"
                className={`w-full border rounded px-1 py-0.5 text-xs text-center ${theme === 'light' ? 'bg-white border-gray-200 text-gray-700' : 'bg-black/20 border-white/10 text-gray-200'}`}
                value={parseFloat(coords[i * 2 + 1]).toFixed(2)}
              />
            </div>
          </Fragment>
        ))}
      </div>

      <button
        type="button"
        className={`w-full py-1.5 px-3 text-white text-xs font-medium rounded-lg shadow-sm transition-all duration-200 ${theme === 'light' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white/10 hover:bg-white/20'}`}
        onClick={() => setShowCoordsModal(true)}
      >
        Edit Coordinates
      </button>

      <div className={`border-t pt-3 mt-1 space-y-2 ${theme === 'light' ? 'border-gray-200' : 'border-white/10'}`}>
        <h6 className={`text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Segments</h6>
        {[
          { label: 'Width', value: (entity.geometryAttributes as CubeGeometryAttributes).widthSegments, key: 'widthSegments' },
          { label: 'Height', value: (entity.geometryAttributes as CubeGeometryAttributes).heigthSegments, key: 'heigthSegments' },
          { label: 'Depth', value: (entity.geometryAttributes as CubeGeometryAttributes).depthSegments, key: 'depthSegments' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <span className={`text-xs ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>{item.label}</span>
            <input
              type="number"
              step="1"
              className={`w-16 border rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:border-blue-500 transition-colors ${theme === 'light' ? 'bg-white border-gray-200 text-gray-700' : 'bg-black/20 border-white/10 text-gray-200'}`}
              value={item.value}
              onChange={(e) =>
                updateParams({
                  ...entity.geometryAttributes,
                  [item.key]: parseFloat(e.target.value) || 0,
                } as CubeGeometryAttributes)
              }
            />
          </div>
        ))}
      </div>

      {showCoordsModal && (
        <SetCoordsModal
          showModalCoords={setShowCoordsModal}
          coords={coords}
          setCoords={setCoords}
        />
      )}
    </div>
  );
};

export const SetCoordsModal: FC<{
  showModalCoords: Function;
  coords: string[];
  setCoords: Function;
}> = ({ showModalCoords, coords, setCoords }) => {
  const [newCoords, setNewCoords] = useState<string[]>(coords);
  const theme = useSelector(ThemeSelector);

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
        className="relative z-50"
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-2xl backdrop-blur-md border p-6 text-left align-middle shadow-xl transition-all ${theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-black/80 border-white/10'}`}>
                <Dialog.Title
                  as="h3"
                  className={`text-lg font-medium leading-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
                >
                  Set New Coordinates
                </Dialog.Title>
                <div className="mt-6 space-y-4">
                  {['X', 'Y', 'Z'].map((axis, i) => (
                    <div key={axis} className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 ml-1">{axis}min</label>
                        <input
                          type="number"
                          defaultValue={parseFloat(newCoords[i * 2]).toFixed(8)}
                          required
                          onChange={(e) => updateNewCoords(i * 2, e.target.value)}
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-400 mb-1 ml-1">{axis}max</label>
                        <input
                          type="number"
                          defaultValue={parseFloat(newCoords[i * 2 + 1]).toFixed(8)}
                          required
                          onChange={(e) => updateNewCoords(i * 2 + 1, e.target.value)}
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${theme === 'light' ? 'text-gray-700 bg-gray-100 hover:bg-gray-200' : 'text-gray-300 bg-white/10 hover:bg-white/20'}`}
                    onClick={() => showModalCoords(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/30 transition-all focus:outline-none"
                    onClick={() => {
                      setCoords(newCoords.map(c => !isNaN(parseFloat(c)) ? c : "0"))
                      showModalCoords(false);
                    }}
                  >
                    Save Changes
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
