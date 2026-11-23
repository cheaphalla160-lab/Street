import React from 'react';
import { AnimalAvatarId } from '../types/game';

export const CuteSunnySunSprite: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 86,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Rotating outer warm sunbeams */}
    <g className="animate-slow-spin origin-center" style={{ transformOrigin: '60px 60px' }}>
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <path
          key={deg}
          d="M60 6 L66 20 L54 20 Z"
          fill="#FBBF24"
          stroke="#92400E"
          strokeWidth="2.2"
          strokeLinejoin="round"
          transform={`rotate(${deg} 60 60)`}
        />
      ))}
    </g>

    {/* Warm sun body */}
    <circle cx="60" cy="60" r="34" fill="#FDE047" stroke="#92400E" strokeWidth="3" />
    <circle cx="52" cy="50" r="14" fill="#FEF08A" opacity="0.65" />

    {/* Rosy cheeks */}
    <ellipse cx="42" cy="65" rx="5.5" ry="3.5" fill="#FB7185" opacity="0.7" />
    <ellipse cx="78" cy="65" rx="5.5" ry="3.5" fill="#FB7185" opacity="0.7" />

    {/* Friendly eyes */}
    <circle cx="48" cy="56" r="3.8" fill="#451A03" />
    <circle cx="49.2" cy="54.6" r="1.3" fill="#FFFFFF" />
    <circle cx="72" cy="56" r="3.8" fill="#451A03" />
    <circle cx="73.2" cy="54.6" r="1.3" fill="#FFFFFF" />

    {/* Happy smile */}
    <path
      d="M50 66 C54 73, 66 73, 70 66"
      stroke="#451A03"
      strokeWidth="3.2"
      strokeLinecap="round"
      fill="none"
    />

    {/* Tiny blue explorer scarf */}
    <path
      d="M42 86 Q60 95 78 86 L72 95 Q60 100 48 95 Z"
      fill="#2563EB"
      stroke="#1E3A8A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="60" cy="91" r="3.5" fill="#60A5FA" stroke="#1E3A8A" strokeWidth="1.8" />
  </svg>
);

