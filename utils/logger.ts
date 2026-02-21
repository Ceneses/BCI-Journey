import { DEBUG_FLAGS } from './debugFlags';

type Module = keyof typeof DEBUG_FLAGS;

function createLogger(module: Module) {
  const prefix = `[BCI:${module}]`;
  const isEnabled = () => DEBUG_FLAGS[module];

  return {
    debug: (...args: unknown[]) => {
      if (isEnabled()) console.log(prefix, ...args);
    },
    info: (...args: unknown[]) => {
      if (isEnabled()) console.info(prefix, ...args);
    },
    warn: (...args: unknown[]) => {
      console.warn(prefix, ...args);
    },
    error: (...args: unknown[]) => {
      console.error(prefix, ...args);
    },
  };
}

export const log = {
  gemini: createLogger('gemini'),
  liveSession: createLogger('liveSession'),
  audio: createLogger('audio'),
  progress: createLogger('progress'),
  questionLoader: createLogger('questionLoader'),
  navigation: createLogger('navigation'),
};
