import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Mic, MoreVertical, Loader2 } from 'lucide-react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

const Chat: React.FC = () => {
  const location = useLocation();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Initial message based on navigation state (mood)
  const initialMood = location.state?.initialMood;
  const getWelcomeMessage = () => {
    if (initialMood && initialMood <= 2) return "I noticed you might be feeling a bit down. I'm here to listen. What's on your mind?";
    if (initialMood && initialMood >= 4) return "It's great to see you feeling positive! Want to share what's making you feel this way?";
    return "Hello, I'm Gugu. I'm here to listen and support you. How are you feeling right now?";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: getWelcomeMessage(),
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(messages, input);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#050505]">
      {/* Chat Header */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <div>
            <h2 className="font-semibold text-white">Gugu AI Assistant</h2>
            <p className="text-xs text-gray-500">Always here to listen</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-6 py-4 shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-brand-accent text-black rounded-tr-none' 
                  : 'bg-white/10 text-gray-100 rounded-tl-none border border-white/5'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 rounded-2xl rounded-tl-none px-6 py-4 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-brand-accent" />
              <span className="text-xs text-gray-400">Gugu is thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-white/5 rounded-2xl p-2 border border-white/5 focus-within:border-brand-accent/50 transition-colors">
          <button className="p-3 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
             <Mic size={20} />
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm resize-none focus:outline-none py-3 max-h-32"
            rows={1}
          />
          
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-brand-accent text-black rounded-xl hover:bg-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-2">
          Gugu can make mistakes. Consider checking important information. Not a substitute for crisis intervention.
        </p>
      </div>
    </div>
  );
};

export default Chat;