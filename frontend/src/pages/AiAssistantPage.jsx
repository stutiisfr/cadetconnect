import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Shield, Award, BookOpen, UserCheck, Flame } from 'lucide-react';

export const AiAssistantPage = () => {
  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: 'Jai Hind! I am Veer AI — your dedicated CadetConnect Defence & NCC Assistant.\n\nAsk me anything regarding:\n• SSB Interview Stage I & II (PPDT, TAT, WAT, SRT, GTO Tasks, OLQs)\n• NCC Syllabus & Weapon Specs (.22 Rifle, 7.62mm SLR, 5.56mm INSAS)\n• Foot & Rifle Drill Commands & Cadence\n• Written Exam Strategies (CDS, NDA, AFCAT, CAPF)\n• Camp Selection (CATC, RDC, TSC, EBSB)' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Connection error to AI service.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    setInput(promptText);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-navy-900 text-white p-6 rounded-xl border border-navy-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-500/30 mb-2 font-mono">
            <Bot className="w-3.5 h-3.5" />
            <span>Veer AI — Defence Community Assistant</span>
          </div>
          <h2 className="text-2xl font-bold font-heading">Interactive Defence & NCC AI Guide</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Get instant answers on SSB tests, weapon specifications, drill movements, and written exam preparation strategies.
          </p>
        </div>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="flex flex-wrap gap-2">
        {[
          "Tell me about the 15 Officer Like Qualities (OLQs)",
          "What are the specifications of .22 Deluxe Rifle?",
          "How to clear SSB Stage I PPDT?",
          "What are the eligibility rules for C-Certificate exam?",
          "Explain Foot Drill cadence and pace lengths"
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPrompt(chip)}
            className="bg-white border border-slate-200 hover:border-olive-500 text-slate-700 hover:text-navy-900 text-xs px-3 py-1.5 rounded-full transition-colors shadow-sm"
          >
            💡 {chip}
          </button>
        ))}
      </div>

      {/* Full-Screen Chat Interface */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md flex flex-col h-[520px]">
        
        {/* Chat Feed */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-sand-50 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-xl leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-olive-700 text-white rounded-br-none shadow-sm font-medium'
                    : 'bg-white text-navy-900 border border-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-3 rounded-xl text-slate-500 italic text-xs animate-pulse">
                Veer AI is consulting defence knowledge base...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex gap-3">
          <input
            type="text"
            placeholder="Type your question about SSB, weapons, drill, or written exams..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-sand-50 border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-olive-700 hover:bg-olive-600 text-white text-xs font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Ask Veer AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
