const { EventEmitter } = require('events');


const CONSEQUENT_RETRIES = 3;
const MAX_RETRIES_WITHOUT_DELAY = 6;
const RETRY_DELAY = 1000;

const STATE_STOPPED = 0;
const STATE_RUNNING = 1;
const STATE_STOPPING = 2;

class Reloader extends EventEmitter {
  constructor (cameras) {
    super();
    this.cameras = cameras;
    this.state = STATE_STOPPED;
    this.retryCounter = MAX_RETRIES_WITHOUT_DELAY;
  }

  start () {
    if (this.state === STATE_STOPPED) {
      this._worker();
      this.state = STATE_RUNNING;
    } else {
      throw new Error('Cannot start a Reloader that is already running');
    }
  }

  stop () {
    this.state = STATE_STOPPING;
    return new Promise(resolve => this.once('stop', resolve));
  }

  async *_cameraQueue () {
    while (true) {
      for await (const camera of this.cameras) {
        yield camera;
      }
    }
  }

  async _reloadCamera (camera) {
    let error = null;
    for (let i = 0; i < CONSEQUENT_RETRIES; i++) {
      try {
        await camera.reload();
        camera.error = false;
        this.emit('update', camera);
        this.retryCounter = MAX_RETRIES_WITHOUT_DELAY;
        return;
      } catch (err) {
        error = err;
        this.emit('updateAttemptError', error, camera, i + 1);
        if (this.retryCounter) {
          this.retryCounter--;
        } else {
          await sleep(RETRY_DELAY);
        }
      }
    }

    // If we reached this point - it means <CONSEQUENT_RETRIES> errors
    camera.error = error.message;
    this.emit('updateError', error, camera);
  }

  async _worker () {
    for await (const camera of this._cameraQueue()) {
      if (camera.updating) {
        throw new Error('Camera already reloading');
      }

      if (this.state === STATE_STOPPING) {
        break;
      }

      this.emit('updateStart', camera);
      await this._reloadCamera(camera);
      this.emit('updateEnd', camera);
    }
    this.state = STATE_STOPPED;
    this.emit('stop');
  }
}

Object.assign(Reloader, {
  STATE_STOPPED, STATE_RUNNING, STATE_STOPPING
});

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = Reloader;
