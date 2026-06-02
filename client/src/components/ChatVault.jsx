import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function ChatVault({ isOpen, onClose, onSelectConversation }) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/indra/chat/history/guest`);
      const data = await response.json();
      if (data.success && data.history) {
        setConversations(data.history);
      }
    } catch (error) {
      console.error("Failed to fetch vault history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-[90%] max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[80%]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1e293b]">
          <h3 className="text-white font-semibold flex items-center gap-2 m-0 text-lg">
            <MessageSquare size={18} className="text-amber-400" />
            Vault History
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1">
            <X size={20} />
          </button>
        </div>
        
        {/* List Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-amber-500" size={32} />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No past conversations found.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {conversations.map((conv) => (
                <button 
                  key={conv.id} 
                  onClick={() => onSelectConversation(conv.id)}
                  className="flex items-center gap-3 p-3 text-left w-full rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-gray-200 border border-transparent hover:border-white/10 cursor-pointer"
                >
                  <MessageSquare size={16} className="text-gray-500 shrink-0" />
                  <div className="flex-1 truncate text-sm">
                    {conv.title || `Chat from ${new Date(conv.created_at || Date.now()).toLocaleString()}`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}