import { interpolating_vectors } from "./interpolating_vectors";
import { genera_celle_induttive } from "./genera_celle_induttive";
import { genera_superfici_celle_induttive } from "./genera_superfici_celle_induttive";
import { genera_celle_induttive_sup } from "./genera_celle_induttive_sup";
import { genera_celle_capacitive_new_sup } from "./genera_celle_capacitive_new_sup";
import { genera_celle_capacitive_maglie_save } from "./genera_celle_capacitive_maglie_save";
import { genera_celle_induttive_maglie_save } from "./genera_celle_induttive_maglie_save";
import { genera_celle_induttive_sup_maglie_save } from "./genera_celle_induttive_sup_maglie_save";
import { linspace } from "./linspace";

/**
 *
 *  - Gestiamo `Sup_sup` come array **1D**
 *  - in MATLAB si farebbe `Sup_sup(contTot, 1:72)`, qui usiamo un indice lineare.
 *
 * Restituisce un oggetto con tutte le variabili di output:
 *  barra, celle_cap, celle_ind, celle_mag, lati, lati_m, vers, Nodi,
 *  spessore_i, Sup_c, Sup_i, Sup_m, l_i, l_c, l_m, width_i, width_c, width_m,
 *  dir_curr, vers_m, norm_m, celle_ind_sup, Sup_sup, indici_sup, normale_sup,
 *  dir_curr_sup, rc_sup, w_sup, NodiRed
 */
