import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ImSpinner } from 'react-icons/im';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { SearchUser } from './components/SearchUser';
import {
  Folder,
  Project,
} from '../../../../../../../model/esymiaModels';
import toast from 'react-hot-toast';
import { UsersState, usersStateSelector } from '../../../../../../../../cad_library';
import { useDynamoDBQuery } from '../../../../../../../../dynamoDB/hook/useDynamoDBQuery';
import { recursiveUpdateSharingInfoFolderInDynamoDB } from '../../../../../../../../dynamoDB/projectsFolderApi';
import { ThemeSelector } from '../../../../../../../store/tabsAndMenuItemsSlice';
import { useStorageData } from '../../../../../../simulationTabsManagement/hook/useStorageData';


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
  const [users, setUsers] = useState<UsersState[]>([]);
  const [shareDone, setShareDone] = useState<boolean>(false);
  const { execQuery2 } = useDynamoDBQuery()
  const [selected, setSelected] = useState<UsersState | null>({} as UsersState);
  const [query, setQuery] = useState('');
  const [spinner, setSpinner] = useState(true);
  const { shareProject } = useStorageData()
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

  useEffect(() => {
    const usersList: UsersState[] = [];
    setSpinner(true);
    axios.post(
      `https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`,
      {
        'client_id': process.env.REACT_APP_AUTH0_MANAGEMENT_CLIENT_ID,
        'client_secret': process.env.REACT_APP_AUTH0_MANAGEMENT_CLIENT_SECRET,
        'audience': process.env.REACT_APP_AUTH0_AUDIENCE,
        'grant_type': 'client_credentials'
      },
      {
        headers: {
          'content-type': 'application/json'
        }
      }
    ).then(response => {
      axios
        .get(`https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users`, {
          headers: {
            authorization: `Bearer ${response.data.access_token}`,
          },
        }).then(res => {
          res.data.forEach((u: { email: string, name: string }) => {
            if (u.email) usersList.push({ email: u.email, userName: u.name, userRole: "Premium" });
          });
          setUsers(usersList);
          setSpinner(false);
        }).catch(err => console.log(err));
    })
  }, []);

  const dispatch = useDispatch();
  const user = useSelector(usersStateSelector);

  useEffect(() => {
    if (shareDone) {
      execQuery2(recursiveUpdateSharingInfoFolderInDynamoDB, folderToShare, dispatch)
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

  console.log(users)

  const filteredPeople: UsersState[] =
    query === ''
      ? users.filter((p) => p.email !== user.email)
      : users
        .filter((p) => p.email !== user.email)
        .filter((person) =>
          person.email && (person.email as string)
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, '')),
        );

  return (
    <Transition appear show as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
              <div className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-2xl transition-all backdrop-blur-md ${isDark
                ? 'bg-black/80 border border-white/10'
                : 'bg-white/90 border border-white/40'
                }`}>
                <h5 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Share Project
                </h5>

                {spinner ? (
                  <div className="flex justify-center items-center py-8">
                    <ImSpinner className={`animate-spin w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2 mb-8">
                      <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Share with
                      </span>
                      <SearchUser
                        selected={selected as UsersState}
                        setSelected={setSelected}
                        filteredPeople={filteredPeople}
                        query={query}
                        setQuery={setQuery}
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isDark
                          ? 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                          }`}
                        onClick={() => setShowSearchUser(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${isDark
                          ? 'bg-green-600 text-white hover:bg-green-500 hover:shadow-green-500/20'
                          : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-green-500/30'
                          }`}
                        onClick={() => {
                          setShareDone(true);
                          shareProject(projectToShare as Project, selected as UsersState, setShowSearchUser)
                        }}
                      >
                        Share Project
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
