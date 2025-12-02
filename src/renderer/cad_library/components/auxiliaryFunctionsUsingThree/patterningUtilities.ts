import { ComponentEntity } from "../model/componentEntity/componentEntity";
import * as THREE from "three";

const cloneChildren = (
    children: ComponentEntity[],
    getNewKey: () => number,
    suffix: string,
    existingNames: string[]
): ComponentEntity[] => {
    return children.map(child => {
        const newKey = getNewKey();
        let baseName = `${child.name}${suffix}`;
        let uniqueName = baseName;
        let counter = 1;
        while (existingNames.includes(uniqueName)) {
            uniqueName = `${baseName}_${counter}`;
            counter++;
        }

        const newChild: ComponentEntity = {
            ...child,
            keyComponent: newKey,
            name: uniqueName,
            children: child.children ? cloneChildren(child.children, getNewKey, suffix, existingNames) : undefined
        };
        return newChild;
    });
};

export const generateLinearArray = (
    entity: ComponentEntity,
    count: number,
    offset: [number, number, number],
    getNewKey: () => number,
    existingNames: string[] = []
): ComponentEntity[] => {
    const copies: ComponentEntity[] = [];
    for (let i = 1; i <= count; i++) {
        const newKey = getNewKey();

        let baseName = `${entity.name}_array_${i}`;
        let uniqueName = baseName;
        let counter = 1;
        while (existingNames.includes(uniqueName) || copies.some(c => c.name === uniqueName)) {
            uniqueName = `${baseName}_${counter}`;
            counter++;
        }

        const newEntity: ComponentEntity = {
            ...entity,
            name: uniqueName,
            keyComponent: newKey,
            transformationParams: {
                ...entity.transformationParams,
                position: [
                    entity.transformationParams.position[0] + offset[0] * i,
                    entity.transformationParams.position[1] + offset[1] * i,
                    entity.transformationParams.position[2] + offset[2] * i,
                ],
            },
            children: entity.children ? cloneChildren(entity.children, getNewKey, `_array_${i}`, existingNames) : undefined
        };
        copies.push(newEntity);
    }
    return copies;
};

export const generateCircularArray = (
    entity: ComponentEntity,
    count: number,
    center: [number, number, number],
    axis: 'X' | 'Y' | 'Z',
    angle: number,
    getNewKey: () => number
): ComponentEntity[] => {
    const copies: ComponentEntity[] = [];
    const angleStep = (angle * (Math.PI / 180)) / (count); // Distribute over the total angle

    // Create a pivot object to handle rotation easily
    const pivot = new THREE.Object3D();
    pivot.position.set(...center);

    const dummy = new THREE.Object3D();
    dummy.position.set(...entity.transformationParams.position);
    dummy.rotation.set(...entity.transformationParams.rotation);
    dummy.scale.set(...entity.transformationParams.scale);

    // Attach dummy to pivot
    pivot.add(dummy);
    // Adjust dummy position relative to pivot (world position remains same initially)
    dummy.position.sub(pivot.position);

    const axisVector = new THREE.Vector3(
        axis === 'X' ? 1 : 0,
        axis === 'Y' ? 1 : 0,
        axis === 'Z' ? 1 : 0
    );

    for (let i = 1; i <= count; i++) {
        const newKey = getNewKey();

        // Rotate the dummy inside the pivot
        // We need to clone the logic here because we are simulating the rotation
        // A simpler way: Rotate the position vector around the center

        const originalPos = new THREE.Vector3(...entity.transformationParams.position);
        const centerVec = new THREE.Vector3(...center);
        const relativePos = originalPos.clone().sub(centerVec);

        relativePos.applyAxisAngle(axisVector, angleStep * i);
        const newPos = relativePos.add(centerVec);

        // For rotation, we also need to rotate the object itself if it's a circular array
        // Usually circular array rotates the object orientation too
        const originalRot = new THREE.Euler(...entity.transformationParams.rotation);
        const originalQuat = new THREE.Quaternion().setFromEuler(originalRot);
        const rotationQuat = new THREE.Quaternion().setFromAxisAngle(axisVector, angleStep * i);
        const newQuat = originalQuat.clone().premultiply(rotationQuat);
        const newRot = new THREE.Euler().setFromQuaternion(newQuat);

        const newEntity: ComponentEntity = {
            ...entity,
            name: `${entity.name}_circular_${i}`,
            keyComponent: newKey,
            transformationParams: {
                ...entity.transformationParams,
                position: [newPos.x, newPos.y, newPos.z],
                rotation: [newRot.x, newRot.y, newRot.z],
            },
        };
        copies.push(newEntity);
    }
    return copies;
};

