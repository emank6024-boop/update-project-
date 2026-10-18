import React, { useState, useEffect } from 'react';
import {
  Clock,
  Trash2,
  MessageSquare,
  Search,
  RefreshCw,
  GraduationCap,
  BookOpen,
  Sprout,
  HeartPulse,
  Scale,
  Building2,
  Bot,
} from 'lucide-react';
import { PageId } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  loadAllFeaturesHistory,
  deleteFeatureHistoryItem,
  FeatureHistoryItem,
  loadLocalChatConversations,
  deleteLocalChatConversation,
  getLocalChatConversationById,
  buildConversationFromFirestoreDoc,
  saveLocalChatConversation,
} from '../../lib/firestoreService';

interface HistoryPageProps {
  onSelectPage: (page: PageId) => void;
  onOpenConversation?: (conversationId: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onSelectPage,
  onOpenConversation,
}) => {
  const { user } = useAuth();
  const { isRTL, t } = useLanguage();
  const [items, setItems] = useState<FeatureHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  const loadHistory = () => {
    setIsLoading(true);
    try {
      const allHistory = loadAllFeaturesHistory(user?.id);
      setItems(allHistory);
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?.id]);

  const handleDelete = (item: FeatureHistoryItem) => {
    if (!item.id) return;
    if (item.module === 'chat') {
      deleteLocalChatConversation(item.id, user?.id);
    }
    deleteFeatureHistoryItem(item.module, item.id, user?.id);
    setItems((prev) => prev.filter((c) => c.id !== item.id));
  };

  const handleOpenItem = (item: FeatureHistoryItem) => {
    try {
      // Save item as current active inquiry for the target feature
      sessionStorage.setItem(`paklingo_active_query_${item.module}`, JSON.stringify(item));
    } catch {}

    switch (item.module) {
      case 'teacher':
        onSelectPage('teacher');
        break;
      case 'student':
        onSelectPage('student');
        break;
      case 'farmer':
        onSelectPage('farmer');
        break;
      case 'medical':
        onSelectPage('medical');
        break;
      case 'legal':
        onSelectPage('legal');
        break;
      case 'government':
        onSelectPage('government');
        break;
      case 'chat':
      default:
        if (item.id) {
          const existingLocal = getLocalChatConversationById(item.id, user?.id);
          if (!existingLocal) {
            const reconstructed = buildConversationFromFirestoreDoc({
              id: item.id,
              userId: user?.id || 'guest',
              title: item.title,
              subtitle: item.subtitle,
              category: item.module,
              language: item.language,
              createdAt: item.createdAt,
            });
            saveLocalChatConversation(reconstructed, user?.id);
          }
          if (onOpenConversation) {
            onOpenConversation(item.id);
            return;
          }
        }
        onSelectPage('chat');
        break;
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'teacher':
        return <GraduationCap className="w-4 h-4 text-sky-600" />;
      case 'student':
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
      case 'farmer':
        return <Sprout className="w-4 h-4 text-emerald-600" />;
      case 'medical':
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'legal':
        return <Scale className="w-4 h-4 text-amber-600" />;
      case 'government':
        return <Building2 className="w-4 h-4 text-cyan-600" />;
      case 'chat':
      default:
        return <Bot className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getModuleBadge = (module: string) => {
    switch (module) {
      case 'teacher':
        return { label: 'Teacher AI', bg: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20' };
      case 'student':
        return { label: 'Student AI', bg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20' };
      case 'farmer':
        return { label: 'Farmer AI', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' };
      case 'medical':
        return { label: 'Medical AI', bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20' };
      case 'legal':
        return { label: 'Legal Advisor', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' };
      case 'government':
        return { label: 'Civic Services', bg: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20' };
      case 'chat':
      default:
        return { label: 'AI Assistant', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' };
    }
  };

  const tabs = [
    { id: 'all', label: isRTL ? 'تمام ہسٹری' : 'All Features' },
    { id: 'chat', label: isRTL ? 'اے آئی معاون' : 'AI Assistant' },
    { id: 'teacher', label: isRTL ? 'اے آئی استاد' : 'Teacher AI' },
    { id: 'student', label: isRTL ? 'طلبہ ڈیش بورڈ' : 'Student AI' },
    { id: 'farmer', label: isRTL ? 'کسان مشیر' : 'Farmer AI' },
    { id: 'medical', label: isRTL ? 'طبی معاون' : 'Medical AI' },
    { id: 'legal', label: isRTL ? 'قانونی رہنمائی' : 'Legal Advisor' },
  ];

  const filtered = items.filter((item) => {
    const matchesTab = activeTab === 'all' || item.module === activeTab;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      (item.query && item.query.toLowerCase().includes(q)) ||
      item.module.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="w-full space-y-6 py-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {t('history.title', 'Activity & Conversation History')}
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {t(
                'history.subtitle',
                'Separately saved conversations and searches across all features. Open and continue anytime.'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={loadHistory}
          className="px-3.5 py-2 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{t('history.refresh', 'Refresh')}</span>
        </button>
      </div>

      {/* Feature Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[var(--border)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] border border-[var(--border)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className={`w-4 h-4 absolute top-3 text-[var(--text-muted)] ${isRTL ? 'right-3' : 'left-3'}`} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('history.searchPlaceholder', 'Search conversation titles, questions, or subjects...')}
          className={`w-full py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
            isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
          }`}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-10 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span>{t('common.loading', 'Loading history...')}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
          <Clock className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {t('history.emptyTitle', 'No Saved History for this Category')}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            {t('history.emptyDesc', 'Inquiries made in Teacher AI, Student AI, Farmer AI, and AI Assistant persist automatically.')}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const badge = getModuleBadge(item.module);
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-500/50 transition-all flex items-center justify-between gap-4 group shadow-2xs"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[var(--surface-secondary)] flex items-center justify-center shrink-0">
                    {getModuleIcon(item.module)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-md">
                        {item.title || item.query}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider shrink-0 ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {item.subject && (
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          • {item.subject}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                    {item.formulas && item.formulas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.formulas.slice(0, 3).map((f, fi) => (
                          <span
                            key={fi}
                            className="px-1.5 py-0.5 rounded bg-[var(--surface-secondary)] text-[9px] font-mono font-medium text-[var(--text-secondary)] border border-[var(--border)] truncate max-w-[150px]"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] text-[var(--text-muted)] block mt-1">
                      {new Date(item.createdAt).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {item.imageUrl && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-[var(--border)] shrink-0 hidden sm:block">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-contain p-0.5"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenItem(item)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <span>{t('history.view', 'Open & Continue')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-600 transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
                    title={t('history.delete', 'Delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
