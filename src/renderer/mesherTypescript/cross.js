"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cross = cross;
function cross(vec1, vec2) {
    return [
        vec1[1] * vec2[2] - vec1[2] * vec2[1],
        vec1[2] * vec2[0] - vec1[0] * vec2[2],
        vec1[0] * vec2[1] - vec1[1] * vec2[0],
    ];
}
