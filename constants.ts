import { WorldData } from './types';

// Approximate brain coordinates scaled for a scene where brain is roughly radius 4-5
export const WORLDS: WorldData[] = [
  {
    id: 1,
    name: "Brain Anatomy - The Control Center",
    region: "Cerebral Atlas",
    description: "Explore the biological architecture of the brain, from lobes to the brainstem.",
    color: "#00f3ff", // Cyan
    position: { x: 0, y: 1.5, z: 3 },
    connections: [2, 5, 9],
    isLocked: false,
    learningObjective: "Master the map of the human brain."
  },
  {
    id: 2,
    name: "Brain Cells & Electricity",
    region: "Synaptic Web",
    description: "Dive into neurons, synapses, and the electrical signals that power thought.",
    color: "#ffd700", // Electric Gold
    position: { x: 0, y: 2.5, z: 1.0 },
    connections: [1, 3, 6],
    isLocked: true,
    learningObjective: "Understand neural communication."
  },
  {
    id: 3,
    name: "BCI Basics (The Bridge)",
    region: "Digital Bridge",
    description: "Learn the fundamentals of how brains and computers talk to each other.",
    color: "#ff00ff", // Neon Pink
    position: { x: 0, y: 2.2, z: -1.5 },
    connections: [2, 4, 5],
    isLocked: true,
    learningObjective: "Grasp the core concepts of BCI."
  },
  {
    id: 4,
    name: "Hardware & Electricity (The Tools)",
    region: "Hardware Lab",
    description: "Get hands-on with electrodes, sensors, and the gear used to read minds.",
    color: "#ff4d00", // Bright Orange
    position: { x: 0, y: 0.5, z: -3.8 },
    connections: [3, 5],
    isLocked: true,
    learningObjective: "Master the hardware of BCI."
  },
  {
    id: 5,
    name: "Brainwave Patterns (The Language)",
    region: "Signal Spectrum",
    description: "Decode the frequencies of the brain, from Alpha to Gamma.",
    color: "#00ff41", // Matrix Green
    position: { x: 3.2, y: 0, z: 0.5 }, // Right hemisphere representation
    connections: [1, 3, 4, 8],
    isLocked: true,
    learningObjective: "Interpret brainwave data."
  },
  {
    id: 6,
    name: "Senses & Messages",
    region: "Sensory Hub",
    description: "Discover how the brain processes vision, hearing, and touch.",
    color: "#9d00ff", // Deep Purple
    position: { x: 0, y: -2.0, z: -2.5 },
    connections: [2, 7],
    isLocked: true,
    learningObjective: "Analyze sensory input processing."
  },
  {
    id: 7,
    name: "Helping People",
    region: "Medical Nexus",
    description: "See how BCI is changing lives through rehabilitation and medical aid.",
    color: "#ff0000", // Alert Red
    position: { x: 0, y: -3.5, z: -0.5 },
    connections: [6, 9],
    isLocked: true,
    learningObjective: "Apply BCI to solve human problems."
  },
  {
    id: 8,
    name: "Gaming, Robots & Fun",
    region: "Cyber Arena",
    description: "Control drones, play games, and explore the fun side of bio-signals.",
    color: "#ff0099", // Hot Pink
    position: { x: 0, y: -0.5, z: 4 }, // Deep internal
    connections: [1, 5, 9],
    isLocked: true,
    learningObjective: "Create interactive BCI experiences."
  },
  {
    id: 9,
    name: "Computer Magic (Math & Data)",
    region: "Data Core",
    description: "Contextualize BCI data with AI, machine learning, and mathematics.",
    color: "#c59f22ff", // Pure Yellow
    position: { x: 0, y: 1.0, z: 0 }, // Center
    connections: [1, 7, 8],
    isLocked: true,
    learningObjective: "Unlock the power of neural data science."
  },
  {
    id: 10,
    name: "Future & Ethics",
    region: "Future Horizon",
    description: "Debate the moral questions of privacy, identity, and the future of humanity.",
    color: "#ffffff", // Pure White
    position: { x: -3.2, y: 0, z: 0.5 }, // Left hemisphere mirroring temporal
    connections: [1, 2],
    isLocked: true,
    learningObjective: "Navigate the ethics of neurotechnology."
  }
];

export const SYSTEM_INSTRUCTION = `
You are NOVA, an advanced AI tutor for the BCI Journey platform. 
Your audience is students aged 10-18. 
Keep your tone exciting, futuristic, and encouraging ("Cyber-Organic" style). 
Use terms like "Neural Link Established," "Data Packet Received," "Synaptic Firing."
Explain neuroscience concepts accurately but use gaming metaphors (e.g., "The Hippocampus is like your Save Game file").
`;
