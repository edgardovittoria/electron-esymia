import { surfa_old } from './surfa_old';
import { mean_length_P } from './mean_length_P';
import { norm } from './norm';
import { cross } from './cross';

/**

 * @param rp        Quattro dimensioni: [Npuntix][Npuntiy][Npuntiz][3].
 * @param Npuntix
 * @param Npuntiy
 * @param Npuntiz
 * @param weights_five
 * @param roots_five
 * @returns Un oggetto contenente celle_mag, lati_m, Sup_m, l_m, width_m, vers_m, norm_m.
 */
export function genera_celle_induttive_sup_maglie_save(
  rp: number[][][][], 
  Npuntix: number,
  Npuntiy: number,
  Npuntiz: number,
  weights_five: number[],
  roots_five: number[]
): {
  celle_mag: number[][];   
  lati_m: number[][][];    
  Sup_m: number[];         
  l_m: number[];           
  width_m: number[];       
  vers_m: number[][];      
  norm_m: number[][];      
}
{
  let s = 0;  // indice che scorre le celle superficiali

  // In MATLAB: sizeA = ((Npuntiy)*(Npuntix-1)*2 + (Npuntiy-1)*(Npuntix)*2 + ...
  //                     (Npuntiz)*(Npuntix-1)*2 + (Npuntiz-1)*(Npuntix)*2 + ...
  //                     (Npuntiz)*(Npuntiy-1)*2 + (Npuntiz-1)*(Npuntiy)*2);
  const sizeA =
    Npuntiy * (Npuntix - 1) * 2 +
    (Npuntiy - 1) * Npuntix * 2 +
    Npuntiz * (Npuntix - 1) * 2 +
    (Npuntiz - 1) * Npuntix * 2 +
    Npuntiz * (Npuntiy - 1) * 2 +
    (Npuntiz - 1) * Npuntiy * 2;

  // Allochiamo gli array in modo analogo al MATLAB.
  // celle_mag: array di sizeA righe x 12 colonne
  const celle_mag: number[][] = Array.from({ length: sizeA }, () => Array(12).fill(0));
  // lati_m: dimensione [2, sizeA, 3]
  const lati_m: number[][][] = [
    Array.from({ length: sizeA }, () => Array(3).fill(0)),
    Array.from({ length: sizeA }, () => Array(3).fill(0))
  ];

  // Sup_m, l_m, width_m => array 1D di length = sizeA
  const Sup_m: number[]   = Array(sizeA).fill(0);
  const l_m: number[]     = Array(sizeA).fill(0);
  const width_m: number[] = Array(sizeA).fill(0);

  // vers_m, norm_m => array 2D di dimensioni [sizeA x 3]
  const vers_m: number[][] = Array.from({ length: sizeA }, () => Array(3).fill(0));
  const norm_m: number[][] = Array.from({ length: sizeA }, () => Array(3).fill(0));

  // lato_vett_m e lato_vett_m_p => in MATLAB servivano come d’appoggio, 
  // qui replichiamo la struttura.
  const lato_vett_m: number[][] = Array.from({ length: sizeA }, () => Array(3).fill(0));
  let lato_vett_m_p: number[]   = [0, 0, 0];

  //----------------------------------------------------------------------
  //                CELLE X SUI PIANI XY
  //----------------------------------------------------------------------
  // In MATLAB: for n = 1:Npuntiy, for m = 1:Npuntix-1, ...
  for (let n = 0; n < Npuntiy; n++) {                // (n=1..Npuntiy) => 0..Npuntiy-1
    for (let m = 0; m < Npuntix - 1; m++) {          // (m=1..Npuntix-1) => 0..Npuntix-1
      // Faccia I (xy, z=zmin) => o=1 => in TS => o=0
      let o = 0;
      let r1: number[], r2: number[], r3: number[], r4: number[];

      // if(n==1) => if (n==0)
      if (n === 0) {
        r1 = rp[m][n][o];
        r2 = rp[m+1][n][o];
        lato_vett_m_p = [r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]];
      } else {
        r1 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n-1][o][i]));
        r2 = rp[m+1][n][o].map((val,i)=>0.5*( val + rp[m+1][n-1][o][i]));
      }

      // if(n==Npuntiy) => if(n==Npuntiy-1)
      if (n === Npuntiy - 1) {
        r3 = rp[m][n][o];
        r4 = rp[m+1][n][o];
        lato_vett_m_p = [r4[0]-r3[0], r4[1]-r3[1], r4[2]-r3[2]];
      } else {
        r3 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n+1][o][i]));
        r4 = rp[m+1][n][o].map((val,i)=>0.5*( val + rp[m+1][n+1][o][i]));
      }

      const celle_mag_p = [...r1, ...r2, ...r3, ...r4];
      const Sup_m_p = surfa_old(celle_mag_p, weights_five, roots_five);
      // direzione 1 => x
      const l_m_p = Math.abs(mean_length_P(celle_mag_p, 1));
      const width_m_p = Math.abs(mean_length_P(celle_mag_p, 2));
      // vers_m_p = lato_vett_m_p ./ norm(...)
      const vlen = norm(lato_vett_m_p);
      const vers_m_p = (vlen !== 0)
         ? lato_vett_m_p.map( val => val / vlen )
         : [0,0,0];
      // norm_m_p = [0 0 -1]
      const norm_m_p = [0, 0, -1];

      // Salvataggio
      celle_mag[s] = celle_mag_p;
      Sup_m[s]     = Sup_m_p;
      l_m[s]       = l_m_p;
      width_m[s]   = width_m_p;
      vers_m[s]    = vers_m_p;
      norm_m[s]    = norm_m_p;

      lato_vett_m[s] = [...lato_vett_m_p];  
      // In MATLAB: lati_m(1,s,:) e lati_m(2,s,:)
      lati_m[0][s] = [...rp[m][n][o]];
      lati_m[1][s] = [...rp[m+1][n][o]];

      s++;
    }
  }

  // Ora la Faccia II (xy, z=zmax) 
  
  for (let n = 0; n < Npuntiy; n++) {
    for (let m = 0; m < Npuntix - 1; m++) {
      let o = Npuntiz - 1;
      let r1: number[], r2: number[], r3: number[], r4: number[];

      if (n === 0) {
        r1 = rp[m][n][o];
        r2 = rp[m+1][n][o];
        lato_vett_m_p = [r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]];
      } else {
        r1 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n-1][o][i]));
        r2 = rp[m+1][n][o].map((val,i)=>0.5*( val + rp[m+1][n-1][o][i]));
      }

      if (n === Npuntiy - 1) {
        r3 = rp[m][n][o];
        r4 = rp[m+1][n][o];
        lato_vett_m_p = [r4[0]-r3[0], r4[1]-r3[1], r4[2]-r3[2]];
      } else {
        r3 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n+1][o][i]));
        r4 = rp[m+1][n][o].map((val,i)=>0.5*( val + rp[m+1][n+1][o][i]));
      }

      const celle_mag_p = [...r1, ...r2, ...r3, ...r4];
      const Sup_m_p = surfa_old(celle_mag_p, weights_five, roots_five);
      const l_m_p = Math.abs(mean_length_P(celle_mag_p, 1));
      const width_m_p = Math.abs(mean_length_P(celle_mag_p, 2));
      const vlen = norm(lato_vett_m_p);
      const vers_m_p = (vlen !== 0)
         ? lato_vett_m_p.map(val => val / vlen)
         : [0,0,0];
      const norm_m_p = [0, 0, 1];

      celle_mag[s] = celle_mag_p;
      Sup_m[s]     = Sup_m_p;
      l_m[s]       = l_m_p;
      width_m[s]   = width_m_p;
      vers_m[s]    = vers_m_p;
      norm_m[s]    = norm_m_p;

      lato_vett_m[s] = [...lato_vett_m_p];
      lati_m[0][s] = [...rp[m][n][o]];
      lati_m[1][s] = [...rp[m+1][n][o]];

      s++;
    }
  }

  //----------------------------------------------------------------------
  //                CELLE Y SUI PIANI XY
  //----------------------------------------------------------------------
  // In MATLAB: for n=1..Npuntiy-1, for m=1..Npuntix, ...
  // Faccia III (xy, z=zmin) e Faccia IV (xy, z=zmax)
  for (let n = 0; n < Npuntiy - 1; n++) {
    for (let m = 0; m < Npuntix; m++) {
      // Faccia III => o=1 => TS => o=0
      let o = 0;
      let r1: number[], r2: number[], r3: number[], r4: number[];

      if (m === 0) {
        r1 = rp[m][n][o];
        r3 = rp[m][n+1][o];
        lato_vett_m_p = [r3[0]-r1[0], r3[1]-r1[1], r3[2]-r1[2]];
      } else {
        r1 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m-1][n][o][i]));
        r3 = rp[m][n+1][o].map((val,i)=>0.5*( val + rp[m-1][n+1][o][i]));
      }

      if (m === Npuntix - 1) {
        r2 = rp[m][n][o];
        r4 = rp[m][n+1][o];
        lato_vett_m_p = [r4[0]-r2[0], r4[1]-r2[1], r4[2]-r2[2]];
      } else {
        r2 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m+1][n][o][i]));
        r4 = rp[m][n+1][o].map((val,i)=>0.5*( val + rp[m+1][n+1][o][i]));
      }

      const celle_mag_p = [...r1, ...r2, ...r3, ...r4];
      const Sup_m_p = surfa_old(celle_mag_p, weights_five, roots_five);
      // direzione 2 => y
      const l_m_p     = Math.abs(mean_length_P(celle_mag_p, 2));
      const width_m_p = Math.abs(mean_length_P(celle_mag_p, 1));
      const vlen = norm(lato_vett_m_p);
      const vers_m_p = (vlen!==0) ? lato_vett_m_p.map(val=> val/vlen) : [0,0,0];
      const norm_m_p = [0, 0, -1];

      celle_mag[s] = celle_mag_p;
      Sup_m[s]     = Sup_m_p;
      l_m[s]       = l_m_p;
      width_m[s]   = width_m_p;
      vers_m[s]    = vers_m_p;
      norm_m[s]    = norm_m_p;
      lato_vett_m[s] = [...lato_vett_m_p];

      lati_m[0][s] = [...rp[m][n][o]];
      lati_m[1][s] = [...rp[m][n+1][o]];
      s++;

      // Faccia IV 
      o = Npuntiz - 1;
      if (m === 0) {
        r1 = rp[m][n][o];
        r3 = rp[m][n+1][o];
      } else {
        r1 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m-1][n][o][i]));
        r3 = rp[m][n+1][o].map((val,i)=>0.5*( val + rp[m-1][n+1][o][i]));
      }
      if (m === Npuntix - 1) {
        r2 = rp[m][n][o];
        r4 = rp[m][n+1][o];
        lato_vett_m_p = [r4[0]-r2[0], r4[1]-r2[1], r4[2]-r2[2]];
      } else {
        r2 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m+1][n][o][i]));
        r4 = rp[m][n+1][o].map((val,i)=>0.5*( val + rp[m+1][n+1][o][i]));
      }
      // celle
      const celle_mag_p2 = [...r1, ...r2, ...r3, ...r4];
      const Sup_m_p2 = surfa_old(celle_mag_p2, weights_five, roots_five);
      const l_m_p2     = Math.abs(mean_length_P(celle_mag_p2, 2));
      const width_m_p2 = Math.abs(mean_length_P(celle_mag_p2, 1));
      const vlen2 = norm(lato_vett_m_p);
      const vers_m_p2 = (vlen2!==0) ? lato_vett_m_p.map(val => val/vlen2) : [0,0,0];
      const norm_m_p2 = [0, 0, 1]; // In MATLAB c’era un commento: cross(r2-r1, r3-r1)...

      celle_mag[s] = celle_mag_p2;
      Sup_m[s]     = Sup_m_p2;
      l_m[s]       = l_m_p2;
      width_m[s]   = width_m_p2;
      vers_m[s]    = vers_m_p2;
      norm_m[s]    = norm_m_p2;
      lato_vett_m[s] = [...lato_vett_m_p];

      lati_m[0][s] = [...rp[m][n][o]];
      lati_m[1][s] = [...rp[m][n+1][o]];
      s++;
    }
  }

  //----------------------------------------------------------------------
  //          CELLE Z SUI PIANI XZ
  //----------------------------------------------------------------------
  // MATLAB: for m=1..Npuntix, for o=1..Npuntiz-1, ...
  for (let m = 0; m < Npuntix; m++) {
    for (let o = 0; o < Npuntiz - 1; o++) {
      // Faccia V (xz, y=ymin => n=1 => TS => n=0)
      let n = 0;
      let r1: number[], r2: number[], r3: number[], r4: number[];

      if (m === 0) {
        r1 = rp[m][n][o];
        r3 = rp[m][n][o+1];
        lato_vett_m_p = [r3[0]-r1[0], r3[1]-r1[1], r3[2]-r1[2]];
      } else {
        r1 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m-1][n][o][i]));
        r3 = rp[m][n][o+1].map((val,i)=>0.5*(val + rp[m-1][n][o+1][i]));
      }
      if (m === Npuntix - 1) {
        r2 = rp[m][n][o];
        r4 = rp[m][n][o+1];
        lato_vett_m_p = [r4[0]-r2[0], r4[1]-r2[1], r4[2]-r2[2]];
      } else {
        r2 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m+1][n][o][i]));
        r4 = rp[m][n][o+1].map((val,i)=>0.5*(val + rp[m+1][n][o+1][i]));
      }

      const celle_mag_p = [...r1, ...r2, ...r3, ...r4];
      const Sup_m_p = surfa_old(celle_mag_p, weights_five, roots_five);
      // direzione 3 => z
      const l_m_p = Math.abs(mean_length_P(celle_mag_p, 3));
      const width_m_p = Math.abs(mean_length_P(celle_mag_p, 1));
      const vlen = norm(lato_vett_m_p);
      const vers_m_p = (vlen!==0)? lato_vett_m_p.map(v => v/vlen) : [0,0,0];
      const norm_m_p = [0, -1, 0];

      celle_mag[s] = celle_mag_p;
      Sup_m[s]     = Sup_m_p;
      l_m[s]       = l_m_p;
      width_m[s]   = width_m_p;
      vers_m[s]    = vers_m_p;
      norm_m[s]    = norm_m_p;
      lato_vett_m[s] = [...lato_vett_m_p];
      lati_m[0][s] = [...rp[m][n][o]];
      lati_m[1][s] = [...rp[m][n][o+1]];
      s++;

      // Faccia VI (xz, y=ymax => n=Npuntiy => n=Npuntiy-1 in TS)
      n = Npuntiy - 1;
      if (m === 0) {
        r1 = rp[m][n][o];
        r3 = rp[m][n][o+1];
        lato_vett_m_p = [r3[0]-r1[0], r3[1]-r1[1], r3[2]-r1[2]];
      } else {
        r1 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m-1][n][o][i]));
        r3 = rp[m][n][o+1].map((val,i)=>0.5*(val + rp[m-1][n][o+1][i]));
      }
      if (m === Npuntix - 1) {
        r2 = rp[m][n][o];
        r4 = rp[m][n][o+1];
        lato_vett_m_p = [r4[0]-r2[0], r4[1]-r2[1], r4[2]-r2[2]];
      } else {
        r2 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m+1][n][o][i]));
        r4 = rp[m][n][o+1].map((val,i)=>0.5*(val + rp[m+1][n][o+1][i]));
      }

      const celle_mag_p2 = [...r1, ...r2, ...r3, ...r4];
      const Sup_m_p2 = surfa_old(celle_mag_p2, weights_five, roots_five);
      const l_m_p2 = Math.abs(mean_length_P(celle_mag_p2, 3));
      const width_m_p2 = Math.abs(mean_length_P(celle_mag_p2, 1));
      const vlen2 = norm(lato_vett_m_p);
      const vers_m_p2 = (vlen2!==0)? lato_vett_m_p.map(v=> v/vlen2) : [0,0,0];
      const norm_m_p2 = [0, 1, 0];

      celle_mag[s] = celle_mag_p2;
      Sup_m[s]     = Sup_m_p2;
      l_m[s]       = l_m_p2;
      width_m[s]   = width_m_p2;
      vers_m[s]    = vers_m_p2;
      norm_m[s]    = norm_m_p2;
      lato_vett_m[s] = [...lato_vett_m_p];

      lati_m[0][s] = [...rp[m][n][o]];
      lati_m[1][s] = [...rp[m][n][o+1]];
      s++;
    }
  }

  //----------------------------------------------------------------------
  //          CELLE X SUI PIANI XZ
  //----------------------------------------------------------------------
  // In MATLAB: for o=1..Npuntiz, for m=1..Npuntix-1
  // => TS: o=0..Npuntiz-1, m=0..Npuntix-2
  for (let o = 0; o < Npuntiz; o++) {
    for (let m = 0; m < Npuntix - 1; m++) {

      // Faccia VII (xz, y=ymin => n=1 => TS => n=0)
      let n = 0;
      let r1: number[], r2: number[], r3: number[], r4: number[];

      if (o === 0) {
        r1 = rp[m][n][o];
        r2 = rp[m+1][n][o];
        lato_vett_m_p = [r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]];
      } else {
        r1 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o-1][i]));
        r2 = rp[m+1][n][o].map((val,i)=>0.5*( val + rp[m+1][n][o-1][i]));
      }
      if (o === Npuntiz - 1) {
        r3 = rp[m][n][o];
        r4 = rp[m+1][n][o];
        lato_vett_m_p = [r4[0]-r3[0], r4[1]-r3[1], r4[2]-r3[2]];
      } else {
        r3 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o+1][i]));
        r4 = rp[m+1][n][o].map((val,i)=>0.5*( val + rp[m+1][n][o+1][i]));
      }

      const celle_mag_p = [...r1, ...r2, ...r3, ...r4];
      const Sup_m_p = surfa_old(celle_mag_p, weights_five, roots_five);
      const l_m_p = Math.abs(mean_length_P(celle_mag_p, 1));
      const width_m_p = Math.abs(mean_length_P(celle_mag_p, 3));
      const vlen = norm(lato_vett_m_p);
      const vers_m_p = (vlen!==0)? lato_vett_m_p.map(v => v/vlen) : [0,0,0];
      const norm_m_p = [0, -1, 0];

      celle_mag[s] = celle_mag_p;
      Sup_m[s]     = Sup_m_p;
      l_m[s]       = l_m_p;
      width_m[s]   = width_m_p;
      vers_m[s]    = vers_m_p;
      norm_m[s]    = norm_m_p;
      lato_vett_m[s] = [...lato_vett_m_p];

      lati_m[0][s] = [...rp[m][n][o]];
      lati_m[1][s] = [...rp[m+1][n][o]];
      s++;

      // Faccia VIII (xz, y=ymax => n=Npuntiy => n=Npuntiy-1)
      n = Npuntiy - 1;
      if (o === 0) {
        r1 = rp[m][n][o];
        r2 = rp[m+1][n][o];
        lato_vett_m_p = [r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]];
      } else {
        r1 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n][o-1][i]));
        r2 = rp[m+1][n][o].map((val,i)=>0.5*(val + rp[m+1][n][o-1][i]));
      }
      if (o === Npuntiz - 1) {
        r3 = rp[m][n][o];
        r4 = rp[m+1][n][o];
        lato_vett_m_p = [r4[0]-r3[0], r4[1]-r3[1], r4[2]-r3[2]];
      } else {
        r3 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o+1][i]));
        r4 = rp[m+1][n][o].map((val,i)=>0.5*( val + rp[m+1][n][o+1][i]));
      }

      const celle_mag_p2 = [...r1, ...r2, ...r3, ...r4];
      const Sup_m_p2 = surfa_old(celle_mag_p2, weights_five, roots_five);
      const l_m_p2     = Math.abs(mean_length_P(celle_mag_p2, 1));
      const width_m_p2 = Math.abs(mean_length_P(celle_mag_p2, 3));
      const vlen2 = norm(lato_vett_m_p);
      const vers_m_p2 = (vlen2!==0) ? lato_vett_m_p.map(v=>v/vlen2) : [0,0,0];
      const norm_m_p2 = [0, 1, 0];

      celle_mag[s] = celle_mag_p2;
      Sup_m[s]     = Sup_m_p2;
      l_m[s]       = l_m_p2;
      width_m[s]   = width_m_p2;
      vers_m[s]    = vers_m_p2;
      norm_m[s]    = norm_m_p2;
      lato_vett_m[s] = [...lato_vett_m_p];

      lati_m[0][s] = [...rp[m][n][o]];
      lati_m[1][s] = [...rp[m+1][n][o]];
      s++;
    }
  }

  //----------------------------------------------------------------------
  //          CELLE Y SUI PIANI YZ
  //----------------------------------------------------------------------
  // In MATLAB: for o=1..Npuntiz, for n=1..Npuntiy-1
  for (let o = 0; o < Npuntiz; o++) {
    for (let n = 0; n < Npuntiy - 1; n++) {
      // Faccia IX (yz, x=xmin => m=1 => TS => m=0)
      let m = 0;
      let r1: number[], r2: number[], r3: number[], r4: number[];

      if (o === 0) {
        if (n === 0) {
          r1 = rp[m][n][o];
          r2 = rp[m][n+1][o];
          lato_vett_m_p = [r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]];
        } else {
          r1 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n-1][o][i]));
          r2 = rp[m][n+1][o].map((val,i)=>0.5*( val + rp[m][n+1-1][o][i]));
        }
      } else {
        // if(o!=0)
        if (n === 0) {
          r1 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n][o-1][i]));
          r2 = rp[m][n+1][o].map((val,i)=>0.5*(val + rp[m][n+1][o-1][i]));
        } else {
          r1 = rp[m][n][o].map((val,i)=>
              0.25*( val + rp[m][n-1][o][i] + rp[m][n][o-1][i] + rp[m][n-1][o-1][i]));
          r2 = rp[m][n+1][o].map((val,i)=>
              0.25*( val + rp[m][n+1-1][o][i] + rp[m][n+1][o-1][i] + rp[m][n+1-1][o-1][i]));
        }
      }
      if (o === Npuntiz - 1) {
        if (n === 0) {
          r3 = rp[m][n][o];
          r4 = rp[m][n+1][o];
          lato_vett_m_p = [r4[0]-r3[0], r4[1]-r3[1], r4[2]-r3[2]];
        } else {
          r3 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n-1][o][i]));
          r4 = rp[m][n+1][o].map((val,i)=>0.5*( val + rp[m][n+1-1][o][i]));
        }
      } else {
        if (n === 0) {
          r3 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n][o+1][i]));
          r4 = rp[m][n+1][o].map((val,i)=>0.5*(val + rp[m][n+1][o+1][i]));
        } else {
          r3 = rp[m][n][o].map((val,i)=>
              0.25*( val + rp[m][n-1][o][i] + rp[m][n][o+1][i] + rp[m][n-1][o+1][i]));
          r4 = rp[m][n+1][o].map((val,i)=>
              0.25*( val + rp[m][n+1-1][o][i] + rp[m][n+1][o+1][i] + rp[m][n+1-1][o+1][i]));
        }
      }

      const celle_mag_p = [...r1, ...r2, ...r3, ...r4];
      const Sup_m_p = surfa_old(celle_mag_p, weights_five, roots_five);
      const l_m_p = Math.abs(mean_length_P(celle_mag_p, 1));  // direzione X
      const width_m_p = Math.abs(mean_length_P(celle_mag_p, 3)); // direzione Z
      const vlen = norm(lato_vett_m_p);
      const vers_m_p = (vlen!==0)? lato_vett_m_p.map(v=> v/vlen) : [0,0,0];
      const norm_m_p = [-1, 0, 0];

      celle_mag[s] = celle_mag_p;
      Sup_m[s] = Sup_m_p;
      l_m[s]   = l_m_p;
      width_m[s] = width_m_p;
      vers_m[s]  = vers_m_p;
      norm_m[s]  = norm_m_p;
      lato_vett_m[s] = [...lato_vett_m_p];
      lati_m[0][s] = [...rp[m][n][o]];
      lati_m[1][s] = [...rp[m][n+1][o]];
      s++;

      // Faccia X (yz, x=xmax => m=Npuntix => TS => m=Npuntix-1)
      m = Npuntix - 1;
      if (o === 0) {
        if (n === 0) {
          r1 = rp[m][n][o];
          r2 = rp[m][n+1][o];
          lato_vett_m_p = [r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]];
        } else {
          r1 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n-1][o][i]));
          r2 = rp[m][n+1][o].map((val,i)=>0.5*( val + rp[m][n+1-1][o][i]));
        }
      } else {
        if (n === 0) {
          r1 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o-1][i]));
          r2 = rp[m][n+1][o].map((val,i)=>0.5*( val + rp[m][n+1][o-1][i]));
        } else {
          r1 = rp[m][n][o].map((val,i)=>
            0.25*( val + rp[m][n-1][o][i] + rp[m][n][o-1][i] + rp[m][n-1][o-1][i]));
          r2 = rp[m][n+1][o].map((val,i)=>
            0.25*( val + rp[m][n+1-1][o][i] + rp[m][n+1][o-1][i] + rp[m][n+1-1][o-1][i]));
        }
      }
      if (o === Npuntiz - 1) {
        if (n === 0) {
          r3 = rp[m][n][o];
          r4 = rp[m][n+1][o];
          lato_vett_m_p = [r4[0]-r3[0], r4[1]-r3[1], r4[2]-r3[2]];
        } else {
          r3 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n-1][o][i]));
          r4 = rp[m][n+1][o].map((val,i)=>0.5*(val + rp[m][n+1-1][o][i]));
        }
      } else {
        if (n === 0) {
          r3 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n][o+1][i]));
          r4 = rp[m][n+1][o].map((val,i)=>0.5*(val + rp[m][n+1][o+1][i]));
        } else {
          r3 = rp[m][n][o].map((val,i)=>
            0.25*( val + rp[m][n-1][o][i] + rp[m][n][o+1][i] + rp[m][n-1][o+1][i]));
          r4 = rp[m][n+1][o].map((val,i)=>
            0.25*( val + rp[m][n+1-1][o][i] + rp[m][n+1][o+1][i] + rp[m][n+1-1][o+1][i]));
        }
      }

      const celle_mag_p2 = [...r1, ...r2, ...r3, ...r4];
      const Sup_m_p2 = surfa_old(celle_mag_p2, weights_five, roots_five);
      const l_m_p2     = Math.abs(mean_length_P(celle_mag_p2, 1));
      const width_m_p2 = Math.abs(mean_length_P(celle_mag_p2, 3));
      const vlen2 = norm(lato_vett_m_p);
      const vers_m_p2 = (vlen2!==0)? lato_vett_m_p.map(v=>v/vlen2) : [0,0,0];
      const norm_m_p2 = [1, 0, 0];

      celle_mag[s] = celle_mag_p2;
      Sup_m[s]     = Sup_m_p2;
      l_m[s]       = l_m_p2;
      width_m[s]   = width_m_p2;
      vers_m[s]    = vers_m_p2;
      norm_m[s]    = norm_m_p2;
      lato_vett_m[s] = [...lato_vett_m_p];

      lati_m[0][s] = [...rp[m][n][o]];
      lati_m[1][s] = [...rp[m][n+1][o]];
      s++;
    }
  }

  //----------------------------------------------------------------------
  //          CELLE Z SUI PIANI YZ
  //----------------------------------------------------------------------
  // in MATLAB: for n=1..Npuntiy, for o=1..Npuntiz-1 => TS => n=0..Npuntiy-1, o=0..Npuntiz-2
  for (let n = 0; n < Npuntiy; n++) {
    for (let o = 0; o < Npuntiz - 1; o++) {
      // Faccia XI (yz, x=xmin => m=1 => TS => m=0)
      let m = 0;
      let r1: number[], r2: number[], r3: number[], r4: number[];

      if (n === 0) {
        r1 = rp[m][n][o];
        r2 = rp[m][n][o+1];
        lato_vett_m_p = [r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]];
      } else {
        r1 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n-1][o][i]));
        r2 = rp[m][n][o+1].map((val,i)=>0.5*(val + rp[m][n-1][o+1][i]));
      }
      if (n === Npuntiy - 1) {
        r3 = rp[m][n][o];
        r4 = rp[m][n][o+1];
        lato_vett_m_p = [r4[0]-r3[0], r4[1]-r3[1], r4[2]-r3[2]];
      } else {
        r3 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n+1][o][i]));
        r4 = rp[m][n][o+1].map((val,i)=>0.5*( val + rp[m][n+1][o+1][i]));
      }

      const celle_mag_p = [...r1, ...r2, ...r3, ...r4];
      const Sup_m_p     = surfa_old(celle_mag_p, weights_five, roots_five);
      const l_m_p       = Math.abs(mean_length_P(celle_mag_p, 1));
      const width_m_p   = Math.abs(mean_length_P(celle_mag_p, 2));
      const vlen = norm(lato_vett_m_p);
      const vers_m_p = (vlen!==0)? lato_vett_m_p.map(v=>v/vlen): [0,0,0];
      const norm_m_p = [-1, 0, 0];

      celle_mag[s] = celle_mag_p;
      Sup_m[s]     = Sup_m_p;
      l_m[s]       = l_m_p;
      width_m[s]   = width_m_p;
      vers_m[s]    = vers_m_p;
      norm_m[s]    = norm_m_p;
      lato_vett_m[s] = [...lato_vett_m_p];

      lati_m[0][s] = [...rp[m][n][o]];
      lati_m[1][s] = [...rp[m][n][o+1]];
      s++;

      // Faccia XII (yz, x=xmax => m=Npuntix => TS => m=Npuntix-1)
      m = Npuntix - 1;
      if (n === 0) {
        r1 = rp[m][n][o];
        r2 = rp[m][n][o+1];
        lato_vett_m_p = [r2[0]-r1[0], r2[1]-r1[1], r2[2]-r1[2]];
      } else {
        r1 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n-1][o][i]));
        r2 = rp[m][n][o+1].map((val,i)=>0.5*( val + rp[m][n-1][o+1][i]));
      }
      if (n === Npuntiy - 1) {
        r3 = rp[m][n][o];
        r4 = rp[m][n][o+1];
        lato_vett_m_p = [r4[0]-r3[0], r4[1]-r3[1], r4[2]-r3[2]];
      } else {
        r3 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n+1][o][i]));
        r4 = rp[m][n][o+1].map((val,i)=>0.5*( val + rp[m][n+1][o+1][i]));
      }

      const celle_mag_p2 = [...r1, ...r2, ...r3, ...r4];
      const Sup_m_p2     = surfa_old(celle_mag_p2, weights_five, roots_five);
      const l_m_p2       = Math.abs(mean_length_P(celle_mag_p2, 1));
      const width_m_p2   = Math.abs(mean_length_P(celle_mag_p2, 2));
      const vlen2        = norm(lato_vett_m_p);
      const vers_m_p2    = (vlen2!==0)? lato_vett_m_p.map(v=>v/vlen2) : [0,0,0];
      const norm_m_p2    = [1, 0, 0];

      celle_mag[s] = celle_mag_p2;
      Sup_m[s]     = Sup_m_p2;
      l_m[s]       = l_m_p2;
      width_m[s]   = width_m_p2;
      vers_m[s]    = vers_m_p2;
      norm_m[s]    = norm_m_p2;
      lato_vett_m[s] = [...lato_vett_m_p];

      lati_m[0][s] = [...rp[m][n][o]];
      lati_m[1][s] = [...rp[m][n][o+1]];
      s++;
    }
  }

  // Infine ritorniamo i 7 array richiesti
  return {
    celle_mag,
    lati_m,
    Sup_m,
    l_m,
    width_m,
    vers_m,
    norm_m
  };
}
