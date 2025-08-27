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
    startRecording, 
    stopRecording,
    cancelRecording 
  } = useVoiceRecording();
  
  const [hasPermission, setHasPermission] = useState(true);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    checkMicrophonePermission().then(setHasPermission);
  }, []);

  const handleStart = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    if (isProcessing) return;
    
    if (!hasPermission) {
      alert(UI_MESSAGES.microphonePermissionDenied);
      const permission = await checkMicrophonePermission();
      setHasPermission(permission);
      return;
    }

    setIsHolding(true);
    try {
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsHolding(false);
    }
  };

  const handleStop = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    
    if (!isHolding || !isRecording) return;
    
    setIsHolding(false);
    const audioBlob = await stopRecording();
    
    if (audioBlob && audioBlob.size > 0) {
      onRecordingComplete(audioBlob);
    }
  };

  const handleCancel = () => {
    setIsHolding(false);
    if (isRecording) {
      cancelRecording();
    }
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-recorder-container flex flex-col items-center">
      <button
        onMouseDown={handleStart}
        onMouseUp={handleStop}
        onMouseLeave={handleCancel}
        onTouchStart={handleStart}
        onTouchEnd={handleStop}
        onTouchCancel={handleCancel}
        disabled={isProcessing || !hasPermission}
        className={`
          voice-button relative w-24 h-24 rounded-full 
          ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-jarvis-blue'} 
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-jarvis-blue/50'}
          transition-all duration-300 transform
          ${isHolding ? 'scale-110' : 'scale-100'}
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center
        `}
        data-testid="voice-button"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-spin-slow" />
        
        {isRecording ? (
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      <div className="mt-4 text-center">
        {isRecording ? (
          <div className="space-y-2">
            <p className="text-jarvis-blue font-semibold animate-pulse">
              {UI_MESSAGES.recordingInProgress}
            </p>
            <p className="text-white text-sm">
              {formatDuration(recordingDuration)}
            </p>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">
            {isProcessing ? UI_MESSAGES.processing : 'Hold to talk'}
          </p>
        )}
      </div>

      {!hasPermission && (
        <div className="mt-2 text-red-500 text-xs text-center max-w-xs">
          {UI_MESSAGES.microphonePermissionDenied}
        </div>
      )}
    </div>
  );
};