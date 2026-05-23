import { useState, useRef } from 'react';
import { Send, Loader2, X, Zap, ExternalLink, Search, Mic, Camera, MonitorUp, HardDrive, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import apiClient from '../services/apiClient';
import { useVoiceChat } from '../hooks/useVoiceChat';
import './ChatCore.css';

export default function ChatCore() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  
  const { voiceEnabled, toggleVoice } = useVoiceChat(setMessages, setIsLoading);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (isLoading || !input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await apiClient.post('/chat', { prompt: userMessage, conversationId });
      setConversationId(data.conversationId);
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Connection failed." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="indra-container">
      <div className="indra-header">
        <img src="/favicon.png" alt="Logo" style={{ width: 28 }} />
        <button onClick={toggleVoice}>{voiceEnabled ? "Voice ON" : "Voice OFF"}</button>
      </div>

      <div className="indra-chat-area">
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
          </div>
        ))}
        {isLoading && <div className="bubble ai">Indra is thinking...</div>}
      </div>

      <div className="indra-input-form">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type command..." />
        <button onClick={handleSend}><Send /></button>
      </div>
    </div>
  );
}