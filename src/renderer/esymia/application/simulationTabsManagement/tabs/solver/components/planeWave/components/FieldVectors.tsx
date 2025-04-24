import React, { FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Vector3 } from 'three';

const normalize = (vec: THREE.Vector3) => {
  const len = Math.sqrt(vec.x ** 2 + vec.y ** 2 + vec.z ** 2);
  return len > 0
    ? new THREE.Vector3(vec.x / len, vec.y / len, vec.z / len)
    : vec;
};

const generateCurve = (angle: number, fixed: number, axis: string) => {
  const points = [];
  const segments = 100;
  for (let i = 0; i <= segments; i++) {
    const t = (angle * i) / segments;
    if (axis === 'theta') {
      points.push(
        new THREE.Vector3(
          Math.sin(t) * Math.cos(fixed),
          Math.sin(t) * Math.sin(fixed),
          Math.cos(t),
        ),
      );
    } else {
      points.push(
        new THREE.Vector3(
          Math.sin(fixed) * Math.cos(t),
          Math.sin(fixed) * Math.sin(t),
          0,
        ),
      );
    }
  }
  return points;
};

interface VectorArrowProps {
  start: Vector3;
  dir: Vector3;
  color: string;
  label: string;
}

export const VectorArrow: FC<VectorArrowProps> = ({
  start,
  dir,
  color,
  label,
}) => {
  return (
  <>
    {dir && dir.isVector3 && (
      <>
        <arrowHelper args={[normalize(dir), start, 1, color]} />
        <Text
          position={start.clone().add(dir.clone().multiplyScalar(1.1))}
          fontSize={0.1}
          color={color}
          rotation={[Math.PI / 2, 0, 0]}
        >
          {label}
        </Text>
      </>
    )}
  </>
)};

export interface FieldVectorsProps {
  theta: number;
  phi: number;
  E: Vector3;
  K: Vector3;
  H: Vector3;
  E_theta_v: Vector3;
  E_phi_v: Vector3;
}

export const FieldVectors: FC<FieldVectorsProps> = ({
  theta,
  phi,
  E,
  K,
  H,
  E_theta_v,
  E_phi_v,
}) => {
  // Normalizzazione dei vettori
  E = normalize(E);
  K = normalize(K);
  H = normalize(H);
  E_theta_v = normalize(E_theta_v);
  E_phi_v = normalize(E_phi_v);

  // Creazione delle curve theta e phi
  const thetaCurve = generateCurve(theta, phi, 'theta');
  const phiCurve = generateCurve(phi, theta, 'phi');

  const x = phiCurve[phiCurve.length - 1].x;
  const y = phiCurve[phiCurve.length - 1].y;
  const z = phiCurve[phiCurve.length - 1].z;

  return (
    <>
      {/* Vettori */}
      <VectorArrow
        start={new THREE.Vector3(K.x, K.y, K.z)}
        dir={K}
        color="gray"
        label="K̂"
      />
      <VectorArrow start={K} dir={E_theta_v} color="green" label="Êθ" />
      <VectorArrow start={K} dir={new Vector3(E_phi_v.x, E_phi_v.y, E_phi_v.z)} color="purple" label="Êφ" />
      <VectorArrow start={K} dir={H} color="red" label="Ĥ" />
      <VectorArrow start={K} dir={E} color="blue" label="Ê" />

      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.5, 0, 0)]}
        color="black"
        lineWidth={1}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />

      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.5, 0)]}
        color="black"
        lineWidth={1}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />

      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -0.5)]}
        color="black"
        lineWidth={1}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />

      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(K.x, K.y, K.z)]}
        color="black"
        lineWidth={1}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />

      <Line
        points={[K, new THREE.Vector3(x, y, z)]}
        color="black"
        lineWidth={1}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
      {/* Curve Theta e Phi */}
      <Line
        points={thetaCurve}
        color="green"
        lineWidth={2}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
      <Text
        position={thetaCurve[Math.floor(thetaCurve.length / 2)]} // Posizione al centro
        rotation={[Math.PI / 2, 0, 0]}
        fontSize={0.1}
        color="green"
        anchorX={-0.13}
        anchorY="middle"
      >
        θ
      </Text>
      <Line
        points={phiCurve}
        color="purple"
        lineWidth={2}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
      <Text
        position={phiCurve[Math.floor(phiCurve.length / 2)]} // Posizione al centro
        rotation={[Math.PI / 2, 0, 0]}
        fontSize={0.1}
        color="purple"
        anchorX={-0.05}
        anchorY="middle"
      >
        φ
      </Text>
    </>
  );
};
