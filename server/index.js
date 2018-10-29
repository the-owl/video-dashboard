const express = require('express');
const Camera = require('./Camera');
const ConcurrentReloader = require('./ConcurrentReloader');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs-extra');
const http = require('http');
const WebsocketServer = require('./WebsocketServer');


const app = express();
const httpServer = http.createServer(app);
const defaults = yaml.safeLoad(fs.readFileSync(
  path.resolve(__dirname, '..', 'config.defaults.yaml')
));
const userConfig = yaml.safeLoad(fs.readFileSync(
  path.resolve(__dirname, '..', 'config.yaml')
));
const config = Object.assign(defaults, userConfig);

const cameras = config.cameras.map(camera => new Camera(Object.assign({
  imageSize: config.imageSize,
  streamType: config.streamType,
  timeout: config.timeout
}, camera, {
  imagesPath: config.imagesPath
})));

app.get('/cameras', (req, res) => {
  res.status(200).json(cameras.map(camera => ({
    error: camera.error,
    lastUpdated: camera.lastUpdated ? camera.lastUpdated.getTime() : null,
    name: camera.name,
    uuid: camera.uuid,
    loading: camera.updating
  })));
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
}
httpServer.listen(config.port, '0.0.0.0', error => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log('Listening at port ' + config.port);
});
