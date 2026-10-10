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

const POPULAR_SERVICES = [
  'NADRA Smart CNIC New & Renewal',
  'Passport Application & Renewal (DGIP)',
  'BISP 8171 Financial Eligibility',
  'FBR Tax Return & Active Taxpayer List (ATL)',
  'Vehicle Verification & Token Tax',
  'Driving License Online Application',
];

export const GovernmentAssistant: React.FC<GovernmentAssistantProps> = ({ selectedLanguage }) => {
  const { isRTL } = useLanguage();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {isRTL ? 'سرکاری و نادرا خدمات رہنمائی' : 'Civic & NADRA Public Service Guide'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Step-by-step verified procedures, official fees, required documents, and official portals
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={
              isRTL
                ? 'نادرا کارڈ، پاسپورٹ، ایف بی آر یا بی آئی ایس پی کا طریقہ کار تلاش کریں...'
                : 'Search any civic procedure (e.g., NADRA Smart NIC fees, Passport renewal, BISP 8171)...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isRTL ? 'تلاش کریں' : 'Search'}</span>
          </button>
        </div>

        {/* Quick Pills */}
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap gap-2">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] py-1">Quick:</span>
          {POPULAR_SERVICES.map((srv, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(srv);
                handleSearch(srv);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--surface-secondary)] hover:bg-emerald-500/10 hover:text-emerald-600 border border-[var(--border)] text-[var(--text-secondary)] transition-colors"
            >
              {srv}
            </button>
          ))}
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
          <span>Consulting verified civic knowledge base...</span>
        </div>
      )}

      {result && !isLoading && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {result.serviceName || 'Civic Procedure Guide'}
            </h3>
            {result.officialPortal && (
              <a
                href={result.officialPortal.startsWith('http') ? result.officialPortal : `https://${result.officialPortal}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <span>{result.officialPortal}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="prose prose-xs dark:prose-invert max-w-none text-xs leading-relaxed text-[var(--text-primary)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.guidance || result.reply || result.text || ''}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
