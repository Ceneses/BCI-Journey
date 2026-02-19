import { Question, WorldQuestions, NeuralNode, NetworkStructure } from '../types';

/**
 * Load questions for a specific world from JSON files
 */
export async function loadWorldQuestions(worldId: number): Promise<WorldQuestions> {
    try {
        const response = await fetch(`/assets/questions/world-${worldId}-*.json`);

        // Since we can't use wildcards in fetch, we need to map worldId to filename
        const worldFiles: Record<number, string> = {
            1: 'brain-anatomy',
            2: 'brain-cells-electricity',
            3: 'bci-basics',
            4: 'hardware-electricity',
            5: 'brainwave-patterns',
            6: 'senses-messages',
            7: 'helping-people',
            8: 'gaming-robots-fun',
            9: 'computer-magic',
            10: 'future-ethics'
        };

        const filename = worldFiles[worldId];
        if (!filename) {
            throw new Error(`No question file found for world ${worldId}`);
        }

        const actualResponse = await fetch(`/assets/questions/world-${worldId}-${filename}.json`);

        if (!actualResponse.ok) {
            throw new Error(`Failed to load questions for world ${worldId}`);
        }

        const data: WorldQuestions = await actualResponse.json();
        return data;
    } catch (error) {
        console.error('Error loading world questions:', error);
        throw error;
    }
}

/**
 * Map 100 questions to a 10-column neural network structure
 * Column distribution: [2, 12, 12, 12, 12, 12, 12, 12, 12, 2]
 */
export function mapQuestionsToNetwork(questions: Question[]): NetworkStructure {
    // New distribution: 1 input, 8 hidden layers (5,10,15,19,19,15,10,5), 1 output
    const columnSizes = [3, 5, 10, 15, 17, 17, 15, 10, 5, 3];
    const nodes: NeuralNode[] = [];

    let questionIndex = 0;

    for (let column = 0; column < 10; column++) {
        const columnSize = columnSizes[column];

        for (let row = 0; row < columnSize; row++) {
            if (questionIndex >= questions.length) {
                console.warn(`Not enough questions. Expected 100, got ${questions.length}`);
                break;
            }

            const question = questions[questionIndex];

            nodes.push({
                id: nodes.length,
                questionId: question.id,
                question: question.question,
                column: column + 1, // 1-indexed
                row: row,
                state: 'resting',
                isUnlocked: column === 0 // Only first column unlocked by default
            });

            questionIndex++;
        }
    }

    return {
        nodes,
        totalColumns: 10,
        columnSizes
    };
}

/**
 * Get node IDs in the next column that are connected to the given node.
 * Matches the connection logic used in SynapseConnections.
 */
export function getConnectedNodeIds(network: NetworkStructure, node: NeuralNode): number[] {
    if (node.column >= 10) return [];
    const nextColumnNodes = network.nodes.filter((n) => n.column === node.column + 1);
    return nextColumnNodes
        .filter((_, idx) => idx % 2 === 0 || nextColumnNodes.length <= 4)
        .map((n) => n.id);
}

/**
 * Get the set of node IDs whose question labels should be visible.
 * Initially only the first node; after activating a node, reveal it and its connected neighbors.
 */
export function getVisibleLabelNodeIds(
    network: NetworkStructure,
    questionProgressMap: Record<number, { isActivated?: boolean }>
): Set<number> {
    const visible = new Set<number>();
    const firstNode = network.nodes.find((n) => n.column === 1);
    if (firstNode) {
        visible.add(firstNode.id);
    }
    for (const node of network.nodes) {
        const progress = questionProgressMap[node.questionId];
        if (progress?.isActivated) {
            visible.add(node.id);
            for (const id of getConnectedNodeIds(network, node)) {
                visible.add(id);
            }
        }
    }
    return visible;
}

/**
 * Get the position for a node in 3D space
 * Returns {x, y, z} coordinates for Three.js
 */
export function getNodePosition(column: number, row: number, columnSize: number): { x: number; y: number; z: number } {
    const TUNNEL_RADIUS = 6; // Radius of the tunnel
    const COLUMN_SPACING = 10; // Distance between rings along the tunnel

    // Z-axis: Progression down the tunnel
    // We start at z=0 and go negative to creating depth "into" the screen
    // Centering the tunnel around z=0 makes OrbitControls behave better
    // Total length is approx 9 * 15 = 135. Let's shift so center is (0,0,0)
    // Center column is roughly 5.5.
    const centerOffset = 5.5 * COLUMN_SPACING;
    const z = ((column * COLUMN_SPACING) - centerOffset) * -1;

    // Ring distribution
    const angleStep = (2 * Math.PI) / columnSize;
    // Add a twist offset based on column to create a DNA-like spiral effect
    const twist = column * 0.3;
    const angle = (row * angleStep) + twist;

    const x = TUNNEL_RADIUS * Math.cos(angle);
    const y = TUNNEL_RADIUS * Math.sin(angle);

    return { x, y, z };
}
