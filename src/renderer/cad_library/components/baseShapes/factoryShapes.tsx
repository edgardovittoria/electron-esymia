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

interface FactoryShapesProps {
  entity: ComponentEntity;
  color?: string;
}

export const FactoryShapes: FC<FactoryShapesProps> = ({ entity, color }) => {
  const defaultColorShape = "#420202";
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

  if(entity.transparency === undefined){
    entity.transparency = false
  }
  if(entity.opacity === undefined){
    entity.opacity = 1
  }

  switch (entity.type) {
    case "CUBE":
      let cubeGeometryAttributes =
        entity.geometryAttributes as CubeGeometryAttributes;
      return (
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
      );
    case "SPHERE":
      let sphereGeometryAttributes =
        entity.geometryAttributes as SphereGeometryAttributes;
      return (
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
        <BufferComponent
          positionVertices={bufferComponent.geometryAttributes.positionVertices}
          normalVertices={bufferComponent.geometryAttributes.normalVertices}
          color={getColor(color, bufferComponent, defaultColorShape)}
          opacity={bufferComponent.opacity as number}
          transparency={bufferComponent.transparency as boolean}
        />
      );
    case "CYLINDER":
      let cylinderGeometryAttributes =
        entity.geometryAttributes as CylinderGeometryAttributes;
      return (
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
      );
    case "TORUS":
      let torusGeometryAttributes =
        entity.geometryAttributes as TorusGeometryAttributes;
      return (
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
      );
    case "CONE":
      let coneGeometryAttributes =
        entity.geometryAttributes as ConeGeometryAttributes;
      return (
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
      );
    case "CIRCLE":
      let circleGeometryAttributes =
        entity.geometryAttributes as CircleGeometryAttributes;
      return (
        <Circle
          color={getColor(color, entity, defaultColorShape)}
          radius={circleGeometryAttributes.radius}
          segments={circleGeometryAttributes.segments}
          thetaStart={circleGeometryAttributes.thetaStart}
          thetaLength={circleGeometryAttributes.thetaLength}
          opacity={entity.opacity}
          transparency={entity.transparency}
        />
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


export const FactoryShapesEsymia: FC<FactoryShapesProps> = ({ entity, color }) => {
  const defaultColorShape = "#420202";
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
      );
    case "SPHERE":
      let sphereGeometryAttributes =
        entity.geometryAttributes as SphereGeometryAttributes;
      return (
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
        <BufferComponent
          positionVertices={bufferComponent.geometryAttributes.positionVertices}
          normalVertices={bufferComponent.geometryAttributes.normalVertices}
          color={getColor(color, bufferComponent, defaultColorShape)}
          opacity={1}
          transparency={false}
        />
      );
    case "CYLINDER":
      let cylinderGeometryAttributes =
        entity.geometryAttributes as CylinderGeometryAttributes;
      return (
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
      );
    case "TORUS":
      let torusGeometryAttributes =
        entity.geometryAttributes as TorusGeometryAttributes;
      return (
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
      );
    case "CONE":
      let coneGeometryAttributes =
        entity.geometryAttributes as ConeGeometryAttributes;
      return (
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
      );
    case "CIRCLE":
      let circleGeometryAttributes =
        entity.geometryAttributes as CircleGeometryAttributes;
      return (
        <Circle
          color={getColor(color, entity, defaultColorShape)}
          radius={circleGeometryAttributes.radius}
          segments={circleGeometryAttributes.segments}
          thetaStart={circleGeometryAttributes.thetaStart}
          thetaLength={circleGeometryAttributes.thetaLength}
          opacity={1}
          transparency={false}
        />
      );

    default:
      return (
        <Composite
          entity={entity as CompositeEntity}
          color={getColor(color, entity, defaultColorShape)}
          opacity={1}
          transparency={false}
        />
      );
  }
};
