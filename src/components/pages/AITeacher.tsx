import React, { useState, useRef, useCallback } from 'react';
import {
  GraduationCap,
  Search,
  RefreshCw,
  BookOpen,
  Calculator,
  Atom,
  TestTubes,
  Code2,
  Landmark,
  Languages,
  Sparkles,
  AlertCircle,
  Volume2,
  Copy,
  Check,
  HelpCircle,
  Layers,
  CheckCircle2,
  XCircle,
  Maximize2,
  Minimize2,
  Play,
  ArrowRight,
  RotateCcw,
  Mic,
  Square,
} from 'lucide-react';
import { FormattedMarkdown } from '../FormattedMarkdown';
import { LanguageCode } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceSettings, detectSpeechLanguage } from '../../context/VoiceSettingsContext';
import { AudioControlBar } from '../AudioControlBar';
import { useSpeechRecognition } from '../../utils/useSpeechRecognition';
import { SmartVisualCard } from '../SmartVisualCard';

interface AITeacherProps {
  selectedLanguage: LanguageCode;
}

type TeacherMode = 'lesson' | 'solver' | 'quiz' | 'flashcards';

interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface FlashcardItem {
  front: string;
  back: string;
  notes?: string;
  category?: string;
}

const SUBJECTS_CONFIG = [
  {
    id: 'Mathematics',
    transKey: 'teacher.math',
    defaultLabel: 'Mathematics',
    icon: Calculator,
    topics: [
      'Quadratic Equations & Formula (دو درجی مساوات)',
      'Pythagoras Theorem & Right Triangles (مسئلہ فیثاغورث)',
      'Matrices, Determinants & Cramer Rule (کالب اور مقطع)',
      'Trigonometric Ratios & Identities (مثلثیاتی نسبتیں)',
      'Calculus: Derivatives & Slopes (ڈیریویٹیوز اور سلوپ)',
    ],
  },
  {
    id: 'Physics',
    transKey: 'teacher.physics',
    defaultLabel: 'Physics',
    icon: Atom,
    topics: [
      "Newton's Three Laws of Motion (نیوٹن کے قوانین حرکت)",
      "Ohm's Law, Electric Current & Resistance (اوہم کا قانون)",
      'Work, Kinetic & Potential Energy (کام اور توانائی)',
      'Electromagnetic Induction & Transformers (برقی مقناطیسی امالہ)',
    ],
  },
  {
    id: 'Chemistry',
    transKey: 'teacher.chemistry',
    defaultLabel: 'Chemistry',
    icon: TestTubes,
    topics: [
      'Ionic, Covalent & Coordinate Bonds (کیمیائی بانڈنگ)',
      'Periodic Table Trends & Atomic Radius (دوری جدول)',
      'Acids, Bases, pH Scale & Neutralization (تیزاب اور اساس)',
      'Chemical Equilibrium & Le Chatelier Principle (کیمیائی توازن)',
    ],
  },
  {
    id: 'Biology',
    transKey: 'teacher.biology',
    defaultLabel: 'Biology',
    icon: BookOpen,
    topics: [
      'Animal Cell Structure & Organelles (جانوروں کا خلیہ اور آرگنیلز)',
      'Plant Cell Anatomy & Chloroplasts (پودوں کا خلیہ)',
      'Photosynthesis & Cellular Respiration (ضیائی تالیف اور تنفس)',
      'Cell Organelles: Nucleus, Mitochondria & Ribosomes (خلیہ کی ساخت)',
      'Mitosis vs Meiosis Cell Division (خلوی تقسیم)',
      'Human Digestive & Circulatory Systems (نظام انہضام اور دوران خون)',
    ],
  },
  {
    id: 'Computer Science',
    transKey: 'teacher.cs',
    defaultLabel: 'Computer Science',
    icon: Code2,
    topics: [
      'Object-Oriented Programming (OOP) Pillars',
      'Loops, Arrays & Functions in C++ / Python',
      'Binary Number System & Logic Gates (AND, OR, NOT)',
      'Database Normalization & SQL Queries',
    ],
  },
  {
    id: 'Pakistan Studies',
    transKey: 'student.pakStudies',
    defaultLabel: 'Pakistan Studies',
    icon: Landmark,
    topics: [
      'Lahore Resolution 1940 & Creation of Pakistan (قرارداد پاکستان)',
      'Salient Features of 1973 Constitution (آئین پاکستان 1973)',
      'Physical Features, Rivers & Climate of Pakistan (پاکستان کا جغرافیہ)',
      'Agricultural & Industrial Development in Pakistan (زراعت اور صنعت)',
    ],
  },
];

