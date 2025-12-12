import React, { useState, useEffect, useRef } from 'react';
import { Mic, Camera as CameraIcon, BookOpen, PenTool, X, StopCircle, HelpCircle, MessageSquare } from 'lucide-react';
import { AppMode, Message, LiveConnectionState } from './types';
import { APP_NAME } from './constants';
import { LiveClient } from './services/liveClient';
import { generateAnalysis } from './services/genAiService';
import Visualizer from './components/Visualizer';
import CameraComponent from './components/Camera';
import ChatMessage from './components/ChatMessage';
import HelpModal from './components/HelpModal';

const App: React.FC = () => {
  // Safe access to process.env for browser environments
  const getApiKey = () => {
    try {
      return (typeof process !== 'undefined' && process.env?.API_KEY) || '';
    } catch {
      return '';
    }
  };

  const [apiKey, setApiKey] = useState(getApiKey());
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<AppMode>(AppMode.IDLE);
  const [liveState, setLiveState] = useState<LiveConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    volume: 0,
  });
  const [showCamera, setShowCamera] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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
    if (!apiKey) {
      alert("API Key is missing. Please ensure process.env.API_KEY is configured.");
      return;
    }
    
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
           // Intentionally empty for this demo
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

      if (!apiKey) {
        setIsProcessing(false);
        addMessage({
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: "I can't see the image because my API key is missing. Please check the settings.",
            timestamp: new Date()
        });
        return;
      }

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
      if (!apiKey) {
          alert("API Key is missing.");
          return;
      }
      setCameraMode(targetMode);
      setShowCamera(true);
      setMode(targetMode === 'TEXTBOOK' ? AppMode.TEXTBOOK_SIMPLIFIER : AppMode.HANDWRITING_HELPER);
  };

  // --- Components for Layout ---

  const ActionButtons = ({ isVertical = false }) => (
    <div className={`flex gap-3 ${isVertical ? 'flex-col w-full' : 'w-full justify-between'}`}>
        
        {/* Reading Coach */}
        <button 
            onClick={handleStartLive}
            disabled={mode === AppMode.LIVE_COACH}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
                mode === AppMode.LIVE_COACH ? 'bg-luminary-100 opacity-50' : 'bg-white shadow-sm border border-luminary-100 hover:bg-luminary-50 hover:shadow-md'
            } ${isVertical ? 'w-full' : 'flex-1 flex-col justify-center'}`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110 ${isVertical ? 'bg-luminary-500' : 'bg-luminary-500 w-12 h-12'}`}>
                <Mic size={isVertical ? 20 : 24} />
            </div>
            <div className={`flex flex-col ${isVertical ? 'items-start' : 'items-center'}`}>
                <span className="font-bold text-luminary-900 text-sm">Read Aloud</span>
                {isVertical && <span className="text-xs text-luminary-500">Practice speaking</span>}
            </div>
        </button>

        {/* Textbook Simplifier */}
        <button 
            onClick={() => openCamera('TEXTBOOK')}
            disabled={mode === AppMode.LIVE_COACH}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
                mode === AppMode.LIVE_COACH ? 'bg-luminary-100 opacity-50' : 'bg-white shadow-sm border border-luminary-100 hover:bg-orange-50 hover:shadow-md'
            } ${isVertical ? 'w-full' : 'flex-1 flex-col justify-center'}`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110 ${isVertical ? 'bg-orange-400' : 'bg-orange-400 w-12 h-12'}`}>
                <BookOpen size={isVertical ? 20 : 24} />
            </div>
            <div className={`flex flex-col ${isVertical ? 'items-start' : 'items-center'}`}>
                <span className="font-bold text-luminary-900 text-sm">Simplify Page</span>
                {isVertical && <span className="text-xs text-luminary-500">Understand textbooks</span>}
            </div>
        </button>

         {/* Handwriting Helper */}
         <button 
            onClick={() => openCamera('HANDWRITING')}
            disabled={mode === AppMode.LIVE_COACH}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${
                mode === AppMode.LIVE_COACH ? 'bg-luminary-100 opacity-50' : 'bg-white shadow-sm border border-luminary-100 hover:bg-teal-50 hover:shadow-md'
            } ${isVertical ? 'w-full' : 'flex-1 flex-col justify-center'}`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110 ${isVertical ? 'bg-teal-400' : 'bg-teal-400 w-12 h-12'}`}>
                <PenTool size={isVertical ? 20 : 24} />
            </div>
             <div className={`flex flex-col ${isVertical ? 'items-start' : 'items-center'}`}>
                <span className="font-bold text-luminary-900 text-sm">Check Notes</span>
                {isVertical && <span className="text-xs text-luminary-500">Fix handwriting</span>}
            </div>
        </button>
    </div>
  );

  // --- Render ---

  if (showCamera) {
      return <CameraComponent onCapture={handleImageCapture} onClose={() => setShowCamera(false)} />;
  }

  return (
    <div className="h-full bg-luminary-50 font-sans flex flex-col md:flex-row overflow-hidden relative">
      
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* --- Desktop Sidebar (Hidden on Mobile) --- */}
      <aside className="hidden md:flex w-80 flex-col bg-white border-r border-luminary-100 z-20 shadow-lg">
        <div className="p-6 border-b border-luminary-50">
            <h1 className="text-2xl font-bold text-luminary-600 tracking-tight flex items-center gap-2">
                <span className="text-3xl">🦉</span> {APP_NAME}
            </h1>
            <p className="text-sm text-luminary-400 mt-2">Your AI learning buddy.</p>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-luminary-300 uppercase tracking-wider mb-4 pl-2">Tools</h3>
            <ActionButtons isVertical={true} />
            
            <div className="mt-8">
               <h3 className="text-xs font-bold text-luminary-300 uppercase tracking-wider mb-4 pl-2">Session Stats</h3>
               <div className="bg-luminary-50 rounded-xl p-4 border border-luminary-100">
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-luminary-700">Mood</span>
                      <span className="text-sm font-bold">😊 Focused</span>
                  </div>
                  <div className="flex items-center justify-between">
                      <span className="text-sm text-luminary-700">Reading Streak</span>
                      <span className="text-sm font-bold">🔥 3 mins</span>
                  </div>
               </div>
            </div>
        </div>

        <div className="p-4 border-t border-luminary-50">
             <button 
                onClick={() => setShowHelp(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-luminary-50 text-luminary-600 font-medium transition-colors"
             >
                 <HelpCircle size={20} />
                 How to use Luminary
             </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col relative h-full">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
            <h1 className="text-xl font-bold text-luminary-600 tracking-tight flex items-center gap-2">
                <span className="text-2xl">🦉</span> {APP_NAME}
            </h1>
            <button 
                onClick={() => setShowHelp(true)}
                className="p-2 text-luminary-400 hover:text-luminary-600"
            >
                <HelpCircle size={24} />
            </button>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 pb-32 md:pb-4 md:p-8 scroll-smooth">
            <div className="max-w-4xl mx-auto w-full">
                {messages.length === 0 && (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 opacity-60">
                        <div className="w-32 h-32 bg-luminary-100 rounded-full flex items-center justify-center mb-6 text-6xl shadow-inner">
                            👋
                        </div>
                        <h2 className="text-2xl font-bold text-luminary-900 mb-2">Hi, I'm Luminary!</h2>
                        <p className="text-lg max-w-md">I'm here to help you read, understand, and learn. Select a tool to begin!</p>
                        
                        <div className="mt-8 md:hidden">
                            <p className="text-sm text-luminary-400">↓ Choose an option below ↓</p>
                        </div>
                    </div>
                )}
                
                {messages.map(m => <ChatMessage key={m.id} message={m} />)}
                
                {isProcessing && (
                    <div className="flex items-center gap-2 text-luminary-500 italic p-4">
                        <div className="w-2 h-2 bg-luminary-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-luminary-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-luminary-400 rounded-full animate-bounce delay-200"></div>
                        <span className="ml-2">Thinking...</span>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>
        </main>

        {/* Live Active Overlay */}
        {mode === AppMode.LIVE_COACH && (
            <div className="absolute inset-x-0 bottom-0 bg-white border-t border-luminary-100 p-6 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 z-30">
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

        {/* Mobile Bottom Control Bar (Hidden if Live is Active OR on Desktop) */}
        {mode !== AppMode.LIVE_COACH && (
            <div className="md:hidden absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border border-white/50 z-20">
                <ActionButtons isVertical={false} />
            </div>
        )}

      </div>
    </div>
  );
};

export default App;