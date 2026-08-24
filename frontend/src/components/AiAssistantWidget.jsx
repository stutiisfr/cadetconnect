import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, Sparkles, Shield } from 'lucide-react';
import { getApiUrl } from '../config';

export const AiAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Jai Hind! I am Veer AI, your CadetConnect Defence Guide. Ask me about SSB Interviews, NCC Weapon Specs, Drill Commands, or Written Exam Strategies!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/ai/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I ran into an issue answering that. Please try again.' }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Connection error to AI service.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-navy-900 hover:bg-navy-800 text-white p-3.5 rounded-full shadow-2xl border-2 border-amber-500 flex items-center gap-2 group transition-all transform hover:scale-105"
          title="Open CadetConnect AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-amber-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
          </div>
          <span className="text-xs font-bold font-heading hidden sm:inline pr-1">Veer AI Guide</span>
        </button>
      ) : (
        <div className="bg-white border-2 border-navy-800 rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden flex flex-col h-[480px] animate-in fade-in slide-in-from-bottom duration-200">
          
          {/* Widget Header */}
          <div className="bg-navy-950 text-white p-3.5 border-b border-navy-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-olive-700 text-white flex items-center justify-center border border-amber-500/50">
                <Bot className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-heading flex items-center gap-1">
                  Veer AI Assistant
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">NCC & Defence Knowledge Assistant</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-sand-50 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-olive-700 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-navy-900 border border-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-500 italic text-[11px] animate-pulse">
                  Veer AI is thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              placeholder="Ask about SSB, .22 rifle, drill, CDS..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-sand-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-olive-700 hover:bg-olive-600 text-white p-2 rounded-lg transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
