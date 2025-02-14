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
exports.elimina_patches_interni_thermal_save = elimina_patches_interni_thermal_save;
var verifica_patches_coincidenti_1 = require("./verifica_patches_coincidenti");
/**
 *
 * @param nodi_centri
 * @param nodi_centri_non_rid
 * @param nodi_estremi_celle
 * @param nodi_epsr
 * @param nodi_mur
 * @param nodi_sigma
 * @param nodi_nodi_i
 * @param nodi_w
 * @param nodi_l  [
 * @param nodi_S_non_rid
 * @param nodi_num_nodi_interni numero interi di nodi interni
 * @param nodi_normale
 * @param Vettaux matrice di input che contiene info su da_scartare, interfacce, ecc.
 *
 * @returns EliminaPatchesInterniOutput con i campi "nodi_new_centri", "nodi_new_estremi_celle", ...
 */
function elimina_patches_interni_thermal_save(nodi_centri, nodi_centri_non_rid, nodi_estremi_celle, nodi_epsr, nodi_mur, nodi_sigma, nodi_nodi_i, nodi_w, nodi_l, nodi_S_non_rid, nodi_num_nodi_interni, nodi_normale, Vettaux, materials) {
    var ncelle_cap = nodi_estremi_celle.length;
    var ncelle_cap_non_rid = ncelle_cap;
    // Inizializza le variabili come array vuoti
    var da_scartare_sup_term = [];
    var interfacce_cond_diel_mag = [];
    var da_scartare = []; // Suppongo che da_scartare sia 1D in base al codice MATLAB
    // Gestisci il caso in cui Vettaux non è vuoto
    if (Vettaux.length > 0) {
        var row0 = Vettaux[0];
        var lenV = row0.length;
        da_scartare_sup_term = row0.slice(0, lenV - 1);
        var subRows = Vettaux.slice(0, Vettaux.length - 1);
        interfacce_cond_diel_mag = subRows;
        da_scartare = [];
        for (var r = 0; r < Vettaux.length; r++) {
            for (var c = 0; c < Vettaux[r].length - 1; c++) {
                da_scartare.push(Vettaux[r][c]);
            }
        }
    }
    if (nodi_num_nodi_interni === 0) {
        nodi_nodi_i = nodi_nodi_i.slice(0, nodi_nodi_i.length - 1);
    }
    for (var k = 0; k < ncelle_cap; k++) {
        var n_nodi_coinc = [];
        for (var i = 0; i < nodi_centri_non_rid.length; i++) {
            var dx = Math.abs(nodi_centri_non_rid[i][0] - nodi_centri[k][0]);
            var dy = Math.abs(nodi_centri_non_rid[i][1] - nodi_centri[k][1]);
            var dz = Math.abs(nodi_centri_non_rid[i][2] - nodi_centri[k][2]);
            if (dx <= 1e-12 && dy <= 1e-12 && dz <= 1e-12) {
                n_nodi_coinc.push(i + 1);
            }
        }
        if (n_nodi_coinc.length > 0) {
            var lN = n_nodi_coinc.length;
            for (var cont1 = 0; cont1 < lN; cont1++) {
                var n = n_nodi_coinc[cont1];
                var aux = setdiff(n_nodi_coinc.slice().sort(function (a, b) { return a - b; }), [n]);
                var lM = aux.length;
                for (var cont2 = 0; cont2 < lM; cont2++) {
                    var m = aux[cont2];
                    var rowM = nodi_estremi_celle[m - 1];
                    var rowN = nodi_estremi_celle[n - 1];
                    var twoPatches = [rowM, rowN];
                    if ((0, verifica_patches_coincidenti_1.verifica_patches_coincidenti)(twoPatches)) {
                        // Controlla se da_scartare_sup_term non è vuoto prima di usarlo
                        if (da_scartare_sup_term.length > 0 && !da_scartare_sup_term.includes(m)) {
                            da_scartare_sup_term.push(m);
                        }
                        if (da_scartare_sup_term.length > 0 && !da_scartare_sup_term.includes(n)) {
                            da_scartare_sup_term.push(n);
                        }
                        if (nodi_epsr[m - 1] === nodi_epsr[n - 1] && nodi_mur[m - 1] === nodi_mur[n - 1]) {
                            // Controlla se da_scartare non è vuoto prima di usarlo
                            if (da_scartare.length > 0) {
                                da_scartare = unionOfArrays(da_scartare, setdiff([m, n].sort(function (a, b) { return a - b; }), da_scartare));
                            }
                            else {
                                da_scartare = setdiff([m, n].sort(function (a, b) { return a - b; }), da_scartare);
                            }
                        }
                        else {
                            if (interfacce_cond_diel_mag.length === 0) {
                                interfacce_cond_diel_mag.push([m, n]);
                            }
                            else {
                                var app1 = setdiff3([m, n], interfacce_cond_diel_mag);
                                var app2 = setdiff3([n, m], interfacce_cond_diel_mag);
                                if (app1 === 1 && app2 === 1) {
                                    interfacce_cond_diel_mag.push([m, n]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // Controlla se interfacce_cond_diel_mag non è vuoto prima di usarlo
    if (interfacce_cond_diel_mag.length > 0) {
        var col1 = interfacce_cond_diel_mag.map(function (r) { return r[0]; });
        da_scartare = unionOfArrays(da_scartare, col1);
    }
    //Il resto della funzione rimane invariato, perché usa solo da_conservare, che è calcolato
    //a partire da da_scartare, e da_scartare, a sua volta, è inizializzato come array vuoto,
    //proprio come in MATLAB quando Vettaux = 1.
    var allIndices = [];
    for (var i = 1; i <= ncelle_cap_non_rid; i++) {
        allIndices.push(i);
    }
    var da_conservare = setdiff(allIndices, da_scartare);
    var nodi_new_centri = [];
    for (var _i = 0, da_conservare_1 = da_conservare; _i < da_conservare_1.length; _i++) {
        var i = da_conservare_1[_i];
        nodi_new_centri.push(nodi_centri_non_rid[i - 1]);
    }
    for (var _a = 0, nodi_nodi_i_1 = nodi_nodi_i; _a < nodi_nodi_i_1.length; _a++) {
        var row = nodi_nodi_i_1[_a];
        nodi_new_centri.push(row);
    }
    var nodi_new_centri_non_rid = [];
    for (var _b = 0, da_conservare_2 = da_conservare; _b < da_conservare_2.length; _b++) {
        var i = da_conservare_2[_b];
        nodi_new_centri_non_rid.push(nodi_centri_non_rid[i - 1]);
    }
    for (var _c = 0, nodi_nodi_i_2 = nodi_nodi_i; _c < nodi_nodi_i_2.length; _c++) {
        var row = nodi_nodi_i_2[_c];
        nodi_new_centri_non_rid.push(row);
    }
    var nodi_new_estremi_celle = [];
    for (var _d = 0, da_conservare_3 = da_conservare; _d < da_conservare_3.length; _d++) {
        var i = da_conservare_3[_d];
        nodi_new_estremi_celle.push(nodi_estremi_celle[i - 1]);
    }
    var nodi_new_w = [];
    var nodi_new_l = [];
    var nodi_new_normale = [];
    var nodi_new_S_non_rid = [];
    var nodi_new_sigma = [];
    var nodi_new_mur = [];
    var nodi_new_epsr = [];
    var nodi_new_materials = [];
    for (var _e = 0, da_conservare_4 = da_conservare; _e < da_conservare_4.length; _e++) {
        var i = da_conservare_4[_e];
        nodi_new_w.push(nodi_w[i - 1]);
        nodi_new_l.push(nodi_l[i - 1]);
        nodi_new_S_non_rid.push(nodi_S_non_rid[i - 1]);
        nodi_new_sigma.push(nodi_sigma[i - 1]);
        nodi_new_mur.push(nodi_mur[i - 1]);
        nodi_new_epsr.push(nodi_epsr[i - 1]);
        nodi_new_normale.push(nodi_normale[i - 1]);
        nodi_new_materials.push(materials[i - 1]);
    }
    var nodi_new_nodi_interni_coordinate = nodi_nodi_i;
    var nodi_new_num_nodi_interni = nodi_num_nodi_interni;
    var nodi_new_nodi_esterni = [];
    for (var i = 1; i <= da_conservare.length; i++) {
        nodi_new_nodi_esterni.push(i);
    }
    return {
        nodi_new_centri: nodi_new_centri,
        nodi_new_centri_non_rid: nodi_new_centri_non_rid,
        nodi_new_estremi_celle: nodi_new_estremi_celle,
        nodi_new_w: nodi_new_w,
        nodi_new_l: nodi_new_l,
        nodi_new_S_non_rid: nodi_new_S_non_rid,
        nodi_new_epsr: nodi_new_epsr,
        nodi_new_sigma: nodi_new_sigma,
        nodi_new_mur: nodi_new_mur,
        nodi_new_nodi_interni_coordinate: nodi_new_nodi_interni_coordinate,
        nodi_new_num_nodi_interni: nodi_new_num_nodi_interni,
        nodi_new_nodi_esterni: nodi_new_nodi_esterni,
        nodi_new_normale: nodi_new_normale,
        nodi_new_materials: nodi_new_materials,
    };
}
function setdiff3(m, n) {
    var app = 1;
    var _loop_1 = function (i) {
        if (m.length === n[i].length && m.every(function (val, idx) { return val === n[i][idx]; })) {
            app = 0;
            return "break";
        }
    };
    for (var i = 0; i < n.length; i++) {
        var state_1 = _loop_1(i);
        if (state_1 === "break")
            break;
    }
    return app;
}
function setdiff(a, b) {
    var out = a.filter(function (x) { return !b.includes(x); });
    return uniqueNumberArray(out).sort(function (x, y) { return x - y; });
}
function unionOfArrays(a, b) {
    var merged = __spreadArray(__spreadArray([], a, true), b, true);
    return uniqueNumberArray(merged).sort(function (x, y) { return x - y; });
}
function uniqueNumberArray(arr) {
    var set_ = new Set(arr);
    return Array.from(set_);
}
