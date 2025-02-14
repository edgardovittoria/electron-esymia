/**
 * Trova i nodi "interni" comuni a 4 oggetti, 
 * 
 * @param nodi_centri - array Nx3 con i nodi "centri" (esterni)
 * @param NodiRed - array Mx3 con nodi generali
 * @returns array di nodi (x,y,z) considerati interni
 */
export function FindInternalNodesCommon2FourObjects_rev(
    nodi_centri: number[][],
    NodiRed: number[][]
  ): number[][] {
  
    const NumNodesSup = NodiRed.length;
    let InternalNodes: number[][] = [];
  
    for (let m = 0; m < NumNodesSup; m++) {
      // 1) Troviamo tutti gli indici i in [0..NumNodesSup-1] 
      //    tali che NodiRed(i) ~ NodiRed(m) entro 1e-10
      const matchingIndices = findMatchingCoords(NodiRed, NodiRed[m], 1e-10);
      // matchingIndices corrisponde a 'n' in MATLAB
  
      // 2) Se length(n) >= 4
      if (matchingIndices.length >= 4) {
        // 3) Controlliamo se NodiRed(m,:) è in nodi_centri
        //    In MATLAB: k=find(...); if isempty(k) => non trovato
        const isInNodiCentri = isNodeInArray(nodi_centri, NodiRed[m], 1e-10);
  
        if (!isInNodiCentri) {
          // 4) Se non in nodi_centri, verifichiamo se non è già in InternalNodes
          const isInInternal = isNodeInArray(InternalNodes, NodiRed[m], 1e-10);
          if (!isInInternal) {
            // => Aggiungiamo
            InternalNodes.push([...NodiRed[m]]);
          }
        }
      }
    }
  
    return InternalNodes;
  }
  
  /**
   * Trova tutti gli indici i tali che NodiRed[i] è uguale a node 
   * (entro tolleranza `tol`) nelle 3 coordinate.
   * 
   * @param arr array Nx3
   * @param node array [x,y,z]
   * @param tol tolleranza
   * @returns lista di indici
   */
  function findMatchingCoords(
    arr: number[][], 
    node: number[], 
    tol: number
  ): number[] {
    const out: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      const dx = Math.abs(arr[i][0] - node[0]);
      const dy = Math.abs(arr[i][1] - node[1]);
      const dz = Math.abs(arr[i][2] - node[2]);
      if (dx <= tol && dy <= tol && dz <= tol) {
        out.push(i);
      }
    }
    return out;
  }
  
  /**
   * Verifica se un certo nodo [x,y,z] è presente (entro tol) in un array di nodi Nx3.
   * 
   * @param arr 
   * @param node 
   * @param tol 
   * @returns true se esiste almeno un match
   */
  function isNodeInArray(
    arr: number[][], 
    node: number[], 
    tol: number
  ): boolean {
    for (let i = 0; i < arr.length; i++) {
      const dx = arr[i][0] - node[0];
      const dy = arr[i][1] - node[1];
      const dz = arr[i][2] - node[2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (dist <= tol) {
        return true;
      }
    }
    return false;
  }
  