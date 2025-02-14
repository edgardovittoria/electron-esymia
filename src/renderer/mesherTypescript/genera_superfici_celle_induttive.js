"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genera_superfici_celle_induttive = genera_superfici_celle_induttive;
var surfa_old_1 = require("./surfa_old");
var norm_1 = require("./norm");
var cross_1 = require("./cross");
function genera_superfici_celle_induttive(r_nodi_barra, weights_five, roots_five) {
    var celle_ind_sup = [];
    var indici_celle_ind_supx = [];
    var indici_celle_ind_supy = [];
    var indici_celle_ind_supz = [];
    var Sup = [];
    var normale = [];
    var dir_curr = [];
    var w = [];
    var p = 0; // Inizializza l'indice della superficie
    // Funzione di supporto per calcolare la superficie e la normale
    function calcolaSuperficie(r_punti) {
        var superficie = Math.abs((0, surfa_old_1.surfa_old)(flatten(r_punti), weights_five, roots_five));
        var normale = (0, cross_1.cross)(r_punti[1].map(function (val, i) { return val - r_punti[0][i]; }), r_punti[2].map(function (val, i) { return val - r_punti[0][i]; })).map(function (val, i, arr) { return val / ((0, norm_1.norm)(r_punti[1].map(function (val, i) { return val - r_punti[0][i]; })) * (0, norm_1.norm)(r_punti[2].map(function (val, i) { return val - r_punti[0][i]; }))); });
        return { Sup: superficie, normale: normale };
    }
    function calcolaSuperficieXY(r_punti) {
        var superficie = Math.abs((0, surfa_old_1.surfa_old)(flatten(r_punti), weights_five, roots_five));
        var normale = (0, cross_1.cross)(r_punti[1].map(function (val, i) { return val - r_punti[0][i]; }), r_punti[2].map(function (val, i) { return val - r_punti[0][i]; })).map(function (val, i, arr) { return -val / ((0, norm_1.norm)(r_punti[1].map(function (val, i) { return val - r_punti[0][i]; })) * (0, norm_1.norm)(r_punti[2].map(function (val, i) { return val - r_punti[0][i]; }))); });
        return { Sup: superficie, normale: normale };
    }
    function calcolaSuperficieXZ(r_punti) {
        var superficie = Math.abs((0, surfa_old_1.surfa_old)(flatten(r_punti), weights_five, roots_five));
        var normale = (0, cross_1.cross)(r_punti[1].map(function (val, i) { return val - r_punti[0][i]; }), r_punti[3].map(function (val, i) { return val - r_punti[0][i]; })).map(function (val, i, arr) { return val / ((0, norm_1.norm)(r_punti[1].map(function (val, i) { return val - r_punti[0][i]; })) * (0, norm_1.norm)(r_punti[3].map(function (val, i) { return val - r_punti[0][i]; }))); });
        return { Sup: superficie, normale: normale };
    }
    function calcolaSuperficieXZ_neg(r_punti) {
        var superficie = Math.abs((0, surfa_old_1.surfa_old)(flatten(r_punti), weights_five, roots_five));
        var normale = (0, cross_1.cross)(r_punti[1].map(function (val, i) { return val - r_punti[0][i]; }), r_punti[3].map(function (val, i) { return val - r_punti[0][i]; })).map(function (val, i, arr) { return -val / ((0, norm_1.norm)(r_punti[1].map(function (val, i) { return val - r_punti[0][i]; })) * (0, norm_1.norm)(r_punti[3].map(function (val, i) { return val - r_punti[0][i]; }))); });
        return { Sup: superficie, normale: normale };
    }
    function calcolaSuperficieYZ(r_punti) {
        var superficie = Math.abs((0, surfa_old_1.surfa_old)(flatten(r_punti), weights_five, roots_five));
        var normale = (0, cross_1.cross)(r_punti[2].map(function (val, i) { return val - r_punti[0][i]; }), r_punti[3].map(function (val, i) { return val - r_punti[0][i]; })).map(function (val, i, arr) { return val / ((0, norm_1.norm)(r_punti[2].map(function (val, i) { return val - r_punti[0][i]; })) * (0, norm_1.norm)(r_punti[3].map(function (val, i) { return val - r_punti[0][i]; }))); });
        return { Sup: superficie, normale: normale };
    }
    function calcolaSuperficieYZ_neg(r_punti) {
        var superficie = Math.abs((0, surfa_old_1.surfa_old)(flatten(r_punti), weights_five, roots_five));
        var normale = (0, cross_1.cross)(r_punti[2].map(function (val, i) { return val - r_punti[0][i]; }), r_punti[3].map(function (val, i) { return val - r_punti[0][i]; })).map(function (val, i, arr) { return -val / ((0, norm_1.norm)(r_punti[2].map(function (val, i) { return val - r_punti[0][i]; })) * (0, norm_1.norm)(r_punti[3].map(function (val, i) { return val - r_punti[0][i]; }))); });
        return { Sup: superficie, normale: normale };
    }
    // Funzione di supporto per aggiungere una superficie
    function aggiungiSuperficie(r_punti, dir, indice_array, piano) {
        celle_ind_sup[p] = flatten(r_punti);
        dir_curr[p] = dir;
        indice_array.push(p);
        var superficieNormale;
        if (piano === 'xy') {
            superficieNormale = calcolaSuperficieXY(r_punti);
        }
        else if (piano === 'xz') {
            superficieNormale = calcolaSuperficieXZ(r_punti);
        }
        else if (piano === 'xz_neg') {
            superficieNormale = calcolaSuperficieXZ_neg(r_punti);
        }
        else if (piano === 'yz') {
            superficieNormale = calcolaSuperficieYZ(r_punti);
        }
        else if (piano === 'yz_neg') {
            superficieNormale = calcolaSuperficieYZ_neg(r_punti);
        }
        else {
            superficieNormale = calcolaSuperficie(r_punti); // Default per altri piani (non dovrebbe succedere con la logica attuale)
        }
        Sup[p] = superficieNormale.Sup;
        normale[p] = superficieNormale.normale;
        if (piano === 'xy' || piano === 'yz' || piano === 'yz_neg') {
            if (piano === 'yz' || piano === 'yz_neg') {
                w[p] = 0;
            }
            else {
                w[p] = (0, norm_1.norm)(r_punti[1].map(function (val, i) { return val - r_punti[0][i]; }));
            }
        }
        else if (piano === 'xz' || piano === 'xz_neg') {
            if (dir == 2) {
                w[p] = 0;
            }
            else {
                w[p] = (0, norm_1.norm)(r_punti[1].map(function (val, i) { return val - r_punti[0][i]; }));
            }
        }
        else {
            w[p] = (0, norm_1.norm)(r_punti[1].map(function (val, i) { return val - r_punti[0][i]; }));
        }
        p++;
    }
    // Definisci i gruppi di punti per ogni direzione e piano
    var gruppi_x_xy = [
        [[r_nodi_barra[0], r_nodi_barra[1], r_nodi_barra[4], r_nodi_barra[5]], [r_nodi_barra[18], r_nodi_barra[20], r_nodi_barra[25], r_nodi_barra[21]]],
        [[r_nodi_barra[4], r_nodi_barra[5], r_nodi_barra[2], r_nodi_barra[3]], [r_nodi_barra[25], r_nodi_barra[21], r_nodi_barra[24], r_nodi_barra[22]]],
        [[r_nodi_barra[18], r_nodi_barra[20], r_nodi_barra[25], r_nodi_barra[21]], [r_nodi_barra[9], r_nodi_barra[10], r_nodi_barra[13], r_nodi_barra[14]]],
        [[r_nodi_barra[25], r_nodi_barra[21], r_nodi_barra[24], r_nodi_barra[22]], [r_nodi_barra[13], r_nodi_barra[14], r_nodi_barra[11], r_nodi_barra[12]]],
    ];
    var gruppi_x_xz = [
        [[r_nodi_barra[0], r_nodi_barra[1], r_nodi_barra[18], r_nodi_barra[20]], [r_nodi_barra[4], r_nodi_barra[5], r_nodi_barra[25], r_nodi_barra[21]]],
        [[r_nodi_barra[4], r_nodi_barra[5], r_nodi_barra[25], r_nodi_barra[21]], [r_nodi_barra[2], r_nodi_barra[3], r_nodi_barra[24], r_nodi_barra[22]]],
        [[r_nodi_barra[18], r_nodi_barra[20], r_nodi_barra[9], r_nodi_barra[10]], [r_nodi_barra[25], r_nodi_barra[21], r_nodi_barra[13], r_nodi_barra[14]]],
        [[r_nodi_barra[25], r_nodi_barra[21], r_nodi_barra[13], r_nodi_barra[14]], [r_nodi_barra[24], r_nodi_barra[22], r_nodi_barra[11], r_nodi_barra[12]]],
    ];
    var gruppi_x_yz = [
        [[r_nodi_barra[0], r_nodi_barra[4], r_nodi_barra[18], r_nodi_barra[25]], [r_nodi_barra[1], r_nodi_barra[5], r_nodi_barra[20], r_nodi_barra[21]]],
        [[r_nodi_barra[4], r_nodi_barra[2], r_nodi_barra[25], r_nodi_barra[24]], [r_nodi_barra[5], r_nodi_barra[3], r_nodi_barra[21], r_nodi_barra[22]]],
        [[r_nodi_barra[18], r_nodi_barra[25], r_nodi_barra[9], r_nodi_barra[13]], [r_nodi_barra[20], r_nodi_barra[21], r_nodi_barra[10], r_nodi_barra[14]]],
        [[r_nodi_barra[25], r_nodi_barra[24], r_nodi_barra[13], r_nodi_barra[11]], [r_nodi_barra[21], r_nodi_barra[22], r_nodi_barra[14], r_nodi_barra[12]]],
    ];
    var gruppi_y_xy = [
        [[r_nodi_barra[0], r_nodi_barra[6], r_nodi_barra[2], r_nodi_barra[7]], [r_nodi_barra[18], r_nodi_barra[19], r_nodi_barra[24], r_nodi_barra[23]]],
        [[r_nodi_barra[6], r_nodi_barra[1], r_nodi_barra[7], r_nodi_barra[3]], [r_nodi_barra[19], r_nodi_barra[20], r_nodi_barra[23], r_nodi_barra[22]]],
        [[r_nodi_barra[18], r_nodi_barra[19], r_nodi_barra[24], r_nodi_barra[23]], [r_nodi_barra[9], r_nodi_barra[15], r_nodi_barra[11], r_nodi_barra[16]]],
        [[r_nodi_barra[19], r_nodi_barra[20], r_nodi_barra[23], r_nodi_barra[22]], [r_nodi_barra[15], r_nodi_barra[10], r_nodi_barra[16], r_nodi_barra[12]]],
    ];
    var gruppi_y_xz = [
        [[r_nodi_barra[0], r_nodi_barra[6], r_nodi_barra[18], r_nodi_barra[19]], [r_nodi_barra[2], r_nodi_barra[7], r_nodi_barra[24], r_nodi_barra[23]]],
        [[r_nodi_barra[6], r_nodi_barra[1], r_nodi_barra[19], r_nodi_barra[20]], [r_nodi_barra[7], r_nodi_barra[3], r_nodi_barra[23], r_nodi_barra[22]]],
        [[r_nodi_barra[18], r_nodi_barra[19], r_nodi_barra[9], r_nodi_barra[15]], [r_nodi_barra[24], r_nodi_barra[23], r_nodi_barra[11], r_nodi_barra[16]]],
        [[r_nodi_barra[19], r_nodi_barra[20], r_nodi_barra[15], r_nodi_barra[10]], [r_nodi_barra[23], r_nodi_barra[22], r_nodi_barra[16], r_nodi_barra[12]]],
    ];
    var gruppi_y_yz = [
        [[r_nodi_barra[0], r_nodi_barra[2], r_nodi_barra[18], r_nodi_barra[24]], [r_nodi_barra[6], r_nodi_barra[7], r_nodi_barra[19], r_nodi_barra[23]]],
        [[r_nodi_barra[6], r_nodi_barra[7], r_nodi_barra[19], r_nodi_barra[23]], [r_nodi_barra[1], r_nodi_barra[3], r_nodi_barra[20], r_nodi_barra[22]]],
        [[r_nodi_barra[18], r_nodi_barra[24], r_nodi_barra[9], r_nodi_barra[11]], [r_nodi_barra[19], r_nodi_barra[23], r_nodi_barra[15], r_nodi_barra[16]]],
        [[r_nodi_barra[19], r_nodi_barra[23], r_nodi_barra[15], r_nodi_barra[16]], [r_nodi_barra[20], r_nodi_barra[22], r_nodi_barra[10], r_nodi_barra[12]]],
    ];
    var gruppi_z_xy = [
        [[r_nodi_barra[0], r_nodi_barra[6], r_nodi_barra[4], r_nodi_barra[8]], [r_nodi_barra[9], r_nodi_barra[15], r_nodi_barra[13], r_nodi_barra[17]]],
        [[r_nodi_barra[6], r_nodi_barra[1], r_nodi_barra[8], r_nodi_barra[5]], [r_nodi_barra[15], r_nodi_barra[10], r_nodi_barra[17], r_nodi_barra[14]]],
        [[r_nodi_barra[4], r_nodi_barra[8], r_nodi_barra[2], r_nodi_barra[7]], [r_nodi_barra[13], r_nodi_barra[17], r_nodi_barra[11], r_nodi_barra[16]]],
        [[r_nodi_barra[8], r_nodi_barra[5], r_nodi_barra[7], r_nodi_barra[3]], [r_nodi_barra[17], r_nodi_barra[14], r_nodi_barra[16], r_nodi_barra[12]]],
    ];
    var gruppi_z_xz = [
        [[r_nodi_barra[0], r_nodi_barra[6], r_nodi_barra[9], r_nodi_barra[15]], [r_nodi_barra[4], r_nodi_barra[8], r_nodi_barra[13], r_nodi_barra[17]]],
        [[r_nodi_barra[6], r_nodi_barra[1], r_nodi_barra[15], r_nodi_barra[10]], [r_nodi_barra[8], r_nodi_barra[5], r_nodi_barra[17], r_nodi_barra[14]]],
        [[r_nodi_barra[4], r_nodi_barra[8], r_nodi_barra[13], r_nodi_barra[17]], [r_nodi_barra[2], r_nodi_barra[7], r_nodi_barra[11], r_nodi_barra[16]]],
        [[r_nodi_barra[8], r_nodi_barra[5], r_nodi_barra[17], r_nodi_barra[14]], [r_nodi_barra[7], r_nodi_barra[3], r_nodi_barra[16], r_nodi_barra[12]]],
    ];
    var gruppi_z_yz = [
        [[r_nodi_barra[0], r_nodi_barra[4], r_nodi_barra[9], r_nodi_barra[13]], [r_nodi_barra[6], r_nodi_barra[8], r_nodi_barra[15], r_nodi_barra[17]]],
        [[r_nodi_barra[6], r_nodi_barra[8], r_nodi_barra[15], r_nodi_barra[17]], [r_nodi_barra[1], r_nodi_barra[5], r_nodi_barra[10], r_nodi_barra[14]]],
        [[r_nodi_barra[4], r_nodi_barra[2], r_nodi_barra[13], r_nodi_barra[11]], [r_nodi_barra[8], r_nodi_barra[7], r_nodi_barra[17], r_nodi_barra[16]]],
        [[r_nodi_barra[8], r_nodi_barra[7], r_nodi_barra[17], r_nodi_barra[16]], [r_nodi_barra[5], r_nodi_barra[3], r_nodi_barra[14], r_nodi_barra[12]]],
    ];
    // Itera sui gruppi di punti e aggiungi le superfici
    for (var i = 0; i < gruppi_x_xy.length; i++) {
        aggiungiSuperficie(gruppi_x_xy[i][0], 1, indici_celle_ind_supx, 'xy');
        aggiungiSuperficie(gruppi_x_xy[i][1], 1, indici_celle_ind_supx, 'xy');
        aggiungiSuperficie(gruppi_x_xz[i][0], 1, indici_celle_ind_supx, 'xz');
        aggiungiSuperficie(gruppi_x_xz[i][1], 1, indici_celle_ind_supx, 'xz_neg');
        aggiungiSuperficie(gruppi_x_yz[i][0], 1, indici_celle_ind_supx, 'yz_neg');
        aggiungiSuperficie(gruppi_x_yz[i][1], 1, indici_celle_ind_supx, 'yz');
    }
    for (var i = 0; i < gruppi_y_xy.length; i++) {
        aggiungiSuperficie(gruppi_y_xy[i][0], 2, indici_celle_ind_supy, 'xy');
        aggiungiSuperficie(gruppi_y_xy[i][1], 2, indici_celle_ind_supy, 'xy');
        aggiungiSuperficie(gruppi_y_xz[i][0], 2, indici_celle_ind_supy, 'xz');
        aggiungiSuperficie(gruppi_y_xz[i][1], 2, indici_celle_ind_supy, 'xz_neg');
        aggiungiSuperficie(gruppi_y_yz[i][0], 2, indici_celle_ind_supy, 'yz_neg');
        aggiungiSuperficie(gruppi_y_yz[i][1], 2, indici_celle_ind_supy, 'yz');
    }
    for (var i = 0; i < gruppi_z_xy.length; i++) {
        aggiungiSuperficie(gruppi_z_xy[i][0], 3, indici_celle_ind_supz, 'xy');
        aggiungiSuperficie(gruppi_z_xy[i][1], 3, indici_celle_ind_supz, 'xy');
        aggiungiSuperficie(gruppi_z_xz[i][0], 3, indici_celle_ind_supz, 'xz');
        aggiungiSuperficie(gruppi_z_xz[i][1], 3, indici_celle_ind_supz, 'xz_neg');
        aggiungiSuperficie(gruppi_z_yz[i][0], 3, indici_celle_ind_supz, 'yz_neg');
        aggiungiSuperficie(gruppi_z_yz[i][1], 3, indici_celle_ind_supz, 'yz');
    }
    return { celle_ind_sup: celle_ind_sup, indici_celle_ind_supx: indici_celle_ind_supx, indici_celle_ind_supy: indici_celle_ind_supy, indici_celle_ind_supz: indici_celle_ind_supz, Sup: Sup, normale: normale, dir_curr: dir_curr, w: w };
}
// la funzione flatten prende un array di array e restituisce un nuovo array
// che contiene tutti gli elementi degli array interni, in ordine, come se fossero in un unico array.
function flatten(arr) {
    return arr.reduce(function (acc, val) { return acc.concat(val); }, []);
}
