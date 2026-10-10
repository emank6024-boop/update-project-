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
import { getGlobalLanguageDirective, getLanguageName } from '../languageDirectives.js';

export const teacherRouter = Router();

const teacherTextCache = new ServerLRUCache<string>(300, 30 * 60 * 1000);
const teacherJsonCache = new ServerLRUCache<any>(200, 30 * 60 * 1000);

// Helper for Educational Language Prompting
export function getEducationLanguageInstruction(lang?: string): string {
  const baseDirective = getGlobalLanguageDirective(lang || 'ur');
  const langName = getLanguageName(lang || 'ur');
  return `${baseDirective}
ADDITIONAL EDUCATIONAL INSTRUCTION:
Provide pedagogical, structured explanations in ${langName} with key academic/technical terminology included in parentheses where helpful for Pakistani board/curriculum students (FBISE, Punjab, Sindh, KPK, Balochistan). Ensure the entire lesson is delivered in ${langName}.`;
}

// Subject Visual Meta and Domain Boundaries for Teacher
export function getSubjectVisual(subject: string): { icon: string; name: string; domainHint: string; isCS: boolean } {
  const s = (subject || '').toLowerCase();
  if (s.includes('computer') || s.includes('cs') || s.includes('programming') || s.includes('software') || s.includes('it')) {
    return {
      icon: '💻',
      name: 'Computer Science',
      domainHint: 'computing, programming, algorithms, OOP, data structures, computer hardware, operating systems, networking',
      isCS: true,
    };
  }
  if (s.includes('math')) {
    return {
      icon: '🔢',
      name: 'Mathematics',
      domainHint: 'mathematics, algebra, geometry, trigonometry, arithmetic, calculus, equations, matrices, statistics',
      isCS: false,
    };
  }
  if (s.includes('physic')) {
    return {
      icon: '⚛️',
      name: 'Physics',
      domainHint: 'physics, mechanics, motion, forces, energy, thermodynamics, optics, electricity, electromagnetism',
      isCS: false,
    };
  }
  if (s.includes('chem')) {
    return {
      icon: '🧪',
      name: 'Chemistry',
      domainHint: 'chemistry, periodic table, chemical bonds, reactions, organic, inorganic, states of matter, stoichiometry',
      isCS: false,
    };
  }
  if (s.includes('bio')) {
    return {
      icon: '🧬',
      name: 'Biology',
      domainHint: 'biology, cells, genetics, ecology, botany, zoology, physiology, human organ systems, enzymes',
      isCS: false,
    };
  }
  if (s.includes('english')) {
    return {
      icon: '📖',
      name: 'English Grammar',
      domainHint: 'English grammar, vocabulary, tenses, active/passive voice, direct/indirect speech, essay writing, comprehension',
      isCS: false,
    };
  }
  if (s.includes('urdu')) {
    return {
      icon: '🖋️',
      name: 'Urdu Adab',
      domainHint: 'Urdu grammar, qawaid, adab, nazm, ghazal, khulasa, mazmoon, tashbih, istehara',
      isCS: false,
    };
  }
  if (s.includes('pak') || s.includes('pakistan')) {
    return {
      icon: '🏛️',
      name: 'Pakistan Studies',
      domainHint: 'history of Pakistan, 1940 resolution, 1973 constitution, geography, natural resources, agriculture',
      isCS: false,
    };
  }
  if (s.includes('islami') || s.includes('islamic')) {
    return {
      icon: '🌙',
      name: 'Islamic Studies',
      domainHint: 'Pillars of Islam, Quran, Sunnah, Hadith, Islamic history, ethics, rights in Islam',
      isCS: false,
    };
  }
  return {
    icon: '🔬',
    name: subject || 'General Science',
    domainHint: 'foundational scientific concepts, syllabus definitions, everyday science',
    isCS: false,
  };
}

