"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToSTL = void 0;
var STLExporter_1 = require("three/examples/jsm/exporters/STLExporter");
var auxiliaryFunctionsUsingThree_1 = require("../auxiliaryFunctionsUsingThree/auxiliaryFunctionsUsingThree");
var THREE = require("three");
var exportToSTL = function (components) {
    var _a;
    var exporter = new STLExporter_1.STLExporter();
    var scene = new THREE.Scene();
    components.forEach(function (c) {
        scene.add((0, auxiliaryFunctionsUsingThree_1.meshFrom)(c));
        scene.updateWorldMatrix(true, true);
    });
    var re = new RegExp('exported', 'g');
    var STLToPush = exporter.parse(scene).replace(re, (_a = components[0].material) === null || _a === void 0 ? void 0 : _a.name);
    return STLToPush;
};
exports.exportToSTL = exportToSTL;
