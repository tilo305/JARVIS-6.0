import React, { useState, useEffect } from 'react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { checkMicrophonePermission } from '../utils/helpers';
import { UI_MESSAGES } from '../utils/constants';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  isProcessing: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onRecordingComplete, 
  isProcessing 
}) => {
  const { 
    isRecording, 
    recordingDuration, 
    audioLevel,
    error,
    startRecording, 
    stopRecording
  } = useVoiceRecording();
  
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    checkMicrophonePermission().then(setHasPermission);
  }, []);

  const handleVoiceClick = async () => {
    if (isProcessing) return;
    
    if (!hasPermission) {
      alert(UI_MESSAGES.microphonePermissionDenied);
      const permission = await checkMicrophonePermission();
      setHasPermission(permission);
      return;
    }

    if (isRecording) {
      // Stop recording and send to n8n webhook
      console.log('🛑 Stopping recording, sending to n8n webhook...');
      const audioBlob = await stopRecording();
      if (audioBlob && audioBlob.size > 0) {
        console.log('📤 Sending audio to n8n voice webhook, size:', audioBlob.size, 'bytes');
        onRecordingComplete(audioBlob);
      } else {
        console.warn('⚠️ No audio data to send');
      }
    } else {
      // Start recording
      try {
        console.log('🎤 Starting voice recording for n8n webhook...');
        await startRecording();
      } catch (error) {
        console.error('Failed to start recording:', error);
      }
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAudioLevelColor = (level: number): string => {
    if (level < 8) return '#ff6b6b'; // Red for silence
    if (level < 20) return '#ffa726'; // Orange for low
    if (level < 40) return '#66bb6a'; // Green for normal
    return '#42a5f5'; // Blue for loud
  };

  return (
    <div className="voice-recorder-container">
      <button
        onClick={handleVoiceClick}
        disabled={isProcessing || !hasPermission}
        className={`voice-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
        title={isRecording ? 'Click to stop recording and send to n8n' : 'Click to start recording for n8n webhook'}
        data-testid="voice-button"
      >
        {isRecording ? (
          <svg className="voice-icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="voice-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
        <span className="voice-button-text">
          {isRecording ? 'Stop & Send' : 'Voice'}
        </span>
      </button>

      <div className="voice-status">
        {isRecording ? (
          <div className="recording-status">
            <p className="recording-text">
              Recording for n8n webhook... Click to stop
            </p>
            <p className="recording-duration">
              {formatDuration(recordingDuration)}
            </p>
            <div className="audio-level-display">
              <span>Audio Level: </span>
              <span 
                className="audio-level-value"
                style={{ color: getAudioLevelColor(audioLevel) }}
              >
                {audioLevel.toFixed(1)}
              </span>
              {audioLevel < 8 && (
                <span className="silence-warning"> (Silence detected)</span>
              )}
            </div>
          </div>
        ) : (
          <p className="voice-instruction">
            {isProcessing ? UI_MESSAGES.processing : 'Click to record voice for n8n webhook'}
          </p>
        )}
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {!hasPermission && (
        <div className="permission-warning">
          {UI_MESSAGES.microphonePermissionDenied}
        </div>
      )}
    </div>
  );
};