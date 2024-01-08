import { type Socket, type Server } from 'socket.io';
import { makeHandler } from '../comm/helper';
import db from '../db';
import dbQuery from '../db-query';
import { listRulePreset, summaryRulePreset } from '../comm/form-checker';

export default {
  rules: {
    'sample.add': {
      field1: { type: 'string' },
      field2: { type: 'string' },
    },
    'sample.update': {
      items: {
        type: 'array',
        children: {
          no: { type: 'number' },
          field1: { type: 'string', required: false },
          field2: { type: 'string', required: false },
        },
      },
    },
    'sample.delete': {
      items: {
        type: 'array',
        children: {
          no: { type: 'number' },
        },
      },
    },
    'sample.get': {
      no: { type: 'number' },
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
      const query = dbQuery.sample.addSample(_payload);
      const item = await db.getInstance().query(query);
      response({
        result: 'success',
        code: 200,
        item,
      });
    });
    makeHandler(socket, 'sample.update', async (_payload, response) => {
      const transaction = await db.getInstance().beginTransaction();
      try {
        const tasks = _payload.items.map(async (item: Record<string, string | number>) => {
          await transaction.query(dbQuery.sample.updateSample(item));
        });
        await Promise.all(tasks);
        await transaction.commit();
        response({
          result: 'success',
          code: 200,
        });
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        response(error);
      }
    });
    makeHandler(socket, 'sample.delete', async (_payload, response) => {
      const transaction = await db.getInstance().beginTransaction();
      try {
        const tasks = _payload.items.map(async (item: Record<string, string | number>) => {
          await transaction.query(dbQuery.sample.updateSample({
            ...item,
            disable: 1,
          }));
        });
        await Promise.all(tasks);
        await transaction.commit();
        response({
          result: 'success',
          code: 200,
        });
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        response(error);
      }
    });
    makeHandler(socket, 'sample.get', async (_payload, response) => {
      const query = dbQuery.sample.getSampleList({
        page: 1,
        itemsPerPage: 0,
        sortBy: [],
        sortDesc: [],
        filters: [
          { condition: 'eq', column: 'no', value: _payload.no },
        ],
      });
      const item = await db.getInstance().query(query);
      response({
        result: 'success',
        code: 200,
        item,
      });
    });
    makeHandler(socket, 'sample.summary.get', async (_payload, response) => {
      const query = dbQuery.sample.summarySample({
        ..._payload,
        filters: _payload.filter.length === 0
          ? [{ condition: 'eq', column: 'disable', value: 0 }]
          : [..._payload.filters, { where: 'and', condition: 'eq', column: 'disable', value: 0 }],
      });
      const data = await db.getInstance().query(query);
      response({
        result: 'success',
        code: 200,
        data,
      });
    });
    makeHandler(socket, 'sample.list.get', async (_payload, response) => {
      const query = dbQuery.sample.getSampleList({
        ..._payload,
        filters: _payload.filter.length === 0
          ? [{ condition: 'eq', column: 'disable', value: 0 }]
          : [..._payload.filters, { where: 'and', condition: 'eq', column: 'disable', value: 0 }],
      });
      const items = await db.getInstance().query(query);
      response({
        result: 'success',
        code: 200,
        items,
      });
    });
  },
};
