import * as THREE from "three"

export type FaceData = {
    normal: THREE.Vector3,
    point: THREE.Vector3
}

export const alignObjectsByFaces = (
    movingMesh: THREE.Mesh,
    faceA: FaceData,
    targetMesh: THREE.Mesh,
    faceB: FaceData
): { position: THREE.Vector3, rotation: THREE.Euler } => {

    // 1. Calculate Rotation
    // We want to rotate movingMesh so that faceA.normal points opposite to faceB.normal
    // i.e., faceA.normal should become -faceB.normal

    const targetNormal = faceB.normal.clone().negate();
    const currentNormal = faceA.normal.clone();

    // Create a quaternion that rotates currentNormal to targetNormal
    const quaternion = new THREE.Quaternion().setFromUnitVectors(currentNormal, targetNormal);

    // Apply this rotation to the movingMesh's current rotation
    const newQuaternion = movingMesh.quaternion.clone().premultiply(quaternion);
    const newRotation = new THREE.Euler().setFromQuaternion(newQuaternion);

    // 2. Calculate Translation
    // After rotation, we need to move the mesh so that faceA.point coincides with faceB.point

    // First, find where faceA.point is relative to the mesh center *after* rotation
    // We can do this by applying the rotation to the vector (point - center)
    const movingCenter = movingMesh.position.clone();
    const pointRelToCenter = faceA.point.clone().sub(movingCenter);
    pointRelToCenter.applyQuaternion(quaternion);

    // The new position of the point would be newCenter + pointRelToCenter
    // We want newCenter + pointRelToCenter = faceB.point
    // So, newCenter = faceB.point - pointRelToCenter

    const newPosition = faceB.point.clone().sub(pointRelToCenter);

    return {
        position: newPosition,
        rotation: newRotation
    };
}

export const getAllMeshes = (root: THREE.Object3D): THREE.Mesh[] => {
    const meshes: THREE.Mesh[] = [];
    root.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name !== "" && !child.name.includes("helper")) {
            meshes.push(child);
        }
    });
    return meshes;
}
