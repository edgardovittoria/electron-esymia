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
exports.split_overlapping = split_overlapping;
function split_overlapping(barra1, barra2, mat1, mat2, materiale_dominante) {
    // ----------------------------------------------
    var indici_x = [0, 3, 6, 9, 12, 15, 18, 21];
    var indici_y = [1, 4, 7, 10, 13, 16, 19, 22];
    var indici_z = [2, 5, 8, 11, 14, 17, 20, 23];
    // ----------------------------------------------
    // 2) Calcolo x1..z2 per barra1
    var x1 = round14(Math.min.apply(Math, indici_x.map(function (i) { return barra1[i]; })));
    var x2 = round14(Math.max.apply(Math, indici_x.map(function (i) { return barra1[i]; })));
    var y1 = round14(Math.min.apply(Math, indici_y.map(function (i) { return barra1[i]; })));
    var y2 = round14(Math.max.apply(Math, indici_y.map(function (i) { return barra1[i]; })));
    var z1 = round14(Math.min.apply(Math, indici_z.map(function (i) { return barra1[i]; })));
    var z2 = round14(Math.max.apply(Math, indici_z.map(function (i) { return barra1[i]; })));
    // Calcolo x3..z4 per barra2
    var x3 = round14(Math.min.apply(Math, indici_x.map(function (i) { return barra2[i]; })));
    var x4 = round14(Math.max.apply(Math, indici_x.map(function (i) { return barra2[i]; })));
    var y3 = round14(Math.min.apply(Math, indici_y.map(function (i) { return barra2[i]; })));
    var y4 = round14(Math.max.apply(Math, indici_y.map(function (i) { return barra2[i]; })));
    var z3 = round14(Math.min.apply(Math, indici_z.map(function (i) { return barra2[i]; })));
    var z4 = round14(Math.max.apply(Math, indici_z.map(function (i) { return barra2[i]; })));
    // ----------------------------------------------
    // 3) Verifica overlapping
    var overllapped_x = 0;
    var overllapped_y = 0;
    var overllapped_z = 0;
    if ((x1 >= x3 && x4 > x1) || (x3 < x2 && x3 >= x1)) {
        overllapped_x = 1;
    }
    if ((y1 >= y3 && y4 > y1) || (y3 < y2 && y3 >= y1)) {
        overllapped_y = 1;
    }
    if ((z1 >= z3 && z4 > z1) || (z3 < z2 && z3 >= z1)) {
        overllapped_z = 1;
    }
    var isOverlapped = overllapped_x * overllapped_y * overllapped_z;
    // ----------------------------------------------
    // 4) barre_out e mat_out di default
    var barre_out = [barra1, barra2];
    var mat_out = [mat1, mat2];
    if (isOverlapped === 1) {
        // 4a) calcolo coordinate dell'intersezione (x1_inter..z2_inter)
        var x1_inter_1 = Math.max(x1, x3);
        var x2_inter_1 = Math.min(x2, x4);
        var y1_inter_1 = Math.max(y1, y3);
        var y2_inter_1 = Math.min(y2, y4);
        var z1_inter_1 = Math.max(z1, z3);
        var z2_inter_1 = Math.min(z2, z4);
        // 4b) Costruzione della "barra_overlapping"
        var barra_overlapping_1 = new Array(24).fill(0);
        //    MATLAB: [1 7 13 19] => TS: [0, 6, 12, 18]
        [0, 6, 12, 18].forEach(function (i) {
            barra_overlapping_1[i] = Math.min(x1_inter_1, x2_inter_1);
        });
        [3, 9, 15, 21].forEach(function (i) {
            barra_overlapping_1[i] = Math.max(x1_inter_1, x2_inter_1);
        });
        [1, 4, 13, 16].forEach(function (i) {
            barra_overlapping_1[i] = Math.min(y1_inter_1, y2_inter_1);
        });
        [7, 10, 19, 22].forEach(function (i) {
            barra_overlapping_1[i] = Math.max(y1_inter_1, y2_inter_1);
        });
        [2, 5, 8, 11].forEach(function (i) {
            barra_overlapping_1[i] = Math.min(z1_inter_1, z2_inter_1);
        });
        [14, 17, 20, 23].forEach(function (i) {
            barra_overlapping_1[i] = Math.max(z1_inter_1, z2_inter_1);
        });
        // 4c) Controllo se mat1 è nel materiale_dominante (in MATLAB: ismember(mat1, materiale_dominante))
        //     In TS, se materiale_dominante è un array, controlliamo se mat1 è compreso in quell'array
        var barra_to_split = void 0;
        var mat_to_split = void 0;
        // ismember(mat1, materiale_dominante)
        // => in TS possiamo fare: materiale_dominante.includes(mat1)
        if (materiale_dominante.includes(mat1)) {
            barre_out = [barra1];
            mat_out = [mat1];
            barra_to_split = barra2;
            mat_to_split = mat2;
        }
        else {
            barre_out = [barra2];
            mat_out = [mat2];
            barra_to_split = barra1;
            mat_to_split = mat1;
        }
        // 4d) Spezza la barra_to_split con x1_inter..z2_inter
        //     Restituisce un array di "pezzi" (barre)
        var barre_1 = spezza_x(barra_to_split, x1_inter_1, x2_inter_1);
        //    spezza_y 
        var coord_1 = [];
        barre_1.forEach(function (b) {
            var splittedY = spezza_y(b, y1_inter_1, y2_inter_1);
            coord_1 = coord_1.concat(splittedY);
        });
        //    spezza_z
        barre_1 = [];
        coord_1.forEach(function (c) {
            var splittedZ = spezza_z(c, z1_inter_1, z2_inter_1);
            barre_1 = barre_1.concat(splittedZ);
        });
        // 4e) Ricerco il pezzo che è "barra_overlapping"
        //     => in MATLAB: norm(barra_overlapping - barre(cont,:)) < 1e-10
        //     => in TS: confrontiamo ogni elemento e verifichiamo se differisce < 1e-10
        var to_remove_1 = barre_1.findIndex(function (b) {
            return isAlmostEqualArray(b, barra_overlapping_1, 1e-10);
        });
        // 4f) Se trovo quell'indice, rimuovo quell'elemento e aggiungo i rimanenti a "barre_out"
        if (to_remove_1 >= 0) {
            var new_barre = barre_1.filter(function (_, idx) { return idx !== to_remove_1; });
            barre_out = barre_out.concat(new_barre);
            // mat_out => aggiungiamo (N-1) volte mat_to_split
            mat_out = mat_out.concat(Array(new_barre.length).fill(mat_to_split));
        }
    }
    return { barre_out: barre_out, isOverlapped: isOverlapped, mat_out: mat_out };
}
// -------------------------------------------------------------------
// Funzioni di supporto
function round14(num) {
    // round(num*1e14)/1e14
    return Math.round(num * 1e14) / 1e14;
}
/** Confronto di due array (stessa lunghezza) per vedere se differiscono di < tol su ciascun elemento */
function isAlmostEqualArray(a, b, tol) {
    if (a.length !== b.length)
        return false;
    for (var i = 0; i < a.length; i++) {
        if (Math.abs(a[i] - b[i]) > tol) {
            return false;
        }
    }
    return true;
}
/** Spezza lungo x */
function spezza_x(barra, x1_inter, x2_inter) {
    var indici_x = [0, 3, 6, 9, 12, 15, 18, 21];
    var x1 = round14(Math.min.apply(Math, indici_x.map(function (i) { return barra[i]; })));
    var x2 = round14(Math.max.apply(Math, indici_x.map(function (i) { return barra[i]; })));
    var vect_x = Array.from(new Set([x1, x2, x1_inter, x2_inter])).sort(function (a, b) { return a - b; });
    var coord = [];
    var _loop_1 = function (cont) {
        var temp = __spreadArray([], barra, true);
        [0, 6, 12, 18].forEach(function (i) { return temp[i] = vect_x[cont]; });
        [3, 9, 15, 21].forEach(function (i) { return temp[i] = vect_x[cont + 1]; });
        coord.push(temp);
    };
    for (var cont = 0; cont < vect_x.length - 1; cont++) {
        _loop_1(cont);
    }
    return coord;
}
/** Spezza lungo y */
function spezza_y(barra, y1_inter, y2_inter) {
    var indici_y = [1, 4, 7, 10, 13, 16, 19, 22];
    var y1 = round14(Math.min.apply(Math, indici_y.map(function (i) { return barra[i]; })));
    var y2 = round14(Math.max.apply(Math, indici_y.map(function (i) { return barra[i]; })));
    var vect_y = Array.from(new Set([y1, y2, y1_inter, y2_inter])).sort(function (a, b) { return a - b; });
    var coord = [];
    var _loop_2 = function (cont) {
        var temp = __spreadArray([], barra, true);
        [1, 4, 13, 16].forEach(function (i) { return temp[i] = vect_y[cont]; });
        [7, 10, 19, 22].forEach(function (i) { return temp[i] = vect_y[cont + 1]; });
        coord.push(temp);
    };
    for (var cont = 0; cont < vect_y.length - 1; cont++) {
        _loop_2(cont);
    }
    return coord;
}
/** Spezza lungo z */
function spezza_z(barra, z1_inter, z2_inter) {
    var indici_z = [2, 5, 8, 11, 14, 17, 20, 23];
    var z1 = round14(Math.min.apply(Math, indici_z.map(function (i) { return barra[i]; })));
    var z2 = round14(Math.max.apply(Math, indici_z.map(function (i) { return barra[i]; })));
    var vect_z = Array.from(new Set([z1, z2, z1_inter, z2_inter])).sort(function (a, b) { return a - b; });
    var coord = [];
    var _loop_3 = function (cont) {
        var temp = __spreadArray([], barra, true);
        [2, 5, 8, 11].forEach(function (i) { return temp[i] = vect_z[cont]; });
        [14, 17, 20, 23].forEach(function (i) { return temp[i] = vect_z[cont + 1]; });
        coord.push(temp);
    };
    for (var cont = 0; cont < vect_z.length - 1; cont++) {
        _loop_3(cont);
    }
    return coord;
}
