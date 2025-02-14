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
exports.matrice_incidenza_rev = matrice_incidenza_rev;
var math = require("mathjs");
/**
*  `matrice_incidenza_rev` usando math.js per matrici sparse.
*
* @param LatiInd
*
* @param nodi_centri
*
* @param nodi_nodi_interni_coordinate
*
* @returns un oggetto con {estremi_lati, Rv, nodi_centri, A}.
*/
function matrice_incidenza_rev(LatiInd, // dimensione [2][NumLatiInd][3]
nodi_centri, // dimensione [Nc x 3]
nodi_nodi_interni_coordinate // [Ni x 3]
) {
    var NumAllNodi = nodi_centri.length;
    var NumInterni = nodi_nodi_interni_coordinate.length;
    var NodiCap1 = nodi_centri.slice(0, NumAllNodi - NumInterni);
    // NumLatiInd = size(LatiInd,2)
    // in TS: LatiInd[0].length => se LatiInd dimensione [2][NumLatiInd][3], 
    // allora LatiInd[0].length = NumLatiInd
    var NumLatiInd = LatiInd[0].length;
    // NumNodiCap = size(NodiCap1,1)
    var NumNodiCap = NodiCap1.length;
    // Rv = speye(2) in MATLAB => inizialmente 2x2 identità
    // Inizializza Rv come matrice sparsa vuota
    var Rv = math.sparse([]);
    // Costruiamo ncr = NodiCap1(1:2,:)
    // In TS => se NumNodiCap>=2, prendiamo i primi due, altrimenti quanti ne abbiamo.
    var ncr = [];
    if (NumNodiCap >= 1) {
        ncr.push(NodiCap1[0]);
        Rv.set([0, 0], 1); // Prima riga, prima colonna
    }
    if (NumNodiCap >= 2) {
        ncr.push(NodiCap1[1]);
        Rv.set([1, 1], 1); // Seconda riga, seconda colonna
    }
    // Se NumNodiCap=0, ncr rimane vuoto.
    // Se NumNodiCap>2, allora eseguiamo il loop
    // for k = 3:NumNodiCap
    // In TS: for (let k=2; k<NumNodiCap; k++)
    for (var k = 2; k < NumNodiCap; k++) {
        var cand = NodiCap1[k]; // la "riga" k (0-based => 3° nodo in MATLAB)
        // Troviamo se cand è già in ncr
        // m = find( (abs(ncr(:,1)-cand(1))<=1e-8) & ... )
        var foundIndex = -1;
        for (var i = 0; i < ncr.length; i++) {
            if (Math.abs(ncr[i][0] - cand[0]) <= 1e-8 &&
                Math.abs(ncr[i][1] - cand[1]) <= 1e-8 &&
                Math.abs(ncr[i][2] - cand[2]) <= 1e-8) {
                foundIndex = i;
                break;
            }
        }
        if (foundIndex < 0) {
            // non trovato => ncr=[ncr; cand]
            ncr.push(cand);
            // Imposta l'elemento corrispondente nella nuova colonna di Rv
            Rv.set([k, ncr.length - 1], 1);
        }
        else {
            // Imposta l'elemento corrispondente nella colonna esistente di Rv
            Rv.set([k, foundIndex], 1);
        }
    }
    // nr=size(ncr,1)
    var nr = ncr.length;
    // NodiCap2 = [ncr; nodi_nodi_interni_coordinate]
    // => in TS => concat
    var NodiCap2 = ncr.concat(nodi_nodi_interni_coordinate);
    // clear ncr -> in TS, semplicemente non serve più
    // A = sparse(NumLatiInd, size(NodiCap2,1))
    var NumNodiCap2 = NodiCap2.length;
    var A = math.sparse([], 'number'); // Inizia con una matrice sparsa vuota
    A.resize([NumLatiInd, NumNodiCap2]); // Imposta le dimensioni corrette
    // estremi_lati1 = cell(1, NumLatiInd)
    // estremi_lati2 = cell(1, NumLatiInd)
    // => in TS => array di array
    var estremi_lati = Array.from({ length: NumLatiInd }, function () { return []; });
    for (var k = 0; k < NumLatiInd; k++) {
        var lat1 = LatiInd[0][k];
        var lat2 = LatiInd[1][k];
        var ncMatches1 = [];
        var ncMatches2 = [];
        for (var i = 0; i < NumNodiCap2; i++) {
            if (Math.abs(lat1[0] - NodiCap2[i][0]) <= 1e-8 &&
                Math.abs(lat1[1] - NodiCap2[i][1]) <= 1e-8 &&
                Math.abs(lat1[2] - NodiCap2[i][2]) <= 1e-8) {
                ncMatches1.push(i);
            }
            if (Math.abs(lat2[0] - NodiCap2[i][0]) <= 1e-8 &&
                Math.abs(lat2[1] - NodiCap2[i][1]) <= 1e-8 &&
                Math.abs(lat2[2] - NodiCap2[i][2]) <= 1e-8) {
                ncMatches2.push(i);
            }
        }
        // Assegna i valori alla matrice sparsa A
        for (var _i = 0, ncMatches1_1 = ncMatches1; _i < ncMatches1_1.length; _i++) {
            var idx = ncMatches1_1[_i];
            A.set([k, idx], -1); // Usa set per matrici sparse
        }
        for (var _a = 0, ncMatches2_1 = ncMatches2; _a < ncMatches2_1.length; _a++) {
            var idx = ncMatches2_1[_a];
            A.set([k, idx], 1); // Usa set per matrici sparse
        }
        estremi_lati[k] = __spreadArray(__spreadArray([], ncMatches1, true), ncMatches2, true);
    }
    // In MATLAB: nodi_centri = NodiCap2
    // => aggiorniamo la variabile di input 'nodi_centri' con i nuovi nodi
    nodi_centri = NodiCap2;
    // Ritorniamo i 4 output
    return {
        estremi_lati: estremi_lati,
        Rv: Rv,
        nodi_centri: nodi_centri,
        A: A
    };
}
