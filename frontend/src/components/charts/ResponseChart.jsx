import React, { useState } from 'react';

/**
 * ResponseChart component
 * Vector SVG time-series latency response curve with dynamic threshold levels,
 * area fill gradients, interactive hover coordinates, and SLA breach markers.
 */
export default function ResponseChart({ points = [], target, height = 200 }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!points || points.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-xs text-[var(--text-muted)] font-mono">
        Awaiting telemetry data collection...
      </div>
    );
  }

  const chartWidth = 800;
  const paddingLeft = 44;
  const paddingRight = 40;
  const paddingTop = 20;
  const paddingBottom = 28;

  const drawWidth = chartWidth - paddingLeft - paddingRight;
  const drawHeight = height - paddingTop - paddingBottom;

  const validVals = points.map(p => (typeof p === 'number' ? p : p.latency)).filter(v => v !== null && v !== undefined);
  const warnThreshold = target?.warning_threshold_ms || 300;
  const critThreshold = target?.critical_threshold_ms || 800;
  const maxVal = Math.max(critThreshold * 1.15, ...validVals, 100);

  const getX = (idx) => paddingLeft + (idx / (points.length - 1)) * drawWidth;
  const getY = (val) => {
    if (val === null || val === undefined) return height - paddingBottom;
    const clamped = Math.min(val, maxVal);
    return height - paddingBottom - (clamped / maxVal) * drawHeight;
  };

  // Build line & area path
  let linePath = '';
  let areaPath = '';
  let inSegment = false;

  points.forEach((p, idx) => {
    const val = typeof p === 'number' ? p : p.latency;
    const x = getX(idx);

    if (val === null || val === undefined) {
      inSegment = false;
      return;
    }

    const y = getY(val);

    if (!inSegment) {
      linePath += `M ${x} ${y}`;
      areaPath += `M ${x} ${height - paddingBottom} L ${x} ${y}`;
      inSegment = true;
    } else {
      linePath += ` L ${x} ${y}`;
      areaPath += ` L ${x} ${y}`;
    }
  });

  if (inSegment) {
    const lastValidIdx = points.reduce((acc, p, idx) => {
      const v = typeof p === 'number' ? p : p.latency;
      return v !== null && v !== undefined ? idx : acc;
    }, points.length - 1);
    areaPath += ` L ${getX(lastValidIdx)} ${height - paddingBottom} Z`;
  }

  const warnY = getY(warnThreshold);
  const critY = getY(critThreshold);

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="w-full h-auto max-w-full overflow-visible block"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <defs>
          <linearGradient id="areaSubtleGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Baseline & Grid lines */}
        <line
          x1={paddingLeft}
          x2={chartWidth - paddingRight}
          y1={height - paddingBottom}
          y2={height - paddingBottom}
          stroke="var(--chart-grid)"
          strokeWidth="1"
        />
        <line
          x1={paddingLeft}
          x2={chartWidth - paddingRight}
          y1={paddingTop}
          y2={paddingTop}
          stroke="var(--chart-grid)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Threshold lines */}
        {warnY >= paddingTop && (
          <>
            <line
              x1={paddingLeft}
              x2={chartWidth - paddingRight}
              y1={warnY}
              y2={warnY}
              stroke="var(--status-warning)"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.8"
            />
            <text
              x={chartWidth - paddingRight + 4}
              y={warnY + 3}
              fill="var(--status-warning)"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
            >
              WARN ({warnThreshold}ms)
            </text>
          </>
        )}

        {critY >= paddingTop && (
          <>
            <line
              x1={paddingLeft}
              x2={chartWidth - paddingRight}
              y1={critY}
              y2={critY}
              stroke="var(--status-critical)"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.8"
            />
            <text
              x={chartWidth - paddingRight + 4}
              y={critY + 3}
              fill="var(--status-critical)"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
            >
              CRIT ({critThreshold}ms)
            </text>
          </>
        )}

        {/* Area fill */}
        {areaPath && (
          <path d={areaPath} fill="url(#areaSubtleGradient)" />
        )}

        {/* Latency line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--brand-primary)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Interactive hover points */}
        {points.map((p, idx) => {
          const val = typeof p === 'number' ? p : p.latency;
          if (val === null || val === undefined) return null;
          const x = getX(idx);
          const y = getY(val);
          const isHovered = hoveredPoint?.idx === idx;

          return (
            <g key={idx} onMouseEnter={() => setHoveredPoint({ idx, point: p, x, y, val })}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 4.5 : 2}
                fill={isHovered ? 'var(--text-primary)' : 'var(--brand-primary)'}
                stroke="var(--bg-card)"
                strokeWidth="1.5"
                className="cursor-pointer transition-all"
              />
              {/* Invisible wider target for easier hovering */}
              <circle cx={x} cy={y} r="10" fill="transparent" className="cursor-pointer" />
            </g>
          );
        })}

        {/* X Axis Time Labels */}
        {points.map((p, idx) => {
          if (idx % Math.ceil(points.length / 6) !== 0 && idx !== points.length - 1) return null;
          const x = getX(idx);
          const timeStr = typeof p === 'object' && p.time ? p.time : `T-${points.length - idx}`;
          return (
            <text
              key={idx}
              x={x}
              y={height - 8}
              textAnchor="middle"
              fill="var(--chart-axis)"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
            >
              {timeStr}
            </text>
          );
        })}
      </svg>

      {/* Hover Tooltip Overlay */}
      {hoveredPoint && (
        <div
          className="chart-tooltip absolute z-10 px-2.5 py-1 rounded bg-[var(--chart-tooltip-bg)] border border-[var(--chart-tooltip-border)] shadow-md pointer-events-none text-xs font-mono"
          style={{
            left: `${Math.min(Math.max(10, (hoveredPoint.x / chartWidth) * 100), 85)}%`,
            top: `${Math.max(0, hoveredPoint.y - 40)}px`
          }}
        >
          <div className="text-[var(--chart-tooltip-text)] font-bold">{hoveredPoint.val} ms</div>
          <div className="text-[10px] text-[var(--chart-axis)]">
            {typeof hoveredPoint.point === 'object' ? hoveredPoint.point.time : 'Sample'}
          </div>
        </div>
      )}
    </div>
  );
}
