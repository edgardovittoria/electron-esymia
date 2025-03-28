import { Induttanze} from './discretizza_thermal_rev'; 


export function matrice_R_rev(induttanze: Induttanze): Induttanze {
  // Numero di righe di estremi_celle (equivalente a size(...,1) in MATLAB)
  const rowCount = induttanze.estremi_celle.length;

  // Inizializziamo l'array R con zeri
  induttanze.R = new Array(rowCount).fill(0);

  // Calcola R(k) = (1 / sigma(k)) * (l(k) / S(k)) se sigma(k) > 0
  for (let k = 0; k < rowCount; k++) {
    if (induttanze.sigma[k] > 0) {
      induttanze.R[k] = (1 / induttanze.sigma[k]) * (induttanze.l[k] / induttanze.S[k]);
    }
  }

  // Indice nc, come in MATLAB
  const nc = induttanze.indici_Nd ? rowCount - induttanze.indici_Nd.length : rowCount;

  // Assegna 0 a tutte le posizioni da nc a rowCount-1
  for (let i = nc; i < rowCount; i++) {
    induttanze.R[i] = 0;
  }

  // Restituisce l'oggetto modificato
  return induttanze;
}
