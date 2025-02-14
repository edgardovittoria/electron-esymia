"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mean_cross_section_Lp = mean_cross_section_Lp;
/**
 * @param barra1 - array di 24 numeri, con coordinate dei vertici:
 *                x1, y1, z1, x2, y2, z2, ... x8, y8, z8.
 *                Strutturati come in MATLAB:
 *                  xi1 = [barra1[0],  barra1[3],  barra1[6],  barra1[9]];
 *                  yi1 = [barra1[1],  barra1[4],  barra1[7],  barra1[10]];
 *                  zi1 = [barra1[2],  barra1[5],  barra1[8],  barra1[11]];
 *                  xi2 = [barra1[12], barra1[15], barra1[18], barra1[21]];
 *                  yi2 = [barra1[13], barra1[16], barra1[19], barra1[22]];
 *                  zi2 = [barra1[14], barra1[17], barra1[20], barra1[23]];
 * @param curr_dir
 * @returns Il valore numerico della sezione trasversale media.
 */
function mean_cross_section_Lp(barra1, curr_dir) {
    // 1) Estrai i vertici (xi1, yi1, zi1, xi2, yi2, zi2) come in MATLAB.
    var xi1 = [barra1[0], barra1[3], barra1[6], barra1[9]];
    var yi1 = [barra1[1], barra1[4], barra1[7], barra1[10]];
    var zi1 = [barra1[2], barra1[5], barra1[8], barra1[11]];
    var xi2 = [barra1[12], barra1[15], barra1[18], barra1[21]];
    var yi2 = [barra1[13], barra1[16], barra1[19], barra1[22]];
    var zi2 = [barra1[14], barra1[17], barra1[20], barra1[23]];
    // 2) Crea la matrice ri[8][3] dei vertici (PSP)
    var ri = [
        [xi1[0], yi1[0], zi1[0]],
        [xi1[1], yi1[1], zi1[1]],
        [xi1[2], yi1[2], zi1[2]],
        [xi1[3], yi1[3], zi1[3]],
        [xi2[0], yi2[0], zi2[0]],
        [xi2[1], yi2[1], zi2[1]],
        [xi2[2], yi2[2], zi2[2]],
        [xi2[3], yi2[3], zi2[3]],
    ];
    // 3) Calcola i vettori di interpolazione (rmi, rai, rbi, rci, rabi, rbci, raci, rabci)
    // rmi = 0.125 * sum(ri, 1);
    var rmi = [
        0.125 * (ri[0][0] + ri[1][0] + ri[2][0] + ri[3][0] + ri[4][0] + ri[5][0] + ri[6][0] + ri[7][0]),
        0.125 * (ri[0][1] + ri[1][1] + ri[2][1] + ri[3][1] + ri[4][1] + ri[5][1] + ri[6][1] + ri[7][1]),
        0.125 * (ri[0][2] + ri[1][2] + ri[2][2] + ri[3][2] + ri[4][2] + ri[5][2] + ri[6][2] + ri[7][2]),
    ];
    // rai = 0.125 * ( -ri(1,:)+ri(2,:)+ri(4,:)-ri(3,:) -ri(5,:)+ri(6,:)+ri(8,:)-ri(7,:) )
    // ->  1-based => 0-based: (1->0,2->1,3->2,4->3,5->4,6->5,7->6,8->7)
    var rai = [
        0.125 * (-ri[0][0] + ri[1][0] + ri[3][0] - ri[2][0] - ri[4][0] + ri[5][0] + ri[7][0] - ri[6][0]),
        0.125 * (-ri[0][1] + ri[1][1] + ri[3][1] - ri[2][1] - ri[4][1] + ri[5][1] + ri[7][1] - ri[6][1]),
        0.125 * (-ri[0][2] + ri[1][2] + ri[3][2] - ri[2][2] - ri[4][2] + ri[5][2] + ri[7][2] - ri[6][2]),
    ];
    // rbi = 0.125 * ( -ri(1,:)-ri(2,:)+ri(4,:)+ri(3,:) -ri(5,:)-ri(6,:)+ri(8,:)+ri(7,:) )
    var rbi = [
        0.125 * (-ri[0][0] - ri[1][0] + ri[3][0] + ri[2][0] - ri[4][0] - ri[5][0] + ri[7][0] + ri[6][0]),
        0.125 * (-ri[0][1] - ri[1][1] + ri[3][1] + ri[2][1] - ri[4][1] - ri[5][1] + ri[7][1] + ri[6][1]),
        0.125 * (-ri[0][2] - ri[1][2] + ri[3][2] + ri[2][2] - ri[4][2] - ri[5][2] + ri[7][2] + ri[6][2]),
    ];
    // rci = 0.125 * ( -ri(1,:)-ri(2,:)-ri(4,:)-ri(3,:) +ri(5,:)+ri(6,:)+ri(8,:)+ri(7,:) )
    var rci = [
        0.125 * (-ri[0][0] - ri[1][0] - ri[3][0] - ri[2][0] + ri[4][0] + ri[5][0] + ri[7][0] + ri[6][0]),
        0.125 * (-ri[0][1] - ri[1][1] - ri[3][1] - ri[2][1] + ri[4][1] + ri[5][1] + ri[7][1] + ri[6][1]),
        0.125 * (-ri[0][2] - ri[1][2] - ri[3][2] - ri[2][2] + ri[4][2] + ri[5][2] + ri[7][2] + ri[6][2]),
    ];
    // rabi = 0.125 * ( ri(1,:)-ri(2,:)+ri(4,:)-ri(3,:) +ri(5,:)-ri(6,:)+ri(8,:)-ri(7,:) )
    var rabi = [
        0.125 * (ri[0][0] - ri[1][0] + ri[3][0] - ri[2][0] + ri[4][0] - ri[5][0] + ri[7][0] - ri[6][0]),
        0.125 * (ri[0][1] - ri[1][1] + ri[3][1] - ri[2][1] + ri[4][1] - ri[5][1] + ri[7][1] - ri[6][1]),
        0.125 * (ri[0][2] - ri[1][2] + ri[3][2] - ri[2][2] + ri[4][2] - ri[5][2] + ri[7][2] - ri[6][2]),
    ];
    // rbci = 0.125 * ( ri(1,:)+ri(2,:)-ri(4,:)-ri(3,:) -ri(5,:)-ri(6,:)+ri(8,:)+ri(7,:) )
    var rbci = [
        0.125 * (ri[0][0] + ri[1][0] - ri[3][0] - ri[2][0] - ri[4][0] - ri[5][0] + ri[7][0] + ri[6][0]),
        0.125 * (ri[0][1] + ri[1][1] - ri[3][1] - ri[2][1] - ri[4][1] - ri[5][1] + ri[7][1] + ri[6][1]),
        0.125 * (ri[0][2] + ri[1][2] - ri[3][2] - ri[2][2] - ri[4][2] - ri[5][2] + ri[7][2] + ri[6][2]),
    ];
    // raci = 0.125 * ( ri(1,:)-ri(2,:)-ri(4,:)+ri(3,:) -ri(5,:)+ri(6,:)+ri(8,:)-ri(7,:) )
    var raci = [
        0.125 * (ri[0][0] - ri[1][0] - ri[3][0] + ri[2][0] - ri[4][0] + ri[5][0] + ri[7][0] - ri[6][0]),
        0.125 * (ri[0][1] - ri[1][1] - ri[3][1] + ri[2][1] - ri[4][1] + ri[5][1] + ri[7][1] - ri[6][1]),
        0.125 * (ri[0][2] - ri[1][2] - ri[3][2] + ri[2][2] - ri[4][2] + ri[5][2] + ri[7][2] - ri[6][2]),
    ];
    // rabci = 0.125 * ( -ri(1,:)+ri(2,:)-ri(4,:)+ri(3,:) +ri(5,:)-ri(6,:)+ri(8,:)-ri(7,:) )
    var rabci = [
        0.125 * (-ri[0][0] + ri[1][0] - ri[3][0] + ri[2][0] + ri[4][0] - ri[5][0] + ri[7][0] - ri[6][0]),
        0.125 * (-ri[0][1] + ri[1][1] - ri[3][1] + ri[2][1] + ri[4][1] - ri[5][1] + ri[7][1] - ri[6][1]),
        0.125 * (-ri[0][2] + ri[1][2] - ri[3][2] + ri[2][2] + ri[4][2] - ri[5][2] + ri[7][2] - ri[6][2]),
    ];
    // 4)  "regola di quadratura a 1 punto"
    //    In MATLAB: [rootx, wex] = qrule(1) => rootx=0, wex=2
    var rootx = 0;
    var wex = 2;
    var wey = wex;
    var rooty = rootx;
    var wez = wex;
    var rootz = rootx;
    // Per 1 punto di quadratura, i "cicli" vanno comunque da 0 a 0 (una sola iterazione).
    var nlx = 1;
    var nly = 1;
    var nlz = 1;
    // 5) Cicli di integrazione 
    var sum_a1 = 0;
    for (var a1 = 0; a1 < nlx; a1++) {
        var sum_b1 = 0;
        for (var b1 = 0; b1 < nly; b1++) {
            var sum_c1 = 0;
            for (var c1 = 0; c1 < nlz; c1++) {
                // Calcola drai, drbi, drci (come in MATLAB):
                var drai = [
                    rai[0] + rabi[0] * rooty + raci[0] * rootz + rabci[0] * (rooty * rootz),
                    rai[1] + rabi[1] * rooty + raci[1] * rootz + rabci[1] * (rooty * rootz),
                    rai[2] + rabi[2] * rooty + raci[2] * rootz + rabci[2] * (rooty * rootz),
                ];
                var drbi = [
                    rbi[0] + rabi[0] * rootx + rbci[0] * rootz + rabci[0] * (rootx * rootz),
                    rbi[1] + rabi[1] * rootx + rbci[1] * rootz + rabci[1] * (rootx * rootz),
                    rbi[2] + rabi[2] * rootx + rbci[2] * rootz + rabci[2] * (rootx * rootz),
                ];
                var drci = [
                    rci[0] + raci[0] * rootx + rbci[0] * rooty + rabci[0] * (rootx * rooty),
                    rci[1] + raci[1] * rootx + rbci[1] * rooty + rabci[1] * (rootx * rooty),
                    rci[2] + raci[2] * rootx + rbci[2] * rooty + rabci[2] * (rootx * rooty),
                ];
                // Norme e versori
                var draim = norm(drai);
                var drbim = norm(drbi);
                var drcim = norm(drci);
                var aversi = [drai[0] / draim, drai[1] / draim, drai[2] / draim];
                var bversi = [drbi[0] / drbim, drbi[1] / drbim, drbi[2] / drbim];
                var cversi = [drci[0] / drcim, drci[1] / drcim, drci[2] / drcim];
                var stetabi = cross(aversi, bversi);
                var stetbci = cross(bversi, cversi);
                var stetcai = cross(cversi, aversi);
                // Scelta in base a curr_dir
                var f = 0;
                if (curr_dir === 1) {
                    var stetim = norm(stetbci);
                    var unitni = [stetbci[0] / stetim, stetbci[1] / stetim, stetbci[2] / stetim];
                    var ctetnormi = dot(unitni, aversi) / (norm(unitni) * norm(aversi));
                    f = (drbim * drcim * stetim * ctetnormi) / 2;
                    // (In MATLAB c'era la riga commentata: f = drbim * drcim * stetim / 2;)
                }
                else if (curr_dir === 2) {
                    var stetim = norm(stetcai);
                    var unitni = [stetcai[0] / stetim, stetcai[1] / stetim, stetcai[2] / stetim];
                    var ctetnormi = dot(unitni, bversi) / (norm(unitni) * norm(bversi));
                    f = (draim * drcim * stetim * ctetnormi) / 2;
                    // (riga commentata in MATLAB: f = draim * drcim * stetim / 2;)
                }
                else {
                    var stetim = norm(stetabi);
                    var unitni = [stetabi[0] / stetim, stetabi[1] / stetim, stetabi[2] / stetim];
                    var ctetnormi = dot(unitni, cversi) / (norm(unitni) * norm(cversi));
                    f = (draim * drbim * stetim * ctetnormi) / 2;
                    // (riga commentata in MATLAB: f = draim * drbim * stetim / 2;)
                }
                // Pesatura con i coefficienti di quadratura (qui "monopunto")
                sum_c1 += wez * f;
            }
            sum_b1 += wey * sum_c1;
        }
        sum_a1 += wex * sum_b1;
    }
    var mean_cr_sect = sum_a1;
    return mean_cr_sect;
}
/* ================= Funzioni di utilità per algebra vettoriale 3D ================= */
/**
 * Norma euclidea di un vettore 3D
 */
function norm(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}
/**
 * Prodotto scalare fra due vettori 3D
 */
function dot(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}
/**
 * Prodotto vettoriale fra due vettori 3D
 */
function cross(v1, v2) {
    return [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0],
    ];
}
