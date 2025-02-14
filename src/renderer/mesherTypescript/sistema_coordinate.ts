import { round_ud } from './round_ud';




export function sistema_coordinate(coord: number[][], materiale: number[]): { new_coord: number[][]; materiale: number[] } {
    let nBarre = coord.length;
    let new_coord = coord.map(row => round_ud(row, 10));
    let new_materiale = [...materiale];
    
    

    if (nBarre > 1) {
        let continua = 1;
        let c1 = 0;

        while (c1 < nBarre) {
            let c2 = c1 + 1;
            let tagliata = false;

            while (continua === 1 && c2 < nBarre) {
                
                if (c1 !== c2) {
                    const verifyResult: VerifyTouchObjResult = verifyTouchObj(
                        { data: coord[c1] },
                        { data: coord[c2] }
                    );

                    if (verifyResult.cutted === 1) {
                        

                        let auxCord: number[][];
                        let indiciNotCut: number[];

                        if (verifyResult.inverted === 0) {
                            auxCord = taglia(coord[c1], verifyResult.a, verifyResult.b, verifyResult.c, verifyResult.c_o1);
                            indiciNotCut = Array.from({ length: nBarre }, (_, i) => i).filter(i => i !== c1);
                            new_coord = [...auxCord, ...indiciNotCut.map(i => coord[i])];
                            new_materiale = [...Array(auxCord.length).fill(materiale[c1]), ...indiciNotCut.map(i => materiale[i])];
                        } else {
                            auxCord = taglia(coord[c2], verifyResult.a, verifyResult.b, verifyResult.c, verifyResult.c_o2);
                            indiciNotCut = Array.from({ length: nBarre }, (_, i) => i).filter(i => i !== c2);
                            new_coord = [...auxCord, ...indiciNotCut.map(i => coord[i])];
                            new_materiale = [...Array(auxCord.length).fill(materiale[c2]), ...indiciNotCut.map(i => materiale[i])];
                        }

                        nBarre = nBarre - 1 + auxCord.length;
                        continua = 0;
                        c1 = -1; // Per ricominciare il ciclo esterno
                        coord = new_coord;
                        materiale = new_materiale;
                        coord = coord.map(row => round_ud(row, 10));

                        tagliata = true;
                        break; // Esce dal ciclo interno per ricominciare
                    }
                }
                c2++;
            }

            if (tagliata) {
                // Ricomincia dal primo elemento
                c1 = -1; // Verrà incrementato a 0 all'inizio del prossimo ciclo
            }

            c1++;
            continua = 1;
        }
    }

    console.log("Numero finale di barre:", nBarre);
    console.log("Coordinate finali:", new_coord);
    console.log("Materiale finale:", new_materiale);

    return { new_coord, materiale: new_materiale };
}




import { interpolating_vectors } from './interpolating_vectors';

