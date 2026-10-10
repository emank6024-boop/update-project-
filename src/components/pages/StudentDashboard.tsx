import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Brain,
  FileQuestion,
  TrendingUp,
  Bookmark,
  Send,
  Loader2,
  RefreshCw,
  Library,
  Lightbulb,
} from 'lucide-react';
import { PageId, LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

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
  const [subject, setSubject] = useState('General Science');
  const [gradeLevel, setGradeLevel] = useState('Matric (Grade 10)');
  const [studyTopic, setStudyTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);

  // Quick practice quiz state
  const [quizQuestion, setQuizQuestion] = useState<string | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
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
    { id: 'math', name: t('teacher.math', 'Mathematics') },
    { id: 'physics', name: t('teacher.physics', 'Physics') },
    { id: 'chemistry', name: t('teacher.chemistry', 'Chemistry') },
    { id: 'biology', name: t('teacher.biology', 'Biology') },
    { id: 'pakstudies', name: t('student.pakStudies', 'Pakistan Studies') },
    { id: 'urdu', name: t('student.urduLiterature', 'Urdu Grammar & Literature') },
  ];

  const handleGenerateStudyGuide = async () => {
    if (!studyTopic.trim()) return;
    setIsGenerating(true);
    setGeneratedNotes(null);

    try {
      const res = await fetch('/api/teacher/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Provide a structured summary, key concepts, formulas/definitions, and 3 practice review questions for: ${studyTopic}. Subject: ${subject}. Level: ${gradeLevel}.`,
          language: selectedLanguage,
          subject,
          gradeLevel,
        }),
      });

      if (!res.ok) throw new Error('Could not generate notes');
      const data = await res.json();
      setGeneratedNotes(data.explanation || data.reply || data.answer || 'Study guide generated successfully.');
    } catch {
      // Fallback helpful notes
      setGeneratedNotes(
        `### ${studyTopic} — ${subject} (${gradeLevel})\n\n` +
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
      const res = await fetch('/api/teacher/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Generate a single multiple-choice question with 4 options and answer for ${subject} (${gradeLevel}).`,
          language: selectedLanguage,
          subject,
          gradeLevel,
        }),
      });

      if (!res.ok) throw new Error('Quiz generation failed');
      const data = await res.json();
      setQuizQuestion(data.question || `What is the fundamental SI unit of electric current in physics?`);
      setQuizOptions(data.options || ['Ampere (A)', 'Volt (V)', 'Ohm (Ω)', 'Watt (W)']);
    } catch {
      setQuizQuestion(`What is the fundamental SI unit of electric current in physics?`);
      setQuizOptions(['Ampere (A)', 'Volt (V)', 'Ohm (Ω)', 'Watt (W)']);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectQuizOption = (index: number) => {
    setSelectedAnswer(index);
    if (index === 0) {
      setQuizFeedback(t('student.correctAnswer', 'Correct! Excellent understanding of physical units.'));
    } else {
      setQuizFeedback(t('student.incorrectAnswer', 'Not quite right. The correct answer is Ampere (A).'));
    }
  };

  return (
    <div
      className="max-w-6xl mx-auto space-y-8 py-4 px-2"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* 1. WELCOME HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                {t('student.welcome', 'Student Learning Dashboard')}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>{studentName}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {t(
                'student.subtitle',
                'Empowering Pakistani students with regional-language tutoring, exam prep, and interactive study tools'
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
          <span>{t('student.launchTutor', 'Open Full AI Teacher')}</span>
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
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
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
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
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
          <span>{t('student.tabStudy', 'Topic Explainer & Notes')}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-1 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-600" />
              <span>{t('student.studyConfig', 'Study Topic Configuration')}</span>
            </h3>

            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                {t('student.selectSubject', 'Subject')}
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-emerald-500"
              >
                {subjectsList.map((s) => (
                  <option key={s.id} value={s.name}>
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
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="Middle School (Grades 6-8)">Middle School (Grades 6-8)</option>
                <option value="Class 9 (SSC Part 1)">Class 9 (SSC Part 1)</option>
                <option value="Class 10 (Matric / SSC Part 2)">Class 10 (Matric / SSC Part 2)</option>
                <option value="Class 11 (FSc / ICS / FA Part 1)">Class 11 (FSc / ICS / FA Part 1)</option>
                <option value="Class 12 (FSc / ICS / FA Part 2)">Class 12 (FSc / ICS / FA Part 2)</option>
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
                placeholder="e.g., Photosynthesis, Newton's Laws, Quadratic Equations"
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateStudyGuide}
              disabled={isGenerating || !studyTopic.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('student.generating', 'Generating Notes...')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('student.generateGuideBtn', 'Generate Study Guide')}</span>
                </>
              )}
            </button>
          </div>

          {/* Notes Display Column */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {t('student.studyNotesHeading', 'Generated Study Guide & Formulas')}
              </h3>
              {generatedNotes && (
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(generatedNotes)}
                  className="px-2.5 py-1 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--border)] text-[11px] font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
                >
                  {t('common.copy', 'Copy Notes')}
                </button>
              )}
            </div>

            {generatedNotes ? (
              <div className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap font-mono p-4 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)]">
                {generatedNotes}
              </div>
            ) : (
              <div className="py-16 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-40" />
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  {t(
                    'student.emptyPrompt',
                    'Enter a topic on the left to receive customized study notes and concept breakdowns in your preferred language.'
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Practice Quiz Tab */}
      {activeTab === 'quiz' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {t('student.quizTitle', 'Instant Subject Practice Quiz')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {subject} • {gradeLevel}
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateQuiz}
              disabled={quizLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${quizLoading ? 'animate-spin' : ''}`} />
              <span>{t('student.newQuestion', 'Next Question')}</span>
            </button>
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

              <div className="space-y-2">
                {quizOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuizOption(idx)}
                    className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm font-medium text-start transition-all cursor-pointer flex items-center justify-between ${
                      selectedAnswer === idx
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'bg-[var(--surface-secondary)] hover:bg-[var(--border)] border-[var(--border)] text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedAnswer === idx && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>

              {quizFeedback && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  {quizFeedback}
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
              Curriculum guides, student learning outcome (SLO) model papers, and bilingual past examinations.
            </p>
            <button
              type="button"
              onClick={() => onSelectPage('teacher')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{t('student.askAboutBoard', 'Consult AI Tutor')}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Punjab Boards (BISE)</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Lahore, Rawalpindi, Faisalabad, and Multan boards textbooks with Urdu translation aids and science glossaries.
            </p>
            <button
              type="button"
              onClick={() => onSelectPage('teacher')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{t('student.askAboutBoard', 'Consult AI Tutor')}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Sindh & KPK Boards</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Karachi, Hyderabad, Sukkur, Peshawar, and Swat boards syllabus coverage with Sindhi and Pashto explanation support.
            </p>
            <button
              type="button"
              onClick={() => onSelectPage('teacher')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{t('student.askAboutBoard', 'Consult AI Tutor')}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
