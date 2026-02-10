import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { WORLDS } from '../constants';
import { WorldData } from '../types';

interface PathwayProps {
  start: WorldData;
  end: WorldData;
}

const Pulse: React.FC<{ curve: THREE.CatmullRomCurve3; color: string; speed: number; offset: number }> = ({ curve, color, speed, offset }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // Calculate position along curve (0 to 1)
      const t = (time * speed + offset) % 1;
      const pos = curve.getPointAt(t);
      meshRef.current.position.copy(pos);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

const NeuralPathways: React.FC = () => {
  // Generate connections based on the `connections` array in WORLDS
  // Use a Set to avoid duplicate lines (A->B and B->A)
  const paths = useMemo(() => {
    const uniquePaths: PathwayProps[] = [];
    const processed = new Set<string>();

    WORLDS.forEach(world => {
      world.connections.forEach(targetId => {
        const target = WORLDS.find(w => w.id === targetId);
        if (target) {
          const key = [world.id, target.id].sort().join('-');
          if (!processed.has(key)) {
            uniquePaths.push({ start: world, end: target });
            processed.add(key);
          }
        }
      });
    });
    return uniquePaths;
  }, []);

  return (
    <group>
      {paths.map((path, index) => {
        const startPos = new THREE.Vector3(path.start.position.x, path.start.position.y, path.start.position.z);
        const endPos = new THREE.Vector3(path.end.position.x, path.end.position.y, path.end.position.z);
        
        // Create a curved path with a midpoint for organic look
        const midPoint = startPos.clone().add(endPos).multiplyScalar(0.5);
        // Push midpoint towards center slightly to curve inwards like white matter tracts
        midPoint.multiplyScalar(0.8); 
        
        const curve = new THREE.CatmullRomCurve3([startPos, midPoint, endPos]);
        const points = curve.getPoints(20);

        return (
          <group key={index}>
             {/* The physical nerve fiber */}
            <line>
              <bufferGeometry>
                 <bufferAttribute 
                    attach="attributes-position" 
                    count={points.length} 
                    array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))} 
                    itemSize={3} 
                 />
              </bufferGeometry>
              <lineBasicMaterial color="#333" transparent opacity={0.3} linewidth={1} />
            </line>
            
            {/* The Data Pulse traveling the fiber */}
            <Pulse curve={curve} color={path.start.color} speed={0.5} offset={index * 0.2} />
            <Pulse curve={curve} color={path.end.color} speed={0.3} offset={index * 0.7 + 0.5} />
          </group>
        );
      })}
    </group>
  );
};

export default NeuralPathways;
