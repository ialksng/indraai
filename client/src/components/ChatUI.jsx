import React from 'react';

// Import the modular visual components
import ChatHeader from './ChatHeader';
import ChatMessageList from './ChatMessageList';
import ChatInputForm from './ChatInputForm';
import ChatActionDock from './ChatActionDock';
import ChatVault from './ChatVault'; 

export default function ChatUI({
  // State & Variables
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
  // Setters
  setInput,
  setShowActionMenu,
  setShowTextInput,
  setActiveVideoSource,
  setIsVaultOpen,
  // Refs
  fileInputRef,
  messagesEndRef,
  // Handlers
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