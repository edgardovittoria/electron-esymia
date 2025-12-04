import React, {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { Provider, ReactReduxContext, useSelector } from 'react-redux';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  Bounds,
  Edges,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  Text,
  useBounds,
  Environment,
  ContactShadows,
} from '@react-three/drei';
import { CanvasObject } from './components/canvasObject';
import { Controls } from './components/controls';
import {
  invisibleMeshesSelector,
  meshesWithBordersVisibleSelector,
} from '../objectsDetailsBar/objectsDetailsSlice';
import { focusToSceneSelector } from '../navBar/menuItems/view/viewItemSlice';
import { ThemeSelector } from '../../../../esymia/store/tabsAndMenuItemsSlice';
import { MeasurementHandler } from '../measurement/MeasurementHandler';
import {
  ComponentEntity,
  componentseSelector,
  FactoryShapes,
  keySelectedComponenteSelector,
  meshFrom,
  TransformationParams,
  updateTransformationParams,
  selectComponent,
} from '../../../../cad_library';
import { alignObjectsByFaces, getAllMeshes } from '../../../../cad_library/components/auxiliaryFunctionsUsingThree/snapLogic';
import { useDispatch } from 'react-redux';
import { addSelectedFace, attachModeSelector, selectedFacesSelector, toggleAttachMode } from '../binaryOperationsToolbar/binaryOperationsToolbarSlice';
import { addNode } from '../../../store/historySlice';
import uniqid from 'uniqid';

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

  const theme = useSelector(ThemeSelector);

  return (
    <div className={`h-[91vh] ${theme === 'light' ? 'bg-gradient-to-b from-gray-50 to-gray-200' : 'bg-gradient-to-b from-gray-800 to-gray-950'}`}>
      <ReactReduxContext.Consumer>
        {({ store }) => (
          <Canvas
            className="w-full h-full"
            camera={{ position: [0, -50, 0], up: [0, 0, 1], fov: 50, far: 5000, near: 0.1 }}
            shadows
            gl={{ alpha: true }}
          >
            {/* <color attach="background" args={[theme === 'light' ? '#f0f0f0' : '#111827']} /> */}
            {/* <fog attach="fog" args={[theme === 'light' ? '#f0f0f0' : '#111827', 10, 500]} /> */}
            <Provider store={store}>
              <Environment preset="city" />
              <ambientLight intensity={1} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              {/* <ContactShadows
                position={[0, -0.1, 0]}
                opacity={0.4}
                scale={50}
                blur={1.5}
                far={10}
                resolution={256}
                color="#000000"
              /> */}
              <Bounds fit clip observe>
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
                          materialColor={
                            component.material
                              ? component.material.color
                              : '#63cbf7'
                          }
                        >
                          <FactoryShapes
                            entity={component}
                            color={
                              component.material
                                ? component.material.color
                                : undefined
                            }
                            borderVisible={
                              bordersVisible.filter(
                                (mb) => mb === component.keyComponent,
                              ).length > 0
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
                zoomToCursor
                makeDefault
                // minDistance={10}
                // maxDistance={1000}
                zoomSpeed={0.5}
              // target={(orbitTarget) ? new THREE.Vector3(orbitTarget?.position[0], orbitTarget?.position[1], orbitTarget?.position[2]): new THREE.Vector3(0,0,0)}
              />
              <GizmoHelper alignment="bottom-right">
                <GizmoViewport
                  axisColors={['red', 'green', 'blue']}
                  labelColor={theme === 'light' ? 'black' : 'white'}
                />
                <group rotation={[-Math.PI / 2, 0, 0]} />
              </GizmoHelper>
              <SelectedObjectHighlighter />
              <FaceSelectionHandler />
              <SelectedFacesHighlighter />
              <SelectedFacesHighlighter />
              <MeasurementHandler />
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
    if (focusToScene > 0) {
      bounds.refresh().clip().fit();
    }
  }, [focusToScene]);

  return <group>{children}</group>;
};

const MeshEdgesOnly: FC<{ entity: ComponentEntity }> = ({ entity }) => {
  const entityWithZeroOpacity = useMemo(() => setOpacityRecursively(entity, 0.0), [entity]);

  return (
    <mesh
      key={entity.keyComponent}
      name={entity.keyComponent.toString()}
      position={entity.transformationParams.position}
      rotation={entity.transformationParams.rotation}
      scale={entity.transformationParams.scale}
    >
      <FactoryShapes entity={entityWithZeroOpacity} borderVisible={true} />
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
    components.forEach((c) => {
      console.log(c);
      if (c.type === "GROUP") {
        (c as any).children.forEach((child: any) => {
          newBoundingBox.union(new THREE.Box3().setFromObject(meshFrom(child)));
        });
      } else {
        newBoundingBox.union(new THREE.Box3().setFromObject(meshFrom(c)));
      }
    });
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
    return Array.from({ length: gridDivisions / 2 + 1 }, (_, i) => start + i * 2 * step);
  }, [gridSize, gridDivisions, center]);

  const xNumbers = calculateGridNumbers('x');
  const yNumbers = calculateGridNumbers('y');
  const zNumbers = calculateGridNumbers('z');

  const theme = useSelector(ThemeSelector);

  useEffect(() => {
    // Aggiorna le griglie al montaggio iniziale
    updateGrid();
  }, []); // se mettiamo updateGrid come dipendenza, allora le griglie si aggiornano in automatico ad ogni cambiamento della bounding box.

  const gridColor = theme === 'light' ? 'gray' : '#4b5563';
  const textColor = theme === 'light' ? 'black' : 'white';

  return (
    <>
      {/* Griglia sul piano XZ */}
      <gridHelper
        args={[gridSize, gridDivisions, "yellow", gridColor]}
        position={[center.x, center.y + halfGridSize, center.z]}
      />
      {xNumbers.map((value, index) => (
        <Text
          key={`xz-x-${index}`}
          position={[value, center.y + halfGridSize, center.z - halfGridSize]}
          fontSize={gridSize / gridDivisions / 3}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          rotation={[Math.PI / 2, 0, 0]} // Rotazione per allineare al piano XZ
        >
          {value.toFixed(2)}
        </Text>
      ))}
      {zNumbers.map((value, index) => (
        <Text
          key={`xz-z-${index}`}
          position={[center.x - halfGridSize, center.y + halfGridSize, value]}
          fontSize={gridSize / gridDivisions / 3}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          rotation={[Math.PI / 2, 0, 0]} // Rotazione per allineare al piano XZ
        >
          {value.toFixed(2)}
        </Text>
      ))}

      {/* Griglia sul piano XY */}
      <gridHelper
        args={[gridSize, gridDivisions, "yellow", gridColor]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[center.x, center.y, center.z - halfGridSize]}
      />
      {xNumbers.map((value, index) => (
        <Text
          key={`xy-x-${index}`}
          position={[value, center.y + halfGridSize, center.z - halfGridSize]}
          fontSize={gridSize / gridDivisions / 3}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          rotation={[Math.PI / 2, 0, 0]} // Rotazione per allineare al piano XZ
        >
          {value.toFixed(2)}
        </Text>
      ))}
      {yNumbers.map((value, index) => (
        <Text
          key={`xy-y-${index}`}
          position={[center.x - halfGridSize, value, center.z - halfGridSize]}
          fontSize={gridSize / gridDivisions / 3}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          rotation={[Math.PI / 2, 0, 0]} // Rotazione per allineare al piano XZ
        >
          {value.toFixed(2)}
        </Text>
      ))}

      {/* Griglia sul piano YZ */}
      <gridHelper
        args={[gridSize, gridDivisions, "yellow", gridColor]}
        rotation={[0, 0, Math.PI / 2]}
        position={[center.x - halfGridSize, center.y, center.z]}
      />
      {yNumbers.map((value, index) => (
        <Text
          key={`yz-y-${index}`}
          position={[center.x - halfGridSize, value, center.z - halfGridSize]}
          fontSize={gridSize / gridDivisions / 3}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          rotation={[Math.PI / 2, 0, 0]} // Rotazione per allineare al piano XZ
        >
          {value.toFixed(2)}
        </Text>
      ))}
      {zNumbers.map((value, index) => (
        <Text
          key={`yz-z-${index}`}
          position={[center.x - halfGridSize, center.y + halfGridSize, value]}
          fontSize={gridSize / gridDivisions / 3}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          rotation={[Math.PI / 2, 0, 0]} // Rotazione per allineare al piano XZ
        >
          {value.toFixed(2)}
        </Text>
      ))}
    </>
  );
}

