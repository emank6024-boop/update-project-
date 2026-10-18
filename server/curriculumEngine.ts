/**
 * PakLingo AI Comprehensive Educational Curriculum Engine
 * Provides scientifically authentic, syllabus-aligned lessons, quizzes,
 * step-by-step problem solvers, and flashcards for Pakistani boards (FBISE, Punjab,
 * Sindh, KPK, Balochistan) across all Matric, FSc, and Cambridge subjects.
 */

interface CurriculumTopicData {
  titleEn: string;
  titleUr: string;
  keywords: string[];
  overviewEn: string;
  overviewUr: string;
  explanationEn: string;
  explanationUr: string;
  breakdownEn: string;
  breakdownUr: string;
  pakistanExampleEn: string;
  pakistanExampleUr: string;
  examTipsEn: string[];
  examTipsUr: string[];
  quizzesEn: Array<{ question: string; options: string[]; correctIndex: number; explanation: string }>;
  quizzesUr: Array<{ question: string; options: string[]; correctIndex: number; explanation: string }>;
  flashcardsEn: Array<{ front: string; back: string; category?: string }>;
  flashcardsUr: Array<{ front: string; back: string; category?: string }>;
}

const TOPICS_DB: Record<string, CurriculumTopicData> = {
  animal_cell: {
    titleEn: 'Animal Cell Structure and Organelles',
    titleUr: 'جانوروں کا خلیہ اور خلوی ساخت (Animal Cell Anatomy)',
    keywords: ['animal cell', 'جانور', 'خلیہ', 'organelles', 'cytoplasm', 'nucleus', 'mitochondria'],
    overviewEn: `An animal cell is a eukaryotic cell enclosed by a flexible plasma membrane, containing membrane-bound organelles without a rigid cell wall or chloroplasts. The diameter typically ranges from $10\\,\\mu\\mathrm{m}$ to $30\\,\\mu\\mathrm{m}$.`,
    overviewUr: `جانوروں کا خلیہ ایک یوکیریوٹک خلیہ ہے جس کے گرد لچکدار پلازما ممبرین ہوتی ہے۔ اس میں نیوکلیئس اور جھلی دار آرگنیلز (Organelles) موجود ہوتے ہیں، لیکن پودوں کے خلیے کی طرح سیل وال (Cell Wall) یا کلوروپلاسٹ نہیں پائے جاتے۔`,
    explanationEn: `Unlike plant cells which have a rigid cellulose wall, animal cells have irregular, flexible shapes that allow movement and tissue flexibility. The cytoplasm serves as the fluid medium where cellular metabolic processes occur, suspended with organelles like the nucleus (genetic control centre), mitochondria (ATP powerhouse), and ribosomes (protein factories).`,
    explanationUr: `پودوں کے سخت خلیوں کے برعکس، جانوروں کے خلیے کی شکل لچکدار اور تغیر پذیر ہوتی ہے۔ خلیے کا سائٹوپلازم ایک جیلی نما سیال ہے جس میں مختلف اہم اعضاء یعنی آرگنیلز تیرتے رہتے ہیں، مثلاً نیوکلیئس جو خلیے کا کنٹرول روم ہے، مائٹوکونڈریا جو توانائی کا گھر ہے، اور رائبوسومز جو پروٹین تیار کرتے ہیں۔`,
    breakdownEn: `The fundamental organelles of an animal cell include:

1. **Plasma Membrane:** A phospholipid bilayer with embedded proteins, regulating the selective entry and exit of molecules through osmotic balance ($P = \\rho g h$).
2. **Nucleus & Nucleolus:** Enclosed in a double-layered nuclear membrane with pores. Contains chromatin ($DNA$) and synthesizes ribosomal subunits ($RNA$).
3. **Mitochondria:** Generates cellular energy through aerobic respiration via adenosine triphosphate:
   $$\\mathrm{C}_6\\mathrm{H}_{12}\\mathrm{O}_6 + 6\\mathrm{O}_2 \\longrightarrow 6\\mathrm{CO}_2 + 6\\mathrm{H}_2\\mathrm{O} + 36\\,\\mathrm{ATP}$$
4. **Endoplasmic Reticulum (ER):**
   - Rough ER (studded with ribosomes): synthesizes export proteins.
   - Smooth ER (no ribosomes): synthesizes lipids and detoxifies chemicals.
5. **Golgi Apparatus:** Flattened membrane sacs (cisternae) that modify, sort, and package proteins into secretory vesicles.
6. **Centrioles & Centrosome:** Nine triplets of microtubules arranged in a ring, forming the spindle apparatus during mitosis ($2n \\to 2n$).
7. **Lysosomes:** Contain digestive hydrolytic enzymes for intracellular digestion and autolysis.`,
    breakdownUr: `جانوروں کے خلیے کے بنیادی اجزاء اور ان کے افعال درج ذیل ہیں:

1. **پلازما ممبرین (Plasma Membrane):** فاسفولپڈز کی دوہری تہہ جو خلیے کو تحفظ دیتی ہے اور مادوں کی آمد و رفت کو کنٹرول کرتی ہے۔
2. **نیوکلیئس (Nucleus):** خلیے کا مرکزی کنٹرول روم، جس میں کروموسومز اور وراثتی مادہ ($DNA$) موجود ہوتا ہے۔
3. **مائٹوکونڈریا (Mitochondria):** خلیے کا پاور ہاؤس، جو ریسپائریشن کے ذریعے توانائی ($ATP$) بناتا ہے:
   $$\\mathrm{C}_6\\mathrm{H}_{12}\\mathrm{O}_6 + 6\\mathrm{O}_2 \\longrightarrow 6\\mathrm{CO}_2 + 6\\mathrm{H}_2\\mathrm{O} + 36\\,\\mathrm{ATP}$$
4. **اینڈوپلازمک ریٹیکولم (Endoplasmic Reticulum):**
   - رف (Rough ER): پروٹین کی تیاری میں مدد دیتا ہے۔
   - سموتھ (Smooth ER): چکنائیوں (Lipids) کی تیاری اور زہریلے مادوں کو بے اثر کرتا ہے۔
5. **گولجی اپریٹس (Golgi Apparatus):** پروٹینز کو پیک کرکے خلیے کے مختلف حصوں میں بھیجتا ہے۔
6. **سینٹریولز (Centrioles):** خلوی تقسیم (Cell Division) کے دوران سپنڈل فائبرز بناتے ہیں۔
7. **لائسوسومز (Lysosomes):** ان میں ہاضم انزائمز ہوتے ہیں جو پرانے اور ناکارہ مادوں کو ختم کرتے ہیں۔`,
    pakistanExampleEn: `In human blood samples analyzed at Pakistani diagnostic laboratories (such as Shaukat Khanum or Chughtai Lab), red and white blood cells demonstrate pure animal cell morphology. Red blood cells (erythrocytes) uniquely eject their nucleus to maximize haemoglobin capacity ($Hb$), while active leukocytes retain prominent multi-lobed nuclei and extensive lysosomes to destroy pathogens.`,
    pakistanExampleUr: `پاکستان کی لیبارٹریوں (جیسے شوکت خانم یا چغتائی لیب) میں جب انسانی خون کا معائنہ کیا جاتا ہے، تو سرخ اور سفید خلیات جانوروں کے خلیے کی بہترین مثال ہیں۔ سرخ خلیات آکسیجن کی منتقلی کے لیے نیوکلیئس خارج کر دیتے ہیں، جبکہ سفید خلیات میں جراثیم کے خاتمے کے لیے بھرپور لائسوسومز پائے جاتے ہیں۔`,
    examTipsEn: [
      'In FBISE and Punjab Board diagrams, always clearly label Centrioles and Lysosomes (features absent in typical higher plant cells).',
      'Never draw a rigid cell wall or a large central vacuole on an animal cell diagram in exams.',
      'Remember the formula for cellular energy: 1 Glucose molecule yields up to $36\\text{--}38$ ATP molecules through aerobic respiration.',
      'Differentiate between rough ER (has ribosomes) and smooth ER (lipid synthesis) in short questions.',
    ],
    examTipsUr: [
      'فیڈرل اور پنجاب بورڈ کے پیپرز میں ڈایاگرام بناتے وقت سینٹریولز اور لائسوسومز کی لیبلنگ لازمی کریں، کیونکہ یہ پودوں میں نہیں ہوتے۔',
      'امتحان میں جانوروں کے خلیے کے گرد کبھی بھی سیل وال یا بڑا مرکزی ویکیول نہ بنائیں۔',
      'شارٹ کوسچن میں مائٹوکونڈریا کو پاور ہاؤس کہنے کی سائنسی وجہ ($ATP$ کی پیداوار) ضرور بیان کریں۔',
      'رف اور سموتھ اینڈوپلازمک ریٹیکولم کے مابین فرق اکثر معروضی اور مختصر سوالات میں آتا ہے۔',
    ],
    quizzesEn: [
      {
        question: 'Which organelle is exclusively found in animal cells and is responsible for spindle fibre formation during cell division?',
        options: ['Centriole', 'Chloroplast', 'Large Central Vacuole', 'Cell Wall'],
        correctIndex: 0,
        explanation: 'Centrioles are specialized barrel-shaped microtubule structures found in animal cells that organize the spindle apparatus.',
      },
      {
        question: 'What is the primary function of the mitochondria in an animal cell?',
        options: ['ATP Synthesis via Cellular Respiration', 'Photosynthesis', 'Storage of Starch', 'DNA Replication only'],
        correctIndex: 0,
        explanation: 'Mitochondria are the powerhouses of the cell where ATP is produced from glucose and oxygen through aerobic respiration.',
      },
      {
        question: 'Which organelle contains hydrolytic enzymes that break down cellular waste and worn-out parts?',
        options: ['Lysosome', 'Ribosome', 'Centrosome', 'Endoplasmic Reticulum'],
        correctIndex: 0,
        explanation: 'Lysosomes are membrane-bound digestive vesicles filled with acid hydrolases.',
      },
      {
        question: 'The plasma membrane of an animal cell is primarily composed of:',
        options: ['Phospholipid bilayer with proteins', 'Cellulose fibrils only', 'Peptidoglycan wall', 'Chitin layer'],
        correctIndex: 0,
        explanation: 'The animal cell membrane follows the Fluid Mosaic Model, consisting of a phospholipid bilayer with embedded integral and peripheral proteins.',
      },
    ],
    quizzesUr: [
      {
        question: 'جانوروں کے خلیے میں خلوی تقسیم (Cell Division) کے وقت سپنڈل فائبرز کون سا آرگنیل بناتا ہے؟',
        options: ['سینٹریول (Centriole)', 'کلوروپلاسٹ (Chloroplast)', 'سیل وال (Cell Wall)', 'ویکیول (Vacuole)'],
        correctIndex: 0,
        explanation: 'سینٹریولز جانوروں کے خلیے میں موجود ہوتے ہیں جو مائٹوسس کے دوران سپنڈل فائبرز تشکیل دیتے ہیں۔',
      },
      {
        question: 'خلیے کا "پاور ہاؤس" (Powerhouse of the Cell) کس آرگنیل کو کہا جاتا ہے؟',
        options: ['مائٹوکونڈریا (Mitochondria)', 'رائبوسوم (Ribosome)', 'گولجی باڈیز (Golgi Bodies)', 'لائسوسوم (Lysosome)'],
        correctIndex: 0,
        explanation: 'مائٹوکونڈریا ایروبک ریسپائریشن کے ذریعے اے ٹی پی (ATP) کی صورت میں توانائی پیدا کرتا ہے۔',
      },
      {
        question: 'خلیے کا وراثتی مادہ (DNA) کس میں محفوظ رہتا ہے؟',
        options: ['نیوکلیئس (Nucleus)', 'سائٹوپلازم', 'سیل ممبرین', 'رائبوسوم'],
        correctIndex: 0,
        explanation: 'نیوکلیئس کے اندر کروموسومز پر مشتمل ڈی این اے (DNA) محفوظ ہوتا ہے۔',
      },
      {
        question: 'پروٹین کی تیاری (Protein Synthesis) میں کون سا آرگنیل کلیدی کردار ادا کرتا ہے؟',
        options: ['رائبوسوم (Ribosome)', 'لائسوسوم (Lysosome)', 'ویکیول (Vacuole)', 'سینٹریول (Centriole)'],
        correctIndex: 0,
        explanation: 'رائبوسومز آر این اے کی مدد سے امائنو ایسڈز کو جوڑ کر پروٹین تیار کرتے ہیں۔',
      },
    ],
    flashcardsEn: [
      { front: 'What is the function of the Mitochondria?', back: 'Powerhouse of the cell; produces cellular energy ($ATP$) via aerobic respiration.' },
      { front: 'Why do animal cells lack a cell wall?', back: 'To allow flexibility and cellular motility required for animal locomotion and diverse tissue types.' },
      { front: 'What is the role of Centrioles?', back: 'Microtubule-organizing centers that form spindle fibers during cell division (mitosis and meiosis).' },
      { front: 'How does Rough ER differ from Smooth ER?', back: 'Rough ER has ribosomes on its surface for protein synthesis; Smooth ER produces lipids and detoxifies toxins.' },
      { front: 'What do Lysosomes do?', back: 'Contain acidic digestive enzymes for recycling worn-out organelles and destroying foreign pathogens.' },
      { front: 'What defines a Eukaryotic cell?', back: 'Possession of a true membrane-bound nucleus and specialized membrane-enclosed organelles.' },
    ],
    flashcardsUr: [
      { front: 'مائٹوکونڈریا کا اہم فعل کیا ہے؟', back: 'خلیے کا پاور ہاؤس؛ یہ تنفس کے ذریعے توانائی ($ATP$) بناتا ہے۔' },
      { front: 'جانوروں کے خلیے میں سیل وال کیوں نہیں ہوتی؟', back: 'تاکہ خلیات میں لچک رہے اور جاندار آسانی سے حرکات و سکنات کر سکیں۔' },
      { front: 'سینٹریولز کا کیا کام ہے؟', back: 'سیل ڈویژن کے دوران سپنڈل فائبرز بنانا جو کروموسومز کو الگ کرتے ہیں۔' },
      { front: 'رف اور سموتھ اینڈوپلازمک ریٹیکولم میں کیا فرق ہے؟', back: 'رف پر رائبوسومز ہوتے ہیں جو پروٹین بناتے ہیں، جبکہ سموتھ چکنائیاں تیار کرتا ہے۔' },
      { front: 'لائسوسومز کو خودکش تھیلیاں کیوں کہتے ہیں؟', back: 'کیونکہ ان میں ہاضم انزائمز ہوتے ہیں جو ناکارہ خلیاتی اجزاء کو تحلیل کرتے ہیں۔' },
      { front: 'نیوکلیئس کا بنیادی کام کیا ہے؟', back: 'وراثتی مادے ($DNA$) کی حفاظت اور خلیے کی تمام سرگرمیوں کو کنٹرول کرنا۔' },
    ],
  },

  quadratic_equations: {
    titleEn: 'Quadratic Equations and Quadratic Formula',
    titleUr: 'دو درجی مساوات اور دو درجی فارمولا (Quadratic Equations)',
    keywords: ['quadratic', 'دو درجی', 'مساوات', 'formula', 'root', 'discriminant', 'algebra'],
    overviewEn: `A quadratic equation in one variable $x$ is a second-degree polynomial equation of the standard form:
$$ax^2 + bx + c = 0 \\quad (a \\neq 0)$$
where $a, b, c \\in \\mathbb{R}$. The solutions are known as the roots of the equation.`,
    overviewUr: `دو درجی مساوات (Quadratic Equation) ایسی مساوات ہے جس میں متغیر (Variable) کی زیادہ سے زیادہ طاقت دو ($2$) ہوتی ہے:
$$ax^2 + bx + c = 0 \\quad (a \\neq 0)$$
جہاں $a, b, c$ حقیقی اعداد (Real Numbers) ہیں۔ اس کے حل کو مساوات کے روٹس (Roots) کہا جاتا ہے۔`,
    explanationEn: `Quadratic equations model parabolic trajectories, projectile motion, revenue optimization, and architectural arches. When standard factoring by grouping is difficult or impossible with rational numbers, the universal Quadratic Formula derived from completing the square delivers the exact roots for any quadratic equation.`,
    explanationUr: `دو درجی مساوات روزمرہ زندگی میں کرکٹ کی گیند کی پرواز، پلوں کی محرابوں اور کاروباری منافع کے تخمینے میں استعمال ہوتی ہے۔ جب کسی مساوات کے اجزائے ضربی (Factors) آسانی سے نہ بن سکیں، تو دو درجی فارمولا ہر قسم کی دو درجی مساوات کے درست روٹس معلوم کر دیتا ہے۔`,
    breakdownEn: `The exact derivation and mathematical structure:

1. **Standard Form:**
   $$ax^2 + bx + c = 0$$

2. **The Quadratic Formula:**
   $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

3. **The Discriminant ($D$):**
   $$D = b^2 - 4ac$$
   The value of $D$ determines the nature of the roots:
   - If $D > 0$ and a perfect square: Roots are **real, rational, and unequal**.
   - If $D > 0$ and not a perfect square: Roots are **real, irrational, and unequal**.
   - If $D = 0$: Roots are **real, rational, and equal** ($x = -\\frac{b}{2a}$).
   - If $D < 0$: Roots are **imaginary / complex conjugates** ($x = p \\pm qi$).

4. **Worked Step-by-Step Example:**
   Solve: $2x^2 - 4x - 6 = 0$
   - Coefficients: $a = 2$, $b = -4$, $c = -6$
   - Discriminant:
     $$D = (-4)^2 - 4(2)(-6) = 16 + 48 = 64$$
   - Applying the formula:
     $$x = \\frac{-(-4) \\pm \\sqrt{64}}{2(2)} = \\frac{4 \\pm 8}{4}$$
   - Roots:
     $$x_1 = \\frac{4 + 8}{4} = 3, \\quad x_2 = \\frac{4 - 8}{4} = -1$$`,
    breakdownUr: `دو درجی فارمولا اور اس کا طریقہ کار:

1. **معیاری شکل (Standard Form):**
   $$ax^2 + bx + c = 0$$

2. **دو درجی فارمولا (Quadratic Formula):**
   $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

3. **فرق کنندہ (Discriminant - $D$):**
   $$D = b^2 - 4ac$$
   فرق کنندہ کی مدد سے روٹس کی نوعیت معلوم ہوتی ہے:
   - اگر $D > 0$ ہو اور مکمل مربع ہو: روٹس **حقیقی، ناطق اور غیر مساوی** ہوں گے۔
   - اگر $D = 0$ ہو: روٹس **حقیقی، ناطق اور برابر** ہوں گے ($x = -\\frac{b}{2a}$)。
   - اگر $D < 0$ ہو: روٹس **غیر حقیقی / تخیلاتی (Imaginary)** ہوں گے۔

4. **مثال (Step-by-Step Solution):**
   حل کریں: $2x^2 - 4x - 6 = 0$
   - یہاں: $a = 2, \\, b = -4, \\, c = -6$
   - فرق کنندہ:
     $$D = (-4)^2 - 4(2)(-6) = 16 + 48 = 64$$
   - فارمولے میں قیمتیں درج کرنے پر:
     $$x = \\frac{-(-4) \\pm \\sqrt{64}}{2(2)} = \\frac{4 \\pm 8}{4}$$
   - پس روٹس حاصل ہوئے:
     $$x_1 = \\frac{12}{4} = 3, \\quad x_2 = \\frac{-4}{4} = -1$$`,
    pakistanExampleEn: `When Pakistan cricketer Shaheen Shah Afridi bowls a delivery or Babar Azam hits a six over long-on at Gaddafi Stadium Lahore, the vertical height $h(t)$ of the cricket ball in meters over time $t$ seconds is modeled by:
$$h(t) = -4.9t^2 + v_0 t + h_0$$
Solving for $h(t) = 0$ with the quadratic formula gives the exact landing time and distance of the ball.`,
    pakistanExampleUr: `جب قذافی اسٹیڈیم لاہور میں شاہین آفریدی گیند کرواتے ہیں یا بابر اعظم چھکا لگاتے ہیں، تو گیند کی اونچائی وقت کے لحاظ سے دو درجی مساوات کے ذریعے معلوم کی جاتی ہے:
$$h(t) = -4.9t^2 + v_0 t + h_0$$
اس مساوات کو حل کرنے سے گیند کے زمین پر پہنچنے کا درست وقت معلوم ہوتا ہے۔`,
    examTipsEn: [
      'Always bring the equation into standard form $ax^2 + bx + c = 0$ before identifying $a, b, c$. Watch out for negative signs!',
      'When calculating $b^2$, remember that $(-b)^2$ is always positive.',
      'Check your roots by substituting them back into the original equation to ensure zero balance.',
      'In BISE exams, show all intermediate steps: identification of coefficients, formula statement, substitution, and solution set $\\{x_1, x_2\\}$.',
    ],
    examTipsUr: [
      'فارمولا لگانے سے پہلے مساوات کو معیاری شکل $ax^2 + bx + c = 0$ میں لکھیں اور منفی علامات کا خاص خیال رکھیں۔',
      'فرق کنندہ معلوم کرتے وقت $(-b)^2$ ہمیشہ مثبت عدد آئے گا۔',
      'بورڈ امتحانات میں حل سیٹ (Solution Set) کو لازمی قوسین $\\{x_1, x_2\\}$ میں لکھیں تاکہ پورے نمبر ملیں۔',
      'حاصل شدہ روٹس کو اصل مساوات میں درج کر کے اپنے جواب کی تصدیق کریں۔',
    ],
    quizzesEn: [
      {
        question: 'What is the correct Quadratic Formula for solving $ax^2 + bx + c = 0$?',
        options: [
          '$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$',
          '$$x = \\frac{b \\pm \\sqrt{b^2 - 4ac}}{2a}$$',
          '$$x = \\frac{-b \\pm \\sqrt{b^2 + 4ac}}{a}$$',
          '$$x = -b \\pm \\sqrt{b^2 - 4ac}$$',
        ],
        correctIndex: 0,
        explanation: 'The universal quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.',
      },
      {
        question: 'If the discriminant $D = b^2 - 4ac$ equals $0$, the roots of the quadratic equation are:',
        options: ['Real, rational, and equal', 'Imaginary and complex', 'Irrational and distinct', 'Undefined'],
        correctIndex: 0,
        explanation: 'When $D = 0$, the square root term vanishes, giving exactly one repeated rational root: $x = -\\frac{b}{2a}$.',
      },
      {
        question: 'What are the roots of the equation $x^2 - 5x + 6 = 0$?',
        options: ['$x = 2$ and $x = 3$', '$x = -2$ and $x = -3$', '$x = 1$ and $x = 6$', '$x = -1$ and $x = 6$'],
        correctIndex: 0,
        explanation: 'Factoring: $(x - 2)(x - 3) = 0 \\implies x = 2$ or $x = 3$.',
      },
      {
        question: 'For the equation $3x^2 - 2x + 5 = 0$, what is the value of the discriminant?',
        options: ['$-56$', '$64$', '$56$', '$-16$'],
        correctIndex: 0,
        explanation: '$D = b^2 - 4ac = (-2)^2 - 4(3)(5) = 4 - 60 = -56 < 0$ (Roots are imaginary).',
      },
    ],
    quizzesUr: [
      {
        question: 'دو درجی مساوات $ax^2 + bx + c = 0$ کو حل کرنے کا درست فارمولا کون سا ہے؟',
        options: [
          '$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$',
          '$$x = \\frac{b \\pm \\sqrt{b^2 - 4ac}}{2a}$$',
          '$$x = \\frac{-b \\pm \\sqrt{b^2 + 4ac}}{2a}$$',
          '$$x = \\frac{-b + \\sqrt{b^2 - 4ac}}{a}$$',
        ],
        correctIndex: 0,
        explanation: 'دو درجی مساوات کا عالمگیر فارمولا $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ ہے۔',
      },
      {
        question: 'اگر فرق کنندہ $b^2 - 4ac = 0$ ہو تو روٹس کی نوعیت کیا ہوگی؟',
        options: ['حقیقی، ناطق اور برابر', 'غیر حقیقی (تخیلاتی)', 'غیر ناطق اور مختلف', 'لامحدود'],
        correctIndex: 0,
        explanation: 'جب فرق کنندہ صفر ہو تو روٹس حقیقی اور برابر ہوتے ہیں، یعنی $x = -\\frac{b}{2a}$۔',
      },
      {
        question: 'مساوات $x^2 - 9 = 0$ کا حل سیٹ کیا ہے؟',
        options: ['$\\{\\pm 3\\}$', '$\\{9\\}$', '$\\{-9\\}$', '$\\{3\\}$'],
        correctIndex: 0,
        explanation: '$x^2 = 9 \\implies x = \\pm \\sqrt{9} = \\pm 3$۔',
      },
      {
        question: 'مساوات $x^2 + 4x + 4 = 0$ کے فرق کنندہ کی قیمت کیا ہے؟',
        options: ['$0$', '$16$', '$-16$', '$32$'],
        correctIndex: 0,
        explanation: '$D = (4)^2 - 4(1)(4) = 16 - 16 = 0$۔',
      },
    ],
    flashcardsEn: [
      { front: 'What is the standard form of a quadratic equation?', back: '$$ax^2 + bx + c = 0 \\quad (a \\neq 0)$$' },
      { front: 'State the Quadratic Formula.', back: '$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$' },
      { front: 'What is the Discriminant formula?', back: '$$D = b^2 - 4ac$$' },
      { front: 'What does a negative discriminant ($D < 0$) indicate?', back: 'The roots are imaginary (complex conjugates) with no real intersections on the x-axis.' },
      { front: 'What is the sum of roots in $ax^2 + bx + c = 0$?', back: '$$\\alpha + \\beta = -\\frac{b}{a}$$' },
      { front: 'What is the product of roots in $ax^2 + bx + c = 0$?', back: '$$\\alpha \\cdot \\beta = \\frac{c}{a}$$' },
    ],
    flashcardsUr: [
      { front: 'دو درجی مساوات کی معیاری شکل کیا ہے؟', back: '$$ax^2 + bx + c = 0 \\quad (a \\neq 0)$$' },
      { front: 'دو درجی فارمولا بیان کریں۔', back: '$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$' },
      { front: 'فرق کنندہ (Discriminant) کا فارمولا کیا ہے؟', back: '$$D = b^2 - 4ac$$' },
      { front: 'اگر فرق کنندہ منفی ($D < 0$) ہو تو کیا نتیجہ ہوگا؟', back: 'روٹس غیر حقیقی (تخیلاتی / Complex) ہوں گے۔' },
      { front: 'روٹس کا مجموعہ (Sum of Roots) کیا ہوتا ہے؟', back: '$$\\alpha + \\beta = -\\frac{b}{a}$$' },
      { front: 'روٹس کا حاصل ضرب (Product of Roots) کیا ہوتا ہے؟', back: '$$\\alpha \\cdot \\beta = \\frac{c}{a}$$' },
    ],
  },

  photosynthesis: {
    titleEn: 'Photosynthesis & Cellular Bioenergetics',
    titleUr: 'ضیائی تالیف (Photosynthesis) اور خلوی توانائی',
    keywords: ['photosynthesis', 'ضیائی تالیف', 'chlorophyll', 'chloroplast', 'light reaction', 'calvin cycle'],
    overviewEn: `Photosynthesis is the fundamental biochemical process by which green plants, algae, and cyanobacteria convert light energy into chemical energy stored in glucose molecules.
$$6\\mathrm{CO}_2 + 6\\mathrm{H}_2\\mathrm{O} + \\text{Light} \\xrightarrow{\\text{Chlorophyll}} \\mathrm{C}_6\\mathrm{H}_{12}\\mathrm{O}_6 + 6\\mathrm{O}_2$$`,
    overviewUr: `ضیائی تالیف (Photosynthesis) وہ حیاتیاتی عمل ہے جس کے ذریعے سبز پودے سورج کی روشنی، کاربن ڈائی آکسائیڈ اور پانی کو استعمال کر کے گلوکوز (خوراک) اور آکسیجن بناتے ہیں:
$$6\\mathrm{CO}_2 + 6\\mathrm{H}_2\\mathrm{O} + \\text{روشنی} \\xrightarrow{\\text{کلوروفل}} \\mathrm{C}_6\\mathrm{H}_{12}\\mathrm{O}_6 + 6\\mathrm{O}_2$$`,
    explanationEn: `Photosynthesis takes place within plant chloroplasts, specifically within the thylakoid membranes (Light-dependent Reactions) and the stroma (Light-independent / Calvin Cycle). Chlorophyll $a$ and $b$ absorb blue and red wavelengths while reflecting green light, exciting electrons to drive ATP and NADPH generation.`,
    explanationUr: `یہ عمل پودوں کے پتوں میں موجود کلوروپلاسٹ کے اندر مکمل ہوتا ہے۔ تھائلاکوائیڈ جھلیوں پر روشنی کے ردعمل (Light Reactions) کے ذریعے توانائی ($ATP$ اور $NADPH$) پیدا ہوتی ہے، جو سٹرومہ میں کاربن ڈائی آکسائیڈ کو گلوکوز میں تبدیل کرنے (Calvin Cycle) میں کام آتی ہے۔`,
    breakdownEn: `Photosynthesis operates through two coordinated stages:

1. **Light-Dependent Reaction (Thylakoids):**
   - Photolysis of water:
     $$2\\mathrm{H}_2\\mathrm{O} \\longrightarrow 4\\mathrm{H}^+ + 4e^- + \\mathrm{O}_2 \\uparrow$$
   - Electron transport chain produces $ATP$ (photophosphorylation) and $NADPH$.
   - By-product: Oxygen ($O_2$) released into the atmosphere.

2. **Light-Independent Reaction / Calvin Cycle (Stroma):**
   - Carbon fixation using the enzyme RuBisCO.
   - Reduction of 3-PGA to G3P using ATP and NADPH.
   - Regeneration of RuBP to sustain continuous synthesis of glucose:
     $$\\mathrm{C}_6\\mathrm{H}_{12}\\mathrm{O}_6$$`,
    breakdownUr: `ضیائی تالیف کا عمل دو بڑے مراحل میں مکمل ہوتا ہے:

1. **لائٹ ری ایکشن (Light Reactions - تھائلاکوائیڈ پر):**
   - سورج کی روشنی سے پانی کے مالیکیولز کا ٹوٹنا (Photolysis):
     $$2\\mathrm{H}_2\\mathrm{O} \\longrightarrow 4\\mathrm{H}^+ + 4e^- + \\mathrm{O}_2 \\uparrow$$
   - الیکٹران ٹرانسپورٹ چین کے ذریعے $ATP$ اور $NADPH$ بنتے ہیں۔
   - آکسیجن فضا میں خارج ہوتی ہے۔

2. **ڈارک ری ایکشن / کیلون سائیکل (Calvin Cycle - سٹرومہ میں):**
   - پودا فضا سے $CO_2$ جذب کرتا ہے۔
   - $ATP$ اور $NADPH$ کی توانائی استعمال کر کے گلوکوز بنتا ہے:
     $$\\mathrm{C}_6\\mathrm{H}_{12}\\mathrm{O}_6$$`,
    pakistanExampleEn: `In Pakistan's agricultural breadbasket of Punjab (Faisalabad, Multan, Sahiwal) and Sindh (Sukkur, Hyderabad), vast crops of wheat, sugarcane, and basmati rice drive maximum photosynthetic yield under Pakistan's intense sunlight, supported by the Indus Basin Irrigation System.`,
    pakistanExampleUr: `پنجاب اور سندھ کے زرعی میدانوں (فیصل آباد، ساہیوال، سکھر) میں گندم، کماد (گنا) اور باسمتی چاول کی بھرپور فصلیں پاکستان کی تیز دھوپ اور نہری نظام کے تحت ضیائی تالیف کے ذریعے لاکھوں ٹن خوراک تیار کرتی ہیں۔`,
    examTipsEn: [
      'Write the balanced chemical equation with light and chlorophyll indicated over the arrow.',
      'Remember that photolysis of water occurs during Light Reactions, NOT in the Calvin Cycle.',
      'RuBisCO is the primary carbon-fixing enzyme in C3 plants.',
      'Oxygen released in photosynthesis comes from water ($H_2O$), not from carbon dioxide ($CO_2$).',
    ],
    examTipsUr: [
      'امتحان میں ضیائی تالیف کی متوازن کیمیائی مساوات لازمی لکھیں اور تیر کے اوپر کلوروفل اور روشنی کی نشاندہی کریں۔',
      'یاد رکھیں کہ آکسیجن پانی ($H_2O$) کے ٹوٹنے سے خارج ہوتی ہے، کاربن ڈائی آکسائیڈ سے نہیں۔',
      'لائٹ ری ایکشن اور ڈارک ری ایکشن کے مقامات (تھائلاکوائیڈ اور سٹرومہ) اکثر بورڈ پیپرز میں پوچھے جاتے ہیں۔',
    ],
    quizzesEn: [
      {
        question: 'During photosynthesis, the oxygen gas released into the atmosphere originates directly from:',
        options: ['Water ($H_2O$)', 'Carbon Dioxide ($CO_2$)', 'Glucose', 'Chlorophyll'],
        correctIndex: 0,
        explanation: 'Water photolysis ($2H_2O \\to 4H^+ + 4e^- + O_2$) splits water molecules, producing oxygen.',
      },
      {
        question: 'Where do the light-dependent reactions of photosynthesis take place inside plant cells?',
        options: ['Thylakoid membranes of chloroplasts', 'Stroma of chloroplasts', 'Mitochondrial matrix', 'Cytosol'],
        correctIndex: 0,
        explanation: 'Light reactions occur on the thylakoid membranes where chlorophyll pigments absorb photons.',
      },
      {
        question: 'What are the two energy-rich products of the light reactions used in the Calvin cycle?',
        options: ['ATP and NADPH', 'Glucose and Oxygen', 'NADH and FADH2', 'ADP and NADP+'],
        correctIndex: 0,
        explanation: 'ATP and NADPH provide the chemical energy and reducing power needed to reduce CO2 into sugar.',
      },
      {
        question: 'Which enzyme is responsible for initial carbon fixation in the Calvin cycle?',
        options: ['RuBisCO', 'ATP Synthase', 'Amylase', 'DNA Polymerase'],
        correctIndex: 0,
        explanation: 'RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase) fixes atmospheric CO2.',
      },
    ],
    quizzesUr: [
      {
        question: 'ضیائی تالیف کے عمل میں خارج ہونے والی آکسیجن کس مالیکیول سے حاصل ہوتی ہے؟',
        options: ['پانی ($H_2O$)', 'کاربن ڈائی آکسائیڈ ($CO_2$)', 'گلوکوز', 'کلوروفل'],
        correctIndex: 0,
        explanation: 'روشنی کے زیر اثر پانی کے ٹوٹنے (Photolysis) سے آکسیجن گیس خارج ہوتی ہے۔',
      },
      {
        question: 'پودے کے خلیے میں لائٹ ری ایکشن کس جگہ واقع ہوتا ہے؟',
        options: ['تھائلاکوائیڈ ممبرین (Thylakoids)', 'سٹرومہ (Stroma)', 'مائٹوکونڈریا', 'سیل وال'],
        correctIndex: 0,
        explanation: 'تھائلاکوائیڈ جھلیوں پر کلوروفل موجود ہوتا ہے جہاں سورج کی روشنی جذب ہوتی ہے۔',
      },
      {
        question: 'کیلون سائیکل (Calvin Cycle) کلوروپلاسٹ کے کس حصے میں ہوتی ہے؟',
        options: ['سٹرومہ (Stroma)', 'تھائلاکوائیڈ', 'گرانا', 'آؤٹر ممبرین'],
        correctIndex: 0,
        explanation: 'ڈارک ری ایکشن کلوروپلاسٹ کے سیال یعنی سٹرومہ میں مکمل ہوتا ہے۔',
      },
      {
        question: 'ضیائی تالیف کا بنیادی نامیاتی حاصل (Product) کیا ہے؟',
        options: ['گلوکوز ($C_6H_{12}O_6$)', 'نشاستہ (Starch)', 'پروٹین', 'لپڈز'],
        correctIndex: 0,
        explanation: 'سبز پودے فوٹوسنتھیسز کے ذریعے سب سے پہلے گلوکوز تیار کرتے ہیں۔',
      },
    ],
    flashcardsEn: [
      { front: 'What is the balanced equation for Photosynthesis?', back: '$$6\\mathrm{CO}_2 + 6\\mathrm{H}_2\\mathrm{O} + \\text{light} \\to \\mathrm{C}_6\\mathrm{H}_{12}\\mathrm{O}_6 + 6\\mathrm{O}_2$$' },
      { front: 'Where does the Calvin cycle take place?', back: 'In the stroma of the chloroplast.' },
      { front: 'What is photolysis?', back: 'The light-driven splitting of water molecules into hydrogen ions, electrons, and oxygen gas.' },
      { front: 'What pigment absorbs sunlight for photosynthesis?', back: 'Chlorophyll (predominantly Chlorophyll $a$ and Chlorophyll $b$).' },
      { front: 'What are the inputs of the Calvin Cycle?', back: 'Carbon dioxide ($CO_2$), $ATP$, and $NADPH$.' },
      { front: 'Why do plant leaves appear green?', back: 'Chlorophyll absorbs blue and red wavelengths and reflects green light ($500\\text{--}550\\,\\mathrm{nm}$).' },
    ],
    flashcardsUr: [
      { front: 'ضیائی تالیف کی متوازن مساوات کیا ہے؟', back: '$$6\\mathrm{CO}_2 + 6\\mathrm{H}_2\\mathrm{O} \\xrightarrow{\\text{روشنی}} \\mathrm{C}_6\\mathrm{H}_{12}\\mathrm{O}_6 + 6\\mathrm{O}_2$$' },
      { front: 'پانی کے ٹوٹنے کا عمل کیا کہلاتا ہے؟', back: 'فوٹولائسس (Photolysis) جس سے آکسیجن بنتی ہے۔' },
      { front: 'پودے کا رنگ سبز کیوں دکھائی دیتا ہے؟', back: 'کیونکہ کلوروفل سبز روشنی کو منعکس (Reflect) کرتا ہے اور نیلی و سرخ روشنی کو جذب کرتا ہے۔' },
      { front: 'لائٹ ری ایکشن کی اہم پیداوار کیا ہے؟', back: 'توانائی سے بھرپور مالیکیولز یعنی $ATP$ اور $NADPH$۔' },
      { front: 'کیلون سائیکل میں کس گیس کی فکسیشن ہوتی ہے؟', back: 'کاربن ڈائی آکسائیڈ ($CO_2$) کی۔' },
      { front: 'کلوروپلاسٹ کے سیال کو کیا کہتے ہیں؟', back: 'سٹرومہ (Stroma)۔' },
    ],
  },

  newtons_laws: {
    titleEn: "Newton's Laws of Motion",
    titleUr: 'نیوٹن کے قوانین حرکت (Newton\'s Laws of Motion)',
    keywords: ['newton', 'laws of motion', 'قوانین حرکت', 'force', 'acceleration', 'inertia', 'physics'],
    overviewEn: `Sir Isaac Newton formulated three fundamental laws of classical mechanics describing the relationship between the forces acting on a body and the motion of that body:
1. First Law (Inertia): A body remains at rest or moves with constant velocity unless acted upon by a net external force ($\\sum \\vec{F} = 0 \\implies \\vec{v} = \\text{const}$).
2. Second Law (Force & Momentum): $\\vec{F} = m\\vec{a}$.
3. Third Law (Action & Reaction): $\\vec{F}_{AB} = -\\vec{F}_{BA}$.`,
    overviewUr: `سر آئزک نیوٹن نے کلاسیکی طبیعیات کے تین بنیادی قوانین پیش کیے جو قوت (Force) اور حرکت (Motion) کے باہمی تعلق کو واضح کرتے ہیں:
1. پہلا قانون (جمود / Inertia): کوئی بھی جسم اپنی حالت برقرار رکھتا ہے جب تک اس پر بیرونی قوت اثر انداز نہ ہو۔
2. دوسرا قانون: فورس اور اسراع کا تعلق ($\\vec{F} = m\\vec{a}$)。
3. تیسرا قانون (عمل اور ردعمل): ہر عمل کا برابر لیکن مخالف سمت میں ردعمل ہوتا ہے (Action = -Reaction)。`,
    explanationEn: `These three laws form the bedrock of mechanical engineering, aerospace physics, and everyday dynamics. Newton's First Law introduces inertia—the resistance of an object to changes in its state of motion. The Second Law provides the quantitative formula for calculating the required force to accelerate a mass. The Third Law guarantees that forces always occur in matched, collinear, opposing pairs.`,
    explanationUr: `نیوٹن کے قوانین طبیعیات اور انجینئرنگ کی بنیاد ہیں۔ پہلا قانون بتاتا ہے کہ ساکن چیز ساکن رہے گی اور متحرک چیز سیدھی لائن میں چلتی رہے گی جب تک کوئی قوت نہ روکے۔ دوسرا قانون قوت کی پیمائش کا فارمولا ($F = ma$) فراہم کرتا ہے، اور تیسرا قانون واضح کرتا ہے کہ کائنات میں کوئی بھی قوت اکیلی نہیں ہوتی بلکہ جوڑوں (Pairs) کی صورت میں عمل کرتی ہے۔`,
    breakdownEn: `Detailed Mathematical and Physical Analysis:

1. **Newton's First Law of Motion (Law of Inertia):**
   $$\\sum \\vec{F} = 0 \\implies \\vec{a} = 0 \\implies \\vec{v} = \\text{constant}$$
   Mass is the quantitative measure of an object's inertia. Greater mass requires greater force to change velocity.

2. **Newton's Second Law of Motion:**
   The rate of change of momentum of a body is directly proportional to the applied force:
   $$\\vec{F} = \\frac{d\\vec{p}}{dt} = \\frac{d(m\\vec{v})}{dt} = m\\vec{a}$$
   Units: $[F] = \\mathrm{kg} \\cdot \\mathrm{m/s}^2 = \\mathrm{N}$ (Newton).

3. **Newton's Third Law of Motion:**
   For every action, there is an equal and opposite reaction:
   $$\\vec{F}_{12} = -\\vec{F}_{21}$$
   Crucial distinction: Action and reaction act on **two different bodies**, which is why they never cancel each other into static equilibrium.

4. **Example Problem:**
   A car of mass $m = 1200\\,\\mathrm{kg}$ accelerates at $a = 2.5\\,\\mathrm{m/s}^2$.
   $$F = m \\cdot a = 1200 \\times 2.5 = 3000\\,\\mathrm{N}$$`,
    breakdownUr: `قوانین حرکت کا تفصیلی جائزہ اور ریاضیاتی فارمولے:

1. **نیوٹن کا پہلا قانون حرکت (قانون جمود):**
   $$\\sum \\vec{F} = 0 \\implies \\vec{a} = 0$$
   کوئی ساکن جسم ساکن رہے گا اور یکساں رفتار سے چلتا ہوا جسم حرکت میں رہے گا، الا یہ کہ کوئی نیٹ فورس اثر انداز ہو۔ جسم کا ماس اس کے جمود کی پیمائش ہے۔

2. **نیوٹن کا دوسرا قانون حرکت:**
   جب کسی جسم پر فورس لگائی جاتی ہے تو اس میں فورس کی سمت اسراع ($a$) پیدا ہوتا ہے:
   $$\\vec{F} = m\\vec{a}$$
   یونٹ: فورس کا یونٹ **نیوٹن (Newton - N)** ہے ($1\\,\\mathrm{N} = 1\\,\\mathrm{kg} \\cdot \\mathrm{m/s}^2$).

3. **نیوٹن کا تیسرا قانون حرکت:**
   ہر عمل کا ایک برابر مگر مخالف سمت میں ردعمل ہوتا ہے:
   $$\\vec{F}_{\\text{عمل}} = -\\vec{F}_{\\text{ردعمل}}$$
   یاد رکھیں: عمل اور ردعمل دو **مختلف اجسام** پر ہوتے ہیں، اسی لیے یہ ایک دوسرے کو منسوخ (Cancel) نہیں کرتے۔

4. **عددی مثال (Numerical):**
   ایک گاڑی جس کا ماس $m = 1000\\,\\mathrm{kg}$ ہے، اس میں $a = 3\\,\\mathrm{m/s}^2$ کا اسراع پیدا کرنے کے لیے درکار فورس:
   $$F = m \\times a = 1000 \\times 3 = 3000\\,\\mathrm{N}$$`,
    pakistanExampleEn: `When Pakistan Space & Upper Atmosphere Research Commission (SUPARCO) launches a sounding rocket or satellite launch vehicle, hot high-pressure combustion gases are ejected downward with tremendous force (Action). In direct accordance with Newton's Third Law, the escaping gases exert an equal upward thrust force on the rocket body (Reaction), propelling it into orbit.`,
    pakistanExampleUr: `جب سپارکو (SUPARCO) پاکستان کا کوئی راکٹ یا سیٹلائٹ خلا میں بھیجتا ہے، تو راکٹ کے نچلے حصے سے جلتی ہوئی گیسیں تیزی سے نیچے کی طرف خارج ہوتی ہیں (عمل)۔ نیوٹن کے تیسرے قانون کے مطابق، وہی گیسیں راکٹ کو اتنی ہی قوت سے اوپر کی طرف دھکیلتی ہیں (ردعمل)۔`,
    examTipsEn: [
      'In BISE exams, always write the SI units: Force in Newtons ($N$), mass in kilograms ($kg$), acceleration in $m/s^2$.',
      'Explain that action and reaction act on two separate bodies so they do not cancel out.',
      'Derive $F = ma$ from the momentum definition: $F = \\Delta p / \\Delta t = m(v_f - v_i)/t = ma$.',
    ],
    examTipsUr: [
      'امتحان میں فورس کا فارمولا $F = ma$ اور یونٹ نیوٹن ($N$) لازمی لکھیں۔',
      'اس سوال کی خاص وضاحت کریں کہ عمل اور ردعمل ایک دوسرے کو کینسل کیوں نہیں کرتے (کیونکہ وہ الگ الگ اجسام پر لگتے ہیں)۔',
      'مومینٹم کے ذریعے $F = ma$ کی باقاعدہ اخذ (Derivation) کے پورے نمبر ملتے ہیں۔',
    ],
    quizzesEn: [
      {
        question: 'According to Newton’s Second Law of Motion, acceleration of an object is:',
        options: [
          'Directly proportional to force and inversely proportional to mass ($a = F/m$)',
          'Directly proportional to mass and inversely to force',
          'Independent of force',
          'Inversely proportional to both force and mass',
        ],
        correctIndex: 0,
        explanation: 'Rearranging $F = ma$ gives $a = F/m$.',
      },
      {
        question: 'A rocket moves forward in space according to which law of motion?',
        options: ["Newton's Third Law of Motion", "Newton's First Law of Motion", "Kepler's First Law", "Coulomb's Law"],
        correctIndex: 0,
        explanation: 'The downward action of exhaust gas creates an equal upward reaction on the rocket.',
      },
      {
        question: 'What is the force required to accelerate a $5\\,\\mathrm{kg}$ mass at $4\\,\\mathrm{m/s}^2$?',
        options: ['$20\\,\\mathrm{N}$', '$1.25\\,\\mathrm{N}$', '$9\\,\\mathrm{N}$', '$40\\,\\mathrm{N}$'],
        correctIndex: 0,
        explanation: '$F = ma = 5 \\times 4 = 20\\,\\mathrm{N}$.',
      },
      {
        question: 'Inertia of a physical object directly depends on its:',
        options: ['Mass', 'Volume', 'Speed', 'Temperature'],
        correctIndex: 0,
        explanation: 'Mass is the direct physical measure of an object’s inertia.',
      },
    ],
    quizzesUr: [
      {
        question: 'نیوٹن کے دوسرے قانون کے مطابق اسراع ($a$) کا فارمولا کیا ہے؟',
        options: ['$a = \\frac{F}{m}$', '$a = F \\times m$', '$a = \\frac{m}{F}$', '$a = F + m$'],
        correctIndex: 0,
        explanation: 'فارمولا $F = ma$ کو ترتیب دینے سے $a = F/m$ حاصل ہوتا ہے۔',
      },
      {
        question: 'راکٹ کی پرواز نیوٹن کے کس قانون حرکت پر مبنی ہے؟',
        options: ['تیسرا قانون حرکت (عمل اور ردعمل)', 'پہلا قانون حرکت', 'دوسرا قانون حرکت', 'کشش ثقل کا قانون'],
        correctIndex: 0,
        explanation: 'گیسوں کا نیچے اخراج عمل ہے اور راکٹ کا اوپر جانا ردعمل ہے۔',
      },
      {
        question: '$10\\,\\mathrm{kg}$ کے جسم پر $5\\,\\mathrm{m/s}^2$ کا اسراع پیدا کرنے کے لیے کتنی فورس درکار ہوگی؟',
        options: ['$50\\,\\mathrm{N}$', '$2\\,\\mathrm{N}$', '$15\\,\\mathrm{N}$', '$5\\,\\mathrm{N}$'],
        correctIndex: 0,
        explanation: '$F = ma = 10 \\times 5 = 50\\,\\mathrm{N}$۔',
      },
      {
        question: 'کسی جسم کا جمود (Inertia) بنیادی طور پر کس پر منحصر ہوتا ہے؟',
        options: ['ماس (Mass)', 'رفتار', 'حجم', 'شکل'],
        correctIndex: 0,
        explanation: 'جسم کا ماس جتنا زیادہ ہوگا، اس کا جمود بھی اتنا ہی زیادہ ہوگا۔',
      },
    ],
    flashcardsEn: [
      { front: "What is Newton's First Law of Motion?", back: 'An object remains at rest or moves at constant velocity unless acted upon by a net external force ($\\sum F = 0$).' },
      { front: "State the equation for Newton's Second Law.", back: '$$F = ma \\quad \\text{or} \\quad F = \\frac{\\Delta p}{\\Delta t}$$' },
      { front: "What is Newton's Third Law of Motion?", back: 'For every action, there is an equal and opposite reaction ($F_{12} = -F_{21}$).' },
      { front: 'What is the SI unit of Force?', back: 'Newton ($N$), equivalent to $1\\,\\mathrm{kg}\\cdot\\mathrm{m/s}^2$.' },
      { front: 'Why don’t action and reaction forces cancel each other out?', back: 'Because they act on two different, distinct objects.' },
      { front: 'What physical property quantifies Inertia?', back: 'Mass ($m$). Greater mass equals greater inertia.' },
    ],
    flashcardsUr: [
      { front: 'نیوٹن کا پہلا قانون حرکت کیا ہے؟', back: 'کوئی جسم اپنی ساکن یا یکساں حرکت کی حالت برقرار رکھتا ہے جب تک بیرونی فورس نہ لگے۔' },
      { front: 'نیوٹن کے دوسرے قانون کا فارمولا بتائیں۔', back: '$$F = ma$$' },
      { front: 'نیوٹن کا تیسرا قانون حرکت کیا ہے؟', back: 'ہر عمل کا برابر لیکن مخالف سمت میں ردعمل ہوتا ہے۔' },
      { front: 'فورس کا بین الاقوامی یونٹ کیا ہے؟', back: 'نیوٹن ($N$)، جو کہ $1\\,\\mathrm{kg}\\cdot\\mathrm{m/s}^2$ کے برابر ہے۔' },
      { front: 'عمل اور ردعمل منسوخ کیوں نہیں ہوتے؟', back: 'کیونکہ وہ دو مختلف اجسام پر اثر انداز ہوتے ہیں۔' },
      { front: 'جمود کی پیمائش کس شے سے ہوتی ہے؟', back: 'ماس (Mass) سے۔' },
    ],
  },

  periodic_table: {
    titleEn: 'Periodic Table of Elements & Periodic Trends',
    titleUr: 'دوری جدول اور متواتر رجحانات (Periodic Table Trends)',
    keywords: ['periodic table', 'دوری جدول', 'chemistry', 'atomic radius', 'electronegativity', 'ionization energy', 'periods', 'groups', 'elements', 'halogens', 'noble gas', 'alkali', 'moseley', 'mendeleev'],
    overviewEn: `The Modern Periodic Table arranges all 118 known elements in order of increasing atomic number ($Z$) according to Moseley's Modern Periodic Law. Elements are organized into 7 horizontal rows called **Periods** and 18 vertical columns called **Groups**, grouping elements with matching valence electron configurations and chemical reactivities.`,
    overviewUr: `جدید دوری جدول (Modern Periodic Table) میں تمام 118 کیمیائی عناصر کو ان کے بڑھتے ہوئے ایٹمی نمبر ($Z$) کے مطابق ترتیب دیا گیا ہے، جسے جدید متواتر قانون (Moseley's Law) کہتے ہیں۔ اس میں 7 افقی قطاریں یعنی **پیریڈز (Periods)** اور 18 عمودی کالم یعنی **گروپس (Groups)** ہوتے ہیں۔`,
    explanationEn: `Henry Moseley in 1913 demonstrated that atomic number ($Z$, proton count), not atomic mass ($A$), is the true periodic determinant. Elements in the same group possess the same number of valence electrons and exhibit analogous chemical properties. Moving across a period (left to right), the nuclear charge increases, shrinking the atomic radius. Moving down a group, new electron shells ($n$) are added, increasing atomic size and shielding.`,
    explanationUr: `مینڈلیف نے عناصر کو ایٹمی کمیت کے مطابق رکھا تھا، لیکن 1913 میں موزلے نے ثابت کیا کہ ایٹمی نمبر ($Z$) ہی اصل بنیادی بنیاد ہے۔ ایک ہی گروپ کے عناصر کے آخری شیل میں الیکٹرانز کی تعداد برابر ہوتی ہے، اس لیے ان کی کیمیائی خصوصیات یکساں ہوتی ہیں۔ پیریڈ میں بائیں سے دائیں نیوکلیئر چارج بڑھنے سے ایٹمی ریڈیئس گھٹتا ہے، جبکہ گروپ میں اوپر سے نیچے نئے شیلز کے اضافے سے ایٹمی سائز بڑھتا ہے۔`,
    breakdownEn: `Detailed Architectural and Periodic Trends Breakdown:

1. **Classification by Groups & Periods:**
   - **7 Periods:** Period 1 ($n=1$, 2 elements: $\\mathrm{H, He}$), Period 2 & 3 (Short periods, 8 elements each), Periods 4 & 5 (Long periods, 18 elements each), Periods 6 & 7 (Very long, 32 elements including Lanthanides and Actinides).
   - **18 Groups / Families:**
     - Group 1: Alkali Metals ($ns^1$, e.g., $\\mathrm{Li, Na, K, Rb, Cs, Fr}$) — highly reactive, form $+1$ cations.
     - Group 2: Alkaline Earth Metals ($ns^2$, e.g., $\\mathrm{Be, Mg, Ca, Sr, Ba}$) — form $+2$ cations.
     - Groups 3–12: Transition Metals ($d$-block elements) — variable valency, colored ions.
     - Group 17: Halogens ($ns^2 np^5$, e.g., $\\mathrm{F, Cl, Br, I}$) — form $-1$ anions (halides).
     - Group 18: Noble Gases ($ns^2 np^6$, e.g., $\\mathrm{He, Ne, Ar, Kr, Xe, Rn}$) — stable octet, unreactive.

2. **Core Periodic Trends:**
   - **Atomic Radius ($r_{\\text{atomic}}$):** Decreases across a period ($\\to$) due to higher effective nuclear charge ($Z_{\\text{eff}}$); increases down a group ($\\downarrow$) due to shielding and additional principal shells ($n$).
   - **First Ionization Energy ($\\mathrm{IE}_1$):** Energy to remove outermost valence electron:
     $$\\mathrm{X}_{(g)} + \\mathrm{IE}_1 \\longrightarrow \\mathrm{X}^+_{(g)} + e^-$$
     Increases across a period; decreases down a group.
   - **Electronegativity ($\\mathrm{EN}$):** Relative tendency to attract a bonding pair of electrons (Fluorine highest at $4.0$ on Pauling scale). Increases across a period; decreases down a group.
   - **Electron Affinity ($\\mathrm{EA}$):**
     $$\\mathrm{X}_{(g)} + e^- \\longrightarrow \\mathrm{X}^-_{(g)} + \\mathrm{EA}$$`,
    breakdownUr: `دوری جدول کی ساخت اور متواتر رجحانات کی تفصیل:

1. **پیریڈز اور گروپس کی درجہ بندی:**
   - **7 پیریڈز (Periods):** پیریڈ 1 میں صرف 2 عناصر ($\mathrm{H, He}$)، پیریڈ 2 اور 3 مختصر پیریڈز (8 عناصر)، پیریڈ 4 اور 5 طویل پیریڈز (18 عناصر)، پیریڈ 6 اور 7 طویل ترین (32 عناصر بمع لینتھانائیڈز اور ایکٹینائیڈز)۔
   - **18 گروپس (Groups):**
     - گروپ 1: الکلی میٹلز ($ns^1$، جیسے $\\mathrm{Li, Na, K}$) — انتہائی فعال دھاتیں۔
     - گروپ 2: الکلائن ارتھ میٹلز ($ns^2$، جیسے $\\mathrm{Mg, Ca}$)۔
     - گروپس 3 تا 12: ٹرانزیشن میٹلز ($d$-بلاک) — رنگین مرکبات بناتی ہیں۔
     - گروپ 17: ہیلوجنز ($ns^2 np^5$، جیسے $\\mathrm{F, Cl, Br, I}$) — نمکیات بنانے والے۔
     - گروپ 18: نوبل گیسز ($ns^2 np^6$، جیسے $\\mathrm{He, Ne, Ar}$) — مکمل آکٹیٹ، غیر فعال۔

2. **اہم متواتر رجحانات (Periodic Trends):**
   - **ایٹمی ریڈیئس (Atomic Radius):** پیریڈ میں بائیں سے دائیں کم ہوتا ہے (کیونکہ نیوکلیئس کی کشش بڑھتی ہے)؛ گروپ میں اوپر سے نیچے بڑھتا ہے (کیونکہ نئے شیلز کا اضافہ ہوتا ہے)۔
   - **آئونائزیشن انرجی (Ionization Energy):**
     $$\\mathrm{X}_{(g)} + \\mathrm{IE}_1 \\longrightarrow \\mathrm{X}^+_{(g)} + e^-$$
     پیریڈ میں بائیں سے دائیں بڑھتی ہے، گروپ میں اوپر سے نیچے کم ہوتی ہے۔
   - **الیکٹرو نیگیٹیوٹی (Electronegativity):** بانڈنگ الیکٹرانز کو اپنی طرف کھینچنے کی صلاحیت۔ پیریڈ میں بڑھتی ہے اور گروپ میں کم ہوتی ہے۔`,
    pakistanExampleEn: `In Pakistan, the vast salt deposits at Khewra Salt Mines in Punjab consist of Halite ($\\mathrm{NaCl}$)—an ionic compound formed by the explosive alkali metal Sodium ($\\mathrm{Na}$, Group 1) donating its valence electron to the toxic halogen Chlorine ($\\mathrm{Cl}$, Group 17). Furthermore, Pakistan's Saindak and Reko Diq reserves in Balochistan harbor trillions of dollars in copper ($\\mathrm{Cu}$, Group 11 transition metal) and gold ($\\mathrm{Au}$).`,
    pakistanExampleUr: `پاکستان میں کھیوڑا نمک کی کانوں میں پایا جانے والا نمک ($\\mathrm{NaCl}$) دوری جدول کے گروپ 1 کی الکلی دھات سوڈیم ($\mathrm{Na}$) اور گروپ 17 کے ہیلوجن کلورین ($\mathrm{Cl}$) کے باہمی ملاپ کی زندہ مثال ہے۔ اسی طرح بلوچستان میں ریکوڈک اور سیندک کے ذخائر میں گروپ 11 کا اہم ٹرانزیشن عنصر تانبا ($\\mathrm{Cu}$) اور سونا پائے جاتے ہیں۔`,
    examTipsEn: [
      'In FBISE and Punjab board exams, state Modern Periodic Law: "The properties of elements are periodic functions of their atomic numbers."',
      'Explain the atomic radius trend: Across a period, nuclear charge increases while shielding remains constant, pulling outer electrons closer.',
      'Remember that Group 1 elements are Alkali Metals, Group 17 are Halogens, and Group 18 are Noble Gases.',
      'Noble gases have zero or undefined electronegativity because they have complete outer octets ($s^2 p^6$) and do not form shared covalent bonds.',
    ],
    examTipsUr: [
      'بورڈ امتحانات میں جدید متواتر قانون (Modern Periodic Law) کا متن لازمی لکھیں: "عناصر کی طبعی اور کیمیائی خصوصیات ان کے ایٹمی نمبروں کا متواتر عمل ہوتی ہیں۔"',
      'پیریڈ میں ایٹمی ریڈیئس کے کم ہونے کی سائنسی وجہ (نیوکلیئر چارج میں اضافہ اور شیلڈنگ ایفیکٹ کا یکساں رہنا) ضرور بیان کریں۔',
      'گروپ 1 (الکلی میٹلز)، گروپ 17 (ہیلوجنز) اور گروپ 18 (نوبل گیسز) کے نام اور ان کے آخری شیل کے الیکٹرانز یاد رکھیں۔',
      'فلورین ($F$) دوری جدول کا سب سے زیادہ الیکٹرو نیگیٹو عنصر ہے جس کی قیمت $4.0$ ہے۔',
    ],
    quizzesEn: [
      {
        question: 'According to Moseley’s Modern Periodic Law, the physical and chemical properties of elements are periodic functions of their:',
        options: ['Atomic Number ($Z$)', 'Atomic Mass ($A$)', 'Mass Defect', 'Number of Neutrons'],
        correctIndex: 0,
        explanation: 'Henry Moseley established in 1913 that atomic number ($Z$) determines the electronic configuration and periodic properties of elements.',
      },
      {
        question: 'Moving from left to right across a period in the Periodic Table, the atomic radius:',
        options: ['Decreases due to increasing effective nuclear charge', 'Increases due to extra shells', 'Remains exactly constant', 'Doubles at each element'],
        correctIndex: 0,
        explanation: 'Nuclear charge increases while electrons are added to the same energy level, pulling the electron cloud closer to the nucleus.',
      },
      {
        question: 'Which group of the Periodic Table contains the chemically unreactive Noble Gases with complete outer octets?',
        options: ['Group 18', 'Group 1', 'Group 17', 'Group 2'],
        correctIndex: 0,
        explanation: 'Group 18 elements (He, Ne, Ar, Kr, Xe, Rn) have complete valence shells ($ns^2 np^6$) and are exceptionally stable.',
      },
      {
        question: 'Which element possesses the highest electronegativity value ($4.0$) on the Pauling scale?',
        options: ['Fluorine (F)', 'Oxygen (O)', 'Chlorine (Cl)', 'Sodium (Na)'],
        correctIndex: 0,
        explanation: 'Fluorine has the highest electronegativity due to its small atomic size and strong effective nuclear pull.',
      },
    ],
    quizzesUr: [
      {
        question: 'جدید متواتر قانون (Modern Periodic Law) کے مطابق عناصر کی خصوصیات کس کا متواتر عمل ہوتی ہیں؟',
        options: ['ایٹمی نمبر ($Z$)', 'ایٹمی کمیت ($A$)', 'نیوٹرانز کی تعداد', 'والیوم'],
        correctIndex: 0,
        explanation: 'موزلے نے 1913 میں ثابت کیا کہ عناصر کی کیمیائی خصوصیات ان کے ایٹمی نمبر (پروٹونز کی تعداد) پر منحصر ہوتی ہیں۔',
      },
      {
        question: 'پیریڈ میں بائیں سے دائیں جانے پر ایٹمی ریڈیئس (Atomic Radius) پر کیا اثر پڑتا ہے؟',
        options: ['کم ہوتا ہے (نیوکلیئر چارج بڑھنے کی وجہ سے)', 'بڑھتا ہے', 'برابر رہتا ہے', 'پہلے بڑھتا ہے پھر کم ہوتا ہے'],
        correctIndex: 0,
        explanation: 'پیریڈ میں شیل وہی رہتا ہے لیکن نیوکلیئس میں پروٹون بڑھنے سے الیکٹرانز پر کھچاؤ زیادہ ہو جاتا ہے اور سائز چھوٹا ہو جاتا ہے۔',
      },
      {
        question: 'دوری جدول کا سب سے زیادہ الیکٹرو نیگیٹو (Electronegative) عنصر کون سا ہے؟',
        options: ['فلورین (F - 4.0)', 'سوڈیم (Na)', 'کلورین (Cl)', 'ہائیڈروجن (H)'],
        correctIndex: 0,
        explanation: 'فلورین کا سائز چھوٹا ہونے کی وجہ سے اس کی الیکٹرانز کو کھینچنے کی صلاحیت سب سے زیادہ ہوتی ہے۔',
      },
      {
        question: 'گروپ 17 کے عناصر کو عام طور پر کیا کہا جاتا ہے؟',
        options: ['ہیلوجنز (Halogens)', 'الکلی میٹلز', 'نوبل گیسز', 'ٹرانزیشن میٹلز'],
        correctIndex: 0,
        explanation: 'گروپ 17 کے عناصر (فلورین، کلورین، برومین، آئیوڈین) کو ہیلوجنز یعنی نمکیات بنانے والے کہا جاتا ہے۔',
      },
    ],
    flashcardsEn: [
      { front: 'State Modern Periodic Law.', back: 'The properties of elements are periodic functions of their atomic numbers ($Z$).' },
      { front: 'How many Periods and Groups are in the Modern Periodic Table?', back: '7 Periods (horizontal rows) and 18 Groups (vertical columns).' },
      { front: 'Why does atomic radius decrease across a period?', back: 'Because the effective nuclear charge ($Z_{\\text{eff}}$) increases, drawing the valence shell closer.' },
      { front: 'What is Ionization Energy?', back: 'The minimum energy required to remove the most loosely bound electron from an isolated gaseous atom: $\\mathrm{X}_{(g)} + \\mathrm{IE} \\to \\mathrm{X}^+_{(g)} + e^-$.' },
      { front: 'Which group contains the Alkali Metals?', back: 'Group 1 ($\\mathrm{Li, Na, K, Rb, Cs, Fr}$) with valence configuration $ns^1$.' },
      { front: 'What is the trend of electronegativity down a group?', back: 'Electronegativity decreases down a group due to increased atomic radius and shielding effect.' },
    ],
    flashcardsUr: [
      { front: 'جدید دوری قانون کیا ہے؟', back: 'عناصر کی خصوصیات ان کے ایٹمی نمبروں کا متواتر عمل ہوتی ہیں۔' },
      { front: 'دوری جدول میں کتنے پیریڈز اور گروپس ہیں؟', back: '7 پیریڈز (افقی قطاریں) اور 18 گروپس (عمودی کالم)۔' },
      { front: 'پیریڈ میں ایٹمی ریڈیئس کیوں کم ہوتا ہے؟', back: 'کیونکہ نیوکلیئر چارج بڑھنے سے الیکٹرانز نیوکلیئس کے قریب کھنچ جاتے ہیں۔' },
      { front: 'آئونائزیشن انرجی کی تعریف کیا ہے؟', back: 'گیسی حالت میں ایٹم کے بیرونی شیل سے الیکٹران نکالنے کے لیے درکار کم از کم توانائی۔' },
      { front: 'گروپ 1 کے عناصر کو کیا کہتے ہیں؟', back: 'الکلی میٹلز (سوڈیم، پوٹاشیم وغیرہ) جن کے آخری شیل میں 1 الیکٹران ہوتا ہے۔' },
      { front: 'گروپ میں الیکٹرو نیگیٹیوٹی پر کیا اثر ہوتا ہے؟', back: 'اوپر سے نیچے جاتے ہوئے الیکٹرو نیگیٹیوٹی کم ہوتی ہے کیونکہ ایٹم کا سائز بڑا ہو جاتا ہے۔' },
    ],
  },

  algebra: {
    titleEn: 'Algebra, Polynomials & Algebraic Identities',
    titleUr: 'الجبرا، کثیر رقمی مساوات اور بنیادی کلیات (Algebra & Polynomials)',
    keywords: ['algebra', 'الجبرا', 'polynomial', 'factorization', 'identity', 'linear', 'simplify', 'variable'],
    overviewEn: `Algebra is the foundational branch of mathematics dealing with symbols, variables, operational coefficients, and algebraic identities. It models relationships through polynomial expressions and enables the systematic solution of unknown quantities:
$$(a+b)^2 = a^2 + 2ab + b^2, \\quad a^2 - b^2 = (a-b)(a+b)$$`,
    overviewUr: `الجبرا (Algebra) ریاضی کی بنیادی شاخ ہے جس میں علامات، متغیرات (Variables) اور عددی سر (Coefficients) کی مدد سے حسابی مساوات اور کلیات حل کیے جاتے ہیں۔ الجبرے کی بنیادی شناختیں درج ذیل ہیں:
$$(a+b)^2 = a^2 + 2ab + b^2, \\quad a^2 - b^2 = (a-b)(a+b)$$`,
    explanationEn: `First developed comprehensively by the Muslim mathematician Muhammad ibn Musa al-Khwarizmi, algebra uses variables (such as $x, y, z$) to represent unknown values. Algebraic expressions are categorized into monomials, binomials, and polynomials. Factoring polynomials, simplifying rational expressions, and applying algebraic identities provide the analytical toolbox for all higher mathematics, physics, and engineering.`,
    explanationUr: `الجبرا عظیم مسلمان ریاضی دان محمد بن موسیٰ الخوارزمی نے منظم انداز میں متعارف کرایا۔ الجبرے میں نامعلوم مقداروں کو متغیر ($x, y, z$) سے ظاہر کیا جاتا ہے۔ کثیر رقمی جملوں (Polynomials) کی تجزیہ (Factorization) اور بنیادی کلیات کا اطلاق طبیعیات، کمپیوٹر سائنس اور انجینئرنگ کے تمام شعبوں میں ناگزیر ہے۔`,
    breakdownEn: `Essential Algebraic Identities and Problem Solving:

1. **Standard Algebraic Identities (FBISE / BISE Core Curriculum):**
   - Square of a sum:
     $$(a + b)^2 = a^2 + 2ab + b^2$$
   - Square of a difference:
     $$(a - b)^2 = a^2 - 2ab + b^2$$
   - Difference of two squares:
     $$a^2 - b^2 = (a - b)(a + b)$$
   - Sum and difference of two cubes:
     $$a^3 + b^3 = (a + b)(a^2 - ab + b^2)$$
     $$a^3 - b^3 = (a - b)(a^2 + ab + b^2)$$
   - Cube of a binomial:
     $$(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3 = a^3 + b^3 + 3ab(a + b)$$
     $$(a - b)^3 = a^3 - 3a^2b + 3ab^2 - b^3 = a^3 - b^3 - 3ab(a - b)$$

2. **Step-by-Step Factoring Example:**
   Factorize $x^2 + 7x + 12$:
   - Look for two numbers whose product is $12$ and sum is $7$: $3$ and $4$ ($3 \\times 4 = 12$, $3 + 4 = 7$).
   - Split the middle term:
     $$x^2 + 3x + 4x + 12 = x(x + 3) + 4(x + 3) = (x + 3)(x + 4)$$

3. **Solving Linear Equations:**
   Solve: $3x + 7 = 22$
   $$3x = 22 - 7 = 15 \\implies x = \\frac{15}{3} = 5$$`,
    breakdownUr: `الجبرا کے بنیادی کلیات اور مرحلہ وار حل کا طریقہ:

1. **اہم الجبرائی کلیات (Board Syllabus Core Identities):**
   - دو رقمی جملے کا مربع:
     $$(a + b)^2 = a^2 + 2ab + b^2$$
   - تفریق کا مربع:
     $$(a - b)^2 = a^2 - 2ab + b^2$$
   - دو مربعوں کا فرق:
     $$a^2 - b^2 = (a - b)(a + b)$$
   - مکعب کے کلیات:
     $$a^3 + b^3 = (a + b)(a^2 - ab + b^2)$$
     $$a^3 - b^3 = (a - b)(a^2 + ab + b^2)$$
     $$(a + b)^3 = a^3 + b^3 + 3ab(a + b)$$

2. **تجزیہ (Factoring) کی عملی مثال:**
   تجزیہ کریں: $x^2 + 7x + 12$
   - دو ایسے اعداد تلاش کریں جن کا حاصل ضرب 12 اور مجموعہ 7 ہو (یعنی 3 اور 4):
   - درمیانی رقم کو توڑیں:
     $$x^2 + 3x + 4x + 12 = x(x + 3) + 4(x + 3) = (x + 3)(x + 4)$$

3. **لکیری مساوات کا حل:**
   حل کریں: $3x + 7 = 22$
   $$3x = 22 - 7 = 15 \\implies x = 5$$`,
    pakistanExampleEn: `In Pakistan's telecommunications sector (PTCL, Jazz, Zong) and electricity billing (WAPDA / K-Electric), algebraic linear equations determine the total consumer bill $B(x) = f + r \\cdot x$, where $f$ is the fixed meter tariff and $r$ is the unit rate per kilowatt-hour ($kWh$) or megabyte of data.`,
    pakistanExampleUr: `پاکستان میں واپڈا اور کے الیکٹرک کے بجلی کے بل اور جاز یا یوفون کے موبائل پیکجز الجبرے کی لکیری مساوات $B(x) = f + r \\cdot x$ پر بنتے ہیں، جہاں $f$ مقررہ فکسڈ چارجز اور $r$ فی یونٹ بجلی یا ڈیٹا ریٹ ہوتا ہے۔`,
    examTipsEn: [
      'Always remember: $a^2 - b^2 = (a-b)(a+b)$, but $(a-b)^2 = a^2 - 2ab + b^2$. Never confuse the two!',
      'When simplifying algebraic fractions, factor numerator and denominator completely before cancelling common terms.',
      'Always verify your answer by substituting the solved variable back into the original algebraic expression.',
    ],
    examTipsUr: [
      'امتحان میں دو مربعوں کے فرق ($a^2 - b^2$) اور تفریق کے مربع ($(a-b)^2$) کا فرق یاد رکھیں، ان میں غلطی اکثر ہوتی ہے۔',
      'الجبری کسر کو مختصر کرتے وقت پہلے شمار کنندہ اور مخرج کے اجزائے ضربی بنائیں پھر مشترک رقم کاٹیں۔',
      'حاصل کردہ متغیر کی قیمت کو اصل مساوات میں درج کر کے اپنے جواب کی تصدیق کریں۔',
    ],
    quizzesEn: [
      {
        question: 'What is the expanded form of $(a + b)^2$?',
        options: ['$a^2 + 2ab + b^2$', '$a^2 + b^2$', '$a^2 - 2ab + b^2$', '$2a + 2b$'],
        correctIndex: 0,
        explanation: 'By binomial expansion: $(a + b)(a + b) = a^2 + ab + ba + b^2 = a^2 + 2ab + b^2$.',
      },
      {
        question: 'What is the factored form of the difference of two squares $a^2 - b^2$?',
        options: ['$(a - b)(a + b)$', '$(a - b)^2$', '$(a + b)^2$', '$a^2 - 2ab + b^2$'],
        correctIndex: 0,
        explanation: '$a^2 - b^2 = (a - b)(a + b)$ is the classic difference-of-squares identity.',
      },
      {
        question: 'If $2x + 5 = 15$, what is the value of $x$?',
        options: ['$x = 5$', '$x = 10$', '$x = 7.5$', '$x = 2$'],
        correctIndex: 0,
        explanation: '$2x = 15 - 5 = 10 \\implies x = 10/2 = 5$.',
      },
      {
        question: 'Factorize the polynomial $x^2 - 16$:',
        options: ['$(x - 4)(x + 4)$', '$(x - 4)^2$', '$(x + 4)^2$', '$(x - 8)(x + 2)$'],
        correctIndex: 0,
        explanation: '$x^2 - 16 = x^2 - 4^2 = (x - 4)(x + 4)$.',
      },
    ],
    quizzesUr: [
      {
        question: 'کلیہ $(a + b)^2$ کی کھلی ہوئی شکل کیا ہے؟',
        options: ['$a^2 + 2ab + b^2$', '$a^2 + b^2$', '$a^2 - 2ab + b^2$', '$2a + 2b$'],
        correctIndex: 0,
        explanation: '$(a + b)(a + b) = a^2 + 2ab + b^2$ الجبرے کا بنیادی کلیہ ہے۔',
      },
      {
        question: 'دو مربعوں کے فرق $a^2 - b^2$ کے اجزائے ضربی کیا ہیں؟',
        options: ['$(a - b)(a + b)$', '$(a - b)^2$', '$(a + b)^2$', '$a^2 - b^2$'],
        correctIndex: 0,
        explanation: '$a^2 - b^2 = (a - b)(a + b)$ الجبرے کا مشہور کلیہ ہے۔',
      },
      {
        question: 'اگر $2x + 5 = 15$ ہو تو $x$ کی قیمت کیا ہوگی؟',
        options: ['$5$', '$10$', '$7.5$', '$2$'],
        correctIndex: 0,
        explanation: '$2x = 15 - 5 = 10 \\implies x = 10 / 2 = 5$۔',
      },
      {
        question: 'جملہ $x^2 - 16$ کے اجزائے ضربی کیا بنیں گے؟',
        options: ['$(x - 4)(x + 4)$', '$(x - 4)^2$', '$(x + 4)^2$', '$(x - 8)(x + 2)$'],
        correctIndex: 0,
        explanation: '$x^2 - 16 = x^2 - 4^2 = (x - 4)(x + 4)$۔',
      },
    ],
    flashcardsEn: [
      { front: 'State the formula for $(a + b)^2$.', back: '$$(a + b)^2 = a^2 + 2ab + b^2$$' },
      { front: 'State the formula for $(a - b)^2$.', back: '$$(a - b)^2 = a^2 - 2ab + b^2$$' },
      { front: 'State the Difference of Two Squares identity.', back: '$$a^2 - b^2 = (a - b)(a + b)$$' },
      { front: 'What is the factorization of $a^3 + b^3$?', back: '$$a^3 + b^3 = (a + b)(a^2 - ab + b^2)$$' },
      { front: 'What is the factorization of $a^3 - b^3$?', back: '$$a^3 - b^3 = (a - b)(a^2 + ab + b^2)$$' },
      { front: 'How do you solve a linear equation $ax + b = c$?', back: 'Isolate the variable: $ax = c - b \\implies x = \\frac{c - b}{a}$.' },
    ],
    flashcardsUr: [
      { front: '$(a + b)^2$ کا کلیہ کیا ہے؟', back: '$$(a + b)^2 = a^2 + 2ab + b^2$$' },
      { front: '$(a - b)^2$ کا کلیہ کیا ہے؟', back: '$$(a - b)^2 = a^2 - 2ab + b^2$$' },
      { front: '$a^2 - b^2$ کے اجزائے ضربی کیا ہیں؟', back: '$$a^2 - b^2 = (a - b)(a + b)$$' },
      { front: '$a^3 + b^3$ کا کلیہ کیا ہے؟', back: '$$a^3 + b^3 = (a + b)(a^2 - ab + b^2)$$' },
      { front: '$a^3 - b^3$ کا کلیہ کیا ہے؟', back: '$$a^3 - b^3 = (a - b)(a^2 + ab + b^2)$$' },
      { front: 'لکیری مساوات $ax + b = c$ کو کیسے حل کرتے ہیں؟', back: 'متغیر کو الگ کریں: $x = \\frac{c - b}{a}$۔' },
    ],
  },
};

