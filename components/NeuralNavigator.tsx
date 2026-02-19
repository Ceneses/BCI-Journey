import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { NetworkStructure, NeuralNode, WorldQuestions, UserProgress, QuestionProgress } from '../types';
import { generateLessonSummary, generateNeuronQuiz } from '../services/geminiService';
import { loadWorldQuestions, mapQuestionsToNetwork, getNodePosition } from '../utils/questionLoader';
import { loadProgress, saveProgress, markQuestionComplete, isNodeUnlocked, isQuestionComplete, getCompletionPercentage, updateQuestionProgress, getQuestionProgress } from '../utils/progressManager';
import { WORLDS } from '../constants';
import NeuralNetworkGrid from './NeuralNetworkGrid';
import LoadingTeaser from './LoadingTeaser';
import SimulationMode from './SimulationMode';
import LessonSummary from './LessonSummary';
import NeuronActivationQuiz from './NeuronActivationQuiz';
import { slugify } from '../utils/stringUtils';
import { ArrowLeft, Mouse, Hand, Info, Lightbulb, Lock, Unlock, CheckCircle2, Circle, BookOpen, Award, Zap, ChevronDown, ChevronUp, X } from 'lucide-react';

type OrbitControlsRef = { target: THREE.Vector3; update: () => void } | null;

const DEFAULT_CAMERA_POSITION = new THREE.Vector3(6, 1, 30);
const DEFAULT_CAMERA_TARGET = new THREE.Vector3(0, 0, 0);
const SELECTED_NODE_CAMERA_OFFSET = new THREE.Vector3(0.5, 0.3, 8);

const CameraFocusController: React.FC<{
    selectedNodePosition: { x: number; y: number; z: number } | null;
    controlsRef: React.RefObject<OrbitControlsRef>;
}> = ({ selectedNodePosition, controlsRef }) => {
    const { camera } = useThree();
    const targetPositionRef = useRef<THREE.Vector3>(DEFAULT_CAMERA_POSITION.clone());
    const targetLookAtRef = useRef<THREE.Vector3>(DEFAULT_CAMERA_TARGET.clone());
    const isAnimatingRef = useRef(false);

    useEffect(() => {
        if (selectedNodePosition) {
            const pos = new THREE.Vector3(selectedNodePosition.x, selectedNodePosition.y, selectedNodePosition.z);
            targetLookAtRef.current.copy(pos);
            targetPositionRef.current.copy(pos.clone().add(SELECTED_NODE_CAMERA_OFFSET));
        } else {
            targetLookAtRef.current.copy(DEFAULT_CAMERA_TARGET);
            targetPositionRef.current.copy(DEFAULT_CAMERA_POSITION);
        }
        isAnimatingRef.current = true;
    }, [selectedNodePosition]);

    useFrame(() => {
        const controls = controlsRef.current;
        if (!controls || !isAnimatingRef.current) return;

        camera.position.lerp(targetPositionRef.current, 0.08);
        controls.target.lerp(targetLookAtRef.current, 0.1);
        controls.update();

        const positionSettled = camera.position.distanceTo(targetPositionRef.current) < 0.05;
        const targetSettled = controls.target.distanceTo(targetLookAtRef.current) < 0.05;
        if (positionSettled && targetSettled) {
            isAnimatingRef.current = false;
        }
    });

    return null;
};

interface NeuralNavigatorProps {
    worldId: number;
    initialQuestionSlug?: string;
    initialMode?: 'listen' | 'talk' | 'summary' | 'quiz';
}

