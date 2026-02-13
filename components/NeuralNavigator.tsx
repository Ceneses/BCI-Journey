import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { WorldQuestions, NetworkStructure, NeuralNode as NeuralNodeType } from '../types';
import { loadWorldQuestions, mapQuestionsToNetwork } from '../utils/questionLoader';
import { loadProgress, markQuestionComplete, isNodeUnlocked } from '../utils/progressManager';
import { WORLDS } from '../constants';
import NeuralNetworkGrid from './NeuralNetworkGrid';
import LoadingTeaser from './LoadingTeaser';
import SimulationMode from './SimulationMode';
import { ArrowLeft, Mouse, Hand, Info, Lightbulb, Lock, Unlock, CheckCircle2, Circle } from 'lucide-react';

interface NeuralNavigatorProps {
    worldId: number;
}

const NeuralNavigator: React.FC<NeuralNavigatorProps> = ({ worldId }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [showTeaser, setShowTeaser] = useState(true);
    const [network, setNetwork] = useState<NetworkStructure | null>(null);
    const [selectedNode, setSelectedNode] = useState<NeuralNodeType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showSimulation, setShowSimulation] = useState(false);
    const [simulationMode, setSimulationMode] = useState<'listen' | 'talk' | null>(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showControls, setShowControls] = useState(true);

    const world = WORLDS.find(w => w.id === worldId);

    useEffect(() => {
        loadQuestions();
    }, [worldId]);

    useEffect(() => {
        // Auto-hide teaser after 3 seconds
        const timer = setTimeout(() => {
            setShowTeaser(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Check if user has seen tutorial before
        const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${worldId}`);
        if (!hasSeenTutorial) {
            // Show tutorial after teaser disappears
            const tutorialTimer = setTimeout(() => {
                setShowTutorial(true);
            }, 3500);
            return () => clearTimeout(tutorialTimer);
        }
    }, [worldId]);

    const handleCloseTutorial = () => {
        setShowTutorial(false);
        localStorage.setItem(`tutorial_seen_${worldId}`, 'true');
    };

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const worldQuestions = await loadWorldQuestions(worldId);
            const networkStructure = mapQuestionsToNetwork(worldQuestions.questions);

            // Apply user progress to unlock nodes
            const progress = loadProgress(worldId);
            const updatedNodes = networkStructure.nodes.map(node => {
                const isComplete = progress.completedQuestions.includes(node.questionId);
                const unlocked = isNodeUnlocked(node.column, worldId, networkStructure.nodes);

                return {
                    ...node,
                    state: isComplete ? 'active' as const : 'resting' as const,
                    isUnlocked: unlocked
                };
            });

            setNetwork({
                ...networkStructure,
                nodes: updatedNodes
            });

            setLoading(false);
        } catch (err) {
            console.error('Failed to load questions:', err);
            setError('Failed to load neural network. Please try again.');
            setLoading(false);
        }
    };

    const handleNodeClick = (node: NeuralNodeType) => {
        if (!node.isUnlocked) return;

        setSelectedNode(node);

        // Mark as complete
        markQuestionComplete(worldId, node.questionId);

        // Reload to update unlocked states
        loadQuestions();
    };

    const handleBack = () => {
        navigate('/journey');
    };

    const handleStartSimulation = (mode: 'listen' | 'talk') => {
        setSimulationMode(mode);
        setShowSimulation(true);
    };

    const handleExitSimulation = () => {
        setShowSimulation(false);
        setSimulationMode(null);
        setSelectedNode(null);
    };

    if (error) {
        return (
            <div className="w-screen h-screen bg-cyber-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-xl mb-4">{error}</p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-3 bg-neon-blue text-black font-orbitron font-bold"
                    >
                        Return to Journey
                    </button>
                </div>
            </div>
        );
    }

    if (loading || !network) {
        return (
            <div className="w-screen h-screen bg-cyber-black flex items-center justify-center">
                <div className="text-neon-blue text-2xl font-orbitron animate-pulse">
                    Loading Neural Network...
                </div>
            </div>
        );
    }

    // Show SimulationMode if active
    if (showSimulation && world && selectedNode) {
        return (
            <SimulationMode
                world={world}
                onExit={handleExitSimulation}
                question={selectedNode.question}
                initialMode={simulationMode || 'listen'}
            />
        );
    }

    return (
        <div className="w-screen h-screen bg-cyber-black relative overflow-hidden">
            {/* Loading Teaser */}
            {showTeaser && <LoadingTeaser />}

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center border-b border-white/10 backdrop-blur-sm">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-neon-blue hover:text-white transition-colors font-rajdhani"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>BACK TO MAP</span>
                </button>

                <div className="text-center">
                    <h1 className="font-orbitron text-2xl text-white">
                        NEURAL NAVIGATOR
                    </h1>
                    <p className="text-neon-blue font-rajdhani text-sm">
                        {world?.region || 'Unknown Region'}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowTutorial(true)}
                        className="flex items-center gap-1 text-gray-400 hover:text-neon-blue transition-colors text-xs font-rajdhani"
                        title="Show tutorial"
                    >
                        <Info className="w-4 h-4" />
                        <span>HELP</span>
                    </button>
                    <div className="text-right font-mono text-xs text-gray-400">
                        <div>NODES: {network.nodes.length}</div>
                        <div>COMPLETED: {network.nodes.filter(n => n.state === 'active').length}</div>
                    </div>
                </div>
            </div>

            {/* 3D Scene */}
            <div className="absolute inset-0 z-0">
                <Canvas gl={{ antialias: true, alpha: false }} onCreated={() => console.log('Canvas created successfully')}>
                    <color attach="background" args={['#050505']} />
                    <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={60} />

                    <ambientLight intensity={0.3} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />

                    <NeuralNetworkGrid
                        network={network}
                        onNodeClick={handleNodeClick}
                        worldColor={world?.color || '#00f3ff'}
                    />

                    <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

                    <OrbitControls
                        enablePan={true}
                        minDistance={10}
                        maxDistance={40}
                        dampingFactor={0.05}
                    />

                    <EffectComposer enableNormalPass={false}>
                        <Bloom luminanceThreshold={0.2} mipmapBlur intensity={2} radius={0.6} />
                        <Vignette eskil={false} offset={0.1} darkness={1.1} />
                    </EffectComposer>
                </Canvas>

                {/* Instructions Overlay */}
                {!selectedNode && showControls && (
                    <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
                        <div className="bg-cyber-black/80 backdrop-blur-md border border-neon-blue/30 rounded-lg px-6 py-3 shadow-lg">
                            <div className="flex items-center gap-3 text-sm font-rajdhani">
                                <Mouse className="w-5 h-5 text-neon-blue animate-pulse" />
                                <span className="text-white">Click on a <span className="text-neon-blue font-bold">glowing node</span> to explore questions</span>
                                <button
                                    onClick={() => setShowControls(false)}
                                    className="ml-4 text-gray-400 hover:text-white pointer-events-auto"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="absolute top-24 right-6 z-10 bg-cyber-black/80 backdrop-blur-md border border-white/10 rounded-lg p-4 text-xs font-rajdhani">
                    <div className="text-white font-bold mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-neon-blue" />
                        NODE STATUS
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-neon-blue shadow-[0_0_10px_#00f3ff] animate-pulse"></div>
                            <span className="text-gray-300">Unlocked - Click to explore</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-neon-pink shadow-[0_0_10px_#ff00ff]"></div>
                            <span className="text-gray-300">Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                            <span className="text-gray-400">Locked</span>
                        </div>
                    </div>
                </div>

                {/* Character Labels (HTML Overlay) */}
                <div className="absolute bottom-20 left-8 text-center pointer-events-none">
                    <div className="text-lg font-orbitron text-purple-500 font-bold drop-shadow-[0_0_10px_rgba(157,0,255,0.8)]">
                        SYNAPSE
                    </div>
                    <div className="text-xs font-rajdhani text-cyan-400">
                        Biological Core
                    </div>
                </div>
                <div className="absolute bottom-20 right-8 text-center pointer-events-none">
                    <div className="text-lg font-orbitron text-yellow-400 font-bold drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
                        SPARK
                    </div>
                    <div className="text-xs font-rajdhani text-orange-500">
                        Digital Engine
                    </div>
                </div>
            </div>

            {/* Tutorial Overlay */}
            {showTutorial && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
                    <div className="bg-cyber-black border-2 border-neon-blue rounded-lg max-w-2xl w-full p-8 shadow-[0_0_50px_rgba(0,243,255,0.3)]">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Lightbulb className="w-8 h-8 text-electric-gold" />
                                <h2 className="text-2xl font-orbitron text-white">How to Navigate</h2>
                            </div>
                            <button
                                onClick={handleCloseTutorial}
                                className="text-gray-400 hover:text-white transition-colors text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6 font-rajdhani">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center flex-shrink-0">
                                    <Mouse className="w-5 h-5 text-neon-blue" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold mb-1">Explore the Neural Network</h3>
                                    <p className="text-gray-300 text-sm">Use your mouse to rotate, zoom, and pan around the 3D neural network. Each glowing node represents a question about the {world?.region}.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-electric-gold/20 flex items-center justify-center flex-shrink-0">
                                    <Circle className="w-5 h-5 text-electric-gold" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold mb-1">Click on Unlocked Nodes</h3>
                                    <p className="text-gray-300 text-sm">Bright, pulsing nodes are unlocked and ready to explore. Click one to see the question and choose how to learn.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-neon-pink/20 flex items-center justify-center flex-shrink-0">
                                    <Unlock className="w-5 h-5 text-neon-pink" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold mb-1">Progress Through Columns</h3>
                                    <p className="text-gray-300 text-sm">Complete questions in earlier columns to unlock new ones. Work your way from left to right through the neural network.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                    <Hand className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold mb-1">Choose Your Learning Style</h3>
                                    <p className="text-gray-300 text-sm">For each question, you can either <span className="text-neon-blue font-bold">Listen</span> to Synapse and Spark explain it, or <span className="text-electric-gold font-bold">Talk</span> with them directly.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={handleCloseTutorial}
                                className="px-8 py-3 bg-neon-blue text-black font-orbitron font-bold rounded hover:bg-white transition-colors"
                            >
                                GOT IT!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Question Panel */}
            {selectedNode && (
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-cyber-black/90 backdrop-blur-md border-t border-neon-blue/30 animate-in slide-in-from-bottom duration-300">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="text-xs text-gray-400 font-mono mb-1">
                                    QUESTION #{selectedNode.questionId} | COLUMN {selectedNode.column} | ROW {selectedNode.row + 1}
                                </div>
                                <h2 className="text-2xl font-orbitron text-white">
                                    {selectedNode.question}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedNode(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-3">
                            <p className="text-gray-400 text-sm font-rajdhani flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-electric-gold" />
                                Choose how you want to learn:
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => handleStartSimulation('listen')}
                                className="flex-1 py-3 bg-neon-blue/20 border border-neon-blue text-neon-blue font-rajdhani hover:bg-neon-blue/30 transition-colors"
                            >
                                Listen to Synapse and Spark
                            </button>
                            <button
                                onClick={() => handleStartSimulation('talk')}
                                className="flex-1 py-3 bg-electric-gold/20 border border-electric-gold text-electric-gold font-rajdhani hover:bg-electric-gold/30 transition-colors"
                            >
                                Talk with Synapse and Spark
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NeuralNavigator;
