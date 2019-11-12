import { Camera } from '../Camera';
import * as express from 'express';
import { CameraStateStorage } from '../storage/CameraStateStorage';

export function getCameraList(
  cameras: ReadonlyArray<Camera>,
  cameraStateStorage: CameraStateStorage,
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
    })));
  };
}
