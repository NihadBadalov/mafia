import {
  auth,
  credential,
  initializeApp,
} from "firebase-admin";
import { getApps } from "firebase-admin/app";

const firebaseAdminConfig = {
  credential: credential.cert({
    privateKey: import.meta.env.VITE_SERVICEACCOUNTPRIVATEKEY.replace(/\\n/gm, "\n"),
    clientEmail: import.meta.env.VITE_SERVICEACCOUNTEMAIL,
    projectId: import.meta.env.VITE_PROJECTID,
  }),
  databaseURL: import.meta.env.VITE_DATABASEURL,
};

function makeApp() {
  return getApps().length
    ? getApps()[0]!
    : initializeApp(firebaseAdminConfig);
}

export const firebase = makeApp();
export const adminAuth = auth(firebase);