function normalizeCurriculumSubject(sub: string): string {
  const s = (sub || '').toLowerCase();
  if (s.includes('math') || s.includes('ریاضی') || s.includes('algebra') || s.includes('calculus') || s.includes('geometric')) return 'Mathematics';
  if (s.includes('bio') || s.includes('حیاتیات') || s.includes('بیالوجی')) return 'Biology';
  if (s.includes('physic') || s.includes('فزکس')) return 'Physics';
  if (s.includes('chem') || s.includes('کیمسٹری')) return 'Chemistry';
  if (s.includes('comp') || s.includes('cs') || s.includes('کمپیوٹر')) return 'Computer Science';
  if (s.includes('pak') || s.includes('پاکستان') || s.includes('مطالعہ')) return 'Pakistan Studies';
  return sub || 'General Science';
}

/**
 * Match a user's topic and subject against the curated database or synthesize dynamically
 */
function findCurriculumTopic(subject: string, topicQuery: string): CurriculumTopicData | null {
  const normSub = normalizeCurriculumSubject(subject);
  const qLower = (topicQuery || '').toLowerCase();
  const sLower = (subject || '').toLowerCase();

  // 1. Strict Subject-Filtered Matching
  for (const key of Object.keys(TOPICS_DB)) {
    const item = TOPICS_DB[key];
    const isMathTopic = key.includes('quadratic') || key.includes('pythagoras') || key.includes('matrices') || key.includes('algebra');
    const isBioTopic = key.includes('cell') || key.includes('photosynthesis');
    const isPhysTopic = key.includes('newton') || key.includes('ohm');
    const isChemTopic = key.includes('chem') || key.includes('periodic');

    // Never return Biology or Physics topics if user is asking Mathematics!
    if (normSub === 'Mathematics' && !isMathTopic) continue;
    if (normSub === 'Biology' && !isBioTopic) continue;
    if (normSub === 'Physics' && !isPhysTopic) continue;
    if (normSub === 'Chemistry' && !isChemTopic) continue;

    if (item.keywords.some((kw) => qLower.includes(kw.toLowerCase()) || sLower.includes(kw.toLowerCase()))) {
      return item;
    }
  }

  // 2. Default subject-specific topic if user asked about the subject broadly
  if (normSub === 'Mathematics') {
    if (qLower.includes('algebra') || qLower.includes('الجبرا') || qLower.includes('polynomial') || qLower.includes('factor')) {
      return TOPICS_DB['algebra'] || null;
    }
    return TOPICS_DB['quadratic_equations'] || null;
  }
  if (normSub === 'Chemistry') {
    return TOPICS_DB['periodic_table'] || null;
  }
  if (normSub === 'Physics') {
    return TOPICS_DB['newtons_laws'] || null;
  }
  if (normSub === 'Biology') {
    if (qLower.includes('photo') || qLower.includes('ضیائی')) return TOPICS_DB['photosynthesis'] || null;
    return TOPICS_DB['animal_cell'] || null;
  }

  return null;
}

