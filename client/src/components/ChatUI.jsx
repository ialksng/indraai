import React from 'react';
import { X, Lock, LogIn, UserPlus } from 'lucide-react';

import ChatHeader from './ChatHeader';
import ChatMessageList from './ChatMessageList';
import ChatInputForm from './ChatInputForm';
import ChatActionDock from './ChatActionDock';
import ChatVault from './ChatVault'; 

export default function ChatUI({
  messages,
  input,
  selectedModel,
  showActionMenu,
  showTextInput,
  selectedImage,
  activeVideoSource,
  isVaultOpen,
  isLoading,
  isInputModeActive,
  showUpgradeModal, 
  
  setInput,
  setShowActionMenu,
  setShowTextInput,
  setActiveVideoSource,
  setIsVaultOpen,
  setShowUpgradeModal, 
  
  fileInputRef,
  messagesEndRef,
  handleModelChange,
  handleSend,
  handleDeviceUpload,
  toggleVoice,
  loadConversation
}) {

  return (
    <div id="indra-chat-core-container" className="indra-container relative">
      
      <ChatHeader 
        selectedModel={selectedModel} 
        handleModelChange={handleModelChange} 
      />

      <ChatMessageList 
        messages={messages} 
        isLoading={isLoading} 
        messagesEndRef={messagesEndRef} 
      />

      <div className="indra-action-hub">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleDeviceUpload}
          style={{ display: 'none' }}
        />

        {isInputModeActive ? (
          <ChatInputForm 
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            isLoading={isLoading}
            setShowTextInput={setShowTextInput}
            setActiveVideoSource={setActiveVideoSource}
            selectedImage={selectedImage}
            activeVideoSource={activeVideoSource}
          />
        ) : (
          <ChatActionDock 
            showActionMenu={showActionMenu}
            setShowActionMenu={setShowActionMenu}
            setShowTextInput={setShowTextInput}
            toggleVoice={toggleVoice}
            setActiveVideoSource={setActiveVideoSource}
            fileInputRef={fileInputRef}
            setIsVaultOpen={setIsVaultOpen}
          />
        )}
      </div>

      {/* --- VAULT MODAL --- */}
      <ChatVault 
        isOpen={isVaultOpen} 
        onClose={() => setIsVaultOpen(false)} 
        onSelectConversation={loadConversation}
      />

      {/* --- ULTRA LOGIN / SIGNUP MODAL --- */}
      {showUpgradeModal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1e293b]">
              <h3 className="text-white font-semibold flex items-center gap-2 m-0 text-md">
                <Lock size={16} className="text-indigo-400" />
                Unlock Ultra Model
              </h3>
              <button 
                onClick={() => setShowUpgradeModal(false)} 
                className="text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                <span className="text-3xl">💎</span>
              </div>
              <h4 className="text-white text-xl font-bold mb-2">Experience Indra Ultra</h4>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                The Ultra model requires an account to access advanced reasoning, deep memory, and complex capabilities.
              </p>
              
              <div className="flex flex-col gap-3">
                <a 
                  href="https://indra.ialksng.me/login" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors no-underline"
                >
                  <LogIn size={18} />
                  Log In
                </a>
                <a 
                  href="https://indra.ialksng.me/signup" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-200 font-medium rounded-xl border border-white/10 transition-colors no-underline"
                >
                  <UserPlus size={18} />
                  Sign Up for Free
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}