import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { NetworkStructure } from '../types';
import { getNodePosition } from '../utils/questionLoader';
import * as THREE from 'three';

interface SynapseConnectionsProps {
    network: NetworkStructure;
    worldColor: string;
}

const SynapseConnections: React.FC<SynapseConnectionsProps> = ({ network, worldColor }) => {
    const groupRef = useRef<THREE.Group>(null);

    // Generate connections between adjacent columns
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

                // Connect to a subset of nodes in the next column (not all, for visual clarity)
                nextColumnNodes.forEach((nextNode, idx) => {
                    // Connect to every 2nd or 3rd node to avoid clutter
                    if (idx % 2 === 0 || nextColumnNodes.length <= 4) {
                        const nextPos = getNodePosition(
                            nextNode.column,
                            nextNode.row,
                            network.columnSizes[nextNode.column - 1]
                        );

                        conns.push({
                            start: currentPos,
                            end: nextPos,
                            active: currentNode.state === 'active' && nextNode.state === 'active'
                        });
                    }
                });
            });
        }

        return conns;
    }, [network]);

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
