import { set, ref, onValue, get, child, update } from "firebase/database";
import "./firebase.client.js";
import { b as adminDatabase } from "./firebase.admin.js";
const rawAdminDatabaseActions = {
  /**
    * @example
    * // `path` param should not start with `/`
    * set('users/${userId}', { id: userId, name: userName });
    */
  set: async (path, value) => {
    return await set(ref(adminDatabase, path), value);
  },
  /**
    * There is no reason to use this for now
    */
  listen: async (path) => {
    const reference = ref(adminDatabase, path);
    let data;
    onValue(reference, (snapshot) => {
      data = snapshot.val();
    });
    return data;
  },
  get: async (path) => {
    const adminDatabaseReference = ref(adminDatabase);
    const data = await get(child(adminDatabaseReference, path)).then((snapshot) => {
      return snapshot.exists() ? snapshot.val() : null;
    }).catch((error) => {
      console.error(error);
    });
    return data;
  },
  // https://firebase.google.com/docs/database/web/read-and-write#update_specific_fields
  update: async (updates) => {
    return update(ref(adminDatabase), updates);
  },
  db: adminDatabase
};
const xpActions = {
  get: async (database2, userId) => {
    const databaseReference = ref(database2);
    const data = await get(child(databaseReference, `xp/${userId}`)).then((snapshot) => {
      return snapshot.exists() ? snapshot.val() : null;
    }).catch((error) => {
      console.error(error);
    });
    return data;
  },
  set: async (database2, userId, value) => {
    return await set(ref(database2, `xp/${userId}`), value);
  },
  userXpRecordsExists: async (database2, userId) => {
    const databaseReference = ref(database2);
    const data = await get(child(databaseReference, `xp/${userId}`)).then((snapshot) => {
      return snapshot.exists() ? snapshot.val() : null;
    }).catch((error) => {
      console.error(error);
    });
    return data !== null;
  }
};
const usernameActions = {
  get: async (database2, userId) => {
    const databaseReference = ref(database2);
    const data = await get(child(databaseReference, `username/${userId}`)).then((snapshot) => {
      return snapshot.exists() ? snapshot.val() : null;
    }).catch((error) => {
      console.error(error);
    });
    return data;
  },
  set: async (database2, userId, value) => {
    return await set(ref(database2, `username/${userId}`), value);
  },
  userUsernameRecordsExists: async (database2, userId) => {
    const databaseReference = ref(database2);
    const data = await get(child(databaseReference, `username/${userId}`)).then((snapshot) => {
      return snapshot.exists() ? snapshot.val() : null;
    }).catch((error) => {
      console.error(error);
    });
    return data !== null;
  }
};
export {
  rawAdminDatabaseActions as r,
  usernameActions as u,
  xpActions as x
};
