
// import { qrule } from './qrule';

/**
 
 * @param barra1 

 * @param curr_dir Direzione (1,2,...) come in MATLAB
 * @returns Il valore numerico `mean_l`
 */
export function mean_length_Lp(barra1: number[], curr_dir: number): number {
  // ===========================
  // 1) Estrazione coordinate
  // ===========================
  const xi1 = [barra1[0],  barra1[3],  barra1[6],  barra1[9]];
  const yi1 = [barra1[1],  barra1[4],  barra1[7],  barra1[10]];
  const zi1 = [barra1[2],  barra1[5],  barra1[8],  barra1[11]];

  const xi2 = [barra1[12], barra1[15], barra1[18], barra1[21]];
  const yi2 = [barra1[13], barra1[16], barra1[19], barra1[22]];
  const zi2 = [barra1[14], barra1[17], barra1[20], barra1[23]];

  // ===========================
  // 2) Creazione di ri[8][3] (vertici)
  // ===========================
  // In MATLAB: ri(i,:) => in TS: ri[i]
  const ri: number[][] = [
    [xi1[0], yi1[0], zi1[0]], // ri[0] (equiv. ri(1,:) in MATLAB)
    [xi1[1], yi1[1], zi1[1]], // ri[1] (equiv. ri(2,:) in MATLAB)
    [xi1[2], yi1[2], zi1[2]], // ri[2] (equiv. ri(3,:) in MATLAB)
    [xi1[3], yi1[3], zi1[3]], // ri[3] (equiv. ri(4,:) in MATLAB)
    [xi2[0], yi2[0], zi2[0]], // ri[4] (equiv. ri(5,:) in MATLAB)
    [xi2[1], yi2[1], zi2[1]], // ri[5] (equiv. ri(6,:) in MATLAB)
    [xi2[2], yi2[2], zi2[2]], // ri[6] (equiv. ri(7,:) in MATLAB)
    [xi2[3], yi2[3], zi2[3]], // ri[7] (equiv. ri(8,:) in MATLAB)
  ];

  // ===========================
  // 3) Vettori di interpolazione (rmi, rai, rbi, ...)
  // ===========================
  // rmi = 0.125 * sum(ri(1..8), 1);
  const rmi = [
    0.125 * (ri[0][0] + ri[1][0] + ri[2][0] + ri[3][0] + ri[4][0] + ri[5][0] + ri[6][0] + ri[7][0]),
    0.125 * (ri[0][1] + ri[1][1] + ri[2][1] + ri[3][1] + ri[4][1] + ri[5][1] + ri[6][1] + ri[7][1]),
    0.125 * (ri[0][2] + ri[1][2] + ri[2][2] + ri[3][2] + ri[4][2] + ri[5][2] + ri[6][2] + ri[7][2]),
  ];

  // rai = 0.125*( -ri(1,:)+ri(2,:)+ri(4,:)-ri(3,:)-ri(5,:)+ri(6,:)+ri(8,:)-ri(7,:) )
  const rai = [
    0.125 * (
      -ri[0][0] + ri[1][0] + ri[3][0] - ri[2][0]
      - ri[4][0] + ri[5][0] + ri[7][0] - ri[6][0]
    ),
    0.125 * (
      -ri[0][1] + ri[1][1] + ri[3][1] - ri[2][1]
      - ri[4][1] + ri[5][1] + ri[7][1] - ri[6][1]
    ),
    0.125 * (
      -ri[0][2] + ri[1][2] + ri[3][2] - ri[2][2]
      - ri[4][2] + ri[5][2] + ri[7][2] - ri[6][2]
    ),
  ];

  // rbi = 0.125*( -ri(1,:)-ri(2,:)+ri(4,:)+ri(3,:)-ri(5,:)-ri(6,:)+ri(8,:)+ri(7,:) )
  const rbi = [
    0.125 * (
      -ri[0][0] - ri[1][0] + ri[3][0] + ri[2][0]
      - ri[4][0] - ri[5][0] + ri[7][0] + ri[6][0]
    ),
    0.125 * (
      -ri[0][1] - ri[1][1] + ri[3][1] + ri[2][1]
      - ri[4][1] - ri[5][1] + ri[7][1] + ri[6][1]
    ),
    0.125 * (
      -ri[0][2] - ri[1][2] + ri[3][2] + ri[2][2]
      - ri[4][2] - ri[5][2] + ri[7][2] + ri[6][2]
    ),
  ];

  // rci = 0.125*( -ri(1,:)-ri(2,:)-ri(4,:)-ri(3,:)+ri(5,:)+ri(6,:)+ri(8,:)+ri(7,:) )
  const rci = [
    0.125 * (
      -ri[0][0] - ri[1][0] - ri[3][0] - ri[2][0]
      + ri[4][0] + ri[5][0] + ri[7][0] + ri[6][0]
    ),
    0.125 * (
      -ri[0][1] - ri[1][1] - ri[3][1] - ri[2][1]
      + ri[4][1] + ri[5][1] + ri[7][1] + ri[6][1]
    ),
    0.125 * (
      -ri[0][2] - ri[1][2] - ri[3][2] - ri[2][2]
      + ri[4][2] + ri[5][2] + ri[7][2] + ri[6][2]
    ),
  ];

  // rabi = 0.125*( ri(1,:)-ri(2,:)+ri(4,:)-ri(3,:)+ri(5,:)-ri(6,:)+ri(8,:)-ri(7,:) )
  const rabi = [
    0.125 * (
       ri[0][0] - ri[1][0] + ri[3][0] - ri[2][0]
       + ri[4][0] - ri[5][0] + ri[7][0] - ri[6][0]
    ),
    0.125 * (
       ri[0][1] - ri[1][1] + ri[3][1] - ri[2][1]
       + ri[4][1] - ri[5][1] + ri[7][1] - ri[6][1]
    ),
    0.125 * (
       ri[0][2] - ri[1][2] + ri[3][2] - ri[2][2]
       + ri[4][2] - ri[5][2] + ri[7][2] - ri[6][2]
    ),
  ];

  // rbci = 0.125*( ri(1,:)+ri(2,:)-ri(4,:)-ri(3,:)-ri(5,:)-ri(6,:)+ri(8,:)+ri(7,:) )
  const rbci = [
    0.125 * (
       ri[0][0] + ri[1][0] - ri[3][0] - ri[2][0]
       - ri[4][0] - ri[5][0] + ri[7][0] + ri[6][0]
    ),
    0.125 * (
       ri[0][1] + ri[1][1] - ri[3][1] - ri[2][1]
       - ri[4][1] - ri[5][1] + ri[7][1] + ri[6][1]
    ),
    0.125 * (
       ri[0][2] + ri[1][2] - ri[3][2] - ri[2][2]
       - ri[4][2] - ri[5][2] + ri[7][2] + ri[6][2]
    ),
  ];

  // raci = 0.125*( ri(1,:)-ri(2,:)-ri(4,:)+ri(3,:)-ri(5,:)+ri(6,:)+ri(8,:)-ri(7,:) )
  const raci = [
    0.125 * (
       ri[0][0] - ri[1][0] - ri[3][0] + ri[2][0]
       - ri[4][0] + ri[5][0] + ri[7][0] - ri[6][0]
    ),
    0.125 * (
       ri[0][1] - ri[1][1] - ri[3][1] + ri[2][1]
       - ri[4][1] + ri[5][1] + ri[7][1] - ri[6][1]
    ),
    0.125 * (
       ri[0][2] - ri[1][2] - ri[3][2] + ri[2][2]
       - ri[4][2] + ri[5][2] + ri[7][2] - ri[6][2]
    ),
  ];

  // rabci = 0.125*( -ri(1,:)+ri(2,:)-ri(4,:)+ri(3,:)+ri(5,:)-ri(6,:)+ri(8,:)-ri(7,:) )
  const rabci = [
    0.125 * (
      -ri[0][0] + ri[1][0] - ri[3][0] + ri[2][0]
      + ri[4][0] - ri[5][0] + ri[7][0] - ri[6][0]
    ),
    0.125 * (
      -ri[0][1] + ri[1][1] - ri[3][1] + ri[2][1]
      + ri[4][1] - ri[5][1] + ri[7][1] - ri[6][1]
    ),
    0.125 * (
      -ri[0][2] + ri[1][2] - ri[3][2] + ri[2][2]
      + ri[4][2] - ri[5][2] + ri[7][2] - ri[6][2]
    ),
  ];

  // ===========================
  // 4) Calcolo di r1, r2 in base a curr_dir
  //    (come in MATLAB, occhio agli indici 1-based -> 0-based)
  // ===========================
  let r1: number[];
  let r2: number[];

  if (curr_dir === 1) {
    // In MATLAB: r1 = 0.25*(ri(1,:)+ri(3,:)+ri(5,:)+ri(7,:))
    //            r2 = 0.25*(ri(2,:)+ri(4,:)+ri(6,:)+ri(8,:))
    r1 = media4(ri[0], ri[2], ri[4], ri[6]);
    r2 = media4(ri[1], ri[3], ri[5], ri[7]);

  } else if (curr_dir === 2) {
    // r1 = 0.25*(ri(1,:)+ri(2,:)+ri(5,:)+ri(6,:))
    // r2 = 0.25*(ri(3,:)+ri(4,:)+ri(7,:)+ri(8,:))
    r1 = media4(ri[0], ri[1], ri[4], ri[5]);
    r2 = media4(ri[2], ri[3], ri[6], ri[7]);

  } else {
    // r1 = 0.25*(ri(1,:)+ri(2,:)+ri(3,:)+ri(4,:))
    // r2 = 0.25*(ri(5,:)+ri(6,:)+ri(7,:)+ri(8,:))
    r1 = media4(ri[0], ri[1], ri[2], ri[3]);
    r2 = media4(ri[4], ri[5], ri[6], ri[7]);
  }

  // ===========================
  // 5) mean_l = norm(r1 - r2)
  // ===========================
  let mean_l = norm([
    r1[0] - r2[0],
    r1[1] - r2[1],
    r1[2] - r2[2],
  ]);

  /*
  // ===========================
  // BLOCCO COMMENTATO: Cicli con qrule(10,1)
  // ===========================
 
  // 
  import { qrule } from './qrule'; // 
  
  const { rootx, wex } = qrule(10, 1);
  const wey = wex;
  const rooty = rootx;
  const wez = wex;
  const rootz = rootx;
  const nlx = wex.length;
  const nly = wey.length;
  const nlz = wez.length;

  let sum_a1 = 0;
  for (let a1 = 0; a1 < nlx; a1++) {
    let sum_b1 = 0;
    for (let b1 = 0; b1 < nly; b1++) {
      let sum_c1 = 0;
      for (let c1 = 0; c1 < nlz; c1++) {
        // drai, drbi, drci
        const drai = [
          rai[0] + rabi[0]*rooty[b1] + raci[0]*rootz[c1] + rabci[0]*(rooty[b1]*rootz[c1]),
          rai[1] + rabi[1]*rooty[b1] + raci[1]*rootz[c1] + rabci[1]*(rooty[b1]*rootz[c1]),
          rai[2] + rabi[2]*rooty[b1] + raci[2]*rootz[c1] + rabci[2]*(rooty[b1]*rootz[c1]),
        ];
        const drbi = [
          rbi[0] + rabi[0]*rootx[a1] + rbci[0]*rootz[c1] + rabci[0]*(rootx[a1]*rootz[c1]),
          rbi[1] + rabi[1]*rootx[a1] + rbci[1]*rootz[c1] + rabci[1]*(rootx[a1]*rootz[c1]),
          rbi[2] + rabi[2]*rootx[a1] + rbci[2]*rootz[c1] + rabci[2]*(rootx[a1]*rootz[c1]),
        ];
        const drci = [
          rci[0] + raci[0]*rootx[a1] + rbci[0]*rooty[b1] + rabci[0]*(rootx[a1]*rooty[b1]),
          rci[1] + raci[1]*rootx[a1] + rbci[1]*rooty[b1] + rabci[1]*(rootx[a1]*rooty[b1]),
          rci[2] + raci[2]*rootx[a1] + rbci[2]*rooty[b1] + rabci[2]*(rootx[a1]*rooty[b1]),
        ];

        const draim = norm(drai);
        const drbim = norm(drbi);
        const drcim = norm(drci);

        const aversi = [drai[0]/draim, drai[1]/draim, drai[2]/draim];
        const bversi = [drbi[0]/drbim, drbi[1]/drbim, drbi[2]/drbim];
        const cversi = [drci[0]/drcim, drci[1]/drcim, drci[2]/drcim];

        const stetabi = cross(aversi, bversi);
        const stetbci = cross(bversi, cversi);
        const stetcai = cross(cversi, aversi);

        let f = 0;
        if (curr_dir === 1) {
          const stetim = norm(stetbci);
          const unitni = [stetbci[0]/stetim, stetbci[1]/stetim, stetbci[2]/stetim];
          const ctetnormi = dot(unitni, aversi) / (norm(unitni) * norm(aversi));
          f = (draim * stetim * ctetnormi) / 4;
        } else if (curr_dir === 2) {
          const stetim = norm(stetcai);
          const unitni = [stetcai[0]/stetim, stetcai[1]/stetim, stetcai[2]/stetim];
          const ctetnormi = dot(unitni, bversi) / (norm(unitni) * norm(bversi));
          f = (drbim * stetim * ctetnormi) / 4;
        } else {
          const stetim = norm(stetabi);
          const unitni = [stetabi[0]/stetim, stetabi[1]/stetim, stetabi[2]/stetim];
          const ctetnormi = dot(unitni, cversi) / (norm(unitni) * norm(cversi));
          f = (drcim * stetim * ctetnormi) / 4;
        }
        sum_c1 += wez[c1] * f;
      }
      sum_b1 += wey[b1] * sum_c1;
    }
    sum_a1 += wex[a1] * sum_b1;
  }

  mean_l = sum_a1;
  // Fine blocco commentato
  */

  // ===========================
  // 6) Ritorno il mean_l calcolato
  // ===========================
  return mean_l;
}


/* ================== Funzioni di utilità ================== */

/**
 * Calcola la norma euclidea di un vettore 3D.
 */
function norm(vec: number[]): number {
  return Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1] + vec[2]*vec[2]);
}

/**
 * Prodotto scalare fra due vettori 3D.
 */
function dot(v1: number[], v2: number[]): number {
  return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
}

/**
 * Prodotto vettoriale fra due vettori 3D.
 */
function cross(v1: number[], v2: number[]): number[] {
  return [
    v1[1]*v2[2] - v1[2]*v2[1],
    v1[2]*v2[0] - v1[0]*v2[2],
    v1[0]*v2[1] - v1[1]*v2[0],
  ];
}

/**
 * Esegue la media di 4 vettori 3D (somma e divide per 4).
 */
function media4(a: number[], b: number[], c: number[], d: number[]): number[] {
  return [
    (a[0] + b[0] + c[0] + d[0]) / 4,
    (a[1] + b[1] + c[1] + d[1]) / 4,
    (a[2] + b[2] + c[2] + d[2]) / 4,
  ];
}
