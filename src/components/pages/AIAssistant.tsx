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

const WELCOME_MESSAGES: Record<string, string> = {
  en: 'Hello! I am PakLingo AI, your Pakistani conversational assistant. Ask me anything regarding civic services, legal rights, agriculture, education, or everyday queries.',
  ur: 'السلام علیکم! میں پاک لنگو اے آئی ہوں، آپ کا بااعتماد پاکستانی ذہین معاون۔ آپ مجھ سے سرکاری دستاویزات، صحت، زراعت، تعلیم یا روزمرہ امور کے بارے میں کوئی بھی سوال پوچھ سکتے ہیں۔',
  sd: 'اسلام عليڪم! مان پاڪ لنگو اي آءِ آهيان، توهان جو بااعتماد پاڪستاني مددگار. اوهان مون کان سرڪاري دستاويز، صحت، زراعت، تعليم يا روزمره معاملن بابت ڪجهه به پڇي سگهو ٿا.',
  pa: 'سلام وعلیکم! میں پاک لنگو اے آئی ہاں، تہاڈا مخلص معاون۔ تسی میرے توں سرکاری کاغذاں، صحت، واہی بیجی، پڑھائی یا کجھ وی پچھ سکدے او۔',
  bal: 'سلام! من پاک لنگو اے آئی آں، شمارا وتی مخلصیں کمکار۔ شما چہ منا سرکاری کاگد، جان سلامتی، ڈگارکاری یا وانگ ءِ بابت ءَ ہر جُست گر ات کُت کن ات۔',
  ps: 'سلام! زه پاک لنګو اي آی یم، ستاسو پښتون او باوري مرستیال. تاسو کولی شئ له ما څخه د اسنادو، روغتیا، کرنې، زده کړې او نورو چارو په اړه پوښتنې وکړئ.',
  roman_ur: 'Assalam-o-Alaikum! Main PakLingo AI hoon, aap ka ba-aitemad Pakistani conversational assistant. Aap mujh se sarkari documents, health, farming, education ya koi bhi sawal pooch sakte hain.',
};

export const AIAssistant: React.FC<AIAssistantProps> = ({
  selectedLanguage,
  onSelectLanguage,
  initialPrompt,
}) => {
  const { isRTL, t, currentLanguage } = useLanguage();
  const { speak, isSpeaking, stopSpeaking } = useVoiceSettings();
  const { user } = useAuth();

  const getWelcomeText = () => {
    return (
      WELCOME_MESSAGES[selectedLanguage] ||
      WELCOME_MESSAGES['ur'] ||
      WELCOME_MESSAGES['en']
    );
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: getWelcomeText(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Update welcome message if language changes and no user messages exist yet
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            sender: 'assistant',
            text: getWelcomeText(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  }, [selectedLanguage]);

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: selectedLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response. Please retry.');
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'assistant',
        text: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGrounded: true,
      };

      setMessages([...newMessages, botMsg]);

      // Save conversation for authenticated users
      if (user?.id) {
        saveUserConversation({
          userId: user.id,
          title: query.slice(0, 40) + '...',
          subtitle: botMsg.text.slice(0, 80) + '...',
          category: 'AI Assistant',
          language: selectedLanguage,
          module: 'assistant',
          targetPage: 'chat',
        }).catch((e) => console.warn('Could not save conversation:', e));
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while contacting AI service.');
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
        text: getWelcomeText(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const samplePrompts = [
    { label: t('hero.promptNadra', 'NADRA Smart NIC'), prompt: t('hero.promptNadraQuery', 'NADRA Smart NIC renewal procedure, fees, and required documents in Pakistan') },
    { label: t('hero.promptBill', 'Electricity Bill Taxes'), prompt: t('hero.promptBillQuery', 'Explain fuel price adjustment (FPA), taxes, and surcharges in Pakistani electricity bills') },
    { label: t('hero.promptWheat', 'Wheat Crop Diseases'), prompt: t('hero.promptWheatQuery', 'Wheat crop yellow rust disease symptoms and organic treatment in Pakistan') },
    { label: t('hero.promptBisp', 'BISP 8171 Eligibility'), prompt: t('hero.promptBispQuery', 'How to check BISP 8171 financial assistance eligibility and verification process') },
  ];

  return (
    <div
      className="flex flex-col h-[calc(100vh-140px)] min-h-[500px] max-w-4xl mx-auto bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Top Header */}
      <div className="p-4 border-b border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                {t('module.chat.title', 'AI Conversational Assistant')}
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                {currentLanguage.nativeName}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('brand.subTagline', 'Grounded in Pakistani civic intelligence')}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--text-secondary)] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Clear Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('common.clear', 'Reset')}</span>
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
              className={`flex gap-3 max-w-[85%] ${isUser ? (isRTL ? 'mr-auto flex-row-reverse' : 'ml-auto flex-row-reverse') : (isRTL ? 'ml-auto' : 'mr-auto')}`}
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
                        className="hover:text-emerald-500 transition-colors p-0.5 cursor-pointer"
                        title={t('translator.listen', 'Read Aloud')}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopy(m.text, m.id)}
                        className="hover:text-emerald-500 transition-colors p-0.5 cursor-pointer"
                        title={t('translator.copy', 'Copy text')}
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
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>{t('common.loading', 'Generating response in {lang}...', { lang: currentLanguage.name })}</span>
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

      {/* Prompt Suggestion Chips */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-[var(--surface-secondary)] border-t border-[var(--border)] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-[var(--text-muted)] shrink-0 font-medium">
            {t('hero.tryPrompt', 'Try:')}
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.prompt)}
              className="px-2.5 py-1 rounded-full bg-[var(--surface)] hover:bg-[var(--border)] border border-[var(--border)] text-[11px] text-[var(--text-secondary)] shrink-0 transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Composer */}
      <div className="p-3 border-t border-[var(--border)] bg-[var(--surface)]">
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
            placeholder={t('hero.searchPlaceholder', 'Type a question or message in your language...')}
            className="flex-1 bg-[var(--surface-secondary)] border border-[var(--border)] focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed"
            title={t('common.search', 'Send')}
          >
            <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </button>
        </form>
      </div>
    </div>
  );
};
