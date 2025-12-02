import React, { FC } from "react";
import {
  BufferGeometryAttributes,
  CircleGeometryAttributes,
  ComponentEntity,
  CompositeEntity,
  ConeGeometryAttributes,
  CubeGeometryAttributes,
  CylinderGeometryAttributes,
  SphereGeometryAttributes,
  TorusGeometryAttributes,
} from "../model/componentEntity/componentEntity";
import { BufferComponent } from "./shapes/bufferComponent/bufferComponent";
import { Circle } from "./shapes/circle/circle";
import { Composite } from "./shapes/composite/composite";
import { Cone } from "./shapes/cone/cone";
import { Cube } from "./shapes/cube/cube";
import { Cylinder } from "./shapes/cylinder/cylinder";
import { Sphere } from "./shapes/sphere/sphere";
import { Torus } from "./shapes/torus/torus";
import { faBullseye } from "@fortawesome/free-solid-svg-icons";
import { Edges } from "@react-three/drei";
import { getContrastingColor } from "../../../cadmia/canvas/components/canvas/components/canvasObject";

interface FactoryShapesProps {
  entity: ComponentEntity;
  color?: string;
  borderVisible?: boolean;
}

export const FactoryShapes: FC<FactoryShapesProps> = ({ entity, color, borderVisible }) => {
  const defaultColorShape = "#63cbf7";
  const getColor = (
    color: string | undefined,
    entity: ComponentEntity,
    defaultColor: string
  ) => {
    if (color) {
      return color;
    } else if (entity.material !== undefined) {
      return entity.material.color;
    } else {
      return defaultColor;
    }
  };

  if (entity.transparency === undefined) {
    entity.transparency = false
  }
  if (entity.opacity === undefined) {
    entity.opacity = 1
  }

  switch (entity.type) {
    case "CUBE":
      let cubeGeometryAttributes =
        entity.geometryAttributes as CubeGeometryAttributes;
      return (
        <>
          <Cube
            color={getColor(color, entity, defaultColorShape)}
            width={cubeGeometryAttributes.width}
            height={cubeGeometryAttributes.height}
            depth={cubeGeometryAttributes.depth}
            widthSegments={cubeGeometryAttributes.widthSegments}
            heigthSegments={cubeGeometryAttributes.heigthSegments}
            depthSegments={cubeGeometryAttributes.depthSegments}
            opacity={entity.opacity}
            transparency={entity.transparency}
          />
          {borderVisible && <Edges color={getContrastingColor(getColor(color, entity, defaultColorShape))} threshold={15} />}
        </>
      );
    case "SPHERE":
      let sphereGeometryAttributes =
        entity.geometryAttributes as SphereGeometryAttributes;
      return (
        <>
          <Sphere
            color={getColor(color, entity, defaultColorShape)}
            heightSegments={sphereGeometryAttributes.heightSegments}
            widthSegments={sphereGeometryAttributes.widthSegments}
            radius={sphereGeometryAttributes.radius}
            phiStart={sphereGeometryAttributes.phiStart}
            phiLength={sphereGeometryAttributes.phiLength}
            thetaStart={sphereGeometryAttributes.thetaStart}
            thetaLength={sphereGeometryAttributes.thetaLength}
            opacity={entity.opacity}
            transparency={entity.transparency}
          />
          {borderVisible && <Edges color={getContrastingColor(getColor(color, entity, defaultColorShape))} threshold={15} />}
        </>
      );
    case "BUFFER":
      let positionVertices = new Float32Array(Object.values((entity.geometryAttributes as any).positionVertices))
      let normalVertices = new Float32Array(Object.values((entity.geometryAttributes as any).normalVertices))
      let geometryAttributes: BufferGeometryAttributes = {
        positionVertices: positionVertices,
        normalVertices: normalVertices,
        uvVertices: undefined
      }
      let bufferComponent = {
        ...entity,
        geometryAttributes: geometryAttributes
      }
      return (
        <>
          <BufferComponent
            positionVertices={bufferComponent.geometryAttributes.positionVertices}
            normalVertices={bufferComponent.geometryAttributes.normalVertices}
            color={getColor(color, bufferComponent, defaultColorShape)}
            opacity={bufferComponent.opacity as number}
            transparency={bufferComponent.transparency as boolean}
          />
          {borderVisible && <Edges color={getContrastingColor(getColor(color, bufferComponent, defaultColorShape))} threshold={15} />}
        </>
      );
    case "CYLINDER":
      let cylinderGeometryAttributes =
        entity.geometryAttributes as CylinderGeometryAttributes;
      return (
        <>
          <Cylinder
            topRadius={cylinderGeometryAttributes.topRadius}
            bottomRadius={cylinderGeometryAttributes.bottomRadius}
            height={cylinderGeometryAttributes.height}
            color={getColor(color, entity, defaultColorShape)}
            heightSegments={cylinderGeometryAttributes.heightSegments}
            radialSegments={cylinderGeometryAttributes.radialSegments}
            thetaStart={cylinderGeometryAttributes.thetaStart}
            thetaLength={cylinderGeometryAttributes.thetaLength}
            openEnded={cylinderGeometryAttributes.openEnded}
            opacity={entity.opacity}
            transparency={entity.transparency}
          />
          {borderVisible && <Edges color={getContrastingColor(getColor(color, entity, defaultColorShape))} threshold={15} />}
        </>
      );
    case "TORUS":
      let torusGeometryAttributes =
        entity.geometryAttributes as TorusGeometryAttributes;
      return (
        <>
          <Torus
            color={getColor(color, entity, defaultColorShape)}
            torusRadius={torusGeometryAttributes.torusRadius}
            tubeRadius={torusGeometryAttributes.tubeRadius}
            centralAngle={torusGeometryAttributes.centralAngle}
            radialSegments={torusGeometryAttributes.radialSegments}
            tubularSegments={torusGeometryAttributes.tubularSegments}
            opacity={entity.opacity}
            transparency={entity.transparency}
          />
          {borderVisible && <Edges color={getContrastingColor(getColor(color, entity, defaultColorShape))} threshold={15} />}
        </>
      );
    case "CONE":
      let coneGeometryAttributes =
        entity.geometryAttributes as ConeGeometryAttributes;
      return (
        <>
          <Cone
            radius={coneGeometryAttributes.radius}
            height={coneGeometryAttributes.height}
            color={getColor(color, entity, defaultColorShape)}
            heightSegments={coneGeometryAttributes.heightSegments}
            radialSegments={coneGeometryAttributes.radialSegments}
            thetaStart={coneGeometryAttributes.thetaStart}
            thetaLength={coneGeometryAttributes.thetaLength}
            openEnded={coneGeometryAttributes.openEnded}
            opacity={entity.opacity}
            transparency={entity.transparency}
          />
          {borderVisible && <Edges color={getContrastingColor(getColor(color, entity, defaultColorShape))} threshold={15} />}
        </>
      );
    case "CIRCLE":
      let circleGeometryAttributes =
        entity.geometryAttributes as CircleGeometryAttributes;
      return (
        <>
          <Circle
            color={getColor(color, entity, defaultColorShape)}
            radius={circleGeometryAttributes.radius}
            segments={circleGeometryAttributes.segments}
            thetaStart={circleGeometryAttributes.thetaStart}
            thetaLength={circleGeometryAttributes.thetaLength}
            opacity={entity.opacity}
            transparency={entity.transparency}
          />
          {borderVisible && <Edges color={getContrastingColor(getColor(color, entity, defaultColorShape))} threshold={15} />}
        </>
      );

    case "GROUP":
      let groupEntity = entity as any;
      return (
        <group>
          {groupEntity.children.map((child: ComponentEntity) => {
            if (child.type === 'GROUP') {
              return (
                <group
                  key={child.keyComponent}
                  position={child.transformationParams.position}
                  rotation={child.transformationParams.rotation}
                  scale={child.transformationParams.scale}
                >
                  <FactoryShapes entity={child} color={color} borderVisible={borderVisible} />
                </group>
              )
            } else {
              return (
                <mesh
                  key={child.keyComponent}
                  position={child.transformationParams.position}
                  rotation={child.transformationParams.rotation}
                  scale={child.transformationParams.scale}
                  castShadow
                  receiveShadow
                >
                  <FactoryShapes entity={child} color={color} borderVisible={borderVisible} />
                </mesh>
              )
            }
          })}
        </group>
      );

    default:
      return (
        <Composite
          entity={entity as CompositeEntity}
          color={getColor(color, entity, defaultColorShape)}
          opacity={entity.opacity}
          transparency={entity.transparency}
        />
      );
  }
};


