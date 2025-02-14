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
exports.FindInternalNodesCommon2FourObjects_rev = FindInternalNodesCommon2FourObjects_rev;
/**
 * Trova i nodi "interni" comuni a 4 oggetti,
 *
 * @param nodi_centri - array Nx3 con i nodi "centri" (esterni)
 * @param NodiRed - array Mx3 con nodi generali
 * @returns array di nodi (x,y,z) considerati interni
 */
function FindInternalNodesCommon2FourObjects_rev(nodi_centri, NodiRed) {
    var NumNodesSup = NodiRed.length;
    var InternalNodes = [];
    for (var m = 0; m < NumNodesSup; m++) {
        // 1) Troviamo tutti gli indici i in [0..NumNodesSup-1] 
        //    tali che NodiRed(i) ~ NodiRed(m) entro 1e-10
        var matchingIndices = findMatchingCoords(NodiRed, NodiRed[m], 1e-10);
        // matchingIndices corrisponde a 'n' in MATLAB
        // 2) Se length(n) >= 4
        if (matchingIndices.length >= 4) {
            // 3) Controlliamo se NodiRed(m,:) è in nodi_centri
            //    In MATLAB: k=find(...); if isempty(k) => non trovato
            var isInNodiCentri = isNodeInArray(nodi_centri, NodiRed[m], 1e-10);
            if (!isInNodiCentri) {
                // 4) Se non in nodi_centri, verifichiamo se non è già in InternalNodes
                var isInInternal = isNodeInArray(InternalNodes, NodiRed[m], 1e-10);
                if (!isInInternal) {
                    // => Aggiungiamo
                    InternalNodes.push(__spreadArray([], NodiRed[m], true));
                }
            }
        }
    }
    return InternalNodes;
}
/**
 * Trova tutti gli indici i tali che NodiRed[i] è uguale a node
 * (entro tolleranza `tol`) nelle 3 coordinate.
 *
 * @param arr array Nx3
 * @param node array [x,y,z]
 * @param tol tolleranza
 * @returns lista di indici
 */
function findMatchingCoords(arr, node, tol) {
    var out = [];
    for (var i = 0; i < arr.length; i++) {
        var dx = Math.abs(arr[i][0] - node[0]);
        var dy = Math.abs(arr[i][1] - node[1]);
        var dz = Math.abs(arr[i][2] - node[2]);
        if (dx <= tol && dy <= tol && dz <= tol) {
            out.push(i);
        }
    }
    return out;
}
/**
 * Verifica se un certo nodo [x,y,z] è presente (entro tol) in un array di nodi Nx3.
 *
 * @param arr
 * @param node
 * @param tol
 * @returns true se esiste almeno un match
 */
function isNodeInArray(arr, node, tol) {
    for (var i = 0; i < arr.length; i++) {
        var dx = arr[i][0] - node[0];
        var dy = arr[i][1] - node[1];
        var dz = arr[i][2] - node[2];
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist <= tol) {
            return true;
        }
    }
    return false;
}
