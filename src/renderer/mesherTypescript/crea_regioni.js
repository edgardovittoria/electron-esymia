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
exports.crea_regioni = crea_regioni;
var solve_overlapping_1 = require("./solve_overlapping");
var sistema_coordinate_1 = require("./sistema_coordinate");
var round_ud_1 = require("./round_ud");
function crea_regioni(bricks, bricks_material, materials) {
    var _a, _b;
    var N = bricks.length;
    var coord = Array.from({ length: N }, function () { return Array(24).fill(0); });
    // Aggiungi ogni brick
    for (var k = 0; k < N; k++) {
        coord = aggiungiBlocco(coord, k + 1, bricks[k][0], bricks[k][1], bricks[k][2], bricks[k][3], bricks[k][4], bricks[k][5]);
    }
    var mat_conductors_indexes = [];
    for (var i = 0; i < materials.length; i++) {
        // Approssimiamo zero con 1e-10 come nel codice MATLAB
        if (Math.abs(materials[i].sigmar) > 1e-10) {
            mat_conductors_indexes.push(i);
        }
    }
    // 3) Risolvi le sovrapposizioni
    var bricks_material_temp = __spreadArray([], bricks_material, true);
    (_a = (0, solve_overlapping_1.solve_overlapping)(coord, bricks_material_temp, mat_conductors_indexes), coord = _a.barre, bricks_material_temp = _a.materiale);
    // Sistema di coordinate
    (_b = (0, sistema_coordinate_1.sistema_coordinate)(coord.map(function (row) { return (0, round_ud_1.round_ud)(row, 8); }), bricks_material_temp), coord = _b.new_coord, bricks_material_temp = _b.materiale);
    var Nnew = coord.length;
    var Regioni = {
        coordinate: Array.from({ length: Nnew }, function () { return Array(24).fill(0); }),
        cond: Array(Nnew).fill(0),
        epsr: Array(Nnew).fill(0),
        mu: Array(Nnew).fill(0),
        mur: Array(Nnew).fill(0),
        materiale: Array(Nnew).fill(0),
        Nx: Array(Nnew).fill(0),
        Ny: Array(Nnew).fill(0),
        Nz: Array(Nnew).fill(0),
        centri: Array.from({ length: Nnew }, function () { return Array(3).fill(0); }),
    };
    // Popola Regioni per materiali conduttori
    var st = 0;
    var _loop_1 = function (k) {
        var _c, _d, _e, _f, _g, _h;
        if (Math.abs(materials[k].sigmar) > 1e-10) {
            var ind_1 = bricks_material_temp.reduce(function (result, val, index) {
                if (val === k) { // Materiali 0-based
                    result.push(index);
                }
                return result;
            }, []);
            var en = st + ind_1.length;
            var filtered_coords = coord.filter(function (_, index) { return ind_1.includes(index); }).map(function (row) { return (0, round_ud_1.round_ud)(row, 8); });
            (_c = Regioni.coordinate).splice.apply(_c, __spreadArray([st, ind_1.length], filtered_coords, false));
            (_d = Regioni.cond).splice.apply(_d, __spreadArray([st, ind_1.length], Array(ind_1.length).fill(materials[k].sigmar), false));
            (_e = Regioni.epsr).splice.apply(_e, __spreadArray([st, ind_1.length], Array(ind_1.length).fill(materials[k].eps_re), false));
            (_f = Regioni.mu).splice.apply(_f, __spreadArray([st, ind_1.length], Array(ind_1.length).fill(4 * Math.PI * 1e-7 * materials[k].mur), false));
            (_g = Regioni.mur).splice.apply(_g, __spreadArray([st, ind_1.length], Array(ind_1.length).fill(materials[k].mur), false));
            (_h = Regioni.materiale).splice.apply(_h, __spreadArray([st, ind_1.length], Array(ind_1.length).fill(k), false));
            st = en;
        }
    };
    for (var k = 0; k < materials.length; k++) {
        _loop_1(k);
    }
    var _loop_2 = function (k) {
        var _j, _k, _l, _m, _o, _p;
        if (Math.abs(materials[k].sigmar) < 1e-10) {
            var ind_2 = bricks_material_temp.reduce(function (result, val, index) {
                if (val === k) { // Materiali 0-based
                    result.push(index);
                }
                return result;
            }, []);
            var en = st + ind_2.length;
            var filtered_coords = coord.filter(function (_, index) { return ind_2.includes(index); }).map(function (row) { return (0, round_ud_1.round_ud)(row, 8); });
            (_j = Regioni.coordinate).splice.apply(_j, __spreadArray([st, ind_2.length], filtered_coords, false));
            (_k = Regioni.cond).splice.apply(_k, __spreadArray([st, ind_2.length], Array(ind_2.length).fill(materials[k].sigmar), false));
            (_l = Regioni.epsr).splice.apply(_l, __spreadArray([st, ind_2.length], Array(ind_2.length).fill(materials[k].eps_re), false));
            (_m = Regioni.mu).splice.apply(_m, __spreadArray([st, ind_2.length], Array(ind_2.length).fill(4 * Math.PI * 1e-7 * materials[k].mur), false));
            (_o = Regioni.mur).splice.apply(_o, __spreadArray([st, ind_2.length], Array(ind_2.length).fill(materials[k].mur), false));
            (_p = Regioni.materiale).splice.apply(_p, __spreadArray([st, ind_2.length], Array(ind_2.length).fill(k), false));
            st = en;
        }
    };
    // Popola Regioni per materiali dielettrici
    for (var k = 0; k < materials.length; k++) {
        _loop_2(k);
    }
    //console.log("Regioni finali:", Regioni);
    return Regioni;
}
//funzione di supporto aggiungiBlocco
function aggiungiBlocco(geo, pos, x1, x2, y1, y2, z1, z2) {
    geo[pos - 1] = [
        Math.min(x1, x2), Math.min(y1, y2), Math.min(z1, z2),
        Math.max(x1, x2), Math.min(y1, y2), Math.min(z1, z2),
        Math.min(x1, x2), Math.max(y1, y2), Math.min(z1, z2),
        Math.max(x1, x2), Math.max(y1, y2), Math.min(z1, z2),
        Math.min(x1, x2), Math.min(y1, y2), Math.max(z1, z2),
        Math.max(x1, x2), Math.min(y1, y2), Math.max(z1, z2),
        Math.min(x1, x2), Math.max(y1, y2), Math.max(z1, z2),
        Math.max(x1, x2), Math.max(y1, y2), Math.max(z1, z2)
    ];
    //console.log(`Aggiunto blocco alla posizione ${pos}:`, geo[pos - 1]);
    return geo;
}
