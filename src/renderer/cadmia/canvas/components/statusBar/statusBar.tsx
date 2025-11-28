import { FC, useState } from 'react';
import { Statusbar } from 'react-statusbar';
import { useDispatch, useSelector } from 'react-redux';
import { setUnit, unitSelector } from './statusBarSlice';

interface StatusBarProps { }

export const StatusBar: FC<StatusBarProps> = () => {
  const units = ['m', 'dm', 'cm', 'mm', 'microm', 'nanom'];
  const unit = useSelector(unitSelector);
  const dispatch = useDispatch();
  return (
    <Statusbar
      placement="bottom"
      className="z-50"
      theme="light"
      right={
        <div className="h-[3vh] px-5 flex items-center justify-end gap-2 backdrop-blur-md bg-white/80 border-t border-gray-200 dark:bg-black/80 dark:border-white/10 transition-colors duration-300">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Distance unit:</span>
          <select
            value={unit}
            onChange={(e) => dispatch(setUnit(e.target.value))}
            className="text-xs font-semibold bg-transparent border-none outline-none cursor-pointer text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors"
          >
            {units.map((u, index) => (
              <option key={index} value={u} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {u}
              </option>
            ))}
          </select>
        </div>
      }
    />
  );
};
