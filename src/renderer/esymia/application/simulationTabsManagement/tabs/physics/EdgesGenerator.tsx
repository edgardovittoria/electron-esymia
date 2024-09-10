import React, {useEffect, useRef} from 'react';
import * as THREE from "three";
import {BufferGeometry, InstancedMesh, Material, Mesh, Object3D} from "three";
import {useDispatch, useSelector} from "react-redux";
import {
    boundingBoxDimensionSelector,
    findSelectedPort,
    selectedProjectSelector,
    updatePortPosition
} from "../../../../store/projectSlice";
import uniqid from 'uniqid';

export interface EdgesGeneratorProps {
    meshRef: React.MutableRefObject<THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>[]>,
    inputPortPositioned: boolean,
    setInputPortPositioned: Function,
}

const EdgesGenerator: React.FC<EdgesGeneratorProps> = ({meshRef, inputPortPositioned, setInputPortPositioned}) => {

    const selectedProject = useSelector(selectedProjectSelector);
    const dispatch = useDispatch()
    let selectedPort = findSelectedPort(selectedProject)
    let size = useSelector(boundingBoxDimensionSelector)
    const instancedMeshRef = useRef<InstancedMesh[]>([]);
    useEffect(() => {
            // console.log(doubleClicked)
            let tempObject = new Object3D();
            meshRef.current.forEach((c, index) => {
                ((c as Mesh).material as Material).opacity = 0.5
                let j = 0;
                // const geometry = (c as Mesh).geometry.clone().applyMatrix4((c as Mesh).matrix);
                (c as Mesh).geometry.applyQuaternion((c as Mesh).quaternion)
                let positionVertices = (c as Mesh).geometry.attributes.position.array
                if (instancedMeshRef.current[index]) {
                    for (let i = 0; i < positionVertices.length; i++) {
                        if (i % 3 === 0) {
                            tempObject.position.set(
                                positionVertices[i],
                                positionVertices[i + 1],
                                positionVertices[i + 2]
                            )
                            j++
                            tempObject.updateMatrix();
                            instancedMeshRef.current[index].setMatrixAt(j, tempObject.matrix);
                        }
                    }

                    instancedMeshRef.current[index].instanceMatrix.needsUpdate = true;
                }
            })
            // bounds.refresh().fit()
    }, [selectedPort, selectedProject])

    return (
        <>
            {
                meshRef.current.map((c, index) => {
                    return (
                          <instancedMesh
                              ref={(el) => {
                                  if (el) {
                                      instancedMeshRef.current[index] = el;
                                  }
                              }}
                              position={c.position}
                              key={uniqid()}
                              //TODO: sistemare problemi derivanti dai tipi risultanti dalle operazioni binarie
                              args={[null as any, null as any, ((c as Mesh).geometry as BufferGeometry).attributes.position.array.length / 3]}
                              onDoubleClick={(e) => {
                                  e.stopPropagation()
                                  if (!inputPortPositioned) {
                                      dispatch(
                                          updatePortPosition({
                                              type: "first",
                                              position: [e.point.x, e.point.y, e.point.z],
                                          })
                                      );
                                      setInputPortPositioned(true)
                                  } else {
                                      dispatch(
                                          updatePortPosition({
                                              type: "last",
                                              position: [e.point.x, e.point.y, e.point.z],
                                          })
                                      );
                                      setInputPortPositioned(false)
                                  }
                              }}
                          >
                              <sphereGeometry args={[(size as number) / 150, 20, 20]}/>
                              <meshPhongMaterial color={"black"}/>
                          </instancedMesh>
                    )
                })
            }
        </>
    )
}

export default EdgesGenerator
