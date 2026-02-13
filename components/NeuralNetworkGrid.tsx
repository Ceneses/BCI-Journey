import React from 'react';
import { NetworkStructure, NeuralNode as NeuralNodeType } from '../types';
import { getNodePosition } from '../utils/questionLoader';
import NeuralNode from './NeuralNode';
import SynapseConnections from './SynapseConnections';
import CharacterAnchors from './CharacterAnchors';

interface NeuralNetworkGridProps {
    network: NetworkStructure;
    onNodeClick: (node: NeuralNodeType) => void;
    worldColor: string;
}

const NeuralNetworkGrid: React.FC<NeuralNetworkGridProps> = ({
    network,
    onNodeClick,
    worldColor
}) => {
    return (
        <group>
            {/* Synapse Connections */}
            <SynapseConnections network={network} worldColor={worldColor} />

            {/* Neural Nodes */}
            {network.nodes.map((node) => {
                const columnSize = network.columnSizes[node.column - 1];
                const position = getNodePosition(node.column, node.row, columnSize);

                return (
                    <NeuralNode
                        key={node.id}
                        node={node}
                        position={position}
                        onClick={() => onNodeClick(node)}
                        worldColor={worldColor}
                    />
                );
            })}

            {/* Character Anchors */}
            <CharacterAnchors />
        </group>
    );
};

export default NeuralNetworkGrid;
