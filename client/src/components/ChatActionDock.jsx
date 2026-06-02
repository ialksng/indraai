import { X, Zap, Search, Mic, Camera, MonitorUp, HardDrive, Database } from 'lucide-react';

export default function ChatActionDock({
  showActionMenu,
  setShowActionMenu,
  setShowTextInput,
  toggleVoice,
  setActiveVideoSource,
  fileInputRef,
  setIsVaultOpen
}) {
  return (
    <div className="indra-center-hub">
      <div className={`indra-action-dock ${showActionMenu ? 'open' : ''}`}>
        <div className="indra-dock-side left">
          <button
            onClick={() => { setShowTextInput(true); setShowActionMenu(false); }}
            className="indra-menu-item"
          >
            <Search size={18} /><span>SEARCH</span>
          </button>
          <button
            onClick={() => { toggleVoice(); setShowTextInput(true); setShowActionMenu(false); }}
            className="indra-menu-item"
          >
            <Mic size={18} /><span>VOICE</span>
          </button>
          <button
            onClick={() => { setActiveVideoSource('camera'); setShowTextInput(true); setShowActionMenu(false); }}
            className="indra-menu-item"
          >
            <Camera size={18} /><span>CAMERA</span>
          </button>
        </div>

        <div className="indra-dock-spacer"></div>

        <div className="indra-dock-side right">
          <button
            onClick={() => { setActiveVideoSource('screen'); setShowTextInput(true); setShowActionMenu(false); }}
            className="indra-menu-item"
          >
            <MonitorUp size={18} /><span>PRESENT</span>
          </button>
          <button
            onClick={() => { fileInputRef.current?.click(); setShowActionMenu(false); }}
            className="indra-menu-item"
          >
            <HardDrive size={18} /><span>DEVICE</span>
          </button>
          <button
            onClick={() => { setIsVaultOpen(true); setShowActionMenu(false); }}
            className="indra-menu-item"
          >
            <Database size={18} /><span>VAULT</span>
          </button>
        </div>
      </div>

      <button
        onClick={() => setShowActionMenu(!showActionMenu)}
        className={`indra-thunder-btn ${showActionMenu ? 'open' : ''}`}
      >
        {showActionMenu ? <X size={24} /> : <Zap size={24} fill="currentColor" />}
      </button>
    </div>
  );
}