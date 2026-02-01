import React from 'react';
import { LETTER_CONTENT } from '../constants';

interface LetterProps {
  onClose: () => void;
}

export const Letter: React.FC<LetterProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-12 perspective-1000">
        <div className="letter-paper w-full p-10 md:p-20 relative rotate-[-0.5deg] slide-up">
          {/* Paper texture overlay */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]" />
          
          <div className="relative z-10">
            <header className="mb-12 border-b border-black/5 pb-6 flex justify-between items-baseline">
              <p className="dancing text-2xl text-gray-500 italic">{LETTER_CONTENT.date}</p>
              <div className="w-12 h-12 rounded-full border-2 border-red-900/10 flex items-center justify-center grayscale opacity-30">
                 <svg className="w-6 h-6 text-red-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </div>
            </header>
            
            <h2 className="dancing text-5xl md:text-6xl mb-10 text-red-900 drop-shadow-sm">{LETTER_CONTENT.greeting}</h2>
            
            <div className="handwriting text-3xl md:text-4xl leading-[1.6] text-gray-800 space-y-8 tracking-wide">
              {LETTER_CONTENT.body.split('\n\n').map((para, i) => (
                <p key={i} className="first-letter:text-5xl first-letter:dancing first-letter:mr-1">{para}</p>
              ))}
            </div>
            
            <footer className="mt-16 pt-12 border-t border-black/5 flex flex-col items-end">
              <p className="dancing text-3xl text-gray-600">{LETTER_CONTENT.closing}</p>
              <p className="dancing text-5xl font-bold text-red-900 mt-4 signature-animate">{LETTER_CONTENT.signature}</p>
            </footer>

            <button 
              onClick={onClose}
              className="mt-16 w-full py-4 border-2 border-red-900/5 handwriting text-2xl text-red-900/40 hover:text-red-900 hover:bg-red-900/5 hover:border-red-900/20 transition-all rounded-lg"
            >
              Back to the silence
            </button>
          </div>
          
          {/* Realistic shadow effects */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white/40 blur-[2px]" />
          <div className="absolute -left-2 top-0 h-full w-2 bg-black/10 blur-[4px]" />
        </div>
        
        {/* Subtle background decoration */}
        <div className="absolute -z-10 -top-10 -right-10 w-64 h-64 bg-pink-500/10 blur-3xl rounded-full" />
      </div>

      <style>{`
         @keyframes signature {
           from { opacity: 0; transform: translateY(10px); }
           to { opacity: 1; transform: translateY(0); }
         }
         .signature-animate {
            animation: signature 2s ease-out forwards;
            animation-delay: 1.5s;
            opacity: 0;
         }
      `}</style>
    </div>
  );
};
