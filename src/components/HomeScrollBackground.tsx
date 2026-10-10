import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { PageId } from '../types';

interface HomeScrollBackgroundProps {
  isRTL?: boolean;
  isHome?: boolean;
  currentPage?: PageId;
}

interface CalligraphicItem {
  id: string;
  script: string;
  subtitle: string;
  top: string;
  left: string;
  size: string;
  tone: 'emerald' | 'accent' | 'ivoryGold' | 'teal';
  duration: number;
  delay: number;
  hideOnMobile?: boolean;
}

/**
 * Artistic Urdu, Punjabi, Sindhi, Pashto & Balochi Calligraphic Watermarks.
 * Positioned strictly along the outer left (1.5% - 2.5%) and outer right (89% - 91%)
 * atmospheric wings at calm, secondary opacity so they enrich the Pakistani cultural
 * identity without ever competing with central headings, cards, or inputs.
 */
const CALLIGRAPHIC_MEDALLIONS: CalligraphicItem[] = [
  // Left Atmospheric Wing
  {
    id: 'ur-pak',
    script: 'پاکستان',
    subtitle: 'ایوانِ ذہانت',
    top: '12%',
    left: '2%',
    size: 'text-xl sm:text-2xl lg:text-3xl',
    tone: 'emerald',
    duration: 14,
    delay: 0,
  },
  {
    id: 'pa-sanjh',
    script: 'پنجابی',
    subtitle: 'سانجھ تے علم',
    top: '32%',
    left: '2.2%',
    size: 'text-lg sm:text-xl lg:text-2xl',
    tone: 'accent',
    duration: 16,
    delay: 1.2,
    hideOnMobile: true,
  },
  {
    id: 'sd-boli',
    script: 'سنڌي',
    subtitle: 'امن ۽ ترقي',
    top: '52%',
    left: '1.8%',
    size: 'text-lg sm:text-xl lg:text-2xl',
    tone: 'teal',
    duration: 15,
    delay: 0.6,
    hideOnMobile: true,
  },
  {
    id: 'ps-poha',
    script: 'پښتو',
    subtitle: 'پوهه او نوښت',
    top: '70%',
    left: '2.2%',
    size: 'text-lg sm:text-xl lg:text-2xl',
    tone: 'ivoryGold',
    duration: 14.5,
    delay: 1.8,
    hideOnMobile: true,
  },
  {
    id: 'bal-mehr',
    script: 'بلوچی',
    subtitle: 'مہر و تپاکی',
    top: '85%',
    left: '2%',
    size: 'text-lg sm:text-xl lg:text-2xl',
    tone: 'emerald',
    duration: 15.5,
    delay: 0.9,
  },

  // Right Atmospheric Wing
  {
    id: 'ur-ilm',
    script: 'علم و حکمت',
    subtitle: 'مصنوعی ذہانت',
    top: '13%',
    left: '89.5%',
    size: 'text-lg sm:text-xl lg:text-2xl',
    tone: 'ivoryGold',
    duration: 15,
    delay: 0.4,
  },
  {
    id: 'ps-zaba',
    script: 'ژبه او غږ',
    subtitle: 'ټیکنالوژي',
    top: '34%',
    left: '90.5%',
    size: 'text-lg sm:text-xl',
    tone: 'accent',
    duration: 16.5,
    delay: 1.5,
    hideOnMobile: true,
  },
  {
    id: 'sd-awaz',
    script: 'آواز ۽ ٻولي',
    subtitle: 'پاڪستان',
    top: '54%',
    left: '90%',
    size: 'text-lg sm:text-xl',
    tone: 'emerald',
    duration: 14.2,
    delay: 2.0,
    hideOnMobile: true,
  },
  {
    id: 'bal-zaban',
    script: 'شہدیں زبان',
    subtitle: 'بلوچستان',
    top: '84%',
    left: '89.5%',
    size: 'text-lg sm:text-xl lg:text-2xl',
    tone: 'accent',
    duration: 15.8,
    delay: 1.4,
  },
];

/**
 * Provincial & Regional AI Neural Hub Nodes on the Pakistan Map Silhouette
 * Positioned on the outer right wing (X: 1015..1310) so the center column stays clear.
 */
