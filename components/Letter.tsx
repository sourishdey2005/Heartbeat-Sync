import React from 'react';
import { LETTER_CONTENT } from '../constants';

interface LetterProps {
  onClose: () => void;
}

export const Letter: React.FC<LetterProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md fade-in">
      <div className="letter-paper w-full max-w-xl p-8 md:p-12 relative rotate-1 slide-up">
        {/* Paper texture overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]" />
        
        <div className="relative z-10">
          <p className="dancing text-2xl mb-6 text-pink-900/70">{LETTER_CONTENT.date}</p>
          <h2 className="dancing text-4xl mb-6 text-red-900">{LETTER_CONTENT.greeting}</h2>
          
          <div className="handwriting text-2xl md:text-3xl leading-relaxed text-gray-800 space-y-4">
            {LETTER_CONTENT.body.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          
          <div className="mt-10 text-right">
            <p className="dancing text-2xl text-pink-900/80">{LETTER_CONTENT.closing}</p>
            <p className="dancing text-3xl font-bold text-red-900 mt-2">{LETTER_CONTENT.signature}</p>
          </div>

          <button 
            onClick={onClose}
            className="mt-12 w-full py-3 border-t border-red-900/10 handwriting text-xl text-red-900/60 hover:text-red-900 transition-colors"
          >
            Click to keep this in your heart
          </button>
        </div>
        
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-red-900/5 rounded-bl-full" />
      </div>
    </div>
  );
};