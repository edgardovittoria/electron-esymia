import React, { FC, useEffect, useRef, useState } from 'react';
import { Canvas, ThreeEvent, useThree, useFrame } from '@react-three/fiber';
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
  alertMessageStyle,
  comeBackToModelerMessage,
} from '../../../../config/textMessages';
import {
  CircleGeometryAttributes,
  ComponentEntity,
  FactoryShapes,
  TransformationParams,
  SphereGeometryAttributes,
} from '../../../../../../cad_library';
import { ThemeSelector } from '../../../../../store/tabsAndMenuItemsSlice';
import {
  InstancedSquaresFromVertices,
  RisMesh,
} from '../../mesher/components/MeshedElement/components/RisMesh';
import { FactoryShapesEsymia } from '../../../../../../cad_library/components/baseShapes/factoryShapes';
import EdgesGenerator from '../../physics/EdgesGenerator';
import { GizmoArrowViewport } from './planeWave/components/GizmoArrowViewport';
import { PortControls } from '../../physics/portManagement/PortControls';
import { ProbeControls } from '../../physics/portManagement/ProbeControls';
import { calculateModelBoundingBox } from '../../../sharedElements/utilityFunctions';
import { MdOutlineKeyboardReturn } from 'react-icons/md';

interface CanvasSolverProps {
  externalGrids: ExternalGridsObject | ExternalGridsRisObject | undefined;
  selectedMaterials: string[];
  resetFocus: boolean;
  setResetFocus: Function;
  setSavedPortParameters: Function;
  setCameraPosition: Function;
  surfaceAdvices: boolean;
  setSurfaceAdvices: Function;
  simulationType: 'Matrix' | 'Matrix_ACA' | 'Electric Fields' | 'Both';
  viewMesh: boolean;
}

