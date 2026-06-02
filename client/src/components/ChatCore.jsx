import { useState, useRef, useEffect } from 'react';
import './ChatCore.css';

// Import our new modular components
import ChatHeader from './ChatHeader';
import ChatMessageList from './ChatMessageList';
import ChatInputForm from './ChatInputForm';
import ChatActionDock from './ChatActionDock';
import ChatVault from './ChatVault'; 

function floatTo16BitPCM(float32Arr) {
  const buffer = new ArrayBuffer(float32Arr.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Arr.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Arr[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

export default function ChatCore() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null); 
  const [selectedModel, setSelectedModel] = useState('smart');
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeVideoSource, setActiveVideoSource] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // SAFE API BASE URL FALLBACK
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const silenceTimerRef = useRef(null);

  const resetSilence = () => {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      setIsAwake(false);
      console.log('😴 Indra sleeping');
    }, 5000);
  };

  useEffect(() => {
    return () => clearTimeout(silenceTimerRef.current);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleModelChange = (mode) => {
    if (mode === 'ultra') {
      const user = JSON.parse(localStorage.getItem('userInfo'));
      if (!user || !user.isPremium) {
        setShowUpgradeModal(true);
        return;
      }
    }
    setSelectedModel(mode);
  };

  // ---- NEW: Load Past Conversation Logic ----
  const loadConversation = async (id) => {
    setIsVaultOpen(false);
    setIsLoading(true);
    setConversationId(id);
    
    try {
      const response = await fetch(`${API_BASE}/api/v1/indra/chat/history/messages/${id}`);
      const data = await response.json();
      
      if (data.success) {
        // Map backend database format to frontend UI format
        const formattedMessages = data.messages.map(msg => ({
          role: msg.role === 'assistant' ? 'ai' : msg.role,
          text: msg.content
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Upgraded to handle Server-Sent Events (SSE) stream from backend
  const handleSend = async (e) => {
    e?.preventDefault();
    if (isLoading) return;
    if (!input.trim() && !selectedImage && !activeVideoSource) return;

    const userMessage = input;

    setMessages((prev) => [...prev, { role: 'user', text: userMessage, image: selectedImage }]);
    setInput('');
    setSelectedImage(null);
    setShowTextInput(false);
    setActiveVideoSource(null);
    setIsLoading(true);

    // Prepare an empty AI message for the stream
    setMessages((prev) => [...prev, { role: 'ai', text: '' }]);

    try {
      const response = await fetch(`${API_BASE}/api/v1/indra/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          mode: selectedModel === 'lite' ? 'fast' : selectedModel,
          conversationId: conversationId 
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let aiText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr) {
              try {
                const data = JSON.parse(dataStr);
                
                if (data.token) {
                  aiText += data.token;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = aiText;
                    return newMessages;
                  });
                }
                
                if (data.done && data.conversationId) {
                   setConversationId(data.conversationId);
                }
              } catch (e) {
                console.error("Stream parse error:", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].text = "Connection interrupted.";
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setShowActionMenu(false);
      setShowTextInput(true);
    };
    reader.readAsDataURL(file);
  };

  // ---- VOICE LOGIC STARTS ----
  const startStreamingVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ws = new WebSocket('wss://indra-ai-core.onrender.com/ws/voice');
      mediaRecorderRef.current = { ws };

      ws.onerror = (err) => {
        console.error('WebSocket error, falling back to REST:', err);
        ws.close();
        startRecording();
      };

      const audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const input = e.inputBuffer.getChannelData(0);
          ws.send(floatTo16BitPCM(input));
        }
      };

      ws.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          const audio = new Audio(URL.createObjectURL(event.data));
          audio.play();
          return;
        }

        const data = JSON.parse(event.data);
        if (data.type === 'transcript') {
          const text = data.text.toLowerCase();
          if (!isAwake && text.includes('indra')) {
            setIsAwake(true);
            resetSilence();
            return;
          }
          if (isAwake) {
            resetSilence();
            setMessages((prev) => [...prev, { role: 'user', text: data.text }]);
          }
        }

        if (data.type === 'response' && isAwake) {
          setMessages((prev) => [...prev, { role: 'ai', text: data.text }]);
        }
      };
    } catch (err) {
      console.error('Streaming setup error, falling back:', err);
      startRecording();
    }
  };

  const stopStreamingVoice = () => {
    const ws = mediaRecorderRef.current?.ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('interrupt');
      ws.close();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', blob);

        try {
          setIsLoading(true);
          const res = await fetch(`${API_BASE}/api/v1/indra/voice`, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          setMessages((prev) => [
            ...prev,
            { role: 'user', text: data.input_text || '[voice]' },
            { role: 'ai', text: data.response }
          ]);
          if (data.audio_url) {
            const audio = new Audio(`${API_BASE}${data.audio_url}`);
            audio.play();
          }
        } catch (err) {
          console.error('Voice fallback error:', err);
        } finally {
          setIsLoading(false);
        }
      };
      recorder.start();
    } catch (err) {
      console.error('Mic error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current instanceof MediaRecorder) {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleVoice = () => {
    if (!voiceEnabled) {
      setVoiceEnabled(true);
      startStreamingVoice();
    } else {
      setVoiceEnabled(false);
      setIsAwake(false);
      clearTimeout(silenceTimerRef.current);
      if (mediaRecorderRef.current?.ws) {
        stopStreamingVoice();
      } else {
        stopRecording();
      }
    }
  };
  // ---- VOICE LOGIC ENDS ----

  const isInputModeActive = showTextInput || activeVideoSource || selectedImage;

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