/**
 * Genera un vettore di numeri equamente spaziati.
 * 
 * @param start Il valore iniziale della sequenza.
 * @param stop Il valore finale della sequenza.
 * @param num Il numero di punti da generare (predefinito: 100).
 * @returns Un array contenente la sequenza di numeri generata.
 */
export function linspace(start: number, stop: number, num: number = 100): number[] {
    // Crea un array vuoto per memorizzare i risultati.
    const result = []; 
  
    // Calcola l'intervallo tra ogni punto.
    const step = (stop - start) / (num - 1);
  
    // Genera la sequenza di numeri.
    for (let i = 0; i < num; i++) {
      // Calcola il valore corrente e lo aggiunge all'array.
      result.push(start + step * i); 
    }
  
    // Restituisce l'array contenente la sequenza.
    return result;
  }