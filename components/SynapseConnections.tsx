import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { NetworkStructure, QuestionProgress } from '../types';
import { getNodePosition } from '../utils/questionLoader';
import * as THREE from 'three';

interface SynapseConnectionsProps {
    network: NetworkStructure;
    worldColor: string;
    questionProgressMap: Record<number, QuestionProgress>;
}

const SynapseConnections: React.FC<SynapseConnectionsProps> = ({ network, worldColor, questionProgressMap }) => {
    const groupRef = useRef<THREE.Group>(null);

    const connections = useMemo(() => {
        const conns: Array<{
            start: { x: number; y: number; z: number };
            end: { x: number; y: number; z: number };
            active: boolean;
        }> = [];

        for (let col = 1; col < 10; col++) {
            const currentColumnNodes = network.nodes.filter(n => n.column === col);
            const nextColumnNodes = network.nodes.filter(n => n.column === col + 1);

            currentColumnNodes.forEach(currentNode => {
                const currentPos = getNodePosition(
                    currentNode.column,
                    currentNode.row,
                    network.columnSizes[currentNode.column - 1]
                );

                nextColumnNodes.forEach((nextNode, idx) => {
                    if (idx % 2 === 0 || nextColumnNodes.length <= 4) {
                        const nextPos = getNodePosition(
                            nextNode.column,
                            nextNode.row,
                            network.columnSizes[nextNode.column - 1]
                        );

                        const currentActivated = questionProgressMap[currentNode.questionId]?.isActivated ?? false;
                        const nextActivated = questionProgressMap[nextNode.questionId]?.isActivated ?? false;

                        conns.push({
                            start: currentPos,
                            end: nextPos,
                            active: currentActivated || nextActivated
                        });
                    }
                });
            });
        }

        return conns;
    }, [network, questionProgressMap]);

    // Animate pulse effect
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.children.forEach((child, idx) => {
                if (child instanceof THREE.Line) {
                    const material = child.material as THREE.LineBasicMaterial;
                    const offset = (state.clock.elapsedTime + idx * 0.1) % 1;
                    material.opacity = 0.1 + Math.sin(offset * Math.PI * 2) * 0.15;
                }
            });
        }
    });

    return (
        <group ref={groupRef}>
            {connections.map((conn, idx) => (
                <Line
                    key={idx}
                    points={[
                        [conn.start.x, conn.start.y, conn.start.z],
                        [conn.end.x, conn.end.y, conn.end.z]
                    ]}
                    color={conn.active ? worldColor : '#444444'}
                    lineWidth={conn.active ? 2 : 1}
                    transparent
                    opacity={conn.active ? 0.4 : 0.15}
                />
            ))}
        </group>
    );
};

export default SynapseConnections;
