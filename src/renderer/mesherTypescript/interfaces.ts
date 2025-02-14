export interface MaterialMesher {
  name: string;
  sigmar: number;
  eps_re: number;
  tan_D: number;
  mur: number;
}
export interface Region {
  coordinate: number[][];
  cond: number[];
  epsr: number[];
  mu: number[];
  mur: number[];
  materiale: number[];
  Nx: number[];
  Ny: number[];
  Nz: number[];
  centri: number[][];
}


export interface InduttanzeBase {
    facce_indici_associazione: number[][];
    facce_estremi_celle: number[][];
    celle_superficie_estremi_celle: number[][];
    estremi_celle: number[][];
    sigma: number[];
    celle_superficie_l: number[];
    celle_superficie_w: number[];
    Zs_part?: number[];
  }


