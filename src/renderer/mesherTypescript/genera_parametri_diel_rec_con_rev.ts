
import { Induttanze } from './discretizza_thermal_rev'; 



export function genera_parametri_diel_rec_con_rev(induttanze: Induttanze): Induttanze  {
  const eps0: number = 8.854187816997944e-12;
  let Cp: number[] = []

  if (induttanze.indici_Nd && induttanze.indici_Nd.length > 0) {
    induttanze.Cp = induttanze.epsr.map((epsr, i) =>
      eps0 * (epsr - 1) * induttanze.S[i] / induttanze.l[i]
    );
  } else {
    induttanze.Cp = [];
  }

  
  return induttanze ;
}