const SelectedObjectHighlighter: FC = () => {
  const keySelectedComponent = useSelector(keySelectedComponenteSelector);
  const components = useSelector(componentseSelector);
  const selectedComponent = components.find(
    (c) => c.keyComponent === keySelectedComponent
  );

  const target = useMemo(() => {
    const t = new THREE.Object3D();
    if (selectedComponent) {
      const { position } = selectedComponent.transformationParams;
      t.position.set(position[0], position[1], position[2]);
    }
    return t;
  }, [selectedComponent]);

  if (!selectedComponent) return null;

  const { position } = selectedComponent.transformationParams;
  const [x, y, z] = position;

  return (
    <>
      <primitive object={target} />
      <spotLight
        position={[x + 20, y - 20, z + 20]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        target={target}
      />
      <spotLight
        position={[x - 20, y + 20, z + 20]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        target={target}
      />
      <pointLight position={[x, y, z + 10]} intensity={1.5} distance={50} decay={2} />
    </>
  );
};

const getCoplanarFacesVertices = (mesh: THREE.Mesh, face: THREE.Face): number[][] => {
  const geometry = mesh.geometry;
  const positionAttribute = geometry.attributes.position;
  const indexAttribute = geometry.index;
  const matrixWorld = mesh.matrixWorld;

  const vertices: number[][] = [];

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();

  const getVertex = (i: number, target: THREE.Vector3) => {
    target.fromBufferAttribute(positionAttribute, i);
  };

  // Calculate reference normal from the clicked face
  getVertex(face.a, vA);
  getVertex(face.b, vB);
  getVertex(face.c, vC);

  const cb = new THREE.Vector3();
  const ab = new THREE.Vector3();
  cb.subVectors(vC, vB);
  ab.subVectors(vA, vB);
  cb.cross(ab).normalize();
  const referenceNormal = cb.clone();

  const faceCount = indexAttribute ? indexAttribute.count / 3 : positionAttribute.count / 3;

  for (let i = 0; i < faceCount; i++) {
    let a, b, c;
    if (indexAttribute) {
      a = indexAttribute.getX(i * 3);
      b = indexAttribute.getX(i * 3 + 1);
      c = indexAttribute.getX(i * 3 + 2);
    } else {
      a = i * 3;
      b = i * 3 + 1;
      c = i * 3 + 2;
    }

    getVertex(a, vA);
    getVertex(b, vB);
    getVertex(c, vC);

    cb.subVectors(vC, vB);
    ab.subVectors(vA, vB);
    cb.cross(ab).normalize();

    // Check if coplanar (normals are parallel)
    if (cb.dot(referenceNormal) > 0.999) {
      // Transform to world space
      const wA = vA.clone().applyMatrix4(matrixWorld);
      const wB = vB.clone().applyMatrix4(matrixWorld);
      const wC = vC.clone().applyMatrix4(matrixWorld);

      vertices.push([wA.x, wA.y, wA.z]);
      vertices.push([wB.x, wB.y, wB.z]);
      vertices.push([wC.x, wC.y, wC.z]);
    }
  }

  return vertices;
};

const FaceHighlighterMesh: FC<{ vertices: number[][], color: string, opacity: number }> = ({ vertices, color, opacity }) => {
  const geometry = useMemo(() => {
    const flattenVertices = new Float32Array(vertices.flat());
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(flattenVertices, 3));
    // Compute normals for correct lighting/rendering if needed, though BasicMaterial doesn't need it much
    geom.computeVertexNormals();
    return geom;
  }, [vertices]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color={color} side={THREE.DoubleSide} depthTest={false} transparent opacity={opacity} />
      <Edges color="white" threshold={1} />
    </mesh>
  );
};

const FaceSelectionHandler: FC = () => {
  const { camera, scene, gl } = useThree();
  const dispatch = useDispatch();
  const attachMode = useSelector(attachModeSelector);
  const selectedFaces = useSelector(selectedFacesSelector);

  const [hoveredFaceVertices, setHoveredFaceVertices] = useState<number[][] | null>(null);

  useEffect(() => {
    if (!attachMode) {
      setHoveredFaceVertices(null);
      return;
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getIntersects = (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = getAllMeshes(scene);
      return raycaster.intersectObjects(meshes, false);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const intersects = getIntersects(event);
      if (intersects.length > 0) {
        const intersection = intersects[0];
        if (intersection.face && intersection.object instanceof THREE.Mesh) {
          const vertices = getCoplanarFacesVertices(intersection.object, intersection.face);
          setHoveredFaceVertices(vertices);
        } else {
          setHoveredFaceVertices(null);
        }
      } else {
        setHoveredFaceVertices(null);
      }
    };

    const handleClick = (event: MouseEvent) => {
      const intersects = getIntersects(event);

      if (intersects.length > 0) {
        const intersection = intersects[0];
        if (intersection.face && intersection.object instanceof THREE.Mesh) {
          let mesh = intersection.object;
          const face = intersection.face;
          const point = intersection.point;

          // Traverse up to find the component root (CanvasObject) which has the key as name
          let rootMesh = mesh;
          while (rootMesh.parent && (rootMesh.name === "" || isNaN(parseInt(rootMesh.name)))) {
            if (rootMesh.parent instanceof THREE.Mesh) {
              rootMesh = rootMesh.parent;
            } else {
              if (rootMesh.parent.type === 'Group' || rootMesh.parent.type === 'Object3D') {
                rootMesh = rootMesh.parent as unknown as THREE.Mesh;
              } else {
                break;
              }
            }
          }

          if (!rootMesh || isNaN(parseInt(rootMesh.name))) {
            console.warn("Could not find component root for mesh", mesh);
            return;
          }

          const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
          const worldNormal = face.normal.clone().applyMatrix3(normalMatrix).normalize();
          const vertices = getCoplanarFacesVertices(mesh, face);

          dispatch(addSelectedFace({
            objectUUID: rootMesh.uuid,
            faceIndex: face.a,
            normal: [worldNormal.x, worldNormal.y, worldNormal.z],
            point: [point.x, point.y, point.z],
            vertices: vertices
          }));
        }
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    return () => {
      gl.domElement.removeEventListener('click', handleClick);
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, [attachMode, camera, scene, gl, dispatch]);

  useEffect(() => {
    if (selectedFaces.length === 2) {
      // Perform alignment
      const [face1Data, face2Data] = selectedFaces;

      const meshes = getAllMeshes(scene);
      const mesh1 = meshes.find(m => m.uuid === face1Data.objectUUID);
      const mesh2 = meshes.find(m => m.uuid === face2Data.objectUUID);

      if (mesh1 && mesh2) {
        const getCenter = (vertices: number[][]) => {
          if (!vertices || vertices.length === 0) return null;
          const box = new THREE.Box3();
          vertices.forEach(v => box.expandByPoint(new THREE.Vector3(...v)));
          return box.getCenter(new THREE.Vector3());
        };

        const center1 = getCenter(face1Data.vertices);
        const center2 = getCenter(face2Data.vertices);

        const faceA = {
          normal: new THREE.Vector3(...face1Data.normal),
          point: center1 || new THREE.Vector3(...face1Data.point)
        };
        const faceB = {
          normal: new THREE.Vector3(...face2Data.normal),
          point: center2 || new THREE.Vector3(...face2Data.point)
        };

        // Align mesh1 to mesh2
        // mesh1 is the root mesh now, so we can move it directly
        const result = alignObjectsByFaces(mesh1, faceA, mesh2, faceB);

        const keyComponent = parseInt(mesh1.name);

        if (!isNaN(keyComponent)) {
          dispatch(selectComponent(keyComponent));

          const transformationParams: TransformationParams = {
            position: [result.position.x, result.position.y, result.position.z] as [number, number, number],
            rotation: [result.rotation.x, result.rotation.y, result.rotation.z] as [number, number, number],
            scale: [mesh1.scale.x, mesh1.scale.y, mesh1.scale.z] as [number, number, number]
          };

          dispatch(updateTransformationParams(transformationParams));
          dispatch(addNode({
            id: uniqid(),
            name: `Attach ${mesh1.name} to ${mesh2.name}`,
            type: 'ATTACH',
            params: transformationParams,
            timestamp: Date.now(),
            outputKey: keyComponent,
            inputKeys: [keyComponent],
            suppressed: false
          }));
          dispatch(toggleAttachMode());
        }
      }
    }
  }, [selectedFaces, scene, dispatch]);

  if (!hoveredFaceVertices) return null;

  return <FaceHighlighterMesh vertices={hoveredFaceVertices} color="yellow" opacity={0.5} />;
};

const SelectedFacesHighlighter: FC = () => {
  const selectedFaces = useSelector(selectedFacesSelector);

  if (selectedFaces.length === 0) return null;

  return (
    <group>
      {selectedFaces.map((face, index) => {
        if (!face.vertices) return null; // Handle legacy state if any
        return (
          <FaceHighlighterMesh
            key={index}
            vertices={face.vertices}
            color={index === 0 ? "blue" : "green"}
            opacity={0.8}
          />
        )
      })}
    </group>
  );
}
function setOpacityRecursively(entity: ComponentEntity, arg1: number): any {
  const newEntity = { ...entity, opacity: arg1 };
  if (newEntity.type === 'GROUP' && (newEntity as any).children) {
    (newEntity as any).children = (newEntity as any).children.map((child: ComponentEntity) =>
      setOpacityRecursively(child, arg1)
    );
  }
  return newEntity;
}