// Helper to stream or return JSON for text-based teacher endpoints
async function handleTeacherTextGeneration(
  req: Request,
  res: Response,
  options: {
    actionName: string;
    cacheKey: string;
    systemInstruction: string;
    prompt: string;
    responseField: string;
    stream?: boolean;
  }
) {
  const { actionName, cacheKey, systemInstruction, prompt, responseField, stream = false } = options;

  const cached = teacherTextCache.get(cacheKey);
  if (cached) {
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.write(
        `data: ${JSON.stringify({
          chunk: cached,
          done: true,
          [responseField]: cached,
          answer: cached,
          explanation: cached,
        })}\n\n`
      );
      return res.end();
    }
    return res.json({
      [responseField]: cached,
      answer: cached,
      explanation: cached,
      solution: cached,
      cached: true,
    });
  }

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({ error: 'AI_UNAVAILABLE', message: 'Gemini API not configured.' });
  }

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
          contents: prompt,
          config: getFastModelConfig(modelName, {
            systemInstruction,
            temperature: 0.35,
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
          teacherTextCache.set(cacheKey, accumulatedText);
          res.write(
            `data: ${JSON.stringify({
              done: true,
              [responseField]: accumulatedText,
              answer: accumulatedText,
              explanation: accumulatedText,
            })}\n\n`
          );
          return res.end();
        }
      } catch (err: any) {
        if (isQuotaExhaustedError(err)) {
          markModelRateLimited(modelName);
        }
        if (streamedSuccessfully && accumulatedText.trim()) {
          res.write(
            `data: ${JSON.stringify({
              done: true,
              [responseField]: accumulatedText,
              answer: accumulatedText,
              explanation: accumulatedText,
            })}\n\n`
          );
          return res.end();
        }
      }
    }

    res.write(
      `data: ${JSON.stringify({
        error: 'Unable to generate lesson right now. Please try again.',
        done: true,
      })}\n\n`
    );
    return res.end();
  }

  try {
    const generatedText = await deduplicateRequest(`inflight_${cacheKey}`, async () => {
      const response = await callWithCandidateModels(
        actionName,
        (modelName) =>
          ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: getFastModelConfig(modelName, {
              systemInstruction,
              temperature: 0.35,
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
    });

    if (generatedText) {
      teacherTextCache.set(cacheKey, generatedText);
      return res.json({
        [responseField]: generatedText,
        answer: generatedText,
        explanation: generatedText,
        solution: generatedText,
      });
    }
    return res.status(503).json({ error: 'Unable to generate lesson content right now.' });
  } catch (err: any) {
    console.error(`${actionName} Error:`, err?.message || err);
    return res.status(503).json({ error: 'Unable to generate lesson content right now.' });
  }
}

// 1. AI Teacher: Ask Teacher / Interactive Lesson (any educational question or topic)
teacherRouter.post('/api/teacher/ask', async (req: Request, res: Response) => {
  const rawQuestion = req.body.question || req.body.query || req.body.topic || '';
  const question = typeof rawQuestion === 'string' ? rawQuestion.trim() : '';
  const subject = req.body.subject || 'General Science';
  const grade = req.body.grade || req.body.gradeLevel || req.body.targetClass || 'Matric (Class 9-10)';
  const language = req.body.language || 'ur';
  const stream = Boolean(req.body.stream);

  if (!question) {
    return res.status(400).json({ error: 'Question or topic is required.' });
  }

  const visualInfo = getSubjectVisual(subject);

  const systemInstruction = `You are the PakLingo AI Teacher, an elite academic educator for Pakistani students following FBISE and Provincial Board syllabi (Punjab, Sindh, KPK, Balochistan).

CRITICAL CONSTRAINTS:
1. STRICT SUBJECT FOCUS:
   - You are teaching: "${subject}" at Academic Level: "${grade}".
   - Keep examples, definitions, and explanations focused on "${subject}".

2. STRUCTURED VISUAL LESSON LAYOUT:
   Format the lesson to be clear, visual, well-organized, and easy to read and listen to using these Markdown section headings:
   - \`### 📚 Concept Overview\` — Direct, crystal-clear definition and foundational explanation
   - \`### 💡 Simple Explanation\` — Explain the concept in plain, everyday words
   - \`### 🧠 Step-by-Step Breakdown\` — Numbered steps, formulas, or core mechanics
   - \`### ${visualInfo.icon} Real-Life Pakistani Example\` — Relatable example for students
   - \`### 🎯 Key Takeaways & Exam Tips\` — 3 to 4 concise bullet points for board exams (FBISE / BISE)
   ${visualInfo.isCS ? '- For programming topics, include a clean fenced code block with brief line explanations.' : ''}

3. CLEAN FORMATTING:
   - Use standard Markdown headings (\`###\`), bold key terms (\`**term**\`), and clean bullet/numbered lists.
${getEducationLanguageInstruction(language)}`;

  const prompt = `SUBJECT: ${subject}
ACADEMIC LEVEL: ${grade}
TOPIC / QUESTION: "${question}"

Teach this lesson clearly in ${getLanguageName(language)}.`;

  const cacheKey = `teacher_ask_${language}_${subject}_${grade}_${question.toLowerCase()}`;

  return handleTeacherTextGeneration(req, res, {
    actionName: 'Teacher Ask Question',
    cacheKey,
    systemInstruction,
    prompt,
    responseField: 'answer',
    stream,
  });
});

// 2. AI Teacher: Topic explanation endpoint
teacherRouter.post('/api/teacher/explain', async (req: Request, res: Response) => {
  const rawTopic = req.body.topic || req.body.question || req.body.query || '';
  const topic = typeof rawTopic === 'string' ? rawTopic.trim() : '';
  const subject = req.body.subject || 'General Science';
  const grade = req.body.grade || req.body.gradeLevel || 'Matric (Class 9-10)';
  const difficulty = req.body.difficulty || 'Intermediate';
  const language = req.body.language || 'ur';
  const stream = Boolean(req.body.stream);

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  const systemInstruction = `You are the PakLingo AI Teacher for Pakistani students.
Explain the requested topic in an encouraging, clear, and pedagogically structured manner tailored to Pakistani curriculum standards (Matric, FSc, Middle, O/A Levels).
Structure your lesson with:
- \`### 📚 Fundamental Concept\`
- \`### 💡 Real-Life Example\`
- \`### 📝 Key Rules, Formulas & Steps\`
- \`### ⚠️ Common Board Exam Mistakes to Avoid\`
- \`### ✅ Quick Revision Checklist\`

${getEducationLanguageInstruction(language)}`;

  const prompt = `Subject: ${subject}\nGrade Level: ${grade}\nDifficulty: ${difficulty}\nTopic: ${topic}`;
  const cacheKey = `teacher_explain_${language}_${subject}_${grade}_${difficulty}_${topic.toLowerCase()}`;

  return handleTeacherTextGeneration(req, res, {
    actionName: 'Teacher Explanation',
    cacheKey,
    systemInstruction,
    prompt,
    responseField: 'explanation',
    stream,
  });
});

// 3. AI Teacher: Summarize text / Chapter Notes
teacherRouter.post('/api/teacher/summarize', async (req: Request, res: Response) => {
  const rawText = req.body.text || req.body.topic || req.body.query || '';
  const text = typeof rawText === 'string' ? rawText.trim() : '';
  const subject = req.body.subject || 'General Science';
  const grade = req.body.grade || req.body.gradeLevel || 'Matric';
  const language = req.body.targetLanguage || req.body.language || 'ur';
  const stream = Boolean(req.body.stream);

  if (!text) {
    return res.status(400).json({ error: 'Text or topic to summarize is required.' });
  }

  const systemInstruction = `You are the PakLingo Study Notes Summarizer.
Summarize the provided educational topic or text into clear, high-yield study notes and bullet points.
Highlight core definitions, key facts, essential formulas, and exam takeaways.
${getEducationLanguageInstruction(language)}`;

  const prompt = `Subject: ${subject}\nGrade Level: ${grade}\n\nTopic / Text to Summarize:\n"""\n${text}\n"""\n\nProvide structured study notes and summary points.`;
  const cacheKey = `teacher_sum_${language}_${subject}_${grade}_${text.slice(0, 200).toLowerCase()}`;

  return handleTeacherTextGeneration(req, res, {
    actionName: 'Teacher Summarize',
    cacheKey,
    systemInstruction,
    prompt,
    responseField: 'summary',
    stream,
  });
});

// 4. AI Teacher: Generate Quiz
teacherRouter.post('/api/teacher/quiz', async (req: Request, res: Response) => {
  const {
    subject = 'General Science',
    grade = 'Matric (Class 9-10)',
    gradeLevel,
    topic,
    query,
    numQuestions = 4,
    language = 'ur',
  } = req.body;
  const effectiveGrade = gradeLevel || grade;
  const rawTopic = topic || query || subject;
  const effectiveTopic = typeof rawTopic === 'string' && rawTopic.trim() ? rawTopic.trim() : subject;

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({ error: 'AI_UNAVAILABLE', message: 'Gemini API not configured.' });
  }

  const count = Math.min(Math.max(parseInt(String(numQuestions), 10) || 4, 1), 8);
  const cacheKey = `teacher_quiz_${language}_${subject}_${effectiveGrade}_${count}_${effectiveTopic.toLowerCase()}`;

  const cached = teacherJsonCache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const systemInstruction = `You are an expert examiner for Pakistani education boards (FBISE, Punjab, Sindh, KPK, Balochistan) specializing in ${subject}.
Generate an interactive multiple-choice practice quiz of ${count} question(s) on "${effectiveTopic}" for ${effectiveGrade}.
Each question MUST have 4 distinct options and a correctIndex (0, 1, 2, or 3), plus a brief explanation.
Output strictly valid JSON with this schema:
{
  "quizzes": [
    {
      "id": "q1",
      "question": "Question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation..."
    }
  ]
}
${getEducationLanguageInstruction(language)}`;

  const prompt = `SUBJECT: ${subject}
ACADEMIC LEVEL: ${effectiveGrade}
TOPIC: "${effectiveTopic}"
NUMBER OF QUESTIONS: ${count}
LANGUAGE: ${getLanguageName(language)}

Generate ${count} multiple-choice question(s) in ${getLanguageName(language)}.`;

  try {
    const payload = await deduplicateRequest(`inflight_${cacheKey}`, async () => {
      const response = await callWithCandidateModels(
        'Teacher Generate Quiz',
        (modelName) =>
          ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: getFastModelConfig(modelName, {
              systemInstruction,
              responseMimeType: 'application/json',
              temperature: 0.3,
            }),
          }),
        16000
      );

      const rawText = response.text || '';
      let parsed: any = null;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        }
      }

      if (parsed && Array.isArray(parsed.quizzes) && parsed.quizzes.length > 0) {
        const first = parsed.quizzes[0];
        return {
          quizzes: parsed.quizzes,
          questions: parsed.quizzes,
          question: first.question,
          options: first.options,
          correctIndex: first.correctIndex ?? 0,
          explanation: first.explanation || '',
        };
      }
      throw new Error('Invalid quiz JSON structure');
    });

    teacherJsonCache.set(cacheKey, payload);
    return res.json(payload);
  } catch (err: any) {
    console.error('Teacher Quiz Error:', err?.message || err);
    return res.status(503).json({ error: 'Unable to generate quiz right now.' });
  }
});

