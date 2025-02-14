"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.round_ud = round_ud;
function round_ud(a, b) {
    if (b === undefined) {
        return a.map(function (x) { return Math.round(x); });
    }
    else {
        return a.map(function (x) { return Math.round(x * Math.pow(10, b)) / Math.pow(10, b); });
    }
}
