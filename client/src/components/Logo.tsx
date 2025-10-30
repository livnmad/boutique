import React from 'react';

export default function Logo() {
  return (
    <svg width="420" height="90" viewBox="0 0 420 90" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Olivia's Bead Boutique">
      <rect width="100%" height="100%" fill="none" />
      <text x="50%" y="40%" dominantBaseline="middle" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="36" fill="#d95b6b">Olivia's</text>
      <text x="50%" y="72%" dominantBaseline="middle" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="34" fill="#d95b6b">Bead Boutique</text>
      <g transform="translate(24,18)" fill="#f2b6b9">
        <circle cx="6" cy="6" r="6" />
        <circle cx="28" cy="6" r="6" />
      </g>
    </svg>
  );
}
