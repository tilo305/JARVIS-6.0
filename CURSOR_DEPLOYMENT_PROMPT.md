# Cursor AI Deployment Prompt

Copy and paste this entire prompt into Cursor AI to deploy your JARVIS Voice Assistant:

---

## Deploy JARVIS Voice Assistant

I need to deploy a JARVIS (Iron Man) voice assistant with the following specifications:

### Project Overview
- React/TypeScript frontend with voice and text chat capabilities
- n8n backend workflow for AI processing
- ElevenLabs for voice synthesis
- OpenAI GPT-4 for intelligent responses

### Backend Setup (n8n)
My n8n instance is at: https://n8n.hempstarai.com
Webhook ID: 15765e0d-84ab-44d4-88de-3ad51761f52d

Please:
1. Help me import the n8n workflow from `n8n-production-workflow.json`
2. Configure OpenAI and ElevenLabs credentials
3. Set up the three webhooks (chat, voice, health)
4. Ensure CORS is properly configured

### Frontend Deployment
Deploy the React app with:
1. Voice recording using Web Audio API
2. Text chat interface
3. Iron Man/JARVIS themed UI
4. Integration with n8n webhooks

### Environment Configuration
```env
REACT_APP_N8N_WEBHOOK_URL=https://n8n.hempstarai.com/webhook/15765e0d-84ab-44d4-88de-3ad51761f52d
REACT_APP_DEBUG=false
```

### Deployment Steps Needed:
1. Set up the frontend on Vercel/Netlify
2. Configure environment variables
3. Test voice recording functionality
4. Verify n8n webhook connectivity
5. Ensure audio playback works
6. Test end-to-end flow

### Testing Requirements:
- Voice input should transcribe correctly
- AI responses should be in JARVIS character
- Voice synthesis should work with British accent
- UI should be responsive and themed
- Error handling for microphone permissions

### Key Files to Deploy:
- `/src/` - All React components and hooks
- `/src/styles/jarvis-theme.css` - Custom themed styles
- `package.json` - Dependencies
- `.env.production` - Environment variables
- `n8n-production-workflow.json` - n8n workflow

### Success Criteria:
1. User can speak to JARVIS and get voice response
2. User can type messages and get responses
3. Audio playback works automatically
4. UI shows Iron Man theme with animations
5. System handles errors gracefully

Please help me:
1. Deploy the frontend to production
2. Configure all necessary services
3. Test the complete flow
4. Fix any issues that arise
5. Optimize for performance

The complete codebase is ready in the current directory. All components, styles, and configuration files are prepared. I need assistance with the actual deployment and testing process.

---

## Quick Command Reference

### Local Development:
```bash
npm install
npm start
```

### Build for Production:
```bash
npm run build
```

### Deploy to Vercel:
```bash
vercel --prod
```

### Test Webhooks:
```bash
# Health check
curl https://n8n.hempstarai.com/webhook/15765e0d-84ab-44d4-88de-3ad51761f52d/health

# Text message
curl -X POST https://n8n.hempstarai.com/webhook/15765e0d-84ab-44d4-88de-3ad51761f52d/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello JARVIS"}'
```

### Required API Keys:
- OpenAI API Key (GPT-4 access)
- ElevenLabs API Key
- ElevenLabs Voice ID (for JARVIS voice)

---

End of prompt. This should give Cursor AI everything needed to deploy the application.