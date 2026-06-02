import { ExternalLink } from 'lucide-react';

export default function ChatHeader({ selectedModel, handleModelChange }) {
  return (
    <div className="indra-header">
      <div className="indra-model-toggle">
        {['lite', 'smart', 'ultra'].map((mode) => (
          <button
            key={mode}
            onClick={() => handleModelChange(mode)}
            className={`indra-toggle-btn ${selectedModel === mode ? 'active' : ''}`}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
}