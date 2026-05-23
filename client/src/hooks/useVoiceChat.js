import { useState, useRef } from 'react';

function floatTo16BitPCM(float32Arr) {
  const buffer = new ArrayBuffer(float32Arr.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Arr.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Arr[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

export function useVoiceChat(setMessages, setIsLoading) {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const silenceTimerRef = useRef(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isAwake, setIsAwake] = useState(false);

  const resetSilence = () => {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => setIsAwake(false), 5000);
  };

  const startStreamingVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ws = new WebSocket('wss://indra-ai-core.onrender.com/ws/voice');
      mediaRecorderRef.current = { ws };

      ws.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          new Audio(URL.createObjectURL(event.data)).play();
          return;
        }
        const data = JSON.parse(event.data);
        if (data.type === 'transcript') {
          if (!isAwake && data.text.toLowerCase().includes('indra')) setIsAwake(true);
          if (isAwake) setMessages(prev => [...prev, { role: 'user', text: data.text }]);
          resetSilence();
        } else if (data.type === 'response' && isAwake) {
          setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
        }
      };
      
      const source = new AudioContext({ sampleRate: 16000 }).createMediaStreamSource(stream);
      const processor = new AudioContext({ sampleRate: 16000 }).createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(new AudioContext({ sampleRate: 16000 }).destination);
      processor.onaudioprocess = (e) => ws.readyState === WebSocket.OPEN && ws.send(floatTo16BitPCM(e.inputBuffer.getChannelData(0)));
    } catch (err) { console.error(err); }
  };

  const toggleVoice = () => {
    if (!voiceEnabled) {
      setVoiceEnabled(true);
      startStreamingVoice();
    } else {
      setVoiceEnabled(false);
      setIsAwake(false);
      mediaRecorderRef.current?.ws?.close();
    }
  };

  return { voiceEnabled, isAwake, toggleVoice };
}