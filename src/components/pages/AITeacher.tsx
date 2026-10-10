import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  RefreshCw,
  BookOpen,
  Calculator,
  Atom,
  TestTubes,
  AlertCircle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AITeacherProps {
  selectedLanguage: LanguageCode;
}

const SUBJECTS = [
  { label: 'ریاضی (Mathematics)', icon: Calculator, id: 'Math' },
  { label: 'طبیعیات (Physics)', icon: Atom, id: 'Physics' },
  { label: 'کیمیا (Chemistry)', icon: TestTubes, id: 'Chemistry' },
  { label: 'حیاتیات (Biology)', icon: BookOpen, id: 'Biology' },
  { label: 'عام سائنس (General Science)', icon: GraduationCap, id: 'General Science' },
];

const GRADES = ['Class 9 (Matric)', 'Class 10 (Matric)', 'Class 11 (FSc / ICS)', 'Class 12 (FSc / ICS)', 'University'];

export const AITeacher: React.FC<AITeacherProps> = ({ selectedLanguage }) => {
  const { isRTL } = useLanguage();
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('Math');
  const [grade, setGrade] = useState('Class 10 (Matric)');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/teacher/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          language: selectedLanguage,
          subject,
          gradeLevel: grade,
        }),
      });

      if (!res.ok) throw new Error('Teaching explanation failed.');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error consulting STEM teacher.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {isRTL ? 'تعلیمی استاد و تدریس (STEM AI Teacher)' : 'STEM AI Teacher & Exam Tutor'}
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Step-by-step concepts, formulas, and homework explanations for Matric, FSc, and university courses
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">مضمون (Subject):</span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
            >
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">کلاس (Grade):</span>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)]"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder={
              isRTL
                ? 'ریاضی کا سوال یا سائنسی فارمولہ یہاں درج کریں...'
                : 'Enter a math problem, physics formula, or chemistry concept (e.g., Quadratic equation derivation)...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
          <button
            onClick={handleAsk}
            disabled={!query.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isRTL ? 'حل کریں' : 'Solve & Explain'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && (
        <div className="p-12 text-center text-xs text-[var(--text-muted)]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
          <span>Solving step-by-step and preparing educational breakdown...</span>
        </div>
      )}

      {result && !isLoading && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
          <div className="prose prose-xs dark:prose-invert max-w-none text-xs leading-relaxed text-[var(--text-primary)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.reply || result.solution || result.text || ''}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
