import React, { useState, useCallback } from 'react';
import {
  Scale,
  Search,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Mic,
  Square,
} from 'lucide-react';
import { FormattedMarkdown } from '../FormattedMarkdown';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AudioControlBar } from '../AudioControlBar';
import { useSpeechRecognition } from '../../utils/useSpeechRecognition';

interface LegalAssistantProps {
  selectedLanguage: LanguageCode;
}

export const LegalAssistant: React.FC<LegalAssistantProps> = ({ selectedLanguage }) => {
  const { isRTL, t, currentLanguage } = useLanguage();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const topics = [
    { label: t('legal.tenancy', 'Tenancy & Rent Agreements'), query: t('legal.tenancy', 'Tenancy & Rent Agreements') },
    { label: t('legal.labor', 'Labor & Employment Rights'), query: t('legal.labor', 'Labor & Employment Rights') },
    { label: t('legal.inheritance', 'Inheritance & Succession Laws'), query: t('legal.inheritance', 'Inheritance & Succession Laws') },
    { label: t('legal.consumer', 'Consumer Protection Courts'), query: t('legal.consumer', 'Consumer Protection Courts') },
  ];

  const handleAsk = useCallback(
    async (textToSend?: string) => {
      const q = (textToSend || query).trim();
      if (!q || isLoading) return;

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/legal/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: q,
            question: q,
            language: selectedLanguage,
          }),
        });

        if (!res.ok) throw new Error(t('common.error', 'Legal query failed.'));
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message || t('common.error', 'Error consulting legal awareness engine.'));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, query, selectedLanguage, t]
  );

  const {
    isListening,
    isTranscribing,
    error: sttError,
    toggleListening,
  } = useSpeechRecognition({
    language: selectedLanguage,
    onTranscript: (spokenText) => {
      setQuery(spokenText);
      handleAsk(spokenText);
    },
  });

  return (
    <div
      className="w-full space-y-6 py-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent-text)] flex items-center justify-center border border-[var(--accent-border)]">
          <Scale className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {t('legal.title', 'Legal Rights & Citizen Awareness')}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)] font-bold">
              {currentLanguage.nativeName}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {t(
              'legal.subtitle',
              'Clear explanations of Pakistani laws, tenant rights, labor protections, inheritance, and consumer disputes'
            )}
          </p>
        </div>
      </div>

      {/* Suggested Topics Strip */}
      <div className="flex flex-wrap items-center gap-2">
        {topics.map((tItem, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(tItem.query);
              handleAsk(tItem.query);
            }}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-medium transition-all cursor-pointer shadow-2xs"
          >
            {tItem.label}
          </button>
        ))}
      </div>

      {/* Search Input with Microphone Voice-to-Text */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder={t(
              'legal.searchPlaceholder',
              'Ask about residential tenancy, labor notice periods, inheritance distribution, or consumer court...'
            )}
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
                <Mic className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                <span>{t('assistant.mic', 'Mic')}</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleAsk()}
            disabled={!query.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-[var(--button-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--button-primary-text)] disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>{t('legal.inquireBtn', 'Check Legal Information')}</span>
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
            text={result.guidance || result.answer || result.text || ''}
            language={selectedLanguage}
            label={`${currentLanguage.nativeName} — ${t('voice.listenBtn', 'Listen Audio')}`}
          />
          <FormattedMarkdown
            content={result.guidance || result.answer || result.text || ''}
            isRTL={isRTL}
          />

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t('legal.disclaimer', 'Notice: Informational guide only. Not formal legal counsel or advocate-client representation. For court litigation, consult a licensed legal advocate.')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
