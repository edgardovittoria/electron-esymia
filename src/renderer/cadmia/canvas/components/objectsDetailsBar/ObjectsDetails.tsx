import React from 'react';
import { useSelector } from 'react-redux';
import { Transformations } from './components/transformations';
import { GeometryParams } from './components/geometryParams/geometryParams';
import { MaterialSelection } from './components/materialSelection/materialSelection';
import { Outliner } from './components/outliner';
import { BordersMeshOption } from './components/bordersMeshOption';
import { useCadmiaModalityManager } from '../cadmiaModality/useCadmiaModalityManager';
import { componentseSelector, selectedComponentSelector } from '../../../../cad_library';
import { SelectAllCheckBox } from './components/selectAllCheckBox';

interface ObjectsDetailsProps { }

export const ObjectsDetails: React.FC<ObjectsDetailsProps> = () => {
  const canvasComponents = useSelector(componentseSelector);
  const selectedComponent = useSelector(selectedComponentSelector);
  const { objectsDetailsOptsBasedOnModality } = useCadmiaModalityManager();

  return (
    <div
      className={`absolute bottom-0 z-10 left-0 w-[20vw] px-5 pt-5 pb-12 text-center transition-all duration-300 border-t border-r rounded-tr-xl backdrop-blur-md
        ${objectsDetailsOptsBasedOnModality.elementsVisibility.transformations ? 'h-[60vh]' : 'h-fit max-h-[80vh]'}
        bg-white/90 border-gray-200 text-gray-900
        dark:bg-black/80 dark:border-white/10 dark:text-white`}
    >
      <div className="h-full overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {objectsDetailsOptsBasedOnModality.elementsVisibility.selectAll && <SelectAllCheckBox label='Select all: ' />}
        <Outliner
          components={canvasComponents}
          selectedComponent={selectedComponent}
        />
        {selectedComponent && (
          <div className="text-left flex flex-col gap-4 mt-4">
            {objectsDetailsOptsBasedOnModality.elementsVisibility
              .transformations && (
                <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                  <h6 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Transformation Params
                  </h6>
                  <Transformations
                    transformationParams={selectedComponent.transformationParams}
                  />
                </div>
              )}
            {objectsDetailsOptsBasedOnModality.elementsVisibility
              .geometryParams && (
                <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                  <h6 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Geometry Params
                  </h6>
                  <GeometryParams entity={selectedComponent} />
                </div>
              )}

            <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5">
              <MaterialSelection defaultMaterial={selectedComponent.material} />
            </div>

            {objectsDetailsOptsBasedOnModality.elementsVisibility.borders && (
              <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/5">
                <h6 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Visualization
                </h6>
                <BordersMeshOption />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
