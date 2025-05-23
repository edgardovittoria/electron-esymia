import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  addProject,
  SelectedFolderSelector
} from '../../store/projectSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  addProjectTab,
  setShowCreateNewProjectModal,
  ThemeSelector
} from '../../store/tabsAndMenuItemsSlice';
import { Project, sharingInfoUser } from '../../model/esymiaModels';
import toast from 'react-hot-toast';
import { CanvasState, UsersState, usersStateSelector } from '../../../cad_library';
import { useDynamoDBQuery } from '../../../dynamoDB/hook/useDynamoDBQuery';
import { createOrUpdateProjectInDynamoDB, addIDInProjectListInDynamoDB } from '../../../dynamoDB/projectsFolderApi';

interface CreateNewProjectModalProps {
}

export const CreateNewProjectModal: React.FC<CreateNewProjectModalProps> = ({

                                                                            }) => {
  const dispatch = useDispatch();

  const user = useSelector(usersStateSelector);
  const selectedFolder = useSelector(SelectedFolderSelector);
  const theme = useSelector(ThemeSelector)

  const { execQuery2 } = useDynamoDBQuery();

  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleCreate = () => {
    if (projectName.length > 0) {
      let newProject: Project = {
        id: crypto.randomUUID(),
        storage: process.env.STORAGE_MODE as string as ('local' | 'online'),
        name: projectName,
        description: projectDescription,
        model: {} as CanvasState,
        ports: [],
        frequencies: [],
        meshData: {
          meshApproved: false,
          meshGenerated: 'Not Generated',
          quantum: [0,0,0],
          pathToExternalGridsNotFound: false,
          validTopology: true,
          type: 'Standard',
          lambdaFactor: 40
        },
        screenshot: undefined,
        owner: (selectedFolder?.owner.email === user.email) ? user : selectedFolder?.owner as UsersState,
        ownerEmail: user.email as string,
        sharedWith: (selectedFolder?.id === 'root') ? [] as sharingInfoUser[] : selectedFolder?.sharedWith as sharingInfoUser[],
        parentFolder: selectedFolder?.id as string
      };
      execQuery2(createOrUpdateProjectInDynamoDB, newProject, dispatch).then((res: any) => {
        (selectedFolder?.id !== 'root') && execQuery2(
          addIDInProjectListInDynamoDB,
          newProject.id,
          selectedFolder
        );
        dispatch(addProject(newProject));
        dispatch(addProjectTab(newProject));
        dispatch(setShowCreateNewProjectModal(false))
      });
    } else {
      toast.error('Project\'s name is required!')
    }
  };

  return (
    <>
      {/* eslint-disable-next-line react/jsx-no-undef */}
      <Transition appear show={true} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto' data-testid="createNewProjectModal">
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel
                  className={`w-full max-w-md transform overflow-hidden rounded-2xl ${theme === 'light' ? 'bg-white text-textColor' : 'bg-bgColorDark2 text-textColorDark '} p-6 text-left align-middle shadow-xl transition-all`}>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 '
                  >
                    CREATE NEW PROJECT
                  </Dialog.Title>
                  <hr className='mt-2 mb-3' />
                  {user.email ?
                    <div className='flex flex-col'>
                      <div className='p-2'>
                        <h6>Insert Project's Name</h6>
                        <input
                          type='text'
                          data-testid="projectName"
                          className={`formControl ${theme === 'light' ? 'bg-gray-100 text-textColor' : 'bg-bgColorDark text-textColorDark'}  rounded p-2 w-full mt-3`}
                          placeholder="Project's Name"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                        />
                      </div>
                      <div className='p-2'>
                        <h6>Insert Project's Description</h6>
                        <textarea
                          className={`formControl h-[100px] ${theme === 'light' ? 'bg-gray-100 text-textColor' : 'bg-bgColorDark text-textColorDark'}  rounded p-2 w-full mt-3`}
                          data-testid="projectDescription"
                          placeholder="Project's Description"
                          value={projectDescription}
                          onChange={(e) => setProjectDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    :
                    <div className='flex flex-col'>
                      <div className='p-2'>
                        <h6>Please login first in order to create a new project.</h6>
                      </div>
                    </div>
                  }

                  <div className='mt-4 flex justify-between'>
                    <button
                      type='button'
                      className='button bg-red-500 text-white'
                      onClick={() => dispatch(setShowCreateNewProjectModal(false))}
                    >
                      CANCEL
                    </button>
                    {user.email &&
                      <button
                        type='button'
                        className={`button buttonPrimary ${theme === 'light' ? '' : 'bg-secondaryColorDark text-textColor'}`}
                        onClick={handleCreate}
                      >
                        CREATE
                      </button>
                    }
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
