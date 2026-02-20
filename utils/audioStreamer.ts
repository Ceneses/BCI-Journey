import { Blob } from "@google/genai";
import { log } from "./logger";

export class AudioStreamer {
  public audioContext: AudioContext;
  public isRecording: boolean = false;
  
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private stream: MediaStream | null = null;
  
  // Analysers for visualization
  private inputAnalyser: AnalyserNode;
  private outputAnalyser: AnalyserNode;
  
  private nextStartTime: number = 0;
  private onData: (b: Blob) => void;

  constructor(onData: (b: Blob) => void) {
    this.onData = onData;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Initialize Analysers
    this.inputAnalyser = this.audioContext.createAnalyser();
    this.inputAnalyser.fftSize = 256;
    this.inputAnalyser.smoothingTimeConstant = 0.5;

    this.outputAnalyser = this.audioContext.createAnalyser();
    this.outputAnalyser.fftSize = 256;
    this.outputAnalyser.smoothingTimeConstant = 0.5;
  }

  async startRecording() {
    if (this.isRecording) return;
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.isRecording = true;

      // We need to resample input to 16kHz for Gemini
      const inputContext = new AudioContext({ sampleRate: 16000 });
      const source = inputContext.createMediaStreamSource(this.stream);
      
      // Use ScriptProcessor for wide compatibility in this demo environment
      this.processor = inputContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          // Clamp and scale
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Base64 encode
        const base64 = this.arrayBufferToBase64(pcmData.buffer);
        
        this.onData({
          data: base64,
          mimeType: "audio/pcm;rate=16000"
        });
      };

      source.connect(this.processor);
      this.processor.connect(inputContext.destination);
      
      // Connect to Input Analyser (Visualization only) - Create clone source in main context if needed, 
      // but simpler to just use a separate source in main context for viz if possible.
      // However, MediaStream can be used in multiple contexts.
      const vizSource = this.audioContext.createMediaStreamSource(this.stream);
      vizSource.connect(this.inputAnalyser);

      this.inputSource = source as any; 

    } catch (error) {
      log.audio.error("Microphone init failed:", error);
      this.isRecording = false;
    }
  }

  stopRecording() {
    this.isRecording = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.inputSource) {
      this.inputSource.disconnect();
      this.inputSource = null;
    }
  }

  async playAudioChunk(base64Audio: string) {
    try {
      // Decode
      const audioBuffer = await this.decodeAudioData(base64Audio);
      
      // Schedule
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Connect to Output Analyser -> Destination
      source.connect(this.outputAnalyser);
      this.outputAnalyser.connect(this.audioContext.destination);
      
      const currentTime = this.audioContext.currentTime;
      // Ensure we don't schedule in the past
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }
      
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      
    } catch (error) {
      log.audio.error("Playback failed:", error);
    }
  }

  getVolume(): number {
    const dataArray = new Uint8Array(this.inputAnalyser.frequencyBinCount);
    const dataArrayOut = new Uint8Array(this.outputAnalyser.frequencyBinCount);
    
    this.inputAnalyser.getByteFrequencyData(dataArray);
    this.outputAnalyser.getByteFrequencyData(dataArrayOut);
    
    const getAvg = (arr: Uint8Array) => {
        let sum = 0;
        for(let i = 0; i < arr.length; i++) sum += arr[i];
        return sum / arr.length;
    }

    const inputVol = getAvg(dataArray);
    const outputVol = getAvg(dataArrayOut);

    // Return the louder of the two, boosted slightly for visual effect
    return Math.max(inputVol, outputVol) * 1.5; 
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private async decodeAudioData(base64: string): Promise<AudioBuffer> {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert raw PCM to AudioBuffer
    // Gemini Output: 24kHz
    const pcmData = new Int16Array(bytes.buffer);
    const buffer = this.audioContext.createBuffer(1, pcmData.length, 24000);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < pcmData.length; i++) {
      channelData[i] = pcmData[i] / 32768.0;
    }
    
    return buffer;
  }
}