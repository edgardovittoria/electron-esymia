import { FC } from "react";
import { PolarArea } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend } from "chart.js";

// Registra gli elementi Chart.js richiesti
ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

// Plugin custom: bordo unico continuo (poligono curvo chiuso)
const continuousBorderPlugin = {
  id: "drawContinuousCurvedBorder",
  afterDatasetDraw(chart:any, args:any) {
    const meta = chart.getDatasetMeta(args.index);
    const arcs = meta.data;
    if (!arcs || arcs.length === 0) return;

    const ctx = chart.ctx;

    // Ottiene i punti estremi di ciascun settore (punto all’outerRadius sull’angolo medio del settore)
    const points = arcs.map((arc:any) => {
      const { x, y, outerRadius, startAngle, endAngle } =
        arc.getProps(["x", "y", "outerRadius", "startAngle", "endAngle"], true);
      // Prendi il punto in mezzo tra angolo inizio e fine = centro settore
      const meanAngle = (startAngle + endAngle) / 2;
      return [
        x + outerRadius * Math.cos(meanAngle),
        y + outerRadius * Math.sin(meanAngle)
      ];
    });

    // Per chiudere la linea: il primo punto va anche in fondo
    if (
      points.length > 0 &&
      (points[0][0] !== points[points.length - 1][0] ||
       points[0][1] !== points[points.length - 1][1])
    ) {
      points.push(points[0]);
    }

    // Disegna un'unica linea continua tra tutti i punti con curve morbide (bezier)
    ctx.save();
    ctx.beginPath();
    if (points.length > 1) {
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        // Per effetto morbido tipo “curveCardinalClosed” e non solo segmenti:
        // Applica Catmull-Rom to Bezier conversion oppure una curva più semplice:
        // Qui usiamo solo lineTo per semplicità, puoi sostituire con una versione bezier per maggiore morbidezza!
        ctx.lineTo(points[i][0], points[i][1]);
      }
      ctx.closePath();
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#2B74FF";
    ctx.shadowColor = "#2b74ff99";
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.restore();
  }
};

interface PolarAreaCurvedBordersProps {
  labels: string[];
  data: number[];
  title?: string;
  options: any;
}

const PolarAreaContinuousBorder: FC<PolarAreaCurvedBordersProps> = ({
  labels,
  data,
  title = "Polar Area Chart - Bordo Continuo",
  options
}) => {
  const transparent = "rgba(0,0,0,0)";
  const chartData = {
    labels,
    datasets: [
      {
        label: "Magnitude [V/m]",
        data,
        backgroundColor: labels.map(() => transparent),
        borderColor: labels.map(() => transparent),
        borderWidth: 0
      }
    ]
  };

  return (
    <PolarArea
      data={chartData}
      options={options}
      plugins={[continuousBorderPlugin]}
    />
  );
};

export default PolarAreaContinuousBorder;
