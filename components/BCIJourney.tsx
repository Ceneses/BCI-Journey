import React, { useEffect, useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import BrainParticles from './BrainParticles';
import WorldNode from './WorldNode';
import NeuralPathways from './NeuralPathways';
import UIOverlay from './UIOverlay';
import SimulationMode from './SimulationMode';
import IntroductionOverlay from './IntroductionOverlay';
import { WORLDS } from '../constants';
import { WorldData } from '../types';
import { loadProgress } from '../utils/progressManager';
import { useFrame, useThree } from '@react-three/fiber';

type OrbitControlsRef = {
  target: THREE.Vector3;
  update: () => void;
};

const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 0, 12);
const DEFAULT_CAMERA_TARGET = new THREE.Vector3(0, 0, 0);
const SELECTED_WORLD_CAMERA_OFFSET = new THREE.Vector3(0.4, 0.35, 2.3);

function getWorldScenePosition(world: WorldData): THREE.Vector3 {
  // Worlds are rendered inside a group rotated by PI around Y.
  return new THREE.Vector3(-world.position.x, world.position.y, -world.position.z);
}

function hasWorldBeenExplored(worldId: number): boolean {
  const progress = loadProgress(worldId);
  const hasCompletedQuestions = progress.completedQuestions.length > 0;
  const hasSomas = (progress.totalSomas || 0) > 0;
  const hasQuestionInteraction = Object.values(progress.questionProgress || {}).some(
    (question) => question.hasListened || question.hasTalked || question.hasReadSummary || question.isActivated
  );

  return hasCompletedQuestions || hasSomas || hasQuestionInteraction;
}

const CameraFocusController: React.FC<{
  selectedWorld: WorldData | null;
  controlsRef: React.RefObject<OrbitControlsRef | null>;
}> = ({ selectedWorld, controlsRef }) => {
  const { camera } = useThree();
  const targetPositionRef = useRef<THREE.Vector3>(DEFAULT_CAMERA_POSITION.clone());
  const targetLookAtRef = useRef<THREE.Vector3>(DEFAULT_CAMERA_TARGET.clone());
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (selectedWorld) {
      const worldPosition = getWorldScenePosition(selectedWorld);
      targetLookAtRef.current.copy(worldPosition);
      targetPositionRef.current.copy(worldPosition.clone().add(SELECTED_WORLD_CAMERA_OFFSET));
    } else {
      targetLookAtRef.current.copy(DEFAULT_CAMERA_TARGET);
      targetPositionRef.current.copy(DEFAULT_CAMERA_POSITION);
    }
    isAnimatingRef.current = true;
  }, [selectedWorld]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls || !isAnimatingRef.current) return;

    camera.position.lerp(targetPositionRef.current, 0.08);
    controls.target.lerp(targetLookAtRef.current, 0.1);
    controls.update();

    const positionSettled = camera.position.distanceTo(targetPositionRef.current) < 0.03;
    const targetSettled = controls.target.distanceTo(targetLookAtRef.current) < 0.03;
    if (positionSettled && targetSettled) {
      isAnimatingRef.current = false;
    }
  });

  return null;
};

function BCIJourney() {
  const [selectedWorldId, setSelectedWorldId] = useState<number | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [appMode, setAppMode] = useState<'map' | 'simulation'>('map');
  const [showIntro, setShowIntro] = useState(true);
  const controlsRef = useRef<OrbitControlsRef | null>(null);

  const selectedWorld = selectedWorldId
    ? WORLDS.find(w => w.id === selectedWorldId) || null
    : null;
  const nextWorldToExplore = WORLDS.find((world) => !hasWorldBeenExplored(world.id)) || WORLDS[0];

  const handleWorldSelect = (worldId: number) => {
    if (selectedWorldId === worldId) {
      setIsPanelExpanded((prev) => !prev);
    } else {
      setSelectedWorldId(worldId);
      setIsPanelExpanded(true);
    }
  };

  const handleEnterSimulation = (world: WorldData) => {
    if (world) {
      setAppMode('simulation');
    }
  };

  const handleGuideToNextWorld = () => {
    setSelectedWorldId(nextWorldToExplore.id);
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
              <CameraFocusController selectedWorld={selectedWorld} controlsRef={controlsRef} />

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
                      onSelect={handleWorldSelect}
                    />
                  ))}

                  <NeuralPathways />
                </group>

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
              </Suspense>

              <OrbitControls
                ref={controlsRef}
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
            isPanelExpanded={isPanelExpanded}
            onTogglePanel={() => setIsPanelExpanded((p) => !p)}
            onClose={() => setSelectedWorldId(null)}
            onEnterSimulation={handleEnterSimulation}
            onGuideNextWorld={handleGuideToNextWorld}
            nextWorldToExplore={nextWorldToExplore}
          />

          {/* Introduction Overlay */}
          {showIntro && <IntroductionOverlay onDismiss={() => setShowIntro(false)} />}
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

export default BCIJourney;