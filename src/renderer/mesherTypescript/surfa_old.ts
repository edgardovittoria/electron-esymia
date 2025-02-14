import { norm } from "./norm";
import { cross } from "./cross";

export function surfa_old(barra1: number[], weights_five: number[], roots_five: number[]): number {
  const xi1: number[] = [barra1[0], barra1[3], barra1[6], barra1[9]];
  const yi1: number[] = [barra1[1], barra1[4], barra1[7], barra1[10]];
  const zi1: number[] = [barra1[2], barra1[5], barra1[8], barra1[11]];

  const ri: number[][] = [];
  ri[0] = [xi1[0], yi1[0], zi1[0]];
  ri[1] = [xi1[1], yi1[1], zi1[1]];
  ri[2] = [xi1[2], yi1[2], zi1[2]];
  ri[3] = [xi1[3], yi1[3], zi1[3]];

  // Calcolo di rmi, rai, rbi, rabi 
  const rmi: number[] = ri.reduce((sum, r) => sum.map((val, i) => val + r[i])).map(val => val / 4); // Punto medio
  const rai: number[] = ri.map((val, i) => (i % 2 === 0 ? -1 : 1) * val[0] / 4 + (i < 2 ? -1 : 1) * val[1] / 4 + val[2]/4).map((val,i,arr)=> val+arr[i]); // Derivata parziale rispetto a xi
  const rbi: number[] = ri.map((val, i) => (i < 2 ? -1 : 1) * val[0] / 4 + (i % 2 === 0 ? -1 : 1) * val[1] / 4 + val[2]/4).map((val,i,arr)=> val+arr[i]); // Derivata parziale rispetto a eta
  const rabi: number[] = ri.map((val, i) => (i % 2 === 0 ? 1 : -1) * val[0] / 4 + (i < 2 ? -1 : 1) * val[1] / 4 + val[2]/4).map((val,i,arr)=> val+arr[i]); // Derivata parziale seconda rispetto a xi e eta

  const wex: number[] = weights_five;
  const rootx: number[] = roots_five;
  const wey: number[] = wex;
  const rooty: number[] = rootx;
  const nlx: number = wex.length;
  const nly: number = wey.length;

  let sum_a1: number = 0;
  for (let a1 = 0; a1 < nlx; a1++) {
    let sum_b1: number = 0;
    for (let b1 = 0; b1 < nly; b1++) {
      
      const drai: number[] = rai.map((val, i) => val + rabi[i] * rooty[b1]);
      const drbi: number[] = rbi.map((val, i) => val + rabi[i] * rootx[a1]);
      const draim: number = norm(drai);
      const drbim: number = norm(drbi);
      const aversi: number[] = drai.map(val => val / draim); 
      const bversi: number[] = drbi.map(val => val / drbim); 
      const steti: number[] = cross(aversi, bversi); 
      const stetim: number = norm(steti); 
      const f: number = draim * drbim * stetim; 
      sum_b1 += wey[b1] * f;
    }
    sum_a1 += wex[a1] * sum_b1;
  }

  const integr: number = sum_a1;
  return integr;
}