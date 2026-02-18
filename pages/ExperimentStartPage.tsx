import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, Loader2, ArrowLeft } from 'lucide-react';
import { experiments } from '../data/experiments';

const ExperimentStartPage: React.FC = () => {
    const { experimentId } = useParams<{ experimentId: string }>();
    const navigate = useNavigate();
    const experiment = experiments.find((e) => e.id === experimentId);

    return (
        <div className="min-h-screen bg-cyber-black text-white font-sans relative overflow-hidden flex flex-col">
            {/* Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510]" />
            <div
                className="fixed inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,243,255,0.4) 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                }}
            />
            {/* Glow orbs */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-neon-blue/[0.04] blur-[180px] pointer-events-none" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-500/[0.05] blur-[120px] pointer-events-none" />

            {/* Nav */}
            <nav className="relative z-50 px-6 md:px-8 py-5 flex justify-between items-center bg-black/60 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                    <div className="p-2 bg-neon-blue/20 rounded-full border border-neon-blue/40 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                        <Brain className="w-5 h-5 text-neon-blue" />
                    </div>
                    <h1 className="font-orbitron font-bold text-lg tracking-widest">
                        BCI <span className="text-neon-blue">JOURNEY</span>
                    </h1>
                </div>
                <button
                    onClick={() => navigate(`/bcilab/${experimentId}`)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-rajdhani"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Setup
                </button>
            </nav>

            {/* Centered loading content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
                {/* Animated loader */}
                <div className="relative mb-10">
                    {/* Outer ring */}
                    <div className="w-32 h-32 rounded-full border-2 border-neon-blue/20 flex items-center justify-center animate-pulse-slow">
                        {/* Spinning ring */}
                        <div
                            className="absolute inset-0 rounded-full border-2 border-transparent"
                            style={{
                                borderTopColor: '#00f3ff',
                                borderRightColor: '#8b5cf680',
                                animation: 'spin 2s linear infinite',
                            }}
                        />
                        {/* Inner spinning ring reversed */}
                        <div
                            className="absolute inset-3 rounded-full border border-transparent"
                            style={{
                                borderBottomColor: '#ff00ff80',
                                borderLeftColor: '#00ff4160',
                                animation: 'spin 3s linear infinite reverse',
                            }}
                        />
                        {/* Center icon */}
                        <Brain className="w-12 h-12 text-neon-blue drop-shadow-[0_0_20px_rgba(0,243,255,0.5)]" />
                    </div>
                    {/* Glow pulse */}
                    <div className="absolute inset-0 rounded-full bg-neon-blue/10 blur-xl animate-pulse-slow" />
                </div>

                {/* Text */}
                <h2 className="font-orbitron font-bold text-2xl md:text-3xl mb-3 tracking-wider text-center">
                    {experiment ? experiment.title : 'Experiment'}
                </h2>
                <p className="text-gray-400 font-rajdhani text-lg mb-2 text-center">
                    Your experiment setup is loading…
                </p>
                <div className="flex items-center gap-2 text-neon-blue/60 font-mono text-xs mt-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Initializing signal processing pipeline
                </div>

                {/* Progress dots */}
                <div className="flex items-center gap-2 mt-8">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-neon-blue/60"
                            style={{
                                animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Inline keyframes for spin */}
            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default ExperimentStartPage;
