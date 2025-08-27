# Implementation Document
## JARVIS AI Voice Assistant - Technical Implementation Guide

### Table of Contents
1. [System Architecture](#system-architecture)
2. [Frontend Implementation](#frontend-implementation)
3. [n8n Workflow Implementation](#n8n-workflow-implementation)
4. [API Integration](#api-integration)
5. [Testing Strategy](#testing-strategy)
6. [Deployment Guide](#deployment-guide)
7. [Debugging Guide](#debugging-guide)

---

## 1. System Architecture

### 1.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Voice Input │  │ Text Input   │  │ Audio Player │      │
│  └──────┬──────┘  └──────┬───────┘  └──────▲───────┘      │
│         │                 │                  │               │
│  ┌──────▼─────────────────▼──────────────────┴───────┐     │
│  │              API Service Layer                     │     │
│  └──────────────────────┬─────────────────────────────┘     │
└─────────────────────────┼─────────────────────────────────┘
                          │ HTTPS/WebSocket
┌─────────────────────────▼─────────────────────────────────┐
│                    n8n Workflow Engine                      │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Webhook   │→ │ AI Processing │→ │  ElevenLabs  │      │
│  └────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack
- **Frontend**: React 18+, TypeScript, Tailwind CSS
- **Audio Processing**: Web Audio API, MediaRecorder API
- **Backend**: n8n (self-hosted or cloud)
- **AI Services**: OpenAI GPT-4 or Anthropic Claude
- **Voice Services**: ElevenLabs API
- **Deployment**: Vercel/Netlify (Frontend), n8n Cloud/Self-hosted

---

## 2. Frontend Implementation

### 2.1 Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatInterface.tsx
│   │   ├── VoiceRecorder.tsx
│   │   ├── MessageList.tsx
│   │   ├── AudioPlayer.tsx
│   │   └── LoadingIndicator.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── audioProcessor.ts
│   │   └── websocket.ts
│   ├── hooks/
│   │   ├── useVoiceRecording.ts
│   │   ├── useChat.ts
│   │   └── useAudioPlayback.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── jarvis-theme.css
│   ├── App.tsx
│   └── index.tsx
├── public/
├── package.json
└── tsconfig.json
```

### 2.2 Core Components Implementation

#### 2.2.1 Voice Recorder Component
```typescript
// src/components/VoiceRecorder.tsx
import React, { useState, useRef } from 'react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';

export const VoiceRecorder: React.FC = () => {
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    audioBlob 
  } = useVoiceRecording();

  const handleRecordingToggle = async () => {
    if (isRecording) {
      const blob = await stopRecording();
      // Send blob to API
    } else {
      startRecording();
    }
  };

  return (
    <button
      onMouseDown={startRecording}
      onMouseUp={handleRecordingToggle}
      onTouchStart={startRecording}
      onTouchEnd={handleRecordingToggle}
      className={`recording-button ${isRecording ? 'active' : ''}`}
    >
      <span className="arc-reactor-core" />
      {isRecording ? 'Recording...' : 'Hold to Talk'}
    </button>
  );
};
```

#### 2.2.2 Audio Processing Hook
```typescript
// src/hooks/useVoiceRecording.ts
import { useState, useRef, useCallback } from 'react';

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) {
        resolve(new Blob());
        return;
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { 
          type: 'audio/webm' 
        });
        
        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        setIsRecording(false);
        resolve(audioBlob);
      };

      mediaRecorder.stop();
    });
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording
  };
};
```

#### 2.2.3 API Service Layer
```typescript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';

export class JarvisAPI {
  private static instance: JarvisAPI;
  
  static getInstance(): JarvisAPI {
    if (!JarvisAPI.instance) {
      JarvisAPI.instance = new JarvisAPI();
    }
    return JarvisAPI.instance;
  }

  async sendTextMessage(message: string, conversationId?: string) {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message,
        conversationId,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  }

  async sendVoiceMessage(audioBlob: Blob, conversationId?: string) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('conversationId', conversationId || '');
      formData.append('timestamp', new Date().toISOString());

