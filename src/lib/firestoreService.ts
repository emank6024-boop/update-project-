import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { ChatConversation, ChatMessage, LanguageCode } from '../types';

export interface UserProfileData {
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'email';
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConversationDocument {
  id?: string;
  userId: string;
  title: string;
  category: string;
  language: string;
  subtitle?: string;
  type?: string;
  module?: string;
  targetPage?: string;
  createdAt?: string;
}

const LOCAL_CHAT_STORAGE_PREFIX = 'paklingo_chat_sessions_v1_';

function getLocalStorageKey(userId?: string): string {
  return `${LOCAL_CHAT_STORAGE_PREFIX}${userId || 'guest'}`;
}

export function createUniqueConversationId(): string {
  return 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

/**
 * Strips heavy base64 payloads from attachments when persisting to localStorage
 * so quota is never exceeded, while keeping metadata and small previews.
 */
function sanitizeMessagesForStorage(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((m) => ({
    ...m,
    attachments: m.attachments?.map((att) => ({
      id: att.id,
      type: att.type,
      name: att.name,
      mimeType: att.mimeType,
      size: att.size,
      textContent: att.textContent ? att.textContent.slice(0, 4000) : undefined,
      previewUrl:
        att.previewUrl && att.previewUrl.length < 120000 ? att.previewUrl : undefined,
      dataBase64:
        att.dataBase64 && att.dataBase64.length < 120000 ? att.dataBase64 : undefined,
    })),
  }));
}

export function loadLocalChatConversations(userId?: string): ChatConversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getLocalStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((c) => c && typeof c.id === 'string' && Array.isArray(c.messages))
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0).getTime() -
          new Date(a.updatedAt || a.createdAt || 0).getTime()
      );
  } catch (err) {
    console.warn('Failed to load local chat conversations:', err);
    return [];
  }
}

export function saveLocalChatConversation(
  conversation: ChatConversation,
  userId?: string
): ChatConversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = loadLocalChatConversations(userId);
    const sanitizedConv: ChatConversation = {
      ...conversation,
      messages: sanitizeMessagesForStorage(conversation.messages),
    };
    const filtered = existing.filter((c) => c.id !== conversation.id);
    const updated = [sanitizedConv, ...filtered].slice(0, 50);
    localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save local chat conversation:', err);
    return [];
  }
}

export function deleteLocalChatConversation(
  convId: string,
  userId?: string
): ChatConversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = loadLocalChatConversations(userId);
    const updated = existing.filter((c) => c.id !== convId);
    localStorage.setItem(getLocalStorageKey(userId), JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to delete local chat conversation:', err);
    return [];
  }
}

export function getLocalChatConversationById(
  convId: string,
  userId?: string
): ChatConversation | null {
  if (!convId) return null;
  const all = loadLocalChatConversations(userId);
  return all.find((c) => c.id === convId) || null;
}

/**
 * Reconstructs a ChatConversation from a Firestore ConversationDocument if local message
 * history is not present on this device.
 */
export function buildConversationFromFirestoreDoc(
  docItem: ConversationDocument
): ChatConversation {
  const convId = docItem.id || createUniqueConversationId();
  const createdTime = docItem.createdAt
    ? new Date(docItem.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const reconstructedMessages: ChatMessage[] = [];
  if (docItem.title) {
    reconstructedMessages.push({
      id: `usr_${convId}_1`,
      sender: 'user',
      text: docItem.title,
      timestamp: createdTime,
      conversationId: convId,
    });
  }
  if (docItem.subtitle) {
    reconstructedMessages.push({
      id: `bot_${convId}_1`,
      sender: 'assistant',
      text: docItem.subtitle,
      timestamp: createdTime,
      isGrounded: true,
      conversationId: convId,
    });
  }

  return {
    id: convId,
    title: docItem.title || 'Saved Conversation',
    subtitle: docItem.subtitle || '',
    language: (docItem.language as LanguageCode) || 'ur',
    category: docItem.category || 'AI Assistant',
    createdAt: docItem.createdAt || new Date().toISOString(),
    updatedAt: docItem.createdAt || new Date().toISOString(),
    messages: reconstructedMessages,
  };
}

export async function syncUserProfileToFirestore(userId: string, profile: Partial<UserProfileData>): Promise<void> {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    const existing = await getDoc(userRef);
    const nowIso = new Date().toISOString();

    const payload: Record<string, any> = {
      email: profile.email || '',
      name: profile.name || 'User',
      provider: profile.provider || 'email',
      updatedAt: nowIso,
    };

    if (profile.avatar) payload.avatar = profile.avatar;
    if (typeof profile.emailVerified === 'boolean') payload.emailVerified = profile.emailVerified;

    if (!existing.exists()) {
      payload.createdAt = profile.createdAt || nowIso;
      await setDoc(userRef, payload);
    } else {
      await setDoc(userRef, payload, { merge: true });
    }
  } catch (err) {
    console.warn('Firestore user profile sync error:', err);
  }
}

