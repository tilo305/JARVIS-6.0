export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatTimestamp = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
    .slice(0, 500);
};

export const checkMicrophonePermission = async (): Promise<boolean> => {
  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    if (result.state === 'denied') {
      return false;
    }
    return true;
  } catch (error) {
    console.warn('Permission API not supported, proceeding anyway');
    return true;
  }
};

export const playAudioSafely = async (url: string): Promise<void> => {
  const audio = new Audio(url);
  audio.volume = 0.8;
  
  try {
    await audio.play();
  } catch (error) {
    console.error('Autoplay blocked:', error);
    // Could show a play button here
    throw error;
  }
};

export class Logger {
  static debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEBUG === 'true') {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }
  
  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data || '');
  }
  
  static error(message: string, error: any) {
    console.error(`[ERROR] ${message}`, error);
  }
  
  static info(message: string, data?: any) {
    console.info(`[INFO] ${message}`, data || '');
  }
}