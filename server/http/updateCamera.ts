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
      for (const camera of cameras) {
        if (camera.id === req.params.id) {
          console.log('Set powered off: ' + camera.id + ' = ' + req.body.poweredOff);
          await cameraStateStorage.setPoweredOff(camera.id, req.body.poweredOff);
          websocketServer.broadcastPoweredOff(camera.id, req.body.poweredOff);
          break;
        }
      }
    }
    res.status(200).json({ success: true });
  };
}