function taglia(barra: number[], a: number[], b: number[], c: number[], num_faccia: number): number[][] {
    const Npuntix = a.length;
    const Npuntiy = b.length;
    const Npuntiz = c.length;
    const indici_x = [0, 3, 6, 9, 12, 15, 18, 21];
    const indici_y = [1, 4, 7, 10, 13, 16, 19, 22];
    const indici_z = [2, 5, 8, 11, 14, 17, 20, 23];
    const val_x = indici_x.map(i => round_ud([barra[i]], 10)[0]);
    const val_y = indici_y.map(i => round_ud([barra[i]], 10)[0]);
    const val_z = indici_z.map(i => round_ud([barra[i]], 10)[0]);

    if (!(new Set(val_x).size === 2 && new Set(val_y).size === 2 && new Set(val_z).size === 2)) {
        let f1 = getFace(num_faccia, barra);
        let f2: number[];
        let permutation: number[];

        ({ f_out: f1, permutation: permutation } = apply_convention(f1));
        f2 = f1;

        if (num_faccia === 1 || num_faccia === 3) {
            f2 = getFace(num_faccia === 1 ? 3 : 1, barra);
        } else if (num_faccia === 2 || num_faccia === 4) {
            f2 = getFace(num_faccia === 2 ? 4 : 2, barra);
        } else if (num_faccia === 5 || num_faccia === 6) {
            f2 = getFace(num_faccia === 5 ? 6 : 5, barra);
        }

        f2 = permutation.map(i => f2[i - 1]);

        if (a.length > 2 || (b.length > 2 && Math.abs(f1[2] - f1[11]) < 1e-10)) {
            barra = [...f1, ...f2];
        } else if (b.length > 2 && Math.abs(f1[2] - f1[11]) > 1e-10) {
            barra = [...f1.slice(0, 3), ...f1.slice(6, 9), ...f1.slice(3, 6), ...f1.slice(9, 12),
            ...f2.slice(0, 3), ...f2.slice(6, 9), ...f2.slice(3, 6), ...f2.slice(9, 12)];
        } else if (c.length > 2) {
            barra = [...f1.slice(0, 6), ...f2.slice(0, 6), ...f1.slice(6, 12), ...f2.slice(6, 12)];
        }
    }

    const ri = [
        barra.slice(0, 3),
        barra.slice(3, 6),
        barra.slice(6, 9),
        barra.slice(9, 12),
        barra.slice(12, 15),
        barra.slice(15, 18),
        barra.slice(18, 21),
        barra.slice(21, 24)
    ];

    const { rmi, rai, rbi, rci, rabi, rbci, raci, rabci } = interpolating_vectors(ri);
    const rp = Array.from({ length: Npuntix }, () =>
        Array.from({ length: Npuntiy }, () =>
            Array.from({ length: Npuntiz }, () => [0, 0, 0])
        )
    );

    for (let n = 0; n < Npuntiz; n++) {
        for (let m = 0; m < Npuntiy; m++) {
            for (let l = 0; l < Npuntix; l++) {
                rp[l][m][n][0] = rmi[0] + rai[0] * a[l] + rbi[0] * b[m] + rci[0] * c[n] + rabi[0] * a[l] * b[m] +
                    rbci[0] * b[m] * c[n] + raci[0] * a[l] * c[n] + rabci[0] * a[l] * b[m] * c[n];
                rp[l][m][n][1] = rmi[1] + rai[1] * a[l] + rbi[1] * b[m] + rci[1] * c[n] + rabi[1] * a[l] * b[m] +
                    rbci[1] * b[m] * c[n] + raci[1] * a[l] * c[n] + rabci[1] * a[l] * b[m] * c[n];
                rp[l][m][n][2] = rmi[2] + rai[2] * a[l] + rbi[2] * b[m] + rci[2] * c[n] + rabi[2] * a[l] * b[m] +
                    rbci[2] * b[m] * c[n] + raci[2] * a[l] * c[n] + rabci[2] * a[l] * b[m] * c[n];
            }
        }
    }

    let coord: number[][] = Array.from({ length: 2 }, () => Array(24).fill(0));

    if (a.length > 2) {
        coord[0] = [
            ...rp[0][0][0], ...rp[1][0][0], ...rp[0][1][0], ...rp[1][1][0],
            ...rp[0][0][1], ...rp[1][0][1], ...rp[0][1][1], ...rp[1][1][1]
        ];
        coord[1] = [
            ...rp[1][0][0], ...rp[2][0][0], ...rp[1][1][0], ...rp[2][1][0],
            ...rp[1][0][1], ...rp[2][0][1], ...rp[1][1][1], ...rp[2][1][1]
        ];
    }
    if (b.length > 2) {
        coord[0] = [
            ...rp[0][0][0], ...rp[1][0][0], ...rp[0][1][0], ...rp[1][1][0],
            ...rp[0][0][1], ...rp[1][0][1], ...rp[0][1][1], ...rp[1][1][1]
        ];
        coord[1] = [
            ...rp[0][1][0], ...rp[1][1][0], ...rp[0][2][0], ...rp[1][2][0],
            ...rp[0][1][1], ...rp[1][1][1], ...rp[0][2][1], ...rp[1][2][1]
        ];
    }
    if (c.length > 2) {
        coord[0] = [
            ...rp[0][0][0], ...rp[1][0][0], ...rp[0][1][0], ...rp[1][1][0],
            ...rp[0][0][1], ...rp[1][0][1], ...rp[0][1][1], ...rp[1][1][1]
        ];
        coord[1] = [
            ...rp[0][0][1], ...rp[1][0][1], ...rp[0][1][1], ...rp[1][1][1],
            ...rp[0][0][2], ...rp[1][0][2], ...rp[0][1][2], ...rp[1][1][2]
        ];
    }

    return coord;
}




// Funzione per calcolare la norma euclidea di un vettore o la differenza tra due vettori
function norm(v1: number[], v2?: number[]): number {
    let sum = 0;
    if (v2) {
        for (let i = 0; i < v1.length; i++) {
            sum += (v1[i] - v2[i]) ** 2;
        }
    } else {
        for (let i = 0; i < v1.length; i++) {
            sum += v1[i] ** 2;
        }
    }
    return Math.sqrt(sum);
}



