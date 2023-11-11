import ioClient from "socket.io-client";
import { D as DEV } from "./prod-ssr.js";
const dev = DEV;
const ENDPOINT = "http://192.168.2.103:3000";
const socket = ioClient(`${ENDPOINT}/server`, {
  secure: !dev
});
const io = socket;
const customIo = (path) => ioClient(path, {
  secure: !dev
});
const socketEndpoint = ENDPOINT;
export {
  customIo as c,
  dev as d,
  io as i,
  socketEndpoint as s
};
