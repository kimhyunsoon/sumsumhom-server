/* eslint-disable @typescript-eslint/no-explicit-any */
import { type IncomingMessage } from 'http';
import { type Request } from 'express';
import useragnt from 'useragent';
import { Error } from '../debug/error';

function getRequestInfo(request: IncomingMessage | Request): Record<string, any> {
  const ip = 'httpVersion' in request ? request.socket.remoteAddress : (request as Request).ip;
  const userAgent = 'httpVersion' in request ? request.headers['user-agent'] : (request as Request).get('User-Agent');
  if (ip === undefined || userAgent === undefined) throw Error.notFoundData('request-info');
  const agent = useragnt.parse(userAgent);
  return {
    ...((ip != null) && { ip }),
    device: {
      browser: agent.toAgent(),
      os: agent.os.toString(),
    },
  };
}

export {
  getRequestInfo,
};
