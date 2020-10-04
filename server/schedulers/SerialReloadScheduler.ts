import { EventEmitter } from 'events';
import { Camera } from '../Camera';
import { Reloader } from '../Reloader';
import { ReloadSchedulerState, ReloadScheduler } from './ReloadScheduler';

const MAX_RETRIES_WITHOUT_DELAY = 6;
const RETRY_DELAY = 1000;

export interface SerialReloadSchedulerConfig {
  consequentRetries: number;
  delayBetweenReloads: number;
}

function sleep(ms: number) {
  return ms > 0 ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve();
}

export class SerialReloadScheduler extends EventEmitter implements ReloadScheduler {
  private _retryCounter: number = MAX_RETRIES_WITHOUT_DELAY;
  private _state = ReloadSchedulerState.STATE_STOPPED;

  constructor (
    public readonly reloader: Reloader,
    public readonly cameras: AsyncIterable<Camera>,
    public readonly config: SerialReloadSchedulerConfig,
  ) {
    super();
  }

  start () {
    if (this._state === ReloadSchedulerState.STATE_STOPPED) {
      this.worker().catch(error => {
        this._state = ReloadSchedulerState.STATE_STOPPED;
        this.emit('stop');
        this.emit('error', error);
      });
      this._state = ReloadSchedulerState.STATE_RUNNING;
    } else {
      throw new Error('Cannot start a Reloader that is already running');
    }
  }

  get state() {
    return this._state;
  }

  stop () {
    if (this._state === ReloadSchedulerState.STATE_STOPPED) {
      return Promise.resolve();
    }
    this._state = ReloadSchedulerState.STATE_STOPPING;
    return new Promise<void>(resolve => this.once('stop', () => resolve()));
  }

  private async *cameraQueue () {
    while (true) {
      for await (const camera of this.cameras) {
        yield camera;
        await sleep(this.config.delayBetweenReloads * 1000);
      }
    }
  }

  private async reloadCamera (camera) {
    let error = null;
    for (let i = 0; i < this.config.consequentRetries; i++) {
      try {
        await this.reloader.reload(camera);
        camera.error = false;
        camera.failureCounter = 0;
        this.emit('update', camera);
        this._retryCounter = MAX_RETRIES_WITHOUT_DELAY;
        if (camera.poweredOff) {
          // if camera was successfully updated - it is not powered off, actually
          await camera.setPoweredOff(false);
        }
        return;
      } catch (err) {
        error = err;
        this.emit('updateAttemptError', error, camera, i + 1);
        if (this._retryCounter) {
          this._retryCounter--;
        } else {
          await sleep(RETRY_DELAY);
        }
      }
    }

    // If we reached this point - it means <consequentRetries> errors
    camera.error = error.message;
    camera.failureCounter++;
    this.emit('updateError', error, camera);
  }

  private async worker () {
    for await (const camera of this.cameraQueue()) {
      if (camera.updating) {
        throw new Error('Camera already reloading');
      }

      if (this._state === ReloadSchedulerState.STATE_STOPPING) {
        break;
      }

      this.emit('updateStart', camera);
      await this.reloadCamera(camera);
      this.emit('updateEnd', camera);
    }
    this._state = ReloadSchedulerState.STATE_STOPPED;
    this.emit('stop');
  }
}
