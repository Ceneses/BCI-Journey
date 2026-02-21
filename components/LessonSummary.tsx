import React, { useEffect, useState } from 'react';
import { generateLessonSummary } from '../services/geminiService';
import { Brain, BookOpen, Loader2, ArrowRight, Activity, X } from 'lucide-react';
import { log } from '../utils/logger';

interface LessonSummaryProps {
    question: string;
    regionName: string;
    onClose: () => void;
}

const LessonSummary: React.FC<LessonSummaryProps> = ({ question, regionName, onClose }) => {
    const [summaryPoints, setSummaryPoints] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                const points = await generateLessonSummary(question, regionName);
                if (points && points.length > 0) {
                    setSummaryPoints(points);
                } else {
                    setError("No data received from the neural network.");
                }
            } catch (err) {
                log.gemini.error("Failed to load summary:", err);
                setError("Connection interrupted. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [question, regionName]);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl bg-cyber-black border-2 border-neon-blue rounded-lg shadow-[0_0_50px_rgba(0,243,255,0.2)] overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-indigo-900/50 to-transparent flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-neon-blue/20 rounded-lg">
                            <BookOpen className="w-6 h-6 text-neon-blue" />
                        </div>
                        <div>
                            <h2 className="text-xl font-orbitron text-white">NEURAL ARCHIVE</h2>
                            <p className="text-xs font-mono text-neon-blue uppercase tracking-widest">
                                MODULE: {regionName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto">
                    <div className="mb-6">
                        <div className="text-xs font-mono text-gray-500 mb-2">ORIGINAL QUERY</div>
                        <h3 className="text-xl font-rajdhani font-bold text-white italic">"{question}"</h3>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-12 h-12 text-neon-blue animate-spin mb-4" />
                            <p className="font-mono text-neon-blue animate-pulse">DECRYPTING DATA PACKETS...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <Activity className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <p className="text-red-400 font-mono mb-4">{error}</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 border border-red-500 text-red-500 hover:bg-red-500/10 rounded font-orbitron"
                            >
                                CLOSE CONNECTION
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {summaryPoints.map((point, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-lg hover:border-neon-blue/50 transition-colors group animate-in slide-in-from-bottom-2 fade-in duration-500"
                                    style={{ animationDelay: `${index * 150}ms` }}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-6 h-6 rounded-full bg-neon-blue/10 flex items-center justify-center group-hover:bg-neon-blue/20 transition-colors">
                                            <span className="font-mono text-neon-blue text-xs">{index + 1}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-200 font-rajdhani text-lg leading-relaxed">
                                        {point}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-6 py-2 bg-neon-blue text-black font-bold font-orbitron rounded hover:bg-white transition-colors"
                    >
                        ACKNOWLEDGE INTELLIGENCE <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LessonSummary;
