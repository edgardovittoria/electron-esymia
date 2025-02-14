"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genera_nodi_interni_rev = genera_nodi_interni_rev;
var interpolating_vectors_1 = require("./interpolating_vectors");
var linspace_1 = require("./linspace");
/**
 * @param xyz Array di 24 numeri, che rappresentano 8 triple di coordinate (8 x 3).
 * @param Npuntix numero di punti lungo l'asse x
 * @param Npuntiy numero di punti lungo l'asse y
 * @param Npuntiz numero di punti lungo l'asse z
 * @returns Un array di nodi interni, dimensione [ (Npuntix-2)*(Npuntiy-2)*(Npuntiz-2) x 3 ]
 */
function genera_nodi_interni_rev(xyz, Npuntix, Npuntiy, Npuntiz) {
    // 1) Creazione dei vettori a,b,c (linspace(-1,1,...))
    var a = (0, linspace_1.linspace)(-1, 1, Npuntix);
    var b = (0, linspace_1.linspace)(-1, 1, Npuntiy);
    var c = (0, linspace_1.linspace)(-1, 1, Npuntiz);
    // 2) Ri costruiamo come array di 8 righe (ognuna 3 coordinate)
    //    In MATLAB: ri=[xyz(1:3); xyz(4:6); ... xyz(22:24)]
    var ri = [
        xyz.slice(0, 3),
        xyz.slice(3, 6),
        xyz.slice(6, 9),
        xyz.slice(9, 12),
        xyz.slice(12, 15),
        xyz.slice(15, 18),
        xyz.slice(18, 21),
        xyz.slice(21, 24)
    ];
    // 3) Calcolo dei vettori interpolanti (rmi, rai, rbi, rci, rabi, rbci, raci, rabci)
    var _a = (0, interpolating_vectors_1.interpolating_vectors)(ri), rmi = _a.rmi, rai = _a.rai, rbi = _a.rbi, rci = _a.rci, rabi = _a.rabi, rbci = _a.rbci, raci = _a.raci, rabci = _a.rabci;
    var rp = Array.from({ length: Npuntix }, function () {
        return Array.from({ length: Npuntiy }, function () {
            return Array.from({ length: Npuntiz }, function () { return [0, 0, 0]; });
        });
    });
    // 5) Popoliamo rp con i tripli loop
    //    MATLAB: for n=1:Npuntiz, for m=1:Npuntiy, for l=1:Npuntix => TS: 0-based
    for (var nn = 0; nn < Npuntiz; nn++) {
        for (var mm = 0; mm < Npuntiy; mm++) {
            for (var ll = 0; ll < Npuntix; ll++) {
                // corrisponde a: 
                // rp(l,m,n,:) = rmi + rai*a(l) + rbi*b(m) + rci*c(n) + ...
                var ax = a[ll], bx = b[mm], cx = c[nn];
                rp[ll][mm][nn] = [
                    rmi[0] + rai[0] * ax + rbi[0] * bx + rci[0] * cx
                        + rabi[0] * ax * bx + rbci[0] * bx * cx + raci[0] * ax * cx + rabci[0] * ax * bx * cx,
                    rmi[1] + rai[1] * ax + rbi[1] * bx + rci[1] * cx
                        + rabi[1] * ax * bx + rbci[1] * bx * cx + raci[1] * ax * cx + rabci[1] * ax * bx * cx,
                    rmi[2] + rai[2] * ax + rbi[2] * bx + rci[2] * cx
                        + rabi[2] * ax * bx + rbci[2] * bx * cx + raci[2] * ax * cx + rabci[2] * ax * bx * cx
                ];
            }
        }
    }
    // 6) Individuazione nodi interni
    var Nodi_interni = [];
    for (var o = 1; o < Npuntiz - 1; o++) {
        for (var n = 1; n < Npuntiy - 1; n++) {
            for (var m = 1; m < Npuntix - 1; m++) {
                // in MATLAB: Nodi_interni = [Nodi_interni; squeeze(rp(m,n,o,:)).']
                // in TS: rp[m][n][o] è [x,y,z]
                Nodi_interni.push(rp[m][n][o]);
            }
        }
    }
    // 7) Restituiamo l'array Nodi_interni
    return Nodi_interni;
}
