import {CircleGeometryAttributes, ComponentEntity, TransformationParams} from "cad-library";
import {Port, Probe, Project, RLCParams, TempLumped} from "../../../../../../model/esymiaModels";
import { Vector3 } from 'three';
import uniqid from "uniqid";

export function isTerminationNameValid(terminationName: string, allTermination: (Port|TempLumped|Probe)[]){
  return allTermination.filter(t => t.name === terminationName).length === 0
}

export function generateTerminationName(allTerminations: (Port|TempLumped|Probe)[], terminationCategory: "port"|"lumped"|"probe"):string {
  let name = uniqid(terminationCategory + "-")
  return (isTerminationNameValid(name, allTerminations)) ? name : generateTerminationName(allTerminations, terminationCategory)
}

export function getDefaultPort(name: string, size: number, position: Vector3){
    let port: Port = {
        name: name,
        category: 'port',
        inputElement: {
            type: "CIRCLE",
            keyComponent: 0,
            geometryAttributes: {
                radius: size/50,
                segments: 20,
            } as CircleGeometryAttributes,
            name: "inputPort" + name,
            orbitEnabled: false,
            transformationParams: {
                position: [position.x-2.5, position.y, position.z-5],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
            previousTransformationParams: {
                position: [position.x-2.5, position.y, position.z-5],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
            opacity: 1,
            transparency: false
        } as ComponentEntity,
        outputElement: {
            type: "CIRCLE",
            keyComponent: 0,
            geometryAttributes: {
                radius: size/50,
                segments: 20,
            } as CircleGeometryAttributes,
            name: "outputPort" + name,
            orbitEnabled: false,
            transformationParams: {
                position: [position.x+2.5, position.y, position.z-5],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
            previousTransformationParams: {
                position: [position.x+2.5, position.y, position.z-5],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
            opacity: 1,
            transparency: false
        } as ComponentEntity,
        isSelected: false,
    }
    return port
}

export function getDefaultLumped(name: string, size: number, position: Vector3){
    let lumped: TempLumped = {
        name: name,
        category: 'lumped',
        type: 0,
        inputElement: {
            type: "CIRCLE",
            keyComponent: 0,
            geometryAttributes: {
                radius: size/50,
                segments: 20,
            } as CircleGeometryAttributes,
            name: "inputPort" + name,
            orbitEnabled: false,
            transformationParams: {
                position: [position.x-2.5, position.y, position.z-5],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
            previousTransformationParams: {
                position: [position.x-2.5, position.y, position.z-5],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
            opacity: 1,
            transparency: false
        } as ComponentEntity,
        outputElement: {
            type: "CIRCLE",
            keyComponent: 0,
            geometryAttributes: {
                radius: size/50,
                segments: 20,
            } as CircleGeometryAttributes,
            name: "outputPort" + name,
            orbitEnabled: false,
            transformationParams: {
                position: [position.x+2.5, position.y, position.z-5],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
            previousTransformationParams: {
                position: [position.x+2.5, position.y, position.z-5],
                rotation: [0, 0, 0],
                scale: [1, 1, 1]
            } as TransformationParams,
            opacity: 1,
            transparency: false
        } as ComponentEntity,
        isSelected: false,
        rlcParams: {
          resistance: 0,
          inductance: 0,
          capacitance: 0
        } as RLCParams,
        value: 0
    }
    return lumped
}

export function getDefaultProbe(name: string, size: number){
    let probe: Probe = {
        name: name,
        category: 'probe',
        isSelected: false,
        groupPosition: [0, 3, 0],
        elements: [
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/50,
                    segments: 20,
                } as CircleGeometryAttributes,
                name: "inputPort" + name,
                orbitEnabled: false,
                transformationParams: {
                    position: [-0.5, .5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [-0.5, .5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/50,
                    segments: 20,
                } as CircleGeometryAttributes,
                name: "inputPort" + name,
                orbitEnabled: false,
                transformationParams: {
                    position: [0, .5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [0, .5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/50,
                    segments: 20,
                } as CircleGeometryAttributes,
                name: "inputPort" + name,
                orbitEnabled: false,
                transformationParams: {
                    position: [.5, .5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [.5, .5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/50,
                    segments: 20,
                } as CircleGeometryAttributes,
                name: "inputPort" + name,
                orbitEnabled: false,
                transformationParams: {
                    position: [-0.5, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [-0.5, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/50,
                    segments: 20,
                } as CircleGeometryAttributes,
                name: "inputPort" + name,
                orbitEnabled: false,
                transformationParams: {
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [0, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/50,
                    segments: 20,
                } as CircleGeometryAttributes,
                name: "inputPort" + name,
                orbitEnabled: false,
                transformationParams: {
                    position: [.5, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [.5, 0, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/50,
                    segments: 20,
                } as CircleGeometryAttributes,
                name: "inputPort" + name,
                orbitEnabled: false,
                transformationParams: {
                    position: [-0.5, -0.5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [-0.5, -0.5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/50,
                    segments: 20,
                } as CircleGeometryAttributes,
                name: "inputPort" + name,
                orbitEnabled: false,
                transformationParams: {
                    position: [0, -0.5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [0, -0.5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                opacity: 1,
                transparency: false
            } as ComponentEntity,
            {
                type: "CIRCLE",
                keyComponent: 0,
                geometryAttributes: {
                    radius: size/50,
                    segments: 20,
                } as CircleGeometryAttributes,
                name: "inputPort" + name,
                orbitEnabled: false,
                transformationParams: {
                    position: [.5, -0.5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                previousTransformationParams: {
                    position: [.5, -0.5, 0],
                    rotation: [0, 0, 0],
                    scale: [1, 1, 1]
                } as TransformationParams,
                opacity: 1,
                transparency: false
            } as ComponentEntity,
        ]
    }
    return probe
}
