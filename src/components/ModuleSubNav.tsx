import React from 'react';
import { PageId } from '../types';
import {
  Home,
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
  BookOpen,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ModuleSubNavProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
}

interface SubNavItem {
  id: PageId;
  transKey: string;
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MODULE_ITEMS: SubNavItem[] = [
  { id: 'chat', transKey: 'module.chat.title', defaultLabel: 'AI Assistant', icon: Bot },
  { id: 'translate', transKey: 'module.translate.title', defaultLabel: 'Translator', icon: Languages },
  { id: 'documents', transKey: 'module.documents.title', defaultLabel: 'Documents & OCR', icon: FileText },
  { id: 'government', transKey: 'module.government.title', defaultLabel: 'NADRA & Civic', icon: Building2 },
  { id: 'farmer', transKey: 'module.farmer.title', defaultLabel: 'Farmer AI', icon: Sprout },
  { id: 'medical', transKey: 'module.medical.title', defaultLabel: 'Medical Health', icon: HeartPulse },
  { id: 'legal', transKey: 'module.legal.title', defaultLabel: 'Legal Rights', icon: Scale },
  { id: 'student', transKey: 'nav.studentDashboard', defaultLabel: 'Student Hub', icon: GraduationCap },
  { id: 'faculty', transKey: 'nav.facultyDashboard', defaultLabel: 'Faculty Hub', icon: GraduationCap },
  { id: 'teacher', transKey: 'module.teacher.title', defaultLabel: 'AI Teacher', icon: GraduationCap },
  { id: 'fake-news', transKey: 'module.factCheck.title', defaultLabel: 'Fact Check', icon: ShieldCheck },
  { id: 'sign-language', transKey: 'module.signLanguage.title', defaultLabel: 'Sign Language (PSL)', icon: HandHelping },
  { id: 'voice-assistant', transKey: 'module.voice.title', defaultLabel: 'Voice & Audio', icon: Mic },
  { id: 'blog', transKey: 'nav.blog', defaultLabel: 'Blog & Insights', icon: BookOpen },
];

export const ModuleSubNav: React.FC<ModuleSubNavProps> = ({ currentPage, onSelectPage }) => {
  const { isRTL, t } = useLanguage();

  if (currentPage === 'home') {
    return null;
  }

  return (
    <div
      id="module-subnav"
      className="w-full max-w-full shrink-0 bg-[var(--surface)] border-b border-[var(--border)] overflow-hidden px-3 sm:px-6 lg:px-8 shadow-2xs"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl w-full min-w-0 mx-auto h-11 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSelectPage('home')}
          className="h-8 flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors shrink-0 cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{t('nav.home', 'Home')}</span>
        </button>

        <span className="text-[var(--text-muted)] opacity-50 shrink-0">
          {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </span>

        <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {MODULE_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPage === item.id ||
              (item.id === 'chat' && currentPage === 'ai-assistant') ||
              (item.id === 'translate' && currentPage === 'translator') ||
              (item.id === 'documents' && (currentPage === 'ocr-documents' || (currentPage as string) === 'ocr'));

            return (
              <button
                key={item.id}
                onClick={() => onSelectPage(item.id)}
                className={`h-8 flex items-center gap-1.5 px-3 rounded-xl text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)] shadow-xs font-semibold'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t(item.transKey, item.defaultLabel)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
