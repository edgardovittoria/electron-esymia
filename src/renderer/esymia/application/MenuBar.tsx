import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PiCubeFocusDuotone } from 'react-icons/pi';
import { MdOutlineSettingsPower } from 'react-icons/md';
import { TfiBarChart } from 'react-icons/tfi';
import {
  menuItemsSelector,
  selectedMenuItemSelector,
  selectMenuItem,
  ThemeSelector,
} from '../store/tabsAndMenuItemsSlice';
import { GiMeshBall } from 'react-icons/gi';

interface MenuBarProps {}

export const MenuBar: React.FC<MenuBarProps> = () => {
  const dispatch = useDispatch();
  const menuItems = useSelector(menuItemsSelector);
  const menuItemSelected = useSelector(selectedMenuItemSelector);
  const theme = useSelector(ThemeSelector)
  return (
    <div className="w-full px-10">
      <div className={`${theme === 'light' ? 'bg-white' : 'bg-bgColorDark2'}  px-4 py-2 flex flex-row justify-between items-center rounded-xl`}>
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
              {item === 'Mesher' && (
                <GiMeshBall
                  size={25}
                  className={
                    menuItemSelected === item
                      ? 'text-[#4AC37E]'
                      : 'text-gray-400'
                  }
                />
              )}
              {item === 'Solver' && (
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
                  data-testid={item}
                  className={
                    menuItemSelected === item
                      ? `${theme === 'light' ? 'text-textColor' : 'text-textColorDark'} no-underline px-4 py-2 text-sm`
                      : 'no-underline px-4 py-3 text-gray-400 text-sm'
                  }
                >
                  {item}
                </span>
              ) : (
                <span
                  className={
                    menuItemSelected === item
                      ? `${theme === 'light' ? 'text-textColor' : 'text-textColorDark'} no-underline px-4 text-[11px]`
                      : 'no-underline px-4 text-gray-400 text-[11px]'
                  }
                >
                  {item}
                </span>
              )}
              {menuItemSelected === item && (
                <hr className={`w-2/3 border ${theme === 'light' ? 'border-secondaryColor' : 'border-secondaryColorDark'} border-secondaryColor`} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
