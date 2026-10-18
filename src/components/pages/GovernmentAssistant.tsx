import React, { useState, useCallback } from 'react';
import {
  Building2,
  Search,
  RefreshCw,
  AlertCircle,
  Mic,
  Square,
} from 'lucide-react';
import { FormattedMarkdown } from '../FormattedMarkdown';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AudioControlBar } from '../AudioControlBar';
import { useSpeechRecognition } from '../../utils/useSpeechRecognition';

interface GovernmentAssistantProps {
  selectedLanguage: LanguageCode;
}

export const GovernmentAssistant: React.FC<GovernmentAssistantProps> = ({ selectedLanguage }) => {
  const { isRTL, t, currentLanguage } = useLanguage();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const popularServices = [
    {
      label: t('government.nadra', 'NADRA Smart NIC & CRC'),
      query: t('hero.promptNadraQuery', 'NADRA Smart CNIC renewal procedure, fees, and required documents in Pakistan'),
    },
    {
      label: t('government.passport', 'Directorate of Passports'),
      query: t('government.passport', 'Directorate of Passports'),
    },
    {
      label: t('government.bisp', 'BISP Kafalat 8171'),
      query: t('hero.promptBispQuery', 'How to check BISP 8171 eligibility and Tehsil registration for financial assistance'),
    },
    {
      label: t('government.fbr', 'FBR Iris Tax Returns'),
      query: t('government.fbr', 'FBR Iris Tax Returns'),
    },
  ];

  const handleSearch = useCallback(
    async (searchQuery?: string) => {
      const q = (searchQuery || query).trim();
      if (!q || isLoading) return;

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/government/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: q,
            language: selectedLanguage,
          }),
        });

        if (!res.ok) throw new Error(t('common.error', 'Service lookup failed.'));
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message || t('common.error', 'Error fetching civic instructions.'));
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
      handleSearch(spokenText);
    },
  });

  return (
    <div
      className="w-full space-y-6 py-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {t('government.title', 'Civic & NADRA Procedure Navigator')}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
              {currentLanguage.nativeName}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {t(
              'government.subtitle',
              'Verified step-by-step guidance for Pakistani public portals, documentation, and civic entitlements'
            )}
          </p>
        </div>
      </div>

      {/* Popular Portals Strip */}
      <div className="flex flex-wrap items-center gap-2">
        {popularServices.map((srv, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setQuery(srv.query);
              handleSearch(srv.query);
            }}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-medium transition-all cursor-pointer shadow-2xs"
          >
            {srv.label}
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
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t(
              'government.searchPlaceholder',
              'Search NADRA Smart Card, Passport renewal, BISP 8171, or FBR tax registration...'
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
                <Mic className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('assistant.mic', 'Mic')}</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>{t('government.inquireBtn', 'Find Procedure')}</span>
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
            text={result.steps || result.guidance || result.answer || result.text || ''}
            language={selectedLanguage}
            label={`${currentLanguage.nativeName} — ${t('voice.listenBtn', 'Listen Audio')}`}
          />
          <FormattedMarkdown
            content={result.steps || result.guidance || result.answer || result.text || ''}
            isRTL={isRTL}
          />
        </div>
      )}
    </div>
  );
};