// 5. AI Teacher: Flashcards Generator
teacherRouter.post('/api/teacher/flashcards', async (req: Request, res: Response) => {
  const {
    topic,
    query,
    sourceText,
    subject = 'General Science',
    grade = 'Matric (Class 9-10)',
    gradeLevel,
    numCards = 5,
    count: rawCount,
    language = 'ur',
  } = req.body;
  const effectiveGrade = gradeLevel || grade;
  const rawTopic = topic || query || subject;
  const effectiveTopic = typeof rawTopic === 'string' && rawTopic.trim() ? rawTopic.trim() : subject;

  const ai = getGemini();
  if (!ai) {
    return res.status(503).json({ error: 'AI_UNAVAILABLE', message: 'Gemini API not configured.' });
  }

  const requestedCount = rawCount || numCards;
  const count = Math.min(Math.max(parseInt(String(requestedCount), 10) || 5, 3), 8);
  const cacheKey = `teacher_cards_${language}_${subject}_${effectiveGrade}_${count}_${effectiveTopic.toLowerCase()}`;

  const cached = teacherJsonCache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const systemInstruction = `You are the PakLingo Flashcard Maker for Pakistani students specializing in ${subject}.
Generate ${count} high-yield revision flashcards on "${effectiveTopic}" for ${effectiveGrade}.
Each flashcard has:
- front: Key term, formula, or question in ${getLanguageName(language)}
- back: Concise, clear definition, formula, or answer in ${getLanguageName(language)}
- notes: Short exam tip or practical example in ${getLanguageName(language)}
- category: "${subject}"
Output strictly valid JSON:
{
  "flashcards": [
    {
      "front": "Front question/term",
      "back": "Back answer/definition",
      "notes": "Short note or tip",
      "category": "${subject}"
    }
  ]
}
${getEducationLanguageInstruction(language)}`;

  const prompt = `SUBJECT: ${subject}
ACADEMIC LEVEL: ${effectiveGrade}
TOPIC: "${effectiveTopic}"
${sourceText ? `Provided Text:\n"""\n${sourceText}\n"""\n` : ''}Number of Flashcards: ${count}`;

  try {
    const payload = await deduplicateRequest(`inflight_${cacheKey}`, async () => {
      const response = await callWithCandidateModels(
        'Teacher Generate Flashcards',
        (modelName) =>
          ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: getFastModelConfig(modelName, {
              systemInstruction,
              responseMimeType: 'application/json',
              temperature: 0.3,
            }),
          }),
        16000
      );

      const rawText = response.text || '';
      let parsed: any = null;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        }
      }

      if (parsed && Array.isArray(parsed.flashcards) && parsed.flashcards.length > 0) {
        return { flashcards: parsed.flashcards };
      }
      throw new Error('Invalid flashcards JSON');
    });

    teacherJsonCache.set(cacheKey, payload);
    return res.json(payload);
  } catch (err: any) {
    console.error('Teacher Flashcards Error:', err?.message || err);
    return res.status(503).json({ error: 'Unable to generate flashcards right now.' });
  }
});

