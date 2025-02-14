import { verifica_nodo_interno } from "./verifica_nodo_interno";


//struttura base di regioni
export interface RegioniData {
    
    coordinate: number[][];
    cond: number[];
    epsr: number[];
    mur: number[];
  }
  

  
  /**
   * Utility: controlla se `p` è già presente in `Nodi_i` entro tolleranza 1e-12.
   */
  function isInNodiI(p: number[], Nodi_i: number[][]): boolean {
    for (let k2 = 0; k2 < Nodi_i.length; k2++) {
      // Se la norma della differenza < 1e-12 -> p è uguale a Nodi_i[k2]
      const dx = p[0] - Nodi_i[k2][0];
      const dy = p[1] - Nodi_i[k2][1];
      const dz = p[2] - Nodi_i[k2][2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (dist < 1e-12) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Porting di `genera_nodi_interni_merged_non_ort`.
   * @param Regioni - Struttura con coordinate e parametri (cond, epsr, mur)
   * @param nodi_nodi - array Nx3 con coordinate di possibili nodi
   * @param primo_ciclo - indice k in MATLAB
   * @param Nodi_i - nodi interni già noti
   * @returns Nodi_interni_output, un array di nodi [x,y,z]
   */
  export function genera_nodi_interni_merged_non_ort(
    Regioni: RegioniData,
    nodi_nodi: number[][],
    primo_ciclo: number,
    Nodi_i: number[][]
  ): number[][] {
  
    const Nregioni = Regioni.coordinate.length;
    const Nnodi    = nodi_nodi.length;
  
    let Nodi_interni_output: number[][] = [];
  
    const k = primo_ciclo;  // in MATLAB si usava k=primo_ciclo
    const n_nodi_int = Nodi_i.length;   // size(Nodi_i,1)
  
    
    for (let m = 0; m < Nregioni; m++) {
      if (m !== k) {
        let contatto = 0;
        let vertici_contatto: number[] = []; 
        
  
        // Verifica se cond, epsr, mur coincidono
        if ( Regioni.cond[k]  === Regioni.cond[m]  &&
             Regioni.epsr[k]  === Regioni.epsr[m]  &&
             Regioni.mur[k]   === Regioni.mur[m] ) 
        {
          // Cerchiamo i vertici coincidenti
          // In MATLAB: for k1=1:8, for k2=1:8
          // In TS => 0..7, e i triple in coordinate(k, 3*k1..3*k1+2)
          for (let k1=0; k1<8; k1++) {
            // v1 = Regioni.coordinate(k, 3*k1 : 3*k1+2)
            const v1 = Regioni.coordinate[k].slice(3*k1, 3*k1+3);
            for (let k2=0; k2<8; k2++) {
              const v2 = Regioni.coordinate[m].slice(3*k2, 3*k2+3);
              // Se norm(v1 - v2) < 1e-12 => contatto++
              const dx = v1[0] - v2[0];
              const dy = v1[1] - v2[1];
              const dz = v1[2] - v2[2];
              const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
              if (dist < 1e-12) {
                contatto++;
                // Aggiungiamo v1 a vertici_contatto
                vertici_contatto.push(v1[0], v1[1], v1[2]);
              }
            }
          }
  
          // Se contatto==4 => passiamo a controllare i nodi "nodi_nodi" 
          if (contatto === 4) {
            for (let n=0; n < Nnodi; n++) {
              const nodoCandidate = nodi_nodi[n];
              // Se controlla_nodo_su_superfice(...)==1 => potenziale nodo interno di contatto
              if (controlla_nodo_su_superfice(vertici_contatto, nodoCandidate) === 1) {
                
                // Verifichiamo se esiste già in Nodi_i (n_nodi_int) => se sì, non lo aggiungiamo
                const isCoincInNodiI = isInNodiI(nodoCandidate, Nodi_i);
  
                if (!isCoincInNodiI) {
                  
                  if (Nodi_interni_output.length === 0) {
                    Nodi_interni_output.push(nodoCandidate);
                  } else {
                    // Altrimenti, passiamo da verifica_nodo_interno
                    const Nodi_interni_new = verifica_nodo_interno(Nodi_interni_output, nodoCandidate);
                    
                    if (Nodi_interni_new.length > 0) {
                      
                      Nodi_interni_output.push(Nodi_interni_new);
                    }
                  }
                } // fine if (!isCoincInNodiI)
              }
            }
          }
        }
      } // fine if m!==k
    } // fine for m
  
    return Nodi_interni_output;
  }
  
  /**
   * Versione TypeScript di `controlla_nodo_su_superfice(vertici_contatto, nodo_i)`.
   * Restituisce 1 o 0.
   * 
   * In MATLAB, vertici_contatto era [1 x 12], cioè 4 triple in fila
   * => in TS è un array di 12 numeri ( [x1,y1,z1, x2,y2,z2, x3,y3,z3, x4,y4,z4] ).
   */
  function controlla_nodo_su_superfice(
    vertici_contatto: number[], 
    nodo_i: number[]
  ): number {
    // esito=0 inizialmente
    let esito = 0;
  
    // vertici: 4 triple
    // v1=vertici_contatto(1,1:3); v2=... 4:6; v3=7:9; v4=10:12
    const v1 = vertici_contatto.slice(0,3);
    const v2 = vertici_contatto.slice(3,6);
    const v3 = vertici_contatto.slice(6,9);
    const v4 = vertici_contatto.slice(9,12);
  
    const esito1 = punti_allineati(v1, v2, nodo_i);
    const esito2 = punti_allineati(v2, v4, nodo_i);
    const esito3 = punti_allineati(v4, v3, nodo_i);
    const esito4 = punti_allineati(v3, v1, nodo_i);
  
    if (esito1 === 1 || esito2 === 1 || esito3 === 1 || esito4 === 1) {
      esito = 0;
    } else {
      // Controlla la distanza dal piano v1,v2,v3
      let [a, b, c, d] = piano_passante3_punti(v1, v2, v3);
      let dist1 = Math.abs(a*nodo_i[0] + b*nodo_i[1] + c*nodo_i[2] + d) /
                  Math.sqrt(a*a + b*b + c*c);
  
      [a, b, c, d] = piano_passante3_punti(v2, v3, v4);
      let dist2 = Math.abs(a*nodo_i[0] + b*nodo_i[1] + c*nodo_i[2] + d) /
                  Math.sqrt(a*a + b*b + c*c);
  
      if (dist1 < 1e-10 || dist2 < 1e-10) {
        esito = 1;
      }
    }
    return esito;
  }
  
  /**
   * piano_passante3_punti(v1,v2,v3) => [a,b,c,d]
   * come in MATLAB: definisce i coefficienti a,b,c,d del piano passante per v1,v2,v3
   */
  function piano_passante3_punti(
    v1: number[], 
    v2: number[], 
    v3: number[]
  ): [number,number,number,number] {
    // P12 = v2-v1, P13 = v3-v1
    const P12 = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
    const P13 = [v3[0]-v1[0], v3[1]-v1[1], v3[2]-v1[2]];
  
    // v = cross(P12,P13)
    const vx = P12[1]*P13[2] - P12[2]*P13[1];
    const vy = P12[2]*P13[0] - P12[0]*P13[2];
    const vz = P12[0]*P13[1] - P12[1]*P13[0];
  
    const a = vx, b = vy, c = vz;
    const d = -(a*v1[0] + b*v1[1] + c*v1[2]);
  
    return [a,b,c,d];
  }
  
  /**
   * punti_allineati(v1,v2,v3) => 1 se i tre punti sono allineati (norm(cross)<1e-10).
   */
  function punti_allineati(v1: number[], v2: number[], v3: number[]): number {
    let esito = 0;
    const P12 = [v2[0]-v1[0], v2[1]-v1[1], v2[2]-v1[2]];
    const P13 = [v3[0]-v1[0], v3[1]-v1[1], v3[2]-v1[2]];
  
    // cross
    const cx = P12[1]*P13[2] - P12[2]*P13[1];
    const cy = P12[2]*P13[0] - P12[0]*P13[2];
    const cz = P12[0]*P13[1] - P12[1]*P13[0];
    const normCross = Math.sqrt(cx*cx + cy*cy + cz*cz);
  
    if (normCross < 1e-10) {
      esito = 1;
    }
    return esito;
  }
  