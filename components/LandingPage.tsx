import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, Activity, Zap, Shield } from 'lucide-react';

const LandingPage: React.FC = () => {
   const navigate = useNavigate();
   return (
      <div className="min-h-screen bg-cyber-black text-white relative overflow-hidden flex flex-col">
         {/* Background effects */}
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-black/80 to-cyber-black"></div>

         {/* Grid overlay */}
         <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

         {/* Navigation */}
         <nav className="relative z-10 px-8 py-6 flex justify-between items-center border-b border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-neon-blue/20 rounded-full border border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                  <Brain className="w-6 h-6 text-neon-blue" />
               </div>
               <h1 className="font-orbitron font-bold text-xl tracking-widest">BCI <span className="text-neon-blue">JOURNEY</span></h1>
            </div>
            <div className="flex gap-6 text-sm font-rajdhani tracking-wide text-gray-400">
               <span>PHASE 1: BETA</span>
               <span className="flex items-center gap-2"><span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> SYSTEMS ONLINE</span>
            </div>
         </nav>

         {/* Hero */}
         <main className="flex-1 flex flex-col items-center justify-center relative z-10 text-center px-4">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-1 rounded-full border border-neon-blue/30 bg-neon-blue/10 text-neon-blue text-xs font-mono tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-1000">
               <Activity className="w-3 h-3" /> NEURO-LINK INTERFACE READY
            </div>

            <h1 className="text-5xl md:text-7xl font-orbitron font-bold mb-6 tracking-tight animate-in fade-in zoom-in duration-700">
               UNLOCK THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-pink">HUMAN MIND</span>
            </h1>

            <p className="max-w-2xl text-gray-300 font-rajdhani text-lg md:text-xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
               Step into a gamified, cyber-organic exploration of the brain. Navigate neural pathways, unlock anatomical secrets, and converse with AI-powered neural avatars.
            </p>

            <button
               onClick={() => navigate('/journey')}
               className="group relative px-8 py-4 bg-neon-blue text-black font-orbitron font-bold text-lg tracking-widest overflow-hidden clip-path-polygon transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300"
            >
               <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12 opacity-50"></div>
               <span className="relative flex items-center gap-3">
                  INITIALIZE JOURNEY <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </span>
            </button>

            {/* Features Grid */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
               <div className="p-6 border border-white/10 bg-white/5 backdrop-blur-sm rounded hover:border-neon-blue/50 transition-colors group text-left">
                  <Brain className="w-8 h-8 text-neon-blue mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-orbitron text-lg mb-2">3D Exploration</h3>
                  <p className="text-sm text-gray-400 font-rajdhani">Interactive neural mapping of the human brain's core regions.</p>
               </div>
               <div className="p-6 border border-white/10 bg-white/5 backdrop-blur-sm rounded hover:border-electric-gold/50 transition-colors group text-left">
                  <Zap className="w-8 h-8 text-electric-gold mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-orbitron text-lg mb-2">AI Simulation</h3>
                  <p className="text-sm text-gray-400 font-rajdhani">Real-time dialogue with Synapse and Spark avatars.</p>
               </div>
               <div className="p-6 border border-white/10 bg-white/5 backdrop-blur-sm rounded hover:border-neon-pink/50 transition-colors group text-left">
                  <Shield className="w-8 h-8 text-neon-pink mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-orbitron text-lg mb-2">Gamified Learning</h3>
                  <p className="text-sm text-gray-400 font-rajdhani">Unlock regions, earn XP, and master neuroscience.</p>
               </div>
            </div>
         </main>

         <footer className="relative z-10 p-6 text-center text-xs text-gray-600 font-mono border-t border-white/5">
            NEURAL LINK VERSION 1.0.4 // © 2025 BCI JOURNEY
         </footer>
      </div>
   );
};
export default LandingPage;