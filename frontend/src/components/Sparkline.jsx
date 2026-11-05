import React from 'react';

export default function Sparkline({ data = [], status = 'online', width = 80, height = 22 }) {
  const points = Array.isArray(data) ? data : [];
  const validPoints = points.filter(p => p !== null && p !== undefined);

  if (validPoints.length < 2) {
    return (
      <span className="text-[11px] font-mono text-[var(--text-muted)]">—</span>
    );
  }

  const maxVal = Math.max(...validPoints, 10);
  const minVal = Math.min(...validPoints, 0);
  const range = maxVal - minVal || 1;

  const getX = (idx) => (idx / (points.length - 1)) * width;
  const getY = (val) => {
    if (val === null) return height - 2;
    return height - 2 - ((val - minVal) / range) * (height - 4);
  };

  let strokeColor = 'var(--brand-primary)';
  if (status === 'online') strokeColor = 'var(--status-online)';
  else if (status === 'warning') strokeColor = 'var(--status-warning)';
  else if (status === 'critical' || status === 'offline') strokeColor = 'var(--status-critical)';

  let pathD = '';
  points.forEach((val, idx) => {
    if (val === null) return;
    const x = getX(idx);
    const y = getY(val);
    pathD += pathD === '' ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });

  return (
    <svg width={width} height={height} className="overflow-visible block">
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
