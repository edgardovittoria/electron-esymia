import * as React from 'react';
import { ThreeEvent, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';
import { FieldVectors, FieldVectorsProps } from './FieldVectors';
import { computeFieldsComponents } from '../utility/computeFieldsComponents';
import { Text } from "@react-three/drei";

type GizmoViewportProps = ThreeElements['group'] & {
  axisColors?: [string, string, string];
  directionX: THREE.Vector3;
  directionY: THREE.Vector3;
  directionZ: THREE.Vector3;
  lenght?: number;
};

type ArrowHelperProps = {
  direction: THREE.Vector3;
  color: number;
  length?: number;
};

const ArrowHelper: React.FC<ArrowHelperProps> = ({
  direction,
  color,
  length = 1,
}) => {
  const arrowRef = useRef<THREE.ArrowHelper>();
  if (!arrowRef.current) {
    arrowRef.current = new THREE.ArrowHelper(
      direction.clone().normalize(),
      new THREE.Vector3(0, 0, 0),
      length,
      color,
    );
  }
  return <primitive object={arrowRef.current} />;
};

/**
 * Componente GizmoViewport che mostra gli assi e le teste (ora frecce)
 */
export const GizmoArrowViewport = ({
  axisColors = ['#ff2060', '#20df80', '#2080ff'],
  directionX,
  directionY,
  directionZ,
  lenght,
  theta,
  phi,
  E,
  K,
  H,
  E_theta_v,
  E_phi_v,
  ...props
}: GizmoViewportProps & FieldVectorsProps) => {
  const [colorX, colorY, colorZ] = axisColors;
  return (
    <>
      <group scale={150} {...props}>
        <ArrowHelper
          direction={directionX}
          color={new THREE.Color(colorX).getHex()}
          length={lenght}
        />
        <Text position={new THREE.Vector3(directionX.x + 0.2, directionX.y, directionX.z)} rotation={[Math.PI / 2, 0, 0]} fontSize={0.1} color={"black"}>
              X
            </Text>
        <ArrowHelper
          direction={directionY}
          color={new THREE.Color(colorY).getHex()}
          length={lenght}
        />
        <Text position={new THREE.Vector3(directionY.x, directionY.y +0.2, directionY.z)} rotation={[Math.PI / 2, 0, 0]} fontSize={0.1} color={"black"}>
              Y
            </Text>
        <ArrowHelper
          direction={directionZ}
          color={new THREE.Color(colorZ).getHex()}
          length={lenght}
        />
        <Text position={new THREE.Vector3(directionZ.x, directionZ.y, directionZ.z + 0.2)} rotation={[Math.PI / 2, 0, 0]} fontSize={0.1} color={"black"}>
              Z
            </Text>
        <FieldVectors
        theta={theta}
        phi={phi}
        E={E}
        K={K}
        H={H}
        E_theta_v={E_theta_v}
        E_phi_v={E_phi_v}
      />
      </group>
    </>
  );
};
