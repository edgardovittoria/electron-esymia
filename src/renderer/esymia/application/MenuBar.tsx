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
  unsetSolverResults,
} from '../store/tabsAndMenuItemsSlice';
import { GiMeshBall } from 'react-icons/gi';
import { selectedProjectSelector } from '../store/projectSlice';

interface MenuBarProps { }

export const MenuBar: React.FC<MenuBarProps> = () => {
  const dispatch = useDispatch();
  const menuItems = useSelector(menuItemsSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  const menuItemSelected = useSelector(selectedMenuItemSelector);
  const theme = useSelector(ThemeSelector);
  const isDark = theme !== 'light';

  return (
    <div className="w-full px-8 pt-2 pb-4">
      <div className={`glass-panel ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} px-6 py-2 flex flex-row justify-between items-center rounded-2xl shadow-lg transition-all duration-300`}>
        <div className="relative flex items-center gap-2 w-full justify-around md:justify-start md:gap-8">
          {(menuItems as string[]).map((item) => {
            const isSelected = menuItemSelected === item;
            const isDisabled = item === "Results" && selectedProject?.simulation?.status !== "Completed";

            return (
              <button
                key={item}
                data-testid={item}
                disabled={isDisabled}
                className={`group flex flex-col justify-center items-center relative py-1 px-2 rounded-xl transition-all duration-300 ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-white/10'
                  }`}
                onClick={() => {
                  dispatch(selectMenuItem(item));
                  if (item !== "Results") {
                    dispatch(unsetSolverResults());
                  }
                }}
              >
                <div className={`transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                  {item === 'Modeler' && (
                    <PiCubeFocusDuotone
                      size={24}
                      className={isSelected ? 'text-blue-500 drop-shadow-md' : (isDark ? 'text-gray-400' : 'text-gray-500')}
                    />
                  )}
                  {item === 'Mesher' && (
                    <GiMeshBall
                      size={24}
                      className={isSelected ? 'text-purple-500 drop-shadow-md' : (isDark ? 'text-gray-400' : 'text-gray-500')}
                    />
                  )}
                  {item === 'Solver' && (
                    <MdOutlineSettingsPower
                      size={24}
                      className={isSelected ? 'text-green-500 drop-shadow-md' : (isDark ? 'text-gray-400' : 'text-gray-500')}
                    />
                  )}
                  {item === 'Results' && (
                    <TfiBarChart
                      size={24}
                      className={isSelected ? 'text-orange-500 drop-shadow-md' : (isDark ? 'text-gray-400' : 'text-gray-500')}
                    />
                  )}
                </div>

                <span
                  className={`mt-1 text-xs font-medium tracking-wide transition-colors duration-300 ${isSelected
                    ? (isDark ? 'text-white' : 'text-gray-900')
                    : (isDark ? 'text-gray-500 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-700')
                    }`}
                >
                  {item}
                </span>

                {isSelected && (
                  <div className={`absolute -bottom-1 w-1/2 h-1 rounded-full bg-gradient-to-r ${item === 'Modeler' ? 'from-blue-400 to-blue-600' :
                    item === 'Mesher' ? 'from-purple-400 to-purple-600' :
                      item === 'Solver' ? 'from-green-400 to-green-600' :
                        'from-orange-400 to-orange-600'
                    }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
