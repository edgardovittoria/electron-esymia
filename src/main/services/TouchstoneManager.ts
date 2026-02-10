import { createWriteStream } from 'fs';

export async function writeTouchstone(
    freq: number[],
    S: any,
    R_chiusura: number,
    fileNameComplete: string,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const np = S.length;
        const tab = '   ';
        const stream = createWriteStream(fileNameComplete);

        stream.on('error', (err) => reject(err));
        stream.on('finish', () => resolve());

        const header = `# hz S ma R ${numToStringAccurate(R_chiusura)} \n`;
        stream.write(header);

        for (let cf = 0; cf < freq.length; cf++) {
            let rowStart = `\n${numToStringFreq(freq[cf])}${tab}`;
            stream.write(rowStart);
            for (let i = 0; i < np; i++) {
                const realPartS = S[i][0][cf][0];
                const imPartS = S[i][0][cf][1];
                let { modulo, phaseInDeg } = buildModPhaseScatteringParameter(
                    realPartS,
                    imPartS,
                );
                if (modulo > 1) {
                    modulo = 1;
                }
                if (isNaN(modulo) || !isFinite(modulo)) {
                    modulo = 0;
                    phaseInDeg = 0.0;
                }
                const data = `${numToStringAccurate(modulo)}${tab}${numToStringAccurate(
                    phaseInDeg,
                )}${tab}`;
                stream.write(data);
                if (np > 4 && (i + 1) % Math.sqrt(np) === 0) {
                    stream.write('\n');
                    stream.write(tab);
                }
            }
        }
        stream.end();
    });
}

function numToStringFreq(val: number) {
    return val.toFixed(12);
}

function numToStringAccurate(val: number) {
    return val.toFixed(12);
}

function buildModPhaseScatteringParameter(realPart: number, imPart: number) {
    let phase = Math.atan(imPart / realPart);

    if (realPart < 0) {
        phase += Math.PI;
    }

    const modulo = Math.sqrt(realPart * realPart + imPart * imPart);
    const phaseInDeg = (180 * phase) / Math.PI;

    return { modulo, phaseInDeg };
}
