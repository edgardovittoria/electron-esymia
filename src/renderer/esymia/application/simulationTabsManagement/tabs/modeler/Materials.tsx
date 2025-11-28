import React from 'react';
import { FaCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectedProjectSelector } from '../../../../store/projectSlice';
import noMaterialsIcon from '../../../../../../../assets/noMaterialsIcon.png';
import noMaterialsIconDark from '../../../../../../../assets/noMaterialsIconDark.png';
import { ThemeSelector } from '../../../../store/tabsAndMenuItemsSlice';
import { getMaterialListFrom } from '../solver/Solver';
import { Material } from '../../../../../cad_library';

interface MaterialsProps { }

export const Materials: React.FC<MaterialsProps> = () => {
  const selectedProject = useSelector(selectedProjectSelector);
  const theme = useSelector(ThemeSelector)
  const materials = selectedProject ? getMaterialListFrom(selectedProject.model?.components) : []
  function onlyUnique(value: Material, index: number, array: Material[]) {
    return array.indexOf(value) === index;
  }
  const filteredMaterials = materials.filter(onlyUnique)
  console.log(filteredMaterials)
  return (
    <>
      {selectedProject && selectedProject.model?.components !== undefined ? (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className={`font-bold text-lg ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>Materials</span>
            <span className={`text-xs px-2 py-1 rounded-full ${theme === 'light' ? 'bg-gray-100 text-gray-500' : 'bg-white/10 text-gray-400'}`}>
              {filteredMaterials.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <ul className="space-y-2">
              {filteredMaterials.map((material, index) => {
                return (
                  <li key={index} className={`p-3 rounded-lg transition-all duration-200 ${theme === 'light'
                    ? 'bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100'
                    : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10'
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <FaCircle
                          color={material.color}
                          className="w-4 h-4 shadow-sm rounded-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className={`text-sm font-medium truncate ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
                          {material.name}
                        </h6>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center p-6">
          <img
            src={theme === 'light' ? noMaterialsIcon : noMaterialsIconDark}
            className="w-full mb-6"
            alt="No Materials"
          />
          <p className={`text-sm max-w-[200px] ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
            Apply materials to your model directly in the CAD software
          </p>
        </div>
      )}
    </>
  );
};
