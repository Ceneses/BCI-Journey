import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CharacterAnchors: React.FC = () => {
    const synapseRef = useRef<THREE.Group>(null);
    const sparkRef = useRef<THREE.Group>(null);

    // Gentle floating animation
    useFrame((state) => {
        if (synapseRef.current) {
            synapseRef.current.position.y = -8 + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
        }
        if (sparkRef.current) {
            sparkRef.current.position.y = -8 + Math.sin(state.clock.elapsedTime * 0.5 + Math.PI) * 0.3;
        }
    });

    return (
        <>
            {/* Synapse - Input Layer (Left Side) */}
            <group ref={synapseRef} position={[-14, -8, 0]}>
                {/* Character orb */}
                <mesh>
                    <sphereGeometry args={[1.2, 32, 32]} />
                    <meshPhysicalMaterial
                        color="#9d00ff"
                        emissive="#9d00ff"
                        emissiveIntensity={1.5}
                        transparent
                        opacity={0.7}
                        roughness={0.2}
                        metalness={0.3}
                    />
                </mesh>

                {/* Inner core */}
                <mesh>
                    <sphereGeometry args={[0.8, 32, 32]} />
                    <meshPhysicalMaterial
                        color="#00f3ff"
                        emissive="#00f3ff"
                        emissiveIntensity={2}
                        transparent
                        opacity={0.5}
                    />
                </mesh>
            </group>

            {/* Spark - Hidden/Output Layers (Right Side) */}
            <group ref={sparkRef} position={[14, -8, 0]}>
                {/* Character orb */}
                <mesh>
                    <sphereGeometry args={[1.2, 32, 32]} />
                    <meshPhysicalMaterial
                        color="#ffd700"
                        emissive="#ffd700"
                        emissiveIntensity={1.5}
                        transparent
                        opacity={0.7}
                        roughness={0.2}
                        metalness={0.3}
                    />
                </mesh>

                {/* Inner core */}
                <mesh>
                    <sphereGeometry args={[0.8, 32, 32]} />
                    <meshPhysicalMaterial
                        color="#ff4d00"
                        emissive="#ff4d00"
                        emissiveIntensity={2}
                        transparent
                        opacity={0.5}
                    />
                </mesh>
            </group>
        </>
    );
};

export default CharacterAnchors;
