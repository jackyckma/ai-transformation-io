'use client';

import type { AssessmentRadarPoint } from '@ai-transformation/shared';

type RadarChartProps = {
  points: AssessmentRadarPoint[];
  max?: number;
};

const WIDTH = 360;
const HEIGHT = 300;
const CENTER_X = WIDTH / 2;
const CENTER_Y = 150;
const RADIUS = 88;
const RING_STEPS = 5;

function polar(angleRad: number, radius: number): { x: number; y: number } {
  return {
    x: CENTER_X + radius * Math.cos(angleRad),
    y: CENTER_Y + radius * Math.sin(angleRad),
  };
}

export function RadarChart({ points, max = 5 }: RadarChartProps) {
  const count = points.length;
  if (count === 0) return null;

  // Start at the top (-90deg) and distribute evenly clockwise.
  const angles = points.map((_, i) => (-Math.PI / 2) + (i * 2 * Math.PI) / count);

  const ringPolygons = Array.from({ length: RING_STEPS }, (_, ringIndex) => {
    const ringRadius = (RADIUS * (ringIndex + 1)) / RING_STEPS;
    return angles
      .map((angle) => {
        const { x, y } = polar(angle, ringRadius);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  const valuePolygon = points
    .map((point, i) => {
      const ratio = Math.max(0, Math.min(1, point.value / max));
      const { x, y } = polar(angles[i], RADIUS * ratio);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full max-w-[360px]"
      role="img"
      aria-label={`Radar chart of gap scores: ${points
        .map((point) => `${point.axis} ${point.value} out of ${max}`)
        .join(', ')}`}
    >
      {ringPolygons.map((poly, i) => (
        <polygon
          key={`ring-${i}`}
          points={poly}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
        />
      ))}

      {angles.map((angle, i) => {
        const { x, y } = polar(angle, RADIUS);
        return (
          <line
            key={`spoke-${i}`}
            x1={CENTER_X}
            y1={CENTER_Y}
            x2={x}
            y2={y}
            stroke="var(--border)"
            strokeWidth={1}
          />
        );
      })}

      <polygon
        points={valuePolygon}
        fill="var(--accent)"
        fillOpacity={0.2}
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {points.map((point, i) => {
        const ratio = Math.max(0, Math.min(1, point.value / max));
        const { x, y } = polar(angles[i], RADIUS * ratio);
        return (
          <circle key={`dot-${i}`} cx={x} cy={y} r={4} fill="var(--accent)" />
        );
      })}

      {points.map((point, i) => {
        const isTop = Math.sin(angles[i]) < -0.5;
        const { x, y } = polar(angles[i], RADIUS + (isTop ? 16 : 22));
        return (
          <g key={`label-${i}`}>
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[var(--foreground)] text-[11px] font-medium"
            >
              {point.axis}
            </text>
            <text
              x={x}
              y={y + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[var(--muted)] text-[10px]"
            >
              {point.value.toFixed(1)} / {max}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
