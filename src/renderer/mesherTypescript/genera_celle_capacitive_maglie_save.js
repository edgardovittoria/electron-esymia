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
exports.genera_celle_capacitive_maglie_save = genera_celle_capacitive_maglie_save;
var surfa_old_1 = require("./surfa_old");
var mean_length_P_1 = require("./mean_length_P");
/**
 * @param rp
 * @param Npuntiy
 * @param Npuntiz
 * @param weights_five
 * @param roots_five
 * @returns celle_cap, Nodi, Sup_c, l_c, width_c, NodiRed
 */
function genera_celle_capacitive_maglie_save(rp, Npuntix, Npuntiy, Npuntiz, weights_five, roots_five) {
    // n_celle_cap = 2*(Npuntiy*Npuntix + Npuntiz*Npuntix + Npuntiy*Npuntiz)
    var n_celle_cap = 2 * (Npuntiy * Npuntix +
        Npuntiz * Npuntix +
        Npuntiy * Npuntiz);
    // Allocazione array 
    var celle_cap = Array.from({ length: n_celle_cap }, function () { return Array(12).fill(0); });
    var Nodi = Array.from({ length: n_celle_cap }, function () { return Array(3).fill(0); });
    var Sup_c = Array(n_celle_cap).fill(0);
    var l_c = Array(n_celle_cap).fill(0);
    var width_c = Array(n_celle_cap).fill(0);
    var r = 0; // indice cella di superficie attuale (in MATLAB era r=1, qui r=0)
    var _loop_1 = function (n) {
        var _loop_4 = function (m) {
            // Calcolo r1..r4 (Faccia I) e r5..r8 (Faccia II)
            // con if (n==1) => (n==0), (n==Npuntiy) => (n==Npuntiy-1), ...
            // Questi if servono a "mediare" i punti in rp[][][].
            //--------------- r1, r5 --------------
            var r1 = void 0, r2 = void 0, r3 = void 0, r4 = void 0;
            var r5 = void 0, r6 = void 0, r7 = void 0, r8 = void 0;
            // r1 e r5: 
            if (n === 0) {
                if (m === 0) {
                    // o=1 => in TS => o=0
                    var o = 0;
                    r1 = rp[m][n][o];
                    // o=Npuntiz => in TS => o=Npuntiz-1
                    o = Npuntiz - 1;
                    r5 = rp[m][n][o];
                }
                else {
                    // caso else
                    var o_1 = 0;
                    // r1 = 0.5*(rp(m,n,o) + rp(m-1,n,o))
                    r1 = rp[m][n][o_1].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o_1][i]); });
                    o_1 = Npuntiz - 1;
                    r5 = rp[m][n][o_1].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o_1][i]); });
                }
            }
            else {
                if (m === 0) {
                    var o_2 = 0;
                    r1 = rp[m][n][o_2].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o_2][i]); });
                    o_2 = Npuntiz - 1;
                    r5 = rp[m][n][o_2].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o_2][i]); });
                }
                else {
                    var o_3 = 0;
                    r1 = rp[m][n][o_3].map(function (val, i) {
                        return 0.25 * (val + rp[m - 1][n][o_3][i] + rp[m][n - 1][o_3][i] + rp[m - 1][n - 1][o_3][i]);
                    });
                    o_3 = Npuntiz - 1;
                    r5 = rp[m][n][o_3].map(function (val, i) {
                        return 0.25 * (val + rp[m - 1][n][o_3][i] + rp[m][n - 1][o_3][i] + rp[m - 1][n - 1][o_3][i]);
                    });
                }
            }
            //--------------- r2, r6 --------------
            if (n === 0) {
                if (m === Npuntix - 1) {
                    var o = 0;
                    r2 = rp[m][n][o];
                    o = Npuntiz - 1;
                    r6 = rp[m][n][o];
                }
                else {
                    var o_4 = 0;
                    r2 = rp[m][n][o_4].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o_4][i]); });
                    o_4 = Npuntiz - 1;
                    r6 = rp[m][n][o_4].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o_4][i]); });
                }
            }
            else {
                if (m === Npuntix - 1) {
                    var o_5 = 0;
                    r2 = rp[m][n][o_5].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o_5][i]); });
                    o_5 = Npuntiz - 1;
                    r6 = rp[m][n][o_5].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o_5][i]); });
                }
                else {
                    var o_6 = 0;
                    r2 = rp[m][n][o_6].map(function (val, i) {
                        return 0.25 * (val + rp[m + 1][n][o_6][i] + rp[m][n - 1][o_6][i] + rp[m + 1][n - 1][o_6][i]);
                    });
                    o_6 = Npuntiz - 1;
                    r6 = rp[m][n][o_6].map(function (val, i) {
                        return 0.25 * (val + rp[m + 1][n][o_6][i] + rp[m][n - 1][o_6][i] + rp[m + 1][n - 1][o_6][i]);
                    });
                }
            }
            //--------------- r3, r7 --------------
            if (n === Npuntiy - 1) {
                if (m === 0) {
                    var o = 0;
                    r3 = rp[m][n][o];
                    o = Npuntiz - 1;
                    r7 = rp[m][n][o];
                }
                else {
                    var o_7 = 0;
                    r3 = rp[m][n][o_7].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o_7][i]); });
                    o_7 = Npuntiz - 1;
                    r7 = rp[m][n][o_7].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o_7][i]); });
                }
            }
            else {
                if (m === 0) {
                    var o_8 = 0;
                    r3 = rp[m][n][o_8].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o_8][i]); });
                    o_8 = Npuntiz - 1;
                    r7 = rp[m][n][o_8].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o_8][i]); });
                }
                else {
                    var o_9 = 0;
                    r3 = rp[m][n][o_9].map(function (val, i) {
                        return 0.25 * (val + rp[m - 1][n][o_9][i] + rp[m][n + 1][o_9][i] + rp[m - 1][n + 1][o_9][i]);
                    });
                    o_9 = Npuntiz - 1;
                    r7 = rp[m][n][o_9].map(function (val, i) {
                        return 0.25 * (val + rp[m - 1][n][o_9][i] + rp[m][n + 1][o_9][i] + rp[m - 1][n + 1][o_9][i]);
                    });
                }
            }
            //--------------- r4, r8 --------------
            if (n === Npuntiy - 1) {
                if (m === Npuntix - 1) {
                    var o = 0;
                    r4 = rp[m][n][o];
                    o = Npuntiz - 1;
                    r8 = rp[m][n][o];
                }
                else {
                    var o_10 = 0;
                    r4 = rp[m][n][o_10].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o_10][i]); });
                    o_10 = Npuntiz - 1;
                    r8 = rp[m][n][o_10].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o_10][i]); });
                }
            }
            else {
                if (m === Npuntix - 1) {
                    var o_11 = 0;
                    r4 = rp[m][n][o_11].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o_11][i]); });
                    o_11 = Npuntiz - 1;
                    r8 = rp[m][n][o_11].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o_11][i]); });
                }
                else {
                    var o_12 = 0;
                    r4 = rp[m][n][o_12].map(function (val, i) {
                        return 0.25 * (val + rp[m + 1][n][o_12][i] + rp[m][n + 1][o_12][i] + rp[m + 1][n + 1][o_12][i]);
                    });
                    o_12 = Npuntiz - 1;
                    r8 = rp[m][n][o_12].map(function (val, i) {
                        return 0.25 * (val + rp[m + 1][n][o_12][i] + rp[m][n + 1][o_12][i] + rp[m + 1][n + 1][o_12][i]);
                    });
                }
            }
            //  assegnamento
            celle_cap[r] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
            celle_cap[r + 1] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r5, true), r6, true), r7, true), r8, true);
            // Nodi(r,:) = rp(m,n,1,:) => TS => rp[m][n][0]
            Nodi[r] = rp[m][n][0];
            Nodi[r + 1] = rp[m][n][Npuntiz - 1]; //  faccia zmax
            // Sup_c
            var sup1 = (0, surfa_old_1.surfa_old)(celle_cap[r], weights_five, roots_five);
            var sup2 = (0, surfa_old_1.surfa_old)(celle_cap[r + 1], weights_five, roots_five);
            Sup_c[r] = sup1;
            Sup_c[r + 1] = sup2;
            // l_c, width_c
            // "Per il calcolo della lunghezza e della larghezza assumo che l_c sia nella direzione 1 e che width_c nella direzione 2"
            l_c[r] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[r], 1));
            width_c[r] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[r], 2));
            l_c[r + 1] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[r + 1], 1));
            width_c[r + 1] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[r + 1], 2));
            r += 2;
        };
        for (var m = 0; m < Npuntix; m++) {
            _loop_4(m);
        }
    };
    //----------------------------------------------------------------------
    //                    (1) Loop su N e M => Faccia I e II (xy)
    //----------------------------------------------------------------------
    // In MATLAB: for n=1:Npuntiy, for m=1:Npuntix
    //   => in TS: n=0..Npuntiy-1, m=0..Npuntix-1
    for (var n = 0; n < Npuntiy; n++) {
        _loop_1(n);
    }
    var _loop_2 = function (o) {
        var _loop_5 = function (m) {
            // Stessa logica: r1..r8
            // r1,r5
            var r1 = void 0, r2 = void 0, r3 = void 0, r4 = void 0;
            var r5 = void 0, r6 = void 0, r7 = void 0, r8 = void 0;
            if (o === 0) {
                if (m === 0) {
                    var n = 0;
                    r1 = rp[m][n][o];
                    n = Npuntiy - 1;
                    r5 = rp[m][n][o];
                }
                else {
                    var n_1 = 0;
                    r1 = rp[m][n_1][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n_1][o][i]); });
                    n_1 = Npuntiy - 1;
                    r5 = rp[m][n_1][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n_1][o][i]); });
                }
            }
            else {
                if (m === 0) {
                    var n_2 = 0;
                    r1 = rp[m][n_2][o].map(function (val, i) { return 0.5 * (val + rp[m][n_2][o - 1][i]); });
                    n_2 = Npuntiy - 1;
                    r5 = rp[m][n_2][o].map(function (val, i) { return 0.5 * (val + rp[m][n_2][o - 1][i]); });
                }
                else {
                    var n_3 = 0;
                    r1 = rp[m][n_3][o].map(function (val, i) {
                        return 0.25 * (val + rp[m - 1][n_3][o][i] + rp[m][n_3][o - 1][i] + rp[m - 1][n_3][o - 1][i]);
                    });
                    n_3 = Npuntiy - 1;
                    r5 = rp[m][n_3][o].map(function (val, i) {
                        return 0.25 * (val + rp[m - 1][n_3][o][i] + rp[m][n_3][o - 1][i] + rp[m - 1][n_3][o - 1][i]);
                    });
                }
            }
            // r2,r6
            if (o === 0) {
                if (m === Npuntix - 1) {
                    var n = 0;
                    r2 = rp[m][n][o];
                    n = Npuntiy - 1;
                    r6 = rp[m][n][o];
                }
                else {
                    var n_4 = 0;
                    r2 = rp[m][n_4][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n_4][o][i]); });
                    n_4 = Npuntiy - 1;
                    r6 = rp[m][n_4][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n_4][o][i]); });
                }
            }
            else {
                if (m === Npuntix - 1) {
                    var n_5 = 0;
                    r2 = rp[m][n_5][o].map(function (val, i) { return 0.5 * (val + rp[m][n_5][o - 1][i]); });
                    n_5 = Npuntiy - 1;
                    r6 = rp[m][n_5][o].map(function (val, i) { return 0.5 * (val + rp[m][n_5][o - 1][i]); });
                }
                else {
                    var n_6 = 0;
                    r2 = rp[m][n_6][o].map(function (val, i) {
                        return 0.25 * (val + rp[m + 1][n_6][o][i] + rp[m][n_6][o - 1][i] + rp[m + 1][n_6][o - 1][i]);
                    });
                    n_6 = Npuntiy - 1;
                    r6 = rp[m][n_6][o].map(function (val, i) {
                        return 0.25 * (val + rp[m + 1][n_6][o][i] + rp[m][n_6][o - 1][i] + rp[m + 1][n_6][o - 1][i]);
                    });
                }
            }
            // r3,r7
            if (o === Npuntiz - 1) {
                if (m === 0) {
                    var n = 0;
                    r3 = rp[m][n][o];
                    n = Npuntiy - 1;
                    r7 = rp[m][n][o];
                }
                else {
                    var n_7 = 0;
                    r3 = rp[m][n_7][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n_7][o][i]); });
                    n_7 = Npuntiy - 1;
                    r7 = rp[m][n_7][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n_7][o][i]); });
                }
            }
            else {
                if (m === 0) {
                    var n_8 = 0;
                    r3 = rp[m][n_8][o].map(function (val, i) { return 0.5 * (val + rp[m][n_8][o + 1][i]); });
                    n_8 = Npuntiy - 1;
                    r7 = rp[m][n_8][o].map(function (val, i) { return 0.5 * (val + rp[m][n_8][o + 1][i]); });
                }
                else {
                    var n_9 = 0;
                    r3 = rp[m][n_9][o].map(function (val, i) {
                        return 0.25 * (val + rp[m - 1][n_9][o][i] + rp[m][n_9][o + 1][i] + rp[m - 1][n_9][o + 1][i]);
                    });
                    n_9 = Npuntiy - 1;
                    r7 = rp[m][n_9][o].map(function (val, i) {
                        return 0.25 * (val + rp[m - 1][n_9][o][i] + rp[m][n_9][o + 1][i] + rp[m - 1][n_9][o + 1][i]);
                    });
                }
            }
            // r4,r8
            if (o === Npuntiz - 1) {
                if (m === Npuntix - 1) {
                    var n = 0;
                    r4 = rp[m][n][o];
                    n = Npuntiy - 1;
                    r8 = rp[m][n][o];
                }
                else {
                    var n_10 = 0;
                    r4 = rp[m][n_10][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n_10][o][i]); });
                    n_10 = Npuntiy - 1;
                    r8 = rp[m][n_10][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n_10][o][i]); });
                }
            }
            else {
                if (m === Npuntix - 1) {
                    var n_11 = 0;
                    r4 = rp[m][n_11][o].map(function (val, i) { return 0.5 * (val + rp[m][n_11][o + 1][i]); });
                    n_11 = Npuntiy - 1;
                    r8 = rp[m][n_11][o].map(function (val, i) { return 0.5 * (val + rp[m][n_11][o + 1][i]); });
                }
                else {
                    var n_12 = 0;
                    r4 = rp[m][n_12][o].map(function (val, i) {
                        return 0.25 * (val + rp[m + 1][n_12][o][i] + rp[m][n_12][o + 1][i] + rp[m + 1][n_12][o + 1][i]);
                    });
                    n_12 = Npuntiy - 1;
                    r8 = rp[m][n_12][o].map(function (val, i) {
                        return 0.25 * (val + rp[m + 1][n_12][o][i] + rp[m][n_12][o + 1][i] + rp[m + 1][n_12][o + 1][i]);
                    });
                }
            }
            celle_cap[r] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
            celle_cap[r + 1] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r5, true), r6, true), r7, true), r8, true);
            // Nodi(r,:) = rp(m,1,o) => TS => rp[m][0][o], 
            // Nodi(r+1,:) = rp(m,Npuntiy,o) => rp[m][Npuntiy-1][o]
            Nodi[r] = rp[m][0][o];
            Nodi[r + 1] = rp[m][Npuntiy - 1][o];
            // sup e lunghezze
            var sup1 = (0, surfa_old_1.surfa_old)(celle_cap[r], weights_five, roots_five);
            var sup2 = (0, surfa_old_1.surfa_old)(celle_cap[r + 1], weights_five, roots_five);
            Sup_c[r] = sup1;
            Sup_c[r + 1] = sup2;
            // "Per il calcolo della lunghezza e della larghezza assumo che l_c sia nella direzione 2 e che width_c nella direzione 1"
            l_c[r] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[r], 2));
            width_c[r] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[r], 1));
            l_c[r + 1] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[r + 1], 2));
            width_c[r + 1] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[r + 1], 1));
            r += 2;
        };
        for (var m = 0; m < Npuntix; m++) {
            _loop_5(m);
        }
    };
    //----------------------------------------------------------------------
    //                (2) Loop su O e M => Faccia III e IV (xz)
    //----------------------------------------------------------------------
    // MATLAB: for o=1:Npuntiz, for m=1:Npuntix
    // => TS: o=0..Npuntiz-1, m=0..Npuntix-1
    for (var o = 0; o < Npuntiz; o++) {
        _loop_2(o);
    }
    var _loop_3 = function (o) {
        var _loop_6 = function (n) {
            // r1..r8
            var r1 = void 0, r2 = void 0, r3 = void 0, r4 = void 0;
            var r5 = void 0, r6 = void 0, r7 = void 0, r8 = void 0;
            // r1,r5
            if (o === 0) {
                if (n === 0) {
                    var m = 0;
                    r1 = rp[m][n][o];
                    m = Npuntix - 1;
                    r5 = rp[m][n][o];
                }
                else {
                    var m_1 = 0;
                    r1 = rp[m_1][n][o].map(function (val, i) { return 0.5 * (val + rp[m_1][n - 1][o][i]); });
                    m_1 = Npuntix - 1;
                    r5 = rp[m_1][n][o].map(function (val, i) { return 0.5 * (val + rp[m_1][n - 1][o][i]); });
                }
            }
            else {
                if (n === 0) {
                    var m_2 = 0;
                    r1 = rp[m_2][n][o].map(function (val, i) { return 0.5 * (val + rp[m_2][n][o - 1][i]); });
                    m_2 = Npuntix - 1;
                    r5 = rp[m_2][n][o].map(function (val, i) { return 0.5 * (val + rp[m_2][n][o - 1][i]); });
                }
                else {
                    var m_3 = 0;
                    r1 = rp[m_3][n][o].map(function (val, i) {
                        return 0.25 * (val + rp[m_3][n - 1][o][i] + rp[m_3][n][o - 1][i] + rp[m_3][n - 1][o - 1][i]);
                    });
                    m_3 = Npuntix - 1;
                    r5 = rp[m_3][n][o].map(function (val, i) {
                        return 0.25 * (val + rp[m_3][n - 1][o][i] + rp[m_3][n][o - 1][i] + rp[m_3][n - 1][o - 1][i]);
                    });
                }
            }
            // r2,r6
            if (o === 0) {
                if (n === Npuntiy - 1) {
                    var m = 0;
                    r2 = rp[m][n][o];
                    m = Npuntix - 1;
                    r6 = rp[m][n][o];
                }
                else {
                    var m_4 = 0;
                    r2 = rp[m_4][n][o].map(function (val, i) { return 0.5 * (val + rp[m_4][n + 1][o][i]); });
                    m_4 = Npuntix - 1;
                    r6 = rp[m_4][n][o].map(function (val, i) { return 0.5 * (val + rp[m_4][n + 1][o][i]); });
                }
            }
            else {
                if (n === Npuntiy - 1) {
                    var m_5 = 0;
                    r2 = rp[m_5][n][o].map(function (val, i) { return 0.5 * (val + rp[m_5][n][o - 1][i]); });
                    m_5 = Npuntix - 1;
                    r6 = rp[m_5][n][o].map(function (val, i) { return 0.5 * (val + rp[m_5][n][o - 1][i]); });
                }
                else {
                    var m_6 = 0;
                    r2 = rp[m_6][n][o].map(function (val, i) {
                        return 0.25 * (val + rp[m_6][n + 1][o][i] + rp[m_6][n][o - 1][i] + rp[m_6][n + 1][o - 1][i]);
                    });
                    m_6 = Npuntix - 1;
                    r6 = rp[m_6][n][o].map(function (val, i) {
                        return 0.25 * (val + rp[m_6][n + 1][o][i] + rp[m_6][n][o - 1][i] + rp[m_6][n + 1][o - 1][i]);
                    });
                }
            }
            // r3,r7
            if (o === Npuntiz - 1) {
                if (n === 0) {
                    var m = 0;
                    r3 = rp[m][n][o];
                    m = Npuntix - 1;
                    r7 = rp[m][n][o];
                }
                else {
                    var m_7 = 0;
                    r3 = rp[m_7][n][o].map(function (val, i) { return 0.5 * (val + rp[m_7][n - 1][o][i]); });
                    m_7 = Npuntix - 1;
                    r7 = rp[m_7][n][o].map(function (val, i) { return 0.5 * (val + rp[m_7][n - 1][o][i]); });
                }
            }
            else {
                if (n === 0) {
                    var m_8 = 0;
                    r3 = rp[m_8][n][o].map(function (val, i) { return 0.5 * (val + rp[m_8][n][o + 1][i]); });
                    m_8 = Npuntix - 1;
                    r7 = rp[m_8][n][o].map(function (val, i) { return 0.5 * (val + rp[m_8][n][o + 1][i]); });
                }
                else {
                    var m_9 = 0;
                    r3 = rp[m_9][n][o].map(function (val, i) {
                        return 0.25 * (val + rp[m_9][n - 1][o][i] + rp[m_9][n][o + 1][i] + rp[m_9][n - 1][o + 1][i]);
                    });
                    m_9 = Npuntix - 1;
                    r7 = rp[m_9][n][o].map(function (val, i) {
                        return 0.25 * (val + rp[m_9][n - 1][o][i] + rp[m_9][n][o + 1][i] + rp[m_9][n - 1][o + 1][i]);
                    });
                }
            }
            // r4,r8
            if (o === Npuntiz - 1) {
                if (n === Npuntiy - 1) {
                    var m = 0;
                    r4 = rp[m][n][o];
                    m = Npuntix - 1;
                    r8 = rp[m][n][o];
                }
                else {
                    var m_10 = 0;
                    r4 = rp[m_10][n][o].map(function (val, i) { return 0.5 * (val + rp[m_10][n + 1][o][i]); });
                    m_10 = Npuntix - 1;
                    r8 = rp[m_10][n][o].map(function (val, i) { return 0.5 * (val + rp[m_10][n + 1][o][i]); });
                }
            }
            else {
                if (n === Npuntiy - 1) {
                    var m_11 = 0;
                    r4 = rp[m_11][n][o].map(function (val, i) { return 0.5 * (val + rp[m_11][n][o + 1][i]); });
                    m_11 = Npuntix - 1;
                    r8 = rp[m_11][n][o].map(function (val, i) { return 0.5 * (val + rp[m_11][n][o + 1][i]); });
                }
                else {
                    var m_12 = 0;
                    r4 = rp[m_12][n][o].map(function (val, i) {
                        return 0.25 * (val + rp[m_12][n + 1][o][i] + rp[m_12][n][o + 1][i] + rp[m_12][n + 1][o + 1][i]);
                    });
                    m_12 = Npuntix - 1;
                    r8 = rp[m_12][n][o].map(function (val, i) {
                        return 0.25 * (val + rp[m_12][n + 1][o][i] + rp[m_12][n][o + 1][i] + rp[m_12][n + 1][o + 1][i]);
                    });
                }
            }
            celle_cap[r] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
            celle_cap[r + 1] = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r5, true), r6, true), r7, true), r8, true);
            // Nodi(r,:) = rp(1,n,o) => rp[0][n][o], 
            // Nodi(r+1,:) = rp(Npuntix,n,o) => rp[Npuntix-1][n][o]
            Nodi[r] = rp[0][n][o];
            Nodi[r + 1] = rp[Npuntix - 1][n][o];
            var sup1 = (0, surfa_old_1.surfa_old)(celle_cap[r], weights_five, roots_five);
            var sup2 = (0, surfa_old_1.surfa_old)(celle_cap[r + 1], weights_five, roots_five);
            Sup_c[r] = sup1;
            Sup_c[r + 1] = sup2;
            // "l_c nella direzione 1, width_c nella direzione 2"
            l_c[r] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[r], 1));
            width_c[r] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[r], 2));
            l_c[r + 1] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[r + 1], 1));
            width_c[r + 1] = Math.abs((0, mean_length_P_1.mean_length_P)(celle_cap[r + 1], 2));
            r += 2;
        };
        for (var n = 0; n < Npuntiy; n++) {
            _loop_6(n);
        }
    };
    //----------------------------------------------------------------------
    //                (3) Loop su O e N => Faccia V e VI (yz)
    //----------------------------------------------------------------------
    // for o=1..Npuntiz, for n=1..Npuntiy
    for (var o = 0; o < Npuntiz; o++) {
        _loop_3(o);
    }
    //----------------------------------------------------------------------
    //            (4) Riduzione nodi capacitivi (NodiRed)
    //----------------------------------------------------------------------
    var NumNodiCap = Nodi.length; // size(Nodi,1)
    // NodiRed di dimensione:
    //  Npuntix*Npuntiy*Npuntiz - (Npuntix-2)*(Npuntiy-2)*(Npuntiz-2)  (?) 
    // oppure  (Npuntiy*Npuntix + Npuntiz*Npuntix + Npuntiy*Npuntiz - ...)
    // Nel codice MATLAB c’è la riga:
    //   Npuntix*Npuntiy*Npuntiz - (Npuntix-2)*(Npuntiy-2)*(Npuntiz-2)
    // La usiamo come dimensione massima.
    var targetSize = Npuntix * Npuntiy * Npuntiz
        - (Npuntix - 2) * (Npuntiy - 2) * (Npuntiz - 2);
    var NodiRed = Array.from({ length: targetSize }, function () { return [0, 0, 0]; });
    if (NumNodiCap > 1) {
        // Copiamo il primo nodo
        NodiRed[0] = __spreadArray([], Nodi[0], true);
        var nodoAct = 1;
        // Per k=2..NumNodiCap => TS => k=1..NumNodiCap-1
        for (var k = 1; k < NumNodiCap; k++) {
            // Cerchiamo un nodo in NodiRed uguale (entro 1e-11)
            var candidate = Nodi[k];
            var foundIndex = -1;
            for (var i = 0; i < nodoAct; i++) {
                var dx = Math.abs(NodiRed[i][0] - candidate[0]);
                var dy = Math.abs(NodiRed[i][1] - candidate[1]);
                var dz = Math.abs(NodiRed[i][2] - candidate[2]);
                if (dx <= 1e-11 && dy <= 1e-11 && dz <= 1e-11) {
                    foundIndex = i;
                    break;
                }
            }
            if (foundIndex === -1) {
                // Non trovato => aggiungiamo
                NodiRed[nodoAct] = __spreadArray([], candidate, true);
                nodoAct++;
            }
        }
        // Se nodoAct < targetSize, i restanti li lasciamo a [0,0,0] (come in MATLAB c’erano righe vuote).
        // Se vuoi “tagliare” l’array, puoi farlo:
        NodiRed.splice(nodoAct); // Tagliamo l’array alla dimensione effettiva
    }
    else {
        // Se c’è 0 o 1 nodo, la riduzione è banale
        if (NumNodiCap === 1) {
            NodiRed[0] = __spreadArray([], Nodi[0], true);
            NodiRed.splice(1);
        }
        else {
            // Nessun nodo => array vuoto
            NodiRed.splice(0);
        }
    }
    // Ritorno finale
    return {
        celle_cap: celle_cap,
        Nodi: Nodi,
        Sup_c: Sup_c,
        l_c: l_c,
        width_c: width_c,
        NodiRed: NodiRed
    };
}
