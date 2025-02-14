import { surfa_old } from './surfa_old';
import { mean_length_save } from './mean_length_save';
import { mean_length_Lp } from './mean_length_Lp';
import { mean_cross_section_Lp } from './mean_cross_section_Lp';
import { norm } from './norm';
import { cross } from './cross';


export function genera_celle_induttive_maglie_save(
  rp: number[][][][],   // [Npuntix][Npuntiy][Npuntiz][3]
  Npuntix: number,
  Npuntiy: number,
  Npuntiz: number,
  weights_five: number[],
  roots_five: number[]
): {
  celle_ind: number[][];           
  lati: number[][][];             
  vers: number[][];                
  l: number[];
  spessore: number[];
  Sup: number[];
  width: number[];
  dir_curr: number[];

  celle_ind_sup: number[][];       
  indici_celle_ind_supx: number[]; 
  indici_celle_ind_supy: number[];
  indici_celle_ind_supz: number[];

  rc_sup: number[][];              
  Sup_sup: number[];               
  normale_sup: number[][];         
  dir_curr_sup: number[];
  w_sup: number[];

  barra: number[][];
}
{
  // 1) Calcolo del numero di celle
  const n_celle_ind =
    Npuntiz * Npuntiy * (Npuntix - 1) +
    Npuntiz * (Npuntiy - 1) * Npuntix +
    (Npuntiz - 1) * Npuntiy * Npuntix;

  // 2) Allocazione array principali
  const celle_ind: number[][] = Array.from({ length: n_celle_ind }, () => Array(24).fill(0));

  // lati: [2][n_celle_ind][3]
  const lati: number[][][] = [
    Array.from({ length: n_celle_ind }, () => Array(3).fill(0)),
    Array.from({ length: n_celle_ind }, () => Array(3).fill(0))
  ];

  const dir_curr: number[] = Array(n_celle_ind).fill(0);
  const vers: number[][]   = Array.from({ length: n_celle_ind }, () => Array(3).fill(0));

  const l: number[]         = Array(n_celle_ind).fill(0);
  const spessore: number[]  = Array(n_celle_ind).fill(0);
  const Sup: number[]       = Array(n_celle_ind).fill(0);
  const width: number[]     = Array(n_celle_ind).fill(0);

  // dx, dy, dz
  const dx: number[] = Array(n_celle_ind).fill(0);
  const dy: number[] = Array(n_celle_ind).fill(0);
  const dz: number[] = Array(n_celle_ind).fill(0);

  // 3) Celle_ind_sup, rc_sup, sup_sup, normale_sup, dir_curr_sup, w_sup
  const celle_ind_sup: number[][] = Array.from(
    { length: 6 * n_celle_ind },
    () => Array(12).fill(0)
  );

  const rc_sup: number[][] = Array.from(
    { length: 6 * n_celle_ind },
    () => Array(3).fill(0)
  );

  const Sup_sup: number[]     = Array(6 * n_celle_ind).fill(0);
  const normale_sup: number[][] = Array.from(
    { length: 6 * n_celle_ind },
    () => Array(3).fill(0)
  );
  const dir_curr_sup: number[] = Array(6 * n_celle_ind).fill(0);
  const w_sup: number[]        = Array(6 * n_celle_ind).fill(0);

  // indici superfici x, y, z
  const indici_celle_ind_supx: number[] = Array(6 * Npuntiz * Npuntiy * (Npuntix - 1)).fill(0);
  const indici_celle_ind_supy: number[] = Array(6 * Npuntiz * (Npuntiy - 1) * Npuntix).fill(0);
  const indici_celle_ind_supz: number[] = Array(6 * (Npuntiz - 1) * Npuntiy * Npuntix).fill(0);

  // contatori
  let p  = 0;  // indice cella volumetrica
  let ps = 0; // indice superficie
  let s  = 0;  // per lati

  // =============== DIREZIONE X ===============
  let psx = 0; // contatore superfici x
  for (let o = 0; o < Npuntiz; o++) {
    for (let n = 0; n < Npuntiy; n++) {
      for (let m = 0; m < Npuntix - 1; m++) {
        let r1: number[], r2: number[], r3: number[], r4: number[];
        let r5: number[], r6: number[], r7: number[], r8: number[];

        // --- if/else per r1, r2 (esempio) ---
        if (o === 0) {
          if (n === 0) {
            r1 = rp[m][n][o];
            r2 = rp[m+1][n][o];
          } else {
            r1 = rp[m][n][o].map((val,i) => 0.5*(val + rp[m][n-1][o][i]));
            r2 = rp[m+1][n][o].map((val,i) => 0.5*(val + rp[m+1][n-1][o][i]));
          }
        } else {
          if (n === 0) {
            r1 = rp[m][n][o].map((val,i) => 0.5*(val + rp[m][n][o-1][i]));
            r2 = rp[m+1][n][o].map((val,i) => 0.5*(val + rp[m+1][n][o-1][i]));
          } else {
            r1 = rp[m][n][o].map((val,i)=>
              0.25*(val + rp[m][n-1][o][i] + rp[m][n][o-1][i] + rp[m][n-1][o-1][i])
            );
            r2 = rp[m+1][n][o].map((val,i)=>
              0.25*(val + rp[m+1][n-1][o][i] + rp[m+1][n][o-1][i] + rp[m+1][n-1][o-1][i])
            );
          }
        }

        if (o === 0) {
            if (n === Npuntiy - 1) {
              r3 = rp[m][n][o];
              r4 = rp[m + 1][n][o];
            } else {
              r3 = rp[m][n][o].map((val, i) => 0.5 * (val + rp[m][n + 1][o][i]));
              r4 = rp[m + 1][n][o].map(
                (val, i) => 0.5 * (val + rp[m + 1][n + 1][o][i])
              );
            }
          } else {
            if (n === Npuntiy - 1) {
              r3 = rp[m][n][o].map((val, i) => 0.5 * (val + rp[m][n][o - 1][i]));
              r4 = rp[m + 1][n][o].map(
                (val, i) => 0.5 * (val + rp[m + 1][n][o - 1][i])
              );
            } else {
              r3 = rp[m][n][o].map(
                (val, i) =>
                  0.25 *
                  (val + rp[m][n + 1][o][i] + rp[m][n][o - 1][i] + rp[m][n + 1][o - 1][i])
              );
              r4 = rp[m + 1][n][o].map(
                (val, i) =>
                  0.25 *
                  (val +
                    rp[m + 1][n + 1][o][i] +
                    rp[m + 1][n][o - 1][i] +
                    rp[m + 1][n + 1][o - 1][i])
              );
            }
          }
          if (o === Npuntiz - 1) {
            if (n === 0) {
              r5 = rp[m][n][o];
              r6 = rp[m + 1][n][o];
            } else {
              r5 = rp[m][n][o].map((val, i) => 0.5 * (val + rp[m][n - 1][o][i]));
              r6 = rp[m + 1][n][o].map(
                (val, i) => 0.5 * (val + rp[m + 1][n - 1][o][i])
              );
            }
          } else {
            if (n === 0) {
              r5 = rp[m][n][o].map((val, i) => 0.5 * (val + rp[m][n][o + 1][i]));
              r6 = rp[m + 1][n][o].map(
                (val, i) => 0.5 * (val + rp[m + 1][n][o + 1][i])
              );
            } else {
              r5 = rp[m][n][o].map(
                (val, i) =>
                  0.25 *
                  (val + rp[m][n - 1][o][i] + rp[m][n][o + 1][i] + rp[m][n - 1][o + 1][i])
              );
              r6 = rp[m + 1][n][o].map(
                (val, i) =>
                  0.25 *
                  (val +
                    rp[m + 1][n - 1][o][i] +
                    rp[m + 1][n][o + 1][i] +
                    rp[m + 1][n - 1][o + 1][i])
              );
            }
          }
          if (o === Npuntiz - 1) {
            if (n === Npuntiy - 1) {
              r7 = rp[m][n][o];
              r8 = rp[m + 1][n][o];
            } else {
              r7 = rp[m][n][o].map((val, i) => 0.5 * (val + rp[m][n + 1][o][i]));
              r8 = rp[m + 1][n][o].map(
                (val, i) => 0.5 * (val + rp[m + 1][n + 1][o][i])
              );
            }
          } else {
            if (n === Npuntiy - 1) {
              r7 = rp[m][n][o].map((val, i) => 0.5 * (val + rp[m][n][o + 1][i]));
              r8 = rp[m + 1][n][o].map(
                (val, i) => 0.5 * (val + rp[m + 1][n][o + 1][i])
              );
            } else {
              r7 = rp[m][n][o].map(
                (val, i) =>
                  0.25 *
                  (val + rp[m][n + 1][o][i] + rp[m][n][o + 1][i] + rp[m][n + 1][o + 1][i])
              );
              r8 = rp[m + 1][n][o].map(
                (val, i) =>
                  0.25 *
                  (val +
                    rp[m + 1][n + 1][o][i] +
                    rp[m + 1][n][o + 1][i] +
                    rp[m + 1][n + 1][o + 1][i])
              );
            }
          }
        // e così via per r3, r4, r5, r6, r7, r8

        // assegnamento
        celle_ind[p] = [...r1, ...r2, ...r3, ...r4, ...r5, ...r6, ...r7, ...r8];
        l[p]        = Math.abs(mean_length_save(celle_ind[p], 1));
        spessore[p] = Math.abs(mean_length_save(celle_ind[p], 3));
        Sup[p]      = Math.abs(mean_cross_section_Lp(celle_ind[p], 1));
        width[p]    = Math.abs(mean_length_Lp(celle_ind[p], 2));

        dx[p] = norm([r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]]);
        dy[p] = norm([r3[0]-r1[0], r3[1]-r1[1], r3[2]-r1[2]]);
        dz[p] = norm([r5[0]-r1[0], r5[1]-r1[1], r5[2]-r1[2]]);

        // override
        l[p]   = dx[p];
        Sup[p] = dy[p]*dz[p];
        p++;

        // lati
        lati[0][s] = [...rp[m][n][o]];
        lati[1][s] = [...rp[m+1][n][o]];

        const lato_vett = [
          lati[1][s][0] - lati[0][s][0],
          lati[1][s][1] - lati[0][s][1],
          lati[1][s][2] - lati[0][s][2],
        ];
        dir_curr[s] = 1;
        const len = norm(lato_vett);
        vers[s] = lato_vett.map(v => v/len);
        s++;

        // superfici, ps
        // faccia 1,2 (piano xy)
        celle_ind_sup[ps]   = [...r1, ...r2, ...r3, ...r4];
        celle_ind_sup[ps+1] = [...r5, ...r6, ...r7, ...r8];
        dir_curr_sup[ps]   = 1;
        dir_curr_sup[ps+1] = 1;

        rc_sup[ps] = [
          0.25*(r1[0]+r2[0]+r3[0]+r4[0]),
          0.25*(r1[1]+r2[1]+r3[1]+r4[1]),
          0.25*(r1[2]+r2[2]+r3[2]+r4[2]),
        ];
        rc_sup[ps+1] = [
          0.25*(r5[0]+r6[0]+r7[0]+r8[0]),
          0.25*(r5[1]+r6[1]+r7[1]+r8[1]),
          0.25*(r5[2]+r6[2]+r7[2]+r8[2]),
        ];

        indici_celle_ind_supx[psx]   = ps;
        indici_celle_ind_supx[psx+1] = ps+1;

        Sup_sup[ps]   = Math.abs(surfa_old(celle_ind_sup[ps],   weights_five, roots_five));
        Sup_sup[ps+1] = Math.abs(surfa_old(celle_ind_sup[ps+1], weights_five, roots_five));

        {
          const v21 = [r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]];
          const v31 = [r3[0]-r1[0], r3[1]-r1[1], r3[2]-r1[2]];
          const tmp = cross(v21,v31).map(val=>-val);
          const den = norm(v21)*norm(v31);
          normale_sup[ps] = tmp.map(val=>val/den);
        }
        {
          const v65 = [r6[0]-r5[0], r6[1]-r5[1], r6[2]-r5[2]];
          const v75 = [r7[0]-r5[0], r7[1]-r5[1], r7[2]-r5[2]];
          const tmp = cross(v65,v75);
          const den = norm(v65)*norm(v75);
          normale_sup[ps+1] = tmp.map(val=>val/den);
        }

        w_sup[ps]   = norm([r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]]);
        w_sup[ps+1] = norm([r5[0]-r6[0], r5[1]-r6[1], r5[2]-r6[2]]);

        // superfici xz
        celle_ind_sup[ps+2] = [...r1, ...r2, ...r5, ...r6];
        celle_ind_sup[ps+3] = [...r3, ...r4, ...r7, ...r8];
        dir_curr_sup[ps+2]  = 1;
        dir_curr_sup[ps+3]  = 1;

        rc_sup[ps+2] = [
          0.25*(r1[0]+r2[0]+r5[0]+r6[0]),
          0.25*(r1[1]+r2[1]+r5[1]+r6[1]),
          0.25*(r1[2]+r2[2]+r5[2]+r6[2]),
        ];
        rc_sup[ps+3] = [
          0.25*(r3[0]+r4[0]+r7[0]+r8[0]),
          0.25*(r3[1]+r4[1]+r7[1]+r8[1]),
          0.25*(r3[2]+r4[2]+r7[2]+r8[2]),
        ];

        indici_celle_ind_supx[psx+2] = ps+2;
        indici_celle_ind_supx[psx+3] = ps+3;

        Sup_sup[ps+2] = Math.abs(surfa_old(celle_ind_sup[ps+2], weights_five, roots_five));
        Sup_sup[ps+3] = Math.abs(surfa_old(celle_ind_sup[ps+3], weights_five, roots_five));

        {
          const v21 = [r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]];
          const v51 = [r5[0]-r1[0], r5[1]-r1[1], r5[2]-r1[2]];
          const tmp = cross(v21,v51);
          const den = norm(v21)*norm(v51);
          normale_sup[ps+2] = tmp.map(val=>val/den);
        }
        {
          const v43 = [r4[0]-r3[0], r4[1]-r3[1], r4[2]-r3[2]];
          const v73 = [r7[0]-r3[0], r7[1]-r3[1], r7[2]-r3[2]];
          const tmp = cross(v43,v73).map(val=>-val);
          const den = norm(v43)*norm(v73);
          normale_sup[ps+3] = tmp.map(val=>val/den);
        }

        w_sup[ps+2] = norm([r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]]);
        w_sup[ps+3] = norm([r5[0]-r6[0], r5[1]-r6[1], r5[2]-r6[2]]);

        // superfici yz
        celle_ind_sup[ps+4] = [...r1, ...r3, ...r5, ...r7];
        celle_ind_sup[ps+5] = [...r2, ...r4, ...r6, ...r8];
        dir_curr_sup[ps+4]  = 1;
        dir_curr_sup[ps+5]  = 1;

        rc_sup[ps+4] = [
          0.25*(r1[0]+r3[0]+r5[0]+r7[0]),
          0.25*(r1[1]+r3[1]+r5[1]+r7[1]),
          0.25*(r1[2]+r3[2]+r5[2]+r7[2]),
        ];
        rc_sup[ps+5] = [
          0.25*(r2[0]+r4[0]+r6[0]+r8[0]),
          0.25*(r2[1]+r4[1]+r6[1]+r8[1]),
          0.25*(r2[2]+r4[2]+r6[2]+r8[2]),
        ];

        indici_celle_ind_supx[psx+4] = ps+4;
        indici_celle_ind_supx[psx+5] = ps+5;

        Sup_sup[ps+4] = Math.abs(surfa_old(celle_ind_sup[ps+4], weights_five, roots_five));
        Sup_sup[ps+5] = Math.abs(surfa_old(celle_ind_sup[ps+5], weights_five, roots_five));

        {
          const v31 = [r3[0]-r1[0], r3[1]-r1[1], r3[2]-r1[2]];
          const v51 = [r5[0]-r1[0], r5[1]-r1[1], r5[2]-r1[2]];
          const tmp = cross(v31,v51).map(val=>-val);
          const den = norm(v31)*norm(v51);
          normale_sup[ps+4] = tmp.map(val=>val/den);
        }
        {
          const v42 = [r4[0]-r2[0], r4[1]-r2[1], r4[2]-r2[2]];
          const v62 = [r6[0]-r2[0], r6[1]-r2[1], r6[2]-r2[2]];
          const tmp = cross(v42,v62);
          const den = norm(v42)*norm(v62);
          normale_sup[ps+5] = tmp.map(val=>val/den);
        }

        w_sup[ps+4] = 0;
        w_sup[ps+5] = 0;

        ps  += 6;
        psx += 6;
      }
    }
  }

 // ============= DIREZIONE Y =============
