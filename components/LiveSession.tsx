import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { Mic, MicOff, X, Activity, Zap, Radio, MessageSquare, User, Cpu, ClipboardCheck, ArrowRight, ChevronRight, Image as ImageIcon, Loader2, Minimize2, AlertTriangle } from 'lucide-react';
import { AudioStreamer } from '../utils/audioStreamer';
import { generateCharacterImage } from '../services/geminiService';

interface LiveSessionProps {
  mode: 'Synapse' | 'Spark';
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const LiveSession: React.FC<LiveSessionProps> = ({ mode, onClose }) => {
  const [sessionStatus, setSessionStatus] = useState<'active' | 'summary'>('active');
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [volume, setVolume] = useState(0);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  
  // Image Generation State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Transcript State
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [realtimeInput, setRealtimeInput] = useState("");
  const [realtimeOutput, setRealtimeOutput] = useState("");
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const sessionRef = useRef<any>(null);
  const animationRef = useRef<number>(0);
  
  // Refs for accumulation to handle closure scope in callbacks
  const historyRef = useRef<ChatMessage[]>([]);
  const realtimeInputRef = useRef("");
  const realtimeOutputRef = useRef("");

  useEffect(() => {
    // Scroll to bottom when transcript updates
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, realtimeInput, realtimeOutput, sessionStatus]);

  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      if (!process.env.API_KEY) {
        console.error("API Key missing");
        return;
      }

      const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Tool Definitions
      const endSessionTool: FunctionDeclaration = {
        name: "endSession",
        description: "End the live session when the user is satisfied or the lesson is complete."
      };

      const renderImageTool: FunctionDeclaration = {
        name: "renderImage",
        description: "Render a visual representation or image of a biological or technical concept for the user.",
        parameters: {
            type: Type.OBJECT,
            properties: {
                prompt: {
                    type: Type.STRING,
                    description: "Description of the image to generate.",
                },
            },
            required: ["prompt"],
        },
      };

      // Configure Persona
      let sysInstruction = "";
      let voiceName = "Kore"; 

      const baseInstruction = "Keep responses under 45 seconds. You can use the 'renderImage' tool to visualize concepts if asked or helpful. Always summarize key takeaways as 'Lesson Learned' bullet points before ending. When the conversation reaches a natural conclusion or the user is satisfied, call the 'endSession' tool.";

      if (mode === 'Synapse') {
        sysInstruction = `You are Synapse, a biological expert. Vibe: Calm, soothing, deep focus. Explain the 'why' and biology. ${baseInstruction}`;
        voiceName = "Kore";
      } else {
        sysInstruction = `You are Spark, a tech expert. Vibe: High energy, fast-talking, gamer style. Explain the digital/tech side. ${baseInstruction}`;
        voiceName = "Fenrir";
      }

      // Initialize Audio Streamer
      audioStreamerRef.current = new AudioStreamer((blob) => {
         if (sessionRef.current && isMicOn) {
            sessionRef.current.sendRealtimeInput({ media: blob });
         }
      });

      // Connect Live API
      try {
        const sessionPromise = client.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName } },
            },
            systemInstruction: sysInstruction,
            tools: [{ functionDeclarations: [endSessionTool, renderImageTool] }],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
          callbacks: {
            onopen: async () => {
              if (!isMounted) return;
              setIsConnected(true);
              console.log("Live Session Connected");
              await audioStreamerRef.current?.startRecording();
              startVisualizer();
            },
            onmessage: (msg: LiveServerMessage) => {
              if (!isMounted) return;
              
              // Handle Tool Calls
              if (msg.toolCall) {
                for (const fc of msg.toolCall.functionCalls) {
                    if (fc.name === 'endSession') {
                         handleEndSession();
                         return;
                    }
                    if (fc.name === 'renderImage') {
                        const prompt = fc.args['prompt'] as string;
                        handleRenderImage(prompt, fc.id);
                    }
                }
              }

              const serverContent = msg.serverContent;
              if (!serverContent) return;

              // Handle Audio Output
              const parts = serverContent.modelTurn?.parts;
              if (parts && parts.length > 0) {
                 const inlineData = parts[0].inlineData;
                 if (inlineData && inlineData.data) {
                    audioStreamerRef.current?.playAudioChunk(inlineData.data);
                 }
              }

              // Handle Transcription
              if (serverContent.inputTranscription) {
                const text = serverContent.inputTranscription.text;
                if (text) {
                    realtimeInputRef.current += text;
                    setRealtimeInput(realtimeInputRef.current);
                }
              }
              
              if (serverContent.outputTranscription) {
                const text = serverContent.outputTranscription.text;
                if (text) {
                    realtimeOutputRef.current += text;
                    setRealtimeOutput(realtimeOutputRef.current);
                }
              }

              if (serverContent.turnComplete) {
                // Commit to history
                if (realtimeInputRef.current.trim()) {
                  historyRef.current.push({ role: 'user', text: realtimeInputRef.current });
                }
                if (realtimeOutputRef.current.trim()) {
                  historyRef.current.push({ role: 'model', text: realtimeOutputRef.current });
                }
                
                // Reset buffers
                realtimeInputRef.current = "";
                realtimeOutputRef.current = "";
                
                setHistory([...historyRef.current]);
                setRealtimeInput("");
                setRealtimeOutput("");
              }
            },
            onclose: () => {
              console.log("Session closed");
              setIsConnected(false);
            },
            onerror: (err) => {
              console.error("Session error:", err);
            }
          }
        });
        
        sessionPromise.then(sess => {
            sessionRef.current = sess;
        });

      } catch (e) {
        console.error("Failed to connect live session", e);
      }
    };

    if (sessionStatus === 'active') {
        initSession();
    }

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationRef.current);
      audioStreamerRef.current?.stopRecording();
      if (sessionRef.current) {
          try { sessionRef.current.close(); } catch(e) {}
      }
    };
  }, [mode, isMicOn, sessionStatus]);

  const startVisualizer = () => {
      const loop = () => {
          if (audioStreamerRef.current) {
              const vol = audioStreamerRef.current.getVolume();
              setVolume(vol); // vol is roughly 0-255 scaled
          }
          animationRef.current = requestAnimationFrame(loop);
      };
      loop();
  };

  const handleRenderImage = async (prompt: string, toolId: string) => {
     setIsGeneratingImage(true);
     setGeneratedImage(null);
     
     try {
        const base64Data = await generateCharacterImage(prompt);
        setGeneratedImage(`data:image/png;base64,${base64Data}`);
        
        // Respond to tool call
        if (sessionRef.current) {
            sessionRef.current.sendToolResponse({
                functionResponses: [{
                    id: toolId,
                    name: 'renderImage',
                    response: { result: 'Image rendered successfully.' }
                }]
            });
        }
     } catch (e) {
        console.error("Image generation failed", e);
        if (sessionRef.current) {
            sessionRef.current.sendToolResponse({
                functionResponses: [{
                    id: toolId,
                    name: 'renderImage',
                    response: { result: 'Error: Failed to render image.' }
                }]
            });
        }
     } finally {
        setIsGeneratingImage(false);
     }
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const handleEndSession = () => {
    // Stop recording and switch to summary view
    setIsConnected(false);
    audioStreamerRef.current?.stopRecording();
    setSessionStatus('summary');
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex animate-in fade-in duration-500 overflow-hidden">
      
      {/* Exit Confirmation Modal */}
      {showExitConfirmation && (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-cyber-black border border-white/20 p-8 rounded-lg max-w-sm w-full shadow-[0_0_30px_rgba(0,0,0,0.8)] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                     <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <h3 className="text-xl font-orbitron text-white mb-2 tracking-widest">TERMINATE LINK?</h3>
                <p className="font-rajdhani text-gray-400 mb-8 text-sm">Are you sure you want to end this session?</p>
                
                <div className="flex gap-4 justify-center">
                    <button 
                        onClick={() => setShowExitConfirmation(false)}
                        className="px-6 py-2 rounded border border-white/20 hover:bg-white/10 text-white font-orbitron text-xs tracking-wider"
                    >
                        No, continue
                    </button>
                    <button 
                        onClick={() => {
                            setShowExitConfirmation(false);
                            handleEndSession();
                        }}
                        className="px-6 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-orbitron text-xs tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                    >
                        Yes, end session
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Main Content (Visualizer & Summary Overlay) */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        
        {/* Summary Overlay */}
        {sessionStatus === 'summary' && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center animate-in zoom-in-95 duration-500 p-8">
              <div className="max-w-xl w-full bg-cyber-black border border-neon-blue/30 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.1)] relative">
                  {/* Decor */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-neon-pink"></div>
                  
                  <div className="p-8 text-center">
                      <div className="w-20 h-20 bg-neon-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-neon-blue/30">
                          <ClipboardCheck className="w-10 h-10 text-neon-blue" />
                      </div>
                      
                      <h2 className="text-3xl font-orbitron text-white mb-2 tracking-widest">SESSION CONCLUDED</h2>
                      <p className="font-mono text-gray-400 text-sm mb-8 tracking-wider">NEURAL LINK TERMINATED</p>

                      <div className="bg-white/5 border-l-2 border-electric-gold p-6 text-left mb-8 rounded-r-lg">
                          <h3 className="text-electric-gold font-orbitron text-sm mb-3 flex items-center gap-2 uppercase tracking-wider">
                              <Zap className="w-4 h-4" /> Learning Retention Protocol
                          </h3>
                          <p className="font-rajdhani text-lg text-gray-200 leading-relaxed mb-4">
                              The AI instructor has archived key insights from your conversation.
                          </p>
                          
                          {/* Directed CTA to Sidebar */}
                          <div className="p-4 bg-neon-blue/5 rounded border border-neon-blue/20 flex items-start gap-3 relative overflow-hidden group">
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-neon-blue animate-pulse"></div>
                                <Activity className="w-5 h-5 text-neon-blue shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-mono text-gray-300">
                                        <span className="text-neon-blue font-bold">ACTION REQUIRED:</span><br/>
                                        Check the <span className="text-white font-bold">Neural Log</span> panel on the right for your <span className="text-white border-b border-white/30">Lesson Learned</span> bullet points.
                                    </p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-neon-blue animate-pulse ml-2" />
                          </div>
                      </div>

                      <button 
                        onClick={onClose}
                        className="group w-full py-4 bg-white text-black font-orbitron font-bold tracking-[0.2em] hover:bg-neon-blue transition-all flex items-center justify-center gap-3"
                      >
                        COMPLETE & RETURN <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                  </div>
              </div>
          </div>
        )}

        {/* Header */}
        <div className={`absolute top-8 left-0 w-full flex justify-between items-center px-8 border-b border-white/10 pb-6 z-10 transition-opacity duration-300 ${sessionStatus === 'summary' ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center gap-3">
             <Radio className={`w-6 h-6 ${isConnected ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
             <span className="font-orbitron text-white tracking-widest text-sm md:text-base">
               LIVE UPLINK: <span className={mode === 'Synapse' ? 'text-neon-blue' : 'text-electric-gold'}>{mode.toUpperCase()}</span>
             </span>
          </div>
          <button 
            onClick={() => setShowExitConfirmation(true)} 
            className="p-2 rounded-full border border-white/20 hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dynamic Visualizer Ring OR Image View */}
        <div className={`relative w-[400px] h-[400px] flex items-center justify-center mb-8 transition-all duration-500 ${sessionStatus === 'summary' ? 'opacity-10 scale-90 blur-sm' : 'opacity-100'}`}>
          
          {generatedImage ? (
            <div className="relative w-full h-full rounded-lg overflow-hidden border border-white/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-500 bg-black">
                <img src={generatedImage} alt="Generated Visualization" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-2">
                   <button onClick={() => setGeneratedImage(null)} className="p-1 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur">
                       <Minimize2 className="w-5 h-5" />
                   </button>
                </div>
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4">
                    <p className="text-neon-blue font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                        <ImageIcon className="w-3 h-3" /> Visual Data Rendered
                    </p>
                </div>
            </div>
          ) : isGeneratingImage ? (
             <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-16 h-16 text-neon-blue animate-spin" />
                <p className="font-mono text-neon-blue animate-pulse text-sm">RENDERING VISUAL DATA...</p>
             </div>
          ) : (
            <>
                {/* Reactive Glow Background */}
                <div 
                    className={`absolute inset-0 blur-[60px] rounded-full transition-all duration-75 ${
                        mode === 'Synapse' ? 'bg-neon-blue' : 'bg-electric-gold'
                    }`}
                    style={{ 
                        opacity: 0.2 + (volume / 300),
                        transform: `scale(${1 + volume / 400})` 
                    }}
                ></div>

                {/* Central Core */}
                <div 
                    className={`relative z-20 w-32 h-32 rounded-full border-2 bg-black/80 backdrop-blur-xl flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-75 ${
                        mode === 'Synapse' ? 'border-neon-blue shadow-neon-blue/20' : 'border-electric-gold shadow-electric-gold/20'
                    }`}
                    style={{ transform: `scale(${1 + volume / 600})` }}
                >
                    {mode === 'Synapse' && <Activity className={`w-12 h-12 text-neon-blue transition-opacity duration-100`} style={{ opacity: 0.5 + volume/200 }} />}
                    {mode === 'Spark' && <Zap className={`w-12 h-12 text-electric-gold transition-opacity duration-100`} style={{ opacity: 0.5 + volume/200 }} />}
                </div>

                {/* Audio Wave Rings */}
                {[...Array(6)].map((_, i) => (
                    <div 
                        key={i}
                        className={`absolute rounded-full border transition-all duration-75 ease-out ${
                            mode === 'Synapse' ? 'border-neon-blue' : 'border-electric-gold'
                        }`}
                        style={{
                            width: '100%',
                            height: '100%',
                            borderWidth: '1px',
                            opacity: Math.max(0, (volume / 200) - (i * 0.1)),
                            transform: `scale(${0.5 + (i * 0.15) + (volume / 500)})`,
                            zIndex: 10 - i
                        }}
                    />
                ))}

                {/* Spinning Data Ring */}
                <div className={`absolute w-[280px] h-[280px] rounded-full border border-dashed opacity-30 animate-[spin_10s_linear_infinite] ${
                        mode === 'Synapse' ? 'border-neon-blue' : 'border-electric-gold'
                }`}></div>
                
                <div className={`absolute w-[320px] h-[320px] rounded-full border border-dotted opacity-20 animate-[spin_15s_linear_infinite_reverse] ${
                        mode === 'Synapse' ? 'border-neon-blue' : 'border-electric-gold'
                }`}></div>
            </>
          )}

        </div>

        {/* Status Text */}
        <div className={`text-center mb-12 h-16 transition-all duration-500 ${sessionStatus === 'summary' ? 'opacity-10 blur-sm' : 'opacity-100'}`}>
           {!isConnected ? (
             <p className="font-mono text-neon-blue animate-pulse text-xs">ESTABLISHING SECURE CONNECTION...</p>
           ) : (
             <div className="flex flex-col items-center gap-2">
               <p className="font-rajdhani text-2xl text-white">
                 {volume > 5 ? (
                   <span className="flex items-center gap-2">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                       Signal Detected
                   </span>
                 ) : "Listening..."}
               </p>
               <div className="h-1 w-32 bg-gray-800 rounded-full overflow-hidden">
                   <div className={`h-full transition-all duration-100 ${mode === 'Synapse' ? 'bg-neon-blue' : 'bg-electric-gold'}`} style={{ width: `${Math.min(100, volume)}%` }}></div>
               </div>
             </div>
           )}
        </div>

        {/* Controls */}
        <div className={`flex flex-col items-center gap-3 z-10 transition-all duration-500 ${sessionStatus === 'summary' ? 'opacity-10 blur-sm pointer-events-none' : 'opacity-100'}`}>
          <button 
            onClick={toggleMic}
            className={`p-6 rounded-full transition-all duration-300 relative group ${
              isMicOn 
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-110' 
                : 'bg-red-900/50 text-red-200 border border-red-800'
            }`}
          >
            {isMicOn ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            {isMicOn && (
                <span className="absolute inset-0 rounded-full border border-white/50 animate-ping opacity-75"></span>
            )}
          </button>
          
          <div className="text-center">
             <p className="font-orbitron text-sm font-bold text-white tracking-widest">
                {isMicOn ? 'MICROPHONE ACTIVE' : 'MICROPHONE MUTED'}
             </p>
             {mode === 'Synapse' && (
                 <p className="text-neon-blue text-xs font-mono mt-1 uppercase animate-pulse">
                    {isMicOn ? "Speak your question to Synapse..." : "Tap button to speak"}
                 </p>
             )}
          </div>
        </div>

        {/* Background Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* Side Panel: Transcript */}
      <div className={`w-full md:w-96 bg-black/80 border-l backdrop-blur-md flex flex-col z-20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] transition-all duration-500 ${sessionStatus === 'summary' ? 'border-neon-blue shadow-[0_0_30px_rgba(0,243,255,0.2)]' : 'border-white/10'}`}>
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-neon-blue" />
            <h3 className="font-orbitron text-sm tracking-widest text-white">NEURAL LOG</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {history.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                           <Cpu className="w-4 h-4 text-electric-gold" />
                        </div>
                    )}
                    <div className={`max-w-[80%] p-3 rounded text-sm font-rajdhani leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20' 
                          : 'bg-white/5 text-gray-300 border border-white/10'
                    }`}>
                        {msg.text}
                    </div>
                    {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-neon-blue/10 flex items-center justify-center shrink-0">
                           <User className="w-4 h-4 text-neon-blue" />
                        </div>
                    )}
                </div>
            ))}

            {/* Real-time Bubbles */}
            {realtimeInput && (
                <div className="flex gap-3 justify-end animate-pulse">
                     <div className="max-w-[80%] p-3 rounded text-sm font-rajdhani leading-relaxed bg-neon-blue/5 text-neon-blue/70 border border-neon-blue/10 border-dashed">
                        {realtimeInput} <span className="animate-blink">|</span>
                    </div>
                </div>
            )}
             {realtimeOutput && (
                <div className="flex gap-3 justify-start animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                           <Cpu className="w-4 h-4 text-electric-gold/50" />
                    </div>
                     <div className="max-w-[80%] p-3 rounded text-sm font-rajdhani leading-relaxed bg-white/5 text-gray-400 border border-white/10 border-dashed">
                        {realtimeOutput} <span className="animate-blink">|</span>
                    </div>
                </div>
            )}
            <div ref={transcriptEndRef} />
        </div>
      </div>

    </div>
  );
};

export default LiveSession;