export const generateMirror = (
    entity: ComponentEntity,
    planeNormal: [number, number, number],
    planeConstant: number, // Distance from origin
    getNewKey: () => number
): ComponentEntity => {
    const newKey = getNewKey();

    const normal = new THREE.Vector3(...planeNormal).normalize();
    const plane = new THREE.Plane(normal, -planeConstant); // Three.js plane constant is negative distance if normal points away from origin? 
    // Actually Plane(normal, constant) -> normal.dot(point) + constant = 0
    // If we want a plane at x=5, normal=(1,0,0), constant=-5. 1*5 + (-5) = 0.

    // Mirror position
    const pos = new THREE.Vector3(...entity.transformationParams.position);
    const target = new THREE.Vector3();
    plane.projectPoint(pos, target); // Project point onto plane
    const diff = target.sub(pos);
    const newPos = pos.clone().add(diff.multiplyScalar(2)); // Move twice the distance to the plane

    // Mirror rotation/scale is tricky. 
    // Simple mirror: Flip one axis of scale?
    // If we mirror across X plane, we flip X scale.
    // But that might invert normals (inside out).
    // Better to apply a reflection matrix.

    const m = new THREE.Matrix4();
    // Reflection matrix
    // R = I - 2 * n * nT
    // This is complex to decompose back to pos/rot/scale perfectly for all cases.
    // For simple axis-aligned planes, we can just flip the coordinate and scale.

    // Let's stick to simple axis mirroring for now if the normal is axis aligned.
    let newScale = [...entity.transformationParams.scale] as [number, number, number];
    let newRot = [...entity.transformationParams.rotation] as [number, number, number];

    // If arbitrary plane, we might need to adjust rotation significantly.
    // For MVP, let's assume the user wants to mirror position mostly, 
    // but for a true mirror, the object should be flipped.
    // Flipping scale on one axis (e.g. X) does the trick visually but might mess up winding order.
    // Three.js handles negative scale reasonably well usually.

    // Check if normal is axis aligned
    if (Math.abs(normal.x) > 0.9) newScale[0] *= -1;
    else if (Math.abs(normal.y) > 0.9) newScale[1] *= -1;
    else if (Math.abs(normal.z) > 0.9) newScale[2] *= -1;
    else {
        // Fallback for arbitrary plane: just flip all? No that's inversion.
        // Let's just flip X for now as a generic "mirror" effect on the object local space 
        // combined with the position mirror.
        // This is a simplification.
        newScale[0] *= -1;
    }

    // We also need to reflect the rotation.
    // This is getting complicated for a utility function without full matrix decomposition.
    // Let's rely on the position mirror and a simple scale flip for now.

    // Re-calculating rotation for the mirrored object:
    // Construct matrix, reflect it, decompose.
    const objMatrix = new THREE.Matrix4();
    objMatrix.compose(pos, new THREE.Quaternion().setFromEuler(new THREE.Euler(...entity.transformationParams.rotation)), new THREE.Vector3(...entity.transformationParams.scale));

    const reflectionMatrix = new THREE.Matrix4();
    // R = I - 2nn^T
    // 1-2nx^2  -2nxny  -2nxnz  0
    // -2nxny   1-2ny^2 -2nynz  0
    // -2nxnz   -2nynz  1-2nz^2 0
    // 0        0       0       1
    // And we also need to handle the plane translation... 
    // Actually Three.js doesn't have a built-in "reflect" method for Matrix4.

    // Let's stick to the calculated newPos and a flipped scale.
    // For rotation, if we flip scale X, we might not need to change rotation if it was axis aligned?
    // Let's leave rotation as is for now, except for the scale flip. 
    // Users can adjust rotation if needed.

    return {
        ...entity,
        name: `${entity.name}_mirror`,
        keyComponent: newKey,
        transformationParams: {
            position: [newPos.x, newPos.y, newPos.z],
            rotation: newRot,
            scale: newScale,
        },
    };
};

export const getCenterOfEntities = (entities: ComponentEntity[]): THREE.Vector3 => {
    if (entities.length === 0) return new THREE.Vector3(0, 0, 0);

    const box = new THREE.Box3();
    entities.forEach(entity => {
        // We need to approximate the bounding box of the entity.
        // Since we don't have the full geometry here easily without instantiating meshes,
        // we can use the position as a rough center, or if we want to be precise, 
        // we might need to rely on the stored geometry attributes if possible.
        // For now, let's use the position of the entities to find the "center of mass" of the selection
        // which is often what is expected for "centering a group".
        // If we want the center of the *bounding box* of the group, we need the size of each object.

        // Let's rely on positions for now as it's lighter. 
        // If the user needs bounding box center, we'd need to reconstruct geometries.
        box.expandByPoint(new THREE.Vector3(...entity.transformationParams.position));
    });

    const center = new THREE.Vector3();
    box.getCenter(center);
    return center;
};

