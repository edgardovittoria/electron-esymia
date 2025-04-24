import React, { useEffect, useRef, useState } from 'react';
import { Complex } from 'complex.js';
import Plot, { PlotParams } from 'react-plotly.js';
import { useSelector } from 'react-redux';
import {
  SolverResultsElectricFields,
  solverResultsSelector,
} from '../../../../../../store/tabsAndMenuItemsSlice';
import { Layout } from 'plotly.js';

interface RadiationDiagram3DProps {
  N_circ_3D: number;
  indice_freq: number;
  selectedFreq: number;
}

export const RadiationDiagram3D: React.FC<RadiationDiagram3DProps> = ({
  N_circ_3D,
  indice_freq,
  selectedFreq,
}) => {
  const [surfaceData, setsurfaceData] = useState<any>(undefined);
  const [layout, setlayout] = useState<any>(undefined);

  const solverResults = useSelector(solverResultsSelector);

  useEffect(() => {
    if (
      (solverResults[0] as SolverResultsElectricFields).results.centri_oss_3D &&
      N_circ_3D &&
      (solverResults[0] as SolverResultsElectricFields).results.distanze_3D &&
      (solverResults[0] as SolverResultsElectricFields).results.theta_vals &&
      (solverResults[0] as SolverResultsElectricFields).results.x_grid &&
      (solverResults[0] as SolverResultsElectricFields).results.y_grid &&
      (solverResults[0] as SolverResultsElectricFields).results.z_grid &&
      (solverResults[0] as SolverResultsElectricFields).results.Ex_3D &&
      (solverResults[0] as SolverResultsElectricFields).results.baricentro
    ) {
      const theta = Array.from(
        { length: N_circ_3D },
        (_, i) => (Math.PI * i) / (N_circ_3D - 1),
      );
      const phi = Array.from(
        { length: N_circ_3D },
        (_, i) => (2 * Math.PI * i) / (N_circ_3D - 1),
      );
      const phiGrid: number[][] = [];
      const thetaGrid: number[][] = [];

      for (let i = 0; i < theta.length; i++) {
        phiGrid[i] = Array(phi.length).fill(0);
        thetaGrid[i] = Array(phi.length).fill(0);
        for (let j = 0; j < phi.length; j++) {
          phiGrid[i][j] = phi[j];
          thetaGrid[i][j] = theta[i];
        }
      }
      const ex = (
        solverResults[0] as SolverResultsElectricFields
      ).results.Ex_3D.map((row) => new Complex(row[0], row[1]));
      const ey = (
        solverResults[0] as SolverResultsElectricFields
      ).results.Ey_3D.map((row) => new Complex(row[0], row[1]));
      const ez = (
        solverResults[0] as SolverResultsElectricFields
      ).results.Ez_3D.map((row) => new Complex(row[0], row[1]));
      const hx = (
        solverResults[0] as SolverResultsElectricFields
      ).results.Hx_3D.map((row) =>
        new Complex(row[0], row[1]).conjugate(),
      );
      const hy = (
        solverResults[0] as SolverResultsElectricFields
      ).results.Hy_3D.map((row) =>
        new Complex(row[0], row[1]).conjugate(),
      );
      const hz = (
        solverResults[0] as SolverResultsElectricFields
      ).results.Hz_3D.map((row) =>
        new Complex(row[0], row[1]).conjugate(),
      );

      const nm = (
        solverResults[0] as SolverResultsElectricFields
      ).results.centri_oss_3D.map((_, i) => {
        const crossProduct = [
          ey[i].mul(hz[i]).sub(ez[i].mul(hy[i])).re,
          ez[i].mul(hx[i]).sub(ex[i].mul(hz[i])).re,
          ex[i].mul(hy[i]).sub(ey[i].mul(hx[i])).re,
        ];
        return crossProduct;
      });

      const u = (
        solverResults[0] as SolverResultsElectricFields
      ).results.distanze_3D.map(
        (d, i) =>
          d ** 2 * Math.sqrt(nm[i].reduce((sum, val) => sum + val ** 2, 0)),
      );
      const nVect = (
        solverResults[0] as SolverResultsElectricFields
      ).results.centri_oss_3D.map((center) =>
        center.map(
          (c, i) =>
            c -
            (solverResults[0] as SolverResultsElectricFields).results
              .baricentro[i],
        ),
      );
      const nMod = nVect.map((v) =>
        Math.sqrt(v.reduce((sum, val) => sum + val ** 2, 0)),
      );
      const nVers = nVect.map((v, i) => v.map((val) => val / nMod[i]));

      const dtetha = theta[1] ? theta[1] - theta[0] : Math.PI / (N_circ_3D - 1); // Handle case of N_circ_3D = 1

      const pr = (
        solverResults[0] as SolverResultsElectricFields
      ).results.centri_oss_3D.reduce((sum, _, i) => {
        const dotProduct = nm[i].reduce(
          (dp, val, j) => dp + val * nVers[i][j],
          0,
        );
        return (
          sum +
          dotProduct *
            2 *
            Math.PI *
            (solverResults[0] as SolverResultsElectricFields).results
              .distanze_3D[i] *
            Math.sin(
              (solverResults[0] as SolverResultsElectricFields).results
                .theta_vals[i],
            ) *
            (solverResults[0] as SolverResultsElectricFields).results
              .distanze_3D[i] *
            dtetha
        );
      }, 0);

      const um = pr / (4 * Math.PI);
      const d = u.map((val) => (um !== 0 ? val / um : 0));

      const dGridData = griddata(
        (
          solverResults[0] as SolverResultsElectricFields
        ).results.centri_oss_3D.map((c) => c[0]), // centri_oss_3D1
        (
          solverResults[0] as SolverResultsElectricFields
        ).results.centri_oss_3D.map((c) => c[1]), // centri_oss_3D2
        (
          solverResults[0] as SolverResultsElectricFields
        ).results.centri_oss_3D.map((c) => c[2]), // centri_oss_3D3
        d, // D
        (solverResults[0] as SolverResultsElectricFields).results.x_grid,
        (solverResults[0] as SolverResultsElectricFields).results.y_grid,
        (solverResults[0] as SolverResultsElectricFields).results.z_grid,
        'linear',
      );

      const xPlotData: number[][] = [];
      const yPlotData: number[][] = [];
      const zPlotData: number[][] = [];

      for (
        let i = 0;
        i <
        (solverResults[0] as SolverResultsElectricFields).results.x_grid.length;
        i++
      ) {
        xPlotData[i] = [];
        yPlotData[i] = [];
        zPlotData[i] = [];
        for (
          let j = 0;
          j <
          (solverResults[0] as SolverResultsElectricFields).results.x_grid[i]
            .length;
          j++
        ) {
          if (dGridData && dGridData[i] && dGridData[i][j] !== undefined) {
            xPlotData[i][j] =
              (solverResults[0] as SolverResultsElectricFields).results
                .baricentro[0] +
              dGridData[i][j] *
                Math.sin(thetaGrid[i][j]) *
                Math.cos(phiGrid[i][j]);
            yPlotData[i][j] =
              (solverResults[0] as SolverResultsElectricFields).results
                .baricentro[1] +
              dGridData[i][j] *
                Math.sin(thetaGrid[i][j]) *
                Math.sin(phiGrid[i][j]);
            zPlotData[i][j] =
              (solverResults[0] as SolverResultsElectricFields).results
                .baricentro[2] +
              dGridData[i][j] * Math.cos(thetaGrid[i][j]);
          } else {
            xPlotData[i][j] = NaN;
            yPlotData[i][j] = NaN;
            zPlotData[i][j] = NaN;
          }
        }
      }
      const surfaceData = {
        x: xPlotData,
        y: yPlotData,
        z: zPlotData,
        surfacecolor: dGridData,
        type: 'surface',
        colorscale: 'Jet',
        colorbar: {
          side: 'left',
        },
        lighting: {
          ambient: 0.8,
          diffuse: 0.5,
          specular: 0.05,
          roughness: 0.2,
          fresnel: 0.1,
        },
        lightposition: {
          x: 100,
          y: 200,
          z: 0,
        },
      };

      setsurfaceData(surfaceData);

      const layout = {
        title: {
          text: `Directivity Gain - ${(solverResults[0] as SolverResultsElectricFields).results.f[indice_freq].toExponential(1)} Hz`,
        },

        scene: {
          camera: { eye: { x: 1.87, y: 0.88, z: -0.64 } },
          xaxis: { title: 'x' },
          yaxis: { title: 'y' },
          zaxis: { title: 'z' },
          aspectmode: 'data',
        },
        autosize: true,
        modebar: {
          orientation: "v"
        },
        margin: {
          l: 150,
          r: 150,
          b: 20,
          t: 90,
        },
        paper_bgcolor: 'white',
        plot_bgcolor: 'white',
      } as Layout;
      setlayout(layout);
    }
  }, [
    (solverResults[0] as SolverResultsElectricFields).results.centri_oss_3D,
    N_circ_3D,
    (solverResults[0] as SolverResultsElectricFields).results.distanze_3D,
    (solverResults[0] as SolverResultsElectricFields).results.theta_vals,
    (solverResults[0] as SolverResultsElectricFields).results.x_grid,
    (solverResults[0] as SolverResultsElectricFields).results.y_grid,
    (solverResults[0] as SolverResultsElectricFields).results.z_grid,
    (solverResults[0] as SolverResultsElectricFields).results.Ex_3D,
    (solverResults[0] as SolverResultsElectricFields).results.baricentro,
    indice_freq,
  ]);
  return <Plot data={[surfaceData]} layout={layout} className="mt-2" />;
};

