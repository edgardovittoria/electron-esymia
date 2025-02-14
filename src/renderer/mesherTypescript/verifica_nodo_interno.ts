/** 
 * @param Nodi_interni elenco di nodi già noti, ad es. [[x1,y1,z1], [x2,y2,z2], ...]
 * @param Nodo il nodo che vogliamo verificare, es. [x,y,z]
 * @returns 
 *   - se `Nodo` non esiste ancora in `Nodi_interni` (entro 1e-10), la funzione
 *     restituisce il nodo stesso;
 *   - se invece esiste già, restituisce un array vuoto [].
 */
export function verifica_nodo_interno(
    Nodi_interni: number[][],
    Nodo: number[]
  ): number[] {
    // loop tra i nodi esistenti
    for (let k = 0; k < Nodi_interni.length; k++) {
      const dx = Nodi_interni[k][0] - Nodo[0];
      const dy = Nodi_interni[k][1] - Nodo[1];
      const dz = Nodi_interni[k][2] - Nodo[2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      // se la distanza è meno di 1e-10 => esiste già
      if (dist < 1e-10) {
        // restituendo array vuoto => indica "non aggiungere"
        return [];
      }
    }
    
    // se usciamo dal loop => non trovato => restituiamo `Nodo`
    return Nodo;
  }
  