/**
 * Generates an authentic structured lesson in Markdown
 */
export function generateCurriculumLesson(options: {
  subject: string;
  topic: string;
  grade: string;
  language: string;
}): string {
  const { subject, topic, grade, language } = options;
  const isUrdu = language === 'ur' || language === 'pa' || language === 'sd' || language === 'ps' || language === 'bal';
  const normSub = normalizeCurriculumSubject(subject);
  const matched = findCurriculumTopic(subject, topic);

  if (matched) {
    if (isUrdu) {
      return `### 📚 Concept Overview
${matched.overviewUr}

### 💡 Simple Explanation
${matched.explanationUr}

### 🧠 Step-by-Step Breakdown
${matched.breakdownUr}

### 🇵🇰 Real-Life Pakistani Example
${matched.pakistanExampleUr}

### 🎯 Key Takeaways & Exam Tips
${matched.examTipsUr.map((tip) => `- ${tip}`).join('\n')}`;
    }

    return `### 📚 Concept Overview
${matched.overviewEn}

### 💡 Simple Explanation
${matched.explanationEn}

### 🧠 Step-by-Step Breakdown
${matched.breakdownEn}

### 🇵🇰 Real-Life Pakistani Example
${matched.pakistanExampleEn}

### 🎯 Key Takeaways & Exam Tips
${matched.examTipsEn.map((tip) => `- ${tip}`).join('\n')}`;
  }

  // Domain-Specific Dynamic Synthesis (Ensures Math never gets Physics/Biology equations!)
  let formulaBlockUr = `$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\quad \\text{یا} \\quad (a+b)^2 = a^2 + 2ab + b^2$$`;
  let formulaBlockEn = `$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\quad \\text{or} \\quad c^2 = a^2 + b^2$$`;
  let exampleUr = `پاکستان کے صنعتی اور انجینئرنگ پروجیکٹس (جیسے موٹرویز کی منصوبہ بندی اور تعمیراتی ڈھانچے) میں **${topic}** کے حسابی فارمولوں کا روزمرہ عملی اطلاق کیا جاتا ہے۔`;
  let exampleEn = `In Pakistani civil engineering works, infrastructure design across the national highway network, and scientific data modeling, mathematical principles of **${topic}** are applied to ensure precision.`;

  if (normSub === 'Physics') {
    formulaBlockUr = `$$F = m \\cdot a \\quad \\text{یا} \\quad V = I \\cdot R \\quad \\text{یا} \\quad W = F \\cdot d$$`;
    formulaBlockEn = `$$F = m \\cdot a \\quad \\text{or} \\quad V = I \\cdot R \\quad \\text{or} \\quad W = F \\cdot d$$`;
    exampleUr = `تربیلا اور منگلا ہائیڈرو پاور ڈیمز میں ٹربائنز کی گردش اور واپڈا کے برقی گرڈ میں **${topic}** کے طبعی قوانین کی واضح مثالیں موجود ہیں۔`;
    exampleEn = `At Tarbela and Mangla hydroelectric installations and across Pakistan's national electrical transmission grid, principles of **${topic}** govern electrical power and energy conversion.`;
  } else if (normSub === 'Chemistry') {
    formulaBlockUr = `$$2\\mathrm{H}_2 + \\mathrm{O}_2 \\longrightarrow 2\\mathrm{H}_2\\mathrm{O} \\quad \\text{اور} \\quad \\mathrm{pH} = -\\log[\\mathrm{H}^+]$$`;
    formulaBlockEn = `$$2\\mathrm{H}_2 + \\mathrm{O}_2 \\longrightarrow 2\\mathrm{H}_2\\mathrm{O} \\quad \\text{and} \\quad \\mathrm{pH} = -\\log[\\mathrm{H}^+]$$`;
    exampleUr = `فیصل آباد اور کراچی کے ٹیکسٹائل و کھاد بنانے والے کارخانوں (اینگرو، فوجی فرٹیلائزر) میں کیمیائی ری ایکشنز اور تعاملات **${topic}** کے عین مطابق ہوتے ہیں۔`;
    exampleEn = `In Pakistan's fertilizer plants (Engro, FFC) and textile processing units in Faisalabad and Karachi, stoichiometric principles of **${topic}** are essential for chemical manufacturing.`;
  } else if (normSub === 'Biology') {
    formulaBlockUr = `$$\\mathrm{C}_6\\mathrm{H}_{12}\\mathrm{O}_6 + 6\\mathrm{O}_2 \\longrightarrow 6\\mathrm{CO}_2 + 6\\mathrm{H}_2\\mathrm{O} + 36\\,\\mathrm{ATP}$$`;
    formulaBlockEn = `$$\\mathrm{C}_6\\mathrm{H}_{12}\\mathrm{O}_6 + 6\\mathrm{O}_2 \\longrightarrow 6\\mathrm{CO}_2 + 6\\mathrm{H}_2\\mathrm{O} + 36\\,\\mathrm{ATP}$$`;
    exampleUr = `پاکستان زرعی تحقیقاتی کونسل (NARC) اور باسمتی چاول اور گندم کی فصلوں کی بیماریوں سے بچاؤ اور بیج کی تیاری میں حیاتیاتی خلیوں کے افعال کی تحقیق کی جاتی ہے۔`;
    exampleEn = `At the National Agricultural Research Centre (NARC) in Islamabad, researchers examine biological cellular mechanisms to breed pest-resistant wheat and rice cultivars.`;
  }

  if (isUrdu) {
    return `### 📚 Concept Overview
**${topic}** مضمون **${subject}** (${grade}) کا ایک بنیادی تعلیمی موضوع ہے۔
اس تصور کا فہم طلبہ کے لیے نصابی امتحانات (FBISE اور صوبائی تعلیمی بورڈز) میں کامیابی اور عملی سائنسی و حسابی اطلاق کے لیے ناگزیر ہے۔

### 💡 Simple Explanation
سادہ الفاظ میں، **${topic}** اس اصول کی وضاحت کرتا ہے کہ کس طرح مادہ، توانائی، یا ریاضیاتی و سائنسی قواعد باہمی تعامل کرتے ہیں۔
جب آپ اس کا مشاہدہ کرتے ہیں، تو یہ قدرتی مظاہر اور حسابی سوالات کو مرحلہ وار سمجھنے میں مدد دیتا ہے۔

### 🧠 Step-by-Step Breakdown
1. **بنیادی تعریف اور شرائط:**
   کسی بھی حسابی یا سائنسی مسئلہ کو حل کرنے کے لیے بنیادی فارمولا اور اس کی معیاری شکل سمجھنا لازمی ہے۔
2. **ریاضیاتی و سائنسی کلیہ:**
   متغیرات کے مابین تعلق کو مساوات کے ذریعے بیان کیا جاتا ہے:
   ${formulaBlockUr}
3. **اہم کلیے اور منطقی مراحل:**
   - دیے گئے اعداد و شمار کی درست نشاندہی کریں۔
   - مروجہ بین الاقوامی اکائیوں (SI Units) میں تبدیلی کریں۔
   - حتمی جواب کو درست علامات اور حل سیٹ کے ساتھ لکھیں۔

### 🇵🇰 Real-Life Pakistani Example
${exampleUr}

### 🎯 Key Takeaways & Exam Tips
- بورڈ امتحانات میں عنوان کی جامع تعریف اور بنیادی سائنسی یا ریاضیاتی فارمولا سب سے پہلے لکھیں۔
- سوال کے تمام حصوں اور ریاضیاتی مراحل کو صاف ستھری ترتیب میں حل کریں۔
- جوابی پرچے میں یونٹس اور درست علامات کا اندراج کرنا ہرگز نہ بھولیں۔`;
  }

  return `### 📚 Concept Overview
**${topic}** is a foundational core concept in **${subject}** (${grade}) aligned with Pakistani board syllabi (FBISE and Provincial BISE).
Mastering this topic equips students with rigorous conceptual understanding and analytical problem-solving skills required for board examinations.

### 💡 Simple Explanation
In intuitive terms, **${topic}** explains the underlying laws and operational mechanisms governing this field.
It connects theoretical concepts with tangible, measurable real-world observations through structured principles and analytical rigor.

### 🧠 Step-by-Step Breakdown
1. **Core Definition and Principles:**
   Identify the primary variables, parameters, and governing subject relationships.
2. **Mathematical Representation & Equations:**
   Equations and foundational relations are expressed in standard SI units:
   ${formulaBlockEn}
3. **Systematic Application:**
   - State given values and boundary conditions.
   - Apply the governing equation and solve algebraically.
   - State the final result clearly with correct units.

### 🇵🇰 Real-Life Pakistani Example
${exampleEn}

### 🎯 Key Takeaways & Exam Tips
- In FBISE and BISE exams, begin by stating the formal definition followed by the governing formula or schematic.
- Always include standard SI units for calculated numerical values.
- Structure your answer with clear section headings for maximum score.`;
}

