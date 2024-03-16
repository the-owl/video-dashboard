import { WatcherEventType, WatcherLog } from './WatcherLog';
import { WatcherCounter } from './WatcherCounter';
import { Camera } from './Camera';

export function syncWatcherLogToCounter (
  cameras: ReadonlyArray<Camera>, log: WatcherLog, counter: WatcherCounter
): void {
  const cameraIdsToNames: { [id: string]: string } = {};
  for (const cam of cameras) {
    cameraIdsToNames[cam.id] = cam.name;
  }

  counter.on('startWatching', async (cameraId: string) => {
    const cameraName = cameraIdsToNames[cameraId];

    if (typeof cameraName !== 'string') return;

    await log.addEvent({
      cameraName,
      date: new Date(),
      type: WatcherEventType.start,
    });
  });

  counter.on('endWatching', async (cameraId: string) => {
    const cameraName = cameraIdsToNames[cameraId];

    if (typeof cameraName !== 'string') return;

    await log.addEvent({
      cameraName,
      date: new Date(),
      type: WatcherEventType.end,
    });
  });
}
