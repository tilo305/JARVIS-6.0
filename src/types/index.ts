export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'jarvis';
  timestamp: Date;
  audioUrl?: string;
  isError?: boolean;
}

export interface ChatResponse {
  text: string;
  audioUrl?: string;
  conversationId: string;
  timestamp: string;
}

export interface VoiceResponse extends ChatResponse {
  transcription: string;
}

export interface WebhookResponse {
  success: boolean;
  data?: ChatResponse | VoiceResponse;
  error?: string;
}