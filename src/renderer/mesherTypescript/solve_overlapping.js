"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solve_overlapping = solve_overlapping;
var split_overlapping_1 = require("./split_overlapping");
function solve_overlapping(barre, materiale, materiale_dominante) {
    var continua = 1;
    while (continua) {
        continua = 0;
        var isOverlapped = 0;
        var _loop_1 = function (i) {
            var _loop_2 = function (j) {
                var _a = (0, split_overlapping_1.split_overlapping)(barre[i], barre[j], materiale[i], materiale[j], materiale_dominante), barre_split = _a.barre_out, isOverlapped_1 = _a.isOverlapped, materiale_split = _a.mat_out;
                if (isOverlapped_1 === 1) {
                    continua = 1;
                    var indicesToKeep = barre
                        .map(function (_, index) { return index; })
                        .filter(function (index) { return index !== i && index !== j; });
                    var barreToKeep = indicesToKeep.map(function (index) { return barre[index]; });
                    var materialeToKeep = indicesToKeep.map(function (index) { return materiale[index]; });
                    barre = barre_split.concat(barreToKeep);
                    materiale = materiale_split.concat(materialeToKeep);
                    return "break";
                }
            };
            for (var j = i + 1; j < barre.length; j++) {
                var state_2 = _loop_2(j);
                if (state_2 === "break")
                    break;
            }
            if (continua === 1) {
                return "break";
            }
        };
        for (var i = 0; i < barre.length - 1; i++) {
            var state_1 = _loop_1(i);
            if (state_1 === "break")
                break;
        }
    }
    return { barre: barre, materiale: materiale };
}
