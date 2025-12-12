import React from 'react';
import { Message } from '../types';
import { User, Sparkles } from 'lucide-react';

interface Props {
  message: Message;
}

const ChatMessage: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Basic formatting helper
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold handling: **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={i} className="min-h-[1.5em] mb-1">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-luminary-900 font-bold">{part.slice(2, -2)}</strong>;
            }
            return <span key={j}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-2xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${isUser ? 'bg-luminary-200 text-luminary-900 ml-3' : 'bg-luminary-500 text-white mr-3'}`}>
          {isUser ? <User size={20} /> : <Sparkles size={20} />}
        </div>

        {/* Bubble */}
        <div className={`p-4 rounded-2xl shadow-sm text-lg leading-relaxed ${
          isUser 
            ? 'bg-white text-luminary-900 rounded-tr-none border border-luminary-50' 
            : 'bg-white text-ink border border-luminary-100 rounded-tl-none'
        }`}>
          {message.imageUrl && (
            <div className="mb-3 rounded-lg overflow-hidden border border-gray-200">
                <img src={`data:image/jpeg;base64,${message.imageUrl}`} alt="User upload" className="max-h-64 object-cover" />
            </div>
          )}
          
          <div className="font-sans">
            {formatText(message.text)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;