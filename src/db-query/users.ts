/* eslint-disable @typescript-eslint/no-explicit-any */
import { type DBArgs } from '../db/typedef';
import cert from '../util/cert';

export default {
  checkUser: (args: DBArgs) => ({
    sql:
      'SELECT\n' +
      '  COUNT(*) AS exist,\n' +
      '  SUM(`password`=:password) AS valid,\n' +
      '  SUM(`disable`) AS disable\n' +
      'FROM users\n' +
      'WHERE id=:id',
    args: {
      id: args.id,
      password: cert.toHash(args.password),
    },
    done: (result: any[]) => (result.length > 0
      ? {
        exist: (result[0].exist > 0),
        valid: (result[0].valid > 0),
        disable: (result[0].disable > 0),
      }
      : null
    ),
  }),
  getUser: (args: DBArgs) => ({
    sql:
      'SELECT\n' +
      '  `id`, name, created, updated\n' +
      'FROM users\n' +
      'WHERE users.id=:id AND users.disable=0',
    args,
    done: (result: any[]) => (result.length > 0 ? result[0] : null),
  }),
};
