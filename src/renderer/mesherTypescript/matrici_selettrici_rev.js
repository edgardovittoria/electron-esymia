"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matrici_selettrici_rev = matrici_selettrici_rev;
function matrici_selettrici_rev(induttanze) {
    // Calcoliamo la dimensione N = numero di righe di estremi_celle
    var N = induttanze.estremi_celle.length;
    // 1) Calcolo di Nc (numero di righe con epsr(k) = 1)
    var Nc = 0;
    for (var k = 0; k < N; k++) {
        if (induttanze.epsr[k] === 1) {
            Nc++;
        }
    }
    induttanze.Nc = Nc;
    // 2) Calcolo di Nd = N - Nc
    var Nd = N - Nc;
    induttanze.Nd = Nd;
    // 3) Creiamo due array di zeri:
    //    - Sc di lunghezza Nc
    //    - Sd di lunghezza Nd
    induttanze.Sc = new Array(Nc).fill(0);
    induttanze.Sd = new Array(Nd).fill(0);
    // 4) In MATLAB:
    //    induttanze.Sc(1 : induttanze.Nc, 1) = 1;
    //    significa che tutti i valori di Sc vengono posti a 1.
    for (var i = 0; i < Nc; i++) {
        induttanze.Sc[i] = 1;
    }
    // 5) In MATLAB:
    //    induttanze.Sd(induttanze.Nc+1 : size(induttanze.estremi_celle,1), 1) = 1;
    //    assegna 1 a tutti gli elementi di Sd (da 1 a Nd).
    //    Poiché Sd è lungo Nd, li settiamo tutti a 1.
    for (var i = 0; i < Nd; i++) {
        induttanze.Sd[i] = 1;
    }
    // 6) Nb = Nc + Nd
    induttanze.Nb = Nc + Nd;
    return induttanze;
}
