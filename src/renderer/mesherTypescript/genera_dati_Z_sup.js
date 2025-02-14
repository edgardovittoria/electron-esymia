"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genera_dati_Z_sup = genera_dati_Z_sup;
/**
 * Modifica la struttura `induttanze` passata  e restituisce lo stesso oggetto aggiornato.
 */
function genera_dati_Z_sup(induttanze) {
    var associazione = induttanze.facce_indici_associazione;
    var nFacce = induttanze.facce_estremi_celle.length;
    var tutte_le_facce = Array.from({ length: nFacce }, function () { return [0, 0, 0, 0, 0, 0]; });
    var X2 = induttanze.facce_estremi_celle.map(function (row) { return [row[0], row[3], row[6], row[9]]; });
    var Y2 = induttanze.facce_estremi_celle.map(function (row) { return [row[1], row[4], row[7], row[10]]; });
    var Z2 = induttanze.facce_estremi_celle.map(function (row) { return [row[2], row[5], row[8], row[11]]; });
    for (var cont = 0; cont < nFacce; cont++) {
        var xVals = X2[cont];
        var yVals = Y2[cont];
        var zVals = Z2[cont];
        tutte_le_facce[cont] = [
            Math.min.apply(Math, xVals),
            Math.max.apply(Math, xVals),
            Math.min.apply(Math, yVals),
            Math.max.apply(Math, yVals),
            Math.min.apply(Math, zVals),
            Math.max.apply(Math, zVals),
        ];
    }
    var celle_sup = induttanze.celle_superficie_estremi_celle;
    var X = celle_sup.map(function (row) { return [row[0], row[3], row[6], row[9]]; });
    var Y = celle_sup.map(function (row) { return [row[1], row[4], row[7], row[10]]; });
    var Z = celle_sup.map(function (row) { return [row[2], row[5], row[8], row[11]]; });
    var N = celle_sup.length;
    var M = induttanze.estremi_celle.length;
    var indici_asso_celle_sup = Array.from({ length: M }, function () { return [0, 0]; });
    for (var cont = 0; cont < N; cont++) {
        var xVals = X[cont];
        var yVals = Y[cont];
        var zVals = Z[cont];
        var cella = [
            Math.min.apply(Math, xVals),
            Math.max.apply(Math, xVals),
            Math.min.apply(Math, yVals),
            Math.max.apply(Math, yVals),
            Math.min.apply(Math, zVals),
            Math.max.apply(Math, zVals)
        ];
        var lato = [];
        for (var i = 0; i < nFacce; i++) {
            var diffSum = 0;
            for (var k = 0; k < 6; k++) {
                diffSum += Math.abs(cella[k] - tutte_le_facce[i][k]);
            }
            if (diffSum / 12 < 1e-8) {
                lato.push(i + 1);
            }
        }
        var primoVal = lato[0];
        var r = -1, c = -1;
        outerFind: for (var rr = 0; rr < associazione.length; rr++) {
            for (var cc = 0; cc < associazione[rr].length; cc++) {
                if (Math.abs(associazione[rr][cc] - primoVal) < 1e-8) {
                    r = rr;
                    c = cc;
                    break outerFind;
                }
            }
        }
        if (r >= 0) {
            if (Math.abs(indici_asso_celle_sup[r][0]) > 1e-8) {
                indici_asso_celle_sup[r][1] = cont + 1;
            }
            else {
                indici_asso_celle_sup[r][0] = cont + 1;
            }
        }
    }
    var Zs_part = new Array(M).fill(0);
    induttanze.Zs_part = Zs_part;
    for (var cont = 0; cont < M; cont++) {
        var sig = Math.abs(induttanze.sigma[cont]) > 1e-8;
        var idxSup1 = indici_asso_celle_sup[cont][0]; // valore 1-based 
        if (sig && idxSup1 > 1e-8) {
            var idx1 = idxSup1 - 1; // ora diventa 0-based 
            var l = induttanze.celle_superficie_l[idx1];
            var w1 = induttanze.celle_superficie_w[idx1];
            var idxSup2 = indici_asso_celle_sup[cont][1]; // anche questo 1-based
            if (idxSup2 > 1e-8) {
                var idx2 = idxSup2 - 1; // converto a 0-based
                var w2 = induttanze.celle_superficie_w[idx2];
                induttanze.Zs_part[cont] = l / (w1 + w2) * Math.sqrt((4 * Math.PI * 1e-7) / induttanze.sigma[cont]);
            }
            else {
                induttanze.Zs_part[cont] = l / w1 * Math.sqrt((4 * Math.PI * 1e-7) / induttanze.sigma[cont]);
            }
        }
    }
    return induttanze;
}
