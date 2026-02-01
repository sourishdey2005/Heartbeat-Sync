import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 30, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, speed, onComplete]);

  return (
    <div className="handwriting text-2xl md:text-3xl lg:text-4xl text-center leading-[1.8] text-pink-50/90 px-2 min-h-[12rem] md:min-h-[10rem] flex items-center justify-center italic font-light tracking-wide">
      <p className="max-w-3xl drop-shadow-sm">
        {displayedText}
        <span className="animate-pulse ml-1 opacity-60 text-pink-400">|</span>
      </p>
    </div>
  );
};
