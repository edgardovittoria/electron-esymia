import { useAuth0 } from '@auth0/auth0-react';
import { Popover, Transition } from '@headlessui/react';
import {
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/20/solid';
import React, { FC, Fragment } from 'react';
import { classNames } from '../NavBar';

interface LoginLogoutProps {}

export const LoginLogout: FC<LoginLogoutProps> = () => {
  const { loginWithPopup, isAuthenticated, user } = useAuth0();
  return (
    <>
      {isAuthenticated ? (
        <div className="flex">
          <Popover className="relative">
            {({ open }) => (
              <>
                <Popover.Button
                  className="group inline-flex items-center rounded-md bg-white text-base text-black font-medium hover:text-gray-900"
                >
                  <span>{user?.name}</span>
                  <ChevronDownIcon
                    className="ml-2 h-5 w-5 text-black group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                </Popover.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 transform px-2 sm:px-0">
                    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                        <div
                          className="-m-3 flex items-center rounded-lg p-2 hover:bg-gray-50 hover:cursor-pointer"
                          onClick={() => {
                            window.electron.ipcRenderer.sendMessage('logout', [
                              process.env.REACT_APP_AUTH0_DOMAIN,
                            ]);
                          }}
                        >
                          <ArrowRightOnRectangleIcon className="text-gray-900 mr-5 h-5 w-5" />
                          <span className="text-gray-900 text-base font-medium">
                            Log out
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
      ) : (
        <div
          className="ml-8 inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-gray-500 px-3 py-1 text-base font-medium text-white shadow-sm hover:bg-gray-400 hover:cursor-pointer"
          onClick={() => loginWithPopup()}
        >
          Sign in
        </div>
      )}
    </>
  );
};
