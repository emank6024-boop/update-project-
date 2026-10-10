import React, { useState } from 'react';
import {
  HandHelping,
  Search,
  RefreshCw,
  Sparkles,
  BookOpen,
  AlertCircle,
  Eye,
  Layers,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface SignLanguageAssistantProps {
  selectedLanguage: LanguageCode;
}

const COMMON_PSL_SIGNS = [
  'السلام علیکم (Greetings)',
  'شکریہ (Thank you)',
  'میرا نام علی ہے (My name is Ali)',
  'پانی چاہیے (Want water)',
  'ہسپتال کہاں ہے؟ (Where is hospital?)',
  'مدد چاہیے (Need help)',
];

export const SignLanguageAssistant: React.FC<SignLanguageAssistantProps> = ({ selectedLanguage }) => {
  const { isRTL } = useLanguage();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (inputSign?: string) => {
    const query = (inputSign || text).trim();
    if (!query || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/psl/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: query,
          language: selectedLanguage,
        }),
      });

      if (!res.ok) throw new Error('Sign language lookup failed.');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error processing sign language breakdown.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center border border-teal-500/20">
          <HandHelping className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {isRTL ? 'پاکستان اشاروں کی زبان (Pakistan Sign Language - PSL)' : 'Pakistan Sign Language (PSL) Assistant'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Standardized Deaf Reach & FESF Pakistani Sign Language gestures, hand shapes, and grammar gloss
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Common Phrases:</span>
          {COMMON_PSL_SIGNS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setText(s);
                handleLookup(s);
              }}
              className="text-xs px-2.5 py-1 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-teal-600 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder={
              isRTL
                ? 'اردو یا انگریزی میں جملہ یا لفظ درج کریں...'
                : 'Type any phrase or word to see its PSL physical sign execution...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
          <button
            onClick={() => handleLookup()}
            disabled={!text.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isRTL ? 'اشارہ دیکھیں' : 'Show Signs'}</span>
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
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
          <span>Formulating Pakistani Sign Language hand postures and motion dynamics...</span>
        </div>
      )}

      {result && !isLoading && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-6">
          <div className="pb-3 border-b border-[var(--border)]">
            <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">PSL Gloss Order</span>
            <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">{result.pslGloss}</h3>
            {result.meaning && (
              <p className="text-xs text-[var(--text-secondary)] mt-1">{result.meaning}</p>
            )}
          </div>

          {result.signs && Array.isArray(result.signs) && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>Physical Gesture Instructions:</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.signs.map((sign: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[var(--text-primary)]">{sign.word}</span>
                      <span className="text-xs font-bold text-teal-600">{sign.urdu}</span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p>
                        <strong className="text-[var(--text-muted)]">Hand Shape:</strong> {sign.handShape}
                      </p>
                      <p>
                        <strong className="text-[var(--text-muted)]">Location:</strong> {sign.location}
                      </p>
                      <p>
                        <strong className="text-[var(--text-muted)]">Movement:</strong> {sign.movement}
                      </p>
                      {sign.facialExpression && (
                        <p>
                          <strong className="text-[var(--text-muted)]">Facial Expression:</strong>{' '}
                          {sign.facialExpression}
                        </p>
                      )}
                    </div>

                    {sign.instruction && (
                      <div className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--text-primary)] font-medium leading-relaxed">
                        {sign.instruction}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
