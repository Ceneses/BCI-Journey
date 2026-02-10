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
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = data.position.y + Math.sin(time + data.id) * 0.1;
    }
    
    if (glowRef.current) {
      // Pulsing glow
      const scale = isSelected ? 1.5 : hovered ? 1.2 : 1;
      const pulse = 1 + Math.sin(time * 3) * 0.1;
      glowRef.current.scale.setScalar(scale * pulse);
    }
  });

  return (
    <group 
      position={[data.position.x, data.position.y, data.position.z]} 
      ref={meshRef}
    >
      {/* Interaction Hit Box */}
      <mesh 
        onClick={(e) => { e.stopPropagation(); onSelect(data.id); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={data.color} 
          emissive={data.color}
          emissiveIntensity={isSelected ? 2 : 1}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Outer Glow Halo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshBasicMaterial 
          color={data.color} 
          transparent 
          opacity={0.3} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Connecting Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.55, 32]} />
        <meshBasicMaterial color={data.color} side={THREE.DoubleSide} transparent opacity={0.5} />
      </mesh>

      {/* Floating Label (Only visible on hover or select) */}
      {(hovered || isSelected) && (
        <Html position={[0, 0.6, 0]} center distanceFactor={10}>
          <div className="bg-black/80 border border-[color:var(--c)] px-3 py-1 rounded backdrop-blur-md text-xs font-orbitron whitespace-nowrap" style={{ '--c': data.color } as React.CSSProperties}>
             <span style={{ color: data.color }}>{data.id}. {data.region}</span>
          </div>
        </Html>
      )}
    </group>
  );
};

export default WorldNode;
