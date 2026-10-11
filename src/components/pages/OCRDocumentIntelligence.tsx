import React, { useState } from 'react';
import {
  FileText,
  Upload,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileCheck,
  Mic,
  Square,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { AudioControlBar } from '../AudioControlBar';
import { useSpeechRecognition } from '../../utils/useSpeechRecognition';

interface OCRDocumentIntelligenceProps {
  selectedLanguage: LanguageCode;
}

export const OCRDocumentIntelligence: React.FC<OCRDocumentIntelligenceProps> = ({ selectedLanguage }) => {
  const { isRTL, t, currentLanguage } = useLanguage();
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [documentText, setDocumentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    isListening,
    isTranscribing,
    error: sttError,
    toggleListening,
  } = useSpeechRecognition({
    language: selectedLanguage,
    onTranscript: (spokenText) => {
      setDocumentText((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64 && !documentText.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/documents/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          documentText,
          targetLanguage: selectedLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error(t('common.error', 'Failed to analyze document.'));
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || t('common.error', 'Error occurred during document OCR analysis.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="w-full space-y-6 py-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent-text)] flex items-center justify-center border border-[var(--accent-border)]">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {t('ocr.title', 'Document OCR & Form Intelligence')}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)] font-bold">
              {currentLanguage.nativeName}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {t(
              'ocr.subtitle',
              'Upload or snap Pakistani identity documents, electricity bills, and legal deeds for instant translation and extraction'
            )}
          </p>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="p-8 rounded-3xl bg-[var(--surface)] border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] transition-all text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent-text)] flex items-center justify-center">
          <Upload className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-bold text-[var(--accent-text)] hover:underline cursor-pointer block">
            <span>{t('ocr.uploadBox', 'Drag & Drop your document here, or click to browse')}</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <p className="text-xs text-[var(--text-muted)]">
            {t('ocr.supports', 'Supports JPG, PNG, PDF (CNIC, WAPDA Bills, Court Deeds)')}
          </p>
        </div>

        {fileName && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent-text)] text-xs font-semibold">
            <FileCheck className="w-4 h-4" />
            <span>{fileName}</span>
          </div>
        )}
      </div>

      {/* Text Input Alternate with Voice Input */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <textarea
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          placeholder={t(
            'ocr.pastePlaceholder',
            'Or paste extracted document text, bill reference number, or CNIC data here...'
          )}
          rows={3}
          className="w-full bg-transparent border-none text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden resize-none font-medium"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={toggleListening}
            disabled={isTranscribing}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
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
                <Mic className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                <span>{t('assistant.mic', 'Mic')}</span>
              </>
            )}
          </button>

          <button
            onClick={handleAnalyze}
            disabled={(!imageBase64 && !documentText.trim()) || isLoading}
            className="px-5 py-2.5 rounded-xl bg-[var(--button-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--button-primary-text)] disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{t('ocr.scanBtn', 'Extract Document Data')}</span>
          </button>
        </div>
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
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-text)]">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('ocr.extractionComplete', 'Document Extraction Complete')}</span>
            </div>
            <button
              onClick={() => handleCopy(JSON.stringify(result, null, 2))}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {copied ? <Check className="keep-emerald w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('common.copied', 'Copied!') : t('common.copy', 'Copy Data')}</span>
            </button>
          </div>

          <AudioControlBar
            text={result.summary || result.analysis || JSON.stringify(result, null, 2)}
            language={selectedLanguage}
            label={`${currentLanguage.nativeName} Document Audio Summary`}
          />

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {t('ocr.extractedFields', 'Extracted & Translated Fields:')}
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap font-mono bg-[var(--surface-secondary)] p-4 rounded-xl border border-[var(--border)]">
              {result.summary || result.analysis || JSON.stringify(result, null, 2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
