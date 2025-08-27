import React from 'react';
import { Message } from '../types';
import { MessageList } from './MessageList';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isProcessing,
}) => {
  return (
    <div className="chat-interface">
      <MessageList messages={messages} />
      
      {isProcessing && (
        <div className="processing-indicator">
          <div className="loading-dots">
            <span></span>
            <span></span>
          </div>
          <span className="processing-text">JARVIS is thinking...</span>
        </div>
      )}
    </div>
  );
};