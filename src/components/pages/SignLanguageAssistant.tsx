import React, { useState, useCallback } from 'react';
import {
  HandHelping,
  Search,
  RefreshCw,
  AlertCircle,
  Mic,
  Square,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AudioControlBar } from '../AudioControlBar';
import { useSpeechRecognition } from '../../utils/useSpeechRecognition';

interface SignLanguageAssistantProps {
  selectedLanguage: LanguageCode;
}

export const SignLanguageAssistant: React.FC<SignLanguageAssistantProps> = ({ selectedLanguage }) => {
  const { isRTL, t, currentLanguage } = useLanguage();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const commonSigns = [
    'السلام علیکم (Greetings)',
    'شکریہ (Thank you)',
    'پانی چاہیے (Want water)',
    'ہسپتال کہاں ہے؟ (Where is hospital?)',
    'مدد چاہیے (Need help)',
  ];

  const handleLookup = useCallback(
    async (inputSign?: string) => {
      const query = (inputSign || text).trim();
      if (!query || isLoading) return;

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/psl/breakdown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: query,
            language: selectedLanguage,
          }),
        });

        if (!res.ok) throw new Error(t('common.error', 'Sign language lookup failed.'));
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message || t('common.error', 'Error processing sign language breakdown.'));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, selectedLanguage, t, text]
  );

  const {
    isListening,
    isTranscribing,
    error: sttError,
    toggleListening,
  } = useSpeechRecognition({
    language: selectedLanguage,
    onTranscript: (spokenText) => {
      setText(spokenText);
      handleLookup(spokenText);
    },
  });

  return (
    <div
      className="w-full space-y-6 py-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
          <HandHelping className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {t('psl.title', 'Pakistan Sign Language (PSL) Assistant')}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold">
              {currentLanguage.nativeName}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {t(
              'psl.subtitle',
              'Interactive PSL dictionary, fingerspelling alphabet, and visual accessibility communication tools'
            )}
          </p>
        </div>
      </div>

      {/* Suggested Signs Strip */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          {t('psl.commonPhrases', 'Common Phrases')}:
        </span>
        {commonSigns.map((sign, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setText(sign);
              handleLookup(sign);
            }}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-medium transition-all cursor-pointer shadow-2xs"
          >
            {sign}
          </button>
        ))}
      </div>

      {/* Search Input with Microphone Voice-to-Text */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder={t('psl.searchPlaceholder', 'Search word or phrase in PSL...')}
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
          <button
            type="button"
            onClick={toggleListening}
            disabled={isTranscribing}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isListening
                ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                : 'bg-[var(--surface-secondary)] hover:bg-[var(--accent-subtle)] text-[var(--text-primary)] border-[var(--border)]'
            }`}
            title={t('assistant.listenControl', 'Voice Input')}
          >
            {isListening ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t('voice.stopBtn', 'Stop')}</span>
              </>
            ) : isTranscribing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{t('common.loading', 'Transcribing...')}</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('assistant.mic', 'Mic')}</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleLookup()}
            disabled={!text.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>{t('common.search', 'Lookup')}</span>
          </button>
        </div>
      </div>

      {(error || sttError) && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || sttError}</span>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
          <AudioControlBar
            text={result.explanation || result.breakdown || result.answer || result.text || ''}
            language={selectedLanguage}
            label={`${currentLanguage.nativeName} — ${t('voice.listenBtn', 'Listen Audio')}`}
          />
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {t('psl.title', 'PSL Gesture Breakdown & Description')}
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
              {result.explanation || result.breakdown || result.answer || result.text || ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
