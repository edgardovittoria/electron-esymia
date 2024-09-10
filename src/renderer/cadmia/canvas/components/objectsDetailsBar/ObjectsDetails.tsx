import React from 'react';
import { useSelector } from 'react-redux';
import { Transformations } from './components/transformations';
import { GeometryParams } from './components/geometryParams/geometryParams';
import { MaterialSelection } from './components/materialSelection/materialSelection';
import { Outliner } from './components/outliner';
import { BordersMeshOption } from './components/bordersMeshOption';
import { useCadmiaModalityManager } from '../cadmiaModality/useCadmiaModalityManager';
import { componentseSelector, selectedComponentSelector } from '../../../../cad_library';

interface ObjectsDetailsProps {}

export const ObjectsDetails: React.FC<ObjectsDetailsProps> = () => {
  const canvasComponents = useSelector(componentseSelector);
  const selectedComponent = useSelector(selectedComponentSelector);
  const { objectsDetailsOptsBasedOnModality } = useCadmiaModalityManager();

  return (
    <div
      className={`absolute bottom-0 z-10 left-0 w-[18vw] bg-white px-[20px] pt-[20px] pb-[50px] text-white text-center translate-y-0 transition border border-black border-b-0 rounded-tr-xl`}
    >
      <div className="h-full max-h-[800px] overflow-scroll">
        <Outliner
          components={canvasComponents}
          selectedComponent={selectedComponent}
        />
        {selectedComponent && (
          <div className="text-left">
            {objectsDetailsOptsBasedOnModality.elementsVisibility
              .transformations && (
              <>
                <h6 className="text-black mt-[10px] text-sm font-bold">
                  Transformation Params
                </h6>
                <hr className="border-black mt-1" />
                <Transformations
                  transformationParams={selectedComponent.transformationParams}
                />
              </>
            )}
            {objectsDetailsOptsBasedOnModality.elementsVisibility
              .geometryParams && (
              <>
                <h6 className="text-black mt-[10px] text-sm font-bold">
                  Geometry Params
                </h6>
                <hr className="border-black mb-2 mt-1" />
                <GeometryParams entity={selectedComponent} />
              </>
            )}
            <MaterialSelection defaultMaterial={selectedComponent.material} />
            {objectsDetailsOptsBasedOnModality.elementsVisibility.borders && (
              <>
                <h6 className="text-black mt-[10px] text-sm font-bold">
                  Visualization
                </h6>
                <hr className="border-black mb-2 mt-1" />
                <BordersMeshOption />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
