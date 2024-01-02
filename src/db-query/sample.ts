/* eslint-disable @typescript-eslint/no-explicit-any */
import { type DBArgs } from '../db/typedef';
import dbHelper from './helper';

const sampleFields = {
  no: 'sample.`no`',
  field1: 'sample.field1',
  field2: 'sample.field2',
  disable: 'sample.disable',
  created: 'sample.created',
  updated: 'sample.updated',
};

export default {
  addSample: (args: DBArgs) => ({
    sql:
      'INSERT INTO sample(field1, field2)\n' +
      'VALUES (:field1, :field2)\n',
    args,
  }),
  updateSample: (args: DBArgs) => ({
    sql: (() => {
      const update =
        'UPDATE sample\n' +
        'SET\n';

      const set = dbHelper.transUpdateToSql(
        args,
        [
          'field1',
          'field2',
          'disable',
        ],
        sampleFields,
      );

      const where = '\nWHERE no=:no';

      return (set !== '') ? `${update}${set}${where}` : '';
    })(),
    args,
  }),
  summarySample: (args: DBArgs) => ({
    sql: (() => {
      const where = dbHelper.transFiltersToSql(args.filters, sampleFields);
      const { no } = args;
      const sel =
        'SELECT COUNT(*) AS `count`\n' +
        'FROM sample\n' +
        'LEFT JOIN sample ON sample.`no` =' + String(no) + '\n';
      return `${sel}${((where === '') ? '' : `WHERE\n${where}\n`)}`;
    })(),
    args: [
      ...dbHelper.transFiltersToArgs(args.filters),
    ],
    done: (result: any[]) => ((result.length > 0) ? result[0] : null),
  }),
  getSampleList: (args: DBArgs) => ({
    sql: (() => {
      const where = dbHelper.transFiltersToSql(args.filters, sampleFields);
      const order = dbHelper.transSortToSql(args, sampleFields);
      const sel =
        'SELECT\n' +
        '  sample.`no`, sample.field1, sample.field2,\n' +
        '  sample.disable, sample.created, sample.updated\n' +
        'FROM sample\n';
      const lookup =
        'JOIN\n' +
        '  (SELECT sample.`no` FROM sample\n' +
        ((where === '') ? '' : `WHERE\n${where}\n`) +
        order +
        dbHelper.transOffsetToSql(args) +
        '  ) AS lookup\n' +
        'ON sample.`no`=lookup.`no`\n';
      return `${sel}${lookup}${order}`;
    })(),
    args: [
      ...dbHelper.transFiltersToArgs(args.filters),
      ...dbHelper.transOffsetToArgs(args),
    ],
    done: (result: any[]) => (result.map((item) => ({
      ...item,
    }))),
  }),
};
