import { surfa_old } from './surfa_old'; 
import { mean_length_P } from './mean_length_P'; 

/**
 * 
 * @param r_nodi_barra 
 * @param weights_five 
 * @param roots_five   
 * @returns Un oggetto con:
 *   - celle_cap
 *   - Nodi
 *   - Sup_c, l_c, width_c: 4 elementi ciascuno
 */
export function genera_celle_capacitive_new_sup(
  r_nodi_barra: number[][],
  weights_five: number[],
  roots_five: number[]
): {
  celle_cap: number[][]; 
  Nodi: number[][];      
  Sup_c: number[];       
  l_c: number[];         
  width_c: number[];     
}
{
  // r1, r2, r3, r4 => i 4 vertici
  const r1: number[] = r_nodi_barra[0];
  const r2: number[] = r_nodi_barra[1];
  const r3: number[] = r_nodi_barra[2];
  const r4: number[] = r_nodi_barra[3];

  // r5 = 0.5*(r1 + r2)
  const r5: number[] = r1.map((val, i) => 0.5 * (val + r2[i]));
  // r6 = 0.5*(r3 + r4)
  const r6: number[] = r3.map((val, i) => 0.5 * (val + r4[i]));
  // r7 = 0.5*(r1 + r3)
  const r7: number[] = r1.map((val, i) => 0.5 * (val + r3[i]));
  // r8 = 0.5*(r2 + r4)
  const r8: number[] = r2.map((val, i) => 0.5 * (val + r4[i]));
  // rc = 0.25*(r1 + r2 + r3 + r4)
  const rc: number[] = r1.map((val, i) => 0.25 * (val + r2[i] + r3[i] + r4[i]));

  // Inizializziamo gli array di output
  const celle_cap: number[][] = Array.from({ length: 4 }, () => Array(12).fill(0));
  const Nodi: number[][]      = Array.from({ length: 4 }, () => Array(3).fill(0));
  const Sup_c: number[]       = Array(4).fill(0);
  const l_c: number[]         = Array(4).fill(0);
  const width_c: number[]     = Array(4).fill(0);

  // ------- Cella capacitiva n°1 -------
  // Indice 0 in TypeScript (anziché r=1 in MATLAB)
  celle_cap[0] = [...r1, ...r5, ...r7, ...rc];  // 4 vertici => 12 numeri
  Nodi[0]      = [...r1];                      // r1 (3 numeri)
  Sup_c[0]     = surfa_old(celle_cap[0], weights_five, roots_five);
  l_c[0]       = Math.abs(mean_length_P(celle_cap[0], 1));
  width_c[0]   = Math.abs(mean_length_P(celle_cap[0], 2));

  // ------- Cella capacitiva n°2 -------
  celle_cap[1] = [...r5, ...r2, ...rc, ...r8];
  Nodi[1]      = [...r2];
  Sup_c[1]     = surfa_old(celle_cap[1], weights_five, roots_five);
  l_c[1]       = Math.abs(mean_length_P(celle_cap[1], 1));
  width_c[1]   = Math.abs(mean_length_P(celle_cap[1], 2));

  // ------- Cella capacitiva n°3 -------
  celle_cap[2] = [...r7, ...rc, ...r3, ...r6];
  Nodi[2]      = [...r3];
  Sup_c[2]     = surfa_old(celle_cap[2], weights_five, roots_five);
  l_c[2]       = Math.abs(mean_length_P(celle_cap[2], 1));
  width_c[2]   = Math.abs(mean_length_P(celle_cap[2], 2));

  // ------- Cella capacitiva n°4 -------
  celle_cap[3] = [...rc, ...r8, ...r6, ...r4];
  Nodi[3]      = [...r4];
  Sup_c[3]     = surfa_old(celle_cap[3], weights_five, roots_five);
  l_c[3]       = Math.abs(mean_length_P(celle_cap[3], 1));
  width_c[3]   = Math.abs(mean_length_P(celle_cap[3], 2));

  // Ritorna i 5 array di output 
  return {
    celle_cap,  
    Nodi,       
    Sup_c,      
    l_c,       
    width_c,    
  };
}
