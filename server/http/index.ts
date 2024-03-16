import * as express from 'express';
import cookieParser from 'cookie-parser';
import { getCameraList } from './getCameraList';
import { Camera } from '../Camera';
import { CameraStateStorage } from '../storage/CameraStateStorage';
import { updateCamera } from './updateCamera';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import { WebsocketServer } from './WebsocketServer';
import { login } from './login';
import { authorizationHeaderTokenExtractor, cookieTokenExtractor, jwtAuthMiddleware } from './jwtAuthMiddleware';
import { WatcherCounter } from '../WatcherCounter';
import { WatcherLog } from '../WatcherLog';
import { watchersLogView } from './watchersLogView';

export interface AuthSettings {
  jwtLifetime: string;
  jwtSignKey: string;
  passwordHash: string;
}

export function setupExpressApp(
  app: express.Application,
  cameras: ReadonlyArray<Camera>,
  cameraStateStorage: CameraStateStorage,
  watcherCounter: WatcherCounter,
  watcherLog: WatcherLog,
  authSettings: AuthSettings,
  websocketServer: WebsocketServer,
  watchersLogShowDays: number,
) {
  const jwtAuth = jwtAuthMiddleware(authSettings.jwtSignKey, authorizationHeaderTokenExtractor);
  const cookieAuth = jwtAuthMiddleware(authSettings.jwtSignKey, cookieTokenExtractor, '/');

  app.post(
    '/login',
    bodyParser.json(),
    login(authSettings.passwordHash, authSettings.jwtSignKey, authSettings.jwtLifetime),
  );
  app.get('/cameras', jwtAuth, getCameraList(cameras, cameraStateStorage, watcherCounter));
  app.get('/watchers-log', cookieParser(), cookieAuth, watchersLogView(watcherLog, watchersLogShowDays));
  app.patch('/cameras/:id', jwtAuth, bodyParser.json(), updateCamera(
    cameras, cameraStateStorage, websocketServer
  ));
  app.use('/snapshots', express.static(path.resolve('snapshots')));
  app.use('/', express.static(path.resolve('dist')));
  app.use(function(err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
    console.error(err);
    res.sendStatus(500);
  });
}
