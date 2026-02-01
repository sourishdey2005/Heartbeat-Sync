import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart } from './components/Heart';
import { FloatingHearts } from './components/FloatingHearts';
import { Typewriter } from './components/Typewriter';
import { Letter } from './components/Letter';
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
      
      // Calculate index based on interaction levels (every 7 interactions show new quote)
      const quoteThreshold = 7;
      const newQuoteIndex = Math.min(Math.floor(newCount / quoteThreshold), QUOTES.length - 1);
      
      // Final reveal happens after all quotes have been cycling or after a specific count
      const finalThreshold = (QUOTES.length) * quoteThreshold;
      const finished = newCount >= finalThreshold;
      
      // Heart rate spikes on interaction and slowly cools down
      const spikedRate = Math.min(prev.heartRate + 4, 130);
      
      return {
        ...prev,
        interactionCount: newCount,
        heartRate: spikedRate,
        currentQuoteIndex: newQuoteIndex,
        isFinished: finished
      };
    });

    // Handle cooling down the heart rate
    if (interactionTimeoutRef.current) window.clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = window.setTimeout(() => {
      setState(prev => ({
        ...prev,
        heartRate: Math.max(60 + (prev.interactionCount * 0.2), 60)
      }));
    }, 1500);
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

    let throttleTimer: number | null = null;
    const handleInput = () => {
      if (throttleTimer) return;
      throttleTimer = window.setTimeout(() => {
        incrementInteraction();
        throttleTimer = null;
      }, 100); // Throttle to prevent overwhelming state updates
    };

    window.addEventListener('scroll', handleInput);
    window.addEventListener('mousemove', handleInput);

    return () => {
      window.removeEventListener('scroll', handleInput);
      window.removeEventListener('mousemove', handleInput);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [state.hasStarted, incrementInteraction]);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center p-4 select-none">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 z-0 transition-colors duration-1000"
        style={{ 
          background: `radial-gradient(circle at center, #1a0508 0%, #050102 100%)` 
        }} 
      />

      <FloatingHearts intensity={state.heartRate} />

      {/* Subtle Dust Particles */}
      <div className="absolute inset-0 z-[1] opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center gap-12 w-full max-w-4xl">
        {!state.hasStarted ? (
          <div className="text-center fade-in">
            <h1 className="dancing text-6xl md:text-8xl mb-6 text-pink-100 tracking-tight">Heartbeat Sync</h1>
            <p className="handwriting text-2xl text-pink-300/60 mb-12 tracking-wide italic">"A rhythm shared between two souls..."</p>
            <button 
              onClick={handleStart}
              className="px-12 py-4 rounded-full border border-pink-500/30 text-pink-200 text-xl handwriting hover:bg-pink-500/10 transition-all active:scale-95 glow-button"
              style={{ boxShadow: `0 0 30px rgba(255, 77, 109, 0.15)` }}
            >
              Enter the Moment
            </button>
            <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-pink-900/50">For Feb 2 — Share Love Day</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center min-h-[450px] justify-center w-full">
              <Heart 
                rate={state.heartRate} 
                onClick={incrementInteraction}
                interactionCount={state.interactionCount}
              />
              
              <div className="mt-16 h-40 flex items-center justify-center w-full">
                {state.currentQuoteIndex >= 0 && (
                  <Typewriter 
                    key={state.currentQuoteIndex}
                    text={QUOTES[state.currentQuoteIndex]} 
                  />
                )}
              </div>
            </div>

            {/* Letter Reveal Component */}
            {state.isFinished && (
              <Letter onClose={handleReset} />
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
          className="fixed bottom-8 right-8 z-30 p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
          title="Toggle Heartbeat Sound"
        >
          {state.isAudioEnabled ? (
            <svg className="w-6 h-6 text-pink-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          ) : (
            <svg className="w-6 h-6 text-gray-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.73L19.73 21 21 19.73 4.27 3zM14 7h4V3h-6v5.18l2 2V7z"/></svg>
          )}
        </button>
      )}

      {/* Sync Status Display */}
      {state.hasStarted && !state.isFinished && (
        <div className="fixed bottom-8 left-8 z-30 pointer-events-none font-mono text-[10px] text-pink-500/30 space-y-2 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span>SYNC ACTIVE</span>
          </div>
          <p>BPM: {Math.round(state.heartRate)}</p>
          <p>DEPTH: {state.interactionCount}</p>
        </div>
      )}
      
      <style>{`
        .glow-button {
          transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .glow-button:hover {
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 40px rgba(255, 77, 109, 0.5) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default App;