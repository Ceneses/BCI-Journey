import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import BrainParticles from './components/BrainParticles';
import WorldNode from './components/WorldNode';
import NeuralPathways from './components/NeuralPathways';
import UIOverlay from './components/UIOverlay';
import SimulationMode from './components/SimulationMode';
import { WORLDS } from './constants';
import { WorldData } from './types';

function App() {
  const [selectedWorldId, setSelectedWorldId] = useState<number | null>(null);
  const [appMode, setAppMode] = useState<'map' | 'simulation'>('map');

  const selectedWorld = selectedWorldId 
    ? WORLDS.find(w => w.id === selectedWorldId) || null 
    : null;

  const handleEnterSimulation = () => {
    if (selectedWorld) {
        setAppMode('simulation');
    }
  };

  const handleExitSimulation = () => {
    setAppMode('map');
  };

  return (
    <div className="w-screen h-screen bg-cyber-black relative overflow-hidden">
      
      {appMode === 'map' && (
        <>
            {/* 3D Scene */}
            <div className="absolute inset-0 z-0">
                <Canvas gl={{ antialias: false, alpha: false }}>
                <color attach="background" args={['#050505']} />
                <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />
                
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />

                <Suspense fallback={null}>
                    <group rotation={[0, Math.PI, 0]}> {/* Initial rotation to face frontal lobe */}
                        <BrainParticles />
                        
                        {WORLDS.map((world) => (
                        <WorldNode 
                            key={world.id} 
                            data={world} 
                            isSelected={selectedWorldId === world.id}
                            onSelect={setSelectedWorldId} 
                        />
                        ))}

                        <NeuralPathways />
                    </group>
                    
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                </Suspense>

                <OrbitControls 
                    enablePan={false}
                    minDistance={6}
                    maxDistance={20}
                    autoRotate={!selectedWorldId}
                    autoRotateSpeed={0.5}
                    dampingFactor={0.05}
                />

                <EffectComposer enableNormalPass={false}>
                    <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.5} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>
                </Canvas>
            </div>

            {/* UI Layer */}
            <UIOverlay 
                selectedWorld={selectedWorld} 
                onClose={() => setSelectedWorldId(null)} 
                onEnterSimulation={handleEnterSimulation}
            />
        </>
      )}

      {appMode === 'simulation' && selectedWorld && (
          <SimulationMode 
            world={selectedWorld} 
            onExit={handleExitSimulation} 
          />
      )}

    </div>
  );
}

export default App;
