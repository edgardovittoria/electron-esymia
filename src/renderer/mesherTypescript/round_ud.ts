export function round_ud(a: number[], b?: number): number[] {
    if (b === undefined) {
      return a.map(x => Math.round(x));
    } else {
      return a.map(x => Math.round(x * Math.pow(10, b)) / Math.pow(10, b));
    }
  }