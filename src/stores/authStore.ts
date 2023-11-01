import { auth } from "$lib/firebase/firebase.client";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateEmail, updatePassword, type User, type UserCredential } from "firebase/auth";
import { writable, type Writable } from "svelte/store";

export const authStore = writable<{
  isLoading: boolean;
  currentUser: User | null;
}>({
  isLoading: true,
  currentUser: null
} as {
  isLoading: boolean;
  currentUser: User | null;
}) as Writable<{
  isLoading: boolean;
  currentUser: User | null;
}>;

export const authHandlers = {
  login: async (email: string, password: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  signup: async (email: string, password: string): Promise<void> => {
    await createUserWithEmailAndPassword(auth, email, password);
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  resetPassword: async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  },

  updateEmail: async (user: User, email: string): Promise<void> => {
    await updateEmail(user, email);
  },

  updatePassword: async (user: User, password: string): Promise<void> => {
    await updatePassword(user, password);
  },
};

