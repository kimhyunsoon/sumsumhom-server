/* eslint-disable @typescript-eslint/no-explicit-any */
import { type DBArgs } from '../db/typedef';
import dbHelper from './helper';

const settingsFields = {
  no: 'settings.`no`',
  lightStatus: 'settings.lightStatus',
  lightStatusTimes: 'settings.lightStatusTimes',
  lightOnMaxDuration: 'settings.lightOnMaxDuration',
  lightStatusRecentDate: 'settings.lightStatusRecentDate',
};

export default {
  getLight: (args: DBArgs) => ({
    sql:
      'SELECT\n' +
      '  lightStatus, lightStatusTimes, lightOnMaxDuration, lightStatusRecentDate\n' +
      'FROM settings\n' +
      'WHERE no=0',
    args,
    done: (result: any[]) => ((result.length > 0) ? result[0] : null),
  }),
  updateSettings: (args: DBArgs) => ({
    sql: (() => {
      const update =
        'UPDATE settings\n' +
        'SET\n';

      const set = dbHelper.transUpdateToSql(
        args,
        [
          'lightStatus',
          'lightStatusTimes',
          'lightOnMaxDuration',
          'lightStatusRecentDate',
        ],
        settingsFields,
      );

      const where = '\nWHERE no=0';

      return (set !== '') ? `${update}${set}${where}` : '';
    })(),
    args,
  }),
  summarySample: (args: DBArgs) => ({
    sql: (() => {
      const where = dbHelper.transFiltersToSql(args.filters, settingsFields);
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
      const where = dbHelper.transFiltersToSql(args.filters, settingsFields);
      const order = dbHelper.transSortToSql(args, settingsFields);
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
