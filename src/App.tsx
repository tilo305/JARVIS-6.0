import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { VoiceRecorder } from './components/VoiceRecorder';
import { useChat } from './hooks/useChat';
import { JarvisAPI } from './services/api';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/jarvis-theme.css';

function App() {
  const {
    messages,
    isProcessing,
    sendTextMessage,
    sendVoiceMessage,
    clearMessages,
  } = useChat();

  const [isHealthy, setIsHealthy] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Health check on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkHealth = async () => {
      try {
        const api = JarvisAPI.getInstance();
        const healthy = await api.checkHealth();
        if (isMounted) {
          setIsHealthy(healthy);
        }
      } catch (error) {
        if (isMounted) {
          setIsHealthy(false);
        }
      }
    };

    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handle voice recording completion
  const handleVoiceRecordingComplete = async (audioBlob: Blob) => {
    try {
      // Send the voice message to the n8n webhook
      await sendVoiceMessage(audioBlob);
    } catch (error) {
      console.error('Failed to send voice message:', error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="jarvis-app">
      {/* Iron Man Video Background */}
      <div className="video-background">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hero-video"
        >
          <source src="/Ironman WEBM.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
        
        {/* Dark overlay for better text readability */}
        <div className="video-overlay" />
      </div>

      {/* Holographic Chat Interface - Centered at Bottom */}
      <div className="chat-interface-container">
        <div className="holographic-chat-window">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="jarvis-logo">
              <div className="logo-glow" />
              <span className="logo-text">JARVIS</span>
            </div>
            <button
              onClick={clearMessages}
              className="clear-button"
              title="Clear Chat History"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            <ChatInterface
              messages={messages}
              onSendMessage={sendTextMessage}
              isProcessing={isProcessing}
            />
          </div>

          {/* Input Area with Voice and Text */}
          <div className="chat-input-area">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                className="text-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inputValue.trim() && !isProcessing) {
                    e.preventDefault();
                    sendTextMessage(inputValue.trim());
                    setInputValue('');
                    inputRef.current?.focus();
                  }
                }}
                disabled={isProcessing}
              />
              
              {/* Voice Recorder Component - Integrated with n8n Webhook */}
              <VoiceRecorder
                onRecordingComplete={handleVoiceRecordingComplete}
                isProcessing={isProcessing}
              />
            </div>
          </div>

          {/* Status Indicator */}
          {!isHealthy && (
            <div className="status-warning">
              <span className="warning-icon">⚠️</span>
              <span className="warning-text">Connection Lost</span>
            </div>
          )}
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}

export default App;