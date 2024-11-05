import React from 'react';
import { FaCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectedProjectSelector } from '../../../../store/projectSlice';
import noMaterialsIcon from '../../../../../../../assets/noMaterialsIcon.png';
import noMaterialsIconDark from '../../../../../../../assets/noMaterialsIconDark.png';
import { ThemeSelector } from '../../../../store/tabsAndMenuItemsSlice';

interface MaterialsProps {}

export const Materials: React.FC<MaterialsProps> = () => {
  const selectedProject = useSelector(selectedProjectSelector);
  const theme = useSelector(ThemeSelector)

  return (
    <>
      {selectedProject && selectedProject.model?.components !== undefined ? (
        <div>
          <span className='font-bold'>Materials</span>
          <hr className='border-[1px] border-gray-300 w-full mb-2 mt-1'/>
          <ul className="ml-0 pl-3">
            {selectedProject.model.components.map((component, index) => {
              return (
                <li key={index} className="">
                  <div className="flex">
                    <div className="flex w-[10%] items-center">
                      <FaCircle
                        color={
                          component.material !== undefined
                            ? component.material.color
                            : 'gray'
                        }
                      />
                    </div>
                    <div className="w-[80%] text-left flex items-center">
                      <h6 className="mb-0 text-[15px] font-normal">
                        {component.material !== undefined
                          ? component.material.name
                          : 'No material'}
                      </h6>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="text-center">
          <img
            src={theme === 'light' ? noMaterialsIcon : noMaterialsIconDark}
            className="mx-auto mt-[50px]"
            alt="No Materials"
          />
          <h5>No Materials</h5>
          <p className="mt-[50px]">
            apply the materials on the model directly in the CAD
          </p>
        </div>
      )}
    </>
  );
};
