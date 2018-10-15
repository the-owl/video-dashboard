const express = require('express');
const events = require('./events');
const Camera = require('./Camera');
const Reloader = require('./Reloader');
const path = require('path');
const yaml = require('js-yaml');
const fs = require('fs-extra');


const app = express();
const config = yaml.safeLoad(fs.readFileSync(
  path.resolve(__dirname, '..', 'config.yaml')
));

const cameras = config.cameras.map(camera => new Camera(camera));

app.get('/cameras', (req, res) => {
  res.status(200).json(cameras.map(camera => ({
    error: camera.error,
    lastUpdated: camera.lastUpdated ? Math.floor(camera.lastUpdated.getTime() / 1000) : null,
    name: camera.name,
    uuid: camera.uuid
  })));
});

app.get('/events', (req, res) => {
  res.status(200).json(events.getUnread());
});

app.use('/snapshots', express.static(path.resolve('snapshots')));
app.use('/', express.static(path.resolve('dist')));

function *circularList (array) {
  let counter = 0;
  while (true) {
    yield array[counter];
    counter = (counter + 1) % array.length;
  }
}

if (!config.noReload) {
  const reloader = new Reloader(circularList(cameras));
  reloader.start();
}
app.listen(config.port, '0.0.0.0', error => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log('Listening at port ' + config.port);
});
