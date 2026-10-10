import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface AnimatedBackgroundProps {
  isDark?: boolean;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ isDark = false }) => {
  const prefersReducedMotion = useReducedMotion();

  // Floating Pakistani language labels
  const languages = [
    { name: 'اردو', label: 'Urdu', top: '16%', left: '8%', delay: 0 },
    { name: 'پنجابی', label: 'Punjabi', top: '38%', left: '12%', delay: 1.2 },
    { name: 'سنڌي', label: 'Sindhi', top: '64%', left: '7%', delay: 2.1 },
    { name: 'پښتو', label: 'Pashto', top: '22%', right: '34%', delay: 0.8 },
    { name: 'بلوچی', label: 'Balochi', top: '72%', right: '32%', delay: 1.7 },
  ];

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* 1. Subtle Ambient Atmosphere Gradients */}
      <div className="absolute inset-0">
        <div
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl transition-opacity duration-700 ${
            isDark ? 'bg-emerald-500/15' : 'bg-emerald-300/25'
          }`}
        />
        <div
          className={`absolute top-1/2 -right-32 w-[32rem] h-[32rem] rounded-full blur-3xl transition-opacity duration-700 ${
            isDark ? 'bg-teal-500/15' : 'bg-teal-200/30'
          }`}
        />
        <div
          className={`absolute -bottom-32 left-1/3 w-[30rem] h-[30rem] rounded-full blur-3xl transition-opacity duration-700 ${
            isDark ? 'bg-emerald-600/12' : 'bg-emerald-200/25'
          }`}
        />
      </div>

      {/* 2. Geographically Accurate Pakistan Map Artwork (Right Side of Screen, ~22% intensity) */}
      <div className="hidden md:block absolute right-0 lg:right-4 top-1/2 -translate-y-1/2 w-[460px] lg:w-[560px] xl:w-[640px] pointer-events-none opacity-25 dark:opacity-30 transition-opacity">
        <svg
          viewBox="0 0 750 720"
          className="w-full h-auto text-emerald-500 drop-shadow-[0_0_18px_rgba(16,185,129,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="bgMapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#059669" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.15" />
            </linearGradient>
            <filter id="bgMapGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="bgFlagClip">
              <circle cx="535" cy="195" r="70" />
            </clipPath>
          </defs>

          {/* Pakistan Flag Roundel in Northern Region */}
          <g clipPath="url(#bgFlagClip)">
            <circle cx="535" cy="195" r="70" fill="#064e3b" />
            <rect x="465" y="125" width="34" height="140" fill="#ffffff" opacity="0.4" />
          </g>
          <circle
            cx="535"
            cy="195"
            r="70"
            fill="none"
            stroke="#34d399"
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />

          {/* Crescent & Star */}
          <path
            d="M 556 156 A 36 36 0 1 0 556 234 A 28 28 0 1 1 556 156 Z"
            fill="#ffffff"
            filter="url(#bgMapGlow)"
          />
          <polygon
            points="570,168 574,177 583,178 576,184 578,193 570,188 562,193 564,184 557,178 566,177"
            fill="#ffffff"
            filter="url(#bgMapGlow)"
          />

          {/* Accurate Pakistan Silhouette Boundary */}
          <path
            d="M 510 60
               C 535 70, 560 85, 605 125
               C 625 145, 635 160, 620 185
               C 605 210, 580 230, 555 265
               C 560 285, 565 305, 570 325
               C 580 340, 585 355, 575 375
               C 565 390, 550 405, 535 425
               C 515 445, 500 465, 485 490
               C 470 515, 460 535, 455 555
               C 465 575, 475 595, 485 620
               C 495 640, 505 660, 505 668
               C 490 672, 465 670, 435 675
               C 400 682, 375 688, 350 678
               C 335 670, 320 662, 295 665
               C 265 668, 240 672, 210 672
               C 175 672, 145 678, 110 670
               C 105 645, 110 605, 115 565
               C 118 525, 122 485, 125 445
               C 145 435, 175 425, 210 412
               C 235 402, 255 398, 270 385
               C 285 370, 295 355, 310 335
               C 325 315, 335 295, 335 280
               C 320 270, 290 262, 280 248
               C 290 238, 315 232, 335 225
               C 345 215, 355 198, 365 180
               C 375 160, 390 140, 410 110
               C 430 85, 460 70, 510 60 Z"
            fill="url(#bgMapGrad)"
            stroke="#34d399"
            strokeWidth="2.5"
            filter="url(#bgMapGlow)"
          />

          {/* Major Pakistani City Markers */}
          {[
            { name: 'Islamabad', cx: 475, cy: 235 },
            { name: 'Lahore', cx: 565, cy: 345 },
            { name: 'Karachi', cx: 350, cy: 675 },
            { name: 'Peshawar', cx: 375, cy: 210 },
            { name: 'Quetta', cx: 265, cy: 395 },
            { name: 'Gilgit', cx: 510, cy: 120 },
          ].map((city, idx) => (
            <g key={`bg-city-${idx}`}>
              <circle
                cx={city.cx}
                cy={city.cy}
                r="4.5"
                fill="#34d399"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text
                x={city.cx + 8}
                y={city.cy + 3}
                fill="#a7f3d0"
                fontSize="12"
                fontWeight="700"
              >
                {city.name}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* 3. Floating Pakistani Language Badges */}
      <div className="hidden sm:block absolute inset-0">
        {languages.map((lang, idx) => (
          <motion.div
            key={`lang-badge-${idx}`}
            className={`absolute px-3 py-1.5 rounded-2xl border backdrop-blur-md shadow-sm flex items-center gap-2 pointer-events-none ${
              isDark
                ? 'bg-slate-900/60 border-emerald-500/25 text-emerald-300'
                : 'bg-white/70 border-emerald-200/60 text-emerald-800'
            }`}
            style={{
              top: lang.top,
              left: lang.left,
              right: lang.right,
            }}
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    y: [-6, 6, -6],
                    opacity: [0.65, 0.9, 0.65],
                  }
            }
            transition={{
              duration: 5 + idx * 0.8,
              delay: lang.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span className="font-arabic font-bold text-sm text-emerald-400">
              {lang.name}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-75">
              {lang.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* 4. Floating Animated Micro-Particles */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0">
          {[...Array(14)].map((_, i) => {
            const size = (i % 3) * 1.5 + 2.5;
            const left = `${(i * 17) % 92 + 4}%`;
            const top = `${(i * 23) % 88 + 6}%`;
            const duration = 8 + (i % 4) * 2;
            const delay = (i % 6) * 0.7;

            return (
              <motion.span
                key={`particle-${i}`}
                className={`absolute rounded-full pointer-events-none ${
                  isDark
                    ? 'bg-emerald-400/25 shadow-[0_0_6px_rgba(52,211,153,0.35)]'
                    : 'bg-emerald-500/20'
                }`}
                style={{
                  width: size,
                  height: size,
                  left,
                  top,
                }}
                animate={{
                  y: [-10, 10, -10],
                  x: [-6, 6, -6],
                  opacity: [0.2, 0.5, 0.2],
                  scale: [0.9, 1.15, 0.9],
                }}
                transition={{
                  duration,
                  delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
        </div>
      )}

      {/* 5. Soft Flowing Bottom Wave Ribbons */}
      <div className="absolute bottom-0 left-0 right-0 h-28 sm:h-36 overflow-hidden pointer-events-none opacity-25 dark:opacity-20">
        <svg
          viewBox="0 0 1440 200"
          className="w-full h-full preserve-3d"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M0,90L60,105C120,120,240,150,360,140C480,130,600,90,720,85C840,80,960,115,1080,125C1200,135,1320,120,1380,110L1440,100L1440,200L1380,200C1320,200,1200,200,1080,200C960,200,840,200,720,200C600,200,480,200,360,200C240,200,120,200,60,200L0,200Z"
            fill={isDark ? '#064e3b' : '#a7f3d0'}
            fillOpacity={isDark ? '0.4' : '0.5'}
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    d: [
                      'M0,90L60,105C120,120,240,150,360,140C480,130,600,90,720,85C840,80,960,115,1080,125C1200,135,1320,120,1380,110L1440,100L1440,200L0,200Z',
                      'M0,105L60,95C120,85,240,100,360,115C480,130,600,145,720,135C840,125,960,90,1080,100C1200,110,1320,135,1380,130L1440,125L1440,200L0,200Z',
                      'M0,90L60,105C120,120,240,150,360,140C480,130,600,90,720,85C840,80,960,115,1080,125C1200,135,1320,120,1380,110L1440,100L1440,200L0,200Z',
                    ],
                  }
            }
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </svg>
      </div>
    </div>
  );
};
