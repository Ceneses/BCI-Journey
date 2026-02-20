import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Brain, Bluetooth, BluetoothSearching, CheckCircle2, Battery, Signal,
  ArrowLeft, Play, Square, Activity, BarChart3, SlidersHorizontal,
  Zap, Radio, Loader2, ChevronRight
} from 'lucide-react';
import { experiments } from '../data/experiments';

/* ── Constants ─────────────────────────────────────── */

const CHANNELS = ['Fz', 'C3', 'Cz', 'C4', 'Pz', 'PO7', 'Oz', 'PO8'] as const;
const CHANNEL_COLORS = [
  '#00f3ff', '#8b5cf6', '#ff00ff', '#00ff41',
  '#ffd700', '#f97316', '#ec4899', '#06b6d4',
];
const SAMPLE_RATE = 256;
const DISPLAY_SECONDS = 4;
const CANVAS_POINTS = SAMPLE_RATE * DISPLAY_SECONDS;

const BAND_NAMES = ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'] as const;
const BAND_COLORS = ['#8b5cf6', '#06b6d4', '#00ff41', '#ffd700', '#ff00ff'];

type ConnectionState = 'idle' | 'scanning' | 'found' | 'connecting' | 'connected';

/* ── Dummy EEG generator ──────────────────────────── */

function generateSample(channelIdx: number, t: number, notch: boolean, bandpass: boolean): number {
  const base =
    Math.sin(2 * Math.PI * (8 + channelIdx * 0.5) * t) * 20 +   // alpha-ish
    Math.sin(2 * Math.PI * (13 + channelIdx) * t) * 10 +          // beta-ish
    Math.sin(2 * Math.PI * 2 * t) * 15 +                          // delta
    (Math.random() - 0.5) * 40;                                   // noise

  let val = base;
  // simulated notch — attenuate 50 Hz component
  if (!notch) val += Math.sin(2 * Math.PI * 50 * t) * 12;
  // simulated bandpass — boost mid-range, attenuate low/high noise
  if (bandpass) val *= 0.7;
  return val;
}

function generateBandpower(): number[] {
  return [
    0.2 + Math.random() * 0.3,  // delta
    0.15 + Math.random() * 0.25, // theta
    0.3 + Math.random() * 0.4,   // alpha
    0.1 + Math.random() * 0.3,   // beta
    0.05 + Math.random() * 0.15, // gamma
  ];
}

/* ── Component ────────────────────────────────────── */

