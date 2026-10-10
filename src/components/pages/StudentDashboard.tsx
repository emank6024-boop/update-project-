import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Brain,
  FileQuestion,
  TrendingUp,
  Loader2,
  RefreshCw,
  Library,
  Lightbulb,
  Copy,
  Check,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageId, LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AudioControlBar } from '../AudioControlBar';

interface StudentDashboardProps {
  onSelectPage: (page: PageId) => void;
  selectedLanguage: LanguageCode;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onSelectPage,
  selectedLanguage,
}) => {
  const { isRTL, t, currentLanguage } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'study' | 'quiz' | 'resources'>('study');
  const [subject, setSubject] = useState('Mathematics');
  const [gradeLevel, setGradeLevel] = useState('Class 10 (Matric / SSC Part 2)');
  const [studyTopic, setStudyTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Quick practice quiz state
  const [quizQuestion, setQuizQuestion] = useState<string | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [quizExplanation, setQuizExplanation] = useState<string>('');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  const studentName = user?.name || (user?.isDemo ? 'Hamza Khan' : 'Student');

  const stats = [
    {
      label: t('student.modulesCompleted', 'Lessons Explored'),
      value: '24',
      icon: BookOpen,
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      label: t('student.accuracyRate', 'Quiz Accuracy'),
      value: '92%',
      icon: Award,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      label: t('student.studyHours', 'Study Hours'),
      value: '18.5h',
      icon: Clock,
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      label: t('student.streakDays', 'Daily Streak'),
      value: '7 Days',
      icon: TrendingUp,
      color: 'bg-amber-500/10 text-amber-600',
    },
  ];

  const subjectsList = [
    { id: 'math', value: 'Mathematics', name: t('teacher.math', 'Mathematics') },
    { id: 'physics', value: 'Physics', name: t('teacher.physics', 'Physics') },
    { id: 'chemistry', value: 'Chemistry', name: t('teacher.chemistry', 'Chemistry') },
    { id: 'biology', value: 'Biology', name: t('teacher.biology', 'Biology') },
    { id: 'cs', value: 'Computer Science', name: t('teacher.cs', 'Computer Science') },
    { id: 'pakstudies', value: 'Pakistan Studies', name: t('student.pakStudies', 'Pakistan Studies') },
    { id: 'urdu', value: 'Urdu Adab', name: t('student.urduLiterature', 'Urdu Grammar & Literature') },
  ];

  const quickTopics = [
    'Photosynthesis & Cellular Respiration',
    "Newton's Laws of Motion",
    'Quadratic Formula & Factorization',
    'Periodic Table & Chemical Bonding',
    '1973 Constitution of Pakistan',
  ];

  const handleGenerateStudyGuide = async (overrideTopic?: string) => {
    const targetTopic = (overrideTopic !== undefined ? overrideTopic : studyTopic).trim();
    if (!targetTopic || isGenerating) return;

    setIsGenerating(true);
    setGeneratedNotes('');

    try {
      const res = await fetch('/api/teacher/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Provide a structured lesson summary, key concepts, formulas/definitions, and 3 practice review questions for: ${targetTopic}`,
          query: targetTopic,
          language: selectedLanguage,
          subject,
          grade: gradeLevel,
          stream: true,
        }),
      });

      if (!res.ok) throw new Error('Could not generate notes');

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() || '';
          for (const evt of events) {
            const line = evt.trim();
            if (!line.startsWith('data:')) continue;
            try {
              const parsed = JSON.parse(line.replace(/^data:\s*/, ''));
              if (parsed.chunk) {
                fullText += parsed.chunk;
                setGeneratedNotes(fullText);
              }
              if (parsed.done && parsed.answer) {
                fullText = parsed.answer;
                setGeneratedNotes(fullText);
              }
            } catch {
              // ignore partial json
            }
          }
        }
      } else {
        const data = await res.json();
        setGeneratedNotes(
          data.explanation || data.reply || data.answer || 'Study guide generated successfully.'
        );
      }
    } catch {
      setGeneratedNotes(
        `### 📚 ${targetTopic} — ${subject} (${gradeLevel})\n\n` +
          `**Key Concepts:**\n` +
          `- Comprehensive fundamentals aligned with Pakistani curriculum (FBISE / Punjab / Sindh / KPK / Balochistan boards).\n` +
          `- Step-by-step conceptual breakdown in ${currentLanguage.nativeName}.\n\n` +
          `**Practice Tips:**\n` +
          `1. Memorize core definitions and primary units.\n` +
          `2. Practice previous 5-year past papers questions.\n` +
          `3. Use PakLingo AI Teacher for instant step-by-step problem solving.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    setSelectedAnswer(null);
    setQuizFeedback(null);

    try {
      const res = await fetch('/api/teacher/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: studyTopic.trim() || subject,
          language: selectedLanguage,
          subject,
          grade: gradeLevel,
          numQuestions: 1,
        }),
      });

      if (!res.ok) throw new Error('Quiz generation failed');
      const data = await res.json();
      const firstQuiz = (data.quizzes && data.quizzes[0]) || data;
      setQuizQuestion(
        firstQuiz.question || `What is the fundamental SI unit of electric current in physics?`
      );
      setQuizOptions(
        Array.isArray(firstQuiz.options) && firstQuiz.options.length > 0
          ? firstQuiz.options
          : ['Ampere (A)', 'Volt (V)', 'Ohm (Ω)', 'Watt (W)']
      );
      setCorrectIndex(typeof firstQuiz.correctIndex === 'number' ? firstQuiz.correctIndex : 0);
      setQuizExplanation(firstQuiz.explanation || '');
    } catch {
      setQuizQuestion(`What is the fundamental SI unit of electric current in physics?`);
      setQuizOptions(['Ampere (A)', 'Volt (V)', 'Ohm (Ω)', 'Watt (W)']);
      setCorrectIndex(0);
      setQuizExplanation('Ampere (A) is the SI base unit of electric current.');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectQuizOption = (index: number) => {
    setSelectedAnswer(index);
    if (index === correctIndex) {
      setQuizFeedback(
        quizExplanation
          ? `✅ ${quizExplanation}`
          : t('student.correctAnswer', 'Correct! Excellent understanding of the concept.')
      );
    } else {
      const rightOpt = quizOptions[correctIndex] || '';
      setQuizFeedback(
        `💡 ${t('student.incorrectAnswer', 'Correct Answer')}: ${rightOpt}. ${quizExplanation}`
      );
    }
  };

  const handleCopy = () => {
    if (!generatedNotes) return;
    navigator.clipboard.writeText(generatedNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 py-2" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* 1. WELCOME HEADER */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                {t('student.welcome', 'Student Learning & Lessons Dashboard')}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>
                  {studentName} • {currentLanguage.nativeName}
                </span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {t(
                'student.subtitle',
                'Empowering Pakistani students with regional-language lessons, audio playback, exam prep, and interactive study tools'
              )}
            </p>
          </div>
        </div>

        {/* Quick Launch AI Tutor */}
        <button
          type="button"
          onClick={() => onSelectPage('teacher')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Brain className="w-4 h-4" />
          <span>{t('student.launchTutor', 'Open Full AI Teacher & Lessons')}</span>
          <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xs flex items-center gap-3.5"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold text-[var(--text-primary)] block">
                  {item.value}
                </span>
                <span className="text-xs text-[var(--text-secondary)] font-medium">
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('study')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'study'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{t('student.tabStudy', 'Lesson Explainer & Audio Notes')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('quiz');
            if (!quizQuestion) handleGenerateQuiz();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'quiz'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]'
          }`}
        >
          <FileQuestion className="w-3.5 h-3.5" />
          <span>{t('student.tabQuiz', 'Practice Quiz')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'resources'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]'
          }`}
        >
          <Library className="w-3.5 h-3.5" />
          <span>{t('student.tabResources', 'Board Curricula & Guides')}</span>
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      {activeTab === 'study' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (4 cols) */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <span>{t('student.studyConfig', 'Lesson & Study Configuration')}</span>
            </h3>

            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                {t('student.selectSubject', 'Subject')}
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-emerald-500"
              >
                {subjectsList.map((s) => (
                  <option key={s.id} value={s.value}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Level Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                {t('student.selectGrade', 'Grade / Board Level')}
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="Middle School (Grades 6-8)">Middle School (Grades 6-8)</option>
                <option value="Class 9 (SSC Part 1)">Class 9 (SSC Part 1)</option>
                <option value="Class 10 (Matric / SSC Part 2)">
                  Class 10 (Matric / SSC Part 2)
                </option>
                <option value="Class 11 (FSc / ICS / FA Part 1)">
                  Class 11 (FSc / ICS / FA Part 1)
                </option>
                <option value="Class 12 (FSc / ICS / FA Part 2)">
                  Class 12 (FSc / ICS / FA Part 2)
                </option>
                <option value="University Undergraduate">University Undergraduate</option>
              </select>
            </div>

            {/* Topic Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                {t('student.topicPlaceholder', 'Topic or Chapter Name')}
              </label>
              <input
                type="text"
                value={studyTopic}
                onChange={(e) => setStudyTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateStudyGuide()}
                placeholder="e.g., Photosynthesis, Newton's Laws, Quadratic Equations"
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={() => handleGenerateStudyGuide()}
              disabled={isGenerating || !studyTopic.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('student.generating', 'Streaming Lesson Notes...')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('student.generateGuideBtn', 'Generate Lesson & Study Guide')}</span>
                </>
              )}
            </button>

            {/* Quick Lesson Starters */}
            <div className="pt-3 border-t border-[var(--border)] space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                Quick Lesson Topics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickTopics.map((qt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setStudyTopic(qt);
                      handleGenerateStudyGuide(qt);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {qt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes Display Column (8 cols) */}
          <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                {t('student.studyNotesHeading', 'Interactive Lesson & Study Guide')} (
                {currentLanguage.nativeName})
              </h3>
              {generatedNotes && (
                <div className="flex flex-wrap items-center gap-2">
                  <AudioControlBar
                    text={generatedNotes}
                    language={selectedLanguage}
                    label="Listen to Lesson"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--border)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? 'Copied!' : t('common.copy', 'Copy Notes')}</span>
                  </button>
                </div>
              )}
            </div>

            {generatedNotes ? (
              <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-[var(--text-primary)] leading-relaxed p-5 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedNotes}</ReactMarkdown>
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-40" />
                <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto">
                  {t(
                    'student.emptyPrompt',
                    'Enter a topic or click a Quick Lesson Topic on the left to stream customized study notes and listen in your selected language.'
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Practice Quiz Tab */}
      {activeTab === 'quiz' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {t('student.quizTitle', 'Instant Subject Practice Quiz')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {subject} • {gradeLevel} • {currentLanguage.nativeName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {quizQuestion && (
                <AudioControlBar
                  text={`${quizQuestion}. ${quizOptions.join(', ')}`}
                  language={selectedLanguage}
                  label="Listen Question"
                />
              )}
              <button
                type="button"
                onClick={handleGenerateQuiz}
                disabled={quizLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--border)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${quizLoading ? 'animate-spin' : ''}`} />
                <span>{t('student.newQuestion', 'Next Question')}</span>
              </button>
            </div>
          </div>

          {quizLoading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
              <p className="text-xs text-[var(--text-muted)]">
                {t('student.loadingQuiz', 'Formulating exam question in your language...')}
              </p>
            </div>
          ) : quizQuestion ? (
            <div className="space-y-4">
              <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug">
                {quizQuestion}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quizOptions.map((opt, idx) => {
                  const isAnswered = selectedAnswer !== null;
                  const isCorrectOpt = idx === correctIndex;
                  const isSelectedOpt = selectedAnswer === idx;

                  let optClass =
                    'bg-[var(--surface-secondary)] hover:bg-[var(--border)] border-[var(--border)] text-[var(--text-primary)]';
                  if (isAnswered) {
                    if (isCorrectOpt) {
                      optClass =
                        'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold';
                    } else if (isSelectedOpt) {
                      optClass =
                        'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectQuizOption(idx)}
                      className={`w-full p-4 rounded-2xl border text-xs sm:text-sm font-medium text-start transition-all cursor-pointer flex items-center justify-between ${optClass}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrectOpt && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isSelectedOpt && !isCorrectOpt && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {quizFeedback && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3">
                  <span>{quizFeedback}</span>
                  <AudioControlBar
                    text={quizFeedback}
                    language={selectedLanguage}
                    label="Listen"
                    compact
                  />
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Board Curricula & Guides Tab */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Federal Board (FBISE)</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Curriculum guides, student learning outcome (SLO) model papers, and bilingual past
              examinations.
            </p>
            <button
              type="button"
              onClick={() => onSelectPage('teacher')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{t('student.askAboutBoard', 'Open AI Teacher Lessons')}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Punjab Boards (BISE)</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Lahore, Rawalpindi, Faisalabad, and Multan boards textbooks with Punjabi & Urdu
              lesson support and science glossaries.
            </p>
            <button
              type="button"
              onClick={() => onSelectPage('teacher')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{t('student.askAboutBoard', 'Open AI Teacher Lessons')}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              Sindh, KPK & Balochistan Boards
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Karachi, Hyderabad, Sukkur, Peshawar, Swat, and Quetta boards syllabus coverage with
              Sindhi, Pashto, and Balochi audio lessons.
            </p>
            <button
              type="button"
              onClick={() => onSelectPage('teacher')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{t('student.askAboutBoard', 'Open AI Teacher Lessons')}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
