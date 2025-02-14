import { genera_celle_magnetizzazione_sup } from './genera_celle_magnetizzazione_sup'; 


/**
 * In MATLAB, restituisce:
 *   - celle_mag (size1 x 12)
 *   - Sup_m, l_m, width_m (size2 x 1) => in TS gestite come array monodimensionale di length=size2
 *   - vers_m, norm_m (size1 x 3)
 */
export function genera_celle_induttive_sup(
  rp: number[][][][],  // shape [Npuntix][Npuntiy][Npuntiz][3]
  Npuntix: number,
  Npuntiy: number,
  Npuntiz: number,
  weights_five: number[],
  roots_five: number[]
): {
  celle_mag: number[][],   
  Sup_m:     number[],     
  l_m:       number[],     
  width_m:   number[],     
  vers_m:    number[][],   // shape (size1 x 3)
  norm_m:    number[][],   // shape (size1 x 3)
}
{
  // 1) Calcolo size1 e size2
  const size1 = (Npuntiy - 1)*(Npuntix - 1)*16
              + (Npuntiz - 1)*(Npuntix - 1)*16
              + (Npuntiz - 1)*(Npuntiy - 1)*16;

  const size2 = (Npuntiy - 1)*(Npuntix - 1)*8
              + (Npuntiz - 1)*(Npuntix - 1)*8
              + (Npuntiz - 1)*(Npuntiy - 1)*8;

  // 2) Allocazione
  // celle_mag: 2D 
  const celle_mag: number[][] = Array.from({ length: size1 }, () => new Array(12).fill(0));
  // Sup_m, l_m, width_m: 1D di length size2
  const Sup_m:   number[] = new Array(size2).fill(0);
  const l_m:     number[] = new Array(size2).fill(0);
  const width_m: number[] = new Array(size2).fill(0);

  // vers_m, norm_m: 2D (size1 x 3)
  const vers_m:  number[][] = Array.from({ length: size1 }, () => [0,0,0]);
  const norm_m:  number[][] = Array.from({ length: size1 }, () => [0,0,0]);

  // 3)
  let start  = 0;  // per celle_mag, vers_m, norm_m (avanza di +8)
  let endC   = 8;

  let start2 = 0;  // per Sup_m, l_m, width_m (avanza di +4)
  let endC2  = 4;

  // 4) Funzione di supporto per "processFace", che incapsula la logica:
  function processFace(r_nodi_barra: number[][], faceType: string): void {
    
    const {
      celle_mag_p,   
      Sup_m_p,       
      l_m_p,
      width_m_p,
      vers_m_p,      
      norm_m_p,      
    } = genera_celle_magnetizzazione_sup(r_nodi_barra, weights_five, roots_five, faceType);

    // Copia i blocchi di 8 righe
    for (let i = 0; i < 8; i++) {
      celle_mag[start + i] = [...celle_mag_p[i]];   // shape (8 x 12)
      vers_m[start + i]    = [...vers_m_p[i]];      // shape (8 x 3)
      norm_m[start + i]    = [...norm_m_p[i]];      // shape (8 x 3)
    }

    // Copia i blocchi di 4 righe
    for (let j = 0; j < 4; j++) {
      Sup_m[start2 + j]    = Sup_m_p[j];
      l_m[start2 + j]      = l_m_p[j];
      width_m[start2 + j]  = width_m_p[j];
    }

    start  += 8;  
    start2 += 4;  
  }

  // 5) Cicli come in MATLAB

  // (A) xy_min / xy_max
  for (let n = 0; n < Npuntiy - 1; n++) {
    for (let m = 0; m < Npuntix - 1; m++) {
      // xy_min => o=0
      let o = 0;
      const r1 = rp[m][n][o];
      const r2 = rp[m+1][n][o];
      const r3 = rp[m][n+1][o];
      const r4 = rp[m+1][n+1][o];
      processFace([r1, r2, r3, r4], "xy_min");

      // xy_max => o=Npuntiz-1
      o = Npuntiz - 1;
      const r5 = rp[m][n][o];
      const r6 = rp[m+1][n][o];
      const r7 = rp[m][n+1][o];
      const r8 = rp[m+1][n+1][o];
      processFace([r5, r6, r7, r8], "xy_max");
    }
  }

  // (B) xz_min / xz_max
  for (let o = 0; o < Npuntiz - 1; o++) {
    for (let m = 0; m < Npuntix - 1; m++) {
      // xz_min => n=0
      let n = 0;
      const r1 = rp[m][n][o];
      const r2 = rp[m+1][n][o];
      const r3 = rp[m][n][o+1];
      const r4 = rp[m+1][n][o+1];
      processFace([r1, r2, r3, r4], "xz_min");

      // xz_max => n=Npuntiy-1
      n = Npuntiy - 1;
      const r5 = rp[m][n][o];
      const r6 = rp[m+1][n][o];
      const r7 = rp[m][n][o+1];
      const r8 = rp[m+1][n][o+1];
      processFace([r5, r6, r7, r8], "xz_max");
    }
  }

  // (C) yz_min / yz_max
  for (let n = 0; n < Npuntiy - 1; n++) {
    for (let o = 0; o < Npuntiz - 1; o++) {
      // yz_min => m=0
      let m = 0;
      const r1 = rp[m][n][o];
      const r2 = rp[m][n+1][o];
      const r3 = rp[m][n][o+1];
      const r4 = rp[m][n+1][o+1];
      processFace([r1, r2, r3, r4], "yz_min");

      // yz_max => m=Npuntix-1
      m = Npuntix - 1;
      const r5 = rp[m][n][o];
      const r6 = rp[m][n+1][o];
      const r7 = rp[m][n][o+1];
      const r8 = rp[m][n+1][o+1];
      processFace([r5, r6, r7, r8], "yz_max");
    }
  }

  // 6) Return final
  return {
    celle_mag, // (size1 x 12)
    Sup_m,     // size2 monodimensionale
    l_m,       // size2 monodimensionale
    width_m,   // size2 monodimensionale
    vers_m,    // (size1 x 3)
    norm_m,    // (size1 x 3)
  };
}
