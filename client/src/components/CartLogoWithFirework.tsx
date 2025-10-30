import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function CartLogoWithFirework() {
  const [showFirework, setShowFirework] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    setShowFirework(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowFirework(false), 700);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }} onClick={handleClick}>
      <Link to="/checkout" style={{ display: 'flex', alignItems: 'center' }} aria-label="Cart">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="18" r="16" fill="#ffe4e1" stroke="#d95b6b" strokeWidth="2" />
          <ellipse cx="18" cy="22" rx="8" ry="5" fill="#fff" />
          <rect x="12" y="10" width="12" height="8" rx="4" fill="#d95b6b" />
          <circle cx="14" cy="27" r="2" fill="#d95b6b" />
          <circle cx="22" cy="27" r="2" fill="#d95b6b" />
          <text x="18" y="18" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontFamily="Georgia" fill="#fff">🛒</text>
        </svg>
      </Link>
      {showFirework && (
        <svg style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} width="36" height="36" viewBox="0 0 36 36">
          <g>
            <circle cx="18" cy="18" r="2" fill="#ffd700" />
            <circle cx="8" cy="8" r="1.5" fill="#ff69b4" />
            <circle cx="28" cy="8" r="1.5" fill="#87ceeb" />
            <circle cx="8" cy="28" r="1.5" fill="#32cd32" />
            <circle cx="28" cy="28" r="1.5" fill="#ff4500" />
            <circle cx="18" cy="4" r="1.2" fill="#ffa500" />
            <circle cx="18" cy="32" r="1.2" fill="#00bfff" />
          </g>
          <animateTransform attributeName="transform" type="scale" from="1" to="1.5" begin="0s" dur="0.7s" fill="freeze" />
        </svg>
      )}
    </div>
  );
}