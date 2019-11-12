import { Reloader } from '../Reloader';
import { EventEmitter } from 'events';
import { SerialReloadSchedulerConfig, SerialReloadScheduler } from './SerialReloadScheduler';
import { ReloadSchedulerState, ReloadScheduler } from './ReloadScheduler';
import { Camera } from '../Camera';
import { AsyncTaskQueue } from '../AsyncTaskQueue';


export interface ConcurrentReloadSchedulerConfig extends SerialReloadSchedulerConfig {
  concurrency: number;
}

export class ConcurrentReloadScheduler extends EventEmitter implements ReloadScheduler {
  private schedulers: SerialReloadScheduler[] = [];
  private taskQueue = new AsyncTaskQueue<Camera>();

  constructor (
    public readonly reloader: Reloader,
    public readonly cameras: Camera[],
    public readonly config: ConcurrentReloadSchedulerConfig
  ) {
    super();

    for (const camera of cameras) {
      this.taskQueue.pushTask(camera);
    }

    for (let i = 0; i < config.concurrency; i++) {
      const scheduler = new SerialReloadScheduler(reloader, this.getQueueIterator(), config);
      this.forwardEvent(scheduler, 'update');
      this.forwardEvent(scheduler, 'updateError');
      this.forwardEvent(scheduler, 'updateAttemptError');
      this.forwardEvent(scheduler, 'updateStart');
      this.forwardEvent(scheduler, 'updateEnd');
      this.schedulers.push(scheduler);
    }
  }

  start () {
    if (this.stateIs(ReloadSchedulerState.STATE_STOPPED)) {
      this.schedulers.forEach(scheduler => scheduler.start());
    } else {
      throw new Error('At least one child reloader is not stopped');
    }
  }

  get state () {
    if (this.stateIs(ReloadSchedulerState.STATE_RUNNING)) {
      return ReloadSchedulerState.STATE_RUNNING;
    }

    if (this.stateIs(ReloadSchedulerState.STATE_STOPPED)) {
      return ReloadSchedulerState.STATE_STOPPED;
    }

    return ReloadSchedulerState.STATE_STOPPING;
  }

  async stop () {
    await Promise.all(this.schedulers.map(scheduler => scheduler.stop()));
  }

  private forwardEvent (source: EventEmitter, event: string) {
    source.on(event, (...args) => this.emit(event, ...args));
  }

  private async *getQueueIterator () {
    while (true) {
      const camera = await this.taskQueue.getTask();
      yield camera;
      this.taskQueue.pushTask(camera);
    }
  }

  private stateIs (state) {
    return this.schedulers.every(scheduler => scheduler.state === state);
  }
}
