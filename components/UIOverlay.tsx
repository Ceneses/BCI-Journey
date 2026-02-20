import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Cpu, Lock, X, PlayCircle, Activity, Database, Settings, LogOut, FileText, ChevronDown, Zap, Beaker, ChevronUp } from 'lucide-react';
import { WorldData } from '../types';
import { getTotalSomas } from '../utils/progressManager';

interface UIOverlayProps {
  selectedWorld: WorldData | null;
  isPanelExpanded: boolean;
  onTogglePanel: () => void;
  onClose: () => void;
  onEnterSimulation: (world: WorldData) => void;
  onGuideNextWorld: () => void;
  nextWorldToExplore: WorldData;
}

const TypewriterText: React.FC<{ text: string; delay?: number; className?: string }> = ({ text, delay = 15, className = "" }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay]);

  return <span className={className}>{displayedText}<span className="animate-pulse text-neon-blue">_</span></span>;
};

const DataCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; color?: string; compact?: boolean }> = ({ title, icon, children, color = "text-neon-blue", compact }) => {
  const borderColor = color === 'text-neon-pink' ? 'border-neon-pink' : 'border-neon-blue';
  return (
  <div className={`relative group ${compact ? 'mt-2' : 'mt-6'}`}>
    <div className={`absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t border-l ${borderColor} opacity-50 group-hover:opacity-100 transition-opacity`} />
    <div className={`absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b border-r ${borderColor} opacity-50 group-hover:opacity-100 transition-opacity`} />

    <div className={`bg-white/5 border border-white/10 rounded-sm backdrop-blur-sm hover:bg-white/10 transition-colors duration-300 ${compact ? 'p-3' : 'p-5'}`}>
      <div className={`absolute flex items-center gap-2 bg-black border border-white/20 rounded-full group-hover:border-white/40 transition-colors ${compact ? '-top-2 left-3 px-1.5' : '-top-3 left-4 px-2'}`}>
        <span className={color}>{icon}</span>
        <span className="text-[10px] font-orbitron tracking-widest text-gray-400 uppercase">{title}</span>
      </div>
      <div className={compact ? 'pt-1.5' : 'pt-2'}>
        {children}
      </div>
    </div>
  </div>
  );
};

type ProfileViewMode = 'menu' | 'interfaceSettings' | 'missionLogs';

