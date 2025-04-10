import React from 'react';
import { FaCube, FaCubes } from 'react-icons/fa';

import { useSelector } from 'react-redux';
import { selectedProjectSelector } from '../../../store/projectSlice';
import { ThemeSelector } from '../../../store/tabsAndMenuItemsSlice';

interface ModelOutlinerProps {}

export const ModelOutliner: React.FC<ModelOutlinerProps> = () => {
  const selectedProject = useSelector(selectedProjectSelector);

  return (
    <div className={`mt-1`}>
      <div className="flex pl-1 items-center">
        <div className="w-[10%]">
          <FaCubes className="w-[20px] h-[20px]" />
        </div>
        <div className="w-[80%] text-left">
          <h5 className="ml-[5px] text-[12px] xl:text-base font-normal">
            Components
          </h5>
        </div>
      </div>
      <div className="flex-col ml-5 mt-1 overflow-y-scroll max-h-[300px] overflow-x-scroll max-w-[200px]">
        {selectedProject &&
          selectedProject.model?.components.map((component) => {
            return (
              <div className="flex items-center" key={component.keyComponent}>
                <div className="w-[10%]">
                  <FaCube
                    className="w-[15px] h-[15px]"
                    color={
                      component.material !== undefined
                        ? component.material.color
                        : 'gray'
                    }
                  />
                </div>
                <div className="w-[90%] text-start">
                  <h6 className="lowercase text-[12px] xl:text-base font-[600]">
                    {component.name}
                  </h6>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
