import { child, get, onValue, ref, set, update } from "firebase/database";
import { database } from "./firebase.client";

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
};

