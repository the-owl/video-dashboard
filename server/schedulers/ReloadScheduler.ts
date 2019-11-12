import { EventEmitter } from 'events';

export enum ReloadSchedulerState {
  STATE_STOPPED,
  STATE_RUNNING,
  STATE_STOPPING
}

export interface ReloadScheduler extends EventEmitter {
  start (): void;
  state: ReloadSchedulerState;
  stop (): Promise<void>;
}
