import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Generates a cloud of points shaped roughly like a brain
// using two overlapping ellipsoids to simulate hemispheres
const BrainParticles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const particleCount = 4000;
  
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      // Choose hemisphere (left or right)
      const isRight = Math.random() > 0.5;
      const xOffset = isRight ? 0.5 : -0.5;
      
      // Random point in sphere
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      
      const r = Math.cbrt(Math.random()) * 4; // Radius 4
      
      // Deform sphere to look brain-like (flatten bottom, elongate front/back)
      let x = r * Math.sin(phi) * Math.cos(theta);
      let y = r * Math.sin(phi) * Math.sin(theta) * 0.8; // Flatten slightly
      let z = r * Math.cos(phi) * 1.2; // Elongate
      
      // Shift for hemisphere separation
      x += xOffset;

      // Make a gap in the middle (Longitudinal fissure)
      if (Math.abs(x) < 0.3) x = x > 0 ? 0.3 : -0.3;

      // Brain stem area taper
      if (y < -1.5 && Math.abs(x) < 1.5 && z < 0) {
        x *= 0.6;
        z *= 0.6;
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Color gradient: dark blue/purple inner, cyan/teal outer
      const normalizedY = (y + 2) / 4;
      if (Math.random() > 0.8) {
        color.setHex(0x00f3ff); // Neon Cyan highlights
      } else {
         // Mix blue and purple
        color.setHSL(0.6 + (normalizedY * 0.1), 0.8, 0.2 + (Math.random() * 0.3));
      }

      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      // Subtle breathing animation
      const time = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(time * 0.5) * 0.02;
      pointsRef.current.scale.set(scale, scale, scale);
      
      // Slow rotation
      pointsRef.current.rotation.y = time * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default BrainParticles;