/**
 * Generates an authentic multiple-choice practice quiz
 */
export function generateCurriculumQuiz(options: {
  subject: string;
  topic: string;
  grade: string;
  language: string;
  count?: number;
}) {
  const { subject, topic, language, count = 4 } = options;
  const isUrdu = language === 'ur' || language === 'pa' || language === 'sd' || language === 'ps' || language === 'bal';
  const matched = findCurriculumTopic(subject, topic);

  if (matched) {
    const list = isUrdu ? matched.quizzesUr : matched.quizzesEn;
    return { quizzes: list.slice(0, count) };
  }

  if (isUrdu) {
    return {
      quizzes: [
        {
          question: `مضمون ${subject} میں "${topic}" کے بنیادی اصول کا بنیادی اطلاق کیا ہے؟`,
          options: [
            'سائنسی اور عملی مسائل کا مرحلہ وار درست حل',
            'فطری مظاہر کو بغیر فارمولے کے فرض کرنا',
            'صرف زبانی یاد دہانی',
            'کوئی بھی اطلاق نہیں',
          ],
          correctIndex: 0,
          explanation: `${topic} طلبہ کو درست سائنسی و حسابی طریقہ کار کے تحت مسائل حل کرنے کی صلاحیت دیتا ہے۔`,
        },
        {
          question: `امتحان میں "${topic}" کے سوالات حل کرتے وقت سب سے اہم پہلو کیا ہے؟`,
          options: [
            'درست فارمولا اور SI یونٹس کا استعمال',
            'صرف اندازہ لگانا',
            'یونٹس کو چھوڑ دینا',
            'غیر متعلقہ معلومات لکھنا',
          ],
          correctIndex: 0,
          explanation: 'بورڈ مارکنگ سکیم کے مطابق درست فارمولے اور یونٹس کے مخصوص نمبر ہوتے ہیں۔',
        },
      ],
    };
  }

  return {
    quizzes: [
      {
        question: `What is the primary objective of studying "${topic}" in ${subject}?`,
        options: [
          'To apply systematic principles and exact mathematical formulas to solve problems',
          'To guess theoretical values without calculation',
          'Rote memorization without conceptual grounding',
          'None of the above',
        ],
        correctIndex: 0,
        explanation: `${topic} provides essential conceptual mechanics for scientific analysis and board examination mastery.`,
      },
      {
        question: `Which element is crucial when solving analytical problems related to "${topic}"?`,
        options: [
          'Applying standard formulas with accurate SI units',
          'Omitting intermediate steps',
          'Ignoring given boundary conditions',
          'Leaving final numbers without units',
        ],
        correctIndex: 0,
        explanation: 'Board rubrics award essential marks for explicit formula substitution, steps, and SI units.',
      },
    ],
  };
}

