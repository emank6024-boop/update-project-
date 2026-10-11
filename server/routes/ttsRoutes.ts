import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import tls from 'tls';
import { Modality } from '@google/genai';
import {
  getGemini,
  callGeminiWithTimeout,
  isQuotaExhaustedError,
  deduplicateRequest,
} from '../geminiService.js';
import { resolveEffectiveLanguage } from '../languageDirectives.js';

export const ttsRouter = Router();

// Helper: Convert 16-bit linear PCM buffer to standard WAV format (only used if buffer is raw headerless PCM)
export function pcmToWav(
  pcmBuffer: Buffer,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Buffer {
  if (
    pcmBuffer.length > 44 &&
    pcmBuffer.toString('ascii', 0, 4) === 'RIFF' &&
    pcmBuffer.toString('ascii', 8, 12) === 'WAVE'
  ) {
    return pcmBuffer;
  }

  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Clean markdown and decorative symbols while preserving all Urdu, Pashto, Sindhi, Punjabi (Shahmukhi & Gurmukhi), and Balochi letters
export function cleanTextForNaturalSpeech(rawText: string): string {
  return rawText
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[ \t]*\|?[ \t]*:?-+:?[ \t]*(\|[ \t]*:?-+:?[ \t]*)+\|?[ \t]*$/gm, ' ')
    .replace(/\|/g, '، ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[ \t]*[-*•+]\s+/gm, '')
    .replace(/^[ \t]*(\d+)[.)]\s+/gm, '$1، ')
    .replace(/[*_~]+/g, '')
    .replace(/[📘💡✅📝📌📊🌍🔎⚠️🎯🏛️🌾⚖️🩺📚🧠🔬💻🔢⚛️🧪🧬📖🖋️🌙🔊🎤🇵🇰🌐⛰️🏺🏜️📱☀️🌲🍁🦅]/gu, '')
    // Replace line breaks with a clean sentence boundary only if the line doesn't already end with punctuation
    .replace(/([^\s.۔؟?!:؛،,])\s*\n+/g, '$1۔ ')
    .replace(/\n+/g, ' ')
    .replace(/([.۔؟?!])\s*[،,]+/g, '$1 ')
    .replace(/[۔.]{2,}/g, '۔')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Normalizes orthography and phonetics per language so neural TTS voices articulate every word
 * with authentic native pronunciation, stress, vowel quality, and rhythm:
 * - Pashto ('ps'): Normalizes any stray Urdu/Persian keyboard characters (ٹ->ټ, ڈ->ډ, ڑ->ړ, گ->ګ, ے->ې, ہ->ه, ك->ک)
 *   into pure standard Pashto (ps-AF) Unicode characters while preserving all native Pashto letters (ښ, ځ, څ, ډ, ړ, ږ, ڼ, ټ, ګ, ې, ۍ, ۀ).
 * - Punjabi ('pa'): Normalizes Shahmukhi retroflex characters (ݨ->ن, ݪ->ل) and applies authentic Punjabi vocalic/phonetic
 *   markers (تُہاڈا, تُہانوں, تُسی, وِچ, کی, ایہ, دِتا, کِتھے, پِنڈ, کُڑی, مُنڈا) so Punjabi is spoken with natural Punjabi pronunciation.
 * - Sindhi ('sd'), Saraiki ('skr'), Balochi ('bal'): Maps script-specific characters for smooth articulation without hesitation.
 */
export function normalizeScriptForRegionalVoice(text: string, langCode: string): string {
  const code = (langCode || 'ur').toLowerCase().trim();
  if (code === 'en' || code === 'ur') {
    return text;
  }

  if (code === 'ps' || code.startsWith('ps-')) {
    return text
      .replace(/ٹ/g, 'ټ')
      .replace(/ڈ/g, 'ډ')
      .replace(/ڑ/g, 'ړ')
      .replace(/گ/g, 'ګ')
      .replace(/ے/g, 'ې')
      .replace(/ہ/g, 'ه')
      .replace(/ك/g, 'ک')
      .replace(/۔/g, '.');
  }

  if (code === 'pa' || code.startsWith('pa-')) {
    // If Gurmukhi script, keep as-is for Gurmukhi Punjabi synthesizer
    if (/[\u0A00-\u0A7F]/.test(text)) {
      return text;
    }
    // Pakistani Punjabi (Shahmukhi) phonetic & orthographic normalization
    return text
      .replace(/ݨ/g, 'ن')
      .replace(/ݪ/g, 'ل')
      .replace(/(^|\s)ایہہ(?=\s|[.۔؟?!،,]|$)/g, '$1ایہ')
      .replace(/(^|\s)کیہ(?=\s|[.۔؟?!،,]|$)/g, '$1کی')
      .replace(/(^|\s)تہاڈا(?=\s|[.۔؟?!،,]|$)/g, '$1تُہاڈا')
      .replace(/(^|\s)تہاڈی(?=\s|[.۔؟?!،,]|$)/g, '$1تُہاڈی')
      .replace(/(^|\s)تہاڈے(?=\s|[.۔؟?!،,]|$)/g, '$1تُہاڈے')
      .replace(/(^|\s)تہانوں(?=\s|[.۔؟?!،,]|$)/g, '$1تُہانوں')
      .replace(/(^|\s)تسی(?=\s|[.۔؟?!،,]|$)/g, '$1تُسی')
      .replace(/(^|\s)تسیں(?=\s|[.۔؟?!،,]|$)/g, '$1تُسیں')
      .replace(/(^|\s)تساں(?=\s|[.۔؟?!،,]|$)/g, '$1تُساں')
      .replace(/(^|\s)وچ(?=\s|[.۔؟?!،,]|$)/g, '$1وِچ')
      .replace(/(^|\s)وچوں(?=\s|[.۔؟?!،,]|$)/g, '$1وِچوں')
      .replace(/(^|\s)اک(?=\s|[.۔؟?!،,]|$)/g, '$1اِک')
      .replace(/(^|\s)دتا(?=\s|[.۔؟?!،,]|$)/g, '$1دِتا')
      .replace(/(^|\s)دتی(?=\s|[.۔؟?!،,]|$)/g, '$1دِتی')
      .replace(/(^|\s)دتے(?=\s|[.۔؟?!،,]|$)/g, '$1دِتے')
      .replace(/(^|\s)کتھے(?=\s|[.۔؟?!،,]|$)/g, '$1کِتھے')
      .replace(/(^|\s)کدھر(?=\s|[.۔؟?!،,]|$)/g, '$1کِدھر')
      .replace(/(^|\s)کیویں(?=\s|[.۔؟?!،,]|$)/g, '$1کِویں')
      .replace(/(^|\s)پچھیا(?=\s|[.۔؟?!،,]|$)/g, '$1پُچھیا')
      .replace(/(^|\s)دسیا(?=\s|[.۔؟?!،,]|$)/g, '$1دَسیا')
      .replace(/(^|\s)لبھیا(?=\s|[.۔؟?!،,]|$)/g, '$1لَبھیا')
      .replace(/(^|\s)منڈا(?=\s|[.۔؟?!،,]|$)/g, '$1مُنڈا')
      .replace(/(^|\s)کڑی(?=\s|[.۔؟?!،,]|$)/g, '$1کُڑی')
      .replace(/(^|\s)پنڈ(?=\s|[.۔؟?!،,]|$)/g, '$1پِنڈ');
  }

  if (code === 'sd') {
    // Sindhi Arabic script phonetic normalization for smooth articulation
    return text
      .replace(/ڪ/g, 'ک')
      .replace(/ک/g, 'کھ')
      .replace(/ڳ/g, 'گ')
      .replace(/گه/g, 'گھ')
      .replace(/ڱ/g, 'نگ')
      .replace(/ڄ/g, 'ج')
      .replace(/جه/g, 'جھ')
      .replace(/ڃ/g, 'نج')
      .replace(/ڇ/g, 'چھ')
      .replace(/ڌ/g, 'دھ')
      .replace(/ڏ/g, 'ڈ')
      .replace(/ڍ/g, 'ڈھ')
      .replace(/ٿ/g, 'تھ')
      .replace(/ٺ/g, 'ٹھ')
      .replace(/ڦ/g, 'پھ')
      .replace(/ٻ/g, 'ب')
      .replace(/ڀ/g, 'بھ')
      .replace(/ڙ/g, 'ڑ')
      .replace(/ي/g, 'ی')
      .replace(/ه/g, 'ہ');
  }

  if (code === 'skr') {
    // Saraiki implosive consonants normalization
    return text
      .replace(/ݙ/g, 'ڈ')
      .replace(/ڳ/g, 'گ')
      .replace(/ݨ/g, 'نڑ')
      .replace(/ڄ/g, 'ج')
      .replace(/ٻ/g, 'ب');
  }

  if (code === 'bal' || code === 'brh') {
    // Balochi oblique/genitive case markers (ءَ, ءِ, ءُ) so they are spoken smoothly as vowels instead of glottal stops
    return text
      .replace(/\s+ءَ/g, ' ے')
      .replace(/ءَ/g, 'ے')
      .replace(/\s+ءِ/g, ' ے')
      .replace(/ءِ/g, 'ے')
      .replace(/\s+ءُ/g, ' و')
      .replace(/ءُ/g, 'و');
  }

  return text;
}

// High-speed in-memory cache for synthesized audio
const ttsAudioCache = new Map<
  string,
  { audioBase64: string; mimeType: string; provider: string; timestamp: number }
>();

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const WIN_EPOCH = 11644473600;

function generateSecMsGec(unixSeconds = Math.floor(Date.now() / 1000)): string {
  let ticks = unixSeconds + WIN_EPOCH;
  ticks -= ticks % 300;
  ticks *= 1e7;
  const strToHash = `${ticks.toFixed(0)}${TRUSTED_CLIENT_TOKEN}`;
  return crypto.createHash('sha256').update(strToHash, 'ascii').digest('hex').toUpperCase();
}

function createWsFrame(payload: string): Buffer {
  const data = Buffer.from(payload, 'utf8');
  const mask = crypto.randomBytes(4);
  let header: Buffer;
  if (data.length < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = 0x80 | data.length;
  } else if (data.length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(data.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 0x80 | 127;
    header.writeBigUInt64BE(BigInt(data.length), 2);
  }
  const masked = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    masked[i] = data[i] ^ mask[i % 4];
  }
  return Buffer.concat([header, mask, masked]);
}

/**
 * Selects the genuine native Neural voice, BCP-47 locale, and language-calibrated conversational prosody
 * for each supported Pakistani & international language:
 * - Pashto ('ps'): Native Pashto ps-AF neural voices (ps-AF-LatifaNeural / ps-AF-GulNawazNeural)
 * - Punjabi ('pa'): Pakistani Shahmukhi Punjabi voice profile (ur-PK-AsadNeural / ur-PK-UzmaNeural) with warm Punjabi cadence
 * - Urdu ('ur'), Sindhi ('sd'), Balochi ('bal'), Saraiki ('skr'): Pakistani ur-PK neural voices (ur-PK-UzmaNeural / ur-PK-AsadNeural)
 * - Roman Urdu ('roman_ur'): South Asian multilingual neural voice (hi-IN-SwaraNeural / hi-IN-MadhurNeural)
 * - English ('en'): Native Multilingual neural voice (en-US-AvaMultilingualNeural / en-US-AndrewMultilingualNeural)
 */
function selectNativeNeuralVoice(
  langCode: string,
  requestedPersona = 'Kore'
): { voiceName: string; xmlLang: string; defaultProsodyRate: string; defaultPitch: string } {
  const code = (langCode || 'ur').toLowerCase().trim();
  const isMalePersona = ['Puck', 'Fenrir', 'Charon'].includes(requestedPersona);

  if (code === 'ps' || code.startsWith('ps-')) {
    return {
      voiceName: isMalePersona ? 'ps-AF-GulNawazNeural' : 'ps-AF-LatifaNeural',
      xmlLang: 'ps-AF',
      defaultProsodyRate: '+5%',
      defaultPitch: '+0Hz',
    };
  }

  if (code === 'pa' || code.startsWith('pa-')) {
    // Use AsadNeural by default for Punjabi (or UzmaNeural if Zephyr is explicitly chosen) for a distinct, natural Pakistani Punjabi voice
    const useFemaleForPa = requestedPersona === 'Zephyr';
    return {
      voiceName: useFemaleForPa ? 'ur-PK-UzmaNeural' : 'ur-PK-AsadNeural',
      xmlLang: 'ur-PK',
      defaultProsodyRate: '+4%',
      defaultPitch: '+1Hz',
    };
  }

  if (code === 'en' || code.startsWith('en-')) {
    return {
      voiceName: isMalePersona ? 'en-US-AndrewMultilingualNeural' : 'en-US-AvaMultilingualNeural',
      xmlLang: 'en-US',
      defaultProsodyRate: '+2%',
      defaultPitch: '+0Hz',
    };
  }

  if (code === 'roman_ur' || code === 'roman') {
    return {
      voiceName: isMalePersona ? 'hi-IN-MadhurNeural' : 'hi-IN-SwaraNeural',
      xmlLang: 'hi-IN',
      defaultProsodyRate: '+4%',
      defaultPitch: '+0Hz',
    };
  }

  // Urdu, Sindhi, Balochi, Saraiki, Hindko, Kashmiri, Brahui
  return {
    voiceName: isMalePersona ? 'ur-PK-AsadNeural' : 'ur-PK-UzmaNeural',
    xmlLang: 'ur-PK',
    defaultProsodyRate: '+5%',
    defaultPitch: '+0Hz',
  };
}

/**
 * Synthesizes Gurmukhi Punjabi (ਪੰਜਾਬੀ) using native Punjabi TTS (`tl=pa`)
 */
async function synthesizeGurmukhiPunjabiSpeech(
  text: string
): Promise<{ audioBase64: string; mimeType: string; voiceUsed: string } | null> {
  try {
    const trimmed = text.slice(0, 220).trim();
    if (!trimmed) return null;
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      trimmed
    )}&tl=pa&ttsspeed=1&client=tw-ob`;
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength < 200) return null;
    return {
      audioBase64: Buffer.from(arrayBuffer).toString('base64'),
      mimeType: 'audio/mpeg',
      voiceUsed: 'pa-IN-GurmukhiNeural',
    };
  } catch {
    return null;
  }
}

/**
 * Synthesizes fast, natural conversational speech using Microsoft Edge Neural TTS WebSocket
 * with native Pashto (ps-AF), Pakistani Punjabi/Urdu (ur-PK), and English (en-US) neural voices.
 */
async function synthesizeNativeNeuralSpeechOnce(
  preparedText: string,
  voiceName: string,
  xmlLang: string,
  defaultProsodyRate: string,
  defaultPitch: string
): Promise<{ audioBase64: string; mimeType: string; voiceUsed: string } | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (val: { audioBase64: string; mimeType: string; voiceUsed: string } | null) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeoutId);
        resolve(val);
      }
    };

    const reqId = crypto.randomUUID().replace(/-/g, '');
    const secMsGec = generateSecMsGec();
    const muid = crypto.randomBytes(16).toString('hex').toUpperCase();
    const wsKey = crypto.randomBytes(16).toString('base64');
    const host = 'api.msedgeservices.com';
    const path = `/tts/cognitiveservices/websocket/v1?Ocp-Apim-Subscription-Key=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=1-132.0.2957.140&ConnectionId=${reqId}`;

    const socket = tls.connect(443, host, { servername: host }, () => {
      const handshake = [
        `GET ${path} HTTP/1.1`,
        `Host: ${host}`,
        `Upgrade: websocket`,
        `Connection: Upgrade`,
        `Sec-WebSocket-Key: ${wsKey}`,
        `Sec-WebSocket-Version: 13`,
        `Pragma: no-cache`,
        `Cache-Control: no-cache`,
        `Origin: chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold`,
        `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0`,
        `Cookie: muid=${muid};`,
        ``,
        ``,
      ].join('\r\n');
      socket.write(handshake);
    });

    const timeoutId = setTimeout(() => {
      socket.destroy();
      finish(null);
    }, 6500);

    let upgraded = false;
    let rxBuffer = Buffer.alloc(0);
    const audioChunks: Buffer[] = [];

    socket.on('data', (chunk: Buffer) => {
      rxBuffer = Buffer.concat([rxBuffer, chunk]);
      if (!upgraded) {
        const idx = rxBuffer.indexOf('\r\n\r\n');
        if (idx !== -1) {
          const headerStr = rxBuffer.subarray(0, idx).toString('utf8');
          if (!headerStr.includes('101')) {
            socket.destroy();
            finish(null);
            return;
          }
          upgraded = true;
          rxBuffer = rxBuffer.subarray(idx + 4);

          const configMsg = `X-Timestamp:${new Date().toUTCString()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
          socket.write(createWsFrame(configMsg));

          const escaped = preparedText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${xmlLang}"><voice name="${voiceName}"><prosody pitch="${defaultPitch}" rate="${defaultProsodyRate}" volume="+0%">${escaped}</prosody></voice></speak>`;
          const ssmlMsg = `X-RequestId:${reqId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${new Date().toUTCString()}Z\r\nPath:ssml\r\n\r\n${ssml}`;
          socket.write(createWsFrame(ssmlMsg));
        }
      }

      while (upgraded && rxBuffer.length >= 2) {
        const byte0 = rxBuffer[0];
        const opcode = byte0 & 0x0f;
        const byte1 = rxBuffer[1];
        const isMasked = (byte1 & 0x80) !== 0;
        let payloadLen = byte1 & 0x7f;
        let offset = 2;

        if (payloadLen === 126) {
          if (rxBuffer.length < 4) break;
          payloadLen = rxBuffer.readUInt16BE(2);
          offset = 4;
        } else if (payloadLen === 127) {
          if (rxBuffer.length < 10) break;
          payloadLen = Number(rxBuffer.readBigUInt64BE(2));
          offset = 10;
        }
        if (isMasked) offset += 4;
        if (rxBuffer.length < offset + payloadLen) break;

        const framePayload = rxBuffer.subarray(offset, offset + payloadLen);
        rxBuffer = rxBuffer.subarray(offset + payloadLen);

        if (opcode === 0x01) {
          const textMsg = framePayload.toString('utf8');
          if (textMsg.includes('Path:turn.end')) {
            socket.end();
            const fullAudio = Buffer.concat(audioChunks);
            if (fullAudio.length > 200) {
              finish({
                audioBase64: fullAudio.toString('base64'),
                mimeType: 'audio/mpeg',
                voiceUsed: voiceName,
              });
            } else {
              finish(null);
            }
            return;
          }
        } else if (opcode === 0x02) {
          if (framePayload.length >= 2) {
            const headerLen = framePayload.readUInt16BE(0);
            const headerText = framePayload.subarray(2, 2 + headerLen).toString('utf8');
            if (headerText.includes('Path:audio')) {
              audioChunks.push(framePayload.subarray(2 + headerLen));
            }
          }
        } else if (opcode === 0x08) {
          socket.end();
          const fullAudio = Buffer.concat(audioChunks);
          if (fullAudio.length > 200) {
            finish({
              audioBase64: fullAudio.toString('base64'),
              mimeType: 'audio/mpeg',
              voiceUsed: voiceName,
            });
          } else {
            finish(null);
          }
          return;
        }
      }
    });

    socket.on('error', () => {
      finish(null);
    });
  });
}

