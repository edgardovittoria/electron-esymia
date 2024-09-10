import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ImSpinner } from 'react-icons/im';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { SearchUser } from './components/SearchUser';
import {
  addProject,
  shareFolder,
  shareProject
} from '../../../../../../../store/projectSlice';
import {
  addIDInFolderProjectsList,
  createSimulationProjectInFauna,
  recursiveUpdateSharingInfoFolderInFauna,
  updateProjectInFauna
} from '../../../../../../../faunadb/projectsFolderAPIs';
import {
  Folder,
  MeshData,
  Port,
  Probe,
  Project,
  sharingInfoUser,
  TempLumped,
} from '../../../../../../../model/esymiaModels';
import { convertInFaunaProjectThis } from '../../../../../../../faunadb/apiAuxiliaryFunctions';
import toast from 'react-hot-toast';
import { addProjectTab, setShowCreateNewProjectModal } from '../../../../../../../store/tabsAndMenuItemsSlice';
import { useFaunaQuery } from '../../../../../../../faunadb/hook/useFaunaQuery';
import { CanvasState, UsersState, usersStateSelector } from '../../../../../../../../cad_library';

interface SearchUserAndShareProps {
  setShowSearchUser: (v: boolean) => void;
  projectToShare?: Project;
  folderToShare?: Folder;
}

