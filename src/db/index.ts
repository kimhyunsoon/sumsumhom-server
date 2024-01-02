/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mariadb from 'mariadb';
import { type DBArgs } from './typedef';
import { Error } from '../debug/error';
import { Transaction } from './transaction';

export interface DBConfig extends mariadb.PoolConfig {
}

export class Database {
  static instance: Database | undefined;

  static async initialize(config: DBConfig): Promise<void> {
    Database.instance = new Database({
      ...config,
      insertIdAsNumber: true,
      bigIntAsNumber: true,
    });
    await Database.instance.checkConnection();
  }

  private readonly pool: mariadb.Pool;

  constructor(config: DBConfig) {
    this.pool = mariadb.createPool(config);
  }

  public async checkConnection(): Promise<void> {
    let conn: mariadb.PoolConnection | undefined;

    try {
      conn = await this.pool?.getConnection();
    } catch (error) {
      Error.makeThrow(error);
    } finally {
      await conn?.release();
    }
  }

  public async query(
    form: {
      sql: string
      batch?: boolean
      args: DBArgs | DBArgs[] | Array<string | number>
      done?: (result: any[]) => any
    },
  ): Promise<string | undefined> {
    let conn;
    try {
      conn = await this.pool?.getConnection();

      let namedPlaceholders;

      if ((form.batch ?? false) && form.args instanceof Array) {
        namedPlaceholders = !(form.args[0] instanceof Array);
      } else {
        namedPlaceholders = !(form.args instanceof Array);
      }

      let result;

      if (form.batch != null && form.batch) {
        result = await conn?.batch({ sql: form.sql, namedPlaceholders }, form.args);
      } else {
        result = await conn?.query({ sql: form.sql, namedPlaceholders }, form.args);
      }

      return (form.done != null) ? form.done(result) : result;
    } catch (error) {
      Error.makeThrow(error);
    } finally {
      await conn?.release();
    }
  }

  public async beginTransaction(): Promise<Transaction> {
    let transaction = null;

    if (this.pool != null) {
      transaction = new Transaction(this.pool);
      await transaction.begin();
    }

    return transaction as Transaction;
  }
}

export default {
  initialize: Database.initialize,
  getInstance: () => (Database.instance!),
};
