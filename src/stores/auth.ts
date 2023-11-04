import { browser } from "$app/environment";
import { auth, provider } from "$lib/firebase/firebase.client";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, GoogleAuthProvider, OAuthCredential, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateEmail, updatePassword, type User, type UserCredential } from "firebase/auth";
import { writable, type Writable } from "svelte/store";
import cookie from 'cookie';

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

type LoginWithGoogleReturnType = Promise<
  { user: User; token: string | undefined }
  | { email: any; credential: OAuthCredential | null; errorCode: string; errorMessage: string }
>;

export const authHandlers = {
  userExists: async (email: string): Promise<boolean> => {
    if (!email) return false;
    return fetchSignInMethodsForEmail(auth, email)
      .then((signInMethods) => {
        return signInMethods && signInMethods.length > 0;
      })
      .catch(() => false);
  },

  loginWithGoogle: async (): LoginWithGoogleReturnType => {
    return signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential!.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)

        return {
          user,
          token,
        };
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);

        return {
          email,
          credential,
          errorCode,
          errorMessage,
        }
      });
  },



  login: async (email: string, password: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  signup: async (email: string, password: string): Promise<UserCredential> => {
    return createUserWithEmailAndPassword(auth, email, password);
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

if (browser) {
  auth.onIdTokenChanged(async (newUser) => {
    const currentToken = cookie.parse(document.cookie)?.token;
    const token = await newUser?.getIdToken();
    document.cookie = cookie.serialize('fbs', token ?? '', {
      path: '/',
      maxAge: token ? undefined : 0,
    });
    authStore.update((curr) => {
      return { ...curr, isLoading: false, currentUser: newUser };
    });

    // The reload would be needed if we were to use signInWithRedirect
    /* if (!currentToken
      && token
      && document.location.pathname !== '/create/account')
      document.location.reload(); */
  });

  // Refresh user token every 10 minutes
  setInterval(async () => {
    await auth?.currentUser?.getIdToken();
  }, 10 * 60 * 1000);
}

