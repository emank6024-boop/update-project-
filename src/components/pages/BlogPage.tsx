import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Calendar,
  Clock,
  Globe,
  ArrowRight,
  ArrowLeft,
  Share2,
  Tag,
  Volume2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';
import { LanguageCode, PageId } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceSettings } from '../../context/VoiceSettingsContext';

interface BlogArticle {
  id: string;
  slug: string;
  category: 'aiTech' | 'civic' | 'agri' | 'legal';
  date: string;
  readTimeMinutes: number;
  author: string;
  availableLangs: LanguageCode[];
  title: Record<string, string>;
  summary: Record<string, string>;
  content: Record<string, string[]>;
  officialLinks?: { label: string; url: string }[];
}

const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'art-nadra-smart-nic',
    slug: 'nadra-smart-cnic-complete-renewal-guide',
    category: 'civic',
    date: '2026-03-28',
    readTimeMinutes: 5,
    author: 'PakLingo Civic Desk',
    availableLangs: ['en', 'ur', 'sd', 'pa', 'bal', 'ps'],
    title: {
      en: 'Complete Guide: Renewing Your NADRA Smart CNIC and CRC Without Queues',
      ur: 'نادرا سمارٹ شناختی کارڈ اور ب-فارم کی باآسانی تجدید کا مکمل طریقہ کار',
      sd: 'مڪمل رهنمائي: نادرا سمارٽ ڪارڊ ۽ ب-فارم بنا قطارن جي نئون ڪرائڻ جو طريقو',
      pa: 'پوری رہنمائی: نادرا سمارٹ کارڈ تے ب-فارم بنا لائناں دے نواں کراون دا طریقہ',
      bal: 'سرجمیں رہنمائی: نادرا سمارٹ شناختی کارڈ ءِ نوک کنگ ءِ آسانیں راہبند',
      ps: 'بشپړه لارښوونه: د نادرا سمارټ کارډ او ب-فارم په اسانۍ نوي کولو پړاوونه',
    },
    summary: {
      en: 'A step-by-step citizen walkthrough covering normal, urgent, and executive fees, Pak-ID mobile app biometric verification, and home delivery.',
      ur: 'سمارٹ شناختی کارڈ کی فیسوں، پاک آئی ڈی ایپ کے ذریعے آن لائن بائیو میٹرک تصدیق اور گھر پر وصولی کے جملہ مراحل کی وضاحت۔',
      sd: 'سمارٽ ڪارڊ جي فيس، پاڪ آءِ ڊي موبائل ايپ ذريعي فنگر پرنٽس چڪاس ۽ گهر پهچائڻ جا سڀ مرحلا.',
      pa: 'سمارٹ کارڈ دی فیس، پاک آئی ڈی ایپ راہیں آن لائن انگوٹھے دی تصدیق تے گھر ڈیلیوری دا طریقہ۔',
      bal: 'سمارٹ کارڈ ءِ فیس، پاک آئی ڈی ایپ ءِ وسیلہ ءَ آن لائن بائیو میٹرک ءُ لوگ ءَ گرگ ءِ رھبند۔',
      ps: 'د سمارټ کارډ فیس، پاک ای ډي اپلیکیشن له لارې د ګوتو نښې تایید او کور ته د رارسېدو پړاوونه.',
    },
    content: {
      en: [
        'Every Pakistani citizen holding an expiring or lost Computerized National Identity Card (CNIC) can now choose between visiting a NADRA Registration Center (NRC) or applying completely online through the official Pak-ID portal.',
        'Fee Structure (2026): Normal processing costs PKR 750 (delivered in ~31 days), Urgent processing costs PKR 1,500 (~15 days), and Executive processing costs PKR 2,500 (~7 days).',
        'Requirements: Original old CNIC or CNIC number, verified fingerprints through the Pak-ID app camera, and a valid postal address in Pakistan.',
        'Tip for Overseas Pakistanis: NICOP holders can renew directly via the Pak-ID web application with international postal delivery.',
      ],
      ur: [
        'تمام پاکستانی شہری جن کے شناختی کارڈ کی میعاد ختم ہو رہی ہو، وہ نادرا رجسٹریشن سنٹر تشریف لے جانے کے علاوہ سرکاری پاک آئی ڈی پورٹل کے ذریعے گھر بیٹھے بھی درخواست دے سکتے ہیں۔',
        'فیس کا شیڈول (2026): نارمل فیس 750 روپے (تقریباً 31 دن)، ارجنٹ فیس 1500 روپے (15 دن)، اور ایگزیکٹو فیس 2500 روپے (7 دن) ہے۔',
        'ضروری دستاویزات: پرانا شناختی کارڈ، پاک آئی ڈی موبائل ایپ کے کیمرے کے ذریعے بائیو میٹرک تصدیق، اور ڈاک کا درست پتہ۔',
        'اوورسیز پاکستانیوں کے لیے نائیکوپ (NICOP) کی آن لائن تجدید بین الاقوامی ڈلیوری کے ساتھ دستیاب ہے۔',
      ],
      sd: [
        'اهي سڀ پاڪستاني شهري جن جو شناختي ڪارڊ ختم ٿي رهيو آهي، اهي هاڻي نادرا سينٽر وڃڻ کانسواءِ سرڪاري پاڪ آءِ ڊي پورٽل تان به درخواست ڏئي سگهن ٿا.',
        'فيس جي تفصيل: عام فيس 750 رپيا (31 ڏينهن)، ارجنٽ فيس 1500 رپيا (15 ڏينهن) ۽ ايگزيڪيوٽو فيس 2500 رپيا (7 ڏينهن) آهي.',
        'ضروري ڪاغذ: پُراڻو ڪارڊ، پاڪ آءِ ڊي ايپ ذريعي آڱرين جا نشان ۽ گهر جو صحيح پتو.',
        'پرديهه ۾ رهندڙ سنڌي ۽ پاڪستاني نائيڪوپ ڪارڊ سڌو آن لائن گهرائي سگهن ٿا.',
      ],
      pa: [
        'اوہ سارے پاکستانی جنہاں دا شناختی کارڈ مُک رہیا اے، اوہ نادرا دفتر جائے بنا پاک آئی ڈی ایپ توں وی نواں کارڈ بنوا سکدے نیں۔',
        'فیساں دا حساب: عام فیس ۷۵۰ روپے، ارجنٹ فیس ۱۵۰۰ روپے، تے ایگزیکٹو ۲۵۰۰ روپے۔',
        'لوڑیندے کاغذات: پرانا کارڈ، موبائل کیمرے توں انگوٹھیاں دے نشان، تے گھر دا پکا پتہ۔',
        'پردیسی ویرے نائیکوپ کارڈ آن لائن ای بنوا کے اپنے پتے تے منگوا سکدے نیں۔',
      ],
      bal: 'ہر پاکستانی کہ آئی ءِ شناختی کارڈ ءِ وہد ہلاس بوھگ ءَ انت، آ نادرا سینٹر ءَ روگ ءِ بدل ءَ پاک آئی ڈی پورٹل چہ وتی لوگ ءَ ہم نوک کُت کنت۔ نارمل فیس ۷۵۰ کلدار انت، ارجنٹ ۱۵۰۰ کلدار انت، ءُ ایگزیکٹو ۲۵۰۰ کلدار انت۔ ضروری کاگد: پرانئیں شناختی کارڈ، بائیو میٹرک تصدیق ءُ لوگ ءِ پتہ۔'
        .split('۔')
        .filter(Boolean),
      ps: 'ټول هغه هېوادوال چې د شناختي کارډ موده یې پای ته رسېږي، کولی شي د پاک ای ډي لارې پرته له کتاره خپل کارډ نوی کړي. د عادي پروسې فیس ۷۵۰ روپۍ، عاجل ۱۵۰۰ روپۍ او ایګزیکټیو ۲۵۰۰ روپۍ دی. زاړه کارډ او د ګوتو نښو تایید ته اړتیا ده.'
        .split('.')
        .filter(Boolean),
    },
    officialLinks: [
      { label: 'NADRA Official Pak-ID Portal', url: 'https://id.nadra.gov.pk' },
      { label: 'NADRA Citizen Helpline 1777', url: 'https://www.nadra.gov.pk' },
    ],
  },
  {
    id: 'art-fpa-electricity-taxes',
    slug: 'demystifying-pakistan-electricity-bill-taxes-and-fpa',
    category: 'civic',
    date: '2026-03-20',
    readTimeMinutes: 6,
    author: 'Energy Economics Research',
    availableLangs: ['en', 'ur', 'sd', 'pa', 'bal', 'ps'],
    title: {
      en: 'Demystifying Electricity Bills: What are FPA, GST, TV Fee, and Financing Surcharges?',
      ur: 'بجلی کے بلوں کا تجزیہ: فیول پرائس ایڈجسٹمنٹ (FPA)، جی ایس ٹی اور اضافی سرچارجز کیا ہیں؟',
      sd: 'بجلي بلن جي حقيقت: ايف پي اي (FPA)، جي ايس ٽي، ٽي وي فيس ۽ سرچارجن جو سچ',
      pa: 'بجلی دے بل دا سچ: فیول ایڈجسٹمنٹ (FPA)، جی ایس ٹی تے ٹی وی فیس دا کیہ مطلب اے؟',
      bal: 'بجلی بل ءِ پٹ و پول: FPA، جی ایس ٹی ءُ سرچارج ٹیکسانی مانا چی انت؟',
      ps: 'د برېښنا د بلونو حقیقت: د FPA، جي ایس ټي او ټلویزیون فیس مانا څه ده؟',
    },
    summary: {
      en: 'A transparent breakdown of how power distribution companies (DISCOs) calculate fuel surcharges, consumer protected slabs, and peak vs off-peak hours.',
      ur: 'لیسکو، کے الیکٹرک، گیپکو اور فیسکو کے بجلی بلوں میں پروٹیکٹڈ اور نان پروٹیکٹڈ ٹیرف، پیک آورز اور ٹیکسز کا آسان ریاضیاتی جائزہ۔',
      sd: 'سنڌ ۽ پاڪستان جي بجلي ڪمپنين (سيپڪو، حيسڪو، ڪي اليڪٽرڪ) جي بلن ۾ پروٽيڪٽڊ سليب ۽ ٽيڪسن جي سمجهه.',
      pa: 'پنجاب تے پاکستان دیاں بجلی کمپنیاں ولوں بل وچ لائے گئے ٹیکساں تے پروٹیکٹڈ یونٹاں دی وضاحت۔',
      bal: 'کیسکو ءُ دگہ کمپنیاں ولوں بجلی بل ءِ تہا ٹیکس ءُ یونٹانی حساب کتاب۔',
      ps: 'د پښتونخوا او پاکستان برېښنا شرکتونو لخوا په بل کې د لګول شویو مالیاتو ساده تشریح.',
    },
    content: {
      en: [
        'Pakistani electricity bills consist of two major components: the Cost of Electricity (Energy Charges + Capacity Charges) and Government Surcharges / Taxes.',
        'Fuel Price Adjustment (FPA): Reflects the difference between NEPRA’s forecasted generation fuel price (LNG, imported coal, furnace oil) and the actual fuel costs incurred 2 months prior.',
        'Protected Consumer Status: Consumers using under 200 units consistently for 6 consecutive months receive subsidized base tariffs.',
        'Peak Hours vs Off-Peak Hours: Peak hours (typically 5 PM to 9 PM in winter, 7 PM to 11 PM in summer) carry significantly higher tariff rates for three-phase commercial and residential meters.',
      ],
      ur: [
        'پاکستانی بجلی کے بل میں بنیادی طور پر دو حصے ہوتے ہیں: بجلی کی لاگت (انرجی چارجز + کیپیسٹی چارجز) اور حکومتی ٹیکسز و سرچارجز۔',
        'فیول پرائس ایڈجسٹمنٹ (FPA): نیپرا کے تخمینہ شدہ ایندھن اور دو ماہ قبل پیدا کی گئی بجلی کے حقیقی ایندھن کے درمیان فرق کو ظاہر کرتا ہے۔',
        'پروٹیکٹڈ صارف: وہ صارفین جو مسلسل 6 ماہ تک 200 یونٹ سے کم بجلی استعمال کرتے ہیں، انہیں حکومت کی طرف سے سبسڈی دی جاتی ہے۔',
        'پیک آورز: گرمیوں میں شام 7 سے رات 11 بجے اور سردیوں میں شام 5 سے رات 9 بجے تھری فیز صارفین سے بلند ترین ٹیرف چارج کیا جاتا ہے۔',
      ],
      sd: [
        'بجلي جي بل ۾ بنيادي طرح ٻه شيون آهن: بجلي جو خرچ ۽ حڪومت جا لڳايل ٽيڪس.',
        'ايف پي اي (FPA) هر مهيني تيل ۽ گئس جي مٽجندڙ اگهن سبب نپرا جي فيصلي موجب گهٽ وڌ ٿيندو آهي.',
        'پروٽيڪٽڊ واهپيدار: جيڪي مسلسل 6 مهينا 200 يونٽن کان گهٽ بجلي واپرائين ٿا انهن کي رعايت ملندي آهي.',
      ],
      pa: [
        'بجلی دے بل وچ دو وڈیاں گلاں ہوندیاں نیں: بجلی دی اصل لاگت تے سرکاری ٹیکس۔',
        'ایف پی اے (FPA) تیل تے کوئلے دے بھاء وچ بدلاؤ دی وجہ توں نیپرا ولوں لایا جاندا اے۔',
        '۲۰۰ یونٹ توں تھلے چھ مہینے مسلسل رہن والے صارفین نوں رعایت ملدی اے۔',
      ],
      bal: 'بجلی بل ءِ تہا دو بہر بنت: بجلی ءِ قیمت ءُ سرکار ءِ ٹیکس۔ FPA ہر ماہ تیل ءُ گیس ءِ نہاد بدل بوھگ سبب نیپرا ءِ فیصلۂ ردا کم یا گیش بیت۔ ۲۰۰ یونٹ چہ کم کارمرز کنوکاں سبسڈی رسیت۔'
        .split('۔')
        .filter(Boolean),
      ps: 'د برېښنا په بل کې د بریښنا لګښت او حکومتي مالیات شامل دي. FPA د تیلو په بیو کې بدلون ښيي. هغه کورنۍ چې له ۲۰۰ یونټونو کم مصرفوي ځانګړې رعایت ترلاسه کوي.'
        .split('.')
        .filter(Boolean),
    },
    officialLinks: [{ label: 'NEPRA Official Tariff Portal', url: 'https://nepra.org.pk' }],
  },
  {
    id: 'art-wheat-yellow-rust-cure',
    slug: 'wheat-crop-yellow-rust-treatment-in-pakistan',
    category: 'agri',
    date: '2026-03-15',
    readTimeMinutes: 4,
    author: 'Kissan Agri Advisory',
    availableLangs: ['en', 'ur', 'sd', 'pa', 'bal', 'ps'],
    title: {
      en: 'Kissan Alert: Identifying and Treating Yellow Rust in Pakistani Wheat Crops',
      ur: 'کسان الرٹ: گندم کی فصل میں پیلی کنگی (Yellow Rust) کی بر وقت تشخیص اور تدارک',
      sd: 'ڪسان سجاڳي: ڪڻڪ ۾ ڦٽڪي (پيلي ڪنگي) جي سڃاڻپ ۽ بچاءُ جو علاج',
      pa: 'کسان الرٹ: کنک دی پیلی کنگی دی پچھان تے دیسی علاج دا نسخہ',
      bal: 'ڈگارکار الرٹ: گندم ءِ زردیں زنگ نادراہی ءُ آئی ءِ علاج',
      ps: 'بزګرانو ته خبرداری: په غنمو کې د ژېړې زنګۍ نښې او درملنه',
    },
    summary: {
      en: 'Seasonal weather shifts in Punjab, Sindh, and KP trigger Puccinia striiformis stripe rust. Learn certified fungicides, foliar spray timing, and resistant seed varieties.',
      ur: 'موسمیاتی تبدیلیوں اور نمی کی وجہ سے گندم کے پتوں پر پیلی دھاریاں نمودار ہوتی ہیں۔ بااعتماد فنگس کش ادویات اور زرعی سپرے کی احتیاطی تدابیر۔',
      sd: 'سنڌ ۽ پنجاب ۾ ٿڌ ۽ نمي سبب ڪڻڪ جي پنن تي پيلا ليڪا پوندا آهن. منظور ٿيل زراعتي دوائن ۽ اسپري جا طريقا.',
      pa: 'نمی تے ٹھنڈ دی وجہ توں کنک دے پتیاں تے پیلی پاؤڈر ونگی کنگی لگی جاندی اے۔ بر وقت اسپرے تے بچاء۔',
      bal: 'سردی ءُ نم سبب گندم ءِ تاکانی سرا زردیں دھاریاں ودی بنت۔ زرعی دواء ءُ سپرے ءِ وہد۔',
      ps: 'په غنمو کې د زېړې زنګۍ پر وړاندې پر وخت سپری او د تایید شوو کرنیزو تخمونو کارول.',
    },
    content: {
      en: [
        'Yellow rust (Puccinia striiformis), locally known as Peeli Kangi in Punjab and Pili Kangi in Sindh, is a dangerous airborne fungal disease that attacks wheat foliage during cool, humid conditions (10°C to 15°C).',
        'Key Symptoms: Distinct parallel rows of yellow or orange-yellow powdery pustules forming along the veins of wheat leaves, resembling stripes.',
        'Emergency Action: Inspect fields during early morning hours. If yellow powder rubs off onto your fingers, immediately apply certified triazole fungicides such as Tebuconazole or Propiconazole before disease reaches the flag leaf.',
        'Preventive Measure for Next Season: Always choose certified rust-resistant seed varieties approved by the Agricultural Research Institute (e.g., Akbar-2019, Dilkash-2020, Subhani-2021).',
      ],
      ur: [
        'پیلی کنگی (Yellow Rust) گندم کی سب سے خطرناک پھپھوندی کی بیماری ہے جو سرد اور نم موسم (10 سے 15 ڈگری سینٹی گریڈ) میں تیزی سے پھیلتی ہے۔',
        'بیماری کی علامات: گندم کے پتوں پر نسوں کے متوازی پیلے یا نارنجی رنگ کے پاؤڈر جیسی لکیریں بن جاتی ہیں۔ ہاتھ لگانے پر پیلا سفوف انگلیوں پر لگ جاتا ہے۔',
        'فوری حل: فلیگ لیف (چھتری نما پتے) کے متاثر ہونے سے پہلے بااعتماد فنگسائیڈز (مثلاً پروپیکونازول یا ٹیبوکونازول) کا سپرے صبح کے وقت کریں۔',
        'آئندہ کے لیے تدارک: اگلے سیزن کے لیے کنگی کے خلاف قوت مدافعت رکھنے والی مصدقہ اقسام (جیسے اکبر 2019، دلکش 2020) کاشت کریں۔',
      ],
      sd: [
        'ڪڻڪ جي پيلي ڪنگي ٿڌي ۽ آلي موسم ۾ پکڙجندڙ فنگس جي بيماري آهي.',
        'علامتون: پنن تي پيلي پائوڊر جون ليڪون ٿي پون ٿيون. هٿ لائڻ سان آڱرين تي زرد پائوڊر چنبڙي ٿو.',
        'فوري علاج: سٺي فنگي سائڊ دوائن (Propiconazole يا Tebuconazole) جو اسپري فوري ڪيو وڃي ته جيئن سٽو بچي سگهي.',
      ],
      pa: [
        'پیلی کنگی ٹھنڈے تے نم موسم وچ کنک تے حملہ کردی اے۔',
        'علامتاں: پتیاں تے نسوار یا پیلے رنگ دا باریک پاؤڈر جمن لگدا اے۔',
        'علاج: فلیگ لیف تیکر روگ پُجن توں پہلاں ٹیبوکونازول یا ٹائلٹ فنگیسائیڈ دا اسپرے کرو۔',
      ],
      bal: 'زردیں زنگ گندم ءِ تاکانی سرا لگیت ءُ حاصل ءَ برباد کنت۔ زردیں پاؤڈر تاکاں تہا گندگ بیت۔ فنگس دواء داں سپرے کنگ ءَ روگ بند بیت۔'
        .split('۔')
        .filter(Boolean),
      ps: 'د غنمو ژېړه زنګۍ په نمناکه هوا کې ژر خپرېږي. پر پاڼو د ژېړو نښو لیدلو سره سمدستي د چينجي ضد درمل سپری کړئ.'
        .split('.')
        .filter(Boolean),
    },
  },
  {
    id: 'art-bisp-8171-guidelines',
    slug: 'bisp-8171-benazir-kafalat-payment-verification-process',
    category: 'civic',
    date: '2026-03-05',
    readTimeMinutes: 5,
    author: 'PakLingo Civic Desk',
    availableLangs: ['en', 'ur', 'sd', 'pa', 'bal', 'ps'],
    title: {
      en: 'BISP 8171 Kafalat: How to Verify Eligibility and Receive Payments Securely',
      ur: 'بے نظیر انکم سپورٹ 8171 کفالت: اہلیت جانچنے اور رقم کی محفوظ وصولی کا طریقہ',
      sd: 'بي آءِ ايس پي 8171 بينظير ڪفالت: حقداري چڪاسڻ ۽ پئسن جي پڪي وصولي',
      pa: 'بی آئی ایس پی 8171 کفالت: اہلیت پرکھن تے رقم لین دا پورا طریقہ',
      bal: 'بی آئی ایس پی 8171 بینظیر کفالت: زرّ گرگ ءِ پکائیں رھبند',
      ps: 'د بي آی ایس پي 8171 کفالت: د وړتیا معلومول او د پیسو ترلاسه کول',
    },
    summary: {
      en: 'Avoid fraudulent SMS scammers. Learn the official SMS format to 8171, biometric retail agent verification, and dynamic registry in your Tehsil.',
      ur: 'جعلی ایس ایم ایس اور فراڈ سے بچاؤ، 8171 پر شناختی کارڈ چیک کرنے، تحصیل دفاتر میں ڈائنامک سروے اور ایجنٹ سے مکمل رقم حاصل کرنے کا طریقہ۔',
      sd: 'ڪوڙن واٽس ايپ ميسيجز کان بچو. پنهنجو ڪارڊ رڳو 8171 تي ايس ايم ايس ڪريو ۽ بايو ميٽرڪ ذريعي پئسا وٺو.',
      pa: 'فراڈ میسجاں توں بچو، ۸۱۷۱ تے شناختی کارڈ نمبر بھیجو تے بائیو میٹرک تصدیق نال پوری قسط لوو۔',
      bal: 'دروغیں میسجاں چہ وتا بچین ات۔ شناختی کارڈ ۸۱۷۱ دیم دے ات ءُ فنگر پرنٹ نال وتی زرّ بہ گر ات۔',
      ps: 'د دروغجنو میسجونو ښکار مه کېږئ. یوازې ۸۱۷۱ ته خپل شناختي کارډ ولیږئ او رسمي مرسته ترلاسه کړئ.',
    },
    content: {
      en: [
        'The Benazir Income Support Programme (BISP) issues quarterly Kafalat payments solely through the official short-code 8171. BISP NEVER sends messages from personal mobile numbers (+92 3xx).',
        'How to Check: Send your 13-digit CNIC number without hyphens to 8171 via SMS, or check the official 8171 web portal.',
        'If Deemed Eligible: Visit the designated partner bank agent (HBL Konnect in Punjab/Sindh/Balochistan, Bank Alfalah in KP/AJK/GB) with your original CNIC for biometric verification.',
        'Never Pay Fees: BISP verification and disbursement are 100% free of charge. Report agents demanding illegal deductions directly to the BISP toll-free helpline at 0800-26477.',
      ],
      ur: [
        'بے نظیر انکم سپورٹ پروگرام (BISP) کی تمام سرکاری پیغامات اور ادائیگیاں صرف اور صرف شارٹ کوڈ 8171 سے موصول ہوتی ہیں۔ کسی ذاتی موبائل نمبر سے آنے والے میسج پر کبھی یقین نہ کریں۔',
        'اہلیت کی تصدیق: اپنا 13 ہندسی شناختی کارڈ نمبر بغیر ڈیش کے 8171 پر ایس ایم ایس کریں یا سرکاری ویب پورٹل دیکھیں۔',
        'رقم کی وصولی: اصل شناختی کارڈ کے ساتھ نامزد بینک ایجنٹ (پنجاب، سندھ اور بلوچستان میں ایچ بی ایل کنیکٹ، خیبر پختونخوا میں بینک الفلاح) کے پاس جا کر انگوٹھا لگا کر رقم وصول کریں۔',
        'کوئی فیس ادا نہ کریں: بی آئی ایس پی کی رقم سے کٹوتی غیر قانونی ہے۔ کسی بھی کٹوتی کی شکایت ٹول فری نمبر 0800-26477 پر درج کروائیں۔',
      ],
      sd: [
        'بي نظير انڪم سپورٽ جا سڀ پيغام رڳو سرڪاري ڪوڊ 8171 تان ايندا آهن.',
        'طريقو: پنهنجو 13 انگن وارو شناختي ڪارڊ بنا ليڪن جي 8171 تي ايس ايم ايس ڪريو.',
        'پئسا وٺڻ: پنهنجو شناختي ڪارڊ کڻي بئنڪ ايجنٽ وٽ وڃو ۽ فنگر پرنٽ لڳائي پوري رقم حاصل ڪريو.',
        'ڪٽوتي غير قانوني آهي: ڪو ايجنٽ پئسا ڪٽي ته 0800-26477 تي فوري شڪايت ڪريو.',
      ],
      pa: [
        'بی آئی ایس پی دے سارے میسج صرف ۸۱۷۱ توں آندے نیں۔ کسے عام نمبر توں آون والے میسج تے یقین نہ کرو۔',
        'شناختی کارڈ ۸۱۷۱ تے بھیجو تے اہلیت پتہ کرو۔',
        'بینک ایجنٹ کول جا کے انگوٹھا لا کے پوری قسط لوو۔ کوئی کٹوتی نہ کرواؤ۔',
      ],
      bal: 'بینظیر پروگرام ءِ سرجمیں میسج صرف ۸۱۷۱ چہ کاینت۔ ذاتی نمبرانی سرا باور مہ کن ات۔ اصل شناختی کارڈ ءِ ہمراہی ءَ وتی پٹ اتگیں زرّاں فنگر پرنٹ نال گر ات۔ کٹوتی غیرکانودی انت۔'
        .split('۔')
        .filter(Boolean),
      ps: 'د بي آی ایس پي ټول پیغامونه یوازې له ۸۱۷۱ څخه راځي. خپل ۱۳ عددي شناختي کارډ واستوئ او خپله برخه پیسې پوره ترلاسه کړئ.'
        .split('.')
        .filter(Boolean),
    },
    officialLinks: [
      { label: 'BISP 8171 Web Tracking Portal', url: 'https://8171.bisp.gov.pk' },
      { label: 'BISP Toll Free Helpline: 0800-26477', url: 'https://bisp.gov.pk' },
    ],
  },
];

