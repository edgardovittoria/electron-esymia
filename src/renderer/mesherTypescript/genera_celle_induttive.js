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
exports.genera_celle_induttive = genera_celle_induttive;
var mean_length_save_1 = require("./mean_length_save");
var mean_length_Lp_1 = require("./mean_length_Lp");
var mean_cross_section_Lp_1 = require("./mean_cross_section_Lp");
function genera_celle_induttive(r_nodi_barra) {
    var celle_ind = [];
    var lati = [];
    var vers = [];
    var l = [];
    var indici_celle_indx = [];
    var indici_celle_indy = [];
    var indici_celle_indz = [];
    var spessore = [];
    var Sup = [];
    var width = [];
    var dir_curr = [];
    // Funzione di supporto per calcolare i parametri di una cella
    function calcolaParametriCella(cella, dir, p) {
        l[p] = Math.abs((0, mean_length_save_1.mean_length_save)(cella, dir));
        if (dir == 1) {
            spessore[p] = Math.abs((0, mean_length_save_1.mean_length_save)(cella, 3));
            Sup[p] = Math.abs((0, mean_cross_section_Lp_1.mean_cross_section_Lp)(cella, dir));
            width[p] = Math.abs((0, mean_length_Lp_1.mean_length_Lp)(cella, 2));
        }
        else if (dir == 2) {
            spessore[p] = Math.abs((0, mean_length_save_1.mean_length_save)(cella, 3));
            Sup[p] = Math.abs((0, mean_cross_section_Lp_1.mean_cross_section_Lp)(cella, dir));
            width[p] = Math.abs((0, mean_length_Lp_1.mean_length_Lp)(cella, 1));
        }
        else {
            spessore[p] = Math.abs((0, mean_length_save_1.mean_length_save)(cella, 1));
            Sup[p] = Math.abs((0, mean_cross_section_Lp_1.mean_cross_section_Lp)(cella, dir));
            width[p] = Math.abs((0, mean_length_Lp_1.mean_length_Lp)(cella, 2));
        }
    }
    function createLato(r1, r2) {
        return {
            punto1: r1,
            punto2: r2,
        };
    }
    // Funzione di supporto per aggiungere una cella
    function aggiungiCella(r_punti, dir, indice_array, p) {
        var cella = [];
        r_punti.forEach(function (r) { return cella.push.apply(cella, r); }); // Inserisce i punti nella cella in un unico array
        celle_ind[p] = cella;
        var lato = createLato(r_punti[0], r_punti[1]);
        lati[p] = [__spreadArray([], lato.punto1, true), __spreadArray([], lato.punto2, true)];
        var lato_vett = lato.punto2.map(function (val, i) { return val - lato.punto1[i]; });
        vers[p] = lato_vett.map(function (val) {
            return val / Math.sqrt(lato_vett.reduce(function (sum, val) { return sum + val * val; }, 0));
        });
        dir_curr[p] = dir;
        indice_array.push(p);
        calcolaParametriCella(cella, dir, p);
        return p + 1;
    }
    // Definisci i gruppi di punti per ogni direzione
    var gruppi_x = [
        [
            [
                r_nodi_barra[0],
                r_nodi_barra[1],
                r_nodi_barra[4],
                r_nodi_barra[5],
                r_nodi_barra[18],
                r_nodi_barra[20],
                r_nodi_barra[25],
                r_nodi_barra[21],
            ],
        ],
        [
            [
                r_nodi_barra[4],
                r_nodi_barra[5],
                r_nodi_barra[2],
                r_nodi_barra[3],
                r_nodi_barra[25],
                r_nodi_barra[21],
                r_nodi_barra[24],
                r_nodi_barra[22],
            ],
        ],
        [
            [
                r_nodi_barra[18],
                r_nodi_barra[20],
                r_nodi_barra[25],
                r_nodi_barra[21],
                r_nodi_barra[9],
                r_nodi_barra[10],
                r_nodi_barra[13],
                r_nodi_barra[14],
            ],
        ],
        [
            [
                r_nodi_barra[25],
                r_nodi_barra[21],
                r_nodi_barra[24],
                r_nodi_barra[22],
                r_nodi_barra[13],
                r_nodi_barra[14],
                r_nodi_barra[11],
                r_nodi_barra[12],
            ],
        ],
    ];
    var gruppi_y = [
        [
            [
                r_nodi_barra[0],
                r_nodi_barra[6],
                r_nodi_barra[2],
                r_nodi_barra[7],
                r_nodi_barra[18],
                r_nodi_barra[19],
                r_nodi_barra[24],
                r_nodi_barra[23],
            ],
        ],
        [
            [
                r_nodi_barra[6],
                r_nodi_barra[1],
                r_nodi_barra[7],
                r_nodi_barra[3],
                r_nodi_barra[19],
                r_nodi_barra[20],
                r_nodi_barra[23],
                r_nodi_barra[22],
            ],
        ],
        [
            [
                r_nodi_barra[18],
                r_nodi_barra[19],
                r_nodi_barra[24],
                r_nodi_barra[23],
                r_nodi_barra[9],
                r_nodi_barra[15],
                r_nodi_barra[11],
                r_nodi_barra[16],
            ],
        ],
        [
            [
                r_nodi_barra[19],
                r_nodi_barra[20],
                r_nodi_barra[23],
                r_nodi_barra[22],
                r_nodi_barra[15],
                r_nodi_barra[10],
                r_nodi_barra[16],
                r_nodi_barra[12],
            ],
        ],
    ];
    var gruppi_z = [
        [
            [
                r_nodi_barra[0],
                r_nodi_barra[6],
                r_nodi_barra[4],
                r_nodi_barra[8],
                r_nodi_barra[9],
                r_nodi_barra[15],
                r_nodi_barra[13],
                r_nodi_barra[17],
            ],
        ],
        [
            [
                r_nodi_barra[6],
                r_nodi_barra[1],
                r_nodi_barra[8],
                r_nodi_barra[5],
                r_nodi_barra[15],
                r_nodi_barra[10],
                r_nodi_barra[17],
                r_nodi_barra[14],
            ],
        ],
        [
            [
                r_nodi_barra[4],
                r_nodi_barra[8],
                r_nodi_barra[2],
                r_nodi_barra[7],
                r_nodi_barra[13],
                r_nodi_barra[17],
                r_nodi_barra[11],
                r_nodi_barra[16],
            ],
        ],
        [
            [
                r_nodi_barra[8],
                r_nodi_barra[5],
                r_nodi_barra[7],
                r_nodi_barra[3],
                r_nodi_barra[17],
                r_nodi_barra[14],
                r_nodi_barra[16],
                r_nodi_barra[12],
            ],
        ],
    ];
    var p = 0; // Inizializza l'indice della cella
    // Itera sui gruppi di punti e aggiungi le celle
    gruppi_x.forEach(function (gruppo) {
        p = aggiungiCella(gruppo[0], 1, indici_celle_indx, p);
    });
    gruppi_y.forEach(function (gruppo) {
        p = aggiungiCella(gruppo[0], 2, indici_celle_indy, p);
    });
    gruppi_z.forEach(function (gruppo) {
        p = aggiungiCella(gruppo[0], 3, indici_celle_indz, p);
    });
    return {
        celle_ind: celle_ind,
        lati: lati,
        vers: vers,
        l: l,
        indici_celle_indx: indici_celle_indx,
        indici_celle_indy: indici_celle_indy,
        indici_celle_indz: indici_celle_indz,
        spessore: spessore,
        Sup: Sup,
        width: width,
        dir_curr: dir_curr,
    };
}