let psy = 0; // indice superfici per direzione Y
for (let o = 0; o < Npuntiz; o++) {
  for (let m = 0; m < Npuntix; m++) {
    for (let n = 0; n < Npuntiy - 1; n++) {

      let r1: number[], r2: number[], r3: number[], r4: number[];
      let r5: number[], r6: number[], r7: number[], r8: number[];

      // Calcolo r1, r3 (come in MATLAB):
      if (o === 0) {
        if (m === 0) {
          // r1=squeeze(rp(m,n,o,:)), r3=squeeze(rp(m,n+1,o,:))
          r1 = rp[m][n][o];
          r3 = rp[m][n+1][o];
        } else {
          // r1=0.5*(rp(m,n,o,:)+rp(m-1,n,o,:)), etc.
          r1 = rp[m][n][o].map((val,i) => 0.5*(val + rp[m-1][n][o][i]));
          r3 = rp[m][n+1][o].map((val,i) => 0.5*(val + rp[m-1][n+1][o][i]));
        }
      } else {
        if (m === 0) {
          r1 = rp[m][n][o].map((val,i) => 0.5*(val + rp[m][n][o-1][i]));
          r3 = rp[m][n+1][o].map((val,i) => 0.5*(val + rp[m][n+1][o-1][i]));
        } else {
          r1 = rp[m][n][o].map((val,i)=>
            0.25*(val + rp[m-1][n][o][i] + rp[m][n][o-1][i] + rp[m-1][n][o-1][i])
          );
          r3 = rp[m][n+1][o].map((val,i)=>
            0.25*(val + rp[m-1][n+1][o][i] + rp[m][n+1][o-1][i] + rp[m-1][n+1][o-1][i])
          );
        }
      }

      // Calcolo r2, r4:
      if (o === 0) {
        if (m === Npuntix - 1) {
          r2 = rp[m][n][o];
          r4 = rp[m][n+1][o];
        } else {
          r2 = rp[m][n][o].map((val,i) => 0.5*(val + rp[m+1][n][o][i]));
          r4 = rp[m][n+1][o].map((val,i) => 0.5*(val + rp[m+1][n+1][o][i]));
        }
      } else {
        if (m === Npuntix - 1) {
          r2 = rp[m][n][o].map((val,i) => 0.5*(val + rp[m][n][o-1][i]));
          r4 = rp[m][n+1][o].map((val,i) => 0.5*(val + rp[m][n+1][o-1][i]));
        } else {
          r2 = rp[m][n][o].map((val,i)=>
            0.25*(val + rp[m+1][n][o][i] + rp[m][n][o-1][i] + rp[m+1][n][o-1][i])
          );
          r4 = rp[m][n+1][o].map((val,i)=>
            0.25*(val + rp[m+1][n+1][o][i] + rp[m][n+1][o-1][i] + rp[m+1][n+1][o-1][i])
          );
        }
      }

      // Calcolo r5, r7:
      if (o === Npuntiz - 1) {
        if (m === 0) {
          r5 = rp[m][n][o];
          r7 = rp[m][n+1][o];
        } else {
          r5 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m-1][n][o][i]));
          r7 = rp[m][n+1][o].map((val,i)=>0.5*(val + rp[m-1][n+1][o][i]));
        }
      } else {
        if (m === 0) {
          r5 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n][o+1][i]));
          r7 = rp[m][n+1][o].map((val,i)=>0.5*(val + rp[m][n+1][o+1][i]));
        } else {
          r5 = rp[m][n][o].map((val,i)=>
            0.25*(val + rp[m-1][n][o][i] + rp[m][n][o+1][i] + rp[m-1][n][o+1][i])
          );
          r7 = rp[m][n+1][o].map((val,i)=>
            0.25*(val + rp[m-1][n+1][o][i] + rp[m][n+1][o+1][i] + rp[m-1][n+1][o+1][i])
          );
        }
      }

      // Calcolo r6, r8:
      if (o === Npuntiz - 1) {
        if (m === Npuntix - 1) {
          r6 = rp[m][n][o];
          r8 = rp[m][n+1][o];
        } else {
          r6 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m+1][n][o][i]));
          r8 = rp[m][n+1][o].map((val,i)=>0.5*(val + rp[m+1][n+1][o][i]));
        }
      } else {
        if (m === Npuntix - 1) {
          r6 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n][o+1][i]));
          r8 = rp[m][n+1][o].map((val,i)=>0.5*(val + rp[m][n+1][o+1][i]));
        } else {
          r6 = rp[m][n][o].map((val,i)=>
            0.25*(val + rp[m+1][n][o][i] + rp[m][n][o+1][i] + rp[m+1][n][o+1][i])
          );
          r8 = rp[m][n+1][o].map((val,i)=>
            0.25*(val + rp[m+1][n+1][o][i] + rp[m][n+1][o+1][i] + rp[m+1][n+1][o+1][i])
          );
        }
      }

      // Assegnamento a celle_ind, calcoli l, spessore...
      celle_ind[p] = [...r1, ...r2, ...r3, ...r4, ...r5, ...r6, ...r7, ...r8];

      // mean_length_save(...) su direzione 2
      l[p]         = Math.abs(mean_length_save(celle_ind[p], 2));
      spessore[p]  = Math.abs(mean_length_save(celle_ind[p], 3));
      Sup[p]       = Math.abs(mean_cross_section_Lp(celle_ind[p], 2));
      width[p]     = Math.abs(mean_length_Lp(celle_ind[p], 1));

      // dx, dy, dz
      const dx_val = norm([r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]]);
      const dy_val = norm([r3[0]-r1[0], r3[1]-r1[1], r3[2]-r1[2]]);
      const dz_val = norm([r5[0]-r1[0], r5[1]-r1[1], r5[2]-r1[2]]);
      dx[p] = dx_val;
      dy[p] = dy_val;
      dz[p] = dz_val;

      // override come in MATLAB: l = dy, Sup= dx*dz
      l[p]   = dy_val;
      Sup[p] = dx_val * dz_val;

      p++;

      // Lati(1,s,:), Lati(2,s,:)
      lati[0][s] = [...rp[m][n][o]];
      lati[1][s] = [...rp[m][n+1][o]];

      const lato_vett = [
        lati[1][s][0] - lati[0][s][0],
        lati[1][s][1] - lati[0][s][1],
        lati[1][s][2] - lati[0][s][2],
      ];
      dir_curr[s] = 2;  // direzione Y
      const len = norm(lato_vett);
      vers[s] = lato_vett.map(val => val/len);
      s++;

      // 6 superfici per cella
      // 1) piano xy
      celle_ind_sup[ps]   = [...r1, ...r2, ...r3, ...r4];
      celle_ind_sup[ps+1] = [...r5, ...r6, ...r7, ...r8];
      dir_curr_sup[ps]   = 2;
      dir_curr_sup[ps+1] = 2;

      rc_sup[ps] = [
        0.25*(r1[0]+r2[0]+r3[0]+r4[0]),
        0.25*(r1[1]+r2[1]+r3[1]+r4[1]),
        0.25*(r1[2]+r2[2]+r3[2]+r4[2]),
      ];
      rc_sup[ps+1] = [
        0.25*(r5[0]+r6[0]+r7[0]+r8[0]),
        0.25*(r5[1]+r6[1]+r7[1]+r8[1]),
        0.25*(r5[2]+r6[2]+r7[2]+r8[2]),
      ];

      indici_celle_ind_supy[psy]   = ps;
      indici_celle_ind_supy[psy+1] = ps+1;

      Sup_sup[ps]   = Math.abs(surfa_old(celle_ind_sup[ps],   weights_five, roots_five));
      Sup_sup[ps+1] = Math.abs(surfa_old(celle_ind_sup[ps+1], weights_five, roots_five));

      {
        const v21 = [r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]];
        const v31 = [r3[0]-r1[0], r3[1]-r1[1], r3[2]-r1[2]];
        const tmp = cross(v21,v31).map(val=>-val);
        const den = norm(v21)*norm(v31);
        normale_sup[ps] = tmp.map(val=>val/den);
      }
      {
        const v65 = [r6[0]-r5[0], r6[1]-r5[1], r6[2]-r5[2]];
        const v75 = [r7[0]-r5[0], r7[1]-r5[1], r7[2]-r5[2]];
        const tmp = cross(v65,v75);
        const den = norm(v65)*norm(v75);
        normale_sup[ps+1] = tmp.map(val=>val/den);
      }
      w_sup[ps]   = norm([r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]]);
      w_sup[ps+1] = norm([r6[0]-r5[0], r6[1]-r5[1], r6[2]-r5[2]]);

      // 2) piano xz
      celle_ind_sup[ps+2] = [...r1, ...r2, ...r5, ...r6];
      celle_ind_sup[ps+3] = [...r3, ...r4, ...r7, ...r8];
      dir_curr_sup[ps+2]  = 2;
      dir_curr_sup[ps+3]  = 2;

      rc_sup[ps+2] = [
        0.25*(r1[0]+r2[0]+r5[0]+r6[0]),
        0.25*(r1[1]+r2[1]+r5[1]+r6[1]),
        0.25*(r1[2]+r2[2]+r5[2]+r6[2]),
      ];
      rc_sup[ps+3] = [
        0.25*(r3[0]+r4[0]+r7[0]+r8[0]),
        0.25*(r3[1]+r4[1]+r7[1]+r8[1]),
        0.25*(r3[2]+r4[2]+r7[2]+r8[2]),
      ];

      indici_celle_ind_supy[psy+2] = ps+2;
      indici_celle_ind_supy[psy+3] = ps+3;

      Sup_sup[ps+2] = Math.abs(surfa_old(celle_ind_sup[ps+2], weights_five, roots_five));
      Sup_sup[ps+3] = Math.abs(surfa_old(celle_ind_sup[ps+3], weights_five, roots_five));

      {
        const v21 = [r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]];
        const v51 = [r5[0]-r1[0], r5[1]-r1[1], r5[2]-r1[2]];
        const tmp = cross(v21,v51);
        const den = norm(v21)*norm(v51);
        normale_sup[ps+2] = tmp.map(val=>val/den);
      }
      {
        const v43 = [r4[0]-r3[0], r4[1]-r3[1], r4[2]-r3[2]];
        const v73 = [r7[0]-r3[0], r7[1]-r3[1], r7[2]-r3[2]];
        const tmp = cross(v43,v73).map(val=>-val);
        const den = norm(v43)*norm(v73);
        normale_sup[ps+3] = tmp.map(val=>val/den);
      }
      w_sup[ps+2] = 0; // come nel tuo codice
      w_sup[ps+3] = 0;

      // 3) piano yz
      celle_ind_sup[ps+4] = [...r1, ...r3, ...r5, ...r7];
      celle_ind_sup[ps+5] = [...r2, ...r4, ...r6, ...r8];
      dir_curr_sup[ps+4]  = 2;
      dir_curr_sup[ps+5]  = 2;

      rc_sup[ps+4] = [
        0.25*(r1[0]+r3[0]+r5[0]+r7[0]),
        0.25*(r1[1]+r3[1]+r5[1]+r7[1]),
        0.25*(r1[2]+r3[2]+r5[2]+r7[2]),
      ];
      rc_sup[ps+5] = [
        0.25*(r2[0]+r4[0]+r6[0]+r8[0]),
        0.25*(r2[1]+r4[1]+r6[1]+r8[1]),
        0.25*(r2[2]+r4[2]+r6[2]+r8[2]),
      ];

      indici_celle_ind_supy[psy+4] = ps+4;
      indici_celle_ind_supy[psy+5] = ps+5;

      Sup_sup[ps+4] = Math.abs(surfa_old(celle_ind_sup[ps+4], weights_five, roots_five));
      Sup_sup[ps+5] = Math.abs(surfa_old(celle_ind_sup[ps+5], weights_five, roots_five));

      {
        const v31 = [r3[0]-r1[0], r3[1]-r1[1], r3[2]-r1[2]];
        const v51 = [r5[0]-r1[0], r5[1]-r1[1], r5[2]-r1[2]];
        const tmp = cross(v31,v51).map(val=>-val);
        const den = norm(v31)*norm(v51);
        normale_sup[ps+4] = tmp.map(val=>val/den);
      }
      {
        const v42 = [r4[0]-r2[0], r4[1]-r2[1], r4[2]-r2[2]];
        const v62 = [r6[0]-r2[0], r6[1]-r2[1], r6[2]-r2[2]];
        const tmp = cross(v42,v62);
        const den = norm(v42)*norm(v62);
        normale_sup[ps+5] = tmp.map(val=>val/den);
      }
      w_sup[ps+4] = norm([r3[0]-r1[0], r3[1]-r1[1], r3[2]-r1[2]]);
      w_sup[ps+5] = norm([r2[0]-r4[0], r2[1]-r4[1], r2[2]-r4[2]]);

      ps  += 6;
      psy += 6;

    } // fine for n
  } // fine for m
} // fine for o


  // ============= DIREZIONE Z =============
