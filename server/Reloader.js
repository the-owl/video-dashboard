const { EventEmitter } = require('events');


const MAX_RETRIES_WITHOUT_DELAY = 5;
const RETRY_DELAY = 5000;

class Reloader extends EventEmitter {
  constructor (cameras) {
    super();
    this.cameras = cameras;
    this.running = false;
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

  async _worker () {
    let retryCounter = MAX_RETRIES_WITHOUT_DELAY;
    for (const camera of this.cameras) {
      if (!this.running) {
        return;
      }

      try {
        await camera.reload();
        camera.error = false;
        this.emit('update', camera);
        retryCounter = MAX_RETRIES_WITHOUT_DELAY;
      } catch (error) {
        camera.error = error.message;
        this.emit('updateError', error, camera);
        if (retryCounter) {
          retryCounter--;
        } else {
          await sleep(RETRY_DELAY);
        }
      }
    }
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = Reloader;
