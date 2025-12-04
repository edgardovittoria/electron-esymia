import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import { meshFrom } from "../auxiliaryFunctionsUsingThree/auxiliaryFunctionsUsingThree";
import { ComponentEntity } from "../model";
import * as THREE from "three";

const objectFrom = (entity: ComponentEntity): THREE.Object3D => {
    if (entity.type === 'GROUP') {
        const group = new THREE.Group();
        group.position.set(...entity.transformationParams.position);
        group.rotation.set(...entity.transformationParams.rotation);
        group.scale.set(...entity.transformationParams.scale);

        const groupEntity = entity as any;
        if (groupEntity.children) {
            groupEntity.children.forEach((child: ComponentEntity) => {
                group.add(objectFrom(child));
            });
        }
        return group;
    } else {
        return meshFrom(entity);
    }
};

export const exportToSTL = (components: ComponentEntity[]): string => {
    let exporter = new STLExporter();
    let scene = new THREE.Scene();

    components.forEach(c => {
        scene.add(objectFrom(c));
    });

    scene.updateWorldMatrix(true, true);

    const re = new RegExp('exported', 'g');
    // Use the name of the first component or a default name
    const name = components.length > 0 && components[0].material?.name ? components[0].material.name : 'model';
    let STLToPush = exporter.parse(scene).replace(re, name);
    return STLToPush;
};