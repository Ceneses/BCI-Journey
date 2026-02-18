import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, Activity, Zap, Globe, Award, Beaker, Bluetooth, BarChart3, ChevronRight, LogIn, UserPlus } from 'lucide-react';

const LandingPage: React.FC = () => {
   const navigate = useNavigate();

   const schools = [
      "Hangzhou Chongwen Experimental School",
      "Hangzhou Xuejun Wenyuan",
      "Hangzhou Wahaha Bilingual School",
      "Hangzhou Entel Foreign Language School",
      "Hangzhou No.2 High School Qianjiang",
      "Zhejiang Wenling High School",
      "Canada Kent School",
      "Overseas Chinese Academy Suzhou",
      "Britannia International Guangzhou",
      "Foshan No.1 High School"
   ];

   const partners = [
      "Sci2U", "China-Germany Foshan Industry Park", "Brain Research Lab", "ZUST", "ZJU", "Shanghai University", "Suzhou University"
   ];

   return (
      <div className="min-h-screen bg-cyber-black text-white relative overflow-hidden flex flex-col font-sans">
         {/* Background effects */}
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 fixed"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-black/80 to-cyber-black fixed"></div>
         <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none fixed" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

         {/* Navigation */}
         <nav className="relative z-50 px-8 py-6 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-neon-blue/20 rounded-full border border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                  <Brain className="w-6 h-6 text-neon-blue" />
               </div>
               <h1 className="font-orbitron font-bold text-xl tracking-widest">BCI <span className="text-neon-blue">JOURNEY</span></h1>
            </div>
            <div className="hidden md:flex gap-8 text-sm font-rajdhani tracking-wide text-gray-400">
               <a href="#features" className="hover:text-white transition-colors">FEATURES</a>
               <a href="#bcilab" className="hover:text-neon-blue transition-colors text-neon-blue/70">BCI LAB</a>
               <a href="#schools" className="hover:text-white transition-colors">PARTNERS</a>
               <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>
            <div className="flex items-center gap-3">
               <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-5 py-2 border border-white/20 text-gray-300 font-orbitron text-xs font-bold rounded hover:bg-white/10 hover:text-white transition-all"
               >
                  <LogIn className="w-3.5 h-3.5" />
                  LOG IN
               </button>
               <button
                  onClick={() => navigate('/signup')}
                  className="flex items-center gap-2 px-5 py-2 bg-neon-blue/10 border border-neon-blue/50 text-neon-blue font-orbitron text-xs font-bold rounded hover:bg-neon-blue hover:text-black transition-all"
               >
                  <UserPlus className="w-3.5 h-3.5" />
                  SIGN UP
               </button>
            </div>
         </nav>

         {/* Hero Section */}
         <header className="relative z-10 pt-20 pb-32 px-4 text-center flex flex-col items-center">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-1 rounded-full border border-neon-blue/30 bg-neon-blue/10 text-neon-blue text-xs font-mono tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-1000">
               <Activity className="w-3 h-3" /> NEURO-LINK INTERFACE READY
            </div>

            <h1 className="text-5xl md:text-8xl font-orbitron font-bold mb-6 tracking-tight animate-in fade-in zoom-in duration-700 max-w-5xl mx-auto leading-tight">
               UNLOCK YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-pink">MIND</span>
            </h1>

            <p className="max-w-2xl text-gray-300 font-rajdhani text-xl md:text-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
               The world's first gamified BCI education platform. Master neuroscience through interactive 3D simulations and earn real rewards.
            </p>

            <div className="flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
               <button
                  onClick={() => navigate('/signup')}
                  className="group relative px-8 py-4 bg-neon-blue text-black font-orbitron font-bold text-lg tracking-widest overflow-hidden clip-path-polygon transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] rounded"
               >
                  <span className="relative flex items-center gap-3">
                     CREATE FREE ACCOUNT <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
               </button>
               <button
                  onClick={() => navigate('/login')}
                  className="group px-8 py-4 border border-white/20 hover:bg-white/5 text-white font-orbitron font-bold text-lg tracking-widest rounded transition-all flex items-center justify-center gap-3"
               >
                  <LogIn className="w-5 h-5" />
                  LOG IN
               </button>
            </div>
         </header>

         {/* Social Proof - Scrolling Marquee */}
         <section id="schools" className="relative z-10 py-10 border-y border-white/5 bg-black/30 backdrop-blur-sm overflow-hidden">
            <p className="text-center text-xs font-mono text-gray-500 mb-6 uppercase tracking-widest">Trusted by Leading Institutions</p>
            <div className="flex gap-12 animate-marquee whitespace-nowrap">
               {/* Duplicate list for seamless infinite scroll (A, B, A, B) */}
               {[...schools, ...partners, ...schools, ...partners].map((name, i) => (
                  <div key={i} className="text-gray-400 font-rajdhani text-lg flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
                     <Globe className="w-4 h-4 text-gray-600" /> {name}
                  </div>
               ))}
            </div>
         </section>

         {/* Features vs Benefits */}
         <section id="features" className="relative z-10 py-24 px-4 bg-black/40">
            <div className="max-w-6xl mx-auto">
               <h2 className="text-3xl md:text-5xl font-orbitron font-bold text-center mb-16">
                  NOT JUST A <span className="text-neon-pink">GAME</span>. <br />
                  IT'S <span className="text-neon-blue">EVOLUTION</span>.
               </h2>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Feature 1 */}
                  <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl hover:border-neon-blue/50 transition-all group hover:-translate-y-2">
                     <div className="w-16 h-16 bg-neon-blue/20 rounded-2xl flex items-center justify-center mb-6 border border-neon-blue/30 group-hover:rotate-6 transition-transform">
                        <Brain className="w-8 h-8 text-neon-blue" />
                     </div>
                     <h3 className="font-orbitron text-xl mb-3 text-white">Master Neuroscience</h3>
                     <p className="text-gray-400 font-rajdhani leading-relaxed">
                        Don't just memorize terms. <span className="text-white">Experience</span> the brain's architecture through immersive 3D mapping and interactive simulations.
                     </p>
                  </div>

                  {/* Feature 2 */}
                  <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl hover:border-electric-gold/50 transition-all group hover:-translate-y-2">
                     <div className="w-16 h-16 bg-electric-gold/20 rounded-2xl flex items-center justify-center mb-6 border border-electric-gold/30 group-hover:rotate-6 transition-transform">
                        <Zap className="w-8 h-8 text-electric-gold" />
                     </div>
                     <h3 className="font-orbitron text-xl mb-3 text-white">AI-Powered Mentors</h3>
                     <p className="text-gray-400 font-rajdhani leading-relaxed">
                        Stuck on a concept? Have a real-time voice conversation with <span className="text-white">Synapse & Spark</span>, your personal AI tutors available 24/7.
                     </p>
                  </div>

                  {/* Feature 3 */}
                  <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl hover:border-neon-pink/50 transition-all group hover:-translate-y-2">
                     <div className="w-16 h-16 bg-neon-pink/20 rounded-2xl flex items-center justify-center mb-6 border border-neon-pink/30 group-hover:rotate-6 transition-transform">
                        <Award className="w-8 h-8 text-neon-pink" />
                     </div>
                     <h3 className="font-orbitron text-xl mb-3 text-white">Earn Real Rewards</h3>
                     <p className="text-gray-400 font-rajdhani leading-relaxed">
                        Every quiz you pass earns you <span className="text-white">Somas</span>. Compete on global leaderboards and prove your cognitive mastery.
                     </p>
                  </div>

                  {/* Feature 4 — BCI Lab */}
                  <div
                     onClick={() => navigate('/bcilab')}
                     className="p-8 border border-neon-blue/20 bg-neon-blue/[0.04] backdrop-blur-sm rounded-xl hover:border-neon-blue/60 transition-all group hover:-translate-y-2 cursor-pointer col-span-1 md:col-span-3 flex flex-col md:flex-row items-start md:items-center gap-6"
                  >
                     <div className="w-16 h-16 bg-neon-blue/20 rounded-2xl flex items-center justify-center border border-neon-blue/40 group-hover:rotate-6 transition-transform flex-shrink-0">
                        <Beaker className="w-8 h-8 text-neon-blue" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <h3 className="font-orbitron text-xl text-white">BCI Lab — Real Experiments</h3>
                           <span className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded-full border border-neon-blue/40 bg-neon-blue/10 text-neon-blue tracking-wider">NEW</span>
                        </div>
                        <p className="text-gray-400 font-rajdhani leading-relaxed">
                           Go beyond theory. Connect a <span className="text-white">Unicorn Hybrid Black BCI headset</span> via Bluetooth, run live 8-channel EEG signal tests, apply filters, record data, and launch real neuroscience experiments — all from your browser.
                        </p>
                     </div>
                     <div className="flex items-center gap-2 text-neon-blue font-orbitron text-xs font-bold tracking-wider group-hover:gap-3 transition-all flex-shrink-0">
                        OPEN LAB <ChevronRight className="w-4 h-4" />
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* BCI Lab Showcase Section */}
         <section id="bcilab" className="relative z-10 py-24 px-4 bg-gradient-to-b from-black/40 to-neon-blue/[0.03]">
            <div className="max-w-6xl mx-auto">
               <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                  <div className="p-2 bg-neon-blue/20 rounded-xl border border-neon-blue/40">
                     <Beaker className="w-6 h-6 text-neon-blue" />
                  </div>
                  <span className="font-mono text-xs text-neon-blue tracking-widest">EXPERIMENT LIBRARY</span>
               </div>
               <h2 className="text-3xl md:text-5xl font-orbitron font-bold mb-6">
                  THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-purple-400 to-neon-pink">BCI LAB</span>
               </h2>
               <p className="text-gray-400 font-rajdhani text-lg md:text-xl max-w-2xl mb-14 leading-relaxed">
                  12 curated brain-computer interface experiments. Connect your headset, test your signal, and run real paradigms — from P300 Spellers to Motor Imagery classifiers.
               </p>

               {/* Experiment highlights grid */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                  {[
                     { title: 'P300 Speller', cat: 'BCI', color: '#00f3ff', desc: 'Spell words using event-related potentials from focused attention.' },
                     { title: 'Motor Imagery Classifier', cat: 'Motor Imagery', color: '#ff00ff', desc: 'Decode left/right hand movement intentions in real-time.' },
                     { title: 'Alpha Wave Training', cat: 'Neurofeedback', color: '#00ff41', desc: 'Train your brain to boost alpha power for relaxation and focus.' },
                     { title: 'SSVEP Frequency Detector', cat: 'BCI', color: '#8b5cf6', desc: 'Detect steady-state visually evoked potentials from flickering stimuli.' },
                     { title: 'Oddball Paradigm', cat: 'ERP', color: '#ffd700', desc: 'Observe the P300 component by detecting rare target stimuli.' },
                     { title: 'SMR Neurofeedback', cat: 'Neurofeedback', color: '#14b8a6', desc: 'Enhance sensorimotor rhythm for improved focus through gamified feedback.' },
                  ].map((exp) => (
                     <div
                        key={exp.title}
                        onClick={() => navigate('/bcilab')}
                        className="group cursor-pointer rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-300"
                     >
                        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${exp.color}, transparent)` }} />
                        <div className="p-5">
                           <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded mb-3 inline-block" style={{ color: exp.color, backgroundColor: `${exp.color}15` }}>
                              {exp.cat.toUpperCase()}
                           </span>
                           <h3 className="font-orbitron text-sm font-bold text-white mb-2 group-hover:text-[var(--c)] transition-colors" style={{ '--c': exp.color } as React.CSSProperties}>
                              {exp.title}
                           </h3>
                           <p className="text-gray-500 text-xs font-rajdhani leading-relaxed">{exp.desc}</p>
                        </div>
                     </div>
                  ))}
               </div>

               {/* Feature pills */}
               <div className="flex flex-wrap gap-3 mb-12">
                  {[
                     { icon: <Bluetooth className="w-3.5 h-3.5" />, label: 'Bluetooth BCI Connection' },
                     { icon: <Activity className="w-3.5 h-3.5" />, label: '8-Channel EEG Visualization' },
                     { icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'Real-time Bandpower' },
                     { icon: <Zap className="w-3.5 h-3.5" />, label: 'Notch & Bandpass Filters' },
                     { icon: <Award className="w-3.5 h-3.5" />, label: '12 Experiment Paradigms' },
                  ].map((pill) => (
                     <div key={pill.label} className="flex items-center gap-2 px-4 py-2 rounded-full border border-neon-blue/20 bg-neon-blue/[0.06] text-neon-blue text-xs font-mono">
                        {pill.icon} {pill.label}
                     </div>
                  ))}
               </div>

               <button
                  onClick={() => navigate('/bcilab')}
                  className="group px-10 py-4 bg-neon-blue/10 border border-neon-blue/40 text-neon-blue font-orbitron text-sm font-bold tracking-widest rounded-xl hover:bg-neon-blue hover:text-black transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,243,255,0.3)] flex items-center gap-3"
               >
                  <Beaker className="w-5 h-5" /> ENTER THE BCI LAB <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
         </section>

         {/* FAQ Section */}
         <section id="faq" className="relative z-10 py-24 px-4">
            <div className="max-w-4xl mx-auto">
               <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-center mb-12">NEURAL ARCHIVES (FAQ)</h2>

               <div className="space-y-4">
                  {[
                     { q: "What is BCI Journey?", a: "BCI Journey is an interactive educational platform that uses 3D visualization and AI to teach Brain-Computer Interface concepts." },
                     { q: "Do I need a VR headset?", a: "No! The experience is fully accessible directly in your web browser on desktop or tablet." },
                     { q: "Is it suitable for beginners?", a: "Absolutely. We start with the basics of neuroanatomy and guide you through complex topics step-by-step." },
                     { q: "How do I earn Somas?", a: "You earn 17 Million Somas for every 'Activate Neuron' quiz you pass with a perfect score." }
                  ].map((item, i) => (
                     <div key={i} className="border border-white/10 bg-black/40 rounded-lg overflow-hidden">
                        <div className="p-6">
                           <h3 className="font-orbitron text-lg text-neon-blue mb-2 flex items-center gap-3">
                              <span className="text-white/50">0{i + 1}.</span> {item.q}
                           </h3>
                           <p className="text-gray-400 font-rajdhani ml-8">{item.a}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Call to Action */}
         <section className="relative z-10 py-24 px-4 bg-gradient-to-b from-transparent to-neon-blue/5">
            <div className="max-w-xl mx-auto text-center p-8 border border-white/10 bg-black/60 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(0,100,255,0.1)]">
               <h2 className="text-2xl font-orbitron font-bold mb-4">JOIN THE NEURAL NETWORK</h2>
               <p className="text-gray-400 mb-8 font-rajdhani">Create your free account and start exploring neuroscience through immersive 3D simulations.</p>

               <div className="flex flex-col sm:flex-row gap-4">
                  <button
                     onClick={() => navigate('/signup')}
                     className="flex-1 group py-4 bg-white text-black font-orbitron font-bold tracking-widest hover:bg-neon-blue transition-colors rounded flex items-center justify-center gap-3"
                  >
                     <UserPlus className="w-5 h-5" />
                     SIGN UP FREE
                  </button>
                  <button
                     onClick={() => navigate('/login')}
                     className="flex-1 py-4 border border-white/20 text-white font-orbitron font-bold tracking-widest hover:bg-white/5 transition-colors rounded flex items-center justify-center gap-3"
                  >
                     <LogIn className="w-5 h-5" />
                     LOG IN
                  </button>
               </div>
               <p className="mt-6 text-[10px] text-gray-500">Sign up with WeChat · LINE · Gmail · School Email</p>
            </div>
         </section>

         {/* Footer */}
         <footer className="relative z-10 p-8 border-t border-white/5 bg-black text-center">
            <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto gap-6 opacity-60 hover:opacity-100 transition-opacity">
               <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-gray-500" />
                  <span className="font-orbitron font-bold text-sm text-gray-300">BCI JOURNEY</span>
               </div>
               <div className="text-[10px] font-mono text-gray-600">
                  © 2025 BCI EDUCATION INITIATIVE
               </div>
               <div className="flex gap-4">
                  {/* Minimalist links logic if needed */}
               </div>
            </div>
         </footer>
      </div>
   );
};
export default LandingPage;