const UIOverlay: React.FC<UIOverlayProps> = ({
  selectedWorld,
  isPanelExpanded,
  onTogglePanel,
  onClose,
  onEnterSimulation,
  onGuideNextWorld,
  nextWorldToExplore
}) => {
  const navigate = useNavigate();
  const [totalSomas, setTotalSomas] = useState(0);

  // Profile Dropdown State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileViewMode, setProfileViewMode] = useState<ProfileViewMode>('menu');
  const profileRef = useRef<HTMLDivElement>(null);
  const profileSpecifications = {
    displayedUserName: 'NEURAL CADET',
    schoolName: 'NeuroTech Academy',
    birthYear: '2011',
    grade: 'Grade 9',
    uiLanguage: 'English'
  };
  const languageOptions = ['English', 'Chinese', 'Japanese', 'German', 'Spanish'];
  const missionChecklist = [
    {
      id: 'visit-nodes',
      title: 'Visit 3 nodes in the next 24 hours',
      progress: '0 / 3 nodes visited',
      isComplete: false
    },
    {
      id: 'next-level-somas',
      title: 'Accumulate enough SOMAS to pass to the next level',
      progress: 'SOMAS threshold not reached yet',
      isComplete: false
    }
  ];

  const closeProfilePanel = () => {
    setIsProfileOpen(false);
    setProfileViewMode('menu');
  };

  useEffect(() => {
    // Load Total Somas (from all worlds or just accumulated in general?)
    // currently stored per world in progressManager... 
    // Wait, progressManager `loadProgress` takes `worldId`.
    // The requirement implies a global XP/Points system. 
    // But `UserProgress` structure is tied to `worldId`. 
    // For now, let's sum up somas from all worlds or if `selectedWorld` is null, maybe just show a placeholder?
    // Actually, `UserProgress` in `types.ts` has `totalSomas`.
    // `progressManager` saves per `worldId`. 
    // Let's assume for now we just show the Somas from the currently selected world OR if none selected, maybe loop through all 10 worlds to sum?
    // A better approach for the future would be a global user profile.
    // BUT, for this task, I'll calculate the sum of Somas across all WORLDS.

    // Let's just sum all worlds for the global display.
    let sum = 0;
    // Assuming WORLDS import is available or we can just iterate known IDs 1-10.
    for (let i = 1; i <= 10; i++) {
      sum += getTotalSomas(i);
    }
    setTotalSomas(sum);

  }, [selectedWorld, isProfileOpen]); // Re-fetch when profile opens or world changes

  // Handle outside click for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        closeProfilePanel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!selectedWorld) {
    return (
      <div className="absolute top-0 left-0 p-8 pointer-events-none z-10 w-full h-full flex flex-col justify-between">
        <header className="flex justify-between items-start w-full">
          {/* Logo Section */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="p-2 bg-neon-blue/20 rounded-full border border-neon-blue animate-pulse shadow-[0_0_15px_rgba(0,243,255,0.3)]">
              <Brain className="w-8 h-8 text-neon-blue" />
            </div>
            <div>
              <h1 className="text-3xl font-orbitron font-bold text-white tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                BCI <span className="text-neon-blue">JOURNEY</span>
              </h1>
              <p className="text-gray-400 text-sm font-rajdhani tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                PHASE 1: NEURAL CARTOGRAPHY
              </p>
            </div>
          </div>

          {/* Profile Section */}
          <div className="relative pointer-events-auto" ref={profileRef}>
            <button
              onClick={() => {
                const nextOpenState = !isProfileOpen;
                setIsProfileOpen(nextOpenState);
                if (nextOpenState) {
                  setProfileViewMode('menu');
                }
              }}
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="text-right hidden md:block">
                <p className="font-orbitron text-white text-xs tracking-widest group-hover:text-neon-blue transition-colors">NEURAL CADET</p>
                <p className="font-mono text-gray-500 text-[10px] flex items-center justify-end gap-1">
                  STATUS: ONLINE <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                </p>
              </div>

              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-white/20 bg-gray-900 flex items-center justify-center overflow-hidden group-hover:border-neon-blue group-hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all">
                  {/* Placeholder Profile Image */}
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"
                    alt="Profile"
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                {/* Status Indicator Badge */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black z-10"></div>
              </div>

              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-neon-blue' : ''}`} />
            </button>

            {isProfileOpen && (
              <div className={`absolute right-0 top-16 bg-cyber-black/95 backdrop-blur-xl border border-neon-blue/30 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 z-50 ${profileViewMode === 'menu' ? 'w-64' : 'w-[min(92vw,520px)] max-h-[min(82vh,620px)] flex flex-col'}`}>
                {profileViewMode === 'menu' ? (
                  <>
                    {/* User Info Header */}
                    <div className="p-4 border-b border-white/10 bg-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-20">
                        <Activity className="w-16 h-16 text-neon-blue" />
                      </div>
                      <div className="flex items-center gap-3 mb-3 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center border border-neon-blue/50 overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-orbitron text-white text-sm">NEURAL CADET</p>
                          <p className="font-mono text-gray-400 text-xs">ID: 8492-AX</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-1">
                        <div className="bg-gradient-to-r from-neon-blue to-neon-pink h-full w-[35%]"></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-neon-blue">SOMAS: {totalSomas.toLocaleString()}</span>
                        <span className="text-gray-500">NEXT: LEVEL 2</span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => setProfileViewMode('interfaceSettings')}
                        className="w-full text-left px-4 py-3 text-sm font-rajdhani text-gray-300 hover:bg-neon-blue/10 hover:text-neon-blue flex items-center gap-3 transition-colors border-l-2 border-transparent hover:border-neon-blue group"
                      >
                        <Settings className="w-4 h-4 text-gray-500 group-hover:text-neon-blue" />
                        Interface Settings
                      </button>
                      <button
                        onClick={() => setProfileViewMode('missionLogs')}
                        className="w-full text-left px-4 py-3 text-sm font-rajdhani text-gray-300 hover:bg-neon-blue/10 hover:text-neon-blue flex items-center gap-3 transition-colors border-l-2 border-transparent hover:border-neon-blue group"
                      >
                        <FileText className="w-4 h-4 text-gray-500 group-hover:text-neon-blue" />
                        Mission Logs
                      </button>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/10 py-2 bg-black/40">
                      <button className="w-full text-left px-4 py-3 text-sm font-rajdhani text-red-400 hover:bg-red-900/20 flex items-center gap-3 transition-colors group">
                        <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        Terminate Link
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between gap-3 shrink-0">
                      <button
                        onClick={() => setProfileViewMode('menu')}
                        className="text-[11px] font-mono tracking-wider text-neon-blue hover:text-white transition-colors border border-neon-blue/40 px-2 py-1 rounded"
                      >
                        BACK
                      </button>
                      <div className="text-right">
                        <p className="font-orbitron text-white text-sm tracking-wide">
                          {profileViewMode === 'interfaceSettings' ? 'INTERFACE SETTINGS' : 'MISSION LOGS'}
                        </p>
                        <p className="font-mono text-gray-500 text-[10px]">ID: 8492-AX</p>
                      </div>
                      <button
                        onClick={closeProfilePanel}
                        className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar">
                      {profileViewMode === 'interfaceSettings' ? (
                        <>
                          <div className="text-[10px] font-mono tracking-widest text-neon-blue uppercase">User Specifications</div>
                          <div className="space-y-2">
                            <div className="bg-white/5 border border-white/10 rounded px-3 py-2">
                              <p className="text-[10px] font-mono text-gray-500 uppercase">Displayed User Name</p>
                              <p className="text-sm font-rajdhani text-white">{profileSpecifications.displayedUserName}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded px-3 py-2">
                              <p className="text-[10px] font-mono text-gray-500 uppercase">School Name</p>
                              <p className="text-sm font-rajdhani text-white">{profileSpecifications.schoolName}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-white/5 border border-white/10 rounded px-3 py-2">
                                <p className="text-[10px] font-mono text-gray-500 uppercase">Birth Year</p>
                                <p className="text-sm font-rajdhani text-white">{profileSpecifications.birthYear}</p>
                              </div>
                              <div className="bg-white/5 border border-white/10 rounded px-3 py-2">
                                <p className="text-[10px] font-mono text-gray-500 uppercase">Grade</p>
                                <p className="text-sm font-rajdhani text-white">{profileSpecifications.grade}</p>
                              </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded px-3 py-2">
                              <p className="text-[10px] font-mono text-gray-500 uppercase mb-2">User Interface Language</p>
                              <div className="flex flex-wrap gap-2">
                                {languageOptions.map((language) => (
                                  <span
                                    key={language}
                                    className={`px-2 py-1 rounded text-[11px] font-mono border ${language === profileSpecifications.uiLanguage ? 'bg-neon-blue/20 text-neon-blue border-neon-blue/50' : 'bg-black/40 text-gray-400 border-white/20'}`}
                                  >
                                    {language}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-[10px] font-mono tracking-widest text-neon-blue uppercase">Mission Checklist</div>
                          <div className="space-y-2">
                            {missionChecklist.map((mission) => (
                              <div key={mission.id} className="bg-white/5 border border-white/10 rounded px-3 py-3 flex items-start gap-3">
                                <span className={`mt-0.5 w-4 h-4 rounded-sm border flex items-center justify-center text-[10px] ${mission.isComplete ? 'border-green-400 bg-green-400/20 text-green-300' : 'border-gray-500 text-transparent'}`}>
                                  ✓
                                </span>
                                <div>
                                  <p className="text-sm font-rajdhani text-white leading-tight">{mission.title}</p>
                                  <p className="text-[10px] font-mono text-gray-500 mt-1">{mission.progress}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="border-t border-white/10 py-2 bg-black/40 shrink-0">
                      <button className="w-full text-left px-4 py-3 text-sm font-rajdhani text-red-400 hover:bg-red-900/20 flex items-center gap-3 transition-colors group">
                        <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        Terminate Link
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        <footer className="flex justify-between items-end">
          <button
            onClick={onGuideNextWorld}
            className="pointer-events-auto text-left group bg-black/85 p-4 border border-neon-blue/40 backdrop-blur-md rounded-lg hover:border-neon-blue hover:bg-neon-blue/10 transition-all duration-300 w-[300px] shadow-[0_0_18px_rgba(0,243,255,0.15)]"
          >
            <p className="text-[10px] font-mono text-neon-blue tracking-widest uppercase">Navigation Support</p>
            <p className="text-sm font-orbitron text-white mt-1">Go To Next World</p>
            <p className="text-xs font-rajdhani text-gray-300 mt-2">
              Suggested starting point: <span className="text-neon-blue">{nextWorldToExplore.id}. {nextWorldToExplore.region}</span>
            </p>
          </button>

          {/* BCI Lab shortcut */}
          <button
            onClick={() => navigate('/bcilab')}
            className="pointer-events-auto group flex flex-col items-center gap-2"
          >
            <div className="relative px-5 py-3 bg-black/80 border border-neon-blue/40 backdrop-blur-md rounded-xl hover:border-neon-blue hover:bg-neon-blue/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,243,255,0.25)] flex items-center gap-3">
              {/* Animated corner accents */}
              <div className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t border-l border-neon-blue opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b border-r border-neon-blue opacity-60 group-hover:opacity-100 transition-opacity" />
              <Beaker className="w-4 h-4 text-neon-blue group-hover:animate-pulse" />
              <div className="text-left">
                <p className="font-orbitron text-[10px] font-bold tracking-widest text-neon-blue">BCI LAB</p>
                <p className="font-mono text-[9px] text-gray-500">12 EXPERIMENTS</p>
              </div>
            </div>
          </button>

          <div className="text-right">
            <p className="text-electric-gold font-orbitron animate-pulse text-lg drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
              INITIALIZE NEURAL INTERFACE
              <br />
              <span className="text-xs text-white opacity-70 font-rajdhani tracking-widest">SELECT A GLOWING NODE TO BEGIN</span>
            </p>
          </div>
        </footer>

      </div>
    );
  }

  // Compact panel for Selected World - bottom-right corner, collapsible
  return (
    <div className="absolute bottom-0 right-0 w-[min(100%,320px)] max-h-[min(85vh,420px)] bg-cyber-black/95 border border-t border-l border-neon-blue/30 backdrop-blur-xl rounded-tl-xl z-20 flex flex-col shadow-[-10px_-10px_40px_rgba(0,243,255,0.15)] overflow-hidden transition-all duration-300">
      {/* Header - always visible */}
      <div className="flex justify-between items-center p-3 border-b border-neon-blue/20 bg-black/40 shrink-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neon-blue px-1 border border-neon-blue/30 rounded">ID-{selectedWorld.id.toString().padStart(3, '0')}</span>
            <span className="text-[10px] font-mono text-gray-500 truncate">REGION_LOCK: {selectedWorld.isLocked ? "ACTIVE" : "DISABLED"}</span>
          </div>
          <h2 className="text-lg font-orbitron font-bold text-white uppercase tracking-wider truncate mt-0.5">
            {selectedWorld.region}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-0.5 w-12 rounded-full shrink-0" style={{ backgroundColor: selectedWorld.color, boxShadow: `0 0 6px ${selectedWorld.color}` }} />
            <span className="text-[10px] font-rajdhani text-gray-400 uppercase tracking-widest truncate">{selectedWorld.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={onTogglePanel}
            className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/80 hover:text-white"
            aria-label={isPanelExpanded ? 'Collapse' : 'Expand'}
          >
            {isPanelExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-all hover:rotate-90 text-white border border-transparent hover:border-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible content */}
      {isPanelExpanded && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-0">
            {/* Connection Status */}
            <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-neon-blue border-y border-neon-blue/20 py-1.5 bg-neon-blue/5">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 animate-bounce" />
                <span>NEURAL LINK: ESTABLISHED</span>
              </div>
              <span className="animate-pulse">100%</span>
            </div>

            {/* Primary Function */}
            <DataCard title="Primary Function" icon={<Database className="w-2.5 h-2.5" />} compact>
              <div className="text-white font-rajdhani text-sm leading-relaxed">
                <TypewriterText text={selectedWorld.description} delay={10} />
              </div>
            </DataCard>

            {/* Training Objective */}
            <DataCard title="Training Objective" icon={<Cpu className="w-2.5 h-2.5" />} color="text-neon-pink" compact>
              <div className="text-neon-pink font-rajdhani font-bold text-sm flex items-start gap-2">
                <span className="mt-0.5">{'>'}</span>
                <TypewriterText text={selectedWorld.learningObjective} delay={20} />
              </div>
            </DataCard>

            {/* Mission Protocol - compact */}
            <div className="bg-gradient-to-r from-neon-blue/10 to-transparent p-3 rounded border-l-2 border-neon-blue">
              <h4 className="text-[10px] font-orbitron text-neon-blue uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> Mission Protocol
              </h4>
              <div className="space-y-1.5 font-mono text-[9px] text-gray-300">
                <p><span className="text-white font-bold">1. CONNECT:</span> Listen & Talk</p>
                <p><span className="text-white font-bold">2. ANALYZE:</span> Lesson Summary</p>
                <p><span className="text-neon-pink font-bold">3. ACTIVATE:</span> Neural Quiz</p>
              </div>
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-gray-400 text-[9px]">Reward:</span>
                <span className="text-electric-gold font-bold font-orbitron text-xs flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> 17M SOMAS
                </span>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="p-3 border-t border-white/10 shrink-0">
            <button
              onClick={() => {
                if (!selectedWorld.isLocked) {
                  const worldName = selectedWorld.region.toLowerCase().replace(/\s+/g, '-');
                  navigate(`/journey/${worldName}`);
                }
              }}
              className={`group relative w-full py-3 px-4 rounded font-orbitron font-bold tracking-widest text-sm flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden ${selectedWorld.isLocked
                ? 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800'
                : 'bg-neon-blue text-black hover:text-white border border-neon-blue shadow-[0_0_12px_rgba(0,243,255,0.4)]'
                }`}
            >
              {!selectedWorld.isLocked && (
                <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {selectedWorld.isLocked ? (
                  <><Lock className="w-4 h-4" /> ACCESS DENIED</>
                ) : (
                  <><PlayCircle className="w-4 h-4 group-hover:animate-pulse" /> ENTER SIMULATION</>
                )}
              </span>
            </button>
            {selectedWorld.isLocked && (
              <p className="text-center mt-2 text-[9px] text-gray-500 font-mono">
                Required: Level {selectedWorld.id - 1} Clearance
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UIOverlay;