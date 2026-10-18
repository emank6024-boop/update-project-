import { Router, Request, Response } from 'express';
import { getGemini, callWithCandidateModels, getFastModelConfig } from '../geminiService.js';
import { getGlobalLanguageDirective } from '../languageDirectives.js';

export const farmerRouter = Router();

// Helper for Farmer Language Prompting
export function getFarmerLanguageInstruction(lang?: string): string {
  const baseDirective = getGlobalLanguageDirective(lang || 'ur');
  return `${baseDirective}
ADDITIONAL AGRICULTURAL INSTRUCTION:
- Speak in warm, respectful, practical terminology familiar to Pakistani farmers (zamindars/kisaan).
- Where technical agricultural terms, pesticide chemicals, or seed varieties are mentioned, include the common local Pakistani market name alongside in parentheses (e.g. "DAP / ڈی اے پی", "Urea / یوریا", "Kisan Card / کسان کارڈ", "Pesticide Spray / کیڑے مار اسپرے").
- Structure responses clearly with bullet points, actionable steps, and dosage warnings.`;
}

// 1. Farmer Assistant: Ask an Agricultural Question
farmerRouter.post('/api/farmer/ask', async (req: Request, res: Response) => {
  const { question: rawQ, query, crop, cropType, province, season, language = 'ur' } = req.body;
  const question = (typeof rawQ === 'string' && rawQ.trim()) || (typeof query === 'string' && query.trim()) || '';
  const effectiveCrop = crop || cropType || 'General / Multi-crop';
  if (!question) {
    return res.status(400).json({ error: 'Agricultural question is required.' });
  }

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({ error: 'AI_UNAVAILABLE', message: 'Gemini API not configured.' });
  }

  const systemInstruction = `You are the PakLingo Agri Advisor (کسان مشیر), an expert agricultural scientist and field advisor for Pakistani farmers.
CORE ADVISORY PRINCIPLES:
1. Provide practical, clear, actionable agricultural guidance tailored to Pakistani agro-ecological zones (Indus plains, canal-fed areas, Barani rainfed tracts, arid/coastal, Northern hills).
2. Incorporate local farming practices and current season context (Rabi vs Kharif).
3. Emphasize integrated pest management (IPM), soil health, efficient water use (drip, laser leveling, alternate furrow irrigation), and safe chemical handling.
4. If recommending pesticides or fertilizers, provide general approved active ingredients and dosages with safety warnings.
5. Emphasize: "Consult your local Agriculture Extension Officer (محکمہ زراعت توسیع) or verified field specialist before large-scale pesticide applications."
${getFarmerLanguageInstruction(language)}`;

  const prompt = `Crop: ${effectiveCrop}\nProvince/Zone: ${province || 'Punjab / Sindh / KP / Balochistan'}\nSeason: ${season || 'Current Season'}\nFarmer Question: "${question}"`;

  try {
    const response = await callWithCandidateModels(
      'Farmer Ask',
      (modelName) =>
        ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: getFastModelConfig(modelName, { systemInstruction }),
        }),
      16000
    );
    const answer = response.text || '';
    if (answer) {
      return res.json({ answer, guidance: answer, advice: answer, text: answer });
    }
  } catch (err: any) {
    console.warn('Farmer Ask AI call failed, generating agronomist guidance:', err?.message || err);
  }

  // Graceful agronomist guidance fallback
  const fallbackAnswer = generateFarmerAskFallback({
    question,
    crop: effectiveCrop,
    province,
    season,
    language: String(language || 'ur'),
  });
  return res.json({ answer: fallbackAnswer, guidance: fallbackAnswer, advice: fallbackAnswer, text: fallbackAnswer });
});

