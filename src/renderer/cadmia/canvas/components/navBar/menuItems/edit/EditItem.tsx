import React, { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { resetState } from 'cad-library';
import { ActionCreators } from 'redux-undo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { UndoRedo } from './undoRedo';
import {
  navbarDropdownBoxStyle,
  navbarDropdownItemStyle,
  navbarDropdownPadding,
  navbarDropdownStyle,
  navbarShortcutStyle
} from '../../../../../config/styles';

interface EditItemProps {}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const EditItem: React.FC<EditItemProps> = () => {
  const dispatch = useDispatch();

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className="group inline-flex items-center rounded-md bg-white text-base text-black font-medium p-1 hover:bg-black hover:text-white hover:cursor-pointer"
          >
            <span>Edit</span>
            <ChevronDownIcon
              className="ml-2 h-5 w-5"
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
            <Popover.Panel className={navbarDropdownStyle}>
              <div className={navbarDropdownBoxStyle}>
                <div className={navbarDropdownPadding}>
                  <UndoRedo />
                  <div
                    onClick={() => {
                      dispatch(resetState());
                      dispatch(ActionCreators.clearHistory());
                    }}
                    className={navbarDropdownItemStyle}
                  >
                    <div className="flex w-full justify-between">
                      <div className="flex flex-row items-center">
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="mr-5"
                        />
                        <span className="text-base font-medium">
                        Clear All
                      </span>
                      </div>
                      <p className={navbarShortcutStyle}>
                        Ctrl + Alt + R
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};
