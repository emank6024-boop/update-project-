import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

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

export async function saveUserConversation(conv: ConversationDocument): Promise<string | null> {
  if (!conv.userId) return null;
  try {
    const convId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const convRef = doc(db, 'conversations', convId);
    const data = {
      userId: conv.userId,
      title: conv.title.substring(0, 500),
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
    return list;
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
