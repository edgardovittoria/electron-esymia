import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Provider, ReactReduxContext, useSelector } from 'react-redux';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Bounds, Edges, GizmoHelper, GizmoViewport, OrbitControls, Text, useBounds } from '@react-three/drei';
import { CanvasObject } from './components/canvasObject';
import { Controls } from './components/controls';
import { invisibleMeshesSelector, meshesWithBordersVisibleSelector } from '../objectsDetailsBar/objectsDetailsSlice';
import { focusToSceneSelector } from '../navBar/menuItems/view/viewItemSlice';
import { ComponentEntity, componentseSelector, FactoryShapes, keySelectedComponenteSelector } from '../../../../cad_library';
import { String } from 'aws-sdk/clients/apigateway';

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
              <NumberedGrid
                divisions={200}
                size={500}
                gridLineColor={'#1a1818'}
                zeroRefColor={'red'}
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


const NumberedGrid:FC<{size:number, divisions: number, zeroRefColor: String, gridLineColor: String, scale: number[]}> = ({ size = 10, divisions = 10, zeroRefColor='red', gridLineColor='#1a1818', scale=[1,1,1]}) => {
  const step = size / divisions; // Calcola la distanza tra le linee
  const positions = [];

  // Genera le posizioni per i numeri
  for (let i = -size / 2; i <= size / 2; i += step) {
    positions.push(i); // Posizioni lungo gli assi
  }

  return (
    <>
      {/* Griglia */}
      <gridHelper args={[size, divisions, new THREE.Color(zeroRefColor), new THREE.Color(gridLineColor)]} scale={new THREE.Vector3(scale[0], scale[1], scale[2])}/>

      {/* Numeri lungo l'asse X */}
      {positions.map((pos) => (
        <Text
          key={`x-${pos}`}
          position={[pos, 0.06, 0]} // Sopra la griglia
          fontSize={0.1}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {pos.toFixed(2)}
        </Text>
      ))}

      {/* Numeri lungo l'asse Z */}
      {positions.map((pos) => (
        <Text
          key={`z-${pos}`}
          position={[0, 0.06, pos]} // Sopra la griglia
          fontSize={0.1}
          color="black"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI / 2, 0]} // Ruota il testo lungo l'asse Z
        >
          {pos.toFixed(2)}
        </Text>
      ))}
    </>
  );
}
