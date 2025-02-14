"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.surfa_old = surfa_old;
var norm_1 = require("./norm");
var cross_1 = require("./cross");
function surfa_old(barra1, weights_five, roots_five) {
    var xi1 = [barra1[0], barra1[3], barra1[6], barra1[9]];
    var yi1 = [barra1[1], barra1[4], barra1[7], barra1[10]];
    var zi1 = [barra1[2], barra1[5], barra1[8], barra1[11]];
    var ri = [];
    ri[0] = [xi1[0], yi1[0], zi1[0]];
    ri[1] = [xi1[1], yi1[1], zi1[1]];
    ri[2] = [xi1[2], yi1[2], zi1[2]];
    ri[3] = [xi1[3], yi1[3], zi1[3]];
    // Calcolo di rmi, rai, rbi, rabi 
    var rmi = ri.reduce(function (sum, r) { return sum.map(function (val, i) { return val + r[i]; }); }).map(function (val) { return val / 4; }); // Punto medio
    var rai = ri.map(function (val, i) { return (i % 2 === 0 ? -1 : 1) * val[0] / 4 + (i < 2 ? -1 : 1) * val[1] / 4 + val[2] / 4; }).map(function (val, i, arr) { return val + arr[i]; }); // Derivata parziale rispetto a xi
    var rbi = ri.map(function (val, i) { return (i < 2 ? -1 : 1) * val[0] / 4 + (i % 2 === 0 ? -1 : 1) * val[1] / 4 + val[2] / 4; }).map(function (val, i, arr) { return val + arr[i]; }); // Derivata parziale rispetto a eta
    var rabi = ri.map(function (val, i) { return (i % 2 === 0 ? 1 : -1) * val[0] / 4 + (i < 2 ? -1 : 1) * val[1] / 4 + val[2] / 4; }).map(function (val, i, arr) { return val + arr[i]; }); // Derivata parziale seconda rispetto a xi e eta
    var wex = weights_five;
    var rootx = roots_five;
    var wey = wex;
    var rooty = rootx;
    var nlx = wex.length;
    var nly = wey.length;
    var sum_a1 = 0;
    var _loop_1 = function (a1) {
        var sum_b1 = 0;
        var _loop_2 = function (b1) {
            var drai = rai.map(function (val, i) { return val + rabi[i] * rooty[b1]; });
            var drbi = rbi.map(function (val, i) { return val + rabi[i] * rootx[a1]; });
            var draim = (0, norm_1.norm)(drai);
            var drbim = (0, norm_1.norm)(drbi);
            var aversi = drai.map(function (val) { return val / draim; });
            var bversi = drbi.map(function (val) { return val / drbim; });
            var steti = (0, cross_1.cross)(aversi, bversi);
            var stetim = (0, norm_1.norm)(steti);
            var f = draim * drbim * stetim;
            sum_b1 += wey[b1] * f;
        };
        for (var b1 = 0; b1 < nly; b1++) {
            _loop_2(b1);
        }
        sum_a1 += wex[a1] * sum_b1;
    };
    for (var a1 = 0; a1 < nlx; a1++) {
        _loop_1(a1);
    }
    var integr = sum_a1;
    return integr;
}
