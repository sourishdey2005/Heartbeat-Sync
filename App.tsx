import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Heart } from './components/Heart';
import { FloatingHearts } from './components/FloatingHearts';
import { Typewriter } from './components/Typewriter';
import { Letter } from './components/Letter';
import { CHAPTERS, COLORS } from './constants';
import { HeartbeatAudio } from './services/AudioService';
import { AppState } from './types';

const audioService = new HeartbeatAudio();

const App: React.FC = () => {
  const [state, setState] = useState<AppState & { activeChapterId: string }>({
    interactionCount: 0,
    isAudioEnabled: false,
    hasStarted: false,
    currentQuoteIndex: 0,
    heartRate: 60,
    isFinished: false,
    activeChapterId: CHAPTERS[0].id
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const interactionTimeoutRef = useRef<number | null>(null);

  // Sync is a combination of how deep they've scrolled and how much they've interacted
  const syncPercentage = Math.min(
    (state.interactionCount * 0.5) + (scrollProgress * 0.7), 
    100
  );

  const currentChapter = CHAPTERS.reduce((prev, curr) => 
    syncPercentage >= curr.threshold ? curr : prev
  );

  useEffect(() => {
    if (state.isAudioEnabled && state.hasStarted) {
      audioService.setRate(state.heartRate);
    }
  }, [state.heartRate, state.isAudioEnabled, state.hasStarted]);

  const incrementInteraction = useCallback(() => {
    setState(prev => {
      const newCount = prev.interactionCount + 1;
      const spikedRate = Math.min(60 + (syncPercentage * 0.5) + (newCount * 0.2), 160);
      
      return {
        ...prev,
        interactionCount: newCount,
        heartRate: spikedRate,
        isFinished: syncPercentage >= 100
      };
    });

    if (interactionTimeoutRef.current) window.clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = window.setTimeout(() => {
      setState(prev => ({
        ...prev,
        heartRate: Math.max(60 + (syncPercentage * 0.3), 60)
      }));
    }, 2000);
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
      currentQuoteIndex: 0,
      heartRate: 60,
      isFinished: false,
      activeChapterId: CHAPTERS[0].id
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
      if (Math.random() > 0.98) incrementInteraction();
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [state.hasStarted, incrementInteraction]);

  return (
    <div className="relative min-h-[600vh] w-full selection:bg-pink-500/30 overflow-x-hidden">
      {/* Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 transition-all duration-1000 ease-in-out"
          style={{ 
            background: `radial-gradient(circle at center, ${currentChapter.color} 0%, #050102 100%)` 
          }} 
        />
        <div className="absolute inset-0 bg-vignette opacity-60" />
        <FloatingHearts intensity={state.heartRate + (syncPercentage)} />
      </div>

      {/* Start Screen */}
      {!state.hasStarted ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-center bg-black/40 backdrop-blur-sm">
          <div className="fade-in max-w-2xl px-4">
            <span className="text-[10px] tracking-[0.8em] text-pink-500/60 uppercase mb-4 block">Experimental Interactive Story</span>
            <h1 className="dancing text-8xl md:text-[10rem] mb-6 text-pink-100 tracking-tighter drop-shadow-[0_0_30px_rgba(255,77,109,0.3)]">Heartbeat Sync</h1>
            <p className="handwriting text-3xl md:text-4xl text-pink-300/50 mb-16 leading-relaxed italic">"A journey through the frequencies of love."</p>
            <button 
              onClick={handleStart}
              className="group relative px-20 py-6 rounded-full border border-pink-500/20 text-pink-100 text-2xl handwriting overflow-hidden transition-all duration-700 hover:scale-110 hover:border-pink-500/60 active:scale-95 shadow-2xl"
            >
              <span className="relative z-10 tracking-widest">Connect Souls</span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/10 to-pink-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </button>
            <p className="mt-12 text-[10px] uppercase tracking-[0.5em] text-pink-900/60 font-mono">February 2nd • The Resonance of Us</p>
          </div>
        </div>
      ) : (
        <>
          {/* Persistent Core UI */}
          <div className="fixed inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
            <div className="pointer-events-auto flex flex-col items-center max-w-4xl w-full px-6">
              
              {/* The Heart */}
              <div className="transition-transform duration-700" style={{ transform: `scale(${0.8 + (syncPercentage/500)})` }}>
                <Heart 
                  rate={state.heartRate} 
                  onClick={incrementInteraction}
                  interactionCount={state.interactionCount}
                />
              </div>

              {/* Advanced Chapter Header */}
              <div className="mt-12 text-center fade-in transition-opacity duration-700">
                <h3 className="dancing text-4xl md:text-5xl text-pink-100/90 mb-2 drop-shadow-md">
                   {currentChapter.title}
                </h3>
                <div className="h-0.5 w-12 bg-pink-500/40 mx-auto rounded-full mb-2" />
                <p className="handwriting text-xl text-pink-500/60 italic">{currentChapter.subtitle}</p>
              </div>
              
              {/* Large Narrative Box */}
              <div className="mt-12 glass-panel p-8 md:p-12 rounded-2xl w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
                <Typewriter 
                  key={currentChapter.id}
                  text={currentChapter.quote} 
                  speed={25}
                />
              </div>
            </div>
          </div>

          {/* HUD & Metadata */}
          <div className="fixed top-0 left-0 w-full h-1.5 z-40">
             <div className="absolute inset-0 bg-pink-900/10" />
             <div 
               className="h-full bg-gradient-to-r from-pink-900 via-pink-500 to-white shadow-[0_0_20px_rgba(255,77,109,1)] transition-all duration-700 ease-out"
               style={{ width: `${syncPercentage}%` }}
             />
          </div>

          {/* Chapter Navigation dots */}
          <div className="fixed right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-8">
            {CHAPTERS.map((chapter, i) => {
              const isActive = currentChapter.id === chapter.id;
              const isPast = syncPercentage >= chapter.threshold;
              return (
                <div key={chapter.id} className="relative group flex items-center justify-end">
                   <span className={`absolute right-10 text-[10px] uppercase tracking-[0.3em] font-mono transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0 text-pink-300' : 'opacity-0 translate-x-4 text-pink-500/20'}`}>
                      {chapter.title}
                   </span>
                   <div className={`w-3 h-3 rounded-full border border-pink-500/40 transition-all duration-500 ${isPast ? 'bg-pink-500 scale-125' : 'bg-transparent scale-100'} ${isActive ? 'shadow-[0_0_15px_#ff4d6d]' : ''}`} />
                </div>
              );
            })}
          </div>

          {/* Audio & Stats Control */}
          <div className="fixed bottom-10 left-10 z-30 space-y-4">
             <div className="font-mono text-[9px] text-pink-500/40 tracking-[0.4em] uppercase">
                <p>BIOMETRIC SYNC: {Math.round(syncPercentage)}%</p>
                <p>PULSE FREQ: {Math.round(state.heartRate)} BPM</p>
                <p>STATUS: {syncPercentage >= 100 ? 'ALIGNED' : 'CALIBRATING...'}</p>
             </div>
             <button 
                onClick={() => {
                   const next = !state.isAudioEnabled;
                   setState(p => ({ ...p, isAudioEnabled: next }));
                   if (next) audioService.start(); else audioService.stop();
                }}
                className="pointer-events-auto p-4 glass-panel rounded-full hover:bg-white/10 transition-all group"
              >
                {state.isAudioEnabled ? (
                  <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.73L19.73 21 21 19.73 4.27 3zM14 7h4V3h-6v5.18l2 2V7z"/></svg>
                )}
              </button>
          </div>

          {/* Letter Reveal Overlay */}
          {state.isFinished && <Letter onClose={handleReset} />}

          {/* Scroll Down Cue */}
          {!state.isFinished && (
            <div className="fixed bottom-12 right-12 z-20 flex flex-col items-center gap-4 opacity-30 animate-pulse pointer-events-none">
              <span className="text-[10px] tracking-[0.6em] uppercase text-pink-300 transform -rotate-90 origin-right translate-y-12">Deepen the Resonance</span>
              <div className="w-px h-16 bg-gradient-to-b from-pink-500 to-transparent" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
