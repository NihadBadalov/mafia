import pkg from "firebase-admin";
import { b as building } from "./environment.js";
import { getApps } from "firebase-admin/app";
const { credential, auth, database, initializeApp } = pkg;
const firebaseAdminConfig = {
  credential: credential.cert({
    privateKey: "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDaD9sVNOfmeXg+\\ngP8v88xQV2C9Gs6ROi5c0CSDtQbZbQrTWP+ESsvKlH1GaTkRmQvfmpe7Iw7bLQKZ\\nkp5g9iWq6zthUKdv1k4ONc62byAQje0xYX1xB6fE3bZCm/b0wsnPA9DdR9kmPi42\\nY820T8D34lJ+xG86zhTfhFJNGWZw3Gw33eLSTd5Zvdms9U+95ZuXbYchnPg8KMHH\\nQg6va9AMnMGUorQoREQUkXfHSREhSxMwsuwG7ydoD2P4f06NCL9ZGy5A9VlcP4RW\\n1xvFDQKBtKMujgWs01Jur/Uvm7faqLbK1BGK8LeZWF6w2zsA6lyQbn91BfdEZpcH\\n/lGFffQbAgMBAAECggEAHWYA19mToCdlNiwG+2yHcZduI+CO09Z/tKSdH6KSw1Jn\\noLnBbRD2a5/cSddaycwT5Tf+18xwrszhKloxfwoAZwwiq8qHYFUInfLUJRVTQdgY\\nj81Ab7IkBK8NaOqE/1eZhI7TpFmQ5Y6BhXSsIXCVJ/Y7v/p0sn1hJAc/X0Sa4oEd\\nWilfGYX6IELTtUlg+hgtNJhQY9gvG3GWqjnWKo8pNCWthg7zlUg5prZqyAcEVes/\\n8oLBM3l7TH6u3bOl/ftAdxw96DDD68Wsqgo16t1rTDQaOWmWUsrvx0OdpPfkykUA\\nKLAoH4e18Z7v72ys6S5NXmQjUzWr8yaVz9G/djK0kQKBgQD0ELoCRHIA70drKeAa\\nQFLlb76r0ZETyKTHw61B1dntr4XpJz7b8Po8U1hda/JnCkWjklIrEcO/cq4QNG1E\\nAWrJI+h1WuQdXQRrBq8zt0sQemqenDxO+HeFgijcY8IyNziyKboqqJtzLZ2kqJw6\\nvG6qYBdVLjeh06yUN7rv48XECwKBgQDkuZyiIfUVHI2GXm2dlJpd0eA6ltPuMoGy\\n8jJg6QDns04M6+B45i6UT0Bys0Bm3z5nHylg1Gi8dkHWI0sOc/8DBLCKnVodg+Zw\\nSXO33iS9/NFi9+/CmhJVtFmjpuCzOW18JEWdW2ubZCf4vGr5UWKLj5PyRjKX/7Kq\\nyw+GMtEKMQKBgQDixzP+7Vg81Bi5U2SfH8um0qkJf6VdC59I2uH+/VUMjH5SARxg\\nQ05QhWTjEW1gHuRMM6ZTzKLlHgrslbo9aU+u68WQXc7+FbMIO2LKG/MMsaKmFCfZ\\nfPeZvzJ2bd9Ax5zPtwP7pUUjxWvoVp8r2HC/sJ+dj18z57pA0nPJeQwGtwKBgHMI\\nyzdb/shUaPV4jobfk1e2U6ED9KjrLAIU/7Nv3K2rp4imJWqI0kpzJYXKk4xpoRf6\\nOzRhACAxFeGeNISbYFljRWshwo3vpbk5qAKErlQDUEgHTMXB+ZCzORYuuvpI2sDB\\n+WUv8onfsJ7QHLkx7m8kkhMarR13U6PEpxUmf64xAoGAeYzruwUZ5DK0lvN7Sb9M\\nCaQo8eDMXBJ4PSGEIAbNZJcRw3fVkEUmOL73cchovG/Y6JRysfgPdBVQlnkhu+aJ\\n3hYbyNUoaPr5j43PUcyqZCn2ehwyNl19l70iQuTrxw++++5KfRXktNFBTUdQq8+/\\nDWY2hb6h+4CpvaiQdoFn8u0=\\n-----END PRIVATE KEY-----\\n".replace(/\\n/gm, "\n"),
    clientEmail: "firebase-adminsdk-h3g2o@mafia-f4f6d.iam.gserviceaccount.com",
    projectId: "mafia-f4f6d"
  }),
  databaseURL: "https://mafia-f4f6d-default-rtdb.europe-west1.firebasedatabase.app"
};
function makeApp() {
  return getApps().length ? getApps()[0] : initializeApp(firebaseAdminConfig);
}
const firebase = building ? void 0 : makeApp();
const adminAuth = building ? void 0 : auth(firebase);
const adminDatabase = building ? void 0 : database(firebase);
export {
  adminAuth as a,
  adminDatabase as b
};