export const FactoryShapesEsymia: FC<FactoryShapesProps> = ({ entity, color, borderVisible }) => {
  const defaultColorShape = "#63cbf7";
  const getColor = (
    color: string | undefined,
    entity: ComponentEntity,
    defaultColor: string
  ) => {
    if (color) {
      return color;
    } else if (entity.material !== undefined) {
      return entity.material.color;
    } else {
      return defaultColor;
    }
  };

  switch (entity.type) {
    case "CUBE":
      let cubeGeometryAttributes =
        entity.geometryAttributes as CubeGeometryAttributes;
      return (
        <>
          <Cube
            color={getColor(color, entity, defaultColorShape)}
            width={cubeGeometryAttributes.width}
            height={cubeGeometryAttributes.height}
            depth={cubeGeometryAttributes.depth}
            widthSegments={cubeGeometryAttributes.widthSegments}
            heigthSegments={cubeGeometryAttributes.heigthSegments}
            depthSegments={cubeGeometryAttributes.depthSegments}
            opacity={1}
            transparency={false}
          />
          {borderVisible && <Edges color={getContrastingColor(getColor(color, entity, defaultColorShape))} threshold={15} />}
        </>
      );
    case "SPHERE":
      let sphereGeometryAttributes =
        entity.geometryAttributes as SphereGeometryAttributes;
      return (
        <>
          <Sphere
            color={getColor(color, entity, defaultColorShape)}
            heightSegments={sphereGeometryAttributes.heightSegments}
            widthSegments={sphereGeometryAttributes.widthSegments}
            radius={sphereGeometryAttributes.radius}
            phiStart={sphereGeometryAttributes.phiStart}
            phiLength={sphereGeometryAttributes.phiLength}
            thetaStart={sphereGeometryAttributes.thetaStart}
            thetaLength={sphereGeometryAttributes.thetaLength}
            opacity={1}
            transparency={false}
          />
          {borderVisible && <Edges color={getContrastingColor(getColor(color, entity, defaultColorShape))} threshold={15} />}
        </>
      );
    case "BUFFER":
      let positionVertices = new Float32Array(Object.values((entity.geometryAttributes as any).positionVertices))
      let normalVertices = new Float32Array(Object.values((entity.geometryAttributes as any).normalVertices))
      let geometryAttributes: BufferGeometryAttributes = {
        positionVertices: positionVertices,
        normalVertices: normalVertices,
        uvVertices: undefined
      }
      let bufferComponent = {
        ...entity,
        geometryAttributes: geometryAttributes
      }
      return (
        <>
          <BufferComponent
            positionVertices={bufferComponent.geometryAttributes.positionVertices}
            normalVertices={bufferComponent.geometryAttributes.normalVertices}
            color={getColor(color, bufferComponent, defaultColorShape)}
            opacity={1}
            transparency={false}
          />
          {borderVisible && <Edges color={getContrastingColor(getColor(color, entity, defaultColorShape))} threshold={15} />}
        </>
      );
    case "CYLINDER":
      let cylinderGeometryAttributes =
        entity.geometryAttributes as CylinderGeometryAttributes;
      return (
        <>
          <Cylinder
            topRadius={cylinderGeometryAttributes.topRadius}
            bottomRadius={cylinderGeometryAttributes.bottomRadius}
            height={cylinderGeometryAttributes.height}
            color={getColor(color, entity, defaultColorShape)}
            heightSegments={cylinderGeometryAttributes.heightSegments}
            radialSegments={cylinderGeometryAttributes.radialSegments}
            thetaStart={cylinderGeometryAttributes.thetaStart}
            thetaLength={cylinderGeometryAttributes.thetaLength}
            openEnded={cylinderGeometryAttributes.openEnded}
            opacity={1}
            transparency={false}
          />
          {borderVisible && <Edges color={getContrastingColor(getColor(color, entity, defaultColorShape))} threshold={15} />}
        </>
      );
    case "TORUS":
      let torusGeometryAttributes =
        entity.geometryAttributes as TorusGeometryAttributes;
      return (
        <>
          <Torus
            color={getColor(color, entity, defaultColorShape)}
            torusRadius={torusGeometryAttributes.torusRadius}
            tubeRadius={torusGeometryAttributes.tubeRadius}
            centralAngle={torusGeometryAttributes.centralAngle}
            radialSegments={torusGeometryAttributes.radialSegments}
            tubularSegments={torusGeometryAttributes.tubularSegments}
            opacity={1}
            transparency={false}
          />
          {borderVisible && <Edges color={getContrastingColor(getColor(color, entity, defaultColorShape))} threshold={15} />}
        </>
      );
    case "CONE":
      let coneGeometryAttributes =
        entity.geometryAttributes as ConeGeometryAttributes;
      return (
        <>
          <Cone
            radius={coneGeometryAttributes.radius}
            height={coneGeometryAttributes.height}
            color={getColor(color, entity, defaultColorShape)}
            heightSegments={coneGeometryAttributes.heightSegments}
            radialSegments={coneGeometryAttributes.radialSegments}
            thetaStart={coneGeometryAttributes.thetaStart}
            thetaLength={coneGeometryAttributes.thetaLength}
            openEnded={coneGeometryAttributes.openEnded}
            opacity={1}
            transparency={false}
          />
          {borderVisible && <Edges color={getContrastingColor(getColor(color, entity, defaultColorShape))} threshold={15} />}
        </>
      );
    case "CIRCLE":
      let circleGeometryAttributes =
        entity.geometryAttributes as CircleGeometryAttributes;
      return (
        <>
          <Circle
            color={getColor(color, entity, defaultColorShape)}
            radius={circleGeometryAttributes.radius}
            segments={circleGeometryAttributes.segments}
            thetaStart={circleGeometryAttributes.thetaStart}
            thetaLength={circleGeometryAttributes.thetaLength}
            opacity={1}
            transparency={false}
          />
          {borderVisible && <Edges color={getContrastingColor(getColor(color, entity, defaultColorShape))} threshold={15} />}
        </>
      );

    case "GROUP":
      let groupEntity = entity as any;
      return (
        <group>
          {groupEntity.children.map((child: ComponentEntity) => {
            if (child.type === 'GROUP') {
              return (
                <group
                  key={child.keyComponent}
                  position={child.transformationParams.position}
                  rotation={child.transformationParams.rotation}
                  scale={child.transformationParams.scale}
                >
                  <FactoryShapesEsymia entity={child} color={color} borderVisible />
                </group>
              )
            } else {
              return (
                <mesh
                  key={child.keyComponent}
                  position={child.transformationParams.position}
                  rotation={child.transformationParams.rotation}
                  scale={child.transformationParams.scale}
                  castShadow
                  receiveShadow
                >
                  <FactoryShapesEsymia entity={child} color={color} borderVisible />
                </mesh>
              )
            }
          })}
        </group>
      );

    default:
      return (
        <>
          <Composite
            entity={entity as CompositeEntity}
            color={getColor(color, entity, defaultColorShape)}
            opacity={1}
            transparency={false}
          />
          {borderVisible && <Edges color={getContrastingColor(getColor(color, entity, defaultColorShape))} threshold={15} />}
        </>
      );
  }
};
