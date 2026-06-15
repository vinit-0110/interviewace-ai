import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../context/AuthContext';

export const VoiceRecorder = ({ onTranscript, token }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Initialize Web Speech API if supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (currentTranscript) {
          onTranscript(currentTranscript);
        }
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        if (e.error === 'not-allowed') {
          setError('Microphone access denied. Please check permissions.');
        } else {
          // Switch to MediaRecorder fallback silently
          console.log('Falling back to audio recording mode...');
        }
      };

      recognitionRef.current = rec;
    }
  }, [onTranscript]);

  const startRecording = async () => {
    setError(null);
    audioChunksRef.current = [];
    
    // 1. Try to start Web Speech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        return;
      } catch (e) {
        console.warn('Speech recognition start failed, using fallback:', e);
      }
    }

    // 2. Fallback: Request mic permissions and start MediaRecorder
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Upload audio file to backend Whisper service
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'answer_recording.webm', { type: 'audio/webm' });
        
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('audio', file);

        try {
          const res = await fetch(`${API_BASE_URL}/api/interviews/transcribe`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          const data = await res.json();
          if (res.ok && data.success) {
            onTranscript(data.text);
          } else {
            setError(data.message || 'Failed to transcribe audio.');
          }
        } catch (e) {
          setError('Network error transcribing audio.');
        } finally {
          setIsProcessing(false);
          // Stop stream tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      setError('Could not access microphone. Verify device permissions.');
      console.error(e);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
  };

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isProcessing}
          className={`relative p-4 rounded-full transition-all duration-300 ${
            isRecording
              ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]'
              : 'bg-brand-500 hover:bg-brand-600 text-white shadow-glow'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isRecording ? 'Stop Recording' : 'Start Voice Input'}
        >
          {isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isRecording ? (
            <Mic className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}

          {/* Pulsing micro-waves inside button for wow effect */}
          {isRecording && (
            <span className="absolute -inset-1 rounded-full border border-rose-500 animate-ping opacity-75"></span>
          )}
        </button>

        {isRecording && (
          <div className="flex items-center space-x-1">
            <span className="h-3 w-1 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
            <span className="h-5 w-1 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
            <span className="h-3 w-1 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center space-x-1.5 text-xs text-rose-500 dark:text-rose-400">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}

      {isRecording && (
        <span className="text-xs text-rose-500 dark:text-rose-400 animate-pulse font-medium">
          Listening... Speak clearly.
        </span>
      )}
      
      {isProcessing && (
        <span className="text-xs text-brand-500 dark:text-brand-400 animate-pulse font-medium">
          Transcribing voice audio...
        </span>
      )}
    </div>
  );
};
