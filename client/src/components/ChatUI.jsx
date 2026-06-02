import React from 'react';

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

  setInput,
  setShowActionMenu,
  setShowTextInput,
  setActiveVideoSource,
  setIsVaultOpen,

  fileInputRef,
  messagesEndRef,

  handleModelChange,
  handleSend,
  handleDeviceUpload,
  toggleVoice,
  loadConversation
}) {

  return (
    <div id="indra-chat-core-container" className="indra-container">
      
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

      <ChatVault 
        isOpen={isVaultOpen} 
        onClose={() => setIsVaultOpen(false)} 
        onSelectConversation={loadConversation}
      />
    </div>
  );
}