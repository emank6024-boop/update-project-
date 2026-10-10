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

export const AITeacher: React.FC<AITeacherProps> = ({ selectedLanguage }) => {
  const { isRTL, t, currentLanguage } = useLanguage();
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('Math');
  const [grade, setGrade] = useState('Class 10 (Matric)');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const subjects = [
    { label: t('teacher.math', 'Mathematics'), icon: Calculator, id: 'Math' },
    { label: t('teacher.physics', 'Physics'), icon: Atom, id: 'Physics' },
    { label: t('teacher.chemistry', 'Chemistry'), icon: TestTubes, id: 'Chemistry' },
    { label: t('teacher.biology', 'Biology'), icon: BookOpen, id: 'Biology' },
  ];

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
          question: query.trim(),
          language: selectedLanguage,
          subject,
          gradeLevel: grade,
        }),
      });

      if (!res.ok) throw new Error('Teaching explanation failed.');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error consulting educational engine.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto space-y-6 py-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {t('teacher.title', 'STEM Educational AI Teacher')}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold">
              {currentLanguage.nativeName}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {t(
              'teacher.subtitle',
              'Step-by-step problem solving for Pakistani Matric (9th-10th) and Intermediate (FSc Part 1 & 2) curricula'
            )}
          </p>
        </div>
      </div>

      {/* Subjects Strip */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[var(--text-muted)]">
          {t('teacher.subjects', 'Subjects')}:
        </span>
        {subjects.map((sub) => {
          const Icon = sub.icon;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSubject(sub.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                subject === sub.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-[var(--surface)] hover:bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--text-secondary)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder={t(
              'teacher.searchPlaceholder',
              'Enter a Math equation, Physics problem, or Chemistry reaction to solve step-by-step...'
            )}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
          <button
            onClick={handleAsk}
            disabled={!query.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>{t('teacher.inquireBtn', 'Solve Step-by-Step')}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
          <div className="prose prose-xs sm:prose-sm dark:prose-invert max-w-none text-xs leading-relaxed text-[var(--text-primary)]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.explanation || result.solution || result.answer || result.text || ''}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
