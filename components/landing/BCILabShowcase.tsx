import React from 'react';
import { Activity, Zap, Award, Beaker, Bluetooth, BarChart3, ChevronRight } from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';

interface BCILabShowcaseProps {
    navigate: NavigateFunction;
}

const experiments = [
    { title: 'P300 Speller', cat: 'BCI', color: '#00f3ff', desc: 'Spell words using event-related potentials from focused attention.' },
    { title: 'Motor Imagery Classifier', cat: 'Motor Imagery', color: '#ff00ff', desc: 'Decode left/right hand movement intentions in real-time.' },
    { title: 'Alpha Wave Training', cat: 'Neurofeedback', color: '#00ff41', desc: 'Train your brain to boost alpha power for relaxation and focus.' },
    { title: 'SSVEP Frequency Detector', cat: 'BCI', color: '#8b5cf6', desc: 'Detect steady-state visually evoked potentials from flickering stimuli.' },
    { title: 'Oddball Paradigm', cat: 'ERP', color: '#ffd700', desc: 'Observe the P300 component by detecting rare target stimuli.' },
    { title: 'SMR Neurofeedback', cat: 'Neurofeedback', color: '#14b8a6', desc: 'Enhance sensorimotor rhythm for improved focus through gamified feedback.' },
];

const featurePills = [
    { icon: <Bluetooth className="w-3.5 h-3.5" />, label: 'Bluetooth BCI Connection' },
    { icon: <Activity className="w-3.5 h-3.5" />, label: '8-Channel EEG Visualization' },
    { icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Real-time Bandpower' },
    { icon: <Zap className="w-3.5 h-3.5" />, label: 'Notch & Bandpass Filters' },
    { icon: <Award className="w-3.5 h-3.5" />, label: '12 Experiment Paradigms' },
];

const BCILabShowcase: React.FC<BCILabShowcaseProps> = ({ navigate }) => (
    <section id="bcilab" className="relative z-10 py-24 px-4 bg-gradient-to-b from-black/40 to-neon-blue/[0.03]">
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="p-2 bg-neon-blue/20 rounded-xl border border-neon-blue/40">
                    <Beaker className="w-6 h-6 text-neon-blue" />
                </div>
                <span className="font-mono text-xs text-neon-blue tracking-widest">EXPERIMENT LIBRARY</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-orbitron font-bold mb-6">
                THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-purple-400 to-neon-pink">BCI LAB</span>
            </h2>
            <p className="text-gray-400 font-rajdhani text-lg md:text-xl max-w-2xl mb-14 leading-relaxed">
                12 curated brain-computer interface experiments. Connect your headset, test your signal, and run real paradigms — from P300 Spellers to Motor Imagery classifiers.
            </p>

            {/* Experiment highlights grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                {experiments.map((exp) => (
                    <div
                        key={exp.title}
                        onClick={() => navigate('/bcilab')}
                        className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-300"
                    >
                        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${exp.color}, transparent)` }} />
                        <div className="p-5">
                            <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded mb-3 inline-block" style={{ color: exp.color, backgroundColor: `${exp.color}15` }}>
                                {exp.cat.toUpperCase()}
                            </span>
                            <h3 className="font-orbitron text-sm font-bold text-white mb-2 group-hover:text-[var(--c)] transition-colors" style={{ '--c': exp.color } as React.CSSProperties}>
                                {exp.title}
                            </h3>
                            <p className="text-gray-500 text-xs font-rajdhani leading-relaxed">{exp.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mb-12">
                {featurePills.map((pill) => (
                    <div key={pill.label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-neon-blue/20 bg-neon-blue/[0.06] text-neon-blue text-xs font-mono">
                        {pill.icon} {pill.label}
                    </div>
                ))}
            </div>

            <button
                onClick={() => navigate('/bcilab')}
                className="group px-10 py-4 bg-neon-blue/10 border border-neon-blue/40 text-neon-blue font-orbitron text-sm font-bold tracking-widest rounded-xl hover:bg-neon-blue hover:text-black transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,243,255,0.3)] flex items-center gap-3"
            >
                <Beaker className="w-5 h-5" /> ENTER THE BCI LAB <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    </section>
);

export default BCILabShowcase;
