import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Loader2,
  X,
  Camera,
  Database,
  HardDrive,
  MonitorUp,
  Zap,
  MousePointerClick,
  Mic,
 Volume2,
  VolumeX,
  Download,
  Cloud,
  Search,
  Square,
  ExternalLink
} from 'lucide-react';

import './ChatCore.css';
import apiClient from '../services/apiClient';

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
  const [selectedModel, setSelectedModel] = useState('smart');
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [vaultData, setVaultData] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeVideoSource, setActiveVideoSource] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

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

  const handleSend = async (e) => {
    e?.preventDefault();

    if (isLoading) return;

    if (!input.trim() && !selectedImage && !activeVideoSource) return;

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: userMessage,
        image: selectedImage
      }
    ]);

    setInput('');
    setSelectedImage(null);
    setShowTextInput(false);
    setActiveVideoSource(null);
    setIsLoading(true);

    try {
      const response = await apiClient.post('/chat', {
        user_id: 'default_user',
        prompt: userMessage,
        mode: selectedModel === 'lite' ? 'fast' : selectedModel,
        agent: automationEnabled
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: response.data.response
        }
      ]);

    } catch (error) {
      console.error('Failed to send message:', error);

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: "Sorry, I couldn't reach the server. Please check your connection."
        }
      ]);

    } finally {
      setIsLoading(false);
    }
  };

  const startStreamingVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const ws = new WebSocket(
        'wss://indra-ai-core.onrender.com/ws/voice'
      );

      mediaRecorderRef.current = { ws };

      ws.onerror = (err) => {
        console.error('WebSocket error, falling back to REST:', err);
        ws.close();
        startRecording();
      };

      const audioContext = new AudioContext({
        sampleRate: 16000
      });

      const source = audioContext.createMediaStreamSource(stream);

      const processor = audioContext.createScriptProcessor(
        4096,
        1,
        1
      );

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
          const audio = new Audio(
            URL.createObjectURL(event.data)
          );

          audio.play();
          return;
        }

        const data = JSON.parse(event.data);

        if (data.type === 'transcript') {
          const text = data.text.toLowerCase();

          if (!isAwake && text.includes('indra')) {
            setIsAwake(true);
            console.log('🔥 Indra Activated');
            resetSilence();
            return;
          }

          if (isAwake) {
            resetSilence();

            setMessages((prev) => [
              ...prev,
              {
                role: 'user',
                text: data.text
              }
            ]);
          }
        }

        if (data.type === 'response' && isAwake) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'ai',
              text: data.text
            }
          ]);
        }
      };

    } catch (err) {
      console.error(
        'Streaming setup error, falling back:',
        err
      );

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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: 'audio/webm'
        });

        const formData = new FormData();

        formData.append('file', blob);

        try {
          setIsLoading(true);

          const res = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/voice`,
            {
              method: 'POST',
              body: formData
            }
          );

          const data = await res.json();

          setMessages((prev) => [
            ...prev,
            {
              role: 'user',
              text: data.input_text || '[voice]'
            },
            {
              role: 'ai',
              text: data.response
            }
          ]);

          if (data.audio_url) {
            const audio = new Audio(
              `${import.meta.env.VITE_API_BASE_URL}${data.audio_url}`
            );

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

  const interruptAI = () => {
    const ws = mediaRecorderRef.current?.ws;

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send('interrupt');
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

  const isInputModeActive =
    showTextInput ||
    activeVideoSource ||
    selectedImage;

  return (
    <div
      id="indra-chat-core-container"
      className="indra-container"
    >
      <div className="indra-header">
        <div
          className="indra-header-brand"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <img
            src="/favicon.png"
            alt="Indra Logo"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              objectFit: 'contain'
            }}
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
              className={`indra-toggle-btn ${
                selectedModel === mode ? 'active' : ''
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="indra-chat-area">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`indra-msg-wrapper ${msg.role}`}
          >
            <div className={`indra-msg-bubble ${msg.role}`}>
              {msg.image && (
                <img
                  src={msg.image}
                  className="indra-msg-img"
                  alt="upload"
                />
              )}

              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6
                }}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <Loader2
            className="animate-spin indra-empty-icon"
            size={24}
            style={{ margin: '0 auto' }}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="indra-action-hub">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleDeviceUpload}
          style={{ display: 'none' }}
        />

        {isInputModeActive ? (
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
                onChange={(e) =>
                  setInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();

                    if (!isLoading) {
                      handleSend(e);
                    }
                  }
                }}
                disabled={isLoading}
                placeholder={
                  isLoading
                    ? 'Indra is thinking...'
                    : 'Type your command...'
                }
                className="indra-main-input"
                autoFocus
              />
            </div>

            <button
              onClick={(e) => handleSend(e)}
              disabled={
                isLoading ||
                (!input.trim() &&
                  !selectedImage &&
                  !activeVideoSource)
              }
              className="indra-send-btn"
            >
              <Send size={20} />
            </button>
          </div>
        ) : (
          <div className="indra-center-hub">
            <div
              className={`indra-action-dock ${
                showActionMenu ? 'open' : ''
              }`}
            >
              <div className="indra-dock-side left">
                <button
                  onClick={() => {
                    setShowTextInput(true);
                    setShowActionMenu(false);
                  }}
                  className="indra-menu-item"
                >
                  <Search size={18} />
                  <span>SEARCH</span>
                </button>

                <button
                  onClick={() => {
                    toggleVoice();
                    setShowTextInput(true);
                    setShowActionMenu(false);
                  }}
                  className="indra-menu-item"
                >
                  <Mic size={18} />
                  <span>VOICE</span>
                </button>

                <button
                  onClick={() => {
                    setActiveVideoSource('camera');
                    setShowTextInput(true);
                    setShowActionMenu(false);
                  }}
                  className="indra-menu-item"
                >
                  <Camera size={18} />
                  <span>CAMERA</span>
                </button>
              </div>

              <div className="indra-dock-spacer"></div>

              <div className="indra-dock-side right">
                <button
                  onClick={() => {
                    setActiveVideoSource('screen');
                    setShowTextInput(true);
                    setShowActionMenu(false);
                  }}
                  className="indra-menu-item"
                >
                  <MonitorUp size={18} />
                  <span>PRESENT</span>
                </button>

                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowActionMenu(false);
                  }}
                  className="indra-menu-item"
                >
                  <HardDrive size={18} />
                  <span>DEVICE</span>
                </button>

                <button
                  onClick={() => {
                    setIsVaultOpen(true);
                    setShowActionMenu(false);
                  }}
                  className="indra-menu-item"
                >
                  <Database size={18} />
                  <span>VAULT</span>
                </button>
              </div>
            </div>

            <button
              onClick={() =>
                setShowActionMenu(!showActionMenu)
              }
              className={`indra-thunder-btn ${
                showActionMenu ? 'open' : ''
              }`}
            >
              {showActionMenu ? (
                <X size={24} />
              ) : (
                <Zap size={24} fill="currentColor" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}