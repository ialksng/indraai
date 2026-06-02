import { Send, X } from 'lucide-react';

export default function ChatInputForm({
  input,
  setInput,
  handleSend,
  isLoading,
  setShowTextInput,
  setActiveVideoSource,
  selectedImage,
  activeVideoSource
}) {
  return (
    <div className="indra-input-form">
      <button
        onClick={() => {
          setShowTextInput(false);
          setActiveVideoSource(null);
          setInput('');
        }}
        className="indra-icon-btn"
      >
        <X size={20} />
      </button>

      <div className="indra-input-wrapper">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (!isLoading) handleSend(e);
            }
          }}
          disabled={isLoading}
          placeholder={isLoading ? 'Indra is thinking...' : 'Type your command...'}
          className="indra-main-input"
          autoFocus
        />
      </div>

      <button
        onClick={(e) => handleSend(e)}
        disabled={isLoading || (!input.trim() && !selectedImage && !activeVideoSource)}
        className="indra-send-btn"
      >
        <Send size={20} />
      </button>
    </div>
  );
}