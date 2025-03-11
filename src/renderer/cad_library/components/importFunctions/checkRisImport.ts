import * as fs from 'fs';

export interface RisBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  zMin: number;
  zMax: number;
}

function loadGeometry(data: string): { geometry: RisBox[], errorMessage: string } {
  let errorMessage = '';

  // Rimuovi eventuali spazi bianchi all'inizio e alla fine della stringa
  data = data.trim();

  // Verifica che il contenuto inizi con [ e termini con ]
  if (!data.startsWith('[') || !data.endsWith(']')) {
    errorMessage = 'Formato del file non valido: deve iniziare con [ e terminare con ]';
    return { geometry: [], errorMessage };
  }

  let rawBoxes: any[];
  try {
    rawBoxes = JSON.parse(data);
  } catch (e) {
    errorMessage = 'Formato dati non valido: non è possibile convertire il contenuto in un array';
    return { geometry: [], errorMessage };
  }

  // Verifica che ogni elemento sia un array di 6 numeri
  for (let index = 0; index < rawBoxes.length; index++) {
    const rawBox = rawBoxes[index];
    if (
      !Array.isArray(rawBox) ||
      rawBox.length !== 6 ||
      !rawBox.every((num) => typeof num === 'number')
    ) {
      errorMessage = `Formato del file non valido: l'elemento all'indice ${index} non è un array di 6 numeri`;
      return { geometry: [], errorMessage };
    }
  }

  const geometry = rawBoxes.map((rawBox) => ({
    xMin: Math.min(rawBox[0], rawBox[1]),
    xMax: Math.max(rawBox[0], rawBox[1]),
    yMin: Math.min(rawBox[2], rawBox[3]),
    yMax: Math.max(rawBox[2], rawBox[3]),
    zMin: Math.min(rawBox[4], rawBox[5]),
    zMax: Math.max(rawBox[4], rawBox[5]),
  }));

  return { geometry, errorMessage };
}

function isValidBox(box: RisBox): boolean {
  return box.xMin < box.xMax && box.yMin < box.yMax && box.zMin < box.zMax;
}

function checkOverlap(box1: RisBox, box2: RisBox): boolean {
  // Controlla se c'è una separazione lungo uno degli assi
  if (box1.xMax <= box2.xMin || box1.xMin >= box2.xMax) return false;
  if (box1.yMax <= box2.yMin || box1.yMin >= box2.yMax) return false;
  if (box1.zMax <= box2.zMin || box1.zMin >= box2.zMax) return false;
  // Se non c'è separazione lungo nessuno degli assi, allora c'è sovrapposizione
  return true;
}

function checkIntersections(geometry: RisBox[]) {
  const intersections: [RisBox, RisBox][] = [];
  const n = geometry.length;
  let message = '';
  for (let i = 0; i < n; i++) {
    const box1 = geometry[i];
    if (i === 0 && !isValidBox(box1)) {
      message = `Parallelepipedo non valido: ${JSON.stringify(box1)}`;
      continue;
    }
    for (let j = i + 1; j < n; j++) {
      const box2 = geometry[j];
      if (i === 0 && !isValidBox(box2)) {
        message = `Parallelepipedo non valido: ${JSON.stringify(box2)}`;
        continue;
      }
      if (checkOverlap(box1, box2)) {
        intersections.push([box1, box2]);
      }
    }
  }
  return {intersections: intersections, message: message};
}

export const isRisModelValid = (fileData: string) => {
  try {
    const { geometry, errorMessage } = loadGeometry(fileData);
    if (errorMessage !== '') {
      console.log(errorMessage);
      return {isModelValid: false, geometry: geometry, message: errorMessage};
    }
    const {intersections, message} = checkIntersections(geometry);
    if (message !== '') {
      console.log(message);
      return {isModelValid: false, geometry: geometry, message: message};
    }
    if (intersections.length === 0) {
      console.log('Nessun parallelepipedo si interseca.');
      return {isModelValid: true, geometry: geometry, message: 'Nessun parallelepipedo si interseca.'};
    } else {
      console.log('Ci sono parallelepipedi che si intersecano:');
      for (const [box1, box2] of intersections) {
        console.log(`Parallelepipedo 1: ${JSON.stringify(box1)}`);
        console.log(`Parallelepipedo 2: ${JSON.stringify(box2)}`);
      }
      return {isModelValid: false, geometry: geometry, message: 'Ci sono parallelepipedi che si intersecano.'};
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unknown error occurred');
    }
    return {isModelValid: false, geometry: [] as RisBox[], message: 'Errore durante il controllo del modello da importare.'};
  }
};