let psz = 0; // indice superfici per direzione Z
for (let n = 0; n < Npuntiy; n++) {
  for (let m = 0; m < Npuntix; m++) {
    for (let o = 0; o < Npuntiz - 1; o++) {

      let r1: number[], r2: number[], r3: number[], r4: number[];
      let r5: number[], r6: number[], r7: number[], r8: number[];

      // Calcolo r1, r5
      if (n === 0) {
        if (m === 0) {
          // r1 = rp[m][n][o], r5 = rp[m][n][o+1]
          r1 = rp[m][n][o];
          r5 = rp[m][n][o+1];
        } else {
          r1 = rp[m][n][o].map((val,i) => 0.5*(val + rp[m-1][n][o][i]));
          r5 = rp[m][n][o+1].map((val,i) => 0.5*(val + rp[m-1][n][o+1][i]));
        }
      } else {
        if (m === 0) {
          r1 = rp[m][n][o].map((val,i) => 0.5*(val + rp[m][n-1][o][i]));
          r5 = rp[m][n][o+1].map((val,i) => 0.5*(val + rp[m][n-1][o+1][i]));
        } else {
          r1 = rp[m][n][o].map((val,i)=>
            0.25*(val + rp[m-1][n][o][i] + rp[m][n-1][o][i] + rp[m-1][n-1][o][i])
          );
          r5 = rp[m][n][o+1].map((val,i)=>
            0.25*(val + rp[m-1][n][o+1][i] + rp[m][n-1][o+1][i] + rp[m-1][n-1][o+1][i])
          );
        }
      }

      // Calcolo r2, r6
      if (n === 0) {
        if (m === Npuntix - 1) {
          r2 = rp[m][n][o];
          r6 = rp[m][n][o+1];
        } else {
          r2 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m+1][n][o][i]));
          r6 = rp[m][n][o+1].map((val,i)=>0.5*(val + rp[m+1][n][o+1][i]));
        }
      } else {
        if (m === Npuntix - 1) {
          r2 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n-1][o][i]));
          r6 = rp[m][n][o+1].map((val,i)=>0.5*(val + rp[m][n-1][o+1][i]));
        } else {
          r2 = rp[m][n][o].map((val,i)=>
            0.25*(val + rp[m+1][n][o][i] + rp[m][n-1][o][i] + rp[m+1][n-1][o][i])
          );
          r6 = rp[m][n][o+1].map((val,i)=>
            0.25*(val + rp[m+1][n][o+1][i] + rp[m][n-1][o+1][i] + rp[m+1][n-1][o+1][i])
          );
        }
      }

      // Calcolo r3, r7
      if (n === Npuntiy - 1) {
        if (m === 0) {
          r3 = rp[m][n][o];
          r7 = rp[m][n][o+1];
        } else {
          r3 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m-1][n][o][i]));
          r7 = rp[m][n][o+1].map((val,i)=>0.5*(val + rp[m-1][n][o+1][i]));
        }
      } else {
        if (m === 0) {
          r3 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n+1][o][i]));
          r7 = rp[m][n][o+1].map((val,i)=>0.5*(val + rp[m][n+1][o+1][i]));
        } else {
          r3 = rp[m][n][o].map((val,i)=>
            0.25*(val + rp[m-1][n][o][i] + rp[m][n+1][o][i] + rp[m-1][n+1][o][i])
          );
          r7 = rp[m][n][o+1].map((val,i)=>
            0.25*(val + rp[m-1][n][o+1][i] + rp[m][n+1][o+1][i] + rp[m-1][n+1][o+1][i])
          );
        }
      }

      // Calcolo r4, r8
      if (n === Npuntiy - 1) {
        if (m === Npuntix - 1) {
          r4 = rp[m][n][o];
          r8 = rp[m][n][o+1];
        } else {
          r4 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m+1][n][o][i]));
          r8 = rp[m][n][o+1].map((val,i)=>0.5*(val + rp[m+1][n][o+1][i]));
        }
      } else {
        if (m === Npuntix - 1) {
          r4 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n+1][o][i]));
          r8 = rp[m][n][o+1].map((val,i)=>0.5*(val + rp[m][n+1][o+1][i]));
        } else {
          r4 = rp[m][n][o].map((val,i)=>
            0.25*(val + rp[m+1][n][o][i] + rp[m][n+1][o][i] + rp[m+1][n+1][o][i])
          );
          r8 = rp[m][n][o+1].map((val,i)=>
            0.25*(val + rp[m+1][n][o+1][i] + rp[m][n+1][o+1][i] + rp[m+1][n+1][o+1][i])
          );
        }
      }

      // Assegnamento a celle_ind
      celle_ind[p] = [...r1, ...r2, ...r3, ...r4, ...r5, ...r6, ...r7, ...r8];

      // Direzione Z => l = mean_length_save(..., 3)
      l[p]         = Math.abs(mean_length_save(celle_ind[p], 3));
      spessore[p]  = Math.abs(mean_length_save(celle_ind[p], 1));
      Sup[p]       = Math.abs(mean_cross_section_Lp(celle_ind[p], 3));
      width[p]     = Math.abs(mean_length_Lp(celle_ind[p], 2));

      // dx, dy, dz
      const dx_val = norm([r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]]);
      const dy_val = norm([r3[0]-r1[0], r3[1]-r1[1], r3[2]-r1[2]]);
      const dz_val = norm([r5[0]-r1[0], r5[1]-r1[1], r5[2]-r1[2]]);
      dx[p] = dx_val;
      dy[p] = dy_val;
      dz[p] = dz_val;

      // override come in MATLAB => l = dz, Sup= dx*dy
      l[p]   = dz_val;
      Sup[p] = dx_val * dy_val;

      p++;

      // Lati(1,s) = rp[m][n][o], Lati(2,s) = rp[m][n][o+1]
      lati[0][s] = [...rp[m][n][o]];
      lati[1][s] = [...rp[m][n][o+1]];

      const lato_vett = [
        lati[1][s][0] - lati[0][s][0],
        lati[1][s][1] - lati[0][s][1],
        lati[1][s][2] - lati[0][s][2]
      ];
      dir_curr[s] = 3;  // direzione Z
      const len = norm(lato_vett);
      vers[s] = lato_vett.map(val => val/len);

      s++;

      // 6 superfici
      // 1) piano xy
      celle_ind_sup[ps]   = [...r1, ...r2, ...r3, ...r4];
      celle_ind_sup[ps+1] = [...r5, ...r6, ...r7, ...r8];
      dir_curr_sup[ps]   = 3;
      dir_curr_sup[ps+1] = 3;

      rc_sup[ps] = [
        0.25*(r1[0]+r2[0]+r3[0]+r4[0]),
        0.25*(r1[1]+r2[1]+r3[1]+r4[1]),
        0.25*(r1[2]+r2[2]+r3[2]+r4[2]),
      ];
      rc_sup[ps+1] = [
        0.25*(r5[0]+r6[0]+r7[0]+r8[0]),
        0.25*(r5[1]+r6[1]+r7[1]+r8[1]),
        0.25*(r5[2]+r6[2]+r7[2]+r8[2]),
      ];

      indici_celle_ind_supz[psz]   = ps;
      indici_celle_ind_supz[psz+1] = ps+1;

      Sup_sup[ps]   = Math.abs(surfa_old(celle_ind_sup[ps],   weights_five, roots_five));
      Sup_sup[ps+1] = Math.abs(surfa_old(celle_ind_sup[ps+1], weights_five, roots_five));

      {
        const v21 = [r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]];
        const v31 = [r3[0]-r1[0], r3[1]-r1[1], r3[2]-r1[2]];
        const tmp = cross(v21,v31).map(val=>-val);
        const den = norm(v21)*norm(v31);
        normale_sup[ps] = tmp.map(val=>val/den);
      }
      {
        const v65 = [r6[0]-r5[0], r6[1]-r5[1], r6[2]-r5[2]];
        const v75 = [r7[0]-r5[0], r7[1]-r5[1], r7[2]-r5[2]];
        const tmp = cross(v65,v75);
        const den = norm(v65)*norm(v75);
        normale_sup[ps+1] = tmp.map(val=>val/den);
      }
      w_sup[ps]   = 0;  // come in MATLAB
      w_sup[ps+1] = 0;

      // 2) piano xz
      celle_ind_sup[ps+2] = [...r1, ...r2, ...r5, ...r6];
      celle_ind_sup[ps+3] = [...r3, ...r4, ...r7, ...r8];
      dir_curr_sup[ps+2]  = 3;
      dir_curr_sup[ps+3]  = 3;

      rc_sup[ps+2] = [
        0.25*(r1[0]+r2[0]+r5[0]+r6[0]),
        0.25*(r1[1]+r2[1]+r5[1]+r6[1]),
        0.25*(r1[2]+r2[2]+r5[2]+r6[2]),
      ];
      rc_sup[ps+3] = [
        0.25*(r3[0]+r4[0]+r7[0]+r8[0]),
        0.25*(r3[1]+r4[1]+r7[1]+r8[1]),
        0.25*(r3[2]+r4[2]+r7[2]+r8[2]),
      ];

      indici_celle_ind_supz[psz+2] = ps+2;
      indici_celle_ind_supz[psz+3] = ps+3;

      Sup_sup[ps+2] = Math.abs(surfa_old(celle_ind_sup[ps+2], weights_five, roots_five));
      Sup_sup[ps+3] = Math.abs(surfa_old(celle_ind_sup[ps+3], weights_five, roots_five));

      {
        const v21 = [r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]];
        const v51 = [r5[0]-r1[0], r5[1]-r1[1], r5[2]-r1[2]];
        const tmp = cross(v21,v51);
        const den = norm(v21)*norm(v51);
        normale_sup[ps+2] = tmp.map(val=>val/den);
      }
      {
        const v43 = [r4[0]-r3[0], r4[1]-r3[1], r4[2]-r3[2]];
        const v73 = [r7[0]-r3[0], r7[1]-r3[1], r7[2]-r3[2]];
        const tmp = cross(v43,v73).map(val=>-val);
        const den = norm(v43)*norm(v73);
        normale_sup[ps+3] = tmp.map(val=>val/den);
      }
      w_sup[ps+2] = norm([r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]]);
      w_sup[ps+3] = norm([r4[0]-r3[0], r4[1]-r3[1], r4[2]-r3[2]]);

      // 3) piano yz
      celle_ind_sup[ps+4] = [...r1, ...r3, ...r5, ...r7];
      celle_ind_sup[ps+5] = [...r2, ...r4, ...r6, ...r8];
      dir_curr_sup[ps+4]  = 3;
      dir_curr_sup[ps+5]  = 3;

      rc_sup[ps+4] = [
        0.25*(r1[0]+r3[0]+r5[0]+r7[0]),
        0.25*(r1[1]+r3[1]+r5[1]+r7[1]),
        0.25*(r1[2]+r3[2]+r5[2]+r7[2]),
      ];
      rc_sup[ps+5] = [
        0.25*(r2[0]+r4[0]+r6[0]+r8[0]),
        0.25*(r2[1]+r4[1]+r6[1]+r8[1]),
        0.25*(r2[2]+r4[2]+r6[2]+r8[2]),
      ];

      indici_celle_ind_supz[psz+4] = ps+4;
      indici_celle_ind_supz[psz+5] = ps+5;

      Sup_sup[ps+4] = Math.abs(surfa_old(celle_ind_sup[ps+4], weights_five, roots_five));
      Sup_sup[ps+5] = Math.abs(surfa_old(celle_ind_sup[ps+5], weights_five, roots_five));

      {
        const v31 = [r3[0]-r1[0], r3[1]-r1[1], r3[2]-r1[2]];
        const v51 = [r5[0]-r1[0], r5[1]-r1[1], r5[2]-r1[2]];
        const tmp = cross(v31,v51).map(val=>-val);
        const den = norm(v31)*norm(v51);
        normale_sup[ps+4] = tmp.map(val=>val/den);
      }
      {
        const v42 = [r4[0]-r2[0], r4[1]-r2[1], r4[2]-r2[2]];
        const v62 = [r6[0]-r2[0], r6[1]-r2[1], r6[2]-r2[2]];
        const tmp = cross(v42,v62);
        const den = norm(v42)*norm(v62);
        normale_sup[ps+5] = tmp.map(val=>val/den);
      }
      w_sup[ps+4] = norm([r3[0]-r1[0], r3[1]-r1[1], r3[2]-r1[2]]);
      w_sup[ps+5] = norm([r2[0]-r4[0], r2[1]-r4[1], r2[2]-r4[2]]);

      ps += 6;
      psz += 6;

    } // fine for o
  } // fine for m
} // fine for n


  // 4) In MATLAB: barra = celle_ind
  const barra = celle_ind;

  // 5) Ritorno
  return {
    celle_ind,
    lati,
    vers,
    l,
    spessore,
    Sup,
    width,
    dir_curr,
    celle_ind_sup,
    indici_celle_ind_supx,
    indici_celle_ind_supy,
    indici_celle_ind_supz,
    rc_sup,
    Sup_sup,
    normale_sup,
    dir_curr_sup,
    w_sup,
    barra
  };
}
