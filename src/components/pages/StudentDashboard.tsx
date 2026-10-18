import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Brain,
  FileQuestion,
  Loader2,
  RefreshCw,
  Library,
  Lightbulb,
  Copy,
  Check,
  Mic,
  Square,
  History as HistoryIcon,
  Trash2,
  Search,
  X,
  ChevronDown,
} from 'lucide-react';
import { FormattedMarkdown } from '../FormattedMarkdown';
import { PageId, LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AudioControlBar } from '../AudioControlBar';
import { useSpeechRecognition } from '../../utils/useSpeechRecognition';
import { SmartVisualCard } from '../SmartVisualCard';
import { MathFormula } from '../MathFormula';
import { EducationalYouTubeSection } from '../EducationalYouTubeSection';
import {
  saveFeatureHistoryItem,
  loadFeatureHistory,
  loadAllFeaturesHistory,
  deleteFeatureHistoryItem,
  FeatureHistoryItem,
} from '../../lib/firestoreService';

interface StudentDashboardProps {
  onSelectPage: (page: PageId) => void;
  selectedLanguage: LanguageCode;
}

function extractFormulasFromNotes(text: string): string[] {
  if (!text) return [];
  const formulas: string[] = [];
  const blockMatches = text.match(/\$\$([\s\S]+?)\$\$/g);
  if (blockMatches) {
    for (const m of blockMatches) {
      const clean = m.replace(/^\$\$|\$\$$/g, '').trim();
      if (clean && !formulas.includes(clean)) formulas.push(clean);
    }
  }
  const inlineMatches = text.match(/\$([^$\n]+?)\$/g);
  if (inlineMatches) {
    for (const m of inlineMatches) {
      const clean = m.replace(/^\$|\$$/g, '').trim();
      if (clean && clean.length > 2 && !formulas.includes(clean)) formulas.push(clean);
    }
  }
  return formulas.slice(0, 8);
}

