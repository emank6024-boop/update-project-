import React from 'react';
import {
  User,
  Globe2,
  MessageSquare,
  FileText,
  BookmarkCheck,
  ShieldCheck,
  Bot,
  Languages,
  Building2,
  HeartPulse,
  Sprout,
  ArrowRight,
  Sparkles,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { PageId, LanguageCode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface DashboardProps {
  onSelectPage: (page: PageId) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectPage }) => {
  const { user } = useAuth();
  const { t, currentLanguage, isRTL } = useLanguage();

  const userName = user?.name || (user?.isDemo ? 'Demo User' : 'Citizen');

  const quickServices = [
    {
      id: 'chat' as PageId,
      transKey: 'module.chat.title',
      descKey: 'module.chat.desc',
      icon: Bot,
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      id: 'translate' as PageId,
      transKey: 'module.translate.title',
      descKey: 'module.translate.desc',
      icon: Languages,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      id: 'documents' as PageId,
      transKey: 'module.documents.title',
      descKey: 'module.documents.desc',
      icon: FileText,
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      id: 'government' as PageId,
      transKey: 'module.government.title',
      descKey: 'module.government.desc',
      icon: Building2,
      color: 'bg-amber-500/10 text-amber-600',
    },
    {
      id: 'medical' as PageId,
      transKey: 'module.medical.title',
      descKey: 'module.medical.desc',
      icon: HeartPulse,
      color: 'bg-rose-500/10 text-rose-600',
    },
    {
      id: 'farmer' as PageId,
      transKey: 'module.farmer.title',
      descKey: 'module.farmer.desc',
      icon: Sprout,
      color: 'bg-teal-500/10 text-teal-600',
    },
  ];

  return (
    <div
      className="max-w-6xl mx-auto space-y-8 py-4 px-2"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* 1. WELCOME HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">
                {t('dashboard.welcomeUser', 'Welcome, {name}', { name: userName })}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>{user?.isDemo ? t('dashboard.demoBadge', 'Demo Account') : t('dashboard.verified', 'Verified Citizen')}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {t('dashboard.subtitle', 'Overview of your interactions, preferred languages, and quick service shortcuts')}
            </p>
          </div>
        </div>

        {/* Active Language Badge */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] shrink-0 self-stretch sm:self-auto">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Globe2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
              {t('dashboard.activeLanguage', 'Active Language')}
            </span>
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {currentLanguage.nativeName} ({currentLanguage.name})
            </span>
          </div>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-medium">
            {t('dashboard.totalChats', 'Conversations')}
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">24</div>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-medium">
            {t('dashboard.translatedDocs', 'Documents Analyzed')}
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">12</div>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-medium">
            {t('dashboard.savedQueries', 'Saved Inquiries')}
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">8</div>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
          <span className="text-xs text-[var(--text-muted)] font-medium">
            {t('stats.accuracyLabel', 'Verified Accuracy')}
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">99.4%</div>
        </div>
      </div>

      {/* 3. QUICK ACCESS SERVICES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {t('dashboard.quickAccess', 'Quick Access Services')}
          </h2>
          <button
            onClick={() => onSelectPage('history')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
          >
            {t('nav.history', 'View Full History')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickServices.map((service) => {
            const Icon = service.icon;
            const title = t(service.transKey, service.id);
            const desc = t(service.descKey, '');

            return (
              <div
                key={service.id}
                onClick={() => onSelectPage(service.id)}
                className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${service.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-emerald-600 transition-colors">
                      {title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                      {desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                  <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. RECENT ACTIVITY PREVIEW */}
      <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{t('dashboard.recentActivity', 'Recent Activity')}</span>
          </h2>
          <button
            onClick={() => onSelectPage('history')}
            className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
          >
            {t('nav.history', 'History')}
          </button>
        </div>

        <div className="divide-y divide-[var(--border)] text-xs">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-semibold text-[var(--text-primary)] block">
                  {t('hero.promptNadra', 'NADRA Smart NIC Renewal')}
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">Verified procedure inquiry</span>
              </div>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">Today</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="font-semibold text-[var(--text-primary)] block">
                  {t('module.translate.title', 'Regional Live Translator')}
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">English ↔ {currentLanguage.name}</span>
              </div>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">Yesterday</span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-semibold text-[var(--text-primary)] block">
                  {t('hero.promptBisp', 'BISP 8171 Eligibility')}
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">Civic guide consulted</span>
              </div>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};
