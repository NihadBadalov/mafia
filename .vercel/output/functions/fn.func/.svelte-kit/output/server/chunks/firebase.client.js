import { getApps, initializeApp, getApp, deleteApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyDEh-HRHq30eU4x__iqSty7JU7MEIjR2HY",
  authDomain: "mafia-f4f6d.firebaseapp.com",
  projectId: "mafia-f4f6d",
  storageBucket: "mafia-f4f6d.appspot.com",
  messagingSenderId: "894408291174",
  appId: "1:894408291174:web:d7a277ead8b80495100ea7",
  measurementId: "G-RJ7JP46GXW",
  databaseURL: {}.DATABASEURL
};
let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
  deleteApp(firebaseApp);
  firebaseApp = initializeApp(firebaseConfig);
}
const auth = getAuth(firebaseApp);
getDatabase();
const provider = new GoogleAuthProvider();
export {
  auth as a,
  provider as p
};
