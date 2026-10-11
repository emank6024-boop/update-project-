import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Languages,
  Bot,
  Volume2,
  FileText,
  HeartPulse,
  Scale,
  GraduationCap,
  Presentation,
  BookOpen,
  Settings as SettingsIcon,
  Building2,
  Sprout,
  ArrowRight,
  Sparkles,
  Globe2,
  Mic,
  MicOff,
  Image as ImageIcon,
  Paperclip,
  Send,
  Search,
  Square,
  X,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { PageId, LanguageCode, ChatAttachment } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { useLanguage } from '../../context/LanguageContext';
import { getLanguageBCP47 } from '../../i18n';
import { PakLingoLogo } from '../PakLingoLogo';

interface HomeProps {
  onSelectPage: (page: PageId) => void;
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onStartChatWithPrompt?: (prompt: string, attachments?: ChatAttachment[]) => void;
  onOpenAuthModal?: () => void;
  simpleMode?: boolean;
}

export const Home: React.FC<HomeProps> = ({
  onSelectPage,
  selectedLanguage,
  onSelectLanguage,
  onStartChatWithPrompt,
}) => {
  const { isRTL, t, setSelectedLanguage: setGlobalLanguage, currentLanguage } = useLanguage();

  // Professional Multimodal Hero Search & Assistant Bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAttachments, setSearchAttachments] = useState<ChatAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleLanguageClick = (langCode: LanguageCode) => {
    onSelectLanguage(langCode);
    setGlobalLanguage(langCode);
  };

  const stopHeroVoiceSession = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((tr) => tr.stop());
      mediaStreamRef.current = null;
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      stopHeroVoiceSession();
    };
  }, [stopHeroVoiceSession]);

  const startHeroCloudRecording = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setSearchNotice('Microphone access is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      setIsListening(true);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((tr) => tr.stop());
          mediaStreamRef.current = null;
        }
        setIsListening(false);
        const chunks = audioChunksRef.current;
        if (!chunks.length) return;
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        if (blob.size < 400) return;

        setIsTranscribing(true);
        try {
          const base64Audio = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(String(reader.result || ''));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          const res = await fetch('/api/chat/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64Audio,
              mimeType: blob.type || 'audio/webm',
              language: selectedLanguage,
            }),
          });
          const data = await res.json();
          if (res.ok && data.transcript?.trim()) {
            setSearchQuery((prev) => `${prev ? prev + ' ' : ''}${data.transcript.trim()}`);
            setSearchNotice(null);
          } else {
            setSearchNotice('Could not detect clear speech. Please try again or type your query.');
          }
        } catch {
          setSearchNotice('Voice transcription failed. Please type your query.');
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start(250);
    } catch (err: any) {
      setIsListening(false);
      if (err?.name === 'NotAllowedError') {
        setSearchNotice('Microphone permission was denied. Please allow microphone access in browser settings.');
      } else {
        setSearchNotice('Unable to access microphone.');
      }
    }
  }, [selectedLanguage]);

  const toggleHeroVoiceInput = async () => {
    setSearchNotice(null);
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        return;
      }
      stopHeroVoiceSession();
      return;
    }

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    const cloudOnlyLangs: LanguageCode[] = ['bal', 'sd', 'ps', 'skr', 'hnd', 'ks', 'brh'];
    if (!SpeechRecognition || cloudOnlyLangs.includes(selectedLanguage)) {
      await startHeroCloudRecording();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = getLanguageBCP47(selectedLanguage);
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setSearchQuery((prev) => `${prev ? prev + ' ' : ''}${transcript}`.trim());
        }
      };
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event?.error === 'language-not-supported') {
          startHeroCloudRecording();
        } else if (event?.error === 'not-allowed') {
          setSearchNotice('Microphone permission denied. Please allow microphone access.');
        }
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      await startHeroCloudRecording();
    }
  };

  const handleHeroImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    setSearchNotice(null);

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setSearchNotice('Please select a valid image file (PNG, JPG, WEBP).');
      e.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSearchNotice('Image size must be under 10 MB.');
      e.target.value = '';
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setSearchAttachments((prev) => [
      ...prev,
      {
        id: `hero_img_${Date.now()}`,
        type: 'image',
        name: file.name,
        mimeType: file.type || 'image/jpeg',
        size: file.size,
        dataBase64: dataUrl,
        previewUrl: dataUrl,
      },
    ]);
    e.target.value = '';
  };

  const handleHeroFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    setSearchNotice(null);

    const file = files[0];
    if (file.size > 12 * 1024 * 1024) {
      setSearchNotice('Document size must be under 12 MB.');
      e.target.value = '';
      return;
    }

    const isText = file.type.startsWith('text/') || /\.(txt|md|csv|json)$/i.test(file.name);
    if (isText) {
      const textContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsText(file);
      });
      setSearchAttachments((prev) => [
        ...prev,
        {
          id: `hero_file_${Date.now()}`,
          type: 'file',
          name: file.name,
          mimeType: file.type || 'text/plain',
          size: file.size,
          textContent,
        },
      ]);
    } else {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setSearchAttachments((prev) => [
        ...prev,
        {
          id: `hero_file_${Date.now()}`,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name,
          mimeType: file.type || 'application/pdf',
          size: file.size,
          dataBase64: dataUrl,
          previewUrl: file.type.startsWith('image/') ? dataUrl : undefined,
        },
      ]);
    }
    e.target.value = '';
  };

  const handleHeroSearchSubmit = (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    if (isListening) stopHeroVoiceSession();

    const promptText = (customPrompt !== undefined ? customPrompt : searchQuery).trim();
    if (!promptText && searchAttachments.length === 0) {
      onSelectPage('ai-assistant');
      return;
    }

    if (onStartChatWithPrompt) {
      onStartChatWithPrompt(promptText, searchAttachments.length > 0 ? searchAttachments : undefined);
      setSearchQuery('');
      setSearchAttachments([]);
    } else {
      onSelectPage('ai-assistant');
    }
  };

  const quickSearchPrompts = [
    {
      label: t('hero.promptNadra', 'NADRA Smart NIC'),
      prompt: t(
        'hero.promptNadraQuery',
        'NADRA Smart NIC renewal procedure, fees, and required documents in Pakistan'
      ),
    },
    {
      label: t('hero.promptBill', 'Electricity Bill Taxes'),
      prompt: t(
        'hero.promptBillQuery',
        'Explain fuel price adjustment (FPA), taxes, and surcharges in Pakistani electricity bills'
      ),
    },
    {
      label: t('hero.promptWheat', 'Wheat Crop Diseases'),
      prompt: t(
        'hero.promptWheatQuery',
        'Wheat crop yellow rust disease symptoms and organic treatment in Pakistan'
      ),
    },
    {
      label: t('hero.promptBisp', 'BISP 8171 Eligibility'),
      prompt: t(
        'hero.promptBispQuery',
        'How to check BISP 8171 financial assistance eligibility and verification process'
      ),
    },
  ];

  return (
    <div
      className="relative w-full max-w-full min-w-0 min-h-[calc(100dvh-4rem)] flex flex-col justify-between bg-transparent text-[var(--text-primary)] transition-colors duration-200 overflow-x-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* 1. HIGH-CLARITY HERO & MULTIMODAL SEARCH SECTION */}
      <section className="relative z-10 w-full max-w-5xl min-w-0 mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-9 pb-5 sm:pb-7 text-center flex flex-col items-center justify-center flex-1">
        {/* Brand Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--accent-border)] text-[var(--accent-text)] text-xs font-semibold mb-4 shadow-2xs max-w-full">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
          <span className="truncate">{t('hero.badge', 'AI for Pakistan’s Languages & People')}</span>
        </div>

        {/* Main Headline — Balanced Size, Generous Line Height & High Contrast */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-extrabold tracking-tight text-[var(--text-primary)] max-w-3xl w-full mx-auto leading-[1.24] mb-3.5 break-words">
          {t(
            'hero.title',
            'Empowering Every Pakistani Through AI, Language, and Accessibility'
          )}
        </h1>

        {/* Supporting Paragraph — Clear Readability & Comfortable Width */}
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-6 font-normal">
          {t(
            'hero.description',
            'PakLingo AI connects Pakistan’s diverse linguistic heritage with cutting-edge artificial intelligence. Ask questions by voice, upload images or documents, or translate across regional languages.'
          )}
        </p>

        {/* PROFESSIONAL MULTIMODAL AI SEARCH & ASSISTANT HUB */}
        <div className="w-full max-w-3xl mx-auto mb-5">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleHeroImageSelect}
            className="hidden"
            aria-label="Upload image for AI search"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.csv,.json,application/pdf,text/*"
            onChange={handleHeroFileSelect}
            className="hidden"
            aria-label="Attach document for AI search"
          />

          <form
            onSubmit={handleHeroSearchSubmit}
            className="pak-glass-card rounded-2xl p-3 sm:p-4 border-2 border-[var(--border-strong)] shadow-lg transition-all duration-200 focus-within:border-[var(--accent)]"
          >
            {/* Attached Image/File Preview Tray inside Search Bar */}
            {searchAttachments.length > 0 && (
              <div className="flex items-center gap-2 px-2 pb-2.5 mb-2.5 border-b border-[var(--border)] overflow-x-auto">
                {searchAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-strong)] text-xs shrink-0"
                  >
                    {att.type === 'image' && att.previewUrl ? (
                      <img
                        src={att.previewUrl}
                        alt={att.name}
                        className="w-7 h-7 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <FileText className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
                    )}
                    <span className="font-semibold text-[var(--text-primary)] truncate max-w-[150px]">
                      {att.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSearchAttachments((prev) => prev.filter((item) => item.id !== att.id))
                      }
                      className="p-0.5 rounded-full hover:bg-rose-600 hover:text-white text-[var(--text-secondary)] cursor-pointer"
                      aria-label={`Remove ${att.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Main Search Input Row */}
            <div className="flex items-center gap-3 px-2 py-1.5 min-w-0">
              <Search className="w-5 h-5 text-[var(--accent-text)] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'hero.searchPlaceholder',
                  `Ask PakLingo AI anything in ${currentLanguage.nativeName} (${currentLanguage.name}), speak, or upload an image...`
                )}
                className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] placeholder:opacity-80 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 rounded-full hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer shrink-0"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Bottom Action Bar inside Search Box: Mic, Upload Image, Attach File, Language Selector, Ask AI Button */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 mt-2 border-t border-[var(--border)] px-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={toggleHeroVoiceInput}
                  disabled={isTranscribing}
                  className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                      : 'bg-[var(--surface-secondary)] hover:bg-[var(--accent-subtle)] text-[var(--text-primary)] hover:text-[var(--accent-text)] border-[var(--border-strong)]'
                  }`}
                  title={isListening ? t('voice.stopBtn', 'Stop') : t('assistant.listenControl', 'Voice Input')}
                >
                  {isListening ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current shrink-0" />
                      <span>{t('voice.listeningShort', 'Listening...')} ({t('voice.stopBtn', 'Stop')})</span>
                    </>
                  ) : isTranscribing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                      <span>{t('common.loading', 'Transcribing...')}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" />
                      <span>{t('assistant.listenControl', 'Voice Input')}</span>
                    </>
                  )}
                </button>

                {/* Upload Image Button */}
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="h-9 px-3.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--accent-subtle)] text-[var(--text-primary)] hover:text-[var(--accent-text)] border border-[var(--border-strong)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={t('assistant.uploadImage', 'Upload Image')}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" />
                  <span>{t('assistant.uploadImage', 'Upload Image')}</span>
                </button>

                {/* Attach File Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-9 px-3.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--accent-subtle)] text-[var(--text-primary)] hover:text-[var(--accent-text)] border border-[var(--border-strong)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={t('assistant.uploadFile', 'Attach File')}
                >
                  <Paperclip className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" />
                  <span>{t('assistant.uploadFile', 'Attach File')}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-xl text-xs font-semibold bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border-strong)]">
                  <span>{currentLanguage.flag}</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageClick(e.target.value as LanguageCode)}
                    aria-label={t('hero.voiceLangLabel', 'Voice Language')}
                    className="bg-transparent text-xs font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code} className="bg-[var(--surface)] text-[var(--text-primary)]">
                        {l.nativeName} ({l.name})
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-[var(--button-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--button-primary-text)] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('common.askAI', 'Ask PakLingo AI')}</span>
                  <Send className={`w-3.5 h-3.5 shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </form>

          {/* Voice / Upload Notice inside Hero */}
          {searchNotice && (
            <div className="mt-2.5 px-3.5 py-2 rounded-xl bg-[var(--surface)] border border-amber-500/40 text-[var(--text-primary)] text-xs flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{searchNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setSearchNotice(null)}
                className="p-1 rounded hover:bg-[var(--surface-secondary)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Prompt Suggestion Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)] px-1">
              {t('hero.tryPrompt', 'Popular queries:')}
            </span>
            {quickSearchPrompts.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleHeroSearchSubmit(undefined, item.prompt)}
                className="h-8 px-3.5 rounded-full bg-[var(--surface)] hover:bg-[var(--accent-subtle)] border border-[var(--border-strong)] hover:border-[var(--accent)] text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--accent-text)] transition-colors cursor-pointer shadow-2xs"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Button — Stable Height & High Contrast */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onSelectPage('ai-assistant')}
            className="h-10 inline-flex items-center gap-2 px-5 rounded-xl bg-[var(--button-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--button-primary-text)] text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Bot className="w-4 h-4 shrink-0" />
            <span>{t('nav.aiAssistant', 'Open Full AI Assistant')}</span>
            <ArrowRight className={`w-4 h-4 shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </section>

      {/* 2. SUPPORTED PAKISTANI LANGUAGES SECTION */}
      <section className="relative z-10 w-full max-w-5xl min-w-0 mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="pak-glass-card w-full px-4 sm:px-6 lg:px-8 py-5 rounded-2xl border transition-colors">
          <div className="text-center max-w-2xl mx-auto mb-3.5 space-y-1">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[var(--accent-text)]">
              <Globe2 className="w-4 h-4 shrink-0" />
              <span>{t('languages.heading', 'Supported Pakistani Languages')}</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {t(
                'languages.subheading',
                'Built natively for Pakistan’s national and regional languages with full right-to-left (RTL) support.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageClick(lang.code)}
                  className={`h-9 px-3.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] border-transparent shadow-xs'
                      : 'bg-[var(--surface-secondary)] hover:bg-[var(--accent-subtle)] text-[var(--text-primary)] hover:text-[var(--accent-text)] border-[var(--border-strong)]'
                  }`}
                  title={`Switch interface language to ${lang.name}`}
                >
                  <span>{lang.flag}</span>
                  <span className="font-bold">{lang.nativeName}</span>
                  <span className="text-[11px] opacity-85">({lang.name})</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. COMPACT FOOTER WITH USEFUL LINKS */}
      <footer className="pak-glass-panel relative z-10 w-full border-t py-4 mt-auto">
        <div className="max-w-7xl w-full min-w-0 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo and brief intro */}
            <div className="flex items-center gap-3">
              <PakLingoLogo
                size="sm"
                showTagline={true}
                taglineText={t('brand.tagline', "AI for Pakistan's Languages")}
              />
            </div>

            {/* Useful Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[var(--text-secondary)]">
              <button
                type="button"
                onClick={() => onSelectPage('ai-assistant')}
                className="hover:text-[var(--accent-text)] cursor-pointer transition-colors"
              >
                {t('nav.aiAssistant', 'AI Assistant')}
              </button>
              <button
                type="button"
                onClick={() => onSelectPage('voice-assistant')}
                className="hover:text-[var(--accent-text)] cursor-pointer transition-colors"
              >
                {t('nav.voiceAssistant', 'Voice Assistant')}
              </button>
              <button
                type="button"
                onClick={() => onSelectPage('documents')}
                className="hover:text-[var(--accent-text)] cursor-pointer transition-colors"
              >
                {t('nav.documents', 'OCR Documents')}
              </button>
              <button
                type="button"
                onClick={() => onSelectPage('medical')}
                className="hover:text-[var(--accent-text)] cursor-pointer transition-colors"
              >
                {t('module.medical.title', 'Medical Tools')}
              </button>
              <button
                type="button"
                onClick={() => onSelectPage('legal')}
                className="hover:text-[var(--accent-text)] cursor-pointer transition-colors"
              >
                {t('module.legal.title', 'Legal Tools')}
              </button>
              <button
                type="button"
                onClick={() => onSelectPage('student')}
                className="hover:text-[var(--accent-text)] cursor-pointer transition-colors"
              >
                {t('nav.studentDashboard', 'Student Hub')}
              </button>
              <button
                type="button"
                onClick={() => onSelectPage('blog')}
                className="hover:text-[var(--accent-text)] cursor-pointer transition-colors"
              >
                {t('nav.blog', 'Blog')}
              </button>
              <button
                type="button"
                onClick={() => onSelectPage('settings')}
                className="hover:text-[var(--accent-text)] cursor-pointer transition-colors"
              >
                {t('nav.accessibility', 'Settings')}
              </button>
            </div>

            {/* Copyright */}
            <div className="text-[11px] text-[var(--text-secondary)]">
              <span>© 2026 PakLingo AI. {t('footer.rights', 'Engineered for Pakistan.')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
