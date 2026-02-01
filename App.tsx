import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart } from './components/Heart';
import { FloatingHearts } from './components/FloatingHearts';
import { Typewriter } from './components/Typewriter';
import { Letter } from './components/Letter';
import { QUOTES, COLORS, PHASES } from './constants';
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

  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const interactionTimeoutRef = useRef<number | null>(null);

  const syncPercentage = Math.min(
    (state.interactionCount * 0.8) + (scrollProgress * 0.5), 
    100
  );

  useEffect(() => {
    if (state.isAudioEnabled && state.hasStarted) {
      // Dynamic audio rate based on sync percentage and interaction
      audioService.setRate(state.heartRate);
    }
  }, [state.heartRate, state.isAudioEnabled, state.hasStarted]);

  const incrementInteraction = useCallback(() => {
    setState(prev => {
      const newCount = prev.interactionCount + 1;
      
      // Every 5 clicks or significant scroll progress advances the narrative
      const totalNarrativeSteps = QUOTES.length;
      const progressBasedIndex = Math.floor((syncPercentage / 100) * totalNarrativeSteps);
      const newQuoteIndex = Math.min(progressBasedIndex, totalNarrativeSteps - 1);
      
      const spikedRate = Math.min(prev.heartRate + 3, 140);
      
      return {
        ...prev,
        interactionCount: newCount,
        heartRate: spikedRate,
        currentQuoteIndex: newQuoteIndex,
        isFinished: syncPercentage >= 100
      };
    });

    if (interactionTimeoutRef.current) window.clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = window.setTimeout(() => {
      setState(prev => ({
        ...prev,
        heartRate: Math.max(60 + (prev.interactionCount * 0.1), 60)
      }));
    }, 1500);
  }, [syncPercentage]);

  const handleStart = () => {
    setState(prev => ({ ...prev, hasStarted: true, isAudioEnabled: true }));
    audioService.start();
    incrementInteraction();
  };

  const handleReset = () => {
    audioService.stop();
    window.scrollTo(0, 0);
    setState({
      interactionCount: 0,
      isAudioEnabled: false,
      hasStarted: false,
      currentQuoteIndex: -1,
      heartRate: 60,
      isFinished: false
    });
    setScrollProgress(0);
  };

  useEffect(() => {
    if (!state.hasStarted) return;

    const onScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
      // Light interaction on scroll
      if (Math.random() > 0.95) incrementInteraction();
    };

    const onMouseMove = () => {
       if (Math.random() > 0.995) incrementInteraction();
    };

    window.addEventListener('scroll', onScroll);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [state.hasStarted, incrementInteraction]);

  const currentPhase = PHASES.reduce((prev, curr) => 
    syncPercentage >= curr.threshold ? curr : prev
  );

  return (
    <div className={`relative min-h-[400vh] w-full selection:bg-pink-500/30`}>
      {/* Fixed Immersive Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 transition-colors duration-1000"
          style={{ 
            background: `radial-gradient(circle at center, rgba(26, 5, 8, ${0.4 + (syncPercentage/200)}) 0%, #050102 100%)` 
          }} 
        />
        <FloatingHearts intensity={state.heartRate + (syncPercentage / 2)} />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      {/* Main Experience Wrapper */}
      {!state.hasStarted ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-center">
          <div className="fade-in max-w-lg">
            <h1 className="dancing text-7xl md:text-9xl mb-8 text-pink-100 tracking-tight drop-shadow-2xl">Heartbeat Sync</h1>
            <p className="handwriting text-3xl text-pink-300/60 mb-16 italic leading-relaxed">"Scroll, touch, and listen. Let the rhythms align."</p>
            <button 
              onClick={handleStart}
              className="group relative px-16 py-5 rounded-full border border-pink-500/40 text-pink-100 text-2xl handwriting overflow-hidden transition-all duration-500 hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">Sync Your Hearts</span>
              <div className="absolute inset-0 bg-pink-500/10 group-hover:bg-pink-500/20 transition-colors" />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-pink-500/50 shadow-[0_0_20px_#ff4d6d]" />
            </button>
            <p className="mt-12 text-[10px] uppercase tracking-[0.5em] text-pink-900/40 animate-pulse">February 2nd • A Shared Frequency</p>
          </div>
        </div>
      ) : (
        <>
          {/* Centered Interaction Core */}
          <div className="fixed inset-0 z-20 flex flex-col items-center justify-center pointer-events-none p-6">
            <div className="pointer-events-auto flex flex-col items-center">
              <Heart 
                rate={state.heartRate} 
                onClick={incrementInteraction}
                interactionCount={state.interactionCount}
              />
              <div className="mt-20 h-48 flex items-center justify-center w-full max-w-2xl px-4 text-center">
                {state.currentQuoteIndex >= 0 && (
                  <Typewriter 
                    key={state.currentQuoteIndex}
                    text={QUOTES[state.currentQuoteIndex]} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sync Progress Bar */}
          <div className="fixed top-0 left-0 w-full h-1 z-40 bg-pink-900/20">
            <div 
              className="h-full bg-gradient-to-r from-pink-900 via-pink-500 to-white shadow-[0_0_15px_rgba(255,77,109,0.8)] transition-all duration-500 ease-out"
              style={{ width: `${syncPercentage}%` }}
            />
          </div>

          {/* Side Status Indicators */}
          <div className="fixed left-8 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-6 font-mono text-[9px] text-pink-500/40 uppercase tracking-[0.3em]">
            {PHASES.map((p, i) => (
              <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${syncPercentage >= p.threshold ? 'text-pink-100' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full border border-pink-500/50 ${syncPercentage >= p.threshold ? 'bg-pink-500 shadow-[0_0_8px_#ff4d6d]' : ''}`} />
                <span>{p.title}</span>
              </div>
            ))}
          </div>

          {/* Bottom HUD */}
          <div className="fixed bottom-10 left-10 right-10 z-30 flex justify-between items-end pointer-events-none">
            <div className="space-y-1">
              <h3 className="dancing text-3xl text-pink-200/80">{currentPhase.title}</h3>
              <p className="handwriting text-lg text-pink-500/60">{currentPhase.subtitle}</p>
            </div>
            
            <div className="flex flex-col items-end gap-2 font-mono text-[10px] text-pink-500/40 tracking-widest uppercase">
              <div className="flex items-center gap-3">
                 <span>SYNC SCORE</span>
                 <span className="text-pink-100 text-lg">{Math.round(syncPercentage)}%</span>
              </div>
              <p>BPM: {Math.round(state.heartRate)}</p>
              <button 
                onClick={() => {
                   const next = !state.isAudioEnabled;
                   setState(p => ({ ...p, isAudioEnabled: next }));
                   if (next) audioService.start(); else audioService.stop();
                }}
                className="pointer-events-auto mt-4 p-3 rounded-full border border-pink-500/20 hover:bg-pink-500/10 transition-colors"
              >
                {state.isAudioEnabled ? 'SOUND ON' : 'MUTED'}
              </button>
            </div>
          </div>

          {/* Letter Overlay */}
          {state.isFinished && <Letter onClose={handleReset} />}

          {/* Scroll Visual Indicator */}
          {!state.isFinished && syncPercentage < 90 && (
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-40 animate-bounce pointer-events-none">
              <span className="text-[10px] tracking-[0.4em] uppercase text-pink-300">Scroll to deep sync</span>
              <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;