import React, { useState, useCallback, useRef } from 'react';
import {
  HandHelping,
  Search,
  RefreshCw,
  AlertCircle,
  Mic,
  Square,
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle2,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AudioControlBar } from '../AudioControlBar';
import { useSpeechRecognition } from '../../utils/useSpeechRecognition';

interface SignLanguageAssistantProps {
  selectedLanguage: LanguageCode;
}

interface SignImageAnalysisResult {
  identified: boolean;
  signName: string;
  meaningHeader: string;
  meaning: string;
  gestureDescription?: string;
  usageContext?: string;
  confidence?: string;
  tips?: string;
  fullExplanation?: string;
}

const clientSignAnalysisCache = new Map<string, SignImageAnalysisResult>();

function readAndCompressSignImage(
  file: File
): Promise<{ dataUrl: string; base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const originalDataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => {
        const base64 = originalDataUrl.replace(/^data:image\/[a-z0-9+.-]+;base64,/i, '');
        resolve({
          dataUrl: originalDataUrl,
          base64,
          mimeType: file.type || 'image/jpeg',
        });
      };
      img.onload = () => {
        try {
          const maxDim = 640;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            const base64 = originalDataUrl.replace(/^data:image\/[a-z0-9+.-]+;base64,/i, '');
            resolve({
              dataUrl: originalDataUrl,
              base64,
              mimeType: file.type || 'image/jpeg',
            });
            return;
          }
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const outMime = 'image/jpeg';
          const compressedDataUrl = canvas.toDataURL(outMime, 0.82);
          const base64 = compressedDataUrl.replace(/^data:image\/[a-z0-9+.-]+;base64,/i, '');
          resolve({
            dataUrl: compressedDataUrl,
            base64,
            mimeType: outMime,
          });
        } catch {
          const base64 = originalDataUrl.replace(/^data:image\/[a-z0-9+.-]+;base64,/i, '');
          resolve({
            dataUrl: originalDataUrl,
            base64,
            mimeType: file.type || 'image/jpeg',
          });
        }
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const SignLanguageAssistant: React.FC<SignLanguageAssistantProps> = ({ selectedLanguage }) => {
  const { isRTL, t, currentLanguage } = useLanguage();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Sign Image Upload & AI Recognition State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [uploadedImageMime, setUploadedImageMime] = useState<string>('image/jpeg');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<SignImageAnalysisResult | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const commonSigns = [
    'السلام علیکم (Greetings)',
    'شکریہ (Thank you)',
    'پانی چاہیے (Want water)',
    'ہسپتال کہاں ہے؟ (Where is hospital?)',
    'مدد چاہیے (Need help)',
  ];

  const handleLookup = useCallback(
    async (inputSign?: string) => {
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

        if (!res.ok) throw new Error(t('common.error', 'Sign language lookup failed.'));
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message || t('common.error', 'Error processing sign language breakdown.'));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, selectedLanguage, t, text]
  );

  const analyzeSignImage = useCallback(
    async (base64Data: string, mimeType: string) => {
      if (!base64Data) return;

      const cacheKey = `${selectedLanguage}_${base64Data.slice(0, 120)}_${base64Data.length}`;
      const cached = clientSignAnalysisCache.get(cacheKey);
      if (cached) {
        setImageError(null);
        setImageAnalysisResult(cached);
        setIsAnalyzingImage(false);
        return;
      }

      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch {
          // ignore
        }
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Strict 10-second timeout so loading never runs forever
      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, 10000);

      setIsAnalyzingImage(true);
      setImageError(null);
      try {
        const res = await fetch('/api/psl/analyze-sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType,
            language: selectedLanguage,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            data.error || data.message || t('common.error', 'Unable to analyze sign image. Please retry.')
          );
        }
        clientSignAnalysisCache.set(cacheKey, data);
        setImageAnalysisResult(data);
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          setImageError(
            t(
              'psl.timeoutError',
              'Sign image analysis took longer than 10 seconds. Please click Retry to try again.'
            )
          );
        } else {
          setImageError(
            err?.message || t('common.error', 'Error analyzing uploaded sign image. Please retry.')
          );
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (abortControllerRef.current === controller) {
          setIsAnalyzingImage(false);
        }
      }
    },
    [selectedLanguage, t]
  );

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError(t('common.error', 'Please select a valid image file (PNG, JPG, WebP).'));
      return;
    }

    setImageError(null);
    setImageAnalysisResult(null);
    setUploadedFileName(file.name);

    try {
      const { dataUrl, base64, mimeType } = await readAndCompressSignImage(file);
      setUploadedImagePreview(dataUrl);
      setUploadedImageBase64(base64);
      setUploadedImageMime(mimeType);
      await analyzeSignImage(base64, mimeType);
    } catch (err: any) {
      setImageError(err.message || t('common.error', 'Could not read the selected image.'));
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearUploadedImage = () => {
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {
        // ignore
      }
      abortControllerRef.current = null;
    }
    setIsAnalyzingImage(false);
    setUploadedImagePreview(null);
    setUploadedImageBase64(null);
    setUploadedFileName('');
    setImageAnalysisResult(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const {
    isListening,
    isTranscribing,
    error: sttError,
    toggleListening,
  } = useSpeechRecognition({
    language: selectedLanguage,
    onTranscript: (spokenText) => {
      setText(spokenText);
      handleLookup(spokenText);
    },
  });

  const signSpeechSummary = imageAnalysisResult
    ? [
        imageAnalysisResult.signName,
        imageAnalysisResult.meaning,
        imageAnalysisResult.gestureDescription,
        imageAnalysisResult.usageContext,
      ]
        .filter(Boolean)
        .join('۔ ')
    : '';

  return (
    <div
      className="w-full space-y-6 py-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20">
          <HandHelping className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {t('psl.title', 'Pakistan Sign Language (PSL) Assistant')}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold">
              {currentLanguage.nativeName}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {t(
              'psl.subtitle',
              'Interactive PSL dictionary, fingerspelling alphabet, and visual accessibility communication tools'
            )}
          </p>
        </div>
      </div>

      {/* Suggested Signs Strip */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          {t('psl.commonPhrases', 'Common Phrases')}:
        </span>
        {commonSigns.map((sign, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setText(sign);
              handleLookup(sign);
            }}
            className="px-3 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] font-medium transition-all cursor-pointer shadow-2xs"
          >
            {sign}
          </button>
        ))}
      </div>

      {/* Search Input with Microphone Voice-to-Text */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder={t('psl.searchPlaceholder', 'Search word or phrase in PSL...')}
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
          <button
            type="button"
            onClick={toggleListening}
            disabled={isTranscribing}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
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
                <Mic className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('assistant.mic', 'Mic')}</span>
              </>
            )}
          </button>
          <button
            onClick={() => handleLookup()}
            disabled={!text.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>{t('common.search', 'Lookup')}</span>
          </button>
        </div>
      </div>

      {/* Sign Picture Upload & AI Sign Meaning Section */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20 shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[var(--text-primary)]">
                {t('psl.uploadTitle', 'Upload Sign Picture — AI Sign Meaning')}
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                {t(
                  'psl.uploadDesc',
                  'Upload a picture of any hand sign to see its meaning below'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzingImage}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {isAnalyzingImage ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>
                {uploadedImagePreview
                  ? t('psl.changeImage', 'Upload Another Sign')
                  : t('psl.uploadBtn', 'Upload Sign Picture')}
              </span>
            </button>

            {uploadedImagePreview && (
              <button
                type="button"
                onClick={handleClearUploadedImage}
                disabled={isAnalyzingImage}
                className="p-2 rounded-xl bg-[var(--surface-secondary)] hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-600 border border-[var(--border)] transition-colors cursor-pointer"
                title={t('common.clear', 'Remove image')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Uploaded Sign Picture Preview */}
        {uploadedImagePreview && (
          <div className="space-y-4 pt-2 border-t border-[var(--border)]">
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
              <img
                src={uploadedImagePreview}
                alt={uploadedFileName || 'Uploaded Sign'}
                className="max-h-64 w-auto rounded-lg object-contain shadow-xs"
              />
              {uploadedFileName && (
                <span className="mt-2 text-[11px] text-[var(--text-muted)] truncate max-w-full">
                  {uploadedFileName}
                </span>
              )}
            </div>

            {/* Loading state below picture */}
            {isAnalyzingImage && (
              <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20 flex items-center justify-center gap-2.5 text-xs font-medium text-teal-700 dark:text-teal-300">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>
                  {t('psl.analyzingSign', 'AI is analyzing the sign picture and identifying its meaning...')}
                </span>
              </div>
            )}

            {/* Error state below picture */}
            {imageError && !isAnalyzingImage && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{imageError}</span>
                </div>
                {uploadedImageBase64 && (
                  <button
                    type="button"
                    onClick={() => analyzeSignImage(uploadedImageBase64, uploadedImageMime)}
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors cursor-pointer shrink-0"
                  >
                    {t('common.retry', 'Retry')}
                  </button>
                )}
              </div>
            )}

            {/* AI Sign Meaning Output directly below the uploaded picture */}
            {imageAnalysisResult && !isAnalyzingImage && (
              <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-teal-500/30 space-y-3">
                <AudioControlBar
                  text={signSpeechSummary}
                  language={selectedLanguage}
                  label={`${currentLanguage.nativeName} — ${t('voice.listenBtn', 'Listen Audio')}`}
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">
                      {imageAnalysisResult.meaningHeader || t('psl.meaningTitle', 'Meaning of this Sign:')}
                    </h3>
                  </div>
                  {imageAnalysisResult.signName && (
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 text-xs font-bold">
                      {imageAnalysisResult.signName}
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap">
                  {imageAnalysisResult.meaning}
                </p>

                {imageAnalysisResult.gestureDescription && (
                  <div className="pt-2 border-t border-[var(--border)] text-xs text-[var(--text-secondary)] space-y-1">
                    <span className="font-bold text-[var(--text-primary)] block">
                      {t('psl.handShapeLabel', 'Hand Gesture Details')}:
                    </span>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {imageAnalysisResult.gestureDescription}
                    </p>
                  </div>
                )}

                {imageAnalysisResult.usageContext && (
                  <div className="text-xs text-[var(--text-secondary)] space-y-1">
                    <span className="font-bold text-[var(--text-primary)] block">
                      {t('psl.usageLabel', 'Usage Context')}:
                    </span>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {imageAnalysisResult.usageContext}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {(error || sttError) && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || sttError}</span>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
          <AudioControlBar
            text={result.explanation || result.breakdown || result.answer || result.text || ''}
            language={selectedLanguage}
            label={`${currentLanguage.nativeName} — ${t('voice.listenBtn', 'Listen Audio')}`}
          />
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {t('psl.title', 'PSL Gesture Breakdown & Description')}
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
              {result.explanation || result.breakdown || result.answer || result.text || ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
