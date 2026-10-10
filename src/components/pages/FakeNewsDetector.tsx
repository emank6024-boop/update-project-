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
  const { isRTL } = useLanguage();
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
          color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        };
      case 'FALSE_HOAX':
      case 'MALICIOUS_PHISHING':
        return {
          color: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
          icon: <XCircle className="w-5 h-5 text-rose-600" />,
        };
      case 'MISLEADING_MANIPULATED':
      case 'UNSUBSTANTIATED_RUMOR':
      default:
        return {
          color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {isRTL ? 'حقائق کی تصدیق و افواہ نگاری کی روک تھام' : 'Fact Check & Misinformation Detector'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Forensic evaluation of viral WhatsApp forwards, news headlines, banking notices, and civic claims
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder={
            isRTL
              ? 'سوشل میڈیا یا واٹس ایپ پر گردش کرنے والا پیغام یا دعویٰ یہاں پیسٹ کریں...'
              : 'Paste viral WhatsApp message, claim, or news headline here for fact-checking...'
          }
          className="w-full min-h-[100px] p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden resize-none"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => handleVerify()}
            disabled={!claim.trim() || isLoading}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isRTL ? 'حقائق کی تصدیق کریں' : 'Verify Claim'}</span>
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
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-600" />
          <span>Cross-referencing Pakistani official gazettes and trusted registries...</span>
        </div>
      )}

      {result && !isLoading && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-6">
          {/* Verdict Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
              getVerdictBadge(result.verdict).color
            }`}
          >
            <div className="flex items-center gap-3">
              {getVerdictBadge(result.verdict).icon}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block">Official Verdict</span>
                <h3 className="text-base font-bold">{result.verdictTitle || result.verdict}</h3>
              </div>
            </div>
            {result.confidence && (
              <div className="text-right">
                <span className="text-[10px] uppercase block font-semibold">Confidence:</span>
                <span className="text-sm font-extrabold">{result.confidence}%</span>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1">Summary Analysis:</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{result.summary}</p>
          </div>

          {result.evidence && Array.isArray(result.evidence) && result.evidence.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)] mb-2">Key Evidence & Facts:</h4>
              <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                {result.evidence.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.verificationAdvice && (
            <div className="p-3.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)]">
              <span className="font-semibold block text-[11px] text-amber-600 mb-0.5">Citizen Advice:</span>
              <p>{result.verificationAdvice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
