export interface Experiment {
  id: string;
  title: string;
  category: 'BCI' | 'ERP' | 'Motor Imagery' | 'Neurofeedback' | 'Cognitive';
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  tags: string[];
  icon: string;
  color: string;
}

export const experiments: Experiment[] = [
  {
    id: 'p300-speller',
    title: 'P300 Speller',
    category: 'BCI',
    description: 'Use event-related potentials to spell words by focusing on flashing characters on a grid. A classic BCI paradigm.',
    difficulty: 'Intermediate',
    rating: 4.7,
    tags: ['EEG', 'P300', 'Spelling', 'Event-Related Potential'],
    icon: 'Keyboard',
    color: '#00f3ff',
  },
  {
    id: 'ssvep-control',
    title: 'SSVEP Frequency Detector',
    category: 'BCI',
    description: 'Detect steady-state visually evoked potentials by gazing at flickering stimuli at different frequencies.',
    difficulty: 'Advanced',
    rating: 4.5,
    tags: ['EEG', 'SSVEP', 'Frequency', 'Visual'],
    icon: 'Eye',
    color: '#8b5cf6',
  },
  {
    id: 'motor-imagery-classifier',
    title: 'Motor Imagery Classifier',
    category: 'Motor Imagery',
    description: 'Imagine moving your left or right hand and watch the BCI decode your intention in real-time.',
    difficulty: 'Advanced',
    rating: 4.8,
    tags: ['EEG', 'Motor Cortex', 'Classification', 'Mu Rhythm'],
    icon: 'Hand',
    color: '#ff00ff',
  },
  {
    id: 'neurofeedback-alpha',
    title: 'Alpha Wave Training',
    category: 'Neurofeedback',
    description: 'Train your brain to increase alpha wave power for relaxation and focus using real-time auditory and visual feedback.',
    difficulty: 'Beginner',
    rating: 4.9,
    tags: ['EEG', 'Alpha', 'Relaxation', 'Mindfulness'],
    icon: 'Waves',
    color: '#00ff41',
  },
  {
    id: 'oddball-paradigm',
    title: 'Oddball Paradigm',
    category: 'ERP',
    description: 'Detect rare target stimuli among frequent standard stimuli and observe the P300 component in your EEG.',
    difficulty: 'Beginner',
    rating: 4.3,
    tags: ['EEG', 'P300', 'Auditory', 'Attention'],
    icon: 'Bell',
    color: '#ffd700',
  },
  {
    id: 'stroop-task',
    title: 'Stroop Test',
    category: 'Cognitive',
    description: 'Measure cognitive interference by naming the ink color of color words. Observe frontal lobe activation patterns.',
    difficulty: 'Beginner',
    rating: 4.1,
    tags: ['Cognition', 'Attention', 'Frontal Lobe', 'Interference'],
    icon: 'Palette',
    color: '#f97316',
  },
  {
    id: 'n-back-task',
    title: 'N-Back Working Memory',
    category: 'Cognitive',
    description: 'Challenge your working memory by identifying items that appeared N positions back in a sequence.',
    difficulty: 'Intermediate',
    rating: 4.4,
    tags: ['Cognition', 'Working Memory', 'Prefrontal Cortex'],
    icon: 'BrainCircuit',
    color: '#06b6d4',
  },
  {
    id: 'erp-face-detection',
    title: 'Face vs Object ERP',
    category: 'ERP',
    description: 'Explore the N170 component by comparing brain responses to faces versus everyday objects.',
    difficulty: 'Intermediate',
    rating: 4.6,
    tags: ['EEG', 'N170', 'Visual', 'Face Perception'],
    icon: 'ScanFace',
    color: '#ec4899',
  },
  {
    id: 'mi-cursor-control',
    title: 'Cursor Control (MI)',
    category: 'Motor Imagery',
    description: 'Move a cursor on screen using only your imagination of hand movements. Real-time 2D BCI control.',
    difficulty: 'Advanced',
    rating: 4.2,
    tags: ['BCI', 'Motor Imagery', 'Cursor', 'Real-time'],
    icon: 'MousePointer',
    color: '#a855f7',
  },
  {
    id: 'nf-smr-training',
    title: 'SMR Neurofeedback',
    category: 'Neurofeedback',
    description: 'Enhance sensorimotor rhythm (SMR) for improved focus and reduced impulsivity through gamified feedback.',
    difficulty: 'Intermediate',
    rating: 4.0,
    tags: ['EEG', 'SMR', 'Focus', 'Sensorimotor'],
    icon: 'Target',
    color: '#14b8a6',
  },
  {
    id: 'erp-mismatch-negativity',
    title: 'Mismatch Negativity',
    category: 'ERP',
    description: 'Detect automatic change detection in auditory processing without requiring conscious attention.',
    difficulty: 'Intermediate',
    rating: 4.3,
    tags: ['EEG', 'MMN', 'Auditory', 'Pre-attentive'],
    icon: 'AudioLines',
    color: '#eab308',
  },
  {
    id: 'go-nogo-task',
    title: 'Go / No-Go Task',
    category: 'Cognitive',
    description: 'Test response inhibition by responding to "go" stimuli while withholding responses to "no-go" stimuli.',
    difficulty: 'Beginner',
    rating: 4.5,
    tags: ['Cognition', 'Inhibition', 'ERP', 'N200'],
    icon: 'CircleSlash',
    color: '#ef4444',
  },
];

export const categories = ['All', 'BCI', 'ERP', 'Motor Imagery', 'Neurofeedback', 'Cognitive'] as const;
export type Category = (typeof categories)[number];