      const response = await axios.post(`${API_BASE_URL}/voice`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'json'
      });

      return response.data;
    } catch (error) {
      console.error('Error sending voice message:', error);
      throw error;
    }
  }

  async getAudioStream(text: string): Promise<ArrayBuffer> {
    try {
      const response = await axios.post(`${API_BASE_URL}/tts`, {
        text,
        voice: 'jarvis'
      }, {
        responseType: 'arraybuffer'
      });

      return response.data;
    } catch (error) {
      console.error('Error getting audio stream:', error);
      throw error;
    }
  }
}
```

### 2.3 Main App Component
```typescript
// src/App.tsx
import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { VoiceRecorder } from './components/VoiceRecorder';
import { AudioPlayer } from './components/AudioPlayer';
import { JarvisAPI } from './services/api';
import './styles/jarvis-theme.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'jarvis';
  timestamp: Date;
  audioUrl?: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationId] = useState(() => 
    `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  
  const api = JarvisAPI.getInstance();

  const handleTextMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = await api.sendTextMessage(text, conversationId);
      
      // Add JARVIS response
      const jarvisMessage: Message = {
        id: `msg_${Date.now()}_jarvis`,
        text: response.text,
        sender: 'jarvis',
        timestamp: new Date(),
        audioUrl: response.audioUrl
      };
      
      setMessages(prev => [...prev, jarvisMessage]);
      
      // Auto-play audio if available
      if (response.audioUrl) {
        playAudio(response.audioUrl);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      // Add error message
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        text: 'I apologize, sir. I seem to be experiencing technical difficulties.',
        sender: 'jarvis',
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      const response = await api.sendVoiceMessage(audioBlob, conversationId);
      
      // Add user's transcribed message
      if (response.transcription) {
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}_user`,
          text: response.transcription,
          sender: 'user',
          timestamp: new Date()
        }]);
      }
      
      // Add JARVIS response
      const jarvisMessage: Message = {
        id: `msg_${Date.now()}_jarvis`,
        text: response.text,
        sender: 'jarvis',
        timestamp: new Date(),
        audioUrl: response.audioUrl
      };
      
      setMessages(prev => [...prev, jarvisMessage]);
      
      // Auto-play audio response
      if (response.audioUrl) {
        playAudio(response.audioUrl);
      }
    } catch (error) {
      console.error('Error processing voice message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(console.error);
  };

  return (
    <div className="jarvis-app">
      <div className="jarvis-container">
        <header className="jarvis-header">
          <div className="arc-reactor-animation">
            <div className="reactor-core"></div>
            <div className="reactor-ring"></div>
          </div>
          <h1>J.A.R.V.I.S.</h1>
          <p>Just A Rather Very Intelligent System</p>
        </header>

        <ChatInterface 
          messages={messages}
          onSendMessage={handleTextMessage}
          isProcessing={isProcessing}
        />

        <VoiceRecorder 
          onRecordingComplete={handleVoiceMessage}
          isProcessing={isProcessing}
        />

        {messages[messages.length - 1]?.audioUrl && (
          <AudioPlayer 
            src={messages[messages.length - 1].audioUrl!}
          />
        )}
      </div>
    </div>
  );
}

