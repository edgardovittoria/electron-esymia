import React from 'react';
import { useSelector } from 'react-redux';
import {
  selectedMenuItemSelector,
  ThemeSelector,
} from '../../../store/tabsAndMenuItemsSlice';
import { selectedProjectSelector } from '../../../store/projectSlice';

export interface StatusBarProps {
  voxelsPainted?: number;
  totalVoxels?: number;
}

const StatusBar: React.FC<StatusBarProps> = ({
  voxelsPainted,
  totalVoxels,
}) => {
  const menuItemSelected = useSelector(selectedMenuItemSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  const theme = useSelector(ThemeSelector);
  return (
    <>
      {selectedProject?.model.components && (
        <div
          className={`w-full flex justify-end absolute bottom-0 p-2 backdrop-blur-md border-t transition-all duration-300 ${theme === 'light'
              ? 'bg-white/80 border-white/40 text-gray-700'
              : 'bg-black/60 border-white/10 text-gray-300'
            }`}
        >
          {menuItemSelected === 'Mesher' && (
            <>
              {selectedProject.meshData.type === 'Standard' ? (
                <div className="pr-5 flex items-center gap-2">
                  <span>Number of bricks:</span>
                  <span
                    data-testid="numberOfBricks"
                    className={`font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                      }`}
                  >
                    {voxelsPainted}
                  </span>
                </div>
              ) : (
                <>
                  <div className="pr-5 flex items-center gap-2">
                    <span>Number of sides:</span>
                    <span
                      className={`font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                        }`}
                    >
                      {selectedProject.meshData.ASize ? selectedProject.meshData.ASize[0] : 'N/A'}
                    </span>
                  </div>
                  <div className="pr-5 flex items-center gap-2">
                    <span>Number of nodes:</span>
                    <span
                      className={`font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                        }`}
                    >
                      {selectedProject.meshData.ASize ? selectedProject.meshData.ASize[1] : 'N/A'}
                    </span>
                  </div>
                </>
              )}
            </>
          )}
          <div className="pr-5 flex items-center gap-2">
            <span>Distance Unit:</span>
            <span className={`font-bold ${theme === 'light' ? 'text-purple-600' : 'text-purple-400'
              }`}>
              {selectedProject?.modelUnit}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default StatusBar;
