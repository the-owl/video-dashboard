const { EventEmitter } = require('events');


const CONSEQUENT_RETRIES = 3;
const MAX_RETRIES_WITHOUT_DELAY = 6;
const RETRY_DELAY = 5000;

class Reloader extends EventEmitter {
  constructor (cameras) {
    super();
    this.cameras = cameras;
    this.running = false;
    this.retryCounter = MAX_RETRIES_WITHOUT_DELAY;
  }

  start () {
    if (!this.running) {
      this.running = true;
      this._worker();
    }
  }

  stop () {
    this.running = false;
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
    for (const camera of this.cameras) {
      if (!this.running) {
        return;
      }

      await this._reloadCamera(camera);
    }
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = Reloader;
