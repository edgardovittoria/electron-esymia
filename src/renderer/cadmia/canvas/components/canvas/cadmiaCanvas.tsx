import React, { FC, ReactNode, useEffect, useLayoutEffect, useState } from 'react';
import { Provider, ReactReduxContext, useDispatch, useSelector } from 'react-redux';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ComponentEntity,
  componentseSelector,
  FactoryShapes,
  keySelectedComponenteSelector,
  setComponentsOpacity,
} from 'cad-library';
import { Bounds, Edges, GizmoHelper, GizmoViewport, OrbitControls, useBounds } from '@react-three/drei';
import { CanvasObject } from './components/canvasObject';
import { Controls } from './components/controls';
import { invisibleMeshesSelector, meshesWithBordersVisibleSelector } from '../objectsDetailsBar/objectsDetailsSlice';
import { focusToSceneSelector } from '../navBar/menuItems/view/viewItemSlice';

interface CadmiaCanvasProps {}

export const CadmiaCanvas: React.FC<CadmiaCanvasProps> = () => {
  const bordersVisible = useSelector(meshesWithBordersVisibleSelector);
  const components = useSelector(componentseSelector);
  const keySelectedComponent = useSelector(keySelectedComponenteSelector);
  const invisibleMeshesKey = useSelector(invisibleMeshesSelector)
  const [meshSelected, setMeshSelected] = useState<THREE.Mesh | undefined>(
    undefined,
  );

  return (
    <div className="h-[94vh]">
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
                  {components.filter(c => invisibleMeshesKey.filter(key => key === c.keyComponent).length === 0).map((component) => {
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
                  {invisibleMeshesKey.includes(keySelectedComponent) && <MeshEdgesOnly entity={components.filter(c => c.keyComponent === keySelectedComponent)[0]} key={keySelectedComponent}/>}
                </CommonObjectsActions>
              </Bounds>
              {/* <PointerIntersectionOnMeshSurface /> */}
              {!invisibleMeshesKey.includes(keySelectedComponent) && <Controls
                keySelectedComponent={keySelectedComponent}
                mesh={meshSelected}
              />}
              <gridHelper
                args={[
                  500,
                  100,
                  new THREE.Color('red'),
                  new THREE.Color('#1a1818'),
                ]}
                scale={[1, 1, 1]}
              />
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
                  axisColors={["red", "green", "blue"]}
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


const MeshEdgesOnly: FC<{entity: ComponentEntity}> = ({entity}) => {
  return (
    <mesh
      key={entity.keyComponent}
      name={entity.keyComponent.toString()}
      position={entity.transformationParams.position}
      rotation={entity.transformationParams.rotation}
      scale={entity.transformationParams.scale}
    >
      <FactoryShapes entity={{...entity, opacity: 0.0}}/>
      <Edges />
    </mesh>
  )
}
