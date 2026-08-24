import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Paperclip, Image, Shield, Circle, User } from 'lucide-react';

export const MessagesPage = () => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);

  // Initialize WebSocket Connection for Real-time Messaging
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');
    socketRef.current = ws;

    ws.onopen = () => console.log('WebSocket Real-time Messaging Connected');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CHAT_MESSAGE') {
          setMessages((prev) => [...prev, data.message]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    return () => ws.close();
  }, []);

  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations);
        if (data.conversations.length > 0 && !activeConv) {
          setActiveConv(data.conversations[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [token]);

  useEffect(() => {
    if (activeConv && token) {
      fetch(`/api/messages/conversations/${activeConv.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setMessages(data.messages);
        });
    }
  }, [activeConv, token]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: activeConv.id,
          text: text.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages([...messages, data.message]);
        
        // Broadcast via WebSocket
        if (socketRef.current && socketRef.current.readyState === 1) {
          socketRef.current.send(JSON.stringify({
            type: 'CHAT_MESSAGE',
            message: data.message
          }));
        }

        setText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
        
        {/* Left Sidebar: Conversations Roster */}
        <div className="md:col-span-4 border-r border-slate-200 bg-sand-50 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2 font-heading">
              <MessageSquare className="w-4 h-4 text-olive-700" />
              Defence Realtime Chat
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
              <Circle className="w-2 h-2 fill-emerald-600" />
              Live WS
            </span>
          </div>

          <div className="space-y-2">
            {conversations.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No active chats yet. Connect with cadets to start messaging.</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border text-xs ${
                    activeConv && activeConv.id === conv.id
                      ? 'bg-navy-900 text-white border-navy-900 shadow-sm'
                      : 'bg-white text-navy-900 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{conv.participantNames ? conv.participantNames.join(' & ') : 'Chat Conversation'}</span>
                  </div>
                  <p className="text-[11px] opacity-80 truncate mt-1">{conv.lastMessage || 'Start conversation...'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Area: Messages Thread & Input */}
        <div className="md:col-span-8 flex flex-col justify-between bg-white">
          
          {/* Thread Header */}
          <div className="bg-navy-900 text-white p-4 border-b border-navy-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold font-heading">
                {activeConv ? (activeConv.participantNames || []).join(' & ') : 'Select Conversation'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">End-to-End Platform Encryption</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[400px]">
            {messages.map((m) => {
              const isSelf = user && m.senderId === user.id;
              return (
                <div key={m.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs sm:max-w-md p-3 rounded-lg text-xs ${
                    isSelf 
                      ? 'bg-olive-700 text-white rounded-br-none shadow-sm' 
                      : 'bg-sand-100 text-navy-900 border border-slate-200 rounded-bl-none'
                  }`}>
                    <div className="font-semibold text-[10px] opacity-80 mb-1">{m.senderName}</div>
                    <p className="leading-relaxed">{m.text}</p>
                    <span className="text-[9px] opacity-70 block text-right mt-1 font-mono">
                      {new Date(m.sentAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-sand-50 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type message to cadet/mentor..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-navy-900 focus:outline-none focus:border-olive-700"
            />
            <button
              type="submit"
              className="bg-olive-700 hover:bg-olive-600 text-white text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1 shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
