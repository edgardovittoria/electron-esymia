import React, { FC, useEffect, useRef, useState } from 'react';
import { MdOutlineKeyboardReturn } from 'react-icons/md';
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  OrbitControls,
  GizmoHelper,
  GizmoViewport,
  Edges,
  Line,
} from '@react-three/drei';
import { MeshedElement } from '../../mesher/components/MeshedElement/MeshedElement';
import {
  ExternalGridsObject,
  ExternalGridsRisObject,
  Port,
  Probe,
  Project,
  TempLumped,
} from '../../../../../model/esymiaModels';
import {
  Provider,
  ReactReduxContext,
  useDispatch,
  useSelector,
} from 'react-redux';
import {
  boundingBoxDimensionSelector,
  findSelectedPort,
  pathToExternalGridsNotFoundSelector,
  selectedProjectSelector,
  selectPort,
  setBoundingBoxDimension,
  updatePortPosition,
} from '../../../../../store/projectSlice';
import { FocusView } from '../../../sharedElements/FocusView';
import uniqid from 'uniqid';
import {
  comeBackToModelerMessage,
} from '../../../../config/textMessages';
import {
  CircleGeometryAttributes,
  ComponentEntity,
  FactoryShapes,
  TransformationParams,
} from '../../../../../../cad_library';
import { ThemeSelector } from '../../../../../store/tabsAndMenuItemsSlice';
import {
  InstancedSquaresFromVertices,
  RisMesh,
} from '../../mesher/components/MeshedElement/components/RisMesh';
import { FactoryShapesEsymia } from '../../../../../../cad_library/components/baseShapes/factoryShapes';
import EdgesGenerator from '../../physics/EdgesGenerator';
import { GizmoArrowViewport } from '../../solver/components/planeWave/components/GizmoArrowViewport';
import { PortControls } from '../../physics/portManagement/PortControls';
import { ProbeControls } from '../../physics/portManagement/ProbeControls';
import { calculateModelBoundingBox } from '../../../sharedElements/utilityFunctions';
import { MesherStatusSelector } from '../../../../../store/pluginsSlice';

interface CanvasMesherProps {
  externalGrids: ExternalGridsObject | ExternalGridsRisObject | undefined;
  selectedMaterials: string[];
  resetFocus: boolean;
  setResetFocus: Function;
}

export const CanvasMesher: React.FC<CanvasMesherProps> = ({
  externalGrids,
  selectedMaterials,
  resetFocus,
  setResetFocus
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const theme = useSelector(ThemeSelector);
  const mesherReady = useSelector(MesherStatusSelector);
  return (
    <div className="flex justify-center">
      {selectedProject && selectedProject.model?.components ? (
        <ReactReduxContext.Consumer>
          {({ store }) => (
            <div className="flex flex-col">
              <Canvas
                className="w-[100vw] lg:h-[70vh] xl:h-[72vh]"
                camera={{ position: [0, -3, 0], up: [0, 0, 1], fov: 50 }}
              >
                {/* <Perf/> */}
                <Provider store={store}>
                  <pointLight position={[100, 100, 100]} intensity={0.8} />
                  <hemisphereLight
                    color={'#ffffff'}
                    groundColor={new THREE.Color('#b9b9b9')}
                    position={[-7, 25, 13]}
                    intensity={3}
                  />
                  {/* paint models */}
                  <FocusView resetFocus={resetFocus}>
                    {selectedProject.meshData.meshGenerated !== 'Generated' ? (
                      selectedProject.model.components.map(
                        (component: ComponentEntity, index: number) => {
                          return (
                            <mesh
                              userData={{
                                keyComponent: component.keyComponent,
                                isSelected: false,
                              }}
                              key={uniqid()}
                              position={component.transformationParams.position}
                              scale={component.transformationParams.scale}
                              rotation={component.transformationParams.rotation}
                            >
                              <FactoryShapesEsymia entity={component} borderVisible />
                            </mesh>
                          );
                        },
                      )
                    ) : (
                      <>
                        {externalGrids &&
                          selectedProject.meshData.externalGrids !== '' &&
                          selectedProject?.meshData.type === 'Standard' ? (
                          <MeshedElement
                            resetFocus={setResetFocus}
                            externalGrids={externalGrids as ExternalGridsObject}
                            selectedMaterials={selectedMaterials}
                          />
                        ) : (
                          <>
                            {externalGrids &&
                              selectedProject.meshData.surface &&
                              selectedProject?.meshData.type === 'Ris' && (
                                // <RisMesh resetFocus={setResetFocus} externalGrids={externalGrids as ExternalGridsRisObject}/>
                                <InstancedSquaresFromVertices
                                  externalGrids={
                                    externalGrids as ExternalGridsRisObject
                                  }
                                  resetFocus={setResetFocus}
                                />
                              )}
                          </>
                        )}
                      </>
                    )}
                  </FocusView>

                  {/*<Screenshot selectedProject={selectedProject}/>*/}
                  <OrbitControls makeDefault zoomToCursor zoomSpeed={0.5} />
                  <GizmoHelper alignment="bottom-left" margin={[150, 80]}>
                    <GizmoViewport
                      axisColors={['red', '#40ff00', 'blue']}
                      labelColor="white"
                    />
                    <group rotation={[-Math.PI / 2, 0, 0]} />
                  </GizmoHelper>
                </Provider>
              </Canvas>
            </div>
          )}
        </ReactReduxContext.Consumer>
      ) : (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border shadow-2xl backdrop-blur-xl ${theme === 'light'
              ? 'bg-white/60 border-white/40 text-gray-600'
              : 'bg-black/40 border-white/10 text-gray-300'
              }`}
          >
            <div
              className={`p-4 rounded-full ${theme === 'light'
                ? 'bg-blue-50 text-blue-500'
                : 'bg-white/5 text-blue-400'
                }`}
            >
              <MdOutlineKeyboardReturn size={32} />
            </div>
            <span className="text-lg font-medium text-center max-w-xs">
              {comeBackToModelerMessage}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
