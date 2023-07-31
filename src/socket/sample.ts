import { type Socket, type Server } from 'socket.io';
import { makeHandler } from '../comm/helper';
import { Sample } from '../db/sample';
import { getRulePreset, listRulePreset, summaryRulePreset, updateRulePreset } from '../comm/form-checker';

export default {
  rules: {
    'sample.add': {
      items: {
        type: 'array',
        children: {
          name: { type: 'string', minLen: 1, maxLen: 128 },
          phone: { type: 'string' },
        },
      },
    },
    'sample.update': {
      ...updateRulePreset,
      name: { type: 'string', minLen: 1, maxLen: 128, required: false },
      phone: { type: 'string', required: false },
    },
    'sample.delete': {
      ...updateRulePreset,
    },
    'sample.get': {
      ...getRulePreset,
    },
    'sample.summary.get': {
      ...summaryRulePreset,
    },
    'sample.list.get': {
      ...listRulePreset,
    },
  },
  handler: async (io: Server, socket: Socket): Promise<void> => {
    makeHandler(socket, 'sample.add', async (_payload, response) => {
      const items = await Sample.add(_payload.items);
      response({
        result: 'success',
        code: 200,
        items,
      });
    });
    makeHandler(socket, 'sample.update', async (_payload, response) => {
      const data = await Sample.update(_payload);
      response({
        result: 'success',
        code: 200,
        data,
      });
    });
    makeHandler(socket, 'sample.delete', async (_payload, response) => {
      const data = await Sample.delete(_payload._ids);
      response({
        result: 'success',
        code: 200,
        data,
      });
    });
    makeHandler(socket, 'sample.get', async (_payload, response) => {
      const item = await Sample.get(_payload);
      response({
        result: 'success',
        code: 200,
        item,
      });
    });
    makeHandler(socket, 'sample.summary.get', async (_payload, response) => {
      const data = await Sample.getSummary(_payload);
      response({
        result: 'success',
        code: 200,
        data,
      });
    });
    makeHandler(socket, 'sample.list.get', async (_payload, response) => {
      const items = await Sample.getList(_payload);
      response({
        result: 'success',
        code: 200,
        items,
      });
    });
  },
};
