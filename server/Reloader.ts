import { CameraService } from './backends/CameraService';
import { Camera, CameraId } from './Camera';
import { CameraStateStorage } from './storage/CameraStateStorage';
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';

export interface BackendList {
  [name: string]: CameraService;
}

export interface ReloaderConfig {
  imagesPath: string;
  imageSize: number;
  timeout: number;
}

const OUTPUT_FILENAME = 'output.jpg';

export class Reloader {
  protected streamCache = new Map<CameraId, string>();

  constructor (
    public readonly backends: BackendList,
    public readonly cameraStateStorage: CameraStateStorage,
    public readonly config: ReloaderConfig,
  ) {}

  async reload (camera: Camera) {
    if (camera.updating) {
      return;
    }
    let date;
    try {
      camera.updating = true;
      await this.ensureDir(camera);
      await this.generateSnapshot(camera);
      date = new Date();
      const snapshots = await this.findGeneratedSnapshots(camera);
      if (!snapshots.length) {
        throw new Error('Не было сгенерировано ни одного кадра, хотя процесс VLC завершился успешно.');
      }
      await this.removeSnapshots(snapshots.slice(1));
      await this.setResultingSnapshot(camera, snapshots[0]);
      camera.lastSuccessfulUpdate = date;
    } finally {
      camera.lastUpdated = date || new Date();
      camera.updating = false;
    }
  }

  private ensureDir (camera: Camera) {
    return fs.ensureDir(this.getSnapshotDir(camera.id));
  }

  private async findGeneratedSnapshots (camera: Camera) {
    const dir = this.getSnapshotDir(camera.id);
    const files = await fs.readdir(dir);
    return files.map(file => path.join(dir, file));
  }

  private async generateSnapshot (camera: Camera) {
    const streamUrl = await this.getStreamUrl(camera);
    const output = path.join(this.getSnapshotDir(camera.id), 'output.jpg');
    return new Promise((resolve, reject) => {
      exec(
        `ffmpeg -i ${streamUrl} -y -r 1 -t 1 -vf scale=${this.config.imageSize}:-1 ${output}`,
        {
          timeout: this.config.timeout
        },
        (error, _, stderr) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  private getSnapshotDir (cameraId: CameraId) {
    return path.join(this.config.imagesPath, cameraId);
  }

  private getStreamUrl (camera: Camera) {
    const backend = this.backends[camera.backend];

    if (!backend) {
      throw new Error('No such backend: ' + camera.backend);
    }

    return backend.getStreamUrl(camera.id);
  }

  private async removeSnapshots (snapshots) {
    for (const file of snapshots) {
      await fs.unlink(file);
    }
  }

  private setResultingSnapshot (camera: Camera, file: string) {
    return fs.rename(file, path.join(this.getSnapshotDir(camera.id), OUTPUT_FILENAME));
  }
}