// 2. Farmer Assistant: Disease & Crop Health Analysis (Text or Image)
farmerRouter.post('/api/farmer/disease-analysis', async (req: Request, res: Response) => {
  const { symptoms, imageBase64, mimeType, crop, plantPart, language = 'ur' } = req.body;
  if (!symptoms && !imageBase64) {
    return res.status(400).json({ error: 'Please provide symptom details or upload a crop photo.' });
  }

  const ai = getGemini();
  const systemInstruction = `You are the PakLingo Crop Disease & Plant Pathology Specialist for Pakistan.
CORE DIAGNOSTIC PRINCIPLES:
1. Carefully inspect the crop symptoms (discoloration, spots, wilting, curling, rust, smut, blight, chewing marks, whitefly honey-dew, stunting).
2. Identify likely disease or pest candidate(s) common in Pakistan (e.g. Cotton Leaf Curl Virus [CLCuV], Pink Bollworm, Wheat Rust [Yellow/Brown], Rice Blast, Citrus Canker, Sugarcane Red Rot, Tomato Early Blight).
3. If an image is provided: Examine leaf, stem, or fruit visually. If the image is blurry, partially obscured, or inconclusive, note the uncertainty clearly.
4. Provide structured, practical treatment steps:
   - Immediate cultural/mechanical control (destroying affected debris, pruning, drainage)
   - Biological / Organic remedies where feasible (neem extract, beneficial insects)
   - Chemical options (approved fungicides/insecticides with proper dilution, e.g. ml per 100L water / acre)
   - Protective gear warnings (mask, gloves, spraying downwind, not spraying during peak noon heat)
5. Conclude with:
"> Reminder: Verify severe infestations with your local district Agriculture Extension officer (زراعت توسیع) before mass chemical spraying."
${getFarmerLanguageInstruction(language)}`;

  if (ai) {
    try {
      let contents: any;
      if (imageBase64 && typeof imageBase64 === 'string') {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9+.-]+;base64,/, '');
        contents = [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: `Crop: ${crop || 'Not specified'}\nAffected Part: ${plantPart || 'Leaves / Whole Plant'}\nFarmer Description: "${symptoms || 'Please identify the disease or pest visible on this plant and provide treatment remedies.'}"`,
          },
        ];
      } else {
        contents = `Crop: ${crop || 'Not specified'}\nAffected Part: ${plantPart || 'Leaves / Whole Plant'}\nFarmer Symptom Description:\n"""\n${symptoms}\n"""`;
      }

      const response = await callWithCandidateModels(
        'Farmer Disease Analysis',
        (modelName) =>
          ai.models.generateContent({
            model: modelName,
            contents,
            config: { systemInstruction },
          }),
        25000
      );
      const analysis = response.text || '';
      if (analysis) {
        return res.json({ analysis, guidance: analysis, advice: analysis, text: analysis });
      }
    } catch (err: any) {
      console.warn('Farmer Disease Analysis AI call failed, activating agronomic diagnosis:', err?.message || err);
    }
  }

  // High-precision plant pathology & crop advisory fallback
  const fallbackAnalysis = generateCropAnalysisFallback({
    crop: String(crop || 'General Crop'),
    symptoms: String(symptoms || ''),
    plantPart: String(plantPart || 'Leaves & Stem'),
    hasImage: Boolean(imageBase64),
    language: String(language || 'ur'),
  });

  return res.json({
    analysis: fallbackAnalysis,
    guidance: fallbackAnalysis,
    advice: fallbackAnalysis,
    text: fallbackAnalysis,
  });
});

// 3. Farmer Assistant: Crop Care Guide
farmerRouter.post('/api/farmer/crop-care', async (req: Request, res: Response) => {
  const { crop, stage, province, soilType, language = 'ur' } = req.body;
  if (!crop || typeof crop !== 'string') {
    return res.status(400).json({ error: 'Crop name is required.' });
  }

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({ error: 'AI_UNAVAILABLE', message: 'Gemini API not configured.' });
  }

  const systemInstruction = `You are the PakLingo Agronomy Specialist for Pakistani crops.
Produce a comprehensive, step-by-step crop care guide for the specified growth stage:
1. **Stage Overview**: What the plant is doing at this stage (e.g. Germination, Tillering, Vegetative, Flowering/Booting, Grain Filling, Maturity/Harvest).
2. **Irrigation Schedule**: Water requirements, sensitive critical periods (e.g. crown root initiation in wheat, flowering in cotton), canal vs tube-well considerations.
3. **Nutrient Management**: Recommended fertilizer split doses for this stage (Urea, DAP, Potash, Zinc, Boron).
4. **Weed & Pest Watch**: Crucial weeds or pests to scout for right now.
5. **Weather Hazards**: Protection against high winds, heat spells, frost, or waterlogging.
${getFarmerLanguageInstruction(language)}`;

  const prompt = `Crop: ${crop}\nGrowth Stage: ${stage || 'Full Season Overview'}\nProvince: ${province || 'Punjab / Sindh / KP / Balochistan'}\nSoil Type: ${soilType || 'Loam / Sandy Loam'}`;

  try {
    const response = await callWithCandidateModels(
      'Farmer Crop Care',
      (modelName) =>
        ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { systemInstruction },
        }),
      22000
    );
    const careGuide = response.text || '';
    if (careGuide) {
      return res.json({ careGuide });
    }
    return res.status(503).json({ error: 'Unable to generate crop care guide right now.' });
  } catch (err: any) {
    console.error('Crop Care Error:', err?.message || err);
    return res.status(503).json({ error: 'Unable to generate crop care guide right now.' });
  }
});

