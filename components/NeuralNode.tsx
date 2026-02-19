import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Mesh } from 'three';
import { NeuralNode as NeuralNodeType, QuestionProgress } from '../types';

const RING_COLORS = {
    listen: '#00f3ff',
    talk: '#ffd700',
    read: '#9d00ff'
};

interface NeuralNodeProps {
    node: NeuralNodeType;
    position: { x: number; y: number; z: number };
    onClick: () => void;
    worldColor: string;
    isSelected: boolean;
    questionProgress?: QuestionProgress | null;
    showLabel?: boolean;
}

const NeuralNode: React.FC<NeuralNodeProps> = ({ node, position, onClick, worldColor, isSelected, questionProgress, showLabel = false }) => {
    const meshRef = useRef<Mesh>(null);
    const [hovered, setHovered] = useState(false);

    const hasListened = questionProgress?.hasListened ?? false;
    const hasTalked = questionProgress?.hasTalked ?? false;
    const hasReadSummary = questionProgress?.hasReadSummary ?? false;
    const isActivated = questionProgress?.isActivated ?? false;

    useFrame((state) => {
        if (meshRef.current) {
            if (isSelected) {
                const scale = 1.15 + Math.sin(state.clock.elapsedTime * 3) * 0.08;
                meshRef.current.scale.setScalar(scale);
            } else if (node.state === 'active' || isActivated) {
                const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
                meshRef.current.scale.setScalar(scale);
            } else {
                meshRef.current.scale.setScalar(1);
            }
        }
    });

    const getNodeColor = () => {
        if (!node.isUnlocked) return '#333333';
        if (isActivated) return '#ff00ff';
        if (isSelected) return '#ffffff';
        if (node.state === 'active') return worldColor;
        return hovered ? worldColor : '#666666';
    };

    const getIntensity = () => {
        if (!node.isUnlocked) return 0.1;
        if (isActivated) return 2.5;
        if (isSelected) return 3.0;
        if (node.state === 'active') return 2.0;
        return hovered ? 1.0 : 0.5;
    };

    const getOpacity = () => {
        if (!node.isUnlocked) return 0.3;
        if (isSelected) return 1.0;
        return 0.8;
    };

    const getRingOpacity = (completed: boolean) => {
        if (!node.isUnlocked) return 0.15;
        if (isActivated) return 0.8;
        return completed ? 0.9 : 0.25;
    };

    return (
        <group position={[position.x, position.y, position.z]}>
        <mesh
            ref={meshRef}
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

            {/* 3 mode rings: Listen (inner), Talk (middle), Read (outer) */}
            {node.isUnlocked && (
                <>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.32, 0.35, 32]} />
                        <meshBasicMaterial
                            color={RING_COLORS.listen}
                            transparent
                            opacity={getRingOpacity(hasListened)}
                            side={THREE.DoubleSide}
                            blending={THREE.AdditiveBlending}
                            depthWrite={false}
                        />
                    </mesh>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.37, 0.40, 32]} />
                        <meshBasicMaterial
                            color={RING_COLORS.talk}
                            transparent
                            opacity={getRingOpacity(hasTalked)}
                            side={THREE.DoubleSide}
                            blending={THREE.AdditiveBlending}
                            depthWrite={false}
                        />
                    </mesh>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.42, 0.45, 32]} />
                        <meshBasicMaterial
                            color={RING_COLORS.read}
                            transparent
                            opacity={getRingOpacity(hasReadSummary)}
                            side={THREE.DoubleSide}
                            blending={THREE.AdditiveBlending}
                            depthWrite={false}
                        />
                    </mesh>
                </>
            )}

            {/* Lock indicator */}
            {!node.isUnlocked && (
                <mesh position={[0, 0, 0.35]}>
                    <boxGeometry args={[0.15, 0.2, 0.05]} />
                    <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
                </mesh>
            )}
        </mesh>

            {/* Question label - only shown for first node and neighbors of activated nodes (reduces lag) */}
            {showLabel && (
            <Html position={[0, 0.6, 0]} center distanceFactor={12} zIndexRange={[100, 0]}>
                <div
                    className={`
                        px-2 py-1 rounded backdrop-blur-md text-[10px] font-orbitron max-w-[140px] transition-all duration-300 transform
                        ${isSelected ? 'bg-black border-2 scale-110' : hovered ? 'bg-black/90 border scale-105' : 'bg-black/70 border scale-100'}
                    `}
                    style={{
                        borderColor: worldColor,
                        boxShadow: isSelected ? `0 0 20px ${worldColor}` : hovered ? `0 0 12px ${worldColor}` : `0 0 5px ${worldColor}`,
                        opacity: isSelected ? 1 : hovered ? 0.98 : 0.88
                    }}
                >
                    <span
                        className="block text-center truncate"
                        style={{
                            color: worldColor,
                            textShadow: isSelected ? `0 0 10px ${worldColor}` : 'none',
                            fontWeight: isSelected ? 'bold' : 'normal'
                        }}
                    >
                        {node.question}
                    </span>
                </div>
            </Html>
            )}
        </group>
    );
};

export default NeuralNode;
