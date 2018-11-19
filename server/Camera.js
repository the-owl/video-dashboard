const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const fetch = require('node-fetch');


const OUTPUT_FILENAME = 'output.jpg';

class Camera {
  constructor ({ imageSize, imagesPath, name, streamType, timeout, uuid }) {
    this.name = name;
    this.error = null;
    this.uuid = uuid;
    this.imageSize = imageSize;
    this.imagesPath = imagesPath;
    this.lastUpdated = null;
    this.lastSuccessfulUpdate = null;
    this.streamType = streamType;
    this.timeout = timeout;
    this.updating = false;
    // сколько раз подряд провалилось обновление камеры
    this.failureCounter = 0;
    this._streamUrl = null;
  }

  async getStreamUrl () {
    if (this._streamUrl) {
      return this._streamUrl;
    }
    const response = await fetch('http://api.ipeye.ru/device/url/' + this.streamType + '/' + this.uuid);
    const { message, status } = await response.json();
    if (!status) {
      throw new Error('Ошибка API IPEYE: ' + message);
    }
    this._streamUrl = message;
    return message;
  }

  async reload () {
    if (this.updating) {
      return;
    }
    let date;
    try {
      this.updating = true;
      await this._ensureDir();
      await this._generateSnapshot();
      date = new Date();
      const snapshots = await this._findGeneratedSnapshots();
      if (!snapshots.length) {
        throw new Error('Не было сгенерировано ни одного кадра, хотя процесс VLC завершился успешно.');
      }
      await this._removeSnapshots(snapshots.slice(1));
      await this._setResultingSnapshot(snapshots[0]);
      this.lastSuccessfulUpdate = date;
    } finally {
      this.lastUpdated = date || new Date();
      this.updating = false;
    }
  }

  _ensureDir () {
    return fs.ensureDir(this._snapshotDir);
  }

  async _generateSnapshot () {
    const streamUrl = await this.getStreamUrl();
    const output = path.join(this._snapshotDir, 'output.jpg');
    return new Promise((resolve, reject) => {
      exec(
        `ffmpeg -i ${streamUrl} -y -r 1 -t 1 -vf scale=${this.imageSize}:-1 ${output}`,
        {
          timeout: this.timeout
        },
        (error, _, stderr) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async _findGeneratedSnapshots () {
    const files = await fs.readdir(this._snapshotDir);
    return files.map(file => path.join(this._snapshotDir, file));
  }

  async _removeSnapshots (snapshots) {
    for (const file of snapshots) {
      await fs.unlink(file);
    }
  }

  _setResultingSnapshot (file) {
    return fs.rename(file, path.join(this._snapshotDir, OUTPUT_FILENAME));
  }

  get _snapshotDir () {
    return path.join(this.imagesPath, this.uuid);
  }
}

module.exports = Camera;
