import pkg from 'firebase-admin';
const { credential, auth, database, initializeApp } = pkg;
import { building } from "$app/environment";
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

export const firebase = building ? undefined : makeApp();
export const adminAuth = building ? undefined : auth(firebase);
export const adminDatabase = building ? undefined : database(firebase);

