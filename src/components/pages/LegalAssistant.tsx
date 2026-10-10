import React, { useState } from 'react';
import {
  Scale,
  Search,
  RefreshCw,
  BookOpen,
  FileCheck,
  Shield,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

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
    { label: t('legal.tenancy', 'Tenancy & Rent Agreements'), query: 'What are the legal rights of residential tenants and eviction notice requirements in Pakistan?' },
    { label: t('legal.labor', 'Labor & Employment Rights'), query: 'Explain severance pay, termination notice period, and working hours under Pakistani labor laws' },
    { label: t('legal.inheritance', 'Inheritance & Succession Laws'), query: 'How is inheritance divided and what is the procedure for obtaining a NADRA Succession Certificate in Pakistan?' },
    { label: t('legal.consumer', 'Consumer Protection Courts'), query: 'How can a citizen file a claim in Pakistani consumer court against defective goods or services?' },
  ];

  const handleAsk = async (textToSend?: string) => {
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

      if (!res.ok) throw new Error('Legal query failed.');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error consulting legal awareness engine.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto space-y-6 py-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
          <Scale className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {t('legal.title', 'Legal Rights & Citizen Awareness')}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
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

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder={t(
              'legal.searchPlaceholder',
              'Ask about residential tenancy, labor notice periods, inheritance distribution, or consumer court...'
            )}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
          <button
            onClick={() => handleAsk()}
            disabled={!query.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>{t('legal.inquireBtn', 'Check Legal Information')}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
          <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs leading-relaxed text-[var(--text-primary)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.guidance || result.answer || result.text || ''}
            </ReactMarkdown>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{t('legal.disclaimer', 'Notice: Informational guide only. Not formal legal counsel or advocate-client representation. For court litigation, consult a licensed legal advocate.')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
