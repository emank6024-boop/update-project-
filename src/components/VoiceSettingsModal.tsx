import React from 'react';
import { useVoiceSettings } from '../context/VoiceSettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { Volume2, VolumeX, X, Play, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const VoiceSettingsModal: React.FC = () => {
  const {
    isModalOpen,
    closeVoiceModal,
    voiceSettings,
    updateVoiceSettings,
    speak,
    isSpeaking,
    stopSpeaking,
    checkVoiceSupport,
    voiceNotice,
    clearVoiceNotice,
  } = useVoiceSettings();

  const { t, selectedLanguage, currentLanguage, isRTL } = useLanguage();

  if (!isModalOpen) return null;

  const support = checkVoiceSupport(selectedLanguage);

  const handleTestVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const testSample = t(
        'hero.title',
        'Empowering Every Pakistani Through AI, Language, and Accessibility'
      );
      speak(testSample, selectedLanguage);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-md bg-[var(--surface)] text-[var(--text-primary)] rounded-2xl border border-[var(--border)] shadow-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {t('nav.voiceSettings', 'Voice Audio Settings')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {currentLanguage.nativeName} ({currentLanguage.name})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              clearVoiceNotice();
              closeVoiceModal();
            }}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Support Status Indicator */}
        <div className="mt-4 p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs flex items-start gap-2.5">
          {support.isSupported ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <span className="font-semibold text-[var(--text-primary)]">
              {support.isSupported ? 'Native Audio Supported' : 'Speech Engine Notice'}
            </span>
            <p className="text-[11px] text-[var(--text-muted)]">{support.message}</p>
          </div>
        </div>

        {voiceNotice && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{voiceNotice}</span>
            </div>
          </div>
        )}

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {t('settings.voiceFeedback', 'Enable Voice Feedback')}
            </span>
            <button
              type="button"
              onClick={() => updateVoiceSettings({ enabled: !voiceSettings.enabled })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                voiceSettings.enabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  voiceSettings.enabled ? (isRTL ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--text-secondary)]">
                {t('settings.speechRate', 'Speech Rate')}
              </span>
              <span className="font-semibold text-emerald-600">{voiceSettings.rate}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={voiceSettings.rate}
              onChange={(e) => updateVoiceSettings({ rate: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--text-secondary)]">
                Pitch
              </span>
              <span className="font-semibold text-emerald-600">{voiceSettings.pitch}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={voiceSettings.pitch}
              onChange={(e) => updateVoiceSettings({ pitch: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestVoice}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-4 h-4" />
              {isSpeaking ? t('translator.stop', 'Stop') : 'Test Audio'}
            </button>
            <button
              type="button"
              onClick={() => updateVoiceSettings({ rate: 1.0, pitch: 1.0, volume: 1.0, enabled: true })}
              className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-[var(--text-muted)] transition-colors cursor-pointer"
              title="Reset Voice Settings"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
