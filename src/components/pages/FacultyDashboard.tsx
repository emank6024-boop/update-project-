import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Users,
  FileSpreadsheet,
  ArrowRight,
  ClipboardList,
  Layers,
  Loader2,
  Copy,
  Presentation,
  Check,
  Mic,
  Square,
  RefreshCw,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageId, LanguageCode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { AudioControlBar } from '../AudioControlBar';
import { useSpeechRecognition } from '../../utils/useSpeechRecognition';

interface FacultyDashboardProps {
  onSelectPage: (page: PageId) => void;
  selectedLanguage: LanguageCode;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  onSelectPage,
  selectedLanguage,
}) => {
  const { isRTL, t, currentLanguage } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'lessonPlan' | 'rubric' | 'questionBank'>('lessonPlan');
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [targetClass, setTargetClass] = useState('Class 10 (Matric)');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    isListening,
    isTranscribing,
    toggleListening,
  } = useSpeechRecognition({
    language: selectedLanguage,
    onTranscript: (spokenText) => {
      setTopic(spokenText);
    },
  });

  const facultyName = user?.name || (user?.isDemo ? 'Prof. Tariq Mahmood' : 'Educator');

  const facultyStats = [
    {
      label: t('faculty.activeClasses', 'Active Classes'),
      value: '4 Sections',
      icon: Users,
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      label: t('faculty.lessonPlans', 'Curriculum Plans'),
      value: '18 Generated',
      icon: Layers,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      label: t('faculty.questionBank', 'Exam Questions'),
      value: '140+ Items',
      icon: ClipboardList,
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      label: t('faculty.languagesSupported', 'Classroom Languages'),
      value: 'UR / PA / SD / PS / BAL / EN',
      icon: BookOpen,
      color: 'bg-amber-500/10 text-amber-600',
    },
  ];

  const handleGenerate = async (type: 'lesson' | 'rubric' | 'questions') => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    setGeneratedOutput('');

    let promptText = '';
    if (type === 'lesson') {
      promptText = `Create a comprehensive 45-minute bilingual lesson plan for teaching '${topic}' in ${subject} (${targetClass}). Include: 1) Learning Objectives (SLOs), 2) Prior Knowledge Activation, 3) 15-minute Direct Instruction Breakdown, 4) Formative Check Activities, 5) Homework Assignment, and 6) Bilingual Vocabulary keywords in English and ${currentLanguage.name}.`;
    } else if (type === 'rubric') {
      promptText = `Create a detailed 4-level grading rubric (Exemplary 4, Proficient 3, Developing 2, Novice 1) for an assignment or project on '${topic}' in ${subject} (${targetClass}). Criteria should include Conceptual Understanding, Scientific/Mathematical Accuracy, Presentation, and Inquiry.`;
    } else {
      promptText = `Generate a board exam question paper section for '${topic}' in ${subject} (${targetClass}). Include 4 MCQs with answer keys, 3 conceptual Short Answer questions, and 1 Long analytical question according to Pakistani board examination standards.`;
    }

    try {
      const res = await fetch('/api/teacher/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: promptText,
          query: promptText,
          language: selectedLanguage,
          subject,
          grade: targetClass,
          stream: true,
        }),
      });

      if (!res.ok) throw new Error('Generation failed');

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
                setGeneratedOutput(fullText);
              }
              if (parsed.done && parsed.answer) {
                fullText = parsed.answer;
                setGeneratedOutput(fullText);
              }
            } catch {
              // ignore partial json
            }
          }
        }
      } else {
        const data = await res.json();
        setGeneratedOutput(
          data.explanation ||
            data.reply ||
            data.answer ||
            'Faculty curriculum resource generated successfully.'
        );
      }
    } catch {
      if (type === 'lesson') {
        setGeneratedOutput(
          `### 📋 Lesson Plan: ${topic}\n` +
            `**Subject:** ${subject} | **Grade:** ${targetClass} | **Duration:** 45 Minutes\n\n` +
            `#### 1. Student Learning Objectives (SLOs)\n` +
            `- Define and explain the primary principles of ${topic}.\n` +
            `- Differentiate between theoretical models and real-world Pakistani applications.\n` +
            `- Formulate accurate answers to board past-paper questions.\n\n` +
            `#### 2. Lesson Phases\n` +
            `- **00-05 min (Warm-up):** Real-world hook and inquiry question in ${currentLanguage.nativeName}.\n` +
            `- **05-25 min (Instruction):** Conceptual breakdown on the board with diagrams.\n` +
            `- **25-35 min (Guided Practice):** Paired student activity solving 2 sample problems.\n` +
            `- **35-45 min (Wrap-up):** Quick exit slip and homework assigned.`
        );
      } else if (type === 'rubric') {
        setGeneratedOutput(
          `### 📊 Assessment Rubric: ${topic}\n\n` +
            `| Criteria | Exemplary (4) | Proficient (3) | Developing (2) | Novice (1) |\n` +
            `| :--- | :--- | :--- | :--- | :--- |\n` +
            `| **Concept Mastery** | Flawless definitions and derivations | Clear understanding with minor slips | Partial grasp of core concepts | Misconceptions present |\n` +
            `| **Problem Solving** | Systematic steps with units & proofs | Accurate answer, minor notation errors | Partial method shown | Incorrect formula used |`
        );
      } else {
        setGeneratedOutput(
          `### 📝 Question Paper: ${topic} (${subject})\n\n` +
            `#### Section A: Multiple Choice Questions (4 Marks)\n` +
            `1. What is the standard definition of the core phenomenon in ${topic}?\n` +
            `   A) Option A    B) Option B    C) Option C    D) Option D [Answer: A]`
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 py-2" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* 1. WELCOME HEADER */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
            <Presentation className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                {t('faculty.welcome', 'Faculty & Educator Lesson Plan Studio')}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                <Sparkles className="w-3 h-3" />
                <span>
                  {facultyName} • {currentLanguage.nativeName}
                </span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {t(
                'faculty.subtitle',
                'Curriculum authoring, multilingual lesson plan streaming, audio playback, and assessment tools for Pakistani teachers'
              )}
            </p>
          </div>
        </div>

        {/* Quick Return to Student Portal */}
        <button
          type="button"
          onClick={() => onSelectPage('student')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
        >
          <GraduationCap className="w-4 h-4 text-emerald-600" />
          <span>{t('faculty.switchStudent', 'View Student Portal')}</span>
          <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {facultyStats.map((item, idx) => {
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
          onClick={() => setActiveTab('lessonPlan')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'lessonPlan'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t('faculty.tabLessonPlan', 'Lesson Plan Generator')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rubric')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'rubric'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>{t('faculty.tabRubric', 'Rubric & Assessment Maker')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('questionBank')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'questionBank'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)]'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>{t('faculty.tabQuestionBank', 'Board Exam Question Bank')}</span>
        </button>
      </div>

      {/* 4. CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Configuration Column (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            {activeTab === 'lessonPlan' && t('faculty.configLesson', 'Configure Lesson Plan')}
            {activeTab === 'rubric' && t('faculty.configRubric', 'Configure Grading Rubric')}
            {activeTab === 'questionBank' &&
              t('faculty.configQuestions', 'Configure Question Paper')}
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
              {t('faculty.subject', 'Academic Subject')}
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Pakistan Studies">Pakistan Studies</option>
              <option value="English Language">English Language</option>
              <option value="Urdu Adab">Urdu Adab</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
              {t('faculty.classLevel', 'Target Class / Board')}
            </label>
            <select
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="Class 9 (Matric Part 1)">Class 9 (Matric Part 1)</option>
              <option value="Class 10 (Matric Part 2)">Class 10 (Matric Part 2)</option>
              <option value="Class 11 (FSc / Intermediate Part 1)">
                Class 11 (FSc / Intermediate Part 1)
              </option>
              <option value="Class 12 (FSc / Intermediate Part 2)">
                Class 12 (FSc / Intermediate Part 2)
              </option>
              <option value="University Undergraduate">University Undergraduate</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">
              {t('faculty.topic', 'Curriculum Topic / SLO Objective')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (activeTab === 'lessonPlan') handleGenerate('lesson');
                    else if (activeTab === 'rubric') handleGenerate('rubric');
                    else handleGenerate('questions');
                  }
                }}
                placeholder="e.g., Electromagnetic Induction, Cell Division, Quadratic Formula"
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-indigo-500"
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
                  <Mic className="w-3.5 h-3.5 text-indigo-600" />
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (activeTab === 'lessonPlan') handleGenerate('lesson');
              else if (activeTab === 'rubric') handleGenerate('rubric');
              else handleGenerate('questions');
            }}
            disabled={isGenerating || !topic.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('faculty.generating', 'Streaming Curriculum Material...')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('faculty.generateBtn', 'Generate Lesson Plan / Material')}</span>
              </>
            )}
          </button>
        </div>

        {/* Output Column (8 cols) */}
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
              {t('faculty.outputHeading', 'Curriculum Output & Teaching Resource')} (
              {currentLanguage.nativeName})
            </h3>
            {generatedOutput && (
              <div className="flex flex-wrap items-center gap-2">
                <AudioControlBar
                  text={generatedOutput}
                  language={selectedLanguage}
                  label="Listen to Lesson Plan"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--border)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {copied ? t('common.copied', 'Copied!') : t('common.copy', 'Copy Content')}
                  </span>
                </button>
              </div>
            )}
          </div>

          {generatedOutput ? (
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-[var(--text-primary)] leading-relaxed p-5 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedOutput}</ReactMarkdown>
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <Presentation className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-40" />
              <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto">
                {t(
                  'faculty.emptyPrompt',
                  'Select a subject and enter your classroom chapter to stream lesson plans, rubrics, and SLO questions with audio playback in your chosen language.'
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
