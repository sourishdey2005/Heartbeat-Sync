import React from 'react';
import { HEART_SIZE, COLORS } from '../constants';

interface HeartProps {
  rate: number;
  onClick: () => void;
  interactionCount: number;
}

export const Heart: React.FC<HeartProps> = ({ rate, onClick, interactionCount }) => {
  const pulseDuration = 60 / rate;
  
  return (
    <div 
      className="relative cursor-pointer transition-all duration-700 hover:scale-105 active:scale-95 group"
      style={{ '--pulse-duration': `${pulseDuration}s` } as React.CSSProperties}
      onClick={onClick}
    >
      {/* Dynamic Halo Layers */}
      <div 
        className="absolute inset-0 rounded-full blur-[80px] opacity-10 transition-all duration-1000"
        style={{ 
          background: COLORS.primary,
          transform: `scale(${1.2 + (interactionCount * 0.02)})`,
        }}
      />
      
      <div 
        className="absolute inset-0 rounded-full blur-[40px] opacity-20 transition-all duration-700"
        style={{ 
          background: COLORS.secondary,
          transform: `scale(${0.8 + (interactionCount * 0.03)})`,
        }}
      />

      {/* Main SVG Heart with multiple filter layers */}
      <div className="relative z-20 pulse-animation shadow-inner">
         <svg
          width={HEART_SIZE}
          height={HEART_SIZE}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="heart-glow drop-shadow-[0_0_30px_rgba(255,77,109,0.8)]"
        >
          <defs>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: COLORS.secondary }} />
              <stop offset="100%" style={{ stopColor: COLORS.accent }} />
            </linearGradient>
            <filter id="displacementFilter">
              <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence" />
              <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="url(#heartGradient)"
            style={{ filter: interactionCount > 20 ? 'url(#displacementFilter)' : 'none' }}
          />
        </svg>
      </div>
      
      {/* Center Vitality Light */}
      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
        <div 
          className="w-24 h-24 rounded-full bg-white opacity-5 blur-2xl pulse-animation"
          style={{ animationDelay: '0.1s' }}
        />
      </div>

      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-40 transition-opacity duration-500 font-mono text-[9px] tracking-[0.5em] text-pink-400 uppercase">
         Touch to align
      </div>
    </div>
  );
};