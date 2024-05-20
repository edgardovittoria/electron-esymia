import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ImSpinner } from 'react-icons/im';
import { useDispatch, useSelector } from 'react-redux';
import { FaunaCadModel, useFaunaQuery, usersStateSelector } from 'cad-library';
import axios from 'axios';
import toast from 'react-hot-toast';
import { SearchUser } from './components/SearchUser';
import { updateModelInFauna } from '../../../../faunaDB/functions';
import { updateModel } from '../../../../store/modelSlice';
import { FaUserCheck } from 'react-icons/fa';

interface SearchUserAndShareProps {
  setShowSearchUser: (v: boolean) => void;
  modelToShare: FaunaCadModel;
}

export const SearchUserAndShare: React.FC<SearchUserAndShareProps> = ({
  setShowSearchUser,
  modelToShare,
}) => {
  const [users, setUsers] = useState<string[]>([]);
  const { execQuery } = useFaunaQuery();
  const [selected, setSelected] = useState('');
  const [query, setQuery] = useState('');
  const [spinner, setSpinner] = useState(true);
  useEffect(() => {
    const usersList: string[] = [];
    setSpinner(true);
    axios
      .get(`https://dev-i414-g1x.us.auth0.com/api/v2/roles`, {
        // headers: {authorization: `Bearer ${process.env.REACT_APP_AUTH0_MANAGEMENT_API_ACCESS_TOKEN}`}
        headers: {
          authorization: `Bearer ${process.env.REACT_APP_AUTH0_MANAGEMENT_API_ACCESS_TOKEN}`,
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
                  // headers: {authorization: `Bearer ${process.env.REACT_APP_AUTH0_MANAGEMENT_API_ACCESS_TOKEN}`}
                  headers: {
                    authorization: `Bearer ${process.env.REACT_APP_AUTH0_MANAGEMENT_API_ACCESS_TOKEN}`,
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
  }, []);

  const dispatch = useDispatch();
  const user = useSelector(usersStateSelector);
  const filteredPeople: string[] =
    query === ''
      ? users
          .filter((p) => p !== user.email)
          .filter((p) =>
            modelToShare.userSharingWith
              ? modelToShare.userSharingWith?.filter((u) => p === u).length ===
                0
              : true,
          )
      : users
          .filter((p) => p !== user.email)
          .filter((p) =>
            modelToShare.userSharingWith
              ? modelToShare.userSharingWith?.filter((u) => p === u).length ===
                0
              : true,
          )
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
              <div className="w-1/4 bg-white rounded-lg p-5 shadow-2xl">
                <h5>Share Project</h5>
                <hr className="mb-10" />
                {spinner ? (
                  <div className="flex justify-center items-center">
                    <ImSpinner className="animate-spin w-8 h-8" />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="mr-2">Share with:</span>
                      <SearchUser
                        selected={selected}
                        setSelected={setSelected}
                        filteredPeople={filteredPeople}
                        query={query}
                        setQuery={setQuery}
                      />
                    </div>
                    {modelToShare.userSharingWith && (
                      <div className="flex flex-col items-start mt-5">
                        <span>Shared With:</span>
                        <ul className='text-start pl-2'>
                          {modelToShare.userSharingWith.map((u) => (
                            <li className="flex flex-row gap-3 items-center">
                              <FaUserCheck size={20} />
                              <span>{u}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-10 flex justify-between items-center">
                      <button
                        type="button"
                        className="button border rounded border-black py-1 px-2 text-sm hover:bg-black hover:text-white hover:cursor-pointer"
                        onClick={() => setShowSearchUser(false)}
                      >
                        CANCEL
                      </button>
                      <button
                        disabled={users.length === 0}
                        type="button"
                        className="button border rounded border-black py-1 px-2 text-sm hover:bg-green-700 hover:text-white hover:cursor-pointer"
                        onClick={() => {
                          const newModel: FaunaCadModel = {
                            ...modelToShare,
                            userSharingWith: modelToShare.userSharingWith
                              ? [...modelToShare.userSharingWith, selected]
                              : [selected],
                          };
                          execQuery(updateModelInFauna, newModel)
                            .then(() => {
                              dispatch(updateModel(newModel));
                              toast.success('Sharing Successfully!');
                            })
                            .catch((err) => {
                              console.log(err);
                              toast.error('Sharing Unsuccessfully!');
                            });
                          setShowSearchUser(false);
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
