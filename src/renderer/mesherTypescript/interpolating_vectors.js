"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolating_vectors = interpolating_vectors;
function interpolating_vectors(ri) {
    // rmi = 0.125 * sum(ri,1)
    var rmi = ri
        .reduce(function (sum, row) { return [sum[0] + row[0], sum[1] + row[1], sum[2] + row[2]]; }, [0, 0, 0])
        .map(function (x) { return x / 8; });
    // rai
    var rai = [
        (-ri[0][0] + ri[1][0] - ri[2][0] + ri[3][0] - ri[4][0] + ri[5][0] - ri[6][0] + ri[7][0]) / 8,
        (-ri[0][1] + ri[1][1] - ri[2][1] + ri[3][1] - ri[4][1] + ri[5][1] - ri[6][1] + ri[7][1]) / 8,
        (-ri[0][2] + ri[1][2] - ri[2][2] + ri[3][2] - ri[4][2] + ri[5][2] - ri[6][2] + ri[7][2]) / 8
    ];
    // rbi
    var rbi = [
        (-ri[0][0] - ri[1][0] + ri[2][0] + ri[3][0] - ri[4][0] - ri[5][0] + ri[6][0] + ri[7][0]) / 8,
        (-ri[0][1] - ri[1][1] + ri[2][1] + ri[3][1] - ri[4][1] - ri[5][1] + ri[6][1] + ri[7][1]) / 8,
        (-ri[0][2] - ri[1][2] + ri[2][2] + ri[3][2] - ri[4][2] - ri[5][2] + ri[6][2] + ri[7][2]) / 8
    ];
    // rci
    var rci = [
        (-ri[0][0] - ri[1][0] - ri[2][0] - ri[3][0] + ri[4][0] + ri[5][0] + ri[6][0] + ri[7][0]) / 8,
        (-ri[0][1] - ri[1][1] - ri[2][1] - ri[3][1] + ri[4][1] + ri[5][1] + ri[6][1] + ri[7][1]) / 8,
        (-ri[0][2] - ri[1][2] - ri[2][2] - ri[3][2] + ri[4][2] + ri[5][2] + ri[6][2] + ri[7][2]) / 8
    ];
    // rabi
    var rabi = [
        (ri[0][0] - ri[1][0] - ri[2][0] + ri[3][0] + ri[4][0] - ri[5][0] - ri[6][0] + ri[7][0]) / 8,
        (ri[0][1] - ri[1][1] - ri[2][1] + ri[3][1] + ri[4][1] - ri[5][1] - ri[6][1] + ri[7][1]) / 8,
        (ri[0][2] - ri[1][2] - ri[2][2] + ri[3][2] + ri[4][2] - ri[5][2] - ri[6][2] + ri[7][2]) / 8
    ];
    // rbci
    var rbci = [
        (ri[0][0] + ri[1][0] - ri[2][0] - ri[3][0] - ri[4][0] - ri[5][0] + ri[6][0] + ri[7][0]) / 8,
        (ri[0][1] + ri[1][1] - ri[2][1] - ri[3][1] - ri[4][1] - ri[5][1] + ri[6][1] + ri[7][1]) / 8,
        (ri[0][2] + ri[1][2] - ri[2][2] - ri[3][2] - ri[4][2] - ri[5][2] + ri[6][2] + ri[7][2]) / 8
    ];
    // raci
    var raci = [
        (ri[0][0] - ri[1][0] - ri[3][0] + ri[2][0] - ri[4][0] + ri[5][0] + ri[7][0] - ri[6][0]) / 8,
        (ri[0][1] - ri[1][1] - ri[3][1] + ri[2][1] - ri[4][1] + ri[5][1] + ri[7][1] - ri[6][1]) / 8,
        (ri[0][2] - ri[1][2] - ri[3][2] + ri[2][2] - ri[4][2] + ri[5][2] + ri[7][2] - ri[6][2]) / 8
    ];
    // rabci
    var rabci = [
        (-ri[0][0] + ri[1][0] + ri[2][0] - ri[3][0] + ri[4][0] - ri[5][0] - ri[6][0] + ri[7][0]) / 8,
        (-ri[0][1] + ri[1][1] + ri[2][1] - ri[3][1] + ri[4][1] - ri[5][1] - ri[6][1] + ri[7][1]) / 8,
        (-ri[0][2] + ri[1][2] + ri[2][2] - ri[3][2] + ri[4][2] - ri[5][2] - ri[6][2] + ri[7][2]) / 8
    ];
    return { rmi: rmi, rai: rai, rbi: rbi, rci: rci, rabi: rabi, rbci: rbci, raci: raci, rabci: rabci };
}
