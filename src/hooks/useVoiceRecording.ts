import { useState, useRef, useCallback, useEffect } from 'react';
import { AUDIO_CONFIG, LIMITS } from '../utils/constants';

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const silenceCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up voice recording...');
    
    // Clear all timers
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (silenceCheckIntervalRef.current) {
      clearInterval(silenceCheckIntervalRef.current);
      silenceCheckIntervalRef.current = null;
    }

    // Stop audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping media recorder:', error);
      }
    }

    // Reset state
    setIsRecording(false);
    setRecordingDuration(0);
    setAudioLevel(0);
    setError(null);
  }, []);

  // Silence detection using RMS analysis
  const checkSilence = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    try {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Calculate RMS (Root Mean Square) for accurate audio level
      let sumSquares = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const value = dataArrayRef.current[i];
        sumSquares += value * value;
      }
      
      const rms = Math.sqrt(sumSquares / dataArrayRef.current.length);
      setAudioLevel(rms);
      
      // Silence threshold - RMS below 8 indicates silence
      const silenceThreshold = 8;
      
      if (rms < silenceThreshold) {
        if (!silenceTimerRef.current) {
          console.log('🔇 Silence detected, starting 2-second timer');
          silenceTimerRef.current = setTimeout(() => {
            console.log('⏰ Silence detected for 2 seconds, auto-stopping');
            cleanup();
          }, 2000);
        }
      } else {
        // Reset silence timer if there's sound
        if (silenceTimerRef.current) {
          console.log('🔊 Sound detected, resetting silence timer');
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error in silence detection:', error);
    }
  }, [cleanup]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Starting voice recording...');
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: AUDIO_CONFIG.echoCancellation,
          noiseSuppression: AUDIO_CONFIG.noiseSuppression,
          autoGainControl: AUDIO_CONFIG.autoGainControl,
          sampleRate: AUDIO_CONFIG.sampleRate,
        } 
      });

      streamRef.current = stream;
      console.log('✅ Microphone access granted');

      // Set up audio analysis for silence detection
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.2;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      console.log('✅ Audio analysis setup complete');

      // Check browser support for audio formats
      let mimeType = AUDIO_CONFIG.mimeType;
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Let browser choose
          }
        }
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
        setError('Recording error occurred');
        cleanup();
      };

      // Start recording
      mediaRecorder.start(100);
      setIsRecording(true);
      startTimeRef.current = Date.now();

      console.log('✅ MediaRecorder started');

      // Start duration timer
      durationTimerRef.current = setInterval(() => {
        const duration = Date.now() - startTimeRef.current;
        setRecordingDuration(duration);

        // Auto-stop if max duration reached
        if (duration >= LIMITS.maxAudioDuration) {
          console.log('⏰ Max recording duration reached');
          cleanup();
        }
      }, 100);

      // Start silence detection
      silenceCheckIntervalRef.current = setInterval(checkSilence, 100);

      console.log('✅ Voice recording started with silence detection');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error starting recording:', error);
      setError(`Failed to start recording: ${errorMessage}`);
      throw error;
    }
  }, [checkSilence, cleanup]);

  // Stop recording and return audio blob
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      try {
        console.log('🛑 Stopping voice recording...');
        
        // Clear timers
        if (durationTimerRef.current) {
          clearInterval(durationTimerRef.current);
          durationTimerRef.current = null;
        }

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        if (silenceCheckIntervalRef.current) {
          clearInterval(silenceCheckIntervalRef.current);
          silenceCheckIntervalRef.current = null;
        }

        const mediaRecorder = mediaRecorderRef.current;
        const stream = streamRef.current;

        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
          console.log('❌ MediaRecorder not active');
          cleanup();
          resolve(null);
          return;
        }

        mediaRecorder.onstop = () => {
          try {
            // Create audio blob
            const audioBlob = new Blob(chunksRef.current, { 
              type: mediaRecorder.mimeType || 'audio/webm' 
            });
            
            console.log('✅ Audio blob created, size:', audioBlob.size, 'bytes');
            
            // Cleanup
            cleanup();
            
            resolve(audioBlob);
          } catch (error) {
            console.error('Error creating audio blob:', error);
            cleanup();
            resolve(null);
          }
        };

        // Stop recording
        mediaRecorder.stop();
        
      } catch (error) {
        console.error('Error stopping recording:', error);
        cleanup();
        resolve(null);
      }
    });
  }, [cleanup]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    console.log('❌ Voice recording cancelled');
    cleanup();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting, cleaning up voice recording...');
      cleanup();
    };
  }, [cleanup]);

  return {
    isRecording,
    recordingDuration,
    audioLevel,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};