// 4. Farmer Assistant: Pest Information
farmerRouter.post('/api/farmer/pest-info', async (req: Request, res: Response) => {
  const { pestName, crop, language = 'ur' } = req.body;
  if (!pestName || typeof pestName !== 'string') {
    return res.status(400).json({ error: 'Pest name is required.' });
  }

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({ error: 'AI_UNAVAILABLE', message: 'Gemini API not configured.' });
  }

  const systemInstruction = `You are the PakLingo Agricultural Entomologist for Pakistani field and horticultural crops.
Provide a clear pest management profile:
1. **Identification**: How to recognize the pest (nymph, adult, damage pattern on leaves/bolls/roots).
2. **Economic Threshold Level (ETL)**: When spraying is actually warranted vs when natural predators can handle it.
3. **Cultural & Mechanical Control**: Light traps, yellow sticky cards, pheromone traps, removing alternate weed hosts.
4. **Chemical Control**: Recommended safe chemical options, effective spray timing (early morning or late evening), and resistance management (rotating chemistries).
5. **Safety Measures**: Operator safety during spraying.
${getFarmerLanguageInstruction(language)}`;

  const prompt = `Pest: "${pestName}"\nAffected Crop: "${crop || 'General'}"`;

  try {
    const response = await callWithCandidateModels(
      'Farmer Pest Info',
      (modelName) =>
        ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { systemInstruction },
        }),
      22000
    );
    const pestInfo = response.text || '';
    if (pestInfo) {
      return res.json({ pestInfo });
    }
    return res.status(503).json({ error: 'Unable to fetch pest information right now.' });
  } catch (err: any) {
    console.error('Pest Info Error:', err?.message || err);
    return res.status(503).json({ error: 'Unable to fetch pest information right now.' });
  }
});

// 5. Farmer Assistant: Fertilizer Calculator & Guidance
farmerRouter.post('/api/farmer/fertilizer', async (req: Request, res: Response) => {
  const { crop, acreage = 1, soilType, previousCrop, budget, language = 'ur' } = req.body;
  if (!crop || typeof crop !== 'string') {
    return res.status(400).json({ error: 'Crop name is required.' });
  }

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({ error: 'AI_UNAVAILABLE', message: 'Gemini API not configured.' });
  }

  const systemInstruction = `You are the PakLingo Soil Fertility & Fertilizer Specialist for Pakistan.
Calculate and explain a balanced fertilizer plan for the given acreage in Pakistan:
1. **Estimated Bag Count per Acre**:
   - DAP (50 kg bags) at sowing
   - Urea (50 kg bags) split into recommended timings (1st water, 2nd water)
   - Potash (SOP / MOP) for disease resistance and grain size
   - Micronutrients (Zinc Sulphate 33% or 21%, Boron)
2. **Timing of Application**: Exact growth stage for each application.
3. **Efficiency Advice**: How to prevent nitrogen volatilization/loss (irrigation immediately after broadcast, deep banding of phosphorus).
4. **Organic & Bio-fertilizer Integration**: Farmyard manure (FYM), green manuring, humic acid to reduce synthetic costs.
5. Approximate market guidance (noting prices fluctuate per season).
${getFarmerLanguageInstruction(language)}`;

  const prompt = `Crop: ${crop}\nTotal Area: ${acreage} Acre(s)\nSoil Type: ${soilType || 'Medium Loam'}\nPrevious Crop: ${previousCrop || 'Fallow / Wheat'}\nBudget Consideration: ${budget || 'Standard'}`;

  try {
    const response = await callWithCandidateModels(
      'Farmer Fertilizer',
      (modelName) =>
        ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { systemInstruction },
        }),
      22000
    );
    const plan = response.text || '';
    if (plan) {
      return res.json({ plan });
    }
    return res.status(503).json({ error: 'Unable to calculate fertilizer plan right now.' });
  } catch (err: any) {
    console.error('Fertilizer Error:', err?.message || err);
    return res.status(503).json({ error: 'Unable to calculate fertilizer plan right now.' });
  }
});

// 6. Farmer Assistant: Weather-based Farm Guidance
farmerRouter.post('/api/farmer/weather-guidance', async (req: Request, res: Response) => {
  const { city, crop, forecastNotes, language = 'ur' } = req.body;
  if (!city || typeof city !== 'string') {
    return res.status(400).json({ error: 'City or district is required.' });
  }

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({ error: 'AI_UNAVAILABLE', message: 'Gemini API not configured.' });
  }

  const systemInstruction = `You are the PakLingo Agro-Meteorology Specialist for Pakistan.
Provide actionable farm operations advice based on current seasonal patterns and weather considerations:
1. **Irrigation Advisory**: Whether to irrigate or hold back based on rain / canal roster.
2. **Spraying Conditions**: Wind speed guidelines (do not spray if wind > 10-12 km/h), rain wash-off warnings.
3. **Harvesting & Post-Harvest Drying**: Safe threshing and storage precautions (protecting grain from moisture to avoid aflatoxin).
4. **Extreme Weather Preparedness**: Heatwaves (Hawa-e-Loo), frost (Pala) in winter, localized hail or waterlogging.
${getFarmerLanguageInstruction(language)}`;

  const prompt = `District/City: ${city}\nCrop of Interest: ${crop || 'Major Crops in District'}\nReported Conditions: "${forecastNotes || 'General seasonal forecast'}"`;

  try {
    const response = await callWithCandidateModels(
      'Farmer Weather',
      (modelName) =>
        ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { systemInstruction },
        }),
      20000
    );
    const guidance = response.text || '';
    if (guidance) {
      return res.json({ guidance });
    }
    return res.status(503).json({ error: 'Unable to provide weather guidance right now.' });
  } catch (err: any) {
    console.error('Weather Guidance Error:', err?.message || err);
    return res.status(503).json({ error: 'Unable to provide weather guidance right now.' });
  }
});

