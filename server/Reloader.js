const events = require('./events');


const MAX_RETRIES_WITHOUT_DELAY = 5;
const RETRY_DELAY = 5000;

class Reloader {
  constructor (cameras) {
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
        events.pushUpdate(camera.uuid);
        retryCounter = MAX_RETRIES_WITHOUT_DELAY;
      } catch (error) {
        events.pushError(error, camera.uuid);
        if (retryCounter) {
          retryCounter--;
        } else {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }
  }
}

module.exports = Reloader;
