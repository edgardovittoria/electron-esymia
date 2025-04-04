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

  const [x, setx] = useState(quantumDimsInput[0]);
  const [y, sety] = useState(quantumDimsInput[1]);
  const [z, setz] = useState(quantumDimsInput[2]);

  return (
    <Transition appear show={showModal} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => {}}>
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

        <div className="fixed inset-0 overflow-y-auto" data-testid="alert">
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
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {mode.toUpperCase()}
                </Dialog.Title>
                <hr className="mt-2 mb-3" />
                <div className="p-2 flex flex-col gap-4">
                  <span>
                    Choose how to {mode === 'refine' ? 'reduce' : 'increase'}{' '}
                    the quantum on the desired axes
                  </span>
                  {/* <div className="flex flex-row justify-between">
                    <input type="number" name="x" id="x" defaultValue={x} onChange={(e) => setx(parseFloat(e.target.value))}/>
                    <input type="number" name="y" id="y" defaultValue={y} onChange={(e) => sety(parseFloat(e.target.value))}/>
                    <input type="number" name="x" id="z" defaultValue={z} onChange={(e) => setz(parseFloat(e.target.value))}/>
                  </div>
                  <button onClick={() => {
                    setQuantumDimsInput([x,y,z]);
                    dispatch(
                      setPreviousMeshStatus({
                        status: selectedProject.meshData.meshGenerated as
                          | 'Not Generated'
                          | 'Generated',
                        projectToUpdate:
                          selectedProject.faunaDocumentId as string,
                      }),
                    );
                    dispatch(
                      setMeshGenerated({
                        status:
                          activeMeshing.length > 0
                            ? 'Queued'
                            : 'Generating',
                        projectToUpdate:
                          selectedProject.faunaDocumentId as string,
                      }),
                    );
                    dispatch(
                      setQuantum({
                        quantum: [x,y,z],
                        projectToUpdate:
                          selectedProject.faunaDocumentId as string,
                      }),
                    );
                    setShowModal(false);
                  }}>Generate Mesh</button> */}
                  <div className="flex flex-row gap-4">
                    <span className="font-semibold">X: </span>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-10"
                        className="radio radio-sm checked:bg-green-800"
                        checked={xPercentage === 'No'}
                        onChange={() => setXPercentage('No')}
                      />
                      <span>No {mode}</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-10"
                        className="radio radio-sm checked:bg-green-800"
                        checked={xPercentage === '10%'}
                        onChange={() => setXPercentage('10%')}
                      />
                      <span>10%</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-10"
                        className="radio radio-sm checked:bg-green-800"
                        checked={xPercentage === '50%'}
                        onChange={() => setXPercentage('50%')}
                      />
                      <span>50%</span>
                    </div>
                  </div>
                  <div className="flex flex-row gap-4">
                    <span className="font-semibold">Y: </span>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-11"
                        className="radio radio-sm checked:bg-green-800"
                        checked={yPercentage === 'No'}
                        onChange={() => setYPercentage('No')}
                      />
                      <span>No {mode}</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-11"
                        className="radio radio-sm checked:bg-green-800"
                        checked={yPercentage === '10%'}
                        onChange={() => setYPercentage('10%')}
                      />
                      <span>10%</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-11"
                        className="radio radio-sm checked:bg-green-800"
                        checked={yPercentage === '50%'}
                        onChange={() => setYPercentage('50%')}
                      />
                      <span>50%</span>
                    </div>
                  </div>
                  <div className="flex flex-row gap-4">
                    <span className="font-semibold">Z: </span>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-12"
                        className="radio radio-sm checked:bg-green-800"
                        checked={zPercentage === 'No'}
                        onChange={() => setZPercentage('No')}
                      />
                      <span>No {mode}</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-12"
                        className="radio radio-sm checked:bg-green-800"
                        checked={zPercentage === '10%'}
                        onChange={() => setZPercentage('10%')}
                      />
                      <span>10%</span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <input
                        type="radio"
                        name="radio-12"
                        className="radio radio-sm checked:bg-green-800"
                        checked={zPercentage === '50%'}
                        onChange={() => setZPercentage('50%')}
                      />
                      <span>50%</span>
                    </div>
                  </div>
                  <div className="flex flex-row w-full items-center justify-between mt-4">
                    <button
                      type="button"
                      className="button bg-red-500 text-white"
                      onClick={() => setShowModal(false)}
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      className={`button buttonPrimary ${
                        theme === 'light'
                          ? ''
                          : 'bg-secondaryColorDark text-textColor'
                      } text-white`}
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
                      {mode.toUpperCase()}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};