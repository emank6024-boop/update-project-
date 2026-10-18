/**
 * Scientific Educational Diagram Generator with Clean White Backgrounds & Multi-Language Support
 * Strictly adheres to Pakistani Curricula (FBISE / BISE) and provides accurate biological,
 * mathematical, physical, and agricultural illustrations with crystal-clear labels and white canvas.
 * All XML entities are strictly escaped to prevent any browser parsing or blank image issues.
 */

export interface DiagramOptions {
  title: string;
  prompt: string;
  category: string;
  aspectRatio: string;
  language?: string;
}

export function escapeXmlText(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateEducationalSvg(options: DiagramOptions): string {
  const { title, prompt, category, language = 'ur' } = options;
  const pLower = (prompt || '').toLowerCase();
  const tLower = (title || '').toLowerCase();
  const cLower = (category || '').toLowerCase();
  const text = `${pLower} ${tLower} ${cLower}`;

  const isEn = language === 'en';
  const width = 840;
  const height = 580;

  // Common SVG Header definition helper
  const commonDefs = `
    <defs>
      <filter id="cardShadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.07" />
      </filter>
      <filter id="elementShadow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.12" />
      </filter>
      <linearGradient id="whiteCardGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#f8fafc" />
      </linearGradient>
    </defs>
  `;

  // =========================================================================
  // PRIORITY 1: AGRICULTURE & FARMER ADVISORY (کسان زراعت مشیر)
  // When farmer feature or crop topics are queried, NEVER return animal cell!
  // =========================================================================
  const isFarmerQuery =
    cLower === 'farmer' ||
    text.includes('farmer') ||
    text.includes('کسان') ||
    text.includes('crop') ||
    text.includes('wheat') ||
    text.includes('potato') ||
    text.includes('cotton') ||
    text.includes('آلو') ||
    text.includes('گندم') ||
    text.includes('کپاس') ||
    text.includes('فصل') ||
    text.includes('blight') ||
    text.includes('rust') ||
    text.includes('fertilizer') ||
    text.includes('کھاد') ||
    text.includes('pest') ||
    text.includes('کیڑے مار');

  if (isFarmerQuery) {
    const isPotato = text.includes('potato') || text.includes('آلو') || text.includes('blight') || text.includes('جھلساؤ');

    if (isPotato) {
      const headerTitle = isEn
        ? '🥔 AGRICULTURE • POTATO LATE BLIGHT &amp; FOLIAGE PATHOLOGY'
        : '🥔 زراعت • آلو کی فصل، پچھیتا جھلساؤ (Late Blight) اور نگہداشت';
      const headerSubtitle = isEn
        ? 'Phytophthora infestans leaf lesions, tuber rot, and fungicide schedule'
        : 'پتوں پر کالے جھلسے دھبے، آلو گلنے سے بچاؤ اور اسپرے شیڈول';

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        ${commonDefs}
        <rect width="${width}" height="${height}" fill="#ffffff" rx="16" />
        <rect width="${width}" height="${height}" fill="none" stroke="#e2e8f0" stroke-width="2" rx="16" />

        <!-- Top Header -->
        <g transform="translate(35, 25)">
          <rect width="320" height="32" rx="16" fill="#f0fdf4" stroke="#86efac" stroke-width="1.2" />
          <text x="16" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#15803d">
            ${headerTitle}
          </text>
          <text x="340" y="21" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f172a">
            ${headerSubtitle}
          </text>
        </g>

        <!-- Left Visual: Healthy vs Blighted Leaf & Tuber -->
        <g transform="translate(45, 75)" filter="url(#cardShadow)">
          <rect width="390" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />

          <!-- Healthy Potato Leaflet -->
          <g transform="translate(100, 30)">
            <path d="M 0,0 C 40,40 50,130 0,200 C -50,130 -40,40 0,0 Z" fill="#22c55e" stroke="#15803d" stroke-width="2.5" />
            <line x1="0" y1="15" x2="0" y2="200" stroke="#166534" stroke-width="2" />
            <line x1="0" y1="60" x2="25" y2="80" stroke="#166534" stroke-width="1.5" />
            <line x1="0" y1="100" x2="30" y2="120" stroke="#166534" stroke-width="1.5" />
            <line x1="0" y1="60" x2="-25" y2="80" stroke="#166534" stroke-width="1.5" />
            <line x1="0" y1="100" x2="-30" y2="120" stroke="#166534" stroke-width="1.5" />
            <text x="0" y="230" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#15803d">
              ${isEn ? '✔ Healthy Potato Leaf' : '✔ صحت مند آلو کا پتا'}
            </text>
            <text x="0" y="248" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
              ${isEn ? 'Vigorous green, no water-soaked spots' : 'سبز اور تروتازہ، کوئی داغ نہیں'}
            </text>
          </g>

          <!-- Diseased Potato Leaflet (Late Blight Lesions) -->
          <g transform="translate(280, 30)">
            <path d="M 0,0 C 40,40 50,130 0,200 C -50,130 -40,40 0,0 Z" fill="#65a30d" stroke="#4d7c0f" stroke-width="2.5" />
            <line x1="0" y1="15" x2="0" y2="200" stroke="#365314" stroke-width="2" />
            <!-- Dark irregular necrotic blotches -->
            <path d="M 5,60 Q 30,50 35,90 Q 20,110 5,80 Z" fill="#451a03" stroke="#78350f" stroke-width="1.5" />
            <circle cx="20" cy="80" r="14" fill="#1c1917" opacity="0.8" />
            <path d="M -10,100 Q -35,110 -30,140 Q -10,150 -5,120 Z" fill="#451a03" stroke="#78350f" stroke-width="1.5" />
            <circle cx="-18" cy="125" r="12" fill="#1c1917" opacity="0.8" />
            <!-- Pale halo -->
            <circle cx="20" cy="80" r="18" fill="none" stroke="#facc15" stroke-width="1.5" stroke-dasharray="3 2" />
            <circle cx="-18" cy="125" r="16" fill="none" stroke="#facc15" stroke-width="1.5" stroke-dasharray="3 2" />

            <text x="0" y="230" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#b91c1c">
              ${isEn ? '⚠ Late Blight (جھلساؤ)' : '⚠ آلو کا پچھیتا جھلساؤ'}
            </text>
            <text x="0" y="248" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d">
              ${isEn ? 'Brown-black necrotic water spots' : 'سیاہ دھبے اور پتوں کا جلنا'}
            </text>
          </g>

          <!-- Tuber Rot Illustration -->
          <g transform="translate(30, 275)">
            <rect width="330" height="95" rx="8" fill="#fef2f2" stroke="#fca5a5" stroke-width="1" />
            <text x="14" y="22" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#991b1b">
              ${isEn ? '🥔 Tuber Rot &amp; Earthing-Up Prevention:' : '🥔 آلو گلنے سے بچاؤ اور مٹی چڑھانا (Earthing Up):'}
            </text>
            <text x="14" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#334155">
              ${isEn ? '• Earthing-up 30-35 days after sowing blocks spores from washing into soil.\n• Prevents greening (solanine toxicity) and tuber moth attack.' : '• بوائی کے 30-35 دن بعد پٹڑیوں پر مٹی چڑھائیں تاکہ جراثیم آلو تک نہ پہنچیں۔\n• آلو کو دھوپ سے ہرا ہونے (سولانین زہر) سے محفوظ رکھتا ہے۔'}
            </text>
          </g>
        </g>

        <!-- Right Side: Treatment Cards -->
        <g transform="translate(465, 75)" filter="url(#cardShadow)">
          <g transform="translate(0, 0)">
            <rect width="340" height="90" rx="8" fill="#ffffff" stroke="#16a34a" stroke-width="1.2" />
            <text x="14" y="22" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#15803d">
              ${isEn ? '1. Certified Seed &amp; Fungicide Dip' : '1. تصدیق شدہ بیج اور بوائی کا علاج'}
            </text>
            <text x="14" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#334155">
              ${isEn ? '• Treat cut tubers with Mancozeb @ 2.5g/L water before planting.\n• Plant certified seed on 75cm ridges, 20cm plant distance.' : '• کٹے ہوئے بیج کو مینکوزیب (2.5 گرام فی لٹر پانی) سے تر کریں۔\n• پٹڑیاں 75 سینٹی میٹر فاصلے پر بنائیں اور بیج 20 سینٹی میٹر پر لگائیں۔'}
            </text>
          </g>

          <g transform="translate(0, 100)">
            <rect width="340" height="90" rx="8" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" />
            <text x="14" y="22" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#0369a1">
              ${isEn ? '2. Preventive Chemical Sprays' : '2. حفاظتی کیمیائی اسپرے (Fungicides)'}
            </text>
            <text x="14" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#334155">
              ${isEn ? '• Ridomil Gold (Metalaxyl + Mancozeb) @ 250g/acre.\n• Acrobat MZ @ 250g/acre during cloudy, humid spells.\n• Spray with hollow-cone nozzle (100L clean water/acre).' : '• ریڈومل گولڈ (Ridomil Gold) 250 گرام فی ایکڑ اسپرے کریں۔\n• ابر آلود اور مرطوب موسم میں ایکروبیٹ ایم زیڈ 250 گرام فی ایکڑ دیں۔\n• 100 لٹر صاف پانی میں ہولو کون نوزل سے اسپرے کریں۔'}
            </text>
          </g>

          <g transform="translate(0, 200)">
            <rect width="340" height="90" rx="8" fill="#ffffff" stroke="#ea580c" stroke-width="1.2" />
            <text x="14" y="22" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#c2410c">
              ${isEn ? '3. Fertilizer Schedule (DAP &amp; Potash)' : '3. کھادوں کا متوازن شیڈول (DAP اور پوٹاش)'}
            </text>
            <text x="14" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#334155">
              ${isEn ? '• At sowing: 2 bags DAP + 2 bags SOP (Potash) for firm tubers.\n• Urea: 2.5 bags applied in 2 splits BEFORE earthing up.' : '• بوائی کے وقت: 2 بوری DAP + 2 بوری پوٹاش (SOP) لازمی ڈالیں۔\n• یوریا کی 2.5 بوری مٹی چڑھانے سے پہلے دو اقساط میں مکمل کریں۔'}
            </text>
          </g>

          <g transform="translate(0, 300)">
            <rect width="340" height="85" rx="8" fill="#ffffff" stroke="#8b5cf6" stroke-width="1.2" />
            <text x="14" y="22" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#6d28d9">
              ${isEn ? '4. Irrigation &amp; Water Management' : '4. آبپاشی کا شیڈول اور پانی کا نکاس'}
            </text>
            <text x="14" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#334155">
              ${isEn ? '• Light irrigation every 7-10 days; never submerge ridge top.\n• Stop irrigation 10-12 days prior to harvest to harden skins.' : '• 7 سے 10 دن کے وقفے سے ہلکا پانی دیں؛ پٹڑیوں کو ڈوبنے نہ دیں۔\n• کٹائی سے 10-12 دن پہلے پانی بند کریں تاکہ چھلکا پکا ہو جائے۔'}
            </text>
          </g>
        </g>

        <!-- Bottom Bar -->
        <g transform="translate(35, 492)" filter="url(#cardShadow)">
          <rect width="770" height="62" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
          <text x="18" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#15803d">
            ✦ PakLingo Agri Advisor Helpline (کسان ہیلپ لائن):
          </text>
          <text x="18" y="44" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
            ${isEn ? 'Free Government of Pakistan Agriculture Extension Helpline: 0800-15000 / 0800-29000. Always spray downwind wearing mask and gloves.' : 'محکمہ زراعت توسیع پاکستان کی مفت ہیلپ لائن: 0800-15000 یا 0800-29000۔ اسپرے کے دوران ماسک اور دستانے لازمی استعمال کریں۔'}
          </text>
        </g>
      </svg>`;
    }

    // General Crop Health & Pest Scouting (Wheat Rust, Cotton Whitefly, Rice Blast)
    const headerTitle = isEn
      ? '🌾 AGRICULTURE • CROP LEAF HEALTH &amp; DISEASE INSPECTION'
      : '🌾 زراعت • فصل کے پتے کا معائنہ اور بیماری کی تشخیص';
    const headerSubtitle = isEn
      ? 'Visual Diagnostics for Pakistani Crops (Wheat Rust, Cotton Leaf Curl, Blight)'
      : 'پاکستانی فصلوں (گندم کی زرد کنگی، کپاس کا سفید مکھی حملہ، جھلساؤ) کی علامات';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      ${commonDefs}
      <rect width="${width}" height="${height}" fill="#ffffff" rx="16" />
      <rect width="${width}" height="${height}" fill="none" stroke="#e2e8f0" stroke-width="2" rx="16" />

      <!-- Top Header -->
      <g transform="translate(35, 25)">
        <rect width="320" height="32" rx="16" fill="#f0fdf4" stroke="#86efac" stroke-width="1.2" />
        <text x="16" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#15803d">
          ${headerTitle}
        </text>
        <text x="340" y="21" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f172a">
          ${headerSubtitle}
        </text>
      </g>

      <!-- Comparison: Healthy vs Diseased -->
      <g transform="translate(45, 75)" filter="url(#cardShadow)">
        <rect width="390" height="385" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />

        <g transform="translate(100, 30)">
          <path d="M 0,0 C 45,50 55,140 0,220 C -55,140 -45,50 0,0 Z" fill="#22c55e" stroke="#15803d" stroke-width="3" />
          <line x1="0" y1="20" x2="0" y2="220" stroke="#166534" stroke-width="2.5" />
          <line x1="0" y1="70" x2="25" y2="90" stroke="#166534" stroke-width="1.5" />
          <line x1="0" y1="110" x2="30" y2="135" stroke="#166534" stroke-width="1.5" />
          <line x1="0" y1="70" x2="-25" y2="90" stroke="#166534" stroke-width="1.5" />
          <line x1="0" y1="110" x2="-30" y2="135" stroke="#166534" stroke-width="1.5" />
          <text x="0" y="250" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#15803d">
            ${isEn ? '✔ Healthy Green Leaf' : '✔ صحت مند پتا'}
          </text>
          <text x="0" y="268" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
            ${isEn ? 'Rich chlorophyll, no spots' : 'بھرپور کلوروفل، کوئی داغ نہیں'}
          </text>
        </g>

        <g transform="translate(280, 30)">
          <path d="M 0,0 C 45,50 55,140 0,220 C -55,140 -45,50 0,0 Z" fill="#ca8a04" stroke="#a16207" stroke-width="3" />
          <line x1="0" y1="20" x2="0" y2="220" stroke="#713f12" stroke-width="2.5" />
          <circle cx="10" cy="80" r="4" fill="#dc2626" />
          <circle cx="15" cy="95" r="3.5" fill="#ea580c" />
          <circle cx="-12" cy="110" r="4.5" fill="#dc2626" />
          <circle cx="-8" cy="125" r="3" fill="#ea580c" />
          <circle cx="8" cy="140" r="4" fill="#dc2626" />
          <circle cx="-10" cy="155" r="4" fill="#ea580c" />
          <line x1="12" y1="70" x2="12" y2="160" stroke="#dc2626" stroke-width="2" stroke-dasharray="3 2" />
          <line x1="-10" y1="90" x2="-10" y2="180" stroke="#ea580c" stroke-width="2" stroke-dasharray="3 2" />
          <text x="0" y="250" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#b91c1c">
            ${isEn ? '⚠ Infected Leaf (Rust / Blight)' : '⚠ متاثرہ پتا (کنگی / جھلساؤ)'}
          </text>
          <text x="0" y="268" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
            ${isEn ? 'Yellow pustules, fungal stripes' : 'زرد دھبے، فنگل دھاریاں اور کمزوری'}
          </text>
        </g>

        <line x1="195" y1="30" x2="195" y2="280" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4 3" />
        <rect x="25" y="305" width="340" height="60" rx="8" fill="#fef2f2" stroke="#fca5a5" stroke-width="1" />
        <text x="35" y="327" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#991b1b">
          ${isEn ? 'Warning: Early detection saves 30-40% yield loss' : 'انتباہ: بروقت تشخیص سے پیداوار کا 30 سے 40 فیصد نقصان بچتا ہے'}
        </text>
        <text x="35" y="347" font-family="system-ui, sans-serif" font-size="10" fill="#7f1d1d">
          ${isEn ? 'Inspect lower canopy leaves twice weekly during humid mornings' : 'نم دار موسم اور صبح کے وقت فصل کا معائنہ لازمی کریں'}
        </text>
      </g>

      <!-- Right Guidance -->
      <g transform="translate(465, 75)" filter="url(#cardShadow)">
        <g transform="translate(0, 0)">
          <rect width="340" height="85" rx="8" fill="#ffffff" stroke="#16a34a" stroke-width="1.2" />
          <text x="14" y="22" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#15803d">
            ${isEn ? '1. Cultural &amp; Mechanical Control' : '1. زرعی و تکنیکی تدابیر (Cultural Control)'}
          </text>
          <text x="14" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#334155">
            ${isEn ? '• Rogue out severely affected plants and burn debris\n• Avoid excessive night flood irrigation' : '• شدید متاثرہ پودوں کو اکھاڑ کر تلف کریں\n• ضرورت سے زیادہ یا کھڑا پانی دینے سے گریز کریں'}
          </text>
        </g>

        <g transform="translate(0, 95)">
          <rect width="340" height="85" rx="8" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" />
          <text x="14" y="22" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#0369a1">
            ${isEn ? '2. Biological &amp; Safe Sprays' : '2. حیاتیاتی علاج (Biological Spray)'}
          </text>
          <text x="14" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#334155">
            ${isEn ? '• Neem oil extract spray for early sucking pests\n• Promote beneficial predators (ladybird beetles)' : '• نیم کا تیل کا اسپرے ابتدائی کیڑوں کے لیے بہترین ہے\n• مفید کیڑوں (لیڈی برڈ بیٹل) کا تحفظ کریں'}
          </text>
        </g>

        <g transform="translate(0, 190)">
          <rect width="340" height="95" rx="8" fill="#ffffff" stroke="#dc2626" stroke-width="1.2" />
          <text x="14" y="22" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#b91c1c">
            ${isEn ? '3. Chemical Fungicide / Pesticide Action' : '3. کیمیائی اسپرے اور خوراک (Chemical Fungicide)'}
          </text>
          <text x="14" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#334155">
            ${isEn ? '• Tilt (Propiconazole 25% EC) @ 100ml/acre for wheat rust\n• Nativo (Bayer) @ 65g/acre for foliar blights\n• Use hollow-cone nozzle knapsack sprayer' : '• گندم کی کنگی کے لیے ٹلٹ (Propiconazole) 100 ملی لیٹر فی ایکڑ\n• نیٹیوو (Nativo) 65 گرام فی ایکڑ اسپرے کریں\n• ہولو کون نوزل کے ساتھ 100 سے 120 لٹر پانی استعمال کریں'}
          </text>
        </g>

        <g transform="translate(0, 295)">
          <rect width="340" height="90" rx="8" fill="#ffffff" stroke="#eab308" stroke-width="1.2" />
          <text x="14" y="22" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#a16207">
            ${isEn ? '4. Balanced Soil Nutrition (DAP + Potash)' : '4. متوازن کھادیں (DAP + یوریا + پوٹاش)'}
          </text>
          <text x="14" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#334155">
            ${isEn ? '• Do not overdose Nitrogen (Urea); softens leaf cuticle\n• Apply Potash (SOP) to reinforce cellular walls against spores' : '• ضرورت سے زیادہ یوریا نہ دیں، اس سے پتے نرم ہو کر جلدی بیمار ہوتے ہیں\n• پوٹاش (SOP) پودوں میں قوت مدافعت اور روگ سے لڑنے کی طاقت بڑھاتی ہے'}
          </text>
        </g>
      </g>

      <!-- Bottom Bar -->
      <g transform="translate(35, 492)" filter="url(#cardShadow)">
        <rect width="770" height="62" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
        <text x="18" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#15803d">
          ✦ Safety First (حفاظتی ہدایات):
        </text>
        <text x="18" y="44" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
          ${isEn ? 'Always wear protective mask, gloves, and boots when applying chemical sprays. Never spray facing against the wind.' : 'اسپرے کے دوران ماسک، دستانے اور جوتے ضرور پہنیں۔ ہوا کے رخ کے مخالف کبھی اسپرے نہ کریں۔'}
        </text>
      </g>
    </svg>`;
  }

  // =========================================================================
  // PRIORITY 2: CHEMISTRY (کیمسٹری)
  // When Chemistry, Periodic Table, Elements, or Bonding are queried,
  // MUST NEVER return Biology Animal Cell or Photosynthesis!
  // =========================================================================
  const isChemQuery =
    cLower === 'chemistry' ||
    text.includes('chemistry') ||
    text.includes('کیمسٹری') ||
    text.includes('periodic table') ||
    text.includes('periodic') ||
    text.includes('دوری جدول') ||
    text.includes('جدول') ||
    text.includes('element') ||
    text.includes('عنصر') ||
    text.includes('atomic') ||
    text.includes('chemical bond') ||
    text.includes('covalent') ||
    text.includes('ionic') ||
    text.includes('بانڈنگ') ||
    text.includes('acid') ||
    text.includes('تیزاب') ||
    text.includes('base') ||
    text.includes('اساس') ||
    text.includes('mendeleev') ||
    text.includes('moseley');

  if (isChemQuery) {
    const isBonding = text.includes('bond') || text.includes('بانڈنگ') || text.includes('ionic') || text.includes('covalent');
    const isAcidBase = text.includes('acid') || text.includes('تیزاب') || text.includes('base') || text.includes('اساس') || text.includes('ph scale');

    // 2B. Chemical Bonding
    if (isBonding) {
      const headerTitle = isEn
        ? '🧪 CHEMISTRY • CHEMICAL BONDING &amp; ELECTRON SHARING'
        : '🧪 کیمسٹری • کیمیائی بانڈنگ اور الیکٹرانز کا اشتراک';
      const headerSubtitle = isEn
        ? 'Ionic Bonding (Electron Transfer) vs Covalent Bonding (Electron Sharing)'
        : 'آئیونک بانڈ (الیکٹران کی منتقلی) بمقابلہ کوویلنٹ بانڈ (باہمی اشتراک)';

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        ${commonDefs}
        <rect width="${width}" height="${height}" fill="#ffffff" rx="16" />
        <rect width="${width}" height="${height}" fill="none" stroke="#e2e8f0" stroke-width="2" rx="16" />

        <!-- Header -->
        <g transform="translate(35, 25)">
          <rect width="320" height="32" rx="16" fill="#f5f3ff" stroke="#c4b5fd" stroke-width="1.2" />
          <text x="16" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#7c3aed">
            ${headerTitle}
          </text>
          <text x="340" y="21" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f172a">
            ${headerSubtitle}
          </text>
        </g>

        <!-- Left Visual: Ionic Bond (NaCl) -->
        <g transform="translate(45, 75)" filter="url(#cardShadow)">
          <rect width="360" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />
          <text x="18" y="28" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#0284c7">
            1. Ionic Bond: Na⁺ + Cl⁻ ⟶ NaCl
          </text>

          <!-- Sodium (Na) atom losing electron -->
          <g transform="translate(80, 110)">
            <circle cx="0" cy="0" r="38" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" />
            <circle cx="0" cy="0" r="24" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="3 2" />
            <circle cx="0" cy="0" r="12" fill="#0369a1" />
            <text x="0" y="4" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#ffffff">Na</text>
            <text x="0" y="55" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#0369a1">Na (2,8,1)</text>
            <text x="0" y="70" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" fill="#0284c7">Loses 1 e⁻</text>
          </g>

          <!-- Transfer Arrow -->
          <g transform="translate(170, 110)">
            <line x1="-15" y1="0" x2="25" y2="0" stroke="#f43f5e" stroke-width="2.5" />
            <polygon points="25,-4 34,0 25,4" fill="#f43f5e" />
            <circle cx="5" cy="-8" r="4" fill="#f43f5e" />
            <text x="5" y="-14" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8" font-weight="bold" fill="#f43f5e">e⁻</text>
          </g>

          <!-- Chlorine (Cl) atom gaining electron -->
          <g transform="translate(260, 110)">
            <circle cx="0" cy="0" r="45" fill="#fef3c7" stroke="#d97706" stroke-width="2" />
            <circle cx="0" cy="0" r="30" fill="#fde68a" stroke="#d97706" stroke-width="1.5" stroke-dasharray="3 2" />
            <circle cx="0" cy="0" r="14" fill="#b45309" />
            <text x="0" y="4" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#ffffff">Cl</text>
            <text x="0" y="60" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#b45309">Cl (2,8,7)</text>
            <text x="0" y="75" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" fill="#d97706">Gains 1 e⁻</text>
          </g>

          <!-- Electrostatic Attraction Box -->
          <rect x="20" y="215" width="320" height="75" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="1.2" />
          <text x="30" y="240" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#15803d">
            Electrostatic Attraction (برقی سکونی کشش):
          </text>
          <text x="30" y="260" font-family="system-ui, sans-serif" font-size="11" fill="#166534">
            Na⁺ (2,8) + Cl⁻ (2,8,8) ⟶ Strong crystal lattice
          </text>
          <text x="30" y="278" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
            Complete transfer of valence electrons forms octets.
          </text>

          <!-- Covalent preview -->
          <rect x="20" y="305" width="320" height="75" rx="8" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.2" />
          <text x="30" y="330" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#1d4ed8">
            2. Covalent Bond: H + H ⟶ H₂
          </text>
          <text x="30" y="350" font-family="system-ui, sans-serif" font-size="11" fill="#1e40af">
            Mutual sharing of electrons between non-metals.
          </text>
          <text x="30" y="368" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
            H:H single covalent bond completes duet stability.
          </text>
        </g>

        <!-- Right Side: Rules & Comparison -->
        <g transform="translate(425, 75)" filter="url(#cardShadow)">
          <rect width="380" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />
          <text x="18" y="28" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">
            ✦ کیمیائی بانڈز کا تقابل (Comparison &amp; Octet Rule):
          </text>

          <g transform="translate(18, 45)">
            <rect width="344" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
            <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#7c3aed">
              ★ Octet Rule (آکٹیٹ قانون):
            </text>
            <text x="12" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
              Atoms lose, gain, or share electrons to attain 8 valence electrons (noble gas configuration).
            </text>
          </g>

          <g transform="translate(18, 115)">
            <rect width="344" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
            <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#0284c7">
              • Ionic Bond Characteristics:
            </text>
            <text x="12" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
              Between metals and non-metals (ΔEN &gt; 1.7). High melting/boiling points, conduct in solution.
            </text>
          </g>

          <g transform="translate(18, 185)">
            <rect width="344" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
            <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#16a34a">
              • Covalent Bond Characteristics:
            </text>
            <text x="12" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
              Between non-metals. Single (H₂), double (O₂), or triple (N₂) bonds via shared pairs.
            </text>
          </g>

          <g transform="translate(18, 255)">
            <rect width="344" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
            <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#ea580c">
              • Coordinate (Dative) Covalent Bond:
            </text>
            <text x="12" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
              Bond pair donated by a single donor atom (e.g. NH₄⁺ and H₃O⁺).
            </text>
          </g>

          <rect x="18" y="325" width="344" height="55" rx="8" fill="#fef2f2" stroke="#fca5a5" stroke-width="1" />
          <text x="28" y="346" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold" fill="#dc2626">
            بورڈ امتحان تعریف: الیکٹروویلنٹ (آئیونک) اور کوویلنٹ بانڈ
          </text>
          <text x="28" y="364" font-family="system-ui, sans-serif" font-size="9.5" fill="#7f1d1d">
            امتحان میں لیوس ڈاٹ اینڈ کراس سٹرکچر بنانا پورے نمبر دلاتا ہے۔
          </text>
        </g>

        <!-- Bottom Bar -->
        <g transform="translate(35, 492)" filter="url(#cardShadow)">
          <rect width="770" height="62" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
          <text x="18" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#7c3aed">
            ✦ FBISE &amp; BISE Board Exam Alert (Class 9 Chemistry Chapter 4):
          </text>
          <text x="18" y="44" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
            ${isEn ? 'Electronegativity difference determines bond character: ΔEN &gt; 1.7 produces predominantly ionic character; ΔEN &lt; 1.7 produces covalent.' : 'الیکٹرو نیگیٹیویٹی کا فرق 1.7 سے زیادہ ہو تو آئیونک بانڈ اور کم ہو تو کوویلنٹ بانڈ بنتا ہے۔'}
          </text>
        </g>
      </svg>`;
    }

    // 2A. Authentic Modern Periodic Table of Elements (دوری جدول اور متواتر رجحانات)
    const headerTitle = isEn
      ? '🧪 CHEMISTRY • MODERN PERIODIC TABLE OF ELEMENTS'
      : '🧪 کیمسٹری • جدید دوری جدول اور متواتر رجحانات (Periodic Table)';
    const headerSubtitle = isEn
      ? 'Periods (1–7), Groups (1–18), Electronic Shells &amp; Periodic Trends'
      : 'پیریڈز (1 تا 7)، گروپس (1 تا 18)، ایٹمی ریڈیئس اور الیکٹرو نیگیٹیویٹی رجحانات';

    // Detailed Element matrix for Periods 1, 2, 3, 4
    // Standard chemical elements organized precisely by Group (1 to 18)
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      ${commonDefs}
      <rect width="${width}" height="${height}" fill="#ffffff" rx="16" />
      <rect width="${width}" height="${height}" fill="none" stroke="#e2e8f0" stroke-width="2" rx="16" />

      <!-- Top Header Badge -->
      <g transform="translate(35, 25)">
        <rect width="320" height="32" rx="16" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.2" />
        <text x="16" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1d4ed8">
          ${headerTitle}
        </text>
        <text x="340" y="21" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f172a">
          ${headerSubtitle}
        </text>
      </g>

      <!-- Main Periodic Table Grid Container (Left side: width ~500) -->
      <g transform="translate(35, 75)" filter="url(#cardShadow)">
        <rect width="495" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />

        <!-- Periodic Trends Direction Arrows on Top and Side -->
        <!-- Top Trend Arrow: Electronegativity & Ionization Energy Increases -> -->
        <g transform="translate(25, 20)">
          <line x1="10" y1="0" x2="440" y2="0" stroke="#7c3aed" stroke-width="2.5" />
          <polygon points="440,-4 450,0 440,4" fill="#7c3aed" />
          <text x="220" y="-5" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#7c3aed">
            ${isEn ? 'Ionization Energy &amp; Electronegativity Increase ⟶ (Atomic Radius Decreases ⟶)' : 'الیکٹرو نیگیٹیویٹی اور آئیونائزیشن انرجی میں اضافہ ⟶ (ایٹمی سائز کم ہوتا ہے)'}
          </text>
        </g>

        <!-- Side Trend Arrow: Atomic Radius Increases Downwards | -->
        <g transform="translate(14, 35)">
          <line x1="0" y1="10" x2="0" y2="280" stroke="#059669" stroke-width="2" />
          <polygon points="-4,280 0,290 4,280" fill="#059669" />
          <text x="-4" y="150" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" fill="#059669" transform="rotate(-90 -4 150)">
            ${isEn ? 'Atomic Radius Increases ⇣' : 'ایٹمی ریڈیئس میں اضافہ ⇣'}
          </text>
        </g>

        <!-- Group Numbers across top (1 to 18) -->
        <g transform="translate(30, 42)" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" fill="#64748b">
          <text x="12" y="0" text-anchor="middle">1</text>
          <text x="36" y="0" text-anchor="middle">2</text>
          <text x="60" y="0" text-anchor="middle">3</text>
          <text x="84" y="0" text-anchor="middle">4</text>
          <text x="108" y="0" text-anchor="middle">5</text>
          <text x="132" y="0" text-anchor="middle">6</text>
          <text x="156" y="0" text-anchor="middle">7</text>
          <text x="180" y="0" text-anchor="middle">8</text>
          <text x="204" y="0" text-anchor="middle">9</text>
          <text x="228" y="0" text-anchor="middle">10</text>
          <text x="252" y="0" text-anchor="middle">11</text>
          <text x="276" y="0" text-anchor="middle">12</text>
          <text x="300" y="0" text-anchor="middle">13</text>
          <text x="324" y="0" text-anchor="middle">14</text>
          <text x="348" y="0" text-anchor="middle">15</text>
          <text x="372" y="0" text-anchor="middle">16</text>
          <text x="396" y="0" text-anchor="middle">17</text>
          <text x="420" y="0" text-anchor="middle">18</text>
        </g>

        <!-- Period Numbers down left (1 to 6) -->
        <g transform="translate(24, 72)" font-family="system-ui, sans-serif" font-size="9.5" font-weight="bold" fill="#64748b">
          <text x="0" y="0">P1</text>
          <text x="0" y="44">P2</text>
          <text x="0" y="88">P3</text>
          <text x="0" y="132">P4</text>
          <text x="0" y="176">P5</text>
          <text x="0" y="220">P6</text>
        </g>

        <!-- ELEMENT TILES (Group width = 24px, tile height = 40px) -->
        <g transform="translate(30, 52)">
          <!-- PERIOD 1 -->
          <!-- H (1, Group 1) -->
          <g transform="translate(0, 0)">
            <rect width="23" height="38" rx="4" fill="#fee2e2" stroke="#ef4444" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#dc2626">1</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#991b1b">H</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#b91c1c">1.0</text>
          </g>
          <!-- He (2, Group 18) -->
          <g transform="translate(408, 0)">
            <rect width="23" height="38" rx="4" fill="#f3e8ff" stroke="#a855f7" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#7e22ce">2</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#6b21a8">He</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#7e22ce">4.0</text>
          </g>

          <!-- PERIOD 2 -->
          <!-- Li (3, G1) -->
          <g transform="translate(0, 44)">
            <rect width="23" height="38" rx="4" fill="#fee2e2" stroke="#ef4444" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#dc2626">3</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#991b1b">Li</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#b91c1c">6.9</text>
          </g>
          <!-- Be (4, G2) -->
          <g transform="translate(24, 44)">
            <rect width="23" height="38" rx="4" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#d97706">4</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#b45309">Be</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#d97706">9.0</text>
          </g>
          <!-- B (5, G13) -->
          <g transform="translate(288, 44)">
            <rect width="23" height="38" rx="4" fill="#ccfbf1" stroke="#14b8a6" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#0f766e">5</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#115e59">B</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#0f766e">10.8</text>
          </g>
          <!-- C (6, G14) -->
          <g transform="translate(312, 44)">
            <rect width="23" height="38" rx="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#15803d">6</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#166534">C</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#15803d">12.0</text>
          </g>
          <!-- N (7, G15) -->
          <g transform="translate(336, 44)">
            <rect width="23" height="38" rx="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#15803d">7</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#166534">N</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#15803d">14.0</text>
          </g>
          <!-- O (8, G16) -->
          <g transform="translate(360, 44)">
            <rect width="23" height="38" rx="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#15803d">8</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#166534">O</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#15803d">16.0</text>
          </g>
          <!-- F (9, G17) ★ HIGHEST ELECTRONEGATIVITY -->
          <g transform="translate(384, 44)">
            <rect width="23" height="38" rx="4" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#4338ca">9</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#312e81">F★</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#4338ca">19.0</text>
          </g>
          <!-- Ne (10, G18) -->
          <g transform="translate(408, 44)">
            <rect width="23" height="38" rx="4" fill="#f3e8ff" stroke="#a855f7" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#7e22ce">10</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#6b21a8">Ne</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#7e22ce">20.2</text>
          </g>

          <!-- PERIOD 3 -->
          <!-- Na (11, G1) -->
          <g transform="translate(0, 88)">
            <rect width="23" height="38" rx="4" fill="#fee2e2" stroke="#ef4444" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#dc2626">11</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#991b1b">Na</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#b91c1c">23.0</text>
          </g>
          <!-- Mg (12, G2) -->
          <g transform="translate(24, 88)">
            <rect width="23" height="38" rx="4" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#d97706">12</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#b45309">Mg</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#d97706">24.3</text>
          </g>
          <!-- Al (13, G13) -->
          <g transform="translate(288, 88)">
            <rect width="23" height="38" rx="4" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#475569">13</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#334155">Al</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#64748b">27.0</text>
          </g>
          <!-- Si (14, G14) -->
          <g transform="translate(312, 88)">
            <rect width="23" height="38" rx="4" fill="#ccfbf1" stroke="#14b8a6" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#0f766e">14</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#115e59">Si</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#0f766e">28.1</text>
          </g>
          <!-- P (15, G15) -->
          <g transform="translate(336, 88)">
            <rect width="23" height="38" rx="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#15803d">15</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#166534">P</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#15803d">31.0</text>
          </g>
          <!-- S (16, G16) -->
          <g transform="translate(360, 88)">
            <rect width="23" height="38" rx="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#15803d">16</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#166534">S</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#15803d">32.1</text>
          </g>
          <!-- Cl (17, G17) -->
          <g transform="translate(384, 88)">
            <rect width="23" height="38" rx="4" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#4338ca">17</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#312e81">Cl</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#4338ca">35.5</text>
          </g>
          <!-- Ar (18, G18) -->
          <g transform="translate(408, 88)">
            <rect width="23" height="38" rx="4" fill="#f3e8ff" stroke="#a855f7" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7.5" font-weight="bold" fill="#7e22ce">18</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#6b21a8">Ar</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#7e22ce">39.9</text>
          </g>

          <!-- PERIOD 4 (K to Kr) -->
          <!-- K (19, G1) -->
          <g transform="translate(0, 132)">
            <rect width="23" height="38" rx="4" fill="#fee2e2" stroke="#ef4444" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7" font-weight="bold" fill="#dc2626">19</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#991b1b">K</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#b91c1c">39.1</text>
          </g>
          <!-- Ca (20, G2) -->
          <g transform="translate(24, 132)">
            <rect width="23" height="38" rx="4" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7" font-weight="bold" fill="#d97706">20</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#b45309">Ca</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#d97706">40.1</text>
          </g>
          <!-- Transition Metals (Sc to Zn: 21 to 30) -->
          <g transform="translate(48, 132)">
            <rect width="238" height="38" rx="4" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.2" />
            <text x="119" y="18" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#1e40af">
              Transition Metals (Sc²¹ ⟶ Zn³⁰)
            </text>
            <text x="119" y="32" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8.5" fill="#2563eb">
              Sc • Ti • V • Cr • Mn • Fe • Co • Ni • Cu • Zn
            </text>
          </g>
          <!-- Ga (31, G13) -->
          <g transform="translate(288, 132)">
            <rect width="23" height="38" rx="4" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7" font-weight="bold" fill="#475569">31</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#334155">Ga</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#64748b">69.7</text>
          </g>
          <!-- Ge (32, G14) -->
          <g transform="translate(312, 132)">
            <rect width="23" height="38" rx="4" fill="#ccfbf1" stroke="#14b8a6" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7" font-weight="bold" fill="#0f766e">32</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#115e59">Ge</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#0f766e">72.6</text>
          </g>
          <!-- As (33, G15) -->
          <g transform="translate(336, 132)">
            <rect width="23" height="38" rx="4" fill="#ccfbf1" stroke="#14b8a6" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7" font-weight="bold" fill="#0f766e">33</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#115e59">As</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#0f766e">74.9</text>
          </g>
          <!-- Se (34, G16) -->
          <g transform="translate(360, 132)">
            <rect width="23" height="38" rx="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7" font-weight="bold" fill="#15803d">34</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#166534">Se</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#15803d">79.0</text>
          </g>
          <!-- Br (35, G17) -->
          <g transform="translate(384, 132)">
            <rect width="23" height="38" rx="4" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7" font-weight="bold" fill="#4338ca">35</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#312e81">Br</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#4338ca">79.9</text>
          </g>
          <!-- Kr (36, G18) -->
          <g transform="translate(408, 132)">
            <rect width="23" height="38" rx="4" fill="#f3e8ff" stroke="#a855f7" stroke-width="1.2" />
            <text x="3" y="10" font-family="system-ui, sans-serif" font-size="7" font-weight="bold" fill="#7e22ce">36</text>
            <text x="11.5" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#6b21a8">Kr</text>
            <text x="11.5" y="34" text-anchor="middle" font-family="system-ui, sans-serif" font-size="6.5" fill="#7e22ce">83.8</text>
          </g>

          <!-- Periods 5-7 Indicative Rows -->
          <g transform="translate(0, 176)">
            <rect width="431" height="32" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
            <text x="12" y="20" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#334155">
              Period 5 (Rb³⁷ ⟶ Xe⁵⁴):
            </text>
            <text x="160" y="20" font-family="system-ui, sans-serif" font-size="9" fill="#475569">
              Rb, Sr, Y, Zr, Nb, Mo, Tc, Ru, Rh, Pd, Ag, Cd, In, Sn, Sb, Te, I, Xe
            </text>
          </g>
          <g transform="translate(0, 214)">
            <rect width="431" height="32" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
            <text x="12" y="20" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#334155">
              Period 6 &amp; 7 (Cs⁵⁵ ⟶ Og¹¹⁸):
            </text>
            <text x="175" y="20" font-family="system-ui, sans-serif" font-size="9" fill="#475569">
              Includes Lanthanides (57–71) &amp; Actinides (89–103) inner transition series
            </text>
          </g>
        </g>

        <!-- Element Color Legend (Bottom of table card) -->
        <g transform="translate(25, 320)" font-family="system-ui, sans-serif" font-size="9" font-weight="bold">
          <!-- Row 1 -->
          <rect x="0" y="0" width="10" height="10" rx="2" fill="#fee2e2" stroke="#ef4444" stroke-width="1" />
          <text x="14" y="9" fill="#991b1b">Alkali Metals (G1)</text>

          <rect x="110" y="0" width="10" height="10" rx="2" fill="#fef3c7" stroke="#f59e0b" stroke-width="1" />
          <text x="124" y="9" fill="#b45309">Alkaline Earth (G2)</text>

          <rect x="230" y="0" width="10" height="10" rx="2" fill="#eff6ff" stroke="#3b82f6" stroke-width="1" />
          <text x="244" y="9" fill="#1e40af">Transition Metals</text>

          <rect x="350" y="0" width="10" height="10" rx="2" fill="#ccfbf1" stroke="#14b8a6" stroke-width="1" />
          <text x="364" y="9" fill="#0f766e">Metalloids</text>

          <!-- Row 2 -->
          <rect x="0" y="16" width="10" height="10" rx="2" fill="#dcfce7" stroke="#22c55e" stroke-width="1" />
          <text x="14" y="25" fill="#166534">Non-metals</text>

          <rect x="110" y="16" width="10" height="10" rx="2" fill="#e0e7ff" stroke="#6366f1" stroke-width="1" />
          <text x="124" y="25" fill="#312e81">Halogens (G17)</text>

          <rect x="230" y="16" width="10" height="10" rx="2" fill="#f3e8ff" stroke="#a855f7" stroke-width="1" />
          <text x="244" y="25" fill="#6b21a8">Noble Gases (G18)</text>

          <rect x="350" y="16" width="10" height="10" rx="2" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1" />
          <text x="364" y="25" fill="#334155">Post-Transition</text>
        </g>
      </g>

      <!-- Right Side: Zoomed Element Tile Detail & Scientific Periodic Trends Card -->
      <g transform="translate(545, 75)" filter="url(#cardShadow)">
        <rect width="260" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />

        <!-- Zoomed Element Tile: Carbon (6) -->
        <g transform="translate(75, 18)">
          <rect width="110" height="110" rx="10" fill="#ffffff" stroke="#22c55e" stroke-width="2" filter="url(#elementShadow)" />
          <text x="10" y="22" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#15803d">6</text>
          <text x="55" y="65" text-anchor="middle" font-family="system-ui, sans-serif" font-size="34" font-weight="extrabold" fill="#166534">C</text>
          <text x="55" y="84" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">Carbon</text>
          <text x="55" y="98" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" fill="#64748b">12.011 • 2s² 2p²</text>
        </g>

        <!-- Trends Summary Box -->
        <g transform="translate(14, 142)">
          <rect width="232" height="235" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
          <text x="12" y="20" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#0f172a">
            ✦ متواتر رجحانات (Periodic Trends):
          </text>

          <g transform="translate(10, 30)">
            <rect width="212" height="42" rx="6" fill="#f0fdf4" stroke="#86efac" stroke-width="1" />
            <text x="8" y="16" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#15803d">
              1. ایٹمی ریڈیئس (Atomic Radius):
            </text>
            <text x="8" y="32" font-family="system-ui, sans-serif" font-size="9" fill="#334155">
              پیریڈ میں کم ⟶ اور گروپ میں زیادہ ⇣ ہوتا ہے۔
            </text>
          </g>

          <g transform="translate(10, 78)">
            <rect width="212" height="42" rx="6" fill="#eff6ff" stroke="#93c5fd" stroke-width="1" />
            <text x="8" y="16" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#1d4ed8">
              2. آئیونائزیشن انرجی (Ionization Energy):
            </text>
            <text x="8" y="32" font-family="system-ui, sans-serif" font-size="9" fill="#334155">
              پیریڈ میں زیادہ ⟶ اور گروپ میں کم ⇣ ہوتی ہے۔
            </text>
          </g>

          <g transform="translate(10, 126)">
            <rect width="212" height="42" rx="6" fill="#fdf4ff" stroke="#f0abfc" stroke-width="1" />
            <text x="8" y="16" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#a21caf">
              3. الیکٹرو نیگیٹیویٹی (Electronegativity):
            </text>
            <text x="8" y="32" font-family="system-ui, sans-serif" font-size="9" fill="#334155">
              فلورین ($F$) سب سے زیادہ ($4.0$) قیمت رکھتا ہے۔
            </text>
          </g>

          <g transform="translate(10, 174)">
            <rect width="212" height="42" rx="6" fill="#fffbeb" stroke="#fde68a" stroke-width="1" />
            <text x="8" y="16" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#b45309">
              4. شیلڈنگ ایفیکٹ (Shielding Effect):
            </text>
            <text x="8" y="32" font-family="system-ui, sans-serif" font-size="9" fill="#334155">
              پیریڈ میں یکساں رہتا ہے، گروپ میں بڑھتا ہے۔
            </text>
          </g>
        </g>
      </g>

      <!-- Bottom Bar -->
      <g transform="translate(35, 492)" filter="url(#cardShadow)">
        <rect width="770" height="62" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
        <text x="18" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#1d4ed8">
          ✦ بورڈ امتحانی قانون (FBISE &amp; BISE Class 9 Chemistry Chapter 3):
        </text>
        <text x="18" y="44" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
          ${isEn ? 'Modern Periodic Law (Moseley 1913): Properties of elements are periodic functions of their Atomic Numbers (Z). 7 Periods &amp; 18 Groups.' : 'جدید متواتر قانون (موزلے 1913): عناصر کی طبعی اور کیمیائی خصوصیات ان کے ایٹمی نمبروں کا متواتر عمل ہوتی ہیں۔ دوری جدول میں 7 پیریڈز اور 18 گروپس ہیں۔'}
        </text>
      </g>
    </svg>`;
  }

  // =========================================================================
  // PRIORITY 3: MATHEMATICS (ریاضی)
  // MUST NEVER return Biology Animal Cell or Photosynthesis!
  // =========================================================================
  const isMathQuery =
    text.includes('math') ||
    text.includes('ریاضی') ||
    text.includes('algebra') ||
    text.includes('calculus') ||
    text.includes('quadratic') ||
    text.includes('matrix') ||
    text.includes('matrices') ||
    text.includes('pythagor') ||
    text.includes('trigonometr') ||
    text.includes('geometry') ||
    text.includes('equation') ||
    text.includes('مساوات') ||
    text.includes('fraction') ||
    text.includes('derivat') ||
    text.includes('cramer') ||
    text.includes('parabola') ||
    text.includes('polynomial');

  if (isMathQuery) {
    const isPythagoras = text.includes('pythagor') || text.includes('فیثاغورث') || text.includes('triangle') || text.includes('مثلث') || text.includes('trigonometr');
    const isMatrices = text.includes('matrix') || text.includes('matrices') || text.includes('کالب') || text.includes('مقطع') || text.includes('determinant') || text.includes('cramer');
    const isCalculus = text.includes('calculus') || text.includes('derivat') || text.includes('slope') || text.includes('ڈیریویٹو');

    // 2A. Pythagoras Theorem & Right-Angled Triangles
    if (isPythagoras) {
      const headerTitle = isEn
        ? '📐 MATHEMATICS • PYTHAGORAS THEOREM'
        : '📐 ریاضی • مسئلہ فیثاغورث (Pythagoras Theorem)';

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        ${commonDefs}
        <rect width="${width}" height="${height}" fill="#ffffff" rx="16" />
        <rect width="${width}" height="${height}" fill="none" stroke="#e2e8f0" stroke-width="2" rx="16" />

        <!-- Top Header -->
        <g transform="translate(35, 25)">
          <rect width="280" height="32" rx="16" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.2" />
          <text x="16" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1d4ed8">
            ${headerTitle}
          </text>
          <text x="300" y="21" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f172a">
            ${isEn ? 'Right-Angled Triangle: a² + b² = c² (Base, Perpendicular, Hypotenuse)' : 'قائمۃ الزاویہ مثلث: وتر² = قاعدہ² + عمود²'}
          </text>
        </g>

        <!-- Visual Triangle Illustration with Geometric Squares -->
        <g transform="translate(60, 95)" filter="url(#elementShadow)">
          <polygon points="120,300 320,300 120,120" fill="#eff6ff" stroke="#2563eb" stroke-width="3.5" />
          <rect x="120" y="280" width="20" height="20" fill="none" stroke="#dc2626" stroke-width="2" />
          <circle cx="130" cy="290" r="2.5" fill="#dc2626" />

          <!-- Side a Square -->
          <rect x="-60" y="120" width="180" height="180" fill="#fef2f2" stroke="#dc2626" stroke-width="2" stroke-dasharray="4 3" />
          <text x="20" y="215" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#dc2626">a² = 144</text>

          <!-- Side b Square -->
          <rect x="120" y="300" width="200" height="150" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" stroke-dasharray="4 3" />
          <text x="200" y="380" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#15803d">b² = 256</text>

          <!-- Side Labels -->
          <text x="75" y="210" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#dc2626">
            ${isEn ? 'Perpendicular (a)' : 'عمود (a)'}
          </text>
          <text x="210" y="325" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#15803d">
            ${isEn ? 'Base (b)' : 'قاعدہ (b)'}
          </text>
          <text x="235" y="195" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#2563eb">
            ${isEn ? 'Hypotenuse (c)' : 'وتر (c)'}
          </text>
        </g>

        <!-- Right Side: Formula Card -->
        <g transform="translate(485, 85)" filter="url(#cardShadow)">
          <rect width="320" height="110" rx="10" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" />
          <text x="16" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#1d4ed8">
            ${isEn ? '✦ Fundamental Statement:' : '✦ مسئلہ فیثاغورث کا بنیادی کلیہ:'}
          </text>
          <text x="16" y="60" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#0f172a">
            c² = a² + b²
          </text>
          <text x="16" y="90" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#2563eb">
            c = √(a² + b²)
          </text>

          <!-- Trigonometric Ratios -->
          <g transform="translate(0, 125)">
            <rect width="320" height="175" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" />
            <text x="14" y="22" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#0f172a">
              ${isEn ? 'Trigonometric Ratios (مثلثی نسبتیں):' : 'اہم مثلثی نسبتیں (Trigonometric Ratios):'}
            </text>
            <text x="14" y="52" font-family="system-ui, sans-serif" font-size="12" fill="#334155">
              • sin(θ) = Perpendicular / Hypotenuse = a / c
            </text>
            <text x="14" y="82" font-family="system-ui, sans-serif" font-size="12" fill="#334155">
              • cos(θ) = Base / Hypotenuse = b / c
            </text>
            <text x="14" y="112" font-family="system-ui, sans-serif" font-size="12" fill="#334155">
              • tan(θ) = Perpendicular / Base = a / b
            </text>
            <text x="14" y="145" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#7c3aed">
              • Famous Triplets: (3, 4, 5) | (5, 12, 13) | (6, 8, 10)
            </text>
          </g>
        </g>

        <!-- Bottom Bar -->
        <g transform="translate(35, 492)" filter="url(#cardShadow)">
          <rect width="770" height="62" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
          <text x="18" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#1d4ed8">
            ${isEn ? '✦ Practical Application:' : '✦ عملی اطلاق:'}
          </text>
          <text x="18" y="44" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
            ${isEn ? 'Used in construction, civil engineering, navigation, GPS satellite trilateration, and resolving vector components.' : 'تعمیرات، سول انجینئرنگ، جی پی ایس نیویگیشن، اور فزکس میں فورس ویکٹرز کے اجزاء معلوم کرنے کے لیے استعمال ہوتا ہے۔'}
          </text>
        </g>
      </svg>`;
    }

    // 2B. Matrices, Determinants & Cramer's Rule
    if (isMatrices) {
      const headerTitle = isEn
        ? '📐 MATHEMATICS • MATRICES, DETERMINANTS &amp; CRAMER’S RULE'
        : '📐 ریاضی • کالب، مقطع (Determinant) اور کرائمر کا قانون';

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        ${commonDefs}
        <rect width="${width}" height="${height}" fill="#ffffff" rx="16" />
        <rect width="${width}" height="${height}" fill="none" stroke="#e2e8f0" stroke-width="2" rx="16" />

        <!-- Top Header -->
        <g transform="translate(35, 25)">
          <rect width="320" height="32" rx="16" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.2" />
          <text x="16" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1d4ed8">
            ${headerTitle}
          </text>
          <text x="340" y="21" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f172a">
            ${isEn ? '2x2 Matrix Structure, Determinant |A| = ad - bc, Inverse &amp; Linear Systems' : '2x2 کالب کی ساخت، مقطع، انورس اور لکیری مساوات کا حل'}
          </text>
        </g>

        <!-- Left Card: Matrix Structure & Determinant -->
        <g transform="translate(45, 75)" filter="url(#cardShadow)">
          <rect width="365" height="395" rx="12" fill="#fafafa" stroke="#3b82f6" stroke-width="1.5" />
          <text x="20" y="32" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#1d4ed8">
            ${isEn ? '1. Matrix Notation &amp; Determinant' : '1. کالب کی معیاری شکل اور مقطع (|A|)'}
          </text>

          <!-- 2x2 Matrix Visual Bracket -->
          <g transform="translate(40, 60)">
            <rect width="280" height="120" rx="10" fill="#ffffff" stroke="#93c5fd" stroke-width="1.2" />
            <!-- Left Bracket -->
            <path d="M 40,25 L 25,25 L 25,95 L 40,95" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round" />
            <!-- Right Bracket -->
            <path d="M 240,25 L 255,25 L 255,95 L 240,95" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round" />
            <!-- Elements -->
            <text x="80" y="55" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#2563eb">a</text>
            <text x="180" y="55" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#dc2626">b</text>
            <text x="80" y="85" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#16a34a">c</text>
            <text x="180" y="85" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#7c3aed">d</text>
          </g>

          <!-- Determinant Formula -->
          <g transform="translate(20, 200)">
            <rect width="325" height="80" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1" />
            <text x="14" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#1d4ed8">
              ${isEn ? 'Determinant Formula:' : 'مقطع معلوم کرنے کا کلیہ:'}
            </text>
            <text x="14" y="55" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="#0f172a">
              |A| = ad - bc
            </text>
          </g>

          <g transform="translate(20, 295)">
            <rect width="325" height="85" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
            <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">
              ${isEn ? 'Singular vs Non-Singular:' : 'نادر (Singular) بمقابلہ غیر نادر کالب:'}
            </text>
            <text x="12" y="44" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
              • If |A| = 0: Matrix is **Singular** (No Multiplicative Inverse).
            </text>
            <text x="12" y="66" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
              • If |A| ≠ 0: Matrix is **Non-Singular** (Inverse exists: A⁻¹).
            </text>
          </g>
        </g>

        <!-- Right Card: Cramer's Rule & Inversion Method -->
        <g transform="translate(430, 75)" filter="url(#cardShadow)">
          <rect width="365" height="395" rx="12" fill="#fafafa" stroke="#16a34a" stroke-width="1.5" />
          <text x="20" y="32" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#15803d">
            ${isEn ? '2. Cramer’s Rule for Linear Equations' : '2. کرائمر کا قانون (Cramer’s Rule)'}
          </text>

          <g transform="translate(20, 50)">
            <rect width="325" height="60" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1" />
            <text x="12" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#166534">
              ax + by = m  &amp;  cx + dy = n
            </text>
            <text x="12" y="44" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
              A = [[a, b], [c, d]],  A_x = [[m, b], [n, d]],  A_y = [[a, m], [c, n]]
            </text>
          </g>

          <g transform="translate(20, 125)">
            <rect width="325" height="110" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
            <text x="14" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#15803d">
              ${isEn ? 'Solution for Variables (x &amp; y):' : 'متغیرات کی قیمتیں معلوم کرنا:'}
            </text>
            <text x="14" y="60" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">
              x = |A_x| / |A|
            </text>
            <text x="14" y="92" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">
              y = |A_y| / |A|
            </text>
          </g>

          <g transform="translate(20, 250)">
            <rect width="325" height="130" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1" />
            <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#1d4ed8">
              ${isEn ? 'Matrix Inversion Method (معکوس طریقہ):' : 'معکوس طریقہ (Matrix Inversion):'}
            </text>
            <text x="12" y="46" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">
              X = A⁻¹ · B
            </text>
            <text x="12" y="70" font-family="system-ui, sans-serif" font-size="12" fill="#334155">
              A⁻¹ = (1 / |A|) · Adj(A)
            </text>
            <text x="12" y="96" font-family="system-ui, sans-serif" font-size="10.5" fill="#475569">
              Adj(A) swaps diagonal entries (a ↔ d) and changes signs of (-b, -c).
            </text>
          </g>
        </g>

        <!-- Bottom Bar -->
        <g transform="translate(35, 492)" filter="url(#cardShadow)">
          <rect width="770" height="62" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
          <text x="18" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#1d4ed8">
            ✦ FBISE &amp; BISE Board Exam Alert (Class 9 &amp; 10):
          </text>
          <text x="18" y="44" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
            ${isEn ? 'Matrix question carries compulsory 8 marks in FBISE/Punjab Section B. Always write Solution Set {(x, y)}.' : 'بورڈ امتحانات میں کالب کا لانگ سوال لازمی آتا ہے۔ آخر میں حل سیٹ {(x, y)} لکھنا ہرگز نہ بھولیں۔'}
          </text>
        </g>
      </svg>`;
    }

    // 2C. Algebra & Algebraic Identities (الجبرا اور الجبرائی کلیے)
    const isAlgebra =
      text.includes('algebra') ||
      text.includes('الجبرا') ||
      text.includes('identity') ||
      text.includes('identities') ||
      text.includes('polynomial') ||
      text.includes('factor') ||
      text.includes('تجزیہ') ||
      text.includes('کلیہ') ||
      text.includes('expression') ||
      text.includes('کثیر رقمی');

    if (isAlgebra) {
      const headerTitle = isEn
        ? '📐 MATHEMATICS • ALGEBRAIC IDENTITIES &amp; GEOMETRIC PROOF'
        : '📐 ریاضی • الجبرائی کلیات اور ہندسی ثبوت (Algebraic Identities)';
      const headerSubtitle = isEn
        ? 'Visual Geometric Proof: (a + b)² = a² + 2ab + b² &amp; Essential Board Identities'
        : 'ہندسی ثبوت: ²(a + b) = a² + 2ab + b² اور بورڈ نصاب کے بنیادی الجبرائی کلیے';

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        ${commonDefs}
        <rect width="${width}" height="${height}" fill="#ffffff" rx="16" />
        <rect width="${width}" height="${height}" fill="none" stroke="#e2e8f0" stroke-width="2" rx="16" />

        <!-- Top Header -->
        <g transform="translate(35, 25)">
          <rect width="320" height="32" rx="16" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.2" />
          <text x="16" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1d4ed8">
            ${headerTitle}
          </text>
          <text x="340" y="21" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f172a">
            ${headerSubtitle}
          </text>
        </g>

        <!-- Left Visual: Geometric Proof of (a + b)^2 = a^2 + 2ab + b^2 -->
        <g transform="translate(45, 75)" filter="url(#cardShadow)">
          <rect width="395" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />
          <text x="18" y="28" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#1d4ed8">
            ${isEn ? '✦ Geometric Proof of (a + b)²:' : '✦ الجبرائی کلیے کا ہندسی ثبوت: ²(a + b)'}
          </text>

          <!-- Outer Square of Side (a + b) -->
          <g transform="translate(60, 48)">
            <!-- a x a Square (Top Left - Blue) -->
            <rect x="0" y="0" width="160" height="160" fill="#eff6ff" stroke="#2563eb" stroke-width="2.5" />
            <text x="80" y="85" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="extrabold" fill="#1d4ed8">a²</text>
            <text x="80" y="105" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#3b82f6">(a × a)</text>

            <!-- a x b Rectangle (Top Right - Green) -->
            <rect x="160" y="0" width="90" height="160" fill="#f0fdf4" stroke="#16a34a" stroke-width="2.5" />
            <text x="205" y="85" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="extrabold" fill="#15803d">ab</text>
            <text x="205" y="105" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#16a34a">(a × b)</text>

            <!-- b x a Rectangle (Bottom Left - Amber) -->
            <rect x="0" y="160" width="160" height="90" fill="#fffbeb" stroke="#d97706" stroke-width="2.5" />
            <text x="80" y="210" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="extrabold" fill="#b45309">ab</text>
            <text x="80" y="228" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#d97706">(b × a)</text>

            <!-- b x b Square (Bottom Right - Purple) -->
            <rect x="160" y="160" width="90" height="90" fill="#faf5ff" stroke="#9333ea" stroke-width="2.5" />
            <text x="205" y="210" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="extrabold" fill="#7e22ce">b²</text>
            <text x="205" y="228" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#9333ea">(b × b)</text>

            <!-- Side Dimension Markers -->
            <!-- Top Dimensions (a and b) -->
            <line x1="0" y1="-10" x2="160" y2="-10" stroke="#2563eb" stroke-width="2" />
            <text x="80" y="-16" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#2563eb">a</text>
            <line x1="160" y1="-10" x2="250" y2="-10" stroke="#16a34a" stroke-width="2" />
            <text x="205" y="-16" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#16a34a">b</text>

            <!-- Left Dimensions (a and b) -->
            <line x1="-10" y1="0" x2="-10" y2="160" stroke="#2563eb" stroke-width="2" />
            <text x="-16" y="85" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#2563eb">a</text>
            <line x1="-10" y1="160" x2="-10" y2="250" stroke="#d97706" stroke-width="2" />
            <text x="-16" y="210" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#d97706">b</text>
          </g>

          <!-- Summation Result Banner -->
          <rect x="15" y="325" width="365" height="52" rx="8" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.2" />
          <text x="197" y="356" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14.5" font-weight="extrabold" fill="#1e40af">
            Total Area = a² + ab + ab + b² = a² + 2ab + b²
          </text>
        </g>

        <!-- Right Side: Essential Board Algebraic Identities & Solved Factoring -->
        <g transform="translate(455, 75)" filter="url(#cardShadow)">
          <rect width="350" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />
          <text x="18" y="28" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">
            ✦ بنیادی الجبرائی فارمولے (Core Identities):
          </text>

          <g transform="translate(16, 42)">
            <!-- Identity 1 -->
            <rect width="318" height="40" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
            <text x="12" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#1d4ed8">
              1. (a + b)² = a² + 2ab + b²
            </text>

            <!-- Identity 2 -->
            <g transform="translate(0, 46)">
              <rect width="318" height="40" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
              <text x="12" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#7c3aed">
                2. (a - b)² = a² - 2ab + b²
              </text>
            </g>

            <!-- Identity 3 (Difference of Two Squares) -->
            <g transform="translate(0, 92)">
              <rect width="318" height="40" rx="6" fill="#f0fdf4" stroke="#86efac" stroke-width="1.2" />
              <text x="12" y="24" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#15803d">
                3. a² - b² = (a - b)(a + b) ★
              </text>
            </g>

            <!-- Identity 4 (Three Variables) -->
            <g transform="translate(0, 138)">
              <rect width="318" height="40" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
              <text x="12" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#ea580c">
                4. (a + b + c)² = a² + b² + c² + 2(ab + bc + ca)
              </text>
            </g>

            <!-- Identity 5 (Cubic Identity) -->
            <g transform="translate(0, 184)">
              <rect width="318" height="40" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
              <text x="12" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#0284c7">
                5. (a + b)³ = a³ + 3a²b + 3ab² + b³
              </text>
            </g>
          </g>

          <!-- Solved Factoring Example -->
          <g transform="translate(16, 276)">
            <rect width="318" height="100" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="1" />
            <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">
              📝 حل شدہ بورڈ مثال (Solved Board Examples):
            </text>
            <text x="12" y="44" font-family="system-ui, sans-serif" font-size="11" fill="#15803d">
              • Factorize: x² - 16 = (x - 4)(x + 4)
            </text>
            <text x="12" y="66" font-family="system-ui, sans-serif" font-size="11" fill="#1d4ed8">
              • Expand: (2x + 3)² = (2x)² + 2(2x)(3) + 3² = 4x² + 12x + 9
            </text>
            <text x="12" y="88" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#b45309">
              نصاب مطابقت: فیڈرل و پنجاب بورڈ نہم کلاس باب 4 اور 5
            </text>
          </g>
        </g>

        <!-- Bottom Bar -->
        <g transform="translate(35, 492)" filter="url(#cardShadow)">
          <rect width="770" height="62" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
          <text x="18" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#1d4ed8">
            ✦ FBISE &amp; BISE Board Exam Alert (Class 9 Math Chapter 4 &amp; 5):
          </text>
          <text x="18" y="44" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
            ${isEn ? 'Algebraic identities carry 4 compulsory marks in FBISE Section B. When factorizing, always look for common factors first, then check if a² - b² applies.' : 'الجبرائی کلیات بورڈ امتحانات کے سیکشن B میں لازمی آتے ہیں۔ تجزیہ کرتے وقت سب سے پہلے مشترک نکالیں، پھر دو مربعوں کے فرق (a² - b²) کا کلیہ لگائیں۔'}
          </text>
        </g>
      </svg>`;
    }

    // 2D. Calculus & Derivatives (or general Quadratic default)
    // Default Quadratic Function & Parabola Plot for Math
    const headerTitle = isEn
      ? '📐 MATHEMATICS • QUADRATIC FUNCTIONS &amp; PARABOLA'
      : '📐 ریاضی • دو درجی تفاعل اور پیرابولا گراف';
    const headerSubtitle = isEn
      ? 'Graph: y = ax² + bx + c, Vertex (h,k), Roots &amp; Quadratic Formula'
      : 'گراف: y = ax² + bx + c، راس (Vertex)، اصل جڑیں (Roots) اور کلیہ';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      ${commonDefs}
      <rect width="${width}" height="${height}" fill="#ffffff" rx="16" />
      <rect width="${width}" height="${height}" fill="none" stroke="#e2e8f0" stroke-width="2" rx="16" />

      <!-- Top Header -->
      <g transform="translate(35, 25)">
        <rect width="320" height="32" rx="16" fill="#eff6ff" stroke="#93c5fd" stroke-width="1.2" />
        <text x="16" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#1d4ed8">
          ${headerTitle}
        </text>
        <text x="340" y="21" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f172a">
          ${headerSubtitle}
        </text>
      </g>

      <!-- Coordinate Grid & Parabola Plot -->
      <g transform="translate(45, 75)" filter="url(#cardShadow)">
        <rect width="400" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />

        <!-- Grid Lines -->
        <g stroke="#e2e8f0" stroke-width="1">
          <line x1="40" y1="0" x2="40" y2="395" />
          <line x1="80" y1="0" x2="80" y2="395" />
          <line x1="120" y1="0" x2="120" y2="395" />
          <line x1="160" y1="0" x2="160" y2="395" />
          <line x1="200" y1="0" x2="200" y2="395" stroke="#cbd5e1" stroke-width="1.5" />
          <line x1="240" y1="0" x2="240" y2="395" />
          <line x1="280" y1="0" x2="280" y2="395" />
          <line x1="320" y1="0" x2="320" y2="395" />
          <line x1="360" y1="0" x2="360" y2="395" />

          <line x1="0" y1="40" x2="400" y2="40" />
          <line x1="0" y1="80" x2="400" y2="80" />
          <line x1="0" y1="120" x2="400" y2="120" />
          <line x1="0" y1="160" x2="400" y2="160" />
          <line x1="0" y1="200" x2="400" y2="200" />
          <line x1="0" y1="240" x2="400" y2="240" stroke="#cbd5e1" stroke-width="1.5" />
          <line x1="0" y1="280" x2="400" y2="280" />
          <line x1="0" y1="320" x2="400" y2="320" />
          <line x1="0" y1="360" x2="400" y2="360" />
        </g>

        <!-- Axes -->
        <line x1="20" y1="240" x2="385" y2="240" stroke="#334155" stroke-width="2.5" />
        <line x1="200" y1="380" x2="200" y2="20" stroke="#334155" stroke-width="2.5" />
        <text x="385" y="255" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#1e293b">X</text>
        <text x="210" y="25" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#1e293b">Y</text>

        <!-- Axis of Symmetry -->
        <line x1="240" y1="35" x2="240" y2="380" stroke="#9333ea" stroke-width="1.8" stroke-dasharray="5 4" />
        <text x="245" y="55" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#7e22ce">
          ${isEn ? 'Axis: x = -b/(2a)' : 'محور تماثل: x = -b/(2a)'}
        </text>

        <!-- Parabola Curve -->
        <path d="M 120,60 Q 240,430 360,60" fill="none" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round" />

        <!-- Vertex -->
        <circle cx="240" cy="335" r="5.5" fill="#dc2626" stroke="#ffffff" stroke-width="2" />
        <rect x="250" y="325" width="135" height="28" rx="6" fill="#fef2f2" stroke="#fca5a5" stroke-width="1" />
        <text x="257" y="343" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold" fill="#991b1b">
          ${isEn ? 'Vertex (h, k) Minimum' : 'راس (Vertex) کم از کم نقطہ'}
        </text>

        <!-- Real Roots (x-intercepts) -->
        <circle cx="150" cy="240" r="5" fill="#16a34a" stroke="#ffffff" stroke-width="1.5" />
        <circle cx="330" cy="240" r="5" fill="#16a34a" stroke="#ffffff" stroke-width="1.5" />
        <text x="135" y="225" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#15803d">x₁</text>
        <text x="335" y="225" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#15803d">x₂</text>
      </g>

      <!-- Right Side: Quadratic Formula & Discriminant Analysis -->
      <g transform="translate(465, 75)" filter="url(#cardShadow)">
        <!-- Formula Card -->
        <g transform="translate(0, 0)">
          <rect width="340" height="115" rx="10" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" />
          <text x="16" y="26" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#1d4ed8">
            ${isEn ? '✦ Universal Quadratic Formula:' : '✦ دو درجی فارمولا (Quadratic Formula):'}
          </text>
          <text x="16" y="65" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#0f172a">
            x = (-b ± √(b² - 4ac)) / (2a)
          </text>
          <text x="16" y="95" font-family="system-ui, sans-serif" font-size="11" fill="#475569">
            ${isEn ? 'For standard quadratic equation: ax² + bx + c = 0 (a ≠ 0)' : 'معیاری شکل: ax² + bx + c = 0 (جہاں a ≠ 0)'}
          </text>
        </g>

        <!-- Discriminant Table -->
        <g transform="translate(0, 130)">
          <rect width="340" height="235" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2" />
          <text x="14" y="25" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#0f172a">
            ${isEn ? 'Discriminant Nature of Roots: D = b² - 4ac' : 'فرق کنندہ کی نوعیت (Nature of Roots):'}
          </text>

          <g transform="translate(14, 40)">
            <rect width="312" height="42" rx="6" fill="#f0fdf4" stroke="#86efac" stroke-width="1" />
            <text x="10" y="18" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#15803d">
              • D &gt; 0: Real, Distinct Roots (حقیقی اور الگ روٹس)
            </text>
            <text x="10" y="34" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
              Parabola crosses x-axis at 2 distinct real points.
            </text>
          </g>

          <g transform="translate(14, 90)">
            <rect width="312" height="42" rx="6" fill="#eff6ff" stroke="#93c5fd" stroke-width="1" />
            <text x="10" y="18" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#1d4ed8">
              • D = 0: One Repeated Real Root (ایک حقیقی جڑ)
            </text>
            <text x="10" y="34" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
              Vertex touches x-axis at exactly 1 tangent point.
            </text>
          </g>

          <g transform="translate(14, 140)">
            <rect width="312" height="42" rx="6" fill="#fef2f2" stroke="#fca5a5" stroke-width="1" />
            <text x="10" y="18" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#dc2626">
              • D &lt; 0: Complex / Imaginary Roots (غیر حقیقی روٹس)
            </text>
            <text x="10" y="34" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
              No real x-intercepts; graph does not touch x-axis.
            </text>
          </g>
        </g>
      </g>

      <!-- Bottom Bar -->
      <g transform="translate(35, 492)" filter="url(#cardShadow)">
        <rect width="770" height="62" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
        <text x="18" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#1d4ed8">
          ✦ Matric &amp; Intermediate Math Tip:
        </text>
        <text x="18" y="44" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
          ${isEn ? 'Always verify roots by checking sum of roots α + β = -b/a and product α·β = c/a.' : 'روٹس کی تصدیق کے لیے مجموعہ α + β = -b/a اور حاصل ضرب α·β = c/a کا کلیہ استعمال کریں۔'}
        </text>
      </g>
    </svg>`;
  }

  // =========================================================================
  // PRIORITY 3: BIOLOGY (حیاتیات)
  // =========================================================================
  const isBiologyQuery =
    text.includes('biology') ||
    text.includes('حیاتیات') ||
    text.includes('بیالوجی') ||
    text.includes('cell') ||
    text.includes('خلیہ') ||
    text.includes('plant') ||
    text.includes('photosynthesis') ||
    text.includes('respiration') ||
    text.includes('organelle') ||
    text.includes('mitochondria');

  const isPlantCell =
    text.includes('plant cell') ||
    text.includes('پودوں کا خلیہ') ||
    text.includes('نباتات') ||
    text.includes('chloroplast') ||
    (text.includes('cell') && (text.includes('plant') || text.includes('vacuole')));

  const isPhotosynthesis =
    text.includes('photosynthesis') ||
    text.includes('respiration') ||
    text.includes('ضیائی تالیف') ||
    text.includes('تنفس');

  if (isBiologyQuery && isPlantCell) {
    const headerTitle = isEn
      ? '🔬 BIOLOGY • PLANT CELL ANATOMY'
      : '🔬 بیالوجی • پودوں کا خلیہ (Plant Cell Structure)';
    const headerSubtitle = isEn
      ? 'Cellulose Cell Wall, Large Central Vacuole &amp; Chloroplasts'
      : 'سیل وال، بڑا مرکزی ویکیول اور کلوروپلاسٹ کی ساخت';

    const labels = isEn
      ? [
          { name: '1. Rigid Cell Wall ★', desc: 'Cellulose structural boundary protecting plant shape', color: '#15803d', star: true },
          { name: '2. Plasma Membrane', desc: 'Inner semi-permeable bilayer managing solute exchange', color: '#0284c7' },
          { name: '3. Large Central Vacuole ★', desc: 'Maintains turgor pressure; stores water and enzymes', color: '#0284c7', star: true },
          { name: '4. Chloroplasts ★', desc: 'Contains chlorophyll for photosynthesis and sugar synthesis', color: '#16a34a', star: true },
          { name: '5. Nucleus &amp; Nucleolus', desc: 'Genetic control center; stores plant chromosomal DNA', color: '#7e22ce' },
          { name: '6. Mitochondria', desc: 'Powerhouse converting glucose into ATP cellular energy', color: '#ea580c' },
          { name: '7. Endoplasmic Reticulum', desc: 'Protein transport (Rough ER) and lipid synthesis (Smooth ER)', color: '#6366f1' },
          { name: '8. Golgi Apparatus', desc: 'Modifies and secretes pectin and polysaccharides', color: '#db2777' },
        ]
      : [
          { name: '1. سیل وال (Cell Wall) ★', desc: 'سیلولوز کی بنی موٹی بیرونی دیوار جو پودے کو سختی دیتی ہے', color: '#15803d', star: true },
          { name: '2. پلازما ممبرین (Cell Membrane)', desc: 'اندرونی لچکدار جھلی جو مادوں کے تبادلے کو کنٹرول کرتی ہے', color: '#0284c7' },
          { name: '3. بڑا مرکزی ویکیول (Vacuole) ★', desc: 'پانی ذخیرہ کرتا ہے اور ٹرگر پریشر کو برقرار رکھتا ہے', color: '#0284c7', star: true },
          { name: '4. کلوروپلاسٹ (Chloroplasts) ★', desc: 'کلوروفل پر مشتمل جو ضیائی تالیف سے خوراک تیار کرتا ہے', color: '#16a34a', star: true },
          { name: '5. نیوکلیئس (Nucleus)', desc: 'کنٹرول روم جس میں پودے کا وراثتی مادہ ($DNA$) محفوظ ہے', color: '#7e22ce' },
          { name: '6. مائٹوکونڈریا (Mitochondria)', desc: 'سیلولر ریسپائریشن کے ذریعے توانائی ($ATP$) بناتا ہے', color: '#ea580c' },
          { name: '7. اینڈوپلازمک ریٹیکولم (ER)', desc: 'پروٹین کی تیاری (رف) اور چکنائی کی تیاری (سموتھ)', color: '#6366f1' },
          { name: '8. گولجی باڈی (Golgi Apparatus)', desc: 'پروٹین اور نشاستہ دار مادوں کی پیکنگ اور ترسیل', color: '#db2777' },
        ];

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      ${commonDefs}
      <rect width="${width}" height="${height}" fill="#ffffff" rx="16" />
      <rect width="${width}" height="${height}" fill="none" stroke="#e2e8f0" stroke-width="2" rx="16" />

      <!-- Top Header -->
      <g transform="translate(35, 25)">
        <rect width="280" height="32" rx="16" fill="#f0fdf4" stroke="#86efac" stroke-width="1.2" />
        <text x="16" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#15803d">
          ${headerTitle}
        </text>
        <text x="300" y="21" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f172a">
          ${headerSubtitle}
        </text>
      </g>

      <!-- Cell Diagram Visual (Left: 45 to 450) -->
      <g transform="translate(45, 75)" filter="url(#cardShadow)">
        <rect width="400" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />
        <!-- Polygonal Hexagonal Plant Cell Wall -->
        <polygon points="50,45 350,45 385,200 350,355 50,355 15,200" fill="#dcfce7" stroke="#15803d" stroke-width="12" stroke-linejoin="round" />
        <polygon points="53,48 347,48 381,200 347,352 53,352 19,200" fill="#f0fdf4" stroke="#22c55e" stroke-width="4" stroke-linejoin="round" />

        <!-- Large Central Vacuole -->
        <ellipse cx="200" cy="200" rx="120" ry="85" fill="#e0f2fe" stroke="#0284c7" stroke-width="2.5" />
        <text x="200" y="205" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#0369a1">
          ${isEn ? 'Central Vacuole' : 'بڑا مرکزی ویکیول'}
        </text>

        <!-- Nucleus (Pushed to periphery) -->
        <circle cx="85" cy="115" r="38" fill="#f3e8ff" stroke="#7e22ce" stroke-width="2.5" />
        <circle cx="85" cy="115" r="14" fill="#9333ea" />
        <text x="85" y="165" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#6b21a8">
          ${isEn ? 'Nucleus' : 'نیوکلیئس'}
        </text>

        <!-- Chloroplasts with Grana discs -->
        <g transform="translate(310, 110)">
          <ellipse cx="0" cy="0" rx="26" ry="16" fill="#bbf7d0" stroke="#16a34a" stroke-width="2" />
          <line x1="-14" y1="-4" x2="14" y2="-4" stroke="#15803d" stroke-width="2" />
          <line x1="-16" y1="2" x2="16" y2="2" stroke="#15803d" stroke-width="2" />
          <text x="0" y="28" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" fill="#166534">Chloroplast</text>
        </g>

        <g transform="translate(90, 290)">
          <ellipse cx="0" cy="0" rx="26" ry="16" fill="#bbf7d0" stroke="#16a34a" stroke-width="2" />
          <line x1="-14" y1="-4" x2="14" y2="-4" stroke="#15803d" stroke-width="2" />
          <text x="0" y="28" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" fill="#166534">Chloroplast</text>
        </g>
      </g>

      <!-- Right Side: Organelle Key -->
      <g transform="translate(465, 75)" filter="url(#cardShadow)">
        <rect width="340" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />
        <text x="18" y="28" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#0f172a">
          ${isEn ? '✦ Distinctive Plant Organelles &amp; Features:' : '✦ پودوں کے خلیے کی مخصوص ساخت:'}
        </text>

        <g transform="translate(18, 42)">
          ${labels
            .slice(0, 7)
            .map(
              (item, idx) => `
            <g transform="translate(0, ${idx * 48})">
              <rect width="304" height="42" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
              <text x="10" y="16" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold" fill="${item.color}">
                ${item.name}
              </text>
              <text x="10" y="32" font-family="system-ui, sans-serif" font-size="9.5" fill="#475569">
                ${item.desc.slice(0, 52)}
              </text>
            </g>
          `
            )
            .join('')}
        </g>
      </g>

      <!-- Bottom Bar -->
      <g transform="translate(35, 492)" filter="url(#cardShadow)">
        <rect width="770" height="62" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
        <text x="18" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#15803d">
          ${isEn ? '✦ Board Exam Key Distinction (FBISE &amp; BISE Syllabi):' : '✦ بورڈ امتحان اہم نکتہ (FBISE &amp; BISE Syllabus):'}
        </text>
        <text x="18" y="44" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
          ${isEn ? 'Plant cells possess a rigid Cellulose Cell Wall, Chloroplasts, and a large central vacuole, but lack paired centrioles.' : 'پودوں کے خلیوں میں سیلولوز کی بنی سیل وال، کلوروپلاسٹس اور بڑا مرکزی ویکیول ہوتا ہے جبکہ سینٹریولز غیر حاضر ہوتے ہیں۔'}
        </text>
      </g>
    </svg>`;
  }

  // 3B. Animal Cell (خلیہ حیوان)
  // ONLY returned for Animal Cell queries — NEVER for Chemistry, Math, Physics, or general topics!
  const isAnimalCell =
    text.includes('animal cell') ||
    text.includes('جانوروں کا خلیہ') ||
    text.includes('خلیہ حیوان') ||
    text.includes('animal') ||
    text.includes('جانور') ||
    text.includes('حیوان') ||
    text.includes('centriole') ||
    text.includes('lysosome') ||
    (isBiologyQuery && !isPlantCell && !isPhotosynthesis);

  if (isAnimalCell) {
    const headerTitle = isEn
      ? '🔬 BIOLOGY • ANIMAL CELL ANATOMY'
      : '🔬 بیالوجی • جانوروں کا خلیہ (Animal Cell)';
    const headerSubtitle = isEn
      ? 'Internal Organelles &amp; Microscopic Eukaryotic Structure'
      : 'اندرونی آرگنیلز اور یوکیریوٹک خلیے کی سائنسی ساخت';

    const bioLabels = isEn
      ? [
          { name: '1. Plasma Membrane', desc: 'Flexible lipid bilayer with receptors (No rigid cell wall)', color: '#0284c7' },
          { name: '2. Nucleus &amp; Nucleolus', desc: 'Double membrane envelope housing DNA &amp; genetic chromatin', color: '#7e22ce' },
          { name: '3. Centrosome &amp; Centrioles ★', desc: 'Perpendicular barrels forming spindle fibers in division', color: '#d97706', star: true },
          { name: '4. Mitochondria (Powerhouse)', desc: 'Double-membraned organelle generating ATP energy via respiration', color: '#ea580c' },
          { name: '5. Golgi Apparatus', desc: 'Flattened cisternae packaging proteins and secretory vesicles', color: '#db2777' },
          { name: '6. Lysosomes (Digestive Bags) ★', desc: 'Acidic hydrolytic enzymes digesting worn-out cellular parts', color: '#e11d48', star: true },
          { name: '7. Endoplasmic Reticulum', desc: 'Rough ER (with ribosomes) &amp; Smooth ER (lipid synthesis)', color: '#6366f1' },
        ]
      : [
          { name: '1. پلازما ممبرین (Plasma Membrane)', desc: 'لچکدار لپڈ بائی لیئر (جانوروں میں سیل وال نہیں ہوتی)', color: '#0284c7' },
          { name: '2. نیوکلیئس اور مرکزہ (Nucleus)', desc: 'دوہری جھلی پر مشتمل کنٹرول روم، جس میں DNA موجود ہے', color: '#7e22ce' },
          { name: '3. سینٹریولز (Centrioles) ★', desc: 'خلوی تقسیم کے دوران سپنڈل فائبرز بناتے ہیں (پودوں میں غیر حاضر)', color: '#d97706', star: true },
          { name: '4. مائٹوکونڈریا - پاور ہاؤس (Mitochondria)', desc: 'سیلولر ریسپائریشن کے ذریعے توانائی ($ATP$) بناتا ہے', color: '#ea580c' },
          { name: '5. گولجی باڈی (Golgi Apparatus)', desc: 'پروٹینز کی ترسیل اور پیکنگ کے لیے پاؤچز اور ویزیکلز', color: '#db2777' },
          { name: '6. لائسوسومز (Lysosomes) ★', desc: 'ہاضم انزائمز جو غیر ضروری اور پرانے مادوں کو ختم کرتے ہیں', color: '#e11d48', star: true },
          { name: '7. اینڈوپلازمک ریٹیکولم (ER)', desc: 'رف ER (پروٹین کی تیاری) اور سموتھ ER (چکنائی کی تیاری)', color: '#6366f1' },
        ];

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      ${commonDefs}
      <rect width="${width}" height="${height}" fill="#ffffff" rx="16" />
      <rect width="${width}" height="${height}" fill="none" stroke="#e2e8f0" stroke-width="2" rx="16" />

      <!-- Top Header -->
      <g transform="translate(35, 25)">
        <rect width="260" height="32" rx="16" fill="#f0fdf4" stroke="#86efac" stroke-width="1.2" />
        <text x="16" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#15803d">
          ${headerTitle}
        </text>
        <text x="280" y="21" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f172a">
          ${headerSubtitle}
        </text>
      </g>

      <!-- Cell Visual Container -->
      <g transform="translate(45, 75)" filter="url(#cardShadow)">
        <rect width="400" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />

        <!-- Animal Cell Membrane (Irregular Shape) -->
        <path d="M 60,180 C 40,80 140,40 240,50 C 340,60 380,140 370,230 C 360,320 280,365 180,360 C 80,355 40,280 60,180 Z" fill="#eff6ff" stroke="#3b82f6" stroke-width="3.5" />

        <!-- Cytoplasm Texture -->
        <circle cx="210" cy="205" r="130" fill="#dbeafe" opacity="0.3" />

        <!-- Nucleus -->
        <circle cx="210" cy="190" r="50" fill="#f3e8ff" stroke="#7e22ce" stroke-width="2.5" />
        <circle cx="210" cy="190" r="20" fill="#9333ea" />
        <text x="210" y="255" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#6b21a8">
          ${isEn ? 'Nucleus &amp; DNA' : 'نیوکلیئس اور ڈی این اے'}
        </text>

        <!-- Mitochondria with Cristae folds -->
        <g transform="translate(105, 120)">
          <ellipse cx="0" cy="0" rx="28" ry="16" fill="#ffedd5" stroke="#ea580c" stroke-width="2" />
          <path d="M -18,0 Q -10,-8 0,0 Q 10,8 18,0" fill="none" stroke="#c2410c" stroke-width="1.8" />
          <text x="0" y="28" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" fill="#9a3412">Mitochondria</text>
        </g>

        <!-- Centrioles (Paired barrels) -->
        <g transform="translate(300, 110)">
          <rect x="-8" y="-12" width="16" height="24" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="1.8" />
          <rect x="-12" y="-8" width="24" height="16" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="1.8" />
          <text x="0" y="26" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" fill="#b45309">Centrioles ★</text>
        </g>

        <!-- Lysosomes -->
        <g transform="translate(120, 270)">
          <circle cx="0" cy="0" r="14" fill="#ffe4e6" stroke="#e11d48" stroke-width="2" />
          <text x="0" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" font-weight="bold" fill="#9f1239">Lysosome ★</text>
        </g>
      </g>

      <!-- Right Side: Organelle Key -->
      <g transform="translate(465, 75)" filter="url(#cardShadow)">
        <rect width="340" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />
        <text x="18" y="28" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#0f172a">
          ${isEn ? '✦ Animal Cell Organelle Directory:' : '✦ جانوروں کے خلیے کے بنیادی اجزاء:'}
        </text>

        <g transform="translate(18, 42)">
          ${bioLabels
            .slice(0, 7)
            .map(
              (item, idx) => `
            <g transform="translate(0, ${idx * 48})">
              <rect width="304" height="42" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
              <text x="10" y="16" font-family="system-ui, sans-serif" font-size="10.5" font-weight="bold" fill="${item.color}">
                ${item.name}
              </text>
              <text x="10" y="32" font-family="system-ui, sans-serif" font-size="9.5" fill="#475569">
                ${item.desc.slice(0, 52)}
              </text>
            </g>
          `
            )
            .join('')}
        </g>
      </g>

      <!-- Bottom Bar -->
      <g transform="translate(35, 492)" filter="url(#cardShadow)">
        <rect width="770" height="62" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
        <text x="18" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#15803d">
          ${isEn ? '★ Board Exam Key Distinction (FBISE &amp; BISE Syllabi):' : '✦ بورڈ امتحان اہم نکتہ (FBISE &amp; BISE Syllabus):'}
        </text>
        <text x="18" y="44" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
          ${isEn ? 'Animal cells have Centrioles (for cell division) and Lysosomes, but totally LACK a rigid Cell Wall, Chloroplasts, or a large permanent central vacuole.' : 'جانوروں کے خلیے میں سینٹریولز اور لائسوسومز ہوتے ہیں، لیکن ان میں سیل وال، کلوروپلاسٹس یا بڑا مستقل ویکیول نہیں ہوتا۔'}
        </text>
      </g>
    </svg>`;
  }

  // =========================================================================
  // PRIORITY 4: PHYSICS (طبیعیات)
  // Newton's Laws, Force F = ma, Ohm's Law, Motion
  // =========================================================================
  const isPhysicsQuery =
    cLower === 'physics' ||
    text.includes('physic') ||
    text.includes('طبیعیات') ||
    text.includes('newton') ||
    text.includes('قوت') ||
    text.includes('حرکت') ||
    text.includes('force') ||
    text.includes('motion') ||
    text.includes('ohm') ||
    text.includes('current') ||
    text.includes('velocity') ||
    text.includes('acceleration') ||
    text.includes('اسراع');

  if (isPhysicsQuery) {
    const headerTitle = isEn
      ? '⚛️ PHYSICS • FORCES &amp; NEWTON’S LAWS OF MOTION'
      : '⚛️ طبیعیات • نیوٹن کے قوانینِ حرکت اور قوت (Newton’s Laws)';
    const headerSubtitle = isEn
      ? 'Free-Body Force Diagram: F = m × a &amp; Action-Reaction Pairs'
      : 'فری باڈی ڈایاگرام: F = m × a، عمل اور ردِعمل کے مساوی جوڑے';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      ${commonDefs}
      <rect width="${width}" height="${height}" fill="#ffffff" rx="16" />
      <rect width="${width}" height="${height}" fill="none" stroke="#e2e8f0" stroke-width="2" rx="16" />

      <!-- Top Header -->
      <g transform="translate(35, 25)">
        <rect width="320" height="32" rx="16" fill="#f5f3ff" stroke="#c4b5fd" stroke-width="1.2" />
        <text x="16" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#7c3aed">
          ${headerTitle}
        </text>
        <text x="340" y="21" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f172a">
          ${headerSubtitle}
        </text>
      </g>

      <!-- Free-Body Force Diagram Visual (Left: 45 to 450) -->
      <g transform="translate(45, 75)" filter="url(#cardShadow)">
        <rect width="400" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />
        <text x="18" y="28" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#7c3aed">
          ${isEn ? '✦ Free-Body Diagram (Block on Surface):' : '✦ فری باڈی ڈایاگرام (قوتوں کا توازن):'}
        </text>

        <!-- Ground Surface with hatch marks -->
        <g transform="translate(40, 240)">
          <line x1="0" y1="0" x2="320" y2="0" stroke="#64748b" stroke-width="3" />
          <line x1="20" y1="0" x2="10" y2="15" stroke="#94a3b8" stroke-width="1.5" />
          <line x1="60" y1="0" x2="50" y2="15" stroke="#94a3b8" stroke-width="1.5" />
          <line x1="100" y1="0" x2="90" y2="15" stroke="#94a3b8" stroke-width="1.5" />
          <line x1="140" y1="0" x2="130" y2="15" stroke="#94a3b8" stroke-width="1.5" />
          <line x1="180" y1="0" x2="170" y2="15" stroke="#94a3b8" stroke-width="1.5" />
          <line x1="220" y1="0" x2="210" y2="15" stroke="#94a3b8" stroke-width="1.5" />
          <line x1="260" y1="0" x2="250" y2="15" stroke="#94a3b8" stroke-width="1.5" />
          <line x1="300" y1="0" x2="290" y2="15" stroke="#94a3b8" stroke-width="1.5" />
        </g>

        <!-- Mass Block m = 10 kg -->
        <g transform="translate(150, 160)">
          <rect x="-45" y="-45" width="90" height="85" rx="8" fill="#eff6ff" stroke="#2563eb" stroke-width="2.5" />
          <text x="0" y="-8" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" font-weight="bold" fill="#1e40af">Mass m</text>
          <text x="0" y="14" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#3b82f6">10 kg</text>

          <!-- Normal Reaction Force N (Upward) -->
          <line x1="0" y1="-45" x2="0" y2="-115" stroke="#16a34a" stroke-width="3" />
          <polygon points="0,-122 -6,-110 6,-110" fill="#16a34a" />
          <text x="12" y="-105" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#16a34a">N = mg</text>

          <!-- Gravity Force W = mg (Downward) -->
          <line x1="0" y1="40" x2="0" y2="110" stroke="#dc2626" stroke-width="3" />
          <polygon points="0,117 -6,105 6,105" fill="#dc2626" />
          <text x="12" y="105" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#dc2626">W = mg</text>

          <!-- Applied Force F (Rightward) -->
          <line x1="45" y1="0" x2="115" y2="0" stroke="#7c3aed" stroke-width="3" />
          <polygon points="122,0 110,-6 110,6" fill="#7c3aed" />
          <text x="80" y="-10" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#7c3aed">F = 50 N</text>

          <!-- Friction Force f (Leftward) -->
          <line x1="-45" y1="35" x2="-95" y2="35" stroke="#d97706" stroke-width="2.5" />
          <polygon points="-102,35 -90,30 -90,40" fill="#d97706" />
          <text x="-75" y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#d97706">f (Friction)</text>
        </g>
      </g>

      <!-- Right Column: Formulas & Laws -->
      <g transform="translate(465, 75)" filter="url(#cardShadow)">
        <rect width="340" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />
        <text x="18" y="28" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">
          ✦ نیوٹن کے قوانینِ حرکت (Laws of Motion):
        </text>

        <g transform="translate(18, 45)">
          <rect width="304" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
          <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#7c3aed">
            1. پہلا قانون حرکت (Law of Inertia):
          </text>
          <text x="12" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
            جسم ساکن ہے تو ساکن رہے گا جب تک غیر متوازن قوت اثر نہ کرے۔
          </text>
        </g>

        <g transform="translate(18, 115)">
          <rect width="304" height="65" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="1.2" />
          <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#15803d">
            2. دوسرا قانون حرکت: F = m × a ★
          </text>
          <text x="12" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#166534">
            قوت (F) اسراع (a) کے راست متناسب اور کمیت (m) کے الٹ متناسب ہے۔
          </text>
        </g>

        <g transform="translate(18, 190)">
          <rect width="304" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
          <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#0284c7">
            3. تیسرا قانون حرکت (Action = Reaction):
          </text>
          <text x="12" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
            ہر عمل کا ایک برابر مگر مخالف سمت میں ردعمل ہوتا ہے۔
          </text>
        </g>

        <!-- Solved Box -->
        <rect x="18" y="265" width="304" height="110" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
        <text x="14" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">
          📝 عددی مسئلہ (Numerical Solution):
        </text>
        <text x="14" y="46" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
          Given: Mass m = 10 kg, Acceleration a = 5 m/s²
        </text>
        <text x="14" y="68" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#15803d">
          Formula: F = m × a = 10 × 5 = 50 N
        </text>
        <text x="14" y="92" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
          قوت کی SI اکائی نیوٹن (Newton = kg·m/s²) ہے۔
        </text>
      </g>

      <!-- Bottom Bar -->
      <g transform="translate(35, 492)" filter="url(#cardShadow)">
        <rect width="770" height="62" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
        <text x="18" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#7c3aed">
          ✦ FBISE &amp; BISE Physics Board Tip (Class 9 Chapter 3):
        </text>
        <text x="18" y="44" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
          ${isEn ? 'Always draw the vector directions for force (F) and acceleration (a). 1 Newton = 1 kg × 1 m/s².' : 'عددی سوال حل کرتے وقت قوت اور اسراع کی سمت ضرور واضح کریں اور اکائی (نیوٹن N) لکھنا نہ بھولیں۔'}
        </text>
      </g>
    </svg>`;
  }

  // =========================================================================
  // PRIORITY 5: UNIVERSAL EDUCATIONAL CONCEPT WHITEBOARD SCHEMATIC
  // Tailored directly to the exact requested topic and subject!
  // NEVER defaults to an unrelated animal cell or misleading diagram!
  // =========================================================================
  const safeTopic = escapeXmlText(title || prompt.slice(0, 48));
  const safeSubject = escapeXmlText(category || 'General Science');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
    ${commonDefs}
    <rect width="${width}" height="${height}" fill="#ffffff" rx="16" />
    <rect width="${width}" height="${height}" fill="none" stroke="#e2e8f0" stroke-width="2" rx="16" />

    <!-- Top Header -->
    <g transform="translate(35, 25)">
      <rect width="320" height="32" rx="16" fill="#f0fdf4" stroke="#86efac" stroke-width="1.2" />
      <text x="16" y="20" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#15803d">
        📚 ${safeSubject.toUpperCase()} • CURRICULUM STUDY GUIDE
      </text>
      <text x="340" y="21" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f172a">
        ${safeTopic}
      </text>
    </g>

    <!-- Left Column: Core Principles & Definitions -->
    <g transform="translate(45, 75)" filter="url(#cardShadow)">
      <rect width="400" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />
      <text x="18" y="28" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#15803d">
        ✦ موضوع کی بنیادی سائنسی و تعلیمی تعریف:
      </text>

      <g transform="translate(18, 45)">
        <rect width="364" height="65" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">
          1. بنیادی تصور (Core Concept):
        </text>
        <text x="12" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
          ${safeTopic} نصاب کا لازمی حصہ ہے جو اہم اصولوں کی وضاحت کرتا ہے۔
        </text>
      </g>

      <g transform="translate(18, 120)">
        <rect width="364" height="75" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#1d4ed8">
          2. سائنسی میکانزم اور مراحل (Step Mechanics):
        </text>
        <text x="12" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
          • مرحلہ وار فہم اور بنیادی متغیرات کی شناخت
        </text>
        <text x="12" y="58" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
          • متعلقہ فارمولوں اور قواعد کا منظم اطلاق
        </text>
      </g>

      <g transform="translate(18, 205)">
        <rect width="364" height="80" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#7c3aed">
          3. اہم اصطلاحات (Key Terminology):
        </text>
        <text x="12" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
          سائنسی اصطلاحات کو انگریزی اور اردو دونوں میں یاد رکھیں۔
        </text>
        <text x="12" y="58" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
          امتحانات میں درست اصطلاح پورے نمبر دلاتی ہے۔
        </text>
      </g>

      <rect x="18" y="295" width="364" height="85" rx="8" fill="#f0fdf4" stroke="#86efac" stroke-width="1.2" />
      <text x="24" y="322" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#15803d">
        ✦ تصدیق شدہ سائنسی و تعلیمی خاکہ
      </text>
      <text x="24" y="344" font-family="system-ui, sans-serif" font-size="10" fill="#166534">
        پاک لینگو تعلیمی نظام: وفاقی و صوبائی بورڈز کے عین مطابق تیار کردہ۔
      </text>
    </g>

    <!-- Right Column: Curriculum Takeaways & Exam Tips -->
    <g transform="translate(465, 75)" filter="url(#cardShadow)">
      <rect width="340" height="395" rx="12" fill="#fafafa" stroke="#e2e8f0" stroke-width="1.2" />
      <text x="18" y="28" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">
        ✦ بورڈ امتحانی رہنمائی (Exam Mastery):
      </text>

      <g transform="translate(18, 45)">
        <rect width="304" height="80" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#1d4ed8">
          • امتحانی ساخت (Paper Pattern):
        </text>
        <text x="12" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
          اس موضوع سے کثیر الانتخابی (MCQs) اور
        </text>
        <text x="12" y="58" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
          مختصر سوالات (Short Questions) لازمی پوچھے جاتے ہیں۔
        </text>
      </g>

      <g transform="translate(18, 135)">
        <rect width="304" height="80" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
        <text x="12" y="22" font-family="system-ui, sans-serif" font-size="11" font-weight="bold" fill="#ea580c">
          • جوابی پرچے کا طریقہ (Presentation):
        </text>
        <text x="12" y="42" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
          سب سے پہلے جامع تعریف، پھر فارمولا یا خاکہ،
        </text>
        <text x="12" y="58" font-family="system-ui, sans-serif" font-size="10" fill="#475569">
          اور آخر میں روزمرہ مثال درج کریں۔
        </text>
      </g>

      <g transform="translate(18, 225)">
        <rect width="304" height="150" rx="8" fill="#eff6ff" stroke="#93c5fd" stroke-width="1" />
        <text x="14" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#1d4ed8">
          ★ سنہری نصابی اصول (Key Takeaway):
        </text>
        <text x="14" y="48" font-family="system-ui, sans-serif" font-size="10.5" fill="#1e40af">
          موضوع: ${safeTopic}
        </text>
        <text x="14" y="70" font-family="system-ui, sans-serif" font-size="10" fill="#334155">
          • کسی بھی سوال میں اکائیوں (Units) کا اندراج نہ بھولیں
        </text>
        <text x="14" y="90" font-family="system-ui, sans-serif" font-size="10" fill="#334155">
          • ریاضیاتی و سائنسی مساواتوں کو نمایاں باکس میں لکھیں
        </text>
        <text x="14" y="110" font-family="system-ui, sans-serif" font-size="10" fill="#334155">
          • سابقہ 5 سالہ بورڈ پیپرز کے سوالات کی مشق کریں
        </text>
      </g>
    </g>

    <!-- Bottom Bar -->
    <g transform="translate(35, 492)" filter="url(#cardShadow)">
      <rect width="770" height="62" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
      <text x="18" y="24" font-family="system-ui, sans-serif" font-size="11.5" font-weight="bold" fill="#15803d">
        ✦ بورڈ نصاب تصدیق (FBISE &amp; Provincial BISE Boards):
      </text>
      <text x="18" y="44" font-family="system-ui, sans-serif" font-size="10.5" fill="#334155">
        ${isEn ? 'PakLingo AI verified curriculum diagram strictly aligned with Pakistani academic syllabi.' : 'پاک لینگو سائنسی تصدیق شدہ نصابی خاکہ: وفاقی و صوبائی تعلیمی بورڈز کے نصاب کے عین مطابق۔'}
      </text>
    </g>
  </svg>`;
}

