import React, { useState } from 'react';
import {
  HeartPulse,
  PhoneCall,
  AlertTriangle,
  Search,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  AlertCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface MedicalAssistantProps {
  selectedLanguage: LanguageCode;
}

export const MedicalAssistant: React.FC<MedicalAssistantProps> = ({ selectedLanguage }) => {
  const { isRTL } = useLanguage();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/medical/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          language: selectedLanguage,
        }),
      });

      if (!res.ok) throw new Error('Medical inquiry failed.');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error consulting health triage.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center border border-rose-500/20">
          <HeartPulse className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {isRTL ? 'صحت و فوری طبی رہنمائی (Health Triage)' : 'Health Guidance & First-Aid Triage'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Plain-language symptom guidance, first aid instructions, and 24/7 emergency hotline access
          </p>
        </div>
      </div>

      {/* Emergency Hotline Bar */}
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
          <ShieldAlert className="w-4 h-4" />
          <span>ایمرجنسی صورتحال میں فوری رابطہ کریں:</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <a href="tel:1122" className="flex items-center gap-1.5 text-rose-600 hover:underline">
            <PhoneCall className="w-3.5 h-3.5" /> Rescue 1122
          </a>
          <a href="tel:115" className="flex items-center gap-1.5 text-rose-600 hover:underline">
            <PhoneCall className="w-3.5 h-3.5" /> Edhi 115
          </a>
          <a href="tel:1020" className="flex items-center gap-1.5 text-rose-600 hover:underline">
            <PhoneCall className="w-3.5 h-3.5" /> Chhipa 1020
          </a>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder={
              isRTL
                ? 'علامات، ابتدائی طبی امداد یا احتیاطی تدابیر کے بارے میں لکھیں...'
                : 'Describe symptoms or ask about first-aid care (e.g., heatstroke first aid, dengue fever precautions)...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
          <button
            onClick={handleAsk}
            disabled={!query.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isRTL ? 'رہنمائی لیں' : 'Inquire'}</span>
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
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-600" />
          <span>Formulating medical safety guidance...</span>
        </div>
      )}

      {result && !isLoading && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-[11px]">
            ⚠️ <strong>طبی انتباہ (Medical Disclaimer):</strong> یہ معلومات صرف ابتدائی آگاہی اور ہنگامی معاونت کے لیے ہیں۔ کسی بھی شدید بیماری یا تکلیف کی صورت میں مستند ڈاکٹر یا ہسپتال سے رجوع کریں۔
          </div>

          <div className="prose prose-xs dark:prose-invert max-w-none text-xs leading-relaxed text-[var(--text-primary)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.reply || result.advisory || result.text || ''}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
