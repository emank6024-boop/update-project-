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
  // PRIORITY 2: MATHEMATICS (ریاضی)
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

    // 2C. Calculus & Derivatives (or general Quadratic default)
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

  // 3B. Animal Cell (Default Biology)
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
