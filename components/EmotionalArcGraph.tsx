
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmotionalArc } from '../types';

interface EmotionalArcGraphProps {
  arc: EmotionalArc;
  reducedMotion?: boolean;
}

const EmotionalArcGraph: React.FC<EmotionalArcGraphProps> = ({ arc }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 800;
  const height = 300;
  const padding = 40;

  // Normalize data points
  const points = arc.segments.map((seg, i) => {
    const x = padding + (i / (arc.segments.length - 1)) * (width - padding * 2);
    // Sentiment is -1 to 1. Map to height (inverted Y axis for SVG)
    // 1 -> padding (top)
    // -1 -> height - padding (bottom)
    const normalizedSentiment = (seg.sentiment + 1) / 2; // 0 to 1
    const y = (height - padding) - (normalizedSentiment * (height - padding * 2));
    return { x, y, ...seg };
  });

  // Generate Bezier Path
  const generatePath = () => {
    if (points.length === 0) return "";
    if (points.length === 1) {
        return `M ${padding} ${height/2} L ${width-padding} ${height/2}`;
    }

    const firstPoint = points[0];
    if (!firstPoint) return "";
    let d = `M ${firstPoint.x} ${firstPoint.y}`;

    for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        if (!current || !next) continue;

        // Simple smoothing control points
        const controlX1 = current.x + (next.x - current.x) / 3;
        const controlY1 = current.y;
        const controlX2 = current.x + 2 * (next.x - current.x) / 3;
        const controlY2 = next.y;

        d += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const pathData = generatePath();

  // Create gradient area under the curve
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaPathData = lastPoint && firstPoint ? `${pathData} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z` : pathData;

  return (
    <div className="w-full flex flex-col items-center">
        <div className="text-center mb-8">
            <h3 className="font-serif-display text-2xl text-white/90 mb-2">Your Emotional Arc</h3>
            <p className="text-sm text-purple-200/70 font-light italic">&quot;{arc.narrativeSummary}&quot;</p>
        </div>

        <div className="relative w-full max-w-4xl aspect-[2/1] md:aspect-[8/3]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" /> {/* Purple (Low/Negative) */}
                        <stop offset="50%" stopColor="#d946ef" /> {/* Pink (Mid) */}
                        <stop offset="100%" stopColor="#fbbf24" /> {/* Gold (High/Positive) */}
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="rgba(139, 92, 246, 0.0)" />
                        <stop offset="100%" stopColor="rgba(251, 191, 36, 0.1)" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                {/* Base Line (Neutral) */}
                <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="5,5" />

                {/* Area Fill */}
                <motion.path
                    d={areaPathData}
                    fill="url(#areaGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                />

                {/* Main Line */}
                <motion.path
                    d={pathData}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />

                {/* Interactive Points */}
                {points.map((p, i) => (
                    <g key={i}
                       onMouseEnter={() => setHoveredIndex(i)}
                       onMouseLeave={() => setHoveredIndex(null)}
                       className="cursor-pointer"
                    >
                        {/* Hit Area (Invisible but larger) */}
                        <circle cx={p.x} cy={p.y} r={20} fill="transparent" />

                        {/* Visible Dot */}
                        <motion.circle
                            cx={p.x} cy={p.y} r={4}
                            fill={p.sentiment > 0 ? "#fbbf24" : "#8b5cf6"}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 1.5 + i * 0.1 }}
                            whileHover={{ scale: 2 }}
                        />

                        {/* Active State Ring */}
                        {hoveredIndex === i && (
                            <motion.circle
                                cx={p.x} cy={p.y} r={8}
                                stroke="white" strokeWidth="1" fill="none"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: 0.5 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                            />
                        )}
                    </g>
                ))}
            </svg>

            {/* Tooltip Overlay */}
            <div className="absolute inset-0 pointer-events-none">
                 <AnimatePresence>
                    {hoveredIndex !== null && (
                         <motion.div
                            key="tooltip"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bg-black/80 backdrop-blur-md border border-white/20 px-4 py-3 rounded-xl shadow-2xl flex flex-col items-center text-center w-48 z-20"
                            style={{
                                left: points[hoveredIndex]?.x ?? 0,
                                top: (points[hoveredIndex]?.y ?? 0) - 20,
                                transform: 'translate(-50%, -100%)' // Center above point
                            }}
                         >
                             <span className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">
                                {points[hoveredIndex]?.label}
                             </span>
                             <span className="text-white text-sm leading-tight italic">
                                &quot;{points[hoveredIndex]?.text.substring(0, 50)}{(points[hoveredIndex]?.text.length ?? 0) > 50 ? '...' : ''}&quot;
                             </span>
                         </motion.div>
                    )}
                 </AnimatePresence>
            </div>
        </div>

        {/* Legend */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="flex justify-between w-full max-w-lg mt-4 text-[10px] uppercase tracking-widest text-white/30"
        >
            <span>Despair</span>
            <span>Neutral</span>
            <span>Hope</span>
        </motion.div>
    </div>
  );
};

export default EmotionalArcGraph;
