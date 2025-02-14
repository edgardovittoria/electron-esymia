"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genera_estremi_lati_per_oggetto_rev = genera_estremi_lati_per_oggetto_rev;
function genera_estremi_lati_per_oggetto_rev(lati_per_oggetto_inp, NodiRed, Nodi_i, lato1, lato2, offset) {
    // 1) Ricaviamo le dimensioni
    var numlati = lato1.length; // in MATLAB: size(lato1,1)
    var latiprec = lati_per_oggetto_inp.length; // in MATLAB: size(lati_per_oggetto_inp,1)
    var lati_per_oggetto = lati_per_oggetto_inp.slice(); // copia iniziale
    for (var i = 0; i < numlati; i++) {
        lati_per_oggetto.push([0, 0]);
    }
    // 3) Cicliamo sui nuovi "lati" (1..numlati in MATLAB => 0..numlati-1 in TS)
    for (var k = 0; k < numlati; k++) {
        // Creiamo una variabile "lato" = [lato(1), lato(2)] in MATLAB => qui array di 2 numeri
        var lato = [0, 0];
        // ====== Primo estremo (lato1) ======
        //   index = find( ... ) su NodiRed => se empty => find(...) su Nodi_i
        var idx = firstMatchIndex(NodiRed, lato1[k], 1e-8, 1e-8, 1e-12);
        if (idx < 0) {
            // Non trovato in NodiRed => cerchiamo in Nodi_i
            idx = firstMatchIndex(Nodi_i, lato1[k], 1e-8, 1e-8, 1e-12);
            if (idx < 0) {
                // Caso estremo: non trovato neanche in Nodi_i
                console.warn("Primo estremo non trovato né in NodiRed né in Nodi_i!");
                lato[0] = 0;
            }
            else {
                // Se trovato in Nodi_i => MATLAB fa "lato(1) = -index(1)"
                //  index(1) in MATLAB => idx+1 in TS
                lato[0] = -(idx + 1);
            }
        }
        else {
            // Se trovato in NodiRed => "lato(1) = index(1) + offset"
            lato[0] = (idx + 1) + offset;
        }
        // ====== Secondo estremo (lato2) ======
        idx = firstMatchIndex(NodiRed, lato2[k], 1e-8, 1e-8, 1e-12);
        if (idx < 0) {
            // non in NodiRed => check in Nodi_i
            idx = firstMatchIndex(Nodi_i, lato2[k], 1e-8, 1e-8, 1e-12);
            if (idx < 0) {
                console.warn("Secondo estremo non trovato né in NodiRed né in Nodi_i!");
                lato[1] = 0;
            }
            else {
                // lato(2) = -index(1)
                lato[1] = -(idx + 1);
            }
        }
        else {
            // lato(2) = index(1) + offset
            lato[1] = (idx + 1) + offset;
        }
        // 4) Assegniamo il risultato nella riga (k+latiprec) => 0-based
        // in MATLAB: lati_per_oggetto(k+latiprec,:) = lato
        lati_per_oggetto[k + latiprec] = [lato[0], lato[1]];
    }
    // 5) Restituiamo l'array finale
    return lati_per_oggetto;
}
/**
 * Helper per trovare il **primo** indice i in `arr` tale che
 * arr[i][0..2] coincide con node[0..2] entro le tolleranze
 * (tolX, tolY, tolZ).
 *
 * Se nessuno corrisponde, restituisce -1.
 */
function firstMatchIndex(arr, node, tolX, tolY, tolZ) {
    for (var i = 0; i < arr.length; i++) {
        var dx = Math.abs(arr[i][0] - node[0]);
        var dy = Math.abs(arr[i][1] - node[1]);
        var dz = Math.abs(arr[i][2] - node[2]);
        if (dx <= tolX && dy <= tolY && dz <= tolZ) {
            return i; // 0-based
        }
    }
    return -1;
}
