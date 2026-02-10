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
