import React from 'react';
import { NetworkStructure, NeuralNode as NeuralNodeType, QuestionProgress } from '../types';
import { getNodePosition, getVisibleLabelNodeIds } from '../utils/questionLoader';
import NeuralNode from './NeuralNode';
import SynapseConnections from './SynapseConnections';
import CharacterAnchors from './CharacterAnchors';

interface NeuralNetworkGridProps {
    network: NetworkStructure;
    onNodeClick: (node: NeuralNodeType) => void;
    worldColor: string;
    selectedNodeId: number | null;
    questionProgressMap: Record<number, QuestionProgress>;
}

const NeuralNetworkGrid: React.FC<NeuralNetworkGridProps> = ({
    network,
    onNodeClick,
    worldColor,
    selectedNodeId,
    questionProgressMap
}) => {
    const visibleLabelNodeIds = getVisibleLabelNodeIds(network, questionProgressMap);

    return (
        <group>
            {/* Synapse Connections */}
            <SynapseConnections network={network} worldColor={worldColor} />

            {/* Neural Nodes */}
            {network.nodes.map((node) => {
                const columnSize = network.columnSizes[node.column - 1];
                const position = getNodePosition(node.column, node.row, columnSize);
                const progress = questionProgressMap[node.questionId];
                const showLabel = visibleLabelNodeIds.has(node.id);

                return (
                    <NeuralNode
                        key={node.id}
                        node={node}
                        position={position}
                        onClick={() => onNodeClick(node)}
                        worldColor={worldColor}
                        isSelected={node.id === selectedNodeId}
                        questionProgress={progress}
                        showLabel={showLabel}
                    />
                );
            })}

            {/* Character Anchors */}
            <CharacterAnchors />
        </group>
    );
};

export default NeuralNetworkGrid;
