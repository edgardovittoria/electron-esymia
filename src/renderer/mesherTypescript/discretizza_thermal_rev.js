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
exports.discretizza_thermal_rev = discretizza_thermal_rev;
var discr_psp_nono_3D_vol_sup_save_1 = require("./discr_psp_nono_3D_vol_sup_save");
var genera_nodi_interni_rev_1 = require("./genera_nodi_interni_rev");
var genera_nodi_interni_merged_non_ort_1 = require("./genera_nodi_interni_merged_non_ort");
var genera_estremi_lati_per_oggetto_rev_1 = require("./genera_estremi_lati_per_oggetto_rev");
var elimina_patches_interni_thermal_save_1 = require("./elimina_patches_interni_thermal_save");
var FindInternalNodesCommon2FourObjects_rev_1 = require("./FindInternalNodesCommon2FourObjects_rev");
var matrice_incidenza_rev_1 = require("./matrice_incidenza_rev");
var genera_dati_Z_sup_1 = require("./genera_dati_Z_sup");
var round_ud_1 = require("./round_ud");
var math = require("mathjs");
/**
 * Porting di `creaVersore(barra, dir_curr)` da MATLAB a TypeScript.
 *
 * In MATLAB:
 *   function [l,w,t,S,vers] = creaVersore(barra, dir_curr)
 *
 
 *
 * Restituisce 5 valori:
 *   - l, w, t (le dimensioni principali)
 *   - S = w * t
 *   - vers = versore (un vettore 3D normalizzato)
 */
