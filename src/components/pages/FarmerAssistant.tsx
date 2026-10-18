import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sprout,
  Search,
  RefreshCw,
  AlertCircle,
  Mic,
  Square,
  Upload,
  Camera,
  X,
  FileImage,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';
import { FormattedMarkdown } from '../FormattedMarkdown';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AudioControlBar } from '../AudioControlBar';
import { useSpeechRecognition } from '../../utils/useSpeechRecognition';
import { SmartVisualCard } from '../SmartVisualCard';
import { useAuth } from '../../context/AuthContext';
import {
  saveFeatureHistoryItem,
  loadFeatureHistory,
  FeatureHistoryItem,
} from '../../lib/firestoreService';

interface FarmerAssistantProps {
  selectedLanguage: LanguageCode;
}

export const FarmerAssistant: React.FC<FarmerAssistantProps> = ({ selectedLanguage }) => {
  const { user } = useAuth();
  const { isRTL, t, currentLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ask' | 'upload'>('ask');
  const [query, setQuery] = useState('');
  const [crop, setCrop] = useState('wheat');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Feature History State
  const [farmerHistory, setFarmerHistory] = useState<FeatureHistoryItem[]>(() =>
    loadFeatureHistory('farmer', user?.id)
  );

  // Restore if opened from History page or reload
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('paklingo_active_query_farmer');
      if (stored) {
        const item = JSON.parse(stored) as FeatureHistoryItem;
        if (item.query) setQuery(item.query);
        if (item.crop) setCrop(item.crop);
        if (item.resultText) {
          setResult({
            answer: item.resultText,
            guidance: item.resultText,
            analysis: item.resultText,
            advice: item.resultText,
          });
        }
        sessionStorage.removeItem('paklingo_active_query_farmer');
      }
    } catch {}
  }, []);

  // Image Upload States
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isEnlargeOpen, setIsEnlargeOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const crops = [
    { label: t('farmer.wheat', 'Wheat (گندم)'), value: 'wheat' },
    { label: t('farmer.potato', 'Potato (آلو)'), value: 'potato' },
    { label: t('farmer.cotton', 'Cotton (کپاس)'), value: 'cotton' },
    { label: t('farmer.rice', 'Rice (دھان / چاول)'), value: 'rice' },
    { label: t('farmer.sugarcane', 'Sugarcane (کماد)'), value: 'sugarcane' },
    { label: t('farmer.maize', 'Maize (مکئی)'), value: 'maize' },
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('farmer.invalidImage', 'Please select a valid image file (JPG, PNG, WebP).'));
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError(t('farmer.imageTooLarge', 'Image is too large. Please select a photo under 15MB.'));
      return;
    }

    setError(null);
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleAsk = useCallback(
    async (textToSend?: string) => {
      const q = (textToSend || query).trim();
      if (!q || isLoading) return;

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/farmer/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: q,
            question: q,
            language: selectedLanguage,
            cropType: crop,
            crop,
          }),
        });

        if (!res.ok) throw new Error(t('common.error', 'Failed to consult farmer advisory.'));
        const data = await res.json();
        setResult(data);
        const ans = data.analysis || data.guidance || data.advice || data.answer || data.text || '';
        if (ans) {
          const saved = saveFeatureHistoryItem(
            'farmer',
            {
              title: `${crop.toUpperCase()}: ${q.slice(0, 50)}`,
              query: q,
              subtitle: ans.slice(0, 100),
              resultText: ans,
              crop,
              language: selectedLanguage,
            },
            user?.id
          );
          setFarmerHistory((prev) => [saved, ...prev.filter((x) => x.id !== saved.id)].slice(0, 20));
        }
      } catch (err: any) {
        setError(err.message || t('common.error', 'Error consulting agricultural engine.'));
      } finally {
        setIsLoading(false);
      }
    },
    [crop, isLoading, query, selectedLanguage, t, user?.id]
  );

  const handleAnalyzePhoto = useCallback(async () => {
    if (!uploadedImage && !query.trim()) {
      setError(t('farmer.needPhotoOrText', 'Please upload a photo of your crop or describe the symptoms.'));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/farmer/disease-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: uploadedImage || undefined,
          crop,
          symptoms: query.trim() || undefined,
          plantPart: 'Leaves / Stem / Fruit',
          language: selectedLanguage,
        }),
      });

      if (!res.ok) throw new Error(t('farmer.analysisFailed', 'Could not complete crop disease analysis.'));
      const data = await res.json();
      setResult(data);
      const ans = data.analysis || data.guidance || data.advice || data.answer || data.text || '';
      if (ans) {
        const title = query.trim()
          ? `${crop.toUpperCase()} Scan: ${query.slice(0, 40)}`
          : `${crop.toUpperCase()} Photo Inspection`;
        const saved = saveFeatureHistoryItem(
          'farmer',
          {
            title,
            query: query.trim() || `${crop} photo disease diagnosis`,
            subtitle: ans.slice(0, 100),
            resultText: ans,
            crop,
            language: selectedLanguage,
          },
          user?.id
        );
        setFarmerHistory((prev) => [saved, ...prev.filter((x) => x.id !== saved.id)].slice(0, 20));
      }
    } catch (err: any) {
      setError(err.message || t('common.error', 'Failed to inspect crop health.'));
    } finally {
      setIsLoading(false);
    }
  }, [crop, query, selectedLanguage, t, uploadedImage, user?.id]);

  const {
    isListening,
    isTranscribing,
    error: sttError,
    toggleListening,
  } = useSpeechRecognition({
    language: selectedLanguage,
    onTranscript: (spokenText) => {
      setQuery(spokenText);
      if (activeTab === 'ask') {
        handleAsk(spokenText);
      }
    },
  });

  return (
    <div className="w-full space-y-6 py-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <Sprout className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {t('farmer.title', 'Kissan Agriculture Advisory AI')}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
              {currentLanguage.nativeName}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {t(
              'farmer.subtitle',
              'Crop diseases, pest management, fertilizer schedules, mandi market trends, and seasonal advisories'
            )}
          </p>
        </div>
      </div>

      {/* Feature Mode Tabs: Ask Question vs Photo Upload */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('ask')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ask'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] border border-[var(--border)]'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>{isRTL ? '🌾 زرعی سوال پوچھیں' : '🌾 Ask Farming Question'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] border border-[var(--border)]'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{isRTL ? '📸 فصل / پتے کی تصویر سے تشخیص' : '📸 Crop Photo Disease Scanner'}</span>
        </button>
      </div>

      {/* Crop Selector Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          {t('farmer.cropsTitle', 'Crops')}:
        </span>
        {crops.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => {
              setCrop(c.value);
              if (activeTab === 'ask') {
                const qText = c.value === 'wheat' ? t('hero.promptWheatQuery', c.label) : c.label;
                setQuery(qText);
                handleAsk(qText);
              }
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              crop === c.value
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-[var(--surface)] hover:bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--text-secondary)]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Mode 1: Ask Question (Text & Voice) */}
      {activeTab === 'ask' && (
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder={t(
                'farmer.searchPlaceholder',
                'Ask about wheat yellow rust, cotton pest remedies, urea/DAP timing, or seasonal planting...'
              )}
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
                  <Mic className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('assistant.mic', 'Mic')}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleAsk()}
              disabled={!query.trim() || isLoading}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>{t('farmer.inquireBtn', 'Get Agricultural Advice')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Farmer Image Upload Feature */}
      {activeTab === 'upload' && (
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>{isRTL ? 'فصل، پتے یا کیڑے کی تصویر اپلوڈ کریں' : 'Upload Crop, Leaf, or Pest Photo'}</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {isRTL
                ? 'اپنے موبائل کیمرے یا گیلری سے متاثرہ پتے یا فصل کی تصویر منتخب کریں، تاکہ مصنوعی ذہانت بیماری کی تشخیص اور علاج تجویز کر سکے'
                : 'Upload or capture a clear photo of diseased leaves or pests for instant diagnosis and treatment advice'}
            </p>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />

          {!uploadedImage ? (
            /* Upload Drop Area */
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--border)] hover:border-emerald-500/50 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-colors bg-[var(--surface-secondary)]/50 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  {isRTL ? 'تصویر منتخب کرنے کے لیے یہاں کلک کریں' : 'Click to upload crop or plant photo'}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  PNG, JPG, JPEG, WebP (Max 15MB)
                </p>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'کیمرے سے تصویر کھینچیں' : 'Take Photo (Camera)'}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)] text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileImage className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isRTL ? 'گیلری سے فائل چنیں' : 'Choose File'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Uploaded Image Preview Thumbnail (Compact, non-intrusive) */
            <div className="p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] flex flex-wrap sm:flex-nowrap items-center gap-4">
              <div
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-black/5 shrink-0 border border-[var(--border)] cursor-pointer group"
                onClick={() => setIsEnlargeOpen(true)}
                title={isRTL ? 'تصویر بڑی کریں' : 'Click to enlarge'}
              >
                <img
                  src={uploadedImage}
                  alt="Uploaded Crop"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>

              <div className="flex-1 min-w-[200px] space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[200px]">
                    {uploadedFileName || 'crop-photo.jpg'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {isRTL
                    ? `منتخب فصل: ${crops.find((c) => c.value === crop)?.label || crop}`
                    : `Selected Crop: ${crops.find((c) => c.value === crop)?.label || crop}`}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold">
                  {isRTL ? '✓ تصویر معائنے کے لیے تیار ہے' : '✓ Photo ready for pathology diagnosis'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-rose-500/20"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'ہٹائیں' : 'Remove'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Optional Observation Notes / Symptoms Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
              {isRTL
                ? 'اضافی مشاہدہ یا سوال (اختیاری):'
                : 'Optional Observations / Symptoms (e.g. yellow spots, curling leaves):'}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyzePhoto()}
                placeholder={isRTL ? 'مثلاً: پتوں پر زرد دھبے اور سفید کیڑے نظر آ رہے ہیں...' : 'e.g. Yellow stripe rust spots on lower leaves...'}
                className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAnalyzePhoto}
                disabled={(!uploadedImage && !query.trim()) || isLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>{isRTL ? 'تشخیص اور علاج حاصل کریں' : 'Analyze Crop Health'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {(error || sttError) && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || sttError}</span>
        </div>
      )}

      {/* Result Card & Visual Advisory */}
      {result && (
        <div className="space-y-6">
          {/* Side-by-Side Responsive Layout: Educational Visual Card + Text Content */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Main Guidance Text */}
            <div className="flex-1 min-w-0 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
              <AudioControlBar
                text={result.analysis || result.guidance || result.advice || result.answer || result.text || ''}
                language={selectedLanguage}
                label={`${currentLanguage.nativeName} — ${t('voice.listenBtn', 'Listen Audio')}`}
              />
              <FormattedMarkdown
                content={result.analysis || result.guidance || result.advice || result.answer || result.text || ''}
                isRTL={isRTL}
              />
            </div>

            {/* Compact Side Visual Inspection Card with Clean White Background & Click-to-Enlarge */}
            <div className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-4 order-first lg:order-last space-y-3">
              {uploadedImage && (
                <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
                  <p className="text-[11px] font-bold text-[var(--text-primary)] mb-2 flex items-center justify-between">
                    <span>{isRTL ? 'آپ کی اپلوڈ کردہ تصویر' : 'Uploaded Crop Photo'}</span>
                    <button
                      type="button"
                      onClick={() => setIsEnlargeOpen(true)}
                      className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-2.5 h-2.5" />
                      <span>{isRTL ? 'بڑی کریں' : 'Enlarge'}</span>
                    </button>
                  </p>
                  <div
                    className="w-full h-36 rounded-xl overflow-hidden bg-black/5 border border-[var(--border)] cursor-pointer"
                    onClick={() => setIsEnlargeOpen(true)}
                  >
                    <img
                      src={uploadedImage}
                      alt="Uploaded Crop"
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                </div>
              )}

              {/* Scientific Educational Diagram */}
              <SmartVisualCard
                key={`${crop}_${query}_${selectedLanguage}`}
                title={`${crop ? crop.toUpperCase() + ' — ' : ''}${query || t('farmer.title', 'Agri Diagnostic Diagram')}`}
                prompt={`Agricultural inspection and plant disease pathology for ${crop} crop in Pakistan: ${query || 'Crop leaf health and pest management'}`}
                category="farmer"
                language={selectedLanguage}
                initialAspectRatio="4:3"
                autoGenerate={true}
                compact={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Uploaded Image */}
      {isEnlargeOpen && uploadedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsEnlargeOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-[var(--surface)] rounded-2xl overflow-hidden border border-[var(--border)] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {uploadedFileName || 'Uploaded Crop Photo'}
              </span>
              <button
                type="button"
                onClick={() => setIsEnlargeOpen(false)}
                className="p-1 rounded-lg hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] flex items-center justify-center overflow-auto rounded-xl bg-black/5">
              <img
                src={uploadedImage}
                alt="Enlarged Crop"
                className="max-h-[68vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
