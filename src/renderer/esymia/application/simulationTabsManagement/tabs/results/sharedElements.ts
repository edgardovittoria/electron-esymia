export interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  borderWidth?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
}

export interface GraphsData {
  data: { datasets: Dataset[]; labels: number[] }
  options: {}
  representedFunction: string
}

export const pairs = (a: string[]) => {
  return a.flatMap((x: string) => {
    return a.flatMap((y: string) => {
      return [[x, y]]
    });
  });
}
