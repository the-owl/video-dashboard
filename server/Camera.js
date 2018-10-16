const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const fetch = require('node-fetch');


const OUTPUT_FILENAME = 'output.jpg';
const TIMEOUT = 30000; // 30 seconds

class Camera {
  constructor ({ name, uuid }) {
    this.name = name;
    this.uuid = uuid;
    this.lastUpdated = null;
    this.updating = false;
  }

  async getStreamUrl () {
    const response = await fetch('http://api.ipeye.ru/device/url/rtsp/' + this.uuid);
    const { message, status } = await response.json();
    if (!status) {
      throw new Error('Ошибка API IPEYE: ' + message);
    }
    return message;
  }

  async reload () {
    if (this.updating) {
      return;
    }
    try {
      this.updating = true;
      await this._ensureDir();
      await this._generateSnapshot();
      this.lastUpdated = new Date();
      const snapshots = await this._findGeneratedSnapshots();
      if (!snapshots.length) {
        throw new Error('Не было сгенерировано ни одного кадра, хотя процесс VLC завершился успешно.');
      }
      await this._removeSnapshots(snapshots.slice(1));
      await this._setResultingSnapshot(snapshots[0]);
    } finally {
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
        `ffmpeg -i ${streamUrl} -y -r 1 -t 1 ${output}`,
        {
          timeout: TIMEOUT
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
    return path.resolve('snapshots', this.uuid);
  }
}

module.exports = Camera;
