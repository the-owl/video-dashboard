const websocket = require('ws');


class WebsocketServer {
  constructor (httpServer, reloader) {
    this.server = new websocket.Server({
      server: httpServer
    });
    this.reloader = reloader;
    this._init();
  }

  _init () {
    this.server.on('connection', socket => {
      // Send current time to allow server to synchronize
      sendJson(socket, {
        type: 'time',
        value: Date.now()
      });
      subscribeUntilClosed(this.reloader, 'updateError', this._sendError(socket), socket);
      subscribeUntilClosed(this.reloader, 'update', this._sendUpdate(socket), socket);
      subscribeUntilClosed(this.reloader, 'updateStart', this._sendLoading(socket, true), socket);
      subscribeUntilClosed(this.reloader, 'updateEnd', this._sendLoading(socket, false), socket);
    });
  }

  _sendError (socket) {
    return function (error, camera) {
      sendJson(socket, {
        message: error.message,
        type: 'error',
        uuid: camera.uuid
      });
    };
  }

  _sendLoading (socket, loading) {
    return function (camera) {
      sendJson(socket, {
        type: 'loading',
        value: loading,
        uuid: camera.uuid
      });
    };
  }

  _sendUpdate (socket) {
    return function (camera) {
      sendJson(socket, {
        type: 'update',
        uuid: camera.uuid
      });
    };
  }
}

function sendJson (socket, data) {
  socket.send(JSON.stringify(Object.assign({
    time: Date.now()
  }, data)));
}

function subscribeUntilClosed (emitter, event, callback, socket) {
  emitter.on(event, callback);
  socket.on('close', () => {
    emitter.removeListener(event, callback);
  });
}

module.exports = WebsocketServer;
