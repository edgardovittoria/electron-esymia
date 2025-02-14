"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePointerIntersectionOnMeshSurface = void 0;
var fiber_1 = require("@react-three/fiber");
var react_1 = require("react");
var three_1 = require("three");
var auxiliaryFunctionsUsingThree_1 = require("../auxiliaryFunctionsUsingThree/auxiliaryFunctionsUsingThree");
var usePointerIntersectionOnMeshSurface = function () {
    var getPointerCoordsOnMeshSurface = function (pointerCoords, scene, camera) {
        var _a;
        var raycaster = new three_1.Raycaster();
        raycaster.setFromCamera(pointerCoords, camera);
        var intersects = raycaster.intersectObjects((0, auxiliaryFunctionsUsingThree_1.getObjectsFromSceneByType)(scene, "Mesh"));
        if (intersects.length > 0) {
            var point = {
                coordinates: intersects[0].point.clone(),
                normalVector: (_a = intersects[0].face) === null || _a === void 0 ? void 0 : _a.normal.clone()
            };
            return point;
        }
        return undefined;
    };
    var _a = (0, react_1.useState)(undefined), pointerCoordinates = _a[0], setPointerCoordinates = _a[1];
    var _b = (0, react_1.useState)(undefined), normalVector = _b[0], setNormalVector = _b[1];
    var state = (0, fiber_1.useThree)();
    var setPointerIntersectionData = function (event) {
        var pointerCoords = new three_1.Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
        var point = getPointerCoordsOnMeshSurface(pointerCoords, state.scene, state.camera);
        if (point) {
            setPointerCoordinates(point.coordinates);
            setNormalVector(point.normalVector);
        }
    };
    return { pointerCoordinates: pointerCoordinates, normalVector: normalVector, setPointerIntersectionData: setPointerIntersectionData };
};
exports.usePointerIntersectionOnMeshSurface = usePointerIntersectionOnMeshSurface;
