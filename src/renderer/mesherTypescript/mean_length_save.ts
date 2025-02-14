import { qrule } from './qrule'; 

export function mean_length_save(barra1: number[], curr_dir: number): number {
    const xi1 = [barra1[0], barra1[3], barra1[6], barra1[9]];
    const yi1 = [barra1[1], barra1[4], barra1[7], barra1[10]];
    const zi1 = [barra1[2], barra1[5], barra1[8], barra1[11]];
    const xi2 = [barra1[12], barra1[15], barra1[18], barra1[21]];
    const yi2 = [barra1[13], barra1[16], barra1[19], barra1[22]];
    const zi2 = [barra1[14], barra1[17], barra1[20], barra1[23]];

    const ri: number[][] = [
        [xi1[0], yi1[0], zi1[0]],
        [xi1[1], yi1[1], zi1[1]],
        [xi1[2], yi1[2], zi1[2]],
        [xi1[3], yi1[3], zi1[3]],
        [xi2[0], yi2[0], zi2[0]],
        [xi2[1], yi2[1], zi2[1]],
        [xi2[2], yi2[2], zi2[2]],
        [xi2[3], yi2[3], zi2[3]],
    ];

    let r1: number[];
    let r2: number[];

    if (curr_dir === 1) {
        r1 = [
            (ri[0][0] + ri[2][0] + ri[4][0] + ri[6][0]) / 4,
            (ri[0][1] + ri[2][1] + ri[4][1] + ri[6][1]) / 4,
            (ri[0][2] + ri[2][2] + ri[4][2] + ri[6][2]) / 4,
        ];
        r2 = [
            (ri[1][0] + ri[3][0] + ri[5][0] + ri[7][0]) / 4,
            (ri[1][1] + ri[3][1] + ri[5][1] + ri[7][1]) / 4,
            (ri[1][2] + ri[3][2] + ri[5][2] + ri[7][2]) / 4,
        ];
    } else if (curr_dir === 2) {
        r1 = [
            (ri[0][0] + ri[1][0] + ri[4][0] + ri[5][0]) / 4,
            (ri[0][1] + ri[1][1] + ri[4][1] + ri[5][1]) / 4,
            (ri[0][2] + ri[1][2] + ri[4][2] + ri[5][2]) / 4,
        ];
        r2 = [
            (ri[2][0] + ri[3][0] + ri[6][0] + ri[7][0]) / 4,
            (ri[2][1] + ri[3][1] + ri[6][1] + ri[7][1]) / 4,
            (ri[2][2] + ri[3][2] + ri[6][2] + ri[7][2]) / 4,
        ];
    } else {
        r1 = [
            (ri[0][0] + ri[1][0] + ri[2][0] + ri[3][0]) / 4,
            (ri[0][1] + ri[1][1] + ri[2][1] + ri[3][1]) / 4,
            (ri[0][2] + ri[1][2] + ri[2][2] + ri[3][2]) / 4,
        ];
        r2 = [
            (ri[4][0] + ri[5][0] + ri[6][0] + ri[7][0]) / 4,
            (ri[4][1] + ri[5][1] + ri[6][1] + ri[7][1]) / 4,
            (ri[4][2] + ri[5][2] + ri[6][2] + ri[7][2]) / 4,
        ];
    }

    let mean_l = Math.sqrt((r1[0] - r2[0]) ** 2 + (r1[1] - r2[1]) ** 2 + (r1[2] - r2[2]) ** 2);

    /*
    const { rootx, wex } = qrule(10, 1);
    const wey = wex;
    const rooty = rootx;
    const wez = wex;
    const rootz = rootx;
    const nlx = wex.length;
    const nly = wey.length;
    const nlz = wez.length;

    let sum_a1 = 0;
    for (let a1 = 0; a1 < nlx; a1++) {
        let sum_b1 = 0;
        for (let b1 = 0; b1 < nly; b1++) {
            let sum_c1 = 0;
            for (let c1 = 0; c1 < nlz; c1++) {
                const drai = [
                    rai[0] + rabi[0] * rooty[b1] + raci[0] * rootz[c1] + rabci[0] * rooty[b1] * rootz[c1],
                    rai[1] + rabi[1] * rooty[b1] + raci[1] * rootz[c1] + rabci[1] * rooty[b1] * rootz[c1],
                    rai[2] + rabi[2] * rooty[b1] + raci[2] * rootz[c1] + rabci[2] * rooty[b1] * rootz[c1],
                ];
                const drbi = [
                    rbi[0] + rabi[0] * rootx[a1] + rbci[0] * rootz[c1] + rabci[0] * rootx[a1] * rootz[c1],
                    rbi[1] + rabi[1] * rootx[a1] + rbci[1] * rootz[c1] + rabci[1] * rootx[a1] * rootz[c1],
                    rbi[2] + rabi[2] * rootx[a1] + rbci[2] * rootz[c1] + rabci[2] * rootx[a1] * rootz[c1],
                ];
                const drci = [
                    rci[0] + raci[0] * rootx[a1] + rbci[0] * rooty[b1] + rabci[0] * rootx[a1] * rooty[b1],
                    rci[1] + raci[1] * rootx[a1] + rbci[1] * rooty[b1] + rabci[1] * rootx[a1] * rooty[b1],
                    rci[2] + raci[2] * rootx[a1] + rbci[2] * rooty[b1] + rabci[2] * rootx[a1] * rooty[b1],
                ];
                const draim = Math.sqrt(drai[0] ** 2 + drai[1] ** 2 + drai[2] ** 2);
                const drbim = Math.sqrt(drbi[0] ** 2 + drbi[1] ** 2 + drbi[2] ** 2);
                const drcim = Math.sqrt(drci[0] ** 2 + drci[1] ** 2 + drci[2] ** 2);
                const aversi = [drai[0] / draim, drai[1] / draim, drai[2] / draim];
                const bversi = [drbi[0] / drbim, drbi[1] / drbim, drbi[2] / drbim];
                const cversi = [drci[0] / drcim, drci[1] / drcim, drci[2] / drcim];
                const stetabi = [
                    aversi[1] * bversi[2] - aversi[2] * bversi[1],
                    aversi[2] * bversi[0] - aversi[0] * bversi[2],
                    aversi[0] * bversi[1] - aversi[1] * bversi[0],
                ];
                const stetbci = [
                    bversi[1] * cversi[2] - bversi[2] * cversi[1],
                    bversi[2] * cversi[0] - bversi[0] * cversi[2],
                    bversi[0] * cversi[1] - bversi[1] * cversi[0],
                ];
                const stetcai = [
                    cversi[1] * aversi[2] - cversi[2] * aversi[1],
                    cversi[2] * aversi[0] - cversi[0] * aversi[2],
                    cversi[0] * aversi[1] - cversi[1] * aversi[0],
                ];
                const dr = Math.sqrt(draim ** 2 + drbim ** 2 + drcim ** 2);

                let stetim: number;
                let unitni: number[];
                let f: number;

                if (curr_dir === 1) {
                    stetim = Math.sqrt(stetbci[0] ** 2 + stetbci[1] ** 2 + stetbci[2] ** 2);
                    unitni = [stetbci[0] / stetim, stetbci[1] / stetim, stetbci[2] / stetim];
                    f = draim / 4;
                } else if (curr_dir === 2) {
                    stetim = Math.sqrt(stetcai[0] ** 2 + stetcai[1] ** 2 + stetcai[2] ** 2);
                    unitni = [stetcai[0] / stetim, stetcai[1] / stetim, stetcai[2] / stetim];
                    f = drbim / 4;
                } else {
                    stetim = Math.sqrt(stetabi[0] ** 2 + stetabi[1] ** 2 + stetabi[2] ** 2);
                    unitni = [stetabi[0] / stetim, stetabi[1] / stetim, stetabi[2] / stetim];
                    f = drcim / 4;
                }
                sum_c1 += wez[c1] * f;
            }
            sum_b1 += wey[b1] * sum_c1;
        }
        sum_a1 += wex[a1] * sum_b1;
    }

    mean_l = sum_a1;
    */

    return mean_l;
}
