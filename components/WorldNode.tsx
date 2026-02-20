import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { WorldData } from '../types';

interface WorldNodeProps {
  data: WorldData;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

const WorldNode: React.FC<WorldNodeProps> = ({ data, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Floating animation for the whole group
    if (meshRef.current) {
      meshRef.current.position.y = data.position.y + Math.sin(time + data.id) * 0.1;
    }
    
    // Core Sphere Scaling & Animation
    if (coreRef.current) {
       // Smoothly interpolate scale based on state
       const targetScale = isSelected ? 1.3 : hovered ? 1.15 : 1;
       coreRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }

    // Glow Animation
    if (glowRef.current) {
      // Base scale increases on interaction
      const baseScale = isSelected ? 1.8 : hovered ? 1.4 : 1.1;
      
      // Pulse speed and intensity vary by state
      const pulseSpeed = isSelected ? 5 : 2; 
      const pulseIntensity = isSelected ? 0.15 : 0.05;
      const pulse = 1 + Math.sin(time * pulseSpeed) * pulseIntensity;
      
      glowRef.current.scale.setScalar(baseScale * pulse);
      
      // Pulse opacity for breathing effect
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      if (material) {
          material.opacity = (isSelected ? 0.5 : 0.3) + Math.sin(time * pulseSpeed) * 0.1;
      }
    }
    
    // Ring Animation
    if (ringRef.current) {
        if (isSelected) {
            // Rotate and expand ring when selected
            ringRef.current.rotation.z -= 0.02; // Counter-rotate for tech feel
            const ringPulse = 1 + Math.sin(time * 3) * 0.05;
            ringRef.current.scale.setScalar(ringPulse);
        } else {
            // Reset rotation or keep slow idle rotation
            ringRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
            ringRef.current.scale.setScalar(1);
        }
    }
  });

  return (
    <group 
      position={[data.position.x, data.position.y, data.position.z]} 
      ref={meshRef}
    >
      {/* Interaction Hit Box & Core Visual */}
      <mesh 
        ref={coreRef}
        onClick={(e) => { e.stopPropagation(); onSelect(data.id); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={data.color} 
          emissive={data.color}
          emissiveIntensity={isSelected ? 3 : hovered ? 1.5 : 0.5}
          roughness={0.2}
          metalness={0.8}
          toneMapped={false}
        />
      </mesh>

      {/* Outer Glow Halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshBasicMaterial 
          color={data.color} 
          transparent 
          opacity={0.3} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      
      {/* Connecting Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.55, 32]} />
        <meshBasicMaterial 
          color={data.color} 
          side={THREE.DoubleSide} 
          transparent 
          opacity={isSelected ? 0.8 : hovered ? 0.5 : 0.3} 
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Keep region labels visible to improve map readability, especially on touch devices */}
      <Html position={[0, 0.6, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
        <div
          className={`
              px-3 py-1 rounded backdrop-blur-md text-xs font-orbitron whitespace-nowrap transition-all duration-300 transform
              ${isSelected ? 'bg-black border-2 scale-110' : hovered ? 'bg-black/90 border scale-105' : 'bg-black/70 border scale-100'}
            `}
          style={{
            borderColor: data.color,
            boxShadow: isSelected ? `0 0 20px ${data.color}` : hovered ? `0 0 12px ${data.color}` : `0 0 5px ${data.color}`,
            opacity: isSelected ? 1 : hovered ? 0.98 : 0.88
          }}
        >
          <span
            style={{
              color: data.color,
              textShadow: isSelected ? `0 0 10px ${data.color}` : 'none',
              fontWeight: isSelected ? 'bold' : 'normal'
            }}
          >
            {data.id}. {data.region}
          </span>
        </div>
      </Html>
    </group>
  );
};

export default WorldNode;