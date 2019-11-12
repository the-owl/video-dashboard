import * as sockjs from 'sockjs';
import { EventEmitter } from 'events';
import { Server } from 'http';
import { ReloadScheduler } from '../schedulers/ReloadScheduler';
import { Camera } from '../Camera';

export class WebsocketServer {
  private activeSockets = new Set<sockjs.Connection>();
  private server: sockjs.Server;

  constructor (
    httpServer: Server,
    public readonly reloadScheduler: ReloadScheduler,
  ) {
    this.server = sockjs.createServer({
      log: () => {} // do not log anything
    });
    this.init();
    this.server.installHandlers(httpServer, { prefix: '/events' });
  }

  broadcastPoweredOff (cameraId: string, poweredOff: boolean) {
    for (const socket of this.activeSockets) {
      this.sendJson(socket, {
        id: cameraId,
        poweredOff,
        type: 'poweredOff',
      });
    }
  }

  init () {
    this.server.on('connection', socket => {
      this.activeSockets.add(socket);
      // Send current time to allow client to synchronize
      this.sendJson(socket, {
        type: 'time',
        value: Date.now()
      });
      this.subscribeUntilClosed(this.reloadScheduler, 'updateError', this.sendError(socket), socket);
      this.subscribeUntilClosed(this.reloadScheduler, 'update', this.sendUpdate(socket), socket);
      this.subscribeUntilClosed(this.reloadScheduler, 'updateStart', this.sendLoading(socket, true), socket);
      this.subscribeUntilClosed(this.reloadScheduler, 'updateEnd', this.sendLoading(socket, false), socket);
      socket.on('error', error => console.error('Websocket connection error: ', error));
      socket.on('close', () => this.activeSockets.delete(socket));
    });
    this.server.on('error', error => console.error('Websocket server error: ', error));
  }

  private sendError (socket: sockjs.Connection) {
    return (error: Error, camera: Camera) => {
      this.sendJson(socket, {
        failureCounter: camera.failureCounter,
        id: camera.id,
        message: error.message,
        type: 'error',
      });
    };
  }

  private sendLoading (socket: sockjs.Connection, loading: boolean) {
    return (camera: Camera) => {
      this.sendJson(socket, {
        id: camera.id,
        type: 'loading',
        value: loading,
      });
    };
  }

  private sendJson (socket: sockjs.Connection, data: any) {
    socket.write(JSON.stringify({
      time: Date.now(),
      ...data,
    }));
  }

  private sendUpdate (socket: sockjs.Connection) {
    return (camera: Camera) => {
      this.sendJson(socket, {
        failureCounter: camera.failureCounter,
        id: camera.id,
        type: 'update',
      });
    };
  }

  private subscribeUntilClosed (
    emitter: EventEmitter, event: string, callback: any, socket: sockjs.Connection
  ) {
    emitter.on(event, callback);
    socket.on('close', () => {
      emitter.removeListener(event, callback);
    });
  }
}
