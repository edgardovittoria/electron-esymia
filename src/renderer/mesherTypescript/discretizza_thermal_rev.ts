import { discr_psp_nono_3D_vol_sup_save } from "./discr_psp_nono_3D_vol_sup_save";
import { genera_nodi_interni_rev } from "./genera_nodi_interni_rev";
import { genera_nodi_interni_merged_non_ort } from "./genera_nodi_interni_merged_non_ort";
import { genera_estremi_lati_per_oggetto_rev } from "./genera_estremi_lati_per_oggetto_rev";
import { elimina_patches_interni_thermal_save } from "./elimina_patches_interni_thermal_save";
import { FindInternalNodesCommon2FourObjects_rev } from "./FindInternalNodesCommon2FourObjects_rev";
import { matrice_incidenza_rev } from "./matrice_incidenza_rev";
import { genera_dati_Z_sup } from "./genera_dati_Z_sup";
import { round_ud } from "./round_ud";
import { InduttanzeBase, MaterialMesher } from './interfaces'; 
import { EliminaPatchesInterniOutput } from './elimina_patches_interni_thermal_save';
import { MatriceIncidenzaRevOutput } from './matrice_incidenza_rev';  
import * as math from 'mathjs';


/**
 * Porting di `creaVersore(barra, dir_curr)` da MATLAB a TypeScript.
 *
 * In MATLAB:
 *   function [l,w,t,S,vers] = creaVersore(barra, dir_curr)
 *
 
 *
 * Restituisce 5 valori:
 *   - l, w, t (le dimensioni principali)
 *   - S = w * t
 *   - vers = versore (un vettore 3D normalizzato)
 */
