import React, { useState, useEffect } from 'react';
import { generateNeuronQuiz, generateLessonSummary, QuizQuestion } from '../services/geminiService'; // Update path if needed
import { Brain, CheckCircle, XCircle, Award, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { log } from '../utils/logger';
import { updateQuestionProgress, addSomas } from '../utils/progressManager'; // Update path if needed

const SOMA_VALUE_PER_QUESTION = 17000000;

interface NeuronActivationQuizProps {
    question: string;
    questionId: number;
    worldId: number;
    regionName: string;
    summaryPoints: string[];
    onClose: () => void;
    onComplete: (score: number) => void;
}

const NeuronActivationQuiz: React.FC<NeuronActivationQuizProps> = ({
    question,
    questionId,
    worldId,
    regionName,
    summaryPoints,
    onClose,
    onComplete,
}) => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [quizComplete, setQuizComplete] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [displayedSomas, setDisplayedSomas] = useState(0);

    useEffect(() => {
        const loadQuiz = async () => {
            try {
                setLoading(true);
                let points = summaryPoints;

                // If no summary points provided, fetch them first
                if (!points || points.length === 0) {
                    points = await generateLessonSummary(question, regionName);
                }

                const quizData = await generateNeuronQuiz(question, regionName, points);
                setQuestions(quizData);
            } catch (err) {
                log.gemini.error("Failed to load quiz:", err);
                setError("Failed to generate synapse challenge.");
            } finally {
                setLoading(false);
            }
        };

        loadQuiz();
    }, [question, regionName, summaryPoints]);

    const handleAnswerSelect = (index: number) => {
        if (selectedAnswer !== null) return; // Prevent changing answer
        setSelectedAnswer(index);
        setShowExplanation(true);

        if (index === questions[currentQuestionIndex].correctAnswer) {
            setScore((prev) => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            setQuizComplete(true);
            // Mark progress when quiz is done
            updateQuestionProgress(worldId, questionId, 'activate', score + (selectedAnswer === questions[currentQuestionIndex].correctAnswer ? 0 : 0)); // Score is already updated before this click? No, score update is async state. 
            // Actually, score state might not be updated yet if we did it in handleAnswerSelect just now? 
            // correct logic: handleAnswerSelect updates score. handleNext moves to next. 
            // Re-calculating final score to be safe or just use state in a useEffect?
            // Let's just pass the calculated score to the update function.

            // Wait, the state 'score' tracks correct answers.
            // We need to pass the FINAL score.
            // Since handleNextQuestion is called AFTER the user sees the result of the last question, 'score' should be up to date?
            // Yes, because they have to click "next" after answering.

            const finalScore = score; // This captures the score including the last answer
            const totalSomasEarned = finalScore * SOMA_VALUE_PER_QUESTION;

            updateQuestionProgress(worldId, questionId, 'activate', finalScore);
            addSomas(worldId, totalSomasEarned);

            onComplete(finalScore);
        }
    };

    // Animate Somas
    useEffect(() => {
        if (quizComplete) {
            const finalScore = score;
            const targetSomas = finalScore * SOMA_VALUE_PER_QUESTION;
            let start = 0;
            const duration = 2000;
            const startTime = performance.now();

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out quart
                const ease = 1 - Math.pow(1 - progress, 4);

                setDisplayedSomas(Math.floor(start + (targetSomas - start) * ease));

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }
    }, [quizComplete, score]);

    if (loading) {
        return (
            <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-16 h-16 animate-spin text-neon-pink mb-4" />
                <h2 className="text-2xl font-orbitron animate-pulse">GENERATING SYNAPSE CHALLENGE...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-white">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <p className="font-mono text-red-500 mb-4">{error}</p>
                <button onClick={onClose} className="px-6 py-2 border border-white/20 rounded hover:bg-white/10">
                    Close
                </button>
            </div>
        );
    }

    if (quizComplete) {
        const passed = score >= 3; // Pass threshold? Maybe just completion is enough, but "Active" implies success.

        return (
            <div className="absolute inset-0 bg-cyber-black/95 z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="mb-8 relative">
                    <div className={`absolute inset-0 blur-xl opacity-50 ${passed ? 'bg-neon-blue' : 'bg-red-500'}`}></div>
                    <Award className={`w-24 h-24 relative z-10 ${passed ? 'text-neon-blue' : 'text-red-500'}`} />
                </div>

                <h2 className="text-4xl font-orbitron text-white mb-4">
                    {passed ? 'NEURAL PATHWAY ESTABLISHED' : 'SIGNAL TOO WEAK'}
                </h2>

                <p className="font-orbitron text-2xl mb-2">
                    SCORE: <span className={passed ? 'text-neon-blue' : 'text-red-500'}>{score} / {questions.length}</span>
                </p>

                {passed && (
                    <div className="mb-8 p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg animate-pulse">
                        <p className="font-mono text-neon-blue text-sm uppercase tracking-widest mb-1">DATA MINED</p>
                        <p className="font-orbitron text-3xl md:text-5xl text-white font-bold drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
                            +{displayedSomas.toLocaleString()} SOMAS
                        </p>
                    </div>
                )}

                <p className="font-mono text-gray-400 max-w-md mb-8">
                    {passed
                        ? "Excellent work. This knowledge node is now fully active in your neural network."
                        : "Review the data and try again to strengthen this connection."}
                </p>

                <button
                    onClick={onClose}
                    className={`px-8 py-3 rounded-lg font-orbitron font-bold tracking-widest transition-all transform hover:scale-105 ${passed
                        ? 'bg-neon-blue/20 border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black'
                        : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                        }`}
                >
                    {passed ? 'ACKNOWLEDGE REWARD' : 'RETRY LATER'}
                </button>
            </div>
        );
    }

    const currentQ = questions[currentQuestionIndex];

    return (
        <div className="absolute inset-0 bg-cyber-black/95 z-50 flex flex-col p-8 pointer-events-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <Brain className="w-8 h-8 text-neon-pink" />
                    <h2 className="font-orbitron text-xl text-white tracking-widest">
                        NEURON ACTIVATION <span className="text-neon-pink">///</span> SEQUENCE {currentQuestionIndex + 1}/{questions.length}
                    </h2>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-white">
                    <XCircle className="w-6 h-6" />
                </button>
            </div>

            {/* Question Content */}
            <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-rajdhani font-bold text-white mb-8 leading-tight">
                    {currentQ.question}
                </h3>

                <div className="grid gap-4 mb-8">
                    {currentQ.options.map((option, idx) => {
                        const isSelected = selectedAnswer === idx;
                        const isCorrect = idx === currentQ.correctAnswer;
                        const showResult = selectedAnswer !== null;

                        let buttonStyle = "border-white/20 hover:border-white/40 hover:bg-white/5";
                        if (showResult) {
                            if (isCorrect) buttonStyle = "border-green-500 bg-green-500/20 text-green-400";
                            else if (isSelected) buttonStyle = "border-red-500 bg-red-500/20 text-red-400";
                            else buttonStyle = "border-white/10 opacity-50";
                        } else {
                            if (isSelected) buttonStyle = "border-neon-blue bg-neon-blue/20 text-neon-blue";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswerSelect(idx)}
                                disabled={showResult}
                                className={`w-full p-6 rounded-lg border-2 text-left font-mono transition-all relative overflow-hidden group ${buttonStyle}`}
                            >
                                <div className="relative z-10 flex items-center justify-between">
                                    <span>{option}</span>
                                    {showResult && isCorrect && <CheckCircle className="w-5 h-5" />}
                                    {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Explanation & Next Button */}
                {showExplanation && (
                    <div className="animate-in fade-in slide-in-from-bottom duration-300">
                        <div className={`p-4 rounded border-l-4 mb-6 ${selectedAnswer === currentQ.correctAnswer ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'
                            }`}>
                            <p className="font-mono text-sm text-gray-300">
                                <span className="font-bold block mb-1">ANALYSIS:</span>
                                {currentQ.explanation}
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleNextQuestion}
                                className="flex items-center gap-2 px-8 py-3 bg-white text-black font-orbitron font-bold rounded hover:bg-neon-blue transition-colors"
                            >
                                {currentQuestionIndex < questions.length - 1 ? 'NEXT NODE' : 'COMPLETE SEQUENCE'}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NeuronActivationQuiz;
