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
exports.sistema_coordinate = sistema_coordinate;
exports.apply_convention = apply_convention;
var round_ud_1 = require("./round_ud");
function sistema_coordinate(coord, materiale) {
    var nBarre = coord.length;
    var new_coord = coord.map(function (row) { return (0, round_ud_1.round_ud)(row, 10); });
    var new_materiale = __spreadArray([], materiale, true);
    if (nBarre > 1) {
        var continua = 1;
        var c1_1 = 0;
        var _loop_1 = function () {
            var c2 = c1_1 + 1;
            var tagliata = false;
            while (continua === 1 && c2 < nBarre) {
                if (c1_1 !== c2) {
                    var verifyResult = verifyTouchObj({ data: coord[c1_1] }, { data: coord[c2] });
                    if (verifyResult.cutted === 1) {
                        var auxCord = void 0;
                        var indiciNotCut = void 0;
                        if (verifyResult.inverted === 0) {
                            auxCord = taglia(coord[c1_1], verifyResult.a, verifyResult.b, verifyResult.c, verifyResult.c_o1);
                            indiciNotCut = Array.from({ length: nBarre }, function (_, i) { return i; }).filter(function (i) { return i !== c1_1; });
                            new_coord = __spreadArray(__spreadArray([], auxCord, true), indiciNotCut.map(function (i) { return coord[i]; }), true);
                            new_materiale = __spreadArray(__spreadArray([], Array(auxCord.length).fill(materiale[c1_1]), true), indiciNotCut.map(function (i) { return materiale[i]; }), true);
                        }
                        else {
                            auxCord = taglia(coord[c2], verifyResult.a, verifyResult.b, verifyResult.c, verifyResult.c_o2);
                            indiciNotCut = Array.from({ length: nBarre }, function (_, i) { return i; }).filter(function (i) { return i !== c2; });
                            new_coord = __spreadArray(__spreadArray([], auxCord, true), indiciNotCut.map(function (i) { return coord[i]; }), true);
                            new_materiale = __spreadArray(__spreadArray([], Array(auxCord.length).fill(materiale[c2]), true), indiciNotCut.map(function (i) { return materiale[i]; }), true);
                        }
                        nBarre = nBarre - 1 + auxCord.length;
                        continua = 0;
                        c1_1 = -1; // Per ricominciare il ciclo esterno
                        coord = new_coord;
                        materiale = new_materiale;
                        coord = coord.map(function (row) { return (0, round_ud_1.round_ud)(row, 10); });
                        tagliata = true;
                        break; // Esce dal ciclo interno per ricominciare
                    }
                }
                c2++;
            }
            if (tagliata) {
                // Ricomincia dal primo elemento
                c1_1 = -1; // Verrà incrementato a 0 all'inizio del prossimo ciclo
            }
            c1_1++;
            continua = 1;
        };
        while (c1_1 < nBarre) {
            _loop_1();
        }
    }
    console.log("Numero finale di barre:", nBarre);
    console.log("Coordinate finali:", new_coord);
    console.log("Materiale finale:", new_materiale);
    return { new_coord: new_coord, materiale: new_materiale };
}
var interpolating_vectors_1 = require("./interpolating_vectors");
function taglia(barra, a, b, c, num_faccia) {
    var _a;
    var Npuntix = a.length;
    var Npuntiy = b.length;
    var Npuntiz = c.length;
    var indici_x = [0, 3, 6, 9, 12, 15, 18, 21];
    var indici_y = [1, 4, 7, 10, 13, 16, 19, 22];
    var indici_z = [2, 5, 8, 11, 14, 17, 20, 23];
    var val_x = indici_x.map(function (i) { return (0, round_ud_1.round_ud)([barra[i]], 10)[0]; });
    var val_y = indici_y.map(function (i) { return (0, round_ud_1.round_ud)([barra[i]], 10)[0]; });
    var val_z = indici_z.map(function (i) { return (0, round_ud_1.round_ud)([barra[i]], 10)[0]; });
    if (!(new Set(val_x).size === 2 && new Set(val_y).size === 2 && new Set(val_z).size === 2)) {
        var f1 = getFace(num_faccia, barra);
        var f2_1;
        var permutation = void 0;
        (_a = apply_convention(f1), f1 = _a.f_out, permutation = _a.permutation);
        f2_1 = f1;
        if (num_faccia === 1 || num_faccia === 3) {
            f2_1 = getFace(num_faccia === 1 ? 3 : 1, barra);
        }
        else if (num_faccia === 2 || num_faccia === 4) {
            f2_1 = getFace(num_faccia === 2 ? 4 : 2, barra);
        }
        else if (num_faccia === 5 || num_faccia === 6) {
            f2_1 = getFace(num_faccia === 5 ? 6 : 5, barra);
        }
        f2_1 = permutation.map(function (i) { return f2_1[i - 1]; });
        if (a.length > 2 || (b.length > 2 && Math.abs(f1[2] - f1[11]) < 1e-10)) {
            barra = __spreadArray(__spreadArray([], f1, true), f2_1, true);
        }
        else if (b.length > 2 && Math.abs(f1[2] - f1[11]) > 1e-10) {
            barra = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], f1.slice(0, 3), true), f1.slice(6, 9), true), f1.slice(3, 6), true), f1.slice(9, 12), true), f2_1.slice(0, 3), true), f2_1.slice(6, 9), true), f2_1.slice(3, 6), true), f2_1.slice(9, 12), true);
        }
        else if (c.length > 2) {
            barra = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], f1.slice(0, 6), true), f2_1.slice(0, 6), true), f1.slice(6, 12), true), f2_1.slice(6, 12), true);
        }
    }
    var ri = [
        barra.slice(0, 3),
        barra.slice(3, 6),
        barra.slice(6, 9),
        barra.slice(9, 12),
        barra.slice(12, 15),
        barra.slice(15, 18),
        barra.slice(18, 21),
        barra.slice(21, 24)
    ];
    var _b = (0, interpolating_vectors_1.interpolating_vectors)(ri), rmi = _b.rmi, rai = _b.rai, rbi = _b.rbi, rci = _b.rci, rabi = _b.rabi, rbci = _b.rbci, raci = _b.raci, rabci = _b.rabci;
    var rp = Array.from({ length: Npuntix }, function () {
        return Array.from({ length: Npuntiy }, function () {
            return Array.from({ length: Npuntiz }, function () { return [0, 0, 0]; });
        });
    });
    for (var n = 0; n < Npuntiz; n++) {
        for (var m = 0; m < Npuntiy; m++) {
            for (var l = 0; l < Npuntix; l++) {
                rp[l][m][n][0] = rmi[0] + rai[0] * a[l] + rbi[0] * b[m] + rci[0] * c[n] + rabi[0] * a[l] * b[m] +
                    rbci[0] * b[m] * c[n] + raci[0] * a[l] * c[n] + rabci[0] * a[l] * b[m] * c[n];
                rp[l][m][n][1] = rmi[1] + rai[1] * a[l] + rbi[1] * b[m] + rci[1] * c[n] + rabi[1] * a[l] * b[m] +
                    rbci[1] * b[m] * c[n] + raci[1] * a[l] * c[n] + rabci[1] * a[l] * b[m] * c[n];
                rp[l][m][n][2] = rmi[2] + rai[2] * a[l] + rbi[2] * b[m] + rci[2] * c[n] + rabi[2] * a[l] * b[m] +
                    rbci[2] * b[m] * c[n] + raci[2] * a[l] * c[n] + rabci[2] * a[l] * b[m] * c[n];
            }
        }
    }
    var coord = Array.from({ length: 2 }, function () { return Array(24).fill(0); });
    if (a.length > 2) {
        coord[0] = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], rp[0][0][0], true), rp[1][0][0], true), rp[0][1][0], true), rp[1][1][0], true), rp[0][0][1], true), rp[1][0][1], true), rp[0][1][1], true), rp[1][1][1], true);
        coord[1] = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], rp[1][0][0], true), rp[2][0][0], true), rp[1][1][0], true), rp[2][1][0], true), rp[1][0][1], true), rp[2][0][1], true), rp[1][1][1], true), rp[2][1][1], true);
    }
    if (b.length > 2) {
        coord[0] = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], rp[0][0][0], true), rp[1][0][0], true), rp[0][1][0], true), rp[1][1][0], true), rp[0][0][1], true), rp[1][0][1], true), rp[0][1][1], true), rp[1][1][1], true);
        coord[1] = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], rp[0][1][0], true), rp[1][1][0], true), rp[0][2][0], true), rp[1][2][0], true), rp[0][1][1], true), rp[1][1][1], true), rp[0][2][1], true), rp[1][2][1], true);
    }
    if (c.length > 2) {
        coord[0] = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], rp[0][0][0], true), rp[1][0][0], true), rp[0][1][0], true), rp[1][1][0], true), rp[0][0][1], true), rp[1][0][1], true), rp[0][1][1], true), rp[1][1][1], true);
        coord[1] = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], rp[0][0][1], true), rp[1][0][1], true), rp[0][1][1], true), rp[1][1][1], true), rp[0][0][2], true), rp[1][0][2], true), rp[0][1][2], true), rp[1][1][2], true);
    }
    return coord;
}
// Funzione per calcolare la norma euclidea di un vettore o la differenza tra due vettori
function norm(v1, v2) {
    var sum = 0;
    if (v2) {
        for (var i = 0; i < v1.length; i++) {
            sum += Math.pow((v1[i] - v2[i]), 2);
        }
    }
    else {
        for (var i = 0; i < v1.length; i++) {
            sum += Math.pow(v1[i], 2);
        }
    }
    return Math.sqrt(sum);
}
function control_share(f1, f2, norma) {
    var cutted = 0;
    var a = [-1, 1];
    var b = [-1, 1];
    var c = [-1, 1];
    var inverted = 0;
    var ind_x = [0, 3, 6, 9];
    var ind_y = [1, 4, 7, 10];
    var ind_z = [2, 5, 8, 11];
    function check_and_cut(f1_local, f2_local, norma_local) {
        var shared = 0;
        if (norm(norma_local, [0, 0, 1]) < 1e-10) {
            if (Math.abs(f1_local[11] - f2_local[11]) < 1e-10) {
                var _a = find_cut(f1_local, f2_local, ind_x), sharex = _a[0], vectx = _a[1];
                var _b = find_cut(f1_local, f2_local, ind_y), sharey = _b[0], vecty = _b[1];
                a = cambio(Array.from(new Set(vectx)).sort(function (a, b) { return a - b; }));
                b = cambio(Array.from(new Set(vecty)).sort(function (a, b) { return a - b; }));
                shared = sharex * sharey;
            }
        }
        else if (norm(norma_local, [0, 1, 0]) < 1e-10) {
            if (Math.abs(f1_local[1] - f2_local[1]) < 1e-10) {
                var _c = find_cut(f1_local, f2_local, ind_x), sharex = _c[0], vectx = _c[1];
                var _d = find_cut(f1_local, f2_local, ind_z), sharez = _d[0], vectz = _d[1];
                a = cambio(Array.from(new Set(vectx)).sort(function (a, b) { return a - b; }));
                c = cambio(Array.from(new Set(vectz)).sort(function (a, b) { return a - b; }));
                shared = sharex * sharez;
            }
        }
        else if (norm(norma_local, [1, 0, 0]) < 1e-10) {
            if (Math.abs(f1_local[0] - f2_local[0]) < 1e-10) {
                var _e = find_cut(f1_local, f2_local, ind_y), sharey = _e[0], vecty = _e[1];
                var _f = find_cut(f1_local, f2_local, ind_z), sharez = _f[0], vectz = _f[1];
                b = cambio(Array.from(new Set(vecty)).sort(function (a, b) { return a - b; }));
                c = cambio(Array.from(new Set(vectz)).sort(function (a, b) { return a - b; }));
                shared = sharey * sharez;
            }
        }
        if (shared === 1) {
            if (a.length > 2) {
                b = [-1, 1];
                c = [-1, 1];
                cutted = 1;
            }
            else if (b.length > 2) {
                a = [-1, 1];
                c = [-1, 1];
                cutted = 1;
            }
            else if (c.length > 2) {
                a = [-1, 1];
                b = [-1, 1];
                cutted = 1;
            }
        }
    }
    check_and_cut(f1, f2, norma);
    if (cutted === 0) {
        inverted = 1;
        check_and_cut(f2, f1, norma);
    }
    return { cutted: cutted, a: a, b: b, c: c, inverted: inverted };
}
function getFace(n, obj) {
    if (obj.length < 24) {
        throw new Error("L'array obj deve contenere almeno 24 elementi.");
    }
    // Indici predefiniti per ogni faccia
    // (Ricorda che gli indici in TypeScript partono da 0)
    var indices = [
        [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17], // Faccia 1 (n=1 in MATLAB)
        [3, 4, 5, 9, 10, 11, 15, 16, 17, 21, 22, 23], // Faccia 2 (n=2 in MATLAB)
        [6, 7, 8, 9, 10, 11, 18, 19, 20, 21, 22, 23], // Faccia 3 (n=3 in MATLAB)
        [0, 1, 2, 6, 7, 8, 12, 13, 14, 18, 19, 20], // Faccia 4 (n=4 in MATLAB)
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Faccia 5 (n=5 in MATLAB)
        [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], // Faccia 6 (n=6 in MATLAB)
    ];
    if (n < 1 || n > 6) {
        throw new Error("Numero di faccia non valido. Deve essere compreso tra 1 e 6.");
    }
    // Restituisce i valori di obj agli indici specifici della faccia
    return indices[n - 1].map(function (i) { return obj[i]; });
}
function find_cut(f1, f2, ind) {
    var share = 0;
    // Recupera i valori dai due array (adattando gli indici per TypeScript)
    var c1 = f1[ind[0]]; // Inizio intervallo 1
    var c2 = f1[ind[3]]; // Fine intervallo 1
    var c3 = f2[ind[0]]; // Inizio intervallo 2
    var c4 = f2[ind[3]]; // Fine intervallo 2
    // Inizializza vect con valori predefiniti
    var vect = [-1, 1];
    // Determina i valori di vect in base alle condizioni
    if (c1 < c4 && c2 > c4) {
        // Ordina direttamente i tre valori c1, c4, c2
        vect = [Math.min(c1, c4, c2), Math.max(Math.min(c1, c4), Math.min(Math.max(c1, c4), c2)), Math.max(c1, c4, c2)];
    }
    else if (c1 < c3 && c2 > c3) {
        // Ordina direttamente i tre valori c1, c3, c2
        vect = [Math.min(c1, c3, c2), Math.max(Math.min(c1, c3), Math.min(Math.max(c1, c3), c2)), Math.max(c1, c3, c2)];
    }
    // Verifica la condizione di sovrapposizione
    if ((c1 >= c3 && c4 >= c1) || // Intervallo 1 inizia all'interno di Intervallo 2
        (c2 >= c3 && c4 >= c2) || // Intervallo 1 finisce all'interno di Intervallo 2
        (c3 >= c1 && c2 >= c3) || // Intervallo 2 inizia all'interno di Intervallo 1
        (c4 >= c1 && c2 >= c4) // Intervallo 2 finisce all'interno di Intervallo 1
    ) {
        share = 1;
    }
    return [share, vect];
}
function cambio(r) {
    var h = r.length;
    if (h === 0) {
        throw new Error("L'array 'r' non può essere vuoto.");
    }
    var rm = (r[0] + r[h - 1]) / 2; // Calcolo del valore medio tra il primo e l'ultimo elemento
    var r12 = (r[h - 1] - r[0]) / 2; // Calcolo della metà della differenza tra l'ultimo e il primo elemento
    if (r12 === 0) {
        // Gestione del caso di divisione per zero:
        // Opzione 1: Lanciare un'eccezione
        // throw new Error("Impossibile applicare la trasformazione: la differenza tra l'ultimo e il primo elemento è zero.");
        // Opzione 2: Restituire un array di NaN (Not a Number)
        return new Array(h).fill(NaN);
    }
    // Applicazione della trasformazione
    return r.map(function (val) { return (val - rm) / r12; });
}
function computeNormale(f1) {
    if (f1.length < 9) {
        throw new Error("L'array f1 deve contenere almeno 9 elementi (tre punti 3D).");
    }
    // Calcolo del prodotto vettoriale dei vettori (f1[3:5]-f1[0:2]) e (f1[6:8]-f1[0:2])
    var norm = [
        (f1[4] - f1[1]) * (f1[8] - f1[2]) - (f1[5] - f1[2]) * (f1[7] - f1[1]), // x
        (f1[5] - f1[2]) * (f1[6] - f1[0]) - (f1[3] - f1[0]) * (f1[8] - f1[2]), // y
        (f1[3] - f1[0]) * (f1[7] - f1[1]) - (f1[4] - f1[1]) * (f1[6] - f1[0]) // z
    ];
    // Calcolo della norma del vettore risultante
    var magnitude = Math.sqrt(Math.pow(norm[0], 2) + Math.pow(norm[1], 2) + Math.pow(norm[2], 2));
    if (magnitude === 0) {
        throw new Error("I punti forniti sono collineari, impossibile calcolare una normale.");
    }
    // Normalizzazione del vettore
    return [norm[0] / magnitude, norm[1] / magnitude, norm[2] / magnitude];
}
function apply_convention(f) {
    var is_orto = 0;
    var ind_x = [0, 3, 6, 9];
    var ind_y = [1, 4, 7, 10];
    var ind_z = [2, 5, 8, 11];
    var x = f.filter(function (_, i) { return ind_x.includes(i); }).sort(function (a, b) { return a - b; });
    var y = f.filter(function (_, i) { return ind_y.includes(i); }).sort(function (a, b) { return a - b; });
    var z = f.filter(function (_, i) { return ind_z.includes(i); }).sort(function (a, b) { return a - b; });
    var f_out = __spreadArray([], f, true);
    var norma = computeNormale(f);
    norma = norma.map(function (v) { return Math.abs(v); });
    if (norm(norma, [1, 0, 0]) < 1e-12 && new Set(y).size === 2 && new Set(z).size === 2) {
        f_out = [x[0], y[0], z[0], x[0], y[3], z[0], x[0], y[0], z[3], x[0], y[3], z[3]];
        is_orto = 1;
    }
    if (norm(norma, [0, 1, 0]) < 1e-12 && new Set(x).size === 2 && new Set(z).size === 2) {
        f_out = [x[0], y[0], z[0], x[3], y[0], z[0], x[0], y[0], z[3], x[3], y[0], z[3]];
        is_orto = 1;
    }
    if (norm(norma, [0, 0, 1]) < 1e-12 && new Set(x).size === 2 && new Set(y).size === 2) {
        f_out = [x[0], y[0], z[0], x[3], y[0], z[0], x[0], y[3], z[0], x[3], y[3], z[0]];
        is_orto = 1;
    }
    var permutation = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    var v1 = f.slice(0, 3);
    var v2 = f.slice(3, 6);
    var v3 = f.slice(6, 9);
    var v4 = f.slice(9, 12);
    var v1_out = f_out.slice(0, 3);
    var v2_out = f_out.slice(3, 6);
    var v3_out = f_out.slice(6, 9);
    var v4_out = f_out.slice(9, 12);
    var vertices = [
        [v1, v1_out], [v2, v1_out], [v3, v1_out], [v4, v1_out],
        [v1, v2_out], [v2, v2_out], [v3, v2_out], [v4, v2_out],
        [v1, v3_out], [v2, v3_out], [v3, v3_out], [v4, v3_out],
        [v1, v4_out], [v2, v4_out], [v3, v4_out], [v4, v4_out]
    ];
    for (var i = 0; i < vertices.length; i++) {
        var v = vertices[i][0];
        var v_out = vertices[i][1];
        var start = (i % 4) * 3;
        if (norm(v, v_out) < 1e-12) {
            permutation.splice(start, 3, start + 1, start + 2, start + 3);
        }
    }
    return { is_orto: is_orto, norma: norma, f_out: f_out, permutation: permutation };
}
function checkTouchObj(f1, f2) {
    var inverted = 0;
    // Applica la convenzione alle due facce
    var _a = apply_convention(f1), is_orto1 = _a.is_orto, norm1 = _a.norma, f1_out = _a.f_out;
    var _b = apply_convention(f2), is_orto2 = _b.is_orto, norm2 = _b.norma, f2_out = _b.f_out;
    // Calcola la norma della differenza tra le normali (per verificare se sono parallele)
    var normalsDistance = norm(norm1, norm2);
    var cutted = 0;
    var a = [-1, 1];
    var b = [-1, 1];
    var c = [-1, 1];
    // Se le normali sono uguali (distanza < tolleranza) e entrambe le facce sono ortogonali agli assi
    if (normalsDistance < 1e-12 && is_orto1 === 1 && is_orto2 === 1) {
        // Controlla se le facce si intersecano
        var shareResult = control_share(f1_out, f2_out, norm1);
        cutted = shareResult.cutted;
        a = shareResult.a;
        b = shareResult.b;
        c = shareResult.c;
        inverted = shareResult.inverted;
    }
    return { cutted: cutted, a: a, b: b, c: c, inverted: inverted };
}
/**
 * Verifica se due oggetti si toccano tramite le loro facce.
 * @param obj1 - Primo oggetto con dati delle facce.
 * @param obj2 - Secondo oggetto con dati delle facce.
 * @returns Informazioni sul contatto tra le facce.
 */
