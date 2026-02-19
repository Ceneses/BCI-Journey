import React from 'react';
import { Brain, LogIn, UserPlus } from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';

interface CTASectionProps {
    navigate: NavigateFunction;
}

const CTASection: React.FC<CTASectionProps> = ({ navigate }) => (
    <>
        {/* Call to Action */}
        <section className="relative z-10 py-24 px-4 bg-gradient-to-b from-transparent to-neon-blue/5">
            <div className="max-w-xl mx-auto text-center p-8 border border-white/10 bg-black/60 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(0,100,255,0.1)]">
                <h2 className="text-2xl font-orbitron font-bold mb-4">JOIN THE NEURAL NETWORK</h2>
                <p className="text-gray-400 mb-8 font-rajdhani">Create your free account and start exploring neuroscience through immersive 3D simulations.</p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate('/signup')}
                        className="flex-1 group py-4 bg-white text-black font-orbitron font-bold tracking-widest hover:bg-neon-blue transition-colors rounded flex items-center justify-center gap-3"
                    >
                        <UserPlus className="w-5 h-5" />
                        SIGN UP FREE
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="flex-1 py-4 border border-white/20 text-white font-orbitron font-bold tracking-widest hover:bg-white/5 transition-colors rounded flex items-center justify-center gap-3"
                    >
                        <LogIn className="w-5 h-5" />
                        LOG IN
                    </button>
                </div>
                <p className="mt-6 text-[10px] text-gray-500">Sign up with WeChat · LINE · Gmail · School Email</p>
            </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 p-8 border-t border-white/5 bg-black text-center">
            <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto gap-6 opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-gray-500" />
                    <span className="font-orbitron font-bold text-sm text-gray-300">BCI JOURNEY</span>
                </div>
                <div className="text-[10px] font-mono text-gray-600">
                    © 2025 BCI EDUCATION INITIATIVE
                </div>
                <div className="flex gap-4">
                    {/* Minimalist links logic if needed */}
                </div>
            </div>
        </footer>
    </>
);

export default CTASection;
