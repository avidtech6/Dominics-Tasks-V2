import { User } from '../types';

/**
 * Repository interface for authentication operations
 * Abstracts Firebase authentication behind clean interfaces
 */
export interface AuthRepository {
  getCurrentUser(): Promise<User | null>;
  signInWithEmailAndPassword(email: string, password: string): Promise<User | null>;
  createUserWithEmailAndPassword(email: string, password: string): Promise<User | null>;
  signOut(): Promise<void>;
  sendPasswordResetEmail(email: string): Promise<void>;
  sendEmailVerification(): Promise<void>;
  reloadUser(): Promise<void>;
  updateProfile(displayName: string, photoURL: string): Promise<void>;
  updateEmail(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  deleteAccount(): Promise<void>;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}