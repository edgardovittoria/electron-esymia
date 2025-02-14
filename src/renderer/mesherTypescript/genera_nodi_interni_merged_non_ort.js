"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genera_nodi_interni_merged_non_ort = genera_nodi_interni_merged_non_ort;
var verifica_nodo_interno_1 = require("./verifica_nodo_interno");
/**
 * Utility: controlla se `p` è già presente in `Nodi_i` entro tolleranza 1e-12.
 */
function isInNodiI(p, Nodi_i) {
    for (var k2 = 0; k2 < Nodi_i.length; k2++) {
        // Se la norma della differenza < 1e-12 -> p è uguale a Nodi_i[k2]
        var dx = p[0] - Nodi_i[k2][0];
        var dy = p[1] - Nodi_i[k2][1];
        var dz = p[2] - Nodi_i[k2][2];
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 1e-12) {
            return true;
        }
    }
    return false;
}
/**
 * Porting di `genera_nodi_interni_merged_non_ort`.
 * @param Regioni - Struttura con coordinate e parametri (cond, epsr, mur)
 * @param nodi_nodi - array Nx3 con coordinate di possibili nodi
 * @param primo_ciclo - indice k in MATLAB
 * @param Nodi_i - nodi interni già noti
 * @returns Nodi_interni_output, un array di nodi [x,y,z]
 */
function genera_nodi_interni_merged_non_ort(Regioni, nodi_nodi, primo_ciclo, Nodi_i) {
    var Nregioni = Regioni.coordinate.length;
    var Nnodi = nodi_nodi.length;
    var Nodi_interni_output = [];
    var k = primo_ciclo; // in MATLAB si usava k=primo_ciclo
    var n_nodi_int = Nodi_i.length; // size(Nodi_i,1)
    for (var m = 0; m < Nregioni; m++) {
        if (m !== k) {
            var contatto = 0;
            var vertici_contatto = [];
            // Verifica se cond, epsr, mur coincidono
            if (Regioni.cond[k] === Regioni.cond[m] &&
                Regioni.epsr[k] === Regioni.epsr[m] &&
                Regioni.mur[k] === Regioni.mur[m]) {
                // Cerchiamo i vertici coincidenti
                // In MATLAB: for k1=1:8, for k2=1:8
                // In TS => 0..7, e i triple in coordinate(k, 3*k1..3*k1+2)
                for (var k1 = 0; k1 < 8; k1++) {
                    // v1 = Regioni.coordinate(k, 3*k1 : 3*k1+2)
                    var v1 = Regioni.coordinate[k].slice(3 * k1, 3 * k1 + 3);
                    for (var k2 = 0; k2 < 8; k2++) {
                        var v2 = Regioni.coordinate[m].slice(3 * k2, 3 * k2 + 3);
                        // Se norm(v1 - v2) < 1e-12 => contatto++
                        var dx = v1[0] - v2[0];
                        var dy = v1[1] - v2[1];
                        var dz = v1[2] - v2[2];
                        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        if (dist < 1e-12) {
                            contatto++;
                            // Aggiungiamo v1 a vertici_contatto
                            vertici_contatto.push(v1[0], v1[1], v1[2]);
                        }
                    }
                }
                // Se contatto==4 => passiamo a controllare i nodi "nodi_nodi" 
                if (contatto === 4) {
                    for (var n = 0; n < Nnodi; n++) {
                        var nodoCandidate = nodi_nodi[n];
                        // Se controlla_nodo_su_superfice(...)==1 => potenziale nodo interno di contatto
                        if (controlla_nodo_su_superfice(vertici_contatto, nodoCandidate) === 1) {
                            // Verifichiamo se esiste già in Nodi_i (n_nodi_int) => se sì, non lo aggiungiamo
                            var isCoincInNodiI = isInNodiI(nodoCandidate, Nodi_i);
                            if (!isCoincInNodiI) {
                                if (Nodi_interni_output.length === 0) {
                                    Nodi_interni_output.push(nodoCandidate);
                                }
                                else {
                                    // Altrimenti, passiamo da verifica_nodo_interno
                                    var Nodi_interni_new = (0, verifica_nodo_interno_1.verifica_nodo_interno)(Nodi_interni_output, nodoCandidate);
                                    if (Nodi_interni_new.length > 0) {
                                        Nodi_interni_output.push(Nodi_interni_new);
                                    }
                                }
                            } // fine if (!isCoincInNodiI)
                        }
                    }
                }
            }
        } // fine if m!==k
    } // fine for m
    return Nodi_interni_output;
}
/**
 * Versione TypeScript di `controlla_nodo_su_superfice(vertici_contatto, nodo_i)`.
 * Restituisce 1 o 0.
 *
 * In MATLAB, vertici_contatto era [1 x 12], cioè 4 triple in fila
 * => in TS è un array di 12 numeri ( [x1,y1,z1, x2,y2,z2, x3,y3,z3, x4,y4,z4] ).
 */
