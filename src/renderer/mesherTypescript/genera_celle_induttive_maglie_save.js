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
exports.genera_celle_induttive_maglie_save = genera_celle_induttive_maglie_save;
var surfa_old_1 = require("./surfa_old");
var mean_length_save_1 = require("./mean_length_save");
var mean_length_Lp_1 = require("./mean_length_Lp");
var mean_cross_section_Lp_1 = require("./mean_cross_section_Lp");
var norm_1 = require("./norm");
var cross_1 = require("./cross");
function genera_celle_induttive_maglie_save(rp, // [Npuntix][Npuntiy][Npuntiz][3]
Npuntix, Npuntiy, Npuntiz, weights_five, roots_five) {
    // 1) Calcolo del numero di celle
    var n_celle_ind = Npuntiz * Npuntiy * (Npuntix - 1) +
        Npuntiz * (Npuntiy - 1) * Npuntix +
        (Npuntiz - 1) * Npuntiy * Npuntix;
    // 2) Allocazione array principali
    var celle_ind = Array.from({ length: n_celle_ind }, function () { return Array(24).fill(0); });
    // lati: [2][n_celle_ind][3]
    var lati = [
        Array.from({ length: n_celle_ind }, function () { return Array(3).fill(0); }),
        Array.from({ length: n_celle_ind }, function () { return Array(3).fill(0); })
    ];
    var dir_curr = Array(n_celle_ind).fill(0);
    var vers = Array.from({ length: n_celle_ind }, function () { return Array(3).fill(0); });
    var l = Array(n_celle_ind).fill(0);
    var spessore = Array(n_celle_ind).fill(0);
    var Sup = Array(n_celle_ind).fill(0);
    var width = Array(n_celle_ind).fill(0);
    // dx, dy, dz
    var dx = Array(n_celle_ind).fill(0);
    var dy = Array(n_celle_ind).fill(0);
    var dz = Array(n_celle_ind).fill(0);
    // 3) Celle_ind_sup, rc_sup, sup_sup, normale_sup, dir_curr_sup, w_sup
    var celle_ind_sup = Array.from({ length: 6 * n_celle_ind }, function () { return Array(12).fill(0); });
    var rc_sup = Array.from({ length: 6 * n_celle_ind }, function () { return Array(3).fill(0); });
    var Sup_sup = Array(6 * n_celle_ind).fill(0);
    var normale_sup = Array.from({ length: 6 * n_celle_ind }, function () { return Array(3).fill(0); });
    var dir_curr_sup = Array(6 * n_celle_ind).fill(0);
    var w_sup = Array(6 * n_celle_ind).fill(0);
    // indici superfici x, y, z
    var indici_celle_ind_supx = Array(6 * Npuntiz * Npuntiy * (Npuntix - 1)).fill(0);
    var indici_celle_ind_supy = Array(6 * Npuntiz * (Npuntiy - 1) * Npuntix).fill(0);
    var indici_celle_ind_supz = Array(6 * (Npuntiz - 1) * Npuntiy * Npuntix).fill(0);
    // contatori
    var p = 0; // indice cella volumetrica
    var ps = 0; // indice superficie
    var s = 0; // per lati
    // =============== DIREZIONE X ===============
    var psx = 0; // contatore superfici x
    var _loop_1 = function (o) {
        var _loop_4 = function (n) {
            var _loop_5 = function (m) {
                var r1 = void 0, r2 = void 0, r3 = void 0, r4 = void 0;
                var r5 = void 0, r6 = void 0, r7 = void 0, r8 = void 0;
                // --- if/else per r1, r2 (esempio) ---
                if (o === 0) {
                    if (n === 0) {
                        r1 = rp[m][n][o];
                        r2 = rp[m + 1][n][o];
                    }
                    else {
                        r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o][i]); });
                        r2 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n - 1][o][i]); });
                    }
                }
                else {
                    if (n === 0) {
                        r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o - 1][i]); });
                        r2 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o - 1][i]); });
                    }
                    else {
                        r1 = rp[m][n][o].map(function (val, i) {
                            return 0.25 * (val + rp[m][n - 1][o][i] + rp[m][n][o - 1][i] + rp[m][n - 1][o - 1][i]);
                        });
                        r2 = rp[m + 1][n][o].map(function (val, i) {
                            return 0.25 * (val + rp[m + 1][n - 1][o][i] + rp[m + 1][n][o - 1][i] + rp[m + 1][n - 1][o - 1][i]);
                        });
                    }
                }
                if (o === 0) {
                    if (n === Npuntiy - 1) {
                        r3 = rp[m][n][o];
                        r4 = rp[m + 1][n][o];
                    }
                    else {
                        r3 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o][i]); });
                        r4 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n + 1][o][i]); });
                    }
                }
                else {
                    if (n === Npuntiy - 1) {
                        r3 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o - 1][i]); });
                        r4 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o - 1][i]); });
                    }
                    else {
                        r3 = rp[m][n][o].map(function (val, i) {
                            return 0.25 *
                                (val + rp[m][n + 1][o][i] + rp[m][n][o - 1][i] + rp[m][n + 1][o - 1][i]);
                        });
                        r4 = rp[m + 1][n][o].map(function (val, i) {
                            return 0.25 *
                                (val +
                                    rp[m + 1][n + 1][o][i] +
                                    rp[m + 1][n][o - 1][i] +
                                    rp[m + 1][n + 1][o - 1][i]);
                        });
                    }
                }
                if (o === Npuntiz - 1) {
                    if (n === 0) {
                        r5 = rp[m][n][o];
                        r6 = rp[m + 1][n][o];
                    }
                    else {
                        r5 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o][i]); });
                        r6 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n - 1][o][i]); });
                    }
                }
                else {
                    if (n === 0) {
                        r5 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o + 1][i]); });
                        r6 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o + 1][i]); });
                    }
                    else {
                        r5 = rp[m][n][o].map(function (val, i) {
                            return 0.25 *
                                (val + rp[m][n - 1][o][i] + rp[m][n][o + 1][i] + rp[m][n - 1][o + 1][i]);
                        });
                        r6 = rp[m + 1][n][o].map(function (val, i) {
                            return 0.25 *
                                (val +
                                    rp[m + 1][n - 1][o][i] +
                                    rp[m + 1][n][o + 1][i] +
                                    rp[m + 1][n - 1][o + 1][i]);
                        });
                    }
                }
                if (o === Npuntiz - 1) {
                    if (n === Npuntiy - 1) {
                        r7 = rp[m][n][o];
                        r8 = rp[m + 1][n][o];
                    }
                    else {
                        r7 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o][i]); });
                        r8 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n + 1][o][i]); });
                    }
                }
                else {
                    if (n === Npuntiy - 1) {
                        r7 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o + 1][i]); });
                        r8 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o + 1][i]); });
                    }
                    else {
                        r7 = rp[m][n][o].map(function (val, i) {
                            return 0.25 *
                                (val + rp[m][n + 1][o][i] + rp[m][n][o + 1][i] + rp[m][n + 1][o + 1][i]);
                        });
                        r8 = rp[m + 1][n][o].map(function (val, i) {
                            return 0.25 *
                                (val +
                                    rp[m + 1][n + 1][o][i] +
                                    rp[m + 1][n][o + 1][i] +
                                    rp[m + 1][n + 1][o + 1][i]);
                        });
                    }
                }
                // e così via per r3, r4, r5, r6, r7, r8
                // assegnamento
                celle_ind[p] = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true), r5, true), r6, true), r7, true), r8, true);
                l[p] = Math.abs((0, mean_length_save_1.mean_length_save)(celle_ind[p], 1));
                spessore[p] = Math.abs((0, mean_length_save_1.mean_length_save)(celle_ind[p], 3));
                Sup[p] = Math.abs((0, mean_cross_section_Lp_1.mean_cross_section_Lp)(celle_ind[p], 1));
                width[p] = Math.abs((0, mean_length_Lp_1.mean_length_Lp)(celle_ind[p], 2));
                dx[p] = (0, norm_1.norm)([r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]]);
                dy[p] = (0, norm_1.norm)([r3[0] - r1[0], r3[1] - r1[1], r3[2] - r1[2]]);
                dz[p] = (0, norm_1.norm)([r5[0] - r1[0], r5[1] - r1[1], r5[2] - r1[2]]);
                // override
                l[p] = dx[p];
                Sup[p] = dy[p] * dz[p];
                p++;
                // lati
                lati[0][s] = __spreadArray([], rp[m][n][o], true);
                lati[1][s] = __spreadArray([], rp[m + 1][n][o], true);
                var lato_vett = [
                    lati[1][s][0] - lati[0][s][0],
                    lati[1][s][1] - lati[0][s][1],
                    lati[1][s][2] - lati[0][s][2],
                ];
                dir_curr[s] = 1;
                var len = (0, norm_1.norm)(lato_vett);
                vers[s] = lato_vett.map(function (v) { return v / len; });
                s++;
                // superfici, ps
                // faccia 1,2 (piano xy)
                celle_ind_sup[ps] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
                celle_ind_sup[ps + 1] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r5, true), r6, true), r7, true), r8, true);
                dir_curr_sup[ps] = 1;
                dir_curr_sup[ps + 1] = 1;
                rc_sup[ps] = [
                    0.25 * (r1[0] + r2[0] + r3[0] + r4[0]),
                    0.25 * (r1[1] + r2[1] + r3[1] + r4[1]),
                    0.25 * (r1[2] + r2[2] + r3[2] + r4[2]),
                ];
                rc_sup[ps + 1] = [
                    0.25 * (r5[0] + r6[0] + r7[0] + r8[0]),
                    0.25 * (r5[1] + r6[1] + r7[1] + r8[1]),
                    0.25 * (r5[2] + r6[2] + r7[2] + r8[2]),
                ];
                indici_celle_ind_supx[psx] = ps;
                indici_celle_ind_supx[psx + 1] = ps + 1;
                Sup_sup[ps] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps], weights_five, roots_five));
                Sup_sup[ps + 1] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps + 1], weights_five, roots_five));
                {
                    var v21 = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
                    var v31 = [r3[0] - r1[0], r3[1] - r1[1], r3[2] - r1[2]];
                    var tmp = (0, cross_1.cross)(v21, v31).map(function (val) { return -val; });
                    var den_1 = (0, norm_1.norm)(v21) * (0, norm_1.norm)(v31);
                    normale_sup[ps] = tmp.map(function (val) { return val / den_1; });
                }
                {
                    var v65 = [r6[0] - r5[0], r6[1] - r5[1], r6[2] - r5[2]];
                    var v75 = [r7[0] - r5[0], r7[1] - r5[1], r7[2] - r5[2]];
                    var tmp = (0, cross_1.cross)(v65, v75);
                    var den_2 = (0, norm_1.norm)(v65) * (0, norm_1.norm)(v75);
                    normale_sup[ps + 1] = tmp.map(function (val) { return val / den_2; });
                }
                w_sup[ps] = (0, norm_1.norm)([r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]]);
                w_sup[ps + 1] = (0, norm_1.norm)([r5[0] - r6[0], r5[1] - r6[1], r5[2] - r6[2]]);
                // superfici xz
                celle_ind_sup[ps + 2] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r5, true), r6, true);
                celle_ind_sup[ps + 3] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r3, true), r4, true), r7, true), r8, true);
                dir_curr_sup[ps + 2] = 1;
                dir_curr_sup[ps + 3] = 1;
                rc_sup[ps + 2] = [
                    0.25 * (r1[0] + r2[0] + r5[0] + r6[0]),
                    0.25 * (r1[1] + r2[1] + r5[1] + r6[1]),
                    0.25 * (r1[2] + r2[2] + r5[2] + r6[2]),
                ];
                rc_sup[ps + 3] = [
                    0.25 * (r3[0] + r4[0] + r7[0] + r8[0]),
                    0.25 * (r3[1] + r4[1] + r7[1] + r8[1]),
                    0.25 * (r3[2] + r4[2] + r7[2] + r8[2]),
                ];
                indici_celle_ind_supx[psx + 2] = ps + 2;
                indici_celle_ind_supx[psx + 3] = ps + 3;
                Sup_sup[ps + 2] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps + 2], weights_five, roots_five));
                Sup_sup[ps + 3] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps + 3], weights_five, roots_five));
                {
                    var v21 = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
                    var v51 = [r5[0] - r1[0], r5[1] - r1[1], r5[2] - r1[2]];
                    var tmp = (0, cross_1.cross)(v21, v51);
                    var den_3 = (0, norm_1.norm)(v21) * (0, norm_1.norm)(v51);
                    normale_sup[ps + 2] = tmp.map(function (val) { return val / den_3; });
                }
                {
                    var v43 = [r4[0] - r3[0], r4[1] - r3[1], r4[2] - r3[2]];
                    var v73 = [r7[0] - r3[0], r7[1] - r3[1], r7[2] - r3[2]];
                    var tmp = (0, cross_1.cross)(v43, v73).map(function (val) { return -val; });
                    var den_4 = (0, norm_1.norm)(v43) * (0, norm_1.norm)(v73);
                    normale_sup[ps + 3] = tmp.map(function (val) { return val / den_4; });
                }
                w_sup[ps + 2] = (0, norm_1.norm)([r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]]);
                w_sup[ps + 3] = (0, norm_1.norm)([r5[0] - r6[0], r5[1] - r6[1], r5[2] - r6[2]]);
                // superfici yz
                celle_ind_sup[ps + 4] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r3, true), r5, true), r7, true);
                celle_ind_sup[ps + 5] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r2, true), r4, true), r6, true), r8, true);
                dir_curr_sup[ps + 4] = 1;
                dir_curr_sup[ps + 5] = 1;
                rc_sup[ps + 4] = [
                    0.25 * (r1[0] + r3[0] + r5[0] + r7[0]),
                    0.25 * (r1[1] + r3[1] + r5[1] + r7[1]),
                    0.25 * (r1[2] + r3[2] + r5[2] + r7[2]),
                ];
                rc_sup[ps + 5] = [
                    0.25 * (r2[0] + r4[0] + r6[0] + r8[0]),
                    0.25 * (r2[1] + r4[1] + r6[1] + r8[1]),
                    0.25 * (r2[2] + r4[2] + r6[2] + r8[2]),
                ];
                indici_celle_ind_supx[psx + 4] = ps + 4;
                indici_celle_ind_supx[psx + 5] = ps + 5;
                Sup_sup[ps + 4] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps + 4], weights_five, roots_five));
                Sup_sup[ps + 5] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps + 5], weights_five, roots_five));
                {
                    var v31 = [r3[0] - r1[0], r3[1] - r1[1], r3[2] - r1[2]];
                    var v51 = [r5[0] - r1[0], r5[1] - r1[1], r5[2] - r1[2]];
                    var tmp = (0, cross_1.cross)(v31, v51).map(function (val) { return -val; });
                    var den_5 = (0, norm_1.norm)(v31) * (0, norm_1.norm)(v51);
                    normale_sup[ps + 4] = tmp.map(function (val) { return val / den_5; });
                }
                {
                    var v42 = [r4[0] - r2[0], r4[1] - r2[1], r4[2] - r2[2]];
                    var v62 = [r6[0] - r2[0], r6[1] - r2[1], r6[2] - r2[2]];
                    var tmp = (0, cross_1.cross)(v42, v62);
                    var den_6 = (0, norm_1.norm)(v42) * (0, norm_1.norm)(v62);
                    normale_sup[ps + 5] = tmp.map(function (val) { return val / den_6; });
                }
                w_sup[ps + 4] = 0;
                w_sup[ps + 5] = 0;
                ps += 6;
                psx += 6;
            };
            for (var m = 0; m < Npuntix - 1; m++) {
                _loop_5(m);
            }
        };
        for (var n = 0; n < Npuntiy; n++) {
            _loop_4(n);
        }
    };
    for (var o = 0; o < Npuntiz; o++) {
        _loop_1(o);
    }
    // ============= DIREZIONE Y =============
    var psy = 0; // indice superfici per direzione Y
    var _loop_2 = function (o) {
        var _loop_6 = function (m) {
            var _loop_7 = function (n) {
                var r1 = void 0, r2 = void 0, r3 = void 0, r4 = void 0;
                var r5 = void 0, r6 = void 0, r7 = void 0, r8 = void 0;
                // Calcolo r1, r3 (come in MATLAB):
                if (o === 0) {
                    if (m === 0) {
                        // r1=squeeze(rp(m,n,o,:)), r3=squeeze(rp(m,n+1,o,:))
                        r1 = rp[m][n][o];
                        r3 = rp[m][n + 1][o];
                    }
                    else {
                        // r1=0.5*(rp(m,n,o,:)+rp(m-1,n,o,:)), etc.
                        r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o][i]); });
                        r3 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n + 1][o][i]); });
                    }
                }
                else {
                    if (m === 0) {
                        r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o - 1][i]); });
                        r3 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o - 1][i]); });
                    }
                    else {
                        r1 = rp[m][n][o].map(function (val, i) {
                            return 0.25 * (val + rp[m - 1][n][o][i] + rp[m][n][o - 1][i] + rp[m - 1][n][o - 1][i]);
                        });
                        r3 = rp[m][n + 1][o].map(function (val, i) {
                            return 0.25 * (val + rp[m - 1][n + 1][o][i] + rp[m][n + 1][o - 1][i] + rp[m - 1][n + 1][o - 1][i]);
                        });
                    }
                }
                // Calcolo r2, r4:
                if (o === 0) {
                    if (m === Npuntix - 1) {
                        r2 = rp[m][n][o];
                        r4 = rp[m][n + 1][o];
                    }
                    else {
                        r2 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o][i]); });
                        r4 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n + 1][o][i]); });
                    }
                }
                else {
                    if (m === Npuntix - 1) {
                        r2 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o - 1][i]); });
                        r4 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o - 1][i]); });
                    }
                    else {
                        r2 = rp[m][n][o].map(function (val, i) {
                            return 0.25 * (val + rp[m + 1][n][o][i] + rp[m][n][o - 1][i] + rp[m + 1][n][o - 1][i]);
                        });
                        r4 = rp[m][n + 1][o].map(function (val, i) {
                            return 0.25 * (val + rp[m + 1][n + 1][o][i] + rp[m][n + 1][o - 1][i] + rp[m + 1][n + 1][o - 1][i]);
                        });
                    }
                }
                // Calcolo r5, r7:
                if (o === Npuntiz - 1) {
                    if (m === 0) {
                        r5 = rp[m][n][o];
                        r7 = rp[m][n + 1][o];
                    }
                    else {
                        r5 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o][i]); });
                        r7 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n + 1][o][i]); });
                    }
                }
                else {
                    if (m === 0) {
                        r5 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o + 1][i]); });
                        r7 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o + 1][i]); });
                    }
                    else {
                        r5 = rp[m][n][o].map(function (val, i) {
                            return 0.25 * (val + rp[m - 1][n][o][i] + rp[m][n][o + 1][i] + rp[m - 1][n][o + 1][i]);
                        });
                        r7 = rp[m][n + 1][o].map(function (val, i) {
                            return 0.25 * (val + rp[m - 1][n + 1][o][i] + rp[m][n + 1][o + 1][i] + rp[m - 1][n + 1][o + 1][i]);
                        });
                    }
                }
                // Calcolo r6, r8:
                if (o === Npuntiz - 1) {
                    if (m === Npuntix - 1) {
                        r6 = rp[m][n][o];
                        r8 = rp[m][n + 1][o];
                    }
                    else {
                        r6 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o][i]); });
                        r8 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n + 1][o][i]); });
                    }
                }
                else {
                    if (m === Npuntix - 1) {
                        r6 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o + 1][i]); });
                        r8 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o + 1][i]); });
                    }
                    else {
                        r6 = rp[m][n][o].map(function (val, i) {
                            return 0.25 * (val + rp[m + 1][n][o][i] + rp[m][n][o + 1][i] + rp[m + 1][n][o + 1][i]);
                        });
                        r8 = rp[m][n + 1][o].map(function (val, i) {
                            return 0.25 * (val + rp[m + 1][n + 1][o][i] + rp[m][n + 1][o + 1][i] + rp[m + 1][n + 1][o + 1][i]);
                        });
                    }
                }
                // Assegnamento a celle_ind, calcoli l, spessore...
                celle_ind[p] = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true), r5, true), r6, true), r7, true), r8, true);
                // mean_length_save(...) su direzione 2
                l[p] = Math.abs((0, mean_length_save_1.mean_length_save)(celle_ind[p], 2));
                spessore[p] = Math.abs((0, mean_length_save_1.mean_length_save)(celle_ind[p], 3));
                Sup[p] = Math.abs((0, mean_cross_section_Lp_1.mean_cross_section_Lp)(celle_ind[p], 2));
                width[p] = Math.abs((0, mean_length_Lp_1.mean_length_Lp)(celle_ind[p], 1));
                // dx, dy, dz
                var dx_val = (0, norm_1.norm)([r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]]);
                var dy_val = (0, norm_1.norm)([r3[0] - r1[0], r3[1] - r1[1], r3[2] - r1[2]]);
                var dz_val = (0, norm_1.norm)([r5[0] - r1[0], r5[1] - r1[1], r5[2] - r1[2]]);
                dx[p] = dx_val;
                dy[p] = dy_val;
                dz[p] = dz_val;
                // override come in MATLAB: l = dy, Sup= dx*dz
                l[p] = dy_val;
                Sup[p] = dx_val * dz_val;
                p++;
                // Lati(1,s,:), Lati(2,s,:)
                lati[0][s] = __spreadArray([], rp[m][n][o], true);
                lati[1][s] = __spreadArray([], rp[m][n + 1][o], true);
                var lato_vett = [
                    lati[1][s][0] - lati[0][s][0],
                    lati[1][s][1] - lati[0][s][1],
                    lati[1][s][2] - lati[0][s][2],
                ];
                dir_curr[s] = 2; // direzione Y
                var len = (0, norm_1.norm)(lato_vett);
                vers[s] = lato_vett.map(function (val) { return val / len; });
                s++;
                // 6 superfici per cella
                // 1) piano xy
                celle_ind_sup[ps] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
                celle_ind_sup[ps + 1] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r5, true), r6, true), r7, true), r8, true);
                dir_curr_sup[ps] = 2;
                dir_curr_sup[ps + 1] = 2;
                rc_sup[ps] = [
                    0.25 * (r1[0] + r2[0] + r3[0] + r4[0]),
                    0.25 * (r1[1] + r2[1] + r3[1] + r4[1]),
                    0.25 * (r1[2] + r2[2] + r3[2] + r4[2]),
                ];
                rc_sup[ps + 1] = [
                    0.25 * (r5[0] + r6[0] + r7[0] + r8[0]),
                    0.25 * (r5[1] + r6[1] + r7[1] + r8[1]),
                    0.25 * (r5[2] + r6[2] + r7[2] + r8[2]),
                ];
                indici_celle_ind_supy[psy] = ps;
                indici_celle_ind_supy[psy + 1] = ps + 1;
                Sup_sup[ps] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps], weights_five, roots_five));
                Sup_sup[ps + 1] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps + 1], weights_five, roots_five));
                {
                    var v21 = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
                    var v31 = [r3[0] - r1[0], r3[1] - r1[1], r3[2] - r1[2]];
                    var tmp = (0, cross_1.cross)(v21, v31).map(function (val) { return -val; });
                    var den_7 = (0, norm_1.norm)(v21) * (0, norm_1.norm)(v31);
                    normale_sup[ps] = tmp.map(function (val) { return val / den_7; });
                }
                {
                    var v65 = [r6[0] - r5[0], r6[1] - r5[1], r6[2] - r5[2]];
                    var v75 = [r7[0] - r5[0], r7[1] - r5[1], r7[2] - r5[2]];
                    var tmp = (0, cross_1.cross)(v65, v75);
                    var den_8 = (0, norm_1.norm)(v65) * (0, norm_1.norm)(v75);
                    normale_sup[ps + 1] = tmp.map(function (val) { return val / den_8; });
                }
                w_sup[ps] = (0, norm_1.norm)([r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]]);
                w_sup[ps + 1] = (0, norm_1.norm)([r6[0] - r5[0], r6[1] - r5[1], r6[2] - r5[2]]);
                // 2) piano xz
                celle_ind_sup[ps + 2] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r5, true), r6, true);
                celle_ind_sup[ps + 3] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r3, true), r4, true), r7, true), r8, true);
                dir_curr_sup[ps + 2] = 2;
                dir_curr_sup[ps + 3] = 2;
                rc_sup[ps + 2] = [
                    0.25 * (r1[0] + r2[0] + r5[0] + r6[0]),
                    0.25 * (r1[1] + r2[1] + r5[1] + r6[1]),
                    0.25 * (r1[2] + r2[2] + r5[2] + r6[2]),
                ];
                rc_sup[ps + 3] = [
                    0.25 * (r3[0] + r4[0] + r7[0] + r8[0]),
                    0.25 * (r3[1] + r4[1] + r7[1] + r8[1]),
                    0.25 * (r3[2] + r4[2] + r7[2] + r8[2]),
                ];
                indici_celle_ind_supy[psy + 2] = ps + 2;
                indici_celle_ind_supy[psy + 3] = ps + 3;
                Sup_sup[ps + 2] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps + 2], weights_five, roots_five));
                Sup_sup[ps + 3] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps + 3], weights_five, roots_five));
                {
                    var v21 = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
                    var v51 = [r5[0] - r1[0], r5[1] - r1[1], r5[2] - r1[2]];
                    var tmp = (0, cross_1.cross)(v21, v51);
                    var den_9 = (0, norm_1.norm)(v21) * (0, norm_1.norm)(v51);
                    normale_sup[ps + 2] = tmp.map(function (val) { return val / den_9; });
                }
                {
                    var v43 = [r4[0] - r3[0], r4[1] - r3[1], r4[2] - r3[2]];
                    var v73 = [r7[0] - r3[0], r7[1] - r3[1], r7[2] - r3[2]];
                    var tmp = (0, cross_1.cross)(v43, v73).map(function (val) { return -val; });
                    var den_10 = (0, norm_1.norm)(v43) * (0, norm_1.norm)(v73);
                    normale_sup[ps + 3] = tmp.map(function (val) { return val / den_10; });
                }
                w_sup[ps + 2] = 0; // come nel tuo codice
                w_sup[ps + 3] = 0;
                // 3) piano yz
                celle_ind_sup[ps + 4] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r3, true), r5, true), r7, true);
                celle_ind_sup[ps + 5] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r2, true), r4, true), r6, true), r8, true);
                dir_curr_sup[ps + 4] = 2;
                dir_curr_sup[ps + 5] = 2;
                rc_sup[ps + 4] = [
                    0.25 * (r1[0] + r3[0] + r5[0] + r7[0]),
                    0.25 * (r1[1] + r3[1] + r5[1] + r7[1]),
                    0.25 * (r1[2] + r3[2] + r5[2] + r7[2]),
                ];
                rc_sup[ps + 5] = [
                    0.25 * (r2[0] + r4[0] + r6[0] + r8[0]),
                    0.25 * (r2[1] + r4[1] + r6[1] + r8[1]),
                    0.25 * (r2[2] + r4[2] + r6[2] + r8[2]),
                ];
                indici_celle_ind_supy[psy + 4] = ps + 4;
                indici_celle_ind_supy[psy + 5] = ps + 5;
                Sup_sup[ps + 4] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps + 4], weights_five, roots_five));
                Sup_sup[ps + 5] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps + 5], weights_five, roots_five));
                {
                    var v31 = [r3[0] - r1[0], r3[1] - r1[1], r3[2] - r1[2]];
                    var v51 = [r5[0] - r1[0], r5[1] - r1[1], r5[2] - r1[2]];
                    var tmp = (0, cross_1.cross)(v31, v51).map(function (val) { return -val; });
                    var den_11 = (0, norm_1.norm)(v31) * (0, norm_1.norm)(v51);
                    normale_sup[ps + 4] = tmp.map(function (val) { return val / den_11; });
                }
                {
                    var v42 = [r4[0] - r2[0], r4[1] - r2[1], r4[2] - r2[2]];
                    var v62 = [r6[0] - r2[0], r6[1] - r2[1], r6[2] - r2[2]];
                    var tmp = (0, cross_1.cross)(v42, v62);
                    var den_12 = (0, norm_1.norm)(v42) * (0, norm_1.norm)(v62);
                    normale_sup[ps + 5] = tmp.map(function (val) { return val / den_12; });
                }
                w_sup[ps + 4] = (0, norm_1.norm)([r3[0] - r1[0], r3[1] - r1[1], r3[2] - r1[2]]);
                w_sup[ps + 5] = (0, norm_1.norm)([r2[0] - r4[0], r2[1] - r4[1], r2[2] - r4[2]]);
                ps += 6;
                psy += 6;
            };
            for (var n = 0; n < Npuntiy - 1; n++) {
                _loop_7(n);
            } // fine for n
        };
        for (var m = 0; m < Npuntix; m++) {
            _loop_6(m);
        } // fine for m
    };
    for (var o = 0; o < Npuntiz; o++) {
        _loop_2(o);
    } // fine for o
    // ============= DIREZIONE Z =============
    var psz = 0; // indice superfici per direzione Z
    var _loop_3 = function (n) {
        var _loop_8 = function (m) {
            var _loop_9 = function (o) {
                var r1 = void 0, r2 = void 0, r3 = void 0, r4 = void 0;
                var r5 = void 0, r6 = void 0, r7 = void 0, r8 = void 0;
                // Calcolo r1, r5
                if (n === 0) {
                    if (m === 0) {
                        // r1 = rp[m][n][o], r5 = rp[m][n][o+1]
                        r1 = rp[m][n][o];
                        r5 = rp[m][n][o + 1];
                    }
                    else {
                        r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o][i]); });
                        r5 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o + 1][i]); });
                    }
                }
                else {
                    if (m === 0) {
                        r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o][i]); });
                        r5 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o + 1][i]); });
                    }
                    else {
                        r1 = rp[m][n][o].map(function (val, i) {
                            return 0.25 * (val + rp[m - 1][n][o][i] + rp[m][n - 1][o][i] + rp[m - 1][n - 1][o][i]);
                        });
                        r5 = rp[m][n][o + 1].map(function (val, i) {
                            return 0.25 * (val + rp[m - 1][n][o + 1][i] + rp[m][n - 1][o + 1][i] + rp[m - 1][n - 1][o + 1][i]);
                        });
                    }
                }
                // Calcolo r2, r6
                if (n === 0) {
                    if (m === Npuntix - 1) {
                        r2 = rp[m][n][o];
                        r6 = rp[m][n][o + 1];
                    }
                    else {
                        r2 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o][i]); });
                        r6 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o + 1][i]); });
                    }
                }
                else {
                    if (m === Npuntix - 1) {
                        r2 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o][i]); });
                        r6 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o + 1][i]); });
                    }
                    else {
                        r2 = rp[m][n][o].map(function (val, i) {
                            return 0.25 * (val + rp[m + 1][n][o][i] + rp[m][n - 1][o][i] + rp[m + 1][n - 1][o][i]);
                        });
                        r6 = rp[m][n][o + 1].map(function (val, i) {
                            return 0.25 * (val + rp[m + 1][n][o + 1][i] + rp[m][n - 1][o + 1][i] + rp[m + 1][n - 1][o + 1][i]);
                        });
                    }
                }
                // Calcolo r3, r7
                if (n === Npuntiy - 1) {
                    if (m === 0) {
                        r3 = rp[m][n][o];
                        r7 = rp[m][n][o + 1];
                    }
                    else {
                        r3 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o][i]); });
                        r7 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o + 1][i]); });
                    }
                }
                else {
                    if (m === 0) {
                        r3 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o][i]); });
                        r7 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o + 1][i]); });
                    }
                    else {
                        r3 = rp[m][n][o].map(function (val, i) {
                            return 0.25 * (val + rp[m - 1][n][o][i] + rp[m][n + 1][o][i] + rp[m - 1][n + 1][o][i]);
                        });
                        r7 = rp[m][n][o + 1].map(function (val, i) {
                            return 0.25 * (val + rp[m - 1][n][o + 1][i] + rp[m][n + 1][o + 1][i] + rp[m - 1][n + 1][o + 1][i]);
                        });
                    }
                }
                // Calcolo r4, r8
                if (n === Npuntiy - 1) {
                    if (m === Npuntix - 1) {
                        r4 = rp[m][n][o];
                        r8 = rp[m][n][o + 1];
                    }
                    else {
                        r4 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o][i]); });
                        r8 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o + 1][i]); });
                    }
                }
                else {
                    if (m === Npuntix - 1) {
                        r4 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o][i]); });
                        r8 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o + 1][i]); });
                    }
                    else {
                        r4 = rp[m][n][o].map(function (val, i) {
                            return 0.25 * (val + rp[m + 1][n][o][i] + rp[m][n + 1][o][i] + rp[m + 1][n + 1][o][i]);
                        });
                        r8 = rp[m][n][o + 1].map(function (val, i) {
                            return 0.25 * (val + rp[m + 1][n][o + 1][i] + rp[m][n + 1][o + 1][i] + rp[m + 1][n + 1][o + 1][i]);
                        });
                    }
                }
                // Assegnamento a celle_ind
                celle_ind[p] = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true), r5, true), r6, true), r7, true), r8, true);
                // Direzione Z => l = mean_length_save(..., 3)
                l[p] = Math.abs((0, mean_length_save_1.mean_length_save)(celle_ind[p], 3));
                spessore[p] = Math.abs((0, mean_length_save_1.mean_length_save)(celle_ind[p], 1));
                Sup[p] = Math.abs((0, mean_cross_section_Lp_1.mean_cross_section_Lp)(celle_ind[p], 3));
                width[p] = Math.abs((0, mean_length_Lp_1.mean_length_Lp)(celle_ind[p], 2));
                // dx, dy, dz
                var dx_val = (0, norm_1.norm)([r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]]);
                var dy_val = (0, norm_1.norm)([r3[0] - r1[0], r3[1] - r1[1], r3[2] - r1[2]]);
                var dz_val = (0, norm_1.norm)([r5[0] - r1[0], r5[1] - r1[1], r5[2] - r1[2]]);
                dx[p] = dx_val;
                dy[p] = dy_val;
                dz[p] = dz_val;
                // override come in MATLAB => l = dz, Sup= dx*dy
                l[p] = dz_val;
                Sup[p] = dx_val * dy_val;
                p++;
                // Lati(1,s) = rp[m][n][o], Lati(2,s) = rp[m][n][o+1]
                lati[0][s] = __spreadArray([], rp[m][n][o], true);
                lati[1][s] = __spreadArray([], rp[m][n][o + 1], true);
                var lato_vett = [
                    lati[1][s][0] - lati[0][s][0],
                    lati[1][s][1] - lati[0][s][1],
                    lati[1][s][2] - lati[0][s][2]
                ];
                dir_curr[s] = 3; // direzione Z
                var len = (0, norm_1.norm)(lato_vett);
                vers[s] = lato_vett.map(function (val) { return val / len; });
                s++;
                // 6 superfici
                // 1) piano xy
                celle_ind_sup[ps] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
                celle_ind_sup[ps + 1] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r5, true), r6, true), r7, true), r8, true);
                dir_curr_sup[ps] = 3;
                dir_curr_sup[ps + 1] = 3;
                rc_sup[ps] = [
                    0.25 * (r1[0] + r2[0] + r3[0] + r4[0]),
                    0.25 * (r1[1] + r2[1] + r3[1] + r4[1]),
                    0.25 * (r1[2] + r2[2] + r3[2] + r4[2]),
                ];
                rc_sup[ps + 1] = [
                    0.25 * (r5[0] + r6[0] + r7[0] + r8[0]),
                    0.25 * (r5[1] + r6[1] + r7[1] + r8[1]),
                    0.25 * (r5[2] + r6[2] + r7[2] + r8[2]),
                ];
                indici_celle_ind_supz[psz] = ps;
                indici_celle_ind_supz[psz + 1] = ps + 1;
                Sup_sup[ps] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps], weights_five, roots_five));
                Sup_sup[ps + 1] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps + 1], weights_five, roots_five));
                {
                    var v21 = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
                    var v31 = [r3[0] - r1[0], r3[1] - r1[1], r3[2] - r1[2]];
                    var tmp = (0, cross_1.cross)(v21, v31).map(function (val) { return -val; });
                    var den_13 = (0, norm_1.norm)(v21) * (0, norm_1.norm)(v31);
                    normale_sup[ps] = tmp.map(function (val) { return val / den_13; });
                }
                {
                    var v65 = [r6[0] - r5[0], r6[1] - r5[1], r6[2] - r5[2]];
                    var v75 = [r7[0] - r5[0], r7[1] - r5[1], r7[2] - r5[2]];
                    var tmp = (0, cross_1.cross)(v65, v75);
                    var den_14 = (0, norm_1.norm)(v65) * (0, norm_1.norm)(v75);
                    normale_sup[ps + 1] = tmp.map(function (val) { return val / den_14; });
                }
                w_sup[ps] = 0; // come in MATLAB
                w_sup[ps + 1] = 0;
                // 2) piano xz
                celle_ind_sup[ps + 2] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r5, true), r6, true);
                celle_ind_sup[ps + 3] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r3, true), r4, true), r7, true), r8, true);
                dir_curr_sup[ps + 2] = 3;
                dir_curr_sup[ps + 3] = 3;
                rc_sup[ps + 2] = [
                    0.25 * (r1[0] + r2[0] + r5[0] + r6[0]),
                    0.25 * (r1[1] + r2[1] + r5[1] + r6[1]),
                    0.25 * (r1[2] + r2[2] + r5[2] + r6[2]),
                ];
                rc_sup[ps + 3] = [
                    0.25 * (r3[0] + r4[0] + r7[0] + r8[0]),
                    0.25 * (r3[1] + r4[1] + r7[1] + r8[1]),
                    0.25 * (r3[2] + r4[2] + r7[2] + r8[2]),
                ];
                indici_celle_ind_supz[psz + 2] = ps + 2;
                indici_celle_ind_supz[psz + 3] = ps + 3;
                Sup_sup[ps + 2] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps + 2], weights_five, roots_five));
                Sup_sup[ps + 3] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps + 3], weights_five, roots_five));
                {
                    var v21 = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
                    var v51 = [r5[0] - r1[0], r5[1] - r1[1], r5[2] - r1[2]];
                    var tmp = (0, cross_1.cross)(v21, v51);
                    var den_15 = (0, norm_1.norm)(v21) * (0, norm_1.norm)(v51);
                    normale_sup[ps + 2] = tmp.map(function (val) { return val / den_15; });
                }
                {
                    var v43 = [r4[0] - r3[0], r4[1] - r3[1], r4[2] - r3[2]];
                    var v73 = [r7[0] - r3[0], r7[1] - r3[1], r7[2] - r3[2]];
                    var tmp = (0, cross_1.cross)(v43, v73).map(function (val) { return -val; });
                    var den_16 = (0, norm_1.norm)(v43) * (0, norm_1.norm)(v73);
                    normale_sup[ps + 3] = tmp.map(function (val) { return val / den_16; });
                }
                w_sup[ps + 2] = (0, norm_1.norm)([r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]]);
                w_sup[ps + 3] = (0, norm_1.norm)([r4[0] - r3[0], r4[1] - r3[1], r4[2] - r3[2]]);
                // 3) piano yz
                celle_ind_sup[ps + 4] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r3, true), r5, true), r7, true);
                celle_ind_sup[ps + 5] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r2, true), r4, true), r6, true), r8, true);
                dir_curr_sup[ps + 4] = 3;
                dir_curr_sup[ps + 5] = 3;
                rc_sup[ps + 4] = [
                    0.25 * (r1[0] + r3[0] + r5[0] + r7[0]),
                    0.25 * (r1[1] + r3[1] + r5[1] + r7[1]),
                    0.25 * (r1[2] + r3[2] + r5[2] + r7[2]),
                ];
                rc_sup[ps + 5] = [
                    0.25 * (r2[0] + r4[0] + r6[0] + r8[0]),
                    0.25 * (r2[1] + r4[1] + r6[1] + r8[1]),
                    0.25 * (r2[2] + r4[2] + r6[2] + r8[2]),
                ];
                indici_celle_ind_supz[psz + 4] = ps + 4;
                indici_celle_ind_supz[psz + 5] = ps + 5;
                Sup_sup[ps + 4] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps + 4], weights_five, roots_five));
                Sup_sup[ps + 5] = Math.abs((0, surfa_old_1.surfa_old)(celle_ind_sup[ps + 5], weights_five, roots_five));
                {
                    var v31 = [r3[0] - r1[0], r3[1] - r1[1], r3[2] - r1[2]];
                    var v51 = [r5[0] - r1[0], r5[1] - r1[1], r5[2] - r1[2]];
                    var tmp = (0, cross_1.cross)(v31, v51).map(function (val) { return -val; });
                    var den_17 = (0, norm_1.norm)(v31) * (0, norm_1.norm)(v51);
                    normale_sup[ps + 4] = tmp.map(function (val) { return val / den_17; });
                }
                {
                    var v42 = [r4[0] - r2[0], r4[1] - r2[1], r4[2] - r2[2]];
                    var v62 = [r6[0] - r2[0], r6[1] - r2[1], r6[2] - r2[2]];
                    var tmp = (0, cross_1.cross)(v42, v62);
                    var den_18 = (0, norm_1.norm)(v42) * (0, norm_1.norm)(v62);
                    normale_sup[ps + 5] = tmp.map(function (val) { return val / den_18; });
                }
                w_sup[ps + 4] = (0, norm_1.norm)([r3[0] - r1[0], r3[1] - r1[1], r3[2] - r1[2]]);
                w_sup[ps + 5] = (0, norm_1.norm)([r2[0] - r4[0], r2[1] - r4[1], r2[2] - r4[2]]);
                ps += 6;
                psz += 6;
            };
            for (var o = 0; o < Npuntiz - 1; o++) {
                _loop_9(o);
            } // fine for o
        };
        for (var m = 0; m < Npuntix; m++) {
            _loop_8(m);
        } // fine for m
    };
    for (var n = 0; n < Npuntiy; n++) {
        _loop_3(n);
    } // fine for n
    // 4) In MATLAB: barra = celle_ind
    var barra = celle_ind;
    // 5) Ritorno
    return {
        celle_ind: celle_ind,
        lati: lati,
        vers: vers,
        l: l,
        spessore: spessore,
        Sup: Sup,
        width: width,
        dir_curr: dir_curr,
        celle_ind_sup: celle_ind_sup,
        indici_celle_ind_supx: indici_celle_ind_supx,
        indici_celle_ind_supy: indici_celle_ind_supy,
        indici_celle_ind_supz: indici_celle_ind_supz,
        rc_sup: rc_sup,
        Sup_sup: Sup_sup,
        normale_sup: normale_sup,
        dir_curr_sup: dir_curr_sup,
        w_sup: w_sup,
        barra: barra
    };
}
