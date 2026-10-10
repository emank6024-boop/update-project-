import React from 'react';
import {
  Bot,
  Languages,
  FileText,
  Building2,
  Sprout,
  HeartPulse,
  Scale,
  GraduationCap,
  ShieldCheck,
  HandHelping,
  Mic,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { PageId } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ToolsPageProps {
  onSelectPage: (page: PageId) => void;
}

interface ToolConfig {
  id: PageId;
  key: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TOOLS_CONFIG: ToolConfig[] = [
  { id: 'chat', key: 'chat', category: 'Core AI', icon: Bot },
  { id: 'translate', key: 'translate', category: 'Languages', icon: Languages },
  { id: 'documents', key: 'documents', category: 'Vision & OCR', icon: FileText },
  { id: 'government', key: 'government', category: 'Civic Portals', icon: Building2 },
  { id: 'fake-news', key: 'factCheck', category: 'Verification', icon: ShieldCheck },
  { id: 'farmer', key: 'farmer', category: 'Agriculture', icon: Sprout },
  { id: 'medical', key: 'medical', category: 'Healthcare', icon: HeartPulse },
  { id: 'legal', key: 'legal', category: 'Legal Rights', icon: Scale },
  { id: 'teacher', key: 'teacher', category: 'Education', icon: GraduationCap },
  { id: 'sign-language', key: 'signLanguage', category: 'Accessibility', icon: HandHelping },
  { id: 'voice-assistant', key: 'voice', category: 'Audio', icon: Mic },
  { id: 'blog', key: 'blog', category: 'Knowledge', icon: BookOpen },
];

export const ToolsPage: React.FC<ToolsPageProps> = ({ onSelectPage }) => {
  const { isRTL, t, currentLanguage } = useLanguage();

  return (
    <div
      className="max-w-6xl mx-auto space-y-8 py-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{currentLanguage.nativeName}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {t('modules.heading', 'Comprehensive Civic & Intelligence Modules')}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          {t(
            'modules.subheading',
            'Explore dedicated domain assistants engineered for Pakistan’s citizens, farmers, students, and professionals.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS_CONFIG.map((tool) => {
          const Icon = tool.icon;
          const title =
            tool.id === 'blog'
              ? t('nav.blog', 'Blog & Knowledge Base')
              : t(`module.${tool.key}.title`, tool.key);
          const desc =
            tool.id === 'blog'
              ? t('blog.subtitle', 'In-depth articles and civic guides')
              : t(`module.${tool.key}.desc`, '');
          const badge =
            tool.id === 'blog'
              ? t('common.official', 'Insights')
              : t(`module.${tool.key}.badge`, tool.category);
          const action =
            tool.id === 'blog'
              ? t('blog.readFull', 'Explore')
              : t(`module.${tool.key}.action`, 'Open');

          return (
            <div
              key={tool.id}
              className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-emerald-600 transition-colors">
                  {title}
                </h3>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => onSelectPage(tool.id)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white text-xs font-semibold transition-all cursor-pointer group/btn"
                >
                  <span>{action}</span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1 ${isRTL ? 'rotate-180 group-hover/btn:-translate-x-1' : ''}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