export function discr_psp_nono_3D_vol_sup_save(
  xyz: number[],     
  Npuntix: number,
  Npuntiy: number,
  Npuntiz: number,
  discrUnif: boolean,
  weights_five: number[],
  roots_five: number[]
): {
  barra: number[][];       
  celle_cap: number[][];   
  celle_ind: number[][];   
  celle_mag: number[][];   
  lati: number[][][];      
  lati_m: number[][][];
  vers: number[][];        
  Nodi: number[][];        
  spessore_i: number[];    
  Sup_c: number[];         
  Sup_i: number[];         
  Sup_m: number[];         
  l_i: number[];           
  l_c: number[];           
  l_m: number[];           
  width_i: number[];       
  width_c: number[];       
  width_m: number[];       
  dir_curr: number[];      
  vers_m: number[][];      
  norm_m: number[][];      
  celle_ind_sup: number[][]; 
  Sup_sup: number[];        
  indici_sup: {
    x: number[];
    y: number[];
    z: number[];
  };
  normale_sup: number[][];  
  dir_curr_sup: number[];   
  rc_sup: number[][];       
  w_sup: number[];          
  NodiRed: number[][];      
}
{
  // ========== 1) Preallocazione variabili di output ==========

  let barra: number[][] = [];
  let celle_cap: number[][] = [];
  let celle_ind: number[][] = [];
  let celle_mag: number[][] = [];
  let lati: number[][][] = [[],[]];   // in MATLAB: lati(1,:,:)=..., etc.
  let lati_m: number[][][] = [[],[]]; 
  let vers: number[][] = [];
  let Nodi: number[][] = [];
  let spessore_i: number[] = [];
  let Sup_c: number[] = [];
  let Sup_i: number[] = [];
  let Sup_m: number[] = [];
  let l_i: number[] = [];
  let l_c: number[] = [];
  let l_m: number[] = [];
  let width_i: number[] = [];
  let width_c: number[] = [];
  let width_m: number[] = [];
  let dir_curr: number[] = [];
  let vers_m: number[][] = [];
  let norm_m: number[][] = [];
  let celle_ind_sup: number[][] = [];
  let Sup_sup: number[] = [];
  let indici_sup = {
    x: [] as number[],
    y: [] as number[],
    z: [] as number[]
  };
  let normale_sup: number[][] = [];
  let dir_curr_sup: number[] = [];
  let rc_sup: number[][] = [];
  let w_sup: number[] = [];
  let NodiRed: number[][] = [];

  // ========== 2) Ricostruzione dei punti "ri" ==========

  const ri: number[][] = [
    xyz.slice(0,3),
    xyz.slice(3,6),
    xyz.slice(6,9),
    xyz.slice(9,12),
    xyz.slice(12,15),
    xyz.slice(15,18),
    xyz.slice(18,21),
    xyz.slice(21,24)
  ];

  // ========== 3) Interpolating vectors ==========

  const { rmi, rai, rbi, rci, rabi, rbci, raci, rabci } = interpolating_vectors(ri);

  // ========== 4) Creiamo a,b,c con linspace ==========

  const a = linspace(-1, 1, Npuntix);
  const b = linspace(-1, 1, Npuntiy);
  const c = linspace(-1, 1, Npuntiz);

  // ========== 5) Creazione rp (4D) ==========

  let rp = Array.from({ length: Npuntix }, () =>
    Array.from({ length: Npuntiy }, () =>
      Array.from({ length: Npuntiz }, () => Array(3).fill(0))
    )
  );

  // Riempimento di rp
  for (let nn = 0; nn < Npuntiz; nn++) {
    for (let mm = 0; mm < Npuntiy; mm++) {
      for (let ll = 0; ll < Npuntix; ll++) {
        const ax = a[ll], bx = b[mm], cx = c[nn];
        const xyz3 = [
          rmi[0] + rai[0]*ax + rbi[0]*bx + rci[0]*cx
                    + rabi[0]*ax*bx + rbci[0]*bx*cx + raci[0]*ax*cx + rabci[0]*ax*bx*cx,
          rmi[1] + rai[1]*ax + rbi[1]*bx + rci[1]*cx
                    + rabi[1]*ax*bx + rbci[1]*bx*cx + raci[1]*ax*cx + rabci[1]*ax*bx*cx,
          rmi[2] + rai[2]*ax + rbi[2]*bx + rci[2]*cx
                    + rabi[2]*ax*bx + rbci[2]*bx*cx + raci[2]*ax*cx + rabci[2]*ax*bx*cx
        ];
        rp[ll][mm][nn] = xyz3;
      }
    }
  }

  // ========== 6) Caso discretizzazione uniforme vs no ==========

  if (discrUnif) {

    // ---------- A) discrUnif = true ----------

    const sizeCicli = (Npuntiz - 1)*(Npuntiy - 1)*(Npuntix - 1);

    // Prealloc 
    let indici_celle_indx = new Array(4*sizeCicli).fill(0);
    let indici_celle_indy = new Array(4*sizeCicli).fill(0);
    let indici_celle_indz = new Array(4*sizeCicli).fill(0);

    celle_ind = Array.from({ length: 12*sizeCicli }, () => Array(24).fill(0));
    
    let lati1 = Array.from({ length: 12*sizeCicli }, () => [0,0,0]);
    let lati2 = Array.from({ length: 12*sizeCicli }, () => [0,0,0]);
    vers = Array.from({ length: 12*sizeCicli }, () => [0,0,0]);
    l_i = new Array(12*sizeCicli).fill(0);
    spessore_i = new Array(12*sizeCicli).fill(0);
    Sup_i = new Array(12*sizeCicli).fill(0);
    width_i = new Array(12*sizeCicli).fill(0);
    dir_curr = new Array(12*sizeCicli).fill(0);

    // Parte di superficie
    celle_ind_sup = Array.from({ length: 72*sizeCicli }, () => Array(12).fill(0));
    let indici_celle_ind_supx = new Array(24*sizeCicli).fill(0);
    let indici_celle_ind_supy = new Array(24*sizeCicli).fill(0);
    let indici_celle_ind_supz = new Array(24*sizeCicli).fill(0);

    //  "Sup_sup" come 1D di lunghezza sizeCicli*72
    Sup_sup = new Array(sizeCicli * 72).fill(0);

    normale_sup = Array.from({ length: 72*sizeCicli }, () => [0,0,0]);
    dir_curr_sup = new Array(72*sizeCicli).fill(0);
    rc_sup = Array.from({ length: 72*sizeCicli }, () => [0,0,0]);
    w_sup = new Array(72*sizeCicli).fill(0);

    barra = Array.from({ length: sizeCicli }, () => Array(24).fill(0));

    let contTot = 0;

    // Triplo loop su o, n, m
    for (let o=0; o < Npuntiz-1; o++) {
      for (let n=0; n < Npuntiy-1; n++) {
        for (let m=0; m < Npuntix-1; m++) {
          contTot++;

          // Calcolo r1..r43 come in MATLAB
          const r1  = rp[m][n][o];
          const r2  = rp[m+1][n][o];
          const r3  = rp[m][n+1][o];
          const r4  = rp[m+1][n+1][o];
          const r5  = mid(rp[m][n][o],     rp[m][n+1][o]);
          const r6  = mid(rp[m+1][n][o],   rp[m+1][n+1][o]);
          const r7  = mid(rp[m][n][o],     rp[m+1][n][o]);
          const r8  = mid(rp[m][n+1][o],   rp[m+1][n+1][o]);
          const r9  = mid(r5, r6);

          const r10 = rp[m][n][o+1];
          const r11 = rp[m+1][n][o+1];
          const r12 = rp[m][n+1][o+1];
          const r13 = rp[m+1][n+1][o+1];
          const r14 = mid(rp[m][n][o+1],   rp[m][n+1][o+1]);
          const r15 = mid(rp[m+1][n][o+1], rp[m+1][n+1][o+1]);
          const r16 = mid(rp[m][n][o+1],   rp[m+1][n][o+1]);
          const r17 = mid(rp[m][n+1][o+1], rp[m+1][n+1][o+1]);
          const r18 = mid(r14, r15);

          const r19 = mid(r1,  r10);
          const r20 = mid(r7,  r16);
          const r21 = mid(r2,  r11);
          const r22 = mid(r6,  r15);
          const r23 = mid(r4,  r13);
          const r24 = mid(r8,  r17);
          const r25 = mid(r3,  r12);
          const r26 = mid(r5,  r14);
          const r27 = mid(r9,  r18);
          const r28 = mid(r1,  r5);
          const r29 = mid(r2,  r6);
          const r30 = mid(r5,  r3);
          const r31 = mid(r6,  r4);
          const r32 = mid(r10, r14);
          const r33 = mid(r11, r15);
          const r34 = mid(r14, r12);
          const r35 = mid(r15, r13);
          const r36 = mid(r7,  r9);
          const r37 = mid(r9,  r8);
          const r38 = mid(r16, r18);
          const r39 = mid(r18, r17);
          const r40 = mid(r28, r32);
          const r41 = mid(r30, r34);
          const r42 = mid(r21, r22);
          const r43 = mid(r22, r23);

          const r_nodi_barra = [
            r1,r2,r3,r4,r5,r6,r7,r8,r9,
            r10,r11,r12,r13,r14,r15,r16,r17,r18,
            r19,r20,r21,r22,r23,r24,r25,r26,r27,
            r28,r29,r30,r31,r32,r33,r34,r35,r36,
            r37,r38,r39,r40,r41,r42,r43
          ];

          // genera_celle_induttive
          let {
            celle_ind: ci_p,
            lati: lati_p,
            vers: vers_p,
            l: l_i_p,
            indici_celle_indx: idx_x_p,
            indici_celle_indy: idx_y_p,
            indici_celle_indz: idx_z_p,
            spessore: sp_i_p,
            Sup: Sup_i_p,
            width: w_i_p,
            dir_curr: dir_c_p
          } = genera_celle_induttive(r_nodi_barra);

          // Salvataggio in celle_ind globale
          const baseInd = (contTot - 1)*12;
          for (let k = 0; k < 12; k++) {
            celle_ind[baseInd + k] = ci_p[k];
            lati1[baseInd + k]     = lati_p[0][k];
            lati2[baseInd + k]     = lati_p[1][k];
            vers[baseInd + k]      = vers_p[k];
            l_i[baseInd + k]       = l_i_p[k];
            spessore_i[baseInd + k]= sp_i_p[k];
            Sup_i[baseInd + k]     = Sup_i_p[k];
            width_i[baseInd + k]   = w_i_p[k];
            dir_curr[baseInd + k]  = dir_c_p[k];
          }

          // Indici x,y,z (4 * sizeCicli)
          const baseInd4 = (contTot - 1)*4;
          for (let k=0; k<4; k++) {
            indici_celle_indx[baseInd4 + k] = idx_x_p[k];
            indici_celle_indy[baseInd4 + k] = idx_y_p[k];
            indici_celle_indz[baseInd4 + k] = idx_z_p[k];
          }

          // genera_superfici_celle_induttive
          let {
            celle_ind_sup: cis_p,
            indici_celle_ind_supx: idx_supx_p,
            indici_celle_ind_supy: idx_supy_p,
            indici_celle_ind_supz: idx_supz_p,
            Sup: Sup_sup_p,      // lunghezza 72
            normale: norm_sup_p,
            dir_curr: dir_sup_p,
            w: w_sup_p
          } = genera_superfici_celle_induttive(r_nodi_barra, weights_five, roots_five);

          // Centro di ogni faccia
          let rc_sup_p: number[][] = [];
          for (let k=0; k < cis_p.length; k++) {
            const row = cis_p[k];
            const r1s = row.slice(0,3), r2s = row.slice(3,6),
                  r3s = row.slice(6,9), r4s = row.slice(9,12);
            const cx = 0.25*(r1s[0]+r2s[0]+r3s[0]+r4s[0]);
            const cy = 0.25*(r1s[1]+r2s[1]+r3s[1]+r4s[1]);
            const cz = 0.25*(r1s[2]+r2s[2]+r3s[2]+r4s[2]);
            rc_sup_p.push([cx, cy, cz]);
          }

          // Salviamo i dati in celle_ind_sup globale
          const baseInd72 = (contTot - 1)*72;
          for (let k=0; k<72; k++) {
            celle_ind_sup[baseInd72 + k] = cis_p[k];
            normale_sup[baseInd72 + k]   = norm_sup_p[k];
            dir_curr_sup[baseInd72 + k]  = dir_sup_p[k];
            rc_sup[baseInd72 + k]        = rc_sup_p[k];
            w_sup[baseInd72 + k]         = w_sup_p[k];
          }

          // Indici superfici
          const baseInd24 = (contTot - 1)*24;
          for (let k=0; k<24; k++) {
            indici_celle_ind_supx[baseInd24 + k] = idx_supx_p[k];
            indici_celle_ind_supy[baseInd24 + k] = idx_supy_p[k];
            indici_celle_ind_supz[baseInd24 + k] = idx_supz_p[k];
          }

          // Ora salviamo i 72 valori di sup in una posizione lineare
          // in MATLAB si faceva `Sup_sup(contTot, :) = Sup_sup_p`
          // qui:
          const offsetSup = (contTot - 1)*72;
          for (let k=0; k<72; k++) {
            Sup_sup[offsetSup + k] = Sup_sup_p[k];
          }

          // Salvataggio di "barra(contTot,:) = [r1 r2 r3 r4 r10 r11 r12 r13]"
          barra[contTot - 1] = [
            ...r1, ...r2, ...r3, ...r4,
            ...r10, ...r11, ...r12, ...r13
          ];
        }
      }
    }

    // Riempio la struct indici_sup
    indici_sup.x = indici_celle_indx;
    indici_sup.y = indici_celle_indy;
    indici_sup.z = indici_celle_indz;

    // Ora genera_celle_induttive_sup
    let {
      celle_mag: cm,
      Sup_m: sm,
      l_m: lm,
      width_m: wm,
      vers_m: vm,
      norm_m: nm
    } = genera_celle_induttive_sup(rp, Npuntix, Npuntiy, Npuntiz, weights_five, roots_five);
    celle_mag = cm;
    Sup_m     = sm;
    l_m       = lm;
    width_m   = wm;
    vers_m    = vm;
    norm_m    = nm;

    // Celle capacitive di superficie
    const size1 = (Npuntiy-1)*(Npuntix-1)*16
                + (Npuntiz-1)*(Npuntix-1)*16
                + (Npuntiz-1)*(Npuntiy-1)*16;
    const size2 = (Npuntiy-1)*(Npuntix-1)*8
                + (Npuntiz-1)*(Npuntix-1)*8
                + (Npuntiz-1)*(Npuntiy-1)*8;

    celle_cap = Array.from({ length: size1 }, () => Array(12).fill(0));
    Sup_c     = new Array(size2).fill(0);
    l_c       = new Array(size2).fill(0);
    width_c   = new Array(size2).fill(0);
    Nodi      = Array.from({ length: size1 }, () => [0,0,0]);

    let start = 0;
    let start2= 0;

    // Funzione di servizio
    function copyCelleCap(
      cc: number[][],
      Nd: number[][],
      sc: number[],
      lc: number[],
      wc: number[]
    ) {
      // 8 celle e 4 param
      for (let i=0; i<8; i++) {
        celle_cap[start + i] = cc[i];
        Nodi[start + i]      = Nd[i];
      }
      for (let j=0; j<4; j++) {
        Sup_c[start2 + j]   = sc[j];
        l_c[start2 + j]     = lc[j];
        width_c[start2 + j] = wc[j];
      }
      start  += 8;
      start2 += 4;
    }

    // Face I, II (xy)
    for (let n=0; n < Npuntiy-1; n++) {
      for (let m=0; m < Npuntix-1; m++) {
        // z=zmin
        let o=0;
        const r1 = rp[m][n][o], r2 = rp[m+1][n][o];
        const r3 = rp[m][n+1][o], r4 = rp[m+1][n+1][o];
        {
          const { celle_cap: cc, Nodi: Nd, Sup_c: sc, l_c: lc, width_c: wc }
            = genera_celle_capacitive_new_sup([r1,r2,r3,r4], weights_five, roots_five);
          copyCelleCap(cc, Nd, sc, lc, wc);
        }

        // z=zmax
        o= Npuntiz-1;
        const r1b = rp[m][n][o], r2b = rp[m+1][n][o];
        const r3b = rp[m][n+1][o], r4b = rp[m+1][n+1][o];
        {
          const { celle_cap: cc2, Nodi: Nd2, Sup_c: sc2, l_c: lc2, width_c: wc2 }
            = genera_celle_capacitive_new_sup([r1b,r2b,r3b,r4b], weights_five, roots_five);
          copyCelleCap(cc2, Nd2, sc2, lc2, wc2);
        }
      }
    }

    // Face III, IV (xz)
    for (let o=0; o < Npuntiz-1; o++) {
      for (let m=0; m < Npuntix-1; m++) {
        // y=ymin
        let n=0;
        const r1 = rp[m][n][o], r2= rp[m+1][n][o];
        const r3 = rp[m][n][o+1], r4= rp[m+1][n][o+1];
        {
          const { celle_cap: cc, Nodi: Nd, Sup_c: sc, l_c: lc, width_c: wc }
            = genera_celle_capacitive_new_sup([r1,r2,r3,r4], weights_five, roots_five);
          copyCelleCap(cc, Nd, sc, lc, wc);
        }

        // y=ymax
        n= Npuntiy-1;
        const r1b = rp[m][n][o], r2b= rp[m+1][n][o];
        const r3b = rp[m][n][o+1], r4b= rp[m+1][n][o+1];
        {
          const { celle_cap: cc2, Nodi: Nd2, Sup_c: sc2, l_c: lc2, width_c: wc2 }
            = genera_celle_capacitive_new_sup([r1b,r2b,r3b,r4b], weights_five, roots_five);
          copyCelleCap(cc2, Nd2, sc2, lc2, wc2);
        }
      }
    }

    // Face V, VI (yz)
    for (let n=0; n< Npuntiy-1; n++) {
      for (let o=0; o < Npuntiz-1; o++) {
        // x=xmin
        let m=0;
        const r1 = rp[m][n][o], r2= rp[m][n+1][o];
        const r3 = rp[m][n][o+1], r4= rp[m][n+1][o+1];
        {
          const { celle_cap: cc, Nodi: Nd, Sup_c: sc, l_c: lc, width_c: wc }
            = genera_celle_capacitive_new_sup([r1,r2,r3,r4], weights_five, roots_five);
          copyCelleCap(cc, Nd, sc, lc, wc);
        }

        // x=xmax
        m= Npuntix-1;
        const r1b= rp[m][n][o], r2b= rp[m][n+1][o];
        const r3b= rp[m][n][o+1], r4b= rp[m][n+1][o+1];
        {
          const { celle_cap: cc2, Nodi: Nd2, Sup_c: sc2, l_c: lc2, width_c: wc2 }
            = genera_celle_capacitive_new_sup([r1b,r2b,r3b,r4b], weights_five, roots_five);
          copyCelleCap(cc2, Nd2, sc2, lc2, wc2);
        }
      }
    }

    // Riduzione dei nodi capacitivi
    const NumNodiCap = Nodi.length;
    const targetSize = Npuntix*Npuntiy*Npuntiz - (Npuntix-2)*(Npuntiy-2)*(Npuntiz-2);
    NodiRed = Array.from({ length: targetSize }, () => [0,0,0]);

    if (NumNodiCap > 1) {
      // Copia del primo
      NodiRed[0] = [...Nodi[0]];
      let nodoAct = 1;
      for (let k=1; k<NumNodiCap; k++) {
        const cand = Nodi[k];
        let found = -1;
        for (let i=0; i<nodoAct; i++) {
          const dx = Math.abs(NodiRed[i][0] - cand[0]);
          const dy = Math.abs(NodiRed[i][1] - cand[1]);
          const dz = Math.abs(NodiRed[i][2] - cand[2]);
          if (dx<=1e-11 && dy<=1e-11 && dz<=1e-11) {
            found = i; break;
          }
        }
        if (found<0) {
          NodiRed[nodoAct] = [...cand];
          nodoAct++;
        }
      }
      NodiRed.splice(nodoAct);
    } else {
      if (NumNodiCap === 1) {
        NodiRed[0] = [...Nodi[0]];
        NodiRed.splice(1);
      } else {
        NodiRed.splice(0);
      }
    }

  } else {
    // ---------- B) caso discrUnif = false ----------
    // => usiamo genera_celle_induttive_maglie_save
    let ret1 = genera_celle_induttive_maglie_save(
      rp, Npuntix, Npuntiy, Npuntiz, weights_five, roots_five
    );

    celle_ind      = ret1.celle_ind;
    lati           = ret1.lati;
    vers           = ret1.vers;
    l_i            = ret1.l;
    spessore_i     = ret1.spessore;
    Sup_i          = ret1.Sup;
    width_i        = ret1.width;
    dir_curr       = ret1.dir_curr;
    celle_ind_sup  = ret1.celle_ind_sup;
    rc_sup         = ret1.rc_sup;
    Sup_sup        = ret1.Sup_sup;     // <-- qui assumiamo che ret1.Sup_sup SIA 1D
    normale_sup    = ret1.normale_sup;
    dir_curr_sup   = ret1.dir_curr_sup;
    w_sup          = ret1.w_sup;
    barra          = ret1.barra;

    indici_sup.x   = ret1.indici_celle_ind_supx;
    indici_sup.y   = ret1.indici_celle_ind_supy;
    indici_sup.z   = ret1.indici_celle_ind_supz;

    let ret2 = genera_celle_induttive_sup_maglie_save(
      rp, Npuntix, Npuntiy, Npuntiz, weights_five, roots_five
    );
    celle_mag = ret2.celle_mag;
    lati_m    = ret2.lati_m;
    Sup_m     = ret2.Sup_m;
    l_m       = ret2.l_m;
    width_m   = ret2.width_m;
    vers_m    = ret2.vers_m;
    norm_m    = ret2.norm_m;

    let ret3 = genera_celle_capacitive_maglie_save(
      rp, Npuntix, Npuntiy, Npuntiz, weights_five, roots_five
    );
    celle_cap = ret3.celle_cap;
    Nodi      = ret3.Nodi;
    Sup_c     = ret3.Sup_c;
    l_c       = ret3.l_c;
    width_c   = ret3.width_c;
    NodiRed   = ret3.NodiRed;
  }

  // ========== 7) Return di tutte le variabili ==========

  return {
    barra,
    celle_cap,
    celle_ind,
    celle_mag,
    lati,
    lati_m,
    vers,
    Nodi,
    spessore_i,
    Sup_c,
    Sup_i,
    Sup_m,
    l_i,
    l_c,
    l_m,
    width_i,
    width_c,
    width_m,
    dir_curr,
    vers_m,
    norm_m,
    celle_ind_sup,
    Sup_sup,     
    indici_sup,
    normale_sup,
    dir_curr_sup,
    rc_sup,
    w_sup,
    NodiRed
  };
}

/** 
 * Funzione di supporto per calcolare la media di due vettori 3D
 * corrisponde a 0.5*(v1 + v2).
 */
function mid(v1: number[], v2: number[]): number[] {
  return [
    0.5*(v1[0] + v2[0]),
    0.5*(v1[1] + v2[1]),
    0.5*(v1[2] + v2[2])
  ];
}
