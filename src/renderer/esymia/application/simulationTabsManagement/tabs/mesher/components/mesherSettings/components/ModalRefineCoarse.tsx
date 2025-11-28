import { Transition, Dialog } from "@headlessui/react";
import { FC, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Fragment } from "react/jsx-runtime";
import { Material } from "../../../../../../../../cad_library";
import { Project } from "../../../../../../../model/esymiaModels";
import { setPreviousMeshStatus, setMeshGenerated, setQuantum } from "../../../../../../../store/projectSlice";
import { ThemeSelector } from "../../../../../../../store/tabsAndMenuItemsSlice";

interface ModalRefineCoarseProps {
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  mode: 'refine' | 'coarsen';
  selectedProject: Project;
  quantumDimsInput: [number, number, number];
  setQuantumDimsInput: Function;
  activeMeshing: {
    selectedProject: Project;
    allMaterials: Material[];
    quantum: [number, number, number];
    meshStatus: 'Not Generated' | 'Generated';
  }[];
}

export const ModalRefineCoarse: FC<ModalRefineCoarseProps> = ({
  showModal,
  mode,
  setShowModal,
  selectedProject,
  quantumDimsInput,
  setQuantumDimsInput,
  activeMeshing,
}) => {
  const [xPercentage, setXPercentage] = useState<'No' | '10%' | '50%'>('No');
  const [yPercentage, setYPercentage] = useState<'No' | '10%' | '50%'>('No');
  const [zPercentage, setZPercentage] = useState<'No' | '10%' | '50%'>('No');

  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

  const [x, setx] = useState(quantumDimsInput[0]);
  const [y, sety] = useState(quantumDimsInput[1]);
  const [z, setz] = useState(quantumDimsInput[2]);

  const renderRadioGroup = (
    axis: string,
    value: 'No' | '10%' | '50%',
    setValue: (v: 'No' | '10%' | '50%') => void
  ) => (
    <div className="flex flex-col gap-2">
      <span className={`font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{axis.toUpperCase()} Axis</span>
      <div className="flex flex-row gap-2">
        {(['No', '10%', '50%'] as const).map((option) => (
          <div
            key={option}
            onClick={() => setValue(option)}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 border ${value === option
                ? isDark
                  ? 'bg-blue-600/30 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                  : 'bg-blue-100 border-blue-500 text-blue-700 shadow-sm'
                : isDark
                  ? 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
          >
            <span className="text-sm font-medium">{option === 'No' ? `No ${mode}` : option}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Transition appear show={showModal} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => { }}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
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
              <Dialog.Panel
                className={`w-full max-w-lg transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-2xl transition-all border ${isDark
                    ? 'bg-gray-900/90 border-white/10 text-white'
                    : 'bg-white/90 border-white/40 text-gray-900'
                  } backdrop-blur-xl`}
              >
                <Dialog.Title
                  as="h3"
                  className={`text-xl font-bold leading-6 mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  {mode === 'refine' ? 'Refine Mesh' : 'Coarsen Mesh'}
                </Dialog.Title>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Choose how to {mode === 'refine' ? 'reduce' : 'increase'} the quantum on the desired axes.
                </p>

                <div className="flex flex-col gap-6">
                  {renderRadioGroup('x', xPercentage, setXPercentage)}
                  {renderRadioGroup('y', yPercentage, setYPercentage)}
                  {renderRadioGroup('z', zPercentage, setZPercentage)}
                </div>

                <div className="flex flex-row w-full items-center justify-end gap-3 mt-8">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${isDark
                        ? 'text-gray-300 hover:text-white hover:bg-white/10'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`px-6 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${mode === 'refine'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-blue-500/25'
                        : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-purple-500/25'
                      }`}
                    onClick={() => {
                      let newQuantum: [number, number, number] = [
                        ...quantumDimsInput,
                      ];
                      if (xPercentage !== 'No') {
                        if (xPercentage === '10%') {
                          if (mode === 'refine') {
                            newQuantum[0] =
                              quantumDimsInput[0] -
                              quantumDimsInput[0] * (10 / 100);
                          } else {
                            newQuantum[0] =
                              quantumDimsInput[0] +
                              quantumDimsInput[0] * (10 / 100);
                          }
                        }
                        if (xPercentage === '50%') {
                          if (mode === 'refine') {
                            newQuantum[0] = quantumDimsInput[0] / 2;
                          } else {
                            newQuantum[0] = quantumDimsInput[0] * 2;
                          }
                        }
                      }
                      if (yPercentage !== 'No') {
                        if (yPercentage === '10%') {
                          if (mode === 'refine') {
                            newQuantum[1] =
                              quantumDimsInput[1] -
                              quantumDimsInput[1] * (10 / 100);
                          } else {
                            newQuantum[1] =
                              quantumDimsInput[1] +
                              quantumDimsInput[1] * (10 / 100);
                          }
                        }
                        if (yPercentage === '50%') {
                          if (mode === 'refine') {
                            newQuantum[1] = quantumDimsInput[1] / 2;
                          } else {
                            newQuantum[1] = quantumDimsInput[1] * 2;
                          }
                        }
                      }
                      if (zPercentage !== 'No') {
                        if (zPercentage === '10%') {
                          if (mode === 'refine') {
                            newQuantum[2] =
                              quantumDimsInput[2] -
                              quantumDimsInput[2] * (10 / 100);
                          } else {
                            newQuantum[2] =
                              quantumDimsInput[2] +
                              quantumDimsInput[2] * (10 / 100);
                          }
                        }
                        if (zPercentage === '50%') {
                          if (mode === 'refine') {
                            newQuantum[2] = quantumDimsInput[2] / 2;
                          } else {
                            newQuantum[2] = quantumDimsInput[2] * 2;
                          }
                        }
                      }
                      setQuantumDimsInput(newQuantum);
                      dispatch(
                        setPreviousMeshStatus({
                          status: selectedProject.meshData.meshGenerated as
                            | 'Not Generated'
                            | 'Generated',
                          projectToUpdate:
                            selectedProject.id as string,
                        }),
                      );
                      dispatch(
                        setMeshGenerated({
                          status:
                            activeMeshing.length > 0
                              ? 'Queued'
                              : 'Generating',
                          projectToUpdate:
                            selectedProject.id as string,
                        }),
                      );
                      dispatch(
                        setQuantum({
                          quantum: newQuantum,
                          projectToUpdate:
                            selectedProject.id as string,
                        }),
                      );
                      setXPercentage('No');
                      setYPercentage('No');
                      setZPercentage('No');
                      setShowModal(false);
                    }}
                  >
                    {mode === 'refine' ? 'Refine' : 'Coarsen'}
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