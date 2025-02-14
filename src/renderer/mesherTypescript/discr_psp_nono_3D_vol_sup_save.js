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
exports.discr_psp_nono_3D_vol_sup_save = discr_psp_nono_3D_vol_sup_save;
var interpolating_vectors_1 = require("./interpolating_vectors");
var genera_celle_induttive_1 = require("./genera_celle_induttive");
var genera_superfici_celle_induttive_1 = require("./genera_superfici_celle_induttive");
var genera_celle_induttive_sup_1 = require("./genera_celle_induttive_sup");
var genera_celle_capacitive_new_sup_1 = require("./genera_celle_capacitive_new_sup");
var genera_celle_capacitive_maglie_save_1 = require("./genera_celle_capacitive_maglie_save");
var genera_celle_induttive_maglie_save_1 = require("./genera_celle_induttive_maglie_save");
var genera_celle_induttive_sup_maglie_save_1 = require("./genera_celle_induttive_sup_maglie_save");
var linspace_1 = require("./linspace");
/**
 *
 *  - Gestiamo `Sup_sup` come array **1D**
 *  - in MATLAB si farebbe `Sup_sup(contTot, 1:72)`, qui usiamo un indice lineare.
 *
 * Restituisce un oggetto con tutte le variabili di output:
 *  barra, celle_cap, celle_ind, celle_mag, lati, lati_m, vers, Nodi,
 *  spessore_i, Sup_c, Sup_i, Sup_m, l_i, l_c, l_m, width_i, width_c, width_m,
 *  dir_curr, vers_m, norm_m, celle_ind_sup, Sup_sup, indici_sup, normale_sup,
 *  dir_curr_sup, rc_sup, w_sup, NodiRed
 */