function controlla_nodo_su_superfice(vertici_contatto, nodo_i) {
    var _a;
    // esito=0 inizialmente
    var esito = 0;
    // vertici: 4 triple
    // v1=vertici_contatto(1,1:3); v2=... 4:6; v3=7:9; v4=10:12
    var v1 = vertici_contatto.slice(0, 3);
    var v2 = vertici_contatto.slice(3, 6);
    var v3 = vertici_contatto.slice(6, 9);
    var v4 = vertici_contatto.slice(9, 12);
    var esito1 = punti_allineati(v1, v2, nodo_i);
    var esito2 = punti_allineati(v2, v4, nodo_i);
    var esito3 = punti_allineati(v4, v3, nodo_i);
    var esito4 = punti_allineati(v3, v1, nodo_i);
    if (esito1 === 1 || esito2 === 1 || esito3 === 1 || esito4 === 1) {
        esito = 0;
    }
    else {
        // Controlla la distanza dal piano v1,v2,v3
        var _b = piano_passante3_punti(v1, v2, v3), a = _b[0], b = _b[1], c = _b[2], d = _b[3];
        var dist1 = Math.abs(a * nodo_i[0] + b * nodo_i[1] + c * nodo_i[2] + d) /
            Math.sqrt(a * a + b * b + c * c);
        _a = piano_passante3_punti(v2, v3, v4), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
        var dist2 = Math.abs(a * nodo_i[0] + b * nodo_i[1] + c * nodo_i[2] + d) /
            Math.sqrt(a * a + b * b + c * c);
        if (dist1 < 1e-10 || dist2 < 1e-10) {
            esito = 1;
        }
    }
    return esito;
}
/**
 * piano_passante3_punti(v1,v2,v3) => [a,b,c,d]
 * come in MATLAB: definisce i coefficienti a,b,c,d del piano passante per v1,v2,v3
 */
function piano_passante3_punti(v1, v2, v3) {
    // P12 = v2-v1, P13 = v3-v1
    var P12 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
    var P13 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
    // v = cross(P12,P13)
    var vx = P12[1] * P13[2] - P12[2] * P13[1];
    var vy = P12[2] * P13[0] - P12[0] * P13[2];
    var vz = P12[0] * P13[1] - P12[1] * P13[0];
    var a = vx, b = vy, c = vz;
    var d = -(a * v1[0] + b * v1[1] + c * v1[2]);
    return [a, b, c, d];
}
/**
 * punti_allineati(v1,v2,v3) => 1 se i tre punti sono allineati (norm(cross)<1e-10).
 */
function punti_allineati(v1, v2, v3) {
    var esito = 0;
    var P12 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
    var P13 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
    // cross
    var cx = P12[1] * P13[2] - P12[2] * P13[1];
    var cy = P12[2] * P13[0] - P12[0] * P13[2];
    var cz = P12[0] * P13[1] - P12[1] * P13[0];
    var normCross = Math.sqrt(cx * cx + cy * cy + cz * cz);
    if (normCross < 1e-10) {
        esito = 1;
    }
    return esito;
}
