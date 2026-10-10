import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface FakeNewsDetectorProps {
  selectedLanguage: LanguageCode;
}

export const FakeNewsDetector: React.FC<FakeNewsDetectorProps> = ({ selectedLanguage }) => {
  const { isRTL, t, currentLanguage } = useLanguage();
  const [claim, setClaim] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (textToVerify?: string) => {
    const text = (textToVerify || claim).trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/fact-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: text,
          language: selectedLanguage,
        }),
      });

      if (!res.ok) throw new Error('Verification failed.');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error communicating with verification service.');
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'VERIFIED_TRUE':
        return {
          label: t('factCheck.verifiedTrue', 'Verified True'),
          color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        };
      case 'FALSE_HOAX':
        return {
          label: t('factCheck.falseHoax', 'False / Fabricated Claim'),
          color: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
          icon: <XCircle className="w-5 h-5 text-rose-600" />,
        };
      case 'MISLEADING_OUT_OF_CONTEXT':
        return {
          label: t('factCheck.misleading', 'Misleading / Out of Context'),
          color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        };
      default:
        return {
          label: t('factCheck.unverified', 'Unverified / Disputed'),
          color: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
          icon: <HelpCircle className="w-5 h-5 text-gray-600" />,
        };
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto space-y-6 py-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {t('factCheck.title', 'Fact Check & Claim Verification')}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
              {currentLanguage.nativeName}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {t(
              'factCheck.subtitle',
              'Forensic verification of viral WhatsApp forwards, news headlines, and social media claims in Pakistan'
            )}
          </p>
        </div>
      </div>

      {/* Verification Input */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            placeholder={t(
              'factCheck.searchPlaceholder',
              'Paste viral message, headline, or claim to verify...'
            )}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
          <button
            onClick={() => handleVerify()}
            disabled={!claim.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>{t('factCheck.inquireBtn', 'Verify Claim')}</span>
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
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            {(() => {
              const badge = getVerdictBadge(result.verdict);
              return (
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${badge.color}`}>
                  {badge.icon}
                  <span>{badge.label}</span>
                </div>
              );
            })()}

            {result.confidenceScore && (
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                {t('factCheck.confidence', 'Confidence')}: {result.confidenceScore}%
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {t('factCheck.analysisHeading', 'Analysis & Official Findings')}
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
              {result.explanation || result.analysis || result.answer || ''}
            </p>
          </div>
        </div>
      )}

      {/* How it works info cards */}
      <div className="p-6 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          {t('factCheck.howItWorks', 'How PakLingo Verifies Information')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[var(--text-secondary)]">
          <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="font-bold block text-emerald-600 mb-1">1. Gazettes & Portals</span>
            {t('factCheck.step1', 'Cross-references official government gazettes, news wires, and state regulators.')}
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="font-bold block text-emerald-600 mb-1">2. Anomaly Detection</span>
            {t('factCheck.step2', 'Detects manipulated quotes, altered dates, and fabricated notifications.')}
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="font-bold block text-emerald-600 mb-1">3. Clear Verdict</span>
            {t('factCheck.step3', 'Provides a clear verdict, corroborating sources, and context in your language.')}
          </div>
        </div>
      </div>
    </div>
  );
};