function verifyTouchObj(obj1, obj2) {
    var MAX_FACES = 6; // Numero massimo di facce per ogni oggetto
    var cutted = 0;
    var inverted = 0;
    var a = [-1, 1];
    var b = [-1, 1];
    var c = [-1, 1];
    var c_o1 = 1;
    var c_o2 = 1;
    var continua = 1;
    // Itera su tutte le combinazioni di facce
    for (var c1 = 1; c1 <= MAX_FACES && continua === 1; c1++) {
        for (var c2 = 1; c2 <= MAX_FACES && continua === 1; c2++) {
            try {
                var f1 = getFace(c1, obj1.data);
                var f2 = getFace(c2, obj2.data);
                var touchResult = checkTouchObj(f1, f2);
                if (touchResult.cutted === 1) {
                    cutted = 1;
                    a = touchResult.a;
                    b = touchResult.b;
                    c = touchResult.c;
                    inverted = touchResult.inverted;
                    c_o1 = c1;
                    c_o2 = c2;
                    continua = 0;
                }
            }
            catch (error) {
                // Gestione degli errori nel caso in cui getFace lanci un'eccezione
                console.error("Errore durante la verifica delle facce ".concat(c1, " di obj1 e ").concat(c2, " di obj2:"), error);
            }
        }
    }
    return { cutted: cutted, a: a, b: b, c: c, inverted: inverted, c_o1: c_o1, c_o2: c_o2 };
}
