import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Globe2,
  Eye,
  Volume2,
  Check,
  Sun,
  Moon,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Pipette,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import {
  useTheme,
  ACCENT_PRESETS,
  DEFAULT_ACCENT_HEX,
  DEFAULT_ACCENT_ID,
  isValidHexInput,
  normalizeHex,
} from '../../context/ThemeContext';
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
  const {
    mode,
    setMode,
    isDark,
    accentId,
    accentColor,
    customHex,
    setAccentPreset,
    setCustomAccentColor,
    resetThemeToDefault,
    contrastInfo,
  } = useTheme();
  const { openVoiceModal, settings: voiceSettings, updateSettings: updateVoiceSettings } = useVoiceSettings();
  const { isRTL, t, setSelectedLanguage: setGlobalLanguage } = useLanguage();
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [hexDraft, setHexDraft] = useState(accentColor.toUpperCase());

  useEffect(() => {
    setHexDraft(accentColor.toUpperCase());
  }, [accentColor]);

  const showConfirmation = (msg: string) => {
    setSaveBanner(msg);
    setTimeout(() => setSaveBanner(null), 2600);
  };

  const handleLangChange = (code: LanguageCode) => {
    onLanguageChange(code);
    setGlobalLanguage(code);
    showConfirmation(t('settings.saveSuccess', 'Settings updated successfully.'));
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexDraft(val);
    if (isValidHexInput(val)) {
      setCustomAccentColor(normalizeHex(val));
    }
  };

  const handleHexInputBlur = () => {
    if (isValidHexInput(hexDraft)) {
      const norm = normalizeHex(hexDraft);
      setCustomAccentColor(norm);
      setHexDraft(norm.toUpperCase());
    } else {
      setHexDraft(accentColor.toUpperCase());
    }
  };

  const handleResetDefault = () => {
    resetThemeToDefault();
    setHexDraft(DEFAULT_ACCENT_HEX.toUpperCase());
    showConfirmation(
      t('settings.themeResetSuccess', 'Restored default PakLingo AI Emerald theme.')
    );
  };

  const isDefaultTheme = mode === 'light' && accentId === DEFAULT_ACCENT_ID;

  return (
    <div
      className="w-full space-y-6 py-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent-text)] flex items-center justify-center border border-[var(--accent-border)]">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {t('settings.title', 'Accessibility, Language & Theme Settings')}
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {t(
                'settings.subtitle',
                'Personalize your accent color, Light/Dark mode, interface language, and accessibility aids'
              )}
            </p>
          </div>
        </div>

        {/* Reset to Default Theme Button */}
        <button
          type="button"
          id="reset-default-theme-btn"
          onClick={handleResetDefault}
          disabled={isDefaultTheme}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--text-primary)] transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
          aria-label="Reset theme and accent color to PakLingo AI Emerald default"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[var(--accent-text)]" />
          <span>{t('settings.resetDefault', 'Reset to Default (Emerald)')}</span>
        </button>
      </div>

      {/* Semantic Save Notification Banner (Always semantic emerald green) */}
      {saveBanner && (
        <div
          role="status"
          className="keep-emerald status-success p-3 rounded-xl bg-[#10b981]/12 border border-[#10b981]/30 text-[#065f46] dark:text-[#6ee7b7] text-xs flex items-center gap-2 shadow-2xs"
        >
          <CheckCircle2 className="w-4 h-4 text-[#059669] dark:text-[#34d399] shrink-0" />
          <span className="font-semibold">{saveBanner}</span>
        </div>
      )}

      {/* 1. APPEARANCE MODE & CUSTOM THEME COLOR PICKER */}
      <section
        aria-labelledby="theme-color-heading"
        className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
              <Palette className="w-4 h-4 text-[var(--accent-text)]" />
              <h2 id="theme-color-heading">
                {t('settings.themeTitle', 'Theme Mode & Custom Accent Color')}
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {t(
                'settings.themeDesc',
                'Choose Light or Dark mode and any accent color. Text contrast is automatically validated for readability.'
              )}
            </p>
          </div>

          {/* Light / Dark Mode Segmented Switcher */}
          <div
            role="group"
            aria-label="Display Mode"
            className="inline-flex items-center p-1 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]"
          >
            <button
              type="button"
              id="settings-light-mode-btn"
              onClick={() => setMode('light')}
              aria-pressed={!isDark}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isDark
                  ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>{t('nav.light', 'Light Mode')}</span>
            </button>
            <button
              type="button"
              id="settings-dark-mode-btn"
              onClick={() => setMode('dark')}
              aria-pressed={isDark}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isDark
                  ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{t('nav.dark', 'Dark Mode')}</span>
            </button>
          </div>
        </div>

        {/* Preset Accent Color Swatches */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              {t('settings.presetColors', 'Preset Accent Colors')}
            </label>
            <span className="text-[11px] font-medium text-[var(--text-muted)]">
              Active:{' '}
              <strong className="text-[var(--text-primary)]">
                {accentId === 'custom'
                  ? `Custom (${accentColor.toUpperCase()})`
                  : ACCENT_PRESETS.find((p) => p.id === accentId)?.name || 'Emerald Green'}
              </strong>
            </span>
          </div>

          <div
            role="radiogroup"
            aria-label="Preset Accent Colors"
            className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 min-w-0"
          >
            {ACCENT_PRESETS.map((preset) => {
              const isSelected = accentId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${preset.name} accent color (${preset.hex})`}
                  onClick={() => setAccentPreset(preset.id)}
                  className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'border-[var(--accent)] ring-2 ring-[var(--focus-ring)]/25 bg-[var(--accent-subtle)]'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="theme-swatch keep-white w-6 h-6 rounded-full border border-black/15 dark:border-white/20 shrink-0 flex items-center justify-center shadow-2xs"
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {preset.name}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                        {preset.hex}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-[var(--accent-text)] shrink-0">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom HEX Color Picker */}
        <div className="p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <label
                htmlFor="custom-hex-input"
                className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5"
              >
                <Pipette className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                <span>{t('settings.customColorPicker', 'Custom Accent Color Picker (HEX)')}</span>
              </label>
              <p className="text-[11px] text-[var(--text-muted)]">
                {t(
                  'settings.customColorDesc',
                  'Pick any color from the spectrum or enter a 6-digit HEX code. Contrast is automatically protected.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Native Color Input Swatch */}
              <label
                htmlFor="native-color-picker"
                className="relative flex items-center justify-center w-10 h-10 rounded-xl border-2 border-[var(--border)] cursor-pointer overflow-hidden shadow-xs shrink-0"
                title="Click to open color spectrum picker"
              >
                <input
                  id="native-color-picker"
                  type="color"
                  value={accentColor}
                  onChange={(e) => {
                    setCustomAccentColor(e.target.value);
                    setHexDraft(e.target.value.toUpperCase());
                  }}
                  aria-label="Choose custom accent color"
                  className="keep-custom absolute -inset-2 w-14 h-14 cursor-pointer border-0 p-0 bg-transparent"
                />
              </label>

              {/* Editable HEX Code Input */}
              <div className="flex items-center gap-1.5">
                <input
                  id="custom-hex-input"
                  type="text"
                  value={hexDraft}
                  onChange={handleHexInputChange}
                  onBlur={handleHexInputBlur}
                  maxLength={7}
                  placeholder="#059669"
                  aria-label="Custom HEX color code"
                  className="w-28 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-mono font-bold text-[var(--text-primary)] uppercase tracking-wider"
                />
              </div>

              {accentId === 'custom' && (
                <span className="px-2.5 py-1 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent-text)] text-[10px] font-bold">
                  Custom Active
                </span>
              )}
            </div>
          </div>

          {/* Automatic Contrast Protection Status & Live Preview */}
          <div className="pt-3 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)]">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
              <span>
                Button Contrast:{' '}
                <strong className="text-[var(--text-primary)]">
                  {contrastInfo.buttonContrastRatio}:1
                </strong>{' '}
                • Text Accent Contrast:{' '}
                <strong className="text-[var(--text-primary)]">
                  {contrastInfo.textContrastRatio}:1
                </strong>{' '}
                (WCAG AA ≥ 4.5:1)
                {contrastInfo.wasAdjusted && (
                  <span className="ml-1.5 text-[var(--accent-text)] font-semibold">
                    • Auto-optimized for legibility
                  </span>
                )}
              </span>
            </div>

            {/* Live Mini Preview Strip */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="px-3 py-1 rounded-lg text-[11px] font-bold shadow-2xs"
                style={{
                  backgroundColor: contrastInfo.buttonBg,
                  color: contrastInfo.buttonText,
                }}
              >
                Primary Button
              </span>
              <span
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold border"
                style={{
                  backgroundColor: contrastInfo.accentSubtle,
                  color: contrastInfo.textAccent,
                  borderColor: contrastInfo.accentBorder,
                }}
              >
                Active Badge
              </span>
              <span className="keep-emerald px-2 py-1 rounded-lg bg-[#10b981]/12 text-[#047857] dark:text-[#34d399] text-[10px] font-bold">
                Success
              </span>
              <span className="px-2 py-1 rounded-lg bg-amber-500/12 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                Warning
              </span>
              <span className="px-2 py-1 rounded-lg bg-rose-500/12 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                Error
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LANGUAGE SELECTION */}
      <section
        aria-labelledby="language-settings-heading"
        className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
          <Globe2 className="w-4 h-4 text-[var(--accent-text)]" />
          <h2 id="language-settings-heading">
            {t('settings.languageTitle', 'System Interface Language')}
          </h2>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          {t(
            'settings.languageDesc',
            'Choose your preferred language across all menus, forms, and pages'
          )}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {SUPPORTED_LANGUAGES.map((l) => {
            const isSelected = selectedLanguage === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => handleLangChange(l.code)}
                aria-pressed={isSelected}
                className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[var(--accent-subtle)] font-bold shadow-xs'
                    : 'border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{l.flag}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-text)]" />}
                </div>
                <div className="text-xs font-bold text-[var(--text-primary)]">{l.nativeName}</div>
                <div className="text-[10px] text-[var(--text-muted)]">{l.name}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. ACCESSIBILITY AIDS */}
      <section
        aria-labelledby="accessibility-settings-heading"
        className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
          <Eye className="w-4 h-4 text-[var(--accent-text)]" />
          <h2 id="accessibility-settings-heading">
            {t('settings.accessibilityTitle', 'Accessibility Aids')}
          </h2>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {/* High Contrast */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[var(--text-primary)]">
                {t('settings.highContrast', 'High Contrast Mode')}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {t(
                  'settings.highContrastDesc',
                  'Enhanced text border separation and vivid color outlines for low-vision users'
                )}
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={highContrast}
              aria-label="Toggle High Contrast Mode"
              onClick={onToggleHighContrast}
              className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                highContrast ? 'bg-[var(--button-primary-bg)]' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`keep-white bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
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
                {t(
                  'settings.simpleModeDesc',
                  'Hides decorative elements and shows large touch-friendly buttons for elder citizens'
                )}
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={simpleMode}
              aria-label="Toggle Simplified Interface Mode"
              onClick={onToggleSimpleMode}
              className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                simpleMode ? 'bg-[var(--button-primary-bg)]' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`keep-white bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  simpleMode ? (isRTL ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Voice Feedback Modal Trigger & Speaking Speed */}
          <div className="py-3 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  {t('settings.voiceFeedback', 'Voice Feedback & Speaking Speed')}
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  {t(
                    'settings.voiceFeedbackDesc',
                    'Audibly narrates confirmations and AI responses at a natural conversational speed'
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={openVoiceModal}
                className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--accent-text)] cursor-pointer shrink-0"
              >
                {t('nav.voiceSettings', 'Configure Voice')}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                  {t('voice.speed', 'Speaking Speed (Rate)')}
                </span>
                <span className="font-mono font-bold text-[var(--accent-text)]">
                  {(voiceSettings.rate || 1.0).toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min={0.75}
                max={1.35}
                step={0.05}
                value={voiceSettings.rate || 1.0}
                onChange={(e) => updateVoiceSettings({ rate: parseFloat(e.target.value) })}
                className="w-full accent-[var(--accent-primary)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                <span>0.75x (Slow)</span>
                <span>1.00x (Natural)</span>
                <span>1.35x (Fast)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
