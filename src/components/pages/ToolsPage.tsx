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
} from 'lucide-react';
import { PageId } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ToolsPageProps {
  onSelectPage: (page: PageId) => void;
}

interface ToolItem {
  id: PageId;
  title: string;
  titleUrdu: string;
  desc: string;
  descUrdu: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TOOLS: ToolItem[] = [
  {
    id: 'chat',
    title: 'AI Conversational Assistant',
    titleUrdu: 'اے آئی گفتگو و معاونت',
    desc: 'Grounded bilingual assistant for Pakistani queries and problem-solving.',
    descUrdu: 'پاکستانی امور، روزمرہ مسائل اور صوتی فیڈ بیک کے ساتھ ہمہ گیر گفتگو۔',
    category: 'Core AI',
    icon: Bot,
  },
  {
    id: 'translate',
    title: 'Regional Live Translator',
    titleUrdu: 'علاقائی لائیو مترجم',
    desc: 'Instant translation across Urdu, Punjabi, Sindhi, Pashto, Balochi, and English.',
    descUrdu: 'اردو، پنجابی، پشتو، سندھی، بلوچی اور انگریزی میں بااعتماد ترجمہ اور رومن تلفظ۔',
    category: 'Languages',
    icon: Languages,
  },
  {
    id: 'documents',
    title: 'Document OCR Intelligence',
    titleUrdu: 'دستاویزات و بل تفہیم',
    desc: 'Scan and extract info from CNIC cards, utility bills, and court deeds.',
    descUrdu: 'شناختی کارڈ، بجلی کے بل اور عدالتی دستاویزات کا فوری تجزیہ اور خلاصہ۔',
    category: 'Vision & OCR',
    icon: FileText,
  },
  {
    id: 'government',
    title: 'Civic & NADRA Services',
    titleUrdu: 'سرکاری و نادرا رہنمائی',
    desc: 'Procedures for Smart CNIC, Passports, BISP 8171, and FBR filings.',
    descUrdu: 'نادرا سمارٹ کارڈ، پاسپورٹ، بے نظیر انکم سپورٹ اور ٹیکس فائلنگ کا طریقہ۔',
    category: 'Public Services',
    icon: Building2,
  },
  {
    id: 'farmer',
    title: 'Kissan Agriculture AI',
    titleUrdu: 'کسان زرعی معاون',
    desc: 'Crop pest diagnosis, fertilizer schedules, and mandi market prices.',
    descUrdu: 'فصلوں کی بیماریاں، کیڑوں سے بچاؤ کے دیسی علاج اور غلہ منڈی کے نرخ۔',
    category: 'Agriculture',
    icon: Sprout,
  },
  {
    id: 'medical',
    title: 'Health & First-Aid Triage',
    titleUrdu: 'صحت و فوری طبی امداد',
    desc: 'Symptom triage, heatstroke care, and 24/7 Rescue 1122 access.',
    descUrdu: 'ابتدائی طبی امداد، گرمی کے اثرات سے بچاؤ اور ریسکیو 1122 ہاٹ لائنز۔',
    category: 'Healthcare',
    icon: HeartPulse,
  },
  {
    id: 'legal',
    title: 'Legal Rights & Awareness',
    titleUrdu: 'قانونی آگاہی و شہری حقوق',
    desc: 'Clear legal rights regarding residential agreements, labor laws, and inheritance.',
    descUrdu: 'کرایہ داری معاہدات، مزدوروں کے حقوق اور وراثت کے بنیادی قوانین۔',
    category: 'Legal Aid',
    icon: Scale,
  },
  {
    id: 'teacher',
    title: 'STEM AI Teacher',
    titleUrdu: 'تعلیمی استاد و تدریس',
    desc: 'Step-by-step problem solver for Matric and Intermediate Math & Science.',
    descUrdu: 'میٹرک اور انٹرمیڈیٹ طلبہ کے لیے ریاضی، طبیعیات اور کیمیا کے سوالات کا حل۔',
    category: 'Education',
    icon: GraduationCap,
  },
  {
    id: 'fake-news',
    title: 'Fact Check & Verification',
    titleUrdu: 'حقائق کی تصدیق و تجزیہ',
    desc: 'Forensic evaluation of viral WhatsApp forwards and social media claims.',
    descUrdu: 'سوشل میڈیا اور واٹس ایپ پر گردش کرنے والی خبروں اور دعووں کی تحقیق۔',
    category: 'Verification',
    icon: ShieldCheck,
  },
  {
    id: 'sign-language',
    title: 'Pakistan Sign Language (PSL)',
    titleUrdu: 'پاکستان اشاروں کی زبان',
    desc: 'Interactive PSL dictionary, gestures, and accessible communication.',
    descUrdu: 'پاکستان سائن لینگویج (PSL) لغت اور سماعت سے محروم افراد کے لیے معاونت۔',
    category: 'Accessibility',
    icon: HandHelping,
  },
  {
    id: 'voice-assistant',
    title: 'Hands-Free Voice Mode',
    titleUrdu: 'صوتی موڈ',
    desc: 'Voice-to-voice interaction in Urdu and English without typing.',
    descUrdu: 'بغیر ٹائپ کیے بول کر سوالات پوچھیں اور جواب سنیں۔',
    category: 'Voice AI',
    icon: Mic,
  },
];

export const ToolsPage: React.FC<ToolsPageProps> = ({ onSelectPage }) => {
  const { isRTL } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          {isRTL ? 'تمام خصوصیات و ماڈیولز (PakLingo Modules)' : 'All PakLingo AI Modules & Services'}
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Explore specialized AI engines tailored to Pakistan's diverse civic and regional needs
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.id}
              onClick={() => onSelectPage(t.id)}
              className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-muted)]">
                    {t.category}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                  {isRTL ? t.titleUrdu : t.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isRTL ? t.descUrdu : t.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                <span>{isRTL ? 'شروع کریں' : 'Launch Module'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
