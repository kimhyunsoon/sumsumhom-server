import { type Socket, type Server } from 'socket.io';
import { makeHandler } from '../comm/helper';
import { Error } from '../debug/error';
import cert from '../util/cert';
import group from '../util/group';
import db from '../db';
import dbQuery from '../db-query';

async function checkUser(args: Record<string, string | number | boolean>): Promise<boolean> {
  const { exist, valid, disabled } = await db.getInstance().query(dbQuery.users.checkUser(args));

  if (exist === false) {
    throw Error.makeThrow({
      name: 'NO_USER',
      message: 'No user',
    });
  }

  if (disabled === false) {
    throw Error.makeThrow({
      name: 'DELETED',
      message: 'Deleted user',
    });
  }

  return valid;
}

export default {
  rules: {
    'users.token.get': {
      id: { type: 'string', maxLen: 128 },
      password: { type: 'string', maxLen: 2048 },
    },
    'users.token.verify': {
      token: { type: 'string' },
    },
    'users.signout': {
      _empty: { type: 'boolean', required: false },
    },
  },
  handler: async (io: Server, socket: Socket): Promise<void> => {
    makeHandler(socket, 'users.token.get', async (_payload, resp) => {
      const valid = await checkUser(_payload);

      if (!valid) {
        Error.makeThrow({
          name: 'ACCESS_DENIED',
          message: 'Access denied',
        });
      }

      // 사용자 정보 조회
      const userInfo = await db.getInstance().query(dbQuery.users.getUser(_payload));

      const token = cert.makeToken(userInfo);

      resp({
        result: 'success',
        code: 200,
        data: {
          token,
        },
      });
    });
    makeHandler(socket, 'users.token.verify', async (_payload, resp) => {
      const tokenPayload = cert.verifyToken(_payload.token);

      await checkUser({ id: tokenPayload.id, password: '' });

      // 사용자 정보 조회
      const userInfo = await db.getInstance().query(dbQuery.users.getUser(tokenPayload));

      // 로그인 정보 소켓 저장
      socket.data.info = userInfo;
      // 그룹 추가
      await socket.join(group.userSocketGroup(userInfo.no));

      resp({
        result: 'success',
        code: 200,
        data: {
          userInfo,
        },
      });
    });
    makeHandler(socket, 'users.signout', async (_payload, resp) => {
      const userInfo = socket.data.info;
      // 소켓 그룹에서 삭제
      await socket.leave(group.userSocketGroup(userInfo.no));
      // 로그인 정보 삭제
      socket.data = {};
      resp({
        result: 'success',
        code: 200,
      });
    });
  },
};
