import firebaseAdmin from 'firebase-admin';
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

export const firebase: ReturnType<typeof makeApp> = building ? undefined : makeApp() as any;
export const adminAuth: ReturnType<typeof firebaseAdmin.auth> = building ? undefined : firebaseAdmin.auth(firebase) as any;
export const adminDatabase: ReturnType<typeof firebaseAdmin.database> = building ? undefined : firebaseAdmin.database(firebase) as any;

