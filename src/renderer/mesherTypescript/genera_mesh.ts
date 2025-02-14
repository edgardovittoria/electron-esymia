import { mean_length_rev } from './mean_length_rev';
import { genera_parametri_diel_rec_con_rev } from './genera_parametri_diel_rec_con_rev';
import { discretizza_thermal_rev } from './discretizza_thermal_rev';
import { matrice_R_rev } from './matrice_R_rev';
import { matrici_selettrici_rev } from './matrici_selettrici_rev';
import * as math from 'mathjs';
import { MaterialMesher } from './interfaces';

interface Regioni {
  coordinate: number[][];
  cond: number[];
  epsr: number[];
  mu: number[];
  mur: number[];
  materiale: number[];
  Nx: number[];
  Ny: number[];
  Nz: number[];
  vertici?: number[][][];
  spigoli?: number[][][][];
  centri: number[][];
}

interface Escalings {
  Lp: number;
  P: number;
  R: number;
  Cd: number;
  Is: number;
  Yle: number;
  freq: number;
  time: number;
}

interface IncidenceSelection {
  Gamma: math.Matrix;
  mx: number;
  my: number;
  mz: number;
  A: math.Matrix;
}

interface Volumi {
  coordinate: number[][];
  S: number[];
  l: number[];
  R: number[];
  Cd?: number[];
  centri: number[][];
  indici_dielettrici: number[];
  Zs_part: number[];
}

interface Superfici {
  estremi_celle: number[][];
  centri: number[][];
  S: number[];
  normale: number[][];
  mur: number[];
  sigma: number[];
  epsr: number[];
  materials: number[];
}