// Helper function to perform linear griddata in JavaScript
function griddata(
  xData: number[],
  yData: number[],
  zData: number[],
  v: number[],
  xGrid: number[][],
  yGrid: number[][],
  zGrid: number[][],
  method: 'linear',
): number[][] | undefined {
  if (method !== 'linear') {
    console.warn(`Griddata method "${method}" not implemented. Using linear.`);
  }
  if (
    xData.length !== yData.length ||
    xData.length !== zData.length ||
    xData.length !== v.length
  ) {
    console.error('Input arrays to griddata must have the same length.');
    return undefined;
  }

  const interpolatedGrid: number[][] = [];
  for (let i = 0; i < xGrid.length; i++) {
    interpolatedGrid[i] = [];
    for (let j = 0; j < xGrid[i].length; j++) {
      const targetX = xGrid[i][j];
      const targetY = yGrid[i][j];
      const targetZ = zGrid[i][j];

      const distances = xData.map((valX, k) =>
        Math.sqrt(
          (valX - targetX) ** 2 +
            (yData[k] - targetY) ** 2 +
            (zData[k] - targetZ) ** 2,
        ),
      );
      const closestIndices = distances
        .map((dist, index) => ({ dist, index }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 4); // Consider the 4 closest points for linear interpolation

      if (closestIndices.length < 1) {
        interpolatedGrid[i][j] = NaN;
        continue;
      }

      if (closestIndices.length === 1) {
        interpolatedGrid[i][j] = v[closestIndices[0].index];
        continue;
      }

      // Simple average of the closest points (can be improved with true linear interpolation)
      let sum = 0;
      for (const closest of closestIndices) {
        sum += v[closest.index];
      }
      interpolatedGrid[i][j] = sum / closestIndices.length;
    }
  }
  return interpolatedGrid;
}

function transposeMatrix<T>(matrix: T[][]): T[][] {
  if (!matrix || matrix.length === 0) {
    return [];
  }

  const numRows = matrix.length;
  const numCols = matrix[0].length;
  const transposedMatrix: T[][] = [];

  for (let j = 0; j < numCols; j++) {
    transposedMatrix[j] = [];
    for (let i = 0; i < numRows; i++) {
      transposedMatrix[j][i] = matrix[i][j];
    }
  }

  return transposedMatrix;
}
