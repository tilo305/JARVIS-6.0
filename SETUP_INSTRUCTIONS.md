# JARVIS Voice Assistant - Complete Setup Instructions

## 🚀 Quick Setup Guide

### Step 1: Import n8n Workflow

1. **Open your n8n instance** at https://n8n.hempstarai.com
2. **Create a new workflow**
3. **Import the workflow**:
   - Click on the menu (three dots) in the top right
   - Select "Import from file" or "Import from JSON"
   - Copy the entire contents of `n8n-production-workflow.json`
   - Paste and import

### Step 2: Configure API Credentials

You need to set up two credentials in n8n:

#### A. OpenAI API Credential
1. In n8n, go to **Credentials** → **Create New**
2. Search for "OpenAI"
3. Add your OpenAI API key
4. Name it "OpenAI account"
5. Save

#### B. ElevenLabs API Credential
1. Go to **Credentials** → **Create New**
2. Choose "Header Auth"
3. Configure:
   - **Name**: "ElevenLabs API"
   - **Header Name**: `xi-api-key`
   - **Header Value**: Your ElevenLabs API key
4. Save

### Step 3: Configure ElevenLabs Voice

1. **Get your Voice ID from ElevenLabs**:
   - Log in to [ElevenLabs](https://elevenlabs.io)
   - Go to "Voices" or "Voice Lab"
   - Select or create your JARVIS voice
   - Copy the Voice ID

2. **Update the workflow**:
   - In the "Generate Voice" node
   - Replace `REPLACE_WITH_YOUR_VOICE_ID` with your actual Voice ID
   - Save the workflow

### Step 4: Link Credentials to Nodes

1. **For "Transcribe Audio" node**:
   - Click on the node
   - In Credentials, select your "OpenAI account"

2. **For "Generate AI Response" node**:
   - Click on the node
   - In Credentials, select your "OpenAI account"

3. **For "Generate Voice" node**:
   - Click on the node
   - In Credentials, select your "ElevenLabs API"

### Step 5: Activate the Workflow

1. **Save the workflow** (Ctrl+S or Cmd+S)
2. **Toggle the workflow to "Active"** using the switch in the top bar
3. **Test the webhooks** to ensure they're working

### Step 6: Frontend Configuration

Create a `.env` file in your frontend directory:

```env
# Production webhook URL
REACT_APP_N8N_WEBHOOK_URL=https://n8n.hempstarai.com/webhook/15765e0d-84ab-44d4-88de-3ad51761f52d

# Optional debug mode
REACT_APP_DEBUG=false
```

### Step 7: Test the Endpoints

Test your webhook endpoints to ensure everything is working:

```bash
# Test health endpoint
curl https://n8n.hempstarai.com/webhook/15765e0d-84ab-44d4-88de-3ad51761f52d/health

# Test chat endpoint
curl -X POST https://n8n.hempstarai.com/webhook/15765e0d-84ab-44d4-88de-3ad51761f52d/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello JARVIS", "conversationId": "test123"}'
```

## 📝 Important URLs

Your production webhook endpoints are:

- **Base URL**: `https://n8n.hempstarai.com/webhook/15765e0d-84ab-44d4-88de-3ad51761f52d`
- **Text Chat**: `POST https://n8n.hempstarai.com/webhook/15765e0d-84ab-44d4-88de-3ad51761f52d/chat`
- **Voice Chat**: `POST https://n8n.hempstarai.com/webhook/15765e0d-84ab-44d4-88de-3ad51761f52d/voice`
- **Health Check**: `GET https://n8n.hempstarai.com/webhook/15765e0d-84ab-44d4-88de-3ad51761f52d/health`

## 🎙️ ElevenLabs Voice Configuration

### Recommended Voice Settings for JARVIS:

1. **Voice Characteristics**:
   - Gender: Male
   - Age: Middle-aged
   - Accent: British
   - Tone: Professional, sophisticated

2. **Voice Settings** (in the workflow):
   - Stability: 0.75
   - Similarity Boost: 0.75
   - Style: 0.5
   - Speaker Boost: true

3. **Creating a Custom Voice**:
   - Go to ElevenLabs Voice Lab
   - Use "Instant Voice Cloning" or "Professional Voice Cloning"
   - Upload samples of a British-accented male voice
   - Fine-tune until it sounds like JARVIS

## 🔧 Troubleshooting

### Common Issues and Solutions:

#### 1. "Workflow not found" error
- Ensure the workflow is activated
- Check that the webhook ID matches: `15765e0d-84ab-44d4-88de-3ad51761f52d`

#### 2. "Authentication failed" for OpenAI
- Verify your OpenAI API key is valid
- Ensure you have GPT-4 access (or change model to gpt-3.5-turbo)

#### 3. "Voice generation failed"
- Check your ElevenLabs API key
- Verify you have available character quota
- Ensure Voice ID is correct

#### 4. CORS errors in browser
- The workflow already includes CORS headers
- If issues persist, check browser console for specific errors

#### 5. No audio playback
- Check browser autoplay policies
- Ensure ElevenLabs is returning audio data
- Verify audio format compatibility

## 🚀 Deployment Checklist

Before going live, ensure:

- [ ] n8n workflow is imported and active
- [ ] OpenAI credentials are configured
- [ ] ElevenLabs credentials are configured
- [ ] Voice ID is set correctly
- [ ] Frontend .env file has correct webhook URL
- [ ] Health endpoint returns 200 OK
- [ ] Test message receives response
- [ ] Voice recording works in browser
- [ ] Audio playback works

## 📊 Monitoring

### Check Workflow Executions:
1. In n8n, go to "Executions"
2. Monitor successful and failed executions
3. Click on any execution to see detailed logs

### Performance Optimization:
- Set execution timeout to 30 seconds
- Enable workflow error notifications
- Monitor API usage for both OpenAI and ElevenLabs

## 🔒 Security Notes

1. **Never expose API keys** in frontend code
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** if needed
4. **Monitor usage** to prevent abuse
5. **Keep webhook IDs** private when possible

## 📞 Need Help?

If you encounter issues:
1. Check the execution logs in n8n
2. Verify all credentials are correct
3. Test each endpoint individually
4. Check browser console for frontend errors
5. Ensure all services (OpenAI, ElevenLabs) are operational

---

**Your JARVIS Assistant is now ready!** 🎉

Access your frontend application and start talking to JARVIS. The complete system should now be operational with voice input, AI processing, and voice output.