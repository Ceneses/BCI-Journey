import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, Home, ArrowLeft, Zap } from 'lucide-react';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [glitchActive, setGlitchActive] = useState(false);
    const animFrameRef = useRef<number>(0);

    // ── Glitch effect triggers ──
    useEffect(() => {
        const interval = setInterval(() => {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 200);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // ── Animated neural noise canvas ──
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        interface Particle {
            x: number; y: number;
            vx: number; vy: number;
            radius: number; alpha: number;
            color: string;
        }

        const particles: Particle[] = Array.from({ length: 60 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            radius: Math.random() * 2 + 1,
            alpha: Math.random() * 0.5 + 0.1,
            color: Math.random() > 0.5 ? '#00f3ff' : '#ff00ff',
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 243, 255, ${(1 - dist / 150) * 0.08})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            // Draw particles
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
                ctx.globalAlpha = 1;

                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            });

            animFrameRef.current = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            cancelAnimationFrame(animFrameRef.current);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <div className="min-h-screen bg-cyber-black text-white relative overflow-hidden flex flex-col items-center justify-center font-sans">
            {/* ── Canvas neural background ── */}
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

            {/* ── Grid overlay ── */}
            <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                }}
            />

            {/* ── Radial glow in center ── */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div
                    className="w-[600px] h-[600px] rounded-full opacity-10"
                    style={{
                        background: 'radial-gradient(circle, #00f3ff 0%, transparent 70%)',
                    }}
                />
            </div>

            {/* ── Top nav ── */}
            <nav className="absolute top-0 left-0 right-0 z-50 px-8 py-5 flex items-center bg-black/40 backdrop-blur-md border-b border-white/10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-rajdhani text-sm tracking-wide">BACK</span>
                </button>
                <div className="flex items-center gap-3 mx-auto">
                    <div className="p-2 bg-neon-blue/20 rounded-full border border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                        <Brain className="w-5 h-5 text-neon-blue" />
                    </div>
                    <span className="font-orbitron font-bold text-lg tracking-widest">
                        BCI <span className="text-neon-blue">JOURNEY</span>
                    </span>
                </div>
                <div className="w-16" />
            </nav>

            {/* ── Main content ── */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">

                {/* Error code */}
                <div className="relative mb-4">
                    <span
                        className={`font-orbitron font-black select-none transition-all duration-100 ${glitchActive ? 'text-neon-pink' : 'text-neon-blue'
                            }`}
                        style={{
                            fontSize: 'clamp(6rem, 20vw, 12rem)',
                            lineHeight: 1,
                            textShadow: glitchActive
                                ? '4px 0 #ff00ff, -4px 0 #00f3ff, 0 0 40px rgba(255,0,255,0.6)'
                                : '0 0 60px rgba(0,243,255,0.4), 0 0 120px rgba(0,243,255,0.2)',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        404
                    </span>

                    {/* Glitch layers */}
                    {glitchActive && (
                        <>
                            <span
                                className="absolute inset-0 font-orbitron font-black text-neon-pink opacity-70 pointer-events-none select-none"
                                style={{
                                    fontSize: 'clamp(6rem, 20vw, 12rem)',
                                    lineHeight: 1,
                                    letterSpacing: '-0.02em',
                                    transform: 'translate(-4px, 2px)',
                                    clipPath: 'inset(20% 0 40% 0)',
                                }}
                            >
                                404
                            </span>
                            <span
                                className="absolute inset-0 font-orbitron font-black text-neon-blue opacity-70 pointer-events-none select-none"
                                style={{
                                    fontSize: 'clamp(6rem, 20vw, 12rem)',
                                    lineHeight: 1,
                                    letterSpacing: '-0.02em',
                                    transform: 'translate(4px, -2px)',
                                    clipPath: 'inset(50% 0 20% 0)',
                                }}
                            >
                                404
                            </span>
                        </>
                    )}
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-2 mb-6">
                    <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
                    <span className="font-mono text-xs text-neon-pink tracking-[0.3em] uppercase">
                        Neural pathway severed
                    </span>
                    <span className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
                </div>

                {/* Divider bar */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent mb-8" />

                {/* Heading */}
                <h1 className="font-orbitron font-bold text-2xl md:text-3xl tracking-wide mb-4">
                    SIGNAL <span className="text-neon-blue">NOT FOUND</span>
                </h1>

                {/* Description */}
                <p className="font-rajdhani text-gray-400 text-lg mb-2 leading-relaxed">
                    The neural pathway you're looking for doesn't exist or has been disconnected.
                </p>

                {/* Route display */}
                <div className="flex items-center gap-2 mb-10 px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] max-w-sm w-full justify-center">
                    <Zap className="w-3.5 h-3.5 text-neon-pink flex-shrink-0" />
                    <code className="font-mono text-xs text-gray-500 truncate">
                        {location.pathname}
                    </code>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
                    <button
                        id="not-found-home-btn"
                        onClick={() => navigate('/')}
                        className="flex-1 w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-neon-blue text-black font-orbitron font-bold text-xs tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        <Home className="w-4 h-4" />
                        HOME BASE
                    </button>
                    <button
                        id="not-found-journey-btn"
                        onClick={() => navigate('/journey')}
                        className="flex-1 w-full flex items-center justify-center gap-2 py-3.5 px-6 border border-neon-blue/40 text-neon-blue font-orbitron font-bold text-xs tracking-widest rounded-xl hover:bg-neon-blue/10 hover:border-neon-blue hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        <Brain className="w-4 h-4" />
                        MY JOURNEY
                    </button>
                </div>

                {/* Footer hint */}
                <p className="mt-10 font-mono text-[10px] text-gray-600 tracking-widest">
                    ERROR CODE 404 · ROUTE UNRESOLVED · BCI JOURNEY v2.0
                </p>
            </div>

            {/* ── Scan line effect ── */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
                }}
            />

            {/* ── Inline animation styles ── */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) translateX(0); }
                    33% { transform: translateY(-12px) translateX(8px); }
                    66% { transform: translateY(-6px) translateX(-4px); }
                }
            `}</style>
        </div>
    );
};

export default NotFoundPage;
