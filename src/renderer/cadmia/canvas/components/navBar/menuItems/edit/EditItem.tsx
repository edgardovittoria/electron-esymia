import React, { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { ActionCreators } from 'redux-undo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { UndoRedo } from './undoRedo';
import {
  navbarDropdownBoxStyle,
  navbarDropdownItemStyle,
  navbarDropdownPadding,
  navbarDropdownStyle, navbarItemStyle,
  navbarShortcutStyle
} from '../../../../../config/styles';
import { resetState } from '../../../../../../cad_library';

interface EditItemProps { }

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
            className={navbarItemStyle}
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
                  <button
                    onClick={() => {
                      dispatch(resetState());
                      dispatch(ActionCreators.clearHistory());
                    }}
                    className={navbarDropdownItemStyle}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FontAwesomeIcon
                          icon={faTrash}
                          className="h-4 w-4"
                        />
                        <span className="font-medium">
                          Clear All
                        </span>
                      </div>
                      <span className={navbarShortcutStyle}>
                        Ctrl + Alt + R
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};
