/**
 * Core Type Definitions for PakLingo AI
 */

export type PageId =
  | 'home'
  | 'chat'
  | 'ai-assistant'
  | 'translate'
  | 'translator'
  | 'documents'
  | 'ocr-documents'
  | 'ocr'
  | 'voice-assistant'
  | 'voice'
  | 'tts-stt'
  | 'government'
  | 'teacher'
  | 'student'
  | 'student-dashboard'
  | 'faculty'
  | 'faculty-dashboard'
  | 'medical'
  | 'farmer'
  | 'legal'
  | 'fake-news'
  | 'sign-language'
  | 'dashboard'
  | 'settings'
  | 'tools'
  | 'history'
  | 'blog';

export type LanguageCode =
  | 'ur'
  | 'en'
  | 'roman_ur'
  | 'roman'
  | 'pa'
  | 'sd'
  | 'ps'
  | 'bal'
  | 'skr'
  | 'hnd'
  | 'ks'
  | 'brh';

export interface AccessibilitySettings {
  highContrast: boolean;
  simpleMode: boolean;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  screenReaderMode: boolean;
  reducedMotion: boolean;
  voiceFeedback: boolean;
  speechRate: number;
  theme: string;
}

export interface SupportedLanguage {
  code: LanguageCode;
  name: string;
  nativeName: string;
  script: 'rtl' | 'ltr';
  region: string;
  flag?: string;
  fontFamily?: string;
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'file';
  name: string;
  mimeType: string;
  size: number;
  dataBase64?: string;
  previewUrl?: string;
  textContent?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  category?: string;
  isGrounded?: boolean;
  attachments?: ChatAttachment[];
  replyToUserMsgId?: string;
  conversationId?: string;
  language?: LanguageCode;
}

export interface ChatConversation {
  id: string;
  title: string;
  subtitle?: string;
  language: LanguageCode;
  category?: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface VoiceSettings {
  enabled?: boolean;
  rate: number;
  pitch: number;
  volume: number;
  selectedVoice?: string;
  selectedVoiceURI?: string;
  autoSpeak?: boolean;
  autoPlay?: boolean;
}


