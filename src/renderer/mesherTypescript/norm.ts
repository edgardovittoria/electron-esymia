export function norm(vec: number[]): number {
    return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  }
  