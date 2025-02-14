"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linspace = linspace;
/**
 * Genera un vettore di numeri equamente spaziati.
 *
 * @param start Il valore iniziale della sequenza.
 * @param stop Il valore finale della sequenza.
 * @param num Il numero di punti da generare (predefinito: 100).
 * @returns Un array contenente la sequenza di numeri generata.
 */
function linspace(start, stop, num) {
    if (num === void 0) { num = 100; }
    // Crea un array vuoto per memorizzare i risultati.
    var result = [];
    // Calcola l'intervallo tra ogni punto.
    var step = (stop - start) / (num - 1);
    // Genera la sequenza di numeri.
    for (var i = 0; i < num; i++) {
        // Calcola il valore corrente e lo aggiunge all'array.
        result.push(start + step * i);
    }
    // Restituisce l'array contenente la sequenza.
    return result;
}
