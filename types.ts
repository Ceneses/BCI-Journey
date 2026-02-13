export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface WorldData {
  id: number;
  name: string;
  region: string; // Anatomical name
  description: string;
  color: string;
  position: Vector3; // Coordinate in 3D space
  connections: number[]; // IDs of worlds this node connects to
  isLocked: boolean;
  learningObjective: string;
}

export interface GeneratedContent {
  title: string;
  briefing: string;
  funFact: string;
}

export type Speaker = 'Synapse' | 'Spark' | 'Both';

export interface DialogueExchange {
  speaker: Speaker;
  text: string;
  imagePrompt: string;
}

export interface SimulationScript {
  question: string;
  exchanges: DialogueExchange[];
}

// Neural Navigator Types
export interface Question {
  id: number;
  question: string;
}

export interface WorldQuestions {
  worldId: number;
  worldTitle: string;
  questions: Question[];
}

export interface NeuralNode {
  id: number;
  questionId: number;
  question: string;
  column: number; // 1-10
  row: number; // 0-11 (varies by column)
  state: 'resting' | 'active'; // dim or bright
  isUnlocked: boolean;
}

export interface NetworkStructure {
  nodes: NeuralNode[];
  totalColumns: 10;
  columnSizes: number[]; // [2, 12, 12, 12, 12, 12, 12, 12, 12, 2]
}

export interface UserProgress {
  worldId: number;
  completedQuestions: number[];
  lastUpdated: string;
}
