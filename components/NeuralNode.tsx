import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { NeuralNode as NeuralNodeType } from '../types';

interface NeuralNodeProps {
    node: NeuralNodeType;
    position: { x: number; y: number; z: number };
    onClick: () => void;
    worldColor: string;
}

const NeuralNode: React.FC<NeuralNodeProps> = ({ node, position, onClick, worldColor }) => {
    const meshRef = useRef<Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Pulsing animation for active nodes
    useFrame((state) => {
        if (meshRef.current && node.state === 'active') {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
            meshRef.current.scale.setScalar(scale);
        }
    });

    // Determine node appearance based on state
    const getNodeColor = () => {
        if (!node.isUnlocked) return '#333333';
        if (node.state === 'active') return worldColor;
        return hovered ? worldColor : '#666666';
    };

    const getIntensity = () => {
        if (!node.isUnlocked) return 0.1;
        if (node.state === 'active') return 2.0;
        return hovered ? 1.0 : 0.5;
    };

    const getOpacity = () => {
        if (!node.isUnlocked) return 0.3;
        return 0.8;
    };

    return (
        <mesh
            ref={meshRef}
            position={[position.x, position.y, position.z]}
            onClick={(e) => {
                e.stopPropagation();
                if (node.isUnlocked) {
                    onClick();
                }
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                if (node.isUnlocked) {
                    setHovered(true);
                    document.body.style.cursor = 'pointer';
                }
            }}
            onPointerOut={() => {
                setHovered(false);
                document.body.style.cursor = 'default';
            }}
        >
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshPhysicalMaterial
                color={getNodeColor()}
                emissive={getNodeColor()}
                emissiveIntensity={getIntensity()}
                transparent
                opacity={getOpacity()}
                roughness={0.2}
                metalness={0.1}
                clearcoat={1}
                clearcoatRoughness={0.1}
            />

            {/* Glow ring for unlocked nodes */}
            {node.isUnlocked && (
                <mesh scale={1.3}>
                    <ringGeometry args={[0.35, 0.4, 32]} />
                    <meshBasicMaterial
                        color={getNodeColor()}
                        transparent
                        opacity={node.state === 'active' ? 0.4 : 0.2}
                    />
                </mesh>
            )}

            {/* Lock indicator */}
            {!node.isUnlocked && (
                <mesh position={[0, 0, 0.35]}>
                    <boxGeometry args={[0.15, 0.2, 0.05]} />
                    <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
                </mesh>
            )}
        </mesh>
    );
};

export default NeuralNode;