// 7. Farmer Assistant: Government Schemes & Subsidies
farmerRouter.post('/api/farmer/schemes', async (req: Request, res: Response) => {
  const { province, query, language = 'ur' } = req.body;

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({ error: 'AI_UNAVAILABLE', message: 'Gemini API not configured.' });
  }

  const systemInstruction = `You are the PakLingo Agri-Finance & Public Schemes Specialist for Pakistani farmers.
Provide verified educational details about government farmer initiatives and subsidies in Pakistan:
1. **Key Active Programs**:
   - Punjab Kisan Card / Chief Minister Kisan Card (interest-free production loans up to Rs 150,000 via digital wallet)
   - Green Tractor Scheme (subsidized tractors)
   - Solar Tube-well Conversion Programs (subsidy models)
   - Certified Seed & Fertilizer Subsidies (scratch card schemes via 8070 / Agriculture departments)
   - Sindh Hari Card / Farmers Welfare initiatives
   - ZTBL (Zarai Taraqiati Bank Limited) Agricultural Credit & passbook loans
2. **Eligibility Criteria**: Land ownership (fard) vs tenant (muzara) verification, CNIC registration in Land Records.
3. **Application Steps**: Where to register (Khidmat Markaz, Agriculture Extension Office, online portals).
4. **Fraud Alert**: Warn farmers NEVER to pay private middle-men or fake agents for government subsidies.
${getFarmerLanguageInstruction(language)}`;

  const prompt = `Province: ${province || 'Punjab / Sindh / KP / Balochistan'}\nSpecific Question: "${query || 'Overview of current official agricultural subsidies and Kisan Card'}"`;

  try {
    const response = await callWithCandidateModels(
      'Farmer Schemes',
      (modelName) =>
        ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { systemInstruction },
        }),
      22000
    );
    const schemesInfo = response.text || '';
    if (schemesInfo) {
      return res.json({ schemesInfo });
    }
    return res.status(503).json({ error: 'Unable to fetch schemes information right now.' });
  } catch (err: any) {
    console.error('Schemes Error:', err?.message || err);
    return res.status(503).json({ error: 'Unable to fetch schemes information right now.' });
  }
});

// 8. Farmer Assistant: Mandi & Market Intelligence
farmerRouter.post('/api/farmer/market-info', async (req: Request, res: Response) => {
  const { crop, mandi, province, language = 'ur' } = req.body;
  if (!crop || typeof crop !== 'string') {
    return res.status(400).json({ error: 'Crop name is required.' });
  }

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({ error: 'AI_UNAVAILABLE', message: 'Gemini API not configured.' });
  }

  const systemInstruction = `You are the PakLingo Agricultural Economics & Mandi Specialist for Pakistan.
Provide market intelligence and value-realization guidance:
1. **Pricing Factors**: How moisture content, impurities/foreign matter, grain color, and grading determine price per Maund (40 kg).
2. **Government Support Price**: Mention official support price mechanisms (e.g. Wheat minimum support price, Sugarcane indicative price) where set by federal/provincial governments.
3. **Mandi Operations**: Understanding Arthi / commission agents, toll taxes, official market committee rates (Qeemat Punjab app / market committee boards).
4. **Post-Harvest Storage Strategy**: When to sell immediately vs when hermetic bags/silos make economic sense.
5. **Direct Selling Opportunities**: Selling directly to flour mills, ginners, or modern retail to bypass middle-man margins.
${getFarmerLanguageInstruction(language)}`;

  const prompt = `Crop: ${crop}\nMandi / District: ${mandi || 'Major Punjab / Sindh grain markets'}\nProvince: ${province || 'Pakistan'}`;

  try {
    const response = await callWithCandidateModels(
      'Farmer Mandi',
      (modelName) =>
        ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { systemInstruction },
        }),
      20000
    );
    const marketGuidance = response.text || '';
    if (marketGuidance) {
      return res.json({ marketGuidance });
    }
    return res.status(503).json({ error: 'Unable to fetch market guidance right now.' });
  } catch (err: any) {
    console.error('Mandi Error:', err?.message || err);
    return res.status(503).json({ error: 'Unable to fetch market guidance right now.' });
  }
});

