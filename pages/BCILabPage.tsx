import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Brain, Search, Keyboard, Eye, Hand, Waves, Bell, Palette,
    BrainCircuit, ScanFace, MousePointer, Target, AudioLines, CircleSlash,
    ArrowLeft, Sparkles, Beaker, Filter
} from 'lucide-react';
import { experiments, categories, type Category, type Experiment } from '../data/experiments';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
    Keyboard, Eye, Hand, Waves, Bell, Palette,
    BrainCircuit, ScanFace, MousePointer, Target, AudioLines, CircleSlash,
};

const difficultyColor: Record<string, string> = {
    Beginner: 'text-green-400 border-green-400/30 bg-green-400/10',
    Intermediate: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    Advanced: 'text-red-400 border-red-400/30 bg-red-400/10',
};

const BCILabPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState<Category>('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredExperiments = useMemo(() => {
        return experiments.filter((exp) => {
            const matchesCategory = activeCategory === 'All' || exp.category === activeCategory;
            const q = searchQuery.toLowerCase();
            const matchesSearch =
                !q ||
                exp.title.toLowerCase().includes(q) ||
                exp.description.toLowerCase().includes(q) ||
                exp.tags.some((t) => t.toLowerCase().includes(q));
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery]);

    return (
        <div className="min-h-screen bg-cyber-black text-white font-sans relative overflow-x-hidden">
            {/* Background layers */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510]" />
            <div
                className="fixed inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 1px 1px, rgba(0,243,255,0.4) 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                }}
            />
            {/* Ambient glow orbs */}
            <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-neon-blue/[0.03] blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-neon-pink/[0.03] blur-[120px] pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-50 px-6 md:px-8 py-5 flex justify-between items-center bg-black/60 backdrop-blur-xl border-b border-white/[0.06] sticky top-0">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                    <div className="p-2 bg-neon-blue/20 rounded-full border border-neon-blue/40 shadow-[0_0_15px_rgba(0,243,255,0.2)] group-hover:shadow-[0_0_25px_rgba(0,243,255,0.4)] transition-shadow">
                        <Brain className="w-5 h-5 text-neon-blue" />
                    </div>
                    <h1 className="font-orbitron font-bold text-lg tracking-widest">
                        BCI <span className="text-neon-blue">JOURNEY</span>
                    </h1>
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-rajdhani"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
            </nav>

            {/* Hero */}
            <header className="relative z-10 pt-16 pb-10 md:pt-24 md:pb-14 px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-neon-blue/20 bg-neon-blue/[0.06] text-neon-blue text-xs font-mono tracking-widest">
                    <Beaker className="w-3.5 h-3.5" /> EXPERIMENT LIBRARY
                </div>
                <h1 className="text-4xl md:text-7xl font-orbitron font-bold mb-5 tracking-tight">
                    BCI <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-purple-400 to-neon-pink">LAB</span>
                </h1>
                <p className="max-w-2xl mx-auto text-gray-400 font-rajdhani text-lg md:text-xl leading-relaxed">
                    Explore a curated collection of brain-computer interface experiments.
                    From classic paradigms to cutting-edge neurofeedback — pick an experiment and start exploring.
                </p>
            </header>

            {/* Filters + Search */}
            <section className="relative z-10 px-4 md:px-8 max-w-7xl mx-auto mb-10">
                {/* Search */}
                <div className="relative max-w-md mx-auto mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search experiments…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 font-rajdhani focus:outline-none focus:border-neon-blue/50 focus:bg-white/[0.06] transition-all"
                    />
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap justify-center gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 rounded-full text-xs font-orbitron font-bold tracking-wider border transition-all duration-200 ${activeCategory === cat
                                ? 'bg-neon-blue/20 border-neon-blue/60 text-neon-blue shadow-[0_0_12px_rgba(0,243,255,0.15)]'
                                : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
                                }`}
                        >
                            {cat.toUpperCase()}
                        </button>
                    ))}
                </div>
            </section>

            {/* Results count */}
            <div className="relative z-10 px-4 md:px-8 max-w-7xl mx-auto mb-4 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-mono text-gray-500">
                    {filteredExperiments.length} experiment{filteredExperiments.length !== 1 ? 's' : ''} found
                </span>
            </div>

            {/* Card Grid */}
            <section className="relative z-10 px-4 md:px-8 max-w-7xl mx-auto pb-20">
                {filteredExperiments.length === 0 ? (
                    <div className="text-center py-24">
                        <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 font-rajdhani text-lg">No experiments match your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredExperiments.map((exp) => (
                            <ExperimentCard key={exp.id} experiment={exp} onSelect={() => navigate(`/bcilab/${exp.id}`)} />
                        ))}
                    </div>
                )}
            </section>

            {/* CTA bottom */}
            <section className="relative z-10 py-20 px-4 border-t border-white/[0.05] bg-gradient-to-t from-neon-blue/[0.02] to-transparent">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-orbitron font-bold mb-4">
                        MORE EXPERIMENTS <span className="text-neon-blue">COMING SOON</span>
                    </h2>
                    <p className="text-gray-400 font-rajdhani text-lg mb-8">
                        We're constantly adding new paradigms and protocols. Have an idea for an experiment? Let us know!
                    </p>
                    <button
                        onClick={() => navigate('/journey')}
                        className="px-8 py-3 bg-neon-blue/10 border border-neon-blue/40 text-neon-blue font-orbitron text-xs font-bold tracking-widest rounded-lg hover:bg-neon-blue hover:text-black transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,243,255,0.3)]"
                    >
                        EXPLORE THE JOURNEY
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 px-8 py-8 border-t border-white/[0.05] bg-black/40">
                <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-4 opacity-60">
                    <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-gray-500" />
                        <span className="font-orbitron font-bold text-xs text-gray-400">BCI JOURNEY</span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-600">
                        © 2025 BCI EDUCATION INITIATIVE
                    </div>
                </div>
            </footer>
        </div>
    );
};

/* ─── Experiment Card ─────────────────────────────── */

const ExperimentCard: React.FC<{ experiment: Experiment; onSelect: () => void }> = ({ experiment, onSelect }) => {
    const IconComponent = iconMap[experiment.icon] ?? Sparkles;

    return (
        <div
            onClick={onSelect}
            className="cursor-pointer group relative flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
            style={{ '--card-accent': experiment.color } as React.CSSProperties}
        >
            {/* Color accent bar */}
            <div
                className="h-1 w-full opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, ${experiment.color}, transparent)` }}
            />

            {/* Icon header */}
            <div className="px-5 pt-5 pb-3 flex items-start justify-between">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 group-hover:rotate-3"
                    style={{
                        backgroundColor: `${experiment.color}15`,
                        borderColor: `${experiment.color}30`,
                    }}
                >
                    <IconComponent
                        className="w-6 h-6"
                        style={{ color: experiment.color } as React.CSSProperties}
                    />
                </div>

                {/* Difficulty badge */}
                <span
                    className={`text-[10px] font-orbitron font-bold tracking-wider px-2.5 py-1 rounded-full border ${difficultyColor[experiment.difficulty]}`}
                >
                    {experiment.difficulty.toUpperCase()}
                </span>
            </div>

            {/* Content */}
            <div className="px-5 pb-4 flex-1 flex flex-col">
                <h3 className="font-orbitron text-sm font-bold mb-1 text-white leading-snug group-hover:text-[var(--card-accent)] transition-colors">
                    {experiment.title}
                </h3>
                <span
                    className="inline-block text-[10px] font-mono tracking-wider mb-3 px-2 py-0.5 rounded w-fit"
                    style={{
                        color: experiment.color,
                        backgroundColor: `${experiment.color}12`,
                    }}
                >
                    {experiment.category.toUpperCase()}
                </span>
                <p className="text-gray-400 text-xs font-rajdhani leading-relaxed flex-1">
                    {experiment.description}
                </p>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
                {/* Tags */}
                <div className="flex gap-1 overflow-hidden max-w-[65%]">
                    {experiment.tags.slice(0, 2).map((tag) => (
                        <span
                            key={tag}
                            className="text-[9px] font-mono text-gray-500 bg-white/[0.04] px-2 py-0.5 rounded-full whitespace-nowrap"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Launch badge */}
                <span
                    className="text-[9px] font-orbitron font-bold tracking-wider px-3 py-1 rounded-full border border-neon-blue/30 bg-neon-blue/10 text-neon-blue group-hover:bg-neon-blue group-hover:text-black transition-all duration-200"
                >
                    LAUNCH
                </span>
            </div>

            {/* Hover glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                style={{
                    boxShadow: `inset 0 0 60px ${experiment.color}08, 0 0 30px ${experiment.color}05`,
                }}
            />
        </div>
    );
};

export default BCILabPage;
