import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getGemini, callWithCandidateModels, getFastModelConfig, ServerLRUCache } from '../geminiService.js';
import { getGlobalLanguageDirective } from '../languageDirectives.js';

export const pslRouter = Router();
const pslImageCache = new ServerLRUCache<Record<string, any>>(200, 60 * 60 * 1000);

// Pakistan Sign Language (PSL) Sentence & Concept Breakdown
pslRouter.post('/api/psl/breakdown', async (req: Request, res: Response) => {
  const rawText = req.body.text || req.body.sentence || req.body.input || '';
  const text = typeof rawText === 'string' ? rawText.trim() : '';
  const { language = 'ur' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text or sentence is required for Pakistan Sign Language breakdown.' });
  }
  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({ error: 'AI_UNAVAILABLE', message: 'Gemini API not configured.' });
  }

  const meaningHeader = language === 'ur'
    ? 'اس سائن کا مطلب:'
    : (language === 'roman_ur' || language === 'roman')
      ? 'Is sign ka matlab:'
      : 'Meaning of this sign / phrase:';

  const systemInstruction = `You are the PakLingo Pakistan Sign Language (PSL / پاکستانی اشاروں کی زبان) Accessibility Master and Deaf Reach Educator.
Given an English, Urdu, or Roman Urdu word or sentence (e.g. "Assalam o Alaikum", "How are you?", "My name is Ali", "Shukriya", "Water", "Hospital"), break it down accurately into standardized Pakistani Sign Language (PSL) conventions (as documented by FESF / Deaf Reach Pakistan and Pakistan Association of the Deaf - PAD).

LANGUAGE INSTRUCTION:
${getGlobalLanguageDirective(language)}

CRITICAL RESPONSE RULES:
1. Provide the exact PSL grammatical gloss sequence.
2. In "meaning", clearly explain what this word or sentence signifies in daily communication.
3. For each constituent sign or concept in the phrase, provide precise physical execution details:
   - "word": English name of concept
   - "urdu": Urdu script equivalent
   - "handShape": Clear physical hand shape description (e.g. "Flat open hand", "Index finger pointing", "Fist with thumb up")
   - "location": Placement relative to body (e.g. "Chest level / Heart", "Near chin", "Forehead")
   - "movement": Motion path and dynamics (e.g. "Arc smoothly outward toward listener", "Double tap chin")
   - "facialExpression": Non-manual markers (e.g. "Warm smile with respectful eye contact", "Eyebrows raised for question")
   - "instruction": Clear, step-by-step guidance on how to perform this sign accurately.
4. Set "meaningHeader" to "${meaningHeader}".

OUTPUT FORMAT (Respond with valid JSON only):
{
  "originalText": "${text.replace(/"/g, '')}",
  "meaningHeader": "${meaningHeader}",
  "meaning": "Clear, direct meaning and contextual explanation in the requested language.",
  "pslGloss": "Capitalized PSL Gloss Order (e.g. [ASSALAM-O-ALAIKUM] or [NAME] [ME] [ALI])",
  "urduGloss": "اردو اشاروں کی ترتیب",
  "explanation": "Linguistic and visual explanation of this sign or phrase in PSL.",
  "signs": [
    {
      "word": "Concept word",
      "urdu": "اردو لفظ",
      "handShape": "Hand shape description",
      "location": "Body location",
      "movement": "Specific dynamic motion",
      "facialExpression": "Facial cue",
      "instruction": "Step-by-step physical instruction.",
      "culturalNote": "PSL cultural or regional note."
    }
  ],
  "practiceTip": "Helpful tip for signing smoothly and naturally."
}`;

  try {
    const response = await callWithCandidateModels(
      'PSL Breakdown',
      (modelName) =>
        ai.models.generateContent({
          model: modelName,
          contents: `Translate and break down into Pakistan Sign Language (PSL):\n"${text}"`,
          config: getFastModelConfig(modelName, {
            systemInstruction,
            responseMimeType: 'application/json',
          }),
        }),
      16000
    );

    const parsed = JSON.parse(response.text || '{}');
    const normalizedSigns = (parsed.signs || parsed.tokens || []).map((s: any) => ({
      word: s.word || s.token || text,
      token: s.word || s.token || text,
      urdu: s.urdu || text,
      handShape: s.handShape || s.handMovement || 'Comfortable signing hand position',
      handMovement: s.handMovement || s.movement || 'Gentle forward movement',
      movement: s.movement || s.handMovement || 'Gentle forward movement',
      location: s.location || 'Chest level in signing space',
      facialExpression: s.facialExpression || 'Natural engaged expression',
      instruction: s.instruction || s.description || 'Position hand comfortably and perform the sign facing your conversational partner.',
      description: s.instruction || s.description || 'Position hand comfortably and perform the sign facing your conversational partner.',
      culturalNote: s.culturalNote || 'PSL standard sign according to Deaf Reach Pakistan.',
    }));

    return res.json({
      originalText: parsed.originalText || text,
      sentence: parsed.originalText || text,
      meaningHeader: parsed.meaningHeader || meaningHeader,
      meaning: parsed.meaning || parsed.explanation || `Pakistan Sign Language guide for "${text}".`,
      pslGloss: parsed.pslGloss || `[${text.toUpperCase()}]`,
      urduGloss: parsed.urduGloss || text,
      explanation: parsed.explanation || parsed.meaning || 'PSL utilizes spatial grammar and visual handshape positioning.',
      grammaticalNotes: parsed.explanation || 'PSL visual grammar',
      signs: normalizedSigns,
      tokens: normalizedSigns,
      practiceTip: parsed.practiceTip || 'Keep your shoulders relaxed and maintain expressive eye contact while signing.',
      success: true,
    });
  } catch (err: any) {
    console.error('PSL Breakdown Error:', err);
    return res.status(500).json({
      error: 'Unable to generate PSL breakdown.',
      originalText: text,
      sentence: text,
      meaningHeader,
      meaning: `Pakistan Sign Language expression for "${text}".`,
      pslGloss: `[${text.toUpperCase()}]`,
      urduGloss: text,
      explanation: 'PSL utilizes visual spatial grammar with expressive facial markers.',
      grammaticalNotes: 'PSL visual grammar',
      signs: [
        {
          word: text,
          token: text,
          urdu: text,
          handShape: 'Open dominant hand with palm facing comfortably forward',
          handMovement: 'Smooth outward movement toward conversation partner',
          movement: 'Smooth outward movement toward conversation partner',
          location: 'Chest level in comfortable signing space',
          facialExpression: 'Engaged, supportive eye contact',
          instruction: 'Position your hand at chest level and form the gesture smoothly facing your conversation partner.',
          description: 'Position your hand at chest level and form the gesture smoothly facing your conversation partner.',
          culturalNote: 'PSL signs emphasize clear two-handed symmetry and distinct facial cues.'
        }
      ],
      tokens: [
        {
          token: text,
          urdu: text,
          handMovement: 'Smooth outward movement toward conversation partner',
          facialExpression: 'Engaged, supportive eye contact',
          description: 'Position your hand at chest level and form the gesture smoothly facing your conversation partner.'
        }
      ],
      practiceTip: 'Keep your shoulders relaxed and maintain expressive eye contact while signing.'
    });
  }
});

