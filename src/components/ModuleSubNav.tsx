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
  Clock,
  Settings,
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
  label: string;
  labelUrdu: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MODULE_ITEMS: SubNavItem[] = [
  { id: 'chat', label: 'AI Assistant', labelUrdu: 'اے آئی چیٹ', icon: Bot },
  { id: 'translate', label: 'Translator', labelUrdu: 'لائیو ترجمہ', icon: Languages },
  { id: 'documents', label: 'Documents & OCR', labelUrdu: 'دستاویزات', icon: FileText },
  { id: 'government', label: 'NADRA & Civic', labelUrdu: 'سرکاری خدمات', icon: Building2 },
  { id: 'farmer', label: 'Farmer AI', labelUrdu: 'کسان معاون', icon: Sprout },
  { id: 'medical', label: 'Medical Health', labelUrdu: 'طبی امداد', icon: HeartPulse },
  { id: 'legal', label: 'Legal Rights', labelUrdu: 'قانونی حقوق', icon: Scale },
  { id: 'teacher', label: 'AI Teacher', labelUrdu: 'تعلیمی استاد', icon: GraduationCap },
  { id: 'fake-news', label: 'Fact Check', labelUrdu: 'حقائق تصدیق', icon: ShieldCheck },
  { id: 'sign-language', label: 'Sign Language (PSL)', labelUrdu: 'اشاروں کی زبان', icon: HandHelping },
  { id: 'voice-assistant', label: 'Voice Mode', labelUrdu: 'صوتی موڈ', icon: Mic },
];

export const ModuleSubNav: React.FC<ModuleSubNavProps> = ({ currentPage, onSelectPage }) => {
  const { isRTL } = useLanguage();

  if (currentPage === 'home') {
    return null;
  }

  return (
    <div className="w-full bg-[var(--surface)] border-b border-[var(--border)] overflow-x-auto no-scrollbar py-2 px-4 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        <button
          onClick={() => onSelectPage('home')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors shrink-0"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{isRTL ? 'ہوم' : 'Home'}</span>
        </button>

        <span className="text-[var(--text-muted)] opacity-50 shrink-0">
          {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </span>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isRTL ? item.labelUrdu : item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
