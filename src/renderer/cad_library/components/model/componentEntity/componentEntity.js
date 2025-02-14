"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areEquals = exports.TRANSF_PARAMS_DEFAULTS = void 0;
exports.TRANSF_PARAMS_DEFAULTS = {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1]
};
var areEquals = function (firstTransfParams, secondTransfParams) {
    if (firstTransfParams.position.every(function (val, index) { return val === secondTransfParams.position[index]; })
        && firstTransfParams.scale.every(function (val, index) { return val === secondTransfParams.scale[index]; })
        && firstTransfParams.rotation.every(function (val, index) { return val === secondTransfParams.rotation[index]; })) {
        return true;
    }
    return false;
};
exports.areEquals = areEquals;
