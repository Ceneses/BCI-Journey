import React, { useEffect, useState, useRef } from 'react';
import { WorldData, SimulationScript } from '../types';
import { generateSimulationScript, generateCharacterImage, generateCharacterSpeech } from '../services/geminiService';
import { decodeAudioData, playAudioBuffer } from '../utils/audioUtils';
import { Zap, Activity, ArrowRight, Loader2, Maximize, Mic, Users } from 'lucide-react';
import LiveSession from './LiveSession';

interface SimulationModeProps {
  world: WorldData;
  onExit: () => void;
  question?: string; // Optional specific question to focus on
  initialMode?: 'listen' | 'talk'; // Optional initial mode
}

type Phase = 'script' | 'selection' | 'live';
type LiveMode = 'Synapse' | 'Spark' | null;

const SimulationMode: React.FC<SimulationModeProps> = ({ world, onExit, question, initialMode }) => {
  const [script, setScript] = useState<SimulationScript | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generatingMedia, setGeneratingMedia] = useState(false);
  const [phase, setPhase] = useState<Phase>(initialMode === 'talk' ? 'selection' : 'script');
  const [liveMode, setLiveMode] = useState<LiveMode>(null);

  // Media States
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    // Initialize Audio Context
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);

    const loadScript = async () => {
      try {
        setLoading(true);
        const data = await generateSimulationScript(world.region, question);
        setScript(data);
        // Pre-load first step media
        if (data.exchanges.length > 0) {
          await loadStepMedia(data.exchanges[0], ctx);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    loadScript();

    return () => {
      ctx.close();
    };
  }, [world]);

  const loadStepMedia = async (exchange: any, ctx: AudioContext) => {
    setGeneratingMedia(true);
    setCurrentImage(null); // Clear previous to show loading state if needed

    try {
      // Parallel generation
      const [imgBase64, audioBase64] = await Promise.all([
        generateCharacterImage(exchange.imagePrompt),
        generateCharacterSpeech(exchange.text, exchange.speaker)
      ]);

      setCurrentImage(`data:image/png;base64,${imgBase64}`);

      if (audioBase64 && ctx) {
        const buffer = await decodeAudioData(audioBase64, ctx);
        playAudioBuffer(buffer, ctx);
      }
    } catch (e) {
      console.error("Media generation failed", e);
    } finally {
      setGeneratingMedia(false);
    }
  };

  const handleNext = async () => {
    if (!script) return;
    const nextIdx = currentStep + 1;
    if (nextIdx < script.exchanges.length) {
      setCurrentStep(nextIdx);
      if (audioContext) {
        await loadStepMedia(script.exchanges[nextIdx], audioContext);
      }
    } else {
      // End of sequence, transition to Live Selection
      setPhase('selection');
    }
  };

  const startLiveSession = (mode: LiveMode) => {
    setLiveMode(mode);
    setPhase('live');
  };

  const endLiveSession = () => {
    setLiveMode(null);
    onExit(); // Or return to selection? Prompt says "End session by encouraging... to check Lesson Learned", implying end of flow.
  };

  if (loading || !script) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-cyber-black text-neon-blue">
        <Loader2 className="w-16 h-16 animate-spin mb-4" />
        <h2 className="text-2xl font-orbitron animate-pulse">ESTABLISHING NEURAL LINK...</h2>
        <p className="font-mono text-sm mt-2">Connecting to {world.region} Simulation</p>
      </div>
    );
  }

  // --- Phase 3: Live Session ---
  if (phase === 'live' && liveMode) {
    return <LiveSession mode={liveMode} onClose={endLiveSession} />;
  }

  // --- Phase 2.5: Character Selection ---
  if (phase === 'selection') {
    return (
      <div className="absolute inset-0 bg-cyber-black z-50 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-orbitron text-white mb-4 tracking-widest">SIMULATION COMPLETE</h2>
          <p className="text-gray-400 font-rajdhani text-lg">Initialize Voice Link for Deeper Learning</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          {/* Synapse Option */}
          <button
            onClick={() => startLiveSession('Synapse')}
            className="group relative bg-indigo-900/20 border border-neon-blue/30 hover:border-neon-blue rounded-lg p-8 flex flex-col items-center transition-all hover:scale-105 hover:bg-neon-blue/10"
          >
            <div className="w-24 h-24 rounded-full bg-neon-blue/10 flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_#00f3ff] transition-shadow">
              <Activity className="w-12 h-12 text-neon-blue" />
            </div>
            <h3 className="text-xl font-orbitron text-neon-blue mb-2">SYNAPSE</h3>
            <p className="text-center text-gray-400 text-sm font-mono">The Biological Expert<br />"Ask me about the neurons."</p>
          </button>

          {/* Spark Option */}
          <button
            onClick={() => startLiveSession('Spark')}
            className="group relative bg-yellow-900/20 border border-electric-gold/30 hover:border-electric-gold rounded-lg p-8 flex flex-col items-center transition-all hover:scale-105 hover:bg-electric-gold/10"
          >
            <div className="w-24 h-24 rounded-full bg-electric-gold/10 flex items-center justify-center mb-6 group-hover:shadow-[0_0_20px_#ffd700] transition-shadow">
              <Zap className="w-12 h-12 text-electric-gold" />
            </div>
            <h3 className="text-xl font-orbitron text-electric-gold mb-2">SPARK</h3>
            <p className="text-center text-gray-400 text-sm font-mono">The Tech Expert<br />"Ask me about the signals."</p>
          </button>
        </div>

        <button onClick={onExit} className="mt-16 text-gray-500 hover:text-white font-mono text-xs uppercase tracking-widest hover:underline">
          Skip Voice Link & Return to Map
        </button>
      </div>
    );
  }

  // --- Phase 2: Scripted Dialogue ---
  const currentExchange = script.exchanges[currentStep];
  const isSynapse = currentExchange.speaker === 'Synapse';
  const isSpark = currentExchange.speaker === 'Spark';
  const isBoth = currentExchange.speaker === 'Both';

  return (
    <div className="absolute inset-0 bg-cyber-black z-50 flex flex-col">
      {/* HUD Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="font-orbitron text-electric-gold text-xl">SIMULATION_MODE</span>
          <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono text-gray-400">
            MODULE: {world.region}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-neon-blue to-neon-pink transition-all duration-500"
              style={{ width: `${((currentStep + 1) / script.exchanges.length) * 100}%` }}
            ></div>
          </div>
          <span className="font-mono text-xs">{currentStep + 1} / {script.exchanges.length}</span>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative overflow-hidden bg-grid-pattern flex items-center justify-center p-8">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {/* Central Visual */}
        <div className="relative w-full max-w-4xl aspect-video bg-black/80 border border-white/20 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {generatingMedia || !currentImage ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-12 h-12 text-neon-blue animate-bounce mx-auto mb-4" />
                <p className="font-mono text-neon-blue text-sm animate-pulse">RENDERING HOLOGRAPHIC DATA...</p>
              </div>
            </div>
          ) : (
            <img src={currentImage} alt="Neural Simulation" className="w-full h-full object-cover animate-in fade-in duration-700" />
          )}

          {/* Scanlines Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[url('https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif')] mix-blend-overlay bg-cover"></div>
        </div>
      </div>

      {/* Dialogue Interface */}
      <div className="h-64 bg-black/90 border-t border-white/20 p-8 flex gap-8 items-center relative">

        {/* Synapse Portrait (Left) */}
        <div className={`transition-all duration-500 transform ${isSynapse || isBoth ? 'scale-110 opacity-100' : 'scale-90 opacity-50 grayscale'}`}>
          <div className={`w-24 h-24 rounded-full border-2 border-neon-blue bg-indigo-900/20 flex items-center justify-center relative overflow-hidden transition-all duration-300 ${isSynapse || isBoth ? 'shadow-[0_0_40px_#00f3ff]' : 'shadow-[0_0_15px_#00f3ff]'}`}>
            <div className={`absolute inset-0 bg-neon-blue/20 ${isSynapse || isBoth ? 'animate-pulse' : ''}`}></div>
            <Activity className="w-10 h-10 text-neon-blue relative z-10" />
          </div>
          <p className="text-center mt-2 font-orbitron text-neon-blue text-sm tracking-widest">SYNAPSE</p>
        </div>

        {/* Text Area */}
        <div className="flex-1 h-full relative group flex flex-col">
          {/* Question Display - Moved OUTSIDE and ABOVE the dialogue box context visually, but structurally here for flex layout */}
          <div className="mb-3 px-1">
            <h3 className="font-orbitron text-sm text-neon-pink uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-neon-pink rounded-full animate-pulse"></span>
              QUERY: {script.question}
            </h3>
          </div>

          <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-6 relative">
            <p className={`font-rajdhani text-2xl leading-relaxed ${isSynapse ? 'text-neon-blue' : isSpark ? 'text-electric-gold' : 'text-white'}`}>
              "{currentExchange.text}"
            </p>

            {/* Next Button */}
            <div className="absolute bottom-6 right-6">
              <button
                onClick={handleNext}
                disabled={generatingMedia}
                className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded font-bold font-orbitron hover:bg-neon-blue hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep < script.exchanges.length - 1 ? 'CONTINUE' : 'INITIALIZE LINK'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Spark Portrait (Right) */}
        <div className={`transition-all duration-500 transform ${isSpark || isBoth ? 'scale-110 opacity-100' : 'scale-90 opacity-50 grayscale'}`}>
          <div className={`w-24 h-24 rounded-full border-2 border-electric-gold bg-yellow-900/20 flex items-center justify-center relative overflow-hidden transition-all duration-300 ${isSpark || isBoth ? 'shadow-[0_0_40px_#ffd700]' : 'shadow-[0_0_15px_#ffd700]'}`}>
            <div className={`absolute inset-0 bg-electric-gold/20 ${isSpark || isBoth ? 'animate-pulse' : ''}`}></div>
            <Zap className="w-10 h-10 text-electric-gold relative z-10" />
          </div>
          <p className="text-center mt-2 font-orbitron text-electric-gold text-sm tracking-widest">SPARK</p>
        </div>

      </div>
    </div>
  );
};

export default SimulationMode;