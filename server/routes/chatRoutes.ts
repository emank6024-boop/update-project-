import { Router, Request, Response } from 'express';
import {
  getGemini,
  callWithCandidateModels,
  getOrderedCandidateModels,
  markWorkingModel,
  markModelRateLimited,
  isQuotaExhaustedError,
  getFastModelConfig,
  ServerLRUCache,
  deduplicateRequest,
} from '../geminiService.js';
import {
  getGlobalLanguageDirective,
  getLanguageName,
  resolveEffectiveLanguage,
} from '../languageDirectives.js';

export const chatRouter = Router();

const chatResponseCache = new ServerLRUCache<string>(300, 15 * 60 * 1000);

interface IncomingAttachment {
  id?: string;
  type?: 'image' | 'file';
  name?: string;
  mimeType?: string;
  dataBase64?: string;
  textContent?: string;
}

interface HistoryTurn {
  role?: 'user' | 'model' | 'assistant';
  text?: string;
}

// Primary Multimodal AI Assistant Chat Endpoint (Supports both SSE Streaming and JSON)
chatRouter.post('/api/chat', async (req: Request, res: Response) => {
  const {
    message = '',
    language = 'ur',
    attachments = [],
    history = [],
    isRegenerate = false,
    stream = false,
    conversationId = '',
  } = req.body;

  const hasText = typeof message === 'string' && message.trim().length > 0;
  const validAttachments: IncomingAttachment[] = Array.isArray(attachments) ? attachments : [];
  const hasAttachments = validAttachments.length > 0;

  if (!hasText && !hasAttachments) {
    return res.status(400).json({ error: 'A message or file attachment is required.' });
  }

  const cleanBotGreeting = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/^(?:Hello!?|Hi!?|Greetings!?|السلام\s*علیکم!?|سلام!?)\s*(?:I\s*am|I'm|this\s*is|میں)\s*(?:your)?\s*PakLingo.*?(?:\n+|$)/i, '')
      .replace(/^(?:I\s*am|I'm|میں)\s*(?:your)?\s*PakLingo.*?(?:\n+|$)/i, '')
      .replace(/^As\s*(?:your)?\s*PakLingo.*?(?:\n+|$)/i, '')
      .replace(/^میں\s*آپ\s*کا\s*پاک\s*لنگو.*?(?:\n+|$)/i, '')
      .replace(/^السلام\s*علیکم!?\s*میں\s*پاک\s*لنگو.*?(?:\n+|$)/i, '')
      .trim();
  };

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({
      error: 'AI_UNAVAILABLE',
      message: 'PakLingo AI service is not configured. Please ensure GEMINI_API_KEY is set.',
    });
  }

  const effectiveLang = resolveEffectiveLanguage(message, language);
  const langDirective = getGlobalLanguageDirective(effectiveLang);
  const langName = getLanguageName(effectiveLang);

  const systemInstruction = `You are a high-capability intelligence advisor for Pakistan, supporting citizens, students, teachers, farmers, and professionals across all Pakistani languages.

CRITICAL INSTRUCTION — NO REPEATED INTRODUCTIONS OR GREETINGS:
- NEVER start responses by introducing yourself.
- DO NOT say "I am your PakLingo assistant", "I am PakLingo AI", "Hello! I am...", "As your AI assistant...", "السلام علیکم! میں آپ کا پاک لینگو اسسٹنٹ ہوں", or any variation of introductory greetings.
- Answer the user's specific question DIRECTLY and immediately from the very first sentence.

CORE RESPONSIBILITIES:
1. Provide accurate, well-structured, practical, and empathetic guidance tailored to Pakistani citizens, students, teachers, farmers, and professionals.
2. Understand questions written in English, Urdu (اردو), Punjabi (پنجابی), Sindhi (سنڌي), Pashto (پښتو), Balochi (بلوچی), Saraiki (سرائیکی), or Roman Urdu. Maintain full conversation context across follow-up questions.
3. When images or documents are attached (such as NADRA CNIC/B-Form, electricity/gas bills, legal stamp papers, textbooks, handwritten Urdu/English notes, crop photos, or sign language gestures):
   - Carefully inspect every visible detail, heading, table, number, and text in the attachment.
   - Answer the user's specific question about the attachment, or if no question was typed, provide a complete, clear breakdown, summary, and explanation of the uploaded image/document.
4. For Pakistani public services (NADRA, Passports, BISP 8171, FBR, DLIMS, Education Boards), cite official portals and standard procedures clearly.

PROFESSIONAL CHAT RESPONSE FORMATTING RULES:
Format every response so it is clean, visual, scannable, and easy to read:
- Start directly with the answer or a clear Markdown title or heading in ${langName} (e.g., \`### 📘 [Topic Title]\`).
- Highlight the **Main Idea / Direct Summary** in 1–2 concise sentences near the top.
- Use structured sections with clean visual markers where helpful (write all section titles in ${langName}):
  - \`### 💡 ...\` (Key Concepts / Overview)
  - \`### 📝 ...\` (Step-by-Step Guide with numbered steps \`1.\`, \`2.\`, \`3.\`)
  - \`### 📌 ...\` (Important Points with bullet points \`-\` and **bold** key terms)
  - \`### 📊 ...\` (Quick Comparison / Fee Schedule table when comparing fees, options, or timelines)
  - \`### ✅ ...\` (Practical Tip / Summary using a blockquote \`>\`)
- Leave clean spacing between sections. Never output walls of unformatted text or raw escaped symbols.
${isRegenerate ? '- The user requested a fresh regenerated response: provide a well-structured, comprehensive, and freshly articulated explanation.' : ''}

LANGUAGE DIRECTIVE (STRICT):
${langDirective}
Respond ENTIRELY in ${langName} (including all section headings, bullet points, and summaries).`;

  // Build conversation contents strictly from the active conversation's history
  const contents: any[] = [];

  if (Array.isArray(history) && history.length > 0) {
    const recentHistory: HistoryTurn[] = history.slice(-10);
    for (const turn of recentHistory) {
      if (turn && typeof turn.text === 'string' && turn.text.trim()) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text.trim() }],
        });
      }
    }
  }

  // Construct current user turn parts
  const currentUserParts: any[] = [];

  for (const att of validAttachments) {
    if (!att) continue;
    if (att.textContent && typeof att.textContent === 'string' && att.textContent.trim()) {
      currentUserParts.push({
        text: `[Attached Document: ${att.name || 'Document'}]\n"""\n${att.textContent.slice(0, 25000)}\n"""`,
      });
    } else if (att.dataBase64 && typeof att.dataBase64 === 'string') {
      const cleanBase64 = att.dataBase64.replace(/^data:[^;]+;base64,/, '');
      const mimeType = att.mimeType || (att.type === 'image' ? 'image/jpeg' : 'application/pdf');
      currentUserParts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }
  }

  const promptText = hasText
    ? message.trim()
    : `Please analyze the attached ${validAttachments.length > 1 ? 'files/images' : 'file/image'} (${validAttachments
        .map((a) => a.name || 'attachment')
        .join(', ')}) and provide a clear, structured explanation and key takeaways in ${langName}.`;

  currentUserParts.push({ text: promptText });

  contents.push({
    role: 'user',
    parts: currentUserParts,
  });

  const validHistoryCount = contents.length - 1;
  const canUseCache = !isRegenerate && !hasAttachments && validHistoryCount === 0;
  const cacheKey = `chat_${effectiveLang}_${promptText.toLowerCase()}`;
  const inflightKey = canUseCache
    ? `inflight_${cacheKey}`
    : `inflight_${conversationId || 'session'}_${Date.now()}_${Math.random()}`;

  // Check cache first for instant response
  if (canUseCache) {
    const cachedReply = chatResponseCache.get(cacheKey);
    if (cachedReply) {
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.write(`data: ${JSON.stringify({ chunk: cachedReply, done: true, reply: cachedReply })}\n\n`);
        return res.end();
      }
      return res.json({ reply: cachedReply, cached: true });
    }
  }

  // Streaming mode for real-time progressive output in all languages
  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const candidateModels = getOrderedCandidateModels();
    let streamedSuccessfully = false;
    let accumulatedText = '';

    for (const modelName of candidateModels) {
      try {
        const streamResp = await ai.models.generateContentStream({
          model: modelName,
          contents,
          config: getFastModelConfig(modelName, {
            systemInstruction,
            temperature: isRegenerate ? 0.65 : 0.35,
          }),
        });

        for await (const chunk of streamResp) {
          const chunkText =
            chunk.text ||
            chunk?.candidates?.[0]?.content?.parts
              ?.map((p: any) => p.text)
              .filter(Boolean)
              .join('') ||
            '';
          if (chunkText) {
            streamedSuccessfully = true;
            accumulatedText += chunkText;
            res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
          }
        }

        if (streamedSuccessfully && accumulatedText.trim()) {
          markWorkingModel(modelName);
          if (canUseCache) {
            chatResponseCache.set(cacheKey, accumulatedText);
          }
          res.write(`data: ${JSON.stringify({ done: true, reply: accumulatedText })}\n\n`);
          return res.end();
        }
      } catch (err: any) {
        if (isQuotaExhaustedError(err)) {
          markModelRateLimited(modelName);
        }
        if (streamedSuccessfully && accumulatedText.trim()) {
          // Partial stream already sent, finish gracefully
          res.write(`data: ${JSON.stringify({ done: true, reply: accumulatedText })}\n\n`);
          return res.end();
        }
      }
    }

    res.write(
      `data: ${JSON.stringify({
        error: 'Unable to generate a response right now. Please try again.',
        done: true,
      })}\n\n`
    );
    return res.end();
  }

  // Standard JSON mode with in-flight deduplication and zero-thinking-latency config
  try {
    const reply = await deduplicateRequest(
      inflightKey,
      async () => {
        const response = await callWithCandidateModels(
          'Multimodal AI Chat',
          (modelName) =>
            ai.models.generateContent({
              model: modelName,
              contents,
              config: getFastModelConfig(modelName, {
                systemInstruction,
                temperature: isRegenerate ? 0.65 : 0.35,
              }),
            }),
          16000
        );

        return (
          response.text ||
          response?.candidates?.[0]?.content?.parts
            ?.map((p: any) => p.text)
            .filter(Boolean)
            .join('\n') ||
          ''
        );
      }
    );

    if (reply) {
      const sanitizedReply = cleanBotGreeting(reply);
      if (canUseCache) {
        chatResponseCache.set(cacheKey, sanitizedReply);
      }
      return res.json({ reply: sanitizedReply });
    }
    return res.status(503).json({ error: 'AI service temporarily unavailable. Please try again.' });
  } catch (err: any) {
    console.error('Multimodal Chat Error:', err?.message || err);
    return res.status(503).json({ error: 'AI service temporarily unavailable. Please try again.' });
  }
});

