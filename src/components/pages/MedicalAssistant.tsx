import React, { useState, useCallback } from 'react';
import {
  HeartPulse,
  PhoneCall,
  AlertTriangle,
  Search,
  RefreshCw,
  ShieldAlert,
  AlertCircle,
  Mic,
  Square,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AudioControlBar } from '../AudioControlBar';
import { useSpeechRecognition } from '../../utils/useSpeechRecognition';

interface MedicalAssistantProps {
  selectedLanguage: LanguageCode;
}

export const MedicalAssistant: React.FC<MedicalAssistantProps> = ({ selectedLanguage }) => {
  const { isRTL, t, currentLanguage } = useLanguage();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = useCallback(
    async (textToSend?: string) => {
      const q = (textToSend || query).trim();
      if (!q || isLoading) return;

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/medical/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: q,
            query: q,
            language: selectedLanguage,
          }),
        });

        if (!res.ok) throw new Error(t('common.error', 'Medical inquiry failed.'));
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message || t('common.error', 'Error consulting health triage.'));
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
          <HeartPulse className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {t('medical.title', 'Health Guidance & First-Aid Triage')}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)] font-bold">
              {currentLanguage.nativeName}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {t(
              'medical.subtitle',
              'Plain-language symptom guidance, first aid instructions, and 24/7 emergency hotline access'
            )}
          </p>
        </div>
      </div>

      {/* Emergency Hotline Bar */}
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
          <ShieldAlert className="w-4 h-4" />
          <span>{t('medical.emergencyNotice', 'In life-threatening medical emergencies, call immediately:')}</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <a href="tel:1122" className="flex items-center gap-1.5 text-rose-600 hover:underline">
            <PhoneCall className="w-3.5 h-3.5" /> {t('medical.rescue1122', 'Rescue 1122')}
          </a>
          <a href="tel:115" className="flex items-center gap-1.5 text-rose-600 hover:underline">
            <PhoneCall className="w-3.5 h-3.5" /> {t('medical.edhi115', 'Edhi 115')}
          </a>
          <a href="tel:1020" className="flex items-center gap-1.5 text-rose-600 hover:underline">
            <PhoneCall className="w-3.5 h-3.5" /> {t('medical.chhipa1020', 'Chhipa 1020')}
          </a>
        </div>
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
              'medical.searchPlaceholder',
              'Describe symptoms or ask about first-aid care (e.g., heatstroke first aid, dengue fever precautions)...'
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
            <span>{t('medical.inquireBtn', 'Inquire Health Guide')}</span>
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
            text={result.answer || result.guidance || result.text || ''}
            language={selectedLanguage}
            label={`${currentLanguage.nativeName} — ${t('voice.listenBtn', 'Listen Audio')}`}
          />
          <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs leading-relaxed text-[var(--text-primary)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.answer || result.guidance || result.text || ''}
            </ReactMarkdown>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t('medical.disclaimer', 'Notice: Informational guidance only. Not a medical prescription. Consult a licensed doctor.')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