function control_share(
    f1: number[],
    f2: number[],
    norma: number[]
): { cutted: number; a: number[]; b: number[]; c: number[]; inverted: number } {
    let cutted = 0;
    let a = [-1, 1];
    let b = [-1, 1];
    let c = [-1, 1];
    let inverted = 0;
    const ind_x = [0, 3, 6, 9];
    const ind_y = [1, 4, 7, 10];
    const ind_z = [2, 5, 8, 11];

    function check_and_cut(f1_local: number[], f2_local: number[], norma_local: number[]) {
        let shared = 0;

        if (norm(norma_local, [0, 0, 1]) < 1e-10) {
            if (Math.abs(f1_local[11] - f2_local[11]) < 1e-10) {
                const [sharex, vectx] = find_cut(f1_local, f2_local, ind_x);
                const [sharey, vecty] = find_cut(f1_local, f2_local, ind_y);
                a = cambio(Array.from(new Set(vectx)).sort((a, b) => a - b));
                b = cambio(Array.from(new Set(vecty)).sort((a, b) => a - b));
                shared = sharex * sharey;
            }
        } else if (norm(norma_local, [0, 1, 0]) < 1e-10) {
            if (Math.abs(f1_local[1] - f2_local[1]) < 1e-10) {
                const [sharex, vectx] = find_cut(f1_local, f2_local, ind_x);
                const [sharez, vectz] = find_cut(f1_local, f2_local, ind_z);
                a = cambio(Array.from(new Set(vectx)).sort((a, b) => a - b));
                c = cambio(Array.from(new Set(vectz)).sort((a, b) => a - b));
                shared = sharex * sharez;
            }
        } else if (norm(norma_local, [1, 0, 0]) < 1e-10) {
            if (Math.abs(f1_local[0] - f2_local[0]) < 1e-10) {
                const [sharey, vecty] = find_cut(f1_local, f2_local, ind_y);
                const [sharez, vectz] = find_cut(f1_local, f2_local, ind_z);
                b = cambio(Array.from(new Set(vecty)).sort((a, b) => a - b));
                c = cambio(Array.from(new Set(vectz)).sort((a, b) => a - b));
                shared = sharey * sharez;
            }
        }

        if (shared === 1) {
            if (a.length > 2) {
                b = [-1, 1];
                c = [-1, 1];
                cutted = 1;
            } else if (b.length > 2) {
                a = [-1, 1];
                c = [-1, 1];
                cutted = 1;
            } else if (c.length > 2) {
                a = [-1, 1];
                b = [-1, 1];
                cutted = 1;
            }
        }
    }

    check_and_cut(f1, f2, norma);

    if (cutted === 0) {
        inverted = 1;
        check_and_cut(f2, f1, norma);
    }

    return { cutted, a, b, c, inverted };
}







function getFace(n: number, obj: number[]): number[] {
    if (obj.length < 24) {
      throw new Error("L'array obj deve contenere almeno 24 elementi.");
    }
  
    // Indici predefiniti per ogni faccia
    // (Ricorda che gli indici in TypeScript partono da 0)
    const indices = [
      [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17], // Faccia 1 (n=1 in MATLAB)
      [3, 4, 5, 9, 10, 11, 15, 16, 17, 21, 22, 23], // Faccia 2 (n=2 in MATLAB)
      [6, 7, 8, 9, 10, 11, 18, 19, 20, 21, 22, 23], // Faccia 3 (n=3 in MATLAB)
      [0, 1, 2, 6, 7, 8, 12, 13, 14, 18, 19, 20], // Faccia 4 (n=4 in MATLAB)
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],     // Faccia 5 (n=5 in MATLAB)
      [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], // Faccia 6 (n=6 in MATLAB)
    ];
  
    if (n < 1 || n > 6) {
      throw new Error("Numero di faccia non valido. Deve essere compreso tra 1 e 6.");
    }
  
    // Restituisce i valori di obj agli indici specifici della faccia
    return indices[n - 1].map(i => obj[i]);
  }

  function find_cut(f1: number[], f2: number[], ind: number[]): [number, number[]] {
    let share = 0;

    // Recupera i valori dai due array (adattando gli indici per TypeScript)
    const c1 = f1[ind[0]]; // Inizio intervallo 1
const c2 = f1[ind[3]]; // Fine intervallo 1
const c3 = f2[ind[0]]; // Inizio intervallo 2
const c4 = f2[ind[3]]; // Fine intervallo 2


    // Inizializza vect con valori predefiniti
    let vect = [-1, 1];

    // Determina i valori di vect in base alle condizioni
    if (c1 < c4 && c2 > c4) {
        // Ordina direttamente i tre valori c1, c4, c2
        vect = [Math.min(c1, c4, c2), Math.max(Math.min(c1, c4), Math.min(Math.max(c1, c4), c2)), Math.max(c1, c4, c2)];
    } else if (c1 < c3 && c2 > c3) {
        // Ordina direttamente i tre valori c1, c3, c2
        vect = [Math.min(c1, c3, c2), Math.max(Math.min(c1, c3), Math.min(Math.max(c1, c3), c2)), Math.max(c1, c3, c2)];
    }

    // Verifica la condizione di sovrapposizione
    if (
        (c1 >= c3 && c4 >= c1) || // Intervallo 1 inizia all'interno di Intervallo 2
        (c2 >= c3 && c4 >= c2) || // Intervallo 1 finisce all'interno di Intervallo 2
        (c3 >= c1 && c2 >= c3) || // Intervallo 2 inizia all'interno di Intervallo 1
        (c4 >= c1 && c2 >= c4)    // Intervallo 2 finisce all'interno di Intervallo 1
    ) {
        share = 1;
    }

    return [share, vect];
}




