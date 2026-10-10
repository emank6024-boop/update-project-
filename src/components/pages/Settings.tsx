import React from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Globe2,
  Eye,
  Volume2,
  Type,
  Shield,
  Sparkles,
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
  const { openVoiceModal, voiceSettings } = useVoiceSettings();
  const { isRTL } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {isRTL ? 'ترتیبات و رسائی (Accessibility & Settings)' : 'Accessibility, Language & Display Settings'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Customize language, interface theme, accessibility aids, and voice narration
          </p>
        </div>
      </div>

      {/* Visual Themes */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
          <Palette className="w-4 h-4 text-emerald-600" />
          <span>{isRTL ? 'تھیم اور رنگین انداز (Visual Theme)' : 'Theme & Color Palette'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {THEMES_LIST.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                theme === t.id
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-[var(--surface-secondary)]'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: t.previewAccent }}
                />
                <span className="text-xs font-bold text-[var(--text-primary)]">{t.name}</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Language Selection */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
          <Globe2 className="w-4 h-4 text-emerald-600" />
          <span>{isRTL ? 'انٹرفیس زبان (Language)' : 'System Language'}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => onLanguageChange(l.code)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedLanguage === l.code
                  ? 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface)]'
              }`}
            >
              <span className="text-base mr-1.5">{l.flag}</span>
              <span className="text-xs font-semibold">{l.nativeName}</span>
              <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Accessibility Toggles */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
          <Eye className="w-4 h-4 text-emerald-600" />
          <span>{isRTL ? 'خصوصی رسائی کی سہولیات (Accessibility)' : 'Accessibility Modes'}</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">
                {isRTL ? 'ہائی کنٹراسٹ موڈ' : 'High Contrast Mode'}
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Amplifies borders and color differentiation for low-vision users
              </p>
            </div>
            <button
              onClick={onToggleHighContrast}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                highContrast ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  highContrast ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">
                {isRTL ? 'آسان موڈ (سادہ انٹرفیس)' : 'Simple Mode (Low Literacy)'}
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Simplified layout with prominent icons and clear large action buttons
              </p>
            </div>
            <button
              onClick={onToggleSimpleMode}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                simpleMode ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  simpleMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">
                {isRTL ? 'صوتی فیڈ بیک کی رفتار اور پچ' : 'Voice Feedback Configuration'}
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Adjust narration speed ({voiceSettings.rate}x) and test speech synthesizer
              </p>
            </div>
            <button
              onClick={openVoiceModal}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>ترتیب دیں</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
