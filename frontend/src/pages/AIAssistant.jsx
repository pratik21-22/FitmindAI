import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader, Plus, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const QUICK = [
  'Create a weekly workout plan for me',
  'Suggest a diet plan for weight loss',
  'How do I build muscle fast?',
  'What should I eat post-workout?',
  'How many calories should I eat?',
];

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    loadChats();
    setMessages([{ role: 'assistant', content: "👋 Hey! I'm your **FitMind AI** coach. I can help you with:\n\n- 💪 Personalized workout plans\n- 🥗 Nutrition & diet advice\n- 🔥 Fat loss strategies\n- 📊 Progress analysis\n\nWhat would you like help with today?" }]);
  }, []);

  const loadChats = async () => { try { const { data } = await api.get('/ai/chats'); setChats(data); } catch {} };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { message: msg, chatId });
      setChatId(data.chatId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      loadChats();
    } catch { toast.error('AI is unavailable. Try again.'); setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble responding. Please check your connection." }]); }
    finally { setLoading(false); }
  };

  const loadChat = async (id) => {
    try { const { data } = await api.get(`/ai/chats/${id}`); setChatId(id); setMessages(data.messages || []); setShowSidebar(false); }
    catch { toast.error('Failed to load chat'); }
  };

  const newChat = () => {
    setChatId(null);
    setMessages([{ role: 'assistant', content: "👋 Starting a new conversation! What fitness topic can I help you with?" }]);
    setShowSidebar(false);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Chat history sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="glass-card w-64 flex flex-col flex-shrink-0 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Chat History</h3>
              <button className="btn-primary text-xs px-2 py-1 flex items-center gap-1" onClick={newChat}>
                <Plus size={12} /> New
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {chats.length === 0 ? <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No chats yet</p> :
                chats.map(c => (
                  <button key={c._id} onClick={() => loadChat(c._id)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs transition-all"
                    style={c._id === chatId
                      ? { background: 'rgba(99,102,241,0.12)', color: 'var(--primary-light)' }
                      : { color: 'var(--text-secondary)' }
                    }>
                    <MessageSquare size={11} className="inline mr-1" />
                    {c.title?.slice(0, 35) || 'Chat'}...
                  </button>
                ))
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat */}
      <div className="glass-card flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <button onClick={() => setShowSidebar(!showSidebar)} className="btn-icon">
            <MessageSquare size={16} />
          </button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
            <Bot size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>FitMind AI Coach</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full pulse-glow" style={{ background: 'var(--success)' }} />
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Online · Ready to help</span>
            </div>
          </div>
          <button onClick={newChat} className="ml-auto btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
            <Plus size={12} /> New Chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold`}
                style={msg.role === 'user'
                  ? { background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff' }
                  : { background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: 'var(--accent)' }
                }>
                {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
              </div>
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                <div className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none" style={{ color: 'var(--text-primary)' }}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                <Bot size={13} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="chat-bubble-ai flex items-center gap-2">
                <Loader size={14} className="animate-spin" style={{ color: 'var(--primary-light)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEnd} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="px-5 pb-2 flex gap-2 flex-wrap">
            {QUICK.map(q => (
              <button key={q} onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full border transition-all"
                style={{ borderColor: 'rgba(99,102,241,0.25)', color: 'var(--text-secondary)' }}
                onMouseOver={e => { e.currentTarget.style.color = 'var(--primary-light)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-5 pb-5 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
            <input
              className="input-field flex-1"
              placeholder="Ask your AI fitness coach anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={!input.trim() || loading}
              className="btn-primary w-11 h-11 flex items-center justify-center rounded-xl disabled:opacity-40 flex-shrink-0 !p-0">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
