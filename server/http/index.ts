import * as express from 'express';
import { getCameraList } from './getCameraList';
import { Camera } from '../Camera';
import { CameraStateStorage } from '../storage/CameraStateStorage';
import { updateCamera } from './updateCamera';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import { WebsocketServer } from './WebsocketServer';
import { login } from './login';
import { authMiddleware } from './authMiddleware';

export interface AuthSettings {
  jwtLifetime: string;
  jwtSignKey: string;
  passwordHash: string;
}

export function setupExpressApp(
  app: express.Application,
  cameras: ReadonlyArray<Camera>,
  cameraStateStorage: CameraStateStorage,
  authSettings: AuthSettings,
  websocketServer: WebsocketServer,
) {
  const auth = authMiddleware(authSettings.jwtSignKey);

  app.post(
    '/login',
    bodyParser.json(),
    login(authSettings.passwordHash, authSettings.jwtSignKey, authSettings.jwtLifetime),
  );
  app.get('/cameras', auth, getCameraList(cameras, cameraStateStorage));
  app.patch('/cameras/:id', auth, bodyParser.json(), updateCamera(
    cameras, cameraStateStorage, websocketServer
  ));
  app.use('/snapshots', express.static(path.resolve('snapshots')));
  app.use('/', express.static(path.resolve('dist')));
  app.use(function(err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    console.error(err);
    res.sendStatus(500);
  });
}
