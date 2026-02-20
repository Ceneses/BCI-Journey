const isDevMode = typeof process !== 'undefined'
  && process.env?.NODE_ENV !== 'production';

export const DEBUG_FLAGS: Record<string, boolean> = {
  gemini: isDevMode,
  geminiVerbose: false,
  liveSession: isDevMode,
  audio: false,
  progress: false,
  questionLoader: false,
  navigation: false,
  performance: false,
};

if (isDevMode) {
  (window as any).__BCI_DEBUG = DEBUG_FLAGS;
}
