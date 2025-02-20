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
exports.genera_mesh = genera_mesh;
var mean_length_rev_1 = require("./mean_length_rev");
var genera_parametri_diel_rec_con_rev_1 = require("./genera_parametri_diel_rec_con_rev");
var discretizza_thermal_rev_1 = require("./discretizza_thermal_rev");
var matrice_R_rev_1 = require("./matrice_R_rev");
var matrici_selettrici_rev_1 = require("./matrici_selettrici_rev");
var math = require("mathjs");
function genera_mesh(Regioni, den, freq_max, scalamento, use_escalings, materials) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    var escalings = {
        Lp: 1,
        P: 1,
        R: 1,
        Cd: 1,
        Is: 1,
        Yle: 1,
        freq: 1,
        time: 1,
    };
    if (use_escalings === 1) {
        escalings.Lp = 1e6;
        escalings.P = 1e-12;
        escalings.R = 1e-3;
        escalings.Cd = 1e12;
        escalings.Is = 1e3;
        escalings.Yle = 1e3;
        escalings.freq = 1e-9;
        escalings.time = 1e9;
    }
    var c0 = 3e8;
    var lambda = c0 / freq_max;
    var indx = [0, 3, 6, 9, 12, 15, 18, 21];
    var indy = [1, 4, 7, 10, 13, 16, 19, 22];
    var indz = [2, 5, 8, 11, 14, 17, 20, 23];
    var N_reg = Regioni.coordinate.length;
    Regioni.Nx = Array(N_reg).fill(0);
    Regioni.Ny = Array(N_reg).fill(0);
    Regioni.Nz = Array(N_reg).fill(0);
    Regioni.centri = [];
    for (var p = 0; p < N_reg; p++) {
        var len = Math.abs((0, mean_length_rev_1.mean_length_rev)(Regioni.coordinate[p], 1));
        var thickness = Math.abs((0, mean_length_rev_1.mean_length_rev)(Regioni.coordinate[p], 3));
        var width = Math.abs((0, mean_length_rev_1.mean_length_rev)(Regioni.coordinate[p], 2));
        Regioni.Nx[p] = Math.ceil((len * scalamento) / (lambda / den));
        if (Regioni.Nx[p] < 2) {
            Regioni.Nx[p] = 2;
        }
        Regioni.Ny[p] = Math.ceil((width * scalamento) / (lambda / den));
        if (Regioni.Ny[p] < 2) {
            Regioni.Ny[p] = 2;
        }
        Regioni.Nz[p] = Math.ceil((thickness * scalamento) / (lambda / den));
        if (Regioni.Nz[p] < 2) {
            Regioni.Nz[p] = 2;
        }
        var sumX = 0;
        var sumY = 0;
        var sumZ = 0;
        for (var i_1 = 0; i_1 < indx.length; i_1++) {
            sumX += Regioni.coordinate[p][indx[i_1]];
            sumY += Regioni.coordinate[p][indy[i_1]];
            sumZ += Regioni.coordinate[p][indz[i_1]];
        }
        Regioni.centri.push([sumX / 8, sumY / 8, sumZ / 8]);
    }
    var _u = (0, discretizza_thermal_rev_1.discretizza_thermal_rev)(Regioni, materials), induttanze = _u.induttanze, nodi = _u.nodi, A = _u.A;
    induttanze = (0, matrice_R_rev_1.matrice_R_rev)(induttanze);
    induttanze = (0, matrici_selettrici_rev_1.matrici_selettrici_rev)(induttanze);
    (0, genera_parametri_diel_rec_con_rev_1.genera_parametri_diel_rec_con_rev)(induttanze);
    // Calcola indici_celle_indx, indici_celle_indy, indici_celle_indz DOPO aver chiamato discretizza_thermal_rev
    induttanze.indici_celle_indx = findIndices(induttanze.dir_curr, 1);
    induttanze.indici_celle_indy = findIndices(induttanze.dir_curr, 2);
    induttanze.indici_celle_indz = findIndices(induttanze.dir_curr, 3);
    var RvTrasposta = math.transpose(nodi.Rv);
    // 2) Esegui il "find" sulla matrice trasposta
    var _v = findSparse(RvTrasposta), i = _v.i, j = _v.j, k = _v.k;
    // 3) Crea una matrice sparsa vuota
    var GammaSparse = math.sparse(); // creiamo la struttura vuota
    // 4) Imposta la dimensione (size(A,2) x size(nodi.Rv,1))
    GammaSparse.resize([A.size()[1], nodi.Rv.size()[0]]);
    // 5) Riempila con i valori
    for (var idx = 0; idx < k.length; idx++) {
        var row = i[idx] - 1; // da 1-based a 0-based
        var col = j[idx] - 1; // da 1-based a 0-based
        GammaSparse.set([row, col], k[idx]);
    }
    var incidence_selection = {
        Gamma: GammaSparse,
        mx: (_b = (_a = induttanze.indici_celle_indx) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0,
        my: (_d = (_c = induttanze.indici_celle_indy) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0,
        mz: (_f = (_e = induttanze.indici_celle_indz) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0,
        A: A,
    };
    var perm = __spreadArray(__spreadArray(__spreadArray([], ((_g = induttanze.indici_celle_indx) !== null && _g !== void 0 ? _g : []).map(function (index) { return index + 1; }), true), ((_h = induttanze.indici_celle_indy) !== null && _h !== void 0 ? _h : []).map(function (index) { return index + 1; }), true), ((_j = induttanze.indici_celle_indz) !== null && _j !== void 0 ? _j : []).map(function (index) { return index + 1; }), true);
    var volumi = {
        // 1) Estrai e riordina le righe in base all'ordine di perm
        coordinate: perm.map(function (p) {
            // p è 1-based, quindi p - 1 in JS
            return induttanze.estremi_celle[p - 1].map(function (val) { return val * scalamento; });
        }),
        S: perm.map(function (p) {
            return induttanze.S[p - 1] * scalamento * scalamento;
        }),
        l: perm.map(function (p) {
            return induttanze.l[p - 1] * scalamento;
        }),
        R: perm.map(function (p) {
            return (induttanze.R[p - 1] / scalamento) * escalings.R;
        }),
        Cd: perm.map(function (p) {
            return induttanze.Cp[p - 1] * scalamento * escalings.Cd;
        }),
        centri: perm.map(function (p) {
            return induttanze.centri[p - 1].map(function (val) { return val * scalamento; });
        }),
        Zs_part: perm.map(function (p) {
            return induttanze.Zs_part[p - 1]  * escalings.R;
        }),
        indici_dielettrici: [],
    };
    // Calcolo di volumi.indici_dielettrici
    var indici_Nd = (_k = induttanze.indici_Nd) !== null && _k !== void 0 ? _k : [];
    for (var k_1 = 0; k_1 < indici_Nd.length; k_1++) {
        volumi.indici_dielettrici[k_1] = perm.indexOf(indici_Nd[k_1] + 1) + 1; // Usa indici 0-based e +1 per compatibilità con MATLAB
    }
    // Filtraggio di incidence_selection.A
    // Crea una nuova matrice sparsa per incidence_selection.A
    var numRowsA = perm.length;
    var numColsA = A.size()[1];
    var filteredA = math.sparse([], 'number'); // Inizializza come matrice sparsa vuota
    filteredA.resize([numRowsA, numColsA]); // Imposta le dimensioni
    for (var p = 0; p < perm.length; p++) {
        var rowIndex = perm[p] - 1; // Converti l'indice 1-based di 'perm' in 0-based
        if (rowIndex >= 0 && rowIndex < A.size()[0]) {
            // Estrai la riga specificata dalla matrice sparsa originale A
            for (var j_1 = 0; j_1 < numColsA; j_1++) {
                var value = A.get([rowIndex, j_1]);
                if (value !== 0) {
                    filteredA.set([p, j_1], value);
                }
            }
        }
    }
    incidence_selection.A = filteredA; // Assegna la nuova matrice sparsa filtrata
    var superfici = {
        estremi_celle: ((_l = nodi.estremi_celle) !== null && _l !== void 0 ? _l : []).map(function (row) {
            return row.map(function (val) { return val * scalamento; });
        }),
        centri: [],
        S: ((_m = nodi.superfici) !== null && _m !== void 0 ? _m : []).map(function (val) { return val * scalamento * scalamento; }),
        normale: (_o = nodi.normale) !== null && _o !== void 0 ? _o : [],
        mur: (_p = nodi.mur) !== null && _p !== void 0 ? _p : [],
        sigma: (_q = nodi.sigma) !== null && _q !== void 0 ? _q : [],
        epsr: (_r = nodi.epsr) !== null && _r !== void 0 ? _r : [],
        materials: (_s = nodi.materials) !== null && _s !== void 0 ? _s : [],
    };
    for (var i_2 = 0; i_2 < superfici.estremi_celle.length; i_2++) {
        var sumX = 0;
        var sumY = 0;
        var sumZ = 0;
        for (var j_2 = 0; j_2 < 12; j_2 += 3) {
            sumX += superfici.estremi_celle[i_2][j_2];
            sumY += superfici.estremi_celle[i_2][j_2 + 1];
            sumZ += superfici.estremi_celle[i_2][j_2 + 2];
        }
        superfici.centri.push([sumX / 4, sumY / 4, sumZ / 4]);
    }
    superfici.estremi_celle = hcat.apply(void 0, superfici.estremi_celle);
    superfici.centri = hcat.apply(void 0, superfici.centri);
    superfici.normale = hcat.apply(void 0, superfici.normale);
    var nodi_coord = ((_t = nodi.centri) !== null && _t !== void 0 ? _t : []).map(function (row) {
        return row.map(function (val) { return val * scalamento; });
    });
    //const gamma = incidence_selection.Gamma;
    return { incidence_selection: incidence_selection, volumi: volumi, superfici: superfici, nodi_coord: nodi_coord, escalings: escalings };
}
//**FUNZIONI DI SUPPORTO */
// Funzione per trovare gli indici e i valori non nulli di una matrice (equivalente a find(X.'))
//lavora in 1 based
function findSparse(matrix) {
    var i = [];
    var j = [];
    var k = [];
    // Itera sugli elementi non nulli della matrice sparsa
    matrix.forEach(function (value, index) {
        if (value !== 0) {
            i.push(index[0] + 1);
            j.push(index[1] + 1);
            k.push(value);
        }
    });
    return { i: i, j: j, k: k };
}
function findIndices(arr, condition) {
    var indices = [];
    for (var i = 0; i < arr.length; i++) {
        if ((typeof condition === 'number' && arr[i] === condition) ||
            (typeof condition === 'function' && condition(arr[i]))) {
            indices.push(i); // Salviamo l'indice 0-based
        }
    }
    return indices;
}
/**
 * Horizontally concatenates column vectors (1D arrays) into a 2D array.
 * Each input array represents a column, and all arrays must have the same length.
 *
 * @param columns - One or more arrays to be concatenated as columns.
 * @returns A 2D array where each inner array is a row containing the corresponding elements from each column.
 * @throws An error if the input arrays are not all the same length.
 */
function hcat() {
    var columns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        columns[_i] = arguments[_i];
    }
    if (columns.length === 0)
        return [];
    // Determine the number of rows from the first column.
    var numRows = columns[0].length;
    // Ensure all columns have the same length.
    for (var _a = 0, columns_1 = columns; _a < columns_1.length; _a++) {
        var col = columns_1[_a];
        if (col.length !== numRows) {
            throw new Error("All columns must have the same number of elements.");
        }
    }
    // Build the result by iterating over rows.
    var result = [];
    var _loop_1 = function (i) {
        // For each row, take the i-th element from every column.
        var row = columns.map(function (col) { return col[i]; });
        result.push(row);
    };
    for (var i = 0; i < numRows; i++) {
        _loop_1(i);
    }
    return result;
}
