"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genera_celle_capacitive_new_sup = genera_celle_capacitive_new_sup;
var surfa_old_1 = require("./surfa_old");
var mean_length_P_1 = require("./mean_length_P");
/**
 *
 * @param r_nodi_barra
 * @param weights_five
 * @param roots_five
 * @returns Un oggetto con:
 *   - celle_cap
 *   - Nodi
 *   - Sup_c, l_c, width_c: 4 elementi ciascuno
 */
function genera_celle_capacitive_new_sup(r_nodi_barra, weights_five, roots_five) {
    // r1, r2, r3, r4 => i 4 vertici
    var r1 = r_nodi_barra[0];
    var r2 = r_nodi_barra[1];
    var r3 = r_nodi_barra[2];
    var r4 = r_nodi_barra[3];
    // r5 = 0.5*(r1 + r2)
    var r5 = r1.map(function (val, i) { return 0.5 * (val + r2[i]); });
    // r6 = 0.5*(r3 + r4)
    var r6 = r3.map(function (val, i) { return 0.5 * (val + r4[i]); });
    // r7 = 0.5*(r1 + r3)
    var r7 = r1.map(function (val, i) { return 0.5 * (val + r3[i]); });
    // r8 = 0.5*(r2 + r4)
    var r8 = r2.map(function (val, i) { return 0.5 * (val + r4[i]); });
    // rc = 0.25*(r1 + r2 + r3 + r4)
    var rc = r1.map(function (val, i) { return 0.25 * (val + r2[i] + r3[i] + r4[i]); });
    // Inizializziamo gli array di output
    var celle_cap = Array.from({ length: 4 }, function () { return Array(12).fill(0); });
    var Nodi = Array.from({ length: 4 }, function () { return Array(3).fill(0); });
    var Sup_c = Array(4).fill(0);
    var l_c = Array(4).fill(0);
    var width_c = Array(4).fill(0);
    // ------- Cella capacitiva n°1 -------
    // Indice 0 in TypeScript (anziché r=1 in MATLAB)
    celle_cap[0] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r5, true), r7, true), rc, true); // 4 vertici => 12 numeri
    Nodi[0] = __spreadArray([], r1, true); // r1 (3 numeri)
    Sup_c[0] = (0, surfa_old_1.surfa_old)(celle_cap[0], weights_five, roots_five);
    l_c[0] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[0], 1));
    width_c[0] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[0], 2));
    // ------- Cella capacitiva n°2 -------
    celle_cap[1] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r5, true), r2, true), rc, true), r8, true);
    Nodi[1] = __spreadArray([], r2, true);
    Sup_c[1] = (0, surfa_old_1.surfa_old)(celle_cap[1], weights_five, roots_five);
    l_c[1] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[1], 1));
    width_c[1] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[1], 2));
    // ------- Cella capacitiva n°3 -------
    celle_cap[2] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r7, true), rc, true), r3, true), r6, true);
    Nodi[2] = __spreadArray([], r3, true);
    Sup_c[2] = (0, surfa_old_1.surfa_old)(celle_cap[2], weights_five, roots_five);
    l_c[2] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[2], 1));
    width_c[2] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[2], 2));
    // ------- Cella capacitiva n°4 -------
    celle_cap[3] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], rc, true), r8, true), r6, true), r4, true);
    Nodi[3] = __spreadArray([], r4, true);
    Sup_c[3] = (0, surfa_old_1.surfa_old)(celle_cap[3], weights_five, roots_five);
    l_c[3] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[3], 1));
    width_c[3] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[3], 2));
    // Ritorna i 5 array di output 
    return {
        celle_cap: celle_cap,
        Nodi: Nodi,
        Sup_c: Sup_c,
        l_c: l_c,
        width_c: width_c,
    };
}
