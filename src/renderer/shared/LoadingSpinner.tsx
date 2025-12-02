import React, { useEffect, useRef } from 'react';

const LoadingSpinner = ({ text }: { text: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Configuration
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 60;

        // State variables (mutable within the animation loop)
        let rotationAngle = 0;
        let progress = 0;
        const speed = 0.4;

        // Phase Constants
        const PHASE_MESHING = 1;
        const PHASE_EM_SIM = 2;

        // Colors
        const colorMesh = { r: 56, g: 189, b: 248 }; // Tailwind Sky-400
        const colorSim = { r: 251, g: 146, b: 60 };  // Tailwind Orange-400

        const drawSphereGrid = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, angle: number, completeness: number, color: { r: number, g: number, b: number }) => {
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.3 + (completeness * 0.7)})`;
            ctx.lineWidth = 1.5;

            // Draw Outline
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();

            const numLat = 6;
            const numLong = 8;

            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.clip();

            // Draw Longitude lines
            for (let i = 0; i < numLong; i++) {
                if (completeness < (i / numLong)) continue;

                let offset = (i * Math.PI / numLong) + angle;
                let ellipseWidth = Math.abs(Math.cos(offset) * r);

                ctx.beginPath();
                ctx.ellipse(cx, cy, ellipseWidth, r, 0, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`;
                ctx.stroke();

                // Draw nodes
                if (completeness > 0.8) {
                    for (let j = 1; j < numLat; j++) {
                        let y = cy - r + (j * (2 * r) / numLat);
                        let yNorm = (y - cy) / r;
                        let xWidthAtY = Math.sqrt(1 - yNorm * yNorm) * ellipseWidth;
                        let isFront = Math.cos(offset) > 0;

                        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${isFront ? 1 : 0.2})`;
                        ctx.beginPath();
                        ctx.arc(cx + xWidthAtY, y, 2, 0, Math.PI * 2);
                        ctx.arc(cx - xWidthAtY, y, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            // Draw Latitude lines
            for (let i = 1; i < numLat; i++) {
                if (completeness < (i / numLat)) continue;

                let y = cy - r + (i * (2 * r) / numLat);
                let curveDepth = Math.sin(angle) * 10;

                ctx.beginPath();
                ctx.moveTo(cx - Math.sqrt(r * r - (y - cy) * (y - cy)), y);
                ctx.quadraticCurveTo(cx, y + curveDepth, cx + Math.sqrt(r * r - (y - cy) * (y - cy)), y);
                ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`;
                ctx.stroke();
            }

            ctx.restore();
        };

        const drawEMFields = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number) => {
            ctx.save();
            ctx.lineWidth = 2;

            const numLines = 6;
            for (let i = 0; i < numLines; i++) {
                let loopScale = 1.5 + (i * 0.4);

                // Left Loop
                ctx.beginPath();
                ctx.ellipse(cx, cy, r * loopScale, r * (loopScale * 0.6), 0, Math.PI * 0.5, Math.PI * 1.5);
                ctx.setLineDash([10, 15]);
                ctx.lineDashOffset = -time * 2;
                ctx.strokeStyle = `rgba(${colorSim.r}, ${colorSim.g}, ${colorSim.b}, ${0.1 + (0.15 * (numLines - i) / numLines)})`;
                ctx.stroke();

                // Right Loop
                ctx.beginPath();
                ctx.ellipse(cx, cy, r * loopScale, r * (loopScale * 0.6), 0, Math.PI * 1.5, Math.PI * 2.5);
                ctx.stroke();
            }

            // Scalar waves
            for (let i = 0; i < 3; i++) {
                let waveRadius = r + ((time * 20 + i * 40) % 100);
                let opacity = 1 - ((waveRadius - r) / 100);
                if (opacity < 0) opacity = 0;

                ctx.beginPath();
                ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${colorSim.r}, ${colorSim.g}, ${colorSim.b}, ${opacity * 0.6})`;
                ctx.setLineDash([]);
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            ctx.restore();
        };

        const update = () => {
            progress += speed;
            if (progress > 100) progress = 0;

            // Update Phase Logic
            let currentPhase;
            let localProgress;

            // DOM Updates (Imperative for performance)


            if (progress < 50) {
                currentPhase = PHASE_MESHING;
                localProgress = progress / 50;

                if (textRef.current) {
                    textRef.current.innerText = text;
                    textRef.current.style.color = `rgb(${colorMesh.r}, ${colorMesh.g}, ${colorMesh.b})`;
                }

                if (glowRef.current) {
                    glowRef.current.style.background = `radial-gradient(circle, rgba(${colorMesh.r}, ${colorMesh.g}, ${colorMesh.b}, 0.2) 0%, rgba(0,0,0,0) 70%)`;
                }

            } else {
                currentPhase = PHASE_EM_SIM;
                localProgress = (progress - 50) / 50;

                if (textRef.current) {
                    textRef.current.innerText = text;
                    textRef.current.style.color = `rgb(${colorSim.r}, ${colorSim.g}, ${colorSim.b})`;
                }

                if (glowRef.current) {
                    glowRef.current.style.background = `radial-gradient(circle, rgba(${colorSim.r}, ${colorSim.g}, ${colorSim.b}, 0.2) 0%, rgba(0,0,0,0) 70%)`;
                }
            }

            // Drawing
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            rotationAngle += 0.02;

            if (currentPhase === PHASE_MESHING) {
                drawSphereGrid(ctx, centerX, centerY, radius, rotationAngle, localProgress, colorMesh);

                // Scanning laser
                let scanY = centerY - radius + (localProgress * 2 * radius);
                ctx.beginPath();
                ctx.moveTo(centerX - radius * 1.5, scanY);
                ctx.lineTo(centerX + radius * 1.5, scanY);
                ctx.strokeStyle = `rgba(${colorMesh.r}, ${colorMesh.g}, ${colorMesh.b}, 0.5)`;
                ctx.lineWidth = 2;
                ctx.setLineDash([2, 4]);
                ctx.stroke();
                ctx.setLineDash([]);

            } else {
                // Transition Color
                let rMix = colorMesh.r + (colorSim.r - colorMesh.r) * Math.min(localProgress * 3, 1);
                let gMix = colorMesh.g + (colorSim.g - colorMesh.g) * Math.min(localProgress * 3, 1);
                let bMix = colorMesh.b + (colorSim.b - colorMesh.b) * Math.min(localProgress * 3, 1);

                drawSphereGrid(ctx, centerX, centerY, radius, rotationAngle, 1.0, { r: rMix, g: gMix, b: bMix });

                ctx.save();
                ctx.globalAlpha = Math.min(localProgress * 2, 1);
                drawEMFields(ctx, centerX, centerY, radius, progress);
                ctx.restore();

                // Calculation Sparks
                if (Math.random() > 0.7) {
                    let randAngle = Math.random() * Math.PI * 2;
                    let randDist = radius + Math.random() * 20;
                    ctx.fillStyle = "#fff";
                    ctx.beginPath();
                    ctx.arc(centerX + Math.cos(randAngle) * randDist, centerY + Math.sin(randAngle) * randDist, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            animationRef.current = requestAnimationFrame(update);
        };

        // Start loop
        animationRef.current = requestAnimationFrame(update);

        // Cleanup
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center font-sans overflow-hidden text-slate-200">
            <div className="relative flex flex-col items-center w-[300px]">

                {/* Glow Effect */}
                <div
                    ref={glowRef}
                    className="absolute top-1/2 left-1/2 w-[200px] h-[200px] rounded-full pointer-events-none transition-colors duration-500 ease-in-out"
                    style={{ transform: 'translate(-50%, -50%) translateY(-30px)' }}
                />

                {/* Canvas */}
                <canvas
                    ref={canvasRef}
                    width={240}
                    height={240}
                    className="z-10 relative"
                />

                {/* Status Text */}
                <div
                    ref={textRef}
                    className="mt-5 text-lg font-medium tracking-wide text-center h-6 transition-colors duration-300"
                >
                    Inizializzazione...
                </div>

            </div>


        </div>
    );
};

export default LoadingSpinner;