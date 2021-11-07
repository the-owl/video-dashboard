import { readConfig } from './readConfig';
import { setupExpressApp } from './http';
import { Camera } from './Camera';
import { JsonCameraStorage } from './storage/JsonCameraStorage';
import * as http from 'http';
import express from 'express';
import { WebsocketServer } from './http/WebsocketServer';
import { ConcurrentReloadScheduler } from './schedulers/ConcurrentReloadScheduler';
import { Reloader } from './Reloader';
import { IpeyeBackend } from './backends/IpeyeBackend';
import { RtspMeBackend } from './backends/RtspMeBackend';
import { WatcherCounter } from './WatcherCounter';


async function main () {
  const config = readConfig();

  const cameraStateStorage = new JsonCameraStorage(config.cameraStateFile);
  await cameraStateStorage.init();

  const cameras = config.cameras.map((camera: any) => new Camera({
    backend: config.defaultBackend,
    ...camera,
    name: String(camera.name),
  })) as Camera[];

  const backends = {
    ipeye: new IpeyeBackend(config.backends.ipeye),
    'rtsp.me': new RtspMeBackend(),
  };

  const app = express();
  const httpServer = http.createServer(app);

  const watcherCounter = new WatcherCounter();
  const reloader = new Reloader(backends, cameraStateStorage, config.reloader);

  const scheduler = new ConcurrentReloadScheduler(reloader, cameras, {
    concurrency: config.scheduler.parallelReloads,
    delayBetweenReloads: config.scheduler.delayBetweenReloads,
    consequentRetries: config.scheduler.consequentRetries,
  });

  scheduler.on('update', (camera: Camera) => console.log('Update:', camera.name, camera.id));
  scheduler.on('updateAttemptError', (error: string, camera: Camera, attempt: number) => {
    console.error('Error: ', camera.name, camera.id, error);
    console.error('(attempt: ' + attempt + ')');
  });

  const websocketServer = new WebsocketServer(httpServer, scheduler, watcherCounter, cameras, config.auth.jwtSignKey);

  setupExpressApp(app, cameras, cameraStateStorage, watcherCounter, {
    jwtLifetime: config.auth.jwtLifetime,
    jwtSignKey: config.auth.jwtSignKey,
    passwordHash: config.auth.passwordHash,
  }, websocketServer);

  if (!config.noReload) {
    scheduler.start();
  }
  httpServer.listen(config.http.port, '::', () => {
    console.log('Listening at port ' + config.http.port);
  });
}

main();
