import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION_LIVE } from "../constants";

export class LiveClient {
  private client: GoogleGenAI;
  private session: any = null;
  private audioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private outputContext: AudioContext | null = null;
  private outputNode: GainNode | null = null;
  private sources: Set<AudioBufferSourceNode> = new Set();
  private nextStartTime: number = 0;
  private stream: MediaStream | null = null;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async connect(
    onMessage: (text: string, isFinal: boolean) => void,
    onVolume: (vol: number) => void,
    onError: (err: string) => void
  ) {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      this.outputContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
      this.outputNode = this.outputContext.createGain();
      this.outputNode.connect(this.outputContext.destination);

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Live session connected');
            this.startAudioInput(onVolume);
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Text Transcription
             if (message.serverContent?.modelTurn?.parts) {
                const textPart = message.serverContent.modelTurn.parts.find(p => p.text);
                if (textPart && textPart.text) {
                    onMessage(textPart.text, true);
                }
             }

             // Handle Audio Output
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio) {
                 await this.playAudioResponse(base64Audio);
             }

             // Handle Interruptions
             if (message.serverContent?.interrupted) {
                 this.stopAudioOutput();
             }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live API Error', e);
            onError("Connection error");
          },
          onclose: (e: CloseEvent) => {
            console.log('Live API Closed', e);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: SYSTEM_INSTRUCTION_LIVE,
        },
      };

      const sessionPromise = this.client.live.connect(config);
      this.session = await sessionPromise;
      return this.session;

    } catch (err: any) {
      console.error(err);
      onError(err.message || "Failed to connect to Live API");
      throw err;
    }
  }

  private startAudioInput(onVolume: (vol: number) => void) {
    if (!this.audioContext || !this.stream) return;

    this.inputSource = this.audioContext.createMediaStreamSource(this.stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for UI visualization
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      onVolume(rms);

      // Convert to PCM 16-bit
      const pcm16 = this.floatTo16BitPCM(inputData);
      const base64 = this.arrayBufferToBase64(pcm16);

      if (this.session) {
        this.session.sendRealtimeInput({
            media: {
                mimeType: 'audio/pcm;rate=16000',
                data: base64
            }
        });
      }
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  private async playAudioResponse(base64: string) {
      if (!this.outputContext || !this.outputNode) return;

      const arrayBuffer = this.base64ToArrayBuffer(base64);
      // We need to manually decode PCM 24000Hz 
      // Note: The browser decodeAudioData usually expects headers (WAV/MP3). 
      // Raw PCM needs manual buffer creation if headers are missing.
      // Gemini sends raw PCM.
      
      const audioData = new Int16Array(arrayBuffer);
      const buffer = this.outputContext.createBuffer(1, audioData.length, 24000);
      const channelData = buffer.getChannelData(0);
      
      for(let i=0; i<audioData.length; i++) {
          channelData[i] = audioData[i] / 32768.0;
      }

      const source = this.outputContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.outputNode);
      
      this.nextStartTime = Math.max(this.nextStartTime, this.outputContext.currentTime);
      source.start(this.nextStartTime);
      this.nextStartTime += buffer.duration;
      
      source.onended = () => {
          this.sources.delete(source);
      }
      this.sources.add(source);
  }

  private stopAudioOutput() {
      this.sources.forEach(source => {
          try { source.stop(); } catch(e){}
      });
      this.sources.clear();
      this.nextStartTime = 0;
  }

  disconnect() {
    if (this.processor) {
        this.processor.disconnect();
        this.processor.onaudioprocess = null;
    }
    if (this.inputSource) this.inputSource.disconnect();
    if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) this.audioContext.close();
    if (this.outputContext) this.outputContext.close();
    
    // There is no explicit .close() on the session object in the new SDK that is synchronous
    // but stopping the stream usually ends the session on the server side eventually.
    // For now we just nullify references.
    this.session = null;
  }

  // --- Utils ---
  private floatTo16BitPCM(input: Float32Array): ArrayBuffer {
      const output = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
          const s = Math.max(-1, Math.min(1, input[i]));
          output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      return output.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
  }
}