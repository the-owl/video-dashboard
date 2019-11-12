import { Camera } from '../Camera';
import { CameraStateStorage } from '../storage/CameraStateStorage';
import { WebsocketServer } from './WebsocketServer';

export function updateCamera(
  cameras: ReadonlyArray<Camera>,
  cameraStateStorage: CameraStateStorage,
  websocketServer: WebsocketServer,
) {
  return async (req, res) => {
    if ('poweredOff' in req.body) {
      const value = Boolean(req.body.poweredOff);
      for (const camera of cameras) {
        if (camera.id === req.params.id) {
          console.log('Set powered off: ' + camera.name + ' = ' + value);
          await cameraStateStorage.setPoweredOff(camera.id, value);
          websocketServer.broadcastPoweredOff(camera.id, value);
          break;
        }
      }
    }
    res.status(200).json({ success: true });
  };
}