function discr_psp_nono_3D_vol_sup_save(xyz, Npuntix, Npuntiy, Npuntiz, discrUnif, weights_five, roots_five) {
    // ========== 1) Preallocazione variabili di output ==========
    var barra = [];
    var celle_cap = [];
    var celle_ind = [];
    var celle_mag = [];
    var lati = [[], []]; // in MATLAB: lati(1,:,:)=..., etc.
    var lati_m = [[], []];
    var vers = [];
    var Nodi = [];
    var spessore_i = [];
    var Sup_c = [];
    var Sup_i = [];
    var Sup_m = [];
    var l_i = [];
    var l_c = [];
    var l_m = [];
    var width_i = [];
    var width_c = [];
    var width_m = [];
    var dir_curr = [];
    var vers_m = [];
    var norm_m = [];
    var celle_ind_sup = [];
    var Sup_sup = [];
    var indici_sup = {
        x: [],
        y: [],
        z: []
    };
    var normale_sup = [];
    var dir_curr_sup = [];
    var rc_sup = [];
    var w_sup = [];
    var NodiRed = [];
    // ========== 2) Ricostruzione dei punti "ri" ==========
    var ri = [
        xyz.slice(0, 3),
        xyz.slice(3, 6),
        xyz.slice(6, 9),
        xyz.slice(9, 12),
        xyz.slice(12, 15),
        xyz.slice(15, 18),
        xyz.slice(18, 21),
        xyz.slice(21, 24)
    ];
    // ========== 3) Interpolating vectors ==========
    var _a = (0, interpolating_vectors_1.interpolating_vectors)(ri), rmi = _a.rmi, rai = _a.rai, rbi = _a.rbi, rci = _a.rci, rabi = _a.rabi, rbci = _a.rbci, raci = _a.raci, rabci = _a.rabci;
    // ========== 4) Creiamo a,b,c con linspace ==========
    var a = (0, linspace_1.linspace)(-1, 1, Npuntix);
    var b = (0, linspace_1.linspace)(-1, 1, Npuntiy);
    var c = (0, linspace_1.linspace)(-1, 1, Npuntiz);
    // ========== 5) Creazione rp (4D) ==========
    var rp = Array.from({ length: Npuntix }, function () {
        return Array.from({ length: Npuntiy }, function () {
            return Array.from({ length: Npuntiz }, function () { return Array(3).fill(0); });
        });
    });
    // Riempimento di rp
    for (var nn = 0; nn < Npuntiz; nn++) {
        for (var mm = 0; mm < Npuntiy; mm++) {
            for (var ll = 0; ll < Npuntix; ll++) {
                var ax = a[ll], bx = b[mm], cx = c[nn];
                var xyz3 = [
                    rmi[0] + rai[0] * ax + rbi[0] * bx + rci[0] * cx
                        + rabi[0] * ax * bx + rbci[0] * bx * cx + raci[0] * ax * cx + rabci[0] * ax * bx * cx,
                    rmi[1] + rai[1] * ax + rbi[1] * bx + rci[1] * cx
                        + rabi[1] * ax * bx + rbci[1] * bx * cx + raci[1] * ax * cx + rabci[1] * ax * bx * cx,
                    rmi[2] + rai[2] * ax + rbi[2] * bx + rci[2] * cx
                        + rabi[2] * ax * bx + rbci[2] * bx * cx + raci[2] * ax * cx + rabci[2] * ax * bx * cx
                ];
                rp[ll][mm][nn] = xyz3;
            }
        }
    }
    // ========== 6) Caso discretizzazione uniforme vs no ==========
    if (discrUnif) {
        // ---------- A) discrUnif = true ----------
        var sizeCicli = (Npuntiz - 1) * (Npuntiy - 1) * (Npuntix - 1);
        // Prealloc 
        var indici_celle_indx = new Array(4 * sizeCicli).fill(0);
        var indici_celle_indy = new Array(4 * sizeCicli).fill(0);
        var indici_celle_indz = new Array(4 * sizeCicli).fill(0);
        celle_ind = Array.from({ length: 12 * sizeCicli }, function () { return Array(24).fill(0); });
        var lati1 = Array.from({ length: 12 * sizeCicli }, function () { return [0, 0, 0]; });
        var lati2 = Array.from({ length: 12 * sizeCicli }, function () { return [0, 0, 0]; });
        vers = Array.from({ length: 12 * sizeCicli }, function () { return [0, 0, 0]; });
        l_i = new Array(12 * sizeCicli).fill(0);
        spessore_i = new Array(12 * sizeCicli).fill(0);
        Sup_i = new Array(12 * sizeCicli).fill(0);
        width_i = new Array(12 * sizeCicli).fill(0);
        dir_curr = new Array(12 * sizeCicli).fill(0);
        // Parte di superficie
        celle_ind_sup = Array.from({ length: 72 * sizeCicli }, function () { return Array(12).fill(0); });
        var indici_celle_ind_supx = new Array(24 * sizeCicli).fill(0);
        var indici_celle_ind_supy = new Array(24 * sizeCicli).fill(0);
        var indici_celle_ind_supz = new Array(24 * sizeCicli).fill(0);
        //  "Sup_sup" come 1D di lunghezza sizeCicli*72
        Sup_sup = new Array(sizeCicli * 72).fill(0);
        normale_sup = Array.from({ length: 72 * sizeCicli }, function () { return [0, 0, 0]; });
        dir_curr_sup = new Array(72 * sizeCicli).fill(0);
        rc_sup = Array.from({ length: 72 * sizeCicli }, function () { return [0, 0, 0]; });
        w_sup = new Array(72 * sizeCicli).fill(0);
        barra = Array.from({ length: sizeCicli }, function () { return Array(24).fill(0); });
        var contTot = 0;
        // Triplo loop su o, n, m
        for (var o = 0; o < Npuntiz - 1; o++) {
            for (var n = 0; n < Npuntiy - 1; n++) {
                for (var m = 0; m < Npuntix - 1; m++) {
                    contTot++;
                    // Calcolo r1..r43 come in MATLAB
                    var r1 = rp[m][n][o];
                    var r2 = rp[m + 1][n][o];
                    var r3 = rp[m][n + 1][o];
                    var r4 = rp[m + 1][n + 1][o];
                    var r5 = mid(rp[m][n][o], rp[m][n + 1][o]);
                    var r6 = mid(rp[m + 1][n][o], rp[m + 1][n + 1][o]);
                    var r7 = mid(rp[m][n][o], rp[m + 1][n][o]);
                    var r8 = mid(rp[m][n + 1][o], rp[m + 1][n + 1][o]);
                    var r9 = mid(r5, r6);
                    var r10 = rp[m][n][o + 1];
                    var r11 = rp[m + 1][n][o + 1];
                    var r12 = rp[m][n + 1][o + 1];
                    var r13 = rp[m + 1][n + 1][o + 1];
                    var r14 = mid(rp[m][n][o + 1], rp[m][n + 1][o + 1]);
                    var r15 = mid(rp[m + 1][n][o + 1], rp[m + 1][n + 1][o + 1]);
                    var r16 = mid(rp[m][n][o + 1], rp[m + 1][n][o + 1]);
                    var r17 = mid(rp[m][n + 1][o + 1], rp[m + 1][n + 1][o + 1]);
                    var r18 = mid(r14, r15);
                    var r19 = mid(r1, r10);
                    var r20 = mid(r7, r16);
                    var r21 = mid(r2, r11);
                    var r22 = mid(r6, r15);
                    var r23 = mid(r4, r13);
                    var r24 = mid(r8, r17);
                    var r25 = mid(r3, r12);
                    var r26 = mid(r5, r14);
                    var r27 = mid(r9, r18);
                    var r28 = mid(r1, r5);
                    var r29 = mid(r2, r6);
                    var r30 = mid(r5, r3);
                    var r31 = mid(r6, r4);
                    var r32 = mid(r10, r14);
                    var r33 = mid(r11, r15);
                    var r34 = mid(r14, r12);
                    var r35 = mid(r15, r13);
                    var r36 = mid(r7, r9);
                    var r37 = mid(r9, r8);
                    var r38 = mid(r16, r18);
                    var r39 = mid(r18, r17);
                    var r40 = mid(r28, r32);
                    var r41 = mid(r30, r34);
                    var r42 = mid(r21, r22);
                    var r43 = mid(r22, r23);
                    var r_nodi_barra = [
                        r1, r2, r3, r4, r5, r6, r7, r8, r9,
                        r10, r11, r12, r13, r14, r15, r16, r17, r18,
                        r19, r20, r21, r22, r23, r24, r25, r26, r27,
                        r28, r29, r30, r31, r32, r33, r34, r35, r36,
                        r37, r38, r39, r40, r41, r42, r43
                    ];
                    // genera_celle_induttive
                    var _b = (0, genera_celle_induttive_1.genera_celle_induttive)(r_nodi_barra), ci_p = _b.celle_ind, lati_p = _b.lati, vers_p = _b.vers, l_i_p = _b.l, idx_x_p = _b.indici_celle_indx, idx_y_p = _b.indici_celle_indy, idx_z_p = _b.indici_celle_indz, sp_i_p = _b.spessore, Sup_i_p = _b.Sup, w_i_p = _b.width, dir_c_p = _b.dir_curr;
                    // Salvataggio in celle_ind globale
                    var baseInd = (contTot - 1) * 12;
                    for (var k = 0; k < 12; k++) {
                        celle_ind[baseInd + k] = ci_p[k];
                        lati1[baseInd + k] = lati_p[0][k];
                        lati2[baseInd + k] = lati_p[1][k];
                        vers[baseInd + k] = vers_p[k];
                        l_i[baseInd + k] = l_i_p[k];
                        spessore_i[baseInd + k] = sp_i_p[k];
                        Sup_i[baseInd + k] = Sup_i_p[k];
                        width_i[baseInd + k] = w_i_p[k];
                        dir_curr[baseInd + k] = dir_c_p[k];
                    }
                    // Indici x,y,z (4 * sizeCicli)
                    var baseInd4 = (contTot - 1) * 4;
                    for (var k = 0; k < 4; k++) {
                        indici_celle_indx[baseInd4 + k] = idx_x_p[k];
                        indici_celle_indy[baseInd4 + k] = idx_y_p[k];
                        indici_celle_indz[baseInd4 + k] = idx_z_p[k];
                    }
                    // genera_superfici_celle_induttive
                    var _c = (0, genera_superfici_celle_induttive_1.genera_superfici_celle_induttive)(r_nodi_barra, weights_five, roots_five), cis_p = _c.celle_ind_sup, idx_supx_p = _c.indici_celle_ind_supx, idx_supy_p = _c.indici_celle_ind_supy, idx_supz_p = _c.indici_celle_ind_supz, Sup_sup_p = _c.Sup, // lunghezza 72
                    norm_sup_p = _c.normale, dir_sup_p = _c.dir_curr, w_sup_p = _c.w;
                    // Centro di ogni faccia
                    var rc_sup_p = [];
                    for (var k = 0; k < cis_p.length; k++) {
                        var row = cis_p[k];
                        var r1s = row.slice(0, 3), r2s = row.slice(3, 6), r3s = row.slice(6, 9), r4s = row.slice(9, 12);
                        var cx = 0.25 * (r1s[0] + r2s[0] + r3s[0] + r4s[0]);
                        var cy = 0.25 * (r1s[1] + r2s[1] + r3s[1] + r4s[1]);
                        var cz = 0.25 * (r1s[2] + r2s[2] + r3s[2] + r4s[2]);
                        rc_sup_p.push([cx, cy, cz]);
                    }
                    // Salviamo i dati in celle_ind_sup globale
                    var baseInd72 = (contTot - 1) * 72;
                    for (var k = 0; k < 72; k++) {
                        celle_ind_sup[baseInd72 + k] = cis_p[k];
                        normale_sup[baseInd72 + k] = norm_sup_p[k];
                        dir_curr_sup[baseInd72 + k] = dir_sup_p[k];
                        rc_sup[baseInd72 + k] = rc_sup_p[k];
                        w_sup[baseInd72 + k] = w_sup_p[k];
                    }
                    // Indici superfici
                    var baseInd24 = (contTot - 1) * 24;
                    for (var k = 0; k < 24; k++) {
                        indici_celle_ind_supx[baseInd24 + k] = idx_supx_p[k];
                        indici_celle_ind_supy[baseInd24 + k] = idx_supy_p[k];
                        indici_celle_ind_supz[baseInd24 + k] = idx_supz_p[k];
                    }
                    // Ora salviamo i 72 valori di sup in una posizione lineare
                    // in MATLAB si faceva `Sup_sup(contTot, :) = Sup_sup_p`
                    // qui:
                    var offsetSup = (contTot - 1) * 72;
                    for (var k = 0; k < 72; k++) {
                        Sup_sup[offsetSup + k] = Sup_sup_p[k];
                    }
                    // Salvataggio di "barra(contTot,:) = [r1 r2 r3 r4 r10 r11 r12 r13]"
                    barra[contTot - 1] = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], r1, true), r2, true), r3, true), r4, true), r10, true), r11, true), r12, true), r13, true);
                }
            }
        }
        // Riempio la struct indici_sup
        indici_sup.x = indici_celle_indx;
        indici_sup.y = indici_celle_indy;
        indici_sup.z = indici_celle_indz;
        // Ora genera_celle_induttive_sup
        var _d = (0, genera_celle_induttive_sup_1.genera_celle_induttive_sup)(rp, Npuntix, Npuntiy, Npuntiz, weights_five, roots_five), cm = _d.celle_mag, sm = _d.Sup_m, lm = _d.l_m, wm = _d.width_m, vm = _d.vers_m, nm = _d.norm_m;
        celle_mag = cm;
        Sup_m = sm;
        l_m = lm;
        width_m = wm;
        vers_m = vm;
        norm_m = nm;
        // Celle capacitive di superficie
        var size1 = (Npuntiy - 1) * (Npuntix - 1) * 16
            + (Npuntiz - 1) * (Npuntix - 1) * 16
            + (Npuntiz - 1) * (Npuntiy - 1) * 16;
        var size2 = (Npuntiy - 1) * (Npuntix - 1) * 8
            + (Npuntiz - 1) * (Npuntix - 1) * 8
            + (Npuntiz - 1) * (Npuntiy - 1) * 8;
        celle_cap = Array.from({ length: size1 }, function () { return Array(12).fill(0); });
        Sup_c = new Array(size2).fill(0);
        l_c = new Array(size2).fill(0);
        width_c = new Array(size2).fill(0);
        Nodi = Array.from({ length: size1 }, function () { return [0, 0, 0]; });
        var start_1 = 0;
        var start2_1 = 0;
        // Funzione di servizio
        function copyCelleCap(cc, Nd, sc, lc, wc) {
            // 8 celle e 4 param
            for (var i = 0; i < 8; i++) {
                celle_cap[start_1 + i] = cc[i];
                Nodi[start_1 + i] = Nd[i];
            }
            for (var j = 0; j < 4; j++) {
                Sup_c[start2_1 + j] = sc[j];
                l_c[start2_1 + j] = lc[j];
                width_c[start2_1 + j] = wc[j];
            }
            start_1 += 8;
            start2_1 += 4;
        }
        // Face I, II (xy)
        for (var n = 0; n < Npuntiy - 1; n++) {
            for (var m = 0; m < Npuntix - 1; m++) {
                // z=zmin
                var o = 0;
                var r1 = rp[m][n][o], r2 = rp[m + 1][n][o];
                var r3 = rp[m][n + 1][o], r4 = rp[m + 1][n + 1][o];
                {
                    var _e = (0, genera_celle_capacitive_new_sup_1.genera_celle_capacitive_new_sup)([r1, r2, r3, r4], weights_five, roots_five), cc = _e.celle_cap, Nd = _e.Nodi, sc = _e.Sup_c, lc = _e.l_c, wc = _e.width_c;
                    copyCelleCap(cc, Nd, sc, lc, wc);
                }
                // z=zmax
                o = Npuntiz - 1;
                var r1b = rp[m][n][o], r2b = rp[m + 1][n][o];
                var r3b = rp[m][n + 1][o], r4b = rp[m + 1][n + 1][o];
                {
                    var _f = (0, genera_celle_capacitive_new_sup_1.genera_celle_capacitive_new_sup)([r1b, r2b, r3b, r4b], weights_five, roots_five), cc2 = _f.celle_cap, Nd2 = _f.Nodi, sc2 = _f.Sup_c, lc2 = _f.l_c, wc2 = _f.width_c;
                    copyCelleCap(cc2, Nd2, sc2, lc2, wc2);
                }
            }
        }
        // Face III, IV (xz)
        for (var o = 0; o < Npuntiz - 1; o++) {
            for (var m = 0; m < Npuntix - 1; m++) {
                // y=ymin
                var n = 0;
                var r1 = rp[m][n][o], r2 = rp[m + 1][n][o];
                var r3 = rp[m][n][o + 1], r4 = rp[m + 1][n][o + 1];
                {
                    var _g = (0, genera_celle_capacitive_new_sup_1.genera_celle_capacitive_new_sup)([r1, r2, r3, r4], weights_five, roots_five), cc = _g.celle_cap, Nd = _g.Nodi, sc = _g.Sup_c, lc = _g.l_c, wc = _g.width_c;
                    copyCelleCap(cc, Nd, sc, lc, wc);
                }
                // y=ymax
                n = Npuntiy - 1;
                var r1b = rp[m][n][o], r2b = rp[m + 1][n][o];
                var r3b = rp[m][n][o + 1], r4b = rp[m + 1][n][o + 1];
                {
                    var _h = (0, genera_celle_capacitive_new_sup_1.genera_celle_capacitive_new_sup)([r1b, r2b, r3b, r4b], weights_five, roots_five), cc2 = _h.celle_cap, Nd2 = _h.Nodi, sc2 = _h.Sup_c, lc2 = _h.l_c, wc2 = _h.width_c;
                    copyCelleCap(cc2, Nd2, sc2, lc2, wc2);
                }
            }
        }
        // Face V, VI (yz)
        for (var n = 0; n < Npuntiy - 1; n++) {
            for (var o = 0; o < Npuntiz - 1; o++) {
                // x=xmin
                var m = 0;
                var r1 = rp[m][n][o], r2 = rp[m][n + 1][o];
                var r3 = rp[m][n][o + 1], r4 = rp[m][n + 1][o + 1];
                {
                    var _j = (0, genera_celle_capacitive_new_sup_1.genera_celle_capacitive_new_sup)([r1, r2, r3, r4], weights_five, roots_five), cc = _j.celle_cap, Nd = _j.Nodi, sc = _j.Sup_c, lc = _j.l_c, wc = _j.width_c;
                    copyCelleCap(cc, Nd, sc, lc, wc);
                }
                // x=xmax
                m = Npuntix - 1;
                var r1b = rp[m][n][o], r2b = rp[m][n + 1][o];
                var r3b = rp[m][n][o + 1], r4b = rp[m][n + 1][o + 1];
                {
                    var _k = (0, genera_celle_capacitive_new_sup_1.genera_celle_capacitive_new_sup)([r1b, r2b, r3b, r4b], weights_five, roots_five), cc2 = _k.celle_cap, Nd2 = _k.Nodi, sc2 = _k.Sup_c, lc2 = _k.l_c, wc2 = _k.width_c;
                    copyCelleCap(cc2, Nd2, sc2, lc2, wc2);
                }
            }
        }
        // Riduzione dei nodi capacitivi
        var NumNodiCap = Nodi.length;
        var targetSize = Npuntix * Npuntiy * Npuntiz - (Npuntix - 2) * (Npuntiy - 2) * (Npuntiz - 2);
        NodiRed = Array.from({ length: targetSize }, function () { return [0, 0, 0]; });
        if (NumNodiCap > 1) {
            // Copia del primo
            NodiRed[0] = __spreadArray([], Nodi[0], true);
            var nodoAct = 1;
            for (var k = 1; k < NumNodiCap; k++) {
                var cand = Nodi[k];
                var found = -1;
                for (var i = 0; i < nodoAct; i++) {
                    var dx = Math.abs(NodiRed[i][0] - cand[0]);
                    var dy = Math.abs(NodiRed[i][1] - cand[1]);
                    var dz = Math.abs(NodiRed[i][2] - cand[2]);
                    if (dx <= 1e-11 && dy <= 1e-11 && dz <= 1e-11) {
                        found = i;
                        break;
                    }
                }
                if (found < 0) {
                    NodiRed[nodoAct] = __spreadArray([], cand, true);
                    nodoAct++;
                }
            }
            NodiRed.splice(nodoAct);
        }
        else {
            if (NumNodiCap === 1) {
                NodiRed[0] = __spreadArray([], Nodi[0], true);
                NodiRed.splice(1);
            }
            else {
                NodiRed.splice(0);
            }
        }
    }
    else {
        // ---------- B) caso discrUnif = false ----------
        // => usiamo genera_celle_induttive_maglie_save
        var ret1 = (0, genera_celle_induttive_maglie_save_1.genera_celle_induttive_maglie_save)(rp, Npuntix, Npuntiy, Npuntiz, weights_five, roots_five);
        celle_ind = ret1.celle_ind;
        lati = ret1.lati;
        vers = ret1.vers;
        l_i = ret1.l;
        spessore_i = ret1.spessore;
        Sup_i = ret1.Sup;
        width_i = ret1.width;
        dir_curr = ret1.dir_curr;
        celle_ind_sup = ret1.celle_ind_sup;
        rc_sup = ret1.rc_sup;
        Sup_sup = ret1.Sup_sup; // <-- qui assumiamo che ret1.Sup_sup SIA 1D
        normale_sup = ret1.normale_sup;
        dir_curr_sup = ret1.dir_curr_sup;
        w_sup = ret1.w_sup;
        barra = ret1.barra;
        indici_sup.x = ret1.indici_celle_ind_supx;
        indici_sup.y = ret1.indici_celle_ind_supy;
        indici_sup.z = ret1.indici_celle_ind_supz;
        var ret2 = (0, genera_celle_induttive_sup_maglie_save_1.genera_celle_induttive_sup_maglie_save)(rp, Npuntix, Npuntiy, Npuntiz, weights_five, roots_five);
        celle_mag = ret2.celle_mag;
        lati_m = ret2.lati_m;
        Sup_m = ret2.Sup_m;
        l_m = ret2.l_m;
        width_m = ret2.width_m;
        vers_m = ret2.vers_m;
        norm_m = ret2.norm_m;
        var ret3 = (0, genera_celle_capacitive_maglie_save_1.genera_celle_capacitive_maglie_save)(rp, Npuntix, Npuntiy, Npuntiz, weights_five, roots_five);
        celle_cap = ret3.celle_cap;
        Nodi = ret3.Nodi;
        Sup_c = ret3.Sup_c;
        l_c = ret3.l_c;
        width_c = ret3.width_c;
        NodiRed = ret3.NodiRed;
    }
    // ========== 7) Return di tutte le variabili ==========
    return {
        barra: barra,
        celle_cap: celle_cap,
        celle_ind: celle_ind,
        celle_mag: celle_mag,
        lati: lati,
        lati_m: lati_m,
        vers: vers,
        Nodi: Nodi,
        spessore_i: spessore_i,
        Sup_c: Sup_c,
        Sup_i: Sup_i,
        Sup_m: Sup_m,
        l_i: l_i,
        l_c: l_c,
        l_m: l_m,
        width_i: width_i,
        width_c: width_c,
        width_m: width_m,
        dir_curr: dir_curr,
        vers_m: vers_m,
        norm_m: norm_m,
        celle_ind_sup: celle_ind_sup,
        Sup_sup: Sup_sup,
        indici_sup: indici_sup,
        normale_sup: normale_sup,
        dir_curr_sup: dir_curr_sup,
        rc_sup: rc_sup,
        w_sup: w_sup,
        NodiRed: NodiRed
    };
}
/**
 * Funzione di supporto per calcolare la media di due vettori 3D
 * corrisponde a 0.5*(v1 + v2).
 */
function mid(v1, v2) {
    return [
        0.5 * (v1[0] + v2[0]),
        0.5 * (v1[1] + v2[1]),
        0.5 * (v1[2] + v2[2])
    ];
}
