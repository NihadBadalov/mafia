import { Database, child, get, onValue, ref, set, update } from "firebase/database";
import { database } from "./firebase.client";
import { adminDatabase } from "./firebase.admin";

export const rawDatabaseActions = {
  /**
    * @example
    * // `path` param should not start with `/`
    * set('users/${userId}', { id: userId, name: userName });
    */
  set: async (path: string, value: any): Promise<void> => {
    return set(ref(database, path), value);
  },

  /**
    * There is no reason to use this for now
    */
  listen: async (path: string): Promise<any> => {
    const reference = ref(database, path);
    let data: any;
    onValue(reference, (snapshot) => {
      data = snapshot.val();
    });
    return data;
  },

  get: async (path: string): Promise<any> => {
    const databaseReference = ref(database);
    const data = await get(child(databaseReference, path))
      .then((snapshot) => {
        return snapshot.exists() ? snapshot.val() : null;
      })
      .catch((error) => {
        console.error(error);
      });
    return data;
  },

  // https://firebase.google.com/docs/database/web/read-and-write#update_specific_fields
  update: async (updates: { [key: string]: any }): Promise<void> => {
    return update(ref(database), updates);
  },


  db: database,
};


export const rawAdminDatabaseActions = {
  /**
    * @example
    * // `path` param should not start with `/`
    * set('users/${userId}', { id: userId, name: userName });
    */
  set: async (path: string, value: any): Promise<void> => {
    return await set(ref(adminDatabase as any, path), value);
  },

  /**
    * There is no reason to use this for now
    */
  listen: async (path: string): Promise<any> => {
    const reference = ref(adminDatabase as any, path);
    let data: any;
    onValue(reference, (snapshot) => {
      data = snapshot.val();
    });
    return data;
  },

  get: async (path: string): Promise<any> => {
    const adminDatabaseReference = ref(adminDatabase as any);
    const data = await get(child(adminDatabaseReference, path))
      .then((snapshot) => {
        return snapshot.exists() ? snapshot.val() : null;
      })
      .catch((error) => {
        console.error(error);
      });
    return data;
  },

  // https://firebase.google.com/docs/database/web/read-and-write#update_specific_fields
  update: async (updates: { [key: string]: any }): Promise<void> => {
    return update(ref(adminDatabase as any), updates);
  },

  db: adminDatabase,
};


type FirebaseDb = typeof database | typeof adminDatabase;
export const xpActions = {
  get: async (database: FirebaseDb, userId: string) => {
    const databaseReference = ref(database as any);
    const data = await get(child(databaseReference, `xp/${userId}`))
      .then((snapshot) => {
        return snapshot.exists() ? snapshot.val() : null;
      })
      .catch((error) => {
        console.error(error);
      });
    return data;
  },

  set: async (database: FirebaseDb, userId: string, value: number): Promise<void> => {
    return await set(ref(database as any, `xp/${userId}`), value);
  },

  userXpRecordsExists: async (database: FirebaseDb, userId: string): Promise<boolean> => {
    const databaseReference = ref(database as any);
    const data = await get(child(databaseReference, `xp/${userId}`))
      .then((snapshot) => {
        return snapshot.exists() ? snapshot.val() : null;
      })
      .catch((error) => {
        console.error(error);
      });
    return data !== null;
  },
};

export const usernameActions = {
  get: async (database: FirebaseDb, userId: string) => {
    const databaseReference = ref(database as any);
    const data = await get(child(databaseReference, `username/${userId}`))
      .then((snapshot) => {
        return snapshot.exists() ? snapshot.val() : null;
      })
      .catch((error) => {
        console.error(error);
      });
    return data;
  },

  set: async (database: FirebaseDb, userId: string, value: string): Promise<void> => {
    return await set(ref(database as any, `username/${userId}`), value);
  },

  userUsernameRecordsExists: async (database: FirebaseDb, userId: string): Promise<boolean> => {
    const databaseReference = ref(database as any);
    const data = await get(child(databaseReference, `username/${userId}`))
      .then((snapshot) => {
        return snapshot.exists() ? snapshot.val() : null;
      })
      .catch((error) => {
        console.error(error);
      });
    return data !== null;
  },
};

