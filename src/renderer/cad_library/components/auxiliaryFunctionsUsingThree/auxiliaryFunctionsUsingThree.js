"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.meshesCollidingWithTargetMesh = exports.meshesCollidingWithTargetMeshBasedOnBoundingBox = exports.getObjectsFromSceneByType = exports.thereIsCollisionBetweenMeshes = exports.transformationParamsOf = exports.meshFrom = exports.meshWithPositionRotationScaleFromPreviousOne = exports.meshWithResetTransformationParamsFromOld = exports.meshWithColorFromOldOne = exports.meshWithcomputedGeometryBoundingFrom = void 0;
var THREE = require("three");
var three_csg_ts_1 = require("three-csg-ts");
var componentEntity_1 = require("../model/componentEntity/componentEntity");
var meshWithcomputedGeometryBoundingFrom = function (mesh) {
    var _a;
    var meshCopy = mesh.clone();
    meshCopy.geometry = mesh.geometry.clone();
    meshCopy.updateMatrix();
    meshCopy.geometry.computeBoundingBox();
    (_a = meshCopy.geometry.boundingBox) === null || _a === void 0 ? void 0 : _a.applyMatrix4(meshCopy.matrix);
    return meshCopy;
};
exports.meshWithcomputedGeometryBoundingFrom = meshWithcomputedGeometryBoundingFrom;
var meshWithColorFromOldOne = function (oldMesh, newColor) {
    var newMesh = oldMesh.clone(true);
    newMesh.material.color.set(newColor);
    return newMesh;
};
exports.meshWithColorFromOldOne = meshWithColorFromOldOne;
var meshWithResetTransformationParamsFromOld = function (mesh) {
    return (0, exports.meshWithPositionRotationScaleFromPreviousOne)(mesh, componentEntity_1.TRANSF_PARAMS_DEFAULTS);
};
exports.meshWithResetTransformationParamsFromOld = meshWithResetTransformationParamsFromOld;
var meshWithPositionRotationScaleFromPreviousOne = function (oldMesh, transformationParams) {
    var _a, _b, _c;
    var mesh = oldMesh.clone(true);
    (_a = mesh.position).set.apply(_a, transformationParams.position);
    (_b = mesh.scale).set.apply(_b, transformationParams.scale);
    (_c = mesh.rotation).set.apply(_c, transformationParams.rotation);
    mesh.updateMatrix();
    return mesh;
};
exports.meshWithPositionRotationScaleFromPreviousOne = meshWithPositionRotationScaleFromPreviousOne;
var meshFrom = function (entity) {
    var newMesh = new THREE.Mesh(geometryFrom(entity), materialPhongFrom(entity));
    var meshResult = (0, exports.meshWithPositionRotationScaleFromPreviousOne)(newMesh, entity.transformationParams);
    return meshResult;
};
exports.meshFrom = meshFrom;
var materialPhongFrom = function (entity) {
    var material = new THREE.MeshPhongMaterial();
    (entity.material != undefined) && material.color.set(entity.material.color);
    return material;
};
var geometryFrom = function (entity) {
    switch (entity.type) {
        case "CUBE":
            var cubeGeometryAttributes = entity.geometryAttributes;
            return new THREE.BoxGeometry(cubeGeometryAttributes.width, cubeGeometryAttributes.height, cubeGeometryAttributes.depth, cubeGeometryAttributes.widthSegments, cubeGeometryAttributes.heigthSegments, cubeGeometryAttributes.depthSegments);
        case "SPHERE":
            var sphereGeometryAttributes = entity.geometryAttributes;
            return new THREE.SphereGeometry(sphereGeometryAttributes.radius, sphereGeometryAttributes.widthSegments, sphereGeometryAttributes.heightSegments, sphereGeometryAttributes.phiStart, sphereGeometryAttributes.phiLength, sphereGeometryAttributes.thetaStart, sphereGeometryAttributes.thetaLength);
        case "BUFFER":
            var positionVertices = new Float32Array(Object.values(entity.geometryAttributes.positionVertices));
            var normalVertices = new Float32Array(Object.values(entity.geometryAttributes.normalVertices));
            var bufferGeometryAttributes = {
                positionVertices: positionVertices,
                normalVertices: normalVertices,
                uvVertices: undefined
            };
            var geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(bufferGeometryAttributes.positionVertices, 3));
            geometry.setAttribute('normal', new THREE.BufferAttribute(bufferGeometryAttributes.normalVertices, 3));
            return geometry;
        case "CYLINDER":
            var cylinderGeometryAttributes = entity.geometryAttributes;
            return new THREE.CylinderGeometry(cylinderGeometryAttributes.topRadius, cylinderGeometryAttributes.bottomRadius, cylinderGeometryAttributes.height, cylinderGeometryAttributes.radialSegments, cylinderGeometryAttributes.heightSegments, cylinderGeometryAttributes.openEnded, cylinderGeometryAttributes.thetaStart, cylinderGeometryAttributes.thetaLength);
        case "TORUS":
            var torusGeometryAttributes = entity.geometryAttributes;
            return new THREE.TorusGeometry(torusGeometryAttributes.torusRadius, torusGeometryAttributes.tubeRadius, torusGeometryAttributes.radialSegments, torusGeometryAttributes.tubularSegments, torusGeometryAttributes.centralAngle);
        case "CONE":
            var coneGeometryAttributes = entity.geometryAttributes;
            return new THREE.ConeGeometry(coneGeometryAttributes.radius, coneGeometryAttributes.height, coneGeometryAttributes.radialSegments, coneGeometryAttributes.heightSegments, coneGeometryAttributes.openEnded, coneGeometryAttributes.thetaStart, coneGeometryAttributes.thetaLength);
        default:
            var compositeEntity = entity;
            var _a = [(0, exports.meshFrom)(compositeEntity.baseElements.elementA), (0, exports.meshFrom)(compositeEntity.baseElements.elementB)], elementA = _a[0], elementB = _a[1];
            return meshFromOperationBetweenTwoMeshes(entity.type, elementA, elementB).geometry;
    }
};
var meshFromOperationBetweenTwoMeshes = function (operation, firstMesh, secondMesh) {
    if (operation === "UNION") {
        return three_csg_ts_1.CSG.union(firstMesh, secondMesh);
    }
    else if (operation === "INTERSECTION") {
        return three_csg_ts_1.CSG.intersect(firstMesh, secondMesh);
    }
    else {
        return three_csg_ts_1.CSG.subtract(firstMesh, secondMesh);
    }
};
var transformationParamsOf = function (mesh) {
    return {
        position: [mesh.position.x, mesh.position.y, mesh.position.z],
        rotation: [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z],
        scale: [mesh.scale.x, mesh.scale.y, mesh.scale.z]
    };
};
exports.transformationParamsOf = transformationParamsOf;
var thereIsCollisionBetweenMeshes = function (firstMesh, secondMesh) {
    var mesh2 = (0, exports.meshWithcomputedGeometryBoundingFrom)(secondMesh);
    var mesh1 = (0, exports.meshWithcomputedGeometryBoundingFrom)(firstMesh);
    return (mesh1.geometry.boundingBox && mesh2.geometry.boundingBox)
        ? mesh1.geometry.boundingBox.intersectsBox(mesh2.geometry.boundingBox)
        : false;
};
exports.thereIsCollisionBetweenMeshes = thereIsCollisionBetweenMeshes;
var getObjectsFromSceneByType = function (scene, type) { return scene.children.filter(function (obj) { return obj.type === type; }); };
exports.getObjectsFromSceneByType = getObjectsFromSceneByType;
var meshesCollidingWithTargetMeshBasedOnBoundingBox = function (targetMesh, meshesToCheckCollisionWith) {
    return meshesToCheckCollisionWith
        .reduce(function (results, mesh) {
        ((0, exports.thereIsCollisionBetweenMeshes)(targetMesh, mesh)) && results.push(mesh);
        return results;
    }, []);
};
exports.meshesCollidingWithTargetMeshBasedOnBoundingBox = meshesCollidingWithTargetMeshBasedOnBoundingBox;
var meshesCollidingWithTargetMesh = function (targetMesh, meshesToCheckCollisionWith) {
    var meshesToCheckCopy = __spreadArray([], meshesToCheckCollisionWith, true);
    var directionVector = new THREE.Vector3();
    var collisions = [];
    var _loop_1 = function (index) {
        directionVector.fromBufferAttribute(targetMesh.geometry.getAttribute("position"), index).applyMatrix4(targetMesh.matrix).sub(targetMesh.position);
        var ray = new THREE.Raycaster(targetMesh.position.clone(), directionVector.clone().normalize());
        var collisionResults = ray.intersectObjects(meshesToCheckCopy);
        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
            collisions.push(collisionResults[0].object);
            meshesToCheckCopy = meshesToCheckCopy.filter(function (mesh) { return mesh.name !== collisionResults[0].object.name; });
        }
    };
    for (var index = 0; index < targetMesh.geometry.getAttribute("position").count; index++) {
        _loop_1(index);
    }
    return collisions;
};
exports.meshesCollidingWithTargetMesh = meshesCollidingWithTargetMesh;
