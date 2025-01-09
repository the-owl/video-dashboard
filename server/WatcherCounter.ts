import { EventEmitter } from 'events';
import { WatcherEventType, WatcherLog } from './WatcherLog';
import { CameraService } from './backends/CameraService';
import { Camera } from './Camera';

const REFRESH_INTERVAL = 3000;

export class WatcherCounter extends EventEmitter {
  private activeCameraIds: Set<string> = new Set();
  private backends: CameraService[];

  constructor(
    public readonly watcherLog: WatcherLog,
    public readonly cameras: Camera[],
    backends: { [name: string]: CameraService },
  ) {
    super();
    this.backends = Object.keys(backends).map(k => backends[k]).filter(b => b.supportsActiveCameraIds);
  }

  async init() {
    const allEvents = await this.watcherLog.getEvents(undefined, true);
    const counts = new Map<string, number>();
    const namesToIds = new Map<string, string>(this.cameras.map(c => [c.name, c.id]));

    for (const event of allEvents) {
      const key = event.cameraName;
      if (typeof key !== 'string') continue;

      if (event.type === WatcherEventType.start) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }

      if (event.type === WatcherEventType.end) {
        counts.set(key, (counts.get(key) ?? 0) - 1);
      }
    }

    for (const [key, count] of counts.entries()) {
      if (count > 0 && namesToIds.has(key)) {
        this.activeCameraIds.add(namesToIds.get(key)!);
      }
    }

    this.loop().catch(() => {
      process.exit(1);
    });
  }

  async loop() {
    console.log('WatcherCounter: started regular checking');
    while (true) {
      try {
        const activeCameraIds = await this.getActiveCameraIds();
        const [added, deleted] = this.getDiff(activeCameraIds);

        for (const cameraId of added) {
          this.emit('startWatching', cameraId);
          this.emit('update', cameraId, 1);
        }

        for (const cameraId of deleted) {
          this.emit('endWatching', cameraId);
          this.emit('update', cameraId, 0);
        }

        this.activeCameraIds = activeCameraIds;
      } catch (error) {
        console.error('WatcherCounter: error in loop', error);
      }

      await new Promise(r => setTimeout(r, REFRESH_INTERVAL));
    }
  }

  getWatcherCount(camera: string): number {
    return this.activeCameraIds.has(camera) ? 1 : 0;
  }

  private async getActiveCameraIds(): Promise<Set<string>> {
    const lists = await Promise.all(this.backends.map(b => b.getActiveCameraIds()));
    const result = new Set<string>();
    for (const list of lists) {
      for (const id of list) {
        if (this.cameras.some(c => c.id === id)) {
          result.add(id);
        }
      }
    }
    return result;
  }

  private getDiff(activeCameraIds: Set<string>): [Set<string>, Set<string>] {
    const added = new Set<string>();
    const deleted = new Set<string>();

    for (const cameraId of activeCameraIds.values()) {
      if (!this.activeCameraIds.has(cameraId)) {
        added.add(cameraId);
      }
    }

    for (const cameraId of this.activeCameraIds.values()) {
      if (!activeCameraIds.has(cameraId)) {
        deleted.add(cameraId);
      }
    }

    return [added, deleted];
  }
}
