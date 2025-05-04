import { WatcherEvent, WatcherEventType, WatcherLog } from "./WatcherLog";

export async function rotateWatchersLog(
  watchersLog: WatcherLog,
  archiveWatchersLog: WatcherLog,
  maxEventAge: number
) {
  await watchersLog.atomic(async () => {
    const allEvents = await watchersLog.getEvents();
    const [toArchive, toRetain] = filterEventsForRotation(
      allEvents,
      maxEventAge
    );

    if (!toArchive.length) {
      console.log("rotateWatchersLog: nothing to archive");
      return;
    }

    await archiveWatchersLog.addEvents(toArchive);
    await watchersLog.rewrite(toRetain);
    console.log(`rotateWatchersLog: Archived ${toArchive.length} events`);
  });
}

async function rotateFailsafe(
  watchersLog: WatcherLog,
  archiveWatchersLog: WatcherLog,
  maxEventAge: number
) {
  try {
    await rotateWatchersLog(watchersLog, archiveWatchersLog, maxEventAge);
  } catch (error) {
    console.error("rotateWatchersLog failed:", error);
  }
}

export function setupWatcherLogRotation(
  watchersLog: WatcherLog,
  archiveWatchersLog: WatcherLog,
  maxEventAge: number
) {
  setInterval(
    () => rotateFailsafe(watchersLog, archiveWatchersLog, maxEventAge),
    60 * 60 * 1000
  );
  rotateFailsafe(watchersLog, archiveWatchersLog, maxEventAge);
}

function filterEventsForRotation(
  events: ReadonlyArray<WatcherEvent>,
  maxEventAge: number
): [WatcherEvent[], WatcherEvent[]] {
  const sortedEvents = [...events].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  const watchedCams = new Set<string>();
  let latestSafeCutPoint: number = 0; // latest point in time when there are no watchers
  const thresholdDate = new Date(Date.now() - maxEventAge * 3600 * 24 * 1000);

  for (const [index, event] of sortedEvents.entries()) {
    if (event.type === WatcherEventType.start) {
      watchedCams.add(event.cameraName);
    } else if (event.type === WatcherEventType.end) {
      watchedCams.delete(event.cameraName);
    }

    if (watchedCams.size === 0 && event.date <= thresholdDate) {
      latestSafeCutPoint = index + 1;
    }
  }

  const toArchive = sortedEvents.slice(0, latestSafeCutPoint);
  const toRetain = sortedEvents.slice(latestSafeCutPoint);

  return [toArchive, toRetain];
}
