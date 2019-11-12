import { Camera } from '../Camera';
import * as express from 'express';
import { CameraStateStorage } from '../storage/CameraStateStorage';

export function getCameraList(
  cameras: ReadonlyArray<Camera>,
  cameraStateStorage: CameraStateStorage,
) {
  return async (req: express.Request, res: express.Response) => {
    const poweredOffStatuses = await cameraStateStorage.isPoweredOff(cameras.map(c => c.id));
    res.status(200).json(cameras.map(camera => ({
      error: camera.error,
      lastUpdated: camera.lastUpdated ? camera.lastUpdated.getTime() : null,
      name: camera.name,
      id: camera.id,
      loading: camera.updating,
      failureCounter: camera.failureCounter,
      poweredOff: poweredOffStatuses[camera.id],
      backend: camera.backend,
    })));
  };
}
