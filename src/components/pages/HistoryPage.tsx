import React, { useState, useEffect } from 'react';
import {
  Clock,
  Trash2,
  MessageSquare,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import { PageId } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  getUserConversations,
  deleteUserConversation,
  ConversationDocument,
} from '../../lib/firestoreService';

interface HistoryPageProps {
  onSelectPage: (page: PageId) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectPage }) => {
  const { user } = useAuth();
  const { isRTL, t } = useLanguage();
  const [conversations, setConversations] = useState<ConversationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadHistory = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getUserConversations(user.id);
      setConversations(data);
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?.id]);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    const ok = await deleteUserConversation(id);
    if (ok) {
      setConversations((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const filtered = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.subtitle && c.subtitle.toLowerCase().includes(search.toLowerCase())) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="max-w-4xl mx-auto space-y-6 py-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
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
              {t('history.subtitle', 'Securely saved history of your inquiries across sessions')}
            </p>
          </div>
        </div>

        <button
          onClick={loadHistory}
          className="px-3 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{t('history.refresh', 'Refresh')}</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className={`w-4 h-4 absolute top-3 text-[var(--text-muted)] ${isRTL ? 'right-3' : 'left-3'}`} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('history.searchPlaceholder', 'Search conversation titles or categories...')}
          className={`w-full py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
            isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
          }`}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
          <span>{t('common.loading', 'Loading...')}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
          <Clock className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {t('history.emptyTitle', 'No Conversation History Yet')}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            {t('history.emptyDesc', 'Your conversations with AI assistants and translators will appear here automatically.')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-500/50 transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-secondary)] text-[var(--text-secondary)] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {item.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider shrink-0">
                      {item.category}
                    </span>
                  </div>
                  {item.subtitle && (
                    <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectPage('chat')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-600 text-xs font-medium transition-colors cursor-pointer"
                >
                  {t('history.view', 'Open')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-600 transition-colors cursor-pointer"
                  title={t('history.delete', 'Delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
