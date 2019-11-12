import { CameraStateStorage } from './CameraStateStorage';
import * as fs from 'fs-extra';
import Lock from 'await-lock';
import { CameraId } from '../Camera';

interface CameraData {
  [id: string]: boolean;
}

export class JsonCameraStorage implements CameraStateStorage {
  private data: CameraData | null = null;
  private lock = new Lock();

  constructor (
    public readonly filename: string,
  ) {}

  async init () {
    return this.runWithLock(async () => {
      if (await fs.exists(this.filename)) {
        const jsonString = await fs.readFile(this.filename, 'utf8');
        this.data = JSON.parse(jsonString);
      } else {
        this.data = {};
        await this.dumpData();
      }
    });
  }

  isPoweredOff (id: CameraId) {
    return Promise.resolve(this.data[id] || false);
  }

  async setPoweredOff (id: CameraId, value: boolean) {
    if (await this.isPoweredOff(id) === value) {
      return;
    }

    if (value) {
      this.data[id] = value;
    } else {
      delete this.data[id];
    }

    await this.runWithLock(() => this.dumpData());
  }

  private dumpData () {
    return fs.writeJSON(this.filename, this.data);
  }

  private async runWithLock (fn: () => Promise<any>) {
    try {
      await this.lock.acquireAsync();
      await fn();
    } finally {
      this.lock.release();
    }
  }
}