const NeuralNavigator: React.FC<NeuralNavigatorProps> = ({ worldId, initialQuestionSlug, initialMode }) => {
    const navigate = useNavigate();
    const controlsRef = useRef<OrbitControlsRef>(null);
    const [loading, setLoading] = useState(true);
    const [showTeaser, setShowTeaser] = useState(true);
    const [network, setNetwork] = useState<NetworkStructure | null>(null);
    const [selectedNode, setSelectedNode] = useState<NeuralNode | null>(null);
    const [isPanelExpanded, setIsPanelExpanded] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSimulation, setShowSimulation] = useState(false);
    const [simulationMode, setSimulationMode] = useState<'listen' | 'talk' | null>(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showSummary, setShowSummary] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuestionProgress, setCurrentQuestionProgress] = useState<QuestionProgress | null>(null);

    // Placeholder for audio context and sound function, as they are not defined in the provided snippet
    const audioContext = null; // Replace with actual AudioContext if used
    const playNodeSelectSound = (ctx: any) => { /* Play sound logic */ };

    const world = WORLDS.find(w => w.id === worldId);

    const nextNodeToExplore = network
        ? network.nodes.find((node) => node.isUnlocked && !isQuestionComplete(worldId, node.questionId))
            ?? network.nodes.find((node) => node.isUnlocked)
        : null;

    const selectedNodePosition = selectedNode && network
        ? getNodePosition(selectedNode.column, selectedNode.row, network.columnSizes[selectedNode.column - 1])
        : null;

    useEffect(() => {
        loadQuestions();
    }, [worldId]);

    // Handle initial deep linking
    useEffect(() => {
        if (!network || !world) return;

        if (initialQuestionSlug) {
            // Find the node that matches the slug
            const targetNode = network.nodes.find(node =>
                slugify(node.question) === initialQuestionSlug
            );

            if (targetNode) {
                // If node is locked, we probably shouldn't show it, but for now let's just select it if unlocked
                // Or maybe we select it regardless to show it's locked?
                // For now, respect unlock status unless we want to allow deep linking to locked content (cheating?)
                if (targetNode.isUnlocked) {
                    setSelectedNode(targetNode);
                    const progress = getQuestionProgress(world.id, targetNode.questionId);
                    setCurrentQuestionProgress(progress);

                    // Handle mode
                    // First reset all modes
                    setSimulationMode(null);
                    setShowSimulation(false);
                    setShowSummary(false);
                    setShowQuiz(false);

                    if (initialMode) {
                        if (initialMode === 'listen') {
                            setSimulationMode('listen');
                            setShowSimulation(true);
                        } else if (initialMode === 'talk') {
                            setSimulationMode('talk');
                            setShowSimulation(true);
                        } else if (initialMode === 'summary') {
                            setShowSummary(true);
                        } else if (initialMode === 'quiz') {
                            setShowQuiz(true);
                        }
                    } else {
                        // Default state if just question selected: show question panel (which means no overlays)
                        // All overlays already reset above.
                    }
                }
            }

        } else {
            // If no slug, clear selection (e.g. back navigation)
            setSelectedNode(null);
            setShowSimulation(false);
            setShowSummary(false);
            setShowQuiz(false);
        }
    }, [network, initialQuestionSlug, initialMode, world]);

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

    const loadQuestions = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
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

            if (!silent) setLoading(false);
        } catch (err) {
            console.error('Failed to load questions:', err);
            setError('Failed to load neural network. Please try again.');
            if (!silent) setLoading(false);
        }
    };

    const handleNodeSelect = (node: NeuralNode) => {
        if (!node.isUnlocked) return;

        if (audioContext) {
            playNodeSelectSound(audioContext);
        }

        if (selectedNode?.id === node.id) {
            setIsPanelExpanded((prev) => !prev);
        } else {
            setSelectedNode(node);
            setIsPanelExpanded(true);
            if (world) {
                setCurrentQuestionProgress(getQuestionProgress(world.id, node.questionId));
            }
        }
    };

    const handleGuideToNextNode = () => {
        if (nextNodeToExplore) {
            handleNodeSelect(nextNodeToExplore);
            setIsPanelExpanded(true);
        }
    };

    const handleBack = () => {
        if (selectedNode) {
            // Deselect node — local state only, no URL change
            setSelectedNode(null);
            setCurrentQuestionProgress(null);
        } else {
            // No node selected, back means go to journey map
            navigate('/journey');
        }
    };

    const handleStartSimulation = (mode: 'listen' | 'talk') => {
        if (selectedNode && world) {
            // Update progress
            updateQuestionProgress(world.id, selectedNode.questionId, mode);
            // Refresh progress state locally
            setCurrentQuestionProgress(getQuestionProgress(world.id, selectedNode.questionId));

            // Navigate to mode URL
            const regionSlug = world.region.toLowerCase().replace(/\s+/g, '-');
            const questionSlug = slugify(selectedNode.question);
            navigate(`/journey/${regionSlug}/${questionSlug}/${mode}`);
        }
    };

    const handleExitSimulation = () => {
        // Return to question panel view — local state only
        setShowSimulation(false);
        setSimulationMode(null);
        // Refresh progress after simulation
        if (selectedNode && world) {
            setCurrentQuestionProgress(getQuestionProgress(world.id, selectedNode.questionId));
        }
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
                questionId={selectedNode.questionId}
                initialMode={simulationMode || 'listen'}
                onSwitchMode={(newMode) => {
                    // Navigate to the new mode URL
                    const regionSlug = world.region.toLowerCase().replace(/\s+/g, '-');
                    const questionSlug = slugify(selectedNode.question);
                    // Mapping 'summary' to URL path if needed, but 'summary' is a valid mode in our route
                    navigate(`/journey/${regionSlug}/${questionSlug}/${newMode}`);
                }}
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
                <Canvas gl={{ antialias: true, alpha: false }}>
                    <color attach="background" args={['#050505']} />
                    <PerspectiveCamera makeDefault position={[6, 1, 30]} fov={60} />
                    <CameraFocusController selectedNodePosition={selectedNodePosition} controlsRef={controlsRef} />

                    <ambientLight intensity={0.3} />
                    <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />

                    <NeuralNetworkGrid
                        network={network}
                        onNodeClick={handleNodeSelect}
                        worldColor={world?.color || '#00f3ff'}
                        selectedNodeId={selectedNode?.id ?? null}
                        questionProgressMap={loadProgress(worldId).questionProgress || {}}
                    />

                    <Stars radius={150} depth={100} count={5000} factor={4} saturation={0} fade speed={0.5} />

                    <OrbitControls
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ref={controlsRef as any}
                        enablePan={true}
                        minDistance={5}
                        maxDistance={200}
                        dampingFactor={0.05}
                        target={[0, 0, 0]}
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
                            <div className="w-3 h-3 rounded-full bg-neon-blue shadow-[0_0_10px_#00f3ff]"></div>
                            <span className="text-gray-300">Listen ring - lights when Listen done</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-electric-gold shadow-[0_0_10px_#ffd700]"></div>
                            <span className="text-gray-300">Talk ring - lights when Talk done</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#9d00ff]"></div>
                            <span className="text-gray-300">Read ring - lights when Summary read</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                            <div className="w-3 h-3 rounded-full bg-neon-pink shadow-[0_0_10px_#ff00ff]"></div>
                            <span className="text-gray-300">Solid glow - Quiz passed (activated)</span>
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

            {/* Footer - Navigation Support */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 flex justify-between items-end pointer-events-none">
                <div className="pointer-events-auto">
                    <button
                        onClick={handleGuideToNextNode}
                        className="text-left group bg-black/85 p-4 border border-neon-blue/40 backdrop-blur-md rounded-lg hover:border-neon-blue hover:bg-neon-blue/10 transition-all duration-300 w-[280px] shadow-[0_0_18px_rgba(0,243,255,0.15)]"
                    >
                        <p className="text-[10px] font-mono text-neon-blue tracking-widest uppercase">Navigation Support</p>
                        <p className="text-sm font-orbitron text-white mt-1">Go To Next Node</p>
                        {nextNodeToExplore && (
                            <p className="text-xs font-rajdhani text-gray-300 mt-2 truncate">
                                Suggested: <span className="text-neon-blue">Q#{nextNodeToExplore.questionId} {nextNodeToExplore.question}</span>
                            </p>
                        )}
                    </button>
                </div>
                <div className="text-right pointer-events-none">
                    <p className="text-electric-gold font-orbitron animate-pulse text-lg drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                        SELECT A NODE TO EXPLORE
                    </p>
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

            {/* Lesson Summary Overlay */}
            {showSummary && selectedNode && (
                <LessonSummary
                    question={selectedNode.question}
                    regionName={world?.region || 'Unknown Region'}
                    onClose={() => {
                        setShowSummary(false);
                        if (world && selectedNode) {
                            setCurrentQuestionProgress(getQuestionProgress(world.id, selectedNode.questionId));
                        }
                    }}
                />
            )}

            {/* Quiz Overlay */}
            {showQuiz && selectedNode && world && (
                <NeuronActivationQuiz
                    question={selectedNode.question}
                    questionId={selectedNode.questionId}
                    worldId={world.id}
                    regionName={world.region}
                    summaryPoints={[]}
                    onClose={() => {
                        setShowQuiz(false);
                        if (world && selectedNode) {
                            setCurrentQuestionProgress(getQuestionProgress(world.id, selectedNode.questionId));
                        }
                    }}
                    onComplete={(score) => {
                        // Handle completion
                        if (score >= 3) {
                            // Success animation or something handled in component
                        }
                        // Refresh progress
                        setCurrentQuestionProgress(getQuestionProgress(world.id, selectedNode.questionId));
                    }}
                />
            )}

            {/* Question Panel - compact, bottom-right, collapsible (matches World panel) */}
            {selectedNode && !showSummary && (
                <div className="absolute bottom-0 right-0 w-[min(100%,320px)] max-h-[min(85vh,420px)] bg-cyber-black/95 border border-t border-l border-neon-blue/30 backdrop-blur-xl rounded-tl-xl z-20 flex flex-col shadow-[-10px_-10px_40px_rgba(0,243,255,0.15)] overflow-hidden transition-all duration-300">
                    {/* Header - always visible */}
                    <div className="flex justify-between items-center p-3 border-b border-neon-blue/20 bg-black/40 shrink-0">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-neon-blue px-1 border border-neon-blue/30 rounded">
                                    Q#{selectedNode.questionId} | COL {selectedNode.column} | ROW {selectedNode.row + 1}
                                </span>
                            </div>
                            <h2 className="text-base font-orbitron font-bold text-white tracking-wider truncate mt-0.5">
                                {selectedNode.question}
                            </h2>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                                onClick={() => setIsPanelExpanded((p) => !p)}
                                className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/80 hover:text-white"
                                aria-label={isPanelExpanded ? 'Collapse' : 'Expand'}
                            >
                                {isPanelExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedNode(null);
                                    setCurrentQuestionProgress(null);
                                }}
                                className="p-1.5 hover:bg-white/10 rounded-full transition-all hover:rotate-90 text-white border border-transparent hover:border-white/20"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Collapsible content */}
                    {isPanelExpanded && (
                        <>
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-0">
                                <p className="text-gray-400 text-[10px] font-rajdhani flex items-center gap-1.5">
                                    <Lightbulb className="w-3 h-3 text-electric-gold" />
                                    Choose how you want to learn:
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStartSimulation('listen')}
                                        className="flex-1 py-2 text-[10px] bg-neon-blue/20 border border-neon-blue text-neon-blue font-rajdhani hover:bg-neon-blue/30 transition-colors rounded"
                                    >
                                        Listen
                                    </button>
                                    <button
                                        onClick={() => handleStartSimulation('talk')}
                                        className="flex-1 py-2 text-[10px] bg-electric-gold/20 border border-electric-gold text-electric-gold font-rajdhani hover:bg-electric-gold/30 transition-colors rounded"
                                    >
                                        Talk
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        if (selectedNode && world) {
                                            updateQuestionProgress(world.id, selectedNode.questionId, 'summary');
                                            setCurrentQuestionProgress(getQuestionProgress(world.id, selectedNode.questionId));
                                            const regionSlug = world.region.toLowerCase().replace(/\s+/g, '-');
                                            const questionSlug = slugify(selectedNode.question);
                                            navigate(`/journey/${regionSlug}/${questionSlug}/summary`);
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 text-[10px] rounded border border-purple-500/50 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 font-mono uppercase tracking-widest"
                                >
                                    <BookOpen className="w-3 h-3" />
                                    Read Summary
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedNode && world) {
                                            const regionSlug = world.region.toLowerCase().replace(/\s+/g, '-');
                                            const questionSlug = slugify(selectedNode.question);
                                            navigate(`/journey/${regionSlug}/${questionSlug}/quiz`);
                                        }
                                    }}
                                    disabled={!currentQuestionProgress?.hasListened || !currentQuestionProgress?.hasTalked || !currentQuestionProgress?.hasReadSummary}
                                    className={`w-full flex items-center justify-center gap-2 py-3 rounded font-orbitron font-bold tracking-widest text-xs transition-all ${currentQuestionProgress?.hasListened && currentQuestionProgress?.hasTalked && currentQuestionProgress?.hasReadSummary
                                        ? 'bg-neon-pink text-black border border-neon-pink hover:bg-white shadow-[0_0_12px_#ff00ff]'
                                        : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                                    }`}
                                >
                                    {currentQuestionProgress?.isActivated ? (
                                        <><Award className="w-4 h-4" /> NEURON ACTIVATED</>
                                    ) : (
                                        <><Zap className="w-4 h-4" /> ACTIVATE NEURON</>
                                    )}
                                </button>
                                <div className="flex justify-between text-[9px] font-mono text-gray-500 uppercase">
                                    <span className={currentQuestionProgress?.hasListened ? 'text-neon-blue' : ''}>
                                        {currentQuestionProgress?.hasListened ? '[X] LISTEN' : '[ ] LISTEN'}
                                    </span>
                                    <span className={currentQuestionProgress?.hasTalked ? 'text-neon-blue' : ''}>
                                        {currentQuestionProgress?.hasTalked ? '[X] TALK' : '[ ] TALK'}
                                    </span>
                                    <span className={currentQuestionProgress?.hasReadSummary ? 'text-neon-blue' : ''}>
                                        {currentQuestionProgress?.hasReadSummary ? '[X] READ' : '[ ] READ'}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default NeuralNavigator;
