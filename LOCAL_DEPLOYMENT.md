# JARVIS Voice Assistant - Local Deployment Guide

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)
```bash
# Windows
deploy-local.bat

# PowerShell
.\deploy-local.ps1
```

### Option 2: Manual Deployment
```bash
npm install
npm start
```

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)
- **Microphone access** (for voice features)

## 🔧 Environment Configuration

The application is pre-configured with your n8n webhook endpoints:

```env
# n8n Webhook URLs
REACT_APP_N8N_VOICE_WEBHOOK_URL=https://n8n.hempstarai.com/webhook/jarvis-voice
REACT_APP_N8N_TEXT_WEBHOOK_URL=https://n8n.hempstarai.com/webhook/jarvis-text

# Development Settings
REACT_APP_DEBUG=true
NODE_ENV=development
PORT=3000
```

## 🎯 Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

### 3. Test Functionality

#### Voice Chat Test
1. Click the microphone button
2. Allow microphone permissions when prompted
3. Speak a message (e.g., "Hello JARVIS")
4. Release to send
5. Wait for JARVIS response

#### Text Chat Test
1. Type a message in the text input
2. Press Enter or click Send
3. Wait for JARVIS response

## 🔗 n8n Workflow Setup

### Import Workflow
1. Open your n8n instance: `https://n8n.hempstarai.com`
2. Import the `n8n-production-workflow.json` file
3. Configure your API credentials:
   - **OpenAI API Key** (for GPT-4)
   - **ElevenLabs API Key** (for voice synthesis)
   - **ElevenLabs Voice ID** (for JARVIS voice)

### Webhook Endpoints
The workflow creates these endpoints:
- **Voice Processing**: `/webhook/jarvis-voice`
- **Text Processing**: `/webhook/jarvis-text`
- **Health Check**: `/webhook/jarvis-health`

### CORS Configuration
The workflow is pre-configured with CORS headers for local development:
```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 🧪 Testing

### Health Check
```bash
curl -X GET "https://n8n.hempstarai.com/webhook/jarvis-health"
```

### Text Message Test
```bash
curl -X POST "https://n8n.hempstarai.com/webhook/jarvis-text" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"message": "Hello JARVIS", "conversationId": "test-123"}'
```

### Voice Message Test
```bash
curl -X POST "https://n8n.hempstarai.com/webhook/jarvis-voice" \
  -H "Content-Type: multipart/form-data" \
  -H "Origin: http://localhost:3000" \
  -F "audio=@test-audio.webm" \
  -F "conversationId=test-123"
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Microphone Permission Denied
- **Solution**: Click the microphone icon in the browser address bar
- **Alternative**: Refresh the page and try again

#### 2. CORS Errors
- **Check**: Ensure n8n workflow has CORS enabled
- **Verify**: Webhook URLs are correct in `.env.local`

#### 3. Audio Not Playing
- **Check**: Browser audio permissions
- **Verify**: Audio format support (WebM/MP3)

#### 4. Webhook Connection Failed
- **Check**: n8n instance is running
- **Verify**: API credentials are configured
- **Test**: Use curl commands above

### Debug Mode
Enable debug logging by setting `REACT_APP_DEBUG=true` in `.env.local`

## 📱 Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

## 🔒 Security Notes

- **Local Development**: CORS is set to `*` for development
- **Production**: Restrict CORS to specific domains
- **API Keys**: Never commit API keys to version control
- **HTTPS**: Use HTTPS in production

## 🚀 Production Deployment

When ready for production:

```bash
# Build production version
npm run build

# Serve static files
npx serve -s build -l 3000

# Or use any web server (nginx, Apache, etc.)
```

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify n8n workflow execution logs
3. Test webhook endpoints with curl
4. Ensure all environment variables are set

## 🎉 Success Criteria

Your deployment is successful when:

✅ JARVIS responds to voice input via jarvis-voice webhook  
✅ JARVIS responds to text input via jarvis-text webhook  
✅ Audio playback works automatically  
✅ UI shows Iron Man theme with animations  
✅ Error handling works gracefully  
✅ Local development server runs on localhost:3000  

---

**Happy coding with JARVIS! 🎭✨**
