import { scheduleJob } from 'node-schedule';
import logger from '../debug/logger';

function sampleScheduler(): void {
  scheduleJob('0 */10 * * * *', (): void => {
    try {
      logger.info('Do schedule sample');
    } catch (error) {
      logger.error(error);
    }
  });
}

export default sampleScheduler;
