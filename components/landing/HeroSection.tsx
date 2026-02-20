import React from 'react';
import { ArrowRight, Activity, LogIn } from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';

interface HeroSectionProps {
    navigate: NavigateFunction;
}

const HeroSection: React.FC<HeroSectionProps> = ({ navigate }) => (
    <header className="relative z-10 pt-20 pb-32 px-4 text-center flex flex-col items-center">
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1 rounded-full border border-neon-blue/30 bg-neon-blue/10 text-neon-blue text-xs font-mono tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Activity className="w-3 h-3" /> NEURO-LINK INTERFACE READY
        </div>

        <h1 className="text-5xl md:text-8xl font-orbitron font-bold mb-6 tracking-tight animate-in fade-in zoom-in duration-700 max-w-5xl mx-auto leading-tight">
            UNLOCK YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-pink">MIND</span>
        </h1>

        <p className="max-w-2xl text-gray-300 font-rajdhani text-xl md:text-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            The world's first gamified BCI education platform. Master neuroscience through interactive 3D simulations and earn real rewards.
        </p>

        <div className="flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <button
                onClick={() => navigate('/signup')}
                className="group relative px-8 py-4 bg-neon-blue text-black font-orbitron font-bold text-lg tracking-widest overflow-hidden clip-path-polygon transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] rounded"
            >
                <span className="relative flex items-center gap-3">
                    CREATE FREE ACCOUNT <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
            </button>
            <button
                onClick={() => navigate('/login')}
                className="group px-8 py-4 border border-white/20 hover:bg-white/5 text-white font-orbitron font-bold text-lg tracking-widest rounded transition-all flex items-center justify-center gap-3"
            >
                <LogIn className="w-5 h-5" />
                LOG IN
            </button>
        </div>
    </header>
);

export default HeroSection;