async function synthesizeNativeNeuralSpeech(
  text: string,
  langCode: string,
  requestedPersona = 'Kore'
): Promise<{ audioBase64: string; mimeType: string; voiceUsed: string } | null> {
  // If Punjabi text is written in Gurmukhi script (ਪੰਜਾਬੀ), use native Gurmukhi Punjabi TTS
  if (/[\u0A00-\u0A7F]/.test(text)) {
    return synthesizeGurmukhiPunjabiSpeech(text);
  }

  const { voiceName, xmlLang, defaultProsodyRate, defaultPitch } = selectNativeNeuralVoice(
    langCode,
    requestedPersona
  );
  const preparedText = normalizeScriptForRegionalVoice(text, langCode);
  if (!preparedText.trim()) return null;

  const firstAttempt = await synthesizeNativeNeuralSpeechOnce(
    preparedText,
    voiceName,
    xmlLang,
    defaultProsodyRate,
    defaultPitch
  );
  if (firstAttempt) return firstAttempt;

  // Immediate retry once in case of transient TLS/WebSocket reset
  return synthesizeNativeNeuralSpeechOnce(
    preparedText,
    voiceName,
    xmlLang,
    defaultProsodyRate,
    defaultPitch
  );
}

/**
 * Resolves the actual language of the text being spoken so that TTS always uses the voice
 * matching the text script and language (even if UI language differs).
 */
