
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart } from './components/Heart';
import { FloatingHearts } from './components/FloatingHearts';
import { Typewriter } from './components/Typewriter';
import { QUOTES, COLORS } from './constants';
import { HeartbeatAudio } from './services/AudioService';
import { AppState } from './types';

const audioService = new HeartbeatAudio();

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    interactionCount: 0,
    isAudioEnabled: false,
    hasStarted: false,
    currentQuoteIndex: -1,
    heartRate: 60,
    isFinished: false
  });

  const interactionTimeoutRef = useRef<number | null>(null);

  // Handle core heartbeat logic
  useEffect(() => {
    if (state.isAudioEnabled && state.hasStarted) {
      audioService.setRate(state.heartRate);
    }
  }, [state.heartRate, state.isAudioEnabled, state.hasStarted]);

  const incrementInteraction = useCallback(() => {
    setState(prev => {
      const newCount = prev.interactionCount + 1;
      const newQuoteIndex = Math.min(Math.floor(newCount / 5), QUOTES.length - 1);
      
      // Heart rate spikes on interaction and slowly cools down
      const spikedRate = Math.min(prev.heartRate + 5, 120);
      
      return {
        ...prev,
        interactionCount: newCount,
        heartRate: spikedRate,
        currentQuoteIndex: newQuoteIndex,
        isFinished: newQuoteIndex === QUOTES.length - 1 && newCount % 5 === 0
      };
    });

    // Handle cooling down the heart rate
    if (interactionTimeoutRef.current) window.clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = window.setTimeout(() => {
      setState(prev => ({
        ...prev,
        heartRate: Math.max(60 + (prev.interactionCount * 0.5), 60)
      }));
    }, 2000);
  }, []);

  const handleStart = () => {
    setState(prev => ({ ...prev, hasStarted: true, isAudioEnabled: true }));
    audioService.start();
    incrementInteraction();
  };

  const handleReset = () => {
    audioService.stop();
    setState({
      interactionCount: 0,
      isAudioEnabled: false,
      hasStarted: false,
      currentQuoteIndex: -1,
      heartRate: 60,
      isFinished: false
    });
  };

  // Mouse move / Scroll interaction
  useEffect(() => {
    if (!state.hasStarted) return;

    const handleInput = () => {
      incrementInteraction();
    };

    window.addEventListener('scroll', handleInput);
    window.addEventListener('mousemove', handleInput);

    return () => {
      window.removeEventListener('scroll', handleInput);
      window.removeEventListener('mousemove', handleInput);
    };
  }, [state.hasStarted, incrementInteraction]);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 z-0 transition-colors duration-1000"
        style={{ 
          background: `radial-gradient(circle at center, #1a0508 0%, #050102 100%)` 
        }} 
      />

      <FloatingHearts intensity={state.heartRate} />

      {/* Hero Section */}
      <div className="relative z-20 flex flex-col items-center gap-12 w-full max-w-2xl">
        {!state.hasStarted ? (
          <div className="text-center fade-in">
            <h1 className="romantic-font text-5xl md:text-7xl mb-6 text-pink-100">Heartbeat Sync</h1>
            <p className="text-pink-300 opacity-60 mb-12 tracking-widest text-sm uppercase">Feb 2 — Share Love Day</p>
            <button 
              onClick={handleStart}
              className="px-8 py-3 rounded-full border border-pink-500/30 text-pink-200 hover:bg-pink-500/10 transition-all active:scale-95 glow-button"
              style={{ boxShadow: `0 0 20px rgba(255, 77, 109, 0.2)` }}
            >
              Start the Sync
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center min-h-[350px] justify-center w-full">
              <Heart 
                rate={state.heartRate} 
                onClick={incrementInteraction}
                interactionCount={state.interactionCount}
              />
              
              <div className="mt-12 h-32 flex items-center justify-center w-full">
                {state.currentQuoteIndex >= 0 && (
                  <Typewriter 
                    key={state.currentQuoteIndex}
                    text={QUOTES[state.currentQuoteIndex]} 
                  />
                )}
              </div>
            </div>

            {/* Final Reveal Overlay */}
            {state.isFinished && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center fade-in p-8">
                <div className="text-center max-w-lg">
                  <h2 className="romantic-font text-4xl text-pink-200 mb-8 leading-relaxed">
                    "Feb 2 — I just wanted you to know you matter to me."
                  </h2>
                  <button 
                    onClick={handleReset}
                    className="text-pink-400 border-b border-pink-400/30 pb-1 hover:text-pink-100 transition-colors"
                  >
                    Experience Again
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Audio Toggle */}
      {state.hasStarted && (
        <button 
          onClick={() => {
            const next = !state.isAudioEnabled;
            setState(p => ({ ...p, isAudioEnabled: next }));
            if (next) audioService.start(); else audioService.stop();
          }}
          className="fixed bottom-8 right-8 z-30 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          {state.isAudioEnabled ? (
            <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          ) : (
            <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.73L19.73 21 21 19.73 4.27 3zM14 7h4V3h-6v5.18l2 2V7z"/></svg>
          )}
        </button>
      )}

      {/* Info labels */}
      {state.hasStarted && (
        <div className="fixed bottom-8 left-8 z-30 pointer-events-none font-mono text-xs text-pink-500/40 space-y-1">
          <p>SYNC RATE: {Math.round(state.heartRate)} BPM</p>
          <p>INTIMACY LVL: {state.interactionCount}</p>
        </div>
      )}
      
      <style>{`
        .glow-button {
          transition: 0.3s;
        }
        .glow-button:hover {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 30px rgba(255, 77, 109, 0.4) !important;
        }
      `}</style>
    </div>
  );
};

export default App;