export const CanvasSolver: React.FC<CanvasSolverProps> = ({
  externalGrids,
  selectedMaterials,
  resetFocus,
  setResetFocus,
  setSavedPortParameters,
  setCameraPosition,
  surfaceAdvices,
  setSurfaceAdvices,
  simulationType,
  viewMesh,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedPort = findSelectedPort(selectedProject);
  const theme = useSelector(ThemeSelector);
  const dispatch = useDispatch();
  const mesh = useRef<THREE.Mesh[]>([]);
  const getTarget = () => {
    return mesh.current
      ? mesh.current[0].getWorldPosition(new THREE.Vector3())
      : new THREE.Vector3();
  };
  const [pointerEvent, setPointerEvent] = useState<
    ThreeEvent<MouseEvent> | undefined
  >(undefined);
  const setMesh = (meshToSet: THREE.Mesh | null, index: number) => {
    if (meshToSet) {
      mesh.current[index] = meshToSet;
    }
  };
  const [inputPortPositioned, setInputPortPositioned] = useState(false);

  useEffect(() => {
    if (pointerEvent) {
      if (!inputPortPositioned) {
        dispatch(
          updatePortPosition({
            type: 'first',
            position: [
              pointerEvent.point.x,
              pointerEvent.point.y,
              pointerEvent.point.z,
            ],
          }),
        );
        setInputPortPositioned(true);
      } else {
        dispatch(
          updatePortPosition({
            type: 'last',
            position: [
              pointerEvent.point.x,
              pointerEvent.point.y,
              pointerEvent.point.z,
            ],
          }),
        );
        setInputPortPositioned(false);
      }
    }
  }, [pointerEvent]);

  const boundingBoxDimension = useSelector(boundingBoxDimensionSelector);
  useEffect(() => {
    if (!boundingBoxDimension) {
      const boundingbox = calculateModelBoundingBox(selectedProject as Project);
      dispatch(setBoundingBoxDimension(boundingbox.getSize(boundingbox.max).x));
    }
  }, []);

  return (
    <div className="flex justify-center">
      {selectedProject && selectedProject.model?.components ? (
        <ReactReduxContext.Consumer>
          {({ store }) => (
            <div className="flex flex-col">
              <Canvas
                className="w-[100vw] lg:h-[70vh] xl:h-[72vh]"
                camera={{ position: [0, -3, 0], up: [0, 0, 1], fov: 50, near: 0.1 }}
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
                  <CanvasInfo setCameraPosition={setCameraPosition} />
                  <FocusView resetFocus={resetFocus}>
                    {boundingBoxDimension && !viewMesh &&
                      (simulationType === 'Both' ||
                        simulationType === 'Electric Fields') &&
                      selectedProject.radialFieldParameters && (
                        <>
                          <Circle
                            radius={boundingBoxDimension}
                            //radius={selectedProject.radialFieldParameters.radius}
                            //center={calculateCenter(mesh.current)}
                            center={selectedProject.radialFieldParameters.center}
                            plane={'xy'}
                            boundingBox={boundingBoxDimension}
                            color={'black'}
                          />
                          <Circle
                            radius={boundingBoxDimension}
                            //radius={selectedProject.radialFieldParameters.radius}
                            //center={calculateCenter(mesh.current)}
                            center={selectedProject.radialFieldParameters.center}
                            plane={getOrthogonalPlane('xy')}
                            boundingBox={boundingBoxDimension}
                            color={'black'}
                          />
                          <Circle
                            radius={boundingBoxDimension}
                            //radius={selectedProject.radialFieldParameters.radius}
                            //center={calculateCenter(mesh.current)}
                            center={selectedProject.radialFieldParameters.center}
                            plane={getOrthogonalPlane('xz')}
                            boundingBox={boundingBoxDimension}
                            color="black"
                          />
                        </>
                      )}
                    {!viewMesh ? (
                      selectedProject.model.components.map(
                        (component: ComponentEntity, index: number) => {
                          return (
                            <mesh
                              ref={(el) => {
                                setMesh(el, index);
                              }}
                              userData={{
                                keyComponent: component.keyComponent,
                                isSelected: false,
                              }}
                              key={uniqid()}
                              position={component.transformationParams.position}
                              scale={component.transformationParams.scale}
                              rotation={component.transformationParams.rotation}
                              onDoubleClick={(e) => {
                                if (
                                  selectedPort &&
                                  !selectedProject.simulation?.resultS3
                                ) {
                                  setPointerEvent(e);
                                  setSurfaceAdvices(false);
                                }
                              }}
                            >
                              <FactoryShapesEsymia entity={component} borderVisible={true} />
                            </mesh>
                          );
                        },
                      )
                    ) : (
                      <>
                        {externalGrids &&
                          selectedProject.meshData.externalGrids !== '' &&
                          viewMesh &&
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
                              viewMesh &&
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
                  {!viewMesh && (
                    <>
                      {surfaceAdvices && (
                        <EdgesGenerator
                          meshRef={mesh}
                          inputPortPositioned={inputPortPositioned as boolean}
                          setInputPortPositioned={
                            setInputPortPositioned as Function
                          }
                        />
                      )}
                      <PhysicsPortsDrawer />
                      <PhysicsPortsControlsDrawer
                        setSavedPortParameters={setSavedPortParameters}
                      />
                    </>
                  )}

                  {/*<Screenshot selectedProject={selectedProject}/>*/}
                  <OrbitControls makeDefault zoomToCursor zoomSpeed={0.2} />
                  <GizmoHelper
                    alignment="bottom-left"
                    margin={[150, 80]}
                    renderPriority={1}
                    onTarget={getTarget}
                  >
                    <GizmoViewport
                      axisColors={['red', '#40ff00', 'blue']}
                      labelColor="white"
                    />
                    <group rotation={[-Math.PI / 2, 0, 0]} />
                  </GizmoHelper>
                  {selectedProject.planeWaveParameters && !viewMesh &&
                    (simulationType === 'Electric Fields') && (
                      <GizmoHelper
                        alignment="bottom-right"
                        margin={[400, 300]}
                        renderPriority={2}
                        onTarget={getTarget}
                      >
                        <GizmoArrowViewport
                          axisColors={['black', 'black', 'black']}
                          directionX={new THREE.Vector3(1, 0, 0)}
                          directionY={new THREE.Vector3(0, 1, 0)}
                          directionZ={new THREE.Vector3(0, 0, 1)}
                          theta={
                            selectedProject.planeWaveParameters.input.theta
                          }
                          phi={selectedProject.planeWaveParameters.input.phi}
                          E={selectedProject.planeWaveParameters.output.E}
                          K={selectedProject.planeWaveParameters.output.K}
                          H={selectedProject.planeWaveParameters.output.H}
                          E_theta_v={
                            selectedProject.planeWaveParameters.output.E_theta_v
                          }
                          E_phi_v={
                            selectedProject.planeWaveParameters.output.E_phi_v
                          }
                        />
                      </GizmoHelper>
                    )}
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
              } `}
          >
            <div
              className={`p-4 rounded-full ${theme === 'light'
                ? 'bg-blue-50 text-blue-500'
                : 'bg-white/5 text-blue-400'
                } `}
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

const PortSphere: FC<{
  name: string;
  position: [number, number, number];
  entity: ComponentEntity;
  onClick: () => void;
  color: string;
}> = ({ name, position, entity, onClick, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh
      ref={meshRef}
      name={name}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <FactoryShapes entity={entity} color={color} />
    </mesh>
  );
};

const PhysicsPortsDrawer: FC = () => {
  const size = useSelector(boundingBoxDimensionSelector);
  const selectedProject = useSelector(selectedProjectSelector);
  const dispatch = useDispatch();

  const componentEntityFrom = (
    port: Port | TempLumped,
    inputOrOutput: 'in' | 'out',
  ) => {
    let entity = {
      type: 'SPHERE',
      keyComponent: 0,
      geometryAttributes: {
        radius: (size as number) / 300,
        widthSegments: 32,
        heightSegments: 32,
      } as SphereGeometryAttributes,
      name:
        inputOrOutput === 'in'
          ? 'inputPort' + port.name
          : 'outputPort' + port.name,
      orbitEnabled: false,
      transformationParams: {
        position:
          inputOrOutput === 'in' ? port.inputElement : port.outputElement,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      } as TransformationParams,
      previousTransformationParams: {
        position:
          inputOrOutput === 'in' ? port.inputElement : port.outputElement,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      } as TransformationParams,
      opacity: 1,
      transparency: false,
    } as ComponentEntity;
    return entity;
  };

  return (
    <>
      {selectedProject?.ports.map((port, index) => {
        if (port.category === 'port' || port.category === 'lumped') {
          return (
            <group key={index}>
              <PortSphere
                name={'inputPort' + port.name}
                position={port.inputElement}
                onClick={() => dispatch(selectPort(port.name))}
                entity={componentEntityFrom(port, 'in')}
                color="#00ff00"
              />

              <PortSphere
                name={'outputPort' + port.name}
                position={port.outputElement}
                onClick={() => dispatch(selectPort(port.name))}
                entity={componentEntityFrom(port, 'out')}
                color="#ea17d8"
              />
              <Line
                points={[port.inputElement, port.outputElement]}
                color={
                  port.category === 'port'
                    ? new THREE.Color('red').getHex()
                    : new THREE.Color('violet').getHex()
                }
                lineWidth={1}
              />
            </group>
          );
        }
      })}
    </>
  );
};

const PhysicsPortsControlsDrawer: FC<{ setSavedPortParameters: Function }> = ({
  setSavedPortParameters,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const selectedPort = findSelectedPort(selectedProject);
  const dispatch = useDispatch();
  return (
    <>
      {selectedProject?.simulation?.status !== 'Completed' ? (
        <>
          {selectedPort &&
            (selectedPort.category === 'port' ||
              selectedPort.category === 'lumped') && (
              <PortControls
                selectedPort={selectedPort}
                updatePortPosition={(obj: {
                  type: 'first' | 'last';
                  position: [number, number, number];
                }) => dispatch(updatePortPosition(obj))}
                setSavedPortParameters={setSavedPortParameters}
              />
            )}
        </>
      ) : (
        <>
          {selectedPort &&
            (selectedPort.category === 'port' ||
              selectedPort.category === 'lumped') && (
              <PortControls
                selectedPort={selectedPort}
                updatePortPosition={(obj: {
                  type: 'first' | 'last';
                  position: [number, number, number];
                }) => dispatch(updatePortPosition(obj))}
                setSavedPortParameters={setSavedPortParameters}
                disabled={true}
              />
            )}
        </>
      )}
    </>
  );
};

const CanvasInfo: React.FC<{ setCameraPosition: Function }> = ({
  setCameraPosition,
}) => {
  const { camera, controls } = useThree();
  useEffect(() => {
    setCameraPosition(camera.position);
  }, []);
  return <></>;
};

const Circle: React.FC<{
  radius: number;
  center: { x: number; y: number; z: number };
  plane: string;
  boundingBox: number;
  color: string;
}> = ({ radius, center, plane, boundingBox, color }) => {
  const { x, y, z } = center;

  // Determina la rotazione in base al piano scelto

  const rotations = {
    xy: new THREE.Euler(0, 0, 0), // Giace sul piano XY
    xz: new THREE.Euler(Math.PI / 2, 0, 0), // Giace sul piano XZ
    yz: new THREE.Euler(0, Math.PI / 2, 0), // Giace sul piano YZ
  };
  let rotation = new THREE.Euler(0, 0, 0);
  if (plane === 'xy') {
    rotation = rotations.xy;
  } else if (plane === 'xz') {
    rotation = rotations.xz;
  } else {
    rotation = rotations.yz;
  }
  return (
    <mesh position={[x, y, z]} rotation={rotation}>
      <ringGeometry args={[radius - 0.01 * boundingBox, radius, 64]} />
      <meshBasicMaterial color={new THREE.Color(color)} side={2} />
    </mesh>
  );
};

function getOrthogonalPlane(plane: string) {
  switch (plane) {
    case 'xy':
      return 'xz';
      break;
    case 'xz':
      return 'yz';
      break;
    case 'yz':
      return 'xy';
    default:
      return 'xy';
      break;
  }
}

function calculateCenter(objects: THREE.Mesh[]) {
  if (objects.length === 0) return { x: 0, y: 0, z: 0 };

  const sum = objects.reduce(
    (acc, obj) => ({
      x: acc.x + obj.position.x,
      y: acc.y + obj.position.y,
      z: acc.z + obj.position.z,
    }),
    { x: 0, y: 0, z: 0 },
  );

  return {
    x: sum.x / objects.length,
    y: sum.y / objects.length,
    z: sum.z / objects.length,
  };
}
