import { mean_length_save } from './mean_length_save';
import { mean_length_Lp } from './mean_length_Lp';
import { mean_cross_section_Lp } from './mean_cross_section_Lp';

export function genera_celle_induttive(r_nodi_barra: number[][]): {
  celle_ind: number[][];
  lati: number[][][];
  vers: number[][];
  l: number[];
  indici_celle_indx: number[];
  indici_celle_indy: number[];
  indici_celle_indz: number[];
  spessore: number[];
  Sup: number[];
  width: number[];
  dir_curr: number[];
} {
  const celle_ind: number[][] = [];
  const lati: number[][][] = [];
  const vers: number[][] = [];
  const l: number[] = [];
  const indici_celle_indx: number[] = [];
  const indici_celle_indy: number[] = [];
  const indici_celle_indz: number[] = [];
  const spessore: number[] = [];
  const Sup: number[] = [];
  const width: number[] = [];
  const dir_curr: number[] = [];

  // Funzione di supporto per calcolare i parametri di una cella
  function calcolaParametriCella(cella: number[], dir: number, p: number): void {
    l[p] = Math.abs(mean_length_save(cella, dir));
    if (dir == 1) {
      spessore[p] = Math.abs(mean_length_save(cella, 3));
      Sup[p] = Math.abs(mean_cross_section_Lp(cella, dir));
      width[p] = Math.abs(mean_length_Lp(cella, 2));
    } else if (dir == 2) {
      spessore[p] = Math.abs(mean_length_save(cella, 3));
      Sup[p] = Math.abs(mean_cross_section_Lp(cella, dir));
      width[p] = Math.abs(mean_length_Lp(cella, 1));
    } else {
      spessore[p] = Math.abs(mean_length_save(cella, 1));
      Sup[p] = Math.abs(mean_cross_section_Lp(cella, dir));
      width[p] = Math.abs(mean_length_Lp(cella, 2));
    }
  }

  function createLato(r1: number[], r2: number[]) {
    return {
      punto1: r1,
      punto2: r2,
    };
  }

  // Funzione di supporto per aggiungere una cella
  function aggiungiCella(
    r_punti: number[][],
    dir: number,
    indice_array: number[],
    p: number
  ): number {
    const cella: number[] = [];

    r_punti.forEach(r => cella.push(...r)); // Inserisce i punti nella cella in un unico array

    celle_ind[p] = cella;

    const lato = createLato(r_punti[0], r_punti[1]);
    lati[p] = [[...lato.punto1], [...lato.punto2]];

    const lato_vett = lato.punto2.map((val, i) => val - lato.punto1[i]);

    vers[p] = lato_vett.map(val =>
      val / Math.sqrt(lato_vett.reduce((sum, val) => sum + val * val, 0))
    );
    dir_curr[p] = dir;
    indice_array.push(p);
    calcolaParametriCella(cella, dir, p);
    return p + 1;
  }

  // Definisci i gruppi di punti per ogni direzione
  const gruppi_x = [
    [
      [
        r_nodi_barra[0],
        r_nodi_barra[1],
        r_nodi_barra[4],
        r_nodi_barra[5],
        r_nodi_barra[18],
        r_nodi_barra[20],
        r_nodi_barra[25],
        r_nodi_barra[21],
      ],
    ],
    [
      [
        r_nodi_barra[4],
        r_nodi_barra[5],
        r_nodi_barra[2],
        r_nodi_barra[3],
        r_nodi_barra[25],
        r_nodi_barra[21],
        r_nodi_barra[24],
        r_nodi_barra[22],
      ],
    ],
    [
      [
        r_nodi_barra[18],
        r_nodi_barra[20],
        r_nodi_barra[25],
        r_nodi_barra[21],
        r_nodi_barra[9],
        r_nodi_barra[10],
        r_nodi_barra[13],
        r_nodi_barra[14],
      ],
    ],
    [
      [
        r_nodi_barra[25],
        r_nodi_barra[21],
        r_nodi_barra[24],
        r_nodi_barra[22],
        r_nodi_barra[13],
        r_nodi_barra[14],
        r_nodi_barra[11],
        r_nodi_barra[12],
      ],
    ],
  ];

  const gruppi_y = [
    [
      [
        r_nodi_barra[0],
        r_nodi_barra[6],
        r_nodi_barra[2],
        r_nodi_barra[7],
        r_nodi_barra[18],
        r_nodi_barra[19],
        r_nodi_barra[24],
        r_nodi_barra[23],
      ],
    ],
    [
      [
        r_nodi_barra[6],
        r_nodi_barra[1],
        r_nodi_barra[7],
        r_nodi_barra[3],
        r_nodi_barra[19],
        r_nodi_barra[20],
        r_nodi_barra[23],
        r_nodi_barra[22],
      ],
    ],
    [
      [
        r_nodi_barra[18],
        r_nodi_barra[19],
        r_nodi_barra[24],
        r_nodi_barra[23],
        r_nodi_barra[9],
        r_nodi_barra[15],
        r_nodi_barra[11],
        r_nodi_barra[16],
      ],
    ],
    [
      [
        r_nodi_barra[19],
        r_nodi_barra[20],
        r_nodi_barra[23],
        r_nodi_barra[22],
        r_nodi_barra[15],
        r_nodi_barra[10],
        r_nodi_barra[16],
        r_nodi_barra[12],
      ],
    ],
  ];

  const gruppi_z = [
    [
      [
        r_nodi_barra[0],
        r_nodi_barra[6],
        r_nodi_barra[4],
        r_nodi_barra[8],
        r_nodi_barra[9],
        r_nodi_barra[15],
        r_nodi_barra[13],
        r_nodi_barra[17],
      ],
    ],
    [
      [
        r_nodi_barra[6],
        r_nodi_barra[1],
        r_nodi_barra[8],
        r_nodi_barra[5],
        r_nodi_barra[15],
        r_nodi_barra[10],
        r_nodi_barra[17],
        r_nodi_barra[14],
      ],
    ],
    [
      [
        r_nodi_barra[4],
        r_nodi_barra[8],
        r_nodi_barra[2],
        r_nodi_barra[7],
        r_nodi_barra[13],
        r_nodi_barra[17],
        r_nodi_barra[11],
        r_nodi_barra[16],
      ],
    ],
    [
      [
        r_nodi_barra[8],
        r_nodi_barra[5],
        r_nodi_barra[7],
        r_nodi_barra[3],
        r_nodi_barra[17],
        r_nodi_barra[14],
        r_nodi_barra[16],
        r_nodi_barra[12],
      ],
    ],
  ];

  let p = 0; // Inizializza l'indice della cella

  // Itera sui gruppi di punti e aggiungi le celle
  gruppi_x.forEach(gruppo => {
    p = aggiungiCella(gruppo[0], 1, indici_celle_indx, p);
  });

  gruppi_y.forEach(gruppo => {
    p = aggiungiCella(gruppo[0], 2, indici_celle_indy, p);
  });

  gruppi_z.forEach(gruppo => {
    p = aggiungiCella(gruppo[0], 3, indici_celle_indz, p);
  });

  return {
    celle_ind,
    lati,
    vers,
    l,
    indici_celle_indx,
    indici_celle_indy,
    indici_celle_indz,
    spessore,
    Sup,
    width,
    dir_curr,
  };
}