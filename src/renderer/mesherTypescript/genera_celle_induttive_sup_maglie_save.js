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
exports.genera_celle_induttive_sup_maglie_save = genera_celle_induttive_sup_maglie_save;
var surfa_old_1 = require("./surfa_old");
var mean_length_P_1 = require("./mean_length_P");
var norm_1 = require("./norm");
/**

 * @param rp        Quattro dimensioni: [Npuntix][Npuntiy][Npuntiz][3].
 * @param Npuntix
 * @param Npuntiy
 * @param Npuntiz
 * @param weights_five
 * @param roots_five
 * @returns Un oggetto contenente celle_mag, lati_m, Sup_m, l_m, width_m, vers_m, norm_m.
 */
function genera_celle_induttive_sup_maglie_save(rp, Npuntix, Npuntiy, Npuntiz, weights_five, roots_five) {
    var s = 0; // indice che scorre le celle superficiali
    // In MATLAB: sizeA = ((Npuntiy)*(Npuntix-1)*2 + (Npuntiy-1)*(Npuntix)*2 + ...
    //                     (Npuntiz)*(Npuntix-1)*2 + (Npuntiz-1)*(Npuntix)*2 + ...
    //                     (Npuntiz)*(Npuntiy-1)*2 + (Npuntiz-1)*(Npuntiy)*2);
    var sizeA = Npuntiy * (Npuntix - 1) * 2 +
        (Npuntiy - 1) * Npuntix * 2 +
        Npuntiz * (Npuntix - 1) * 2 +
        (Npuntiz - 1) * Npuntix * 2 +
        Npuntiz * (Npuntiy - 1) * 2 +
        (Npuntiz - 1) * Npuntiy * 2;
    // Allochiamo gli array in modo analogo al MATLAB.
    // celle_mag: array di sizeA righe x 12 colonne
    var celle_mag = Array.from({ length: sizeA }, function () { return Array(12).fill(0); });
    // lati_m: dimensione [2, sizeA, 3]
    var lati_m = [
        Array.from({ length: sizeA }, function () { return Array(3).fill(0); }),
        Array.from({ length: sizeA }, function () { return Array(3).fill(0); })
    ];
    // Sup_m, l_m, width_m => array 1D di length = sizeA
    var Sup_m = Array(sizeA).fill(0);
    var l_m = Array(sizeA).fill(0);
    var width_m = Array(sizeA).fill(0);
    // vers_m, norm_m => array 2D di dimensioni [sizeA x 3]
    var vers_m = Array.from({ length: sizeA }, function () { return Array(3).fill(0); });
    var norm_m = Array.from({ length: sizeA }, function () { return Array(3).fill(0); });
    // lato_vett_m e lato_vett_m_p => in MATLAB servivano come d’appoggio, 
    // qui replichiamo la struttura.
    var lato_vett_m = Array.from({ length: sizeA }, function () { return Array(3).fill(0); });
    var lato_vett_m_p = [0, 0, 0];
    var _loop_1 = function (n) {
        var _loop_8 = function (m) {
            // Faccia I (xy, z=zmin) => o=1 => in TS => o=0
            var o = 0;
            var r1 = void 0, r2 = void 0, r3 = void 0, r4 = void 0;
            // if(n==1) => if (n==0)
            if (n === 0) {
                r1 = rp[m][n][o];
                r2 = rp[m + 1][n][o];
                lato_vett_m_p = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
            }
            else {
                r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o][i]); });
                r2 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n - 1][o][i]); });
            }
            // if(n==Npuntiy) => if(n==Npuntiy-1)
            if (n === Npuntiy - 1) {
                r3 = rp[m][n][o];
                r4 = rp[m + 1][n][o];
                lato_vett_m_p = [r4[0] - r3[0], r4[1] - r3[1], r4[2] - r3[2]];
            }
            else {
                r3 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o][i]); });
                r4 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n + 1][o][i]); });
            }
            var celle_mag_p = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
            var Sup_m_p = (0, surfa_old_1.surfa_old)(celle_mag_p, weights_five, roots_five);
            // direzione 1 => x
            var l_m_p = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p, 1));
            var width_m_p = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p, 2));
            // vers_m_p = lato_vett_m_p ./ norm(...)
            var vlen = (0, norm_1.norm)(lato_vett_m_p);
            var vers_m_p = (vlen !== 0)
                ? lato_vett_m_p.map(function (val) { return val / vlen; })
                : [0, 0, 0];
            // norm_m_p = [0 0 -1]
            var norm_m_p = [0, 0, -1];
            // Salvataggio
            celle_mag[s] = celle_mag_p;
            Sup_m[s] = Sup_m_p;
            l_m[s] = l_m_p;
            width_m[s] = width_m_p;
            vers_m[s] = vers_m_p;
            norm_m[s] = norm_m_p;
            lato_vett_m[s] = __spreadArray([], lato_vett_m_p, true);
            // In MATLAB: lati_m(1,s,:) e lati_m(2,s,:)
            lati_m[0][s] = __spreadArray([], rp[m][n][o], true);
            lati_m[1][s] = __spreadArray([], rp[m + 1][n][o], true);
            s++;
        };
        for (var m = 0; m < Npuntix - 1; m++) {
            _loop_8(m);
        }
    };
    //----------------------------------------------------------------------
    //                CELLE X SUI PIANI XY
    //----------------------------------------------------------------------
    // In MATLAB: for n = 1:Npuntiy, for m = 1:Npuntix-1, ...
    for (var n = 0; n < Npuntiy; n++) {
        _loop_1(n);
    }
    var _loop_2 = function (n) {
        var _loop_9 = function (m) {
            var o = Npuntiz - 1;
            var r1 = void 0, r2 = void 0, r3 = void 0, r4 = void 0;
            if (n === 0) {
                r1 = rp[m][n][o];
                r2 = rp[m + 1][n][o];
                lato_vett_m_p = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
            }
            else {
                r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o][i]); });
                r2 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n - 1][o][i]); });
            }
            if (n === Npuntiy - 1) {
                r3 = rp[m][n][o];
                r4 = rp[m + 1][n][o];
                lato_vett_m_p = [r4[0] - r3[0], r4[1] - r3[1], r4[2] - r3[2]];
            }
            else {
                r3 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o][i]); });
                r4 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n + 1][o][i]); });
            }
            var celle_mag_p = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
            var Sup_m_p = (0, surfa_old_1.surfa_old)(celle_mag_p, weights_five, roots_five);
            var l_m_p = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p, 1));
            var width_m_p = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p, 2));
            var vlen = (0, norm_1.norm)(lato_vett_m_p);
            var vers_m_p = (vlen !== 0)
                ? lato_vett_m_p.map(function (val) { return val / vlen; })
                : [0, 0, 0];
            var norm_m_p = [0, 0, 1];
            celle_mag[s] = celle_mag_p;
            Sup_m[s] = Sup_m_p;
            l_m[s] = l_m_p;
            width_m[s] = width_m_p;
            vers_m[s] = vers_m_p;
            norm_m[s] = norm_m_p;
            lato_vett_m[s] = __spreadArray([], lato_vett_m_p, true);
            lati_m[0][s] = __spreadArray([], rp[m][n][o], true);
            lati_m[1][s] = __spreadArray([], rp[m + 1][n][o], true);
            s++;
        };
        for (var m = 0; m < Npuntix - 1; m++) {
            _loop_9(m);
        }
    };
    // Ora la Faccia II (xy, z=zmax) 
    for (var n = 0; n < Npuntiy; n++) {
        _loop_2(n);
    }
    var _loop_3 = function (n) {
        var _loop_10 = function (m) {
            // Faccia III => o=1 => TS => o=0
            var o = 0;
            var r1 = void 0, r2 = void 0, r3 = void 0, r4 = void 0;
            if (m === 0) {
                r1 = rp[m][n][o];
                r3 = rp[m][n + 1][o];
                lato_vett_m_p = [r3[0] - r1[0], r3[1] - r1[1], r3[2] - r1[2]];
            }
            else {
                r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o][i]); });
                r3 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n + 1][o][i]); });
            }
            if (m === Npuntix - 1) {
                r2 = rp[m][n][o];
                r4 = rp[m][n + 1][o];
                lato_vett_m_p = [r4[0] - r2[0], r4[1] - r2[1], r4[2] - r2[2]];
            }
            else {
                r2 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o][i]); });
                r4 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n + 1][o][i]); });
            }
            var celle_mag_p = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
            var Sup_m_p = (0, surfa_old_1.surfa_old)(celle_mag_p, weights_five, roots_five);
            // direzione 2 => y
            var l_m_p = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p, 2));
            var width_m_p = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p, 1));
            var vlen = (0, norm_1.norm)(lato_vett_m_p);
            var vers_m_p = (vlen !== 0) ? lato_vett_m_p.map(function (val) { return val / vlen; }) : [0, 0, 0];
            var norm_m_p = [0, 0, -1];
            celle_mag[s] = celle_mag_p;
            Sup_m[s] = Sup_m_p;
            l_m[s] = l_m_p;
            width_m[s] = width_m_p;
            vers_m[s] = vers_m_p;
            norm_m[s] = norm_m_p;
            lato_vett_m[s] = __spreadArray([], lato_vett_m_p, true);
            lati_m[0][s] = __spreadArray([], rp[m][n][o], true);
            lati_m[1][s] = __spreadArray([], rp[m][n + 1][o], true);
            s++;
            // Faccia IV 
            o = Npuntiz - 1;
            if (m === 0) {
                r1 = rp[m][n][o];
                r3 = rp[m][n + 1][o];
            }
            else {
                r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o][i]); });
                r3 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n + 1][o][i]); });
            }
            if (m === Npuntix - 1) {
                r2 = rp[m][n][o];
                r4 = rp[m][n + 1][o];
                lato_vett_m_p = [r4[0] - r2[0], r4[1] - r2[1], r4[2] - r2[2]];
            }
            else {
                r2 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o][i]); });
                r4 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n + 1][o][i]); });
            }
            // celle
            var celle_mag_p2 = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
            var Sup_m_p2 = (0, surfa_old_1.surfa_old)(celle_mag_p2, weights_five, roots_five);
            var l_m_p2 = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p2, 2));
            var width_m_p2 = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p2, 1));
            var vlen2 = (0, norm_1.norm)(lato_vett_m_p);
            var vers_m_p2 = (vlen2 !== 0) ? lato_vett_m_p.map(function (val) { return val / vlen2; }) : [0, 0, 0];
            var norm_m_p2 = [0, 0, 1]; // In MATLAB c’era un commento: cross(r2-r1, r3-r1)...
            celle_mag[s] = celle_mag_p2;
            Sup_m[s] = Sup_m_p2;
            l_m[s] = l_m_p2;
            width_m[s] = width_m_p2;
            vers_m[s] = vers_m_p2;
            norm_m[s] = norm_m_p2;
            lato_vett_m[s] = __spreadArray([], lato_vett_m_p, true);
            lati_m[0][s] = __spreadArray([], rp[m][n][o], true);
            lati_m[1][s] = __spreadArray([], rp[m][n + 1][o], true);
            s++;
        };
        for (var m = 0; m < Npuntix; m++) {
            _loop_10(m);
        }
    };
    //----------------------------------------------------------------------
    //                CELLE Y SUI PIANI XY
    //----------------------------------------------------------------------
    // In MATLAB: for n=1..Npuntiy-1, for m=1..Npuntix, ...
    // Faccia III (xy, z=zmin) e Faccia IV (xy, z=zmax)
    for (var n = 0; n < Npuntiy - 1; n++) {
        _loop_3(n);
    }
    var _loop_4 = function (m) {
        var _loop_11 = function (o) {
            // Faccia V (xz, y=ymin => n=1 => TS => n=0)
            var n = 0;
            var r1 = void 0, r2 = void 0, r3 = void 0, r4 = void 0;
            if (m === 0) {
                r1 = rp[m][n][o];
                r3 = rp[m][n][o + 1];
                lato_vett_m_p = [r3[0] - r1[0], r3[1] - r1[1], r3[2] - r1[2]];
            }
            else {
                r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o][i]); });
                r3 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o + 1][i]); });
            }
            if (m === Npuntix - 1) {
                r2 = rp[m][n][o];
                r4 = rp[m][n][o + 1];
                lato_vett_m_p = [r4[0] - r2[0], r4[1] - r2[1], r4[2] - r2[2]];
            }
            else {
                r2 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o][i]); });
                r4 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o + 1][i]); });
            }
            var celle_mag_p = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
            var Sup_m_p = (0, surfa_old_1.surfa_old)(celle_mag_p, weights_five, roots_five);
            // direzione 3 => z
            var l_m_p = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p, 3));
            var width_m_p = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p, 1));
            var vlen = (0, norm_1.norm)(lato_vett_m_p);
            var vers_m_p = (vlen !== 0) ? lato_vett_m_p.map(function (v) { return v / vlen; }) : [0, 0, 0];
            var norm_m_p = [0, -1, 0];
            celle_mag[s] = celle_mag_p;
            Sup_m[s] = Sup_m_p;
            l_m[s] = l_m_p;
            width_m[s] = width_m_p;
            vers_m[s] = vers_m_p;
            norm_m[s] = norm_m_p;
            lato_vett_m[s] = __spreadArray([], lato_vett_m_p, true);
            lati_m[0][s] = __spreadArray([], rp[m][n][o], true);
            lati_m[1][s] = __spreadArray([], rp[m][n][o + 1], true);
            s++;
            // Faccia VI (xz, y=ymax => n=Npuntiy => n=Npuntiy-1 in TS)
            n = Npuntiy - 1;
            if (m === 0) {
                r1 = rp[m][n][o];
                r3 = rp[m][n][o + 1];
                lato_vett_m_p = [r3[0] - r1[0], r3[1] - r1[1], r3[2] - r1[2]];
            }
            else {
                r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o][i]); });
                r3 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m - 1][n][o + 1][i]); });
            }
            if (m === Npuntix - 1) {
                r2 = rp[m][n][o];
                r4 = rp[m][n][o + 1];
                lato_vett_m_p = [r4[0] - r2[0], r4[1] - r2[1], r4[2] - r2[2]];
            }
            else {
                r2 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o][i]); });
                r4 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o + 1][i]); });
            }
            var celle_mag_p2 = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
            var Sup_m_p2 = (0, surfa_old_1.surfa_old)(celle_mag_p2, weights_five, roots_five);
            var l_m_p2 = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p2, 3));
            var width_m_p2 = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p2, 1));
            var vlen2 = (0, norm_1.norm)(lato_vett_m_p);
            var vers_m_p2 = (vlen2 !== 0) ? lato_vett_m_p.map(function (v) { return v / vlen2; }) : [0, 0, 0];
            var norm_m_p2 = [0, 1, 0];
            celle_mag[s] = celle_mag_p2;
            Sup_m[s] = Sup_m_p2;
            l_m[s] = l_m_p2;
            width_m[s] = width_m_p2;
            vers_m[s] = vers_m_p2;
            norm_m[s] = norm_m_p2;
            lato_vett_m[s] = __spreadArray([], lato_vett_m_p, true);
            lati_m[0][s] = __spreadArray([], rp[m][n][o], true);
            lati_m[1][s] = __spreadArray([], rp[m][n][o + 1], true);
            s++;
        };
        for (var o = 0; o < Npuntiz - 1; o++) {
            _loop_11(o);
        }
    };
    //----------------------------------------------------------------------
    //          CELLE Z SUI PIANI XZ
    //----------------------------------------------------------------------
    // MATLAB: for m=1..Npuntix, for o=1..Npuntiz-1, ...
    for (var m = 0; m < Npuntix; m++) {
        _loop_4(m);
    }
    var _loop_5 = function (o) {
        var _loop_12 = function (m) {
            // Faccia VII (xz, y=ymin => n=1 => TS => n=0)
            var n = 0;
            var r1 = void 0, r2 = void 0, r3 = void 0, r4 = void 0;
            if (o === 0) {
                r1 = rp[m][n][o];
                r2 = rp[m + 1][n][o];
                lato_vett_m_p = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
            }
            else {
                r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o - 1][i]); });
                r2 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o - 1][i]); });
            }
            if (o === Npuntiz - 1) {
                r3 = rp[m][n][o];
                r4 = rp[m + 1][n][o];
                lato_vett_m_p = [r4[0] - r3[0], r4[1] - r3[1], r4[2] - r3[2]];
            }
            else {
                r3 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o + 1][i]); });
                r4 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o + 1][i]); });
            }
            var celle_mag_p = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
            var Sup_m_p = (0, surfa_old_1.surfa_old)(celle_mag_p, weights_five, roots_five);
            var l_m_p = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p, 1));
            var width_m_p = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p, 3));
            var vlen = (0, norm_1.norm)(lato_vett_m_p);
            var vers_m_p = (vlen !== 0) ? lato_vett_m_p.map(function (v) { return v / vlen; }) : [0, 0, 0];
            var norm_m_p = [0, -1, 0];
            celle_mag[s] = celle_mag_p;
            Sup_m[s] = Sup_m_p;
            l_m[s] = l_m_p;
            width_m[s] = width_m_p;
            vers_m[s] = vers_m_p;
            norm_m[s] = norm_m_p;
            lato_vett_m[s] = __spreadArray([], lato_vett_m_p, true);
            lati_m[0][s] = __spreadArray([], rp[m][n][o], true);
            lati_m[1][s] = __spreadArray([], rp[m + 1][n][o], true);
            s++;
            // Faccia VIII (xz, y=ymax => n=Npuntiy => n=Npuntiy-1)
            n = Npuntiy - 1;
            if (o === 0) {
                r1 = rp[m][n][o];
                r2 = rp[m + 1][n][o];
                lato_vett_m_p = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
            }
            else {
                r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o - 1][i]); });
                r2 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o - 1][i]); });
            }
            if (o === Npuntiz - 1) {
                r3 = rp[m][n][o];
                r4 = rp[m + 1][n][o];
                lato_vett_m_p = [r4[0] - r3[0], r4[1] - r3[1], r4[2] - r3[2]];
            }
            else {
                r3 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o + 1][i]); });
                r4 = rp[m + 1][n][o].map(function (val, i) { return 0.5 * (val + rp[m + 1][n][o + 1][i]); });
            }
            var celle_mag_p2 = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
            var Sup_m_p2 = (0, surfa_old_1.surfa_old)(celle_mag_p2, weights_five, roots_five);
            var l_m_p2 = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p2, 1));
            var width_m_p2 = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p2, 3));
            var vlen2 = (0, norm_1.norm)(lato_vett_m_p);
            var vers_m_p2 = (vlen2 !== 0) ? lato_vett_m_p.map(function (v) { return v / vlen2; }) : [0, 0, 0];
            var norm_m_p2 = [0, 1, 0];
            celle_mag[s] = celle_mag_p2;
            Sup_m[s] = Sup_m_p2;
            l_m[s] = l_m_p2;
            width_m[s] = width_m_p2;
            vers_m[s] = vers_m_p2;
            norm_m[s] = norm_m_p2;
            lato_vett_m[s] = __spreadArray([], lato_vett_m_p, true);
            lati_m[0][s] = __spreadArray([], rp[m][n][o], true);
            lati_m[1][s] = __spreadArray([], rp[m + 1][n][o], true);
            s++;
        };
        for (var m = 0; m < Npuntix - 1; m++) {
            _loop_12(m);
        }
    };
    //----------------------------------------------------------------------
    //          CELLE X SUI PIANI XZ
    //----------------------------------------------------------------------
    // In MATLAB: for o=1..Npuntiz, for m=1..Npuntix-1
    // => TS: o=0..Npuntiz-1, m=0..Npuntix-2
    for (var o = 0; o < Npuntiz; o++) {
        _loop_5(o);
    }
    var _loop_6 = function (o) {
        var _loop_13 = function (n) {
            // Faccia IX (yz, x=xmin => m=1 => TS => m=0)
            var m = 0;
            var r1 = void 0, r2 = void 0, r3 = void 0, r4 = void 0;
            if (o === 0) {
                if (n === 0) {
                    r1 = rp[m][n][o];
                    r2 = rp[m][n + 1][o];
                    lato_vett_m_p = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
                }
                else {
                    r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o][i]); });
                    r2 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1 - 1][o][i]); });
                }
            }
            else {
                // if(o!=0)
                if (n === 0) {
                    r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o - 1][i]); });
                    r2 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o - 1][i]); });
                }
                else {
                    r1 = rp[m][n][o].map(function (val, i) {
                        return 0.25 * (val + rp[m][n - 1][o][i] + rp[m][n][o - 1][i] + rp[m][n - 1][o - 1][i]);
                    });
                    r2 = rp[m][n + 1][o].map(function (val, i) {
                        return 0.25 * (val + rp[m][n + 1 - 1][o][i] + rp[m][n + 1][o - 1][i] + rp[m][n + 1 - 1][o - 1][i]);
                    });
                }
            }
            if (o === Npuntiz - 1) {
                if (n === 0) {
                    r3 = rp[m][n][o];
                    r4 = rp[m][n + 1][o];
                    lato_vett_m_p = [r4[0] - r3[0], r4[1] - r3[1], r4[2] - r3[2]];
                }
                else {
                    r3 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o][i]); });
                    r4 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1 - 1][o][i]); });
                }
            }
            else {
                if (n === 0) {
                    r3 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o + 1][i]); });
                    r4 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o + 1][i]); });
                }
                else {
                    r3 = rp[m][n][o].map(function (val, i) {
                        return 0.25 * (val + rp[m][n - 1][o][i] + rp[m][n][o + 1][i] + rp[m][n - 1][o + 1][i]);
                    });
                    r4 = rp[m][n + 1][o].map(function (val, i) {
                        return 0.25 * (val + rp[m][n + 1 - 1][o][i] + rp[m][n + 1][o + 1][i] + rp[m][n + 1 - 1][o + 1][i]);
                    });
                }
            }
            var celle_mag_p = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
            var Sup_m_p = (0, surfa_old_1.surfa_old)(celle_mag_p, weights_five, roots_five);
            var l_m_p = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p, 1)); // direzione X
            var width_m_p = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p, 3)); // direzione Z
            var vlen = (0, norm_1.norm)(lato_vett_m_p);
            var vers_m_p = (vlen !== 0) ? lato_vett_m_p.map(function (v) { return v / vlen; }) : [0, 0, 0];
            var norm_m_p = [-1, 0, 0];
            celle_mag[s] = celle_mag_p;
            Sup_m[s] = Sup_m_p;
            l_m[s] = l_m_p;
            width_m[s] = width_m_p;
            vers_m[s] = vers_m_p;
            norm_m[s] = norm_m_p;
            lato_vett_m[s] = __spreadArray([], lato_vett_m_p, true);
            lati_m[0][s] = __spreadArray([], rp[m][n][o], true);
            lati_m[1][s] = __spreadArray([], rp[m][n + 1][o], true);
            s++;
            // Faccia X (yz, x=xmax => m=Npuntix => TS => m=Npuntix-1)
            m = Npuntix - 1;
            if (o === 0) {
                if (n === 0) {
                    r1 = rp[m][n][o];
                    r2 = rp[m][n + 1][o];
                    lato_vett_m_p = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
                }
                else {
                    r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o][i]); });
                    r2 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1 - 1][o][i]); });
                }
            }
            else {
                if (n === 0) {
                    r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o - 1][i]); });
                    r2 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o - 1][i]); });
                }
                else {
                    r1 = rp[m][n][o].map(function (val, i) {
                        return 0.25 * (val + rp[m][n - 1][o][i] + rp[m][n][o - 1][i] + rp[m][n - 1][o - 1][i]);
                    });
                    r2 = rp[m][n + 1][o].map(function (val, i) {
                        return 0.25 * (val + rp[m][n + 1 - 1][o][i] + rp[m][n + 1][o - 1][i] + rp[m][n + 1 - 1][o - 1][i]);
                    });
                }
            }
            if (o === Npuntiz - 1) {
                if (n === 0) {
                    r3 = rp[m][n][o];
                    r4 = rp[m][n + 1][o];
                    lato_vett_m_p = [r4[0] - r3[0], r4[1] - r3[1], r4[2] - r3[2]];
                }
                else {
                    r3 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o][i]); });
                    r4 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1 - 1][o][i]); });
                }
            }
            else {
                if (n === 0) {
                    r3 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n][o + 1][i]); });
                    r4 = rp[m][n + 1][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o + 1][i]); });
                }
                else {
                    r3 = rp[m][n][o].map(function (val, i) {
                        return 0.25 * (val + rp[m][n - 1][o][i] + rp[m][n][o + 1][i] + rp[m][n - 1][o + 1][i]);
                    });
                    r4 = rp[m][n + 1][o].map(function (val, i) {
                        return 0.25 * (val + rp[m][n + 1 - 1][o][i] + rp[m][n + 1][o + 1][i] + rp[m][n + 1 - 1][o + 1][i]);
                    });
                }
            }
            var celle_mag_p2 = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
            var Sup_m_p2 = (0, surfa_old_1.surfa_old)(celle_mag_p2, weights_five, roots_five);
            var l_m_p2 = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p2, 1));
            var width_m_p2 = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p2, 3));
            var vlen2 = (0, norm_1.norm)(lato_vett_m_p);
            var vers_m_p2 = (vlen2 !== 0) ? lato_vett_m_p.map(function (v) { return v / vlen2; }) : [0, 0, 0];
            var norm_m_p2 = [1, 0, 0];
            celle_mag[s] = celle_mag_p2;
            Sup_m[s] = Sup_m_p2;
            l_m[s] = l_m_p2;
            width_m[s] = width_m_p2;
            vers_m[s] = vers_m_p2;
            norm_m[s] = norm_m_p2;
            lato_vett_m[s] = __spreadArray([], lato_vett_m_p, true);
            lati_m[0][s] = __spreadArray([], rp[m][n][o], true);
            lati_m[1][s] = __spreadArray([], rp[m][n + 1][o], true);
            s++;
        };
        for (var n = 0; n < Npuntiy - 1; n++) {
            _loop_13(n);
        }
    };
    //----------------------------------------------------------------------
    //          CELLE Y SUI PIANI YZ
    //----------------------------------------------------------------------
    // In MATLAB: for o=1..Npuntiz, for n=1..Npuntiy-1
    for (var o = 0; o < Npuntiz; o++) {
        _loop_6(o);
    }
    var _loop_7 = function (n) {
        var _loop_14 = function (o) {
            // Faccia XI (yz, x=xmin => m=1 => TS => m=0)
            var m = 0;
            var r1 = void 0, r2 = void 0, r3 = void 0, r4 = void 0;
            if (n === 0) {
                r1 = rp[m][n][o];
                r2 = rp[m][n][o + 1];
                lato_vett_m_p = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
            }
            else {
                r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o][i]); });
                r2 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o + 1][i]); });
            }
            if (n === Npuntiy - 1) {
                r3 = rp[m][n][o];
                r4 = rp[m][n][o + 1];
                lato_vett_m_p = [r4[0] - r3[0], r4[1] - r3[1], r4[2] - r3[2]];
            }
            else {
                r3 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o][i]); });
                r4 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o + 1][i]); });
            }
            var celle_mag_p = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
            var Sup_m_p = (0, surfa_old_1.surfa_old)(celle_mag_p, weights_five, roots_five);
            var l_m_p = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p, 1));
            var width_m_p = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p, 2));
            var vlen = (0, norm_1.norm)(lato_vett_m_p);
            var vers_m_p = (vlen !== 0) ? lato_vett_m_p.map(function (v) { return v / vlen; }) : [0, 0, 0];
            var norm_m_p = [-1, 0, 0];
            celle_mag[s] = celle_mag_p;
            Sup_m[s] = Sup_m_p;
            l_m[s] = l_m_p;
            width_m[s] = width_m_p;
            vers_m[s] = vers_m_p;
            norm_m[s] = norm_m_p;
            lato_vett_m[s] = __spreadArray([], lato_vett_m_p, true);
            lati_m[0][s] = __spreadArray([], rp[m][n][o], true);
            lati_m[1][s] = __spreadArray([], rp[m][n][o + 1], true);
            s++;
            // Faccia XII (yz, x=xmax => m=Npuntix => TS => m=Npuntix-1)
            m = Npuntix - 1;
            if (n === 0) {
                r1 = rp[m][n][o];
                r2 = rp[m][n][o + 1];
                lato_vett_m_p = [r2[0] - r1[0], r2[1] - r1[1], r2[2] - r1[2]];
            }
            else {
                r1 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o][i]); });
                r2 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m][n - 1][o + 1][i]); });
            }
            if (n === Npuntiy - 1) {
                r3 = rp[m][n][o];
                r4 = rp[m][n][o + 1];
                lato_vett_m_p = [r4[0] - r3[0], r4[1] - r3[1], r4[2] - r3[2]];
            }
            else {
                r3 = rp[m][n][o].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o][i]); });
                r4 = rp[m][n][o + 1].map(function (val, i) { return 0.5 * (val + rp[m][n + 1][o + 1][i]); });
            }
            var celle_mag_p2 = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true);
            var Sup_m_p2 = (0, surfa_old_1.surfa_old)(celle_mag_p2, weights_five, roots_five);
            var l_m_p2 = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p2, 1));
            var width_m_p2 = Math.abs((0, mean_length_P_1.mean_length_P)(celle_mag_p2, 2));
            var vlen2 = (0, norm_1.norm)(lato_vett_m_p);
            var vers_m_p2 = (vlen2 !== 0) ? lato_vett_m_p.map(function (v) { return v / vlen2; }) : [0, 0, 0];
            var norm_m_p2 = [1, 0, 0];
            celle_mag[s] = celle_mag_p2;
            Sup_m[s] = Sup_m_p2;
            l_m[s] = l_m_p2;
            width_m[s] = width_m_p2;
            vers_m[s] = vers_m_p2;
            norm_m[s] = norm_m_p2;
            lato_vett_m[s] = __spreadArray([], lato_vett_m_p, true);
            lati_m[0][s] = __spreadArray([], rp[m][n][o], true);
            lati_m[1][s] = __spreadArray([], rp[m][n][o + 1], true);
            s++;
        };
        for (var o = 0; o < Npuntiz - 1; o++) {
            _loop_14(o);
        }
    };
    //----------------------------------------------------------------------
    //          CELLE Z SUI PIANI YZ
    //----------------------------------------------------------------------
    // in MATLAB: for n=1..Npuntiy, for o=1..Npuntiz-1 => TS => n=0..Npuntiy-1, o=0..Npuntiz-2
    for (var n = 0; n < Npuntiy; n++) {
        _loop_7(n);
    }
    // Infine ritorniamo i 7 array richiesti
    return {
        celle_mag: celle_mag,
        lati_m: lati_m,
        Sup_m: Sup_m,
        l_m: l_m,
        width_m: width_m,
        vers_m: vers_m,
        norm_m: norm_m
    };
}
