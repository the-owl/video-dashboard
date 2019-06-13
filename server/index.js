const express = require('express');
const Camera = require('./Camera');
const ConcurrentReloader = require('./ConcurrentReloader');
const JsonCameraStorage = require('./JsonCameraStorage');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const http = require('http');
const WebsocketServer = require('./WebsocketServer');
const bodyParser = require('body-parser');


async function main () {
  const app = express();
  const httpServer = http.createServer(app);
  const defaults = yaml.safeLoad(fs.readFileSync(
    path.resolve(__dirname, '..', 'config.defaults.yaml')
  ));
  const userConfig = yaml.safeLoad(fs.readFileSync(
    path.resolve(__dirname, '..', 'config.yaml')
  ));
  const config = Object.assign(defaults, userConfig);
  const storage = new JsonCameraStorage(config.cameraStateFile);
  await storage.init();

  const cameras = config.cameras.map(camera =>
    new Camera(Object.assign({
      imageSize: config.imageSize,
      streamType: config.streamType,
      timeout: config.timeout
    }, camera, {
      imagesPath: config.imagesPath
    }), storage)
  );

  app.get('/cameras', (req, res) => {
    res.status(200).json(cameras.map(camera => ({
      error: camera.error,
      lastUpdated: camera.lastUpdated ? camera.lastUpdated.getTime() : null,
      name: camera.name,
      uuid: camera.uuid,
      loading: camera.updating,
      failureCounter: camera.failureCounter,
      // TODO: equal names
      isPoweredOff: camera.poweredOff
    })));
  });

  app.put('/cameras/:id/poweredOff', bodyParser.json(), async (req, res) => {
    for (const camera of cameras) {
      if (camera.uuid === req.params.id) {
        console.log('Set powered off: ' + camera.uuid + ' = ' + req.body.value);
        await camera.setPoweredOff(req.body.value);
        break;
      }
    }
    res.status(200).json({ success: true });
  });

  app.use('/snapshots', express.static(path.resolve('snapshots')));
  app.use('/', express.static(path.resolve('dist')));

  if (!config.noReload) {
    const reloader = new ConcurrentReloader(cameras, {
      consequentRetries: config.consequentRetries
    }, config.parallelReloads);
    reloader.start();
    reloader.on('update', camera => console.log('Update:', camera.name, camera.uuid));
    reloader.on('updateAttemptError', (error, camera, attempt) => {
      console.error('Error: ', camera.name, camera.uuid, error);
      console.error('(attempt: ' + attempt + ')');
    });
    const websocketServer = new WebsocketServer(httpServer, reloader);
    for (const camera of cameras) {
      camera.on('setPoweredOff', poweredOff => {
        websocketServer.broadcastPoweredOff(camera, poweredOff);
      });
    }
  }
  httpServer.listen(config.port, '0.0.0.0', error => {
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log('Listening at port ' + config.port);
  });
}

main();
