import { a as auth, p as provider } from "./firebase.client.js";
import { fetchSignInMethodsForEmail, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updateEmail, updatePassword } from "firebase/auth";
import { w as writable } from "./index2.js";
import "cookie";
const authStore = writable({
  isLoading: true,
  currentUser: null,
  currentUsername: null
});
const authHandlers = {
  userExists: async (email) => {
    if (!email)
      return false;
    return fetchSignInMethodsForEmail(auth, email).then((signInMethods) => {
      return signInMethods && signInMethods.length > 0;
    }).catch(() => false);
  },
  loginWithGoogle: async (ast, fetch) => {
    return signInWithPopup(auth, provider).then(async (result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      if (ast && fetch) {
        fetch("/api/auth/updateUser", {
          method: "POST",
          body: JSON.stringify({
            ast,
            idToken: await user.getIdToken()
          }),
          headers: {
            "Content-Type": "application/json"
          }
        });
      }
      return {
        user,
        token
      };
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      return {
        email,
        credential,
        errorCode,
        errorMessage
      };
    });
  },
  login: async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  },
  signup: async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  },
  logout: async () => {
    await signOut(auth);
  },
  resetPassword: async (email) => {
    await sendPasswordResetEmail(auth, email);
  },
  updateEmail: async (user, email) => {
    await updateEmail(user, email);
  },
  updatePassword: async (user, password) => {
    await updatePassword(user, password);
  }
};
export {
  authStore as a,
  authHandlers as b
};
