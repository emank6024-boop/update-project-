import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  RefreshCw,
  Sparkles,
  Bot,
  User,
  AlertCircle,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceSettings } from '../../context/VoiceSettingsContext';

interface VoiceAssistantProps {
  selectedLanguage: LanguageCode;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ selectedLanguage }) => {
  const { isRTL } = useLanguage();
  const { speak, isSpeaking, stopSpeaking } = useVoiceSettings();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startListening = () => {
    setError(null);
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Voice recognition is not supported in this browser. Please type your message.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage === 'ur' ? 'ur-PK' : selectedLanguage === 'en' ? 'en-US' : 'ur-PK';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        stopSpeaking();
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        handleSendVoiceQuery(text);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setError(`Microphone error: ${event.error || 'unknown'}`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setError(err.message || 'Could not start voice recognition.');
    }
  };

  const handleSendVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          language: selectedLanguage,
        }),
      });

      if (!res.ok) throw new Error('Voice assistant response failed.');
      const data = await res.json();
      setResponse(data.reply || '');
      speak(data.reply, selectedLanguage);
    } catch (err: any) {
      setError(err.message || 'Failed to process voice query.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {isRTL ? 'صوتی معاون (Voice Assistant Mode)' : 'PakLingo Hands-Free Voice Assistant'}
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Tap the microphone, speak naturally in Urdu or English, and listen to the voice response
        </p>
      </div>

      {/* Big Mic Button */}
      <div className="py-8 flex flex-col items-center justify-center">
        <button
          onClick={isListening ? () => setIsListening(false) : startListening}
          className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse scale-110 shadow-rose-500/30 ring-8 ring-rose-500/20'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 shadow-emerald-500/30'
          }`}
          title={isListening ? 'Listening...' : 'Tap to speak'}
        >
          {isListening ? <Mic className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
        </button>

        <p className="mt-4 text-xs font-semibold text-[var(--text-secondary)]">
          {isListening
            ? isRTL ? 'سن رہا ہوں... بولیے' : 'Listening... Speak now'
            : isRTL ? 'بولنے کے لیے مائیکروفون دبائیں' : 'Tap to start speaking'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Transcript Box */}
      {transcript && (
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-left shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
            <User className="w-3.5 h-3.5" />
            <span>You said:</span>
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{transcript}</p>
        </div>
      )}

      {/* Response Box */}
      {isLoading && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center text-xs text-[var(--text-muted)]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
          <span>Generating voice answer...</span>
        </div>
      )}

      {response && !isLoading && (
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-left shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <Bot className="w-3.5 h-3.5" />
              <span>PakLingo AI:</span>
            </div>
            <button
              onClick={() => (isSpeaking ? stopSpeaking() : speak(response, selectedLanguage))}
              className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-xs flex items-center gap-1.5 text-[var(--text-secondary)] transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeaking ? 'روکیں' : 'دوبارہ سنیں'}</span>
            </button>
          </div>
          <p className="text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
};
