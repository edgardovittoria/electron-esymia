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
> = ({toggleEditInputsSlider}) => {
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
                          ).then(() => {dispatch(setShowSaveProjectResultsModal(false))})
                        })
                      }

  return (
    <>
      {/* eslint-disable-next-line react/jsx-no-undef */}
      <Transition appear show={true} as={Fragment}>
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
                    Do you want to save previous results?
                  </Dialog.Title>
                  <hr className="mt-2 mb-3" />
                  <div className="flex flex-col">
                    <div className="p-2">
                      <h6>New project's name</h6>
                      <input
                        type="text"
                        data-testid="projectName"
                        className={`formControl ${
                          theme === 'light'
                            ? 'bg-gray-100 text-textColor'
                            : 'bg-bgColorDark text-textColorDark'
                        }  rounded p-2 w-full mt-3`}
                        placeholder="Project's Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      className="button bg-gray-500 text-white"
                      onClick={() =>{
                        toggleEditInputsSlider()
                        dispatch(setShowSaveProjectResultsModal(false))
                      }
                    }
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="button bg-red-500 text-black"
                      onClick={() => {
                        removePreviousResults(selectedProject as Project, dispatch)
                      }}
                    >
                      Discard results
                    </button>
                    <button
                      type="button"
                      className={`button buttonPrimary ${
                        theme === 'light'
                          ? ''
                          : 'bg-secondaryColorDark text-textColor'
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
                        <ImSpinner className="z-50 top-3 bottom-1/2 animate-spin w-5 h-5" />
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

    /* <Modal show={true} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>CREATE NEW PROJECT</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-grid">
                    <div className="p-2">
                        <h6>Insert Project's Name</h6>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Project's Name"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}/>
                    </div>
                    <div className="p-2">
                        <h6>Insert Project's Description</h6>
                        <textarea
                            className="form-control"
                            placeholder="Project's Description"
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}/>
                    </div>
                </div>

            </Modal.Body>
            <Modal.Footer>
                <button className="button btn-secondary" onClick={handleClose}>
                    CLOSE
                </button>
                <button className="button buttonPrimary" onClick={handleCreate}>
                    CREATE
                </button>
            </Modal.Footer>
        </Modal>*/
  );
};
