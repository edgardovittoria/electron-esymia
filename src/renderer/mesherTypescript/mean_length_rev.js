"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mean_length_rev = mean_length_rev;
function mean_length_rev(barra1, curr_dir) {
    var xi1 = [barra1[0], barra1[3], barra1[6], barra1[9]];
    var yi1 = [barra1[1], barra1[4], barra1[7], barra1[10]];
    var zi1 = [barra1[2], barra1[5], barra1[8], barra1[11]];
    var xi2 = [barra1[12], barra1[15], barra1[18], barra1[21]];
    var yi2 = [barra1[13], barra1[16], barra1[19], barra1[22]];
    var zi2 = [barra1[14], barra1[17], barra1[20], barra1[23]];
    var ri = [
        [xi1[0], yi1[0], zi1[0]],
        [xi1[1], yi1[1], zi1[1]],
        [xi1[2], yi1[2], zi1[2]],
        [xi1[3], yi1[3], zi1[3]],
        [xi2[0], yi2[0], zi2[0]],
        [xi2[1], yi2[1], zi2[1]],
        [xi2[2], yi2[2], zi2[2]],
        [xi2[3], yi2[3], zi2[3]],
    ];
    var r1;
    var r2;
    if (curr_dir === 1) {
        r1 = [
            (ri[0][0] + ri[2][0] + ri[4][0] + ri[6][0]) / 4,
            (ri[0][1] + ri[2][1] + ri[4][1] + ri[6][1]) / 4,
            (ri[0][2] + ri[2][2] + ri[4][2] + ri[6][2]) / 4,
        ];
        r2 = [
            (ri[1][0] + ri[3][0] + ri[5][0] + ri[7][0]) / 4,
            (ri[1][1] + ri[3][1] + ri[5][1] + ri[7][1]) / 4,
            (ri[1][2] + ri[3][2] + ri[5][2] + ri[7][2]) / 4,
        ];
    }
    else if (curr_dir === 2) {
        r1 = [
            (ri[0][0] + ri[1][0] + ri[4][0] + ri[5][0]) / 4,
            (ri[0][1] + ri[1][1] + ri[4][1] + ri[5][1]) / 4,
            (ri[0][2] + ri[1][2] + ri[4][2] + ri[5][2]) / 4,
        ];
        r2 = [
            (ri[2][0] + ri[3][0] + ri[6][0] + ri[7][0]) / 4,
            (ri[2][1] + ri[3][1] + ri[6][1] + ri[7][1]) / 4,
            (ri[2][2] + ri[3][2] + ri[6][2] + ri[7][2]) / 4,
        ];
    }
    else {
        r1 = [
            (ri[0][0] + ri[1][0] + ri[2][0] + ri[3][0]) / 4,
            (ri[0][1] + ri[1][1] + ri[2][1] + ri[3][1]) / 4,
            (ri[0][2] + ri[1][2] + ri[2][2] + ri[3][2]) / 4,
        ];
        r2 = [
            (ri[4][0] + ri[5][0] + ri[6][0] + ri[7][0]) / 4,
            (ri[4][1] + ri[5][1] + ri[6][1] + ri[7][1]) / 4,
            (ri[4][2] + ri[5][2] + ri[6][2] + ri[7][2]) / 4,
        ];
    }
    // Calcola la norma 2 (norma euclidea) della differenza tra r1 e r2
    var mean_l = Math.sqrt(Math.pow((r1[0] - r2[0]), 2) + Math.pow((r1[1] - r2[1]), 2) + Math.pow((r1[2] - r2[2]), 2));
    return mean_l;
}
