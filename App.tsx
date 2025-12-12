import React, { useState, useEffect, useRef } from 'react';
import { Mic, Camera as CameraIcon, BookOpen, PenTool, X, StopCircle } from 'lucide-react';
import { AppMode, Message, LiveConnectionState } from './types';
import { APP_NAME } from './constants';
import { LiveClient } from './services/liveClient';
import { generateAnalysis } from './services/genAiService';
import Visualizer from './components/Visualizer';
import CameraComponent from './components/Camera';
import ChatMessage from './components/ChatMessage';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState(process.env.API_KEY || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<AppMode>(AppMode.IDLE);
  const [liveState, setLiveState] = useState<LiveConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    volume: 0,
  });
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'TEXTBOOK' | 'HANDWRITING'>('TEXTBOOK');
  const [isProcessing, setIsProcessing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const liveClientRef = useRef<LiveClient | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, mode]);

  // Cleanup Live Client on unmount
  useEffect(() => {
    return () => {
      liveClientRef.current?.disconnect();
    };
  }, []);

  const handleStartLive = async () => {
    if (!apiKey) return alert("API Key missing");
    
    setMode(AppMode.LIVE_COACH);
    setLiveState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    // Initial Greeting
    addMessage({
        id: Date.now().toString(),
        role: 'model',
        text: "Hi there! I'm listening. Start reading whenever you're ready, and I'll help you along!",
        timestamp: new Date()
    });

    try {
      const client = new LiveClient(apiKey);
      liveClientRef.current = client;
      
      await client.connect(
        (text, isFinal) => {
            // Since Live API returns streams, we could update a partial message.
            // For simplicity in this demo, we won't display real-time transcriptions 
            // of what the user says to avoid visual clutter for dyslexic users, 
            // but we WILL display the AI's final responses if they come as text.
            // (Note: The LiveClient logic mostly handles audio-in/audio-out, 
            // but if the model sends text parts, we handle them here).
        },
        (volume) => {
            setLiveState(prev => ({ ...prev, volume }));
        },
        (error) => {
            setLiveState(prev => ({ ...prev, error, isConnected: false, isConnecting: false }));
        }
      );

      setLiveState(prev => ({ ...prev, isConnected: true, isConnecting: false }));

    } catch (e) {
      setLiveState(prev => ({ ...prev, isConnecting: false, error: "Failed to connect" }));
    }
  };

  const handleStopLive = () => {
    liveClientRef.current?.disconnect();
    setLiveState(prev => ({ ...prev, isConnected: false, volume: 0 }));
    setMode(AppMode.IDLE);
    addMessage({
        id: Date.now().toString(),
        role: 'model',
        text: "Great reading session! Take a break if you need one. 🌟",
        timestamp: new Date()
    });
  };

  const handleImageCapture = async (base64: string) => {
      setShowCamera(false);
      setIsProcessing(true);
      
      const userMsgId = Date.now().toString();
      addMessage({
          id: userMsgId,
          role: 'user',
          text: cameraMode === 'TEXTBOOK' ? "Can you simplify this page?" : "Check my handwriting please.",
          timestamp: new Date(),
          imageUrl: base64
      });

      const responseText = await generateAnalysis(apiKey, base64, cameraMode);
      
      setIsProcessing(false);
      addMessage({
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText,
          timestamp: new Date()
      });
  };

  const addMessage = (msg: Message) => {
      setMessages(prev => [...prev, msg]);
  };

  const openCamera = (targetMode: 'TEXTBOOK' | 'HANDWRITING') => {
      if (!apiKey) return alert("API Key missing");
      setCameraMode(targetMode);
      setShowCamera(true);
      setMode(targetMode === 'TEXTBOOK' ? AppMode.TEXTBOOK_SIMPLIFIER : AppMode.HANDWRITING_HELPER);
  };

  // --- Render ---

  if (showCamera) {
      return <CameraComponent onCapture={handleImageCapture} onClose={() => setShowCamera(false)} />;
  }

  return (
    <div className="min-h-screen bg-luminary-50 text-ink font-sans flex flex-col max-w-lg mx-auto shadow-2xl overflow-hidden relative">
      
      {/* Header */}
      <header className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-luminary-600 tracking-tight flex items-center gap-2">
            <span className="text-3xl">🦉</span> {APP_NAME}
        </h1>
        {/* Simple Mood Indicator placeholder */}
        <div className="px-3 py-1 bg-luminary-100 rounded-full text-sm font-medium text-luminary-900">
           Ready to learn
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-32">
        {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                <div className="w-32 h-32 bg-luminary-200 rounded-full flex items-center justify-center mb-6 text-6xl">
                    👋
                </div>
                <h2 className="text-xl font-bold text-luminary-900 mb-2">Hi, I'm Luminary!</h2>
                <p className="text-lg">I'm here to help you read, understand, and learn. Choose a button below to start!</p>
            </div>
        )}
        
        {messages.map(m => <ChatMessage key={m.id} message={m} />)}
        
        {isProcessing && (
            <div className="flex items-center gap-2 text-luminary-500 italic p-4">
                <div className="animate-bounce">Thinking...</div>
            </div>
        )}
        
        <div ref={messagesEndRef} />
      </main>

      {/* Live Active Overlay */}
      {mode === AppMode.LIVE_COACH && (
          <div className="absolute inset-x-0 bottom-0 bg-white border-t border-luminary-100 p-6 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-transform duration-300">
             <div className="flex flex-col items-center gap-4">
                 <h3 className="text-lg font-bold text-luminary-900">
                     {liveState.isConnecting ? "Connecting..." : "Listening..."}
                 </h3>
                 
                 <Visualizer volume={liveState.volume} isActive={liveState.isConnected} />
                 
                 <button 
                    onClick={handleStopLive}
                    className="flex items-center gap-2 px-8 py-4 bg-red-100 text-red-600 rounded-full font-bold text-lg hover:bg-red-200 transition-colors"
                 >
                     <StopCircle size={24} /> Stop Reading
                 </button>
             </div>
          </div>
      )}

      {/* Control Bar (Hidden if Live is Active) */}
      {mode !== AppMode.LIVE_COACH && (
        <div className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border border-white/50 flex justify-between gap-2">
            
            {/* Reading Coach */}
            <button 
                onClick={handleStartLive}
                className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl bg-luminary-50 hover:bg-luminary-100 transition-colors group"
            >
                <div className="w-12 h-12 bg-luminary-500 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                    <Mic size={24} />
                </div>
                <span className="text-xs font-bold text-luminary-900">Read Aloud</span>
            </button>

            {/* Textbook Simplifier */}
            <button 
                onClick={() => openCamera('TEXTBOOK')}
                className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl bg-luminary-50 hover:bg-luminary-100 transition-colors group"
            >
                <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                </div>
                <span className="text-xs font-bold text-luminary-900">Simplify Page</span>
            </button>

             {/* Handwriting Helper */}
             <button 
                onClick={() => openCamera('HANDWRITING')}
                className="flex-1 flex flex-col items-center gap-1 p-3 rounded-xl bg-luminary-50 hover:bg-luminary-100 transition-colors group"
            >
                <div className="w-12 h-12 bg-teal-400 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                    <PenTool size={24} />
                </div>
                <span className="text-xs font-bold text-luminary-900">Check Notes</span>
            </button>

        </div>
      )}

    </div>
  );
};

export default App;