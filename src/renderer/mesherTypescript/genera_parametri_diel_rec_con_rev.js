"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genera_parametri_diel_rec_con_rev = genera_parametri_diel_rec_con_rev;
function genera_parametri_diel_rec_con_rev(induttanze) {
    var eps0 = 8.854187816997944e-12;
    var Cp = [];
    if (induttanze.indici_Nd && induttanze.indici_Nd.length > 0) {
        induttanze.Cp = induttanze.epsr.map(function (epsr, i) {
            return eps0 * (epsr - 1) * induttanze.S[i] / induttanze.l[i];
        });
    }
    else {
        induttanze.Cp = [];
    }
    return induttanze;
}