function cambio(r: number[]): number[] {
    const h = r.length;

    if (h === 0) {
        throw new Error("L'array 'r' non può essere vuoto.");
    }

    const rm = (r[0] + r[h - 1]) / 2; // Calcolo del valore medio tra il primo e l'ultimo elemento
    const r12 = (r[h - 1] - r[0]) / 2; // Calcolo della metà della differenza tra l'ultimo e il primo elemento

    if (r12 === 0) {
        // Gestione del caso di divisione per zero:
        // Opzione 1: Lanciare un'eccezione
        // throw new Error("Impossibile applicare la trasformazione: la differenza tra l'ultimo e il primo elemento è zero.");

        // Opzione 2: Restituire un array di NaN (Not a Number)
        return new Array(h).fill(NaN);
    }

    // Applicazione della trasformazione
    return r.map(val => (val - rm) / r12);
}



function computeNormale(f1: number[]): number[] {
    if (f1.length < 9) {
        throw new Error("L'array f1 deve contenere almeno 9 elementi (tre punti 3D).");
    }

    // Calcolo del prodotto vettoriale dei vettori (f1[3:5]-f1[0:2]) e (f1[6:8]-f1[0:2])
    const norm: number[] = [
        (f1[4] - f1[1]) * (f1[8] - f1[2]) - (f1[5] - f1[2]) * (f1[7] - f1[1]), // x
        (f1[5] - f1[2]) * (f1[6] - f1[0]) - (f1[3] - f1[0]) * (f1[8] - f1[2]), // y
        (f1[3] - f1[0]) * (f1[7] - f1[1]) - (f1[4] - f1[1]) * (f1[6] - f1[0])  // z
    ];

    // Calcolo della norma del vettore risultante
    const magnitude = Math.sqrt(norm[0] ** 2 + norm[1] ** 2 + norm[2] ** 2);

    if (magnitude === 0) {
        throw new Error("I punti forniti sono collineari, impossibile calcolare una normale.");
    }

    // Normalizzazione del vettore
    return [norm[0] / magnitude, norm[1] / magnitude, norm[2] / magnitude];
}





export function apply_convention(f: number[]): { is_orto: number; norma: number[]; f_out: number[]; permutation: number[] } {
    let is_orto = 0;
    const ind_x = [0, 3, 6, 9];
    const ind_y = [1, 4, 7, 10];
    const ind_z = [2, 5, 8, 11];

    const x = f.filter((_, i) => ind_x.includes(i)).sort((a, b) => a - b);
    const y = f.filter((_, i) => ind_y.includes(i)).sort((a, b) => a - b);
    const z = f.filter((_, i) => ind_z.includes(i)).sort((a, b) => a - b);

    let f_out = [...f];
    
    let norma = computeNormale(f);
    norma = norma.map(v=>Math.abs(v));
    if (norm(norma, [1, 0, 0]) < 1e-12 && new Set(y).size === 2 && new Set(z).size === 2) {
        f_out = [x[0], y[0], z[0], x[0], y[3], z[0], x[0], y[0], z[3], x[0], y[3], z[3]];
        is_orto = 1;
    }
    if (norm(norma, [0, 1, 0]) < 1e-12 && new Set(x).size === 2 && new Set(z).size === 2) {
        f_out = [x[0], y[0], z[0], x[3], y[0], z[0], x[0], y[0], z[3], x[3], y[0], z[3]];
        is_orto = 1;
    }
    if (norm(norma, [0, 0, 1]) < 1e-12 && new Set(x).size === 2 && new Set(y).size === 2) {
        f_out = [x[0], y[0], z[0], x[3], y[0], z[0], x[0], y[3], z[0], x[3], y[3], z[0]];
        is_orto = 1;
    }

    let permutation = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    const v1 = f.slice(0, 3);
    const v2 = f.slice(3, 6);
    const v3 = f.slice(6, 9);
    const v4 = f.slice(9, 12);
    const v1_out = f_out.slice(0, 3);
    const v2_out = f_out.slice(3, 6);
    const v3_out = f_out.slice(6, 9);
    const v4_out = f_out.slice(9, 12);

    const vertices = [
        [v1, v1_out], [v2, v1_out], [v3, v1_out], [v4, v1_out],
        [v1, v2_out], [v2, v2_out], [v3, v2_out], [v4, v2_out],
        [v1, v3_out], [v2, v3_out], [v3, v3_out], [v4, v3_out],
        [v1, v4_out], [v2, v4_out], [v3, v4_out], [v4, v4_out]
    ];

    for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i][0] as number[];
        const v_out = vertices[i][1] as number[];
        const start = (i % 4) * 3;
        if (norm(v, v_out) < 1e-12) {
            permutation.splice(start, 3, start + 1, start + 2, start + 3);
        }
    }

    return { is_orto, norma, f_out, permutation };
}


