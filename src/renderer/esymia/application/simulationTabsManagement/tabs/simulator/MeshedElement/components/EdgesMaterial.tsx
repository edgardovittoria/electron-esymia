import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { FC } from "react";
import { Color, FrontSide, Vector3 } from "three";

// funzione applicata ai vertici della geometria. In questo caso andiamo a definire i vertici esattamente
// nella stessa posizione di quelli della geometria.
const vertexShader = () => {
  return /*glsl*/ `varying vec3 vPosition;
  void main() {
    vPosition = position;
    gl_Position = projectionMatrix * viewMatrix * instanceMatrix * vec4(position, 1.0);
  }`
}

// funzione applicata ad ogni pixel di ogni faccia della geometria, questo permette di definire effetti personalizzati rispetto
// a quelli standard forniti dai diversi tipi di materiali di three. La usiamo per definire le caratteristiche delle linee da
// disegnare sugli spigoli della geometria.
const fragmentShader = () => {
  return /*glsl*/ `varying vec3 vPosition;
  uniform vec3 size;
  uniform vec3 color;
  uniform float thickness;
  uniform float smoothness;
  void main() {
    vec3 d = abs(vPosition) - (size * 0.5);
    float a = smoothstep(thickness, thickness + smoothness, min(min(length(d.xy), length(d.yz)), length(d.xz)));
    gl_FragColor = vec4(color, 1.0-a);
  }`
}

const MeshEdgesMaterial = shaderMaterial(
  {
    color: new Color('white'),
    size: new Vector3(1, 1, 1),
    thickness: 0.01,
    smoothness: 0.2
  },
  vertexShader(),
  fragmentShader()
)

extend({ MeshEdgesMaterial })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshEdgesMaterial: any;
    }
  }
}

export const EdgesMaterial: FC<{boxDims: [number, number, number], thickness: number, smoothness: number, side?: any, color?: string, polygonOffsetFactor?: number}>  = ({
  boxDims, smoothness, thickness, side = FrontSide, color = "black", polygonOffsetFactor = -0.2
}) => {
  return (
    <meshEdgesMaterial transparent polygonOffset polygonOffsetFactor={polygonOffsetFactor} size={boxDims}
          color={color} thickness={thickness}
          smoothness={smoothness} side={side} />
  )
}
