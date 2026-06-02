import { ExternalLink } from 'lucide-react';

export default function ChatHeader({ selectedModel, handleModelChange }) {
  return (
    <div className="indra-header">
      <div
        className="indra-header-brand"
        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        <img
          src="/favicon.png"
          alt="Indra Logo"
          style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }}
        />
        <a
          href="https://indra.ialksng.me"
          target="_blank"
          rel="noopener noreferrer"
          className="indra-icon-btn"
        >
          <ExternalLink size={18} />
        </a>
      </div>

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