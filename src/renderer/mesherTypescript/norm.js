"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.norm = norm;
function norm(vec) {
    return Math.sqrt(vec.reduce(function (sum, val) { return sum + val * val; }, 0));
}
