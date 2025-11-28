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
          quantum: [0, 0, 0],
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
        <Dialog as='div' className='relative z-10' onClose={() => { }}>
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
                  className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-2xl transition-all backdrop-blur-md ${theme === 'light'
                    ? 'bg-white/90 border border-white/40'
                    : 'bg-black/80 border border-white/10'
                    }`}>
                  <Dialog.Title
                    as='h3'
                    className={`text-lg font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
                  >
                    Create New Project
                  </Dialog.Title>

                  {user.email ?
                    <div className='flex flex-col gap-6'>
                      <div className='flex flex-col gap-2'>
                        <span className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                          Project Name
                        </span>
                        <input
                          type='text'
                          data-testid="projectName"
                          className={`w-full rounded-xl px-4 py-3 outline-none transition-all duration-200 ${theme === 'light'
                            ? 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 placeholder-gray-400'
                            : 'bg-black/40 border border-white/10 text-white focus:border-green-500/50 focus:bg-black/60 placeholder-gray-500'
                            }`}
                          placeholder="Enter project name"
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className='flex flex-col gap-2'>
                        <span className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                          Description
                        </span>
                        <textarea
                          className={`w-full h-32 rounded-xl px-4 py-3 outline-none transition-all duration-200 resize-none ${theme === 'light'
                            ? 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-100 placeholder-gray-400'
                            : 'bg-black/40 border border-white/10 text-white focus:border-green-500/50 focus:bg-black/60 placeholder-gray-500'
                            }`}
                          data-testid="projectDescription"
                          placeholder="Enter project description (optional)"
                          value={projectDescription}
                          onChange={(e) => setProjectDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    :
                    <div className='flex flex-col items-center justify-center py-8 text-center'>
                      <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        Please login first in order to create a new project.
                      </p>
                    </div>
                  }

                  <div className='mt-8 flex justify-end gap-3'>
                    <button
                      type='button'
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${theme === 'light'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      onClick={() => dispatch(setShowCreateNewProjectModal(false))}
                    >
                      Cancel
                    </button>
                    {user.email &&
                      <button
                        type='button'
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${theme === 'light'
                          ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-green-500/30'
                          : 'bg-green-600 text-white hover:bg-green-500 hover:shadow-green-500/20'
                          }`}
                        onClick={handleCreate}
                      >
                        Create Project
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
  );
};
