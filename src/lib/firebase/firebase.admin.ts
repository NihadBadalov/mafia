import * as firebaseAdmin from 'firebase-admin';
import { building } from "$app/environment";
import { getApps } from "firebase-admin/app";

const firebaseAdminConfig = {
  credential: firebaseAdmin.credential.cert({
    privateKey: import.meta.env.VITE_SERVICEACCOUNTPRIVATEKEY.replace(/\\n/gm, "\n"),
    clientEmail: import.meta.env.VITE_SERVICEACCOUNTEMAIL,
    projectId: import.meta.env.VITE_PROJECTID,
  }),
  databaseURL: import.meta.env.VITE_DATABASEURL,
};

function makeApp() {
  return getApps().length
    ? getApps()[0]!
    : firebaseAdmin.initializeApp(firebaseAdminConfig);
}

export const firebase = building ? undefined : makeApp();
export const adminAuth = building ? undefined : firebaseAdmin.auth(firebase);
export const adminDatabase = building ? undefined : firebaseAdmin.database(firebase);