const PAKISTAN_MAP_HUBS = [
  { id: 'isb', script: 'اسلام آباد', cx: 1228, cy: 235, primary: true },
  { id: 'lhr', script: 'لاہور', cx: 1258, cy: 295, primary: false },
  { id: 'pew', script: 'پشاور', cx: 1188, cy: 222, primary: false },
  { id: 'glt', script: 'گلگت', cx: 1268, cy: 162, primary: false },
  { id: 'mux', script: 'ملتان', cx: 1212, cy: 348, primary: false },
  { id: 'uet', script: 'کوئٹہ', cx: 1108, cy: 365, primary: false },
  { id: 'suk', script: 'سکھر', cx: 1158, cy: 432, primary: false },
  { id: 'khi', script: 'کراچی', cx: 1116, cy: 522, primary: true },
  { id: 'gwd', script: 'گوادر', cx: 1008, cy: 502, primary: false },
];

const PAKISTAN_MAP_LINKS: Array<[number, number, number, number]> = [
  [1268, 162, 1228, 235], // Gilgit -> Islamabad
  [1188, 222, 1228, 235], // Peshawar -> Islamabad
  [1228, 235, 1258, 295], // Islamabad -> Lahore
  [1228, 235, 1212, 348], // Islamabad -> Multan
  [1258, 295, 1212, 348], // Lahore -> Multan
  [1188, 222, 1108, 365], // Peshawar -> Quetta
  [1212, 348, 1108, 365], // Multan -> Quetta
  [1212, 348, 1158, 432], // Multan -> Sukkur
  [1108, 365, 1158, 432], // Quetta -> Sukkur
  [1108, 365, 1008, 502], // Quetta -> Gwadar
  [1158, 432, 1116, 522], // Sukkur -> Karachi
  [1008, 502, 1116, 522], // Gwadar -> Karachi
];

/**
 * Left-Wing AI Neural Network Constellation (Positioned on outer left X: 65..215)
 */
const LEFT_WING_NEURAL_NODES = [
  { cx: 75, cy: 210, r: 3.5 },
  { cx: 155, cy: 165, r: 3 },
  { cx: 205, cy: 245, r: 4 },
  { cx: 120, cy: 320, r: 3.5 },
  { cx: 215, cy: 365, r: 3 },
  { cx: 90, cy: 440, r: 4 },
  { cx: 185, cy: 495, r: 3.5 },
  { cx: 105, cy: 610, r: 3.5 },
  { cx: 195, cy: 660, r: 3 },
  { cx: 130, cy: 775, r: 4 },
];

const LEFT_WING_NEURAL_LINKS: Array<[number, number, number, number]> = [
  [75, 210, 155, 165],
  [155, 165, 205, 245],
  [75, 210, 205, 245],
  [75, 210, 120, 320],
  [205, 245, 120, 320],
  [205, 245, 215, 365],
  [120, 320, 215, 365],
  [120, 320, 90, 440],
  [215, 365, 185, 495],
  [90, 440, 185, 495],
  [90, 440, 105, 610],
  [185, 495, 195, 660],
  [105, 610, 195, 660],
  [105, 610, 130, 775],
  [195, 660, 130, 775],
];

const DIGITAL_PARTICLES = [
  { id: 1, top: '10%', left: '9%', size: 4, tone: 'emerald', duration: 9, delay: 0 },
  { id: 2, top: '18%', left: '86%', size: 4, tone: 'ivoryGold', duration: 10.5, delay: 0.7 },
  { id: 3, top: '28%', left: '7%', size: 3.5, tone: 'accent', duration: 8.5, delay: 1.4 },
  { id: 4, top: '38%', left: '84%', size: 4, tone: 'emerald', duration: 11, delay: 0.3 },
  { id: 5, top: '48%', left: '10%', size: 4, tone: 'ivoryGold', duration: 9.5, delay: 1.8 },
  { id: 6, top: '56%', left: '88%', size: 4, tone: 'teal', duration: 8.8, delay: 0.9 },
  { id: 7, top: '68%', left: '8%', size: 4, tone: 'emerald', duration: 10.2, delay: 1.2 },
  { id: 8, top: '76%', left: '85%', size: 4, tone: 'accent', duration: 11.2, delay: 0.5 },
  { id: 9, top: '86%', left: '12%', size: 3.5, tone: 'teal', duration: 9.4, delay: 2.1 },
  { id: 10, top: '88%', left: '84%', size: 4, tone: 'ivoryGold', duration: 10, delay: 1.0 },
];

