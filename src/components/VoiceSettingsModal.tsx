import React from 'react';
import { useVoiceSettings } from '../context/VoiceSettingsContext';
import { Volume2, VolumeX, X, Play, RotateCcw } from 'lucide-react';

export const VoiceSettingsModal: React.FC = () => {
  const { isModalOpen, closeVoiceModal, voiceSettings, updateVoiceSettings, speak, isSpeaking, stopSpeaking } =
    useVoiceSettings();

  if (!isModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md bg-[var(--surface)] text-[var(--text-primary)] rounded-2xl border border-[var(--border)] shadow-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">صوتی ترتیبات (Voice Audio)</h3>
              <p className="text-xs text-[var(--text-secondary)]">Speech feedback & narration settings</p>
            </div>
          </div>
          <button
            onClick={closeVoiceModal}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">آواز کی فیڈ بیک (Enable Voice Feedback)</span>
            <button
              onClick={() => updateVoiceSettings({ enabled: !voiceSettings.enabled })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                voiceSettings.enabled ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  voiceSettings.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--text-secondary)]">رفتار (Speech Rate)</span>
              <span className="font-semibold text-emerald-600">{voiceSettings.rate}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={voiceSettings.rate}
              onChange={(e) => updateVoiceSettings({ rate: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--text-secondary)]">پچ (Pitch)</span>
              <span className="font-semibold text-emerald-600">{voiceSettings.pitch}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={voiceSettings.pitch}
              onChange={(e) => updateVoiceSettings({ pitch: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  speak('پاک لنگو اے آئی میں خوش آمدید۔ ہم آپ کی مدد کے لیے حاضر ہیں۔', 'ur');
                }
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4" />
              {isSpeaking ? 'روکیں (Stop)' : 'ٹیسٹ آواز (Test Voice)'}
            </button>
            <button
              onClick={() => updateVoiceSettings({ rate: 1.0, pitch: 1.0, volume: 1.0, enabled: true })}
              className="py-2 px-3 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              ری سیٹ
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--border)] flex justify-end">
          <button
            onClick={closeVoiceModal}
            className="px-4 py-2 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--border)] text-xs font-semibold transition-colors"
          >
            بند کریں (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
