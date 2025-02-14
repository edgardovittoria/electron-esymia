"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genera_celle_magnetizzazione_sup = genera_celle_magnetizzazione_sup;
// genera_celle_magnetizzazione_sup.ts (non ha implementazione)
function genera_celle_magnetizzazione_sup(r_nodi_barra, weights_five, roots_five, faceType) {
    return {
        celle_mag_p: Array.from({ length: 8 }, function () { return new Array(12).fill(0); }), // 8x12
        Sup_m_p: new Array(4).fill(0),
        l_m_p: new Array(4).fill(0),
        width_m_p: new Array(4).fill(0),
        vers_m_p: Array.from({ length: 8 }, function () { return [0, 0, 0]; }),
        norm_m_p: Array.from({ length: 8 }, function () { return [0, 0, 0]; }),
    };
}
