import React from 'react';
import { Brain, LogIn, UserPlus } from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';

interface NavbarProps {
    navigate: NavigateFunction;
}

const Navbar: React.FC<NavbarProps> = ({ navigate }) => (
    <nav className="relative z-50 px-8 py-6 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-blue/20 rounded-full border border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                <Brain className="w-6 h-6 text-neon-blue" />
            </div>
            <h1 className="font-orbitron font-bold text-xl tracking-widest">BCI <span className="text-neon-blue">JOURNEY</span></h1>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-rajdhani tracking-wide text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">FEATURES</a>
            <a href="#bcilab" className="hover:text-neon-blue transition-colors text-neon-blue/70">BCI LAB</a>
            <a href="#schools" className="hover:text-white transition-colors">PARTNERS</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
            <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-5 py-2 border border-white/20 text-gray-300 font-orbitron text-xs font-bold rounded hover:bg-white/10 hover:text-white transition-all"
            >
                <LogIn className="w-3.5 h-3.5" />
                LOG IN
            </button>
            <button
                onClick={() => navigate('/signup')}
                className="flex items-center gap-2 px-5 py-2 bg-neon-blue/10 border border-neon-blue/50 text-neon-blue font-orbitron text-xs font-bold rounded hover:bg-neon-blue hover:text-black transition-all"
            >
                <UserPlus className="w-3.5 h-3.5" />
                SIGN UP
            </button>
        </div>
    </nav>
);

export default Navbar;
