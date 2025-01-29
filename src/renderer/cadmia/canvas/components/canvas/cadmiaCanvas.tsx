import React, {
  FC,
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Provider, ReactReduxContext, useSelector } from 'react-redux';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  Bounds,
  Edges,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  Text,
  useBounds,
} from '@react-three/drei';
import { CanvasObject } from './components/canvasObject';
import { Controls } from './components/controls';
import {
  invisibleMeshesSelector,
  meshesWithBordersVisibleSelector,
} from '../objectsDetailsBar/objectsDetailsSlice';
import { focusToSceneSelector } from '../navBar/menuItems/view/viewItemSlice';
import {
  ComponentEntity,
  componentseSelector,
  FactoryShapes,
  getObjectsFromSceneByType,
  keySelectedComponenteSelector,
  meshFrom,
} from '../../../../cad_library';
import { String } from 'aws-sdk/clients/apigateway';

interface CadmiaCanvasProps {
  triggerUpdate: React.MutableRefObject<(() => void) | null>;
}

export const CadmiaCanvas: React.FC<CadmiaCanvasProps> = ({
  triggerUpdate,
}) => {
  const bordersVisible = useSelector(meshesWithBordersVisibleSelector);
  const components = useSelector(componentseSelector);
  const keySelectedComponent = useSelector(keySelectedComponenteSelector);
  const invisibleMeshesKey = useSelector(invisibleMeshesSelector);
  const [meshSelected, setMeshSelected] = useState<THREE.Mesh | undefined>(
    undefined,
  );

  return (
    <div className="h-[91vh]">
      <ReactReduxContext.Consumer>
        {({ store }) => (
          <Canvas
            className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-100"
            camera={{
              position: [0, 50, 0],
              fov: 20,
              far: 1000,
              near: 0.1,
            }}
          >
            <Provider store={store}>
              <pointLight position={[100, 100, 100]} intensity={1.8} />
              <pointLight position={[-100, -100, 100]} intensity={1.8} />
              <hemisphereLight
                color="#ffffff"
                groundColor={new THREE.Color('#b9b9b9')}
                position={[-7, 25, 13]}
                intensity={1.85}
              />
              <Bounds fit clip observe margin={1.2}>
                <CommonObjectsActions>
                  {components
                    .filter(
                      (c) =>
                        invisibleMeshesKey.filter(
                          (key) => key === c.keyComponent,
                        ).length === 0,
                    )
                    .map((component) => {
                      return (
                        <CanvasObject
                          setMeshRef={setMeshSelected}
                          key={component.keyComponent}
                          keyComponent={component.keyComponent}
                          transformationParams={component.transformationParams}
                          borderVisible={
                            bordersVisible.filter(
                              (mb) => mb === component.keyComponent,
                            ).length > 0
                          }
                        >
                          <FactoryShapes
                            entity={component}
                            color={
                              component.material
                                ? component.material.color
                                : '#63cbf7'
                            }
                          />
                        </CanvasObject>
                      );
                    })}
                  {invisibleMeshesKey.includes(keySelectedComponent) && (
                    <MeshEdgesOnly
                      entity={
                        components.filter(
                          (c) => c.keyComponent === keySelectedComponent,
                        )[0]
                      }
                      key={keySelectedComponent}
                    />
                  )}
                </CommonObjectsActions>
              </Bounds>
              {/* <PointerIntersectionOnMeshSurface /> */}
              {!invisibleMeshesKey.includes(keySelectedComponent) && (
                <Controls
                  keySelectedComponent={keySelectedComponent}
                  mesh={meshSelected}
                />
              )}
              <DynamicGrid triggerUpdate={triggerUpdate} />
              <OrbitControls
                addEventListener={undefined}
                hasEventListener={undefined}
                removeEventListener={undefined}
                dispatchEvent={undefined}
                makeDefault
                // target={(orbitTarget) ? new THREE.Vector3(orbitTarget?.position[0], orbitTarget?.position[1], orbitTarget?.position[2]): new THREE.Vector3(0,0,0)}
              />
              <GizmoHelper alignment="bottom-right">
                <GizmoViewport
                  axisColors={['red', 'green', 'blue']}
                  labelColor="white"
                />
              </GizmoHelper>
            </Provider>
          </Canvas>
        )}
      </ReactReduxContext.Consumer>
    </div>
  );
};

const CommonObjectsActions: FC<{ children: ReactNode }> = ({ children }) => {
  const bounds = useBounds();
  const focusToScene = useSelector(focusToSceneSelector);
  useEffect(() => {
    focusToScene && bounds.refresh().clip().fit();
  }, [focusToScene]);

  return <group>{children}</group>;
};

