import React, { useState, useCallback } from 'react';
import {
  Languages,
  ArrowRightLeft,
  Volume2,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Mic,
  Square,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { useVoiceSettings } from '../../context/VoiceSettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSpeechRecognition } from '../../utils/useSpeechRecognition';
import { AudioControlBar } from '../AudioControlBar';

interface LiveTranslatorProps {
  selectedLanguage: LanguageCode;
}

export const LiveTranslator: React.FC<LiveTranslatorProps> = () => {
  const { speak, stopSpeaking, isSpeaking } = useVoiceSettings();
  const { t, isRTL } = useLanguage();

  // Translator source and target operate INDEPENDENTLY of the website interface language
  const [sourceLang, setSourceLang] = useState<LanguageCode>('en');
  const [targetLang, setTargetLang] = useState<LanguageCode>('ur');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [phoneticText, setPhoneticText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);

  const performTranslate = useCallback(
    async (textToTranslate: string, src: LanguageCode = sourceLang, tgt: LanguageCode = targetLang) => {
      if (!textToTranslate.trim() || isLoading) return;
      setIsLoading(true);
      setErrorNotice(null);
      setAudioNotice(null);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToTranslate.trim(),
            sourceLang: src,
            targetLang: tgt,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.error || errorData.message || t('common.error', 'Translation service temporarily unavailable.')
          );
        }
        const data = await res.json();
        setTranslatedText(data.translatedText || '');
        setPhoneticText(data.phoneticText || '');
      } catch (err: any) {
        setErrorNotice(err.message || t('common.error', 'Translation error occurred. Please try again.'));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sourceLang, targetLang, t]
  );

  const {
    isListening,
    isTranscribing,
    error: sttError,
    toggleListening,
  } = useSpeechRecognition({
    language: sourceLang,
    onTranscript: (spokenText) => {
      const nextText = `${inputText ? inputText + ' ' : ''}${spokenText}`.trim();
      setInputText(nextText);
      performTranslate(nextText, sourceLang, targetLang);
    },
  });

  const handleTranslate = () => {
    performTranslate(inputText, sourceLang, targetLang);
  };

  const handleSwap = () => {
    const prevSource = sourceLang;
    const prevTarget = targetLang;
    const prevInput = inputText;
    const prevTrans = translatedText;

    setSourceLang(prevTarget);
    setTargetLang(prevSource);
    setInputText(prevTrans);
    setTranslatedText(prevInput);
    setPhoneticText('');
    setAudioNotice(null);
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleListenSourceAudio = async () => {
    if (!inputText.trim()) return;
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    setAudioNotice(null);
    await speak(inputText, sourceLang);
  };

  const srcIsRTL = ['ur', 'pa', 'sd', 'ps', 'bal', 'skr', 'hnd', 'ks', 'brh'].includes(sourceLang);
  const tgtIsRTL = ['ur', 'pa', 'sd', 'ps', 'bal', 'skr', 'hnd', 'ks', 'brh'].includes(targetLang);

  return (
    <div
      className="w-full max-w-full min-w-0 space-y-6 py-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
          <Languages className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[var(--text-primary)] break-words">
            {t('translator.title', 'Regional Live Translator')}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            {t(
              'translator.subtitle',
              'Instant bilingual and regional translation with Roman phonetics across Pakistan’s major languages'
            )}
          </p>
        </div>
      </div>

      {/* Notice about independent language selectors */}
      <div className="p-3.5 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-muted)] flex items-start gap-2.5 min-w-0">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span className="min-w-0 break-words">
          {t(
            'translator.independentNotice',
            'Interface language and translation targets operate independently. You can translate between any supported languages without changing your menu language.'
          )}
        </span>
      </div>

      {/* Language Selector Bar */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-wrap items-center justify-between gap-3 min-w-0">
        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1 sm:flex-initial">
          <span className="text-xs font-semibold text-[var(--text-muted)] shrink-0">
            {t('translator.sourceLang', 'Source Language')}:
          </span>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value as LanguageCode)}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer min-w-0 max-w-full"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleSwap}
          className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition-colors cursor-pointer shrink-0"
          title={t('translator.swap', 'Swap Languages')}
        >
          <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
        </button>

        <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1 sm:flex-initial">
          <span className="text-xs font-semibold text-[var(--text-muted)] shrink-0">
            {t('translator.targetLang', 'Target Language')}:
          </span>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer min-w-0 max-w-full"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.nativeName} ({l.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {(errorNotice || sttError) && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2 min-w-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="min-w-0 break-words">{errorNotice || sttError}</span>
        </div>
      )}

      {audioNotice && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2 min-w-0">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1 min-w-0">
            <span className="font-semibold block">{t('common.notice', 'Notice')}</span>
            <span className="break-words">{audioNotice}</span>
          </div>
        </div>
      )}

      {/* Translation Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
        {/* Source Box */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between space-y-3 min-w-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
              <span>{SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang)?.nativeName}</span>
              <span>{inputText.length} chars</span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('translator.inputPlaceholder', 'Type or paste text to translate...')}
              rows={6}
              dir={srcIsRTL ? 'rtl' : 'ltr'}
              className="w-full bg-transparent border-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden resize-none font-medium leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                disabled={isTranscribing}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                    : 'bg-[var(--surface-secondary)] hover:bg-[var(--accent-subtle)] text-[var(--text-primary)] border-[var(--border)]'
                }`}
                title={t('assistant.listenControl', 'Voice Input')}
              >
                {isListening ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>{t('voice.stopBtn', 'Stop')}</span>
                  </>
                ) : isTranscribing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('common.loading', 'Transcribing...')}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('assistant.mic', 'Mic')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleListenSourceAudio}
                disabled={!inputText.trim()}
                className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] disabled:opacity-30 transition-colors cursor-pointer"
                title={t('translator.listen', 'Listen')}
              >
                <Volume2 className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setTranslatedText('');
                  setPhoneticText('');
                  setErrorNotice(null);
                  setAudioNotice(null);
                }}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 py-1 cursor-pointer"
              >
                {t('common.clear', 'Clear')}
              </button>
            </div>

            <button
              type="button"
              onClick={handleTranslate}
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>
                {isLoading ? t('translator.translating', 'Translating...') : t('translator.translateBtn', 'Translate')}
              </span>
            </button>
          </div>
        </div>

        {/* Target Box */}
        <div className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] flex flex-col justify-between space-y-3 min-w-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
              <span>{SUPPORTED_LANGUAGES.find((l) => l.code === targetLang)?.nativeName}</span>
              {translatedText && <span>{translatedText.length} chars</span>}
            </div>

            <div className="min-h-[144px]" dir={tgtIsRTL ? 'rtl' : 'ltr'}>
              {translatedText ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed select-text">
                    {translatedText}
                  </p>
                  {phoneticText && (
                    <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-secondary)]" dir="ltr">
                      <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase tracking-wider mb-0.5">
                        {t('translator.romanPhonetics', 'Roman Urdu / Phonetic:')}
                      </span>
                      <span>{phoneticText}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] italic pt-4">
                  {t('translator.outputPlaceholder', 'Translation will appear here...')}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!translatedText}
                className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--text-secondary)] disabled:opacity-30 transition-colors cursor-pointer"
                title={t('translator.copy', 'Copy')}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>

              {translatedText && (
                <AudioControlBar text={translatedText} language={targetLang} compact={true} />
              )}
            </div>

            {copied && (
              <span className="text-xs font-semibold text-emerald-600">
                {t('translator.copied', 'Copied!')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
