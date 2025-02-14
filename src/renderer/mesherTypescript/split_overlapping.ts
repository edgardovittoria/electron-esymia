export function split_overlapping(
    barra1: number[],
    barra2: number[],
    mat1: number,
    mat2: number,
    materiale_dominante: number[]
  ): {
    barre_out: number[][]; 
    isOverlapped: number; 
    mat_out: number[];
  } {
    // ----------------------------------------------
   
    
  
    const indici_x = [0, 3, 6, 9, 12, 15, 18, 21];
    const indici_y = [1, 4, 7, 10, 13, 16, 19, 22];
    const indici_z = [2, 5, 8, 11, 14, 17, 20, 23];
  
    // ----------------------------------------------
    // 2) Calcolo x1..z2 per barra1
    const x1 = round14(Math.min(...indici_x.map(i => barra1[i])));
    const x2 = round14(Math.max(...indici_x.map(i => barra1[i])));
    const y1 = round14(Math.min(...indici_y.map(i => barra1[i])));
    const y2 = round14(Math.max(...indici_y.map(i => barra1[i])));
    const z1 = round14(Math.min(...indici_z.map(i => barra1[i])));
    const z2 = round14(Math.max(...indici_z.map(i => barra1[i])));
  
    // Calcolo x3..z4 per barra2
    const x3 = round14(Math.min(...indici_x.map(i => barra2[i])));
    const x4 = round14(Math.max(...indici_x.map(i => barra2[i])));
    const y3 = round14(Math.min(...indici_y.map(i => barra2[i])));
    const y4 = round14(Math.max(...indici_y.map(i => barra2[i])));
    const z3 = round14(Math.min(...indici_z.map(i => barra2[i])));
    const z4 = round14(Math.max(...indici_z.map(i => barra2[i])));
  
    // ----------------------------------------------
    // 3) Verifica overlapping
    let overllapped_x = 0;  
    let overllapped_y = 0;
    let overllapped_z = 0;
  
    if ((x1 >= x3 && x4 > x1) || (x3 < x2 && x3 >= x1)) {
      overllapped_x = 1;
    }
    if ((y1 >= y3 && y4 > y1) || (y3 < y2 && y3 >= y1)) {
      overllapped_y = 1;
    }
    if ((z1 >= z3 && z4 > z1) || (z3 < z2 && z3 >= z1)) {
      overllapped_z = 1;
    }
    const isOverlapped = overllapped_x * overllapped_y * overllapped_z;
  
    // ----------------------------------------------
    // 4) barre_out e mat_out di default
    let barre_out = [barra1, barra2];
    let mat_out   = [mat1,   mat2];
  
    if (isOverlapped === 1) {
      // 4a) calcolo coordinate dell'intersezione (x1_inter..z2_inter)
      const x1_inter = Math.max(x1, x3);
      const x2_inter = Math.min(x2, x4);
      const y1_inter = Math.max(y1, y3);
      const y2_inter = Math.min(y2, y4);
      const z1_inter = Math.max(z1, z3);
      const z2_inter = Math.min(z2, z4);
  
      // 4b) Costruzione della "barra_overlapping"
      const barra_overlapping = new Array(24).fill(0);
      //    MATLAB: [1 7 13 19] => TS: [0, 6, 12, 18]
      [0, 6, 12, 18].forEach(i => {
        barra_overlapping[i] = Math.min(x1_inter, x2_inter);
      });
      [3, 9, 15, 21].forEach(i => {
        barra_overlapping[i] = Math.max(x1_inter, x2_inter);
      });
      [1, 4, 13, 16].forEach(i => {
        barra_overlapping[i] = Math.min(y1_inter, y2_inter);
      });
      [7, 10, 19, 22].forEach(i => {
        barra_overlapping[i] = Math.max(y1_inter, y2_inter);
      });
      [2, 5, 8, 11].forEach(i => {
        barra_overlapping[i] = Math.min(z1_inter, z2_inter);
      });
      [14, 17, 20, 23].forEach(i => {
        barra_overlapping[i] = Math.max(z1_inter, z2_inter);
      });
  
      // 4c) Controllo se mat1 è nel materiale_dominante (in MATLAB: ismember(mat1, materiale_dominante))
      //     In TS, se materiale_dominante è un array, controlliamo se mat1 è compreso in quell'array
      let barra_to_split: number[];
      let mat_to_split: number;
  
      // ismember(mat1, materiale_dominante)
      // => in TS possiamo fare: materiale_dominante.includes(mat1)
      if (materiale_dominante.includes(mat1)) {
        barre_out = [barra1];
        mat_out   = [mat1];
        barra_to_split = barra2;
        mat_to_split   = mat2;
      } else {
        barre_out = [barra2];
        mat_out   = [mat2];
        barra_to_split = barra1;
        mat_to_split   = mat1;
      }
  
      // 4d) Spezza la barra_to_split con x1_inter..z2_inter
      //     Restituisce un array di "pezzi" (barre)
      let barre = spezza_x(barra_to_split, x1_inter, x2_inter);
  
      //    spezza_y 
      let coord: number[][] = [];
      barre.forEach(b => {
        const splittedY = spezza_y(b, y1_inter, y2_inter);
        coord = coord.concat(splittedY);
      });
  
      //    spezza_z
      barre = [];
      coord.forEach(c => {
        const splittedZ = spezza_z(c, z1_inter, z2_inter);
        barre = barre.concat(splittedZ);
      });
  
      // 4e) Ricerco il pezzo che è "barra_overlapping"
      //     => in MATLAB: norm(barra_overlapping - barre(cont,:)) < 1e-10
      //     => in TS: confrontiamo ogni elemento e verifichiamo se differisce < 1e-10
      const to_remove = barre.findIndex(b => {
        return isAlmostEqualArray(b, barra_overlapping, 1e-10);
      });
  
      // 4f) Se trovo quell'indice, rimuovo quell'elemento e aggiungo i rimanenti a "barre_out"
      if (to_remove >= 0) {
        const new_barre = barre.filter((_, idx) => idx !== to_remove);
        barre_out = barre_out.concat(new_barre);
        // mat_out => aggiungiamo (N-1) volte mat_to_split
        mat_out = mat_out.concat(Array(new_barre.length).fill(mat_to_split));
      }
    }
  
    return { barre_out, isOverlapped, mat_out };
  }
  
  
  // -------------------------------------------------------------------
  // Funzioni di supporto
  
  function round14(num: number): number {
    // round(num*1e14)/1e14
    return Math.round(num * 1e14) / 1e14;
  }
  
  /** Confronto di due array (stessa lunghezza) per vedere se differiscono di < tol su ciascun elemento */
  function isAlmostEqualArray(a: number[], b: number[], tol: number): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (Math.abs(a[i] - b[i]) > tol) {
        return false;
      }
    }
    return true;
  }
  
  /** Spezza lungo x */
  function spezza_x(barra: number[], x1_inter: number, x2_inter: number): number[][] {
    const indici_x = [0, 3, 6, 9, 12, 15, 18, 21];
    const x1 = round14(Math.min(...indici_x.map(i => barra[i])));
    const x2 = round14(Math.max(...indici_x.map(i => barra[i])));
  
    const vect_x = Array.from(new Set([x1, x2, x1_inter, x2_inter])).sort((a,b) => a - b);
    const coord: number[][] = [];
  
    for (let cont = 0; cont < vect_x.length - 1; cont++) {
      const temp = [...barra];
      [0, 6, 12, 18].forEach(i => temp[i] = vect_x[cont]);
      [3, 9, 15, 21].forEach(i => temp[i] = vect_x[cont + 1]);
      coord.push(temp);
    }
    return coord;
  }
  
  /** Spezza lungo y */
  function spezza_y(barra: number[], y1_inter: number, y2_inter: number): number[][] {
    const indici_y = [1, 4, 7, 10, 13, 16, 19, 22];
    const y1 = round14(Math.min(...indici_y.map(i => barra[i])));
    const y2 = round14(Math.max(...indici_y.map(i => barra[i])));
  
    const vect_y = Array.from(new Set([y1, y2, y1_inter, y2_inter])).sort((a,b) => a - b);
    const coord: number[][] = [];
  
    for (let cont = 0; cont < vect_y.length - 1; cont++) {
      const temp = [...barra];
      [1, 4, 13, 16].forEach(i => temp[i] = vect_y[cont]);
      [7, 10, 19, 22].forEach(i => temp[i] = vect_y[cont + 1]);
      coord.push(temp);
    }
    return coord;
  }
  
  /** Spezza lungo z */
  function spezza_z(barra: number[], z1_inter: number, z2_inter: number): number[][] {
    const indici_z = [2, 5, 8, 11, 14, 17, 20, 23];
    const z1 = round14(Math.min(...indici_z.map(i => barra[i])));
    const z2 = round14(Math.max(...indici_z.map(i => barra[i])));
  
    const vect_z = Array.from(new Set([z1, z2, z1_inter, z2_inter])).sort((a,b) => a - b);
    const coord: number[][] = [];
  
    for (let cont = 0; cont < vect_z.length - 1; cont++) {
      const temp = [...barra];
      [2, 5, 8, 11].forEach(i => temp[i] = vect_z[cont]);
      [14, 17, 20, 23].forEach(i => temp[i] = vect_z[cont + 1]);
      coord.push(temp);
    }
    return coord;
  }
  