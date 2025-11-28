import React, { Fragment } from 'react';
import { Popover, Switch, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useDispatch, useSelector } from 'react-redux';
import { classNames } from '../../NavBar';
import {
  closeObjectsDetails,
  openObjectsDetails,
  objectsDetailsVisibilitySelector
} from '../../../objectsDetailsBar/objectsDetailsSlice';
import {
  binaryOpToolbarVisibilitySelector,
  closeBinaryOperationsToolbar,
  openBinaryOperationsToolbar
} from '../../../binaryOperationsToolbar/binaryOperationsToolbarSlice';
import {
  closeTransformationsToolbar,
  openTransformationsToolbar,
  transformationsToolbarVisibilitySelector
} from '../../../transformationsToolbar/toolbarTransformationSlice';
import {
  closeMiscToolbar,
  miscToolbarVisibilitySelector,
  openMiscToolbar
} from '../../../miscToolbar/miscToolbarSlice';
import {
  closeShapesToolbar,
  openShapesToolbar,
  shapesToolbarVisibilitySelector
} from '../shapes/shapesToolbarSlice';
import { resetFocusToScene } from './viewItemSlice';
import {
  navbarDropdownBoxStyle,
  navbarDropdownItemStyle,
  navbarDropdownPadding,
  navbarDropdownStyle,
  navbarItemStyle,
  navbarShortcutStyle
} from '../../../../../config/styles';

interface ViewItemProps {
}

export const ViewItem: React.FC<ViewItemProps> = () => {
  const dispatch = useDispatch();
  const sideBarChecked = useSelector(objectsDetailsVisibilitySelector);
  const binaryOperationsToolbarChecked = useSelector(
    binaryOpToolbarVisibilitySelector
  );
  const transformationsToolbarChecked = useSelector(
    transformationsToolbarVisibilitySelector
  );
  const miscToolbarChecked = useSelector(miscToolbarVisibilitySelector);
  const shapesToolbarChecked = useSelector(shapesToolbarVisibilitySelector);
  return (
    <Popover className='relative'>
      {({ open }) => (
        <>
          <Popover.Button
            className={navbarItemStyle}>
            <span>View</span>
            <ChevronDownIcon
              className='ml-2 h-5 w-5'
              aria-hidden='true'
            />
          </Popover.Button>

          <Transition
            as={Fragment}
            enter='transition ease-out duration-200'
            enterFrom='opacity-0 translate-y-1'
            enterTo='opacity-100 translate-y-0'
            leave='transition ease-in duration-150'
            leaveFrom='opacity-100 translate-y-0'
            leaveTo='opacity-0 translate-y-1'
          >
            <Popover.Panel className={navbarDropdownStyle}>
              <div className={navbarDropdownBoxStyle}>
                <div className={navbarDropdownPadding}>
                  <div className={navbarDropdownItemStyle}>
                    <div className='flex w-full items-center justify-between'>
                      <span className='font-medium'>Object Details</span>
                      <div className="flex items-center">
                        <span className={navbarShortcutStyle}>Ctrl + D</span>
                        <Switch
                          checked={sideBarChecked}
                          onChange={(checked: boolean) =>
                            checked
                              ? dispatch(openObjectsDetails())
                              : dispatch(closeObjectsDetails())
                          }
                          className={`${sideBarChecked ? 'bg-secondaryColor' : 'bg-gray-200 dark:bg-gray-700'} ml-3 relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                        >
                          <span
                            aria-hidden='true'
                            className={`${sideBarChecked ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                          />
                        </Switch>
                      </div>
                    </div>
                  </div>

                  <div className={navbarDropdownItemStyle}>
                    <div className='flex w-full items-center justify-between'>
                      <span className='font-medium'>Binary operations toolbar</span>
                      <Switch
                        checked={binaryOperationsToolbarChecked}
                        onChange={(checked: boolean) =>
                          checked
                            ? dispatch(openBinaryOperationsToolbar())
                            : dispatch(closeBinaryOperationsToolbar())
                        }
                        className={`${binaryOperationsToolbarChecked ? 'bg-secondaryColor' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                      >
                        <span
                          aria-hidden='true'
                          className={`${binaryOperationsToolbarChecked ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                        />
                      </Switch>
                    </div>
                  </div>

                  <div className={navbarDropdownItemStyle}>
                    <div className='flex w-full items-center justify-between'>
                      <span className='font-medium'>Misc toolbar</span>
                      <Switch
                        checked={miscToolbarChecked}
                        onChange={(checked: boolean) =>
                          checked
                            ? dispatch(openMiscToolbar())
                            : dispatch(closeMiscToolbar())
                        }
                        className={`${miscToolbarChecked ? 'bg-secondaryColor' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                      >
                        <span
                          aria-hidden='true'
                          className={`${miscToolbarChecked ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                        />
                      </Switch>
                    </div>
                  </div>

                  <div className={navbarDropdownItemStyle}>
                    <div className='flex w-full items-center justify-between'>
                      <span className='font-medium'>Transformations toolbar</span>
                      <Switch
                        checked={transformationsToolbarChecked}
                        onChange={(checked: boolean) =>
                          checked
                            ? dispatch(openTransformationsToolbar())
                            : dispatch(closeTransformationsToolbar())
                        }
                        className={`${transformationsToolbarChecked ? 'bg-secondaryColor' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                      >
                        <span
                          aria-hidden='true'
                          className={`${transformationsToolbarChecked ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                        />
                      </Switch>
                    </div>
                  </div>

                  <div className={navbarDropdownItemStyle}>
                    <div className='flex w-full items-center justify-between'>
                      <span className='font-medium'>Shapes toolbar</span>
                      <Switch
                        checked={shapesToolbarChecked}
                        onChange={(checked: boolean) =>
                          checked
                            ? dispatch(openShapesToolbar())
                            : dispatch(closeShapesToolbar())
                        }
                        className={`${shapesToolbarChecked ? 'bg-secondaryColor' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                      >
                        <span
                          aria-hidden='true'
                          className={`${shapesToolbarChecked ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                        />
                      </Switch>
                    </div>
                  </div>

                  <div
                    className={`${navbarDropdownItemStyle} cursor-pointer`}
                    onClick={() => {
                      dispatch(resetFocusToScene());
                    }}
                  >
                    <span className='font-medium'>Reset Focus To Whole Scene</span>
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
