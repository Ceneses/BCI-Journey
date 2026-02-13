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
import { ArrowLeft } from 'lucide-react';

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

                <div className="text-right font-mono text-xs text-gray-400">
                    <div>NODES: {network.nodes.length}</div>
                    <div>COMPLETED: {network.nodes.filter(n => n.state === 'active').length}</div>
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

            {/* Question Panel */}
            {selectedNode && (
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-cyber-black/90 backdrop-blur-md border-t border-neon-blue/30">
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

                        <div className="flex gap-4">
                            <button className="flex-1 py-3 bg-neon-blue/20 border border-neon-blue text-neon-blue font-rajdhani hover:bg-neon-blue/30 transition-colors">
                                LEARN MORE
                            </button>
                            <button className="flex-1 py-3 bg-electric-gold/20 border border-electric-gold text-electric-gold font-rajdhani hover:bg-electric-gold/30 transition-colors">
                                TAKE QUIZ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NeuralNavigator;
