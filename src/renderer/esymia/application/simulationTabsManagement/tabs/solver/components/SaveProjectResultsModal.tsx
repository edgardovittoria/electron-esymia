import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  setShowSaveProjectResultsModal,
  ThemeSelector,
  unsetSolverResults,
} from '../../../../../store/tabsAndMenuItemsSlice';
import { useDynamoDBQuery } from '../../../../../../dynamoDB/hook/useDynamoDBQuery';
import {
  deleteSimulation,
  SelectedFolderSelector,
  selectedProjectSelector,
  setMeshApproved,
} from '../../../../../store/projectSlice';
import { useStorageData } from '../../mesher/components/rightPanelSimulator/hook/useStorageData';
import { ImSpinner } from 'react-icons/im';
import { Folder, Project } from '../../../../../model/esymiaModels';
import { deleteFileS3 } from '../../../../../aws/mesherAPIs';
import { createOrUpdateProjectInDynamoDB } from '../../../../../../dynamoDB/projectsFolderApi';
import { Dispatch } from '@reduxjs/toolkit';

interface SaveProjectResultsModalProps {
  toggleEditInputsSlider: Function
}

export const SaveProjectResultsModal: React.FC<
  SaveProjectResultsModalProps
> = ({ toggleEditInputsSlider }) => {
  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedFolder = useSelector(SelectedFolderSelector);

  const { execQuery2 } = useDynamoDBQuery();

  const [projectName, setProjectName] = useState(
    selectedProject?.name + '_results',
  );
  const { cloneProjectToSaveResults } = useStorageData();
  const [cloning, setcloning] = useState<boolean>(false);
  const removePreviousResults = (selectedProject: Project, dispatch: Dispatch) => {
    dispatch(
      deleteSimulation(
        selectedProject.id as string,
      ),
    );
    dispatch(unsetSolverResults())
    dispatch(
      setMeshApproved({
        approved: false,
        projectToUpdate:
          selectedProject?.id as string,
      }),
    );
    deleteFileS3(selectedProject.simulation?.resultS3 as string).then(() => {
      execQuery2(
        createOrUpdateProjectInDynamoDB,
        {
          ...selectedProject,
          simulation: undefined,
          meshData: {
            ...selectedProject?.meshData,
            meshApproved: false,
          },
        } as Project,
        dispatch,
      ).then(() => { dispatch(setShowSaveProjectResultsModal(false)) })
    })
  }

  return (
    <>
      <Transition appear show={true} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => { }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
                  className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-2xl transition-all backdrop-blur-md border ${theme === 'light'
                      ? 'bg-white/90 border-white/40 text-gray-800'
                      : 'bg-black/60 border-white/10 text-gray-200'
                    }`}
                >
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 mb-4"
                  >
                    Do you want to save previous results?
                  </Dialog.Title>

                  <div className="flex flex-col gap-4">
                    <div>
                      <h6 className="text-sm font-medium opacity-80 mb-2">New project's name</h6>
                      <input
                        type="text"
                        data-testid="projectName"
                        className={`w-full p-3 rounded-xl outline-none transition-all ${theme === 'light'
                            ? 'bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            : 'bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
                          }`}
                        placeholder="Project's Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-3">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${theme === 'light'
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      onClick={() => {
                        toggleEditInputsSlider()
                        dispatch(setShowSaveProjectResultsModal(false))
                      }
                      }
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all duration-300"
                      onClick={() => {
                        removePreviousResults(selectedProject as Project, dispatch)
                      }}
                    >
                      Discard results
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${theme === 'light'
                          ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30'
                          : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={(process.env.APP_VERSION === 'demo' && selectedFolder?.projectList.length === 3)}
                      onClick={() => {
                        setcloning(true)
                        cloneProjectToSaveResults(
                          selectedProject as Project,
                          selectedFolder as Folder,
                          setcloning,
                          removePreviousResults,
                          projectName
                        );
                      }}
                    >
                      <span>Save results</span>
                      {cloning && (
                        <ImSpinner className="animate-spin w-4 h-4" />
                      )}
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
