import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Mic, Loader2, AlertTriangle, ShieldCheck, Leaf } from 'lucide-react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
const Chat: React.FC = () => {
  const location = useLocation();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { token, user } = useAuth();

  const initialMood = location.state?.initialMood;
  const getWelcomeMessage = () => {
    if (initialMood && initialMood <= 2) return "I noticed you might be feeling a bit down today. I'm here for you — what's on your mind?";
    if (initialMood && initialMood >= 4) return "It's wonderful to see you feeling good! Want to share what's brightening your day?";
    return "Hello, I'm Gugu. I'm here to listen and support you. How are you feeling right now?";
  };

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: getWelcomeMessage(), timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [pendingReferral, setPendingReferral] = useState<{ summary: string, domain: string, severity: string } | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check if user is confirming a referral
    if (pendingReferral && input.trim().toLowerCase() === 'yes') {
      setIsLoading(true);
      try {
        await fetch(import.meta.env.VITE_API_URL + '/api/therapy-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ai_summary: pendingReferral.summary,
            domain: pendingReferral.domain,
            severity: pendingReferral.severity
          })
        });
        const confirmMsg: Message = {
          id: Date.now().toString(),
          role: 'system',
          text: '✅ Your referral has been sent! A therapist specializing in **' + pendingReferral.domain + '** will review your case and reach out to schedule a session. You\'ll see updates on your Dashboard.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, confirmMsg]);
        setEscalated(true);
        setPendingReferral(null);
      } catch (e) {
        console.error('Failed to send referral', e);
      } finally {
        setIsLoading(false);
      }
      setInput('');
      return;
    }

    // If user says anything else while a referral is pending, clear it
    if (pendingReferral && input.trim().toLowerCase() !== 'yes') {
      setPendingReferral(null);
    }

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
      const result = await sendMessageToGemini(messages, input);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);

      // Crisis escalation (immediate, no consent needed)
      if (result.isOutOfControl && result.therapistSummary && !escalated) {
        setEscalated(true);
        const recentMessages = [...messages, userMsg].slice(-6).map(m => `${m.role}: ${m.text}`).join('\n');

        try {
          await fetch(import.meta.env.VITE_API_URL + '/api/summaries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              summary: result.therapistSummary,
              severity: 'critical',
              conversation_snippet: recentMessages
            })
          });

          // Also create a therapy request automatically for crisis
          await fetch(import.meta.env.VITE_API_URL + '/api/therapy-requests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              ai_summary: result.therapistSummary,
              domain: result.domain || 'general',
              severity: 'critical'
            })
          });
        } catch (e) {
          console.error("Failed to save summary to backend", e);
        }

        const systemMsg: Message = {
          id: (Date.now() + 2).toString(),
          role: 'system',
          text: '🛡️ Your wellbeing is our top priority. Based on our conversation, I\'ve notified a professional therapist who will review your case and reach out shortly. You are not alone — help is on the way.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, systemMsg]);
      }
      // Non-crisis referral suggestion (consent-based)
      else if (result.shouldRefer && result.therapistSummary && !escalated) {
        const referralMsg: Message = {
          id: (Date.now() + 3).toString(),
          role: 'system',
          text: `💙 Based on what you've shared, I think it would really help to speak with a professional therapist who specializes in **${result.domain || 'mental wellness'}**. Would you like me to connect you with one? They'll review a brief summary of our conversation and reach out to schedule a session with you.\n\nType **"yes"** if you'd like me to send the referral, or feel free to keep chatting with me.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, referralMsg]);

        // Store the pending referral data for when user confirms
        setPendingReferral({
          summary: result.therapistSummary,
          domain: result.domain || 'general',
          severity: 'moderate'
        });
      }
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100dvh-64px)] flex flex-col bg-warm-50">
      {/* Chat Header */}
      <div className="h-16 border-b border-sage-100 flex items-center justify-between px-6 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center">
            <Leaf size={20} className="text-sage-500" />
          </div>
          <div>
            <h2 className="font-semibold text-sage-800">Gugu</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-sage-400"></div>
              <p className="text-xs text-sage-400">Your safe space to talk</p>
            </div>
          </div>
        </div>
        {escalated && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-clay-50 border border-clay-200">
            <ShieldCheck size={14} className="text-clay-500" />
            <span className="text-xs text-clay-500 font-semibold">Therapist Notified</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'system' ? (
              <div className="w-full max-w-[90%] md:max-w-[70%] mx-auto rounded-2xl px-5 py-4 bg-clay-50 border border-clay-200 text-sm leading-relaxed">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-clay-500" />
                  <span className="text-clay-500 font-bold text-xs uppercase tracking-wider">Safety Alert</span>
                </div>
                <p className="text-sage-700">{msg.text}</p>
              </div>
            ) : (
              <div className="flex flex-col max-w-[85%] md:max-w-[65%]">
                <div
                  className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-sage-500 text-white rounded-br-md'
                    : 'bg-white text-sage-700 rounded-bl-md border border-sage-100 shadow-sm'
                    }`}
                >
                  {msg.text}
                </div>
                <span className={`text-[10px] text-sage-300 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-md px-5 py-3.5 flex items-center gap-2 border border-sage-100 shadow-sm">
              <Loader2 size={14} className="animate-spin text-sage-400" />
              <span className="text-xs text-sage-400">Gugu is thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-sage-100">
        <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-sage-50 rounded-2xl p-2 border border-sage-100 focus-within:border-sage-300 focus-within:shadow-sm transition-all">
          <button className="p-2.5 text-sage-300 hover:text-sage-500 rounded-xl hover:bg-white transition-all">
            <Mic size={18} />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sage-800 placeholder-sage-300 text-sm resize-none focus:outline-none py-2.5 max-h-32"
            rows={1}
          />

          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-sage-500 text-white rounded-xl hover:bg-sage-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-[10px] text-sage-300 mt-2">
          Gugu is an AI companion and not a substitute for professional help.
        </p>
      </div>
    </div>
  );
};

export default Chat;