// 6. AI Teacher: Homework step-by-step solver endpoint
teacherRouter.post('/api/teacher/solve', async (req: Request, res: Response) => {
  const rawProblem = req.body.problem || req.body.question || req.body.query || '';
  const problem = typeof rawProblem === 'string' ? rawProblem.trim() : '';
  const subject = req.body.subject || 'Mathematics';
  const grade = req.body.grade || req.body.gradeLevel || 'Matric';
  const language = req.body.language || 'ur';
  const stream = Boolean(req.body.stream);

  if (!problem) {
    return res.status(400).json({ error: 'Problem statement is required.' });
  }

  const systemInstruction = `You are the PakLingo AI Homework Tutor for Pakistani students.
Help the student understand how to solve the problem step-by-step:
- \`### 📋 Given Data & Objective\`
- \`### 📐 Formula / Principle Used\`
- \`### 🔢 Step-by-Step Solution\`
- \`### ✅ Final Answer\`
- \`### 💡 Verification & Exam Tip\`

${getEducationLanguageInstruction(language)}`;

  const prompt = `Subject: ${subject}\nGrade Level: ${grade}\nProblem to solve:\n"${problem}"`;
  const cacheKey = `teacher_solve_${language}_${subject}_${grade}_${problem.toLowerCase()}`;

  return handleTeacherTextGeneration(req, res, {
    actionName: 'Teacher Solve',
    cacheKey,
    systemInstruction,
    prompt,
    responseField: 'solution',
    stream,
  });
});

// 7. AI Teacher: Study Plan Generator
teacherRouter.post('/api/teacher/study-plan', async (req: Request, res: Response) => {
  const { subject = 'All Core Subjects', grade = 'Matric', availableTime = '2 hours daily', target = 'Board Exam Preparation', language = 'ur', stream = false } = req.body;

  const systemInstruction = `You are the PakLingo Academic Study Mentor.
Generate a realistic, motivating study plan for Pakistani students:
- \`### 🎯 Target & Strategy Blueprint\`
- \`### 📅 Daily / Weekly Study Schedule\`
- \`### 🧠 Active Recall & Past Paper Practice\`
- \`### ✅ High-Score Exam Tips\`

${getEducationLanguageInstruction(language)}`;

  const prompt = `Subject: ${subject}\nGrade Level: ${grade}\nAvailable Study Time: "${availableTime}"\nTarget / Exam Goal: "${target}"`;
  const cacheKey = `teacher_plan_${language}_${subject}_${grade}_${availableTime}_${target}`;

  return handleTeacherTextGeneration(req, res, {
    actionName: 'Teacher Study Plan',
    cacheKey,
    systemInstruction,
    prompt,
    responseField: 'plan',
    stream: Boolean(stream),
  });
});
