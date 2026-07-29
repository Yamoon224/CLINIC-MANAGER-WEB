"use client";

import { useState } from "react";

export interface BarChartDatum {
  label: string;
  value: number;
  color?: string;
}

/**
 * Small single-axis bar chart for comparing same-unit magnitudes.
 * Bars default to the primary hue; pass per-datum `color` for an ordinal
 * (severity) ramp or a status mapping — never for arbitrary "series" color.
 */
export function BarChart({
  data,
  height = 180,
  formatValue = (v: number) => v.toLocaleString("fr-FR"),
}: {
  data: BarChartDatum[];
  height?: number;
  formatValue?: (value: number) => string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = Math.min(40, Math.max(16, 240 / Math.max(1, data.length) - 12));
  const gap = 12;
  const chartWidth = data.length * (barWidth + gap) + gap;
  const plotHeight = height - 28;

  if (data.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        role="img"
        aria-label="Graphique en barres"
        width={chartWidth}
        height={height}
        className="overflow-visible"
      >
        <line
          x1={0}
          y1={plotHeight}
          x2={chartWidth}
          y2={plotHeight}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
        {data.map((d, i) => {
          const barHeight = max === 0 ? 0 : (d.value / max) * (plotHeight - 24);
          const x = gap + i * (barWidth + gap);
          const y = plotHeight - barHeight;
          const isHovered = hovered === i;
          const color = d.color ?? "var(--color-primary)";
          return (
            <g
              key={d.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "default" }}
            >
              <title>{`${d.label}: ${formatValue(d.value)}`}</title>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx={4}
                fill={color}
                opacity={isHovered ? 0.85 : 1}
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-foreground text-[11px] font-medium"
              >
                {formatValue(d.value)}
              </text>
              <text
                x={x + barWidth / 2}
                y={plotHeight + 16}
                textAnchor="middle"
                className="fill-muted text-[10px]"
              >
                {d.label.length > 12 ? `${d.label.slice(0, 11)}…` : d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
