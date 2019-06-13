const fs = require('fs-extra');


class JsonCameraStorage {
  constructor (filename) {
    this.filename = filename;
    this._data = null;
    this._lock = new Lock();
  }

  init () {
    return this._lock.runWithLock(async () => {
      if (await fs.exists(this.filename)) {
        const jsonString = await fs.readFile(this.filename, 'utf8');
        this._data = JSON.parse(jsonString);
      } else {
        this._data = {};
        await this._dumpData();
      }
    });
  }

  isPoweredOff (uuid) {
    return this._data[uuid] || false;
  }

  async setPoweredOff (uuid, value) {
    if (this.isPoweredOff(uuid) === value) {
      return;
    }

    if (value) {
      this._data[uuid] = value;
    } else {
      delete this._data[uuid];
    }

    await this._lock.runWithLock(() => this._dumpData());
  }

  _dumpData () {
    return fs.writeJSON(this.filename, this._data);
  }
}

class Lock {
  constructor () {
    this._awaiters = [];
    this._locked = false;
  }

  lock () {
    return new Promise(resolve => {
      if (this._locked) {
        this._awaiters.push(resolve);
      } else {
        this._locked = true;
        resolve();
      }
    });
  }

  async runWithLock (fn) {
    await this.lock();
    try {
      return await fn();
    } finally {
      this.unlock();
    }
  }

  unlock () {
    if (this._locked) {
      const awaiter = this._awaiters.pop();
      if (awaiter) {
        awaiter();
      } else {
        this._locked = false;
      }
    }
  }
}

module.exports = JsonCameraStorage;
