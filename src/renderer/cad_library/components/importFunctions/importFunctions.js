"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importRisGeometry = exports.importFromCadProject = exports.importFromCadSTL = void 0;
var cube_1 = require("../baseShapes/shapes/cube/cube");
var componentEntity_1 = require("../model/componentEntity/componentEntity");
var canvasSlice_1 = require("../store/canvas/canvasSlice");
var STLLoader_1 = require("three/examples/jsm/loaders/STLLoader");
var viewItemSlice_1 = require("../../../cadmia/canvas/components/navBar/menuItems/view/viewItemSlice");
//TODO: change importFromCadSTL to make it working in any case, not only for the CAD.
var importFromCadSTL = function (STLFile, numberOfGeneratedKey, dispatch) {
    var loader = new STLLoader_1.STLLoader();
    STLFile.arrayBuffer().then(function (value) {
        var res = loader.parse(value);
        var entity = {
            type: 'BUFFER',
            name: 'BUFFER',
            keyComponent: (0, cube_1.getNewKeys)(numberOfGeneratedKey, dispatch)[0],
            orbitEnabled: true,
            transformationParams: componentEntity_1.TRANSF_PARAMS_DEFAULTS,
            previousTransformationParams: componentEntity_1.TRANSF_PARAMS_DEFAULTS,
            geometryAttributes: {
                positionVertices: res.attributes.position.array,
                normalVertices: res.attributes.normal.array,
                uvVertices: undefined
            },
            transparency: true,
            opacity: 1
        };
        dispatch((0, canvasSlice_1.addComponent)(entity));
    });
};
exports.importFromCadSTL = importFromCadSTL;
var importFromCadProject = function (file, dispatch, action, actionParamsObject) {
    file.text().then(function (value) {
        actionParamsObject.canvas = JSON.parse(value);
        dispatch(action(actionParamsObject));
    });
};
exports.importFromCadProject = importFromCadProject;
var importRisGeometry = function (file, dispatch, numberOfGeneratedKey) {
    file.text().then(function (value) {
        var data = JSON.parse(value).ris_geometry;
        var key = (0, cube_1.getNewKeys)(numberOfGeneratedKey, dispatch, data.length);
        data.forEach(function (item, index) {
            var cube = (0, cube_1.getRisCube)(key[index], dispatch, item);
            dispatch((0, canvasSlice_1.addComponent)(cube));
        });
        dispatch((0, viewItemSlice_1.setFocusNotToScene)());
    });
};
exports.importRisGeometry = importRisGeometry;