/**
 * “PAKISTAN AI UNIVERSE” — Refined Competition-Grade Background
 *
 * Engineered so all cultural, geographic, and AI neural illustrations remain
 * visible and distinctive along the outer wings while a smooth central readability
 * shield ensures 100% crystal-clear text contrast in the middle of the viewport.
 */
export const HomeScrollBackground: React.FC<HomeScrollBackgroundProps> = ({
  isHome = true,
  currentPage = 'home',
}) => {
  const { isDark, accentColor } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  const pakEmerald = isDark ? '#10b981' : '#047857';
  const pakDeepGreen = isDark ? '#064e3b' : '#065f46';
  const ivoryGold = isDark ? '#fde68a' : '#d97706';
  const pureIvory = isDark ? '#fef3c7' : '#047857';
  const cyberTeal = isDark ? '#2dd4bf' : '#0d9488';

  // Calibrated intensity so background illustrations remain secondary to UI text
  const scale = isHome ? 0.78 : 0.62;

  const isCivicOrLegal =
    currentPage === 'government' ||
    currentPage === 'legal' ||
    currentPage === 'fake-news' ||
    currentPage === 'documents';

  const getToneColor = (tone: CalligraphicItem['tone']) => {
    switch (tone) {
      case 'emerald':
        return pakEmerald;
      case 'accent':
        return accentColor;
      case 'ivoryGold':
        return ivoryGold;
      case 'teal':
        return cyberTeal;
    }
  };

  // Geographic silhouette of Pakistan positioned on the outer right wing (X: 975..1328)
  const pakistanMapPath =
    'M 975 495 ' +
    'L 1025 508 ' +
    'L 1078 504 ' +
    'L 1108 525 ' +
    'L 1138 548 ' +
    'L 1178 542 ' +
    'L 1188 492 ' +
    'L 1172 452 ' +
    'L 1225 405 ' +
    'L 1258 358 ' +
    'L 1276 302 ' +
    'L 1268 258 ' +
    'L 1305 225 ' +
    'L 1328 178 ' +
    'L 1292 135 ' +
    'L 1232 132 ' +
    'L 1192 162 ' +
    'L 1175 208 ' +
    'L 1145 248 ' +
    'L 1128 302 ' +
    'L 1072 325 ' +
    'L 1005 348 ' +
    'L 958 408 ' +
    'L 985 452 ' +
    'Z';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full max-w-full pointer-events-none select-none overflow-hidden z-0"
    >
      {/* ====================================================================
          LAYER 1: DEEP ATMOSPHERIC NEBULA & SOFT WING LIGHTING
          ==================================================================== */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 transition-colors duration-500"
          style={{
            background: isDark
              ? `radial-gradient(circle at 88% 28%, color-mix(in srgb, ${pakEmerald} 14%, transparent) 0%, transparent 48%),
                 radial-gradient(circle at 12% 24%, color-mix(in srgb, ${accentColor} 14%, transparent) 0%, transparent 45%),
                 radial-gradient(circle at 14% 80%, color-mix(in srgb, ${pakDeepGreen} 22%, transparent) 0%, transparent 50%),
                 radial-gradient(circle at 88% 82%, color-mix(in srgb, ${ivoryGold} 10%, transparent) 0%, transparent 45%),
                 linear-gradient(135deg, #040914 0%, #071222 50%, #050f1d 100%)`
              : `radial-gradient(circle at 88% 26%, color-mix(in srgb, ${pakEmerald} 11%, transparent) 0%, transparent 46%),
                 radial-gradient(circle at 12% 22%, color-mix(in srgb, ${accentColor} 10%, transparent) 0%, transparent 44%),
                 radial-gradient(circle at 14% 82%, color-mix(in srgb, ${cyberTeal} 9%, transparent) 0%, transparent 46%),
                 radial-gradient(circle at 88% 80%, color-mix(in srgb, ${ivoryGold} 10%, transparent) 0%, transparent 44%),
                 linear-gradient(135deg, #f4f8f7 0%, #f8fafc 50%, #f5f7fb 100%)`,
          }}
        />

        {/* Soft Top-Left Wing Nebula */}
        <motion.div
          className="absolute -top-24 -left-24 w-[32rem] h-[32rem] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${pakEmerald} 0%, ${accentColor} 52%, transparent 72%)`,
            opacity: (isDark ? 0.20 : 0.14) * scale,
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, 20, 0],
                  y: [0, 14, 0],
                }
          }
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Soft Right-Wing Pakistan Map Ambient Glow */}
        <motion.div
          className="absolute top-[10%] -right-20 w-[34rem] h-[34rem] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${pakEmerald} 0%, ${ivoryGold} 50%, transparent 72%)`,
            opacity: (isDark ? 0.22 : 0.15) * scale,
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, -18, 0],
                  y: [0, 16, 0],
                }
          }
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ====================================================================
          LAYER 2, 3 & 4: SVG UNIVERSE — ISLAMIC GEOMETRY, PAKISTAN MAP
          SILHOUETTE, NEURAL NETWORK, CRESCENT-STAR & PERIPHERAL LIGHT TRAILS
          ==================================================================== */}
      <svg
        viewBox="0 0 1440 1000"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="pakEmeraldIvoryTrail" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={pakEmerald} stopOpacity={(isDark ? 0.38 : 0.26) * scale} />
            <stop offset="35%" stopColor={accentColor} stopOpacity={(isDark ? 0.32 : 0.22) * scale} />
            <stop offset="70%" stopColor={pureIvory} stopOpacity={(isDark ? 0.34 : 0.22) * scale} />
            <stop offset="100%" stopColor={pakEmerald} stopOpacity={(isDark ? 0.38 : 0.26) * scale} />
          </linearGradient>

          <linearGradient id="pakGoldAccentWave" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={ivoryGold} stopOpacity={(isDark ? 0.34 : 0.24) * scale} />
            <stop offset="50%" stopColor={pakEmerald} stopOpacity={(isDark ? 0.30 : 0.20) * scale} />
            <stop offset="100%" stopColor={accentColor} stopOpacity={(isDark ? 0.34 : 0.24) * scale} />
          </linearGradient>

          <linearGradient id="pakistanMapFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={pakEmerald} stopOpacity={(isDark ? 0.16 : 0.10) * scale} />
            <stop offset="55%" stopColor={accentColor} stopOpacity={(isDark ? 0.12 : 0.08) * scale} />
            <stop offset="100%" stopColor={ivoryGold} stopOpacity={(isDark ? 0.14 : 0.09) * scale} />
          </linearGradient>

          <linearGradient id="pakistanMapStroke" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={pureIvory} stopOpacity={(isDark ? 0.55 : 0.42) * scale} />
            <stop offset="45%" stopColor={pakEmerald} stopOpacity={(isDark ? 0.62 : 0.48) * scale} />
            <stop offset="100%" stopColor={accentColor} stopOpacity={(isDark ? 0.55 : 0.42) * scale} />
          </linearGradient>

          {/* Subtle Islamic Girih & 8-Pointed Mughal Star Geometric Pattern */}
          <pattern
            id="pakGirihUniverse"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 120 0 L 0 0 0 120"
              fill="none"
              stroke={pakEmerald}
              strokeWidth="0.6"
              strokeOpacity={(isDark ? 0.10 : 0.07) * scale}
            />
            <polygon
              points="60,6 114,60 60,114 6,60"
              fill="none"
              stroke={accentColor}
              strokeWidth="0.55"
              strokeOpacity={(isDark ? 0.085 : 0.06) * scale}
            />
            <g
              transform="translate(60, 60)"
              fill="none"
              stroke={pakEmerald}
              strokeWidth="0.65"
              strokeOpacity={(isDark ? 0.12 : 0.09) * scale}
            >
              <rect x="-18" y="-18" width="36" height="36" />
              <rect x="-18" y="-18" width="36" height="36" transform="rotate(45)" />
              <circle cx="0" cy="0" r="6" stroke={ivoryGold} strokeOpacity={(isDark ? 0.18 : 0.13) * scale} />
            </g>
          </pattern>

          {/* Topographic Dot Matrix inside Pakistan Map Silhouette */}
          <pattern
            id="pakMapDotMatrix"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="7"
              cy="7"
              r="1.2"
              fill={pakEmerald}
              fillOpacity={(isDark ? 0.30 : 0.22) * scale}
            />
          </pattern>
        </defs>

        {/* 2A. Full-Canvas Islamic Geometric Girih Lattice */}
        <rect width="1440" height="1000" fill="url(#pakGirihUniverse)" />

        {/* 2B. Subtle Perspective Horizon Grid at Very Bottom */}
        <g
          stroke={pakEmerald}
          strokeOpacity={(isDark ? 0.11 : 0.08) * scale}
          strokeWidth="0.7"
          fill="none"
        >
          <line x1="0" y1="890" x2="1440" y2="890" />
          <line x1="0" y1="935" x2="1440" y2="935" />
          <line x1="0" y1="980" x2="1440" y2="980" />
          <line x1="720" y1="780" x2="80" y2="1000" />
          <line x1="720" y1="780" x2="420" y2="1000" />
          <line x1="720" y1="780" x2="720" y2="1000" />
          <line x1="720" y1="780" x2="1020" y2="1000" />
          <line x1="720" y1="780" x2="1360" y2="1000" />
        </g>

        {/* 2C. Upper-Left Ornate 12-Pointed Mughal & AI Rosette Mandala */}
        <g
          transform="translate(135, 195)"
          stroke={pakEmerald}
          strokeOpacity={(isDark ? 0.24 : 0.17) * scale}
          strokeWidth="1"
          fill="none"
        >
          <circle cx="0" cy="0" r="120" strokeDasharray="4 6" stroke={ivoryGold} strokeOpacity={(isDark ? 0.22 : 0.16) * scale} />
          <circle cx="0" cy="0" r="95" />
          <circle cx="0" cy="0" r="68" stroke={accentColor} strokeOpacity={(isDark ? 0.22 : 0.16) * scale} />
          {[0, 30, 60, 90, 120, 150].map((angle) => (
            <rect
              key={angle}
              x="-54"
              y="-54"
              width="108"
              height="108"
              transform={`rotate(${angle})`}
              stroke={angle % 60 === 0 ? pakEmerald : accentColor}
              strokeOpacity={(isDark ? 0.18 : 0.13) * scale}
            />
          ))}
          {/* Subtle Pakistan Crescent & Star inside Upper-Left Medallion */}
          <g
            fill={pureIvory}
            fillOpacity={(isDark ? 0.16 : 0.11) * scale}
            stroke={ivoryGold}
            strokeOpacity={(isDark ? 0.38 : 0.28) * scale}
            strokeWidth="1"
          >
            <path d="M 4 -22 A 24 24 0 1 0 24 14 A 18 18 0 1 1 4 -22 Z" />
            <polygon points="15,-13 17,-8 23,-8 18,-4 20,2 15,-2 10,2 12,-4 7,-8 13,-8" />
          </g>
        </g>

        {/* 2D. Left-Wing Futuristic AI Neural Network Constellation */}
        <g>
          {LEFT_WING_NEURAL_LINKS.map(([x1, y1, x2, y2], idx) => (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={idx % 2 === 0 ? pakEmerald : accentColor}
              strokeWidth="1"
              strokeOpacity={(isDark ? 0.22 : 0.16) * scale}
              strokeDasharray={idx % 3 === 0 ? '4 4' : undefined}
            />
          ))}
          {LEFT_WING_NEURAL_NODES.map((node, idx) => (
            <g key={idx}>
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r * 2}
                fill={idx % 2 === 0 ? pakEmerald : accentColor}
                fillOpacity={(isDark ? 0.15 : 0.10) * scale}
              />
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r}
                fill={idx % 3 === 0 ? ivoryGold : pakEmerald}
                fillOpacity={(isDark ? 0.55 : 0.45) * scale}
              />
            </g>
          ))}
        </g>

        {/* ==================================================================
            LAYER 3: SOPHISTICATED PAKISTAN MAP SILHOUETTE & AI NEURAL HUB
            Positioned on the outer right wing (X: 960..1330, Y: 130..550)
            ================================================================== */}
        <g
          transform={isCivicOrLegal ? 'translate(-10, 10)' : 'translate(0, 0)'}
        >
          <path
            d={pakistanMapPath}
            fill="url(#pakistanMapFill)"
            stroke={pakEmerald}
            strokeWidth="5"
            strokeOpacity={(isDark ? 0.10 : 0.07) * scale}
            strokeLinejoin="round"
          />

          <path
            d={pakistanMapPath}
            fill="url(#pakMapDotMatrix)"
            stroke="url(#pakistanMapStroke)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />

          <path
            d={pakistanMapPath}
            transform="translate(1155, 340) scale(0.92) translate(-1155, -340)"
            fill="none"
            stroke={ivoryGold}
            strokeWidth="0.85"
            strokeDasharray="5 6"
            strokeOpacity={(isDark ? 0.28 : 0.20) * scale}
            strokeLinejoin="round"
          />

          {/* Provincial AI Neural Network Connections inside Pakistan Map */}
          {PAKISTAN_MAP_LINKS.map(([x1, y1, x2, y2], idx) => (
            <g key={idx}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={idx % 2 === 0 ? pureIvory : pakEmerald}
                strokeWidth="1.2"
                strokeOpacity={(isDark ? 0.34 : 0.25) * scale}
              />
              {!prefersReducedMotion && idx % 2 === 0 && (
                <motion.circle
                  r="2.2"
                  fill={ivoryGold}
                  animate={{
                    cx: [x1, x2, x1],
                    cy: [y1, y2, y1],
                    opacity: [0.15, 0.65, 0.15],
                  }}
                  transition={{
                    duration: 7 + (idx % 3) * 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: idx * 0.4,
                  }}
                />
              )}
            </g>
          ))}

          {/* Provincial Hub Nodes & Subtle Native Script Labels */}
          {PAKISTAN_MAP_HUBS.map((hub) => (
            <g key={hub.id}>
              <circle
                cx={hub.cx}
                cy={hub.cy}
                r={hub.primary ? 8 : 6}
                fill="none"
                stroke={hub.primary ? ivoryGold : pakEmerald}
                strokeWidth="1"
                strokeOpacity={(isDark ? 0.36 : 0.26) * scale}
              />
              <circle
                cx={hub.cx}
                cy={hub.cy}
                r={hub.primary ? 3.8 : 2.8}
                fill={hub.primary ? ivoryGold : pureIvory}
                fillOpacity={(isDark ? 0.72 : 0.60) * scale}
                stroke={pakEmerald}
                strokeWidth="1.2"
              />
              <text
                x={hub.cx + (hub.id === 'uet' || hub.id === 'gwd' ? -10 : 10)}
                y={hub.cy + 3.5}
                textAnchor={hub.id === 'uet' || hub.id === 'gwd' ? 'end' : 'start'}
                fill={isDark ? '#cbd5e1' : '#065f46'}
                fillOpacity={(isDark ? 0.44 : 0.36) * scale}
                fontSize="10"
                fontWeight="600"
                className="font-urdu"
              >
                {hub.script}
              </text>
            </g>
          ))}
        </g>

        {/* ==================================================================
            LAYER 4: PERIPHERAL EMERALD & IVORY LIGHT TRAILS
            Routed along the upper canopy and lower horizon so they never
            cross behind the central hero headline or search box.
            ================================================================== */}
        <motion.path
          d="M -80 115 C 240 45, 520 155, 840 95 C 1100 45, 1290 135, 1520 85"
          fill="none"
          stroke="url(#pakEmeraldIvoryTrail)"
          strokeWidth="1.8"
          strokeLinecap="round"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  d: [
                    'M -80 115 C 240 45, 520 155, 840 95 C 1100 45, 1290 135, 1520 85',
                    'M -80 95 C 240 145, 520 55, 840 120 C 1100 155, 1290 65, 1520 105',
                    'M -80 115 C 240 45, 520 155, 840 95 C 1100 45, 1290 135, 1520 85',
                  ],
                }
          }
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.path
          d="M -80 845 C 260 775, 560 905, 880 825 C 1140 765, 1320 885, 1520 815"
          fill="none"
          stroke="url(#pakGoldAccentWave)"
          strokeWidth="1.8"
          strokeLinecap="round"
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  d: [
                    'M -80 845 C 260 775, 560 905, 880 825 C 1140 765, 1320 885, 1520 815',
                    'M -80 825 C 260 885, 560 785, 880 845 C 1140 885, 1320 795, 1520 835',
                    'M -80 845 C 260 775, 560 905, 880 825 C 1140 765, 1320 885, 1520 815',
                  ],
                }
          }
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Lower-Right Ornate Islamic Geometric Medallion */}
        <g
          transform="translate(1325, 825)"
          stroke={accentColor}
          strokeOpacity={(isDark ? 0.20 : 0.14) * scale}
          strokeWidth="1"
          fill="none"
        >
          <circle cx="0" cy="0" r="95" strokeDasharray="5 5" />
          <circle cx="0" cy="0" r="66" stroke={pakEmerald} strokeOpacity={(isDark ? 0.24 : 0.16) * scale} />
          <polygon points="0,-70 18,-18 70,0 18,18 0,70 -18,18 -70,0 -18,-18" />
          <polygon
            points="0,-70 18,-18 70,0 18,18 0,70 -18,18 -70,0 -18,-18"
            transform="rotate(45)"
            stroke={ivoryGold}
            strokeOpacity={(isDark ? 0.22 : 0.15) * scale}
          />
        </g>
      </svg>

      {/* ====================================================================
          LAYER 5: SUBTLE CALLIGRAPHIC WATERMARKS ON OUTER WINGS
          (Urdu, Punjabi, Sindhi, Pashto, Balochi — unboxed, secondary opacity)
          ==================================================================== */}
      <div className="absolute inset-0">
        {CALLIGRAPHIC_MEDALLIONS.map((item) => {
          const color = getToneColor(item.tone);
          return (
            <motion.div
              key={item.id}
              style={{
                top: item.top,
                left: item.left,
                color,
                opacity: (isDark ? 0.28 : 0.20) * scale,
              }}
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: [0, -8, 0],
                    }
              }
              transition={{
                duration: item.duration,
                delay: item.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`absolute flex flex-col items-center ${
                item.hideOnMobile ? 'hidden xl:flex' : 'hidden lg:flex'
              }`}
            >
              <span
                className={`font-urdu font-bold tracking-wide leading-normal select-none ${item.size}`}
              >
                {item.script}
              </span>
              <span className="font-urdu text-[10px] font-medium opacity-75 -mt-1">
                {item.subtitle}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* ====================================================================
          LAYER 6: SUBTLE PERIPHERAL DIGITAL PARTICLES
          ==================================================================== */}
      <div className="absolute inset-0">
        {DIGITAL_PARTICLES.map((p) => {
          const c = getToneColor(p.tone as CalligraphicItem['tone']);
          return (
            <motion.div
              key={p.id}
              style={{
                top: p.top,
                left: p.left,
                width: p.size,
                height: p.size,
                backgroundColor: c,
                opacity: (isDark ? 0.35 : 0.25) * scale,
              }}
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: [0, -12, 0],
                      opacity: isDark
                        ? [0.2 * scale, 0.45 * scale, 0.2 * scale]
                        : [0.15 * scale, 0.32 * scale, 0.15 * scale],
                    }
              }
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute rounded-full hidden sm:block"
            />
          );
        })}
      </div>

      {/* ====================================================================
          LAYER 7: CENTRAL CONTENT READABILITY SHIELD
          Creates a smooth, protective translucent zone across the central
          content column so headings, paragraphs, inputs, and buttons have
          effortless WCAG AA/AAA readability while keeping the outer wings
          rich with Pakistani calligraphy, map hubs, and geometric art.
          ==================================================================== */}
      <div
        className="absolute inset-0 transition-colors duration-300"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 58% 58% at 50% 42%, rgba(6, 13, 26, 0.88) 0%, rgba(6, 13, 26, 0.64) 52%, rgba(6, 13, 26, 0.18) 82%, transparent 100%)'
            : 'radial-gradient(ellipse 58% 58% at 50% 42%, rgba(248, 250, 252, 0.92) 0%, rgba(248, 250, 252, 0.68) 52%, rgba(248, 250, 252, 0.20) 82%, transparent 100%)',
        }}
      />
    </div>
  );
};
