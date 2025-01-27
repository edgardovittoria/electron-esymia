import {
  Provider,
  ReactReduxContext,
  useDispatch,
  useSelector,
} from 'react-redux';
import {
  boundingBoxDimensionSelector,
  findSelectedPort,
  selectedProjectSelector,
  selectPort,
  updatePortPosition,
} from '../../../../store/projectSlice';
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FocusView } from '../../sharedElements/FocusView';
import uniqid from 'uniqid';
import {
  Edges,
  GizmoHelper,
  GizmoViewport,
  Line,
  OrbitControls,
} from '@react-three/drei';
import React, { FC, useEffect, useRef, useState } from 'react';
import EdgesGenerator from './EdgesGenerator';
import { Port, Probe, TempLumped } from '../../../../model/esymiaModels';
import { PortControls } from './portManagement/PortControls';
import { ProbeControls } from './portManagement/ProbeControls';
import {
  alertMessageStyle,
  comeBackToModelerMessage,
} from '../../../config/textMessages';
import { CircleGeometryAttributes, ComponentEntity, FactoryShapes, TransformationParams } from '../../../../../cad_library';
import { ThemeSelector } from '../../../../store/tabsAndMenuItemsSlice';
import { FactoryShapesEsymia } from '../../../../../cad_library/components/baseShapes/factoryShapes';

interface CanvasPhysicsProps {
  setCameraPosition: Function;
  surfaceAdvices: boolean;
  setSurfaceAdvices: Function;
  setSavedPortParameters: Function;
  resetFocus: boolean;
}

export const CanvasPhysics: React.FC<CanvasPhysicsProps> = ({
  setCameraPosition,
  surfaceAdvices,
  setSavedPortParameters,
  setSurfaceAdvices,
  resetFocus,
}) => {
  const selectedProject = useSelector(selectedProjectSelector);
  const dispatch = useDispatch();
  const selectedPort = findSelectedPort(selectedProject);
  const theme = useSelector(ThemeSelector)
  const mesh = useRef<THREE.Mesh[]>([]);
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

  return (
    <div className="flex justify-center">
      {selectedProject && selectedProject.model?.components ? (
        <ReactReduxContext.Consumer>
          {({ store }) => (
            <div className="flex flex-col">
              <Canvas className="w-[100vw] lg:h-[70vh] xl:h-[82vh]">
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
                    {selectedProject.model.components.map(
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
                              if (selectedPort && !selectedProject.simulation?.resultS3) {
                                setPointerEvent(e);
                                setSurfaceAdvices(false);
                              }
                            }}
                          >
                            <FactoryShapesEsymia entity={component} />
                            <Edges />
                          </mesh>
                        );
                      },
                    )}
                  </FocusView>
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
                  {/*<Screenshot selectedProject={selectedProject}/>*/}
                  <OrbitControls makeDefault />
                  <GizmoHelper alignment="bottom-left" margin={[150, 80]}>
                    <GizmoViewport
                      axisColors={['red', '#40ff00', 'blue']}
                      labelColor="white"
                    />
                  </GizmoHelper>
                  {/*<Screenshot selectedProject={selectedProject} />*/}
                </Provider>
              </Canvas>
            </div>
          )}
        </ReactReduxContext.Consumer>
      ) : (
        <div className="absolute top-1/2">
          <span className={`${alertMessageStyle} ${theme === 'light' ? 'text-textColor' : 'text-textColorDark'}`}>{comeBackToModelerMessage}</span>
        </div>
      )}
    </div>
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
      type: 'CIRCLE',
      keyComponent: 0,
      geometryAttributes: {
        radius: (size as number) / 100,
        segments: 20,
      } as CircleGeometryAttributes,
      name: (inputOrOutput === 'in') ? 'inputPort' + port.name : 'outputPort' + port.name,
      orbitEnabled: false,
      transformationParams: {
        position: (inputOrOutput === 'in') ? port.inputElement : port.outputElement,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      } as TransformationParams,
      previousTransformationParams: {
        position: (inputOrOutput === 'in') ? port.inputElement : port.outputElement,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      } as TransformationParams,
      opacity: 1,
      transparency: false,
    } as ComponentEntity;
    return entity
  };

  return (
    <>
      {selectedProject?.ports.map((port, index) => {
        if (port.category === 'port' || port.category === 'lumped') {
          return (
            <group key={index}>
              <mesh
                name={'inputPort' + port.name}
                position={port.inputElement}
                onClick={() => dispatch(selectPort(port.name))}
              >
                <FactoryShapes entity={componentEntityFrom(port, 'in')} color="#00ff00" />
              </mesh>

              <mesh
                name={'outputPort' + port.name}
                position={port.outputElement}
                onClick={() => dispatch(selectPort(port.name))}
              >
                <FactoryShapes entity={componentEntityFrom(port, 'out')} />
              </mesh>
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
        return (
          <group
            key={port.name}
            name={port.name}
            onClick={() => dispatch(selectPort(port.name))}
            position={(port as Probe).groupPosition}
          >
            {(port as Probe).elements.map((element, index) => {
              return (
                <mesh
                  key={index}
                  position={element.transformationParams.position}
                  scale={element.transformationParams.scale}
                  rotation={element.transformationParams.rotation}
                >
                  <FactoryShapes entity={element} color="orange" />
                </mesh>
              );
            })}
          </group>
        );
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
          {selectedPort && selectedPort.category === 'probe' && (
            <ProbeControls
              selectedProbe={selectedPort as Probe}
              updateProbePosition={(obj: {
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
