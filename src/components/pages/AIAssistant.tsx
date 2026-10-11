import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send,
  Bot,
  User,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Square,
  Copy,
  Check,
  RefreshCw,
  RotateCcw,
  CornerUpRight,
  AlertCircle,
  Mic,
  MicOff,
  Radio,
  Image as ImageIcon,
  Paperclip,
  FileText,
  X,
  Sparkles,
  Globe2,
  Eye,
  Maximize2,
  Minimize2,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LanguageCode, ChatMessage, ChatAttachment, ChatConversation } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceSettings, detectSpeechLanguage } from '../../context/VoiceSettingsContext';
import { useAuth } from '../../context/AuthContext';
import {
  saveUserConversation,
  getUserConversations,
  deleteUserConversation,
  createUniqueConversationId,
  loadLocalChatConversations,
  saveLocalChatConversation,
  deleteLocalChatConversation,
  getLocalChatConversationById,
  buildConversationFromFirestoreDoc,
} from '../../lib/firestoreService';
import { getLanguageBCP47, isLanguageRTL } from '../../i18n';
import { PakLingoMark } from '../PakLingoLogo';

interface AIAssistantProps {
  selectedLanguage: LanguageCode;
  onSelectLanguage?: (lang: LanguageCode) => void;
  initialPrompt?: string;
  initialAttachments?: ChatAttachment[];
  initialConversationId?: string;
  onClearInitialConversation?: () => void;
  onClearInitialPrompt?: () => void;
}

interface SpeechLangOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  bcp47: string;
  browserNativeSupport: 'full' | 'partial' | 'cloud-fallback';
  supportNote: string;
}

const SPEECH_LANGUAGE_OPTIONS: SpeechLangOption[] = [
  {
    code: 'ur',
    label: 'Urdu',
    nativeLabel: 'اردو',
    bcp47: 'ur-PK',
    browserNativeSupport: 'full',
    supportNote: 'Supported natively in Chrome/Edge (ur-PK) with AI Cloud STT fallback.',
  },
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    bcp47: 'en-US',
    browserNativeSupport: 'full',
    supportNote: 'Supported natively by browser Speech Recognition & AI Cloud STT.',
  },
  {
    code: 'roman_ur',
    label: 'Roman Urdu',
    nativeLabel: 'Roman Urdu',
    bcp47: 'ur-PK',
    browserNativeSupport: 'partial',
    supportNote: 'Uses Urdu/English phonetic recognition with AI Cloud STT fallback.',
  },
  {
    code: 'pa',
    label: 'Punjabi',
    nativeLabel: 'پنجابی',
    bcp47: 'pa-PK',
    browserNativeSupport: 'partial',
    supportNote: 'Browser support varies by device; automatically uses AI Cloud Audio Transcription if unsupported.',
  },
  {
    code: 'sd',
    label: 'Sindhi',
    nativeLabel: 'سنڌي',
    bcp47: 'sd-PK',
    browserNativeSupport: 'cloud-fallback',
    supportNote: 'Most browsers lack native Sindhi STT; uses PakLingo AI Cloud Audio Transcription.',
  },
  {
    code: 'ps',
    label: 'Pashto',
    nativeLabel: 'پښتو',
    bcp47: 'ps-AF',
    browserNativeSupport: 'cloud-fallback',
    supportNote: 'Most browsers lack native Pashto STT; uses PakLingo AI Cloud Audio Transcription.',
  },
  {
    code: 'bal',
    label: 'Balochi',
    nativeLabel: 'بلوچی',
    bcp47: 'bal-PK',
    browserNativeSupport: 'cloud-fallback',
    supportNote: 'Standard browsers do not include native Balochi STT; uses PakLingo AI Cloud Audio Transcription.',
  },
];

