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

