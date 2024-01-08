import { type Socket, type Server } from 'socket.io';
import { makeHandler } from '../comm/helper';
import { Error } from '../debug/error';
import db from '../db';
import dbQuery from '../db-query';

export default {
  rules: {
    'light.get': {
      _empty: { type: 'boolean', required: false },
    },
    'light.status.update': {
      lightStatus: { type: 'number', allow: [0, 1], required: false },
    },
    'light.settings.update': {
      lightStatusTimes: { type: 'string', required: false },
      lightOnMaxDuration: { type: 'number', min: 1, max: 720, required: false },
    },
  },
  handler: async (io: Server, socket: Socket): Promise<void> => {
    makeHandler(socket, 'light.get', async (_payload, resp) => {
      const data = await db.getInstance().query(dbQuery.settings.getLight(_payload));
      resp({
        result: 'success',
        code: 200,
        data,
      });
    });
    makeHandler(socket, 'light.status.update', async (_payload, resp) => {
      // TODO: 아두이노 통신
      // db 업데이트
      const data = await db.getInstance().query(dbQuery.settings.updateSettings({
        ..._payload,
        ...((_payload.lightStatus != null) && { lightStatusRecentDate: new Date() }),
      }));
      resp({
        result: 'success',
        code: 200,
        data,
      });
    });
    makeHandler(socket, 'light.settings.update', async (_payload, resp) => {
      const data = await db.getInstance().query(dbQuery.settings.updateSettings({
        ..._payload,
      }));
      resp({
        result: 'success',
        code: 200,
        data,
      });
    });
  },
};
