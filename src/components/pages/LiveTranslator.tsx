import React, { useState } from 'react';
import {
  Languages,
  ArrowRightLeft,
  Volume2,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { useVoiceSettings } from '../../context/VoiceSettingsContext';

interface LiveTranslatorProps {
  selectedLanguage: LanguageCode;
}

export const LiveTranslator: React.FC<LiveTranslatorProps> = ({ selectedLanguage }) => {
  const { speak } = useVoiceSettings();

  const [sourceLang, setSourceLang] = useState<LanguageCode>('en');
  const [targetLang, setTargetLang] = useState<LanguageCode>(selectedLanguage || 'ur');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [phoneticText, setPhoneticText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          sourceLang,
          targetLang,
        }),
      });

      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      setTranslatedText(data.translatedText || '');
      setPhoneticText(data.phoneticText || '');
    } catch (err: any) {
      alert(err.message || 'Translation error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <Languages className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">پاکستانی علاقائی لائیو مترجم (Live Translator)</h1>
          <p className="text-xs text-[var(--text-secondary)]">Instant bilingual translation with Roman phonetics across Pakistan's major languages</p>
        </div>
      </div>

      {/* Language Selector Bar */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Source:</span>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value as LanguageCode)}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)]"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSwap}
          className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition-colors"
          title="Swap Languages"
        >
          <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Target:</span>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs font-medium text-[var(--text-primary)]"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Text Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Box */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col min-h-[260px]">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste sentences here..."
            className="w-full flex-1 p-2 bg-transparent resize-none text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden leading-relaxed"
          />
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">{inputText.length} characters</span>
            <button
              onClick={handleTranslate}
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>ترجمہ کریں (Translate)</span>
            </button>
          </div>
        </div>

        {/* Target Box */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col min-h-[260px]">
          <div className="flex-1 p-2 overflow-y-auto">
            {translatedText ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                  {translatedText}
                </p>
                {phoneticText && (
                  <div className="p-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-muted)] italic">
                    <span className="font-semibold not-italic block text-[10px] text-emerald-600 uppercase">
                      Roman Phonetics:
                    </span>
                    {phoneticText}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] italic">Translation will appear here...</p>
            )}
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">
              {translatedText ? `${translatedText.length} characters` : ''}
            </span>
            <div className="flex items-center gap-1.5">
              {translatedText && (
                <>
                  <button
                    onClick={() => speak(translatedText, targetLang)}
                    className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition-colors"
                    title="Pronounce"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition-colors"
                    title="Copy translation"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
