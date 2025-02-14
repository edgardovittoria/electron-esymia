import { Induttanze } from './discretizza_thermal_rev';

/**
 * Modifica la struttura `induttanze` passata  e restituisce lo stesso oggetto aggiornato.
 */
export function genera_dati_Z_sup(induttanze: Induttanze): Induttanze {
  const associazione = induttanze.facce_indici_associazione;
  const nFacce = induttanze.facce_estremi_celle.length;
  let tutte_le_facce = Array.from({ length: nFacce }, () => [0, 0, 0, 0, 0, 0]);

  const X2 = induttanze.facce_estremi_celle.map(row => [row[0], row[3], row[6], row[9]]);
  const Y2 = induttanze.facce_estremi_celle.map(row => [row[1], row[4], row[7], row[10]]);
  const Z2 = induttanze.facce_estremi_celle.map(row => [row[2], row[5], row[8], row[11]]);

  for (let cont = 0; cont < nFacce; cont++) {
    const xVals = X2[cont];
    const yVals = Y2[cont];
    const zVals = Z2[cont];
    tutte_le_facce[cont] = [
      Math.min(...xVals),
      Math.max(...xVals),
      Math.min(...yVals),
      Math.max(...yVals),
      Math.min(...zVals),
      Math.max(...zVals),
    ];
  }

  const celle_sup = induttanze.celle_superficie_estremi_celle;
  const X = celle_sup.map(row => [row[0], row[3], row[6], row[9]]);
  const Y = celle_sup.map(row => [row[1], row[4], row[7], row[10]]);
  const Z = celle_sup.map(row => [row[2], row[5], row[8], row[11]]);

  const N = celle_sup.length;
  const M = induttanze.estremi_celle.length;

  let indici_asso_celle_sup = Array.from({ length: M }, () => [0, 0]);

  for (let cont = 0; cont < N; cont++) {
    const xVals = X[cont];
    const yVals = Y[cont];
    const zVals = Z[cont];

    const cella = [
      Math.min(...xVals),
      Math.max(...xVals),
      Math.min(...yVals),
      Math.max(...yVals),
      Math.min(...zVals),
      Math.max(...zVals)
    ];

    const lato: number[] = [];
    for (let i = 0; i < nFacce; i++) {
      let diffSum = 0;
      for (let k = 0; k < 6; k++) {
        diffSum += Math.abs(cella[k] - tutte_le_facce[i][k]);
      }
      if (diffSum / 12 < 1e-8) {
        lato.push(i + 1); 
      }
    }

    const primoVal = lato[0];
    let r = -1, c = -1;
    outerFind: for (let rr = 0; rr < associazione.length; rr++) {
      for (let cc = 0; cc < associazione[rr].length; cc++) {
        if (Math.abs(associazione[rr][cc] - primoVal) < 1e-8) {
          r = rr;
          c = cc;
          break outerFind;
        }
      }
    }

    if (r >= 0) {
      if (Math.abs(indici_asso_celle_sup[r][0]) > 1e-8) {
        indici_asso_celle_sup[r][1] = cont + 1; 
      } else {
        indici_asso_celle_sup[r][0] = cont + 1; 
      }
    }
  
  }

  const Zs_part = new Array<number>(M).fill(0);
  induttanze.Zs_part = Zs_part;

  for (let cont = 0; cont < M; cont++) {
    const sig = Math.abs(induttanze.sigma[cont]) > 1e-8;
    const idxSup1 = indici_asso_celle_sup[cont][0];   // valore 1-based 
    if (sig && idxSup1 > 1e-8) {
      const idx1 = idxSup1 - 1;                      // ora diventa 0-based 
      const l = induttanze.celle_superficie_l[idx1];
      const w1 = induttanze.celle_superficie_w[idx1];
  
      const idxSup2 = indici_asso_celle_sup[cont][1]; // anche questo 1-based
      if (idxSup2 > 1e-8) {
        const idx2 = idxSup2 - 1;                    // converto a 0-based
        const w2 = induttanze.celle_superficie_w[idx2];
        induttanze.Zs_part[cont] = l / (w1 + w2) * Math.sqrt((4 * Math.PI * 1e-7) / induttanze.sigma[cont]);
      } else {
        induttanze.Zs_part[cont] = l / w1 * Math.sqrt((4 * Math.PI * 1e-7) / induttanze.sigma[cont]);
      }
    }
  }

  return induttanze;
}