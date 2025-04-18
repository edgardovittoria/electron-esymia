"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifica_patches_coincidenti = verifica_patches_coincidenti;
/**
 * Verifica se due patch (ciascuno di 4 vertici 3D) sono coincidenti,
 * ossia se tutti i 4 vertici del secondo patch compaiono tra i 4 del primo
 * (entro la tolleranza 1e-12).

 * @param nodi_estremi_celle dimensione [2 x 12], dove
 *   - nodi_estremi_celle[0] = [x1,y1,z1, x2,y2,z2, x3,y3,z3, x4,y4,z4]
 *   - nodi_estremi_celle[1] = [x1',y1',z1', x2',y2',z2', x3',y3',z3', x4',y4',z4']
 * @returns true se i 2 patch coincidono, false altrimenti
 */
function verifica_patches_coincidenti(nodi_estremi_celle) {
    if (nodi_estremi_celle.length < 2) {
        // se per qualche ragione c'è 1 sola riga, non possiamo confrontare 2 patch
        return false;
    }
    // Estraggo i 4 vertici del primo patch
    var corners1 = [];
    for (var i = 0; i < 4; i++) {
        var baseIndex = 3 * i; // 0,3,6,9
        corners1.push([
            nodi_estremi_celle[0][baseIndex],
            nodi_estremi_celle[0][baseIndex + 1],
            nodi_estremi_celle[0][baseIndex + 2]
        ]);
    }
    // Estraggo i 4 vertici del secondo patch
    var corners2 = [];
    for (var i = 0; i < 4; i++) {
        var baseIndex = 3 * i;
        corners2.push([
            nodi_estremi_celle[1][baseIndex],
            nodi_estremi_celle[1][baseIndex + 1],
            nodi_estremi_celle[1][baseIndex + 2]
        ]);
    }
    // "coinc" in MATLAB è un array di 4, inizializzato a 0. 
    // In TS useremo un contatore o un array booleano.
    var foundCount = 0;
    // Per ognuno dei 4 vertici di corners2, verifichiamo se esiste 
    // almeno un vertice in corners1 con distanza < 1e-12
    for (var n = 0; n < 4; n++) {
        var v2 = corners2[n];
        var cornerFound = false;
        for (var m = 0; m < 4; m++) {
            var v1 = corners1[m];
            var dx = v1[0] - v2[0];
            var dy = v1[1] - v2[1];
            var dz = v1[2] - v2[2];
            var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < 1e-12) {
                // Trovato match per vertice n
                cornerFound = true;
                break;
            }
        }
        if (cornerFound) {
            foundCount++;
        }
    }
    // In MATLAB: if all(coinc)==1 => coinc_fin=1, else 0
    // "all(coinc)==1" => tutti i 4 vertici del secondo patch sono stati trovati => foundCount=4
    return (foundCount === 4);
}