export const CuteRainyCloudSprite: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 94,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 130 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Cute falling raindrops */}
    <g className="animate-rain-drop">
      <path
        d="M38 82 C38 82, 32 92, 32 96 C32 99.5, 34.7 102, 38 102 C41.3 102, 44 99.5, 44 96 C44 92, 38 82, 38 82 Z"
        fill="#38BDF8"
        stroke="#0369A1"
        strokeWidth="2.2"
      />
      <path
        d="M65 86 C65 86, 59 96, 59 100 C59 103.5, 61.7 106, 65 106 C68.3 106, 71 103.5, 71 100 C71 96, 65 86, 65 86 Z"
        fill="#60A5FA"
        stroke="#0369A1"
        strokeWidth="2.2"
      />
      <path
        d="M92 82 C92 82, 86 92, 86 96 C86 99.5, 88.7 102, 92 102 C95.3 102, 98 99.5, 98 96 C98 92, 92 82, 92 82 Z"
        fill="#38BDF8"
        stroke="#0369A1"
        strokeWidth="2.2"
      />
    </g>

    {/* Fluffy cloud puff */}
    <path
      d="M32 76 H98 C110 76 118 67 118 56 C118 46 110 38 100 37 C97 23 85 14 70 14 C57 14 46 21 41 32 C39 31 36 31 33 31 C20 31 11 41 11 53 C11 66 20 76 32 76 Z"
      fill="#E0F2FE"
      stroke="#0369A1"
      strokeWidth="3"
      strokeLinejoin="round"
    />

    {/* Inner soft highlight */}
    <path
      d="M46 34 C51 24 60 20 70 20 C80 20 89 26 92 35"
      stroke="#FFFFFF"
      strokeWidth="4"
      strokeLinecap="round"
      opacity="0.85"
    />

    {/* Rosy cheeks */}
    <ellipse cx="45" cy="58" rx="5.5" ry="3.2" fill="#FDA4AF" />
    <ellipse cx="85" cy="58" rx="5.5" ry="3.2" fill="#FDA4AF" />

    {/* Sweet eyes */}
    <circle cx="52" cy="50" r="3.6" fill="#0C4A6E" />
    <circle cx="53.2" cy="48.8" r="1.2" fill="#FFFFFF" />
    <circle cx="78" cy="50" r="3.6" fill="#0C4A6E" />
    <circle cx="79.2" cy="48.8" r="1.2" fill="#FFFFFF" />

    {/* Cheerful smile */}
    <path
      d="M58 58 C61 63, 69 63, 72 58"
      stroke="#0C4A6E"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const AnimalAvatarBadge: React.FC<{
  avatar: AnimalAvatarId;
  size?: number;
  className?: string;
}> = ({ avatar, size = 36, className = '' }) => {
  if (avatar === 'puppy') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" />
        <ellipse cx="16" cy="34" rx="7" ry="13" fill="#B45309" transform="rotate(14 16 34)" />
        <ellipse cx="48" cy="34" rx="7" ry="13" fill="#B45309" transform="rotate(-14 48 34)" />
        <circle cx="32" cy="33" r="16" fill="#FCD34D" />
        <circle cx="26" cy="30" r="2.6" fill="#451A03" />
        <circle cx="38" cy="30" r="2.6" fill="#451A03" />
        <ellipse cx="32" cy="36" rx="4" ry="2.8" fill="#451A03" />
        <path d="M27 41 Q32 45 37 41" stroke="#451A03" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (avatar === 'bunny') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#DCFCE7" stroke="#15803D" strokeWidth="2.5" />
        <ellipse cx="25" cy="18" rx="4.5" ry="12" fill="#D6D3D1" stroke="#57534E" strokeWidth="1.8" />
        <ellipse cx="39" cy="18" rx="4.5" ry="12" fill="#D6D3D1" stroke="#57534E" strokeWidth="1.8" />
        <ellipse cx="25" cy="18" rx="2.2" ry="7" fill="#FDA4AF" />
        <ellipse cx="39" cy="18" rx="2.2" ry="7" fill="#FDA4AF" />
        <circle cx="32" cy="37" r="14" fill="#E7E5E4" stroke="#57534E" strokeWidth="1.8" />
        <circle cx="27" cy="35" r="2.4" fill="#292524" />
        <circle cx="37" cy="35" r="2.4" fill="#292524" />
        <ellipse cx="32" cy="39" rx="2.5" ry="1.8" fill="#FB7185" />
        <path d="M28 43 Q32 46 36 43" stroke="#292524" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (avatar === 'duck') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
        <circle cx="32" cy="35" r="16" fill="#FDE047" stroke="#A16207" strokeWidth="2" />
        <circle cx="26" cy="31" r="2.5" fill="#1E293B" />
        <circle cx="38" cy="31" r="2.5" fill="#1E293B" />
        <ellipse cx="32" cy="38" rx="7" ry="4" fill="#FB923C" stroke="#9A3412" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2.5" />
      <polygon points="18,28 22,12 31,24" fill="#FB923C" stroke="#9A3412" strokeWidth="1.8" />
      <polygon points="46,28 42,12 33,24" fill="#FB923C" stroke="#9A3412" strokeWidth="1.8" />
      <circle cx="32" cy="36" r="15" fill="#FB923C" stroke="#9A3412" strokeWidth="1.8" />
      <path d="M19 38 Q32 48 45 38 Q42 50 32 50 Q22 50 19 38 Z" fill="#FFF7ED" />
      <circle cx="26" cy="33" r="2.4" fill="#1E293B" />
      <circle cx="38" cy="33" r="2.4" fill="#1E293B" />
      <circle cx="32" cy="40" r="2.6" fill="#1E293B" />
    </svg>
  );
};
