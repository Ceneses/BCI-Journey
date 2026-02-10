import React, { useEffect, useState, useRef } from 'react';
import { WorldData, SimulationScript } from '../types';
import { generateSimulationScript, generateCharacterImage, generateCharacterSpeech } from '../services/geminiService';
import { decodeAudioData, playAudioBuffer } from '../utils/audioUtils';
import { Zap, Activity, ArrowRight, Loader2, Maximize } from 'lucide-react';

interface SimulationModeProps {
  world: WorldData;
  onExit: () => void;
}

const SimulationMode: React.FC<SimulationModeProps> = ({ world, onExit }) => {
  const [script, setScript] = useState<SimulationScript | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generatingMedia, setGeneratingMedia] = useState(false);
  
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
        const data = await generateSimulationScript(world.region);
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
        // End of sequence
        onExit();
    }
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
            <div className="w-24 h-24 rounded-full border-2 border-neon-blue bg-indigo-900/20 flex items-center justify-center relative overflow-hidden shadow-[0_0_20px_#00f3ff]">
                <div className="absolute inset-0 bg-neon-blue/10 animate-pulse-slow"></div>
                <Activity className="w-10 h-10 text-neon-blue relative z-10" />
            </div>
            <p className="text-center mt-2 font-orbitron text-neon-blue text-sm tracking-widest">SYNAPSE</p>
        </div>

        {/* Text Area */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-6 h-full relative group">
            <h3 className="font-mono text-xs text-gray-400 mb-2 uppercase tracking-widest">
                {script.question}
            </h3>
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
                    {currentStep < script.exchanges.length - 1 ? 'CONTINUE' : 'COMPLETE'} <ArrowRight className="w-4 h-4" />
                 </button>
            </div>
        </div>

        {/* Spark Portrait (Right) */}
        <div className={`transition-all duration-500 transform ${isSpark || isBoth ? 'scale-110 opacity-100' : 'scale-90 opacity-50 grayscale'}`}>
            <div className="w-24 h-24 rounded-full border-2 border-electric-gold bg-yellow-900/20 flex items-center justify-center relative overflow-hidden shadow-[0_0_20px_#ffd700]">
                 <div className="absolute inset-0 bg-electric-gold/10 animate-pulse-slow"></div>
                 <Zap className="w-10 h-10 text-electric-gold relative z-10" />
            </div>
            <p className="text-center mt-2 font-orbitron text-electric-gold text-sm tracking-widest">SPARK</p>
        </div>

      </div>
    </div>
  );
};

export default SimulationMode;
