import React, { useState, useCallback } from 'react';
import {
  Sprout,
  Search,
  RefreshCw,
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

interface FarmerAssistantProps {
  selectedLanguage: LanguageCode;
}

export const FarmerAssistant: React.FC<FarmerAssistantProps> = ({ selectedLanguage }) => {
  const { isRTL, t, currentLanguage } = useLanguage();
  const [query, setQuery] = useState('');
  const [crop, setCrop] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const crops = [
    { label: t('farmer.wheat', 'Wheat (Gandum)'), value: 'wheat' },
    { label: t('farmer.cotton', 'Cotton (Kapas)'), value: 'cotton' },
    { label: t('farmer.rice', 'Rice (Chawal)'), value: 'rice' },
    { label: t('farmer.sugarcane', 'Sugarcane (Kamad)'), value: 'sugarcane' },
    { label: t('farmer.maize', 'Maize (Makai)'), value: 'maize' },
  ];

  const handleAsk = useCallback(
    async (textToSend?: string) => {
      const q = (textToSend || query).trim();
      if (!q || isLoading) return;

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/farmer/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: q,
            question: q,
            language: selectedLanguage,
            cropType: crop,
          }),
        });

        if (!res.ok) throw new Error(t('common.error', 'Failed to consult farmer advisory.'));
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message || t('common.error', 'Error consulting agricultural engine.'));
      } finally {
        setIsLoading(false);
      }
    },
    [crop, isLoading, query, selectedLanguage, t]
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
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <Sprout className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {t('farmer.title', 'Kissan Agriculture Advisory AI')}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
              {currentLanguage.nativeName}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {t(
              'farmer.subtitle',
              'Crop diseases, pest management, fertilizer schedules, mandi market trends, and seasonal advisories'
            )}
          </p>
        </div>
      </div>

      {/* Crop Selector Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          {t('farmer.cropsTitle', 'Crops')}:
        </span>
        {crops.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => {
              setCrop(c.value);
              const qText = c.value === 'wheat'
                ? t('hero.promptWheatQuery', c.label)
                : c.label;
              setQuery(qText);
              handleAsk(qText);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              crop === c.value
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-[var(--surface)] hover:bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--text-secondary)]'
            }`}
          >
            {c.label}
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
              'farmer.searchPlaceholder',
              'Ask about wheat yellow rust, cotton pest remedies, urea/DAP timing, or seasonal planting...'
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
            onClick={() => handleAsk()}
            disabled={!query.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>{t('farmer.inquireBtn', 'Get Agricultural Advice')}</span>
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
            text={result.guidance || result.advice || result.answer || result.text || ''}
            language={selectedLanguage}
            label={`${currentLanguage.nativeName} — ${t('voice.listenBtn', 'Listen Audio')}`}
          />
          <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs leading-relaxed text-[var(--text-primary)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.guidance || result.advice || result.answer || result.text || ''}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
