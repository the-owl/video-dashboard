import * as express from 'express';
import { getCameraList } from './getCameraList';
import { Camera } from '../Camera';
import { CameraStateStorage } from '../storage/CameraStateStorage';
import { updateCamera } from './updateCamera';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import { WebsocketServer } from './WebsocketServer';

export function setupExpressApp(
  app: express.Application,
  cameras: ReadonlyArray<Camera>,
  cameraStateStorage: CameraStateStorage,
  websocketServer: WebsocketServer,
) {
  app.get('/cameras', getCameraList(cameras, cameraStateStorage));
  app.patch('/cameras/:id', bodyParser.json(), updateCamera(
    cameras, cameraStateStorage, websocketServer
  ));
  app.use('/snapshots', express.static(path.resolve('snapshots')));
  app.use('/', express.static(path.resolve('dist')));
}