const MeshEdgesOnly: FC<{ entity: ComponentEntity }> = ({ entity }) => {
  return (
    <mesh
      key={entity.keyComponent}
      name={entity.keyComponent.toString()}
      position={entity.transformationParams.position}
      rotation={entity.transformationParams.rotation}
      scale={entity.transformationParams.scale}
    >
      <FactoryShapes entity={{ ...entity, opacity: 0.0 }} />
      <Edges />
    </mesh>
  );
};

interface DynamicGridProps {
  triggerUpdate: React.MutableRefObject<(() => void) | null>;
}

function DynamicGrid({ triggerUpdate }: DynamicGridProps) {
  const [boundingBox, setBoundingBox] = useState(new THREE.Box3());
  const components = useSelector(componentseSelector);

  const updateGrid = useCallback(() => {
    const newBoundingBox = new THREE.Box3();
    components.forEach((c) =>
      newBoundingBox.union(new THREE.Box3().setFromObject(meshFrom(c))),
    );
    if (newBoundingBox.isEmpty()) {
      setBoundingBox(new THREE.Box3(new THREE.Vector3(-20, -20, -20), new THREE.Vector3(20, 20, 20)));
    } else {
      setBoundingBox(newBoundingBox.expandByScalar(1.2)); // Aggiungi un margine
    }
  }, [components]);

  triggerUpdate.current = updateGrid;

  const size = boundingBox.getSize(new THREE.Vector3());
  const center = boundingBox.getCenter(new THREE.Vector3());
  const gridSize = Math.max(...size); // Dimensione massima per griglie quadrate
  const gridDivisions = 20;
  const halfGridSize = gridSize / 2;

  // Funzione per calcolare le posizioni dei numeri
  const calculateGridNumbers = useCallback((axis: 'x' | 'y' | 'z') => {
    const step = gridSize / gridDivisions; // Calcola lo step
    const start = center[axis] - halfGridSize; // Posizione iniziale rispetto al centro
    return Array.from({ length: gridDivisions/2 + 1 }, (_, i) => start + i * 2* step);
  }, [gridSize, gridDivisions, center]);

  const xNumbers = calculateGridNumbers('x');
  const yNumbers = calculateGridNumbers('y');
  const zNumbers = calculateGridNumbers('z');

  useEffect(() => {
    // Aggiorna le griglie al montaggio iniziale
    updateGrid();
  }, []); // se mettiamo updateGrid come dipendenza, allora le griglie si aggiornano in automatico ad ogni cambiamento della bounding box.

  return (
    <>
      {/* Griglia sul piano XZ */}
      <gridHelper
        args={[gridSize, gridDivisions, "yellow", "gray"]}
        position={[center.x, center.y - halfGridSize, center.z]}
      />
      {xNumbers.map((value, index) => (
        <Text
          key={`xz-x-${index}`}
          position={[value, center.y - halfGridSize, center.z - halfGridSize]}
          fontSize={gridSize / gridDivisions / 3}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {value.toFixed(2)}
        </Text>
      ))}
      {zNumbers.map((value, index) => (
        <Text
          key={`xz-z-${index}`}
          position={[center.x - halfGridSize, center.y - halfGridSize, value]}
          fontSize={gridSize / gridDivisions / 3}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {value.toFixed(2)}
        </Text>
      ))}

      {/* Griglia sul piano XY */}
      <gridHelper
        args={[gridSize, gridDivisions, "yellow", "gray"]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[center.x, center.y, center.z - halfGridSize]}
      />
      {xNumbers.map((value, index) => (
        <Text
          key={`xy-x-${index}`}
          position={[value, center.y - halfGridSize, center.z - halfGridSize]}
          fontSize={gridSize / gridDivisions / 3}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {value.toFixed(2)}
        </Text>
      ))}
      {yNumbers.map((value, index) => (
        <Text
          key={`xy-y-${index}`}
          position={[center.x - halfGridSize, value, center.z - halfGridSize]}
          fontSize={gridSize / gridDivisions / 3}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {value.toFixed(2)}
        </Text>
      ))}

      {/* Griglia sul piano YZ */}
      <gridHelper
        args={[gridSize, gridDivisions, "yellow", "gray"]}
        rotation={[0, 0, Math.PI / 2]}
        position={[center.x - halfGridSize, center.y, center.z]}
      />
      {yNumbers.map((value, index) => (
        <Text
          key={`yz-y-${index}`}
          position={[center.x - halfGridSize, value, center.z - halfGridSize]}
          fontSize={gridSize / gridDivisions / 3}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {value.toFixed(2)}
        </Text>
      ))}
      {zNumbers.map((value, index) => (
        <Text
          key={`yz-z-${index}`}
          position={[center.x - halfGridSize, center.y - halfGridSize, value]}
          fontSize={gridSize / gridDivisions / 3}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {value.toFixed(2)}
        </Text>
      ))}
    </>
  );
}




