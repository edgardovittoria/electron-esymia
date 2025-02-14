export function interpolating_vectors(ri: number[][]): {
    rmi: number[];
    rai: number[];
    rbi: number[];
    rci: number[];
    rabi: number[];
    rbci: number[];
    raci: number[];
    rabci: number[];
  } {
    // rmi = 0.125 * sum(ri,1)
    const rmi = ri
      .reduce((sum, row) => [sum[0] + row[0], sum[1] + row[1], sum[2] + row[2]], [0, 0, 0])
      .map(x => x / 8);
  
    // rai
    const rai = [
      (-ri[0][0] + ri[1][0] - ri[2][0] + ri[3][0] - ri[4][0] + ri[5][0] - ri[6][0] + ri[7][0]) / 8,
      (-ri[0][1] + ri[1][1] - ri[2][1] + ri[3][1] - ri[4][1] + ri[5][1] - ri[6][1] + ri[7][1]) / 8,
      (-ri[0][2] + ri[1][2] - ri[2][2] + ri[3][2] - ri[4][2] + ri[5][2] - ri[6][2] + ri[7][2]) / 8
    ];
  
    // rbi
    const rbi = [
      (-ri[0][0] - ri[1][0] + ri[2][0] + ri[3][0] - ri[4][0] - ri[5][0] + ri[6][0] + ri[7][0]) / 8,
      (-ri[0][1] - ri[1][1] + ri[2][1] + ri[3][1] - ri[4][1] - ri[5][1] + ri[6][1] + ri[7][1]) / 8,
      (-ri[0][2] - ri[1][2] + ri[2][2] + ri[3][2] - ri[4][2] - ri[5][2] + ri[6][2] + ri[7][2]) / 8
    ];
  
    // rci
    const rci = [
      (-ri[0][0] - ri[1][0] - ri[2][0] - ri[3][0] + ri[4][0] + ri[5][0] + ri[6][0] + ri[7][0]) / 8,
      (-ri[0][1] - ri[1][1] - ri[2][1] - ri[3][1] + ri[4][1] + ri[5][1] + ri[6][1] + ri[7][1]) / 8,
      (-ri[0][2] - ri[1][2] - ri[2][2] - ri[3][2] + ri[4][2] + ri[5][2] + ri[6][2] + ri[7][2]) / 8
    ];
  
    // rabi
    const rabi = [
      (ri[0][0] - ri[1][0] - ri[2][0] + ri[3][0] + ri[4][0] - ri[5][0] - ri[6][0] + ri[7][0]) / 8,
      (ri[0][1] - ri[1][1] - ri[2][1] + ri[3][1] + ri[4][1] - ri[5][1] - ri[6][1] + ri[7][1]) / 8,
      (ri[0][2] - ri[1][2] - ri[2][2] + ri[3][2] + ri[4][2] - ri[5][2] - ri[6][2] + ri[7][2]) / 8
    ];
  
    // rbci
    const rbci = [
      (ri[0][0] + ri[1][0] - ri[2][0] - ri[3][0] - ri[4][0] - ri[5][0] + ri[6][0] + ri[7][0]) / 8,
      (ri[0][1] + ri[1][1] - ri[2][1] - ri[3][1] - ri[4][1] - ri[5][1] + ri[6][1] + ri[7][1]) / 8,
      (ri[0][2] + ri[1][2] - ri[2][2] - ri[3][2] - ri[4][2] - ri[5][2] + ri[6][2] + ri[7][2]) / 8
    ];
  
    // raci
    const raci = [
      (ri[0][0] - ri[1][0] - ri[3][0] + ri[2][0] - ri[4][0] + ri[5][0] + ri[7][0] - ri[6][0]) / 8,
      (ri[0][1] - ri[1][1] - ri[3][1] + ri[2][1] - ri[4][1] + ri[5][1] + ri[7][1] - ri[6][1]) / 8,
      (ri[0][2] - ri[1][2] - ri[3][2] + ri[2][2] - ri[4][2] + ri[5][2] + ri[7][2] - ri[6][2]) / 8
  ];
  
    // rabci
    const rabci = [
      (-ri[0][0] + ri[1][0] + ri[2][0] - ri[3][0] + ri[4][0] - ri[5][0] - ri[6][0] + ri[7][0]) / 8,
      (-ri[0][1] + ri[1][1] + ri[2][1] - ri[3][1] + ri[4][1] - ri[5][1] - ri[6][1] + ri[7][1]) / 8,
      (-ri[0][2] + ri[1][2] + ri[2][2] - ri[3][2] + ri[4][2] - ri[5][2] - ri[6][2] + ri[7][2]) / 8
    ];
  
    return { rmi, rai, rbi, rci, rabi, rbci, raci, rabci };
  }
  