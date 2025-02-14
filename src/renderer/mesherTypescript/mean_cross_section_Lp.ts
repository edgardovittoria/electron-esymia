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
export function mean_cross_section_Lp(barra1: number[], curr_dir: number): number {
  // 1) Estrai i vertici (xi1, yi1, zi1, xi2, yi2, zi2) come in MATLAB.
  const xi1 = [barra1[0],  barra1[3],  barra1[6],  barra1[9]];
  const yi1 = [barra1[1],  barra1[4],  barra1[7],  barra1[10]];
  const zi1 = [barra1[2],  barra1[5],  barra1[8],  barra1[11]];

  const xi2 = [barra1[12], barra1[15], barra1[18], barra1[21]];
  const yi2 = [barra1[13], barra1[16], barra1[19], barra1[22]];
  const zi2 = [barra1[14], barra1[17], barra1[20], barra1[23]];

  // 2) Crea la matrice ri[8][3] dei vertici (PSP)
  const ri: number[][] = [
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
  const rmi: number[] = [
    0.125 * (ri[0][0] + ri[1][0] + ri[2][0] + ri[3][0] + ri[4][0] + ri[5][0] + ri[6][0] + ri[7][0]),
    0.125 * (ri[0][1] + ri[1][1] + ri[2][1] + ri[3][1] + ri[4][1] + ri[5][1] + ri[6][1] + ri[7][1]),
    0.125 * (ri[0][2] + ri[1][2] + ri[2][2] + ri[3][2] + ri[4][2] + ri[5][2] + ri[6][2] + ri[7][2]),
  ];

  // rai = 0.125 * ( -ri(1,:)+ri(2,:)+ri(4,:)-ri(3,:) -ri(5,:)+ri(6,:)+ri(8,:)-ri(7,:) )
  // ->  1-based => 0-based: (1->0,2->1,3->2,4->3,5->4,6->5,7->6,8->7)
  const rai: number[] = [
    0.125 * (-ri[0][0] + ri[1][0] + ri[3][0] - ri[2][0] - ri[4][0] + ri[5][0] + ri[7][0] - ri[6][0]),
    0.125 * (-ri[0][1] + ri[1][1] + ri[3][1] - ri[2][1] - ri[4][1] + ri[5][1] + ri[7][1] - ri[6][1]),
    0.125 * (-ri[0][2] + ri[1][2] + ri[3][2] - ri[2][2] - ri[4][2] + ri[5][2] + ri[7][2] - ri[6][2]),
  ];

  // rbi = 0.125 * ( -ri(1,:)-ri(2,:)+ri(4,:)+ri(3,:) -ri(5,:)-ri(6,:)+ri(8,:)+ri(7,:) )
  const rbi: number[] = [
    0.125 * (-ri[0][0] - ri[1][0] + ri[3][0] + ri[2][0] - ri[4][0] - ri[5][0] + ri[7][0] + ri[6][0]),
    0.125 * (-ri[0][1] - ri[1][1] + ri[3][1] + ri[2][1] - ri[4][1] - ri[5][1] + ri[7][1] + ri[6][1]),
    0.125 * (-ri[0][2] - ri[1][2] + ri[3][2] + ri[2][2] - ri[4][2] - ri[5][2] + ri[7][2] + ri[6][2]),
  ];

  // rci = 0.125 * ( -ri(1,:)-ri(2,:)-ri(4,:)-ri(3,:) +ri(5,:)+ri(6,:)+ri(8,:)+ri(7,:) )
  const rci: number[] = [
    0.125 * (-ri[0][0] - ri[1][0] - ri[3][0] - ri[2][0] + ri[4][0] + ri[5][0] + ri[7][0] + ri[6][0]),
    0.125 * (-ri[0][1] - ri[1][1] - ri[3][1] - ri[2][1] + ri[4][1] + ri[5][1] + ri[7][1] + ri[6][1]),
    0.125 * (-ri[0][2] - ri[1][2] - ri[3][2] - ri[2][2] + ri[4][2] + ri[5][2] + ri[7][2] + ri[6][2]),
  ];

  // rabi = 0.125 * ( ri(1,:)-ri(2,:)+ri(4,:)-ri(3,:) +ri(5,:)-ri(6,:)+ri(8,:)-ri(7,:) )
  const rabi: number[] = [
    0.125 * (ri[0][0] - ri[1][0] + ri[3][0] - ri[2][0] + ri[4][0] - ri[5][0] + ri[7][0] - ri[6][0]),
    0.125 * (ri[0][1] - ri[1][1] + ri[3][1] - ri[2][1] + ri[4][1] - ri[5][1] + ri[7][1] - ri[6][1]),
    0.125 * (ri[0][2] - ri[1][2] + ri[3][2] - ri[2][2] + ri[4][2] - ri[5][2] + ri[7][2] - ri[6][2]),
  ];

  // rbci = 0.125 * ( ri(1,:)+ri(2,:)-ri(4,:)-ri(3,:) -ri(5,:)-ri(6,:)+ri(8,:)+ri(7,:) )
  const rbci: number[] = [
    0.125 * (ri[0][0] + ri[1][0] - ri[3][0] - ri[2][0] - ri[4][0] - ri[5][0] + ri[7][0] + ri[6][0]),
    0.125 * (ri[0][1] + ri[1][1] - ri[3][1] - ri[2][1] - ri[4][1] - ri[5][1] + ri[7][1] + ri[6][1]),
    0.125 * (ri[0][2] + ri[1][2] - ri[3][2] - ri[2][2] - ri[4][2] - ri[5][2] + ri[7][2] + ri[6][2]),
  ];

  // raci = 0.125 * ( ri(1,:)-ri(2,:)-ri(4,:)+ri(3,:) -ri(5,:)+ri(6,:)+ri(8,:)-ri(7,:) )
  const raci: number[] = [
    0.125 * (ri[0][0] - ri[1][0] - ri[3][0] + ri[2][0] - ri[4][0] + ri[5][0] + ri[7][0] - ri[6][0]),
    0.125 * (ri[0][1] - ri[1][1] - ri[3][1] + ri[2][1] - ri[4][1] + ri[5][1] + ri[7][1] - ri[6][1]),
    0.125 * (ri[0][2] - ri[1][2] - ri[3][2] + ri[2][2] - ri[4][2] + ri[5][2] + ri[7][2] - ri[6][2]),
  ];

  // rabci = 0.125 * ( -ri(1,:)+ri(2,:)-ri(4,:)+ri(3,:) +ri(5,:)-ri(6,:)+ri(8,:)-ri(7,:) )
  const rabci: number[] = [
    0.125 * (-ri[0][0] + ri[1][0] - ri[3][0] + ri[2][0] + ri[4][0] - ri[5][0] + ri[7][0] - ri[6][0]),
    0.125 * (-ri[0][1] + ri[1][1] - ri[3][1] + ri[2][1] + ri[4][1] - ri[5][1] + ri[7][1] - ri[6][1]),
    0.125 * (-ri[0][2] + ri[1][2] - ri[3][2] + ri[2][2] + ri[4][2] - ri[5][2] + ri[7][2] - ri[6][2]),
  ];

  // 4)  "regola di quadratura a 1 punto"
  //    In MATLAB: [rootx, wex] = qrule(1) => rootx=0, wex=2
  const rootx = 0;
  const wex   = 2;
  const wey   = wex;
  const rooty = rootx;
  const wez   = wex;
  const rootz = rootx;

  // Per 1 punto di quadratura, i "cicli" vanno comunque da 0 a 0 (una sola iterazione).
  const nlx = 1; 
  const nly = 1; 
  const nlz = 1;

  // 5) Cicli di integrazione 
  let sum_a1 = 0;
  for (let a1 = 0; a1 < nlx; a1++) {
    let sum_b1 = 0;
    for (let b1 = 0; b1 < nly; b1++) {
      let sum_c1 = 0;
      for (let c1 = 0; c1 < nlz; c1++) {
        // Calcola drai, drbi, drci (come in MATLAB):
        const drai = [
          rai[0] + rabi[0] * rooty + raci[0] * rootz + rabci[0] * (rooty * rootz),
          rai[1] + rabi[1] * rooty + raci[1] * rootz + rabci[1] * (rooty * rootz),
          rai[2] + rabi[2] * rooty + raci[2] * rootz + rabci[2] * (rooty * rootz),
        ];
        const drbi = [
          rbi[0] + rabi[0] * rootx + rbci[0] * rootz + rabci[0] * (rootx * rootz),
          rbi[1] + rabi[1] * rootx + rbci[1] * rootz + rabci[1] * (rootx * rootz),
          rbi[2] + rabi[2] * rootx + rbci[2] * rootz + rabci[2] * (rootx * rootz),
        ];
        const drci = [
          rci[0] + raci[0] * rootx + rbci[0] * rooty + rabci[0] * (rootx * rooty),
          rci[1] + raci[1] * rootx + rbci[1] * rooty + rabci[1] * (rootx * rooty),
          rci[2] + raci[2] * rootx + rbci[2] * rooty + rabci[2] * (rootx * rooty),
        ];

        // Norme e versori
        const draim = norm(drai);
        const drbim = norm(drbi);
        const drcim = norm(drci);

        const aversi = [ drai[0]/draim, drai[1]/draim, drai[2]/draim ];
        const bversi = [ drbi[0]/drbim, drbi[1]/drbim, drbi[2]/drbim ];
        const cversi = [ drci[0]/drcim, drci[1]/drcim, drci[2]/drcim ];

        const stetabi = cross(aversi, bversi);
        const stetbci = cross(bversi, cversi);
        const stetcai = cross(cversi, aversi);

        // Scelta in base a curr_dir
        let f = 0;
        if (curr_dir === 1) {
          const stetim    = norm(stetbci);
          const unitni    = [ stetbci[0]/stetim, stetbci[1]/stetim, stetbci[2]/stetim ];
          const ctetnormi = dot(unitni, aversi) / (norm(unitni) * norm(aversi));
          f = (drbim * drcim * stetim * ctetnormi) / 2;
          // (In MATLAB c'era la riga commentata: f = drbim * drcim * stetim / 2;)
        } else if (curr_dir === 2) {
          const stetim    = norm(stetcai);
          const unitni    = [ stetcai[0]/stetim, stetcai[1]/stetim, stetcai[2]/stetim ];
          const ctetnormi = dot(unitni, bversi) / (norm(unitni) * norm(bversi));
          f = (draim * drcim * stetim * ctetnormi) / 2;
          // (riga commentata in MATLAB: f = draim * drcim * stetim / 2;)
        } else {
          const stetim    = norm(stetabi);
          const unitni    = [ stetabi[0]/stetim, stetabi[1]/stetim, stetabi[2]/stetim ];
          const ctetnormi = dot(unitni, cversi) / (norm(unitni) * norm(cversi));
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

  const mean_cr_sect = sum_a1;
  return mean_cr_sect;
}

/* ================= Funzioni di utilità per algebra vettoriale 3D ================= */

/**
 * Norma euclidea di un vettore 3D
 */
function norm(v: number[]): number {
  return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
}

/**
 * Prodotto scalare fra due vettori 3D
 */
function dot(v1: number[], v2: number[]): number {
  return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
}

/**
 * Prodotto vettoriale fra due vettori 3D
 */
function cross(v1: number[], v2: number[]): number[] {
  return [
    v1[1]*v2[2] - v1[2]*v2[1],
    v1[2]*v2[0] - v1[0]*v2[2],
    v1[0]*v2[1] - v1[1]*v2[0],
  ];
}