const WELCOME_MESSAGES: Record<string, string> = {
  en: `## 📘 Welcome to PakLingo AI Assistant\nHello! I am **PakLingo AI**, your multilingual Pakistani assistant.\n\n* 💡 **Ask Anything:** Public services (NADRA, BISP 8171, Passports), education, healthcare, agriculture, or legal rights.\n* 🎤 **Voice & Audio:** Speak in Urdu, English, or regional languages and click **Listen** to hear natural responses.\n* 🖼️ **Image & Document Analysis:** Upload a CNIC, utility bill, crop photo, or PDF document for instant analysis.`,
  ur: `## 📘 پاک لنگو اے آئی معاون میں خوش آمدید\nالسلام علیکم! میں **پاک لنگو اے آئی** ہوں، آپ کا بااعتماد پاکستانی ذہین معاون۔\n\n* 💡 **مکمل رہنمائی:** نادرا، بے نظیر انکم سپورٹ (8171)، پاسپورٹ، تعلیم، صحت، زراعت یا قانونی حقوق کے بارے میں کوئی بھی سوال پوچھیں۔\n* 🎤 **آواز کے ذریعے گفتگو:** مائیکروفون دبا کر اردو یا اپنی علاقائی زبان میں سوال بولیں اور **سنیں (Listen)** بٹن سے قدرتی اردو آواز میں جواب سنیں۔\n* 🖼️ **تصویر اور دستاویزات کا تجزیہ:** بجلی کا بل، شناختی کارڈ، فصل کی تصویر یا کوئی بھی دستاویز اپ لوڈ کریں۔`,
  sd: `## 📘 پاڪ لنگو اي آءِ مددگار ۾ ڀليڪار\nاسلام عليڪم! مان **پاڪ لنگو اي آءِ** آهيان، توهان جو بااعتماد پاڪستاني مددگار.\n\n* 💡 **هر قسم جي رهنمائي:** سرڪاري دستاويز، نادرا، صحت، زراعت، تعليم يا قانوني معاملن بابت پڇو.\n* 🎤 **آواز ۽ تصوير:** مائيڪروفون سان ڳالهايو يا تصوير ۽ دستاويز اپلوڊ ڪريو.`,
  pa: `## 📘 پاک لنگو اے آئی وچ جی آیاں نوں\nسلام وعلیکم! میں **پاک لنگو اے آئی** ہاں، تہاڈا مخلص پاکستانی معاون۔\n\n* 💡 **مکمل رہنمائی:** سرکاری کاغذاں، نادرا، صحت، واہی بیجی، پڑھائی یا کسی وی معاملے بارے پچھو۔\n* 🎤 **بول کے یا تصویر نال پچھو:** مائیک نال بول کے یا تصویر اپ لوڈ کر کے فوری جواب حاصل کرو۔`,
  bal: `## 📘 پاک لنگو اے آئی کمکار ءَ وش آتک ئے\nسلام! من **پاک لنگو اے آئی** آں، شمارا وتی مخلصیں کمکار۔ شما نبشتہ کُت، گوں مائیکروفون ءَ گپ جت یا عکسی ءُ کاگدے اپ لوڈ کُت کن ات۔`,
  ps: `## 📘 پاک لنګو اي آی مرستیال ته ښه راغلاست\nسلام! زه **پاک لنګو اي آی** یم، ستاسو پښتون او باوري مرستیال. تاسو کولی شئ د لیکلو، مایکروفون له لارې غږیدو، یا د انځور او سند پورته کولو له لارې له ما څخه پوښتنې وکړئ.`,
  roman_ur: `## 📘 PakLingo AI Assistant Mein Khush Aamdeed\nAssalam-o-Alaikum! Main **PakLingo AI** hoon, aap ka ba-aitemad Pakistani multimodal assistant.\n\n* 💡 **Har Sawal Ka Jawab:** NADRA, BISP 8171, electricity bills, health, farming, ya education ke baray mein poochhein.\n* 🎤 **Voice & Image Support:** Microphone se bolein, jawab ko **Listen** button se sunein, ya image/document upload karein.`,
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Determine whether a specific message's text is predominantly RTL (Urdu, Sindhi, Pashto, Punjabi, Balochi)
 * so that Urdu responses render RTL and English responses render LTR regardless of current UI chrome direction.
 */
function isMessageContentRTL(text: string, fallbackLang: LanguageCode): boolean {
  const sample = text.replace(/```[\s\S]*?```/g, ' ').slice(0, 1000);
  const arabicCount = (sample.match(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  const latinCount = (sample.match(/[A-Za-z]/g) || []).length;
  if (arabicCount >= 4 && arabicCount >= latinCount * 0.2) {
    return true;
  }
  if (latinCount > arabicCount * 3 && latinCount > 6) {
    return false;
  }
  return isLanguageRTL(fallbackLang);
}

const LANGUAGE_BADGE_LABELS: Record<string, string> = {
  ur: 'اردو (Urdu)',
  en: 'English',
  roman_ur: 'Roman Urdu',
  pa: 'پنجابی (Punjabi)',
  sd: 'سنڌي (Sindhi)',
  ps: 'پښتو (Pashto)',
  bal: 'بلوچی (Balochi)',
};

export const AIAssistant: React.FC<AIAssistantProps> = ({
  selectedLanguage,
  onSelectLanguage,
  initialPrompt,
  initialAttachments,
  initialConversationId,
  onClearInitialConversation,
  onClearInitialPrompt,
}) => {
  const { isRTL, t, currentLanguage } = useLanguage();
  const {
    settings: voiceSettings,
    updateSettings: updateVoiceSettings,
    speak,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    isSpeaking,
    isPaused,
    isLoadingAudio,
    voiceNotice,
    clearVoiceNotice,
  } = useVoiceSettings();
  const { user } = useAuth();

  const getWelcomeText = useCallback(() => {
    return (
      WELCOME_MESSAGES[selectedLanguage] ||
      WELCOME_MESSAGES['ur'] ||
      WELCOME_MESSAGES['en']
    );
  }, [selectedLanguage]);

  // Unique Conversation ID & Saved Conversations State
  const [activeConversationId, setActiveConversationId] = useState<string>(() =>
    createUniqueConversationId()
  );
  const activeConversationIdRef = useRef<string>(activeConversationId);
  activeConversationIdRef.current = activeConversationId;

  // Nonce & AbortController to cancel in-flight requests and block delayed responses from old chats
  const chatSessionNonceRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [savedConversations, setSavedConversations] = useState<ChatConversation[]>(() =>
    loadLocalChatConversations(user?.id)
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  const createWelcomeMessage = useCallback(
    (convId: string): ChatMessage => ({
      id: `welcome_${convId}`,
      sender: 'assistant',
      text: getWelcomeText(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      conversationId: convId,
    }),
    [getWelcomeText]
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: `welcome_${activeConversationId}`,
      sender: 'assistant',
      text:
        WELCOME_MESSAGES[selectedLanguage] ||
        WELCOME_MESSAGES['ur'] ||
        WELCOME_MESSAGES['en'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      conversationId: activeConversationId,
    },
  ]);

  // Load local + Firestore saved conversations when user changes
  useEffect(() => {
    let cancelled = false;
    const localList = loadLocalChatConversations(user?.id);
    setSavedConversations(localList);

    if (user?.id) {
      getUserConversations(user.id)
        .then((remoteDocs) => {
          if (cancelled) return;
          const currentLocal = loadLocalChatConversations(user.id);
          const localMap = new Map<string, ChatConversation>();
          for (const c of currentLocal) {
            localMap.set(c.id, c);
          }
          let addedAny = false;
          for (const docItem of remoteDocs) {
            if (docItem.id && !localMap.has(docItem.id)) {
              const built = buildConversationFromFirestoreDoc(docItem);
              localMap.set(built.id, built);
              saveLocalChatConversation(built, user.id);
              addedAny = true;
            }
          }
          if (addedAny) {
            setSavedConversations(loadLocalChatConversations(user.id));
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Keep welcome message translated if user switches language before sending any message
  useEffect(() => {
    setMessages((prev) => {
      if (
        prev.length === 1 &&
        (prev[0].id === 'welcome' || prev[0].id.startsWith('welcome_'))
      ) {
        return [createWelcomeMessage(activeConversationIdRef.current)];
      }
      return prev;
    });
  }, [selectedLanguage, createWelcomeMessage]);

  // Helper to persist conversation messages under its unique ID without mixing chats
  const syncConversationToStorage = useCallback(
    (convId: string, convMessages: ChatMessage[], lang: LanguageCode) => {
      const realTurns = convMessages.filter(
        (m) => m.id !== 'welcome' && !m.id.startsWith('welcome_')
      );
      if (realTurns.length === 0) return;

      const firstUserTurn = realTurns.find((m) => m.sender === 'user');
      const lastAssistantTurn = [...realTurns].reverse().find((m) => m.sender === 'assistant');

      const title = (firstUserTurn?.text || realTurns[0].text || 'Conversation')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 68);
      const subtitle = (lastAssistantTurn?.text || '')
        .replace(/[#*>_`~-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 110);

      const nowIso = new Date().toISOString();
      const existing = getLocalChatConversationById(convId, user?.id);

      const convObj: ChatConversation = {
        id: convId,
        title,
        subtitle,
        language: existing?.language || lang,
        category: realTurns.some((m) => m.attachments && m.attachments.length > 0)
          ? 'Multimodal AI Assistant'
          : 'AI Assistant',
        createdAt: existing?.createdAt || nowIso,
        updatedAt: nowIso,
        messages: convMessages.map((m) => ({ ...m, conversationId: convId })),
      };

      const updatedList = saveLocalChatConversation(convObj, user?.id);
      setSavedConversations(updatedList);
    },
    [user?.id]
  );

  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [autoReadAloud, setAutoReadAloud] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Voice Recognition & Audio Recording State
  const [speechLang, setSpeechLang] = useState<LanguageCode>(selectedLanguage);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [listeningSeconds, setListeningSeconds] = useState(0);
  const [voiceStatusNote, setVoiceStatusNote] = useState<string | null>(null);
  const [voiceModeUsed, setVoiceModeUsed] = useState<'browser' | 'cloud-recorder' | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const listeningTimerRef = useRef<number | null>(null);
  const baseInputBeforeSpeechRef = useRef<string>('');
  const cancelRecordingRef = useRef<boolean>(false);
  const autoSendAfterVoiceRef = useRef<boolean>(false);
  const latestTranscriptRef = useRef<string>('');
  const handleSendMessageRef = useRef<(overrideText?: string) => void>(() => {});

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialHandledRef = useRef<string | null>(null);

  const isBusy = isLoading || Boolean(regeneratingId) || Boolean(resendingId);

  // Automatically sync speech recognition language when global language changes
  useEffect(() => {
    const match = SPEECH_LANGUAGE_OPTIONS.find((o) => o.code === selectedLanguage);
    if (match) {
      setSpeechLang(selectedLanguage);
    } else {
      setSpeechLang('ur');
    }
  }, [selectedLanguage]);

  // Clear speakingMessageId when global speech stops completely
  useEffect(() => {
    if (!isSpeaking && !isPaused && !isLoadingAudio) {
      setSpeakingMessageId(null);
    }
  }, [isSpeaking, isPaused, isLoadingAudio]);

  // Scroll to bottom when messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isListening]);

  // Stop or cancel any active microphone session cleanly
  const stopListeningSession = useCallback((cancel = false) => {
    cancelRecordingRef.current = cancel;

    if (listeningTimerRef.current) {
      window.clearInterval(listeningTimerRef.current);
      listeningTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        if (cancel && typeof recognitionRef.current.abort === 'function') {
          recognitionRef.current.abort();
        } else {
          recognitionRef.current.stop();
        }
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (cancel) {
      setInput(baseInputBeforeSpeechRef.current.trim());
    }

    setIsListening(false);
    setInterimTranscript('');
    setListeningSeconds(0);
    setVoiceModeUsed(null);
  }, []);

  useEffect(() => {
    return () => {
      stopListeningSession(true);
    };
  }, [stopListeningSession]);

  // Cloud AI Audio Recorder for dialects or browsers without native SpeechRecognition
  const startCloudAudioRecording = useCallback(
    async (langCode: LanguageCode, reasonNote?: string) => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setIsListening(false);
        setError(
          'Microphone access is not supported in this browser environment. Please use a modern browser over HTTPS or type your question.'
        );
        return;
      }

      try {
        cancelRecordingRef.current = false;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        audioChunksRef.current = [];

        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

        const recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);

        mediaRecorderRef.current = recorder;
        setVoiceModeUsed('cloud-recorder');
        setIsListening(true);
        setListeningSeconds(0);
        if (reasonNote) {
          setVoiceStatusNote(reasonNote);
        }

        listeningTimerRef.current = window.setInterval(() => {
          setListeningSeconds((prev) => prev + 1);
        }, 1000);

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          if (listeningTimerRef.current) {
            window.clearInterval(listeningTimerRef.current);
            listeningTimerRef.current = null;
          }
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
          }
          setIsListening(false);
          setVoiceModeUsed(null);

          if (cancelRecordingRef.current) {
            audioChunksRef.current = [];
            return;
          }

          const chunks = audioChunksRef.current;
          if (!chunks.length) return;

          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          if (blob.size < 400) return;

          setIsTranscribingAudio(true);
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
                language: langCode,
              }),
            });

            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.message || 'Could not transcribe audio.');
            }

            if (data.transcript && data.transcript.trim()) {
              const combinedText = `${baseInputBeforeSpeechRef.current}${data.transcript.trim()}`.trim();
              setInput(combinedText);
              setVoiceStatusNote(null);
              if (autoSendAfterVoiceRef.current) {
                autoSendAfterVoiceRef.current = false;
                setTimeout(() => {
                  handleSendMessageRef.current(combinedText);
                }, 30);
              } else {
                textareaRef.current?.focus();
              }
            } else {
              autoSendAfterVoiceRef.current = false;
              setVoiceStatusNote(
                'No clear speech was detected. Please speak closer to the microphone and try again.'
              );
            }
          } catch (err: any) {
            autoSendAfterVoiceRef.current = false;
            setError(err.message || 'Audio transcription failed. Please try again or type your message.');
          } finally {
            setIsTranscribingAudio(false);
          }
        };

        recorder.start(250);
      } catch (err: any) {
        setIsListening(false);
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setError(
            'Microphone permission was denied. Please allow microphone access in your browser address bar settings and try again.'
          );
        } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
          setError('No microphone device was detected on your system. Please connect a microphone.');
        } else {
          setError(err?.message || 'Unable to access microphone.');
        }
      }
    },
    []
  );

  // Start or Stop Voice Recognition
  const toggleListening = useCallback(async () => {
    setError(null);
    setVoiceStatusNote(null);

    if (isListening) {
      cancelRecordingRef.current = false;
      if (
        voiceModeUsed === 'cloud-recorder' &&
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop();
        return;
      }
      stopListeningSession(false);
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
    }

    const langOption =
      SPEECH_LANGUAGE_OPTIONS.find((o) => o.code === speechLang) || SPEECH_LANGUAGE_OPTIONS[0];

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    baseInputBeforeSpeechRef.current = input.trim() ? `${input.trim()} ` : '';

    if (!SpeechRecognition || langOption.browserNativeSupport === 'cloud-fallback') {
      const honestNote = !SpeechRecognition
        ? 'Your browser does not support native Web Speech API; recording audio for PakLingo AI Cloud Transcription. Press Stop when finished speaking.'
        : `${langOption.label} (${langOption.nativeLabel}) is not natively supported by browser speech engines; recording audio for PakLingo AI Cloud Transcription. Press Stop when finished speaking.`;
      await startCloudAudioRecording(speechLang, honestNote);
      return;
    }

    try {
      cancelRecordingRef.current = false;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = langOption.bcp47 || getLanguageBCP47(speechLang);
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceModeUsed('browser');
        setInterimTranscript('');
        setListeningSeconds(0);
        if (listeningTimerRef.current) window.clearInterval(listeningTimerRef.current);
        listeningTimerRef.current = window.setInterval(() => {
          setListeningSeconds((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        if (cancelRecordingRef.current) return;
        let finalText = '';
        let interimText = '';

        for (let i = 0; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcriptChunk + ' ';
          } else {
            interimText += transcriptChunk;
          }
        }

        const combinedFinal = `${baseInputBeforeSpeechRef.current}${finalText}`.trim();
        if (finalText) {
          latestTranscriptRef.current = combinedFinal;
          setInput(combinedFinal);
        } else if (interimText) {
          latestTranscriptRef.current = `${baseInputBeforeSpeechRef.current}${interimText}`.trim();
        }
        setInterimTranscript(interimText);
      };

      recognition.onerror = (event: any) => {
        const errCode = event?.error;
        if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
          stopListeningSession(false);
          setError(
            'Microphone permission was denied. Please grant microphone permission in your browser settings to use voice input.'
          );
        } else if (errCode === 'audio-capture') {
          stopListeningSession(false);
          setError('No working microphone was found. Please check that your microphone is connected and not muted.');
        } else if (errCode === 'language-not-supported') {
          stopListeningSession(false);
          startCloudAudioRecording(
            speechLang,
            `Browser speech engine does not support ${langOption.label} directly; switched to PakLingo AI Cloud Audio Recording. Press Stop when done.`
          );
        } else if (errCode === 'no-speech') {
          stopListeningSession(false);
          setVoiceStatusNote('No speech was detected. Click the microphone button when you are ready to speak.');
        } else if (errCode !== 'aborted') {
          stopListeningSession(false);
          setError(`Speech recognition error (${errCode || 'unknown'}). You can retry or type your message.`);
        }
      };

      recognition.onend = () => {
        if (listeningTimerRef.current) {
          window.clearInterval(listeningTimerRef.current);
          listeningTimerRef.current = null;
        }
        setIsListening(false);
        setInterimTranscript('');
        setVoiceModeUsed(null);
        const textToUse = latestTranscriptRef.current.trim();
        if (autoSendAfterVoiceRef.current && textToUse) {
          autoSendAfterVoiceRef.current = false;
          setInput(textToUse);
          setTimeout(() => {
            handleSendMessageRef.current(textToUse);
          }, 30);
        } else {
          autoSendAfterVoiceRef.current = false;
          textareaRef.current?.focus();
        }
      };

      recognition.start();
    } catch {
      stopListeningSession(false);
      await startCloudAudioRecording(
        speechLang,
        'Using PakLingo AI Cloud Audio Transcription. Speak your question and press Stop when finished.'
      );
    }
  }, [
    isListening,
    isSpeaking,
    stopSpeaking,
    speechLang,
    input,
    voiceModeUsed,
    stopListeningSession,
    startCloudAudioRecording,
  ]);

  // Image Attachment Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);

    const newItems: ChatAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        setError(`"${file.name}" is not a valid image file. Please select PNG, JPG, WEBP, or GIF.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 10 MB image size limit.`);
        continue;
      }

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newItems.push({
          id: `img_${Date.now()}_${i}`,
          type: 'image',
          name: file.name,
          mimeType: file.type || 'image/jpeg',
          size: file.size,
          dataBase64: dataUrl,
          previewUrl: dataUrl,
        });
      } catch {
        setError(`Could not read image "${file.name}".`);
      }
    }

    if (newItems.length > 0) {
      setAttachments((prev) => [...prev, ...newItems].slice(0, 5));
    }
    e.target.value = '';
  };

  // Document Attachment Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);

    const newItems: ChatAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 12 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 12 MB document size limit.`);
        continue;
      }

      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isTextLike =
        file.type.startsWith('text/') || /\.(txt|md|csv|json|xml|log)$/i.test(file.name);

      if (!isImage && !isPdf && !isTextLike) {
        setError(
          `Unsupported file format for "${file.name}". Please upload PDF, TXT, CSV, JSON, Markdown, or an image.`
        );
        continue;
      }

      try {
        if (isTextLike) {
          const textContent = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = reject;
            reader.readAsText(file);
          });

          newItems.push({
            id: `file_${Date.now()}_${i}`,
            type: 'file',
            name: file.name,
            mimeType: file.type || 'text/plain',
            size: file.size,
            textContent,
          });
        } else {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          newItems.push({
            id: `file_${Date.now()}_${i}`,
            type: isImage ? 'image' : 'file',
            name: file.name,
            mimeType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
            size: file.size,
            dataBase64: dataUrl,
            previewUrl: isImage ? dataUrl : undefined,
          });
        }
      } catch {
        setError(`Could not read file "${file.name}".`);
      }
    }

    if (newItems.length > 0) {
      setAttachments((prev) => [...prev, ...newItems].slice(0, 5));
    }
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Immediately abort any ongoing AI response stream, voice recording, or audio playback
  const abortOngoingOperations = useCallback(() => {
    chatSessionNonceRef.current += 1;
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {
        // ignore abort errors
      }
      abortControllerRef.current = null;
    }
    stopListeningSession(true);
    stopSpeaking();
    setSpeakingMessageId(null);
    setIsLoading(false);
    setRegeneratingId(null);
    setResendingId(null);
    setIsTranscribingAudio(false);
  }, [stopListeningSession, stopSpeaking]);

  // Cleanup any in-flight stream on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // + New Chat: Creates a completely fresh conversation with a new unique ID without deleting history
  const handleStartNewChat = useCallback(() => {
    abortOngoingOperations();

    const newConvId = createUniqueConversationId();
    activeConversationIdRef.current = newConvId;
    setActiveConversationId(newConvId);

    setMessages([
      {
        id: `welcome_${newConvId}`,
        sender: 'assistant',
        text: getWelcomeText(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        conversationId: newConvId,
      },
    ]);

    setInput('');
    setAttachments([]);
    setError(null);
    setVoiceStatusNote(null);
    setInterimTranscript('');
    setLightboxImage(null);

    if (imageInputRef.current) imageInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 40);
  }, [abortOngoingOperations, getWelcomeText]);

  // Switch to an existing saved conversation by ID without overwriting other conversations
  const handleSelectConversation = useCallback(
    (convId: string) => {
      if (!convId) return;
      const target =
        savedConversations.find((c) => c.id === convId) ||
        getLocalChatConversationById(convId, user?.id);
      if (!target) return;

      abortOngoingOperations();

      activeConversationIdRef.current = target.id;
      setActiveConversationId(target.id);

      const loadedMessages =
        Array.isArray(target.messages) && target.messages.length > 0
          ? target.messages.map((m) => ({ ...m, conversationId: target.id }))
          : [createWelcomeMessage(target.id)];

      setMessages(loadedMessages);
      setInput('');
      setAttachments([]);
      setError(null);
      setVoiceStatusNote(null);
      setInterimTranscript('');
      setLightboxImage(null);

      if (imageInputRef.current) imageInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';

      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    },
    [savedConversations, user?.id, abortOngoingOperations, createWelcomeMessage]
  );

  // Delete a specific conversation from history
  const handleDeleteConversation = useCallback(
    async (convId: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }
      const updated = deleteLocalChatConversation(convId, user?.id);
      setSavedConversations(updated);
      if (user?.id) {
        deleteUserConversation(convId).catch(() => {});
      }
      if (activeConversationIdRef.current === convId) {
        handleStartNewChat();
      }
    },
    [user?.id, handleStartNewChat]
  );

  // Open a specific conversation if passed from HistoryPage
  useEffect(() => {
    if (!initialConversationId) return;
    const target =
      getLocalChatConversationById(initialConversationId, user?.id) ||
      savedConversations.find((c) => c.id === initialConversationId);
    if (target) {
      handleSelectConversation(target.id);
    }
    onClearInitialConversation?.();
  }, [
    initialConversationId,
    user?.id,
    savedConversations,
    handleSelectConversation,
    onClearInitialConversation,
  ]);

  // Send New Message (with Real-Time SSE Streaming & Strict Per-Conversation Context Isolation)
  const handleSendMessage = useCallback(
    async (overrideText?: string, overrideAttachments?: ChatAttachment[]) => {
      if (isListening) {
        stopListeningSession(false);
      }

      const queryText = (overrideText !== undefined ? overrideText : input).trim();
      const activeAttachments =
        overrideAttachments !== undefined ? overrideAttachments : attachments;

      if ((!queryText && activeAttachments.length === 0) || isBusy) return;

      const convId = activeConversationIdRef.current;
      const requestNonce = ++chatSessionNonceRef.current;

      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch {
          // ignore
        }
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setError(null);
      setVoiceStatusNote(null);

      const displayQuery =
        queryText ||
        (activeAttachments.some((a) => a.type === 'image')
          ? t('assistant.analyzeImagePrompt', 'Please analyze this image and explain its details.')
          : t(
              'assistant.analyzeFilePrompt',
              'Please analyze this attached document and summarize key details.'
            ));

      const userMsgId = `usr_${convId}_${Date.now()}`;
      const botMsgId = `bot_${convId}_${Date.now() + 1}`;
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const userMsg: ChatMessage = {
        id: userMsgId,
        sender: 'user',
        text: displayQuery,
        timestamp: nowTime,
        attachments: activeAttachments.length > 0 ? [...activeAttachments] : undefined,
        conversationId: convId,
      };

      // Strictly filter history to ONLY messages belonging to the currently selected conversationId
      const currentConvMessages = messages.filter(
        (m) => !m.conversationId || m.conversationId === convId
      );
      const priorHistory = currentConvMessages
        .filter((m) => m.id !== 'welcome' && !m.id.startsWith('welcome_'))
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const nextMessagesWithUser = [...currentConvMessages, userMsg];
      setMessages(nextMessagesWithUser);
      syncConversationToStorage(convId, nextMessagesWithUser, selectedLanguage);

      if (overrideText === undefined) setInput('');
      if (overrideAttachments === undefined) setAttachments([]);
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            conversationId: convId,
            message: displayQuery,
            language: selectedLanguage,
            history: priorHistory,
            stream: true,
            attachments: activeAttachments.map((att) => ({
              id: att.id,
              type: att.type,
              name: att.name,
              mimeType: att.mimeType,
              dataBase64: att.dataBase64,
              textContent: att.textContent,
            })),
          }),
        });

        if (
          chatSessionNonceRef.current !== requestNonce ||
          activeConversationIdRef.current !== convId
        ) {
          return;
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.message || data.error || 'Failed to generate AI response. Please retry.'
          );
        }

        const contentType = response.headers.get('content-type') || '';
        let replyText = '';

        if (contentType.includes('text/event-stream') && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let botBubbleInserted = false;

          while (true) {
            const { value, done } = await reader.read();
            if (
              chatSessionNonceRef.current !== requestNonce ||
              activeConversationIdRef.current !== convId
            ) {
              try {
                await reader.cancel();
              } catch {
                // ignore
              }
              return;
            }
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
                  replyText += parsed.chunk;
                  if (!botBubbleInserted) {
                    botBubbleInserted = true;
                    const botMsg: ChatMessage = {
                      id: botMsgId,
                      sender: 'assistant',
                      text: replyText,
                      timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      isGrounded: true,
                      replyToUserMsgId: userMsgId,
                      conversationId: convId,
                    };
                    setMessages((prev) => {
                      if (activeConversationIdRef.current !== convId) return prev;
                      return [...prev, botMsg];
                    });
                  } else {
                    const currentText = replyText;
                    setMessages((prev) => {
                      if (activeConversationIdRef.current !== convId) return prev;
                      return prev.map((m) =>
                        m.id === botMsgId ? { ...m, text: currentText } : m
                      );
                    });
                  }
                }
                if (parsed.done && parsed.reply) {
                  replyText = parsed.reply;
                  const finalText = replyText;
                  if (!botBubbleInserted) {
                    botBubbleInserted = true;
                    setMessages((prev) => {
                      if (activeConversationIdRef.current !== convId) return prev;
                      return [
                        ...prev,
                        {
                          id: botMsgId,
                          sender: 'assistant',
                          text: finalText,
                          timestamp: new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          }),
                          isGrounded: true,
                          replyToUserMsgId: userMsgId,
                          conversationId: convId,
                        },
                      ];
                    });
                  } else {
                    setMessages((prev) => {
                      if (activeConversationIdRef.current !== convId) return prev;
                      return prev.map((m) =>
                        m.id === botMsgId ? { ...m, text: finalText } : m
                      );
                    });
                  }
                }
              } catch (parseErr: any) {
                if (parseErr?.message && !parseErr.message.includes('JSON')) {
                  throw parseErr;
                }
              }
            }
          }
        } else {
          const data = await response.json().catch(() => ({}));
          if (
            chatSessionNonceRef.current !== requestNonce ||
            activeConversationIdRef.current !== convId
          ) {
            return;
          }
          replyText = data.reply || 'No response generated.';
          const botMsg: ChatMessage = {
            id: botMsgId,
            sender: 'assistant',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isGrounded: true,
            replyToUserMsgId: userMsgId,
            conversationId: convId,
          };
          setMessages((prev) => [...prev, botMsg]);
        }

        if (
          chatSessionNonceRef.current !== requestNonce ||
          activeConversationIdRef.current !== convId
        ) {
          return;
        }

        if (replyText) {
          const finalBotMsg: ChatMessage = {
            id: botMsgId,
            sender: 'assistant',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isGrounded: true,
            replyToUserMsgId: userMsgId,
            conversationId: convId,
          };
          const completedConversationMessages = [...nextMessagesWithUser, finalBotMsg];
          syncConversationToStorage(convId, completedConversationMessages, selectedLanguage);
        }

        if (autoReadAloud && replyText) {
          setSpeakingMessageId(botMsgId);
          const replyLang = detectSpeechLanguage(replyText, selectedLanguage);
          speak(replyText, replyLang);
        }

        if (user?.id && replyText) {
          const firstUserTitle =
            nextMessagesWithUser.find((m) => m.sender === 'user')?.text || displayQuery;
          saveUserConversation(
            {
              userId: user.id,
              title: firstUserTitle.slice(0, 68),
              subtitle: replyText.slice(0, 110),
              category:
                activeAttachments.length > 0 ? 'Multimodal AI Assistant' : 'AI Assistant',
              language: selectedLanguage,
              module: 'assistant',
              targetPage: 'chat',
            },
            convId
          ).catch((e) => console.warn('Could not save conversation:', e));
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        if (
          chatSessionNonceRef.current !== requestNonce ||
          activeConversationIdRef.current !== convId
        ) {
          return;
        }
        setError(err.message || 'An error occurred while contacting PakLingo AI.');
      } finally {
        if (
          chatSessionNonceRef.current === requestNonce &&
          activeConversationIdRef.current === convId
        ) {
          setIsLoading(false);
        }
      }
    },
    [
      isListening,
      stopListeningSession,
      input,
      attachments,
      isBusy,
      t,
      messages,
      selectedLanguage,
      autoReadAloud,
      speak,
      user?.id,
      syncConversationToStorage,
    ]
  );

  handleSendMessageRef.current = (overrideText?: string) => {
    handleSendMessage(overrideText);
  };

  // Resend a Previous User Message (submits the selected user message again as a new turn)
  const handleResendUserMessage = async (userMsg: ChatMessage) => {
    if (isBusy) return;
    setError(null);
    setResendingId(userMsg.id);
    try {
      await handleSendMessage(userMsg.text, userMsg.attachments || []);
    } finally {
      setResendingId(null);
    }
  };

  // Regenerate an Assistant Response (streams a fresh answer in-place without duplicating the user message)
  const handleRegenerateResponse = async (assistantMsgId: string) => {
    if (isBusy) return;

    const convId = activeConversationIdRef.current;
    const msgIndex = messages.findIndex((m) => m.id === assistantMsgId);
    if (msgIndex <= 0) return;

    let userMsgIndex = msgIndex - 1;
    while (userMsgIndex >= 0 && messages[userMsgIndex].sender !== 'user') {
      userMsgIndex--;
    }
    if (userMsgIndex < 0) return;

    const targetUserMsg = messages[userMsgIndex];
    const historyBeforeTurn = messages
      .slice(0, userMsgIndex)
      .filter(
        (m) =>
          m.id !== 'welcome' &&
          !m.id.startsWith('welcome_') &&
          (!m.conversationId || m.conversationId === convId)
      )
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

    const requestNonce = ++chatSessionNonceRef.current;
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {
        // ignore
      }
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setError(null);
    setRegeneratingId(assistantMsgId);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          conversationId: convId,
          message: targetUserMsg.text,
          language: selectedLanguage,
          history: historyBeforeTurn,
          isRegenerate: true,
          stream: true,
          attachments: (targetUserMsg.attachments || []).map((att) => ({
            id: att.id,
            type: att.type,
            name: att.name,
            mimeType: att.mimeType,
            dataBase64: att.dataBase64,
            textContent: att.textContent,
          })),
        }),
      });

      if (
        chatSessionNonceRef.current !== requestNonce ||
        activeConversationIdRef.current !== convId
      ) {
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || data.error || 'Failed to regenerate response.');
      }

      const contentType = response.headers.get('content-type') || '';
      let updatedText = '';

      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (
            chatSessionNonceRef.current !== requestNonce ||
            activeConversationIdRef.current !== convId
          ) {
            try {
              await reader.cancel();
            } catch {
              // ignore
            }
            return;
          }
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
                updatedText += parsed.chunk;
                const currentText = updatedText;
                setMessages((prev) => {
                  if (activeConversationIdRef.current !== convId) return prev;
                  return prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          text: currentText,
                          timestamp: new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          }),
                        }
                      : m
                  );
                });
              }
              if (parsed.done && parsed.reply) {
                updatedText = parsed.reply;
                const finalText = updatedText;
                setMessages((prev) => {
                  if (activeConversationIdRef.current !== convId) return prev;
                  return prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, text: finalText } : m
                  );
                });
              }
            } catch {
              // ignore partial json
            }
          }
        }
      } else {
        const data = await response.json().catch(() => ({}));
        if (
          chatSessionNonceRef.current !== requestNonce ||
          activeConversationIdRef.current !== convId
        ) {
          return;
        }
        updatedText = data.reply || 'No response generated.';
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: updatedText,
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                }
              : m
          )
        );
      }

      if (
        chatSessionNonceRef.current !== requestNonce ||
        activeConversationIdRef.current !== convId
      ) {
        return;
      }

      if (updatedText) {
        const updatedMessagesList = messages.map((m) =>
          m.id === assistantMsgId ? { ...m, text: updatedText } : m
        );
        syncConversationToStorage(convId, updatedMessagesList, selectedLanguage);
      }

      if (autoReadAloud && updatedText) {
        setSpeakingMessageId(assistantMsgId);
        const regeneratedLang = detectSpeechLanguage(updatedText, selectedLanguage);
        speak(updatedText, regeneratedLang);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      if (
        chatSessionNonceRef.current !== requestNonce ||
        activeConversationIdRef.current !== convId
      ) {
        return;
      }
      setError(err.message || 'Could not regenerate response. Please try again.');
    } finally {
      if (
        chatSessionNonceRef.current === requestNonce &&
        activeConversationIdRef.current === convId
      ) {
        setRegeneratingId(null);
        setIsLoading(false);
      }
    }
  };

  // Trigger initialPrompt / initialAttachments from Homepage search bar in a fresh conversation
  useEffect(() => {
    const hasPrompt = Boolean(initialPrompt && initialPrompt.trim());
    const hasInitAtt = Boolean(initialAttachments && initialAttachments.length > 0);
    if (!hasPrompt && !hasInitAtt) return;

    const signature = `${initialPrompt || ''}__${(initialAttachments || [])
      .map((a) => a.id)
      .join(',')}`;
    if (initialHandledRef.current === signature) return;
    initialHandledRef.current = signature;

    handleSendMessage(initialPrompt?.trim() || '', initialAttachments || []);
    onClearInitialPrompt?.();
  }, [initialPrompt, initialAttachments, handleSendMessage, onClearInitialPrompt]);

  // Audio Playback Handlers per Assistant Message
  const handleListenMessage = async (msg: ChatMessage) => {
    setSpeakingMessageId(msg.id);
    const detectedLang = detectSpeechLanguage(msg.text, selectedLanguage);
    const started = await speak(msg.text, detectedLang);
    if (!started) {
      setSpeakingMessageId(null);
    }
  };

  const handleReplayMessage = async (msg: ChatMessage) => {
    stopSpeaking();
    setSpeakingMessageId(msg.id);
    const detectedLang = detectSpeechLanguage(msg.text, selectedLanguage);
    const started = await speak(msg.text, detectedLang);
    if (!started) {
      setSpeakingMessageId(null);
    }
  };

  const handleStopMessageAudio = () => {
    stopSpeaking();
    setSpeakingMessageId(null);
  };

  const ASSISTANT_SPEED_STEPS = [0.9, 0.95, 1.0, 1.05, 1.1, 1.25];
  const handleCycleSpeechSpeed = () => {
    const currentIdx = ASSISTANT_SPEED_STEPS.findIndex(
      (s) => Math.abs(s - (voiceSettings.rate || 1.0)) < 0.03
    );
    const nextRate =
      ASSISTANT_SPEED_STEPS[(currentIdx + 1) % ASSISTANT_SPEED_STEPS.length];
    updateVoiceSettings({ rate: nextRate });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeSpeechOption =
    SPEECH_LANGUAGE_OPTIONS.find((o) => o.code === speechLang) || SPEECH_LANGUAGE_OPTIONS[0];

  const hasUserMessages = messages.some(
    (m) => m.id !== 'welcome' && !m.id.startsWith('welcome_')
  );
  const activeConversationMeta = savedConversations.find(
    (c) => c.id === activeConversationId
  );

  const samplePrompts = [
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
      className={`relative flex w-full max-w-full min-w-0 bg-[var(--surface)] border border-[var(--border)] shadow-sm overflow-hidden transition-colors ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-dvh rounded-none'
          : 'h-[calc(100dvh-7.75rem)] min-h-[540px] max-h-[calc(100dvh-7.75rem)] rounded-2xl'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Hidden File Inputs for Image & Document Uploads */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        onChange={handleImageUpload}
        className="hidden"
        aria-label="Upload image attachment"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.md,.csv,.json,application/pdf,text/plain,text/csv,image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        aria-label="Upload document attachment"
      />

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-2xs lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* CONVERSATIONS / CHAT HISTORY SIDEBAR (ChatGPT-Style) */}
      <aside
        aria-label="Chat Conversations Sidebar"
        className={`${
          isSidebarOpen
            ? 'translate-x-0 w-64 sm:w-68 max-w-[82vw] border-e border-[var(--border)]'
            : isRTL
            ? 'translate-x-full lg:w-0 border-e-0'
            : '-translate-x-full lg:w-0 border-e-0'
        } fixed lg:static inset-y-0 ${
          isRTL ? 'right-0' : 'left-0'
        } z-40 lg:z-10 bg-[var(--surface-secondary)] flex flex-col shrink-0 transition-all duration-200 overflow-hidden`}
      >
        {/* Sidebar Top: Prominent + New Chat Button */}
        <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between gap-2">
          <button
            id="new-chat-sidebar-btn"
            type="button"
            onClick={handleStartNewChat}
            title={t(
              'assistant.newChatTooltip',
              'Start a completely fresh conversation (resets context & attachments)'
            )}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--button-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--button-primary-text)] text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('assistant.newChat', '+ New Chat')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            title={t('assistant.closeSidebar', 'Hide chat history sidebar')}
            aria-label="Hide chat history sidebar"
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Conversation List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {/* Active Fresh Chat Indicator when not yet saved */}
          {!hasUserMessages && (
            <div className="px-3 py-2.5 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent-text)] flex items-center justify-between gap-2 text-xs font-semibold">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t('assistant.freshChatActive', 'New Chat (Fresh Context)')}</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface)] font-bold">
                Active
              </span>
            </div>
          )}

          <div className="px-2 pt-2 pb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{t('assistant.recentChats', 'Previous Conversations')}</span>
            </span>
            <span>{savedConversations.length}</span>
          </div>

          {savedConversations.length === 0 ? (
            <div className="px-3 py-8 text-center space-y-1.5">
              <MessageSquare className="w-6 h-6 text-[var(--text-muted)] mx-auto opacity-45" />
              <p className="text-xs font-semibold text-[var(--text-secondary)]">
                {t('assistant.noSavedChats', 'No previous chats yet')}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                {t(
                  'assistant.noSavedChatsDesc',
                  'Each conversation is saved separately with its own unique ID so you can reopen it anytime.'
                )}
              </p>
            </div>
          ) : (
            savedConversations.map((conv) => {
              const isSelected = conv.id === activeConversationId;
              const turnCount = Array.isArray(conv.messages)
                ? conv.messages.filter(
                    (m) => m.id !== 'welcome' && !m.id.startsWith('welcome_')
                  ).length
                : 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectConversation(conv.id);
                    }
                  }}
                  className={`group px-3 py-2.5 rounded-xl border transition-all flex items-start justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--surface)] border-[var(--accent)] shadow-2xs'
                      : 'bg-transparent border-transparent hover:bg-[var(--surface)] hover:border-[var(--border)]'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <MessageSquare
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        isSelected ? 'text-[var(--accent-text)]' : 'text-[var(--text-muted)]'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs truncate ${
                          isSelected
                            ? 'font-bold text-[var(--text-primary)]'
                            : 'font-medium text-[var(--text-primary)]'
                        }`}
                      >
                        {conv.title}
                      </p>
                      {conv.subtitle && (
                        <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                          {conv.subtitle}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--text-muted)]">
                        <span className="uppercase font-semibold">{conv.language}</span>
                        {turnCount > 0 && <span>• {turnCount} msgs</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    title={t('history.delete', 'Delete conversation')}
                    aria-label={`Delete conversation ${conv.title}`}
                    className="p-1.5 rounded-lg opacity-70 sm:opacity-0 group-hover:opacity-100 hover:bg-rose-500/15 text-[var(--text-muted)] hover:text-rose-600 transition-all cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* MAIN CHAT COLUMN */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* 1. TOP ASSISTANT HEADER */}
        <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-secondary)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Toggle Sidebar Button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              title={
                isSidebarOpen
                  ? t('assistant.hideHistory', 'Hide chat history sidebar')
                  : t('assistant.showHistory', 'Open chat history & previous conversations')
              }
              aria-label="Toggle chat history sidebar"
              className="px-2.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <PanelLeftOpen className="w-4 h-4 text-[var(--accent-text)]" />
              <span className="hidden sm:inline">{t('assistant.chats', 'Chats')}</span>
              {savedConversations.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)] text-[10px] font-bold">
                  {savedConversations.length}
                </span>
              )}
            </button>

            {/* Primary + New Chat Button in Header */}
            <button
              id="new-chat-header-btn"
              type="button"
              onClick={handleStartNewChat}
              title={t(
                'assistant.newChatTooltip',
                'Start a completely fresh conversation (resets context & attachments)'
              )}
              aria-label="Start a New Chat"
              className="h-9 px-3.5 rounded-xl bg-[var(--button-primary-bg)] hover:bg-[var(--accent-hover)] text-[var(--button-primary-text)] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t('assistant.newChat', 'New Chat')}</span>
            </button>

            <div className="hidden md:flex items-center gap-2.5 min-w-0 pl-1">
              <PakLingoMark size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate max-w-[240px]">
                    {activeConversationMeta?.title ||
                      t('module.chat.title', 'PakLingo AI Multimodal Assistant')}
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-bold shrink-0">
                    {currentLanguage.flag} {currentLanguage.nativeName}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 keep-emerald shrink-0" />
                  <span>
                    {hasUserMessages
                      ? `Active Session • ${
                          messages.filter(
                            (m) => m.id !== 'welcome' && !m.id.startsWith('welcome_')
                          ).length
                        } messages`
                      : t('assistant.freshSessionReady', 'Fresh Conversation • Isolated Context')}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Header Right Controls: Response Language, Auto-Read, Global Stop Speaking, Full-Screen */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0 max-w-full">
            {onSelectLanguage && (
              <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-2.5 py-1.5 min-w-0 max-w-full">
                <Globe2 className="w-3.5 h-3.5 text-[var(--accent-text)] shrink-0" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => onSelectLanguage(e.target.value as LanguageCode)}
                  aria-label="Select AI Assistant Response Language"
                  className="bg-transparent text-xs font-semibold text-[var(--text-primary)] focus:outline-none cursor-pointer max-w-[160px] sm:max-w-none truncate"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option
                      key={lang.code}
                      value={lang.code}
                      className="bg-[var(--surface)] text-[var(--text-primary)]"
                    >
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(isSpeaking || isPaused) && (
              <button
                type="button"
                onClick={handleStopMessageAudio}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Stop Speaking Immediately"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t('voice.stopSpeaking', 'Stop Speaking')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setAutoReadAloud((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                autoReadAloud
                  ? 'bg-[var(--accent-subtle)] border-[var(--accent-border)] text-[var(--accent-text)]'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Automatically read new AI responses aloud"
            >
              {autoReadAloud ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden xl:inline">
                {autoReadAloud ? 'Auto-Read: ON' : 'Auto-Read: OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Full-Screen' : 'Full-Screen Chat'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden xl:inline">
                {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              </span>
            </button>
          </div>
        </div>

        {/* 2. VOICE ENGINE NOTICE BANNER (IF ANY) */}
        {(voiceNotice || voiceStatusNote) && (
          <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/25 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{voiceStatusNote || voiceNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setVoiceStatusNote(null);
                clearVoiceNotice();
              }}
              className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-700 dark:text-amber-200 cursor-pointer"
              aria-label="Dismiss voice notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3. CONVERSATION MESSAGE STREAM */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((m, idx) => {
          const isUser = m.sender === 'user';
          const isThisMessageActive = speakingMessageId === m.id && (isSpeaking || isPaused || isLoadingAudio);
          const isThisMessageRegenerating = regeneratingId === m.id;
          const isThisMessageResending = resendingId === m.id;
          const canRegenerate =
            !isUser && m.id !== 'welcome' && !m.id.startsWith('welcome_') && idx > 0;
          const msgIsRTL = isMessageContentRTL(m.text, selectedLanguage);
          const detectedMsgLang = detectSpeechLanguage(m.text, selectedLanguage);
          const detectedLangLabel =
            LANGUAGE_BADGE_LABELS[detectedMsgLang] || detectedMsgLang.toUpperCase();

          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[95%] sm:max-w-[88%] ${
                isUser
                  ? isRTL
                    ? 'mr-auto flex-row-reverse'
                    : 'ml-auto flex-row-reverse'
                  : isRTL
                  ? 'ml-auto'
                  : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              {isUser ? (
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs mt-0.5 bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]">
                  <User className="w-4 h-4" />
                </div>
              ) : (
                <PakLingoMark size="sm" className="mt-0.5" />
              )}

              {/* Message Card */}
              <div
                className={`flex-1 min-w-0 rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 text-xs sm:text-sm shadow-2xs transition-colors ${
                  isUser
                    ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] rounded-tr-xs'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-tl-xs'
                }`}
              >
                {/* Assistant Message Header Strip (Language & Active Audio Indicator) */}
                {!isUser && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2.5 border-b border-[var(--border)] text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--accent-text)]">PakLingo AI</span>
                      <span className="px-2 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[10px] font-semibold text-[var(--text-secondary)]">
                        🌍 {detectedLangLabel}
                      </span>
                    </div>

                    {isThisMessageActive && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold keep-emerald">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping keep-emerald" />
                        <span>
                          {isLoadingAudio
                            ? `Preparing ${detectedLangLabel} voice...`
                            : isPaused
                            ? `Paused (${detectedLangLabel})`
                            : `Speaking in ${detectedLangLabel}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Render any Attached Images or Documents inside the Message Bubble */}
                {m.attachments && m.attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {m.attachments.map((att) =>
                      att.type === 'image' && (att.previewUrl || att.dataBase64) ? (
                        <div
                          key={att.id}
                          className="relative group rounded-xl overflow-hidden border border-white/20 bg-black/10 max-w-[220px]"
                        >
                          <img
                            src={att.previewUrl || att.dataBase64}
                            alt={att.name}
                            className="max-h-44 w-auto object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() =>
                              setLightboxImage({
                                url: (att.previewUrl || att.dataBase64) as string,
                                name: att.name,
                              })
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxImage({
                                url: (att.previewUrl || att.dataBase64) as string,
                                name: att.name,
                              })
                            }
                            className="absolute bottom-1.5 right-1.5 px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </div>
                      ) : (
                        <div
                          key={att.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${
                            isUser
                              ? 'bg-black/15 border-current/20 text-[var(--button-primary-text)]'
                              : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)]'
                          }`}
                        >
                          <FileText className="w-4 h-4 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold truncate max-w-[180px]">{att.name}</p>
                            <p className="text-[10px] opacity-75">{formatFileSize(att.size)}</p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Message Text Content with Per-Message RTL/LTR Direction & Rich Formatting */}
                <div
                  dir={msgIsRTL ? 'rtl' : 'ltr'}
                  className={`${msgIsRTL ? 'text-right leading-[1.95]' : 'text-left leading-relaxed'} break-words overflow-hidden`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap break-words font-medium">{m.text}</p>
                  ) : (
                    <div className="space-y-2.5">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] mt-3 mb-1.5 pb-1 border-b border-[var(--border)]">
                              {children}
                            </h3>
                          ),
                          h2: ({ children }) => (
                            <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-3 mb-1.5 pb-1 border-b border-[var(--border)]">
                              {children}
                            </h4>
                          ),
                          h3: ({ children }) => (
                            <h5 className="text-xs sm:text-sm font-bold text-[var(--accent-text)] mt-2.5 mb-1">
                              {children}
                            </h5>
                          ),
                          p: ({ children }) => (
                            <p className="my-1.5 text-[var(--text-primary)]">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul
                              className={`my-2 space-y-1.5 list-disc ${
                                msgIsRTL ? 'pr-5' : 'pl-5'
                              } text-[var(--text-primary)]`}
                            >
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol
                              className={`my-2 space-y-1.5 list-decimal ${
                                msgIsRTL ? 'pr-5' : 'pl-5'
                              } text-[var(--text-primary)] font-medium`}
                            >
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="leading-relaxed text-[var(--text-primary)]">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-[var(--text-primary)]">{children}</strong>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote
                              className={`my-2.5 p-3 rounded-xl bg-[var(--surface)] border-[var(--accent)] ${
                                msgIsRTL ? 'border-r-4' : 'border-l-4'
                              } text-xs text-[var(--text-secondary)]`}
                            >
                              {children}
                            </blockquote>
                          ),
                          table: ({ children }) => (
                            <div className="my-3 w-full overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                              <table className="w-full text-xs border-collapse">{children}</table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-[var(--accent-subtle)] text-[var(--text-primary)] border-b border-[var(--border)]">
                              {children}
                            </thead>
                          ),
                          th: ({ children }) => (
                            <th className="px-3 py-2 font-bold text-start border-r last:border-r-0 border-[var(--border)]">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="px-3 py-2 border-t border-r last:border-r-0 border-[var(--border)] text-[var(--text-primary)]">
                              {children}
                            </td>
                          ),
                          code: ({ className, children }) => {
                            const isBlock = Boolean(className);
                            if (isBlock) {
                              return (
                                <pre
                                  dir="ltr"
                                  className="my-2.5 p-3 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto text-left"
                                >
                                  <code>{children}</code>
                                </pre>
                              );
                            }
                            return (
                              <code className="px-1.5 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--border)] font-mono text-[11px] text-[var(--accent-text)]">
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {m.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Message Action Footer */}
                <div
                  className={`mt-3 pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] ${
                    isUser
                      ? 'border-current/20 text-[var(--button-primary-text)] opacity-90'
                      : 'border-[var(--border)] text-[var(--text-muted)]'
                  }`}
                >
                  <span>{m.timestamp}</span>

                  {/* USER MESSAGE CONTROLS: Resend & Copy */}
                  {isUser ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleResendUserMessage(m)}
                        disabled={isBusy}
                        className="px-2.5 py-1 rounded-lg bg-black/15 hover:bg-black/25 text-[var(--button-primary-text)] font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title={t('assistant.resend', 'Resend this message')}
                      >
                        <CornerUpRight
                          className={`w-3.5 h-3.5 ${isThisMessageResending ? 'animate-bounce' : ''}`}
                        />
                        <span>
                          {isThisMessageResending
                            ? t('assistant.resending', 'Resending...')
                            : t('assistant.resend', 'Resend')}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(m.text, m.id)}
                        className="px-2 py-1 rounded-lg bg-black/15 hover:bg-black/25 text-[var(--button-primary-text)] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        title={t('translator.copy', 'Copy message')}
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>{t('common.copied', 'Copied')}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{t('common.copy', 'Copy')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* ASSISTANT MESSAGE CONTROLS: Listen, Pause/Resume, Stop, Replay, Regenerate, Copy */
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* 🔊 Listen / Read Aloud Button */}
                      {!isThisMessageActive && (
                        <button
                          type="button"
                          onClick={() => handleListenMessage(m)}
                          className="px-2.5 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--accent-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-text)] border border-[var(--border)] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                          title={`Listen in ${detectedLangLabel}`}
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                          <span>{t('translator.listen', 'Listen')}</span>
                        </button>
                      )}

                      {/* ⏸️ Pause / ▶️ Resume Button (Visible when this message is active) */}
                      {isThisMessageActive && (
                        <button
                          type="button"
                          onClick={() => (isPaused ? resumeSpeaking() : pauseSpeaking())}
                          disabled={isLoadingAudio}
                          className="px-2.5 py-1 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                          title={isPaused ? 'Resume Audio' : 'Pause Audio'}
                        >
                          {isPaused ? (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Resume</span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              <span>Pause</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* ⏹️ Stop Speaking Button (Visible when this message is active) */}
                      {isThisMessageActive && (
                        <button
                          type="button"
                          onClick={handleStopMessageAudio}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          title="Stop Speaking"
                        >
                          <Square className="w-3 h-3 fill-current" />
                          <span>{t('voice.stopSpeaking', 'Stop')}</span>
                        </button>
                      )}

                      {/* 🔁 Replay Answer Button */}
                      <button
                        type="button"
                        onClick={() => handleReplayMessage(m)}
                        className="px-2.5 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--accent-text)] border border-[var(--border)] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Replay Answer from Beginning"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t('voice.replay', 'Replay')}</span>
                      </button>

                      {/* ⚡ Playback Speed Selector Button */}
                      <button
                        type="button"
                        onClick={handleCycleSpeechSpeed}
                        className="px-2 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--accent-text)] border border-[var(--border)] font-bold text-[11px] transition-all cursor-pointer tabular-nums"
                        title="Click to adjust speaking speed (0.9x – 1.25x)"
                      >
                        {(voiceSettings.rate || 1.0).toFixed(
                          (voiceSettings.rate || 1.0) % 1 === 0
                            ? 1
                            : (voiceSettings.rate || 1.0) * 100 % 10 === 0
                            ? 1
                            : 2
                        )}x
                      </button>

                      {/* 🔁 Regenerate Response Button */}
                      {canRegenerate && (
                        <button
                          type="button"
                          onClick={() => handleRegenerateResponse(m.id)}
                          disabled={isBusy}
                          className="px-2.5 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--accent-text)] border border-[var(--border)] font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          title={t('assistant.regenerate', 'Regenerate Response')}
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${isThisMessageRegenerating ? 'animate-spin' : ''}`}
                          />
                          <span>
                            {isThisMessageRegenerating
                              ? t('assistant.regenerating', 'Regenerating...')
                              : t('assistant.regenerate', 'Regenerate')}
                          </span>
                        </button>
                      )}

                      {/* 📋 Copy Button */}
                      <button
                        type="button"
                        onClick={() => handleCopy(m.text, m.id)}
                        className="px-2.5 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--accent-text)] border border-[var(--border)] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        title={t('translator.copy', 'Copy text')}
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500 keep-emerald" />
                            <span className="text-emerald-600 dark:text-emerald-400 keep-emerald">
                              {t('common.copied', 'Copied')}
                            </span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t('common.copy', 'Copy')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Interactive Starter Cards Grid on Fresh Chat so there is never an empty blank space */}
        {!hasUserMessages && !isLoading && (
          <div className="pt-1">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                <span>{t('hero.tryPrompt', 'Popular Instant Starters')}</span>
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                Click any topic to start chatting in {currentLanguage.nativeName}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(p.prompt)}
                  disabled={isBusy}
                  className="p-3 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--accent-subtle)] border border-[var(--border)] hover:border-[var(--accent-border)] text-start transition-all cursor-pointer group flex items-start justify-between gap-2.5 shadow-2xs disabled:opacity-40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-text)] transition-colors">
                      {p.label}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-0.5 leading-snug">
                      {p.prompt}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--accent-text)] group-hover:bg-[var(--button-primary-bg)] group-hover:text-[var(--button-primary-text)] transition-colors">
                    <Send className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ⏳ Loading Indicator */}
        {isLoading && !regeneratingId && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] flex items-center gap-2.5 shadow-2xs">
              <RefreshCw className="w-4 h-4 animate-spin text-[var(--accent-text)]" />
              <span className="font-medium">
                {t('common.loading', 'Generating response in {lang}...', {
                  lang: currentLanguage.name,
                })}
              </span>
            </div>
          </div>
        )}

        {/* Audio Transcription Loading Indicator */}
        {isTranscribingAudio && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-rose-500/15 text-rose-600 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4 animate-pulse" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
              <span className="font-medium">
                Transcribing your spoken {activeSpeechOption.label} audio into editable text...
              </span>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="p-1 rounded-lg hover:bg-rose-500/20 cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. QUICK SUGGESTION CHIPS */}
      {messages.length <= 2 && !isListening && (
        <div className="px-4 py-2.5 bg-[var(--surface-secondary)] border-t border-[var(--border)] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-[var(--text-muted)] shrink-0 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[var(--accent-text)]" />
            {t('hero.tryPrompt', 'Try asking:')}
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p.prompt)}
              disabled={isBusy}
              className="px-3 py-1 rounded-full bg-[var(--surface)] hover:bg-[var(--accent-subtle)] hover:border-[var(--accent-border)] hover:text-[var(--accent-text)] border border-[var(--border)] text-[11px] font-medium text-[var(--text-secondary)] shrink-0 transition-all cursor-pointer disabled:opacity-40"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* 5. ACTIVE LISTENING INDICATOR BANNER (WHEN MICROPHONE IS ON) */}
      {isListening && (
        <div className="px-4 py-3 bg-rose-500/10 border-t border-rose-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-rose-600 text-white shrink-0 shadow-sm">
              <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-40" />
              <Mic className="w-4 h-4 relative z-10" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Listening ({activeSpeechOption.nativeLabel} / {activeSpeechOption.label})
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold">
                  {Math.floor(listeningSeconds / 60)}:
                  {String(listeningSeconds % 60).padStart(2, '0')}
                </span>
                <div className="flex items-end gap-0.5 h-3.5" aria-hidden="true">
                  <span className="w-1 h-2 bg-rose-500 rounded-full animate-bounce" />
                  <span className="w-1 h-3.5 bg-rose-500 rounded-full animate-pulse" />
                  <span className="w-1 h-2.5 bg-rose-500 rounded-full animate-bounce" />
                  <span className="w-1 h-3 bg-rose-500 rounded-full animate-pulse" />
                </div>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                {interimTranscript
                  ? `"${interimTranscript}"`
                  : voiceModeUsed === 'cloud-recorder'
                  ? 'Speak clearly into your microphone, then click Finish & Transcribe...'
                  : 'Speak now — your words appear directly in the editable box below...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                autoSendAfterVoiceRef.current = true;
                toggleListening();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer keep-emerald"
              title="Finish speaking, transcribe, and send immediately"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Stop &amp; Send</span>
            </button>

            <button
              type="button"
              onClick={() => {
                autoSendAfterVoiceRef.current = false;
                toggleListening();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Stop speaking and keep text in input box to edit"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop &amp; Edit</span>
            </button>

            <button
              type="button"
              onClick={() => {
                autoSendAfterVoiceRef.current = false;
                stopListeningSession(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              title="Cancel voice input"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. ATTACHMENT PREVIEW TRAY (IMAGES & FILES) */}
      {attachments.length > 0 && (
        <div className="px-4 py-2.5 bg-[var(--surface-secondary)] border-t border-[var(--border)] flex items-center gap-3 overflow-x-auto">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="relative group flex items-center gap-2.5 p-2 pr-7 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xs shrink-0"
            >
              {att.type === 'image' && att.previewUrl ? (
                <img
                  src={att.previewUrl}
                  alt={att.name}
                  className="w-11 h-11 rounded-xl object-cover border border-[var(--border)]"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent-text)] flex items-center justify-center border border-[var(--accent-border)]">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div className="max-w-[140px]">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {att.name}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase">
                  {att.type === 'image' ? 'Image' : 'Document'} • {formatFileSize(att.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-[var(--surface-secondary)] hover:bg-rose-500 hover:text-white text-[var(--text-muted)] transition-colors cursor-pointer"
                title="Remove attachment"
                aria-label={`Remove ${att.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 7. COMPLETE INTERACTIVE INPUT COMPOSER & MULTIMODAL TOOLBAR */}
      <div className="p-3 sm:p-4 border-t border-[var(--border)] bg-[var(--surface)] space-y-2.5 min-w-0 max-w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {/* 🎤 Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={isBusy || isTranscribingAudio}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-[var(--surface-secondary)] hover:bg-[var(--accent-subtle)] text-[var(--text-primary)] hover:text-[var(--accent-text)] border-[var(--border)]'
              } disabled:opacity-40`}
              title={isListening ? 'Stop Microphone' : 'Microphone Voice Input'}
              aria-label={isListening ? 'Stop Microphone' : 'Start Microphone Voice Input'}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{t('assistant.mic', 'Mic')}</span>
            </button>

            {/* 👂 Listen Control Button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={isBusy || isTranscribingAudio}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isListening
                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30 animate-pulse'
                  : 'bg-[var(--surface-secondary)] hover:bg-[var(--accent-subtle)] text-[var(--text-primary)] hover:text-[var(--accent-text)] border-[var(--border)]'
              } disabled:opacity-40`}
              title="Start or stop voice recognition"
            >
              <Radio className={`w-3.5 h-3.5 ${isListening ? 'text-rose-500 animate-spin' : ''}`} />
              <span>
                {isListening
                  ? t('voice.listeningShort', 'Listening...')
                  : t('assistant.listenControl', 'Voice Input')}
              </span>
            </button>

            {/* 🖼️ Upload Image Button */}
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isBusy}
              className="px-3 py-1.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--accent-subtle)] text-[var(--text-primary)] hover:text-[var(--accent-text)] border border-[var(--border)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              title="Upload Image (PNG, JPG, WEBP)"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{t('assistant.uploadImage', 'Upload Image')}</span>
            </button>

            {/* 📎 Upload File / Document Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              className="px-3 py-1.5 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--accent-subtle)] text-[var(--text-primary)] hover:text-[var(--accent-text)] border border-[var(--border)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              title="Attach Document (PDF, TXT, CSV, JSON, MD)"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>{t('assistant.uploadFile', 'Attach File')}</span>
            </button>

            {/* ⏹️ Stop Speaking Control */}
            {(isSpeaking || isPaused) && (
              <button
                type="button"
                onClick={handleStopMessageAudio}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Stop reading aloud immediately"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>{t('voice.stopSpeaking', 'Stop Speaking')}</span>
              </button>
            )}
          </div>

          {/* Speech Recognition Language Selector */}
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] min-w-0 max-w-full">
            <span className="hidden sm:inline font-medium shrink-0">Speech Input:</span>
            <select
              value={speechLang}
              onChange={(e) => setSpeechLang(e.target.value as LanguageCode)}
              aria-label="Speech recognition language"
              title={activeSpeechOption.supportNote}
              className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg px-2 py-1 text-[11px] font-semibold text-[var(--text-primary)] focus:outline-none cursor-pointer max-w-[190px] sm:max-w-none truncate"
            >
              {SPEECH_LANGUAGE_OPTIONS.map((opt) => (
                <option
                  key={opt.code}
                  value={opt.code}
                  className="bg-[var(--surface)] text-[var(--text-primary)]"
                >
                  {opt.nativeLabel} ({opt.label}){' '}
                  {opt.browserNativeSupport === 'full' ? '• Live STT' : '• AI Cloud STT'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Input & ➤ Send Button Row */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 min-w-0"
        >
          <div className="relative flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              rows={1}
              value={
                isListening && interimTranscript
                  ? `${input}${input ? ' ' : ''}${interimTranscript}`
                  : input
              }
              onChange={(e) => {
                setInput(e.target.value);
                if (interimTranscript) setInterimTranscript('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={t(
                'hero.searchPlaceholder',
                'Type a question, use the microphone to speak, or attach an image/document...'
              )}
              className="w-full min-h-[44px] max-h-28 bg-[var(--surface-secondary)] border border-[var(--border-strong)] focus:border-[var(--accent)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={(!input.trim() && attachments.length === 0) || isBusy || isTranscribingAudio}
            className="h-11 px-5 rounded-xl bg-[var(--button-primary-bg)] hover:bg-[var(--accent-hover)] disabled:opacity-40 text-[var(--button-primary-text)] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed shrink-0"
            title={t('common.send', 'Send Message')}
          >
            {isBusy ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">{t('common.send', 'Send')}</span>
                <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
        </form>
      </div>
      </div>

      {/* Lightbox Modal for Viewing Uploaded Images */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-[var(--surface)] p-3 rounded-2xl border border-[var(--border)] shadow-2xl flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                {lightboxImage.name}
              </span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] cursor-pointer"
                aria-label="Close image preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.name}
              className="max-h-[75vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
