/* eslint-disable @typescript-eslint/no-explicit-any */
import type mariadb from 'mariadb';
import { type DBArgs } from './typedef';
import { Error } from '../debug/error';

export class Transaction {
  private readonly pool: mariadb.Pool;

  private conn: mariadb.PoolConnection | undefined;

  constructor(pool: mariadb.Pool) {
    this.pool = pool;
  }

  public async begin(): Promise<void> {
    this.conn = await this.pool.getConnection();
    await this.conn.beginTransaction();
  }

  public async commit(): Promise<void> {
    await this.conn?.commit();
    await this.conn?.release();
  }

  public async rollback(): Promise<void> {
    await this.conn?.rollback();
    await this.conn?.release();
  }

  public async query(
    form: {
      sql: string
      batch?: boolean
      args: DBArgs | DBArgs[] | Array<string | number>
      done?: (result: any[]) => any
    },
  ): Promise<void> {
    try {
      let namedPlaceholders;

      if ((form.batch ?? false) && form.args instanceof Array) {
        namedPlaceholders = !(form.args[0] instanceof Array);
      } else {
        namedPlaceholders = !(form.args instanceof Array);
      }

      let result;

      if (form.batch != null && form.batch) {
        result = await this.conn?.batch({ sql: form.sql, namedPlaceholders }, form.args);
      } else {
        result = await this.conn?.query({ sql: form.sql, namedPlaceholders }, form.args);
      }

      return (form.done != null) ? form.done(result) : result;
    } catch (error) {
      Error.makeThrow(error);
    }
  }
}