export const SearchUserAndShare: React.FC<SearchUserAndShareProps> = ({
  setShowSearchUser,
  folderToShare,
  projectToShare,
}) => {
  const [users, setUsers] = useState<string[]>([]);
  const [shareDone, setShareDone] = useState<boolean>(false);
  const { execQuery } = useFaunaQuery();
  const [selected, setSelected] = useState('');
  const [query, setQuery] = useState('');
  const [spinner, setSpinner] = useState(true);
  useEffect(() => {
    const usersList: string[] = [];
    setSpinner(true);
    axios.post(
      'https://dev-i414-g1x.us.auth0.com/oauth/token',
      {
        'client_id': process.env.REACT_APP_AUTH0_MANAGEMENT_CLIENT_ID,
        'client_secret': process.env.REACT_APP_AUTH0_MANAGEMENT_CLIENT_SECRET,
        'audience': 'https://dev-i414-g1x.us.auth0.com/api/v2/',
        'grant_type': 'client_credentials'
      },
      {
        headers: {
          'content-type': 'application/json'
        }
      }
    ).then(response => {
      axios
      .get(`https://dev-i414-g1x.us.auth0.com/api/v2/roles`, {
        // headers: {authorization: `Bearer ${response.data.access_token}`}
        headers: {
          authorization: `Bearer ${response.data.access_token}`,
        },
      })
      .then((res) => {
        res.data
          .filter((r: { name: string }) => r.name === 'Premium')
          .forEach((role: { id: string }) => {
            axios
              .get(
                `https://dev-i414-g1x.us.auth0.com/api/v2/roles/${role.id}/users`,
                {
                  // headers: {authorization: `Bearer ${response.data.access_token}`}
                  headers: {
                    authorization: `Bearer ${response.data.access_token}`,
                  },
                },
              )
              .then((res) => {
                // console.log(res.data)
                res.data.forEach((u: { name: string }) => {
                  usersList.push(u.name);
                });
                setUsers(usersList);
                setSpinner(false);
              })
              .catch((err) => console.log(err));
          });
      })
      .catch((err) => console.log(err));
    })
  }, []);

  const dispatch = useDispatch();
  const user = useSelector(usersStateSelector);

  useEffect(() => {
    if (shareDone) {
      execQuery(recursiveUpdateSharingInfoFolderInFauna, folderToShare, dispatch)
        .then(() => {
          setShowSearchUser(false);
          toast.success('Sharing Successful!');
        })
        .catch((err) => {
          setShowSearchUser(false);
          toast.error('Sharing Failed!! Please try again!');
        });
    }
  }, [folderToShare?.sharedWith]);

  const filteredPeople: string[] =
    query === ''
      ? users.filter((p) => p !== user.email)
      : users
          .filter((p) => p !== user.email)
          .filter((person) =>
            person
              .toLowerCase()
              .replace(/\s+/g, '')
              .includes(query.toLowerCase().replace(/\s+/g, '')),
          );

  return (
    <Transition appear show as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => setShowSearchUser(false)}
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
              <div className="w-1/5 bg-white rounded-lg p-5 shadow-2xl">
                <h5>Share Project</h5>
                <hr className="mb-10" />
                {spinner ? (
                  <div className="flex justify-center items-center">
                    <ImSpinner className="animate-spin w-8 h-8" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center">
                      <span className="w-1/3">Share with:</span>
                      <SearchUser
                        selected={selected}
                        setSelected={setSelected}
                        filteredPeople={filteredPeople}
                        query={query}
                        setQuery={setQuery}
                      />
                    </div>
                    <div className="mt-10 flex justify-between">
                      <button
                        type="button"
                        className="button bg-red-500 py-1 px-2 text-white text-sm"
                        onClick={() => setShowSearchUser(false)}
                      >
                        CANCEL
                      </button>
                      <button
                        type="button"
                        className="button buttonPrimary py-1 px-2 text-sm"
                        onClick={() => {
                          setShareDone(true);
                          let newProject: Project = {
                            faunaDocumentId: projectToShare?.faunaDocumentId,
                            description: projectToShare?.description as string,
                            frequencies: projectToShare?.frequencies,
                            meshData: projectToShare?.meshData as MeshData,
                            model: projectToShare?.model as CanvasState,
                            modelS3: projectToShare?.modelS3,
                            name: projectToShare?.name as string,
                            owner: projectToShare?.owner as UsersState,
                            parentFolder: projectToShare?.parentFolder as string,
                            ports: projectToShare?.ports as (Port | Probe | TempLumped)[],
                            screenshot: undefined,
                            storage: projectToShare?.storage as "local" | "online",
                            simulation: undefined,
                            sharedWith: [
                              ...(projectToShare?.sharedWith as sharingInfoUser[]),
                              {
                                userEmail: selected,
                                read: true,
                                write: true,
                              } as sharingInfoUser,
                            ],
                          }
                          execQuery(createSimulationProjectInFauna, newProject, dispatch).then((res: any) => {
                            newProject = {
                              ...newProject,
                              faunaDocumentId: res.id
                            } as Project;
                          }).then(() => {
                            setShowSearchUser(false);
                            toast.success('Sharing Successful!!');
                          })
                            .catch((err) => {
                              setShowSearchUser(false);
                              toast.error(
                                'Sharing Failed!! Please try again!',
                              );
                            });
                          /* if (projectToShare) {
                            dispatch(
                              shareProject({
                                projectToShare,
                                user: {
                                  userEmail: selected,
                                  read: true,
                                  write: true,
                                },
                              }),
                            );
                            execQuery(
                              updateProjectInFauna,
                              convertInFaunaProjectThis({
                                ...projectToShare,
                                sharedWith: [
                                  ...(projectToShare.sharedWith as sharingInfoUser[]),
                                  {
                                    userEmail: selected,
                                    read: true,
                                    write: true,
                                  } as sharingInfoUser,
                                ],
                              }),
                            )
                              .then(() => {
                                setShowSearchUser(false);
                                toast.success('Sharing Successful!!');
                              })
                              .catch((err) => {
                                setShowSearchUser(false);
                                toast.error(
                                  'Sharing Failed!! Please try again!',
                                );
                              });
                          } else  */if (folderToShare) {
                            dispatch(
                              shareFolder({
                                folderToShare:
                                  folderToShare.faunaDocumentId as string,
                                user: {
                                  userEmail: selected,
                                  read: true,
                                  write: true,
                                },
                              }),
                            );
                          }
                        }}
                      >
                        SHARE
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
