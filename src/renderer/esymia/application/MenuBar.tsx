import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PiCubeFocusDuotone } from 'react-icons/pi';
import { FaReact } from 'react-icons/fa6';
import { MdOutlineSettingsPower } from 'react-icons/md';
import { TfiBarChart } from 'react-icons/tfi';
import {
  menuItemsSelector,
  selectedMenuItemSelector,
  selectMenuItem,
} from '../store/tabsAndMenuItemsSlice';
import { GrClone } from 'react-icons/gr';
import {
  SelectedFolderSelector,
  selectedProjectSelector,
} from '../store/projectSlice';
import { Folder } from '../model/esymiaModels';
import { useStorageData } from './simulationTabsManagement/tabs/simulator/rightPanelSimulator/hook/useStorageData';
import { ImSpinner } from 'react-icons/im';

interface MenuBarProps {}

export const MenuBar: React.FC<MenuBarProps> = () => {
  const dispatch = useDispatch();
  const menuItems = useSelector(menuItemsSelector);
  const menuItemSelected = useSelector(selectedMenuItemSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedFolder = useSelector(SelectedFolderSelector)
  const { cloneProject } = useStorageData()
  const [cloning, setcloning] = useState<boolean>(false)
  return (
    <div className="w-full px-10">
      <div className="bg-white px-4 py-2 flex flex-row justify-between items-center rounded-xl">
        <ul className="relative flex items-center">
          {(menuItems as string[]).map((item) => (
            <li
              key={item}
              data-testid={item}
              className="flex flex-col justify-center items-center hover:cursor-pointer"
              onClick={() => dispatch(selectMenuItem(item))}
            >
              {item === 'Modeler' && (
                <PiCubeFocusDuotone
                  size={25}
                  className={
                    menuItemSelected === item
                      ? 'text-[#4AC37E]'
                      : 'text-gray-400'
                  }
                />
              )}
              {item === 'Terminations' && (
                <FaReact
                  size={25}
                  className={
                    menuItemSelected === item
                      ? 'text-[#4AC37E]'
                      : 'text-gray-400'
                  }
                />
              )}
              {item === 'Simulator' && (
                <MdOutlineSettingsPower
                  size={25}
                  className={
                    menuItemSelected === item
                      ? 'text-[#4AC37E]'
                      : 'text-gray-400'
                  }
                />
              )}
              {item === 'Results' && (
                <TfiBarChart
                  size={25}
                  className={
                    menuItemSelected === item
                      ? 'text-[#4AC37E]'
                      : 'text-gray-400'
                  }
                />
              )}
              {item === 'Overview' ||
              item === 'Projects' ||
              item === 'Simulations' ? (
                <span
                  className={
                    menuItemSelected === item
                      ? 'text-black no-underline px-4 py-3 text-sm'
                      : 'no-underline px-4 py-3 text-gray-400 text-sm'
                  }
                >
                  {item}
                </span>
              ) : (
                <span
                  className={
                    menuItemSelected === item
                      ? 'text-black no-underline px-4 text-[11px]'
                      : 'no-underline px-4 text-gray-400 text-[11px]'
                  }
                >
                  {item}
                </span>
              )}
              {menuItemSelected === item && (
                <hr className="w-2/3 border border-secondaryColor" />
              )}
            </li>
          ))}
        </ul>
        {/* <div className='flex flex-row gap-4 items-center'>
          {selectedProject && (
            <button
              className="flex flex-row items-center gap-3 btn btn-sm text-sm bg-white text-black border-gray-300 hover:bg-secondaryColor hover:text-white"
              onClick={() => {
                setcloning(true)
                cloneProject(selectedProject, selectedFolder as Folder, setcloning)
              }}
            >
              <GrClone size={20} />
              <span className="uppercase">clone project</span>
            </button>
          )}
          {cloning && <ImSpinner className="animate-spin w-5 h-5" />}
        </div> */}
      </div>
    </div>
  );
};
