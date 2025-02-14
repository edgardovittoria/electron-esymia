import { verifica_patches_coincidenti } from './verifica_patches_coincidenti';


/**
 * Struttura dati di output, che raccoglie gli n output 
 */
export interface EliminaPatchesInterniOutput {
    nodi_new_centri: number[][];
    nodi_new_centri_non_rid: number[][];
    nodi_new_estremi_celle: number[][];
    nodi_new_w: number[];
    nodi_new_l: number[];
    nodi_new_S_non_rid: number[];
    nodi_new_epsr: number[];
    nodi_new_sigma: number[];
    nodi_new_mur: number[];
    nodi_new_nodi_interni_coordinate: number[][];
    nodi_new_num_nodi_interni: number;
    nodi_new_nodi_esterni: number[];   
    nodi_new_normale: number[][];
    nodi_new_materials: number[];
    
  }
  
  /**
   * 
   * @param nodi_centri        
   * @param nodi_centri_non_rid 
   * @param nodi_estremi_celle 
   * @param nodi_epsr  
   * @param nodi_mur   
   * @param nodi_sigma 
   * @param nodi_nodi_i  
   * @param nodi_w  
   * @param nodi_l  [
   * @param nodi_S_non_rid 
   * @param nodi_num_nodi_interni numero interi di nodi interni
   * @param nodi_normale 
   * @param Vettaux matrice di input che contiene info su da_scartare, interfacce, ecc.
   * 
   * @returns EliminaPatchesInterniOutput con i campi "nodi_new_centri", "nodi_new_estremi_celle", ...
   */
  export function elimina_patches_interni_thermal_save(
    nodi_centri: number[][],
    nodi_centri_non_rid: number[][],
    nodi_estremi_celle: number[][],
    nodi_epsr: number[],
    nodi_mur: number[],
    nodi_sigma: number[],
    nodi_nodi_i: number[][],
    nodi_w: number[],
    nodi_l: number[],
    nodi_S_non_rid: number[],
    nodi_num_nodi_interni: number,
    nodi_normale: number[][],
    Vettaux: number[][],
    materials: number[]
  ): EliminaPatchesInterniOutput {
    const ncelle_cap = nodi_estremi_celle.length;
    const ncelle_cap_non_rid = ncelle_cap;
  
    // Inizializza le variabili come array vuoti
    let da_scartare_sup_term: number[] = [];
    let interfacce_cond_diel_mag: number[][] = [];
    let da_scartare: number[] = []; // Suppongo che da_scartare sia 1D in base al codice MATLAB
  
    // Gestisci il caso in cui Vettaux non è vuoto
    if (Vettaux.length > 0) {
        const row0 = Vettaux[0];
        const lenV = row0.length;
        da_scartare_sup_term = row0.slice(0, lenV - 1);
  
        const subRows = Vettaux.slice(0, Vettaux.length - 1);
        interfacce_cond_diel_mag = subRows;
  
        da_scartare = [];
        for (let r = 0; r < Vettaux.length; r++) {
            for (let c = 0; c < Vettaux[r].length - 1; c++) {
                da_scartare.push(Vettaux[r][c]);
            }
        }
    }
  
    if (nodi_num_nodi_interni === 0) {
      nodi_nodi_i = nodi_nodi_i.slice(0, nodi_nodi_i.length - 1);
    }
  
    for (let k = 0; k < ncelle_cap; k++) {
      const n_nodi_coinc: number[] = [];
      for (let i = 0; i < nodi_centri_non_rid.length; i++) {
        const dx = Math.abs(nodi_centri_non_rid[i][0] - nodi_centri[k][0]);
        const dy = Math.abs(nodi_centri_non_rid[i][1] - nodi_centri[k][1]);
        const dz = Math.abs(nodi_centri_non_rid[i][2] - nodi_centri[k][2]);
        if (dx <= 1e-12 && dy <= 1e-12 && dz <= 1e-12) {
          n_nodi_coinc.push(i + 1);
        }
      }
  
      if (n_nodi_coinc.length > 0) {
        const lN = n_nodi_coinc.length;
        for (let cont1 = 0; cont1 < lN; cont1++) {
          const n = n_nodi_coinc[cont1];
          const aux = setdiff(n_nodi_coinc.slice().sort((a, b) => a - b), [n]);
          const lM = aux.length;
  
          for (let cont2 = 0; cont2 < lM; cont2++) {
            const m = aux[cont2];
  
            const rowM = nodi_estremi_celle[m - 1];
            const rowN = nodi_estremi_celle[n - 1];
            const twoPatches = [rowM, rowN];
  
            if (verifica_patches_coincidenti(twoPatches)) {
              // Controlla se da_scartare_sup_term non è vuoto prima di usarlo
              if (da_scartare_sup_term.length > 0 && !da_scartare_sup_term.includes(m)) {
                da_scartare_sup_term.push(m);
              }
              if (da_scartare_sup_term.length > 0 && !da_scartare_sup_term.includes(n)) {
                da_scartare_sup_term.push(n);
              }
  
              if (nodi_epsr[m - 1] === nodi_epsr[n - 1] && nodi_mur[m - 1] === nodi_mur[n - 1]) {
                // Controlla se da_scartare non è vuoto prima di usarlo
                if (da_scartare.length > 0) {
                  da_scartare = unionOfArrays(da_scartare, setdiff([m, n].sort((a, b) => a - b), da_scartare));
                } else {
                  da_scartare = setdiff([m, n].sort((a, b) => a - b), da_scartare);
                }
              } else {
                if (interfacce_cond_diel_mag.length === 0) {
                  interfacce_cond_diel_mag.push([m, n]);
                } else {
                  const app1 = setdiff3([m, n], interfacce_cond_diel_mag);
                  const app2 = setdiff3([n, m], interfacce_cond_diel_mag);
                  if (app1 === 1 && app2 === 1) {
                    interfacce_cond_diel_mag.push([m, n]);
                  }
                }
              }
            }
          }
        }
      }
    }
  
    // Controlla se interfacce_cond_diel_mag non è vuoto prima di usarlo
    if (interfacce_cond_diel_mag.length > 0) {
      const col1 = interfacce_cond_diel_mag.map(r => r[0]);
      da_scartare = unionOfArrays(da_scartare, col1);
    }
  
    //Il resto della funzione rimane invariato, perché usa solo da_conservare, che è calcolato
    //a partire da da_scartare, e da_scartare, a sua volta, è inizializzato come array vuoto,
    //proprio come in MATLAB quando Vettaux = 1.
    const allIndices: number[] = [];
      for (let i=1; i<=ncelle_cap_non_rid; i++){
        allIndices.push(i);
      }
      const da_conservare = setdiff( allIndices, da_scartare );
    
      const nodi_new_centri: number[][] = [];
      for (let i of da_conservare) {
        nodi_new_centri.push(nodi_centri_non_rid[i-1]); 
      }
      for (let row of nodi_nodi_i) {
        nodi_new_centri.push(row);
      }
    
      const nodi_new_centri_non_rid: number[][] = [];
      for (let i of da_conservare) {
        nodi_new_centri_non_rid.push(nodi_centri_non_rid[i-1]);
      }
      for (let row of nodi_nodi_i) {
        nodi_new_centri_non_rid.push(row);
      }
    
      let nodi_new_estremi_celle: number[][] = [];
      for (let i of da_conservare) {
        nodi_new_estremi_celle.push(nodi_estremi_celle[i-1]);
      }
    
      let nodi_new_w: number[] = [];
      let nodi_new_l: number[] = [];
      let nodi_new_normale: number[][] = [];
      let nodi_new_S_non_rid: number[] = [];
      let nodi_new_sigma: number[] = [];
      let nodi_new_mur: number[]   = [];
      let nodi_new_epsr: number[]  = [];
      let nodi_new_materials: number[]  = [];
    
      for (let i of da_conservare) {
        nodi_new_w.push( nodi_w[i-1] );
        nodi_new_l.push( nodi_l[i-1] );
        nodi_new_S_non_rid.push( nodi_S_non_rid[i-1] );
        nodi_new_sigma.push( nodi_sigma[i-1] );
        nodi_new_mur.push(   nodi_mur[i-1] );
        nodi_new_epsr.push(  nodi_epsr[i-1] );
        nodi_new_normale.push( nodi_normale[i-1] );
        nodi_new_materials.push( materials[i-1] );
      }
    
      const nodi_new_nodi_interni_coordinate = nodi_nodi_i;
      const nodi_new_num_nodi_interni = nodi_num_nodi_interni;
    
      const nodi_new_nodi_esterni: number[] = [];
      for (let i = 1; i <= da_conservare.length; i++) {
        nodi_new_nodi_esterni.push(i);
      }
    
      return {
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
      };
    }
    
    
    function setdiff3(m: number[], n: number[][]): number {
      let app = 1;
      for (let i=0; i<n.length; i++) {
        if (m.length===n[i].length && m.every((val,idx)=> val===n[i][idx])) {
          app=0;
          break;
        }
      }
      return app;
    }
    
    
    function setdiff(a: number[], b: number[]): number[] {
      const out = a.filter(x => !b.includes(x));
      return uniqueNumberArray(out).sort((x,y)=> x-y);
    }
    
    function unionOfArrays(a: number[], b: number[]): number[] {
      const merged = [...a, ...b];
      return uniqueNumberArray(merged).sort((x,y)=> x-y);
    }
    
    function uniqueNumberArray(arr: number[]): number[] {
      const set_ = new Set(arr);
      return Array.from(set_);
    }
  