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
    const columnSizes = [2, 12, 12, 12, 12, 12, 12, 12, 12, 2];
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
 * Get the position for a node in 3D space
 * Returns {x, y, z} coordinates for Three.js
 */
export function getNodePosition(column: number, row: number, columnSize: number): { x: number; y: number; z: number } {
    // Spacing between columns
    const columnSpacing = 2.5;

    // Calculate x position (columns spread horizontally)
    const x = (column - 5) * columnSpacing; // Center at column 5

    // Calculate y position (rows spread vertically, centered)
    const rowSpacing = 0.8;
    const yOffset = ((columnSize - 1) * rowSpacing) / 2; // Center the column
    const y = (row * rowSpacing) - yOffset;

    // Z position (slight depth variation for visual interest)
    const z = 0;

    return { x, y, z };
}
