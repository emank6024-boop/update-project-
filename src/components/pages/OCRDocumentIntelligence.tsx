import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Camera,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileCheck,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface OCRDocumentIntelligenceProps {
  selectedLanguage: LanguageCode;
}

export const OCRDocumentIntelligence: React.FC<OCRDocumentIntelligenceProps> = ({ selectedLanguage }) => {
  const { isRTL } = useLanguage();
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [documentText, setDocumentText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
        throw new Error('Failed to analyze document.');
      }
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error processing document.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {isRTL ? 'دستاویزات تفہیم و اسکینر (Document Intelligence)' : 'Document Intelligence & Bilingual OCR'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Scan and decode CNIC cards, electricity/gas bills, fard records, and legal deeds
          </p>
        </div>
      </div>

      {/* Upload Zone & Text Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-[var(--surface)] border-2 border-dashed border-[var(--border)] text-center flex flex-col items-center justify-center min-h-[220px]">
          <input
            type="file"
            id="doc-file-upload"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="doc-file-upload" className="cursor-pointer space-y-3 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                {fileName ? fileName : isRTL ? 'تصویر یا دستاویز اپ لوڈ کریں' : 'Upload Document Image (CNIC / Bill)'}
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">PNG, JPG, WebP up to 10MB</p>
            </div>
          </label>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col min-h-[220px]">
          <p className="text-xs font-semibold text-[var(--text-primary)] mb-2">
            {isRTL ? 'یا دستاویز کا متن یہاں درج کریں:' : 'Or Paste Document Text:'}
          </p>
          <textarea
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            placeholder="Paste text snippet or official notice here..."
            className="flex-1 w-full p-2 bg-transparent resize-none text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={(!imageBase64 && !documentText.trim()) || isLoading}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isRTL ? 'دستاویز کا تجزیہ کریں' : 'Analyze & Summarize'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
            <div>
              <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
                Detected Category:
              </span>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {result.documentType || 'Official Pakistani Document'}
              </h3>
            </div>
          </div>

          {result.keyFields && Array.isArray(result.keyFields) && (
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)] mb-3">Key Extracted Fields:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {result.keyFields.map((f: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block">
                      {f.label}
                    </span>
                    <span className="text-xs font-medium text-[var(--text-primary)] block mt-0.5">
                      {f.value || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary)] mb-2">Executive Summary & Rights:</h4>
            <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
              {result.translatedSummary || result.summary}
            </div>
          </div>

          {result.extractedText && (
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)] mb-2">Full Extracted Transcript:</h4>
              <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-muted)] max-h-48 overflow-y-auto font-mono whitespace-pre-wrap">
                {result.extractedText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