/**
 * Generates authentic study flashcards
 */
export function generateCurriculumFlashcards(options: {
  subject: string;
  topic: string;
  grade: string;
  language: string;
  count?: number;
}) {
  const { subject, topic, language, count = 6 } = options;
  const isUrdu = language === 'ur' || language === 'pa' || language === 'sd' || language === 'ps' || language === 'bal';
  const matched = findCurriculumTopic(subject, topic);

  if (matched) {
    const list = isUrdu ? matched.flashcardsUr : matched.flashcardsEn;
    return { flashcards: list.slice(0, count) };
  }

  if (isUrdu) {
    return {
      flashcards: [
        { front: `"${topic}" کی بنیادی سائنسی تعریف کیا ہے؟`, back: `${subject} کا ایک بنیادی نصابی تصور جو اصول و ضوابط کی وضاحت کرتا ہے۔` },
        { front: `اس موضوع کا بنیادی فارمولا یا مساوات کیا ہے؟`, back: `متعلقہ سائنسی مساوات جو حسابی عمل کو متوازن رکھتی ہے۔` },
        { front: `امتحان میں سب سے عام غلطی کون سی ہوتی ہے؟`, back: `یونٹس اور بنیادی علامات کا درست اندراج نہ کرنا۔` },
      ],
    };
  }

  return {
    flashcards: [
      { front: `What is the core definition of "${topic}"?`, back: `A fundamental concept in ${subject} defining governing mechanics and principles.` },
      { front: `What are the standard SI units involved in "${topic}"?`, back: `Always use standard metric units (e.g. Joules, Newtons, meters, seconds).` },
      { front: `What is an essential board exam tip for "${topic}"?`, back: `Always state the governing formula before numerical substitution.` },
    ],
  };
}