interface BlogPageProps {
  onSelectPage: (page: PageId) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onSelectPage }) => {
  const { t, selectedLanguage, isRTL, currentLanguage } = useLanguage();
  const { speak, isSpeaking, stopSpeaking, checkVoiceSupport } = useVoiceSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<BlogArticle | null>(null);

  const categories = [
    { id: 'all', labelKey: 'blog.all', fallback: 'All Categories' },
    { id: 'civic', labelKey: 'blog.catCivic', fallback: 'Civic & NADRA Guides' },
    { id: 'aiTech', labelKey: 'blog.catAiTech', fallback: 'AI & Language Tech' },
    { id: 'agri', labelKey: 'blog.catAgri', fallback: 'Agriculture & Climate' },
    { id: 'legal', labelKey: 'blog.catLegal', fallback: 'Legal Rights & Health' },
  ];

  const filteredArticles = useMemo(() => {
    return BLOG_ARTICLES.filter((article) => {
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      const titleInLang =
        article.title[selectedLanguage] || article.title['ur'] || article.title['en'] || '';
      const summaryInLang =
        article.summary[selectedLanguage] || article.summary['ur'] || article.summary['en'] || '';

      return titleInLang.toLowerCase().includes(q) || summaryInLang.toLowerCase().includes(q);
    });
  }, [selectedCategory, searchQuery, selectedLanguage]);

  const handleReadArticle = (article: BlogArticle) => {
    setActiveArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getArticleTitle = (article: BlogArticle): string => {
    return article.title[selectedLanguage] || article.title['ur'] || article.title['en'];
  };

  const getArticleSummary = (article: BlogArticle): string => {
    return article.summary[selectedLanguage] || article.summary['ur'] || article.summary['en'];
  };

  const getArticleContent = (article: BlogArticle): string[] => {
    if (article.content[selectedLanguage]) {
      return article.content[selectedLanguage];
    }
    if (article.content['ur']) {
      return article.content['ur'];
    }
    return article.content['en'] || [];
  };

  const isArticleTranslatedInLang = (article: BlogArticle): boolean => {
    return !!article.title[selectedLanguage] && !!article.content[selectedLanguage];
  };

  const handleListenArticle = (article: BlogArticle) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const title = getArticleTitle(article);
      const summary = getArticleSummary(article);
      speak(`${title}. ${summary}`, selectedLanguage);
    }
  };

  const voiceSupport = checkVoiceSupport(selectedLanguage);

  return (
    <div
      className="w-full max-w-full min-w-0 py-4 text-[var(--text-primary)] transition-colors duration-200"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="w-full min-w-0 space-y-8">
        {/* Full Article Reader Modal / View */}
        {activeArticle ? (
          <article className="p-5 sm:p-8 lg:p-10 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-md space-y-6 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setActiveArticle(null);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-all cursor-pointer"
              >
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{t('blog.backToBlog', 'Back to Articles')}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleListenArticle(activeArticle)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  title="Listen to Article Summary"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>
                    {isSpeaking ? t('translator.stop', 'Stop') : t('translator.listen', 'Listen')}
                  </span>
                </button>
              </div>
            </div>

            {/* Translation Availability Notice Banner */}
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                isArticleTranslatedInLang(activeArticle)
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
              }`}
            >
              {isArticleTranslatedInLang(activeArticle) ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">
                  {isArticleTranslatedInLang(activeArticle)
                    ? t('blog.languageNotice', 'This article is fully translated into {lang}:', {
                        lang: currentLanguage.nativeName,
                      })
                    : t(
                        'blog.languageFallbackNotice',
                        'Editorial translation for {lang} is pending. Showing available edition with translated summary.',
                        { lang: currentLanguage.nativeName }
                      )}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] opacity-90">
                  <span>
                    {t('blog.availableLanguages', 'Available in: {langs}', {
                      langs: activeArticle.availableLangs.join(', ').toUpperCase(),
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Article Header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider text-[10px]">
                  {activeArticle.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {activeArticle.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {t('blog.readTime', '{time} min read', {
                    time: activeArticle.readTimeMinutes,
                  })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] leading-snug">
                {getArticleTitle(activeArticle)}
              </h1>

              <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium leading-relaxed bg-[var(--surface-secondary)] p-4 rounded-2xl border border-[var(--border)]">
                {getArticleSummary(activeArticle)}
              </p>
            </div>

            {/* Article Content Paragraphs */}
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[var(--text-primary)]">
              {getArticleContent(activeArticle).map((paragraph, idx) => (
                <p key={idx} className="bg-[var(--surface)] p-2 rounded-xl">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Official Source Links */}
            {activeArticle.officialLinks && activeArticle.officialLinks.length > 0 && (
              <div className="pt-6 border-t border-[var(--border)] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {t('common.official', 'Official')} Links & Verification Portals:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeArticle.officialLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </article>
        ) : (
          <>
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{currentLanguage.nativeName}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {t('blog.title', 'PakLingo Insights & Civic Knowledge Base')}
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-secondary)]">
                {t(
                  'blog.subtitle',
                  'In-depth articles, technology updates, and civic guides across Pakistan’s regional languages'
                )}
              </p>
            </div>

            {/* Search and Category Filters */}
            <div className="space-y-4">
              <div className="relative max-w-xl mx-auto">
                <Search className={`w-4 h-4 absolute top-3.5 text-[var(--text-muted)] ${isRTL ? 'right-3.5' : 'left-3.5'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('blog.searchPlaceholder', 'Search articles, topics, or keywords...')}
                  className={`w-full py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs ${
                    isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
                  }`}
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[var(--surface)] hover:bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {t(cat.labelKey, cat.fallback)}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles Grid */}
            {filteredArticles.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <AlertCircle className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {t('blog.noArticlesFound', 'No articles matched your search or category filter.')}
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArticles.map((article) => {
                  const title = getArticleTitle(article);
                  const summary = getArticleSummary(article);
                  const isFullyTranslated = isArticleTranslatedInLang(article);

                  return (
                    <div
                      key={article.id}
                      className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--text-muted)] font-medium">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider text-[10px]">
                            {article.category}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            <span>
                              {t('blog.readTime', '{time} min read', {
                                time: article.readTimeMinutes,
                              })}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-emerald-600 transition-colors leading-snug">
                          {title}
                        </h3>

                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                          {summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-[11px]">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isFullyTranslated
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {isFullyTranslated ? currentLanguage.nativeName : 'Bilingual Edition'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleListenArticle(article)}
                            className="p-2 rounded-xl hover:bg-[var(--surface-secondary)] text-[var(--text-muted)] hover:text-emerald-600 transition-colors cursor-pointer"
                            title="Listen"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReadArticle(article)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                          >
                            <span>{t('blog.readFull', 'Read')}</span>
                            <ArrowRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
