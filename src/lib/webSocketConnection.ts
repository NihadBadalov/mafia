import ioClient from 'socket.io-client';
const ENDPOINT = 'http://192.168.2.103:3000';
import { dev } from '$app/environment';

const socket = ioClient(`${ENDPOINT}/server`, {
  secure: !dev,
});

export const io = socket;
export const customIo = (path: string) => ioClient(path, {
  secure: !dev,
});
export const socketEndpoint = ENDPOINT;
