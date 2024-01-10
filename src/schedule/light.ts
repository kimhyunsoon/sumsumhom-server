import { type Job, scheduleJob, type JobCallback } from 'node-schedule';
import logger from '../debug/logger';
import dbQuery from '../db-query';
import db from '../db';
import { dayjs } from '../util/time';

// 현재 시간이 사용자가 정의한 스케쥴시간에 해당하는지 확인하는 함수
function lightStatusTimesChecker(now: dayjs.Dayjs, lightStatusTimes: Array<Record<string, number>>): number {
  if (now.format('m') !== '0') return 2;
  return lightStatusTimes[Number(now.format('H'))].value;
}

function lightStatusScheduler(): Job {
  const job: Job = scheduleJob({
    rule: '0 * * * * *', // 10분마다 실행
  }, (async (): Promise<void> => {
    const now = dayjs().utc();
    try {
      // 현재 식물등 상태 확인
      const {
        lightOnMaxDuration,
        lightStatus,
        lightStatusRecentDate,
        lightStatusTimes,
      } = await db.getInstance().query(dbQuery.settings.getLight({}));
      const lightStatusTimesArray = JSON.parse(lightStatusTimes);
      // 켜져 있을 경우
      if (lightStatus === 1) {
        const durationMin = now.diff(dayjs(lightStatusRecentDate), 'minute'); // 현재 켜져있는 분 수
        // 자동꺼짐 시간이 되었거나 사용자가 설정한 꺼짐 시각일 경우
        if (lightOnMaxDuration <= durationMin || lightStatusTimesChecker(now, lightStatusTimesArray) === 0) {
          // TODO: 아두이노 통신
          // DB 업데이트
          await db.getInstance().query(dbQuery.settings.updateSettings({
            lightStatus: 0,
            lightStatusRecentDate: new Date(),
          }));
        }
      // 꺼져 있고 사용자가 설정한 켜짐 시각일 경우
      } else if (lightStatusTimesChecker(now, lightStatusTimesArray) === 1) {
        // TODO: 아두이노 통신
        // DB 업데이트
        await db.getInstance().query(dbQuery.settings.updateSettings({
          lightStatus: 1,
          lightStatusRecentDate: new Date(),
        }));
      }
    } catch (error: unknown) {
      logger.error(error);
    }
  }) as JobCallback);
  return job;
}

export default lightStatusScheduler;
