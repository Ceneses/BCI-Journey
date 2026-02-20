import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, ArrowLeft, Mail, GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react';

// ─── Social Icons (inline SVG for WeChat, LINE, Google) ───────────────
const WeChatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05a6.27 6.27 0 0 1-.261-1.785c0-3.69 3.476-6.678 7.76-6.678.342 0 .678.022 1.007.062C17.09 4.49 13.18 2.188 8.691 2.188zM5.785 5.991a.96.96 0 0 1 0 1.92.96.96 0 0 1 0-1.92zm5.812 0a.96.96 0 0 1 0 1.92.96.96 0 0 1 0-1.92zm3.2 4.638c-3.78 0-6.852 2.602-6.852 5.803 0 3.202 3.072 5.804 6.852 5.804a8.47 8.47 0 0 0 2.347-.329.67.67 0 0 1 .557.076l1.48.87a.256.256 0 0 0 .13.04.227.227 0 0 0 .226-.228c0-.056-.022-.11-.037-.165l-.304-1.154a.458.458 0 0 1 .166-.518c1.447-1.054 2.37-2.611 2.37-4.396 0-3.201-3.072-5.803-6.935-5.803zm-2.57 3.198a.79.79 0 0 1 0 1.58.79.79 0 0 1 0-1.58zm5.14 0a.79.79 0 0 1 0 1.58.79.79 0 0 1 0-1.58z" />
    </svg>
);

const LINEIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386a.63.63 0 0 1-.63-.629V8.108a.63.63 0 0 1 .63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016a.63.63 0 0 1-.63.629.626.626 0 0 1-.51-.262l-2.422-3.298v2.931a.63.63 0 0 1-1.26 0V8.108a.63.63 0 0 1 .63-.63c.2 0 .385.096.505.257l2.427 3.308V8.108a.63.63 0 0 1 1.26 0v4.771zm-5.741 0a.63.63 0 0 1-1.26 0V8.108a.63.63 0 0 1 1.26 0v4.771zm-2.527.629H4.855a.63.63 0 0 1-.63-.629V8.108a.63.63 0 0 1 1.26 0v4.141h1.757c.349 0 .63.285.63.63 0 .344-.282.629-.63.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
);

const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className}>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