function creaVersore(
    barra: number[],     // lunghezza 24
    dir_curr: number
  ): [number, number, number, number, number[]] {
  
    // Helper: somma 1/4 di alcuni indici di `barra` (0-based)
    // Perché in MATLAB si fa: x1=1/4*sum(barra([1 7 13 19])), 
    //   ma lì è 1-based => [0,6,12,18] in TS
    function quarterSum(indices: number[]): number {
      let s = 0;
      for (let idx of indices) {
        s += barra[idx];
      }
      return s * 0.25;
    }
  
    // Norma di un vettore 3D
    function norm3(v: number[]): number {
      return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    }
  
    // Restituiamo l, w, t, S, vers
    let l=0, w=0, t=0, S=0;
    let vers = [0,0,0];
  
    if (dir_curr === 1) {
      // =============== CASE dir_curr==1 ===============
      // 1) Calcolo x1..z2 => definisce v1..v2 => vers => l
      const x1 = quarterSum([0, 6, 12, 18]);   // => MATLAB [1 7 13 19]
      const x2 = quarterSum([3, 9, 15, 21]);   // => MATLAB [4 10 16 22]
      const y1 = quarterSum([1, 7, 13, 19]);   // => MATLAB [2 8 14 20]
      const y2 = quarterSum([4, 10, 16, 22]);  // => MATLAB [5 11 17 23]
      const z1 = quarterSum([2, 8, 14, 20]);   // => MATLAB [3 9 15 21]
      const z2 = quarterSum([5, 11, 17, 23]);  // => MATLAB [6 12 18 24]
  
      let v1 = [x1, y1, z1];
      let v2 = [x2, y2, z2];
  
      // %     pos=find(min(x1,x2)==[x1 x2]);
      // %     if(pos(1)==2)
      // %         v2=[x1 y1 z1];
      // %         v1=[x2 y2 z2];
      // %     end
  
      const dv = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
      const dvNorm = norm3(dv);
      vers = dv.map((val)=> val/dvNorm);
      l = dvNorm;
  
      // 2) Calcolo x1..z2 => definisce w
      const x1b = quarterSum([0, 3, 12, 15]);   // => MATLAB [1 4 13 16]
      const x2b = quarterSum([6, 9, 18, 21]);   // => MATLAB [7 10 19 22]
      const y1b = quarterSum([1, 4, 13, 16]);   // => MATLAB [2 5 14 17]
      const y2b = quarterSum([7, 10, 19, 22]);  // => MATLAB [8 11 20 23]
      const z1b = quarterSum([2, 5, 14, 17]);   // => MATLAB [3 6 15 18]
      const z2b = quarterSum([8, 11, 20, 23]);  // => MATLAB [9 12 21 24]
  
      v1 = [x1b, y1b, z1b];
      v2 = [x2b, y2b, z2b];
      // ...
      const dvb = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
      w = norm3(dvb);
  
      // 3) Calcolo t => ultima slice
      const x1c = quarterSum([0, 3, 6, 9]);       // => MATLAB [1 4 7 10]
      const x2c = quarterSum([12,15,18,21]);      // => MATLAB [13 16 19 22]
      const y1c = quarterSum([1, 4, 7, 10]);      // => MATLAB [2 5 8 11]
      const y2c = quarterSum([13,16,19,22]);      // => MATLAB [14 17 20 23]
      const z1c = quarterSum([2, 5, 8, 11]);      // => MATLAB [3 6 9 12]
      const z2c = quarterSum([14,17,20,23]);      // => MATLAB [15 18 21 24]
  
      v1 = [x1c, y1c, z1c];
      v2 = [x2c, y2c, z2c];
      const dvc = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
      t = norm3(dvc);
      S = w * t;
  
    } else if (dir_curr === 2) {
      // =============== CASE dir_curr==2 ===============
      // 1) x1..z2 => definisce t
      const x1 = quarterSum([0, 6, 12, 18]); 
      const x2 = quarterSum([3, 9, 15, 21]);
      const y1 = quarterSum([1, 7, 13, 19]);
      const y2 = quarterSum([4, 10, 16, 22]);
      const z1 = quarterSum([2, 8, 14, 20]);
      const z2 = quarterSum([5, 11, 17, 23]);
  
      let v1 = [x1, y1, z1];
      let v2 = [x2, y2, z2];
      const dv = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
      t = norm3(dv);
  
      // 2) x1..z2 => definisce vers => l
      const x1b = quarterSum([0, 3, 12, 15]);
      const x2b = quarterSum([6, 9, 18, 21]);
      const y1b = quarterSum([1, 4, 13, 16]);
      const y2b = quarterSum([7, 10, 19, 22]);
      const z1b = quarterSum([2, 5, 14, 17]);
      const z2b = quarterSum([8, 11, 20, 23]);
  
      v1 = [x1b, y1b, z1b];
      v2 = [x2b, y2b, z2b];
      const dvb = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
      const dvbNorm = norm3(dvb);
      vers = dvb.map(val => val/dvbNorm);
      l = dvbNorm;
  
      // 3) x1..z2 => definisce w => S
      const x1c = quarterSum([0, 3, 6, 9]);
      const x2c = quarterSum([12,15,18,21]);
      const y1c = quarterSum([1, 4, 7, 10]);
      const y2c = quarterSum([13,16,19,22]);
      const z1c = quarterSum([2, 5, 8, 11]);
      const z2c = quarterSum([14,17,20,23]);
  
      v1 = [x1c, y1c, z1c];
      v2 = [x2c, y2c, z2c];
      const dvc = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
      w = norm3(dvc);
      S = w * t;
  
    } else {
      // =============== CASE dir_curr==3 ===============
      // 1) x1..z2 => definisce t
      const x1 = quarterSum([0, 6, 12, 18]);
      const x2 = quarterSum([3, 9, 15, 21]);
      const y1 = quarterSum([1, 7, 13, 19]);
      const y2 = quarterSum([4, 10, 16, 22]);
      const z1 = quarterSum([2, 8, 14, 20]);
      const z2 = quarterSum([5, 11, 17, 23]);
  
      let v1 = [x1, y1, z1];
      let v2 = [x2, y2, z2];
      const dv = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
      t = norm3(dv);
  
      // 2) definisce w
      const x1b = quarterSum([0, 3, 12, 15]);
      const x2b = quarterSum([6, 9, 18, 21]);
      const y1b = quarterSum([1, 4, 13, 16]);
      const y2b = quarterSum([7, 10, 19, 22]);
      const z1b = quarterSum([2, 5, 14, 17]);
      const z2b = quarterSum([8, 11, 20, 23]);
  
      v1 = [x1b, y1b, z1b];
      v2 = [x2b, y2b, z2b];
      const dvb = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
      w = norm3(dvb);
  
      // 3) definisce vers => l => S
      const x1c = quarterSum([0, 3, 6, 9]);
      const x2c = quarterSum([12,15,18,21]);
      const y1c = quarterSum([1, 4, 7, 10]);
      const y2c = quarterSum([13,16,19,22]);
      const z1c = quarterSum([2, 5, 8, 11]);
      const z2c = quarterSum([14,17,20,23]);
  
      v1 = [x1c, y1c, z1c];
      v2 = [x2c, y2c, z2c];
      const dvc = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
      const dvcNorm = norm3(dvc);
      vers = dvc.map(val => val/dvcNorm);
      l = dvcNorm;
      S = w * t;
    }
  
    // Restituiamo [l, w, t, S, vers]
    return [l, w, t, S, vers];
  }
  
  interface Region {
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
  }
  
  export interface Induttanze extends InduttanzeBase {
    versori: number[][];
    coordinate: number[][][];
    t: number[];
    S: number[];
    l: number[];
    w: number[];
    indici: {
      x: number[];
      y: number[];
      z: number[];
    };
    dir_curr: number[];
    epsr: number[];
    celle_ind_per_oggetto: number[][];
    estremi_lati_oggetti: number[][];
    facce_superfici: number[];
    facce_normale: number[][];
    facce_dir_curr_sup: number[];
    facce_centri: number[][];
    facce_w: number[];
    indici_Nd?: number[];
    centri: number[][];
    estremi_lati: number[][];
    Cp?: number[];
    R?: number[];
    Nc?: number;  
    Nd?: number;  
    Nb?: number;  
    Sc?: number[]; 
    Sd?: number[]; 
    indici_celle_indx?: number[];
    indici_celle_indy?: number[];
    indici_celle_indz?: number[];
  }
  
  export interface Nodi {
    estremi_celle: number[][];
    centri: number[][];
    l: number[];
    w: number[];
    S_non_rid: number[];
    sigma: number[];
    epsr: number[];
    mur: number[];
    num_nodi_interni: number;
    nodi_i: number[][];
    nodi_interni: number[];
    potenziali: number[];
    centri_non_rid: number[][];
    normale: number[][];
    nodi_esterni_coordinate: number[][];
    nodi_interni_coordinate: number[][];
    num_nodi_esterni: number;
    Rv:math.Matrix;
    centri_sup_non_rid: number[][];
    InternalNodesCommon2FourObjects: number[][];
    superfici: number[];
    nodi_esterni: number[];
    nodi_new_nodi_interni_coordinate?: number[][]; // Aggiunto per compatibilità con EliminaPatchesInterniOutput,
    materials: number[];
  }
  
  
  
  export function discretizza_thermal_rev(Regioni: Region, materials: MaterialMesher[]): {
    induttanze: Induttanze;
    nodi: Nodi;
    A: math.Matrix;
  } {
    console.log("Start discretization");
    const weights_five = [
      0.236926885, 0.4786286705, 0.5688888889, 0.4786286705, 0.236926885,
    ];
    const roots_five = [
      0.9061798459, 0.5384693101, 0.0, -0.5384693101, -0.9061798459,
    ];
  
    //Inizializzo l'oggetto Regioni
    Regioni.vertici = [];
    for (let k = 0; k < Regioni.coordinate.length; k++) {
      Regioni.vertici[k]=[];
      for (let i = 0; i < 8; i++) {
        Regioni.vertici[k][i] = Regioni.coordinate[k].slice(i * 3, (i + 1) * 3);
      }
    }
  
    Regioni.spigoli = [];
    for (let k = 0; k < Regioni.coordinate.length; k++) {
      Regioni.spigoli[k] = [];
      // p1-p2
      Regioni.spigoli[k][0] = [Regioni.coordinate[k].slice(0, 3), Regioni.coordinate[k].slice(3, 6)];
      // p3-p4
      Regioni.spigoli[k][1] = [Regioni.coordinate[k].slice(6, 9), Regioni.coordinate[k].slice(9, 12)];
      // p1-p3
      Regioni.spigoli[k][2] = [Regioni.coordinate[k].slice(0, 3), Regioni.coordinate[k].slice(6, 9)];
      // p2-p4
      Regioni.spigoli[k][3] = [Regioni.coordinate[k].slice(3, 6), Regioni.coordinate[k].slice(9, 12)];
      // p5-p6
      Regioni.spigoli[k][4] = [Regioni.coordinate[k].slice(12, 15), Regioni.coordinate[k].slice(15, 18)];
      // p7-p8
      Regioni.spigoli[k][5] = [Regioni.coordinate[k].slice(18, 21), Regioni.coordinate[k].slice(21, 24)];
      // p5-p7
      Regioni.spigoli[k][6] = [Regioni.coordinate[k].slice(12, 15), Regioni.coordinate[k].slice(18, 21)];
      // p6-p8
      Regioni.spigoli[k][7] = [Regioni.coordinate[k].slice(15, 18), Regioni.coordinate[k].slice(21, 24)];
      // p1-p5
      Regioni.spigoli[k][8] = [Regioni.coordinate[k].slice(0, 3), Regioni.coordinate[k].slice(12, 15)];
      // p2-p6
      Regioni.spigoli[k][9] = [Regioni.coordinate[k].slice(3, 6), Regioni.coordinate[k].slice(15, 18)];
      // p3-p7
      Regioni.spigoli[k][10] = [Regioni.coordinate[k].slice(6, 9), Regioni.coordinate[k].slice(18, 21)];
      // p4-p8
      Regioni.spigoli[k][11] = [Regioni.coordinate[k].slice(9, 12), Regioni.coordinate[k].slice(21, 24)];
    }
    
    let celle_mag: number[][] = [];
    let barra: number[][] = [];
    let nodi: Nodi = {
      estremi_celle: [],
      centri: [],
      l: [],
      w: [],
      S_non_rid: [],
      sigma: [],
      epsr: [],
      mur: [],
      num_nodi_interni: 0,
      nodi_i: [],
      nodi_interni: [],
      potenziali: [],
      centri_non_rid: [],
      normale: [],
      nodi_esterni_coordinate: [],
      nodi_interni_coordinate: [],
      num_nodi_esterni: 0,
      Rv: math.sparse([]),
      centri_sup_non_rid: [],
      InternalNodesCommon2FourObjects: [],
      superfici: [],
      nodi_esterni: [],
      materials: [],
    };
    let induttanze: Induttanze = {
      estremi_celle: [],
      versori: [], 
      coordinate: [], 
      t: [], 
      S: [], 
      l: [],
      w: [],
      indici: { x: [], y: [], z: [] },
      dir_curr: [],
      epsr: [],
      sigma: [],
      celle_ind_per_oggetto: [],
      estremi_lati_oggetti: [],
      facce_estremi_celle: [],
      facce_superfici: [],
      facce_normale: [],
      facce_dir_curr_sup: [],
      facce_centri: [],
      facce_w: [],
      facce_indici_associazione: [],
      celle_superficie_w: [],
      celle_superficie_l: [],
      celle_superficie_estremi_celle: [],
      centri: [],
      estremi_lati: [],
      Zs_part: [] 
    };
    let celle_sup: number[][] = [];
    let vers_m: number[][] = [];
    let norm_m: number[][] = [];
    let NodiRed: number[][] = [];
    
    let l_m: number[] = [];
    let width_m: number[] = [];
    let sup_celle_sup: number[] = [];
    let sigma_c: number[] = [];
    let mu_m: number[] = [];
    let mu_m_eq: number[] = [];
    let objects: number[] = [];
    let lati_m: number[][][] = [];
    let celle_ind_sup: number[][] = [];
    let Sup_sup: number[] = [];
    let normale_sup: number[][] = [];
    let dir_curr_sup: number[] = [];
    let rc_sup: number[][] = [];
    let w_sup: number[] = [];
    let indici_sup: { x: number[]; y: number[]; z: number[] } = {
      x: [],
      y: [],
      z: [],
    };
    let sup_celle_mag: number[] = [];
    let discrUnif = 0;

  let lati1: number[][]=[];
  let lati2: number[][]=[];
  
    for (let k = 0; k < Regioni.coordinate.length; k++) {
      const {
        barra: barra_k,
        celle_cap: celle_cap_k,
        celle_ind: celle_ind_k,
        celle_mag: celle_sup_k,
        lati: lati_k,
        lati_m: lati_m_k,
        vers: vers_k,
        Nodi: Nodi_k,
        spessore_i: spessore_i_k,
        Sup_c: sup_celle_cap_k,
        Sup_i: sup_celle_ind_k,
        Sup_m: sup_celle_sup_k,
        l_i: l_i_k,
        l_c: l_c_k,
        l_m: l_m_k,
        width_i: width_i_k,
        width_c: width_c_k,
        width_m: width_m_k,
        dir_curr: dir_curr_k,
        vers_m: vers_m_k,
        norm_m: norm_m_k,
        celle_ind_sup: celle_ind_sup_k,
        Sup_sup: Sup_sup_k,
        indici_sup: indici_sup_k,
        normale_sup: normale_sup_k,
        dir_curr_sup: dir_curr_sup_k,
        rc_sup: rc_sup_k,
        w_sup: w_sup_k,
        NodiRed: NodiRed_k,
      } = discr_psp_nono_3D_vol_sup_save(
        Regioni.coordinate[k],
        Regioni.Nx[k],
        Regioni.Ny[k],
        Regioni.Nz[k],
        discrUnif !== 0,
        weights_five,
        roots_five
      );
  
      if (k === 0) {
        induttanze.celle_ind_per_oggetto[k] = Array.from(
          { length: lati_k[0].length },
          (_, i) => i
        );
      } else {
        induttanze.celle_ind_per_oggetto[k] = Array.from(
          { length: lati_k[0].length },
          (_, i) => induttanze.celle_ind_per_oggetto[k - 1][induttanze.celle_ind_per_oggetto[k - 1].length - 1] + 1 + i
        );
      }
  
      const Nodi_interni = genera_nodi_interni_rev(
        Regioni.coordinate[k],
        Regioni.Nx[k],
        Regioni.Ny[k],
        Regioni.Nz[k]
      );
      

      
      nodi.num_nodi_interni += Nodi_interni.length;
      nodi.nodi_i = [...nodi.nodi_i, ...Nodi_interni];
  
      const Nodi_interni_m = genera_nodi_interni_merged_non_ort(
        Regioni,
        Nodi_k,
        k,
        nodi.nodi_i
      );
      

  
      for (let conta = 0; conta < celle_ind_k.length; conta++) {
        // Destruttura l'output di creaVersore, gestendo i singoli valori
        const [l_i_k_conta, width_i_k_conta, spessore_i_k_conta, sup_celle_ind_k_conta, vers_k_conta] = creaVersore(celle_ind_k[conta], dir_curr_k[conta]);
      
        // Usa round_ud_singolo per arrotondare i singoli numeri
        l_i_k[conta] = round_ud_singolo(l_i_k_conta, 12);
        width_i_k[conta] = round_ud_singolo(width_i_k_conta, 12);
        spessore_i_k[conta] = round_ud_singolo(spessore_i_k_conta, 12);
        sup_celle_ind_k[conta] = round_ud_singolo(sup_celle_ind_k_conta, 12);
        
        // Per vers_k_conta, che è un array, usa la round_ud definita nel file round_ud.ts
        vers_k[conta] = round_ud(vers_k_conta, 12);
      }
      nodi.num_nodi_interni += Nodi_interni_m.length;
      nodi.nodi_i = [...nodi.nodi_i, ...Nodi_interni_m];
      barra = [...barra, ...barra_k];
      celle_mag = [...celle_mag, ...celle_ind_k];
      nodi.estremi_celle = [...nodi.estremi_celle, ...celle_cap_k];
      induttanze.estremi_celle = [...induttanze.estremi_celle, ...celle_ind_k];
      celle_sup = [...celle_sup, ...celle_sup_k];
      const offset = NodiRed.length;
      nodi.centri = [...nodi.centri, ...Nodi_k];
      NodiRed = [...NodiRed, ...NodiRed_k];
      induttanze.estremi_lati_oggetti = genera_estremi_lati_per_oggetto_rev(
        induttanze.estremi_lati_oggetti,
        NodiRed_k,
        nodi.nodi_i,
        lati_k[0],
        lati_k[1],
        offset
      );


    
  

     // Aggiungi i lati di lati_k[0] e lati_k[1] a lati1 e lati2, rispettivamente
  for (let i = 0; i < lati_k[0].length; i++) {
    lati1.push(lati_k[0][i]);
  }
  for (let i = 0; i < lati_k[1].length; i++) {
    lati2.push(lati_k[1][i]);
  }

  

      induttanze.t = [...induttanze.t, ...spessore_i_k];
      induttanze.S = [...induttanze.S, ...sup_celle_ind_k];
      sup_celle_mag = [...sup_celle_mag, ...sup_celle_ind_k];
      induttanze.l = [...induttanze.l, ...l_i_k];
      nodi.l = [...nodi.l, ...l_c_k];
      l_m = [...l_m, ...l_m_k];
      induttanze.w = [...induttanze.w, ...width_i_k];
      nodi.w = [...nodi.w, ...width_c_k];
      width_m = [...width_m, ...width_m_k];
      induttanze.versori = [...induttanze.versori, ...vers_k];
      vers_m = [...vers_m, ...vers_m_k];
      norm_m = [...norm_m, ...norm_m_k];
      lati_m.push(...lati_m_k);
      nodi.S_non_rid = [...nodi.S_non_rid, ...sup_celle_cap_k];
      sup_celle_sup = [...sup_celle_sup, ...sup_celle_sup_k];
      induttanze.dir_curr = [...induttanze.dir_curr, ...dir_curr_k];
      induttanze.epsr = [
        ...induttanze.epsr,
        ...Array(celle_ind_k.length).fill(Regioni.epsr[k]),
      ];
      induttanze.sigma = [
        ...induttanze.sigma,
        ...Array(celle_ind_k.length).fill(Regioni.cond[k]),
      ];
      nodi.sigma = [...nodi.sigma, ...Array(celle_cap_k.length).fill(Regioni.cond[k])];
      nodi.epsr = [...nodi.epsr, ...Array(celle_cap_k.length).fill(Regioni.epsr[k])];
      const index = Regioni.materiale[k]; 
      const materialName = materials[index].name;
      nodi.materials = [...nodi.materials, ...Array(celle_cap_k.length).fill(materialName)];
      sigma_c = [...sigma_c, ...Array(celle_cap_k.length).fill(Regioni.cond[k])];
      nodi.mur = [...nodi.mur, ...Array(celle_cap_k.length).fill(Regioni.mur[k])];
      mu_m_eq = [...mu_m_eq, ...Array(celle_sup_k.length).fill(Regioni.mu[k])]; 
      mu_m = [...mu_m, ...Array(celle_ind_k.length).fill(Regioni.mu[k])];
      objects = [...objects, ...Array(celle_cap_k.length).fill(k + 1)];
  
      // Superfici celle induttive
      celle_ind_sup = [...celle_ind_sup, ...celle_ind_sup_k];
      Sup_sup = [...Sup_sup, ...Sup_sup_k];
      normale_sup = [...normale_sup, ...normale_sup_k];
      dir_curr_sup = [...dir_curr_sup, ...dir_curr_sup_k];
      rc_sup = [...rc_sup, ...rc_sup_k];
      w_sup = [...w_sup, ...w_sup_k];
      indici_sup.x = [...indici_sup.x, ...indici_sup_k.x];
      indici_sup.y = [...indici_sup.y, ...indici_sup_k.y];
      indici_sup.z = [...indici_sup.z, ...indici_sup_k.z];
    }
    // facce volumi induttivi
    induttanze.facce_estremi_celle = celle_ind_sup;
    induttanze.facce_superfici = Sup_sup;
    induttanze.facce_normale = normale_sup;
    induttanze.facce_dir_curr_sup = dir_curr_sup;
    induttanze.facce_centri = rc_sup;
    induttanze.facce_w = w_sup;
    const offsetNodiInt = NodiRed.length;
    
    
    for(let i=0; i<induttanze.estremi_lati_oggetti.length; i++){
      if (induttanze.estremi_lati_oggetti[i][0] < 0) {
          induttanze.estremi_lati_oggetti[i][0] =
            Math.abs(induttanze.estremi_lati_oggetti[i][0]) + offsetNodiInt;
        }
        if (induttanze.estremi_lati_oggetti[i][1] < 0) {
          induttanze.estremi_lati_oggetti[i][1] =
            Math.abs(induttanze.estremi_lati_oggetti[i][1]) + offsetNodiInt;
        }
    }
    
    
    induttanze.coordinate = [lati1, lati2];

    induttanze.indici.x = findIndices(induttanze.dir_curr, 1);
    induttanze.indici.y = findIndices(induttanze.dir_curr, 2);
    induttanze.indici.z = findIndices(induttanze.dir_curr, 3);
    induttanze.centri = [];
    for (let i = 0; i < induttanze.estremi_celle.length; i++) {
      let sumX = 0;
      let sumY = 0;
      let sumZ = 0;
      for (let j = 0; j < 24; j += 3) {
        sumX += induttanze.estremi_celle[i][j];
        sumY += induttanze.estremi_celle[i][j + 1];
        sumZ += induttanze.estremi_celle[i][j + 2];
      }
      induttanze.centri.push([sumX / 8, sumY / 8, sumZ / 8]);
    }
  
    nodi.nodi_interni = Array.from(
      { length: nodi.num_nodi_interni },
      (_, i) => nodi.centri.length - nodi.num_nodi_interni + i
    ); 
    
    nodi.l = nodi.l.map(val => val); 
    nodi.potenziali = [];
    nodi.centri_non_rid = nodi.centri;
    nodi.normale = [];
    for(let i=0; i<nodi.estremi_celle.length; i++){
      const p1 = nodi.estremi_celle[i].slice(0, 3);
      const p2 = nodi.estremi_celle[i].slice(3, 6);
      const p3 = nodi.estremi_celle[i].slice(6, 9);
  
      const v1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
      const v2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];
  
      const crossProduct = [
          v1[1] * v2[2] - v1[2] * v2[1],
          v1[2] * v2[0] - v1[0] * v2[2],
          v1[0] * v2[1] - v1[1] * v2[0]
      ];
  
      const norm = Math.sqrt(crossProduct[0] ** 2 + crossProduct[1] ** 2 + crossProduct[2] ** 2);
      nodi.normale.push([crossProduct[0] / norm, crossProduct[1] / norm, crossProduct[2] / norm]);
    }
  
    if (nodi.num_nodi_interni === 0) {
      nodi.nodi_i = [];
    }
  
    const {
      nodi_new_centri,
      nodi_new_centri_non_rid,
      nodi_new_estremi_celle,
      nodi_new_w,
      nodi_new_l,
      nodi_new_S_non_rid,
      nodi_new_epsr,
      nodi_new_sigma,
      nodi_new_mur,
      nodi_new_nodi_interni_coordinate,
      nodi_new_num_nodi_interni,
      nodi_new_nodi_esterni,
      nodi_new_normale,
      nodi_new_materials,
    } = elimina_patches_interni_thermal_save(
      nodi.centri,
      nodi.centri_non_rid,
      nodi.estremi_celle,
      nodi.epsr,
      nodi.mur,
      nodi.sigma,
      nodi.nodi_i,
      nodi.w,
      nodi.l,
      nodi.S_non_rid,
      nodi.num_nodi_interni,
      nodi.normale,
      [],
      nodi.materials
    );
  
    nodi.centri = nodi_new_centri;
    nodi.centri_non_rid = nodi_new_centri_non_rid;
    nodi.estremi_celle = nodi_new_estremi_celle;
    nodi.w = nodi_new_w;
    nodi.l = nodi_new_l;
    nodi.S_non_rid = nodi_new_S_non_rid;
    nodi.epsr = nodi_new_epsr;
    nodi.sigma = nodi_new_sigma;
    nodi.mur = nodi_new_mur;
    nodi.nodi_interni_coordinate = nodi_new_nodi_interni_coordinate;
    nodi.num_nodi_interni = nodi_new_num_nodi_interni;
    nodi.nodi_esterni = nodi_new_nodi_esterni;
    nodi.normale = nodi_new_normale;
    nodi.materials = nodi_new_materials;
  
    if (nodi.num_nodi_interni === 0) {
      nodi.nodi_i = [];
    }
  
    const InternalNodesCommon2FourObjects =
      FindInternalNodesCommon2FourObjects_rev(nodi.centri, NodiRed);
    nodi.centri_sup_non_rid = nodi.centri;
    nodi.centri = [...nodi.centri, ...InternalNodesCommon2FourObjects];
    nodi.InternalNodesCommon2FourObjects = InternalNodesCommon2FourObjects;
    nodi.nodi_esterni_coordinate = [
      ...NodiRed,
      ...nodi.InternalNodesCommon2FourObjects,
    ];
    nodi.nodi_interni_coordinate = [
      ...nodi.nodi_interni_coordinate,
      ...nodi.InternalNodesCommon2FourObjects,
    ];
    nodi.num_nodi_esterni = nodi.nodi_esterni_coordinate.length;
    nodi.num_nodi_interni =
      nodi.num_nodi_interni + InternalNodesCommon2FourObjects.length;
      
      const {
          estremi_lati,
          Rv,
          nodi_centri,
          A
        } = matrice_incidenza_rev(induttanze.coordinate, nodi.centri, nodi.nodi_interni_coordinate);

       

        induttanze.estremi_lati = estremi_lati;
        nodi.Rv = Rv;
        nodi.centri = nodi_centri;
        
        const indexes = findIndices(induttanze.epsr, (val: number) => val > 1);
        induttanze.indici_Nd = indexes;
        nodi.superfici = nodi.l.map((val, index) => val * nodi.w[index]);
        induttanze.celle_superficie_w = width_m;
        induttanze.celle_superficie_l = l_m;
        induttanze.celle_superficie_estremi_celle = celle_sup;
        induttanze.facce_indici_associazione = [];
        for (let cont = 0; cont < A.size()[0]; cont++) { 
          induttanze.facce_indici_associazione[cont] = Array.from(
            { length: 6 },
            (_, i) => cont * 6 + i + 1
          );
        }
        induttanze = genera_dati_Z_sup(induttanze);


        

        console.log("End discretization");

       
        return { induttanze, nodi, A };
      }
  
  // Funzioni di supporto
  function findIndices(arr: number[], condition: number | ((val: number) => boolean)): number[] {
    const indices: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (typeof condition === 'number' && arr[i] === condition || 
          typeof condition === 'function' && condition(arr[i])) {
        indices.push(i);
      }
    }
    return indices;
  }

  function round_ud_singolo(num: number, digits: number): number {
    return Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits);
  }