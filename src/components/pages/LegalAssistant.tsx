import React, { useState } from 'react';
import {
  Scale,
  Search,
  RefreshCw,
  BookOpen,
  FileCheck,
  Shield,
  AlertCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface LegalAssistantProps {
  selectedLanguage: LanguageCode;
}

const TOPICS = [
  'کرایہ نامہ و حقوق (Tenancy Laws)',
  'ملازمت و تنخواہ کے قوانین (Labor Laws)',
  'وراثت و تقسیم جائیداد (Inheritance Rights)',
  'صارفین کے حقوق (Consumer Protection)',
  'خاندانی و نکاح نامہ امور (Family Law)',
];

export const LegalAssistant: React.FC<LegalAssistantProps> = ({ selectedLanguage }) => {
  const { isRTL } = useLanguage();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <Scale className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {isRTL ? 'قانونی آگاہی و شہری حقوق (Legal Rights AI)' : 'Legal Rights & Citizen Awareness AI'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Understand Pakistani laws, residential agreements, workplace rights, and legal procedures in simple terms
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Common Topics:</span>
          {TOPICS.map((t, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(t);
                handleAsk(t);
              }}
              className="text-xs px-2.5 py-1 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-emerald-600 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder={
              isRTL
                ? 'اپنا قانونی سوال یا مسئلہ یہاں درج کریں...'
                : 'Ask any legal question (e.g., notice period for tenant eviction, labor rights in Pakistan)...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
          <button
            onClick={() => handleAsk()}
            disabled={!query.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isRTL ? 'معلوم کریں' : 'Inquire'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && (
        <div className="p-12 text-center text-xs text-[var(--text-muted)]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
          <span>Consulting Pakistani statutory law and court guidelines...</span>
        </div>
      )}

      {result && !isLoading && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-200 text-[11px]">
            ℹ️ <strong>قانونی وضاحت (Legal Disclaimer):</strong> یہ نظام صرف عام فہم قانونی رہنمائی اور آگاہی فراہم کرتا ہے۔ عدالت میں پیشی یا باضابطہ قانونی چارہ جوئی کے لیے مستند وکیل سے مشورہ کریں۔
          </div>

          <div className="prose prose-xs dark:prose-invert max-w-none text-xs leading-relaxed text-[var(--text-primary)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.reply || result.guidance || result.text || ''}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
