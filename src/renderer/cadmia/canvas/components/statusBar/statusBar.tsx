import { FC, useState } from 'react';
import { Statusbar } from 'react-statusbar';
import { useDispatch, useSelector } from 'react-redux';
import { setUnit, unitSelector } from './statusBarSlice';
import { ThemeSelector } from '../../../../esymia/store/tabsAndMenuItemsSlice';

interface StatusBarProps { }

export const StatusBar: FC<StatusBarProps> = () => {
  const units = ['m', 'dm', 'cm', 'mm', 'microm', 'nanom'];
  const unit = useSelector(unitSelector);
  const dispatch = useDispatch();
  const theme = useSelector(ThemeSelector);

  return (
    <Statusbar
      placement="bottom"
      className="z-50"
      theme={theme as "light" | "dark"}
      right={
        <div className={`h-[3vh] px-5 flex items-center justify-end gap-2 backdrop-blur-md border-t transition-colors duration-300 ${theme === 'light' ? 'bg-white/80 border-gray-200' : 'bg-black/80 border-white/10'}`}>
          <span className={`text-xs font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Distance unit:</span>
          <select
            value={unit}
            onChange={(e) => dispatch(setUnit(e.target.value))}
            className={`text-xs font-semibold bg-transparent border-none outline-none cursor-pointer hover:text-blue-500 transition-colors ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}
          >
            {units.map((u, index) => (
              <option key={index} value={u} className={theme === 'light' ? 'bg-white text-gray-900' : 'bg-gray-800 text-white'}>
                {u}
              </option>
            ))}
          </select>
        </div>
      }
    />
  );
};
