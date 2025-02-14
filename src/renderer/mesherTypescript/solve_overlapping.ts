import { split_overlapping } from './split_overlapping';

export function solve_overlapping(
    barre: number[][],
    materiale: number[],
    materiale_dominante: number[]
): { barre: number[][]; materiale: number[] } {
    let continua: number = 1;

    while (continua) {
        continua = 0;
        let isOverlapped: number = 0;

        for (let i = 0; i < barre.length - 1; i++) {
            for (let j = i + 1; j < barre.length; j++) {
                const { barre_out: barre_split, isOverlapped, mat_out: materiale_split } = split_overlapping(
                    barre[i],
                    barre[j],
                    materiale[i],
                    materiale[j],
                    materiale_dominante
                );

                if (isOverlapped === 1) {
                    continua = 1;

                    const indicesToKeep = barre
                        .map((_, index) => index)
                        .filter(index => index !== i && index !== j);

                    const barreToKeep = indicesToKeep.map(index => barre[index]);
                    const materialeToKeep = indicesToKeep.map(index => materiale[index]);

                    barre = barre_split.concat(barreToKeep);
                    materiale = materiale_split.concat(materialeToKeep);

                    break;
                }
            }

            if (continua === 1) {
                break;
            }
        }
    }

    return { barre, materiale };
}