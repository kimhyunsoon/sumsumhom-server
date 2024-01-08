import { type Socket, type Server } from 'socket.io';
import { type IHandler } from '../comm';
import users from './users';
import light from './light';

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export default {
  rules: {
    ...users.rules,
    ...light.rules,
  },
  handler(socket: Socket, io: Server) {
    void users.handler(io, socket);
    void light.handler(io, socket);
  },
} as IHandler;
