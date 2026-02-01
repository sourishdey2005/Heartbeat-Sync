
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
      className="relative cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95"
      style={{ '--pulse-duration': `${pulseDuration}s` } as React.CSSProperties}
      onClick={onClick}
    >
      {/* Background Glow Layers */}
      <div 
        className="absolute inset-0 rounded-full blur-3xl opacity-20 transition-all duration-700"
        style={{ 
          background: COLORS.primary,
          transform: `scale(${1 + (interactionCount * 0.05)})`,
          filter: `blur(${40 + interactionCount * 5}px)`
        }}
      />
      
      {/* Central SVG Heart */}
      <svg
        width={HEART_SIZE}
        height={HEART_SIZE}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pulse-animation heart-glow relative z-20"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill={COLORS.primary}
        />
      </svg>
      
      {/* Inner subtle pulse light */}
      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
        <div 
          className="w-16 h-16 rounded-full bg-white opacity-10 blur-xl pulse-animation"
          style={{ animationDelay: '0.05s' }}
        />
      </div>
    </div>
  );
};
