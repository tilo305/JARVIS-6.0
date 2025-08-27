import { useState, useCallback, useEffect, useMemo } from 'react';
import { JarvisAPI } from '../services/api';
import { Logger, playAudioSafely } from '../utils/helpers';
import { UI_MESSAGES } from '../utils/constants';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'jarvis';
  timestamp: Date;
  audioUrl?: string;
}

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId] = useState(() => `conv_${Date.now()}`);

  const api = useMemo(() => JarvisAPI.getInstance(), []);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: generateId(),
      text: UI_MESSAGES.welcome,
      sender: 'jarvis',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const addMessage = useCallback((text: string, sender: 'user' | 'jarvis', audioUrl?: string) => {
    const message: Message = {
      id: generateId(),
      text,
      sender,
      timestamp: new Date(),
      audioUrl,
    };
    setMessages(prev => {
      // Limit messages to prevent memory issues
      const maxMessages = 100;
      if (prev.length >= maxMessages) {
        return [...prev.slice(-maxMessages + 1), message];
      }
      return [...prev, message];
    });
    return message;
  }, []);

  const sendTextMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;

    setError(null);
    
    // Add user message immediately
    addMessage(text, 'user');
    setIsProcessing(true);

    try {
      const response = await api.sendTextMessage(text, conversationId);
      
      // Add JARVIS response
      const jarvisMessage = addMessage(response.text, 'jarvis', response.audioUrl);
      
      // Auto-play audio if available (from n8n)
      if (response.audioUrl) {
        try {
          // Handle base64 audio from n8n
          if (response.audioUrl.startsWith('data:audio/')) {
            // Convert base64 to blob and play
            const audioPromise = fetch(response.audioUrl)
              .then(res => res.blob())
              .then(blob => {
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audio.volume = 0.8;
                
                // Clean up function
                const cleanup = () => {
                  URL.revokeObjectURL(url);
                  audio.removeEventListener('ended', cleanup);
                  audio.removeEventListener('error', cleanup);
                };
                
                audio.addEventListener('ended', cleanup);
                audio.addEventListener('error', cleanup);
                
                return audio.play().catch(err => {
                  Logger.warn('Audio playback failed', err);
                  cleanup();
                });
              })
              .catch(err => {
                Logger.warn('Failed to fetch audio:', err);
              });
              
            // Don't await - let it play in background
            audioPromise.catch(() => {}); // Silent catch
          } else {
            // Regular URL
            await playAudioSafely(response.audioUrl);
          }
        } catch (audioError) {
          Logger.warn('Audio playback failed', audioError);
          // Don't throw - text response is still valid
        }
      }

      return jarvisMessage;
    } catch (error: any) {
      Logger.error('Error sending text message', error);
      setError(error.message);
      
      // Add error message
      addMessage(
        error.message || UI_MESSAGES.errorGeneric,
        'jarvis'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [conversationId, isProcessing, addMessage, api]);

  const sendVoiceMessage = useCallback(async (audioBlob: Blob) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      
      // Add user message
      addMessage('🎤 Voice message recorded', 'user');

      // Send to n8n webhook for processing
      const response = await api.sendVoiceMessage(audioBlob, conversationId);
      
      // Add JARVIS response with audio
      const jarvisMessage = addMessage(response.text || 'Voice message processed', 'jarvis', response.audioUrl);
      
      // Auto-play audio response from n8n (Eleven Labs voice)
      if (response.audioUrl) {
        try {
          // Handle base64 audio from n8n
          if (response.audioUrl.startsWith('data:audio/')) {
            // Convert base64 to blob and play
            const audioPromise = fetch(response.audioUrl)
              .then(res => res.blob())
              .then(blob => {
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audio.volume = 0.8;
                
                // Clean up function
                const cleanup = () => {
                  URL.revokeObjectURL(url);
                  audio.removeEventListener('ended', cleanup);
                  audio.removeEventListener('error', cleanup);
                };
                
                audio.addEventListener('ended', cleanup);
                audio.addEventListener('error', cleanup);
                
                return audio.play().catch(err => {
                  Logger.warn('Audio playback failed', err);
                  cleanup();
                });
              })
              .catch(err => {
                Logger.warn('Failed to fetch audio:', err);
              });
              
            // Don't await - let it play in background
            audioPromise.catch(() => {}); // Silent catch
          } else {
            // Regular URL
            await playAudioSafely(response.audioUrl);
          }
        } catch (audioError) {
          Logger.warn('Audio playback failed', audioError);
          // Don't throw - text response is still valid
        }
      }

      return jarvisMessage;
    } catch (error: any) {
      Logger.error('Error sending voice message', error);
      setError(error.message);
      
      // Add error message
      addMessage(
        error.message || UI_MESSAGES.errorGeneric,
        'jarvis'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, addMessage, api, conversationId]);

  const clearMessages = useCallback(() => {
    setMessages([{
      id: generateId(),
      text: UI_MESSAGES.welcome,
      sender: 'jarvis',
      timestamp: new Date(),
    }]);
    setError(null);
  }, []);

  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMessage) {
      await sendTextMessage(lastUserMessage.text);
    }
  }, [messages, sendTextMessage]);

  return {
    messages,
    isProcessing,
    error,
    conversationId,
    sendTextMessage,
    sendVoiceMessage,
    clearMessages,
    retryLastMessage,
  };
};