export function genera_mesh(
  Regioni: Regioni,
  den: number,
  freq_max: number,
  scalamento: number,
  use_escalings: number,
  materials: MaterialMesher[],
): {
  incidence_selection: IncidenceSelection;
  volumi: Volumi;
  superfici: Superfici;
  nodi_coord: number[][];
  escalings: Escalings;
} {
  const escalings: Escalings = {
    Lp: 1,
    P: 1,
    R: 1,
    Cd: 1,
    Is: 1,
    Yle: 1,
    freq: 1,
    time: 1,
  };

  if (use_escalings === 1) {
    escalings.Lp = 1e6;
    escalings.P = 1e-12;
    escalings.R = 1e-3;
    escalings.Cd = 1e12;
    escalings.Is = 1e3;
    escalings.Yle = 1e3;
    escalings.freq = 1e-9;
    escalings.time = 1e9;
  }

  const c0 = 3e8;
  const lambda = c0 / freq_max;
  const indx = [0, 3, 6, 9, 12, 15, 18, 21];
  const indy = [1, 4, 7, 10, 13, 16, 19, 22];
  const indz = [2, 5, 8, 11, 14, 17, 20, 23];
  const N_reg = Regioni.coordinate.length;

  Regioni.Nx = Array(N_reg).fill(0);
  Regioni.Ny = Array(N_reg).fill(0);
  Regioni.Nz = Array(N_reg).fill(0);
  Regioni.centri = [];

  for (let p = 0; p < N_reg; p++) {
    const len = Math.abs(mean_length_rev(Regioni.coordinate[p], 1));
    const thickness = Math.abs(mean_length_rev(Regioni.coordinate[p], 3));
    const width = Math.abs(mean_length_rev(Regioni.coordinate[p], 2));

    Regioni.Nx[p] = Math.ceil((len * scalamento) / (lambda / den));
    if (Regioni.Nx[p] < 2) {
      Regioni.Nx[p] = 2;
    }

    Regioni.Ny[p] = Math.ceil((width * scalamento) / (lambda / den));
    if (Regioni.Ny[p] < 2) {
      Regioni.Ny[p] = 2;
    }

    Regioni.Nz[p] = Math.ceil((thickness * scalamento) / (lambda / den));
    if (Regioni.Nz[p] < 2) {
      Regioni.Nz[p] = 2;
    }

    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    for (let i = 0; i < indx.length; i++) {
      sumX += Regioni.coordinate[p][indx[i]];
      sumY += Regioni.coordinate[p][indy[i]];
      sumZ += Regioni.coordinate[p][indz[i]];
    }
    Regioni.centri.push([sumX / 8, sumY / 8, sumZ / 8]);
  }

  let { induttanze, nodi, A } = discretizza_thermal_rev(Regioni, materials);

  induttanze = matrice_R_rev(induttanze);
  induttanze = matrici_selettrici_rev(induttanze);
  genera_parametri_diel_rec_con_rev(induttanze);

  // Calcola indici_celle_indx, indici_celle_indy, indici_celle_indz DOPO aver chiamato discretizza_thermal_rev
  induttanze.indici_celle_indx = findIndices(induttanze.dir_curr, 1);
  induttanze.indici_celle_indy = findIndices(induttanze.dir_curr, 2);
  induttanze.indici_celle_indz = findIndices(induttanze.dir_curr, 3);

  const RvTrasposta = math.transpose(nodi.Rv) as math.Matrix;

  // 2) Esegui il "find" sulla matrice trasposta
  const { i, j, k } = findSparse(RvTrasposta);
  // 3) Crea una matrice sparsa vuota
  const GammaSparse = math.sparse(); // creiamo la struttura vuota

  // 4) Imposta la dimensione (size(A,2) x size(nodi.Rv,1))
  GammaSparse.resize([A.size()[1], nodi.Rv.size()[0]]);

  // 5) Riempila con i valori
  for (let idx = 0; idx < k.length; idx++) {
    const row = i[idx] - 1; // da 1-based a 0-based
    const col = j[idx] - 1; // da 1-based a 0-based
    GammaSparse.set([row, col], k[idx]);
  }

  const incidence_selection: IncidenceSelection = {
    Gamma: GammaSparse,
    mx: induttanze.indici_celle_indx?.length ?? 0,
    my: induttanze.indici_celle_indy?.length ?? 0,
    mz: induttanze.indici_celle_indz?.length ?? 0,
    A: A,
  };

  const perm = [
    ...(induttanze.indici_celle_indx ?? []).map((index) => index + 1), // Rendi 1-based
    ...(induttanze.indici_celle_indy ?? []).map((index) => index + 1),
    ...(induttanze.indici_celle_indz ?? []).map((index) => index + 1),
  ];

  const volumi: Volumi = {
    // 1) Estrai e riordina le righe in base all'ordine di perm
    coordinate: perm.map((p) => {
      // p è 1-based, quindi p - 1 in JS
      return induttanze.estremi_celle![p - 1].map((val) => val * scalamento);
    }),

    S: perm.map((p) => {
      return induttanze.S![p - 1] * scalamento * scalamento;
    }),

    l: perm.map((p) => {
      return induttanze.l![p - 1] * scalamento;
    }),

    R: perm.map((p) => {
      return (induttanze.R![p - 1] / scalamento) * escalings.R;
    }),

    Cd: perm.map((p) => {
      return induttanze.Cp![p - 1] * scalamento * escalings.Cd;
    }),

    centri: perm.map((p) => {
      return induttanze.centri![p - 1].map((val) => val * scalamento);
    }),

    Zs_part: perm.map((p) => {
      return (induttanze.Zs_part![p - 1] / scalamento) * escalings.R;
    }),

    indici_dielettrici: [],
  };

  // Calcolo di volumi.indici_dielettrici
  const indici_Nd = induttanze.indici_Nd ?? [];
  for (let k = 0; k < indici_Nd.length; k++) {
    volumi.indici_dielettrici[k] = perm.indexOf(indici_Nd[k] + 1) + 1; // Usa indici 0-based e +1 per compatibilità con MATLAB
  }

  // Filtraggio di incidence_selection.A
  // Crea una nuova matrice sparsa per incidence_selection.A
  const numRowsA = perm.length;
  const numColsA = A.size()[1];
  let filteredA = math.sparse([], 'number'); // Inizializza come matrice sparsa vuota
  filteredA.resize([numRowsA, numColsA]); // Imposta le dimensioni
  for (let p = 0; p < perm.length; p++) {
    const rowIndex = perm[p] - 1; // Converti l'indice 1-based di 'perm' in 0-based
    if (rowIndex >= 0 && rowIndex < A.size()[0]) {
      // Estrai la riga specificata dalla matrice sparsa originale A
      for (let j = 0; j < numColsA; j++) {
        const value = A.get([rowIndex, j]);
        if (value !== 0) {
          filteredA.set([p, j], value);
        }
      }
    }
  }

  incidence_selection.A = filteredA; // Assegna la nuova matrice sparsa filtrata

  const superfici: Superfici = {
    estremi_celle: (nodi.estremi_celle ?? []).map((row) =>
      row.map((val) => val * scalamento),
    ),
    centri: [],
    S: (nodi.superfici ?? []).map((val) => val * scalamento * scalamento),
    normale: nodi.normale ?? [],
    mur: nodi.mur ?? [],
    sigma: nodi.sigma ?? [],
    epsr: nodi.epsr ?? [],
    materials: nodi.materials ?? [],
  };

  for (let i = 0; i < superfici.estremi_celle.length; i++) {
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    for (let j = 0; j < 12; j += 3) {
      sumX += superfici.estremi_celle[i][j];
      sumY += superfici.estremi_celle[i][j + 1];
      sumZ += superfici.estremi_celle[i][j + 2];
    }
    superfici.centri.push([sumX / 4, sumY / 4, sumZ / 4]);
  }

  superfici.estremi_celle = hcat(...superfici.estremi_celle);
  superfici.centri = hcat(...superfici.centri);
  superfici.normale = hcat(...superfici.normale);

  const nodi_coord = (nodi.centri ?? []).map((row) =>
    row.map((val) => val * scalamento),
  );

  //const gamma = incidence_selection.Gamma;

  return { incidence_selection, volumi, superfici, nodi_coord, escalings };
}

