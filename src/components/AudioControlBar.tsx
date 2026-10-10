import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Pause,
  Play,
  Square,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { useVoiceSettings, detectSpeechLanguage } from '../context/VoiceSettingsContext';
import { useLanguage } from '../context/LanguageContext';

interface AudioControlBarProps {
  text: string;
  language?: LanguageCode;
  label?: string;
  compact?: boolean;
  className?: string;
}

export const AudioControlBar: React.FC<AudioControlBarProps> = ({
  text,
  language,
  label,
  compact = false,
  className = '',
}) => {
  const { currentLanguage, t } = useLanguage();
  const {
    speak,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    isSpeaking,
    isPaused,
    isLoadingAudio,
  } = useVoiceSettings();

  const [isThisActive, setIsThisActive] = useState(false);

  const targetLang = (language || currentLanguage.code || 'ur') as LanguageCode;
  const detectedLangCode = detectSpeechLanguage(text || '', targetLang);
  const langMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === detectedLangCode) ||
    SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) ||
    currentLanguage;

  // Reset local active state when global playback stops
  useEffect(() => {
    if (!isSpeaking && !isPaused && !isLoadingAudio && isThisActive) {
      setIsThisActive(false);
    }
  }, [isSpeaking, isPaused, isLoadingAudio, isThisActive]);

  if (!text || !text.trim()) return null;

  const handlePlay = async () => {
    setIsThisActive(true);
    const ok = await speak(text, detectedLangCode);
    if (!ok) {
      setIsThisActive(false);
    }
  };

  const handleReplay = async () => {
    stopSpeaking();
    setIsThisActive(true);
    const ok = await speak(text, detectedLangCode);
    if (!ok) {
      setIsThisActive(false);
    }
  };

  const handleStop = () => {
    stopSpeaking();
    setIsThisActive(false);
  };

  const activePlaying = isThisActive && isSpeaking && !isPaused;
  const activePaused = isThisActive && isPaused;
  const activeLoading = isThisActive && isLoadingAudio;

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1.5 min-w-0 max-w-full ${className}`}
      role="group"
      aria-label={label || 'Audio playback controls'}
    >
      {/* Listen / Play Button (when idle) */}
      {!activePlaying && !activePaused && !activeLoading && (
        <button
          type="button"
          onClick={handlePlay}
          className={`inline-flex items-center gap-1.5 ${
            compact ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs'
          } rounded-xl bg-[var(--accent-subtle)] hover:bg-[var(--button-primary-bg)] text-[var(--accent-text)] hover:text-[var(--button-primary-text)] border border-[var(--accent-border)] font-semibold transition-all cursor-pointer shadow-2xs`}
          title={`Listen in ${langMeta.name} (${langMeta.nativeName})`}
        >
          <Volume2 className="w-3.5 h-3.5 shrink-0" />
          <span>{label || t('voice.listenBtn', 'Listen Audio')}</span>
          <span className="opacity-80 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-black/5 dark:bg-white/10">
            {langMeta.nativeName}
          </span>
        </button>
      )}

      {/* Loading Indicator */}
      {activeLoading && (
        <span
          className={`inline-flex items-center gap-1.5 ${
            compact ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs'
          } rounded-xl bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold`}
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>{t('voice.preparingAudio', 'Preparing Audio...')}</span>
        </span>
      )}

      {/* Pause Button (when playing) */}
      {activePlaying && (
        <button
          type="button"
          onClick={pauseSpeaking}
          className={`inline-flex items-center gap-1.5 ${
            compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
          } rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold transition-all cursor-pointer`}
          title="Pause audio playback"
        >
          <Pause className="w-3.5 h-3.5 shrink-0" />
          <span>{t('voice.pauseBtn', 'Pause')}</span>
        </button>
      )}

      {/* Resume Button (when paused) */}
      {activePaused && (
        <button
          type="button"
          onClick={resumeSpeaking}
          className={`inline-flex items-center gap-1.5 ${
            compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
          } rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold transition-all cursor-pointer`}
          title="Resume audio playback"
        >
          <Play className="w-3.5 h-3.5 shrink-0" />
          <span>{t('voice.resumeBtn', 'Resume')}</span>
        </button>
      )}

      {/* Stop & Replay Buttons (when active) */}
      {(activePlaying || activePaused || activeLoading) && (
        <>
          <button
            type="button"
            onClick={handleStop}
            className={`inline-flex items-center gap-1 ${
              compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
            } rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-semibold transition-all cursor-pointer`}
            title="Stop audio playback"
          >
            <Square className="w-3 h-3 fill-current shrink-0" />
            <span>{t('voice.stopBtn', 'Stop')}</span>
          </button>

          <button
            type="button"
            onClick={handleReplay}
            className={`inline-flex items-center gap-1 ${
              compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
            } rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] font-semibold transition-all cursor-pointer`}
            title="Replay audio from start"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>{t('voice.replayBtn', 'Replay')}</span>
          </button>
        </>
      )}
    </div>
  );
};
