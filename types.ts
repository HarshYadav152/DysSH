export enum AppMode {
  IDLE = 'IDLE',
  LIVE_COACH = 'LIVE_COACH', // Audio mode (Live API)
  TEXTBOOK_SIMPLIFIER = 'TEXTBOOK_SIMPLIFIER', // Image mode
  HANDWRITING_HELPER = 'HANDWRITING_HELPER', // Image mode
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  type?: 'text' | 'image_response' | 'error';
  imageUrl?: string;
  isStreaming?: boolean;
}

export interface LiveConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  volume: number; // 0-1 for visualization
}