const GRADE_LEVELS = [
  'Middle School (Class 6–8)',
  'Class 9 (Matric SSC Part 1)',
  'Class 10 (Matric SSC Part 2)',
  'Class 11 (FSc / ICS / FA Part 1)',
  'Class 12 (FSc / ICS / FA Part 2)',
  'University / O & A Levels',
];

function isRTLText(text: string, fallbackRTL: boolean): boolean {
  if (!text) return fallbackRTL;
  const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  const latinChars = (text.match(/[A-Za-z]/g) || []).length;
  if (arabicChars === 0 && latinChars === 0) return fallbackRTL;
  return arabicChars >= latinChars * 0.3;
}

export const AITeacher: React.FC<AITeacherProps> = ({ selectedLanguage }) => {
  const { isRTL, t, currentLanguage, setSelectedLanguage } = useLanguage();
  const { speak, stopSpeaking } = useVoiceSettings();

  const [mode, setMode] = useState<TeacherMode>('lesson');
  const [subject, setSubject] = useState<string>('Mathematics');
  const [grade, setGrade] = useState<string>('Class 10 (Matric SSC Part 2)');
  const [query, setQuery] = useState<string>('');
  const [lessonLang, setLessonLang] = useState<LanguageCode>(selectedLanguage);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sync lesson language when global language changes
  React.useEffect(() => {
    setLessonLang(selectedLanguage);
  }, [selectedLanguage]);

  // Output States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [lessonText, setLessonText] = useState<string>('');
  const [activeTopicTitle, setActiveTopicTitle] = useState<string>('');
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const currentSubjectConfig =
    SUBJECTS_CONFIG.find((s) => s.id === subject) || SUBJECTS_CONFIG[0];
  const activeLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === lessonLang) || currentLanguage;

  // Stream or fetch lesson / solver response rapidly
  const runStreamableRequest = useCallback(
    async (endpoint: string, payload: Record<string, any>, topicLabel: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      stopSpeaking();
      setIsLoading(true);
      setIsStreaming(true);
      setError(null);
      setLessonText('');
      setActiveTopicTitle(topicLabel);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, stream: true }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || errData.message || 'Lesson generation failed.');
        }

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
              const jsonStr = line.replace(/^data:\s*/, '');
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.chunk) {
                  fullText += parsed.chunk;
                  setLessonText(fullText);
                  setIsLoading(false); // Hide initial spinner as soon as first tokens arrive
                }
                if (parsed.done && (parsed.answer || parsed.explanation || parsed.solution)) {
                  fullText = parsed.answer || parsed.explanation || parsed.solution;
                  setLessonText(fullText);
                }
              } catch (parseErr: any) {
                if (parseErr?.message && !parseErr.message.includes('JSON')) {
                  throw parseErr;
                }
              }
            }
          }
        } else {
          const data = await res.json();
          const textResult =
            data.answer || data.explanation || data.solution || data.summary || data.text || '';
          setLessonText(textResult);
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setError(err.message || 'Error consulting AI Teacher.');
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    },
    [stopSpeaking]
  );

  // Main action dispatcher based on current mode
  const handleRunAction = useCallback(
    async (overrideTopic?: string, overrideLang?: LanguageCode, overrideMode?: TeacherMode) => {
      const targetTopic = (overrideTopic !== undefined ? overrideTopic : query).trim();
      const targetLang = overrideLang || lessonLang;
      const targetMode = overrideMode || mode;

      if (!targetTopic && targetMode !== 'quiz' && targetMode !== 'flashcards') return;
      const effectiveTopic = targetTopic || `${subject} Core Concepts`;

      if (targetMode === 'lesson') {
        await runStreamableRequest(
          '/api/teacher/ask',
          {
            question: effectiveTopic,
            query: effectiveTopic,
            subject,
            grade,
            language: targetLang,
          },
          effectiveTopic
        );
      } else if (targetMode === 'solver') {
        await runStreamableRequest(
          '/api/teacher/solve',
          {
            problem: effectiveTopic,
            question: effectiveTopic,
            subject,
            grade,
            language: targetLang,
          },
          effectiveTopic
        );
      } else if (targetMode === 'quiz') {
        stopSpeaking();
        setIsLoading(true);
        setError(null);
        setSelectedAnswers({});
        setActiveTopicTitle(effectiveTopic);
        try {
          const res = await fetch('/api/teacher/quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject,
              grade,
              topic: effectiveTopic,
              numQuestions: 4,
              language: targetLang,
            }),
          });
          if (!res.ok) throw new Error('Unable to generate quiz right now.');
          const data = await res.json();
          setQuizzes(data.quizzes || data.questions || []);
        } catch (err: any) {
          setError(err.message || 'Quiz generation failed.');
        } finally {
          setIsLoading(false);
        }
      } else if (targetMode === 'flashcards') {
        stopSpeaking();
        setIsLoading(true);
        setError(null);
        setFlippedCards({});
        setActiveTopicTitle(effectiveTopic);
        try {
          const res = await fetch('/api/teacher/flashcards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject,
              grade,
              topic: effectiveTopic,
              numCards: 6,
              language: targetLang,
            }),
          });
          if (!res.ok) throw new Error('Unable to generate flashcards right now.');
          const data = await res.json();
          setFlashcards(data.flashcards || []);
        } catch (err: any) {
          setError(err.message || 'Flashcards generation failed.');
        } finally {
          setIsLoading(false);
        }
      }
    },
    [grade, lessonLang, mode, query, runStreamableRequest, stopSpeaking, subject]
  );

  // Switch lesson language and automatically refresh active lesson if one is open
  const handleLanguageSwitch = (newLang: LanguageCode) => {
    setLessonLang(newLang);
    setSelectedLanguage(newLang);
    if (activeTopicTitle || query.trim()) {
      handleRunAction(activeTopicTitle || query.trim(), newLang, mode);
    }
  };

  const {
    isListening,
    isTranscribing,
    error: sttError,
    toggleListening,
  } = useSpeechRecognition({
    language: lessonLang,
    onTranscript: (spokenText) => {
      setQuery(spokenText);
      handleRunAction(spokenText, lessonLang, mode);
    },
  });

  const handleCopy = () => {
    if (!lessonText) return;
    navigator.clipboard.writeText(lessonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lessonDirRTL = isRTLText(lessonText, isRTL);

  const correctQuizCount = Object.entries(selectedAnswers).filter(
    ([qIdx, ansIdx]) => quizzes[Number(qIdx)]?.correctIndex === ansIdx
  ).length;

  return (
    <div
      className={`w-full max-w-full min-w-0 transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[var(--background)] overflow-y-auto p-4 sm:p-6 lg:p-8'
          : 'space-y-6 py-2'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* 1. HEADER & MULTILINGUAL LESSON BAR */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 min-w-0">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent-text)] flex items-center justify-center border border-[var(--accent-border)] shrink-0 shadow-2xs">
            <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] break-words">
                {t('teacher.title', 'AI Teacher & Interactive Lessons Studio')}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-bold">
                {activeLangMeta.flag} {activeLangMeta.nativeName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {t(
                'teacher.subtitle',
                'Fast streaming lessons, step-by-step problem solving, quizzes, flashcards, and natural voice playback in Pakistani languages'
              )}
            </p>
          </div>
        </div>

        {/* Language Quick Switcher + Fullscreen Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 min-w-0 max-w-full">
          <div className="flex flex-wrap items-center gap-1.5 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl px-3 py-1.5 min-w-0 max-w-full">
            <Languages className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
            <span className="text-[11px] font-semibold text-[var(--text-muted)] shrink-0">
              {t('teacher.lessonLang', 'Lesson Language')}:
            </span>
            <select
              value={lessonLang}
              onChange={(e) => handleLanguageSwitch(e.target.value as LanguageCode)}
              className="bg-transparent text-xs font-bold text-[var(--text-primary)] focus:outline-hidden cursor-pointer min-w-0 max-w-full"
              aria-label="Select lesson language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option
                  key={lang.code}
                  value={lang.code}
                  className="bg-[var(--surface)] text-[var(--text-primary)]"
                >
                  {lang.flag} {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Full-Screen' : 'Expand to Full-Screen'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>{t('common.close', 'Exit Full Screen')}</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Screen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. MODE TABS & GRADE SELECTOR */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('lesson');
              if (activeTopicTitle || query.trim()) {
                handleRunAction(activeTopicTitle || query.trim(), lessonLang, 'lesson');
              }
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              mode === 'lesson'
                ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-xs'
                : 'bg-[var(--surface)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('teacher.modeLesson', 'Interactive Lesson')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('solver');
              if (activeTopicTitle || query.trim()) {
                handleRunAction(activeTopicTitle || query.trim(), lessonLang, 'solver');
              }
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              mode === 'solver'
                ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-xs'
                : 'bg-[var(--surface)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>{t('teacher.modeSolver', 'Step-by-Step Solver')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('quiz');
              handleRunAction(activeTopicTitle || query.trim() || subject, lessonLang, 'quiz');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              mode === 'quiz'
                ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-xs'
                : 'bg-[var(--surface)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t('teacher.modeQuiz', 'Practice Quiz')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('flashcards');
              handleRunAction(
                activeTopicTitle || query.trim() || subject,
                lessonLang,
                'flashcards'
              );
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              mode === 'flashcards'
                ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-xs'
                : 'bg-[var(--surface)] hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t('teacher.modeFlashcards', 'Audio Flashcards')}</span>
          </button>
        </div>

        {/* Grade Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-muted)]">
            {t('student.selectGrade', 'Grade / Board')}:
          </span>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] focus:outline-hidden cursor-pointer"
          >
            {GRADE_LEVELS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. MAIN FULL-SCREEN WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-w-0">
        {/* LEFT COLUMN (4 cols on desktop): SUBJECTS & CURATED QUICK LESSONS */}
        <div className="lg:col-span-4 space-y-5 min-w-0">
          {/* Subject Picker Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3.5 min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t('teacher.subjects', 'Select Academic Subject')}
            </h2>
            <div className="grid grid-cols-2 gap-2 min-w-0">
              {SUBJECTS_CONFIG.map((sub) => {
                const Icon = sub.icon;
                const isSelected = subject === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSubject(sub.id)}
                    className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer text-start min-w-0 ${
                      isSelected
                        ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] border-[var(--accent)] shadow-xs'
                        : 'bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t(sub.transKey, sub.defaultLabel)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Curated One-Click Lessons for Active Subject */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3.5 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t('teacher.quickLessons', 'Ready-to-Start Lessons')} ({subject})
              </h2>
              <Sparkles className="w-4 h-4 text-[var(--accent-text)]" />
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Click any curriculum topic below to generate and listen in{' '}
              <strong>{activeLangMeta.nativeName}</strong>:
            </p>
            <div className="space-y-2 min-w-0">
              {currentSubjectConfig.topics.map((topicItem, idx) => {
                const isCurrent = activeTopicTitle === topicItem;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(topicItem);
                      handleRunAction(topicItem, lessonLang, mode);
                    }}
                    disabled={isLoading && isCurrent}
                    className={`w-full p-3 rounded-2xl border text-xs font-medium text-start flex items-center justify-between gap-2 transition-all cursor-pointer min-w-0 ${
                      isCurrent
                        ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent-text)] font-bold'
                        : 'bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="line-clamp-2 leading-snug min-w-0 break-words">{topicItem}</span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 shrink-0 ${isRTL ? 'rotate-180' : ''}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (8 cols on desktop): SEARCH BAR + INTERACTIVE LESSON / QUIZ / FLASHCARDS DISPLAY */}
        <div className="lg:col-span-8 space-y-5 min-w-0">
          {/* Topic / Question Input Bar with Microphone Voice-to-Text */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3 min-w-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 min-w-0">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunAction()}
                placeholder={
                  mode === 'solver'
                    ? t(
                        'teacher.searchPlaceholder',
                        'Enter a Math equation, Physics numerical, or Chemistry reaction to solve step-by-step...'
                      )
                    : t(
                        'teacher.lessonPlaceholder',
                        'Enter any topic, chapter name, or question to start an interactive lesson...'
                      )
                }
                className="flex-1 min-w-0 px-4 py-3 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)]"
              />
              <button
                type="button"
                onClick={toggleListening}
                disabled={isTranscribing}
                className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border shrink-0 ${
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
                    <Mic className="w-4 h-4 text-[var(--accent-text)]" />
                    <span>{t('assistant.mic', 'Mic')}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleRunAction()}
                disabled={(!query.trim() && mode !== 'quiz' && mode !== 'flashcards') || isLoading}
                className="px-6 py-3 rounded-2xl bg-[var(--button-primary-bg)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-[var(--button-primary-text)] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('common.generating', 'Generating...')}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>
                      {mode === 'lesson' && t('teacher.startLessonBtn', 'Start Lesson')}
                      {mode === 'solver' && t('teacher.inquireBtn', 'Solve Step-by-Step')}
                      {mode === 'quiz' && t('teacher.generateQuizBtn', 'Generate Quiz')}
                      {mode === 'flashcards' &&
                        t('teacher.generateCardsBtn', 'Generate Flashcards')}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {(error || sttError) && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs sm:text-sm flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error || sttError}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRunAction()}
                className="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-semibold cursor-pointer"
              >
                {t('common.retry', 'Retry')}
              </button>
            </div>
          )}

          {/* MODE 1 & 2: LESSON & STEP-BY-STEP SOLVER OUTPUT */}
          {(mode === 'lesson' || mode === 'solver') && (
            <>
              {isLoading && !lessonText && (
                <div className="p-10 rounded-3xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-[var(--accent-text)] mx-auto" />
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    Preparing your {subject} lesson in {activeLangMeta.nativeName}...
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Streaming live response with audio support
                  </p>
                </div>
              )}

              {lessonText ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-5">
                  {/* Top Lesson Toolbar with Listen / Play Audio & Copy */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-text)]">
                        {subject} • {grade}
                      </span>
                      <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                        {activeTopicTitle || query}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Full Lesson Audio Player */}
                      <AudioControlBar
                        text={lessonText}
                        language={lessonLang}
                        label={t('teacher.listenLesson', 'Listen to Lesson')}
                      />

                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Lesson & Diagram Content Area: Side-by-Side on Desktop/Tablet, Compact on Mobile */}
                  <div
                    dir={lessonDirRTL ? 'rtl' : 'ltr'}
                    className="flex flex-col lg:flex-row gap-6 items-start"
                  >
                    {/* Main Lesson Content with Per-Heading Audio Play Button */}
                    <div
                      className={`flex-1 min-w-0 prose prose-sm sm:prose-base dark:prose-invert max-w-none text-[var(--text-primary)] ${
                        lessonDirRTL ? 'text-right leading-[2.0]' : 'text-left leading-relaxed'
                      }`}
                    >
                      <FormattedMarkdown
                        content={lessonText}
                        isRTL={lessonDirRTL}
                        renderHeadingAction={(headingText) => (
                          <button
                            type="button"
                            onClick={() => {
                              // Find section text following this heading for targeted audio playback
                              const idx = lessonText.indexOf(headingText);
                              const slice =
                                idx >= 0
                                  ? lessonText.slice(idx, idx + 700)
                                  : headingText;
                              const detected = detectSpeechLanguage(slice, lessonLang);
                              speak(slice, detected);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--accent-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-text)] border border-[var(--border)] text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                            title="Listen to this section"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Listen</span>
                          </button>
                        )}
                      />
                      {isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 align-middle bg-[var(--accent)] animate-pulse rounded-xs" />
                      )}
                    </div>

                    {/* Compact Side Educational Visual Card - sits beside text on desktop, click to enlarge */}
                    <div className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-4 order-first lg:order-last">
                      <SmartVisualCard
                        key={`${subject}_${activeTopicTitle || query}_${grade}`}
                        title={`${subject} — ${activeTopicTitle || query}`}
                        prompt={`Educational diagram and scientific textbook illustration explaining ${activeTopicTitle || query} for ${subject} ${grade} in Pakistan boards`}
                        category="student"
                        language={lessonLang}
                        initialAspectRatio="4:3"
                        autoGenerate={true}
                        compact={true}
                      />
                    </div>
                  </div>

                  {/* Bottom Lesson Actions */}
                  {!isStreaming && (
                    <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
                      <AudioControlBar
                        text={lessonText}
                        language={lessonLang}
                        label={t('teacher.listenLesson', 'Listen to Lesson')}
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMode('quiz');
                            handleRunAction(
                              activeTopicTitle || query || subject,
                              lessonLang,
                              'quiz'
                            );
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] transition-colors cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                          <span>Test Yourself with a Quiz</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMode('flashcards');
                            handleRunAction(
                              activeTopicTitle || query || subject,
                              lessonLang,
                              'flashcards'
                            );
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] transition-colors cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                          <span>Create Audio Flashcards</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                !isLoading && (
                  <div className="p-10 rounded-3xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent-text)] flex items-center justify-center mx-auto">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                      <h3 className="text-base font-bold text-[var(--text-primary)]">
                        Select a Lesson Topic or Enter Any Question
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        Choose any ready-to-start curriculum topic on the left or type a question
                        above to stream an interactive lesson with natural voice playback in{' '}
                        <strong>{activeLangMeta.nativeName}</strong>.
                      </p>
                    </div>
                  </div>
                )
              )}
            </>
          )}

          {/* MODE 3: INTERACTIVE PRACTICE QUIZ WITH MULTILINGUAL AUDIO */}
          {mode === 'quiz' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-text)]">
                    Interactive Board Exam Quiz • {activeLangMeta.nativeName}
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                    {activeTopicTitle || subject} ({grade})
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {quizzes.length > 0 && (
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      Score: {correctQuizCount} / {quizzes.length}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      handleRunAction(activeTopicTitle || query || subject, lessonLang, 'quiz')
                    }
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>New Questions</span>
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="py-12 text-center space-y-2">
                  <RefreshCw className="w-8 h-8 animate-spin text-[var(--accent-text)] mx-auto" />
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">
                    Generating {subject} practice quiz in {activeLangMeta.nativeName}...
                  </p>
                </div>
              ) : quizzes.length > 0 ? (
                <div className="space-y-6">
                  {quizzes.map((qItem, qIdx) => {
                    const userChoice = selectedAnswers[qIdx];
                    const isAnswered = userChoice !== undefined;
                    const isCorrect = userChoice === qItem.correctIndex;
                    const qRTL = isRTLText(qItem.question, isRTL);

                    return (
                      <div
                        key={qItem.id || qIdx}
                        dir={qRTL ? 'rtl' : 'ltr'}
                        className="p-5 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-relaxed">
                            {qIdx + 1}. {qItem.question}
                          </p>
                          <AudioControlBar
                            text={`${qItem.question}. ${qItem.options.join(', ')}`}
                            language={lessonLang}
                            label="Listen"
                            compact
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {qItem.options.map((opt, optIdx) => {
                            const isThisSelected = userChoice === optIdx;
                            const isThisCorrectOption = qItem.correctIndex === optIdx;

                            let btnStyle =
                              'bg-[var(--surface)] hover:bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-primary)]';
                            if (isAnswered) {
                              if (isThisCorrectOption) {
                                btnStyle =
                                  'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                              } else if (isThisSelected && !isThisCorrectOption) {
                                btnStyle =
                                  'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() =>
                                  setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                                }
                                className={`p-3.5 rounded-xl border text-xs sm:text-sm text-start flex items-center justify-between gap-2 transition-all cursor-pointer ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {isAnswered && isThisCorrectOption && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                )}
                                {isAnswered && isThisSelected && !isThisCorrectOption && (
                                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {isAnswered && qItem.explanation && (
                          <div
                            className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start justify-between gap-3 ${
                              isCorrect
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                            }`}
                          >
                            <div>
                              <strong className="block mb-0.5">
                                {isCorrect ? '✅ Correct!' : '💡 Explanation:'}
                              </strong>
                              <span>{qItem.explanation}</span>
                            </div>
                            <AudioControlBar
                              text={qItem.explanation}
                              language={lessonLang}
                              label="Listen"
                              compact
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}

          {/* MODE 4: AUDIO REVISION FLASHCARDS */}
          {mode === 'flashcards' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-text)]">
                    Interactive Audio Flashcards • {activeLangMeta.nativeName}
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)]">
                    {activeTopicTitle || subject} — Click any card to flip
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleRunAction(
                      activeTopicTitle || query || subject,
                      lessonLang,
                      'flashcards'
                    )
                  }
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Cards</span>
                </button>
              </div>

              {isLoading ? (
                <div className="py-12 text-center space-y-2">
                  <RefreshCw className="w-8 h-8 animate-spin text-[var(--accent-text)] mx-auto" />
                  <p className="text-xs font-semibold text-[var(--text-secondary)]">
                    Creating revision flashcards in {activeLangMeta.nativeName}...
                  </p>
                </div>
              ) : flashcards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flashcards.map((card, idx) => {
                    const isFlipped = Boolean(flippedCards[idx]);
                    const activeCardText = isFlipped
                      ? `${card.back}${card.notes ? `. ${card.notes}` : ''}`
                      : card.front;
                    const cardRTL = isRTLText(activeCardText, isRTL);

                    return (
                      <div
                        key={idx}
                        dir={cardRTL ? 'rtl' : 'ltr'}
                        className="p-5 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] hover:border-[var(--accent)] transition-all flex flex-col justify-between gap-4 min-h-[190px]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-muted)]">
                            Card #{idx + 1} • {isFlipped ? 'Answer / Back' : 'Question / Front'}
                          </span>
                          <AudioControlBar
                            text={activeCardText}
                            language={lessonLang}
                            label="Listen"
                            compact
                          />
                        </div>

                        <div
                          onClick={() =>
                            setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }))
                          }
                          className="flex-1 flex flex-col justify-center cursor-pointer py-2"
                        >
                          <p
                            className={`text-sm sm:text-base ${
                              isFlipped
                                ? 'font-medium text-[var(--text-primary)]'
                                : 'font-extrabold text-[var(--text-primary)]'
                            } leading-relaxed`}
                          >
                            {isFlipped ? card.back : card.front}
                          </p>
                          {isFlipped && card.notes && (
                            <p className="mt-2 text-xs text-[var(--accent-text)] font-medium">
                              💡 {card.notes}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }))
                          }
                          className="w-full py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[11px] font-semibold text-[var(--text-secondary)] flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{isFlipped ? 'Show Question (Front)' : 'Flip for Answer (Back)'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