// Audio Speech-to-Text Transcription Endpoint (Fallback & Regional Language Support)
chatRouter.post('/api/chat/transcribe', async (req: Request, res: Response) => {
  const { audioBase64, mimeType = 'audio/webm', language = 'ur' } = req.body;

  if (!audioBase64 || typeof audioBase64 !== 'string') {
    return res.status(400).json({ error: 'Audio data is required for transcription.' });
  }

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({
      error: 'AI_UNAVAILABLE',
      message: 'Speech transcription service requires GEMINI_API_KEY.',
    });
  }

  const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
  const langName = getLanguageName(language);

  const scriptInstructionMap: Record<string, string> = {
    en: 'Transcribe into clean, accurate English text.',
    ur: 'Transcribe into authentic Pakistani Urdu script (اردو).',
    pa: 'Transcribe into authentic Pakistani Punjabi Shahmukhi script (پنجابی شاہ مکھی).',
    sd: 'Transcribe into authentic Sindhi Arabic script (سنڌي) using proper Sindhi letters (ڄ, ڃ, ڳ, ڱ, ڪ, ڇ, ڌ, ٿ).',
    ps: 'Transcribe into authentic Pashto Arabic script (پښتو) using proper Pashto letters (ښ, ځ, څ, ډ, ړ, ږ, ڼ, ې, ۍ, ۀ).',
    bal: 'Transcribe into authentic Balochi Perso-Arabic script (بلوچی).',
    roman_ur: 'Transcribe into natural Roman Urdu (Latin alphabet).',
    roman: 'Transcribe into natural Roman Urdu (Latin alphabet).',
  };

  const scriptInstruction =
    scriptInstructionMap[language] ||
    `Transcribe accurately into ${langName} native script (or if the speaker clearly spoke another supported language, transcribe their exact spoken words in that language's native script).`;

  const systemInstruction = `You are a high-accuracy multilingual speech-to-text transcriber for Pakistani languages: Urdu (اردو), Punjabi (پنجابی), Sindhi (سنڌي), Pashto (پښتو), Balochi (بلوچی), Saraiki (سرائیکی), Roman Urdu, and English.
Listen carefully to the user's audio recording and return ONLY the exact spoken words.
- ${scriptInstruction}
- Do NOT translate the user's speech into another language; transcribe the exact words spoken.
- Do NOT answer the question or add commentary, quotation marks, or labels.
- If the audio is completely silent or contains no recognizable human speech, return an empty string.`;

  try {
    const response = await callWithCandidateModels(
      'Audio Transcription',
      (modelName) =>
        ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'audio/webm',
                    data: cleanBase64,
                  },
                },
                {
                  text: `Transcribe this spoken audio accurately (${langName}). Output only the transcribed text.`,
                },
              ],
            },
          ],
          config: getFastModelConfig(modelName, {
            systemInstruction,
            temperature: 0.1,
          }),
        }),
      12000
    );

    const transcript = (
      response.text ||
      response?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .filter(Boolean)
        .join(' ') ||
      ''
    ).trim();

    const detectedLang = resolveEffectiveLanguage(transcript, language);
    return res.json({ transcript, language: detectedLang });
  } catch (err: any) {
    console.error('Audio Transcription Error:', err?.message || err);
    return res.status(503).json({
      error: 'TRANSCRIPTION_FAILED',
      message: 'Could not transcribe audio right now. Please try speaking again or type your message.',
    });
  }
});
