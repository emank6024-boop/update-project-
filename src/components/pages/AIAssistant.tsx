import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Volume2,
  Copy,
  Check,
  RefreshCw,
  RotateCcw,
  Languages,
  AlertCircle,
  Clock,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LanguageCode, ChatMessage } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceSettings } from '../../context/VoiceSettingsContext';
import { useAuth } from '../../context/AuthContext';
import { saveUserConversation } from '../../lib/firestoreService';

interface AIAssistantProps {
  selectedLanguage: LanguageCode;
  onSelectLanguage?: (lang: LanguageCode) => void;
  initialPrompt?: string;
}

const SAMPLE_PROMPTS = [
  { label: 'NADRA CNIC تجدید', prompt: 'نادرا سمارٹ شناختی کارڈ کی تجدید کا طریقہ، فیس اور ضروری دستاویزات کیا ہیں؟' },
  { label: 'بجلی کا بل اور ٹیکس', prompt: 'پاکستانی بجلی کے بل میں FPA اور دیگر اضافی ٹیکسز کی کیا وضاحت ہے؟' },
  { label: 'کسان کارڈ اور سبسڈی', prompt: 'کسان کارڈ کے لیے اہلیت اور حکومت پنجاب کی زرعی کھاد سبسڈی کیسے حاصل کریں؟' },
  { label: 'کرایہ داری کے حقوق', prompt: 'پاکستان میں کرایہ دار اور مالک مکان کے بنیادی قانونی حقوق اور کرایہ نامہ کی شرائط کیا ہیں؟' },
];

export const AIAssistant: React.FC<AIAssistantProps> = ({
  selectedLanguage,
  onSelectLanguage,
  initialPrompt,
}) => {
  const { isRTL } = useLanguage();
  const { speak, isSpeaking, stopSpeaking } = useVoiceSettings();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        selectedLanguage === 'ur'
          ? 'السلام علیکم! میں پاک لنگو اے آئی ہوں، آپ کا بااعتماد پاکستانی ذہین معاون۔ آپ مجھ سے سرکاری دستاویزات، صحت، زراعت، تعلیم یا روزمرہ امور کے بارے میں کوئی بھی سوال پوچھ سکتے ہیں۔'
          : 'Hello! I am PakLingo AI, your Pakistani conversational assistant. Ask me anything regarding civic services, legal rights, agriculture, education, or everyday queries.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Build history for API
      const historyPayload = newMessages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: selectedLanguage,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to fetch response.');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: 'ast_' + Date.now(),
        sender: 'assistant',
        text: data.reply || 'No response returned.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: data.category,
        isGrounded: data.isGrounded,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Save conversation to firestore if logged in
      if (user && user.id) {
        saveUserConversation({
          userId: user.id,
          title: query.substring(0, 80),
          category: 'AI Assistant',
          language: selectedLanguage,
          subtitle: data.reply.substring(0, 150),
          type: 'chat',
          targetPage: 'chat',
        }).catch((e) => console.warn('Could not save conversation:', e));
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with PakLingo AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome_' + Date.now(),
        sender: 'assistant',
        text:
          selectedLanguage === 'ur'
            ? 'نئی گفتگو شروع کی گئی ہے۔ فرمائیے، میں کس طرح مدد کر سکتا ہوں؟'
            : 'New conversation started. How may I assist you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[500px] max-w-4xl mx-auto bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)]">
              {isRTL ? 'پاک لنگو ہمہ گیر اے آئی معاون' : 'PakLingo AI Conversational Assistant'}
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Grounded in Pakistani context & multi-dialect intelligence</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--text-secondary)] text-xs flex items-center gap-1.5 transition-colors"
            title="Clear Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isRTL ? 'صاف کریں' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-tl-xs'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{m.text}</p>
                ) : (
                  <div className="prose prose-xs dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                  </div>
                )}

                <div
                  className={`mt-2 pt-1 border-t flex items-center justify-between text-[10px] ${
                    isUser
                      ? 'border-white/20 text-white/70'
                      : 'border-[var(--border)] text-[var(--text-muted)]'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {!isUser && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speak(m.text, selectedLanguage)}
                        className="hover:text-emerald-500 transition-colors p-0.5"
                        title="Read Aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopy(m.text, m.id)}
                        className="hover:text-emerald-500 transition-colors p-0.5"
                        title="Copy text"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-tl-xs flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>{isRTL ? 'جواب تیار ہو رہا ہے...' : 'Thinking & formulating response...'}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface)] overflow-x-auto no-scrollbar flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{isRTL ? 'تجویز کردہ سوالات:' : 'Suggestions:'}</span>
          </span>
          {SAMPLE_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-emerald-500/10 hover:border-emerald-500/30 text-[var(--text-secondary)] hover:text-emerald-600 transition-colors shrink-0"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 sm:p-4 border-t border-[var(--border)] bg-[var(--surface)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isRTL
                ? 'اپنا سوال یا مسئلہ یہاں تحریر کریں...'
                : 'Type your message or ask a question in any language...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isRTL ? 'بھیجیں' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
