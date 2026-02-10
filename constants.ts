import { WorldData } from './types';

// Approximate brain coordinates scaled for a scene where brain is roughly radius 4-5
export const WORLDS: WorldData[] = [
  {
    id: 1,
    name: "The Executive Tower",
    region: "Frontal Lobe",
    description: "The command center for planning, logic, and personality.",
    color: "#00f3ff", // Cyan
    position: { x: 0, y: 1.5, z: 3.5 },
    connections: [2, 5, 9],
    isLocked: false,
    learningObjective: "Master decision making algorithms."
  },
  {
    id: 2,
    name: "Motor City",
    region: "Motor Cortex",
    description: "The engine room that drives all voluntary muscle movement.",
    color: "#ffd700", // Electric Gold
    position: { x: 0, y: 2.5, z: 1.0 },
    connections: [1, 3, 6],
    isLocked: true,
    learningObjective: "Calibrate movement precision."
  },
  {
    id: 3,
    name: "Sensation Station",
    region: "Parietal Lobe",
    description: "Processing touch, temperature, and spatial awareness.",
    color: "#ff00ff", // Neon Pink
    position: { x: 0, y: 2.2, z: -1.5 },
    connections: [2, 4, 5],
    isLocked: true,
    learningObjective: "Decode sensory input streams."
  },
  {
    id: 4,
    name: "Vision Valley",
    region: "Occipital Lobe",
    description: "The visual processing center decoding light into reality.",
    color: "#ff4d00", // Bright Orange
    position: { x: 0, y: 0.5, z: -3.8 },
    connections: [3, 5],
    isLocked: true,
    learningObjective: "Analyze optical data patterns."
  },
  {
    id: 5,
    name: "Memory Matrix",
    region: "Temporal Lobe",
    description: "Hub for memory consolidation, language, and hearing.",
    color: "#00ff41", // Matrix Green
    position: { x: 3.2, y: 0, z: 0.5 }, // Right hemisphere representation
    connections: [1, 3, 4, 8],
    isLocked: true,
    learningObjective: "Archive and retrieve neural logs."
  },
  {
    id: 6,
    name: "Balance Base",
    region: "Cerebellum",
    description: "Coordinates precision, timing, and fine motor control.",
    color: "#9d00ff", // Deep Purple
    position: { x: 0, y: -2.0, z: -2.5 },
    connections: [2, 7],
    isLocked: true,
    learningObjective: "Stabilize system equilibrium."
  },
  {
    id: 7,
    name: "Core Reactor",
    region: "Brain Stem",
    description: "Controls vital life functions like breathing and heartbeat.",
    color: "#ff0000", // Alert Red
    position: { x: 0, y: -3.5, z: -0.5 },
    connections: [6, 9],
    isLocked: true,
    learningObjective: "Maintain system uptime."
  },
  {
    id: 8,
    name: "Emotion Engine",
    region: "Limbic System",
    description: "The primal center for emotions, motivation, and reward.",
    color: "#ff0099", // Hot Pink
    position: { x: 0, y: 0.5, z: 0.5 }, // Deep internal
    connections: [1, 5, 9],
    isLocked: true,
    learningObjective: "Regulate neuro-chemical responses."
  },
  {
    id: 9,
    name: "The Switchboard",
    region: "Thalamus",
    description: "Relays sensory and motor signals to the cerebral cortex.",
    color: "#ffff00", // Pure Yellow
    position: { x: 0, y: 1.0, z: 0 }, // Center
    connections: [1, 7, 8],
    isLocked: true,
    learningObjective: "Route data packets correctly."
  },
  {
    id: 10,
    name: "BCI Uplink",
    region: "NeuraLink Interface",
    description: "The bridge between biological mind and digital machine.",
    color: "#ffffff", // Pure White
    position: { x: -3.2, y: 0, z: 0.5 }, // Left hemisphere mirroring temporal
    connections: [1, 2],
    isLocked: true,
    learningObjective: "Establish cyber-organic synthesis."
  }
];

export const SYSTEM_INSTRUCTION = `
You are NOVA, an advanced AI tutor for the BCI Journey platform. 
Your audience is students aged 10-18. 
Keep your tone exciting, futuristic, and encouraging ("Cyber-Organic" style). 
Use terms like "Neural Link Established," "Data Packet Received," "Synaptic Firing."
Explain neuroscience concepts accurately but use gaming metaphors (e.g., "The Hippocampus is like your Save Game file").
`;
