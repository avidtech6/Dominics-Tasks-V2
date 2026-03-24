import { Message, Attachment } from '../types';
import { getDbService, getSecureDbService, uploadChatAttachment } from '../services/firebaseServices';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, getDocs, serverTimestamp, where
} from 'firebase/firestore';
import { ChatRepository } from './ChatRepository';

/**
 * Firebase-backed ChatRepository
 * Implements the interface with Firebase-specific logic
 */
export class FirebaseChatRepository implements ChatRepository {
  private familyId?: string;

  setContext(familyId: string) {
    this.familyId = familyId;
  }

  async addMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<string> {
    if (!this.familyId) {
      throw new Error('Family context required');
    }

    const db = getSecureDbService();
    if (!db) {
      throw new Error('Authentication required for Firebase operations');
    }

    const messageData = {
      ...message,
      timestamp: new Date(), // In real implementation, this would use serverTimestamp()
    };

    const docRef = await addDoc(
      collection(db, `families/${this.familyId}/messages`),
      messageData
    );

    return docRef.id;
  }

  async updateMessage(messageId: string, updates: Partial<Message>): Promise<void> {
    if (!this.familyId) {
      throw new Error('Family context required');
    }

    const db = getSecureDbService();
    if (!db) {
      throw new Error('Authentication required for Firebase operations');
    }

    await updateDoc(
      doc(db, `families/${this.familyId}/messages/${messageId}`),
      updates
    );
  }

  async deleteMessage(messageId: string): Promise<void> {
    if (!this.familyId) {
      throw new Error('Family context required');
    }

    const db = getSecureDbService();
    if (!db) {
      throw new Error('Authentication required for Firebase operations');
    }

    await deleteDoc(
      doc(db, `families/${this.familyId}/messages/${messageId}`)
    );
  }

  async getMessage(messageId: string): Promise<Message | null> {
    if (!this.familyId) {
      throw new Error('Family context required');
    }

    const db = getSecureDbService();
    if (!db) {
      throw new Error('Authentication required for Firebase operations');
    }

    const messageDoc = await getDocs(
      query(collection(db, `families/${this.familyId}/messages`), where('id', '==', messageId))
    );

    if (messageDoc.empty) {
      return null;
    }

    const doc = messageDoc.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    } as Message;
  }

  subscribeToMessages(callback: (messages: Message[]) => void): () => void {
    if (!this.familyId) {
      throw new Error('Family context required');
    }

    const db = getSecureDbService();
    if (!db) {
      throw new Error('Authentication required for Firebase operations');
    }

    const q = query(
      collection(db, `families/${this.familyId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        } as Message);
      });
      callback(messages);
    });

    return unsubscribe;
  }

  async uploadAttachment(file: File, context: string, messageId: string, onProgress?: (progress: number) => void): Promise<{ url: string; fileType: string }> {
    if (!this.familyId) {
      throw new Error('Family context required');
    }

    const db = getSecureDbService();
    if (!db) {
      throw new Error('Authentication required for Firebase operations');
    }

    return uploadChatAttachment(file, `families/${this.familyId}/messages/${messageId}`, onProgress ? onProgress.toString() : '');
  }

  async getMessages(limit?: number): Promise<Message[]> {
    if (!this.familyId) {
      throw new Error('Family context required');
    }

    const db = getSecureDbService();
    if (!db) {
      throw new Error('Authentication required for Firebase operations');
    }

    let q = query(
      collection(db, `families/${this.familyId}/messages`),
      orderBy('timestamp', 'desc')
    );

    if (limit) {
      // Note: Firestore doesn't support native limit in query, this would need to be handled client-side
      // or by using a more complex query structure
    }

    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as Message);
    });

    return messages;
  }

  async getMessagesByDateRange(startDate: Date, endDate: Date): Promise<Message[]> {
    if (!this.familyId) {
      throw new Error('Family context required');
    }

    const db = getSecureDbService();
    if (!db) {
      throw new Error('Authentication required for Firebase operations');
    }

    const q = query(
      collection(db, `families/${this.familyId}/messages`),
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as Message);
    });

    return messages;
  }
}