const ExperimentSetupPage: React.FC = () => {
  const { experimentId } = useParams<{ experimentId: string }>();
  const navigate = useNavigate();
  const experiment = experiments.find((e) => e.id === experimentId);

  /* connection state */
  const [connState, setConnState] = useState<ConnectionState>('idle');
  const [battery, setBattery] = useState(87);
  const [signalQuality, setSignalQuality] = useState(92);

  /* signal-test state */
  const [notchFilter, setNotchFilter] = useState(false);
  const [bandpassFilter, setBandpassFilter] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showBandpower, setShowBandpower] = useState(false);
  const [bandpowerData, setBandpowerData] = useState<number[][]>(
    CHANNELS.map(() => generateBandpower()),
  );

  /* refs for canvas animation */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buffers = useRef<Float32Array[]>(CHANNELS.map(() => new Float32Array(CANVAS_POINTS)));
  const writeIdx = useRef(0);
  const animRef = useRef(0);
  const timeRef = useRef(0);

  /* ── Simulated connection flow ── */
  const startConnection = useCallback(() => {
    setConnState('scanning');
    setTimeout(() => setConnState('found'), 2000);
    setTimeout(() => setConnState('connecting'), 3200);
    setTimeout(() => {
      setConnState('connected');
      setBattery(82 + Math.floor(Math.random() * 15));
      setSignalQuality(85 + Math.floor(Math.random() * 15));
    }, 4800);
  }, []);

  /* ── Canvas rendering loop ── */
  useEffect(() => {
    if (connState !== 'connected') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    const channelHeight = canvas.height / CHANNELS.length;

    const draw = () => {
      if (!running) return;

      // generate ~4 new samples per frame (≈60 fps → 240 Hz fake rate, close to 256)
      for (let s = 0; s < 4; s++) {
        timeRef.current += 1 / SAMPLE_RATE;
        const idx = writeIdx.current % CANVAS_POINTS;
        for (let ch = 0; ch < CHANNELS.length; ch++) {
          buffers.current[ch][idx] = generateSample(ch, timeRef.current, notchFilter, bandpassFilter);
        }
        writeIdx.current++;
      }

      // clear
      ctx.fillStyle = '#08080f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let i = 1; i < CHANNELS.length; i++) {
        const y = i * channelHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // vertical grid
      for (let s = 1; s < DISPLAY_SECONDS; s++) {
        const x = (s / DISPLAY_SECONDS) * canvas.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // draw each channel
      const total = Math.min(writeIdx.current, CANVAS_POINTS);
      for (let ch = 0; ch < CHANNELS.length; ch++) {
        const yCenter = ch * channelHeight + channelHeight / 2;
        const buf = buffers.current[ch];
        ctx.strokeStyle = CHANNEL_COLORS[ch];
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i < total; i++) {
          const readIdx = (writeIdx.current - total + i + CANVAS_POINTS) % CANVAS_POINTS;
          const x = (i / CANVAS_POINTS) * canvas.width;
          const y = yCenter - buf[readIdx] * (channelHeight / 160);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // channel label
        ctx.fillStyle = CHANNEL_COLORS[ch];
        ctx.font = 'bold 11px Orbitron, monospace';
        ctx.fillText(CHANNELS[ch], 6, ch * channelHeight + 16);
      }

      // recording indicator
      if (isRecording) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(canvas.width - 20, 18, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '10px Orbitron';
        ctx.fillText('REC', canvas.width - 52, 22);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [connState, notchFilter, bandpassFilter, isRecording]);

  /* ── Bandpower refresh ── */
  useEffect(() => {
    if (!showBandpower || connState !== 'connected') return;
    const iv = setInterval(() => {
      setBandpowerData(CHANNELS.map(() => generateBandpower()));
    }, 1500);
    return () => clearInterval(iv);
  }, [showBandpower, connState]);

  /* 404 guard */
  if (!experiment) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center text-white font-orbitron">
        <div className="text-center">
          <p className="text-xl mb-4">Experiment not found</p>
          <button onClick={() => navigate('/bcilab')} className="text-neon-blue underline text-sm">
            Back to Lab
          </button>
        </div>
      </div>
    );
  }

  /* ── Render ────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-cyber-black text-white font-sans relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510]" />
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,243,255,0.4) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-neon-blue/[0.03] blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-neon-pink/[0.03] blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-50 px-6 md:px-8 py-5 flex justify-between items-center bg-black/60 backdrop-blur-xl border-b border-white/[0.06] sticky top-0">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="p-2 bg-neon-blue/20 rounded-full border border-neon-blue/40 shadow-[0_0_15px_rgba(0,243,255,0.2)] group-hover:shadow-[0_0_25px_rgba(0,243,255,0.4)] transition-shadow">
            <Brain className="w-5 h-5 text-neon-blue" />
          </div>
          <h1 className="font-orbitron font-bold text-lg tracking-widest">
            BCI <span className="text-neon-blue">JOURNEY</span>
          </h1>
        </div>
        <button
          onClick={() => navigate('/bcilab')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors font-rajdhani"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lab
        </button>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-10">
        {/* Experiment title badge */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border"
            style={{ backgroundColor: `${experiment.color}15`, borderColor: `${experiment.color}30` }}
          >
            <Activity className="w-5 h-5" style={{ color: experiment.color }} />
          </div>
          <div>
            <h2 className="font-orbitron font-bold text-xl" style={{ color: experiment.color }}>
              {experiment.title}
            </h2>
            <p className="text-xs font-mono text-gray-500">EXPERIMENT SETUP</p>
          </div>
        </div>

        {/* ── PHASE 1: Connection ── */}
        <section className="mb-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bluetooth className="w-5 h-5 text-neon-blue" />
            <h3 className="font-orbitron font-bold text-sm tracking-wider">DEVICE CONNECTION</h3>
          </div>

          {/* Device card */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            {/* Device illustration */}
            <div className="relative w-48 h-48 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent flex items-center justify-center flex-shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-blue/[0.06] to-neon-pink/[0.04]" />
              <div className="relative text-center">
                <Brain className="w-16 h-16 text-neon-blue mx-auto mb-2 opacity-80" />
                <p className="font-orbitron text-[10px] font-bold text-gray-400 tracking-widest">UNICORN</p>
                <p className="font-orbitron text-xs font-bold text-white">HYBRID BLACK</p>
                <p className="text-[9px] font-mono text-gray-500 mt-1">g.tec medical engineering</p>
              </div>
            </div>

            {/* Device info + connect button */}
            <div className="flex-1 text-center md:text-left">
              <h4 className="font-orbitron font-bold text-lg mb-2">Unicorn Hybrid Black</h4>
              <p className="text-gray-400 font-rajdhani text-sm mb-1">8-channel EEG • 24-bit resolution • 250 Hz sampling rate</p>
              <p className="text-gray-500 font-rajdhani text-xs mb-6">Bluetooth 2.1 + EDR • Dry & wet electrodes supported</p>

              {connState === 'idle' && (
                <button
                  onClick={startConnection}
                  className="px-8 py-3 bg-neon-blue/10 border border-neon-blue/40 text-neon-blue font-orbitron text-xs font-bold tracking-widest rounded-xl hover:bg-neon-blue hover:text-black transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,243,255,0.3)] flex items-center gap-2 mx-auto md:mx-0"
                >
                  <BluetoothSearching className="w-4 h-4" /> CONNECT VIA BLUETOOTH
                </button>
              )}

              {connState === 'scanning' && (
                <div className="flex items-center gap-3 text-neon-blue font-mono text-sm animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scanning for devices…
                </div>
              )}

              {connState === 'found' && (
                <div className="flex items-center gap-3 text-purple-400 font-mono text-sm">
                  <Radio className="w-5 h-5 animate-pulse" />
                  Device found — UN-2024-BK-0847
                </div>
              )}

              {connState === 'connecting' && (
                <div className="flex items-center gap-3 text-yellow-400 font-mono text-sm animate-pulse">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Establishing connection…
                </div>
              )}

              {connState === 'connected' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-green-400 font-mono text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Connected — UN-2024-BK-0847
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
                    <span className="flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5 text-green-400" /> {battery}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Signal className="w-3.5 h-3.5 text-neon-blue" /> {signalQuality}% quality
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-yellow-400" /> 250 Hz
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── PHASE 2: Signal Test ── */}
        {connState === 'connected' && (
          <section className="mb-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 px-5 py-4 border-b border-white/[0.06] bg-black/40">
              <span className="font-orbitron text-[10px] font-bold tracking-widest text-gray-400 mr-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-neon-blue" /> EEG SIGNAL TEST
              </span>

              <ToolbarButton
                active={notchFilter}
                onClick={() => setNotchFilter((p) => !p)}
                label="NOTCH 50Hz"
                icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
              />
              <ToolbarButton
                active={bandpassFilter}
                onClick={() => setBandpassFilter((p) => !p)}
                label="BANDPASS 1-40Hz"
                icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
              />
              <ToolbarButton
                active={isRecording}
                onClick={() => setIsRecording((p) => !p)}
                label={isRecording ? 'STOP' : 'RECORD'}
                icon={isRecording ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                activeColor="bg-red-500/20 border-red-400/50 text-red-400"
              />
              <ToolbarButton
                active={showBandpower}
                onClick={() => setShowBandpower((p) => !p)}
                label="BANDPOWER"
                icon={<BarChart3 className="w-3.5 h-3.5" />}
                activeColor="bg-purple-500/20 border-purple-400/50 text-purple-400"
              />
            </div>

            {/* Canvas */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={1200}
                height={520}
                className="w-full h-[420px] md:h-[520px]"
                style={{ imageRendering: 'auto' }}
              />
            </div>

            {/* Bandpower overlay */}
            {showBandpower && (
              <div className="px-5 py-6 border-t border-white/[0.06] bg-black/30">
                <h4 className="font-orbitron text-[10px] font-bold tracking-widest text-gray-400 mb-4">
                  FREQUENCY BAND POWER
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  {CHANNELS.map((ch, ci) => (
                    <div key={ch} className="space-y-2">
                      <span className="text-[10px] font-orbitron font-bold" style={{ color: CHANNEL_COLORS[ci] }}>
                        {ch}
                      </span>
                      <div className="flex items-end gap-[3px] h-16">
                        {BAND_NAMES.map((band, bi) => (
                          <div key={band} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full rounded-sm transition-all duration-700"
                              style={{
                                height: `${bandpowerData[ci][bi] * 100}%`,
                                backgroundColor: BAND_COLORS[bi],
                                opacity: 0.8,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-[3px]">
                        {BAND_NAMES.map((band, bi) => (
                          <span key={band} className="flex-1 text-center text-[7px] font-mono" style={{ color: BAND_COLORS[bi] }}>
                            {band[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start button */}
            <div className="px-5 py-6 border-t border-white/[0.06] flex justify-center">
              <button
                onClick={() => navigate(`/bcilab/${experimentId}/start`)}
                className="px-10 py-4 bg-gradient-to-r from-neon-blue/20 to-purple-500/20 border border-neon-blue/40 text-white font-orbitron text-sm font-bold tracking-widest rounded-xl hover:from-neon-blue/40 hover:to-purple-500/40 hover:shadow-[0_0_40px_rgba(0,243,255,0.2)] transition-all duration-300 flex items-center gap-3"
              >
                START EXPERIMENT <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

/* ── Toolbar Button ───────────────────────────────── */

const ToolbarButton: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  activeColor?: string;
}> = ({ active, onClick, label, icon, activeColor }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-orbitron font-bold tracking-wider border transition-all duration-200 ${
      active
        ? activeColor || 'bg-neon-blue/20 border-neon-blue/50 text-neon-blue shadow-[0_0_12px_rgba(0,243,255,0.15)]'
        : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
    }`}
  >
    {icon} {label}
  </button>
);

export default ExperimentSetupPage;
