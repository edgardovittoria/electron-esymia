import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Cone, Line, Text } from '@react-three/drei';
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
        {/* <Text
          position={start.clone().add(dir.clone().multiplyScalar(1.1))}
          fontSize={0.1}
          color={color}
          rotation={[Math.PI / 2, 0, 0]}
        >
          {label}
        </Text> */}
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
      <Line
        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z)]}
        color="black"
        lineWidth={1}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
      {/* Curve Theta e Phi */}
      {/* <Line
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
      </Text> */}
      <LineWithArrow thetaCurve={thetaCurve} rotation={new THREE.Euler(0,0,0)} color='green' lineWidth={2} text="θ"/>
      <LineWithArrow thetaCurve={phiCurve} rotation={new THREE.Euler(0,0,0)} color='purple' lineWidth={2} text="φ"/>
    </>
  );
};

interface ArrowProps {
  position: THREE.Vector3,
  rotation: THREE.Euler,
  color: string,
  size: number
}

interface LineWithArrowProps {
  thetaCurve: THREE.Vector3[],
  rotation: THREE.Euler,
  color: string,
  lineWidth: number,
  text: string,
}

const LineWithArrow:React.FC<LineWithArrowProps> = ({ thetaCurve, color, lineWidth, text }) => {
  const [arrowPoints1, setArrowPoints1] = useState<THREE.Vector3[]>([]);
  const [arrowPoints2, setArrowPoints2] = useState<THREE.Vector3[]>([]);
  const middleIndex = Math.floor(thetaCurve.length / 2);
  const middlePoint = thetaCurve[middleIndex];

  useEffect(() => {
    if (thetaCurve.length >= 2) {
      const prevPoint = thetaCurve[Math.max(0, middleIndex - 1)];
      const nextPoint = thetaCurve[Math.min(thetaCurve.length - 1, middleIndex + 1)];
      const direction = new THREE.Vector3().subVectors(prevPoint, nextPoint).normalize();

      const arrowBaseOffset = direction.clone().multiplyScalar(-0.08);
      const arrowBasePoint = new THREE.Vector3().addVectors(middlePoint, arrowBaseOffset);

      const arrowWingDirection1 = new THREE.Vector3();
      arrowWingDirection1.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(0.05);

      const arrowWingDirection2 = new THREE.Vector3();
      arrowWingDirection2.crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize().multiplyScalar(0.05);

      const arrowTip1 = new THREE.Vector3().addVectors(arrowBasePoint, direction.clone().multiplyScalar(0.10)).add(arrowWingDirection1);
      const arrowTip2 = new THREE.Vector3().addVectors(arrowBasePoint, direction.clone().multiplyScalar(0.10)).add(arrowWingDirection2);

      setArrowPoints1([arrowBasePoint, arrowTip1]);
      setArrowPoints2([arrowBasePoint, arrowTip2]);
    } else {
      setArrowPoints1([]);
      setArrowPoints2([]);
    }
  }, [thetaCurve, middleIndex]);
  return (
    <>
      <Line
        points={thetaCurve}
        color={color}
        lineWidth={lineWidth}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
      {/* <Text
        position={thetaCurve[Math.floor(thetaCurve.length / 2)]} // Posizione al centro
        rotation={[Math.PI / 2, 0, 0]}
        fontSize={0.1}
        color={color}
        anchorX={-0.13}
        anchorY="middle"
      >
        {text}
      </Text> */}
      {thetaCurve.length >= 2 && arrowPoints1.length > 0 && arrowPoints2.length > 0 && (
        <>
          <Line
            points={arrowPoints1}
            color={color}
            lineWidth={lineWidth}
          />
          <Line
            points={arrowPoints2}
            color={color}
            lineWidth={lineWidth}
          />
        </>
      )}

    </>
  );
}
