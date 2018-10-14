let counter = 1;

const LIMIT = 100;

module.exports = {
  _queue: [],
  getUnread () {
    const result = this._queue;
    this._queue = [];
    return result;
  },
  pushError (message, uuid) {
    this._push({
      message: String(message),
      type: 'error',
      uuid
    });
  },
  pushWarning (message, uuid) {
    this._push({
      message: String(message),
      type: 'warning',
      uuid
    });
  },
  pushUpdate (uuid) {
    this._push({
      type: 'update',
      uuid
    });
  },
  _push (msg) {
    this._queue.push(Object.assign({
      id: counter++,
      time: Date.now()
    }, msg));
    const message = msg.message ? ': ' + msg.message : '';
    const uuid = msg.uuid ? ` (${msg.uuid})` : '';
    console.log(`${new Date()} ${msg.type}${uuid}${message}`);
    if (this._queue.length > LIMIT) {
      this._queue = this._queue.slice(-LIMIT);
    }
  }
};
