import { EventEmitter } from 'events';

export class WatcherCounter extends EventEmitter {
  private cameraWatchers = new Map<string, Set<string>>();

  addWatcher(camera: string, watcher: string) {
    if (!this.cameraWatchers.has(camera)) {
      this.cameraWatchers.set(camera, new Set());
    }

    this.cameraWatchers.get(camera)!.add(watcher);
    this.broadcastUpdate(camera);
  }

  getWatcherCount(camera: string) {
    return this.cameraWatchers.get(camera)?.size || 0;
  }

  removeWatcher(camera: string, watcher: string) {
    this.cameraWatchers.get(camera)?.delete(watcher);
    this.broadcastUpdate(camera);
  }

  protected broadcastUpdate(camera: string) {
    this.emit('update', camera, this.getWatcherCount(camera));
  }
}
