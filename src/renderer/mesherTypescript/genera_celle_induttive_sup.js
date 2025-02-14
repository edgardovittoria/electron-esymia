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
exports.genera_celle_induttive_sup = genera_celle_induttive_sup;
var genera_celle_magnetizzazione_sup_1 = require("./genera_celle_magnetizzazione_sup");
/**
 * In MATLAB, restituisce:
 *   - celle_mag (size1 x 12)
 *   - Sup_m, l_m, width_m (size2 x 1) => in TS gestite come array monodimensionale di length=size2
 *   - vers_m, norm_m (size1 x 3)
 */
function genera_celle_induttive_sup(rp, // shape [Npuntix][Npuntiy][Npuntiz][3]
Npuntix, Npuntiy, Npuntiz, weights_five, roots_five) {
    // 1) Calcolo size1 e size2
    var size1 = (Npuntiy - 1) * (Npuntix - 1) * 16
        + (Npuntiz - 1) * (Npuntix - 1) * 16
        + (Npuntiz - 1) * (Npuntiy - 1) * 16;
    var size2 = (Npuntiy - 1) * (Npuntix - 1) * 8
        + (Npuntiz - 1) * (Npuntix - 1) * 8
        + (Npuntiz - 1) * (Npuntiy - 1) * 8;
    // 2) Allocazione
    // celle_mag: 2D 
    var celle_mag = Array.from({ length: size1 }, function () { return new Array(12).fill(0); });
    // Sup_m, l_m, width_m: 1D di length size2
    var Sup_m = new Array(size2).fill(0);
    var l_m = new Array(size2).fill(0);
    var width_m = new Array(size2).fill(0);
    // vers_m, norm_m: 2D (size1 x 3)
    var vers_m = Array.from({ length: size1 }, function () { return [0, 0, 0]; });
    var norm_m = Array.from({ length: size1 }, function () { return [0, 0, 0]; });
    // 3)
    var start = 0; // per celle_mag, vers_m, norm_m (avanza di +8)
    var endC = 8;
    var start2 = 0; // per Sup_m, l_m, width_m (avanza di +4)
    var endC2 = 4;
    // 4) Funzione di supporto per "processFace", che incapsula la logica:
    function processFace(r_nodi_barra, faceType) {
        var _a = (0, genera_celle_magnetizzazione_sup_1.genera_celle_magnetizzazione_sup)(r_nodi_barra, weights_five, roots_five, faceType), celle_mag_p = _a.celle_mag_p, Sup_m_p = _a.Sup_m_p, l_m_p = _a.l_m_p, width_m_p = _a.width_m_p, vers_m_p = _a.vers_m_p, norm_m_p = _a.norm_m_p;
        // Copia i blocchi di 8 righe
        for (var i = 0; i < 8; i++) {
            celle_mag[start + i] = __spreadArray([], celle_mag_p[i], true); // shape (8 x 12)
            vers_m[start + i] = __spreadArray([], vers_m_p[i], true); // shape (8 x 3)
            norm_m[start + i] = __spreadArray([], norm_m_p[i], true); // shape (8 x 3)
        }
        // Copia i blocchi di 4 righe
        for (var j = 0; j < 4; j++) {
            Sup_m[start2 + j] = Sup_m_p[j];
            l_m[start2 + j] = l_m_p[j];
            width_m[start2 + j] = width_m_p[j];
        }
        start += 8;
        start2 += 4;
    }
    // 5) Cicli come in MATLAB
    // (A) xy_min / xy_max
    for (var n = 0; n < Npuntiy - 1; n++) {
        for (var m = 0; m < Npuntix - 1; m++) {
            // xy_min => o=0
            var o = 0;
            var r1 = rp[m][n][o];
            var r2 = rp[m + 1][n][o];
            var r3 = rp[m][n + 1][o];
            var r4 = rp[m + 1][n + 1][o];
            processFace([r1, r2, r3, r4], "xy_min");
            // xy_max => o=Npuntiz-1
            o = Npuntiz - 1;
            var r5 = rp[m][n][o];
            var r6 = rp[m + 1][n][o];
            var r7 = rp[m][n + 1][o];
            var r8 = rp[m + 1][n + 1][o];
            processFace([r5, r6, r7, r8], "xy_max");
        }
    }
    // (B) xz_min / xz_max
    for (var o = 0; o < Npuntiz - 1; o++) {
        for (var m = 0; m < Npuntix - 1; m++) {
            // xz_min => n=0
            var n = 0;
            var r1 = rp[m][n][o];
            var r2 = rp[m + 1][n][o];
            var r3 = rp[m][n][o + 1];
            var r4 = rp[m + 1][n][o + 1];
            processFace([r1, r2, r3, r4], "xz_min");
            // xz_max => n=Npuntiy-1
            n = Npuntiy - 1;
            var r5 = rp[m][n][o];
            var r6 = rp[m + 1][n][o];
            var r7 = rp[m][n][o + 1];
            var r8 = rp[m + 1][n][o + 1];
            processFace([r5, r6, r7, r8], "xz_max");
        }
    }
    // (C) yz_min / yz_max
    for (var n = 0; n < Npuntiy - 1; n++) {
        for (var o = 0; o < Npuntiz - 1; o++) {
            // yz_min => m=0
            var m = 0;
            var r1 = rp[m][n][o];
            var r2 = rp[m][n + 1][o];
            var r3 = rp[m][n][o + 1];
            var r4 = rp[m][n + 1][o + 1];
            processFace([r1, r2, r3, r4], "yz_min");
            // yz_max => m=Npuntix-1
            m = Npuntix - 1;
            var r5 = rp[m][n][o];
            var r6 = rp[m][n + 1][o];
            var r7 = rp[m][n][o + 1];
            var r8 = rp[m][n + 1][o + 1];
            processFace([r5, r6, r7, r8], "yz_max");
        }
    }
    // 6) Return final
    return {
        celle_mag: celle_mag, // (size1 x 12)
        Sup_m: Sup_m, // size2 monodimensionale
        l_m: l_m, // size2 monodimensionale
        width_m: width_m, // size2 monodimensionale
        vers_m: vers_m, // (size1 x 3)
        norm_m: norm_m,
    };
}
