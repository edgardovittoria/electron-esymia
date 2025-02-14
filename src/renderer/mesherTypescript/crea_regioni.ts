import { solve_overlapping } from './solve_overlapping';
import { sistema_coordinate } from './sistema_coordinate';
import { round_ud } from './round_ud';
import { MaterialMesher } from './interfaces'; 
import { Region } from './interfaces';

function crea_regioni(bricks: number[][], bricks_material: number[], materials: MaterialMesher[]): Region {
    const N = bricks.length;
    let coord: number[][] = Array.from({ length: N }, () => Array(24).fill(0));
    

    // Aggiungi ogni brick
    for (let k = 0; k < N; k++) {
        coord = aggiungiBlocco(coord, k + 1, bricks[k][0], bricks[k][1], bricks[k][2], bricks[k][3], bricks[k][4], bricks[k][5]);
    }
    
   
  const mat_conductors_indexes: number[] = [];
  for (let i = 0; i < materials.length; i++) {
    // Approssimiamo zero con 1e-10 come nel codice MATLAB
    if (Math.abs(materials[i].sigmar) > 1e-10) {
      mat_conductors_indexes.push(i);
    }
  }

     // 3) Risolvi le sovrapposizioni
  let bricks_material_temp = [...bricks_material];
  ({ barre: coord, materiale: bricks_material_temp } = solve_overlapping(
    coord,
    bricks_material_temp,
    mat_conductors_indexes
  ));
 

    // Sistema di coordinate
    ({ new_coord: coord, materiale: bricks_material_temp } = sistema_coordinate(
        coord.map(row => round_ud(row, 8)),
        bricks_material_temp
    ));
   
    const Nnew = coord.length;
    

    const Regioni: Region = {
        coordinate: Array.from({ length: Nnew }, () => Array(24).fill(0)),
        cond: Array(Nnew).fill(0),
        epsr: Array(Nnew).fill(0),
        mu: Array(Nnew).fill(0),
        mur: Array(Nnew).fill(0),
        materiale: Array(Nnew).fill(0),
        Nx: Array(Nnew).fill(0),
        Ny: Array(Nnew).fill(0),
        Nz: Array(Nnew).fill(0),
        centri: Array.from({ length: Nnew }, () => Array(3).fill(0)),
    };

    // Popola Regioni per materiali conduttori
    let st = 0;
    for (let k = 0; k < materials.length; k++) {
        if (Math.abs(materials[k].sigmar) > 1e-10) {
            const ind = bricks_material_temp.reduce<number[]>((result, val, index) => {
                if (val === k) { // Materiali 0-based
                    result.push(index);
                }
                return result;
            }, []);
            

            const en = st + ind.length;
            const filtered_coords = coord.filter((_, index) => ind.includes(index)).map(row => round_ud(row, 8));
            Regioni.coordinate.splice(st, ind.length, ...filtered_coords);
            Regioni.cond.splice(st, ind.length, ...Array(ind.length).fill(materials[k].sigmar));
            Regioni.epsr.splice(st, ind.length, ...Array(ind.length).fill(materials[k].eps_re));
            Regioni.mu.splice(st, ind.length, ...Array(ind.length).fill(4 * Math.PI * 1e-7 * materials[k].mur));
            Regioni.mur.splice(st, ind.length, ...Array(ind.length).fill(materials[k].mur));
            Regioni.materiale.splice(st, ind.length, ...Array(ind.length).fill(k));
            
            st = en;
        }
    }

    // Popola Regioni per materiali dielettrici
    for (let k = 0; k < materials.length; k++) {
        if (Math.abs(materials[k].sigmar) < 1e-10) {
            const ind = bricks_material_temp.reduce<number[]>((result, val, index) => {
                if (val === k) { // Materiali 0-based
                    result.push(index);
                }
                return result;
            }, []);
            

            const en = st + ind.length;
            const filtered_coords = coord.filter((_, index) => ind.includes(index)).map(row => round_ud(row, 8));
            Regioni.coordinate.splice(st, ind.length, ...filtered_coords);
            Regioni.cond.splice(st, ind.length, ...Array(ind.length).fill(materials[k].sigmar));
            Regioni.epsr.splice(st, ind.length, ...Array(ind.length).fill(materials[k].eps_re));
            Regioni.mu.splice(st, ind.length, ...Array(ind.length).fill(4 * Math.PI * 1e-7 * materials[k].mur));
            Regioni.mur.splice(st, ind.length, ...Array(ind.length).fill(materials[k].mur));
            Regioni.materiale.splice(st, ind.length, ...Array(ind.length).fill(k));
            
            st = en;
        }
    }

    //console.log("Regioni finali:", Regioni);
    return Regioni;
}

export { crea_regioni };

//funzione di supporto aggiungiBlocco
function aggiungiBlocco(geo: number[][], pos: number, x1: number, x2: number, y1: number, y2: number, z1: number, z2: number): number[][] {
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