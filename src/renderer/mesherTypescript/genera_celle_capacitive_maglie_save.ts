import { surfa_old } from './surfa_old';
import { mean_length_P } from './mean_length_P';

/**
 * @param rp        
 * @param Npuntiy
 * @param Npuntiz
 * @param weights_five
 * @param roots_five
 * @returns celle_cap, Nodi, Sup_c, l_c, width_c, NodiRed
 */
export function genera_celle_capacitive_maglie_save(
  rp: number[][][][],
  Npuntix: number,
  Npuntiy: number,
  Npuntiz: number,
  weights_five: number[],
  roots_five: number[]
): {
  celle_cap: number[][];  
  Nodi: number[][];      
  Sup_c: number[];        
  l_c: number[];          
  width_c: number[];      
  NodiRed: number[][];    
}
{
  // n_celle_cap = 2*(Npuntiy*Npuntix + Npuntiz*Npuntix + Npuntiy*Npuntiz)
  const n_celle_cap = 2 * (
    Npuntiy * Npuntix + 
    Npuntiz * Npuntix + 
    Npuntiy * Npuntiz
  );

  // Allocazione array 
  const celle_cap: number[][] = Array.from({ length: n_celle_cap }, () => Array(12).fill(0));
  const Nodi: number[][]      = Array.from({ length: n_celle_cap }, () => Array(3).fill(0));
  const Sup_c: number[]       = Array(n_celle_cap).fill(0);
  const l_c: number[]         = Array(n_celle_cap).fill(0);
  const width_c: number[]     = Array(n_celle_cap).fill(0);

  let r = 0; // indice cella di superficie attuale (in MATLAB era r=1, qui r=0)

  //----------------------------------------------------------------------
  //                    (1) Loop su N e M => Faccia I e II (xy)
  //----------------------------------------------------------------------
  // In MATLAB: for n=1:Npuntiy, for m=1:Npuntix
  //   => in TS: n=0..Npuntiy-1, m=0..Npuntix-1
  for (let n = 0; n < Npuntiy; n++) {
    for (let m = 0; m < Npuntix; m++) {
      // Calcolo r1..r4 (Faccia I) e r5..r8 (Faccia II)
      // con if (n==1) => (n==0), (n==Npuntiy) => (n==Npuntiy-1), ...
      // Questi if servono a "mediare" i punti in rp[][][].

      //--------------- r1, r5 --------------
      let r1: number[], r2: number[], r3: number[], r4: number[];
      let r5: number[], r6: number[], r7: number[], r8: number[];

      // r1 e r5: 
      if (n === 0) {
        if (m === 0) {
          // o=1 => in TS => o=0
          let o = 0;   r1 = rp[m][n][o];
          // o=Npuntiz => in TS => o=Npuntiz-1
          o = Npuntiz - 1;  r5 = rp[m][n][o];
        } else {
          // caso else
          let o = 0; 
          // r1 = 0.5*(rp(m,n,o) + rp(m-1,n,o))
          r1 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m-1][n][o][i]));
          o = Npuntiz - 1;
          r5 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m-1][n][o][i]));
        }
      } else {
        if (m === 0) {
          let o = 0;
          r1 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n-1][o][i]));
          o = Npuntiz - 1;
          r5 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n-1][o][i]));
        } else {
          let o = 0;
          r1 = rp[m][n][o].map((val,i)=>
             0.25*( val + rp[m-1][n][o][i] + rp[m][n-1][o][i] + rp[m-1][n-1][o][i]));
          o = Npuntiz - 1;
          r5 = rp[m][n][o].map((val,i)=>
             0.25*( val + rp[m-1][n][o][i] + rp[m][n-1][o][i] + rp[m-1][n-1][o][i]));
        }
      }

      //--------------- r2, r6 --------------
      if (n === 0) {
        if (m === Npuntix - 1) {
          let o = 0;   r2 = rp[m][n][o];
          o = Npuntiz - 1;  r6 = rp[m][n][o];
        } else {
          let o = 0;
          r2 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m+1][n][o][i]));
          o = Npuntiz - 1;
          r6 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m+1][n][o][i]));
        }
      } else {
        if (m === Npuntix - 1) {
          let o = 0;
          r2 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n-1][o][i]));
          o = Npuntiz - 1;
          r6 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n-1][o][i]));
        } else {
          let o = 0;
          r2 = rp[m][n][o].map((val,i)=>
             0.25*(val + rp[m+1][n][o][i] + rp[m][n-1][o][i] + rp[m+1][n-1][o][i]));
          o = Npuntiz - 1;
          r6 = rp[m][n][o].map((val,i)=>
             0.25*(val + rp[m+1][n][o][i] + rp[m][n-1][o][i] + rp[m+1][n-1][o][i]));
        }
      }

      //--------------- r3, r7 --------------
      if (n === Npuntiy - 1) {
        if (m === 0) {
          let o = 0;   r3 = rp[m][n][o];
          o = Npuntiz - 1;  r7 = rp[m][n][o];
        } else {
          let o = 0;
          r3 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m-1][n][o][i]));
          o = Npuntiz - 1;
          r7 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m-1][n][o][i]));
        }
      } else {
        if (m === 0) {
          let o = 0;
          r3 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n+1][o][i]));
          o = Npuntiz - 1;
          r7 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n+1][o][i]));
        } else {
          let o = 0;
          r3 = rp[m][n][o].map((val,i)=>
             0.25*( val + rp[m-1][n][o][i] + rp[m][n+1][o][i] + rp[m-1][n+1][o][i]));
          o = Npuntiz - 1;
          r7 = rp[m][n][o].map((val,i)=>
             0.25*( val + rp[m-1][n][o][i] + rp[m][n+1][o][i] + rp[m-1][n+1][o][i]));
        }
      }

      //--------------- r4, r8 --------------
      if (n === Npuntiy - 1) {
        if (m === Npuntix - 1) {
          let o = 0;   r4 = rp[m][n][o];
          o = Npuntiz - 1;  r8 = rp[m][n][o];
        } else {
          let o = 0;
          r4 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m+1][n][o][i]));
          o = Npuntiz - 1;
          r8 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m+1][n][o][i]));
        }
      } else {
        if (m === Npuntix - 1) {
          let o = 0;
          r4 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n+1][o][i]));
          o = Npuntiz - 1;
          r8 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n+1][o][i]));
        } else {
          let o = 0;
          r4 = rp[m][n][o].map((val,i)=>
             0.25*( val + rp[m+1][n][o][i] + rp[m][n+1][o][i] + rp[m+1][n+1][o][i]));
          o = Npuntiz - 1;
          r8 = rp[m][n][o].map((val,i)=>
             0.25*( val + rp[m+1][n][o][i] + rp[m][n+1][o][i] + rp[m+1][n+1][o][i]));
        }
      }

      //  assegnamento
      celle_cap[r]   = [...r1, ...r2, ...r3, ...r4];
      celle_cap[r+1] = [...r5, ...r6, ...r7, ...r8];

      // Nodi(r,:) = rp(m,n,1,:) => TS => rp[m][n][0]
      Nodi[r]   = rp[m][n][0];          
      Nodi[r+1] = rp[m][n][Npuntiz-1];  //  faccia zmax

      // Sup_c
      const sup1 = surfa_old(celle_cap[r],   weights_five, roots_five);
      const sup2 = surfa_old(celle_cap[r+1], weights_five, roots_five);
      Sup_c[r]   = sup1;
      Sup_c[r+1] = sup2;

      // l_c, width_c
      // "Per il calcolo della lunghezza e della larghezza assumo che l_c sia nella direzione 1 e che width_c nella direzione 2"
      l_c[r]      = Math.abs(mean_length_P(celle_cap[r],   1));
      width_c[r]  = Math.abs(mean_length_P(celle_cap[r],   2));
      l_c[r+1]    = Math.abs(mean_length_P(celle_cap[r+1], 1));
      width_c[r+1]= Math.abs(mean_length_P(celle_cap[r+1], 2));

      r += 2;
    }
  }

  //----------------------------------------------------------------------
  //                (2) Loop su O e M => Faccia III e IV (xz)
  //----------------------------------------------------------------------
  // MATLAB: for o=1:Npuntiz, for m=1:Npuntix
  // => TS: o=0..Npuntiz-1, m=0..Npuntix-1
  for (let o = 0; o < Npuntiz; o++) {
    for (let m = 0; m < Npuntix; m++) {
      // Stessa logica: r1..r8

      // r1,r5
      let r1: number[], r2: number[], r3: number[], r4: number[];
      let r5: number[], r6: number[], r7: number[], r8: number[];

      if (o === 0) {
        if (m === 0) {
          let n = 0; r1 = rp[m][n][o];
          n = Npuntiy - 1; r5 = rp[m][n][o];
        } else {
          let n=0;
          r1 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m-1][n][o][i]));
          n=Npuntiy - 1;
          r5 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m-1][n][o][i]));
        }
      } else {
        if (m===0) {
          let n=0;
          r1 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o-1][i]));
          n=Npuntiy-1;
          r5 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o-1][i]));
        } else {
          let n=0;
          r1 = rp[m][n][o].map((val,i)=>
             0.25*( val + rp[m-1][n][o][i] + rp[m][n][o-1][i] + rp[m-1][n][o-1][i]));
          n=Npuntiy-1;
          r5 = rp[m][n][o].map((val,i)=>
             0.25*( val + rp[m-1][n][o][i] + rp[m][n][o-1][i] + rp[m-1][n][o-1][i]));
        }
      }

      // r2,r6
      if (o===0) {
        if (m===Npuntix-1) {
          let n=0; r2=rp[m][n][o];
          n=Npuntiy-1; r6=rp[m][n][o];
        } else {
          let n=0;
          r2 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m+1][n][o][i]));
          n=Npuntiy-1;
          r6 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m+1][n][o][i]));
        }
      } else {
        if (m===Npuntix-1) {
          let n=0;
          r2 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o-1][i]));
          n=Npuntiy-1;
          r6 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o-1][i]));
        } else {
          let n=0;
          r2 = rp[m][n][o].map((val,i)=>
             0.25*( val + rp[m+1][n][o][i] + rp[m][n][o-1][i] + rp[m+1][n][o-1][i]));
          n=Npuntiy-1;
          r6 = rp[m][n][o].map((val,i)=>
             0.25*( val + rp[m+1][n][o][i] + rp[m][n][o-1][i] + rp[m+1][n][o-1][i]));
        }
      }

      // r3,r7
      if (o===Npuntiz-1) {
        if (m===0) {
          let n=0; r3=rp[m][n][o];
          n=Npuntiy-1; r7=rp[m][n][o];
        } else {
          let n=0;
          r3 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m-1][n][o][i]));
          n=Npuntiy-1;
          r7 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m-1][n][o][i]));
        }
      } else {
        if (m===0) {
          let n=0;
          r3 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n][o+1][i]));
          n=Npuntiy-1;
          r7 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n][o+1][i]));
        } else {
          let n=0;
          r3 = rp[m][n][o].map((val,i)=>
              0.25*( val + rp[m-1][n][o][i] + rp[m][n][o+1][i] + rp[m-1][n][o+1][i]));
          n=Npuntiy-1;
          r7 = rp[m][n][o].map((val,i)=>
              0.25*( val + rp[m-1][n][o][i] + rp[m][n][o+1][i] + rp[m-1][n][o+1][i]));
        }
      }

      // r4,r8
      if (o===Npuntiz-1) {
        if (m===Npuntix-1) {
          let n=0; r4=rp[m][n][o];
          n=Npuntiy-1; r8=rp[m][n][o];
        } else {
          let n=0;
          r4= rp[m][n][o].map((val,i)=>0.5*(val + rp[m+1][n][o][i]));
          n=Npuntiy-1;
          r8= rp[m][n][o].map((val,i)=>0.5*(val + rp[m+1][n][o][i]));
        }
      } else {
        if (m===Npuntix-1) {
          let n=0;
          r4= rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n][o+1][i]));
          n=Npuntiy-1;
          r8= rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n][o+1][i]));
        } else {
          let n=0;
          r4= rp[m][n][o].map((val,i)=>
             0.25*(val + rp[m+1][n][o][i] + rp[m][n][o+1][i] + rp[m+1][n][o+1][i]));
          n=Npuntiy-1;
          r8= rp[m][n][o].map((val,i)=>
             0.25*(val + rp[m+1][n][o][i] + rp[m][n][o+1][i] + rp[m+1][n][o+1][i]));
        }
      }

      celle_cap[r]   = [...r1, ...r2, ...r3, ...r4];
      celle_cap[r+1] = [...r5, ...r6, ...r7, ...r8];

      // Nodi(r,:) = rp(m,1,o) => TS => rp[m][0][o], 
      // Nodi(r+1,:) = rp(m,Npuntiy,o) => rp[m][Npuntiy-1][o]
      Nodi[r]   = rp[m][0][o];
      Nodi[r+1] = rp[m][Npuntiy-1][o];

      // sup e lunghezze
      const sup1 = surfa_old(celle_cap[r],   weights_five, roots_five);
      const sup2 = surfa_old(celle_cap[r+1], weights_five, roots_five);
      Sup_c[r]   = sup1;
      Sup_c[r+1] = sup2;

      // "Per il calcolo della lunghezza e della larghezza assumo che l_c sia nella direzione 2 e che width_c nella direzione 1"
      l_c[r]       = Math.abs(mean_length_P(celle_cap[r],   2));
      width_c[r]   = Math.abs(mean_length_P(celle_cap[r],   1));
      l_c[r+1]     = Math.abs(mean_length_P(celle_cap[r+1], 2));
      width_c[r+1] = Math.abs(mean_length_P(celle_cap[r+1], 1));

      r += 2;
    }
  }

  //----------------------------------------------------------------------
  //                (3) Loop su O e N => Faccia V e VI (yz)
  //----------------------------------------------------------------------
  // for o=1..Npuntiz, for n=1..Npuntiy
  for (let o = 0; o < Npuntiz; o++) {
    for (let n = 0; n < Npuntiy; n++) {
      // r1..r8
      let r1: number[], r2: number[], r3: number[], r4: number[];
      let r5: number[], r6: number[], r7: number[], r8: number[];

      // r1,r5
      if (o===0) {
        if (n===0) {
          let m=0;   r1 = rp[m][n][o];
          m = Npuntix - 1;  r5 = rp[m][n][o];
        } else {
          let m=0;
          r1 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n-1][o][i]));
          m = Npuntix - 1;
          r5 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n-1][o][i]));
        }
      } else {
        if (n===0) {
          let m=0;
          r1 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o-1][i]));
          m = Npuntix - 1;
          r5 = rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o-1][i]));
        } else {
          let m=0;
          r1 = rp[m][n][o].map((val,i)=>
            0.25*( val + rp[m][n-1][o][i] + rp[m][n][o-1][i] + rp[m][n-1][o-1][i]));
          m= Npuntix - 1;
          r5 = rp[m][n][o].map((val,i)=>
            0.25*( val + rp[m][n-1][o][i] + rp[m][n][o-1][i] + rp[m][n-1][o-1][i]));
        }
      }

      // r2,r6
      if (o===0) {
        if (n===Npuntiy-1) {
          let m=0;   r2= rp[m][n][o];
          m= Npuntix - 1; r6= rp[m][n][o];
        } else {
          let m=0;
          r2 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n+1][o][i]));
          m= Npuntix-1;
          r6 = rp[m][n][o].map((val,i)=>0.5*(val + rp[m][n+1][o][i]));
        }
      } else {
        if (n=== Npuntiy-1) {
          let m=0;
          r2= rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o-1][i]));
          m= Npuntix-1;
          r6= rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o-1][i]));
        } else {
          let m=0;
          r2= rp[m][n][o].map((val,i)=>
             0.25*( val + rp[m][n+1][o][i] + rp[m][n][o-1][i] + rp[m][n+1][o-1][i]));
          m= Npuntix-1;
          r6= rp[m][n][o].map((val,i)=>
             0.25*( val + rp[m][n+1][o][i] + rp[m][n][o-1][i] + rp[m][n+1][o-1][i]));
        }
      }

      // r3,r7
      if (o===Npuntiz-1) {
        if (n===0) {
          let m=0;   r3= rp[m][n][o];
          m= Npuntix-1; r7= rp[m][n][o];
        } else {
          let m=0;
          r3= rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n-1][o][i]));
          m= Npuntix-1;
          r7= rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n-1][o][i]));
        }
      } else {
        if (n===0) {
          let m=0;
          r3= rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o+1][i]));
          m= Npuntix-1;
          r7= rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o+1][i]));
        } else {
          let m=0;
          r3= rp[m][n][o].map((val,i)=>
             0.25*( val + rp[m][n-1][o][i] + rp[m][n][o+1][i] + rp[m][n-1][o+1][i]));
          m= Npuntix-1;
          r7= rp[m][n][o].map((val,i)=>
             0.25*( val + rp[m][n-1][o][i] + rp[m][n][o+1][i] + rp[m][n-1][o+1][i]));
        }
      }

      // r4,r8
      if (o===Npuntiz-1) {
        if (n===Npuntiy-1) {
          let m=0;   r4= rp[m][n][o];
          m= Npuntix-1; r8= rp[m][n][o];
        } else {
          let m=0;
          r4= rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n+1][o][i]));
          m= Npuntix-1;
          r8= rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n+1][o][i]));
        }
      } else {
        if (n===Npuntiy-1) {
          let m=0;
          r4= rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o+1][i]));
          m= Npuntix-1;
          r8= rp[m][n][o].map((val,i)=>0.5*( val + rp[m][n][o+1][i]));
        } else {
          let m=0;
          r4= rp[m][n][o].map((val,i)=>
            0.25*( val + rp[m][n+1][o][i] + rp[m][n][o+1][i] + rp[m][n+1][o+1][i]));
          m= Npuntix-1;
          r8= rp[m][n][o].map((val,i)=>
            0.25*( val + rp[m][n+1][o][i] + rp[m][n][o+1][i] + rp[m][n+1][o+1][i]));
        }
      }

      celle_cap[r]   = [...r1, ...r2, ...r3, ...r4];
      celle_cap[r+1] = [...r5, ...r6, ...r7, ...r8];

      // Nodi(r,:) = rp(1,n,o) => rp[0][n][o], 
      // Nodi(r+1,:) = rp(Npuntix,n,o) => rp[Npuntix-1][n][o]
      Nodi[r]   = rp[0][n][o];
      Nodi[r+1] = rp[Npuntix-1][n][o];

      const sup1 = surfa_old(celle_cap[r],   weights_five, roots_five);
      const sup2 = surfa_old(celle_cap[r+1], weights_five, roots_five);
      Sup_c[r]   = sup1;
      Sup_c[r+1] = sup2;

      // "l_c nella direzione 1, width_c nella direzione 2"
      l_c[r]     = Math.abs(mean_length_P(celle_cap[r],   1));
      width_c[r] = Math.abs(mean_length_P(celle_cap[r],   2));
      l_c[r+1]     = Math.abs(mean_length_P(celle_cap[r+1], 1));
      width_c[r+1] = Math.abs(mean_length_P(celle_cap[r+1], 2));

      r += 2;
    }
  }

  //----------------------------------------------------------------------
  //            (4) Riduzione nodi capacitivi (NodiRed)
  //----------------------------------------------------------------------
  const NumNodiCap = Nodi.length;  // size(Nodi,1)
  // NodiRed di dimensione:
  //  Npuntix*Npuntiy*Npuntiz - (Npuntix-2)*(Npuntiy-2)*(Npuntiz-2)  (?) 
  // oppure  (Npuntiy*Npuntix + Npuntiz*Npuntix + Npuntiy*Npuntiz - ...)
  // Nel codice MATLAB c’è la riga:
  //   Npuntix*Npuntiy*Npuntiz - (Npuntix-2)*(Npuntiy-2)*(Npuntiz-2)
  // La usiamo come dimensione massima.
  const targetSize = Npuntix*Npuntiy*Npuntiz 
                     - (Npuntix-2)*(Npuntiy-2)*(Npuntiz-2);
  const NodiRed: number[][] = Array.from({ length: targetSize }, () => [0,0,0]);
  
  if (NumNodiCap > 1) {
    // Copiamo il primo nodo
    NodiRed[0] = [...Nodi[0]];
    let nodoAct = 1;

    // Per k=2..NumNodiCap => TS => k=1..NumNodiCap-1
    for (let k = 1; k < NumNodiCap; k++) {
      // Cerchiamo un nodo in NodiRed uguale (entro 1e-11)
      const candidate = Nodi[k];
      let foundIndex = -1;

      for (let i = 0; i < nodoAct; i++) {
        const dx = Math.abs(NodiRed[i][0] - candidate[0]);
        const dy = Math.abs(NodiRed[i][1] - candidate[1]);
        const dz = Math.abs(NodiRed[i][2] - candidate[2]);
        if (dx<=1e-11 && dy<=1e-11 && dz<=1e-11) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex === -1) {
        // Non trovato => aggiungiamo
        NodiRed[nodoAct] = [...candidate];
        nodoAct++;
      }
    }

    // Se nodoAct < targetSize, i restanti li lasciamo a [0,0,0] (come in MATLAB c’erano righe vuote).
    // Se vuoi “tagliare” l’array, puoi farlo:
    NodiRed.splice(nodoAct);  // Tagliamo l’array alla dimensione effettiva
  } else {
    // Se c’è 0 o 1 nodo, la riduzione è banale
    if (NumNodiCap === 1) {
      NodiRed[0] = [...Nodi[0]];
      NodiRed.splice(1);
    } else {
      // Nessun nodo => array vuoto
      NodiRed.splice(0);
    }
  }

  // Ritorno finale
  return {
    celle_cap,
    Nodi,
    Sup_c,
    l_c,
    width_c,
    NodiRed
  };
}
