/* eslint-disable @typescript-eslint/no-explicit-any */
import { sha3_512 } from 'js-sha3';
import * as jwt from 'jsonwebtoken';
import config from '../config/config.json';
import { type JwtPayload } from 'jsonwebtoken';
import * as randomstring from 'randomstring';
import { Error } from '../debug/error';

const opts: Record<string, object> = {
  access: {
    ...config.jwt.options.access,
    mutatePayload: true,
  },
  file: {
    ...config.jwt.options.file,
    mutatePayload: true,
  },
};

export default {
  makeRandomString(options?: randomstring.GenerateOptions | number) {
    return randomstring.generate(options);
  },
  toHash(password: string) {
    return sha3_512(password);
  },
  makeToken(payload: Record<string, unknown>, secret?: string) {
    return jwt.sign(
      payload,
      (secret != null) ? secret : config.jwt.secret,
      opts.access,
    );
  },
  verifyToken(token: string, secret?: string): JwtPayload {
    return jwt.verify(
      token,
      (secret != null) ? secret : config.jwt.secret,
      opts.access,
    ) as JwtPayload;
  },
  makeFileToken(payload: Record<string, string | number | boolean>) {
    return jwt.sign(payload, config.jwt.secret, opts.file);
  },
  verifyFileToken(token: string) {
    return jwt.verify(token, config.jwt.secret, opts.file) as JwtPayload;
  },
  checkUser(userInfo: Record<string, any> | undefined) {
    if (userInfo == null) throw Error.unauthorized('missing-user');
  },
};
