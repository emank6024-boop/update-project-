import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Globe2,
  Eye,
  Volume2,
  Type,
  Shield,
  Sparkles,
  Check,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { useTheme, THEMES_LIST } from '../../context/ThemeContext';
import { useVoiceSettings } from '../../context/VoiceSettingsContext';
import { useLanguage } from '../../context/LanguageContext';

interface SettingsProps {
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  simpleMode: boolean;
  onToggleSimpleMode: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  selectedLanguage,
  onLanguageChange,
  highContrast,
  onToggleHighContrast,
  simpleMode,
  onToggleSimpleMode,
}) => {
  const { theme, setTheme } = useTheme();
  const { openVoiceModal, voiceSettings, updateVoiceSettings } = useVoiceSettings();
  const { isRTL, t, setSelectedLanguage: setGlobalLanguage } = useLanguage();
  const [saveBanner, setSaveBanner] = useState(false);

  const handleLangChange = (code: LanguageCode) => {
    onLanguageChange(code);
    setGlobalLanguage(code);
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2500);
  };

  return (
    <div
      className="max-w-4xl mx-auto space-y-6 py-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {t('settings.title', 'Accessibility, Language & Display Settings')}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            {t('settings.subtitle', 'Customize language, interface theme, accessibility aids, and voice narration')}
          </p>
        </div>
      </div>

      {saveBanner && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{t('settings.saveSuccess', 'Settings updated successfully.')}</span>
        </div>
      )}

      {/* Visual Themes */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
          <Palette className="w-4 h-4 text-emerald-600" />
          <span>{t('settings.themeTitle', 'Theme & Color Palette')}</span>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          {t('settings.themeDesc', 'Select your preferred visual scheme and contrast balance')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {THEMES_LIST.map((th) => (
            <button
              key={th.id}
              onClick={() => setTheme(th.id)}
              className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                theme === th.id
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-[var(--surface-secondary)]'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: th.previewAccent }}
                />
                <span className="text-xs font-bold text-[var(--text-primary)]">{th.name}</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">{th.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Language Selection */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
          <Globe2 className="w-4 h-4 text-emerald-600" />
          <span>{t('settings.languageTitle', 'System Interface Language')}</span>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          {t('settings.languageDesc', 'Choose your preferred language across all menus, forms, and pages')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => handleLangChange(l.code)}
              className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                selectedLanguage === l.code
                  ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                  : 'border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface)]'
              }`}
            >
              <div className="text-lg mb-1">{l.flag}</div>
              <div className="text-xs font-bold text-[var(--text-primary)]">{l.nativeName}</div>
              <div className="text-[10px] text-[var(--text-muted)]">{l.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Accessibility Toggles */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
          <Eye className="w-4 h-4 text-emerald-600" />
          <span>{t('settings.accessibilityTitle', 'Accessibility Aids')}</span>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {/* High Contrast */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)]">
                {t('settings.highContrast', 'High Contrast Mode')}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {t('settings.highContrastDesc', 'Enhanced text border separation and vivid color outlines for low-vision users')}
              </div>
            </div>
            <button
              onClick={onToggleHighContrast}
              className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                highContrast ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  highContrast ? (isRTL ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Simple Mode */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)]">
                {t('settings.simpleMode', 'Simplified Interface Mode')}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {t('settings.simpleModeDesc', 'Hides decorative elements and shows large touch-friendly buttons for elder citizens')}
              </div>
            </div>
            <button
              onClick={onToggleSimpleMode}
              className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                simpleMode ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  simpleMode ? (isRTL ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Voice Feedback Modal Trigger */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)]">
                {t('settings.voiceFeedback', 'Voice Feedback on Interactions')}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {t('settings.voiceFeedbackDesc', 'Audibly narrates confirmations and key responses when supported')}
              </div>
            </div>
            <button
              onClick={openVoiceModal}
              className="px-3 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-xs font-semibold text-emerald-600 cursor-pointer"
            >
              {t('nav.voiceSettings', 'Configure Voice')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
