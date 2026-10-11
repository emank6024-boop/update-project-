import { Router, Request, Response } from 'express';
import {
  getGemini,
  callWithCandidateModels,
  getFastModelConfig,
  ServerLRUCache,
  deduplicateRequest,
} from '../geminiService.js';
import { getLanguageName, getGlobalLanguageDirective } from '../languageDirectives.js';

export const translateRouter = Router();

const serverTranslationCache = new ServerLRUCache<any>(500, 24 * 60 * 60 * 1000);

// Live Translator endpoint
translateRouter.post('/api/translate', async (req: Request, res: Response) => {
  const { text, sourceLang = 'en', targetLang = 'ur' } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required.' });
  }

  const trimmed = text.trim();

  // Short-circuit if source and target language are identical
  if (sourceLang === targetLang) {
    return res.json({
      translatedText: trimmed,
      phoneticText: trimmed,
    });
  }

  const cacheKey = `v2_${sourceLang}_${targetLang}_${trimmed.toLowerCase()}`;
  const cached = serverTranslationCache.get(cacheKey);
  if (cached) {
    res.setHeader('X-Cache-Status', 'HIT');
    return res.json(cached);
  }

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({ error: 'AI_UNAVAILABLE', message: 'Gemini API not configured.' });
  }

  const sLang = getLanguageName(sourceLang);
  const tLang = getLanguageName(targetLang);
  const targetDirective = getGlobalLanguageDirective(targetLang);

  const prompt = `You are the PakLingo Multilingual Translation Engine for Pakistan.
Translate the following text accurately, preserving natural spoken cadence, grammar, and cultural idiom.
Source Language: ${sLang}
Target Language: ${tLang}

TARGET LANGUAGE DIRECTIVE:
${targetDirective}

Input text: "${trimmed}"

Respond in valid JSON format only:
{
  "translatedText": "Exact, natural translation in ${tLang} using authentic native vocabulary and script",
  "phoneticText": "Clear Romanized pronunciation / phonetic transliteration in Latin letters showing how to pronounce the translated text"
}`;

  try {
    const translationResult = await deduplicateRequest(`trans_${cacheKey}`, async () => {
      const response = await callWithCandidateModels(
        'Live Translate',
        (modelName) =>
          ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: getFastModelConfig(modelName, {
              responseMimeType: 'application/json',
              temperature: 0.15,
            }),
          }),
        14000
      );

      const rawText = response.text || '{}';
      let parsed: any = {};
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }

      if (parsed.translatedText) {
        return {
          translatedText: parsed.translatedText,
          phoneticText: parsed.phoneticText || parsed.translatedText,
        };
      }
      throw new Error('Empty translation response');
    });

    serverTranslationCache.set(cacheKey, translationResult);
    return res.json(translationResult);
  } catch (err: any) {
    console.error('Translation Error:', err?.message || err);
    return res.status(503).json({ error: 'Translation could not be completed.' });
  }
});
