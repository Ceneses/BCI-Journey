import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

const LoadingTeaser: React.FC = () => {
    const [visible, setVisible] = useState(true);
    const [textVisible, setTextVisible] = useState(false);

    useEffect(() => {
        // Delay text appearance for dramatic effect
        const textTimer = setTimeout(() => {
            setTextVisible(true);
        }, 300);

        return () => clearTimeout(textTimer);
    }, []);

    if (!visible) return null;

    return (
        <div className="absolute inset-0 z-50 bg-cyber-black/95 backdrop-blur-lg flex items-center justify-center">
            <div className="text-center max-w-2xl px-8">
                {/* Spark Character Icon */}
                <div className="mb-8 relative inline-block">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-electric-gold to-orange-500 flex items-center justify-center animate-pulse">
                        <Zap className="w-16 h-16 text-black" fill="currentColor" />
                    </div>

                    {/* Glow effect */}
                    <div className="absolute inset-0 w-32 h-32 rounded-full bg-electric-gold blur-2xl opacity-50 animate-pulse"></div>
                </div>

                {/* Message */}
                {textVisible && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-4xl font-orbitron font-bold text-electric-gold mb-4 tracking-wider">
                            ZZAP!
                        </h2>
                        <p className="text-xl font-rajdhani text-white leading-relaxed">
                            Initializing <span className="text-neon-blue font-bold">96 hidden processing layers</span>!
                        </p>
                        <p className="text-lg font-rajdhani text-gray-400 mt-2">
                            Input received!
                        </p>

                        {/* Loading bar */}
                        <div className="mt-8 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-electric-gold to-neon-blue animate-[loading_2s_ease-in-out]"></div>
                        </div>

                        <div className="mt-4 text-xs font-mono text-gray-500">
                            NEURAL NETWORK INITIALIZATION IN PROGRESS...
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes loading {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
};

export default LoadingTeaser;