export default App;
```

---

## 3. n8n Workflow Implementation

### 3.1 Complete n8n Workflow JSON
```json
{
  "name": "JARVIS Voice Assistant Workflow",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "chat",
        "responseMode": "responseNode",
        "options": {
          "cors": {
            "allowedOrigins": "*"
          }
        }
      },
      "name": "Text Chat Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "webhookId": "chat-webhook",
      "typeVersion": 1
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "voice",
        "responseMode": "responseNode",
        "options": {
          "cors": {
            "allowedOrigins": "*"
          },
          "binaryData": true
        }
      },
      "name": "Voice Chat Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 500],
      "webhookId": "voice-webhook",
      "typeVersion": 1
    },
    {
      "parameters": {
        "resource": "audio",
        "operation": "transcribe",
        "binaryPropertyName": "audio"
      },
      "name": "Transcribe Audio",
      "type": "n8n-nodes-base.openAi",
      "position": [450, 500],
      "typeVersion": 1,
      "credentials": {
        "openAiApi": {
          "id": "1",
          "name": "OpenAI API"
        }
      }
    },
    {
      "parameters": {
        "mode": "chat",
        "model": "gpt-4",
        "messages": {
          "values": [
            {
              "role": "system",
              "content": "You are JARVIS, Tony Stark's AI assistant. Respond in character with British sophistication, technical expertise, and subtle wit. Address the user as 'Sir' or 'Miss' appropriately. Keep responses concise but helpful."
            },
            {
              "role": "user",
              "content": "={{$json[\"message\"] || $json[\"transcription\"]}}"
            }
          ]
        },
        "options": {
          "temperature": 0.7,
          "maxTokens": 500
        }
      },
      "name": "Generate AI Response",
      "type": "n8n-nodes-base.openAi",
      "position": [650, 400],
      "typeVersion": 1,
      "credentials": {
        "openAiApi": {
          "id": "1",
          "name": "OpenAI API"
        }
      }
    },
    {
      "parameters": {
        "operation": "textToSpeech",
        "text": "={{$json[\"message\"][\"content\"]}}",
        "voiceId": "YOUR_ELEVENLABS_VOICE_ID",
        "modelId": "eleven_monolingual_v1",
        "voiceSettings": {
          "stability": 0.75,
          "similarityBoost": 0.75
        }
      },
      "name": "Generate Voice",
      "type": "n8n-nodes-community.elevenlabs",
      "position": [850, 400],
      "typeVersion": 1,
      "credentials": {
        "elevenLabsApi": {
          "id": "2",
          "name": "ElevenLabs API"
        }
      }
    },
    {
      "parameters": {
        "mode": "passThrough",
        "output": "data",
        "propertyName": "data"
      },
      "name": "Prepare Response",
      "type": "n8n-nodes-base.set",
      "position": [1050, 400],
      "typeVersion": 1
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "text",
              "value": "={{$node[\"Generate AI Response\"].json[\"message\"][\"content\"]}}"
            },
            {
              "name": "audioUrl",
              "value": "={{$node[\"Generate Voice\"].json[\"audioUrl\"]}}"
            },
            {
              "name": "conversationId",
              "value": "={{$node[\"Text Chat Webhook\"].json[\"conversationId\"] || $node[\"Voice Chat Webhook\"].json[\"conversationId\"]}}"
            }
          ]
        }
      },
      "name": "Format Response",
      "type": "n8n-nodes-base.set",
      "position": [1250, 400],
      "typeVersion": 2
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{JSON.stringify($json)}}",
        "options": {
          "responseHeaders": {
            "values": [
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          }
        }
      },
      "name": "Send Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1450, 400],
      "typeVersion": 1
    }
  ],
  "connections": {
    "Text Chat Webhook": {
      "main": [
        [
          {
            "node": "Generate AI Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Voice Chat Webhook": {
      "main": [
        [
          {
            "node": "Transcribe Audio",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Transcribe Audio": {
      "main": [
        [
          {
            "node": "Generate AI Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Generate AI Response": {
      "main": [
        [
          {
            "node": "Generate Voice",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Generate Voice": {
      "main": [
        [
          {
            "node": "Format Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Format Response": {
      "main": [
        [
          {
            "node": "Send Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1"
  }
}
```

### 3.2 n8n Workflow Setup Instructions

1. **Import Workflow**:
   - Open n8n dashboard
   - Click "New Workflow"
   - Click menu → "Import from JSON"
   - Paste the workflow JSON above

2. **Configure Credentials**:
   - **OpenAI API**:
     - Click on any OpenAI node
     - Add credentials → Create New
     - Enter your OpenAI API key
   
   - **ElevenLabs API**:
     - Click on ElevenLabs node
     - Add credentials → Create New
     - Enter your ElevenLabs API key
     - Update the `voiceId` with your custom voice ID

3. **Webhook URLs**:
   - After saving the workflow, get the webhook URLs:
     - Text: `https://your-n8n-instance.com/webhook/chat`
     - Voice: `https://your-n8n-instance.com/webhook/voice`

4. **Activate Workflow**:
   - Toggle the workflow to "Active"
   - Test using the webhook test feature

---

## 4. API Integration

### 4.1 Environment Variables
```env
# Frontend .env
REACT_APP_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
REACT_APP_WS_URL=wss://your-n8n-instance.com/ws

# n8n .env
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=your_custom_voice_id
```

### 4.2 CORS Configuration
Add to n8n webhook nodes:
```json
{
  "options": {
    "cors": {
      "allowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
      "allowedMethods": ["POST", "OPTIONS"],
      "allowedHeaders": ["Content-Type", "Authorization"]
    }
  }
}
```

---

## 5. Testing Strategy

### 5.1 Unit Tests
```typescript
// src/__tests__/VoiceRecorder.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { VoiceRecorder } from '../components/VoiceRecorder';

describe('VoiceRecorder', () => {
  it('should start recording on button press', async () => {
    const { getByRole } = render(<VoiceRecorder />);
    const button = getByRole('button');
    
    fireEvent.mouseDown(button);
    
    await waitFor(() => {
      expect(button).toHaveClass('active');
    });
  });
  
  it('should stop recording on button release', async () => {
    const onComplete = jest.fn();
    const { getByRole } = render(
      <VoiceRecorder onRecordingComplete={onComplete} />
    );
    const button = getByRole('button');
    
    fireEvent.mouseDown(button);
    await waitFor(() => expect(button).toHaveClass('active'));
    
    fireEvent.mouseUp(button);
    await waitFor(() => {
      expect(button).not.toHaveClass('active');
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
```

### 5.2 Integration Tests
```typescript
// src/__tests__/api.integration.test.ts
import { JarvisAPI } from '../services/api';

describe('JarvisAPI Integration', () => {
  const api = JarvisAPI.getInstance();
  
  it('should send text message and receive response', async () => {
    const response = await api.sendTextMessage('Hello JARVIS');
    
    expect(response).toHaveProperty('text');
    expect(response).toHaveProperty('audioUrl');
    expect(response.text).toBeTruthy();
  });
  
  it('should handle voice message', async () => {
    const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });
    const response = await api.sendVoiceMessage(audioBlob);
    
    expect(response).toHaveProperty('transcription');
    expect(response).toHaveProperty('text');
    expect(response).toHaveProperty('audioUrl');
  });
});
```

### 5.3 E2E Tests
```typescript
// cypress/e2e/jarvis.cy.ts
describe('JARVIS Voice Assistant E2E', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  
  it('should send text message and display response', () => {
    cy.get('[data-testid="message-input"]').type('Hello JARVIS');
    cy.get('[data-testid="send-button"]').click();
    
    cy.get('[data-testid="message-list"]')
      .should('contain', 'Hello JARVIS')
      .and('contain', 'Good day, sir');
  });
  
  it('should handle voice recording', () => {
    cy.get('[data-testid="voice-button"]').trigger('mousedown');
    cy.wait(2000);
    cy.get('[data-testid="voice-button"]').trigger('mouseup');
    
    cy.get('[data-testid="processing-indicator"]').should('be.visible');
    cy.get('[data-testid="message-list"]', { timeout: 10000 })
      .should('contain', 'jarvis');
  });
});
```

---

## 6. Deployment Guide

### 6.1 Frontend Deployment (Vercel)

1. **Prepare for deployment**:
```bash
npm run build
npm run test
```

2. **Deploy to Vercel**:
```bash
npm install -g vercel
vercel --prod
```

3. **Environment variables**:
   - Add in Vercel dashboard:
     - `REACT_APP_N8N_WEBHOOK_URL`
     - `REACT_APP_WS_URL`

### 6.2 n8n Deployment Options

#### Option A: n8n Cloud (Recommended)
1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Import workflow JSON
3. Configure credentials
4. Activate workflow

#### Option B: Self-Hosted (Docker)
```yaml
# docker-compose.yml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=secure_password
      - N8N_HOST=your-domain.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://your-domain.com/
    volumes:
      - n8n_data:/home/node/.n8n
      - ./local-files:/files

volumes:
  n8n_data:
```

Run:
```bash
docker-compose up -d
```

### 6.3 SSL/HTTPS Configuration
```nginx
# nginx.conf
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 7. Debugging Guide

### 7.1 Common Issues and Solutions

#### Issue 1: Microphone Permission Denied
**Solution**:
```javascript
// Add permission check
async function checkMicrophonePermission() {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' });
    if (result.state === 'denied') {
      alert('Please enable microphone access in your browser settings');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Permission API not supported');
    return true; // Proceed anyway
  }
}
```

#### Issue 2: CORS Errors
**Solution**:
- Check n8n webhook CORS settings
- Ensure frontend URL is in allowed origins
- Use proxy in development:
```json
// package.json
"proxy": "http://localhost:5678"
```

#### Issue 3: Audio Playback Issues
**Solution**:
```javascript
// Handle autoplay policy
async function playAudioSafely(url) {
  const audio = new Audio(url);
  try {
    await audio.play();
  } catch (error) {
    // Show play button if autoplay blocked
    console.log('Autoplay blocked, showing manual play button');
    showPlayButton(audio);
  }
}
```

### 7.2 Debug Logging
```typescript
// src/utils/logger.ts
export class Logger {
  static debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  }
  
  static error(message: string, error: any) {
    console.error(`[ERROR] ${message}`, error);
    // Send to error tracking service
  }
  
  static info(message: string, data?: any) {
    console.info(`[INFO] ${message}`, data);
  }
}
```

### 7.3 n8n Workflow Debugging

1. **Enable Debug Mode**:
   - Set environment variable: `N8N_LOG_LEVEL=debug`
   - View execution logs in n8n UI

2. **Test Webhooks**:
```bash
# Test text endpoint
curl -X POST https://your-n8n.com/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message", "conversationId": "test123"}'

# Test voice endpoint
curl -X POST https://your-n8n.com/webhook/voice \
  -F "audio=@test-audio.webm" \
  -F "conversationId=test123"
```

3. **Monitor Executions**:
   - Check n8n dashboard → Executions
   - View input/output of each node
   - Check error details

### 7.4 Performance Monitoring
```javascript
// Add performance monitoring
const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start}ms`);
  return result;
};

// Usage
measurePerformance('API Call', () => api.sendMessage(text));
```

### 7.5 Browser DevTools
- **Network Tab**: Monitor API calls and responses
- **Console**: Check for JavaScript errors
- **Application Tab**: Inspect localStorage/sessionStorage
- **Performance Tab**: Profile app performance

---

## 8. Security Considerations

### 8.1 API Security
```typescript
// Implement rate limiting
const rateLimiter = new Map();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimits = rateLimiter.get(userId) || [];
  
  // Remove old entries (older than 1 minute)
  const recentRequests = userLimits.filter(
    time => now - time < 60000
  );
  
  if (recentRequests.length >= 60) {
    return false; // Limit exceeded
  }
  
  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
  return true;
}
```

### 8.2 Input Sanitization
```typescript
function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
    .slice(0, 500); // Limit length
}
```

### 8.3 Secure Storage
```typescript
// Use sessionStorage for sensitive data
class SecureStorage {
  static setItem(key: string, value: any) {
    const encrypted = btoa(JSON.stringify(value));
    sessionStorage.setItem(key, encrypted);
  }
  
  static getItem(key: string) {
    const encrypted = sessionStorage.getItem(key);
    if (!encrypted) return null;
    
    try {
      return JSON.parse(atob(encrypted));
    } catch {
      return null;
    }
  }
}
```

---

## 9. Optimization Tips

### 9.1 Audio Optimization
- Use Opus codec for better compression
- Implement audio buffering for smooth playback
- Cache frequently used audio responses

### 9.2 Performance Optimization
- Lazy load components
- Implement virtual scrolling for message list
- Use React.memo for expensive components
- Debounce user input

### 9.3 Network Optimization
- Implement request batching
- Use WebSocket for real-time updates
- Cache API responses
- Implement offline support with service workers

---

## 10. Maintenance and Monitoring

### 10.1 Health Checks
```typescript
// Implement health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      n8n: checkN8nHealth(),
      elevenlabs: checkElevenLabsHealth(),
      openai: checkOpenAIHealth()
    }
  });
});
```

### 10.2 Error Tracking
- Integrate Sentry or similar service
- Log errors with context
- Set up alerts for critical errors

### 10.3 Analytics
- Track user interactions
- Monitor response times
- Analyze usage patterns
- A/B test different responses

---

This implementation guide provides a complete technical blueprint for building the JARVIS voice assistant. Follow the sections sequentially for best results, and refer to the debugging section when encountering issues.