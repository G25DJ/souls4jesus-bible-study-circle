
import React, { useState, useRef, useEffect } from 'react';
import { askBibleQuestion } from '../services/geminiService';
import { Send, User, Bot, Loader2, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AskAI: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to the Souls4Jesus Bible Assistant. How can I help you explore the scriptures today? You can ask about verses, historical context, or spiritual guidance.',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await askBibleQuestion(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Welcome back. How can I help you explore the scriptures today?',
      timestamp: new Date()
    }]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[70vh] flex flex-col bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
      <div className="bg-stone-900 text-white p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Souls4Jesus Messenger</h3>
            <p className="text-stone-400 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online Assistant
            </p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="text-stone-400 hover:text-white p-2 transition-colors"
          title="Clear Conversation"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-stone-50"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-amber-600 text-white rounded-tr-none' 
                  : 'bg-white text-stone-800 shadow-sm border border-stone-200 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-2 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%] items-center">
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600">
                <Bot size={16} />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-stone-200">
                <Loader2 size={20} className="animate-spin text-amber-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-stone-200">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the Bible..."
            className="w-full pl-6 pr-14 py-4 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 transition-all"
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 w-10 h-10 bg-amber-600 hover:bg-amber-700 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-center text-[10px] text-stone-400 mt-4">
          Messenger AI is an assistant. Always consult your scriptures and community for deep theological decisions.
        </p>
      </div>
    </div>
  );
};

export default AskAI;
