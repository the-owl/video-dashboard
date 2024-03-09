import { WatcherEventType, WatcherLog } from './WatcherLog';
import { WatcherCounter } from './WatcherCounter';
import { Camera } from './Camera';

export function syncWatcherLogToCounter (
  cameras: ReadonlyArray<Camera>, log: WatcherLog, counter: WatcherCounter
): void {
  const cameraIdsToNames = Object.fromEntries(cameras.map(c => [c.id, c.name]));

  counter.on('startWatching', async (cameraId: string) => {
    await log.addEvent({
      cameraName: cameraIdsToNames[cameraId],
      date: new Date(),
      type: WatcherEventType.start,
    });
  });

  counter.on('endWatching', async (cameraId: string) => {
    await log.addEvent({
      cameraName: cameraIdsToNames[cameraId],
      date: new Date(),
      type: WatcherEventType.end,
    });
  });
}