interface CheckTouchObjResult {
    cutted: number;
    a: number[];
    b: number[];
    c: number[];
    inverted: number;
}

function checkTouchObj(f1: number[], f2: number[]): CheckTouchObjResult {
    let inverted = 0;
    // Applica la convenzione alle due facce
    const { is_orto: is_orto1, norma: norm1, f_out: f1_out } = apply_convention(f1);
    const { is_orto: is_orto2, norma: norm2, f_out: f2_out } = apply_convention(f2);

    // Calcola la norma della differenza tra le normali (per verificare se sono parallele)
    const normalsDistance = norm(norm1, norm2);

    let cutted = 0;
    let a = [-1, 1];
    let b = [-1, 1];
    let c = [-1, 1];

    // Se le normali sono uguali (distanza < tolleranza) e entrambe le facce sono ortogonali agli assi
    if (normalsDistance < 1e-12 && is_orto1 === 1 && is_orto2 === 1) {
        // Controlla se le facce si intersecano
        const shareResult = control_share(f1_out, f2_out, norm1);
        cutted = shareResult.cutted;
        a = shareResult.a;
        b = shareResult.b;
        c = shareResult.c;
        inverted = shareResult.inverted;
    }

    return { cutted, a, b, c, inverted };
}




interface VerifyTouchObjResult {
    cutted: number;
    a: number[];
    b: number[];
    c: number[];
    inverted: number;
    c_o1: number;
    c_o2: number;
}

interface ObjWithFaces {
    data: number[];
}

/**
 * Verifica se due oggetti si toccano tramite le loro facce.
 * @param obj1 - Primo oggetto con dati delle facce.
 * @param obj2 - Secondo oggetto con dati delle facce.
 * @returns Informazioni sul contatto tra le facce.
 */
function verifyTouchObj(obj1: ObjWithFaces, obj2: ObjWithFaces): VerifyTouchObjResult {
    const MAX_FACES = 6; // Numero massimo di facce per ogni oggetto
    let cutted = 0;
    let inverted = 0;
    let a: number[] = [-1, 1];
    let b: number[] = [-1, 1];
    let c: number[] = [-1, 1];
    let c_o1 = 1;
    let c_o2 = 1;
    let continua = 1;

    // Itera su tutte le combinazioni di facce
    for (let c1 = 1; c1 <= MAX_FACES && continua === 1; c1++) {
        for (let c2 = 1; c2 <= MAX_FACES && continua === 1; c2++) {
            try {
                const f1 = getFace(c1, obj1.data);
                const f2 = getFace(c2, obj2.data);

                const touchResult: CheckTouchObjResult = checkTouchObj(f1, f2);

                if (touchResult.cutted === 1) {
                    cutted = 1;
                    a = touchResult.a;
                    b = touchResult.b;
                    c = touchResult.c;
                    inverted = touchResult.inverted;
                    c_o1 = c1;
                    c_o2 = c2;
                    continua = 0;
                }
            } catch (error) {
                // Gestione degli errori nel caso in cui getFace lanci un'eccezione
                console.error(`Errore durante la verifica delle facce ${c1} di obj1 e ${c2} di obj2:`, error);
            }
        }
    }

    
    return { cutted, a, b, c, inverted, c_o1, c_o2 };
}

