import { FC, Fragment, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  TransformationParamDetails,
  TransformationParams,
  updateTransformationParams,
} from '../../../../../cad_library';
import { Transition, Dialog, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react';
import { ThemeSelector } from '../../../../../esymia/store/tabsAndMenuItemsSlice';

export const Transformations: FC<{
  transformationParams: TransformationParams;
}> = ({ transformationParams }) => {
  const dispatch = useDispatch();
  const [showTransformationModal, setShowTransformationModal] =
    useState<boolean>(false);
  const theme = useSelector(ThemeSelector);

  return (
    <div className="flex flex-col gap-3">
      <div className={`grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
        <div className="text-left pl-1">Axis</div>
        <div>X</div>
        <div>Y</div>
        <div>Z</div>
      </div>

      <div className="grid grid-cols-4 gap-2 items-center">
        <span className={`text-xs font-medium text-left pl-1 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Position</span>
        {transformationParams.position.map((paramValue, index) => (
          <input
            key={`pos-${index}`}
            disabled
            type="number"
            step="0.1"
            className={`w-full border rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:border-blue-500 transition-colors ${theme === 'light' ? 'bg-white border-gray-200 text-gray-700' : 'bg-black/20 border-white/10 text-gray-200'}`}
            autoComplete="off"
            value={paramValue.toFixed(2)}
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

      <div className="grid grid-cols-4 gap-2 items-center">
        <span className={`text-xs font-medium text-left pl-1 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Rotation</span>
        {transformationParams.rotation.map((paramValue, index) => (
          <input
            key={`rot-${index}`}
            disabled
            type="number"
            step="1"
            className={`w-full border rounded px-1 py-0.5 text-xs text-center focus:outline-none focus:border-blue-500 transition-colors ${theme === 'light' ? 'bg-white border-gray-200 text-gray-700' : 'bg-black/20 border-white/10 text-gray-200'}`}
            autoComplete="off"
            value={((paramValue * 180) / Math.PI).toFixed(0)}
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
        ))}
      </div>

      <button
        type="button"
        className={`mt-2 w-full py-1.5 px-3 text-white text-xs font-medium rounded-lg shadow-sm transition-all duration-200 ${theme === 'light' ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white/10 hover:bg-white/20'}`}
        onClick={() => setShowTransformationModal(true)}
      >
        Edit Transformations
      </button>
      {showTransformationModal && (
        <SetTransformationParamsModal
          showTransformationModal={setShowTransformationModal}
          transformationParams={transformationParams}
        />
      )}
    </div>
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
  const theme = useSelector(ThemeSelector);

  const updateNewPositionCoord = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9.-]/g, '');

    let finalValue;
    if (numericValue === '') {
      // Se la stringa è vuota, potresti voler impostare lo stato a 0 o null
      finalValue = '0'; // O la logica che preferisci
    } else {
      // Converte la stringa numerica in un float
      finalValue = numericValue;
    }
    if (/^-?\d*\.?\d{0,6}$/.test(finalValue)) {
      const newValues = [...newPosition];
      newValues[index] = finalValue;
      setNewPosition(newValues);
    }
  };

  const updateNewRotation = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9.-]/g, '');

    let finalValue;
    if (numericValue === '') {
      // Se la stringa è vuota, potresti voler impostare lo stato a 0 o null
      finalValue = '0'; // O la logica che preferisci
    } else {
      // Converte la stringa numerica in un float
      finalValue = numericValue;
    }
    if (/^-?\d*\.?\d{0,6}$/.test(finalValue)) {
      const newValues = [...newRotation];
      newValues[index] = finalValue;
      setNewRotation(newValues);
    }
  };


  // 2. Nella funzione handlePaste:
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    // ... Logica di estrazione del testo e update ...
    const pastedText = e.clipboardData.getData('text/plain');
    updateNewPositionCoord(0, pastedText);

    // 🛑 AGGIUNGI QUESTO LOG DI SICUREZZA
    console.log('Tentativo di Paste su X eseguito. Valore:', pastedText);
  };

  return (
    <Transition appear show as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => showTransformationModal(false)}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className={`w-full max-w-md transform overflow-hidden rounded-2xl backdrop-blur-md border p-6 text-left align-middle shadow-xl transition-all ${theme === 'light' ? 'bg-white/90 border-gray-200' : 'bg-black/80 border-white/10'}`}>
                <DialogTitle
                  as="h3"
                  className={`text-lg font-medium leading-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
                >
                  Set Transformation Parameters
                </DialogTitle>
                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Position</h4>
                    <div className="flex gap-2">
                      {['X', 'Y', 'Z'].map((axis, i) => (
                        <div key={`pos-input-${i}`} className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 mb-1 ml-1">{axis}</label>
                          <input
                            type="text"
                            value={newPosition[i]}
                            onChange={(e) => updateNewPositionCoord(i, e.target.value)}
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Rotation (Degrees)</h4>
                    <div className="flex gap-2">
                      {['X', 'Y', 'Z'].map((axis, i) => (
                        <div key={`rot-input-${i}`} className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 mb-1 ml-1">{axis}</label>
                          <input
                            type="text"
                            value={newRotation[i]}
                            onChange={(e) => updateNewRotation(i, e.target.value)}
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === 'light' ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-white/5 border-white/10 text-white'}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${theme === 'light' ? 'text-gray-700 bg-gray-100 hover:bg-gray-200' : 'text-gray-300 bg-white/10 hover:bg-white/20'}`}
                    onClick={() => showTransformationModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/30 transition-all focus:outline-none"
                    onClick={() => {
                      let newPos: TransformationParamDetails = newPosition.map(
                        (p) => (isNaN(parseFloat(p)) ? '0' : parseFloat(p)),
                      ) as TransformationParamDetails;
                      let newRot: TransformationParamDetails = newRotation.map(
                        (r) => {
                          if (isNaN(parseFloat(r))) return 0;
                          if (parseFloat(r) > 180) return (180 * Math.PI) / 180;
                          if (parseFloat(r) < -180)
                            return (-180 * Math.PI) / 180;
                          return (parseFloat(r) * Math.PI) / 180;
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
                    Save Changes
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
