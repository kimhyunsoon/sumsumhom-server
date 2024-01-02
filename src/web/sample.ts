import { Router } from 'express';
import db from '../db';
import dbQuery from '../db-query';
import web from '.';
import logger from '../debug/logger';
import { listRulePreset, summaryRulePreset } from '../comm/form-checker';

const router = Router();

// insert
router.post('/', (request, response) => {
  void (async (): Promise<void> => {
    try {
      web.checkRestKey(request);
      web.checkRestForm({
        field1: { type: 'string' },
        field2: { type: 'string' },
      }, request.body);

      const query = dbQuery.sample.addSample(request.body);
      const item = await db.getInstance().query(query);
      response.json({
        result: 'success',
        code: 200,
        item,
      });
    } catch (error: unknown) {
      logger.error({
        error,
        request: request.baseUrl,
      });
      response.json(error);
    }
  })();
});

// update
router.put('/', (request, response) => {
  void (async (): Promise<void> => {
    try {
      web.checkRestKey(request);
      web.checkRestForm({
        items: {
          type: 'array',
          children: {
            no: { type: 'number' },
            field1: { type: 'string', required: false },
            field2: { type: 'string', required: false },
          },
        },
      }, request.body);

      const transaction = await db.getInstance().beginTransaction();
      const tasks = request.body.items.map(async (item: Record<string, string | number>) => {
        await transaction.query(dbQuery.sample.updateSample(item));
      });
      await Promise.all(tasks);
      await transaction.commit();

      response.json({
        result: 'success',
        code: 200,
      });
    } catch (error: unknown) {
      logger.error({
        error,
        request: request.baseUrl,
      });
      response.json(error);
    }
  })();
});

// delete
router.put('/delete', (request, response) => {
  void (async (): Promise<void> => {
    try {
      web.checkRestKey(request);
      web.checkRestForm({
        items: {
          type: 'array',
          children: {
            no: { type: 'number' },
          },
        },
      }, request.body);

      const transaction = await db.getInstance().beginTransaction();
      const tasks = request.body.items.map(async (item: Record<string, string | number>) => {
        await transaction.query(dbQuery.sample.updateSample({
          ...item,
          disable: 1,
        }));
      });
      await Promise.all(tasks);
      await transaction.commit();

      response.json({
        result: 'success',
        code: 200,
      });
    } catch (error: unknown) {
      logger.error({
        error,
        request: request.baseUrl,
      });
      response.json(error);
    }
  })();
});

// get
router.patch('/', (request, response) => {
  void (async (): Promise<void> => {
    try {
      web.checkRestKey(request);
      web.checkRestForm({
        no: { type: 'number' },
      }, request.body);
      const query = dbQuery.sample.getSampleList({
        page: 1,
        itemsPerPage: 0,
        sortBy: [],
        sortDesc: [],
        filters: [
          { condition: 'eq', column: 'no', value: request.body.no },
        ],
      });
      const item = await db.getInstance().query(query);
      response.json({
        result: 'success',
        code: 200,
        item,
      });
    } catch (error: unknown) {
      logger.error({
        error,
        request: request.baseUrl,
      });
      response.json(error);
    }
  })();
});

// get-summary
router.patch('/summary', (request, response) => {
  void (async (): Promise<void> => {
    try {
      web.checkRestKey(request);
      web.checkRestForm(summaryRulePreset, request.body);

      const query = dbQuery.sample.summarySample({
        ...request.body,
        filters: request.body.filter.length === 0
          ? [{ condition: 'eq', column: 'disable', value: 0 }]
          : [...request.body.filters, { where: 'and', condition: 'eq', column: 'disable', value: 0 }],
      });
      const data = await db.getInstance().query(query);
      response.json({
        result: 'success',
        code: 200,
        data,
      });
    } catch (error: unknown) {
      logger.error({
        error,
        request: request.baseUrl,
      });
      response.json(error);
    }
  })();
});

// get-list
router.patch('/list', (request, response) => {
  void (async (): Promise<void> => {
    try {
      web.checkRestKey(request);
      web.checkRestForm(listRulePreset, request.body);

      const query = dbQuery.sample.summarySample({
        ...request.body,
        filters: request.body.filter.length === 0
          ? [{ condition: 'eq', column: 'disable', value: 0 }]
          : [...request.body.filters, { where: 'and', condition: 'eq', column: 'disable', value: 0 }],
      });
      const items = await db.getInstance().query(query);
      response.json({
        result: 'success',
        code: 200,
        items,
      });
    } catch (error: unknown) {
      logger.error({
        error,
        request: request.baseUrl,
      });
      response.json(error);
    }
  })();
});

export default router;
