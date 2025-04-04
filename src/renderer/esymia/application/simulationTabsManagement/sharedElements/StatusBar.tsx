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
          className={`w-full ${
            theme === 'light' ? 'bg-gray-300' : 'bg-bgColorDark2'
          }  flex justify-end absolute bottom-0 p-1`}
        >
          {menuItemSelected === 'Mesher' && (
            <>
              {selectedProject.meshData.type === 'Standard' ? (
                <div
                  className={`pr-5 ${
                    theme === 'light' ? 'text-textColor' : 'text-textColorDark'
                  }`}
                >
                  Number of bricks:{' '}
                  <span
                    data-testid="numberOfBricks"
                    className={`font-bold ${
                      theme === 'light'
                        ? 'text-textColor'
                        : 'text-textColorDark'
                    }`}
                  >
                    {voxelsPainted}
                  </span>
                </div>
              ):(
                <>
                  <div
                  className={`pr-5 ${
                    theme === 'light' ? 'text-textColor' : 'text-textColorDark'
                  }`}
                >
                  Number of sides:{' '}
                  <span
                    className={`font-bold ${
                      theme === 'light'
                        ? 'text-textColor'
                        : 'text-textColorDark'
                    }`}
                  >
                    {selectedProject.meshData.ASize ? selectedProject.meshData.ASize[0] : 'N/A'}
                  </span>
                </div>
                <div
                  className={`pr-5 ${
                    theme === 'light' ? 'text-textColor' : 'text-textColorDark'
                  }`}
                >
                  Number of nodes:{' '}
                  <span
                    className={`font-bold ${
                      theme === 'light'
                        ? 'text-textColor'
                        : 'text-textColorDark'
                    }`}
                  >
                    {selectedProject.meshData.ASize ? selectedProject.meshData.ASize[1] : 'N/A'}
                  </span>
                </div>
                </>
              )}
            </>
          )}
          <div
            className={`pr-5 ${
              theme === 'light' ? 'text-textColor' : 'text-textColorDark'
            }`}
          >
            Distance Unit:{' '}
            <span className="font-bold">{selectedProject?.modelUnit}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default StatusBar;