function creaVersore(barra, // lunghezza 24
dir_curr) {
    // Helper: somma 1/4 di alcuni indici di `barra` (0-based)
    // Perché in MATLAB si fa: x1=1/4*sum(barra([1 7 13 19])), 
    //   ma lì è 1-based => [0,6,12,18] in TS
    function quarterSum(indices) {
        var s = 0;
        for (var _i = 0, indices_1 = indices; _i < indices_1.length; _i++) {
            var idx = indices_1[_i];
            s += barra[idx];
        }
        return s * 0.25;
    }
    // Norma di un vettore 3D
    function norm3(v) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    }
    // Restituiamo l, w, t, S, vers
    var l = 0, w = 0, t = 0, S = 0;
    var vers = [0, 0, 0];
    if (dir_curr === 1) {
        // =============== CASE dir_curr==1 ===============
        // 1) Calcolo x1..z2 => definisce v1..v2 => vers => l
        var x1 = quarterSum([0, 6, 12, 18]); // => MATLAB [1 7 13 19]
        var x2 = quarterSum([3, 9, 15, 21]); // => MATLAB [4 10 16 22]
        var y1 = quarterSum([1, 7, 13, 19]); // => MATLAB [2 8 14 20]
        var y2 = quarterSum([4, 10, 16, 22]); // => MATLAB [5 11 17 23]
        var z1 = quarterSum([2, 8, 14, 20]); // => MATLAB [3 9 15 21]
        var z2 = quarterSum([5, 11, 17, 23]); // => MATLAB [6 12 18 24]
        var v1 = [x1, y1, z1];
        var v2 = [x2, y2, z2];
        // %     pos=find(min(x1,x2)==[x1 x2]);
        // %     if(pos(1)==2)
        // %         v2=[x1 y1 z1];
        // %         v1=[x2 y2 z2];
        // %     end
        var dv = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
        var dvNorm_1 = norm3(dv);
        vers = dv.map(function (val) { return val / dvNorm_1; });
        l = dvNorm_1;
        // 2) Calcolo x1..z2 => definisce w
        var x1b = quarterSum([0, 3, 12, 15]); // => MATLAB [1 4 13 16]
        var x2b = quarterSum([6, 9, 18, 21]); // => MATLAB [7 10 19 22]
        var y1b = quarterSum([1, 4, 13, 16]); // => MATLAB [2 5 14 17]
        var y2b = quarterSum([7, 10, 19, 22]); // => MATLAB [8 11 20 23]
        var z1b = quarterSum([2, 5, 14, 17]); // => MATLAB [3 6 15 18]
        var z2b = quarterSum([8, 11, 20, 23]); // => MATLAB [9 12 21 24]
        v1 = [x1b, y1b, z1b];
        v2 = [x2b, y2b, z2b];
        // ...
        var dvb = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
        w = norm3(dvb);
        // 3) Calcolo t => ultima slice
        var x1c = quarterSum([0, 3, 6, 9]); // => MATLAB [1 4 7 10]
        var x2c = quarterSum([12, 15, 18, 21]); // => MATLAB [13 16 19 22]
        var y1c = quarterSum([1, 4, 7, 10]); // => MATLAB [2 5 8 11]
        var y2c = quarterSum([13, 16, 19, 22]); // => MATLAB [14 17 20 23]
        var z1c = quarterSum([2, 5, 8, 11]); // => MATLAB [3 6 9 12]
        var z2c = quarterSum([14, 17, 20, 23]); // => MATLAB [15 18 21 24]
        v1 = [x1c, y1c, z1c];
        v2 = [x2c, y2c, z2c];
        var dvc = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
        t = norm3(dvc);
        S = w * t;
    }
    else if (dir_curr === 2) {
        // =============== CASE dir_curr==2 ===============
        // 1) x1..z2 => definisce t
        var x1 = quarterSum([0, 6, 12, 18]);
        var x2 = quarterSum([3, 9, 15, 21]);
        var y1 = quarterSum([1, 7, 13, 19]);
        var y2 = quarterSum([4, 10, 16, 22]);
        var z1 = quarterSum([2, 8, 14, 20]);
        var z2 = quarterSum([5, 11, 17, 23]);
        var v1 = [x1, y1, z1];
        var v2 = [x2, y2, z2];
        var dv = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
        t = norm3(dv);
        // 2) x1..z2 => definisce vers => l
        var x1b = quarterSum([0, 3, 12, 15]);
        var x2b = quarterSum([6, 9, 18, 21]);
        var y1b = quarterSum([1, 4, 13, 16]);
        var y2b = quarterSum([7, 10, 19, 22]);
        var z1b = quarterSum([2, 5, 14, 17]);
        var z2b = quarterSum([8, 11, 20, 23]);
        v1 = [x1b, y1b, z1b];
        v2 = [x2b, y2b, z2b];
        var dvb = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
        var dvbNorm_1 = norm3(dvb);
        vers = dvb.map(function (val) { return val / dvbNorm_1; });
        l = dvbNorm_1;
        // 3) x1..z2 => definisce w => S
        var x1c = quarterSum([0, 3, 6, 9]);
        var x2c = quarterSum([12, 15, 18, 21]);
        var y1c = quarterSum([1, 4, 7, 10]);
        var y2c = quarterSum([13, 16, 19, 22]);
        var z1c = quarterSum([2, 5, 8, 11]);
        var z2c = quarterSum([14, 17, 20, 23]);
        v1 = [x1c, y1c, z1c];
        v2 = [x2c, y2c, z2c];
        var dvc = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
        w = norm3(dvc);
        S = w * t;
    }
    else {
        // =============== CASE dir_curr==3 ===============
        // 1) x1..z2 => definisce t
        var x1 = quarterSum([0, 6, 12, 18]);
        var x2 = quarterSum([3, 9, 15, 21]);
        var y1 = quarterSum([1, 7, 13, 19]);
        var y2 = quarterSum([4, 10, 16, 22]);
        var z1 = quarterSum([2, 8, 14, 20]);
        var z2 = quarterSum([5, 11, 17, 23]);
        var v1 = [x1, y1, z1];
        var v2 = [x2, y2, z2];
        var dv = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
        t = norm3(dv);
        // 2) definisce w
        var x1b = quarterSum([0, 3, 12, 15]);
        var x2b = quarterSum([6, 9, 18, 21]);
        var y1b = quarterSum([1, 4, 13, 16]);
        var y2b = quarterSum([7, 10, 19, 22]);
        var z1b = quarterSum([2, 5, 14, 17]);
        var z2b = quarterSum([8, 11, 20, 23]);
        v1 = [x1b, y1b, z1b];
        v2 = [x2b, y2b, z2b];
        var dvb = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
        w = norm3(dvb);
        // 3) definisce vers => l => S
        var x1c = quarterSum([0, 3, 6, 9]);
        var x2c = quarterSum([12, 15, 18, 21]);
        var y1c = quarterSum([1, 4, 7, 10]);
        var y2c = quarterSum([13, 16, 19, 22]);
        var z1c = quarterSum([2, 5, 8, 11]);
        var z2c = quarterSum([14, 17, 20, 23]);
        v1 = [x1c, y1c, z1c];
        v2 = [x2c, y2c, z2c];
        var dvc = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
        var dvcNorm_1 = norm3(dvc);
        vers = dvc.map(function (val) { return val / dvcNorm_1; });
        l = dvcNorm_1;
        S = w * t;
    }
    // Restituiamo [l, w, t, S, vers]
    return [l, w, t, S, vers];
}
function discretizza_thermal_rev(Regioni, materials) {
    console.log("Start discretization");
    var weights_five = [
        0.236926885, 0.4786286705, 0.5688888889, 0.4786286705, 0.236926885,
    ];
    var roots_five = [
        0.9061798459, 0.5384693101, 0.0, -0.5384693101, -0.9061798459,
    ];
    //Inizializzo l'oggetto Regioni
    Regioni.vertici = [];
    for (var k = 0; k < Regioni.coordinate.length; k++) {
        Regioni.vertici[k] = [];
        for (var i = 0; i < 8; i++) {
            Regioni.vertici[k][i] = Regioni.coordinate[k].slice(i * 3, (i + 1) * 3);
        }
    }
    Regioni.spigoli = [];
    for (var k = 0; k < Regioni.coordinate.length; k++) {
        Regioni.spigoli[k] = [];
        // p1-p2
        Regioni.spigoli[k][0] = [Regioni.coordinate[k].slice(0, 3), Regioni.coordinate[k].slice(3, 6)];
        // p3-p4
        Regioni.spigoli[k][1] = [Regioni.coordinate[k].slice(6, 9), Regioni.coordinate[k].slice(9, 12)];
        // p1-p3
        Regioni.spigoli[k][2] = [Regioni.coordinate[k].slice(0, 3), Regioni.coordinate[k].slice(6, 9)];
        // p2-p4
        Regioni.spigoli[k][3] = [Regioni.coordinate[k].slice(3, 6), Regioni.coordinate[k].slice(9, 12)];
        // p5-p6
        Regioni.spigoli[k][4] = [Regioni.coordinate[k].slice(12, 15), Regioni.coordinate[k].slice(15, 18)];
        // p7-p8
        Regioni.spigoli[k][5] = [Regioni.coordinate[k].slice(18, 21), Regioni.coordinate[k].slice(21, 24)];
        // p5-p7
        Regioni.spigoli[k][6] = [Regioni.coordinate[k].slice(12, 15), Regioni.coordinate[k].slice(18, 21)];
        // p6-p8
        Regioni.spigoli[k][7] = [Regioni.coordinate[k].slice(15, 18), Regioni.coordinate[k].slice(21, 24)];
        // p1-p5
        Regioni.spigoli[k][8] = [Regioni.coordinate[k].slice(0, 3), Regioni.coordinate[k].slice(12, 15)];
        // p2-p6
        Regioni.spigoli[k][9] = [Regioni.coordinate[k].slice(3, 6), Regioni.coordinate[k].slice(15, 18)];
        // p3-p7
        Regioni.spigoli[k][10] = [Regioni.coordinate[k].slice(6, 9), Regioni.coordinate[k].slice(18, 21)];
        // p4-p8
        Regioni.spigoli[k][11] = [Regioni.coordinate[k].slice(9, 12), Regioni.coordinate[k].slice(21, 24)];
    }
    var celle_mag = [];
    var barra = [];
    var nodi = {
        estremi_celle: [],
        centri: [],
        l: [],
        w: [],
        S_non_rid: [],
        sigma: [],
        epsr: [],
        mur: [],
        num_nodi_interni: 0,
        nodi_i: [],
        nodi_interni: [],
        potenziali: [],
        centri_non_rid: [],
        normale: [],
        nodi_esterni_coordinate: [],
        nodi_interni_coordinate: [],
        num_nodi_esterni: 0,
        Rv: math.sparse([]),
        centri_sup_non_rid: [],
        InternalNodesCommon2FourObjects: [],
        superfici: [],
        nodi_esterni: [],
        materials: [],
    };
    var induttanze = {
        estremi_celle: [],
        versori: [],
        coordinate: [],
        t: [],
        S: [],
        l: [],
        w: [],
        indici: { x: [], y: [], z: [] },
        dir_curr: [],
        epsr: [],
        sigma: [],
        celle_ind_per_oggetto: [],
        estremi_lati_oggetti: [],
        facce_estremi_celle: [],
        facce_superfici: [],
        facce_normale: [],
        facce_dir_curr_sup: [],
        facce_centri: [],
        facce_w: [],
        facce_indici_associazione: [],
        celle_superficie_w: [],
        celle_superficie_l: [],
        celle_superficie_estremi_celle: [],
        centri: [],
        estremi_lati: [],
        Zs_part: []
    };
    var celle_sup = [];
    var vers_m = [];
    var norm_m = [];
    var NodiRed = [];
    var l_m = [];
    var width_m = [];
    var sup_celle_sup = [];
    var sigma_c = [];
    var mu_m = [];
    var mu_m_eq = [];
    var objects = [];
    var lati_m = [];
    var celle_ind_sup = [];
    var Sup_sup = [];
    var normale_sup = [];
    var dir_curr_sup = [];
    var rc_sup = [];
    var w_sup = [];
    var indici_sup = {
        x: [],
        y: [],
        z: [],
    };
    var sup_celle_mag = [];
    var discrUnif = 0;
    var lati1 = [];
    var lati2 = [];
    var _loop_1 = function (k) {
        var _c = (0, discr_psp_nono_3D_vol_sup_save_1.discr_psp_nono_3D_vol_sup_save)(Regioni.coordinate[k], Regioni.Nx[k], Regioni.Ny[k], Regioni.Nz[k], discrUnif !== 0, weights_five, roots_five), barra_k = _c.barra, celle_cap_k = _c.celle_cap, celle_ind_k = _c.celle_ind, celle_sup_k = _c.celle_mag, lati_k = _c.lati, lati_m_k = _c.lati_m, vers_k = _c.vers, Nodi_k = _c.Nodi, spessore_i_k = _c.spessore_i, sup_celle_cap_k = _c.Sup_c, sup_celle_ind_k = _c.Sup_i, sup_celle_sup_k = _c.Sup_m, l_i_k = _c.l_i, l_c_k = _c.l_c, l_m_k = _c.l_m, width_i_k = _c.width_i, width_c_k = _c.width_c, width_m_k = _c.width_m, dir_curr_k = _c.dir_curr, vers_m_k = _c.vers_m, norm_m_k = _c.norm_m, celle_ind_sup_k = _c.celle_ind_sup, Sup_sup_k = _c.Sup_sup, indici_sup_k = _c.indici_sup, normale_sup_k = _c.normale_sup, dir_curr_sup_k = _c.dir_curr_sup, rc_sup_k = _c.rc_sup, w_sup_k = _c.w_sup, NodiRed_k = _c.NodiRed;
        if (k === 0) {
            induttanze.celle_ind_per_oggetto[k] = Array.from({ length: lati_k[0].length }, function (_, i) { return i; });
        }
        else {
            induttanze.celle_ind_per_oggetto[k] = Array.from({ length: lati_k[0].length }, function (_, i) { return induttanze.celle_ind_per_oggetto[k - 1][induttanze.celle_ind_per_oggetto[k - 1].length - 1] + 1 + i; });
        }
        var Nodi_interni = (0, genera_nodi_interni_rev_1.genera_nodi_interni_rev)(Regioni.coordinate[k], Regioni.Nx[k], Regioni.Ny[k], Regioni.Nz[k]);
        nodi.num_nodi_interni += Nodi_interni.length;
        nodi.nodi_i = __spreadArray(__spreadArray([], nodi.nodi_i, true), Nodi_interni, true);
        var Nodi_interni_m = (0, genera_nodi_interni_merged_non_ort_1.genera_nodi_interni_merged_non_ort)(Regioni, Nodi_k, k, nodi.nodi_i);
        for (var conta = 0; conta < celle_ind_k.length; conta++) {
            // Destruttura l'output di creaVersore, gestendo i singoli valori
            var _d = creaVersore(celle_ind_k[conta], dir_curr_k[conta]), l_i_k_conta = _d[0], width_i_k_conta = _d[1], spessore_i_k_conta = _d[2], sup_celle_ind_k_conta = _d[3], vers_k_conta = _d[4];
            // Usa round_ud_singolo per arrotondare i singoli numeri
            l_i_k[conta] = round_ud_singolo(l_i_k_conta, 12);
            width_i_k[conta] = round_ud_singolo(width_i_k_conta, 12);
            spessore_i_k[conta] = round_ud_singolo(spessore_i_k_conta, 12);
            sup_celle_ind_k[conta] = round_ud_singolo(sup_celle_ind_k_conta, 12);
            // Per vers_k_conta, che è un array, usa la round_ud definita nel file round_ud.ts
            vers_k[conta] = (0, round_ud_1.round_ud)(vers_k_conta, 12);
        }
        nodi.num_nodi_interni += Nodi_interni_m.length;
        nodi.nodi_i = __spreadArray(__spreadArray([], nodi.nodi_i, true), Nodi_interni_m, true);
        barra = __spreadArray(__spreadArray([], barra, true), barra_k, true);
        celle_mag = __spreadArray(__spreadArray([], celle_mag, true), celle_ind_k, true);
        nodi.estremi_celle = __spreadArray(__spreadArray([], nodi.estremi_celle, true), celle_cap_k, true);
        induttanze.estremi_celle = __spreadArray(__spreadArray([], induttanze.estremi_celle, true), celle_ind_k, true);
        celle_sup = __spreadArray(__spreadArray([], celle_sup, true), celle_sup_k, true);
        var offset = NodiRed.length;
        nodi.centri = __spreadArray(__spreadArray([], nodi.centri, true), Nodi_k, true);
        NodiRed = __spreadArray(__spreadArray([], NodiRed, true), NodiRed_k, true);
        induttanze.estremi_lati_oggetti = (0, genera_estremi_lati_per_oggetto_rev_1.genera_estremi_lati_per_oggetto_rev)(induttanze.estremi_lati_oggetti, NodiRed_k, nodi.nodi_i, lati_k[0], lati_k[1], offset);
        // Aggiungi i lati di lati_k[0] e lati_k[1] a lati1 e lati2, rispettivamente
        for (var i = 0; i < lati_k[0].length; i++) {
            lati1.push(lati_k[0][i]);
        }
        for (var i = 0; i < lati_k[1].length; i++) {
            lati2.push(lati_k[1][i]);
        }
        induttanze.t = __spreadArray(__spreadArray([], induttanze.t, true), spessore_i_k, true);
        induttanze.S = __spreadArray(__spreadArray([], induttanze.S, true), sup_celle_ind_k, true);
        sup_celle_mag = __spreadArray(__spreadArray([], sup_celle_mag, true), sup_celle_ind_k, true);
        induttanze.l = __spreadArray(__spreadArray([], induttanze.l, true), l_i_k, true);
        nodi.l = __spreadArray(__spreadArray([], nodi.l, true), l_c_k, true);
        l_m = __spreadArray(__spreadArray([], l_m, true), l_m_k, true);
        induttanze.w = __spreadArray(__spreadArray([], induttanze.w, true), width_i_k, true);
        nodi.w = __spreadArray(__spreadArray([], nodi.w, true), width_c_k, true);
        width_m = __spreadArray(__spreadArray([], width_m, true), width_m_k, true);
        induttanze.versori = __spreadArray(__spreadArray([], induttanze.versori, true), vers_k, true);
        vers_m = __spreadArray(__spreadArray([], vers_m, true), vers_m_k, true);
        norm_m = __spreadArray(__spreadArray([], norm_m, true), norm_m_k, true);
        lati_m.push.apply(lati_m, lati_m_k);
        nodi.S_non_rid = __spreadArray(__spreadArray([], nodi.S_non_rid, true), sup_celle_cap_k, true);
        sup_celle_sup = __spreadArray(__spreadArray([], sup_celle_sup, true), sup_celle_sup_k, true);
        induttanze.dir_curr = __spreadArray(__spreadArray([], induttanze.dir_curr, true), dir_curr_k, true);
        induttanze.epsr = __spreadArray(__spreadArray([], induttanze.epsr, true), Array(celle_ind_k.length).fill(Regioni.epsr[k]), true);
        induttanze.sigma = __spreadArray(__spreadArray([], induttanze.sigma, true), Array(celle_ind_k.length).fill(Regioni.cond[k]), true);
        nodi.sigma = __spreadArray(__spreadArray([], nodi.sigma, true), Array(celle_cap_k.length).fill(Regioni.cond[k]), true);
        nodi.epsr = __spreadArray(__spreadArray([], nodi.epsr, true), Array(celle_cap_k.length).fill(Regioni.epsr[k]), true);
        var index = Regioni.materiale[k];
        var materialName = materials[index].name;
        nodi.materials = __spreadArray(__spreadArray([], nodi.materials, true), Array(celle_cap_k.length).fill(materialName), true);
        sigma_c = __spreadArray(__spreadArray([], sigma_c, true), Array(celle_cap_k.length).fill(Regioni.cond[k]), true);
        nodi.mur = __spreadArray(__spreadArray([], nodi.mur, true), Array(celle_cap_k.length).fill(Regioni.mur[k]), true);
        mu_m_eq = __spreadArray(__spreadArray([], mu_m_eq, true), Array(celle_sup_k.length).fill(Regioni.mu[k]), true);
        mu_m = __spreadArray(__spreadArray([], mu_m, true), Array(celle_ind_k.length).fill(Regioni.mu[k]), true);
        objects = __spreadArray(__spreadArray([], objects, true), Array(celle_cap_k.length).fill(k + 1), true);
        // Superfici celle induttive
        celle_ind_sup = __spreadArray(__spreadArray([], celle_ind_sup, true), celle_ind_sup_k, true);
        Sup_sup = __spreadArray(__spreadArray([], Sup_sup, true), Sup_sup_k, true);
        normale_sup = __spreadArray(__spreadArray([], normale_sup, true), normale_sup_k, true);
        dir_curr_sup = __spreadArray(__spreadArray([], dir_curr_sup, true), dir_curr_sup_k, true);
        rc_sup = __spreadArray(__spreadArray([], rc_sup, true), rc_sup_k, true);
        w_sup = __spreadArray(__spreadArray([], w_sup, true), w_sup_k, true);
        indici_sup.x = __spreadArray(__spreadArray([], indici_sup.x, true), indici_sup_k.x, true);
        indici_sup.y = __spreadArray(__spreadArray([], indici_sup.y, true), indici_sup_k.y, true);
        indici_sup.z = __spreadArray(__spreadArray([], indici_sup.z, true), indici_sup_k.z, true);
    };
    for (var k = 0; k < Regioni.coordinate.length; k++) {
        _loop_1(k);
    }
    // facce volumi induttivi
    induttanze.facce_estremi_celle = celle_ind_sup;
    induttanze.facce_superfici = Sup_sup;
    induttanze.facce_normale = normale_sup;
    induttanze.facce_dir_curr_sup = dir_curr_sup;
    induttanze.facce_centri = rc_sup;
    induttanze.facce_w = w_sup;
    var offsetNodiInt = NodiRed.length;
    for (var i = 0; i < induttanze.estremi_lati_oggetti.length; i++) {
        if (induttanze.estremi_lati_oggetti[i][0] < 0) {
            induttanze.estremi_lati_oggetti[i][0] =
                Math.abs(induttanze.estremi_lati_oggetti[i][0]) + offsetNodiInt;
        }
        if (induttanze.estremi_lati_oggetti[i][1] < 0) {
            induttanze.estremi_lati_oggetti[i][1] =
                Math.abs(induttanze.estremi_lati_oggetti[i][1]) + offsetNodiInt;
        }
    }
    induttanze.coordinate = [lati1, lati2];
    induttanze.indici.x = findIndices(induttanze.dir_curr, 1);
    induttanze.indici.y = findIndices(induttanze.dir_curr, 2);
    induttanze.indici.z = findIndices(induttanze.dir_curr, 3);
    induttanze.centri = [];
    for (var i = 0; i < induttanze.estremi_celle.length; i++) {
        var sumX = 0;
        var sumY = 0;
        var sumZ = 0;
        for (var j = 0; j < 24; j += 3) {
            sumX += induttanze.estremi_celle[i][j];
            sumY += induttanze.estremi_celle[i][j + 1];
            sumZ += induttanze.estremi_celle[i][j + 2];
        }
        induttanze.centri.push([sumX / 8, sumY / 8, sumZ / 8]);
    }
    nodi.nodi_interni = Array.from({ length: nodi.num_nodi_interni }, function (_, i) { return nodi.centri.length - nodi.num_nodi_interni + i; });
    nodi.l = nodi.l.map(function (val) { return val; });
    nodi.potenziali = [];
    nodi.centri_non_rid = nodi.centri;
    nodi.normale = [];
    for (var i = 0; i < nodi.estremi_celle.length; i++) {
        var p1 = nodi.estremi_celle[i].slice(0, 3);
        var p2 = nodi.estremi_celle[i].slice(3, 6);
        var p3 = nodi.estremi_celle[i].slice(6, 9);
        var v1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
        var v2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];
        var crossProduct = [
            v1[1] * v2[2] - v1[2] * v2[1],
            v1[2] * v2[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0]
        ];
        var norm = Math.sqrt(Math.pow(crossProduct[0], 2) + Math.pow(crossProduct[1], 2) + Math.pow(crossProduct[2], 2));
        nodi.normale.push([crossProduct[0] / norm, crossProduct[1] / norm, crossProduct[2] / norm]);
    }
    if (nodi.num_nodi_interni === 0) {
        nodi.nodi_i = [];
    }
    var _a = (0, elimina_patches_interni_thermal_save_1.elimina_patches_interni_thermal_save)(nodi.centri, nodi.centri_non_rid, nodi.estremi_celle, nodi.epsr, nodi.mur, nodi.sigma, nodi.nodi_i, nodi.w, nodi.l, nodi.S_non_rid, nodi.num_nodi_interni, nodi.normale, [], nodi.materials), nodi_new_centri = _a.nodi_new_centri, nodi_new_centri_non_rid = _a.nodi_new_centri_non_rid, nodi_new_estremi_celle = _a.nodi_new_estremi_celle, nodi_new_w = _a.nodi_new_w, nodi_new_l = _a.nodi_new_l, nodi_new_S_non_rid = _a.nodi_new_S_non_rid, nodi_new_epsr = _a.nodi_new_epsr, nodi_new_sigma = _a.nodi_new_sigma, nodi_new_mur = _a.nodi_new_mur, nodi_new_nodi_interni_coordinate = _a.nodi_new_nodi_interni_coordinate, nodi_new_num_nodi_interni = _a.nodi_new_num_nodi_interni, nodi_new_nodi_esterni = _a.nodi_new_nodi_esterni, nodi_new_normale = _a.nodi_new_normale, nodi_new_materials = _a.nodi_new_materials;
    nodi.centri = nodi_new_centri;
    nodi.centri_non_rid = nodi_new_centri_non_rid;
    nodi.estremi_celle = nodi_new_estremi_celle;
    nodi.w = nodi_new_w;
    nodi.l = nodi_new_l;
    nodi.S_non_rid = nodi_new_S_non_rid;
    nodi.epsr = nodi_new_epsr;
    nodi.sigma = nodi_new_sigma;
    nodi.mur = nodi_new_mur;
    nodi.nodi_interni_coordinate = nodi_new_nodi_interni_coordinate;
    nodi.num_nodi_interni = nodi_new_num_nodi_interni;
    nodi.nodi_esterni = nodi_new_nodi_esterni;
    nodi.normale = nodi_new_normale;
    nodi.materials = nodi_new_materials;
    if (nodi.num_nodi_interni === 0) {
        nodi.nodi_i = [];
    }
    var InternalNodesCommon2FourObjects = (0, FindInternalNodesCommon2FourObjects_rev_1.FindInternalNodesCommon2FourObjects_rev)(nodi.centri, NodiRed);
    nodi.centri_sup_non_rid = nodi.centri;
    nodi.centri = __spreadArray(__spreadArray([], nodi.centri, true), InternalNodesCommon2FourObjects, true);
    nodi.InternalNodesCommon2FourObjects = InternalNodesCommon2FourObjects;
    nodi.nodi_esterni_coordinate = __spreadArray(__spreadArray([], NodiRed, true), nodi.InternalNodesCommon2FourObjects, true);
    nodi.nodi_interni_coordinate = __spreadArray(__spreadArray([], nodi.nodi_interni_coordinate, true), nodi.InternalNodesCommon2FourObjects, true);
    nodi.num_nodi_esterni = nodi.nodi_esterni_coordinate.length;
    nodi.num_nodi_interni =
        nodi.num_nodi_interni + InternalNodesCommon2FourObjects.length;
    var _b = (0, matrice_incidenza_rev_1.matrice_incidenza_rev)(induttanze.coordinate, nodi.centri, nodi.nodi_interni_coordinate), estremi_lati = _b.estremi_lati, Rv = _b.Rv, nodi_centri = _b.nodi_centri, A = _b.A;
    induttanze.estremi_lati = estremi_lati;
    nodi.Rv = Rv;
    nodi.centri = nodi_centri;
    var indexes = findIndices(induttanze.epsr, function (val) { return val > 1; });
    induttanze.indici_Nd = indexes;
    nodi.superfici = nodi.l.map(function (val, index) { return val * nodi.w[index]; });
    induttanze.celle_superficie_w = width_m;
    induttanze.celle_superficie_l = l_m;
    induttanze.celle_superficie_estremi_celle = celle_sup;
    induttanze.facce_indici_associazione = [];
    var _loop_2 = function (cont) {
        induttanze.facce_indici_associazione[cont] = Array.from({ length: 6 }, function (_, i) { return cont * 6 + i + 1; });
    };
    for (var cont = 0; cont < A.size()[0]; cont++) {
        _loop_2(cont);
    }
    induttanze = (0, genera_dati_Z_sup_1.genera_dati_Z_sup)(induttanze);
    console.log("End discretization");
    return { induttanze: induttanze, nodi: nodi, A: A };
}
// Funzioni di supporto
function findIndices(arr, condition) {
    var indices = [];
    for (var i = 0; i < arr.length; i++) {
        if (typeof condition === 'number' && arr[i] === condition ||
            typeof condition === 'function' && condition(arr[i])) {
            indices.push(i);
        }
    }
    return indices;
}
function round_ud_singolo(num, digits) {
    return Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);
}
