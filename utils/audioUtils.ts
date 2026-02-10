export const decodeAudioData = async (
  base64String: string,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Gemini returns raw PCM 16-bit mono 24kHz
  const pcmData = new Int16Array(bytes.buffer);
  const sampleRate = 24000;
  const channels = 1;
  
  const buffer = audioContext.createBuffer(channels, pcmData.length, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  // Convert Int16 to Float32 [-1.0, 1.0]
  for (let i = 0; i < pcmData.length; i++) {
    channelData[i] = pcmData[i] / 32768.0;
  }
  
  return buffer;
};

export const playAudioBuffer = (buffer: AudioBuffer, context: AudioContext) => {
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
  return source; // Return source to stop if needed
};
