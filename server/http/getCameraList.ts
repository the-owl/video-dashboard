import { Camera } from '../Camera';
import * as express from 'express';
import { CameraStateStorage } from '../storage/CameraStateStorage';
import { WatcherCounter } from '../WatcherCounter';
import { CameraService } from '../backends/CameraService';

export function getCameraList(
  cameras: ReadonlyArray<Camera>,
  cameraStateStorage: CameraStateStorage,
  watcherCounter: WatcherCounter,
  backends: { [name: string]: CameraService },
) {
  return async (req: express.Request, res: express.Response) => {
    const poweredOff = {} as any;
    await Promise.all(cameras.map(async camera => {
      poweredOff[camera.id] = await cameraStateStorage.isPoweredOff(camera.id);
    }));

    res.status(200).json(cameras.map(camera => ({
      error: camera.error,
      lastUpdated: camera.lastUpdated ? camera.lastUpdated.getTime() : null,
      name: camera.name,
      id: camera.id,
      loading: camera.updating,
      failureCounter: camera.failureCounter,
      // TODO: equal names
      isPoweredOff: Boolean(poweredOff[camera.id]),
      watching: watcherCounter.getWatcherCount(camera.id),
      iframeUrl: backends[camera.backend]?.getIframeUrl(camera.id),
    })));
  };
}