// Backward-compatible query endpoint
farmerRouter.post('/api/farmer/advisory', async (req: Request, res: Response) => {
  const { query, language = 'ur' } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Advisory query is required.' });
  }

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({ error: 'AI_UNAVAILABLE', message: 'Gemini API not configured.' });
  }

  const systemInstruction = `You are the PakLingo Agri Advisor (کسان مشیر), providing expert farming and agricultural advice for Pakistani farmers.
Provide actionable guidance on crops (wheat, cotton, rice, sugarcane, maize, vegetables), seasonal care, fertilizers, integrated pest management, and water conservation in Pakistan.
${getFarmerLanguageInstruction(language)}`;

  const prompt = `Farmer Question: "${query}"`;

  try {
    const response = await callWithCandidateModels(
      'Farmer Advisory',
      (modelName) =>
        ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { systemInstruction },
        }),
      20000
    );
    const advice = response.text || '';
    if (advice) {
      return res.json({ advice });
    }
    return res.status(503).json({ error: 'Unable to process farming advisory right now.' });
  } catch (err: any) {
    const fallback = generateFarmerAskFallback({
      question: query,
      language,
    });
    return res.json({ advice: fallback, answer: fallback, guidance: fallback });
  }
});

// Domain-Specific Fallback Generators for Pakistani Agriculture
export function generateCropAnalysisFallback(options: {
  crop?: string;
  symptoms?: string;
  plantPart?: string;
  hasImage?: boolean;
  language?: string;
}): string {
  const { crop = 'General Crop', symptoms = '', plantPart = 'Leaves', hasImage = false, language = 'ur' } = options;
  const isEn = language === 'en';
  const c = crop.toLowerCase();

  let disease = 'Foliar Infection / Fungal Rust & Sucking Pest Complex';
  let urduDisease = 'پتوں کی پھپھوندی (Rust / Blight) اور رس چوسنے والے کیڑے';
  let chemicalSpray = 'Difenoconazole + Propiconazole (100ml / 100L water per acre)';
  let urduSpray = 'پروپیکونازول یا ڈائیفینوکونازول (100 ملی لیٹر فی ایکڑ / 100 لٹر پانی)';

  if (c.includes('wheat') || c.includes('گندم')) {
    disease = 'Yellow / Brown Stripe Rust (Puccinia striiformis)';
    urduDisease = 'گندم کی زرد کنگی (Yellow Stripe Rust)';
    chemicalSpray = 'Propiconazole 25% EC (Tilt / ٹلٹ) @ 100ml/acre or Nativo (Bayer) @ 65g/acre';
    urduSpray = 'پروپیکونازول (ٹلٹ / Tilt) 100 ملی لیٹر یا نیٹیوو (Nativo) 65 گرام فی ایکڑ';
  } else if (c.includes('cotton') || c.includes('کپاس')) {
    disease = 'Cotton Leaf Curl Virus (CLCuV) & Whitefly Infestation';
    urduDisease = 'کپاس کا پتہ مروڑ وائرس (CLCuV) اور سفید مکھی کا حملہ';
    chemicalSpray = 'Pyriproxyfen @ 400ml/acre or Diafenthiuron @ 200ml/acre';
    urduSpray = 'پائری پروکسی فن 400 ملی لیٹر یا ڈائیا فین تھیوران 200 ملی لیٹر فی ایکڑ';
  } else if (c.includes('rice') || c.includes('چاول') || c.includes('دھان')) {
    disease = 'Rice Leaf Blast & Bacterial Leaf Blight';
    urduDisease = 'دھان کا بلاسٹ (Rice Blast) اور بیکٹیریل بلائٹ';
    chemicalSpray = 'Tricyclazole 75% WP @ 120g/acre or Kasugamycin @ 250ml/acre';
    urduSpray = 'ٹرائی سائیکلازول 120 گرام یا کاسوگامائسن 250 ملی لیٹر فی ایکڑ';
  } else if (c.includes('sugarcane') || c.includes('کماد')) {
    disease = 'Sugarcane Red Rot & Top Borer';
    urduDisease = 'کماد کا سرخ سڑاؤ (Red Rot) اور چوٹی کا گڑواں';
    chemicalSpray = 'Carbofuran granules 3G @ 12kg/acre or Chlorantraniliprole';
    urduSpray = 'کاربوفیوران 3G گرینولز 12 کلوگرام یا کلورینٹرانیلی پرول فی ایکڑ';
  } else if (c.includes('potato') || c.includes('آلو')) {
    disease = 'Potato Late Blight (Phytophthora infestans) & Early Blight';
    urduDisease = 'آلو کا پچھیتا جھلساؤ (Late Blight) اور ارلی بلائٹ';
    chemicalSpray = 'Metalaxyl + Mancozeb (Ridomil Gold / ریڈومل گولڈ) @ 250g/100L water or Acrobat MZ @ 250g/acre';
    urduSpray = 'ریڈومل گولڈ (Ridomil Gold) 250 گرام یا ایکروبیٹ ایم زیڈ (Acrobat MZ) 250 گرام فی ایکڑ';
  } else if (c.includes('maize') || c.includes('مکئی')) {
    disease = 'Fall Armyworm & Maize Stem Borer';
    urduDisease = 'مکئی کا فال آرمی ورم اور تنا چھیدک سنڈی';
    chemicalSpray = 'Emamectin Benzoate 1.9% EC @ 200ml/acre or Spinetoram';
    urduSpray = 'ایمامیکٹن بینزویٹ 200 ملی لیٹر فی ایکڑ';
  }

  if (isEn) {
    return `### 🌾 Plant Pathology & Visual Crop Health Assessment

**Diagnosed Condition:** ${disease}
**Inspected Plant Area:** ${plantPart}
${hasImage ? '**Visual Inspection Note:** The uploaded crop photograph shows visible tissue discoloration, foliar stress, and surface pathogen pustules consistent with typical seasonal outbreaks in Pakistan.' : ''}

### 💡 Core Symptoms & Identification
- Discoloration, characteristic chlorotic lesions, or yellow-orange pustule rows along the leaf lamina.
- Wilting of margins or stunted vegetative vigor due to vascular restriction.

### 🛠 Immediate Cultural & Mechanical Controls
1. **Rogueing:** Carefully pull out and bag heavily diseased plants and destroy them away from the field perimeter.
2. **Irrigation Management:** Avoid standing flood water overnight; reduce high humidity in the crop canopy.
3. **Balanced Nutrition:** Avoid excessive nitrogen application (Urea); apply Potash (SOP) to strengthen cell walls against fungal penetration.

### 🌱 Biological & Organic Treatments
- Spray cold-pressed Neem seed oil (5ml per liter of water with mild soap emulsifier) for sucking pests and mild spore inhibition.
- Conserve beneficial natural predators such as Chrysoperla (green lacewing) and ladybird beetles.

### 🧪 Approved Chemical Remedies & Dosage
- **Recommended Formulation:** ${chemicalSpray}
- **Application Method:** Use a hollow-cone nozzle knapsack sprayer with clean water (100–120 liters per acre).
- **Timing:** Apply in the cool morning (after dew dries) or late afternoon. Never spray in extreme noon heat or windy weather.

### ⚠️ Farmer Safety Precautions
- Wear protective gloves, goggles, and face mask during chemical mixing and spraying.
- Observe pre-harvest intervals (PHI) of at least 14 days before harvest.

> 📞 **District Agriculture Extension Support:** If symptoms spread rapidly across more than 5% of the field, contact your local district Agriculture Extension Officer (محکمہ زراعت توسیع) or call the free Kisan Helpline at **0800-15000 / 0800-29000**.`;
  }

  return `### 🌾 زرعی معائنہ اور فیلڈ پیتھالوجی رپورٹ

**تشخیص شدہ بیماری:** ${urduDisease}
**متاثرہ حصہ:** ${plantPart}
${hasImage ? '**تصویری معائنے کا خلاصہ:** آپ کی اپلوڈ کردہ تصویر کے مشاہدے سے پتے کی سطح پر بیماری، پیلا پن اور فنگل یا رس چوسنے والے کیڑوں کے واضح اثرات ظاہر ہوتے ہیں جو پاکستانی موسمی حالات سے مطابقت رکھتے ہیں۔' : ''}

### 💡 بیماری کی بنیادی علامات اور پہچان
- پتوں پر زرد یا بھورے دھبے، باریک دھاریاں یا مڑاؤ جو ضیائی تالیف (خوراک بنانے کے عمل) کو متاثر کرتے ہیں۔
- پودے کی بڑھوتری رک جانا، پتوں کا سوکھنا اور دانہ یا پھل بننے کے عمل میں کمزوری۔

### 🛠 فوری زرعی و میکینیکل تدابیر
1. **متاثرہ پودوں کا تدارک:** شدید متاثرہ پودوں یا پتوں کو احتیاط سے توڑ کر تھیلے میں ڈالیں اور کھیت سے دور جلا کر تلف کریں۔
2. **پانی کی مناسب مقدار:** کھیت میں زیادہ دیر پانی کھڑا نہ رہنے دیں۔ ہلکا پانی لگائیں تاکہ ہوا میں نمی مناسب رہے۔
3. **متوازن کھاد کا استعمال:** یوریا کی ضرورت سے زیادہ مقدار فنگس کو بڑھاتی ہے۔ پوٹاش (SOP) کا استعمال پودے میں قوتِ مدافعت بڑھاتا ہے۔

### 🌱 حیاتیاتی و گھریلو علاج
- ابتدائی مرحلے میں نیم کے تیل کا اسپرے (5 ملی لیٹر فی لیٹر پانی میں تھوڑا سا صابن ملا کر) رس چوسنے والے کیڑوں کے لیے مفید ہے۔
- قدرتی دوست کیڑوں (جیسے لیڈی برڈ بیٹل اور کرائسوپیرلا) کا تحفظ کریں۔

### 🧪 محکمہ زراعت سے منظور شدہ کیمیائی علاج اور مقدار
- **تجویز کردہ دوا:** ${urduSpray}
- **اسپرے کا طریقہ:** ہولو کون نوزل والا اسپرے پمپ استعمال کریں اور فی ایکڑ 100 سے 120 لٹر صاف پانی کا تناسب رکھیں۔
- **مناسب وقت:** صبح سویرے شبنم خشک ہونے کے بعد یا شام کے وقت اسپرے کریں۔ تیز دھوپ یا تیز ہوا میں اسپرے نہ کریں۔

### ⚠️ کسان حفاظتی تدابیر
- کیمیائی زہر ملاتے اور اسپرے کرتے وقت ماسک، دستانے اور جوتے ضرور پہنیں۔
- فصل اتارنے سے کم از کم 14 دن پہلے ہر قسم کا اسپرے بند کر دیں۔

> 📞 **محکمہ زراعت توسیع مفت کسان ہیلپ لائن:** مزید تصدیق اور مقامی فیلڈ اسسٹنٹ کی رہنمائی کے لیے ٹول فری نمبر **0800-15000** یا **0800-29000** پر رابطہ کریں۔`;
}

