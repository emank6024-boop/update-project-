import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  RefreshCw,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Square,
  CheckCircle2,
  Sliders,
  Copy,
  Trash2,
  Radio,
  FileAudio,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceSettings } from '../../context/VoiceSettingsContext';

interface VoiceAssistantProps {
  selectedLanguage: LanguageCode;
  initialMode?: 'assistant' | 'tts' | 'stt';
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  selectedLanguage,
  initialMode = 'assistant',
}) => {
  const { isRTL, t, currentLanguage, bcp47 } = useLanguage();
  const {
    speak,
    isSpeaking,
    isPaused,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    replaySpeaking,
    checkVoiceSupport,
  } = useVoiceSettings();

  const [activeTab, setActiveTab] = useState<'assistant' | 'tts' | 'stt'>(initialMode);
  const [speechRate, setSpeechRate] = useState(1.0);

  // Assistant conversation state
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TTS Studio state
  const [ttsInput, setTtsInput] = useState('');
  const [ttsPitch, setTtsPitch] = useState(1);

  // STT Dictation state
  const [dictatedText, setDictatedText] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [sttCopied, setSttCopied] = useState(false);

  const voiceSupport = checkVoiceSupport(selectedLanguage);

  const startListening = () => {
    setError(null);
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or an Android browser, or type your query in the Assistant module.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = bcp47;
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
        if (event.error === 'not-allowed') {
          setError('Microphone permission was denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'language-not-supported') {
          setError(
            `Browser speech recognition does not support ${currentLanguage.name} directly on this device. You can type in the Assistant tab.`
          );
        } else {
          setError(`Microphone error: ${event.error || 'unknown'}`);
        }
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
      const replyText = data.reply || '';
      setResponse(replyText);

      if (voiceSupport.isSupported) {
        await speak(replyText, selectedLanguage);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process voice query.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = () => {
    if (!response) return;
    if (isPaused) {
      resumeSpeaking();
    } else {
      speak(response, selectedLanguage);
    }
  };

  const handlePlayTTS = () => {
    if (!ttsInput.trim()) return;
    speak(ttsInput.trim(), selectedLanguage);
  };

  // STT Dictation Handler
  const startSTTDictation = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = bcp47;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsDictating(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setDictatedText((prev) => prev + finalTranscript);
        }
      };

      recognition.onerror = () => {
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      recognition.start();
    } catch {
      setIsDictating(false);
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto space-y-6 py-4 px-2"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <Volume2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {t('voice.title', 'PakLingo Regional Voice & Audio Studio')}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            {t(
              'voice.subtitle',
              'Speak in regional languages, synthesize natural speech, or transcribe audio with full privacy'
            )}
          </p>
        </div>
      </div>

      {/* Honest Capability & Engine Notice Banner */}
      <div
        className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
          voiceSupport.isSupported
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-800 dark:text-emerald-200'
            : 'bg-amber-500/10 border-amber-500/25 text-amber-800 dark:text-amber-200'
        }`}
      >
        {voiceSupport.isSupported ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="font-semibold flex items-center gap-2">
            <span>
              {voiceSupport.isSupported
                ? `Active Speech Profile: ${currentLanguage.nativeName} (${currentLanguage.name})`
                : `Speech Engine Advisory: ${currentLanguage.nativeName}`}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/10 font-mono">
              BCP-47: {bcp47}
            </span>
          </div>
          <p className="text-[11px] opacity-90">{voiceSupport.message}</p>
        </div>
      </div>

      {/* Sub-Tabs: Assistant vs TTS vs STT */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('assistant')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'assistant'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{t('voice.tabAssistant', 'Voice Conversation')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tts')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'tts'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{t('voice.tabTTS', 'Text-to-Speech (TTS)')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stt')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'stt'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>{t('voice.tabSTT', 'Speech-to-Text (STT)')}</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE CONVERSATION */}
      {activeTab === 'assistant' && (
        <div className="space-y-6">
          <div className="p-8 sm:p-12 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm text-center flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              {isListening && (
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              )}
              <button
                type="button"
                onClick={startListening}
                disabled={isListening || isLoading}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-rose-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                } disabled:opacity-50`}
                aria-label="Activate microphone"
              >
                {isListening ? <Mic className="w-10 h-10 animate-pulse" /> : <Mic className="w-10 h-10" />}
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {isListening
                  ? t('voice.listening', 'Listening to your voice...')
                  : isLoading
                  ? t('voice.processing', 'Analyzing and generating response...')
                  : t('voice.clickToSpeak', 'Press to Speak')}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {t('voice.speakNow', 'Speak clearly in your chosen language...')}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {(transcript || response) && (
            <div className="space-y-4">
              {transcript && (
                <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
                    <User className="w-3.5 h-3.5" />
                    <span>{t('voice.transcript', 'Your Spoken Input:')}</span>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{transcript}</p>
                </div>
              )}

              {response && (
                <div className="p-6 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
                      <Bot className="w-4 h-4" />
                      <span>{t('voice.response', 'Assistant Spoken Reply:')}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePlayAudio}
                        className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text-primary)] transition-colors cursor-pointer"
                        title={isPaused ? 'Resume' : 'Play'}
                      >
                        <Play className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={pauseSpeaking}
                        disabled={!isSpeaking}
                        className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text-primary)] disabled:opacity-30 transition-colors cursor-pointer"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={replaySpeaking}
                        className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text-primary)] transition-colors cursor-pointer"
                        title="Replay"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={stopSpeaking}
                        disabled={!isSpeaking}
                        className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text-primary)] disabled:opacity-30 transition-colors cursor-pointer"
                        title="Stop"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap font-medium">
                    {response}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEXT-TO-SPEECH (TTS) STUDIO */}
      {activeTab === 'tts' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {t('voice.ttsTitle', 'Text-to-Speech Voice Synthesizer')}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {t('voice.ttsSubtitle', 'Type or paste text in any language to synthesize natural human speech audio.')}
            </p>
          </div>

          <div className="space-y-2">
            <textarea
              rows={4}
              value={ttsInput}
              onChange={(e) => setTtsInput(e.target.value)}
              placeholder={t('voice.ttsPlaceholder', 'Type text in Urdu, English, Punjabi, Sindhi, Pashto, or Balochi here...')}
              className="w-full p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 font-medium"
            />
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>{ttsInput.length} characters</span>
              <button
                type="button"
                onClick={() => setTtsInput('')}
                className="hover:text-rose-500 cursor-pointer"
              >
                {t('common.clear', 'Clear')}
              </button>
            </div>
          </div>

          {/* Voice Controls: Speech Rate & Pitch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)]">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-primary)]">{t('voice.ttsSpeed', 'Speech Speed')}</span>
                <span className="font-mono text-emerald-600">{speechRate}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-primary)]">{t('voice.ttsPitch', 'Voice Pitch')}</span>
                <span className="font-mono text-emerald-600">{ttsPitch}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={ttsPitch}
                onChange={(e) => setTtsPitch(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePlayTTS}
              disabled={!ttsInput.trim()}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span>{t('voice.playAudio', 'Synthesize & Play Audio')}</span>
            </button>

            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                <span>{t('voice.stopAudio', 'Stop Audio')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SPEECH-TO-TEXT (STT) TRANSCRIBER */}
      {activeTab === 'stt' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {t('voice.sttTitle', 'Speech-to-Text Audio Transcriber')}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {t('voice.sttSubtitle', 'Speak freely into your microphone and convert your words into editable text.')}
            </p>
          </div>

          <div className="flex items-center justify-center p-8 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)]">
            <button
              type="button"
              onClick={startSTTDictation}
              className={`p-6 rounded-full transition-all cursor-pointer shadow-md flex items-center justify-center ${
                isDictating ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isDictating ? <Mic className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                {t('voice.transcribedOutput', 'Transcribed Output Text')}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(dictatedText);
                    setSttCopied(true);
                    setTimeout(() => setSttCopied(false), 2000);
                  }}
                  disabled={!dictatedText}
                  className="px-2.5 py-1 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--border)] text-xs font-medium text-[var(--text-secondary)] disabled:opacity-30 cursor-pointer flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{sttCopied ? t('common.copied', 'Copied!') : t('common.copy', 'Copy')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDictatedText('')}
                  disabled={!dictatedText}
                  className="px-2.5 py-1 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--border)] text-xs font-medium text-rose-500 disabled:opacity-30 cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t('common.clear', 'Clear')}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={5}
              value={dictatedText}
              onChange={(e) => setDictatedText(e.target.value)}
              placeholder={t('voice.sttEmptyPlaceholder', 'Spoken words will appear here in real-time as you speak...')}
              className="w-full p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
        </div>
      )}
    </div>
  );
};