function resolveTtsSpeechLanguage(text: string, fallbackLang = 'ur'): string {
  const cleanFallback = (fallbackLang || 'ur').toLowerCase().trim();
  if (!text || !text.trim()) return cleanFallback;

  if (/[\u0A00-\u0A7F]/.test(text)) {
    return 'pa';
  }

  const arabicCount = (text.match(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  const latinCount = (text.match(/[A-Za-z]/g) || []).length;

  if (latinCount > arabicCount * 2 && latinCount >= 3) {
    if (cleanFallback === 'roman_ur' || cleanFallback === 'roman') {
      return 'roman_ur';
    }
    if (
      /\b(aap|main|mein|hai|hain|kya|kaise|aur|nahi|kar|sakta|sakte|ke|ki|ka|ko|se|par|liye|bohat|shukriya|madad|zaban)\b/i.test(
        text
      )
    ) {
      return 'roman_ur';
    }
    return 'en';
  }

  return resolveEffectiveLanguage(text, cleanFallback);
}

// Track Gemini TTS quota cooldown so we never add latency when Gemini TTS is rate-limited
let geminiTtsRateLimitedUntil = 0;

const TTS_CANDIDATE_MODELS = [
  'gemini-3.8-flash-lite-tts',
  'gemini-3.8-flash-tts',
];

/**
 * Secondary HTTP speech fallback if both Native Neural TTS and Gemini TTS are unreachable
 */
async function fetchHttpSpeechFallback(
  text: string,
  langCode: string
): Promise<{ audioBase64: string; mimeType: string } | null> {
  try {
    const code = (langCode || 'ur').toLowerCase().trim();
    const prepared = normalizeScriptForRegionalVoice(text, code).slice(0, 200).trim();
    if (!prepared) return null;

    const isGurmukhi = /[\u0A00-\u0A7F]/.test(prepared);
    const tl = isGurmukhi ? 'pa' : code === 'en' ? 'en' : 'ur';
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      prepared
    )}&tl=${tl}&ttsspeed=1&client=tw-ob`;

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength < 200) return null;

    return {
      audioBase64: Buffer.from(arrayBuffer).toString('base64'),
      mimeType: 'audio/mpeg',
    };
  } catch {
    return null;
  }
}

// PakLingo AI Text-to-Speech Engine Status & Voices
ttsRouter.get('/api/tts/status', (_req: Request, res: Response) => {
  res.json({
    geminiTTSAvailable: true,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    voices: [
      { id: 'Kore', name: 'Kore / Latifa / Asad / Uzma (Natural Native Voice - Recommended)', gender: 'Female/Male' },
      { id: 'Puck', name: 'Puck / GulNawaz / Asad (Natural Male)', gender: 'Male' },
      { id: 'Zephyr', name: 'Zephyr / Uzma (Warm & Expressive Female)', gender: 'Female' },
      { id: 'Fenrir', name: 'Fenrir (Deep & Professional Male)', gender: 'Male' },
      { id: 'Charon', name: 'Charon (Calm & Clear Male)', gender: 'Male' },
    ],
  });
});

// PakLingo AI Multilingual Text-to-Speech Generation Endpoint
ttsRouter.post('/api/tts', async (req: Request, res: Response) => {
  const { text, language, lang, voice = 'Kore' } = req.body;
  const requestedLanguage = language || lang || 'ur';
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required for TTS synthesis.' });
  }

  const cleanedText = cleanTextForNaturalSpeech(text);
  if (!cleanedText) {
    return res.status(400).json({ error: 'No speakable text found.' });
  }

  const effectiveLang = resolveTtsSpeechLanguage(cleanedText, requestedLanguage);
  const safeText = cleanedText.slice(0, 900);

  const validVoices = ['Kore', 'Zephyr', 'Puck', 'Fenrir', 'Charon'];
  const chosenVoice = validVoices.includes(voice) ? voice : 'Kore';

  const cacheKey = `v4_${effectiveLang}_${chosenVoice}_${safeText}`;
  const cached = ttsAudioCache.get(cacheKey);
  if (cached) {
    return res.json({
      success: true,
      audioBase64: cached.audioBase64,
      mimeType: cached.mimeType,
      provider: `${cached.provider}-cached`,
      language: effectiveLang,
      voice: chosenVoice,
    });
  }

  try {
    const result = await deduplicateRequest(`tts_${cacheKey}`, async () => {
      // 1. Primary: Native Neural Speech Synthesis
      //    - Pashto ('ps'): ps-AF-LatifaNeural / ps-AF-GulNawazNeural
      //    - Punjabi ('pa'): ur-PK-AsadNeural / ur-PK-UzmaNeural (with Shahmukhi Punjabi phonetic normalization) or pa-IN (Gurmukhi)
      //    - Urdu ('ur'), Sindhi ('sd'), Balochi ('bal'), Saraiki ('skr'): ur-PK-UzmaNeural / ur-PK-AsadNeural
      //    - English ('en'): en-US-AvaMultilingualNeural
      const neuralAudio = await synthesizeNativeNeuralSpeech(
        safeText,
        effectiveLang,
        chosenVoice
      );
      if (neuralAudio) {
        if (ttsAudioCache.size > 400) {
          const oldestKey = ttsAudioCache.keys().next().value;
          if (oldestKey) ttsAudioCache.delete(oldestKey);
        }
        ttsAudioCache.set(cacheKey, {
          audioBase64: neuralAudio.audioBase64,
          mimeType: neuralAudio.mimeType,
          provider: `neural-${neuralAudio.voiceUsed}`,
          timestamp: Date.now(),
        });
        return {
          audioBase64: neuralAudio.audioBase64,
          mimeType: neuralAudio.mimeType,
          provider: `neural-${neuralAudio.voiceUsed}`,
        };
      }

      // 2. Secondary: Gemini TTS (if configured and not in quota cooldown)
      const ai = getGemini();
      if (ai && Date.now() > geminiTtsRateLimitedUntil) {
        const normalizedForGemini = normalizeScriptForRegionalVoice(safeText, effectiveLang);
        for (const modelName of TTS_CANDIDATE_MODELS) {
          try {
            const response = await callGeminiWithTimeout(
              ai.models.generateContent({
                model: modelName,
                contents: [
                  {
                    role: 'user',
                    parts: [
                      {
                        text: normalizedForGemini,
                      },
                    ],
                  },
                ],
                config: {
                  responseModalities: [Modality.AUDIO],
                  speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: chosenVoice },
                    },
                  },
                },
              }),
              8000
            );

            const inlineData = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
            if (inlineData?.data) {
              const rawBuffer = Buffer.from(inlineData.data, 'base64');
              const wavBuffer = pcmToWav(rawBuffer, 24000, 1, 16);
              const audioBase64 = wavBuffer.toString('base64');
              const mimeType = 'audio/wav';

              ttsAudioCache.set(cacheKey, {
                audioBase64,
                mimeType,
                provider: 'gemini-tts',
                timestamp: Date.now(),
              });

              return {
                audioBase64,
                mimeType,
                provider: 'gemini-tts',
              };
            }
          } catch (err: any) {
            if (isQuotaExhaustedError(err)) {
              geminiTtsRateLimitedUntil = Date.now() + 15 * 60 * 1000;
              break;
            }
          }
        }
      }

      // 3. Tertiary: HTTP Speech Fallback
      const fallbackAudio = await fetchHttpSpeechFallback(safeText, effectiveLang);
      if (fallbackAudio) {
        return {
          audioBase64: fallbackAudio.audioBase64,
          mimeType: fallbackAudio.mimeType,
          provider: 'http-speech-fallback',
        };
      }

      throw new Error('All TTS synthesis providers failed');
    });

    return res.json({
      success: true,
      audioBase64: result.audioBase64,
      mimeType: result.mimeType,
      provider: result.provider,
      language: effectiveLang,
      voice: chosenVoice,
    });
  } catch (lastError: any) {
    console.error('TTS synthesis error:', lastError?.message || lastError);
    return res.status(503).json({
      success: false,
      error: 'TTS_SERVICE_ERROR',
      message: 'Cloud TTS temporarily unavailable. Falling back to local speech synthesis.',
      fallbackToBrowser: true,
    });
  }
});