const QUICK_TOPICS_BY_SUBJECT: Record<string, string[]> = {
  Chemistry: [
    'Periodic Table Trends & Atomic Radius (دوری جدول)',
    'Ionic, Covalent & Coordinate Bonds (کیمیائی بانڈنگ)',
    'Acids, Bases, pH Scale & Neutralization (تیزاب اور اساس)',
    'Chemical Equilibrium & Le Chatelier Principle (کیمیائی توازن)',
  ],
  Biology: [
    'Animal Cell Structure & Organelles (جانوروں کا خلیہ)',
    'Plant Cell Anatomy & Chloroplasts (پودوں کا خلیہ)',
    'Photosynthesis & Cellular Respiration (ضیائی تالیف اور تنفس)',
    'Mitosis vs Meiosis Cell Division (خلوی تقسیم)',
    'Human Digestive & Circulatory Systems (نظام انہضام اور دوران خون)',
  ],
  Mathematics: [
    'Algebra & Algebraic Identities (الجبرا اور الجبرائی کلیے)',
    'Quadratic Formula & Factorization (دو درجی مساوات)',
    'Pythagoras Theorem & Right Triangles (مسئلہ فیثاغورث)',
    'Matrices, Determinants & Cramer Rule (کالب اور مقطع)',
    'Trigonometric Ratios & Identities (مثلثیاتی نسبتیں)',
    'Calculus: Derivatives & Slopes (ڈیریویٹیوز اور سلوپ)',
  ],
  Physics: [
    "Newton's Three Laws of Motion (نیوٹن کے قوانین حرکت)",
    "Ohm's Law, Electric Current & Resistance (اوہم کا قانون)",
    'Work, Kinetic & Potential Energy (کام اور توانائی)',
    'Electromagnetic Induction & Transformers (برقی مقناطیسی امالہ)',
  ],
  'Computer Science': [
    'Object-Oriented Programming (OOP) Pillars',
    'Loops, Arrays & Functions in C++ / Python',
    'Binary Number System & Logic Gates (AND, OR, NOT)',
    'Database Normalization & SQL Queries',
  ],
  'Pakistan Studies': [
    'Lahore Resolution 1940 & Creation of Pakistan (قرارداد پاکستان)',
    'Salient Features of 1973 Constitution (آئین پاکستان 1973)',
    'Physical Features, Rivers & Climate of Pakistan (پاکستان کا جغرافیہ)',
    'Agricultural & Industrial Development in Pakistan (زراعت اور صنعت)',
  ],
  'Urdu Adab': [
    'اسم، فعل، حرف اور جملے کی ساخت (قواعد اردو)',
    'تلمیح، استعارہ، تشبیہ اور قافیہ و ردیف',
    'مرزا غالب اور علامہ اقبال کی شاعری کا فکری جائزہ',
    'درخواست نویسی، خطوط اور مضمون نگاری کے اصول',
  ],
};

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onSelectPage,
  selectedLanguage,
}) => {
  const { isRTL, t, currentLanguage } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'study' | 'quiz' | 'resources'>('study');
  const [subject, setSubject] = useState('Chemistry');
  const [gradeLevel, setGradeLevel] = useState('Class 10 (Matric / SSC Part 2)');
  const [studyTopic, setStudyTopic] = useState('Periodic Table Trends & Atomic Radius (دوری جدول)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [currentFormulas, setCurrentFormulas] = useState<string[]>([]);
  const [activeLessonImage, setActiveLessonImage] = useState<string | null>(null);
  const [generationKey, setGenerationKey] = useState<string>(() => Date.now().toString());
  const [copied, setCopied] = useState(false);

  // Student Feature History (Persists across reloads/revisits)
  const [studentHistory, setStudentHistory] = useState<FeatureHistoryItem[]>(() =>
    loadFeatureHistory('student', user?.id)
  );

  // Restore active study session if opened from History page or reload
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('paklingo_active_query_student');
      if (stored) {
        const item = JSON.parse(stored) as FeatureHistoryItem;
        if (item.subject) setSubject(item.subject);
        if (item.query || item.topic) setStudyTopic(item.query || item.topic || '');
        if (item.resultText) setGeneratedNotes(item.resultText);
        if (item.formulas) setCurrentFormulas(item.formulas);
        if (item.imageUrl) setActiveLessonImage(item.imageUrl);
        setGenerationKey(Date.now().toString());
        sessionStorage.removeItem('paklingo_active_query_student');
      } else {
        const lastSession = sessionStorage.getItem('paklingo_last_student_lesson');
        if (lastSession) {
          const item = JSON.parse(lastSession);
          if (item.subject) setSubject(item.subject);
          if (item.studyTopic) setStudyTopic(item.studyTopic);
          if (item.generatedNotes) setGeneratedNotes(item.generatedNotes);
          if (item.currentFormulas) setCurrentFormulas(item.currentFormulas);
          if (item.activeLessonImage) setActiveLessonImage(item.activeLessonImage);
        }
      }
    } catch {}
  }, []);

  // Save current active lesson so page refresh or revisit never loses the active lesson
  useEffect(() => {
    if (generatedNotes) {
      try {
        sessionStorage.setItem(
          'paklingo_last_student_lesson',
          JSON.stringify({
            subject,
            studyTopic,
            generatedNotes,
            currentFormulas,
            activeLessonImage,
          })
        );
      } catch {}
    }
  }, [subject, studyTopic, generatedNotes, currentFormulas, activeLessonImage]);

  // Quick practice quiz state
  const [quizQuestion, setQuizQuestion] = useState<string | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [quizExplanation, setQuizExplanation] = useState<string>('');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  // History Pop-up Panel state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'student' | 'teacher' | 'chat'>('all');
  const [allHistoryItems, setAllHistoryItems] = useState<FeatureHistoryItem[]>([]);
  const historyRef = useRef<HTMLDivElement>(null);

  // Sync complete history when popup opens or user changes
  useEffect(() => {
    if (isHistoryOpen) {
      try {
        const items = loadAllFeaturesHistory(user?.id);
        setAllHistoryItems(items);
      } catch (err) {
        console.warn('Failed to load complete history:', err);
      }
    }
  }, [isHistoryOpen, user?.id]);

  // Click outside and escape key to close History popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsHistoryOpen(false);
      }
    };
    if (isHistoryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isHistoryOpen]);

  const filteredHistory = allHistoryItems.filter((item) => {
    if (historyFilter !== 'all') {
      if (historyFilter === 'student' && item.module !== 'student') return false;
      if (historyFilter === 'teacher' && item.module !== 'teacher') return false;
      if (historyFilter === 'chat' && item.module !== 'chat') return false;
    }
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.query && item.query.toLowerCase().includes(q)) ||
      (item.topic && item.topic.toLowerCase().includes(q)) ||
      (item.subject && item.subject.toLowerCase().includes(q)) ||
      (item.resultText && item.resultText.toLowerCase().includes(q))
    );
  });

  const subjectsList = [
    { id: 'math', value: 'Mathematics', name: t('teacher.math', 'Mathematics') },
    { id: 'physics', value: 'Physics', name: t('teacher.physics', 'Physics') },
    { id: 'chemistry', value: 'Chemistry', name: t('teacher.chemistry', 'Chemistry') },
    { id: 'biology', value: 'Biology', name: t('teacher.biology', 'Biology') },
    { id: 'cs', value: 'Computer Science', name: t('teacher.cs', 'Computer Science') },
    { id: 'pakstudies', value: 'Pakistan Studies', name: t('student.pakStudies', 'Pakistan Studies') },
    { id: 'urdu', value: 'Urdu Adab', name: t('student.urduLiterature', 'Urdu Grammar & Literature') },
  ];

  // Dynamically tailor quick topics to strictly match the active subject!
  const quickTopics = QUICK_TOPICS_BY_SUBJECT[subject] || QUICK_TOPICS_BY_SUBJECT['Chemistry'];

  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    const subTopics = QUICK_TOPICS_BY_SUBJECT[newSubject];
    if (subTopics && subTopics.length > 0) {
      setStudyTopic(subTopics[0]);
    }
    // IMMEDIATELY REMOVE previous lesson, formulas, and image so old and new content never mix!
    setGeneratedNotes(null);
    setCurrentFormulas([]);
    setActiveLessonImage(null);
    setIsGenerating(false);
    setGenerationKey(Date.now().toString());
  };

  const handleReopenLesson = (item: FeatureHistoryItem) => {
    if (item.subject) setSubject(item.subject);
    if (item.query || item.topic) setStudyTopic(item.query || item.topic || '');
    setGeneratedNotes(item.resultText || '');
    setCurrentFormulas(item.formulas || []);
    setActiveLessonImage(item.imageUrl || null);
    setIsGenerating(false);
    setGenerationKey(Date.now().toString());
    setActiveTab('study');
    setIsHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAnyHistoryItem = (item: FeatureHistoryItem) => {
    setIsHistoryOpen(false);
    if (item.module === 'student') {
      handleReopenLesson(item);
    } else {
      try {
        sessionStorage.setItem(`paklingo_active_query_${item.module}`, JSON.stringify(item));
      } catch {}
      onSelectPage(item.module as any);
    }
  };

  const handleDeleteHistory = (id: string) => {
    deleteFeatureHistoryItem('student', id, user?.id);
    setStudentHistory((prev) => prev.filter((p) => p.id !== id));
    setAllHistoryItems((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDeleteHistoryItem = (item: FeatureHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteFeatureHistoryItem(item.module, item.id, user?.id);
    setAllHistoryItems((prev) => prev.filter((p) => p.id !== item.id));
    if (item.module === 'student') {
      setStudentHistory((prev) => prev.filter((p) => p.id !== item.id));
    }
  };

  const handleGenerateStudyGuide = async (overrideTopic?: string) => {
    const targetTopic = (overrideTopic !== undefined ? overrideTopic : studyTopic).trim();
    if (!targetTopic || isGenerating) return;

    // 1. IMMEDIATELY REMOVE previous lesson and image, and show loading indicator
    setGeneratedNotes(null);
    setCurrentFormulas([]);
    setActiveLessonImage(null);
    setIsGenerating(true);
    const curKey = Date.now().toString();
    setGenerationKey(curKey);

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

      let savedText = '';
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
        savedText = fullText;
      } else {
        const data = await res.json();
        savedText = data.explanation || data.reply || data.answer || 'Study guide generated successfully.';
        setGeneratedNotes(savedText);
      }

      if (savedText) {
        const extractedFormulas = extractFormulasFromNotes(savedText);
        setCurrentFormulas(extractedFormulas);

        // Fetch or verify image for this lesson to persist in history
        let lessonImgUrl: string | undefined = undefined;
        try {
          const imgRes = await fetch('/api/image/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `Educational concept diagram and study illustration for ${targetTopic} in ${subject}`,
              title: `${subject} — ${targetTopic}`,
              category: 'student',
              language: selectedLanguage,
              aspectRatio: '4:3',
              style: 'diagram',
            }),
          });
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            if (imgData.imageUrl) {
              lessonImgUrl = imgData.imageUrl;
              setActiveLessonImage(imgData.imageUrl);
            }
          }
        } catch (imgErr) {
          console.warn('Image fetch for history skipped:', imgErr);
        }

        const saved = saveFeatureHistoryItem(
          'student',
          {
            title: `${subject} — ${targetTopic}`,
            subtitle: `${gradeLevel} • ${currentLanguage.nativeName}`,
            query: targetTopic,
            subject,
            topic: targetTopic,
            resultText: savedText,
            formulas: extractedFormulas,
            imageUrl: lessonImgUrl,
            language: selectedLanguage,
          },
          user?.id
        );
        setStudentHistory((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)].slice(0, 30));
      }
    } catch {
      const fallback =
        `### 📚 ${targetTopic} — ${subject} (${gradeLevel})\n\n` +
        `**Key Concepts:**\n` +
        `- Comprehensive fundamentals aligned with Pakistani curriculum (FBISE / Punjab / Sindh / KPK / Balochistan boards).\n` +
        `- Step-by-step conceptual breakdown in ${currentLanguage.nativeName}.\n\n` +
        `**Practice Tips:**\n` +
        `1. Memorize core definitions and primary units.\n` +
        `2. Practice previous 5-year past papers questions.\n` +
        `3. Use PakLingo AI Teacher for instant step-by-step problem solving.`;
      setGeneratedNotes(fallback);
      const extractedFormulas = extractFormulasFromNotes(fallback);
      setCurrentFormulas(extractedFormulas);
      const saved = saveFeatureHistoryItem(
        'student',
        {
          title: `${subject} — ${targetTopic}`,
          subtitle: `${gradeLevel} • ${currentLanguage.nativeName}`,
          query: targetTopic,
          subject,
          topic: targetTopic,
          resultText: fallback,
          formulas: extractedFormulas,
          language: selectedLanguage,
        },
        user?.id
      );
      setStudentHistory((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)].slice(0, 30));
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

  const {
    isListening,
    isTranscribing,
    toggleListening,
  } = useSpeechRecognition({
    language: selectedLanguage,
    onTranscript: (spokenText) => {
      setStudyTopic(spokenText);
      handleGenerateStudyGuide(spokenText);
    },
  });

  const handleCopy = () => {
    if (!generatedNotes) return;
    navigator.clipboard.writeText(generatedNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 py-2" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* TABS NAVIGATION & HISTORY DROPDOWN */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2 relative">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('study');
              setIsHistoryOpen(false);
            }}
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
              setIsHistoryOpen(false);
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
            onClick={() => {
              setActiveTab('resources');
              setIsHistoryOpen(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'resources'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>{t('student.tabResources', 'Board Curricula & Guides')}</span>
          </button>

          {/* History Button & Dropdown/Popup Panel beside the tabs */}
          <div className="relative" ref={historyRef}>
            <button
              type="button"
              onClick={() => setIsHistoryOpen((prev) => !prev)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                isHistoryOpen
                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20'
                  : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]'
              }`}
              aria-expanded={isHistoryOpen}
              aria-label="Toggle saved chat and search history"
            >
              <HistoryIcon className="w-3.5 h-3.5" />
              <span>{t('common.history', 'History')}</span>
              {allHistoryItems.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isHistoryOpen
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-500/10 text-emerald-600'
                  }`}
                >
                  {allHistoryItems.length}
                </span>
              )}
              <ChevronDown
                className={`w-3 h-3 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Complete Saved Chat and Search History Pop-up Panel */}
            {isHistoryOpen && (
              <div
                className={`absolute top-full mt-2 z-50 w-[92vw] sm:w-[480px] md:w-[540px] max-w-[95vw] ${
                  isRTL ? 'left-0 sm:left-auto right-auto sm:right-0' : 'left-0'
                } rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl p-4 sm:p-5 flex flex-col gap-3.5 max-h-[82vh] overflow-hidden backdrop-blur-md`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <HistoryIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        {t('history.title', 'Saved Chat & Search History')}
                      </h3>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        {t(
                          'history.subtitle',
                          'Reopen previous chats, lessons, formulas, and diagrams'
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                    aria-label="Close history panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search Bar & Filter Chips */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder={t(
                        'history.searchPlaceholder',
                        'Search saved topics, queries, or formulas...'
                      )}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    {historySearch && (
                      <button
                        type="button"
                        onClick={() => setHistorySearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    {[
                      { id: 'all', label: t('history.filterAll', 'All History') },
                      { id: 'student', label: t('history.filterLessons', 'Student Lessons') },
                      { id: 'teacher', label: t('history.filterTeacher', 'Teacher & Faculty') },
                      { id: 'chat', label: t('history.filterChats', 'Chats') },
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setHistoryFilter(filter.id as any)}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          historyFilter === filter.id
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)]'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items List */}
                <div className="overflow-y-auto space-y-2.5 max-h-[50vh] pr-1">
                  {filteredHistory.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                      <HistoryIcon className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                      <p className="text-xs text-[var(--text-secondary)]">
                        {historySearch
                          ? t('history.noResults', 'No matching history found for this search.')
                          : t('history.empty', 'No saved searches or lessons yet.')}
                      </p>
                    </div>
                  ) : (
                    filteredHistory.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleOpenAnyHistoryItem(item)}
                          className="p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] hover:border-emerald-500/50 hover:bg-[var(--surface-hover)] transition-all cursor-pointer group flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                              {item.subject ||
                                (item.module === 'student'
                                  ? 'Student'
                                  : item.module === 'teacher'
                                    ? 'Teacher & Faculty'
                                    : item.module)}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {new Date(item.createdAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteHistoryItem(item, e)}
                                className="p-1 rounded text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-500/10 transition-colors opacity-70 group-hover:opacity-100"
                                title="Delete this history entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            {item.imageUrl && (
                              <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 border border-[var(--border)] shrink-0">
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-full h-full object-contain p-0.5"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-1 group-hover:text-emerald-600 transition-colors">
                                {item.topic || item.query || item.title}
                              </h4>
                              <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-0.5">
                                {item.subtitle ||
                                  item.resultText?.slice(0, 100) ||
                                  item.query}
                              </p>
                            </div>
                          </div>

                          {item.formulas && item.formulas.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-[var(--border)]/50">
                              {item.formulas.slice(0, 2).map((formula, idx) => (
                                <MathFormula
                                  key={idx}
                                  formula={formula}
                                  className="text-[10px]"
                                />
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-emerald-600 font-semibold group-hover:underline inline-flex items-center gap-1">
                              <span>{t('history.reopen', 'Reopen & View')}</span>
                              <ArrowRight className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
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
                onChange={(e) => handleSubjectChange(e.target.value)}
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

            {/* Topic Input with Voice Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                {t('student.topicPlaceholder', 'Topic or Chapter Name')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={studyTopic}
                  onChange={(e) => setStudyTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateStudyGuide()}
                  placeholder="e.g., Photosynthesis, Newton's Laws, Quadratic Equations"
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={isTranscribing}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border shrink-0 ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                      : 'bg-[var(--surface-secondary)] hover:bg-[var(--accent-subtle)] text-[var(--text-primary)] border-[var(--border)]'
                  }`}
                  title={t('assistant.listenControl', 'Voice Input')}
                >
                  {isListening ? (
                    <Square className="w-3.5 h-3.5 fill-current" />
                  ) : isTranscribing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Mic className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </button>
              </div>
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

            {isGenerating ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    Generating {subject} Study Guide &amp; Diagrams...
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                    Preparing curriculum breakdown, formulas, and verified diagrams for: <strong>{studyTopic}</strong>
                  </p>
                </div>
              </div>
            ) : generatedNotes ? (
              <div className="space-y-4">
                {/* Formulas & Key Concepts Bar */}
                {currentFormulas && currentFormulas.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                      ✦ Key Formulas &amp; Board Identities:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentFormulas.map((f, i) => (
                        <MathFormula key={i} formula={f} showCopy={true} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6 items-start" dir={isRTL ? 'rtl' : 'ltr'}>
                  {/* Notes Text Content */}
                  <div className="flex-1 min-w-0 p-5 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)]">
                    <FormattedMarkdown content={generatedNotes} isRTL={isRTL} />
                  </div>

                  {/* Compact Side Visual Diagram */}
                  <div className="w-full lg:w-72 xl:w-80 shrink-0 lg:sticky lg:top-4 order-first lg:order-last">
                    <SmartVisualCard
                      key={`${subject}_${studyTopic}_${generationKey}`}
                      title={`${subject} — ${studyTopic}`}
                      prompt={`Educational concept diagram and study illustration for ${studyTopic} in ${subject}`}
                      category="student"
                      language={selectedLanguage}
                      initialAspectRatio="4:3"
                      initialImageUrl={activeLessonImage || undefined}
                      autoGenerate={true}
                      compact={true}
                    />
                  </div>
                </div>

                {/* Automatic Educational YouTube Video Lessons */}
                <EducationalYouTubeSection
                  topic={studyTopic}
                  subject={subject}
                />
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
