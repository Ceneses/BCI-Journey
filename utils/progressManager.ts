import { UserProgress } from '../types';

const STORAGE_KEY_PREFIX = 'bci_journey_progress_';

/**
 * Load user progress for a specific world from localStorage
 */
export function loadProgress(worldId: number): UserProgress {
    const key = `${STORAGE_KEY_PREFIX}${worldId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
        try {
            return JSON.parse(stored) as UserProgress;
        } catch (error) {
            console.error('Error parsing stored progress:', error);
        }
    }

    // Return default progress if nothing stored
    return {
        worldId,
        completedQuestions: [],
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Save user progress to localStorage
 */
export function saveProgress(progress: UserProgress): void {
    const key = `${STORAGE_KEY_PREFIX}${progress.worldId}`;
    progress.lastUpdated = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(progress));
}

/**
 * Mark a question as complete and save progress
 */
export function markQuestionComplete(worldId: number, questionId: number): void {
    const progress = loadProgress(worldId);

    if (!progress.completedQuestions.includes(questionId)) {
        progress.completedQuestions.push(questionId);
        saveProgress(progress);
    }
}

/**
 * Check if a question is completed
 */
export function isQuestionComplete(worldId: number, questionId: number): boolean {
    const progress = loadProgress(worldId);
    return progress.completedQuestions.includes(questionId);
}

/**
 * Check if a node should be unlocked based on progression rules
 * Rule: A node is unlocked if it's in column 1, OR at least one node in the previous column is completed
 */
export function isNodeUnlocked(column: number, worldId: number, allNodes: any[]): boolean {
    // Column 1 (Input layer) is always unlocked
    if (column === 1) {
        return true;
    }

    const progress = loadProgress(worldId);

    // Check if any node in the previous column is completed
    const previousColumnNodes = allNodes.filter(node => node.column === column - 1);

    return previousColumnNodes.some(node =>
        progress.completedQuestions.includes(node.questionId)
    );
}

/**
 * Get completion percentage for a world
 */
export function getCompletionPercentage(worldId: number): number {
    const progress = loadProgress(worldId);
    return Math.round((progress.completedQuestions.length / 100) * 100);
}

/**
 * Reset progress for a world (for testing/debugging)
 */
export function resetProgress(worldId: number): void {
    const key = `${STORAGE_KEY_PREFIX}${worldId}`;
    localStorage.removeItem(key);
}
