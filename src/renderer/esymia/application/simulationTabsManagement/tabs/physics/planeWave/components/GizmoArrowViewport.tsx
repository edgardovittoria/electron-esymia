import * as React from 'react'
import { ThreeEvent, ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'
import { useRef } from 'react'


type GizmoViewportProps = ThreeElements['group'] & {
  axisColors?: [string, string, string],
  directionX: THREE.Vector3,
  directionY: THREE.Vector3,
  directionZ: THREE.Vector3,
  lenght?: number
}

type ArrowHelperProps = {
    direction: THREE.Vector3
    color: number
    length?: number
}

const ArrowHelper: React.FC<ArrowHelperProps> = ({ direction, color, length = 1 }) => {
    const arrowRef = useRef<THREE.ArrowHelper>()
    if (!arrowRef.current) {
      arrowRef.current = new THREE.ArrowHelper(
        direction.clone().normalize(),
        new THREE.Vector3(0, 0, 0),
        length,
        color
      )
    }
    return <primitive object={arrowRef.current} />
  }


/**
 * Componente GizmoViewport che mostra gli assi e le teste (ora frecce)
 */
export const GizmoArrowViewport = ({
  axisColors = ['#ff2060', '#20df80', '#2080ff'],
  directionX,
  directionY,
  directionZ,
  lenght,
  ...props
}: GizmoViewportProps) => {
  const [colorX, colorY, colorZ] = axisColors
  return (
    <group scale={100} {...props}>
      <ArrowHelper direction={directionX} color={new THREE.Color(colorX).getHex()} length={lenght}/>
      <ArrowHelper direction={directionY} color={new THREE.Color(colorY).getHex()} length={lenght}/>
      <ArrowHelper direction={directionZ} color={new THREE.Color(colorZ).getHex()} length={lenght}/>
    </group>
  )
}