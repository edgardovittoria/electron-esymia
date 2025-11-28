import React from 'react';
import { FaCube, FaCubes } from 'react-icons/fa';

import { useSelector } from 'react-redux';
import { selectedProjectSelector } from '../../../store/projectSlice';
import { ThemeSelector } from '../../../store/tabsAndMenuItemsSlice';

interface ModelOutlinerProps { }

export const ModelOutliner: React.FC<ModelOutlinerProps> = () => {
  const selectedProject = useSelector(selectedProjectSelector);
  const theme = useSelector(ThemeSelector);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaCubes className={`w-5 h-5 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`} />
          <h5 className={`font-bold text-lg ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
            Components
          </h5>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${theme === 'light' ? 'bg-gray-100 text-gray-500' : 'bg-white/10 text-gray-400'}`}>
          {selectedProject?.model?.components.length || 0}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="space-y-2">
          {selectedProject &&
            selectedProject.model?.components.map((component) => {
              return (
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${theme === 'light'
                    ? 'bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100'
                    : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10'
                    }`}
                  key={component.keyComponent}
                >
                  <div className="flex-shrink-0">
                    <FaCube
                      className="w-4 h-4"
                      color={
                        component.material !== undefined
                          ? component.material.color
                          : 'gray'
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h6 className={`text-sm font-medium truncate lowercase ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
                      {component.name}
                    </h6>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
