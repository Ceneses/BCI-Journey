import React from 'react';
import { Brain, Zap, Award, Beaker, ChevronRight } from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';

interface FeaturesSectionProps {
    navigate: NavigateFunction;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ navigate }) => (
    <section id="features" className="relative z-10 py-24 px-4 bg-black/40">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-orbitron font-bold text-center mb-16">
                NOT JUST A <span className="text-neon-pink">GAME</span>. <br />
                IT'S <span className="text-neon-blue">EVOLUTION</span>.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl hover:border-neon-blue/50 transition-all group hover:-translate-y-2">
                    <div className="w-16 h-16 bg-neon-blue/20 rounded-2xl flex items-center justify-center mb-6 border border-neon-blue/30 group-hover:rotate-6 transition-transform">
                        <Brain className="w-8 h-8 text-neon-blue" />
                    </div>
                    <h3 className="font-orbitron text-xl mb-3 text-white">Master Neuroscience</h3>
                    <p className="text-gray-400 font-rajdhani leading-relaxed">
                        Don't just memorize terms. <span className="text-white">Experience</span> the brain's architecture through immersive 3D mapping and interactive simulations.
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl hover:border-electric-gold/50 transition-all group hover:-translate-y-2">
                    <div className="w-16 h-16 bg-electric-gold/20 rounded-2xl flex items-center justify-center mb-6 border border-electric-gold/30 group-hover:rotate-6 transition-transform">
                        <Zap className="w-8 h-8 text-electric-gold" />
                    </div>
                    <h3 className="font-orbitron text-xl mb-3 text-white">AI-Powered Mentors</h3>
                    <p className="text-gray-400 font-rajdhani leading-relaxed">
                        Stuck on a concept? Have a real-time voice conversation with <span className="text-white">Synapse & Spark</span>, your personal AI tutors available 24/7.
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl hover:border-neon-pink/50 transition-all group hover:-translate-y-2">
                    <div className="w-16 h-16 bg-neon-pink/20 rounded-2xl flex items-center justify-center mb-6 border border-neon-pink/30 group-hover:rotate-6 transition-transform">
                        <Award className="w-8 h-8 text-neon-pink" />
                    </div>
                    <h3 className="font-orbitron text-xl mb-3 text-white">Earn Real Rewards</h3>
                    <p className="text-gray-400 font-rajdhani leading-relaxed">
                        Every quiz you pass earns you <span className="text-white">Somas</span>. Compete on global leaderboards and prove your cognitive mastery.
                    </p>
                </div>

                {/* Feature 4 — BCI Lab */}
                <div
                    onClick={() => navigate('/bcilab')}
                    className="p-8 border border-neon-blue/20 bg-neon-blue/[0.04] backdrop-blur-sm rounded-xl hover:border-neon-blue/60 transition-all group hover:-translate-y-2 cursor-pointer col-span-1 md:col-span-3 flex flex-col md:flex-row items-start md:items-center gap-6"
                >
                    <div className="w-16 h-16 bg-neon-blue/20 rounded-2xl flex items-center justify-center border border-neon-blue/40 group-hover:rotate-6 transition-transform flex-shrink-0">
                        <Beaker className="w-8 h-8 text-neon-blue" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-orbitron text-xl text-white">BCI Lab — Real Experiments</h3>
                            <span className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded-full border border-neon-blue/40 bg-neon-blue/10 text-neon-blue tracking-wider">NEW</span>
                        </div>
                        <p className="text-gray-400 font-rajdhani leading-relaxed">
                            Go beyond theory. Connect a <span className="text-white">Unicorn Hybrid Black BCI headset</span> via Bluetooth, run live 8-channel EEG signal tests, apply filters, record data, and launch real neuroscience experiments — all from your browser.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-neon-blue font-orbitron text-xs font-bold tracking-wider group-hover:gap-3 transition-all flex-shrink-0">
                        OPEN LAB <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    </section>
);

export default FeaturesSection;
