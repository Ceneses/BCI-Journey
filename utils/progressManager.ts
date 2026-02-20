import { UserProgress } from '../types';
import { log } from './logger';

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
            log.progress.error("Failed to parse stored progress:", error);
        }
    }

    // Return default progress if nothing stored
    return {
        worldId,
        completedQuestions: [],
        questionProgress: {},
        totalSomas: 0,
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

    // Legacy support
    if (!progress.completedQuestions.includes(questionId)) {
        progress.completedQuestions.push(questionId);
        saveProgress(progress);
    }
}

/**
 * Update specific progress field for a question
 */
export function updateQuestionProgress(
    worldId: number,
    questionId: number,
    field: 'listen' | 'talk' | 'summary' | 'activate',
    score?: number
): void {
    const progress = loadProgress(worldId);

    // Initialize if missing
    if (!progress.questionProgress) {
        progress.questionProgress = {};
    }

    if (!progress.questionProgress[questionId]) {
        progress.questionProgress[questionId] = {
            questionId,
            hasListened: false,
            hasTalked: false,
            hasReadSummary: false,
            isActivated: false
        };
    }

    const qp = progress.questionProgress[questionId];

    if (field === 'listen') qp.hasListened = true;
    if (field === 'talk') qp.hasTalked = true;
    if (field === 'summary') qp.hasReadSummary = true;
    if (field === 'activate') {
        qp.isActivated = true;
        if (score !== undefined) qp.quizScore = score;

        // Also mark as complete for legacy/unlocking purposes if passed
        markQuestionComplete(worldId, questionId);
    }

    saveProgress(progress);
}

/**
 * Get progress for a specific question
 */
export function getQuestionProgress(worldId: number, questionId: number) {
    const progress = loadProgress(worldId);
    return progress.questionProgress?.[questionId] || {
        questionId,
        hasListened: false,
        hasTalked: false,
        hasReadSummary: false,
        isActivated: false
    };
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

/**
 * Add Somas to the user's total
 */
export function addSomas(worldId: number, amount: number): void {
    const progress = loadProgress(worldId);
    if (!progress.totalSomas) progress.totalSomas = 0;

    progress.totalSomas += amount;
    saveProgress(progress);
}

/**
 * Get total Somas
 */
export function getTotalSomas(worldId: number): number {
    const progress = loadProgress(worldId);
    return progress.totalSomas || 0;
}
