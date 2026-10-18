import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles,
  Maximize2,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Eye,
  Sliders,
  Share2,
  HelpCircle,
  Layers,
  Heart,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface SmartVisualCardProps {
  title?: string;
  prompt: string;
  category?: 'farmer' | 'student' | 'teacher' | 'medical' | 'government' | 'legal' | 'heritage' | 'general';
  language?: LanguageCode;
  initialAspectRatio?: '4:3' | '1:1' | '16:9' | '3:4';
  autoGenerate?: boolean;
  onAskAiAboutImage?: (prompt: string, title?: string) => void;
  className?: string;
  compact?: boolean;
}

export const SmartVisualCard: React.FC<SmartVisualCardProps> = ({
  title,
  prompt,
  category = 'general',
  language = 'ur',
  initialAspectRatio = '4:3',
  autoGenerate = true,
  onAskAiAboutImage,
  className = '',
  compact = false,
}) => {
  const { isRTL, t } = useLanguage();
  const [aspectRatio, setAspectRatio] = useState<'4:3' | '1:1' | '16:9' | '3:4'>(initialAspectRatio);
  const [style, setStyle] = useState<'diagram' | 'realistic' | 'infographic'>('diagram');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [provider, setProvider] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const categoryMeta: Record<string, { label: string; icon: string; badgeClass: string }> = {
    farmer: {
      label: t('farmer.title', 'Agri Advisory Visual'),
      icon: '🌱',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    },
    agriculture: {
      label: t('farmer.title', 'Agri Advisory Visual'),
      icon: '🌾',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    },
    student: {
      label: t('student.title', 'Student Concept Diagram'),
      icon: '📚',
      badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    },
    teacher: {
      label: t('teacher.title', 'AI Lesson Visual'),
      icon: '🎓',
      badgeClass: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
    },
    medical: {
      label: t('medical.title', 'Medical Anatomy Visual'),
      icon: '🩺',
      badgeClass: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    },
    government: {
      label: t('government.title', 'Civic Service Infographic'),
      icon: '🏛️',
      badgeClass: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    },
    legal: {
      label: t('legal.title', 'Legal Procedure Visual'),
      icon: '⚖️',
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    },
    heritage: {
      label: 'Pakistan Heritage Visual',
      icon: '🕌',
      badgeClass: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30',
    },
    general: {
      label: 'AI Visual Concept',
      icon: '✨',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    },
  };

  const meta = categoryMeta[category.toLowerCase()] || categoryMeta.general;

  const generateImage = useCallback(
    async (ratioOverride?: '4:3' | '1:1' | '16:9' | '3:4', styleOverride?: 'diagram' | 'realistic' | 'infographic') => {
      const targetRatio = ratioOverride || aspectRatio;
      const targetStyle = styleOverride || style;

      if (!prompt.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            title: title || prompt.slice(0, 50),
            category,
            aspectRatio: targetRatio,
            style: targetStyle,
            language,
          }),
        });

        if (!res.ok) {
          throw new Error('Image generation failed. Please try again.');
        }

        const data = await res.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
          setProvider(data.provider || 'ai-image');
        } else {
          throw new Error(data.error || 'Failed to retrieve image.');
        }
      } catch (err: any) {
        setError(err.message || 'Error generating image.');
      } finally {
        setIsLoading(false);
      }
    },
    [aspectRatio, category, isLoading, language, prompt, style, title]
  );

  const prevPromptRef = useRef(prompt);
  useEffect(() => {
    if (prevPromptRef.current !== prompt) {
      prevPromptRef.current = prompt;
      setImageUrl(null);
      setError(null);
    }
  }, [prompt]);

  useEffect(() => {
    if (autoGenerate && !imageUrl && prompt.trim() && !isLoading) {
      generateImage();
    }
  }, [autoGenerate, generateImage, imageUrl, prompt, isLoading]);

  const handleDownload = () => {
    if (!imageUrl) return;
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      const safeTitle = (title || prompt)
        .replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_')
        .slice(0, 30);
      a.download = `PakLingo_${category}_${safeTitle}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {}
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
    try {
      const savedKey = 'paklingo_saved_pins';
      const raw = localStorage.getItem(savedKey) || '[]';
      const pins = JSON.parse(raw);
      if (!isSaved) {
        pins.unshift({
          id: `pin_${Date.now()}`,
          title: title || prompt.slice(0, 40),
          prompt,
          category,
          aspectRatio,
          imageUrl,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem(savedKey, JSON.stringify(pins.slice(0, 50)));
      }
    } catch {}
  };

  return (
    <>
      <div
        className={`w-full rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col ${className}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header Bar */}
        <div className={`px-3 sm:px-4 py-2 sm:py-2.5 bg-[var(--surface-secondary)]/50 border-b border-[var(--border)] flex items-center justify-between gap-2`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border flex items-center gap-1 shrink-0 ${meta.badgeClass}`}
            >
              <span>{meta.icon}</span>
              <span className="truncate max-w-[110px] sm:max-w-none">{meta.label}</span>
            </span>
            {title && (
              <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[120px] sm:max-w-[200px]" title={title}>
                {title}
              </span>
            )}
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {compact ? (
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                disabled={!imageUrl}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-secondary)] border border-[var(--border)] text-[10px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-40"
                title={isRTL ? 'تصویر بڑی کریں' : 'Enlarge image'}
              >
                <Maximize2 className="w-3 h-3 text-emerald-600" />
                <span>{isRTL ? 'بڑی کریں' : 'Enlarge'}</span>
              </button>
            ) : (
              <>
                {/* Style Selector */}
                <div className="flex items-center bg-[var(--surface)] rounded-lg p-0.5 border border-[var(--border)] text-[10px] font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setStyle('diagram');
                      generateImage(aspectRatio, 'diagram');
                    }}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                      style === 'diagram' ? 'bg-emerald-600 text-white font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                    title="Educational Diagram"
                  >
                    {t('visual.diagram', 'Diagram')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStyle('realistic');
                      generateImage(aspectRatio, 'realistic');
                    }}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                      style === 'realistic' ? 'bg-emerald-600 text-white font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                    title="Photorealistic"
                  >
                    {t('visual.photo', 'Photo')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStyle('infographic');
                      generateImage(aspectRatio, 'infographic');
                    }}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                      style === 'infographic' ? 'bg-emerald-600 text-white font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                    title="Infographic Chart"
                  >
                    {t('visual.chart', 'Chart')}
                  </button>
                </div>

                {/* Aspect Ratio Buttons */}
                <div className="hidden sm:flex items-center bg-[var(--surface)] rounded-lg p-0.5 border border-[var(--border)] text-[10px] font-medium">
                  {(['4:3', '1:1', '16:9'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => {
                        setAspectRatio(ratio);
                        generateImage(ratio, style);
                      }}
                      className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                        aspectRatio === ratio ? 'bg-emerald-600 text-white font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Visual Body */}
        <div
          className={`relative w-full bg-[var(--surface-secondary)] ${
            compact ? 'h-44 sm:h-52 min-h-[170px]' : 'min-h-[220px]'
          } flex items-center justify-center overflow-hidden group cursor-pointer`}
          onClick={() => {
            if (imageUrl) setIsLightboxOpen(true);
          }}
        >
          {isLoading ? (
            <div className="p-4 sm:p-6 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 animate-pulse">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  {t('visual.generating', 'Generating Visual Diagram...')}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] max-w-xs">
                  {title || prompt.slice(0, 45)}
                </p>
              </div>
            </div>
          ) : error ? (
            <div
              className="p-4 flex flex-col items-center justify-center gap-2 text-center text-rose-500"
              onClick={(e) => e.stopPropagation()}
            >
              <AlertCircle className="w-5 h-5" />
              <p className="text-xs font-semibold">{error}</p>
              <button
                type="button"
                onClick={() => generateImage()}
                className="mt-1 px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-rose-500/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('common.retry', 'Retry')}</span>
              </button>
            </div>
          ) : imageUrl ? (
            <div className="relative w-full h-full flex items-center justify-center bg-white dark:bg-slate-900 p-0.5">
              <img
                src={imageUrl}
                alt={title || prompt}
                referrerPolicy="no-referrer"
                onError={() => {
                  console.error('Image failed to render:', title || prompt);
                  setError(isRTL ? 'تصویر ظاہر نہیں ہو سکی۔ دوبارہ کوشش کریں۔' : 'Image failed to render. Click retry.');
                  setImageUrl(null);
                }}
                className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105`}
              />

              {/* Click to Enlarge Floating Badge */}
              <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/75 text-white text-[10px] font-bold shadow-md backdrop-blur-xs group-hover:bg-emerald-600 transition-colors">
                  <Maximize2 className="w-3 h-3" />
                  <span>{isRTL ? 'بڑا کریں' : 'Click to enlarge'}</span>
                </span>
              </div>

              {/* Hover Dark Overlay for desktop */}
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 pointer-events-none">
                <div className="flex items-center justify-between pointer-events-auto">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/70 text-white font-medium backdrop-blur-xs">
                    {provider.includes('gemini')
                      ? '✦ Gemini'
                      : provider.includes('imagen')
                      ? '✦ Imagen 3'
                      : '✦ Educational SVG'}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveToggle();
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer backdrop-blur-xs ${
                      isSaved
                        ? 'bg-rose-600 text-white'
                        : 'bg-white text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-end gap-1.5 pointer-events-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white backdrop-blur-xs transition-colors cursor-pointer"
                    title={t('visual.inspect', 'Inspect Fullscreen')}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                    className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white backdrop-blur-xs transition-colors cursor-pointer"
                    title={t('visual.download', 'Download')}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="p-4 text-center space-y-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Sparkles className="w-6 h-6 mx-auto text-emerald-600/60" />
              <button
                type="button"
                onClick={() => generateImage()}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1 mx-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('visual.generateBtn', 'Generate Diagram')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Prompt & Actions */}
        {compact ? (
          <div className="px-3 py-1.5 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-between gap-1 text-[10px]">
            {/* Compact style selector */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setStyle('diagram');
                  generateImage(aspectRatio, 'diagram');
                }}
                className={`px-1.5 py-0.5 rounded font-medium cursor-pointer ${
                  style === 'diagram' ? 'bg-emerald-600 text-white font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Diagram
              </button>
              <button
                type="button"
                onClick={() => {
                  setStyle('realistic');
                  generateImage(aspectRatio, 'realistic');
                }}
                className={`px-1.5 py-0.5 rounded font-medium cursor-pointer ${
                  style === 'realistic' ? 'bg-emerald-600 text-white font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Photo
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!imageUrl}
                className="p-1 rounded hover:bg-[var(--surface-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer disabled:opacity-40"
                title="Download"
              >
                <Download className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => generateImage()}
                disabled={isLoading}
                className="p-1 rounded hover:bg-[var(--surface-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer disabled:opacity-40"
                title="Regenerate"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-2.5 bg-[var(--surface)] border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[280px] sm:max-w-[420px]" title={prompt}>
              <span className="font-semibold text-[var(--text-secondary)]">{t('visual.concept', 'Visual Concept')}:</span> {prompt}
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                title={isCopied ? 'Copied!' : 'Copy Prompt'}
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!imageUrl}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-40"
                title="Download Image"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => generateImage()}
                disabled={isLoading}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-40"
                title="Regenerate"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              {onAskAiAboutImage && (
                <button
                  type="button"
                  onClick={() => onAskAiAboutImage(prompt, title)}
                  className="ml-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 border border-emerald-500/20"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{t('visual.askAi', 'Ask AI About This')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Fullscreen Modal */}
      {isLightboxOpen && imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className="p-4 bg-[var(--surface-secondary)] border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${meta.badgeClass}`}>
                  {meta.icon} {meta.label}
                </span>
                <h3 className="text-sm font-bold text-[var(--text-primary)] truncate max-w-sm sm:max-w-md">
                  {title || prompt}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-8 h-8 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] flex items-center justify-center cursor-pointer border border-[var(--border)] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Image */}
            <div className="p-4 flex-1 flex items-center justify-center overflow-auto bg-white dark:bg-slate-900">
              <img
                src={imageUrl}
                alt={title || prompt}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-md bg-white"
              />
            </div>

            {/* Modal Details Footer */}
            <div className="p-4 bg-[var(--surface)] border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5 max-w-md">
                <p className="text-xs font-bold text-[var(--text-primary)]">{title || 'AI Concept Visual'}</p>
                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">{prompt}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveToggle}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    isSaved
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-[var(--surface-secondary)] text-[var(--text-primary)] border-[var(--border)]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved to Pins' : 'Save Pin'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
