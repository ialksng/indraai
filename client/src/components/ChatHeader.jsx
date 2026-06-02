import React from 'react';
import { User } from 'lucide-react';

export default function ChatHeader({ selectedModel, handleModelChange }) {
  
  // Check login status before deciding where to redirect
  const handleProfileClick = () => {
    const userInfo = localStorage.getItem('userInfo');
    
    // If user data exists, go to Dashboard. Otherwise, go to Login.
    if (userInfo && userInfo !== "undefined") {
      window.open('https://indra.ialksng.me/dashboard', '_blank');
    } else {
      window.open('https://indra.ialksng.me/login', '_blank');
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-white/10 bg-[#0f172a] rounded-t-2xl z-10 w-full relative gap-2">

      {/* MODEL SELECTOR (Center) */}
      <div className="flex bg-slate-800 rounded-lg p-1 border border-white/5 overflow-x-auto hide-scrollbar flex-nowrap mx-auto">
        <button 
          onClick={() => handleModelChange('lite')}
          className={`px-2 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            selectedModel === 'lite' || selectedModel === 'fast' 
              ? 'bg-white/10 text-white shadow-sm' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Fast
        </button>
        <button 
          onClick={() => handleModelChange('smart')}
          className={`px-2 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            selectedModel === 'smart' 
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 shadow-sm' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Smart
        </button>
        <button 
          onClick={() => handleModelChange('ultra')}
          className={`px-2 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            selectedModel === 'ultra' 
              ? 'bg-indigo-500 text-white shadow-sm' 
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Ultra
        </button>
      </div>

      {/* PROFILE ICON (Right) */}
      <button 
        onClick={handleProfileClick}
        className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        title="Dashboard / Log In"
      >
        <User size={16} />
      </button>
      
    </div>
  );
}