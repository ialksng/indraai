import { Loader2 } from 'lucide-react';

export default function ChatMessageList({ messages, isLoading, messagesEndRef }) {
  return (
    <div className="indra-chat-area">
      {messages.map((msg, i) => (
        <div key={i} className={`indra-msg-wrapper ${msg.role}`}>
          <div className={`indra-msg-bubble ${msg.role}`}>
            {msg.image && (
              <img src={msg.image} className="indra-msg-img" alt="upload" />
            )}
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {msg.text}
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <Loader2
          className="animate-spin indra-empty-icon"
          size={24}
          style={{ margin: '0 auto' }}
        />
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}