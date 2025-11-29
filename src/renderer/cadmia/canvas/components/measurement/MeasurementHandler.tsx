import React, { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useThree } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { cadmiaModalitySelector } from '../cadmiaModality/cadmiaModalitySlice';
import { addPoint, measurementDistanceSelector, measurementPointsSelector } from './measurementSlice';
import { getAllMeshes } from '../../../../cad_library/components/auxiliaryFunctionsUsingThree/snapLogic';

export const MeasurementHandler: FC = () => {
    const { camera, scene, gl } = useThree();
    const dispatch = useDispatch();
    const modality = useSelector(cadmiaModalitySelector);
    const points = useSelector(measurementPointsSelector);
    const finalDistance = useSelector(measurementDistanceSelector);
    const [hoverPoint, setHoverPoint] = useState<THREE.Vector3 | null>(null);

    useEffect(() => {
        if (modality !== 'Measurement') {
            setHoverPoint(null);
            return;
        }

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleMouseMove = (event: MouseEvent) => {
            const rect = gl.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const meshes = getAllMeshes(scene);
            const intersects = raycaster.intersectObjects(meshes, false);

            if (intersects.length > 0) {
                const intersect = intersects[0];
                const point = intersect.point;

                if (intersect.face) {
                    const normalMatrix = new THREE.Matrix3().getNormalMatrix(intersect.object.matrixWorld);
                    const worldNormal = intersect.face.normal.clone().applyMatrix3(normalMatrix).normalize();

                    // Offset by sphere radius (0.02) so it sits on top
                    const offsetPoint = point.clone().add(worldNormal.multiplyScalar(0.02));
                    setHoverPoint(offsetPoint);
                } else {
                    setHoverPoint(point);
                }
            } else {
                // Check intersection with ground plane (XZ plane at Y=0)
                const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
                const target = new THREE.Vector3();
                const planeIntersect = raycaster.ray.intersectPlane(plane, target);

                if (planeIntersect) {
                    // Offset by sphere radius (0.02) so it sits on top of the grid
                    setHoverPoint(target.add(new THREE.Vector3(0, 0.02, 0)));
                } else {
                    setHoverPoint(null);
                }
            }
        };

        const handleDoubleClick = (event: MouseEvent) => {
            if (hoverPoint) {
                dispatch(addPoint([hoverPoint.x, hoverPoint.y, hoverPoint.z]));
            }
        };

        gl.domElement.addEventListener('mousemove', handleMouseMove);
        gl.domElement.addEventListener('dblclick', handleDoubleClick);
        return () => {
            gl.domElement.removeEventListener('mousemove', handleMouseMove);
            gl.domElement.removeEventListener('dblclick', handleDoubleClick);
        };
    }, [modality, camera, scene, gl, dispatch, hoverPoint]);

    if (modality !== 'Measurement') return null;

    const getDistance = (p1: number[], p2: THREE.Vector3) => {
        return new THREE.Vector3(...p1).distanceTo(p2);
    };

    return (
        <group>
            {/* Render existing points */}
            {points.map((p, i) => (
                <group key={i} position={new THREE.Vector3(...p)}>
                    <mesh>
                        <sphereGeometry args={[0.02, 16, 16]} />
                        <meshBasicMaterial color="red" />
                    </mesh>
                    {/* Only show label for the first point if we are not hovering or if it's the start */}
                    <Html position={[0, 0.5, 0]} center style={{ pointerEvents: 'none' }}>
                        <div style={{ background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '12px' }}>
                            {`[${p[0].toFixed(2)}, ${p[1].toFixed(2)}, ${p[2].toFixed(2)}]`}
                        </div>
                    </Html>
                </group>
            ))}

            {/* Dynamic Feedback */}
            {hoverPoint && points.length < 2 && (
                <group position={hoverPoint}>
                    <mesh>
                        <sphereGeometry args={[0.02, 16, 16]} />
                        <meshBasicMaterial color="yellow" opacity={0.5} transparent />
                    </mesh>
                    <Html position={[0, 0.5, 0]} center style={{ pointerEvents: 'none' }}>
                        <div style={{ background: 'rgba(0,0,0,0.7)', color: 'yellow', padding: '2px 5px', borderRadius: '4px', fontSize: '12px' }}>
                            {`[${hoverPoint.x.toFixed(2)}, ${hoverPoint.y.toFixed(2)}, ${hoverPoint.z.toFixed(2)}]`}
                        </div>
                    </Html>
                </group>
            )}

            {/* Dynamic Line (Point 1 to Hover) */}
            {points.length === 1 && hoverPoint && (
                <>
                    <Line
                        points={[new THREE.Vector3(...points[0]), hoverPoint]}
                        color="yellow"
                        lineWidth={2}
                        dashed
                    />
                    <Html position={new THREE.Vector3(...points[0]).lerp(hoverPoint, 0.5)} center style={{ pointerEvents: 'none' }}>
                        <div style={{ background: 'rgba(0,0,0,0.7)', color: 'yellow', padding: '2px 5px', borderRadius: '4px', fontSize: '12px', border: '1px solid yellow' }}>
                            {`Dist: ${getDistance(points[0], hoverPoint).toFixed(2)}`}
                        </div>
                    </Html>
                </>
            )}

            {/* Final Line (Point 1 to Point 2) */}
            {points.length === 2 && (
                <>
                    <Line
                        points={[new THREE.Vector3(...points[0]), new THREE.Vector3(...points[1])]}
                        color="red"
                        lineWidth={2}
                    />
                    <Html position={new THREE.Vector3(...points[0]).lerp(new THREE.Vector3(...points[1]), 0.5)} center style={{ pointerEvents: 'none' }}>
                        <div style={{ background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '12px', border: '1px solid red' }}>
                            {`Dist: ${finalDistance?.toFixed(2)}`}
                        </div>
                    </Html>
                </>
            )}
        </group>
    );
};
