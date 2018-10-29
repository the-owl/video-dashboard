const { EventEmitter } = require('events');
const Reloader = require('./Reloader');
const AsyncTaskQueue = require('./AsyncTaskQueue');


const DEFAULT_PRIORITY = 0;

class ConcurrentReloader extends EventEmitter {
  constructor (cameras, params, concurrency) {
    super();
    this.reloaders = [];
    this._taskQueue = new AsyncTaskQueue();

    for (const camera of cameras) {
      this._taskQueue.pushTask(camera, DEFAULT_PRIORITY);
    }

    for (let i = 0; i < concurrency; i++) {
      const reloader = new Reloader(this._getQueueIterator(), params);
      this._forwardEvent(reloader, 'update');
      this._forwardEvent(reloader, 'updateError');
      this._forwardEvent(reloader, 'updateAttemptError');
      this._forwardEvent(reloader, 'updateStart');
      this._forwardEvent(reloader, 'updateEnd');
      this.reloaders.push(reloader);
    }
  }

  start () {
    if (this._stateIs(Reloader.STATE_STOPPED)) {
      this._each(reloader => reloader.start());
    } else {
      throw new Error('At least one child reloader is not stopped');
    }
  }

  stop () {
    return Promise.all(this._each(reloader => reloader.stop()));
  }

  _each (fn) {
    return this.reloaders.map(fn);
  }

  _forwardEvent (source, event) {
    source.on(event, (...args) => this.emit(event, ...args));
  }

  async *_getQueueIterator () {
    while (true) {
      const camera = await this._taskQueue.getTask();
      yield camera;
      this._taskQueue.pushTask(camera, DEFAULT_PRIORITY);
    }
  }

  _stateIs (state) {
    return this.reloaders.every(reloader => reloader.state === state);
  }
}

module.exports = ConcurrentReloader;