//**FUNZIONI DI SUPPORTO */

// Funzione per trovare gli indici e i valori non nulli di una matrice (equivalente a find(X.'))
//lavora in 1 based
function findSparse(matrix: math.Matrix): {
  i: number[];
  j: number[];
  k: number[];
} {
  const i: number[] = [];
  const j: number[] = [];
  const k: number[] = [];

  // Itera sugli elementi non nulli della matrice sparsa
  matrix.forEach((value, index) => {
    if (value !== 0) {
      i.push(index[0] + 1);
      j.push(index[1] + 1);
      k.push(value);
    }
  });

  return { i, j, k };
}

function findIndices(
  arr: number[],
  condition: number | ((val: number) => boolean),
): number[] {
  const indices: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    if (
      (typeof condition === 'number' && arr[i] === condition) ||
      (typeof condition === 'function' && condition(arr[i]))
    ) {
      indices.push(i); // Salviamo l'indice 0-based
    }
  }
  return indices;
}

/**
 * Horizontally concatenates column vectors (1D arrays) into a 2D array.
 * Each input array represents a column, and all arrays must have the same length.
 *
 * @param columns - One or more arrays to be concatenated as columns.
 * @returns A 2D array where each inner array is a row containing the corresponding elements from each column.
 * @throws An error if the input arrays are not all the same length.
 */
function hcat<T>(...columns: T[][]): T[][] {
  if (columns.length === 0) return [];

  // Determine the number of rows from the first column.
  const numRows = columns[0].length;

  // Ensure all columns have the same length.
  for (const col of columns) {
    if (col.length !== numRows) {
      throw new Error("All columns must have the same number of elements.");
    }
  }

  // Build the result by iterating over rows.
  const result: T[][] = [];
  for (let i = 0; i < numRows; i++) {
    // For each row, take the i-th element from every column.
    const row = columns.map(col => col[i]);
    result.push(row);
  }
  return result;
}