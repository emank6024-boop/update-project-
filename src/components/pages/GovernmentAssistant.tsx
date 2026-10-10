import React, { useState } from 'react';
import {
  Building2,
  Search,
  RefreshCw,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Coins,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

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
    { label: t('government.nadra', 'NADRA Smart NIC & CRC'), query: 'NADRA Smart CNIC renewal procedure, fees, and required documents in Pakistan' },
    { label: t('government.passport', 'Directorate of Passports'), query: 'Online passport renewal steps, urgent vs normal fee, and delivery in Pakistan' },
    { label: t('government.bisp', 'BISP Kafalat 8171'), query: 'How to check BISP 8171 eligibility and Tehsil registration for financial assistance' },
    { label: t('government.fbr', 'FBR Iris Tax Returns'), query: 'FBR active taxpayer list (ATL) registration, tax return filing, and withholding tax reduction' },
  ];

  const handleSearch = async (searchQuery?: string) => {
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

      if (!res.ok) throw new Error('Service lookup failed.');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching civic instructions.');
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

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t(
              'government.searchPlaceholder',
              'Search NADRA Smart Card, Passport renewal, BISP 8171, or FBR tax registration...'
            )}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
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
              {result.steps || result.guidance || result.answer || result.text || ''}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
