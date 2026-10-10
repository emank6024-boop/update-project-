import React, { useState } from 'react';
import {
  Sprout,
  Search,
  RefreshCw,
  Sun,
  Droplets,
  Bug,
  Coins,
  AlertCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface FarmerAssistantProps {
  selectedLanguage: LanguageCode;
}

const CROPS = ['گندم (Wheat)', 'کپاس (Cotton)', 'چاول (Rice)', 'گنا (Sugarcane)', 'مکئی (Maize)', 'سبزیاں (Vegetables)'];

export const FarmerAssistant: React.FC<FarmerAssistantProps> = ({ selectedLanguage }) => {
  const { isRTL } = useLanguage();
  const [query, setQuery] = useState('');
  const [crop, setCrop] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (textToSend?: string) => {
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
          language: selectedLanguage,
          cropType: crop,
        }),
      });

      if (!res.ok) throw new Error('Failed to consult farmer advisory.');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error consulting agricultural engine.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <Sprout className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {isRTL ? 'کسان زرعی معاون (Kissan AI Advisory)' : 'Kissan Agricultural Advisory AI'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Crop pest diagnosis, organic remedies, fertilizer schedules, and mandi market rates
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Select Crop:</span>
          {CROPS.map((c, i) => (
            <button
              key={i}
              onClick={() => setCrop(crop === c ? '' : c)}
              className={`text-xs px-2.5 py-1 rounded-xl border transition-colors ${
                crop === c
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)]'
              }`}
            >
              {c}
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
                ? 'فصل کی بیماری یا کھاد کے بارے میں سوال پوچھیں...'
                : 'Ask about crop disease, pesticide spray timing, or organic treatment...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
          <button
            onClick={() => handleAsk()}
            disabled={!query.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isRTL ? 'مشورہ لیں' : 'Ask'}</span>
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
          <span>Analyzing crop condition and agricultural guidelines...</span>
        </div>
      )}

      {result && !isLoading && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
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
