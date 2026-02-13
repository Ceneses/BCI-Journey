import React, { useState } from 'react';
import { Brain, MousePointer2, Move3d, Zap, CheckCircle2, X } from 'lucide-react';

interface IntroductionOverlayProps {
    onDismiss: () => void;
}

const IntroductionOverlay: React.FC<IntroductionOverlayProps> = ({ onDismiss }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "WELCOME TO BCI JOURNEY",
            icon: <Brain className="w-16 h-16 text-neon-blue" />,
            content: (
                <div className="text-center space-y-4">
                    <p className="text-lg font-rajdhani text-gray-300">
                        You have accessed the <span className="text-white font-bold">Neural Cartography Interface</span>.
                    </p>
                    <p className="text-sm font-mono text-neon-blue">
                        MISSION: MAP THE HUMAN BRAIN
                    </p>
                    <p className="text-gray-400 text-sm">
                        Explore 10 core regions of the brain, interact with AI avatars, and unlock the secrets of Brain-Computer Interfaces.
                    </p>
                </div>
            )
        },
        {
            title: "INTERFACE CONTROLS",
            icon: <Move3d className="w-16 h-16 text-neon-pink" />,
            content: (
                <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="p-4 bg-white/5 rounded border border-white/10 flex flex-col items-center text-center">
                        <MousePointer2 className="w-8 h-8 text-white mb-2" />
                        <h4 className="font-bold text-neon-blue text-sm mb-1">SELECT</h4>
                        <p className="text-xs text-gray-400">Click on glowing nodes to open detailed regional data.</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded border border-white/10 flex flex-col items-center text-center">
                        <Move3d className="w-8 h-8 text-white mb-2" />
                        <h4 className="font-bold text-neon-blue text-sm mb-1">NAVIGATE</h4>
                        <p className="text-xs text-gray-400">Click & Drag to rotate the 3D brain model. Scroll to zoom.</p>
                    </div>
                </div>
            )
        },
        {
            title: "HOW TO EARN SOMAS",
            icon: <Zap className="w-16 h-16 text-electric-gold" />,
            content: (
                <div className="space-y-4">
                    <p className="text-center text-gray-300 font-rajdhani">
                        Complete the <span className="text-electric-gold">Mission Protocol</span> at each node to activate it.
                    </p>
                    <div className="space-y-2 text-sm font-mono text-gray-400">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-neon-blue" />
                            <span>1. TALK to Synapse & Spark</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-neon-blue" />
                            <span>2. READ the Lesson Summary</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-neon-pink" />
                            <span>3. PASS the Quiz (+17M Somas)</span>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(prev => prev + 1);
        } else {
            onDismiss();
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-cyber-black border border-neon-blue/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.2)]">

                {/* Header with Progress */}
                <div className="bg-white/5 p-4 flex justify-between items-center border-b border-white/10">
                    <div className="flex gap-1">
                        {steps.map((_, i) => (
                            <div key={i} className={`h-1 w-8 rounded-full transition-colors ${i <= step ? 'bg-neon-blue' : 'bg-gray-700'}`}></div>
                        ))}
                    </div>
                    <button onClick={onDismiss} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col items-center">
                    <div className="mb-6 animate-bounce">
                        {steps[step].icon}
                    </div>

                    <h2 className="text-2xl font-orbitron font-bold text-white mb-6 tracking-widest text-center">
                        {steps[step].title}
                    </h2>

                    <div className="mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 key={step}">
                        {steps[step].content}
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-full py-4 bg-neon-blue text-black font-orbitron font-bold tracking-widest hover:bg-white hover:text-black transition-all rounded shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                    >
                        {step < steps.length - 1 ? 'NEXT PROTOCOL' : 'INITIALIZE INTERFACE'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default IntroductionOverlay;
