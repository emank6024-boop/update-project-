import React, { useState, useEffect } from 'react';
import {
  Clock,
  Trash2,
  MessageSquare,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
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
  const { isRTL } = useLanguage();
  const [conversations, setConversations] = useState<ConversationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadHistory = async () => {
    if (!user?.id) return;
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {isRTL ? 'گفتگو اور سرگرمی کی تاریخ (Activity History)' : 'Your Conversation & Activity History'}
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Securely stored across sessions in Google Cloud Firestore
            </p>
          </div>
        </div>

        <button
          onClick={loadHistory}
          className="px-3 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--surface-secondary)] text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isRTL ? 'تازہ کریں' : 'Refresh'}</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRTL ? 'تاریخ میں تلاش کریں...' : 'Search your saved activity records...'}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden"
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[var(--text-muted)]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
          <span>Loading your activity history...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-muted)] space-y-3">
          <MessageSquare className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-50" />
          <p>{isRTL ? 'کوئی سابقہ ریکارڈ نہیں ملا۔' : 'No recorded activity found.'}</p>
          <button
            onClick={() => onSelectPage('chat')}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs transition-colors"
          >
            {isRTL ? 'معاون کے ساتھ نئی گفتگو شروع کریں' : 'Start a chat with AI'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-500/40 transition-all flex items-center justify-between gap-4 group"
            >
              <div
                onClick={() => onSelectPage((c.targetPage as PageId) || 'chat')}
                className="flex-1 cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--surface-secondary)] text-emerald-600 border border-[var(--border)]">
                    {c.category}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] uppercase font-mono">
                    {c.language}
                  </span>
                  {c.createdAt && (
                    <span className="text-[11px] text-[var(--text-muted)]">
                      • {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-emerald-600 transition-colors">
                  {c.title}
                </h3>
                {c.subtitle && (
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                    {c.subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 rounded-xl text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSelectPage((c.targetPage as PageId) || 'chat')}
                  className="p-2 rounded-xl text-[var(--text-muted)] group-hover:text-emerald-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