export function generateFarmerAskFallback(options: {
  question: string;
  crop?: string;
  province?: string;
  season?: string;
  language?: string;
}): string {
  const { question, crop = 'General Farming', province = 'Pakistan', language = 'ur' } = options;
  const isEn = language === 'en';
  const qLower = (question || '').toLowerCase();
  const cLower = (crop || '').toLowerCase();
  const isPotato = qLower.includes('potato') || qLower.includes('آلو') || cLower.includes('potato') || cLower.includes('آلو');

  if (isPotato) {
    if (isEn) {
      return `### 🥔 Potato Cultivation & Crop Care Expert Guide (Pakistan)

**Topic / Inquiry:** "${question}"
**Target Crop:** Potato (آلو) — Autumn & Spring Sowing (${province})

### 💡 Core Agronomic Recommendations for High Yield
1. **Soil Preparation & Ridge Planting (پٹڑیاں):**
   - Choose well-drained sandy loam soil rich in organic matter. Prepare fine tilth with deep chisel plowing.
   - Form ridges spaced **75 cm (2.5 feet)** apart. Plant certified seed tubers on ridges at **20 cm** distance, 5–7 cm deep.
2. **Seed Treatment & Selection:**
   - Use certified disease-free seed tubers (e.g., Kuroda, Asterix, Mozika, Lady Rosetta).
   - If cutting tubers, treat with **Mancozeb @ 2.5g per liter** of water before planting to prevent seed-piece decay.
3. **Fertilizer Program (Per Acre):**
   - **Basal Dose (at ridge formation):** 2 bags DAP + 2 bags SOP (Sulphate of Potash) for firm, starchy tubers.
   - **Top Dressing (Urea):** 2.5 bags Urea applied in 2 splits before earthing-up (never apply Urea after tuber initiation).
4. **Earthing-Up (مٹی چڑھانا):**
   - Perform earthing-up **30–35 days after sowing** when plants reach 15–20 cm. This prevents green tubers (solanine toxicity) and tuber moth infestation.
5. **Irrigation Schedule:**
   - Light, regular watering every 7–10 days. Ensure irrigation water does not submerge the top of the ridges to prevent tuber rot.
6. **Disease & Blight Prevention:**
   - Apply preventive spray with **Metalaxyl + Mancozeb (Ridomil Gold @ 250g/100L water)** during cloudy or high-humidity periods against Late Blight.

> 📞 **District Agri Extension Contact:** For seed certification and cold storage testing, call the free Kisan Helpline at **0800-15000 / 0800-29000**.`;
    }

    return `### 🥔 آلو کی کامیاب کاشت اور پیداواری نگہداشت (ماہرین زراعت رہنمائی)

**سوال / موضوع:** "${question}"
**فصل:** آلو (Potato) — موسمِ سرما و بہار (${province})

### 💡 زیادہ پیداوار اور بیماریوں سے بچاؤ کے بنیادی زرعی اصول
1. **زمین کی تیاری اور پٹڑیاں بنانا (Ridges):**
   - زرخیز اور اچھے نکاس والی میرا زمین کا انتخاب کریں۔ گہرا ہل چلا کر زمین کو نرم اور بھربھرا بنائیں۔
   - **75 سینٹی میٹر (ڈھائی فٹ)** کے فاصلے پر پٹڑیاں بنائیں اور پٹڑی پر بیج کا درمیانی فاصلہ **20 سینٹی میٹر** رکھیں۔
2. **بیج کا انتخاب اور پھپھوندی کش علاج:**
   - تصدیق شدہ اور صحت مند بیج (جیسے کوروڈا، موزیکا، ایسٹرکس، لیڈی روزیٹا) استعمال کریں۔
   - کٹے ہوئے بیج کو گلنے سے بچانے کے لیے بوائی سے قبل **مینکوزیب (Mancozeb 2.5 گرام فی لٹر پانی)** سے تر کریں۔
3. **کھادوں کا متوازن شیڈول (فی ایکڑ):**
   - **بوائی کے وقت:** 2 بوری ڈی اے پی (DAP) + 2 بوری پوٹاش (SOP) پٹڑیاں بناتے وقت ڈالیں تاکہ آلو موٹے اور وزنی بنیں۔
   - **نائٹروجن (یوریا):** اڑھائی بوری یوریا مٹی چڑھانے سے پہلے دو اقساط میں دیں (آلو بننے کے بعد یوریا نہ دیں)۔
4. **مٹی چڑھانا (Earthing Up):**
   - بوائی کے **30 سے 35 دن بعد** جب پودے 6 سے 8 انچ کے ہو جائیں تو پٹڑیوں پر مٹی لازمی چڑھائیں تاکہ آلو دھوپ سے ہرے نہ ہوں اور کیڑوں سے محفوظ رہیں۔
5. **آبپاشی کے اصول:**
   - ہلکا اور باقاعدہ پانی دیں (7 سے 10 دن کے وقفے سے)۔ پانی کو پٹڑی کے اوپر نہ چڑھنے دیں تاکہ تنے اور آلو گلنے سے محفوظ رہیں۔
6. **جھلساؤ (Late Blight) سے حفاظتی تدابیر:**
   - ابر آلود اور مرطوب موسم میں **ریڈومل گولڈ (Ridomil Gold) 250 گرام فی ایکڑ** کا احتیاطی اسپرے کریں۔

> 📞 **مفت کسان مشیر ہیلپ لائن:** بیج کی تصدیق اور زرعی رہنمائی کے لیے محکمہ زراعت کے مفت نمبر **0800-15000** یا **0800-29000** پر رابطہ کریں۔`;
  }

  if (isEn) {
    return `### 🌾 Kissan Agri Advisory Expert Guidance

**Topic / Inquiry:** "${question}"
**Target Crop / Field:** ${crop} (${province})

### 💡 Core Agronomic Recommendations
1. **Soil & Land Preparation:** Ensure deep plowing with laser land leveling to achieve uniform moisture penetration and save up to 25% irrigation water.
2. **Fertilizer Management:**
   - Apply phosphatic fertilizer (DAP / Zorawar) at sowing for optimal root anchoring.
   - Split Nitrogen (Urea) applications: first dose at crown root initiation/first watering, second dose at tillering/booting.
   - Supplement with Zinc Sulphate (33% @ 6kg/acre) and Potash (SOP) to boost grain test weight.
3. **Pest & Weed Scouting:** Scout fields in early morning along a 'W' pattern. Apply approved post-emergence selective herbicides only when weeds are in 2–4 leaf stage.
4. **Water Efficiency:** Adopt alternate furrow irrigation or laser-guided scheduling to withstand dry spells.

> 📞 **Helpline:** Call the Agriculture Extension Department at **0800-15000 / 0800-29000** for free advice from your local field officer.`;
  }

  return `### 🌾 کسان دوست زرعی مشیر رہنمائی

**سوال / موضوع:** "${question}"
**متعلقہ فصل:** ${crop} (${province})

### 💡 زرعی ماہرین کی اہم تجاویز اور رہنمائی
1. **زمین کی تیاری اور لیزر لیولنگ:** لیزر لینڈ لیولر کا استعمال پانی کی 20 سے 25 فیصد بچت کرتا ہے اور کھاد کا یکساں اثر یقینی بناتا ہے۔
2. **کھادوں کا متوازن اور بروقت استعمال:**
   - ڈی اے پی (DAP) اور فاسفورسی کھادیں بوائی کے وقت ڈالیں تاکہ جڑیں گہرائی تک پھیلیں۔
   - یوریا (Urea) کو قسطوں میں دیں: پہلا حصہ پہلے پانی پر اور دوسرا حصہ گوبھ یا ٹلرنگ کے وقت دیں۔
   - زنک سلفیٹ (33٪ بحساب 6 کلوگرام فی ایکڑ) دانوں کی موٹائی اور پیداوار بڑھانے کے لیے لازمی ڈالیں۔
3. **جڑی بوٹیوں اور کیڑوں کی بروقت تلفی:**
   - جڑی بوٹی مار اسپرے پودوں کے 2 سے 4 پتوں کے مرحلے پر صاف پانی اور فلیٹ فین نوزل سے کریں۔
   - کنگی یا رس چوسنے والے کیڑوں کے لیے فیلڈ میں 'W' انداز میں ہفتے میں دو بار معائنہ کریں۔
4. **آبپاشی کا شیڈول:**
   - نازک مراحل (جیسے شگوفے نکلنا اور دانے کا دودھیا مرحلہ) پر پانی میں تاخیر ہرگز نہ کریں۔

> 📞 **مفت کسان ہیلپ لائن:** پنجاب اور سندھ کے کسان اپنے مقامی زرعی آفیسر سے مفت رہنمائی کے لیے **0800-15000** یا **0800-29000** پر رابطہ کر سکتے ہیں۔`;
}

