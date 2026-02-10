import React, { useEffect, useState, useRef } from 'react';
import { Brain, Cpu, Lock, X, PlayCircle, Activity, Scan, Database } from 'lucide-react';
import { WorldData, GeneratedContent } from '../types';
import { generateWorldBriefing } from '../services/geminiService';

interface UIOverlayProps {
  selectedWorld: WorldData | null;
  onClose: () => void;
  onEnterSimulation: (world: WorldData) => void;
}

const TypewriterText: React.FC<{ text: string; delay?: number; className?: string }> = ({ text, delay = 15, className = "" }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay]);

  return <span className={className}>{displayedText}<span className="animate-pulse text-neon-blue">_</span></span>;
};

const DataCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; color?: string }> = ({ title, icon, children, color = "text-neon-blue" }) => (
  <div className="relative group mt-6">
    {/* Corner accents */}
    <div className={`absolute -top-[1px] -left-[1px] w-3 h-3 border-t border-l border-${color === 'text-neon-pink' ? 'neon-pink' : 'neon-blue'} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
    <div className={`absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b border-r border-${color === 'text-neon-pink' ? 'neon-pink' : 'neon-blue'} opacity-50 group-hover:opacity-100 transition-opacity`}></div>

    <div className="bg-white/5 border border-white/10 p-5 rounded-sm backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
      <div className="absolute -top-3 left-4 flex items-center gap-2 bg-black px-2 border border-white/20 rounded-full group-hover:border-white/40 transition-colors">
        <span className={`${color} w-3 h-3`}>{icon}</span>
        <span className="text-[10px] font-orbitron tracking-widest text-gray-400 uppercase">{title}</span>
      </div>
      <div className="pt-2">
        {children}
      </div>
    </div>
  </div>
);

const UIOverlay: React.FC<UIOverlayProps> = ({ selectedWorld, onClose, onEnterSimulation }) => {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedWorld) {
      setLoading(true);
      setContent(null);
      generateWorldBriefing(selectedWorld.region, selectedWorld.description)
        .then(data => {
          setContent(data);
          setLoading(false);
        });
    }
  }, [selectedWorld]);

  if (!selectedWorld) {
    return (
      <div className="absolute top-0 left-0 p-8 pointer-events-none z-10 w-full h-full flex flex-col justify-between">
        <header>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-neon-blue/20 rounded-full border border-neon-blue animate-pulse shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                <Brain className="w-8 h-8 text-neon-blue" />
             </div>
             <div>
                <h1 className="text-3xl font-orbitron font-bold text-white tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                  BCI <span className="text-neon-blue">JOURNEY</span>
                </h1>
                <p className="text-gray-400 text-sm font-rajdhani tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  PHASE 1: NEURAL CARTOGRAPHY
                </p>
             </div>
          </div>
        </header>
        
        <footer className="flex justify-between items-end">
            <div className="bg-black/80 p-4 border-l-2 border-neon-blue backdrop-blur-md rounded-r-lg">
                <div className="text-xs text-gray-400 font-mono leading-relaxed">
                    <span className="text-neon-blue">SYS.STATUS:</span> ONLINE<br/>
                    <span className="text-neon-blue">NODES DETECTED:</span> 10<br/>
                    <span className="text-neon-blue">RENDER ENGINE:</span> ACTIVE
                </div>
            </div>
            <div className="text-right">
                <p className="text-electric-gold font-orbitron animate-pulse text-lg drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                  INITIALIZE NEURAL INTERFACE
                  <br/>
                  <span className="text-xs text-white opacity-70 font-rajdhani tracking-widest">SELECT A GLOWING NODE TO BEGIN</span>
                </p>
            </div>
        </footer>
      </div>
    );
  }

  // Side Panel for Selected World
  return (
    <div className="absolute top-0 right-0 w-full md:w-[500px] h-full bg-cyber-black/95 border-l border-neon-blue/30 backdrop-blur-xl p-8 z-20 transform transition-transform duration-300 flex flex-col shadow-[-10px_0_40px_rgba(0,243,255,0.15)]">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <span className="text-xs font-mono text-neon-blue px-1 border border-neon-blue/30 rounded">ID-{selectedWorld.id.toString().padStart(3, '0')}</span>
             <span className="text-xs font-mono text-gray-500">REGION_LOCK: {selectedWorld.isLocked ? "ACTIVE" : "DISABLED"}</span>
           </div>
           <h2 className="text-4xl font-orbitron font-bold text-white uppercase tracking-wider drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
             {selectedWorld.region}
           </h2>
           <div className="flex items-center gap-2 mt-2">
             <div className="h-1 w-24 rounded-full" style={{ backgroundColor: selectedWorld.color, boxShadow: `0 0 10px ${selectedWorld.color}` }}></div>
             <span className="text-xs font-rajdhani text-gray-400 uppercase tracking-widest">{selectedWorld.name}</span>
           </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all hover:rotate-90 text-white border border-transparent hover:border-white/20">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Connection Status */}
        <div className="flex items-center justify-between gap-2 mb-8 font-mono text-xs text-neon-blue border-y border-neon-blue/20 py-2 bg-neon-blue/5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 animate-bounce" />
              <span>NEURAL LINK: ESTABLISHED</span>
            </div>
            <span className="animate-pulse">100% SIGNAL</span>
        </div>

        {/* Static Info Cards with Typewriter Effect */}
        <div className="space-y-6">
           
           <DataCard title="Primary Function" icon={<Database className="w-3 h-3"/>}>
              <div className="text-white font-rajdhani text-lg leading-relaxed min-h-[4rem]">
                <TypewriterText text={selectedWorld.description} delay={10} />
              </div>
           </DataCard>

           <DataCard title="Training Objective" icon={<Cpu className="w-3 h-3"/>} color="text-neon-pink">
              <div className="text-neon-pink font-rajdhani font-bold text-lg flex items-start gap-2 min-h-[4rem]">
                 <span className="mt-1">{'>'}</span>
                 <TypewriterText text={selectedWorld.learningObjective} delay={20} />
              </div>
           </DataCard>

        </div>

        {/* AI Generated Content */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <h4 className="text-xs font-orbitron text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Scan className="w-4 h-4" /> Analyzed Intel
          </h4>
          
          {loading ? (
             <div className="flex flex-col items-center justify-center py-8 gap-4 bg-white/5 rounded border border-dashed border-white/20">
               <div className="w-8 h-8 border-2 border-t-neon-blue border-r-transparent border-b-neon-pink border-l-transparent rounded-full animate-spin"></div>
               <p className="font-mono text-xs text-neon-blue animate-pulse">DECRYPTING ARCHIVES...</p>
             </div>
          ) : content ? (
             <div className="space-y-4">
                <div className="bg-gradient-to-br from-white/5 to-transparent p-4 rounded border-l-2 border-electric-gold">
                   <h3 className="text-electric-gold font-orbitron text-lg mb-2 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-electric-gold rounded-full animate-pulse"></span>
                     {content.title}
                   </h3>
                   <p className="font-rajdhani text-gray-300 text-sm leading-relaxed">{content.briefing}</p>
                </div>

                <div className="bg-matrix-green/5 p-4 rounded border border-matrix-green/20">
                  <h4 className="text-matrix-green font-bold text-xs uppercase mb-2 flex items-center gap-2">
                    <span className="bg-matrix-green text-black px-1 rounded text-[10px]">FACT</span>
                    Did You Know?
                  </h4>
                  <p className="text-sm font-mono text-green-100/90">{content.funFact}</p>
                </div>
             </div>
          ) : (
             <div className="text-red-500 font-mono text-xs border border-red-500/30 p-4 rounded bg-red-500/5">
                ERROR: DATA CORRUPTION DETECTED. RETRY CONNECTION.
             </div>
          )}
        </div>
      </div>

      {/* Action Area */}
      <div className="mt-6 pt-6 border-t border-white/10">
         <button 
           onClick={() => !selectedWorld.isLocked && onEnterSimulation(selectedWorld)}
           className={`group relative w-full py-4 px-6 rounded-sm font-orbitron font-bold tracking-widest text-lg flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden ${
             selectedWorld.isLocked 
               ? 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800' 
               : 'bg-neon-blue text-black hover:text-white border border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.4)]'
           }`}
         >
           {/* Animated Background hover effect for button */}
           {!selectedWorld.isLocked && (
             <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0"></div>
           )}

           <span className="relative z-10 flex items-center gap-2">
             {selectedWorld.isLocked ? (
               <>
                 <Lock className="w-5 h-5" /> ACCESS DENIED
               </>
             ) : (
               <>
                 <PlayCircle className="w-5 h-5 group-hover:animate-pulse" /> ENTER SIMULATION
               </>
             )}
           </span>
         </button>
         {selectedWorld.isLocked && (
            <div className="flex justify-center mt-3">
              <span className="text-[10px] text-gray-500 font-mono uppercase border border-gray-800 px-2 py-1 rounded bg-black">
                Required: Level {selectedWorld.id - 1} Clearance
              </span>
            </div>
         )}
      </div>

    </div>
  );
};

export default UIOverlay;
