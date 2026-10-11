import { useState, useRef, useCallback, useEffect } from 'react';
import { LanguageCode } from '../types';
import { getLanguageBCP47 } from '../i18n';

interface UseSpeechRecognitionOptions {
  language: LanguageCode;
  onTranscript: (text: string) => void;
  continuous?: boolean;
}

export function useSpeechRecognition({
  language,
  onTranscript,
  continuous = false,
}: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  const startCloudRecording = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Microphone access is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      setIsListening(true);
      setError(null);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
        setIsListening(false);

        const chunks = audioChunksRef.current;
        if (!chunks.length) return;
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        if (blob.size < 400) return;

        setIsTranscribing(true);
        try {
          const base64Audio = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(String(reader.result || ''));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          const res = await fetch('/api/chat/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Audio,
              mimeType: blob.type || 'audio/webm',
              language,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.transcript?.trim()) {
            onTranscriptRef.current(data.transcript.trim());
            setError(null);
          } else {
            setError('Could not detect clear speech. Please try speaking again.');
          }
        } catch {
          setError('Voice transcription failed. Please try again or type your text.');
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start(250);
    } catch (err: any) {
      setIsListening(false);
      if (err?.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow microphone access in browser settings.');
      } else {
        setError('Unable to access microphone.');
      }
    }
  }, [language]);

  const startListening = useCallback(async () => {
    setError(null);
    setInterimTranscript('');

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    // Regional scripts (Shahmukhi Punjabi, Sindhi, Pashto, Balochi, Roman Urdu) transcribe most accurately via Gemini Audio STT
    const cloudPreferredLangs: LanguageCode[] = [
      'pa',
      'sd',
      'ps',
      'bal',
      'roman_ur',
      'skr',
      'hnd',
      'ks',
      'brh',
    ];

    if (!SpeechRecognition || cloudPreferredLangs.includes(language)) {
      await startCloudRecording();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = getLanguageBCP47(language);
      recognition.continuous = continuous;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            finalStr += transcriptPiece + ' ';
          } else {
            interimStr += transcriptPiece;
          }
        }
        setInterimTranscript(interimStr);
        if (finalStr.trim()) {
          onTranscriptRef.current(finalStr.trim());
          setInterimTranscript('');
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setInterimTranscript('');
        if (event?.error === 'language-not-supported' || event?.error === 'service-not-allowed') {
          startCloudRecording();
        } else if (event?.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone access.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.start();
    } catch {
      await startCloudRecording();
    }
  }, [continuous, language, startCloudRecording]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        return;
      }
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  const clearError = useCallback(() => setError(null), []);

  return {
    isListening,
    isTranscribing,
    interimTranscript,
    error,
    clearError,
    startListening,
    stopListening,
    toggleListening,
  };
}