// Pakistan Sign Language (PSL) Real Vision & Image Gesture Recognition
pslRouter.post('/api/psl/analyze-sign', async (req: Request, res: Response) => {
  const { imageBase64, mimeType = 'image/jpeg', language = 'ur', notes } = req.body;

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'Image is required for sign recognition.' });
  }

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({ error: 'AI_UNAVAILABLE', message: 'Gemini API not configured.' });
  }

  const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9+.-]+;base64,/i, '');
  const detectedMime =
    imageBase64.match(/^data:(image\/[a-z0-9+.-]+);base64,/i)?.[1] || mimeType || 'image/jpeg';

  const imgHash = crypto
    .createHash('sha1')
    .update(cleanBase64)
    .digest('hex');
  const cacheKey = `psl_img_${language}_${imgHash}`;
  const cachedResult = pslImageCache.get(cacheKey);
  if (cachedResult) {
    return res.json(cachedResult);
  }

  const meaningHeader =
    language === 'ur'
      ? 'اس سائن کا مطلب:'
      : language === 'ps'
      ? 'د دې نښې (اشارې) معنی:'
      : language === 'pa'
      ? 'ایس اشارے دا مطلب:'
      : language === 'sd'
      ? 'هن اشاري جو مطلب:'
      : language === 'bal'
      ? 'اے اشارہ ءِ بزانت (مطلب):'
      : language === 'roman_ur' || language === 'roman'
      ? 'Is sign ka matlab:'
      : 'Meaning of this sign:';

  const systemInstruction = `You are the PakLingo Pakistan Sign Language (PSL / پاکستانی اشاروں کی زبان) Vision & Gesture Interpreter.
Inspect the hand shape, finger configuration, thumb position, palm orientation, facial expression, and any visual arrows/labels in the uploaded sign image (PSL / Deaf Reach / PAD & international sign conventions).

RULES:
1. Accurately identify the sign shown (e.g. Assalam-o-Alaikum/Hello, Thank You, Water, Food, Help, Yes, No, Good, Bad, Love, Family, Doctor, Hospital, Book, School, I Love You, Stop, Peace, OK, Numbers, or Alphabet letters).
2. If the image contains no hand/sign or is completely unreadable, set "identified": false and politely ask for a clearer sign photo.
3. ${getGlobalLanguageDirective(language)}
Write "meaning", "gestureDescription", and "usageContext" concisely and accurately in the requested language (${language}).

Respond with valid JSON ONLY:
{
  "identified": true,
  "signName": "Sign name in ${language} and English",
  "meaning": "Clear, accurate 1-2 sentence explanation of what this sign means",
  "gestureDescription": "1 concise sentence describing hand and finger position",
  "usageContext": "1 concise sentence on when this sign is used",
  "confidence": "High"
}`;

  try {
    const contents = [
      {
        inlineData: {
          mimeType: detectedMime,
          data: cleanBase64,
        },
      },
      {
        text: notes
          ? `Identify this sign language gesture and its meaning. Context: "${notes}"`
          : 'Identify this sign language gesture and explain its exact meaning concisely.',
      },
    ];

    const response = await callWithCandidateModels(
      'PSL Vision Gesture Analysis',
      (modelName) =>
        ai.models.generateContent({
          model: modelName,
          contents,
          config: getFastModelConfig(modelName, {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.1,
            maxOutputTokens: 350,
          }),
        }),
      4800
    );

    const rawOutput = (response.text || '').trim();
    let parsed: Record<string, any> = {};
    try {
      const cleanedJson = rawOutput
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsed = JSON.parse(cleanedJson || '{}');
    } catch {
      parsed = {
        identified: true,
        signName: 'Sign Analysis',
        meaningHeader,
        meaning: rawOutput || 'Sign analyzed.',
      };
    }

    const resultMeaning =
      parsed.meaning ||
      parsed.fullExplanation ||
      (parsed.identified
        ? `Pakistan Sign Language gesture for ${parsed.signName}.`
        : 'This sign could not be confidently identified.');

    const payload = {
      identified: parsed.identified ?? true,
      signName: parsed.signName || 'Observed Sign',
      meaningHeader: parsed.meaningHeader || meaningHeader,
      meaning: resultMeaning,
      gestureDescription: parsed.gestureDescription || '',
      usageContext: parsed.usageContext || '',
      confidence: parsed.confidence || 'High',
      tips: parsed.tips || '',
      fullExplanation: `${meaningHeader}\n${parsed.signName ? `${parsed.signName}: ` : ''}${resultMeaning}`,
      success: true,
    };

    pslImageCache.set(cacheKey, payload);
    return res.json(payload);
  } catch (err: any) {
    console.error('PSL Vision Analysis Error:', err?.message || err);
    return res.status(503).json({
      error: 'Unable to analyze sign image within time limit. Please click Retry.',
    });
  }
});
