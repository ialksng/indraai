import { useState } from 'react';
import { Send } from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import 'katex/dist/katex.min.css';

import apiClient from '../services/apiClient';
import { useVoiceChat } from '../hooks/useVoiceChat';

import './ChatCore.css';

/**
 * SMART AI OUTPUT FORMATTER
 * Converts raw AI text into beautiful Markdown + LaTeX
 */
const formatAIOutput = (text) => {
  if (!text) return '';

  let formatted = text;

  // ==========================================
  // FIX ESCAPED LATEX
  // ==========================================

  formatted = formatted
    .replace(/\\\[/g, '$$')
    .replace(/\\\]/g, '$$')
    .replace(/\\\(/g, '$')
    .replace(/\\\)/g, '$');

  // ==========================================
  // FIX COMMON AI EQUATIONS
  // ==========================================

  // Convert standalone equations into math blocks
  formatted = formatted.replace(
    /^([A-Za-z][^=\n]*=\s*.+)$/gm,
    (_, eq) => `\n$$\n${eq.trim()}\n$$\n`
  );

  // ==========================================
  // FIX MULTIPLICATION
  // ==========================================

  formatted = formatted.replace(/\s\*\s/g, ' \\cdot ');

  // ==========================================
  // FIX SUBSCRIPTS
  // m1 -> m_1
  // ==========================================

  formatted = formatted.replace(
    /([a-zA-Z])(\d+)/g,
    '$1_$2'
  );

  // ==========================================
  // FIX POWERS
  // r^2 -> r^{2}
  // ==========================================

  formatted = formatted.replace(
    /(\w)\^(\d+)/g,
    '$1^{$2}'
  );

  // ==========================================
  // FIX SCIENTIFIC NOTATION
  // 5.972 x 10^24
  // ==========================================

  formatted = formatted.replace(
    /(\d+\.?\d*)\s*x\s*10\^\{?(\d+)\}?/gi,
    '$1 \\times 10^{$2}'
  );

  // ==========================================
  // FIX FRACTIONS
  // ONLY inside equations
  // ==========================================

  formatted = formatted.replace(
    /([a-zA-Z0-9_()]+)\s*\/\s*([a-zA-Z0-9_^{}()]+)/g,
    '\\frac{$1}{$2}'
  );

  // ==========================================
  // CLEAN EXTRA SPACES
  // ==========================================

  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  return formatted;
};

export default function ChatCore() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const {
    voiceEnabled,
    toggleVoice
  } = useVoiceChat(setMessages, setIsLoading);

  const handleSend = async (e) => {
    e?.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

    // ==========================================
    // ADD USER MESSAGE
    // ==========================================

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: userMessage,
      },
    ]);

    setInput('');
    setIsLoading(true);

    try {
      // ==========================================
      // API CALL
      // ==========================================

      const { data } = await apiClient.post('/chat', {
        prompt: userMessage,
        conversationId,
      });

      // ==========================================
      // SAVE CONVERSATION ID
      // ==========================================

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      // ==========================================
      // ADD AI MESSAGE
      // ==========================================

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text:
            data.response ||
            'No response received.',
        },
      ]);
    } catch (err) {
      console.error('Chat Error:', err);

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text:
            '❌ Connection failed. Please check your server.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="indra-container">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="indra-header">

        <div className="logo-section">
          <img
            src="/favicon.png"
            alt="Indra Logo"
            className="indra-logo"
          />

          <h2>Indra AI</h2>
        </div>

        <button
          className={`voice-btn ${
            voiceEnabled ? 'active' : ''
          }`}
          onClick={toggleVoice}
        >
          {voiceEnabled
            ? '🎤 Voice ON'
            : '🔇 Voice OFF'}
        </button>

      </div>

      {/* ==========================================
          CHAT AREA
      ========================================== */}

      <div className="indra-chat-area">

        {messages.length === 0 && (
          <div className="indra-empty-state">

            <h2>Indra AI</h2>

            <p>
              Ask anything.
              Math, code, science, files,
              reasoning, AI tools and more.
            </p>

          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`bubble ${message.role}`}
          >

            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
                remarkMath
              ]}
              rehypePlugins={[rehypeKatex]}
            >
              {formatAIOutput(message.text)}
            </ReactMarkdown>

          </div>
        ))}

        {isLoading && (
          <div className="bubble ai typing">

            <div className="typing-dots">
              <span />
              <span />
              <span />
            </div>

          </div>
        )}

      </div>

      {/* ==========================================
          INPUT AREA
      ========================================== */}

      <form
        className="indra-input-form"
        onSubmit={handleSend}
      >

        <input
          type="text"
          value={input}
          placeholder="Ask Indra anything..."
          onChange={(e) =>
            setInput(e.target.value)
          }
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading}
        >
          <Send size={18} />
        </button>

      </form>

    </div>
  );
}