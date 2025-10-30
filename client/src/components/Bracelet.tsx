import React from 'react';

export default function Bracelet({ size = 100 }: { size?: number }) {
  const beadCount = 12;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.35;

  const colors = ['#FFD1DC','#FFB6C1','#F7A8B8','#F4C27A','#9FE2BF','#B2E0F4','#D1B3FF','#FFE29F'];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r + 8} fill="#f3e6e3" />
      {Array.from({ length: beadCount }).map((_, i) => {
        const angle = (i / beadCount) * Math.PI * 2 - Math.PI / 2;
        const bx = cx + Math.cos(angle) * r;
        const by = cy + Math.sin(angle) * r;
        const color = colors[i % colors.length];
        return <circle key={i} cx={bx} cy={by} r={size * 0.06} fill={color} stroke="#fff" strokeWidth={1} />;
      })}
    </svg>
  );
}
