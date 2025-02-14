import * as math from 'mathjs';


/**
 * Interfaccia che descrive il tipo di output di 'matrice_incidenza_rev'.
 */
export interface MatriceIncidenzaRevOutput {
    estremi_lati: number[][];  
    Rv:  math.Matrix;            
    nodi_centri: number[][];   
    A: math.Matrix;             
  }
  
  /**
 *  `matrice_incidenza_rev` usando math.js per matrici sparse.
 *
 * @param LatiInd  
 *
 * @param nodi_centri 
 *
 * @param nodi_nodi_interni_coordinate 
 *
 * @returns un oggetto con {estremi_lati, Rv, nodi_centri, A}.
 */
  export function matrice_incidenza_rev(
    LatiInd: number[][][],            // dimensione [2][NumLatiInd][3]
    nodi_centri: number[][],          // dimensione [Nc x 3]
    nodi_nodi_interni_coordinate: number[][] // [Ni x 3]
  ): MatriceIncidenzaRevOutput {
  
    
    const NumAllNodi = nodi_centri.length;                
    const NumInterni = nodi_nodi_interni_coordinate.length;
    const NodiCap1 = nodi_centri.slice(0, NumAllNodi - NumInterni);
  
    // NumLatiInd = size(LatiInd,2)
    // in TS: LatiInd[0].length => se LatiInd dimensione [2][NumLatiInd][3], 
    // allora LatiInd[0].length = NumLatiInd
    const NumLatiInd = LatiInd[0].length;
  
    // NumNodiCap = size(NodiCap1,1)
    const NumNodiCap = NodiCap1.length;
  
    // Rv = speye(2) in MATLAB => inizialmente 2x2 identità
    
    // Inizializza Rv come matrice sparsa vuota
  let Rv: math.Matrix = math.sparse([]);

    
  
    // Costruiamo ncr = NodiCap1(1:2,:)
    // In TS => se NumNodiCap>=2, prendiamo i primi due, altrimenti quanti ne abbiamo.
    let ncr: number[][] = [];
    if (NumNodiCap >= 1) {
      ncr.push(NodiCap1[0]);
      Rv.set([0, 0], 1); // Prima riga, prima colonna
    }
    if (NumNodiCap >= 2) {
      ncr.push(NodiCap1[1]);
      Rv.set([1, 1], 1); // Seconda riga, seconda colonna
    }
    // Se NumNodiCap=0, ncr rimane vuoto.
  
    // Se NumNodiCap>2, allora eseguiamo il loop
    // for k = 3:NumNodiCap
    // In TS: for (let k=2; k<NumNodiCap; k++)
    for (let k = 2; k < NumNodiCap; k++) {
      const cand = NodiCap1[k]; // la "riga" k (0-based => 3° nodo in MATLAB)
      // Troviamo se cand è già in ncr
      // m = find( (abs(ncr(:,1)-cand(1))<=1e-8) & ... )
      let foundIndex = -1;
      for (let i = 0; i < ncr.length; i++) {
        if (
          Math.abs(ncr[i][0] - cand[0]) <= 1e-8 &&
          Math.abs(ncr[i][1] - cand[1]) <= 1e-8 &&
          Math.abs(ncr[i][2] - cand[2]) <= 1e-8
        ) {
          foundIndex = i;
          break;
        }
      }
      if (foundIndex < 0) {
        // non trovato => ncr=[ncr; cand]
        ncr.push(cand);
          // Imposta l'elemento corrispondente nella nuova colonna di Rv
          Rv.set([k, ncr.length - 1], 1);
      } else {
        // Imposta l'elemento corrispondente nella colonna esistente di Rv
        Rv.set([k, foundIndex], 1);
      }
    }
  
    // nr=size(ncr,1)
    const nr = ncr.length;
  
    // NodiCap2 = [ncr; nodi_nodi_interni_coordinate]
    // => in TS => concat
    const NodiCap2 = ncr.concat(nodi_nodi_interni_coordinate);
  
    // clear ncr -> in TS, semplicemente non serve più
  
    // A = sparse(NumLatiInd, size(NodiCap2,1))
    
    const NumNodiCap2 = NodiCap2.length;
    let A: math.Matrix = math.sparse([], 'number'); // Inizia con una matrice sparsa vuota
    A.resize([NumLatiInd, NumNodiCap2]); // Imposta le dimensioni corrette
  
    // estremi_lati1 = cell(1, NumLatiInd)
    // estremi_lati2 = cell(1, NumLatiInd)
    // => in TS => array di array
    const estremi_lati: number[][] = Array.from({ length: NumLatiInd }, () => []);

    for (let k = 0; k < NumLatiInd; k++) {
      const lat1 = LatiInd[0][k];
      const lat2 = LatiInd[1][k];
      let ncMatches1: number[] = [];
      let ncMatches2: number[] = [];
  
      for (let i = 0; i < NumNodiCap2; i++) {
        if (
          Math.abs(lat1[0] - NodiCap2[i][0]) <= 1e-8 &&
          Math.abs(lat1[1] - NodiCap2[i][1]) <= 1e-8 &&
          Math.abs(lat1[2] - NodiCap2[i][2]) <= 1e-8
        ) {
          ncMatches1.push(i);
        }
  
        if (
          Math.abs(lat2[0] - NodiCap2[i][0]) <= 1e-8 &&
          Math.abs(lat2[1] - NodiCap2[i][1]) <= 1e-8 &&
          Math.abs(lat2[2] - NodiCap2[i][2]) <= 1e-8
        ) {
          ncMatches2.push(i);
        }
      }
  
      // Assegna i valori alla matrice sparsa A
      for (let idx of ncMatches1) {
        A.set([k, idx], -1); // Usa set per matrici sparse
      }
      for (let idx of ncMatches2) {
        A.set([k, idx], 1); // Usa set per matrici sparse
      }
  
      estremi_lati[k] = [...ncMatches1, ...ncMatches2];
    }
    // In MATLAB: nodi_centri = NodiCap2
    // => aggiorniamo la variabile di input 'nodi_centri' con i nuovi nodi
    nodi_centri = NodiCap2;
    
  
    // Ritorniamo i 4 output
    return {
      estremi_lati,
      Rv,
      nodi_centri,
      A
    };
  }
  