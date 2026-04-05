'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Sprout, ThumbsUp, ThumbsDown } from 'lucide-react';
import agropilotApi from '@/lib/agropilot/api';
import { useAgroChatStore } from '@/stores/agropilot';

const SUGGESTIONS = [
  'What fertilizer is best for rice on clay soil?',
  'How do I treat wheat rust disease?',
  'What is the ideal soil pH for maize?',
  'When should I irrigate my soybean crop?',
];

export default function AgroPilotChat() {
  const { messages, sessionId, addMessage, setSessionId, clearChat } = useAgroChatStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || loading) return;
    setInput('');
    addMessage({ role: 'user', content: message });
    setLoading(true);
    try {
      const { data } = await agropilotApi.post('/api/chat/message', { message, session_id: sessionId });
      if (!sessionId) setSessionId(data.session_id);
      addMessage({ role: 'assistant', content: data.response, feedbackId: data.feedback_id });
    } catch {
      addMessage({ role: 'assistant', content: '⚠️ Failed to get response. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async (feedbackId: string, feedback: 'up' | 'down') => {
    try { await agropilotApi.post('/api/chat/feedback', { feedback_id: feedbackId, feedback }); } catch {}
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>AI Farming Assistant</h1>
          <p className="text-sm" style={{ color: 'var(--old-price)' }}>Ask anything about crops, soil, diseases, or fertilizers</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm hover:bg-white/5 transition-colors"
            style={{ color: 'var(--old-price)' }}>
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl border p-4 space-y-4"
        style={{ background: 'var(--croma-wall)', borderColor: 'var(--border-color)' }}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0, 233, 191, 0.1)' }}>
              <Sprout className="h-7 w-7" style={{ color: 'var(--neon-green)' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-color)' }}>Hello! I'm AgroPilot 🌱</p>
              <p className="text-sm mt-1" style={{ color: 'var(--old-price)' }}>Your AI farming advisor. Try one of these:</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-left text-sm p-3 rounded-lg border transition-colors hover:bg-white/5"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--old-price)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: 'rgba(0, 233, 191, 0.1)' }}>
                  <Sprout className="h-4 w-4" style={{ color: 'var(--neon-green)' }} />
                </div>
              )}
              <div className="max-w-[80%] space-y-1">
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm border'
                }`} style={msg.role === 'user'
                  ? { background: 'var(--neon-green)', color: '#000' }
                  : { background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}>
                  {msg.content}
                </div>
                {msg.role === 'assistant' && msg.feedbackId && (
                  <div className="flex gap-1 pl-1">
                    <button onClick={() => sendFeedback(msg.feedbackId!, 'up')}
                      className="p-1 transition-colors hover:opacity-80" style={{ color: 'var(--circle)' }}>
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => sendFeedback(msg.feedbackId!, 'down')}
                      className="p-1 transition-colors hover:opacity-80" style={{ color: 'var(--circle)' }}>
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0, 233, 191, 0.1)' }}>
              <Sprout className="h-4 w-4" style={{ color: 'var(--neon-green)' }} />
            </div>
            <div className="rounded-2xl rounded-tl-sm border px-4 py-3"
              style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)' }}>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: 'var(--neon-green)', animationDelay: `${i * 100}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about crops, soil, diseases, fertilizers..."
          className="flex-1 rounded-xl px-4 py-3 text-sm outline-none border transition-colors"
          style={{ background: 'var(--foot-color)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
          maxLength={2000} disabled={loading} />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          className="rounded-xl px-4 py-3 transition-all hover:opacity-90 disabled:opacity-40"
          style={{ background: 'var(--neon-green)', color: '#000' }}>
          <Send className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-center" style={{ color: 'var(--circle)' }}>
        AI advice is for guidance only. Always consult a certified agronomist for critical decisions.
      </p>
    </div>
  );
}