export async function saveUserConversation(
  conv: ConversationDocument,
  customConvId?: string
): Promise<string | null> {
  if (!conv.userId) return null;
  try {
    const safeCustomId =
      customConvId && /^[a-zA-Z0-9_-]{1,128}$/.test(customConvId) ? customConvId : undefined;
    const convId =
      safeCustomId || 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const convRef = doc(db, 'conversations', convId);
    const data = {
      userId: conv.userId,
      title: (conv.title || 'New Conversation').substring(0, 500),
      category: (conv.category || 'general').substring(0, 100),
      language: (conv.language || 'ur').substring(0, 50),
      subtitle: (conv.subtitle || '').substring(0, 1000),
      type: (conv.type || 'chat').substring(0, 50),
      module: (conv.module || 'assistant').substring(0, 100),
      targetPage: (conv.targetPage || 'chat').substring(0, 50),
      createdAt: conv.createdAt || new Date().toISOString(),
    };
    await setDoc(convRef, data);
    return convId;
  } catch (err) {
    console.warn('Error saving conversation to Firestore:', err);
    return null;
  }
}

export async function getUserConversations(userId: string): Promise<ConversationDocument[]> {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'conversations'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const list: ConversationDocument[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as ConversationDocument) });
    });
    return list.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  } catch (err) {
    console.warn('Error fetching conversations from Firestore:', err);
    return [];
  }
}

export async function deleteUserConversation(convId: string): Promise<boolean> {
  if (!convId) return false;
  try {
    await deleteDoc(doc(db, 'conversations', convId));
    return true;
  } catch (err) {
    console.warn('Error deleting conversation from Firestore:', err);
    return false;
  }
}

export interface FeatureHistoryItem {
  id: string;
  module: 'chat' | 'teacher' | 'student' | 'farmer' | 'medical' | 'legal' | 'government' | 'tools';
  title: string;
  subtitle?: string;
  query: string;
  resultText?: string;
  subject?: string;
  topic?: string;
  crop?: string;
  language: string;
  createdAt: string;
  updatedAt?: string;
}

const FEATURE_STORAGE_KEY_PREFIX = 'paklingo_feature_history_v1_';

export function getFeatureHistoryKey(module: string, userId?: string): string {
  return `${FEATURE_STORAGE_KEY_PREFIX}${module}_${userId || 'guest'}`;
}

export function loadFeatureHistory(module: string, userId?: string): FeatureHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getFeatureHistoryKey(module, userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  } catch (e) {
    console.warn(`Failed to load history for ${module}:`, e);
    return [];
  }
}

export function saveFeatureHistoryItem(
  module: string,
  item: Omit<FeatureHistoryItem, 'id' | 'module' | 'createdAt'> & { id?: string; createdAt?: string },
  userId?: string
): FeatureHistoryItem {
  if (typeof window === 'undefined') {
    return {
      ...item,
      id: item.id || `hist_${Date.now()}`,
      module: module as any,
      createdAt: item.createdAt || new Date().toISOString(),
    };
  }
  try {
    const existing = loadFeatureHistory(module, userId);
    const id = item.id || `hist_${module}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullItem: FeatureHistoryItem = {
      ...item,
      id,
      module: module as any,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const filtered = existing.filter((x) => x.id !== id && x.query !== item.query);
    const updated = [fullItem, ...filtered].slice(0, 40);
    localStorage.setItem(getFeatureHistoryKey(module, userId), JSON.stringify(updated));

    // Mirror to Firestore if user is authenticated
    if (userId) {
      saveUserConversation(
        {
          userId,
          title: item.title,
          subtitle: item.subtitle || item.query.slice(0, 120),
          category: module,
          language: item.language,
          module,
          targetPage: module,
          createdAt: fullItem.createdAt,
        },
        id
      ).catch(() => {});
    }

    return fullItem;
  } catch (e) {
    console.warn(`Failed to save history for ${module}:`, e);
    return {
      ...item,
      id: item.id || `hist_${Date.now()}`,
      module: module as any,
      createdAt: item.createdAt || new Date().toISOString(),
    };
  }
}

export function deleteFeatureHistoryItem(module: string, id: string, userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadFeatureHistory(module, userId);
    const updated = existing.filter((x) => x.id !== id);
    localStorage.setItem(getFeatureHistoryKey(module, userId), JSON.stringify(updated));
    if (userId) {
      deleteUserConversation(id).catch(() => {});
    }
  } catch (e) {
    console.warn(`Failed to delete history item for ${module}:`, e);
  }
}

export function loadAllFeaturesHistory(userId?: string): FeatureHistoryItem[] {
  const modules = ['chat', 'teacher', 'student', 'farmer', 'medical', 'legal', 'government'];
  let all: FeatureHistoryItem[] = [];
  for (const m of modules) {
    all = all.concat(loadFeatureHistory(m, userId));
  }
  // Also incorporate any local chat sessions
  const localChats = loadLocalChatConversations(userId);
  for (const c of localChats) {
    if (!all.some((x) => x.id === c.id)) {
      const lastMsg = c.messages?.[c.messages.length - 1]?.text || c.subtitle || '';
      all.push({
        id: c.id,
        module: 'chat',
        title: c.title,
        subtitle: c.subtitle || lastMsg.slice(0, 100),
        query: c.title,
        resultText: lastMsg,
        language: c.language,
        createdAt: c.createdAt || new Date().toISOString(),
        updatedAt: c.updatedAt,
      });
    }
  }
  return all.sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}


