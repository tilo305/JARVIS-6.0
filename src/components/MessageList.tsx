import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { formatTimestamp } from '../utils/helpers';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="message-list" data-testid="message-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message ${message.sender}`}
        >
          <div className="message-content">
            <p className="message-text">
              {message.text}
            </p>
            
            {message.audioUrl && (
              <button 
                onClick={() => {
                  // Handle both URL and base64 audio from n8n
                  if (!message.audioUrl) return;
                  
                  // If it's base64 data, convert to blob URL
                  if (message.audioUrl.startsWith('data:audio/')) {
                    // It's already base64, create blob URL
                    fetch(message.audioUrl)
                      .then(res => res.blob())
                      .then(blob => {
                        const url = URL.createObjectURL(blob);
                        const audio = new Audio(url);
                        audio.volume = 0.8;
                        audio.play().then(() => {
                          // Clean up blob URL after playing
                          setTimeout(() => URL.revokeObjectURL(url), 1000);
                        }).catch(err => {
                          console.error('Audio playback failed:', err);
                          URL.revokeObjectURL(url);
                        });
                      })
                      .catch(err => {
                        console.error('Failed to fetch audio:', err);
                      });
                  } else {
                    // It's a regular URL
                    const audio = new Audio(message.audioUrl);
                    audio.volume = 0.8;
                    audio.play().catch(err => {
                      console.error('Audio playback failed:', err);
                    });
                  }
                }}
                className="audio-play-button"
                title="Play audio response"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span>Play</span>
              </button>
            )}
          </div>
          
          <div className="message-time">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};