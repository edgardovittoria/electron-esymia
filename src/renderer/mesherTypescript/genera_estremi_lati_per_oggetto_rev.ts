
export function genera_estremi_lati_per_oggetto_rev(
    lati_per_oggetto_inp: number[][],
    NodiRed: number[][],
    Nodi_i: number[][],
    lato1: number[][],    
    lato2: number[][],    
    offset: number
  ): number[][] {
    // 1) Ricaviamo le dimensioni
    const numlati = lato1.length;            // in MATLAB: size(lato1,1)
    const latiprec = lati_per_oggetto_inp.length;  // in MATLAB: size(lati_per_oggetto_inp,1)
  
   
    let lati_per_oggetto = lati_per_oggetto_inp.slice();  // copia iniziale
    for (let i=0; i<numlati; i++) {
      lati_per_oggetto.push([0,0]);  
    }
  
    // 3) Cicliamo sui nuovi "lati" (1..numlati in MATLAB => 0..numlati-1 in TS)
    for (let k = 0; k < numlati; k++) {
      // Creiamo una variabile "lato" = [lato(1), lato(2)] in MATLAB => qui array di 2 numeri
      let lato: [number, number] = [0, 0];
  
      // ====== Primo estremo (lato1) ======
      //   index = find( ... ) su NodiRed => se empty => find(...) su Nodi_i
      let idx = firstMatchIndex(NodiRed, lato1[k], 1e-8, 1e-8, 1e-12);
      if (idx < 0) {
        // Non trovato in NodiRed => cerchiamo in Nodi_i
        idx = firstMatchIndex(Nodi_i, lato1[k], 1e-8, 1e-8, 1e-12);
        if (idx < 0) {
          // Caso estremo: non trovato neanche in Nodi_i
          
          console.warn("Primo estremo non trovato né in NodiRed né in Nodi_i!");
          lato[0] = 0; 
        } else {
          // Se trovato in Nodi_i => MATLAB fa "lato(1) = -index(1)"
          //  index(1) in MATLAB => idx+1 in TS
          lato[0] = -(idx + 1);
        }
      } else {
        // Se trovato in NodiRed => "lato(1) = index(1) + offset"
        
        lato[0] = (idx + 1) + offset;
      }
  
      // ====== Secondo estremo (lato2) ======
      idx = firstMatchIndex(NodiRed, lato2[k], 1e-8, 1e-8, 1e-12);
      if (idx < 0) {
        // non in NodiRed => check in Nodi_i
        idx = firstMatchIndex(Nodi_i, lato2[k], 1e-8, 1e-8, 1e-12);
        if (idx < 0) {
          console.warn("Secondo estremo non trovato né in NodiRed né in Nodi_i!");
          lato[1] = 0;
        } else {
          // lato(2) = -index(1)
          lato[1] = -(idx + 1);
        }
      } else {
        // lato(2) = index(1) + offset
        lato[1] = (idx + 1) + offset;
      }
  
      // 4) Assegniamo il risultato nella riga (k+latiprec) => 0-based
      // in MATLAB: lati_per_oggetto(k+latiprec,:) = lato
      lati_per_oggetto[k + latiprec] = [lato[0], lato[1]];
    }
  
    // 5) Restituiamo l'array finale
    return lati_per_oggetto;
  }
  
  /**
   * Helper per trovare il **primo** indice i in `arr` tale che
   * arr[i][0..2] coincide con node[0..2] entro le tolleranze 
   * (tolX, tolY, tolZ).
   * 
   * Se nessuno corrisponde, restituisce -1.
   */
  function firstMatchIndex(
    arr: number[][],
    node: number[],
    tolX: number,
    tolY: number,
    tolZ: number
  ): number {
    for (let i=0; i < arr.length; i++) {
      const dx = Math.abs(arr[i][0] - node[0]);
      const dy = Math.abs(arr[i][1] - node[1]);
      const dz = Math.abs(arr[i][2] - node[2]);
      if (dx <= tolX && dy <= tolY && dz <= tolZ) {
        return i;  // 0-based
      }
    }
    return -1;
  }
  