type LoginMethod = 'email' | null;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [loginMethod, setLoginMethod] = useState<LoginMethod>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);

    const handleSocialLogin = (provider: string) => {
        setSocialLoading(provider);
        // Simulate social login — replace with real auth flow
        setTimeout(() => {
            setSocialLoading(null);
            navigate('/journey');
        }, 1500);
    };

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate email login — replace with real auth flow
        setTimeout(() => {
            setIsLoading(false);
            navigate('/journey');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-cyber-black text-white relative overflow-hidden flex flex-col font-sans">
            {/* ── Background Effects ── */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-pink/5 fixed" />
            <div
                className="absolute inset-0 opacity-10 pointer-events-none fixed"
                style={{
                    backgroundImage:
                        'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: `${Math.random() * 4 + 1}px`,
                            height: `${Math.random() * 4 + 1}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: i % 2 === 0 ? '#00f3ff' : '#ff00ff',
                            opacity: Math.random() * 0.4 + 0.1,
                            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                        }}
                    />
                ))}
            </div>

            {/* ── Top Bar ── */}
            <nav className="relative z-50 px-8 py-5 flex items-center bg-black/50 backdrop-blur-md border-b border-white/10">
                <button
                    onClick={() => navigate('/')}
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
                <div className="w-16" /> {/* spacer for centering */}
            </nav>

            {/* ── Main Content ── */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* ── Card ── */}
                    <div className="relative rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-[0_0_80px_rgba(0,100,255,0.08)] overflow-hidden">
                        {/* Gradient top stripe */}
                        <div className="h-1 w-full bg-gradient-to-r from-neon-blue via-purple-500 to-neon-pink" />

                        <div className="p-8 md:p-10">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="font-orbitron text-2xl font-bold tracking-wide mb-2">
                                    WELCOME <span className="text-neon-blue">BACK</span>
                                </h1>
                                <p className="text-gray-400 font-rajdhani text-sm">
                                    Sign in to continue your neural journey
                                </p>
                            </div>

                            {/* ── Social Login Buttons ── */}
                            <div className="space-y-3 mb-6">
                                {/* WeChat */}
                                <button
                                    onClick={() => handleSocialLogin('wechat')}
                                    disabled={!!socialLoading}
                                    className="w-full group relative flex items-center gap-4 px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-[#07C160]/10 hover:border-[#07C160]/40 transition-all duration-300 disabled:opacity-50"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-[#07C160]/20 flex items-center justify-center border border-[#07C160]/30">
                                        <WeChatIcon className="w-4 h-4 text-[#07C160]" />
                                    </div>
                                    <span className="font-rajdhani text-sm tracking-wide text-gray-300 group-hover:text-white transition-colors">
                                        Continue with WeChat
                                    </span>
                                    {socialLoading === 'wechat' && <Loader2 className="w-4 h-4 ml-auto animate-spin text-[#07C160]" />}
                                </button>

                                {/* LINE */}
                                <button
                                    onClick={() => handleSocialLogin('line')}
                                    disabled={!!socialLoading}
                                    className="w-full group relative flex items-center gap-4 px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-[#00B900]/10 hover:border-[#00B900]/40 transition-all duration-300 disabled:opacity-50"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-[#00B900]/20 flex items-center justify-center border border-[#00B900]/30">
                                        <LINEIcon className="w-4 h-4 text-[#00B900]" />
                                    </div>
                                    <span className="font-rajdhani text-sm tracking-wide text-gray-300 group-hover:text-white transition-colors">
                                        Continue with LINE
                                    </span>
                                    {socialLoading === 'line' && <Loader2 className="w-4 h-4 ml-auto animate-spin text-[#00B900]" />}
                                </button>

                                {/* Gmail / Google */}
                                <button
                                    onClick={() => handleSocialLogin('google')}
                                    disabled={!!socialLoading}
                                    className="w-full group relative flex items-center gap-4 px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 disabled:opacity-50"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                                        <GoogleIcon className="w-4 h-4" />
                                    </div>
                                    <span className="font-rajdhani text-sm tracking-wide text-gray-300 group-hover:text-white transition-colors">
                                        Continue with Gmail
                                    </span>
                                    {socialLoading === 'google' && <Loader2 className="w-4 h-4 ml-auto animate-spin text-white" />}
                                </button>

                                {/* School Email */}
                                <button
                                    onClick={() => setLoginMethod('email')}
                                    disabled={!!socialLoading}
                                    className="w-full group relative flex items-center gap-4 px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-neon-blue/10 hover:border-neon-blue/30 transition-all duration-300 disabled:opacity-50"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-neon-blue/20 flex items-center justify-center border border-neon-blue/30">
                                        <GraduationCap className="w-4 h-4 text-neon-blue" />
                                    </div>
                                    <span className="font-rajdhani text-sm tracking-wide text-gray-300 group-hover:text-white transition-colors">
                                        Continue with School Email
                                    </span>
                                </button>
                            </div>

                            {/* ── School Email Form (expandable) ── */}
                            {loginMethod === 'email' && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="flex-1 h-px bg-white/10" />
                                        <span className="text-[10px] font-mono text-gray-500 tracking-widest">SCHOOL EMAIL LOGIN</span>
                                        <div className="flex-1 h-px bg-white/10" />
                                    </div>

                                    <form onSubmit={handleEmailLogin} className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] font-mono text-gray-500 mb-2 tracking-wider">
                                                SCHOOL EMAIL
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="name@school.edu"
                                                    required
                                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-rajdhani placeholder-gray-600 focus:border-neon-blue/50 focus:bg-white/[0.07] focus:outline-none focus:shadow-[0_0_20px_rgba(0,243,255,0.1)] transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-mono text-gray-500 mb-2 tracking-wider">
                                                PASSWORD
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    required
                                                    className="w-full pl-4 pr-11 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-rajdhani placeholder-gray-600 focus:border-neon-blue/50 focus:bg-white/[0.07] focus:outline-none focus:shadow-[0_0_20px_rgba(0,243,255,0.1)] transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                className="text-[11px] text-neon-blue/70 hover:text-neon-blue font-rajdhani transition-colors"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-3.5 bg-neon-blue text-black font-orbitron font-bold text-xs tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    AUTHENTICATING...
                                                </>
                                            ) : (
                                                'SIGN IN'
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* ── Divider ── */}
                            {!loginMethod && (
                                <div className="flex items-center gap-3 mt-2 mb-0">
                                    <div className="flex-1 h-px bg-white/10" />
                                    <div className="flex-1 h-px bg-white/10" />
                                </div>
                            )}

                            {/* ── Sign-up link ── */}
                            <div className="mt-8 text-center">
                                <p className="text-gray-500 font-rajdhani text-sm">
                                    Don't have an account?{' '}
                                    <Link
                                        to="/signup"
                                        className="text-neon-blue hover:text-neon-blue/80 font-bold transition-colors"
                                    >
                                        Create Account
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Footer note ── */}
                    <p className="text-center text-[10px] text-gray-600 mt-6 font-mono">
                        SECURE NEURAL-LINK AUTHENTICATION · v2.0
                    </p>
                </div>
            </div>

            {/* ── CSS for floating animation ── */}
            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-5px); }
          75% { transform: translateY(-30px) translateX(15px); }
        }
      `}</style>
        </div>
    );
};

export default LoginPage;
