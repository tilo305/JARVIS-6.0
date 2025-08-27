# JARVIS Voice Assistant - Iron Man AI

A sophisticated voice and text-enabled AI assistant inspired by JARVIS from Iron Man, featuring real-time voice interactions powered by ElevenLabs and intelligent responses via n8n workflow automation.

![JARVIS Interface](https://img.shields.io/badge/Status-Active-00d4ff)
![License](https://img.shields.io/badge/License-MIT-ffa500)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

## 🎯 Project Overview

- **Name**: JARVIS Voice Assistant
- **Goal**: Create an immersive Iron Man-themed AI assistant with voice capabilities
- **Features**:
  - 🎤 Voice input with push-to-talk recording
  - 💬 Text chat interface
  - 🔊 ElevenLabs custom voice synthesis
  - 🧠 AI-powered contextual responses
  - 🎨 Iron Man/JARVIS themed UI with Arc Reactor animations
  - 🔄 Real-time bidirectional communication
  - 📊 System status monitoring

## 🌐 URLs & Endpoints

### Frontend
- **Local Development**: http://localhost:3000
- **Production**: https://your-domain.com

### n8n Webhook Endpoints
- **Text Chat**: `POST /webhook/chat`
- **Voice Chat**: `POST /webhook/voice`
- **Health Check**: `GET /webhook/health`

## 🏗️ Architecture

### Data Flow
```
User Input (Voice/Text) → Frontend → n8n Webhook → AI Processing → ElevenLabs TTS → Response → Frontend
```

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: n8n Workflow Automation
- **AI Services**: OpenAI GPT-4 / Anthropic Claude
- **Voice Synthesis**: ElevenLabs API
- **Audio Processing**: Web Audio API

## 📋 Prerequisites

1. **n8n Instance** (Cloud or Self-hosted)
2. **ElevenLabs Account** with API key and custom voice
3. **OpenAI API Key** (GPT-4 access)
4. **Node.js 16+** and npm
5. **Modern browser** with microphone access

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/jarvis-voice-assistant.git
cd jarvis-voice-assistant
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your n8n webhook URL
REACT_APP_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook

# Start development server
npm start
```

### 3. n8n Workflow Setup

1. **Import Workflow**:
   - Open n8n dashboard
   - Create new workflow
   - Import `n8n-workflow.json`

2. **Configure Credentials**:
   - **OpenAI**: Add your API key
   - **ElevenLabs**: Add your API key and Voice ID

3. **Activate Workflow**:
   - Save workflow
   - Toggle to "Active"
   - Note webhook URLs

### 4. ElevenLabs Voice Setup

1. **Create Custom Voice**:
   - Go to ElevenLabs Voice Lab
   - Clone or design a British-accented voice
   - Note the Voice ID

2. **Update n8n Workflow**:
   - Replace `{{ELEVENLABS_VOICE_ID}}` with your Voice ID

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
REACT_APP_N8N_WEBHOOK_URL=https://your-n8n.com/webhook
REACT_APP_DEBUG=false
```

#### n8n Credentials
- OpenAI API Key
- ElevenLabs API Key
- ElevenLabs Voice ID

### CORS Configuration
Ensure n8n webhooks allow your frontend domain:
```json
{
  "cors": {
    "allowedOrigins": ["http://localhost:3000", "https://your-domain.com"]
  }
}
```

## 📱 User Guide

### Voice Interaction
1. **Grant microphone permission** when prompted
2. **Hold the microphone button** to record
3. **Release to send** voice message
4. **Listen to JARVIS response** with custom voice

### Text Interaction
1. **Type message** in input field
2. **Press Enter** or click Send
3. **View response** in chat window
4. **Click audio icon** to replay voice

### Features
- **Clear History**: Remove all messages
- **System Status**: Monitor connection and processing
- **Audio Replay**: Click on any voice message to replay

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Testing
```bash
# Test webhook endpoints
curl -X POST https://your-n8n.com/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello JARVIS", "conversationId": "test123"}'

# Test health endpoint
curl https://your-n8n.com/webhook/health
```

### Debug Mode
Enable debug logging:
```env
REACT_APP_DEBUG=true
```

## 🚢 Deployment

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### n8n Deployment Options

#### Option A: n8n Cloud
1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Import workflow
3. Configure credentials
4. Activate

#### Option B: Self-Hosted (Docker)
```bash
# Use provided docker-compose.yml
docker-compose up -d
```

### Production Checklist
- [ ] Configure production environment variables
- [ ] Set up SSL certificates
- [ ] Configure rate limiting
- [ ] Enable error tracking (Sentry)
- [ ] Set up monitoring
- [ ] Test all endpoints
- [ ] Verify CORS settings

## 🐛 Troubleshooting

### Common Issues

#### 1. Microphone Not Working
- Check browser permissions
- Ensure HTTPS connection
- Try different browser

#### 2. No Response from JARVIS
- Verify n8n workflow is active
- Check webhook URLs in .env
- Inspect browser console
- Test health endpoint

#### 3. Voice Not Playing
- Check browser autoplay policy
- Ensure ElevenLabs API key is valid
- Verify Voice ID is correct

#### 4. CORS Errors
- Update n8n webhook CORS settings
- Check allowed origins
- Use proxy in development

## 📊 Performance Optimization

- **Audio Compression**: Use Opus codec for better performance
- **Response Caching**: Cache frequent responses
- **Lazy Loading**: Load components on demand
- **CDN**: Serve static assets via CDN
- **Rate Limiting**: Implement client-side throttling

## 🔒 Security Considerations

- **API Keys**: Never expose keys in frontend
- **Input Sanitization**: Clean all user inputs
- **Rate Limiting**: 60 requests/minute per user
- **HTTPS Only**: Enforce SSL in production
- **Content Security Policy**: Configure CSP headers

## 📈 Monitoring & Analytics

### Metrics to Track
- Response time (target < 3s)
- Voice recognition accuracy
- User engagement duration
- Error rates
- API usage costs

### Recommended Tools
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics / Mixpanel
- **Uptime**: UptimeRobot
- **Performance**: Lighthouse

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- ElevenLabs for voice synthesis
- n8n for workflow automation
- Marvel/Disney for JARVIS inspiration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/jarvis-voice-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/jarvis-voice-assistant/discussions)
- **Email**: support@your-domain.com

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic voice/text interaction
- ✅ ElevenLabs integration
- ✅ JARVIS personality

### Phase 2 (Planned)
- [ ] Multi-language support
- [ ] Voice commands
- [ ] Conversation memory
- [ ] User preferences

### Phase 3 (Future)
- [ ] Smart home integration
- [ ] Calendar management
- [ ] Email/notification handling
- [ ] Custom wake word detection

---

**Built with ❤️ by [Your Name]** | Inspired by Tony Stark's JARVIS