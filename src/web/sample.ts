import { Router } from 'express';
import { Sample } from '../db/sample';
import web from '.';
import logger from '../debug/logger';
import { getRulePreset, listRulePreset, summaryRulePreset, updateRulePreset } from '../comm/form-checker';

const router = Router();

// insert
router.post('/', (request, response) => {
  void (async (): Promise<void> => {
    try {
      web.checkRestKey(request);
      web.checkRestForm({
        items: {
          type: 'array',
          children: {
            name: { type: 'string', minLen: 1, maxLen: 128 },
            phone: { type: 'string' },
          },
        },
      }, request.body);

      const items = await Sample.add(request.body.items);
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

// update
router.put('/', (request, response) => {
  void (async (): Promise<void> => {
    try {
      web.checkRestKey(request);
      web.checkRestForm({
        ...updateRulePreset,
        name: { type: 'string', minLen: 1, maxLen: 128, required: false },
        phone: { type: 'string', required: false },
      }, request.body);

      const data = await Sample.update(request.body);
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

// delete
router.put('/delete', (request, response) => {
  void (async (): Promise<void> => {
    try {
      web.checkRestKey(request);
      web.checkRestForm(updateRulePreset, request.body);

      const data = await Sample.delete(request.body._ids);
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

// get
router.patch('/', (request, response) => {
  void (async (): Promise<void> => {
    try {
      web.checkRestKey(request);
      web.checkRestForm(getRulePreset, request.body);
      const item = await Sample.get(request.body);
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

      const data = await Sample.getSummary(request.body);
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

      const items = await Sample.getList(request.body);
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
