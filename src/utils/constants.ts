// n8n Webhook URLs for local development
export const N8N_VOICE_WEBHOOK_URL = process.env.REACT_APP_N8N_VOICE_WEBHOOK_URL || 'https://n8n.hempstarai.com/webhook/jarvis-voice';
export const N8N_TEXT_WEBHOOK_URL = process.env.REACT_APP_N8N_TEXT_WEBHOOK_URL || 'https://n8n.hempstarai.com/webhook/jarvis-text';
export const DEBUG_MODE = process.env.REACT_APP_DEBUG === 'true';

// Legacy support (keeping for backward compatibility)
export const API_BASE_URL = N8N_TEXT_WEBHOOK_URL;
export const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5678/ws';

export const AUDIO_CONFIG = {
  mimeType: 'audio/webm;codecs=opus',
  sampleRate: 44100,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export const LIMITS = {
  maxMessageLength: 500,
  maxAudioDuration: 30000, // 30 seconds
  maxFileSize: 10 * 1024 * 1024, // 10MB
  rateLimit: 60, // requests per minute
};

export const UI_MESSAGES = {
  microphonePermissionDenied: 'Please enable microphone access to use voice features.',
  recordingInProgress: 'Recording... Release to send',
  processing: 'Processing your request...',
  errorGeneric: 'I apologize, sir. I seem to be experiencing technical difficulties.',
  welcome: 'Good day, sir. How may I assist you today?',
};